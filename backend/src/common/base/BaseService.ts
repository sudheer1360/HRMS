/**
 * BaseService — Abstract base for all HRMS service / manager classes.
 *
 * Extended with the Backend Structure's AbstractManager pattern:
 *
 *   this.logging   → LoggingHandler   (structured pino logging)
 *   this.cache     → CacheManager    (Redis get/set/invalidate)
 *   this.common    → CommonHandler    (validators, maskers, utilities)
 *
 * Core helpers retained (unchanged):
 *   buildPagination()     → normalised page/limit/offset
 *   buildPaginatedMeta()  → standard meta block
 *   buildUpdateFields()   → dynamic UPDATE clause fragments
 *   sanitiseSortColumn()  → whitelist ORDER BY column
 *   sanitiseSortOrder()   → 'ASC' | 'DESC'
 *
 * New manager helpers added:
 *   withCache()           → get-or-set shorthand with key builder
 *   invalidateTenantCache() → flush all keys for a tenant module
 *   logAction()           → structured audit-style log
 */
import { LoggingHandler } from '../utils/LoggingHandler.js';
import { CacheManager } from '../utils/CacheManager.js';
import { CommonHandler } from '../utils/CommonHandler.js';

export abstract class BaseService {
  // ── Handler utilities (Backend Structure AbstractManager pattern) ──────────

  protected readonly logging: LoggingHandler;
  protected readonly cache: CacheManager;
  protected readonly common: CommonHandler;

  constructor() {
    this.logging = new LoggingHandler();
    this.cache = new CacheManager();
    this.common = new CommonHandler();
  }

  // ── Pagination ────────────────────────────────────────────────────────────

  protected buildPagination(params: Record<string, any>): {
    page: number;
    limit: number;
    offset: number;
  } {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 20));
    return { page, limit, offset: (page - 1) * limit };
  }

  protected buildPaginatedMeta(total: number, page: number, limit: number) {
    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    };
  }

  // ── Dynamic UPDATE queries ────────────────────────────────────────────────

  /**
   * Converts a camelCase input object into SQL SET clause fragments.
   *
   * @param input    – partial request body (camelCase keys)
   * @param fieldMap – mapping { camelCaseKey: 'db_column_name' }
   * @returns { fields: ['col = ?', ...], vals: [value, ...] }
   *
   * @example
   * const { fields, vals } = this.buildUpdateFields(input, {
   *   companyName: 'company_name',
   *   email: 'email',
   * });
   * if (!fields.length) throw new ValidationError('Nothing to update');
   * await execute(`UPDATE companies SET ${fields.join(', ')} WHERE id = ?`, [...vals, id]);
   */
  protected buildUpdateFields(
    input: Record<string, any>,
    fieldMap: Record<string, string>
  ): { fields: string[]; vals: any[] } {
    const fields: string[] = [];
    const vals: any[] = [];
    for (const [jsKey, dbCol] of Object.entries(fieldMap)) {
      if (input[jsKey] !== undefined) {
        fields.push(`${dbCol} = ?`);
        vals.push(input[jsKey]);
      }
    }
    return { fields, vals };
  }

  // ── Sort safety ───────────────────────────────────────────────────────────

  /**
   * Whitelist-validates a sort column so user input cannot inject SQL.
   * Falls back to `defaultCol` if the supplied value isn't in the allowlist.
   */
  protected sanitiseSortColumn(
    col: string | undefined,
    allowed: string[],
    defaultCol = 'created_at'
  ): string {
    return col && allowed.includes(col) ? col : defaultCol;
  }

  /**
   * Validates ORDER direction; only 'asc' or 'desc' are accepted.
   */
  protected sanitiseSortOrder(order: string | undefined): 'ASC' | 'DESC' {
    return order?.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
  }

  // ── Cache helpers (AbstractManager pattern) ───────────────────────────────

  /**
   * Standard cache key builder for tenant-scoped data.
   * Format: `{module}:{tenantId}:{resource}:{...rest}`
   *
   * @example
   *   const key = this.cacheKey('employees', tenantId, 'list', page, limit);
   *   // → "employees:tenant123:list:1:20"
   */
  protected cacheKey(
    module: string,
    tenantId: string,
    ...rest: (string | number)[]
  ): string {
    return [module, tenantId, ...rest].join(':');
  }

  /**
   * Invalidate all cached data for a module in a given tenant.
   * Call after any write operation (create/update/delete).
   *
   * @example
   *   await this.invalidateTenantCache('employees', tenantId);
   *   // Deletes all keys matching "employees:{tenantId}:*"
   */
  protected async invalidateTenantCache(
    module: string,
    tenantId: string
  ): Promise<void> {
    const count = await this.cache.invalidatePattern(`${module}:${tenantId}:*`);
    this.logging.debug(
      `${module}.service`,
      `Invalidated ${count} cache keys for tenant ${tenantId}`
    );
  }

  /**
   * Get-or-set cache helper.  Runs `fn` only on a cache miss.
   *
   * @example
   *   const list = await this.withCache(
   *     this.cacheKey('employees', tenantId, 'list', page),
   *     300,
   *     () => this.fetchFromDb(tenantId, page)
   *   );
   */
  protected withCache<T>(
    key: string,
    ttlSeconds: number,
    fn: () => Promise<T>
  ): Promise<T> {
    return this.cache.remember(key, ttlSeconds, fn);
  }

  // ── Audit / logging helpers ───────────────────────────────────────────────

  /**
   * Log a business action in a structured, audit-friendly format.
   *
   * @example
   *   this.logAction('employee.service', 'CREATE_EMPLOYEE', tenantId, userId, { employeeId: id });
   */
  protected logAction(
    module: string,
    action: string,
    tenantId: string,
    performedBy: string,
    context?: Record<string, unknown>
  ): void {
    this.logging.info(module, `ACTION: ${action}`, {
      action,
      tenantId,
      performedBy,
      ...context,
    });
  }
}
