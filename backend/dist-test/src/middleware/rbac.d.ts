import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../common/types/index.js';
export declare function rbac(module: string, action?: string): (req: AuthenticatedRequest, _res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=rbac.d.ts.map