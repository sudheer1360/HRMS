import mysql from 'mysql2/promise';
import { randomUUID } from 'crypto';
import { config } from '../config/index.js';
import logger from '../config/logger.js';

const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: config.db.poolSize,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  dateStrings: true,   // Return DATE/DATETIME as strings, not JS Date objects (avoids TZ shift)
});

// Test connection
pool.getConnection()
  .then((conn) => {
    logger.info('MySQL connected successfully');
    conn.release();
  })
  .catch((err) => {
    logger.error({ err: err.message }, 'MySQL connection failed');
  });

// ── snake_case → camelCase transformer ────────────────────────────────────────
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z0-9])/g, (_, ch) => ch.toUpperCase());
}

function transformRow(row: any): any {
  if (row === null || row === undefined || typeof row !== 'object') return row;
  if (Array.isArray(row)) return row.map(transformRow);
  return Object.fromEntries(
    Object.entries(row).map(([k, v]) => [snakeToCamel(k), v])
  );
}

export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  const [rows] = await pool.query(sql, params);
  // Non-SELECT statements (UPDATE/INSERT/DELETE) return a ResultSetHeader, not an array
  if (!Array.isArray(rows)) return rows as any;
  return (rows as any[]).map(transformRow) as T[];
}

export async function queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] || null;
}

export async function insert(sql: string, params?: any[]): Promise<string> {
  // Services use the pattern: INSERT INTO t (id, ...) VALUES (UUID(), ?, ...)
  // MySQL's UUID() generates a string PK so insertId is always 0.
  // Replace UUID() with a pre-generated uuid so we can return the real id.
  // Use pool.query() (not pool.execute()) — execute() has known issues with
  // named placeholders and certain MySQL 8 configurations.
  if (/VALUES\s*\(UUID\(\)/i.test(sql)) {
    const id = randomUUID();
    const modifiedSql = sql.replace(/UUID\(\)/i, '?');
    await pool.query(modifiedSql, [id, ...(params || [])]);
    return id;
  }
  const [result] = await pool.query(sql, params) as any;
  return result.insertId?.toString() || '';
}

export async function execute(sql: string, params?: any[]): Promise<number> {
  // pool.query() instead of pool.execute() for consistent behaviour with
  // placeholders across all MySQL 8 driver versions.
  const [result] = await pool.query(sql, params) as any;
  return result.affectedRows || 0;
}

export async function transaction<T>(fn: (connection: mysql.PoolConnection) => Promise<T>): Promise<T> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export function getConnection(): Promise<mysql.PoolConnection> {
  return pool.getConnection();
}

export default { query, queryOne, insert, execute, transaction, getConnection, pool };
