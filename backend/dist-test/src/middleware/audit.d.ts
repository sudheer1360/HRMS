import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../common/types/index.js';
export declare function auditLog(module: string, entityType: string): (req: AuthenticatedRequest, _res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=audit.d.ts.map