import { Router } from 'express';
import { performanceController } from './performance.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();
router.use(authenticate);

// ── Goals ──────────────────────────────────────────────────────────────────
router.get('/goals/my', (req, res, next) => performanceController.listMyGoals(req, res, next));
router.post('/goals', (req, res, next) => performanceController.createGoal(req, res, next));
router.patch('/goals/:id/progress', (req, res, next) => performanceController.updateGoalProgress(req, res, next));
router.delete('/goals/:id', (req, res, next) => performanceController.deleteGoal(req, res, next));

// ── Appraisals ─────────────────────────────────────────────────────────────
router.get('/appraisals/my', (req, res, next) => performanceController.listMyAppraisals(req, res, next));
router.get('/appraisals/team', (req, res, next) => performanceController.listTeamAppraisals(req, res, next));
router.post('/appraisals/:id/self-assessment', (req, res, next) => performanceController.selfAssessment(req, res, next));
router.patch('/appraisals/:id/manager-rating', (req, res, next) => performanceController.managerRating(req, res, next));

// ── Feedback ───────────────────────────────────────────────────────────────
router.get('/feedback/my', (req, res, next) => performanceController.listMyFeedback(req, res, next));
router.post('/feedback', (req, res, next) => performanceController.submitFeedback(req, res, next));

// ── Reviews ────────────────────────────────────────────────────────────────
router.get('/reviews', (req, res, next) => performanceController.listReviews(req, res, next));

// ── Probation ──────────────────────────────────────────────────────────────
router.get('/probation', (req, res, next) => performanceController.listProbation(req, res, next));
router.patch('/probation/:id/decision', (req, res, next) => performanceController.probationDecision(req, res, next));

export default router;
