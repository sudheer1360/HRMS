"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantResolver = tenantResolver;
const database_js_1 = require("../config/database.js");
async function tenantResolver(req, _res, next) {
    try {
        const tenantId = req.headers['x-tenant-id'];
        if (!tenantId && req.user?.tenantId) {
            req.tenantId = req.user.tenantId;
            return next();
        }
        if (tenantId) {
            const tenant = await (0, database_js_1.queryOne)('SELECT id, status FROM tenants WHERE id = ?', [tenantId]);
            // If tenant not found (e.g. stale header from Redux, DB not yet seeded),
            // continue gracefully — authenticate middleware will set req.tenantId from JWT.
            if (tenant && tenant.status === 'Active') {
                req.tenantId = tenantId;
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=tenant.js.map