import { Response, NextFunction } from 'express';
import { shiftService, overtimeService } from './shift.service.js';
import { createShiftSchema, createRosterSchema, overtimeRequestSchema, overtimeApprovalSchema } from './shift.schema.js';
import { AuthenticatedRequest } from '../../common/types/index.js';

export class ShiftOvertimeController {
  // Shifts
  async listShifts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await shiftService.listShifts(req.tenantId!, req.params.companyId) }); } catch (e) { next(e); }
  }
  async createShift(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { const i = createShiftSchema.parse(req.body); res.status(201).json({ success: true, data: await shiftService.createShift(req.tenantId!, i) }); } catch (e) { next(e); }
  }
  async updateShift(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { const i = createShiftSchema.partial().parse(req.body); res.json({ success: true, data: await shiftService.updateShift(req.params.id, req.tenantId!, i) }); } catch (e) { next(e); }
  }
  async deleteShift(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await shiftService.deleteShift(req.params.id, req.tenantId!) }); } catch (e) { next(e); }
  }

  // Rosters
  async listRosters(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await shiftService.listRosters(req.tenantId!, req.query) }); } catch (e) { next(e); }
  }
  async createRoster(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { const i = createRosterSchema.parse(req.body); res.status(201).json({ success: true, data: await shiftService.assignRoster(req.tenantId!, i) }); } catch (e) { next(e); }
  }
  async updateRoster(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await shiftService.updateRoster(req.params.id, req.tenantId!, req.body) }); } catch (e) { next(e); }
  }
  async deleteRoster(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await shiftService.deleteRoster(req.params.id, req.tenantId!) }); } catch (e) { next(e); }
  }
  async getEmployeeShift(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const empId = req.params.employeeId || req.user!.userId;
      res.json({ success: true, data: await shiftService.getEmployeeShift(req.tenantId!, empId, req.query.date as string) });
    } catch (e) { next(e); }
  }

  // Overtime
  async listOT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (req.query.my) (req.query as any).employeeId = req.user!.userId;
      res.json({ success: true, ...(await overtimeService.listRequests(req.tenantId!, req.query)) });
    } catch (e) { next(e); }
  }
  async submitOT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const i = overtimeRequestSchema.parse(req.body);
      res.status(201).json({ success: true, data: await overtimeService.submitRequest(req.tenantId!, i) });
    } catch (e) { next(e); }
  }
  async approveOT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { status, rejectedReason } = overtimeApprovalSchema.parse(req.body);
      const result = status === 'Approved'
        ? await overtimeService.approveRequest(req.params.id, req.tenantId!, req.user!.userId)
        : await overtimeService.rejectRequest(req.params.id, req.tenantId!, req.user!.userId, rejectedReason);
      res.json({ success: true, data: result });
    } catch (e) { next(e); }
  }
}

export const shiftOvertimeController = new ShiftOvertimeController();
