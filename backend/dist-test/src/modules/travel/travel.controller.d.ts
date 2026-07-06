import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../common/types/index.js';
export declare class TravelController {
    listRequests(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    createRequest(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateRequest(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateExpense(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listExpenses(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    createExpense(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listAdvances(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    createAdvance(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const travelController: TravelController;
//# sourceMappingURL=travel.controller.d.ts.map