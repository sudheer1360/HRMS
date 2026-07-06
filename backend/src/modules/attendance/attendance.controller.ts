import { Response, NextFunction } from 'express';
import { attendanceService } from './attendance.service.js';
import { manualAttendanceSchema, correctionRequestSchema, correctionApprovalSchema, attendanceFilterSchema, lockAttendanceSchema } from './attendance.schema.js';
import { AuthenticatedRequest } from '../../common/types/index.js';

export class AttendanceController {
  async clockIn(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.status(201).json({ success: true, data: await attendanceService.clockIn(req.tenantId!, req.user!.userId, req.body) }); } catch (e) { next(e); }
  }
  async clockOut(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await attendanceService.clockOut(req.tenantId!, req.user!.userId, req.body) }); } catch (e) { next(e); }
  }
  async manualEntry(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = manualAttendanceSchema.parse(req.body);
      res.status(201).json({ success: true, data: await attendanceService.manualEntry(req.tenantId!, input) });
    } catch (e) { next(e); }
  }
  async updateEntry(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await attendanceService.updateEntry(req.params.id, req.tenantId!, req.body) }); } catch (e) { next(e); }
  }
  async listDaily(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const q = attendanceFilterSchema.parse(req.query);
      if (req.query.my) (q as any).employeeId = req.user!.userId;
      res.json({ success: true, ...(await attendanceService.listDaily(req.tenantId!, q)) });
    } catch (e) { next(e); }
  }
  async getDailySummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const date = (req.query.date as string) || new Date().toISOString().slice(0, 10);
      res.json({ success: true, data: await attendanceService.getDailySummary(req.tenantId!, date) });
    } catch (e) { next(e); }
  }
  async getMonthlySummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const empId = (req.query.employeeId as string) || req.user!.userId;
      res.json({ success: true, data: await attendanceService.getMonthlySummary(req.tenantId!, empId, month, year) });
    } catch (e) { next(e); }
  }
  async listCorrectionRequests(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await attendanceService.listCorrectionRequests(req.tenantId!, req.query) }); } catch (e) { next(e); }
  }
  async submitCorrection(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = correctionRequestSchema.parse(req.body);
      res.status(201).json({ success: true, data: await attendanceService.submitCorrection(req.tenantId!, { ...input, employeeId: input.employeeId || req.user!.userId }) });
    } catch (e) { next(e); }
  }
  async approveCorrection(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await attendanceService.approveCorrection(req.params.id, req.tenantId!, req.user!.userId) }); } catch (e) { next(e); }
  }
  async rejectCorrection(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await attendanceService.rejectCorrection(req.params.id, req.tenantId!, req.user!.userId, req.body.reason) }); } catch (e) { next(e); }
  }
  async lockPeriod(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = lockAttendanceSchema.parse(req.body);
      res.status(201).json({ success: true, data: await attendanceService.lockPeriod(req.tenantId!, input, req.user!.userId) });
    } catch (e) { next(e); }
  }
  async unlockPeriod(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await attendanceService.unlockPeriod(req.params.id, req.tenantId!, req.user!.userId, req.body.reason) }); } catch (e) { next(e); }
  }
  async listLocks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await attendanceService.listLocks(req.tenantId!, req.params.companyId) }); } catch (e) { next(e); }
  }
}

export const attendanceController = new AttendanceController();
