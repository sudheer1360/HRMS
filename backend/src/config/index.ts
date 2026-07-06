import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174').split(',').map((origin) => origin.trim()),
  logLevel: process.env.LOG_LEVEL || 'debug',

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'hrms_password',
    database: process.env.DB_NAME || 'hrms',
    poolSize: parseInt(process.env.DB_POOL_SIZE || '20', 10),
  },

  jwt: {
    privateKey: process.env.JWT_PRIVATE_KEY || 'dev-private-key',
    publicKey: process.env.JWT_PUBLIC_KEY || 'dev-public-key',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },

  bcrypt: { rounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10) },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },

  redis: { url: process.env.REDIS_URL || 'redis://localhost:6379' },

  encryption: { key: process.env.ENCRYPTION_KEY || 'dev-32-byte-key-here!!!!!!!!!' },
} as const;
