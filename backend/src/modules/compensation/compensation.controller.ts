import { Response, NextFunction } from 'express';
import { compensationService } from './compensation.service.js';
import { AuthenticatedRequest } from '../../common/types/index.js';

export class CompensationController {
  async listReviewCycles(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, ...(await compensationService.listReviewCycles(req.tenantId!, req.query)) }); } catch (e) { next(e); }
  }
  async createReviewCycle(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.status(201).json({ success: true, data: await compensationService.createReviewCycle(req.tenantId!, req.user!.userId, req.body) }); } catch (e) { next(e); }
  }
  async activateReviewCycle(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await compensationService.activateReviewCycle(req.params.id, req.tenantId!) }); } catch (e) { next(e); }
  }
  async listMyBonuses(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, ...(await compensationService.listMyBonuses(req.tenantId!, req.user!.userId, req.query)) }); } catch (e) { next(e); }
  }
  async createBonus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.status(201).json({ success: true, data: await compensationService.createBonus(req.tenantId!, req.user!.userId, req.body) }); } catch (e) { next(e); }
  }
  async listMyLoans(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, ...(await compensationService.listMyLoans(req.tenantId!, req.user!.userId, req.query)) }); } catch (e) { next(e); }
  }
  async createLoan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.status(201).json({ success: true, data: await compensationService.createLoan(req.tenantId!, req.user!.userId, req.body) }); } catch (e) { next(e); }
  }
  async listMyVariablePay(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, ...(await compensationService.listMyVariablePay(req.tenantId!, req.user!.userId, req.query)) }); } catch (e) { next(e); }
  }
  async listMyCTCRevisions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, ...(await compensationService.listMyCTCRevisions(req.tenantId!, req.user!.userId, req.query)) }); } catch (e) { next(e); }
  }
  async createCTCRevision(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.status(201).json({ success: true, data: await compensationService.createCTCRevision(req.tenantId!, req.user!.userId, req.body) }); } catch (e) { next(e); }
  }
}

export const compensationController = new CompensationController();
