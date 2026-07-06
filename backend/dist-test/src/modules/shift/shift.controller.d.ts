import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../common/types/index.js';
export declare class ShiftOvertimeController {
    listShifts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    createShift(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateShift(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    deleteShift(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listRosters(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    createRoster(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateRoster(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    deleteRoster(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getEmployeeShift(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listOT(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    submitOT(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    approveOT(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const shiftOvertimeController: ShiftOvertimeController;
//# sourceMappingURL=shift.controller.d.ts.map