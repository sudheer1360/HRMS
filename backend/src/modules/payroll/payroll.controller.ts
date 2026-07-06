import { Response, NextFunction } from 'express';
import { payrollService, expenseService } from './payroll.service.js';
import { createComponentSchema, createStructureSchema, createPayrollRunSchema, expenseClaimSchema, expenseApprovalSchema } from './payroll.schema.js';
import { AuthenticatedRequest } from '../../common/types/index.js';

export class PayrollController {
  // Components
  async createComponent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { const input = createComponentSchema.parse(req.body); const c = await payrollService.createComponent(req.tenantId!, input); res.status(201).json({ success: true, data: c }); } catch (e) { next(e); }
  }
  async listComponents(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { const list = await payrollService.listComponents(req.tenantId!, req.params.companyId); res.json({ success: true, data: list }); } catch (e) { next(e); }
  }

  // Structures
  async createStructure(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { const input = createStructureSchema.parse(req.body); const s = await payrollService.createStructure(req.tenantId!, input); res.status(201).json({ success: true, data: s }); } catch (e) { next(e); }
  }
  async listStructures(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { const list = await payrollService.listStructures(req.tenantId!, req.params.companyId); res.json({ success: true, data: list }); } catch (e) { next(e); }
  }
  async listStructuresAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { const r = await payrollService.listStructuresAll(req.tenantId!, req.query); res.json({ success: true, ...r }); } catch (e) { next(e); }
  }

  // Runs
  async createRun(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { const input = createPayrollRunSchema.parse(req.body); const r = await payrollService.createRun(req.tenantId!, req.user!.userId, input); res.status(201).json({ success: true, data: r }); } catch (e) { next(e); }
  }
  async processRun(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { const r = await payrollService.processRun(req.params.id, req.tenantId!, req.user!.userId); res.json({ success: true, data: r }); } catch (e) { next(e); }
  }
  async approveRun(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { const r = await payrollService.approveRun(req.params.id, req.tenantId!, req.user!.userId); res.json({ success: true, data: r }); } catch (e) { next(e); }
  }
  async listRuns(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { const r = await payrollService.listRuns(req.tenantId!, req.query); res.json({ success: true, ...r }); } catch (e) { next(e); }
  }
  async myPayslips(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { const slips = await payrollService.getPayslips(req.tenantId!, req.user!.userId); res.json({ success: true, data: slips }); } catch (e) { next(e); }
  }

  // Expenses
  async submitClaim(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { const input = expenseClaimSchema.parse(req.body); const c = await expenseService.submitClaim(req.tenantId!, input); res.status(201).json({ success: true, data: c }); } catch (e) { next(e); }
  }
  async listClaims(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { if (req.query.my) (req.query as any).employeeId = req.user!.userId; const r = await expenseService.listClaims(req.tenantId!, req.query); res.json({ success: true, ...r }); } catch (e) { next(e); }
  }
  async approveClaim(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { const { status, rejectedReason } = expenseApprovalSchema.parse(req.body);
      const r = status === 'Approved' ? await expenseService.approveClaim(req.params.id, req.tenantId!, req.user!.userId) : await expenseService.rejectClaim(req.params.id, req.tenantId!, req.user!.userId);
      res.json({ success: true, data: r }); } catch (e) { next(e); }
  }
}

export const payrollController = new PayrollController();
