import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runMigration() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'hrms_password',
    database: process.env.DB_NAME || 'hrms',
    multipleStatements: true,
  });

  try {
    const sql = fs.readFileSync(path.join(__dirname, 'migrate-missing-modules.sql'), 'utf8');
    console.log('Running migration: migrate-missing-modules.sql ...');
    const [result] = await conn.query(sql);
    console.log('✓ Migration complete. All missing module tables created.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

runMigration();
