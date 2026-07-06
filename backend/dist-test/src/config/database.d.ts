import mysql from 'mysql2/promise';
export declare function query<T = any>(sql: string, params?: any[]): Promise<T[]>;
export declare function queryOne<T = any>(sql: string, params?: any[]): Promise<T | null>;
export declare function insert(sql: string, params?: any[]): Promise<string>;
export declare function execute(sql: string, params?: any[]): Promise<number>;
export declare function transaction<T>(fn: (connection: mysql.PoolConnection) => Promise<T>): Promise<T>;
export declare function getConnection(): Promise<mysql.PoolConnection>;
declare const _default: {
    query: typeof query;
    queryOne: typeof queryOne;
    insert: typeof insert;
    execute: typeof execute;
    transaction: typeof transaction;
    getConnection: typeof getConnection;
    pool: mysql.Pool;
};
export default _default;
//# sourceMappingURL=database.d.ts.map