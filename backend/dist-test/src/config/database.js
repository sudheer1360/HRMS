"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = query;
exports.queryOne = queryOne;
exports.insert = insert;
exports.execute = execute;
exports.transaction = transaction;
exports.getConnection = getConnection;
const promise_1 = __importDefault(require("mysql2/promise"));
const crypto_1 = require("crypto");
const index_js_1 = require("../config/index.js");
const logger_js_1 = __importDefault(require("../config/logger.js"));
const pool = promise_1.default.createPool({
    host: index_js_1.config.db.host,
    port: index_js_1.config.db.port,
    user: index_js_1.config.db.user,
    password: index_js_1.config.db.password,
    database: index_js_1.config.db.database,
    waitForConnections: true,
    connectionLimit: index_js_1.config.db.poolSize,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    dateStrings: true, // Return DATE/DATETIME as strings, not JS Date objects (avoids TZ shift)
});
// Test connection
pool.getConnection()
    .then((conn) => {
    logger_js_1.default.info('MySQL connected successfully');
    conn.release();
})
    .catch((err) => {
    logger_js_1.default.error({ err: err.message }, 'MySQL connection failed');
});
// ── snake_case → camelCase transformer ────────────────────────────────────────
function snakeToCamel(str) {
    return str.replace(/_([a-z0-9])/g, (_, ch) => ch.toUpperCase());
}
function transformRow(row) {
    if (row === null || row === undefined || typeof row !== 'object')
        return row;
    if (Array.isArray(row))
        return row.map(transformRow);
    return Object.fromEntries(Object.entries(row).map(([k, v]) => [snakeToCamel(k), v]));
}
async function query(sql, params) {
    const [rows] = await pool.query(sql, params);
    // Non-SELECT statements (UPDATE/INSERT/DELETE) return a ResultSetHeader, not an array
    if (!Array.isArray(rows))
        return rows;
    return rows.map(transformRow);
}
async function queryOne(sql, params) {
    const rows = await query(sql, params);
    return rows[0] || null;
}
async function insert(sql, params) {
    // Services use the pattern: INSERT INTO t (id, ...) VALUES (UUID(), ?, ...)
    // MySQL's UUID() generates a string PK so insertId is always 0.
    // Replace UUID() with a pre-generated uuid so we can return the real id.
    // Use pool.query() (not pool.execute()) — execute() has known issues with
    // named placeholders and certain MySQL 8 configurations.
    if (/VALUES\s*\(UUID\(\)/i.test(sql)) {
        const id = (0, crypto_1.randomUUID)();
        const modifiedSql = sql.replace(/UUID\(\)/i, '?');
        await pool.query(modifiedSql, [id, ...(params || [])]);
        return id;
    }
    const [result] = await pool.query(sql, params);
    return result.insertId?.toString() || '';
}
async function execute(sql, params) {
    // pool.query() instead of pool.execute() for consistent behaviour with
    // placeholders across all MySQL 8 driver versions.
    const [result] = await pool.query(sql, params);
    return result.affectedRows || 0;
}
async function transaction(fn) {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const result = await fn(conn);
        await conn.commit();
        return result;
    }
    catch (err) {
        await conn.rollback();
        throw err;
    }
    finally {
        conn.release();
    }
}
function getConnection() {
    return pool.getConnection();
}
exports.default = { query, queryOne, insert, execute, transaction, getConnection, pool };
