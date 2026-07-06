"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const url_1 = require("url");
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const __dirname = path_1.default.dirname((0, url_1.fileURLToPath)(import.meta.url));
async function runMigration() {
    const conn = await promise_1.default.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'hrms_password',
        database: process.env.DB_NAME || 'hrms',
        multipleStatements: true,
    });
    try {
        const sql = fs_1.default.readFileSync(path_1.default.join(__dirname, 'migrate-missing-modules.sql'), 'utf8');
        console.log('Running migration: migrate-missing-modules.sql ...');
        const [result] = await conn.query(sql);
        console.log('✓ Migration complete. All missing module tables created.');
    }
    catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
    finally {
        await conn.end();
    }
}
runMigration();
//# sourceMappingURL=migrate.js.map