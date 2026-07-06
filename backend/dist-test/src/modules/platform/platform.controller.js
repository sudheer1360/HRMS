"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.platformController = exports.PlatformController = void 0;
const platform_service_js_1 = require("./platform.service.js");
const platform_schema_js_1 = require("./platform.schema.js");
class PlatformController {
    // Tickets
    async listTickets(req, res, next) {
        try {
            if (req.query.my)
                req.query.userId = req.user.userId;
            const r = await platform_service_js_1.platformService.listTickets(req.tenantId, req.query);
            res.json({ success: true, ...r });
        }
        catch (e) {
            next(e);
        }
    }
    async createTicket(req, res, next) {
        try {
            const i = platform_schema_js_1.createTicketSchema.parse(req.body);
            const r = await platform_service_js_1.platformService.createTicket(req.tenantId, req.user.userId, i);
            res.status(201).json({ success: true, data: r });
        }
        catch (e) {
            next(e);
        }
    }
    async updateTicket(req, res, next) {
        try {
            const i = platform_schema_js_1.updateTicketSchema.parse(req.body);
            const r = await platform_service_js_1.platformService.updateTicket(req.params.id, req.tenantId, i);
            res.json({ success: true, data: r });
        }
        catch (e) {
            next(e);
        }
    }
    async addComment(req, res, next) {
        try {
            const r = await platform_service_js_1.platformService.addComment(req.params.id, req.tenantId, req.user.userId, req.body.comment, req.body.isInternal ?? false);
            res.status(201).json({ success: true, data: r });
        }
        catch (e) {
            next(e);
        }
    }
    async listComments(req, res, next) {
        try {
            const r = await platform_service_js_1.platformService.listComments(req.params.id, req.tenantId);
            res.json({ success: true, ...r });
        }
        catch (e) {
            next(e);
        }
    }
    async submitCSAT(req, res, next) {
        try {
            const r = await platform_service_js_1.platformService.submitCSAT(req.params.id, req.tenantId, Number(req.body.rating), req.body.feedback ?? '');
            res.json({ success: true, data: r });
        }
        catch (e) {
            next(e);
        }
    }
    async ticketStats(req, res, next) {
        try {
            const r = await platform_service_js_1.platformService.ticketStats(req.tenantId);
            res.json({ success: true, ...r });
        }
        catch (e) {
            next(e);
        }
    }
    // AI
    async askAI(req, res, next) {
        try {
            const i = platform_schema_js_1.aiQuerySchema.parse(req.body);
            const r = await platform_service_js_1.platformService.askAI(req.tenantId, req.user.userId, i.query);
            res.json({ success: true, data: r });
        }
        catch (e) {
            next(e);
        }
    }
    async getConversations(req, res, next) {
        try {
            const r = await platform_service_js_1.platformService.getConversations(req.tenantId, req.user.userId);
            res.json({ success: true, data: r });
        }
        catch (e) {
            next(e);
        }
    }
    // Workflows
    async listWorkflows(req, res, next) {
        try {
            const r = await platform_service_js_1.platformService.listWorkflows(req.tenantId);
            res.json({ success: true, data: r });
        }
        catch (e) {
            next(e);
        }
    }
    async createWorkflow(req, res, next) {
        try {
            const r = await platform_service_js_1.platformService.createWorkflow(req.tenantId, req.body);
            res.status(201).json({ success: true, data: r });
        }
        catch (e) {
            next(e);
        }
    }
    async toggleWorkflow(req, res, next) {
        try {
            const r = await platform_service_js_1.platformService.toggleWorkflow(req.params.id, req.tenantId, req.body.isActive);
            res.json({ success: true, data: r });
        }
        catch (e) {
            next(e);
        }
    }
    async listWorkflowLogs(req, res, next) {
        try {
            const r = await platform_service_js_1.platformService.listWorkflowLogs(req.params.id, req.tenantId);
            res.json({ success: true, ...r });
        }
        catch (e) {
            next(e);
        }
    }
    // Reports
    async listReports(req, res, next) {
        try {
            const r = await platform_service_js_1.platformService.listReports(req.tenantId, req.query.module);
            res.json({ success: true, data: r });
        }
        catch (e) {
            next(e);
        }
    }
    async createReport(req, res, next) {
        try {
            const r = await platform_service_js_1.platformService.createReport(req.tenantId, req.user.userId, req.body);
            res.status(201).json({ success: true, data: r });
        }
        catch (e) {
            next(e);
        }
    }
    // API Keys
    async listApiKeys(req, res, next) {
        try {
            const r = await platform_service_js_1.platformService.listApiKeys(req.tenantId);
            res.json({ success: true, data: r });
        }
        catch (e) {
            next(e);
        }
    }
    async createApiKey(req, res, next) {
        try {
            const r = await platform_service_js_1.platformService.createApiKey(req.tenantId, req.user.userId, req.body);
            res.status(201).json({ success: true, data: r });
        }
        catch (e) {
            next(e);
        }
    }
    async revokeApiKey(req, res, next) {
        try {
            const r = await platform_service_js_1.platformService.revokeApiKey(req.params.id, req.tenantId);
            res.json({ success: true, data: r });
        }
        catch (e) {
            next(e);
        }
    }
    // Webhooks
    async listWebhooks(req, res, next) {
        try {
            const r = await platform_service_js_1.platformService.listWebhooks(req.tenantId);
            res.json({ success: true, data: r });
        }
        catch (e) {
            next(e);
        }
    }
    async createWebhook(req, res, next) {
        try {
            const r = await platform_service_js_1.platformService.createWebhook(req.tenantId, req.body);
            res.status(201).json({ success: true, data: r });
        }
        catch (e) {
            next(e);
        }
    }
}
exports.PlatformController = PlatformController;
exports.platformController = new PlatformController();
//# sourceMappingURL=platform.controller.js.map