import { Response, NextFunction } from 'express';
import { travelService } from './travel.service.js';
import { AuthenticatedRequest } from '../../common/types/index.js';

export class TravelController {
  async listRequests(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, ...(await travelService.listRequests(req.tenantId!, req.user?.userId, req.query)) }); } catch (e) { next(e); }
  }
  async createRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.status(201).json({ success: true, data: await travelService.createRequest(req.tenantId!, req.user!.userId, req.body) }); } catch (e) { next(e); }
  }
  async updateRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await travelService.updateRequest(req.params.id, req.tenantId!, req.body) }); } catch (e) { next(e); }
  }

  async updateExpense(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await travelService.updateExpense(req.params.id, req.tenantId!, req.body) }); } catch (e) { next(e); }
  }

  async listExpenses(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, ...(await travelService.listExpenses(req.tenantId!, req.user?.userId, req.query)) }); } catch (e) { next(e); }
  }
  async createExpense(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.status(201).json({ success: true, data: await travelService.createExpense(req.tenantId!, req.user!.userId, req.body) }); } catch (e) { next(e); }
  }

  async listAdvances(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, ...(await travelService.listAdvances(req.tenantId!, req.user?.userId, req.query)) }); } catch (e) { next(e); }
  }
  async createAdvance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.status(201).json({ success: true, data: await travelService.createAdvance(req.tenantId!, req.user!.userId, req.body) }); } catch (e) { next(e); }
  }
}

export const travelController = new TravelController();
