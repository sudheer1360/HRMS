import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../common/types/index.js';
export declare class PayrollController {
    createComponent(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listComponents(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    createStructure(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listStructures(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listStructuresAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    createRun(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    processRun(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    approveRun(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listRuns(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    myPayslips(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    submitClaim(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listClaims(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    approveClaim(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const payrollController: PayrollController;
//# sourceMappingURL=payroll.controller.d.ts.map