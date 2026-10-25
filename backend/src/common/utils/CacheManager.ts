/**
 * CacheManager — Redis-based caching abstraction for services and controllers.
 *
 * Wraps HRMS's existing ioredis client with a clean, typed interface:
 *   cache.get<T>(key)               → T | null
 *   cache.set(key, value, ttl?)     → void
 *   cache.del(key | key[])          → void
 *   cache.invalidatePattern(prefix) → number of deleted keys
 *   cache.remember<T>(key, ttl, fn) → T (get-or-set pattern)
 *   cache.getOrSet<T>(key, ttl, fn) → T (alias for remember)
 *
 * Usage in a service that extends BaseService:
 *   const cached = await this.cache.get<Employee[]>(`employees:${tenantId}`);
 *   if (!cached) {
 *     const data = await query(...);
 *     await this.cache.set(`employees:${tenantId}`, data, 300);
 *     return data;
 *   }
 *   return cached;
 *
 * Or using the remember shorthand:
 *   return this.cache.remember(`employees:${tenantId}`, 300, () => query(...));
 */
import { redis } from '../../config/redis.js';
import { loggingHandler } from './LoggingHandler.js';

export class CacheManager {
  private readonly client = redis;
  private readonly logging = loggingHandler;
  private readonly MODULE = 'CacheManager';

  // ── Read ─────────────────────────────────────────────────────────────────

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      if (value === null) return null;
      return JSON.parse(value) as T;
    } catch (err) {
      this.logging.error(this.MODULE, `Cache GET failed for key: ${key}`, err);
      return null;
    }
  }

  // ── Write ─────────────────────────────────────────────────────────────────

  async set(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
    try {
      await this.client.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (err) {
      this.logging.error(this.MODULE, `Cache SET failed for key: ${key}`, err);
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  async del(keys: string | string[]): Promise<void> {
    try {
      const targets = Array.isArray(keys) ? keys : [keys];
      if (targets.length === 0) return;
      await this.client.del(...targets);
    } catch (err) {
      this.logging.error(this.MODULE, `Cache DEL failed`, err);
    }
  }

  /**
   * Delete all keys matching a glob pattern.
   * Uses SCAN under the hood to avoid blocking the Redis server.
   *
   * @example
   *   await this.cache.invalidatePattern(`rbac:${tenantId}:*`);
   *   await this.cache.invalidatePattern(`employees:${tenantId}:*`);
   */
  async invalidatePattern(pattern: string): Promise<number> {
    try {
      let cursor = '0';
      const keysToDelete: string[] = [];

      do {
        const [nextCursor, keys] = await this.client.scan(
          cursor,
          'MATCH',
          pattern,
          'COUNT',
          100
        );
        cursor = nextCursor;
        keysToDelete.push(...keys);
      } while (cursor !== '0');

      if (keysToDelete.length > 0) {
        await this.client.del(...keysToDelete);
      }

      return keysToDelete.length;
    } catch (err) {
      this.logging.error(
        this.MODULE,
        `Cache invalidatePattern failed for pattern: ${pattern}`,
        err
      );
      return 0;
    }
  }

  // ── Existence ──────────────────────────────────────────────────────────────

  async exists(key: string): Promise<boolean> {
    try {
      const count = await this.client.exists(key);
      return count > 0;
    } catch (err) {
      this.logging.error(this.MODULE, `Cache EXISTS failed for key: ${key}`, err);
      return false;
    }
  }

  // ── TTL helpers ───────────────────────────────────────────────────────────

  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch {
      return -1;
    }
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    try {
      await this.client.expire(key, ttlSeconds);
    } catch (err) {
      this.logging.error(this.MODULE, `Cache EXPIRE failed for key: ${key}`, err);
    }
  }

  // ── Get-or-set pattern ────────────────────────────────────────────────────

  /**
   * Returns cached value if present, otherwise runs `fn`, caches its result,
   * and returns it.  Silently falls through to `fn` on cache errors.
   *
   * @example
   *   const employees = await this.cache.remember(
   *     `employees:${tenantId}`,
   *     300,
   *     () => this.fetchEmployeesFromDb(tenantId)
   *   );
   */
  async remember<T>(
    key: string,
    ttlSeconds: number,
    fn: () => Promise<T>
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const fresh = await fn();
    await this.set(key, fresh, ttlSeconds);
    return fresh;
  }

  /** Alias for remember — matches the Backend Structure naming convention */
  getOrSet = this.remember.bind(this);

  // ── Increment / counters ──────────────────────────────────────────────────

  async increment(key: string, by = 1): Promise<number> {
    try {
      return await this.client.incrby(key, by);
    } catch (err) {
      this.logging.error(this.MODULE, `Cache INCRBY failed for key: ${key}`, err);
      return 0;
    }
  }

  async decrement(key: string, by = 1): Promise<number> {
    try {
      return await this.client.decrby(key, by);
    } catch (err) {
      this.logging.error(this.MODULE, `Cache DECRBY failed for key: ${key}`, err);
      return 0;
    }
  }
}

// Singleton — share one instance across the application
export const cacheManager = new CacheManager();
