"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const platform_controller_js_1 = require("./platform.controller.js");
const auth_js_1 = require("../../middleware/auth.js");
const rbac_js_1 = require("../../middleware/rbac.js");
const router = (0, express_1.Router)();
router.use(auth_js_1.authenticate);
// Helpdesk
router.get('/tickets/my', (req, res, next) => { req.query.my = 'true'; platform_controller_js_1.platformController.listTickets(req, res, next); });
router.get('/tickets/stats', (0, rbac_js_1.rbac)('TICKET', 'VIEW'), (req, res, next) => platform_controller_js_1.platformController.ticketStats(req, res, next));
router.get('/tickets', (0, rbac_js_1.rbac)('TICKET', 'VIEW'), (req, res, next) => platform_controller_js_1.platformController.listTickets(req, res, next));
router.post('/tickets', (req, res, next) => platform_controller_js_1.platformController.createTicket(req, res, next));
router.patch('/tickets/:id', (0, rbac_js_1.rbac)('TICKET', 'EDIT'), (req, res, next) => platform_controller_js_1.platformController.updateTicket(req, res, next));
router.get('/tickets/:id/comments', (req, res, next) => platform_controller_js_1.platformController.listComments(req, res, next));
router.post('/tickets/:id/comments', (req, res, next) => platform_controller_js_1.platformController.addComment(req, res, next));
router.post('/tickets/:id/csat', (req, res, next) => platform_controller_js_1.platformController.submitCSAT(req, res, next));
// AI Assistant
router.post('/ai/ask', (req, res, next) => platform_controller_js_1.platformController.askAI(req, res, next));
router.get('/ai/conversations', (req, res, next) => platform_controller_js_1.platformController.getConversations(req, res, next));
// Automation
router.get('/automation/workflows', (0, rbac_js_1.rbac)('AUTO', 'VIEW'), (req, res, next) => platform_controller_js_1.platformController.listWorkflows(req, res, next));
router.post('/automation/workflows', (0, rbac_js_1.rbac)('AUTO', 'CREATE'), (req, res, next) => platform_controller_js_1.platformController.createWorkflow(req, res, next));
router.patch('/automation/workflows/:id', (0, rbac_js_1.rbac)('AUTO', 'EDIT'), (req, res, next) => platform_controller_js_1.platformController.toggleWorkflow(req, res, next));
router.get('/automation/workflows/:id/logs', (0, rbac_js_1.rbac)('AUTO', 'VIEW'), (req, res, next) => platform_controller_js_1.platformController.listWorkflowLogs(req, res, next));
// Reports
router.get('/reports', (req, res, next) => platform_controller_js_1.platformController.listReports(req, res, next));
router.post('/reports', (0, rbac_js_1.rbac)('REPORT', 'CREATE'), (req, res, next) => platform_controller_js_1.platformController.createReport(req, res, next));
// API Integration
router.get('/api-keys', (0, rbac_js_1.rbac)('API', 'VIEW'), (req, res, next) => platform_controller_js_1.platformController.listApiKeys(req, res, next));
router.post('/api-keys', (0, rbac_js_1.rbac)('API', 'CREATE'), (req, res, next) => platform_controller_js_1.platformController.createApiKey(req, res, next));
router.delete('/api-keys/:id', (0, rbac_js_1.rbac)('API', 'DELETE'), (req, res, next) => platform_controller_js_1.platformController.revokeApiKey(req, res, next));
router.get('/webhooks', (0, rbac_js_1.rbac)('API', 'VIEW'), (req, res, next) => platform_controller_js_1.platformController.listWebhooks(req, res, next));
router.post('/webhooks', (0, rbac_js_1.rbac)('API', 'CREATE'), (req, res, next) => platform_controller_js_1.platformController.createWebhook(req, res, next));
exports.default = router;
//# sourceMappingURL=platform.routes.js.map