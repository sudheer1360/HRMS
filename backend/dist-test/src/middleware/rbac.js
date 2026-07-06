"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rbac = rbac;
const index_js_1 = require("../common/errors/index.js");
const redis_js_1 = require("../config/redis.js");
const database_js_1 = require("../config/database.js");
function rbac(module, action) {
    return async (req, _res, next) => {
        try {
            if (!req.user)
                throw new index_js_1.AuthorizationError('Authentication required');
            const { userId, tenantId, roles } = req.user;
            const requiredPermission = action ? `${module}_${action}` : `${module}_VIEW`;
            const cacheKey = `rbac:${tenantId}:${userId}`;
            let permissions;
            const cached = await redis_js_1.redis.get(cacheKey);
            if (cached) {
                permissions = JSON.parse(cached);
            }
            else {
                const rows = await (0, database_js_1.query)(`SELECT DISTINCT p.code FROM user_roles ur
           JOIN role_permissions rp ON ur.role_id = rp.role_id
           JOIN permissions p ON rp.permission_id = p.id
           WHERE ur.user_id = ? AND (ur.valid_to IS NULL OR ur.valid_to >= NOW())`, [userId]);
                permissions = [...new Set(rows.map(r => r.code))];
                await redis_js_1.redis.setex(cacheKey, 300, JSON.stringify(permissions));
            }
            const isSuperAdmin = roles.includes('Super Admin');
            if (!permissions.includes(requiredPermission) && !isSuperAdmin) {
                throw new index_js_1.AuthorizationError(`Permission denied: ${requiredPermission}`);
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
}
//# sourceMappingURL=rbac.js.map