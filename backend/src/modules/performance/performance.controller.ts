import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.js';
import { performanceService } from './performance.service.js';

export class PerformanceController {
  // ── Goals ──────────────────────────────────────────────────────────────────

  async listMyGoals(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const r = await performanceService.listMyGoals(req.tenantId!, req.user!.userId, req.query);
      res.json({ success: true, ...r });
    } catch (e) { next(e); }
  }

  async createGoal(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const r = await performanceService.createGoal(req.tenantId!, req.user!.userId, req.body);
      res.status(201).json({ success: true, data: r });
    } catch (e) { next(e); }
  }

  async updateGoalProgress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const r = await performanceService.updateGoalProgress(req.params.id, req.tenantId!, Number(req.body.progress ?? 0));
      res.json({ success: true, data: r });
    } catch (e) { next(e); }
  }

  async deleteGoal(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const r = await performanceService.deleteGoal(req.params.id, req.tenantId!);
      res.json({ success: true, data: r });
    } catch (e) { next(e); }
  }

  // ── Appraisals ─────────────────────────────────────────────────────────────

  async listMyAppraisals(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const r = await performanceService.listMyAppraisals(req.tenantId!, req.user!.userId, req.query);
      res.json({ success: true, ...r });
    } catch (e) { next(e); }
  }

  async listTeamAppraisals(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const r = await performanceService.listTeamAppraisals(req.tenantId!, req.user!.userId, req.query);
      res.json({ success: true, ...r });
    } catch (e) { next(e); }
  }

  async selfAssessment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const r = await performanceService.selfAssessment(req.params.id, req.tenantId!, req.body);
      res.json({ success: true, data: r });
    } catch (e) { next(e); }
  }

  async managerRating(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const r = await performanceService.managerRating(req.params.id, req.tenantId!, req.body);
      res.json({ success: true, data: r });
    } catch (e) { next(e); }
  }

  // ── Feedback ───────────────────────────────────────────────────────────────

  async listMyFeedback(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const r = await performanceService.listMyFeedback(req.tenantId!, req.user!.userId, req.query);
      res.json({ success: true, ...r });
    } catch (e) { next(e); }
  }

  async submitFeedback(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const r = await performanceService.submitFeedback(req.tenantId!, req.user!.userId, req.body);
      res.status(201).json({ success: true, data: r });
    } catch (e) { next(e); }
  }

  // ── Reviews ────────────────────────────────────────────────────────────────

  async listReviews(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const r = await performanceService.listReviews(req.tenantId!, req.query);
      res.json({ success: true, ...r });
    } catch (e) { next(e); }
  }

  // ── Probation ──────────────────────────────────────────────────────────────

  async listProbation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const r = await performanceService.listProbation(req.tenantId!, req.query);
      res.json({ success: true, ...r });
    } catch (e) { next(e); }
  }

  async probationDecision(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const r = await performanceService.probationDecision(req.params.id, req.tenantId!, req.body.decision ?? 'Confirmed');
      res.json({ success: true, data: r });
    } catch (e) { next(e); }
  }
}

export const performanceController = new PerformanceController();
