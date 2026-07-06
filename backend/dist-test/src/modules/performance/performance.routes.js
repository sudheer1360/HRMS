"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const performance_controller_js_1 = require("./performance.controller.js");
const auth_js_1 = require("../../middleware/auth.js");
const router = (0, express_1.Router)();
router.use(auth_js_1.authenticate);
// ── Goals ──────────────────────────────────────────────────────────────────
router.get('/goals/my', (req, res, next) => performance_controller_js_1.performanceController.listMyGoals(req, res, next));
router.post('/goals', (req, res, next) => performance_controller_js_1.performanceController.createGoal(req, res, next));
router.patch('/goals/:id/progress', (req, res, next) => performance_controller_js_1.performanceController.updateGoalProgress(req, res, next));
router.delete('/goals/:id', (req, res, next) => performance_controller_js_1.performanceController.deleteGoal(req, res, next));
// ── Appraisals ─────────────────────────────────────────────────────────────
router.get('/appraisals/my', (req, res, next) => performance_controller_js_1.performanceController.listMyAppraisals(req, res, next));
router.get('/appraisals/team', (req, res, next) => performance_controller_js_1.performanceController.listTeamAppraisals(req, res, next));
router.post('/appraisals/:id/self-assessment', (req, res, next) => performance_controller_js_1.performanceController.selfAssessment(req, res, next));
router.patch('/appraisals/:id/manager-rating', (req, res, next) => performance_controller_js_1.performanceController.managerRating(req, res, next));
// ── Feedback ───────────────────────────────────────────────────────────────
router.get('/feedback/my', (req, res, next) => performance_controller_js_1.performanceController.listMyFeedback(req, res, next));
router.post('/feedback', (req, res, next) => performance_controller_js_1.performanceController.submitFeedback(req, res, next));
// ── Reviews ────────────────────────────────────────────────────────────────
router.get('/reviews', (req, res, next) => performance_controller_js_1.performanceController.listReviews(req, res, next));
// ── Probation ──────────────────────────────────────────────────────────────
router.get('/probation', (req, res, next) => performance_controller_js_1.performanceController.listProbation(req, res, next));
router.patch('/probation/:id/decision', (req, res, next) => performance_controller_js_1.performanceController.probationDecision(req, res, next));
exports.default = router;
//# sourceMappingURL=performance.routes.js.map