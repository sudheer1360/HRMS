import { Response, NextFunction } from 'express';
import { complianceService } from './compliance.service.js';
import { AuthenticatedRequest } from '../../common/types/index.js';

export class ComplianceController {
  async listCalendar(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, ...(await complianceService.listCalendarEvents(req.tenantId!, req.query)) }); } catch (e) { next(e); }
  }
  async createCalendarEvent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.status(201).json({ success: true, data: await complianceService.createCalendarEvent(req.tenantId!, req.user!.userId, req.body) }); } catch (e) { next(e); }
  }
  async listFilings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, ...(await complianceService.listFilings(req.tenantId!, req.query)) }); } catch (e) { next(e); }
  }
  async createFiling(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.status(201).json({ success: true, data: await complianceService.createFiling(req.tenantId!, req.user!.userId, req.body) }); } catch (e) { next(e); }
  }
  async listReports(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, ...(await complianceService.listReports(req.tenantId!, req.query)) }); } catch (e) { next(e); }
  }
  async listChecklist(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, ...(await complianceService.listChecklist(req.tenantId!, req.query)) }); } catch (e) { next(e); }
  }
  async updateChecklistItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await complianceService.updateChecklistItem(req.params.id, req.tenantId!, req.body) }); } catch (e) { next(e); }
  }
  async listDocuments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, ...(await complianceService.listDocuments(req.tenantId!, req.query)) }); } catch (e) { next(e); }
  }
  async createDocument(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.status(201).json({ success: true, data: await complianceService.createDocument(req.tenantId!, req.user!.userId, req.body) }); } catch (e) { next(e); }
  }
}

export const complianceController = new ComplianceController();
