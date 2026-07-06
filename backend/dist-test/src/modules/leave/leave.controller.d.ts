import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../common/types/index.js';
export declare class LeaveController {
    listLeaveTypes(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    createLeaveType(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateLeaveType(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    deleteLeaveType(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    createLeavePolicy(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    apply(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    approve(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    cancel(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listApplications(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getApplication(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getBalance(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    initBalances(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateBalance(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listHolidays(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    createHoliday(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateHoliday(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    deleteHoliday(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getCalendar(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const leaveController: LeaveController;
//# sourceMappingURL=leave.controller.d.ts.map