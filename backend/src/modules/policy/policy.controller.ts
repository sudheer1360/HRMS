import { Response, NextFunction } from 'express';
import { policyService } from '../platform/platform.service.js';
import { createPolicySchema, acknowledgeSchema } from './policy.schema.js';
import { AuthenticatedRequest } from '../../common/types/index.js';

export class PolicyController {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { const r = await policyService.list(req.tenantId!, req.query); res.json({ success: true, ...r }); } catch (e) { next(e); }
  }
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { const i = createPolicySchema.parse(req.body); const r = await policyService.create(req.tenantId!, req.user!.userId, i); res.status(201).json({ success: true, data: r }); } catch (e) { next(e); }
  }
  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { const r = await policyService.getById(req.params.id, req.tenantId!); res.json({ success: true, data: r }); } catch (e) { next(e); }
  }
  async publish(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { const r = await policyService.publish(req.params.id, req.tenantId!); res.json({ success: true, data: r }); } catch (e) { next(e); }
  }
  async stats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { const r = await policyService.stats(req.params.id, req.tenantId!); res.json({ success: true, data: r }); } catch (e) { next(e); }
  }
  async myPolicies(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { const r = await policyService.getMyPolicies(req.tenantId!, req.user!.userId); res.json({ success: true, data: r }); } catch (e) { next(e); }
  }
  async acknowledge(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { const i = acknowledgeSchema.parse(req.body); const r = await policyService.acknowledge(req.tenantId!, req.user!.userId, i.policyId); res.json({ success: true, data: r }); } catch (e) { next(e); }
  }
}

export const policyController = new PolicyController();
