import { Response, NextFunction } from 'express';
import { leaveService } from './leave.service.js';
import { createLeaveTypeSchema, applyLeaveSchema, leaveApprovalSchema, leaveFilterSchema, createLeavePolicySchema } from './leave.schema.js';
import { AuthenticatedRequest } from '../../common/types/index.js';
import { queryOne } from '../../config/database.js';
import { ValidationError } from '../../common/errors/index.js';

async function resolveEmployeeId(userId: string): Promise<string | null> {
  const emp = await queryOne<{ id: string }>('SELECT id FROM employees WHERE user_id = ? AND deleted_at IS NULL LIMIT 1', [userId]);
  return emp?.id ?? null;
}

export class LeaveController {
  // Leave Types
  async listLeaveTypes(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await leaveService.listLeaveTypes(req.tenantId!, req.params.companyId) }); } catch (e) { next(e); }
  }
  async createLeaveType(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { const i = createLeaveTypeSchema.parse(req.body); res.status(201).json({ success: true, data: await leaveService.createLeaveType(req.tenantId!, i) }); } catch (e) { next(e); }
  }
  async updateLeaveType(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { const i = createLeaveTypeSchema.partial().parse(req.body); res.json({ success: true, data: await leaveService.updateLeaveType(req.params.id, req.tenantId!, i) }); } catch (e) { next(e); }
  }
  async deleteLeaveType(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await leaveService.deleteLeaveType(req.params.id, req.tenantId!) }); } catch (e) { next(e); }
  }

  // Leave Policies
  async createLeavePolicy(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { const i = createLeavePolicySchema.parse(req.body); res.status(201).json({ success: true, data: await leaveService.createLeavePolicy(req.tenantId!, i) }); } catch (e) { next(e); }
  }

  // Applications
  async apply(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const i = applyLeaveSchema.parse(req.body);
      const empId = req.body.employeeId || await resolveEmployeeId(req.user!.userId);
      if (!empId) throw new ValidationError('No employee profile found for this user');
      res.status(201).json({ success: true, data: await leaveService.apply(req.tenantId!, empId, i) });
    } catch (e) { next(e); }
  }
  async approve(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { status, rejectedReason } = leaveApprovalSchema.parse(req.body);
      const result = status === 'Approved'
        ? await leaveService.approve(req.params.id, req.tenantId!, req.user!.userId)
        : await leaveService.reject(req.params.id, req.tenantId!, req.user!.userId, rejectedReason);
      res.json({ success: true, data: result });
    } catch (e) { next(e); }
  }
  async cancel(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await leaveService.cancel(req.params.id, req.tenantId!, req.user!.userId) }); } catch (e) { next(e); }
  }
  async listApplications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const q = leaveFilterSchema.parse(req.query);
      if (req.query.my) {
        const empId = await resolveEmployeeId(req.user!.userId);
        (q as any).employeeId = empId ?? req.user!.userId;
      }
      res.json({ success: true, ...(await leaveService.listApplications(req.tenantId!, q)) });
    } catch (e) { next(e); }
  }
  async getApplication(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await leaveService.getApplication(req.params.id, req.tenantId!) }); } catch (e) { next(e); }
  }

  // Balances
  async getBalance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const empId = req.params.employeeId || await resolveEmployeeId(req.user!.userId);
      res.json({ success: true, data: await leaveService.getBalance(req.tenantId!, empId!) });
    } catch (e) { next(e); }
  }
  async initBalances(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { companyId, year } = req.body;
      res.json({ success: true, data: await leaveService.initBalances(req.tenantId!, companyId, year || new Date().getFullYear()) });
    } catch (e) { next(e); }
  }
  async updateBalance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await leaveService.updateBalance(req.params.id, req.tenantId!, req.body) }); } catch (e) { next(e); }
  }

  // Holidays
  async listHolidays(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      res.json({ success: true, data: await leaveService.listHolidays(req.tenantId!, req.params.companyId, year) });
    } catch (e) { next(e); }
  }
  async createHoliday(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.status(201).json({ success: true, data: await leaveService.createHoliday(req.tenantId!, req.body) }); } catch (e) { next(e); }
  }
  async updateHoliday(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await leaveService.updateHoliday(req.params.id, req.tenantId!, req.body) }); } catch (e) { next(e); }
  }
  async deleteHoliday(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await leaveService.deleteHoliday(req.params.id, req.tenantId!) }); } catch (e) { next(e); }
  }

  // Calendar
  async getCalendar(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      res.json({ success: true, data: await leaveService.getCalendar(req.tenantId!, req.user!.userId, month, year) });
    } catch (e) { next(e); }
  }
}

export const leaveController = new LeaveController();
