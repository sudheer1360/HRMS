"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.travelController = exports.TravelController = void 0;
const travel_service_js_1 = require("./travel.service.js");
class TravelController {
    async listRequests(req, res, next) {
        try {
            res.json({ success: true, ...(await travel_service_js_1.travelService.listRequests(req.tenantId, req.user?.userId, req.query)) });
        }
        catch (e) {
            next(e);
        }
    }
    async createRequest(req, res, next) {
        try {
            res.status(201).json({ success: true, data: await travel_service_js_1.travelService.createRequest(req.tenantId, req.user.userId, req.body) });
        }
        catch (e) {
            next(e);
        }
    }
    async updateRequest(req, res, next) {
        try {
            res.json({ success: true, data: await travel_service_js_1.travelService.updateRequest(req.params.id, req.tenantId, req.body) });
        }
        catch (e) {
            next(e);
        }
    }
    async updateExpense(req, res, next) {
        try {
            res.json({ success: true, data: await travel_service_js_1.travelService.updateExpense(req.params.id, req.tenantId, req.body) });
        }
        catch (e) {
            next(e);
        }
    }
    async listExpenses(req, res, next) {
        try {
            res.json({ success: true, ...(await travel_service_js_1.travelService.listExpenses(req.tenantId, req.user?.userId, req.query)) });
        }
        catch (e) {
            next(e);
        }
    }
    async createExpense(req, res, next) {
        try {
            res.status(201).json({ success: true, data: await travel_service_js_1.travelService.createExpense(req.tenantId, req.user.userId, req.body) });
        }
        catch (e) {
            next(e);
        }
    }
    async listAdvances(req, res, next) {
        try {
            res.json({ success: true, ...(await travel_service_js_1.travelService.listAdvances(req.tenantId, req.user?.userId, req.query)) });
        }
        catch (e) {
            next(e);
        }
    }
    async createAdvance(req, res, next) {
        try {
            res.status(201).json({ success: true, data: await travel_service_js_1.travelService.createAdvance(req.tenantId, req.user.userId, req.body) });
        }
        catch (e) {
            next(e);
        }
    }
}
exports.TravelController = TravelController;
exports.travelController = new TravelController();
//# sourceMappingURL=travel.controller.js.map