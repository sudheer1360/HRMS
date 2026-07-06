"use strict";
/**
 * Clean UUID Seed Runner
 * Runs 15-clean-uuid-seed.sql — a fresh seed with proper UUID primary keys.
 * Truncates all data first, then re-inserts clean seed data.
 *
 * Usage:  npm run db:seed-clean
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = require("url");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const database_js_1 = require("../../config/database.js");
const __filename = (0, url_1.fileURLToPath)(import.meta.url);
const __dirname = path_1.default.dirname(__filename);
const SEEDS_DIR = path_1.default.join(__dirname, 'seeds');
function splitStatements(sql) {
    // Remove single-line comments
    const noComments = sql.replace(/--[^\n]*/g, '');
    return noComments
        .split(';')
        .map(s => s.trim())
        .filter(s => s && !/^SOURCE\s/i.test(s) && !/^\s*$/.test(s));
}
async function seedClean() {
    console.log('\n' + '═'.repeat(62));
    console.log('  HRMS  —  Clean UUID Seed Runner');
    console.log('═'.repeat(62));
    const filePath = path_1.default.join(SEEDS_DIR, '15-clean-uuid-seed.sql');
    if (!fs_1.default.existsSync(filePath)) {
        console.error('❌  Seed file not found:', filePath);
        process.exit(1);
    }
    const sql = fs_1.default.readFileSync(filePath, 'utf-8');
    const statements = splitStatements(sql);
    console.log(`\nExecuting ${statements.length} statements from 15-clean-uuid-seed.sql …\n`);
    let ok = 0, skipped = 0, failed = 0;
    for (const stmt of statements) {
        try {
            await (0, database_js_1.query)(stmt);
            ok++;
        }
        catch (err) {
            if (err.code === 'ER_DUP_ENTRY' || err.code === 'ER_DUP_KEY') {
                skipped++;
                continue;
            }
            console.warn(`  ⚠  ${err.code ?? err.message}`);
            console.warn(`     ${stmt.slice(0, 120)}`);
            failed++;
        }
    }
    console.log(`\n  Results: ${ok} ok, ${skipped} skipped, ${failed} failed`);
    console.log('\n' + '═'.repeat(62));
    console.log('  ✅  Clean seed complete');
    console.log('═'.repeat(62));
    console.log('\n  Default credentials (password: Admin@1234)\n');
    console.log('  superadmin@fyndyne.com  → Super Admin');
    console.log('  hr@fyndyne.com          → HR Admin');
    console.log('  manager@fyndyne.com     → Manager');
    console.log('═'.repeat(62) + '\n');
}
seedClean().catch(err => {
    console.error('\n❌  Seed failed:', err.message ?? err);
    process.exit(1);
});
//# sourceMappingURL=seed-clean.js.map