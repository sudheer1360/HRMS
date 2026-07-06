import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../common/types/index.js';
import { AuthorizationError } from '../common/errors/index.js';
import { redis } from '../config/redis.js';
import { query } from '../config/database.js';

export function rbac(module: string, action?: string) {
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AuthorizationError('Authentication required');

      const { userId, tenantId, roles } = req.user;
      const requiredPermission = action ? `${module}_${action}` : `${module}_VIEW`;
      const cacheKey = `rbac:${tenantId}:${userId}`;

      let permissions: string[];
      const cached = await redis.get(cacheKey);

      if (cached) {
        permissions = JSON.parse(cached);
      } else {
        const rows = await query<{code: string}>(
          `SELECT DISTINCT p.code FROM user_roles ur
           JOIN role_permissions rp ON ur.role_id = rp.role_id
           JOIN permissions p ON rp.permission_id = p.id
           WHERE ur.user_id = ? AND (ur.valid_to IS NULL OR ur.valid_to >= NOW())`,
          [userId]
        );
        permissions = [...new Set(rows.map(r => r.code))];
        await redis.setex(cacheKey, 300, JSON.stringify(permissions));
      }

      const isSuperAdmin = roles.includes('Super Admin');
      if (!permissions.includes(requiredPermission) && !isSuperAdmin) {
        throw new AuthorizationError(`Permission denied: ${requiredPermission}`);
      }
      next();
    } catch (error) { next(error); }
  };
}
