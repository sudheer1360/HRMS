"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compensationController = exports.CompensationController = void 0;
const compensation_service_js_1 = require("./compensation.service.js");
class CompensationController {
    async listReviewCycles(req, res, next) {
        try {
            res.json({ success: true, ...(await compensation_service_js_1.compensationService.listReviewCycles(req.tenantId, req.query)) });
        }
        catch (e) {
            next(e);
        }
    }
    async createReviewCycle(req, res, next) {
        try {
            res.status(201).json({ success: true, data: await compensation_service_js_1.compensationService.createReviewCycle(req.tenantId, req.user.userId, req.body) });
        }
        catch (e) {
            next(e);
        }
    }
    async activateReviewCycle(req, res, next) {
        try {
            res.json({ success: true, data: await compensation_service_js_1.compensationService.activateReviewCycle(req.params.id, req.tenantId) });
        }
        catch (e) {
            next(e);
        }
    }
    async listMyBonuses(req, res, next) {
        try {
            res.json({ success: true, ...(await compensation_service_js_1.compensationService.listMyBonuses(req.tenantId, req.user.userId, req.query)) });
        }
        catch (e) {
            next(e);
        }
    }
    async createBonus(req, res, next) {
        try {
            res.status(201).json({ success: true, data: await compensation_service_js_1.compensationService.createBonus(req.tenantId, req.user.userId, req.body) });
        }
        catch (e) {
            next(e);
        }
    }
    async listMyLoans(req, res, next) {
        try {
            res.json({ success: true, ...(await compensation_service_js_1.compensationService.listMyLoans(req.tenantId, req.user.userId, req.query)) });
        }
        catch (e) {
            next(e);
        }
    }
    async createLoan(req, res, next) {
        try {
            res.status(201).json({ success: true, data: await compensation_service_js_1.compensationService.createLoan(req.tenantId, req.user.userId, req.body) });
        }
        catch (e) {
            next(e);
        }
    }
    async listMyVariablePay(req, res, next) {
        try {
            res.json({ success: true, ...(await compensation_service_js_1.compensationService.listMyVariablePay(req.tenantId, req.user.userId, req.query)) });
        }
        catch (e) {
            next(e);
        }
    }
    async listMyCTCRevisions(req, res, next) {
        try {
            res.json({ success: true, ...(await compensation_service_js_1.compensationService.listMyCTCRevisions(req.tenantId, req.user.userId, req.query)) });
        }
        catch (e) {
            next(e);
        }
    }
    async createCTCRevision(req, res, next) {
        try {
            res.status(201).json({ success: true, data: await compensation_service_js_1.compensationService.createCTCRevision(req.tenantId, req.user.userId, req.body) });
        }
        catch (e) {
            next(e);
        }
    }
}
exports.CompensationController = CompensationController;
exports.compensationController = new CompensationController();
//# sourceMappingURL=compensation.controller.js.map