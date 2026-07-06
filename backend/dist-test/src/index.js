"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_js_1 = __importDefault(require("./app.js"));
const index_js_1 = require("./config/index.js");
const redis_js_1 = require("./config/redis.js");
const logger_js_1 = __importDefault(require("./config/logger.js"));
require("./config/database.js"); // Initialize MySQL pool
async function bootstrap() {
    try {
        await redis_js_1.redis.connect();
        logger_js_1.default.info('Redis connected');
        app_js_1.default.listen(index_js_1.config.port, () => {
            logger_js_1.default.info({ port: index_js_1.config.port, env: index_js_1.config.nodeEnv }, 'HRMS Platform API started');
            console.log(`
  ╔══════════════════════════════════════════╗
  ║   Enterprise HRMS Platform (MySQL)      ║
  ║   Server: http://localhost:${index_js_1.config.port}       ║
  ║   Health: http://localhost:${index_js_1.config.port}/health ║
  ╚══════════════════════════════════════════╝
      `);
        });
    }
    catch (err) {
        logger_js_1.default.error({ err }, 'Failed to start');
        process.exit(1);
    }
}
process.on('SIGTERM', async () => { await redis_js_1.redis.quit(); process.exit(0); });
process.on('SIGINT', async () => { await redis_js_1.redis.quit(); process.exit(0); });
bootstrap();
//# sourceMappingURL=index.js.map