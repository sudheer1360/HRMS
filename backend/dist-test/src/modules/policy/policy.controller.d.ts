import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../common/types/index.js';
export declare class PolicyController {
    list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    publish(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    stats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    myPolicies(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    acknowledge(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const policyController: PolicyController;
//# sourceMappingURL=policy.controller.d.ts.map