/**
 * tools/db-ping.ts — Verify MySQL and Redis connectivity.
 *
 * Run: npx ts-node tools/db-ping.ts
 */
import 'dotenv/config';
import mysql from 'mysql2/promise';
import Redis from 'ioredis';

async function pingMySQL() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3307,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'hrms_password',
    database: process.env.DB_NAME || 'hrms',
  });
  await conn.ping();
  await conn.end();
}

async function pingRedis() {
  const client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    lazyConnect: true,
    connectTimeout: 5000,
  });
  await client.connect();
  await client.ping();
  await client.quit();
}

async function main() {
  console.log('\n🔍 HRMS Infrastructure Ping\n');

  // MySQL
  try {
    await pingMySQL();
    console.log(`✅  MySQL  → ${process.env.DB_HOST}:${process.env.DB_PORT || 3307}`);
  } catch (err: any) {
    console.log(`❌  MySQL  → ${err.message}`);
  }

  // Redis
  try {
    await pingRedis();
    console.log(`✅  Redis  → ${process.env.REDIS_URL || 'localhost:6379'}`);
  } catch (err: any) {
    console.log(`❌  Redis  → ${err.message}`);
  }

  console.log();
}

main().catch(console.error);
