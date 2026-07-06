import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../common/types/index.js';
import { queryOne } from '../config/database.js';

export async function tenantResolver(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    if (!tenantId && req.user?.tenantId) {
      req.tenantId = req.user.tenantId;
      return next();
    }
    if (tenantId) {
      const tenant = await queryOne<any>('SELECT id, status FROM tenants WHERE id = ?', [tenantId]);
      // If tenant not found (e.g. stale header from Redux, DB not yet seeded),
      // continue gracefully — authenticate middleware will set req.tenantId from JWT.
      if (tenant && tenant.status === 'Active') {
        req.tenantId = tenantId;
      }
    }
    next();
  } catch (error) {
    next(error);
  }
}
