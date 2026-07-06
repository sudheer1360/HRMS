"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const pino_1 = __importDefault(require("pino"));
const index_js_1 = require("./index.js");
exports.logger = (0, pino_1.default)({
    level: index_js_1.config.logLevel,
    transport: index_js_1.config.nodeEnv === 'development'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
    redact: {
        paths: ['password', 'passwordHash', 'token', 'aadhaarEncrypted', 'panEncrypted', 'accountNumberEncrypted'],
        censor: '[REDACTED]',
    },
    formatters: {
        level(label) {
            return { level: label };
        },
    },
    timestamp: pino_1.default.stdTimeFunctions.isoTime,
});
exports.default = exports.logger;
