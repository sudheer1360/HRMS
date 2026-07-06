import app from './app.js';
import { config } from './config/index.js';
import { redis } from './config/redis.js';
import logger from './config/logger.js';
import './config/database.js'; // Initialize MySQL pool

async function bootstrap() {
  try {
    await redis.connect();
    logger.info('Redis connected');

    app.listen(config.port, () => {
      logger.info({ port: config.port, env: config.nodeEnv }, 'HRMS Platform API started');
      console.log(`
  ╔══════════════════════════════════════════╗
  ║   Enterprise HRMS Platform (MySQL)      ║
  ║   Server: http://localhost:${config.port}       ║
  ║   Health: http://localhost:${config.port}/health ║
  ╚══════════════════════════════════════════╝
      `);
    });
  } catch (err) {
    logger.error({ err }, 'Failed to start');
    process.exit(1);
  }
}

process.on('SIGTERM', async () => { await redis.quit(); process.exit(0); });
process.on('SIGINT', async () => { await redis.quit(); process.exit(0); });

bootstrap();
