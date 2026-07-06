import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../common/types/index.js';
export declare class CompensationController {
    listReviewCycles(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    createReviewCycle(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    activateReviewCycle(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listMyBonuses(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    createBonus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listMyLoans(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    createLoan(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listMyVariablePay(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listMyCTCRevisions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    createCTCRevision(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const compensationController: CompensationController;
//# sourceMappingURL=compensation.controller.d.ts.map