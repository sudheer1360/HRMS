"use strict";
/**
 * SQL Seed Runner
 * Executes the SQL files in the seeds/ directory in order.
 * Replaces placeholder password hashes with a real bcrypt hash for Admin@123.
 *
 * Usage:  npm run db:seed-sql
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = require("url");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const database_js_1 = require("../../config/database.js");
const __filename = (0, url_1.fileURLToPath)(import.meta.url);
const __dirname = path_1.default.dirname(__filename);
const SEEDS_DIR = path_1.default.join(__dirname, 'seeds');
// SQL files to run in dependency order
const SQL_FILES = [
    '01-master-data.sql',
    '02-departments-designations-grades.sql',
    '03-users-roles-permissions.sql',
    '04-employees.sql',
    '05-attendance.sql',
    '06-leave-management.sql',
    '07-payroll.sql',
    '08-recruitment.sql',
    '09-performance-management.sql',
    '10-assets-management.sql',
    '11-grievance-disciplinary-exit.sql',
    '12-platform-core.sql',
    '13-ai-automation-integrations.sql',
    '14-form-builder-holidays-training.sql',
];
// Tables in reverse-dependency order (children before parents)
const TABLES_TO_CLEAR = [
    'form_submissions', 'form_templates',
    'ai_conversations', 'automation_workflows', 'webhook_configs', 'api_keys', 'report_definitions',
    'helpdesk_tickets', 'ticket_comments',
    'policy_acknowledgements', 'policies',
    'exit_cases', 'disciplinary_cases', 'grievances',
    'asset_allocations', 'assets',
    'performance_reviews', 'performance_cycles',
    'job_offers', 'interview_schedules', 'candidates', 'job_postings', 'requisitions',
    'training_enrollments', 'training_programs',
    'expense_claims', 'payroll_payslips', 'payroll_runs', 'salary_structures', 'salary_components',
    'overtime_requests', 'rosters', 'shifts',
    'leave_applications', 'leave_balances', 'leave_policies', 'leave_types', 'holidays',
    'attendance_locks', 'attendance_correction_requests', 'attendance_logs',
    'notifications', 'login_logs', 'audit_logs', 'refresh_tokens',
    'user_roles', 'role_permissions', 'permissions', 'roles', 'users',
    'employee_status_logs', 'employment_history', 'employee_documents',
    'employee_family', 'employee_banks', 'employee_statutory', 'employees',
    'cost_centers', 'grades', 'designations', 'departments', 'branches', 'companies', 'tenants',
];
/**
 * Split raw SQL text into individual executable statements.
 * Handles -- comments and strips SOURCE directives.
 */
function splitStatements(sql) {
    // Remove single-line comments
    const noComments = sql.replace(/--[^\n]*/g, '');
    return noComments
        .split(';')
        .map(s => s.trim())
        .filter(s => {
        if (!s)
            return false;
        // Skip MySQL CLI-only directives
        if (/^SOURCE\s/i.test(s))
            return false;
        // Skip pure whitespace / empty statements
        if (/^\s*$/.test(s))
            return false;
        return true;
    });
}
/**
 * Execute one SQL file, replacing placeholder password hashes with a real one.
 */
async function runFile(filePath, passwordHash) {
    const filename = path_1.default.basename(filePath);
    process.stdout.write(`  ➜  ${filename} … `);
    let sql = fs_1.default.readFileSync(filePath, 'utf-8');
    // Replace ALL placeholder hashes (pattern: '$2b$10$<WordCharsOnly>')
    sql = sql.replace(/'\$2[ab]\$\d+\$[A-Za-z]+'/g, `'${passwordHash}'`);
    const statements = splitStatements(sql);
    let ok = 0;
    let skipped = 0;
    for (const stmt of statements) {
        try {
            await (0, database_js_1.query)(stmt);
            ok++;
        }
        catch (err) {
            // Silently skip duplicate-key errors (idempotent re-runs)
            if (err.code === 'ER_DUP_ENTRY' || err.code === 'ER_DUP_KEY') {
                skipped++;
                continue;
            }
            // Log FK / subquery errors visibly — they indicate a seed data problem
            process.stdout.write('\n');
            console.warn(`    ⚠  ${err.code ?? err.message}`);
            console.warn(`       ${stmt.slice(0, 180)}`);
            skipped++;
        }
    }
    console.log(`${ok} ok${skipped ? `, ${skipped} skipped` : ''}`);
}
async function seedSQL() {
    console.log('\n' + '═'.repeat(62));
    console.log('  HRMS  —  SQL Seed Runner');
    console.log('═'.repeat(62));
    // ── 1. Wipe existing data ──────────────────────────────────────────────────
    process.stdout.write('\nClearing tables … ');
    await (0, database_js_1.query)('SET FOREIGN_KEY_CHECKS = 0');
    for (const table of TABLES_TO_CLEAR) {
        try {
            await (0, database_js_1.query)(`DELETE FROM \`${table}\``);
        }
        catch {
            /* table may not exist yet */
        }
    }
    await (0, database_js_1.query)('SET FOREIGN_KEY_CHECKS = 1');
    console.log('done');
    // ── 2. Generate a real bcrypt hash ─────────────────────────────────────────
    process.stdout.write('Hashing passwords … ');
    const passwordHash = await bcrypt_1.default.hash('Admin@123', 12);
    console.log('done\n');
    // ── 3. Execute each file in order ─────────────────────────────────────────
    console.log('Running seed files:');
    for (const file of SQL_FILES) {
        const filePath = path_1.default.join(SEEDS_DIR, file);
        if (!fs_1.default.existsSync(filePath)) {
            console.warn(`  ⚠  Not found: ${file} — skipped`);
            continue;
        }
        await runFile(filePath, passwordHash);
    }
    // ── 4. Summary ─────────────────────────────────────────────────────────────
    console.log('\n' + '═'.repeat(62));
    console.log('  ✅  Seed complete');
    console.log('═'.repeat(62));
    console.log('  Default credentials  (password: Admin@123)\n');
    console.log('  admin@fyndyne.com       → Super Admin');
    console.log('  hr@fyndyne.com          → HR Admin');
    console.log('  manager@fyndyne.com     → Manager');
    console.log('  employee@fyndyne.com    → Employee');
    console.log('═'.repeat(62) + '\n');
}
seedSQL().catch(err => {
    console.error('\n❌  Seed failed:', err.message ?? err);
    process.exit(1);
});
//# sourceMappingURL=seed-sql.js.map