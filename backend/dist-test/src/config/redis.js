"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const index_js_1 = require("./index.js");
const globalForRedis = globalThis;
exports.redis = globalForRedis.redis ||
    new ioredis_1.default(index_js_1.config.redis.url, {
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
            if (times > 10)
                return null;
            return Math.min(times * 200, 2000);
        },
        lazyConnect: true,
    });
if (process.env.NODE_ENV !== 'production') {
    globalForRedis.redis = exports.redis;
}
exports.redis.on('error', (err) => {
    console.error('Redis connection error:', err.message);
});
exports.redis.on('connect', () => {
    console.log('Redis connected');
});
exports.default = exports.redis;
//# sourceMappingURL=redis.js.map