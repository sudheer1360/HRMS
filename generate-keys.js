const crypto = require('crypto');

// Generate secure random keys
const privateKey = crypto.randomBytes(64).toString('hex');
const publicKey = crypto.randomBytes(64).toString('hex');

console.log('=== JWT KEY CONFIGURATION ===\n');
console.log('For .env file:\n');
console.log(`JWT_PRIVATE_KEY=${privateKey}`);
console.log(`JWT_PUBLIC_KEY=${publicKey}`);
console.log('\n=== Note ===');
console.log('Using HS256 (HMAC) algorithm for development.');
console.log('Update auth.service.ts to use HS256 if using string keys.');
