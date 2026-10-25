/**
 * Barrel export for all external service clients (Backend Structure pattern).
 *
 *   import { emailClient, smsClient, storageClient, db } from '@clients';
 */
export { emailClient, default as EmailClient } from './email/client.js';
export { smsClient, default as SmsClient } from './sms/client.js';
export { storageClient, default as StorageClient } from './storage/client.js';
export { db, default as DatabaseClient } from './database/client.js';
