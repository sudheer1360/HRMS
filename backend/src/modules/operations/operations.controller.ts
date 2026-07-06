import { Response, NextFunction } from 'express';
import { operationsService } from './operations.service.js';
import { createCycleSchema, submitReviewSchema, createAssetSchema, allocateAssetSchema, createGrievanceSchema, createDisciplinarySchema, createExitSchema } from './operations.schema.js';
import { AuthenticatedRequest } from '../../common/types/index.js';

export class OperationsController {
  // Performance
  async createCycle(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const i = createCycleSchema.parse(req.body); const r = await operationsService.createCycle(req.tenantId!, i); res.status(201).json({ success: true, data: r }); } catch (e) { next(e); } }
  async listCycles(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await operationsService.listCycles(req.tenantId!, req.params.companyId); res.json({ success: true, data: r }); } catch (e) { next(e); } }
  async submitSelfReview(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const i = submitReviewSchema.parse(req.body); const r = await operationsService.submitSelfReview(req.tenantId!, req.params.cycleId, req.user!.userId, i); res.json({ success: true, data: r }); } catch (e) { next(e); } }
  async submitManagerReview(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const i = submitReviewSchema.parse(req.body); const r = await operationsService.submitManagerReview(req.tenantId!, req.params.id, i); res.json({ success: true, data: r }); } catch (e) { next(e); } }
  async listReviews(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { if (req.query.my) (req.query as any).employeeId = req.user!.userId; const r = await operationsService.listReviews(req.tenantId!, req.query); res.json({ success: true, ...r }); } catch (e) { next(e); } }

  // Assets
  async createAsset(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const i = createAssetSchema.parse(req.body); const r = await operationsService.createAsset(req.tenantId!, i); res.status(201).json({ success: true, data: r }); } catch (e) { next(e); } }
  async listAssets(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { if (req.query.my) (req.query as any).assignedTo = req.user!.userId; const r = await operationsService.listAssets(req.tenantId!, req.query); res.json({ success: true, ...r }); } catch (e) { next(e); } }
  async allocateAsset(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const i = allocateAssetSchema.parse(req.body); const r = await operationsService.allocateAsset(req.params.id, req.tenantId!, i); res.json({ success: true, data: r }); } catch (e) { next(e); } }
  async returnAsset(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await operationsService.returnAsset(req.params.id, req.tenantId!); res.json({ success: true, data: r }); } catch (e) { next(e); } }

  // Grievance
  async submitGrievance(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const i = createGrievanceSchema.parse(req.body); const r = await operationsService.submitGrievance(req.tenantId!, i); res.status(201).json({ success: true, data: r }); } catch (e) { next(e); } }
  async listGrievances(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await operationsService.listGrievances(req.tenantId!, req.query); res.json({ success: true, ...r }); } catch (e) { next(e); } }

  // Disciplinary
  async createDisciplinary(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const i = createDisciplinarySchema.parse(req.body); const r = await operationsService.createDisciplinaryCase(req.tenantId!, i); res.status(201).json({ success: true, data: r }); } catch (e) { next(e); } }
  async listDisciplinary(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await operationsService.listDisciplinaryCases(req.tenantId!, req.query); res.json({ success: true, ...r }); } catch (e) { next(e); } }

  // Exit
  async initiateExit(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const i = createExitSchema.parse(req.body); const r = await operationsService.initiateExit(req.tenantId!, i); res.status(201).json({ success: true, data: r }); } catch (e) { next(e); } }
  async listExits(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await operationsService.listExitCases(req.tenantId!, req.query); res.json({ success: true, ...r }); } catch (e) { next(e); } }
  async processFnf(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await operationsService.processFnf(req.params.id, req.tenantId!, req.body.fnfAmount); res.json({ success: true, data: r }); } catch (e) { next(e); } }
}

export const operationsController = new OperationsController();
