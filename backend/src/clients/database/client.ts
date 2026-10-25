/**
 * clients/database/client.ts — Typed wrapper around HRMS's mysql2 pool.
 *
 * Backend Structure's database client pattern applied to HRMS's raw-SQL setup.
 * Re-exports the query helpers from config/database.ts under the Client pattern.
 *
 * Usage:
 *   import { db } from '@clients/database/client.js';
 *   const rows = await db.query<Employee>('SELECT * FROM employees WHERE tenant_id = ?', [tenantId]);
 */
import {
  query,
  queryOne,
  insert,
  execute,
  transaction,
} from '../../config/database.js';
import { loggingHandler } from '../../common/utils/LoggingHandler.js';

const MODULE = 'database.client';

class DatabaseClient {
  private readonly logging = loggingHandler;

  /**
   * Execute a SELECT that returns multiple rows.
   * Column names are automatically camelCased by the pool config.
   */
  async query<T>(sql: string, params?: unknown[]): Promise<T[]> {
    this.logging.debug(MODULE, 'query', { sql: sql.slice(0, 120) });
    return query<T>(sql, params);
  }

  /**
   * Execute a SELECT that returns a single row or null.
   */
  async queryOne<T>(sql: string, params?: unknown[]): Promise<T | null> {
    this.logging.debug(MODULE, 'queryOne', { sql: sql.slice(0, 120) });
    return queryOne<T>(sql, params);
  }

  /**
   * Execute an INSERT and return the generated id string.
   * Intercepts UUID() calls to pre-generate and return the id.
   */
  async insert(sql: string, params?: unknown[]): Promise<string> {
    this.logging.debug(MODULE, 'insert', { sql: sql.slice(0, 120) });
    return insert(sql, params);
  }

  /**
   * Execute an UPDATE or DELETE and return the number of affected rows.
   */
  async execute(sql: string, params?: unknown[]): Promise<number> {
    this.logging.debug(MODULE, 'execute', { sql: sql.slice(0, 120) });
    return execute(sql, params);
  }

  /**
   * Wrap a sequence of operations in a BEGIN / COMMIT / ROLLBACK transaction.
   */
  async transaction<T>(fn: Parameters<typeof transaction<T>>[0]): Promise<T> {
    return transaction<T>(fn);
  }
}

export const db = new DatabaseClient();
export default db;
