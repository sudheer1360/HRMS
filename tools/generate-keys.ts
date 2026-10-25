/**
 * tools/generate-keys.ts — Generate secure secrets for .env files.
 *
 * Run: npx ts-node tools/generate-keys.ts
 * Prints ready-to-paste values for JWT_PRIVATE_KEY, ENCRYPTION_KEY, etc.
 */
import { randomBytes } from 'crypto';

function hexKey(bytes: number): string {
  return randomBytes(bytes).toString('hex');
}

function base64Key(bytes: number): string {
  return randomBytes(bytes).toString('base64');
}

console.log('\n🔑 HRMS Secure Key Generator\n');
console.log('Copy these values into your .env file:\n');

console.log(`JWT_PRIVATE_KEY=${hexKey(64)}`);
console.log(`JWT_PUBLIC_KEY=${hexKey(64)}`);
console.log(`ENCRYPTION_KEY=${hexKey(32)}`);
console.log(`REDIS_PASSWORD=${base64Key(24)}`);
console.log(`DB_PASSWORD=${base64Key(18)}`);
console.log();
console.log('⚠️  These are one-time generated. Store them securely in a secrets manager.');
console.log();
