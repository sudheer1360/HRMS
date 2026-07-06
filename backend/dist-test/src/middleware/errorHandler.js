"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestId = requestId;
exports.errorHandler = errorHandler;
const uuid_1 = require("uuid");
const zod_1 = require("zod");
const index_js_1 = require("../common/errors/index.js");
const logger_js_1 = __importDefault(require("../config/logger.js"));
/**
 * Assigns a unique request ID to every incoming request.
 */
function requestId(req, _res, next) {
    req.requestId = req.headers['x-request-id'] || (0, uuid_1.v4)();
    _res.setHeader('X-Request-ID', req.requestId);
    next();
}
/**
 * Global error handler middleware.
 * Catches all errors and returns standardized API error responses.
 */
function errorHandler(err, req, res, _next) {
    const requestId = req.requestId || 'unknown';
    // ── Zod validation errors → 400 Bad Request ─────────────────────────────
    if (err instanceof zod_1.ZodError) {
        const fields = err.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
        }));
        logger_js_1.default.warn({ requestId, code: 'VALIDATION_ERROR', fields, path: req.path });
        res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: fields.map((f) => `${f.field}: ${f.message}`).join(', '),
                details: fields,
                requestId,
            },
        });
        return;
    }
    if (err instanceof index_js_1.AppError) {
        const response = {
            success: false,
            error: {
                code: err.code,
                message: err.message,
                details: err.details,
                requestId,
            },
        };
        logger_js_1.default.warn({
            requestId,
            statusCode: err.statusCode,
            code: err.code,
            message: err.message,
            path: req.path,
        });
        res.status(err.statusCode).json(response);
        return;
    }
    // Unknown errors (500)
    logger_js_1.default.error({
        requestId,
        err: {
            message: err.message,
            stack: err.stack,
            name: err.name,
        },
        path: req.path,
        method: req.method,
    });
    const response = {
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message: process.env.NODE_ENV === 'production'
                ? 'An unexpected error occurred'
                : err.message,
            requestId,
        },
    };
    res.status(500).json(response);
}
//# sourceMappingURL=errorHandler.js.map