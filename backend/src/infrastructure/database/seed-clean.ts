/**
 * Clean UUID Seed Runner
 * Runs 15-clean-uuid-seed.sql — a fresh seed with proper UUID primary keys.
 * Truncates all data first, then re-inserts clean seed data.
 *
 * Usage:  npm run db:seed-clean
 */

import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { query } from '../../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const SEEDS_DIR  = path.join(__dirname, 'seeds');

function splitStatements(sql: string): string[] {
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

  const filePath = path.join(SEEDS_DIR, '15-clean-uuid-seed.sql');
  if (!fs.existsSync(filePath)) {
    console.error('❌  Seed file not found:', filePath);
    process.exit(1);
  }

  const sql = fs.readFileSync(filePath, 'utf-8');
  const statements = splitStatements(sql);

  console.log(`\nExecuting ${statements.length} statements from 15-clean-uuid-seed.sql …\n`);

  let ok = 0, skipped = 0, failed = 0;

  for (const stmt of statements) {
    try {
      await query(stmt);
      ok++;
    } catch (err: any) {
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
