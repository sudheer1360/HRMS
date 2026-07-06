import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../common/types/index.js';
import { insert } from '../config/database.js';
import logger from '../config/logger.js';

export function auditLog(module: string, entityType: string) {
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
    const originalJson = _res.json.bind(_res);
    _res.json = function (body: any) {
      if (_res.statusCode >= 200 && _res.statusCode < 300 && req.user) {
        const action = { POST: 'CREATE', PUT: 'UPDATE', PATCH: 'UPDATE', DELETE: 'DELETE', GET: 'READ' }[req.method] || 'UNKNOWN';
        if (action !== 'READ') {
          insert(
            `INSERT INTO audit_logs (id, tenant_id, user_id, module, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent, request_id)
             VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.tenantId || req.user.tenantId, req.user.userId, module, action, entityType,
              body?.data?.id || req.params.id || 'unknown',
              req.method === 'PUT' || req.method === 'PATCH' ? JSON.stringify((req as any)._oldValues) : null,
              body?.data ? JSON.stringify(body.data) : null,
              req.ip, req.headers['user-agent'], (req as any).requestId]
          ).catch((err: Error) => logger.error({ err }, 'Audit write failed'));
        }
      }
      return originalJson(body);
    };
    next();
  };
}
