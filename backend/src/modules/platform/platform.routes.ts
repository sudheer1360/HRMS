import { Router } from 'express';
import { platformController } from './platform.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { rbac } from '../../middleware/rbac.js';

const router = Router();
router.use(authenticate);

// Helpdesk
router.get('/tickets/my', (req, res, next) => { req.query.my = 'true'; platformController.listTickets(req, res, next); });
router.get('/tickets/stats', rbac('TICKET', 'VIEW'), (req, res, next) => platformController.ticketStats(req, res, next));
router.get('/tickets', rbac('TICKET', 'VIEW'), (req, res, next) => platformController.listTickets(req, res, next));
router.post('/tickets', (req, res, next) => platformController.createTicket(req, res, next));
router.patch('/tickets/:id', rbac('TICKET', 'EDIT'), (req, res, next) => platformController.updateTicket(req, res, next));
router.get('/tickets/:id/comments', (req, res, next) => platformController.listComments(req, res, next));
router.post('/tickets/:id/comments', (req, res, next) => platformController.addComment(req, res, next));
router.post('/tickets/:id/csat', (req, res, next) => platformController.submitCSAT(req, res, next));

// AI Assistant
router.post('/ai/ask', (req, res, next) => platformController.askAI(req, res, next));
router.get('/ai/conversations', (req, res, next) => platformController.getConversations(req, res, next));

// Automation
router.get('/automation/workflows', rbac('AUTO', 'VIEW'), (req, res, next) => platformController.listWorkflows(req, res, next));
router.post('/automation/workflows', rbac('AUTO', 'CREATE'), (req, res, next) => platformController.createWorkflow(req, res, next));
router.patch('/automation/workflows/:id', rbac('AUTO', 'EDIT'), (req, res, next) => platformController.toggleWorkflow(req, res, next));
router.get('/automation/workflows/:id/logs', rbac('AUTO', 'VIEW'), (req, res, next) => platformController.listWorkflowLogs(req, res, next));

// Reports
router.get('/reports', (req, res, next) => platformController.listReports(req, res, next));
router.post('/reports', rbac('REPORT', 'CREATE'), (req, res, next) => platformController.createReport(req, res, next));

// API Integration
router.get('/api-keys', rbac('API', 'VIEW'), (req, res, next) => platformController.listApiKeys(req, res, next));
router.post('/api-keys', rbac('API', 'CREATE'), (req, res, next) => platformController.createApiKey(req, res, next));
router.delete('/api-keys/:id', rbac('API', 'DELETE'), (req, res, next) => platformController.revokeApiKey(req, res, next));
router.get('/webhooks', rbac('API', 'VIEW'), (req, res, next) => platformController.listWebhooks(req, res, next));
router.post('/webhooks', rbac('API', 'CREATE'), (req, res, next) => platformController.createWebhook(req, res, next));

export default router;
