"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.operationsController = exports.OperationsController = void 0;
const operations_service_js_1 = require("./operations.service.js");
const operations_schema_js_1 = require("./operations.schema.js");
class OperationsController {
    // Performance
    async createCycle(req, res, next) { try {
        const i = operations_schema_js_1.createCycleSchema.parse(req.body);
        const r = await operations_service_js_1.operationsService.createCycle(req.tenantId, i);
        res.status(201).json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async listCycles(req, res, next) { try {
        const r = await operations_service_js_1.operationsService.listCycles(req.tenantId, req.params.companyId);
        res.json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async submitSelfReview(req, res, next) { try {
        const i = operations_schema_js_1.submitReviewSchema.parse(req.body);
        const r = await operations_service_js_1.operationsService.submitSelfReview(req.tenantId, req.params.cycleId, req.user.userId, i);
        res.json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async submitManagerReview(req, res, next) { try {
        const i = operations_schema_js_1.submitReviewSchema.parse(req.body);
        const r = await operations_service_js_1.operationsService.submitManagerReview(req.tenantId, req.params.id, i);
        res.json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async listReviews(req, res, next) { try {
        if (req.query.my)
            req.query.employeeId = req.user.userId;
        const r = await operations_service_js_1.operationsService.listReviews(req.tenantId, req.query);
        res.json({ success: true, ...r });
    }
    catch (e) {
        next(e);
    } }
    // Assets
    async createAsset(req, res, next) { try {
        const i = operations_schema_js_1.createAssetSchema.parse(req.body);
        const r = await operations_service_js_1.operationsService.createAsset(req.tenantId, i);
        res.status(201).json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async listAssets(req, res, next) { try {
        if (req.query.my)
            req.query.assignedTo = req.user.userId;
        const r = await operations_service_js_1.operationsService.listAssets(req.tenantId, req.query);
        res.json({ success: true, ...r });
    }
    catch (e) {
        next(e);
    } }
    async allocateAsset(req, res, next) { try {
        const i = operations_schema_js_1.allocateAssetSchema.parse(req.body);
        const r = await operations_service_js_1.operationsService.allocateAsset(req.params.id, req.tenantId, i);
        res.json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async returnAsset(req, res, next) { try {
        const r = await operations_service_js_1.operationsService.returnAsset(req.params.id, req.tenantId);
        res.json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    // Grievance
    async submitGrievance(req, res, next) { try {
        const i = operations_schema_js_1.createGrievanceSchema.parse(req.body);
        const r = await operations_service_js_1.operationsService.submitGrievance(req.tenantId, i);
        res.status(201).json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async listGrievances(req, res, next) { try {
        const r = await operations_service_js_1.operationsService.listGrievances(req.tenantId, req.query);
        res.json({ success: true, ...r });
    }
    catch (e) {
        next(e);
    } }
    // Disciplinary
    async createDisciplinary(req, res, next) { try {
        const i = operations_schema_js_1.createDisciplinarySchema.parse(req.body);
        const r = await operations_service_js_1.operationsService.createDisciplinaryCase(req.tenantId, i);
        res.status(201).json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async listDisciplinary(req, res, next) { try {
        const r = await operations_service_js_1.operationsService.listDisciplinaryCases(req.tenantId, req.query);
        res.json({ success: true, ...r });
    }
    catch (e) {
        next(e);
    } }
    // Exit
    async initiateExit(req, res, next) { try {
        const i = operations_schema_js_1.createExitSchema.parse(req.body);
        const r = await operations_service_js_1.operationsService.initiateExit(req.tenantId, i);
        res.status(201).json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async listExits(req, res, next) { try {
        const r = await operations_service_js_1.operationsService.listExitCases(req.tenantId, req.query);
        res.json({ success: true, ...r });
    }
    catch (e) {
        next(e);
    } }
    async processFnf(req, res, next) { try {
        const r = await operations_service_js_1.operationsService.processFnf(req.params.id, req.tenantId, req.body.fnfAmount);
        res.json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
}
exports.OperationsController = OperationsController;
exports.operationsController = new OperationsController();
//# sourceMappingURL=operations.controller.js.map