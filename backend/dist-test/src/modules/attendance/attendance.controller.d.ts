import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../common/types/index.js';
export declare class AttendanceController {
    clockIn(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    clockOut(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    manualEntry(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateEntry(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listDaily(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getDailySummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getMonthlySummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listCorrectionRequests(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    submitCorrection(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    approveCorrection(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    rejectCorrection(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    lockPeriod(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    unlockPeriod(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listLocks(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const attendanceController: AttendanceController;
//# sourceMappingURL=attendance.controller.d.ts.map