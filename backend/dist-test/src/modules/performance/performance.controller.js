"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.performanceController = exports.PerformanceController = void 0;
const performance_service_js_1 = require("./performance.service.js");
class PerformanceController {
    // ── Goals ──────────────────────────────────────────────────────────────────
    async listMyGoals(req, res, next) {
        try {
            const r = await performance_service_js_1.performanceService.listMyGoals(req.tenantId, req.user.userId, req.query);
            res.json({ success: true, ...r });
        }
        catch (e) {
            next(e);
        }
    }
    async createGoal(req, res, next) {
        try {
            const r = await performance_service_js_1.performanceService.createGoal(req.tenantId, req.user.userId, req.body);
            res.status(201).json({ success: true, data: r });
        }
        catch (e) {
            next(e);
        }
    }
    async updateGoalProgress(req, res, next) {
        try {
            const r = await performance_service_js_1.performanceService.updateGoalProgress(req.params.id, req.tenantId, Number(req.body.progress ?? 0));
            res.json({ success: true, data: r });
        }
        catch (e) {
            next(e);
        }
    }
    async deleteGoal(req, res, next) {
        try {
            const r = await performance_service_js_1.performanceService.deleteGoal(req.params.id, req.tenantId);
            res.json({ success: true, data: r });
        }
        catch (e) {
            next(e);
        }
    }
    // ── Appraisals ─────────────────────────────────────────────────────────────
    async listMyAppraisals(req, res, next) {
        try {
            const r = await performance_service_js_1.performanceService.listMyAppraisals(req.tenantId, req.user.userId, req.query);
            res.json({ success: true, ...r });
        }
        catch (e) {
            next(e);
        }
    }
    async listTeamAppraisals(req, res, next) {
        try {
            const r = await performance_service_js_1.performanceService.listTeamAppraisals(req.tenantId, req.user.userId, req.query);
            res.json({ success: true, ...r });
        }
        catch (e) {
            next(e);
        }
    }
    async selfAssessment(req, res, next) {
        try {
            const r = await performance_service_js_1.performanceService.selfAssessment(req.params.id, req.tenantId, req.body);
            res.json({ success: true, data: r });
        }
        catch (e) {
            next(e);
        }
    }
    async managerRating(req, res, next) {
        try {
            const r = await performance_service_js_1.performanceService.managerRating(req.params.id, req.tenantId, req.body);
            res.json({ success: true, data: r });
        }
        catch (e) {
            next(e);
        }
    }
    // ── Feedback ───────────────────────────────────────────────────────────────
    async listMyFeedback(req, res, next) {
        try {
            const r = await performance_service_js_1.performanceService.listMyFeedback(req.tenantId, req.user.userId, req.query);
            res.json({ success: true, ...r });
        }
        catch (e) {
            next(e);
        }
    }
    async submitFeedback(req, res, next) {
        try {
            const r = await performance_service_js_1.performanceService.submitFeedback(req.tenantId, req.user.userId, req.body);
            res.status(201).json({ success: true, data: r });
        }
        catch (e) {
            next(e);
        }
    }
    // ── Reviews ────────────────────────────────────────────────────────────────
    async listReviews(req, res, next) {
        try {
            const r = await performance_service_js_1.performanceService.listReviews(req.tenantId, req.query);
            res.json({ success: true, ...r });
        }
        catch (e) {
            next(e);
        }
    }
    // ── Probation ──────────────────────────────────────────────────────────────
    async listProbation(req, res, next) {
        try {
            const r = await performance_service_js_1.performanceService.listProbation(req.tenantId, req.query);
            res.json({ success: true, ...r });
        }
        catch (e) {
            next(e);
        }
    }
    async probationDecision(req, res, next) {
        try {
            const r = await performance_service_js_1.performanceService.probationDecision(req.params.id, req.tenantId, req.body.decision ?? 'Confirmed');
            res.json({ success: true, data: r });
        }
        catch (e) {
            next(e);
        }
    }
}
exports.PerformanceController = PerformanceController;
exports.performanceController = new PerformanceController();
//# sourceMappingURL=performance.controller.js.map