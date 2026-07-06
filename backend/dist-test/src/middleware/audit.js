"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLog = auditLog;
const database_js_1 = require("../config/database.js");
const logger_js_1 = __importDefault(require("../config/logger.js"));
function auditLog(module, entityType) {
    return async (req, _res, next) => {
        const originalJson = _res.json.bind(_res);
        _res.json = function (body) {
            if (_res.statusCode >= 200 && _res.statusCode < 300 && req.user) {
                const action = { POST: 'CREATE', PUT: 'UPDATE', PATCH: 'UPDATE', DELETE: 'DELETE', GET: 'READ' }[req.method] || 'UNKNOWN';
                if (action !== 'READ') {
                    (0, database_js_1.insert)(`INSERT INTO audit_logs (id, tenant_id, user_id, module, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent, request_id)
             VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [req.tenantId || req.user.tenantId, req.user.userId, module, action, entityType,
                        body?.data?.id || req.params.id || 'unknown',
                        req.method === 'PUT' || req.method === 'PATCH' ? JSON.stringify(req._oldValues) : null,
                        body?.data ? JSON.stringify(body.data) : null,
                        req.ip, req.headers['user-agent'], req.requestId]).catch((err) => logger_js_1.default.error({ err }, 'Audit write failed'));
                }
            }
            return originalJson(body);
        };
        next();
    };
}
//# sourceMappingURL=audit.js.map