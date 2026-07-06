import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.js';
export declare class PerformanceController {
    listMyGoals(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    createGoal(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateGoalProgress(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    deleteGoal(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listMyAppraisals(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listTeamAppraisals(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    selfAssessment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    managerRating(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listMyFeedback(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    submitFeedback(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listReviews(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listProbation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    probationDecision(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const performanceController: PerformanceController;
//# sourceMappingURL=performance.controller.d.ts.map