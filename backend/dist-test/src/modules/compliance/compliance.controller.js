"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.complianceController = exports.ComplianceController = void 0;
const compliance_service_js_1 = require("./compliance.service.js");
class ComplianceController {
    async listCalendar(req, res, next) {
        try {
            res.json({ success: true, ...(await compliance_service_js_1.complianceService.listCalendarEvents(req.tenantId, req.query)) });
        }
        catch (e) {
            next(e);
        }
    }
    async createCalendarEvent(req, res, next) {
        try {
            res.status(201).json({ success: true, data: await compliance_service_js_1.complianceService.createCalendarEvent(req.tenantId, req.user.userId, req.body) });
        }
        catch (e) {
            next(e);
        }
    }
    async listFilings(req, res, next) {
        try {
            res.json({ success: true, ...(await compliance_service_js_1.complianceService.listFilings(req.tenantId, req.query)) });
        }
        catch (e) {
            next(e);
        }
    }
    async createFiling(req, res, next) {
        try {
            res.status(201).json({ success: true, data: await compliance_service_js_1.complianceService.createFiling(req.tenantId, req.user.userId, req.body) });
        }
        catch (e) {
            next(e);
        }
    }
    async listReports(req, res, next) {
        try {
            res.json({ success: true, ...(await compliance_service_js_1.complianceService.listReports(req.tenantId, req.query)) });
        }
        catch (e) {
            next(e);
        }
    }
    async listChecklist(req, res, next) {
        try {
            res.json({ success: true, ...(await compliance_service_js_1.complianceService.listChecklist(req.tenantId, req.query)) });
        }
        catch (e) {
            next(e);
        }
    }
    async updateChecklistItem(req, res, next) {
        try {
            res.json({ success: true, data: await compliance_service_js_1.complianceService.updateChecklistItem(req.params.id, req.tenantId, req.body) });
        }
        catch (e) {
            next(e);
        }
    }
    async listDocuments(req, res, next) {
        try {
            res.json({ success: true, ...(await compliance_service_js_1.complianceService.listDocuments(req.tenantId, req.query)) });
        }
        catch (e) {
            next(e);
        }
    }
    async createDocument(req, res, next) {
        try {
            res.status(201).json({ success: true, data: await compliance_service_js_1.complianceService.createDocument(req.tenantId, req.user.userId, req.body) });
        }
        catch (e) {
            next(e);
        }
    }
}
exports.ComplianceController = ComplianceController;
exports.complianceController = new ComplianceController();
//# sourceMappingURL=compliance.controller.js.map