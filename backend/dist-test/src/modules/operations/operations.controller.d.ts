import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../common/types/index.js';
export declare class OperationsController {
    createCycle(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listCycles(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    submitSelfReview(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    submitManagerReview(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listReviews(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    createAsset(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listAssets(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    allocateAsset(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    returnAsset(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    submitGrievance(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listGrievances(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    createDisciplinary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listDisciplinary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    initiateExit(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listExits(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    processFnf(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const operationsController: OperationsController;
//# sourceMappingURL=operations.controller.d.ts.map