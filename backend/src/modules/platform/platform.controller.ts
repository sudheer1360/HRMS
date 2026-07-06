import { Response, NextFunction } from 'express';
import { platformService } from './platform.service.js';
import { createTicketSchema, updateTicketSchema, aiQuerySchema } from './platform.schema.js';
import { AuthenticatedRequest } from '../../common/types/index.js';

export class PlatformController {
  // Tickets
  async listTickets(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { if (req.query.my) (req.query as any).userId = req.user!.userId; const r = await platformService.listTickets(req.tenantId!, req.query); res.json({ success: true, ...r }); } catch (e) { next(e); }
  }
  async createTicket(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { const i = createTicketSchema.parse(req.body); const r = await platformService.createTicket(req.tenantId!, req.user!.userId, i); res.status(201).json({ success: true, data: r }); } catch (e) { next(e); }
  }
  async updateTicket(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { const i = updateTicketSchema.parse(req.body); const r = await platformService.updateTicket(req.params.id, req.tenantId!, i); res.json({ success: true, data: r }); } catch (e) { next(e); }
  }
  async addComment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { const r = await platformService.addComment(req.params.id, req.tenantId!, req.user!.userId, req.body.comment, req.body.isInternal ?? false); res.status(201).json({ success: true, data: r }); } catch (e) { next(e); }
  }
  async listComments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { const r = await platformService.listComments(req.params.id, req.tenantId!); res.json({ success: true, ...r }); } catch (e) { next(e); }
  }
  async submitCSAT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { const r = await platformService.submitCSAT(req.params.id, req.tenantId!, Number(req.body.rating), req.body.feedback ?? ''); res.json({ success: true, data: r }); } catch (e) { next(e); }
  }
  async ticketStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { const r = await platformService.ticketStats(req.tenantId!); res.json({ success: true, ...r }); } catch (e) { next(e); }
  }

  // AI
  async askAI(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { const i = aiQuerySchema.parse(req.body); const r = await platformService.askAI(req.tenantId!, req.user!.userId, i.query); res.json({ success: true, data: r }); } catch (e) { next(e); }
  }
  async getConversations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { const r = await platformService.getConversations(req.tenantId!, req.user!.userId); res.json({ success: true, data: r }); } catch (e) { next(e); }
  }

  // Workflows
  async listWorkflows(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { const r = await platformService.listWorkflows(req.tenantId!); res.json({ success: true, data: r }); } catch (e) { next(e); }
  }
  async createWorkflow(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { const r = await platformService.createWorkflow(req.tenantId!, req.body); res.status(201).json({ success: true, data: r }); } catch (e) { next(e); }
  }
  async toggleWorkflow(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { const r = await platformService.toggleWorkflow(req.params.id, req.tenantId!, req.body.isActive); res.json({ success: true, data: r }); } catch (e) { next(e); }
  }
  async listWorkflowLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { const r = await platformService.listWorkflowLogs(req.params.id, req.tenantId!); res.json({ success: true, ...r }); } catch (e) { next(e); }
  }

  // Reports
  async listReports(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { const r = await platformService.listReports(req.tenantId!, req.query.module as string); res.json({ success: true, data: r }); } catch (e) { next(e); }
  }
  async createReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { const r = await platformService.createReport(req.tenantId!, req.user!.userId, req.body); res.status(201).json({ success: true, data: r }); } catch (e) { next(e); }
  }

  // API Keys
  async listApiKeys(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { const r = await platformService.listApiKeys(req.tenantId!); res.json({ success: true, data: r }); } catch (e) { next(e); }
  }
  async createApiKey(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { const r = await platformService.createApiKey(req.tenantId!, req.user!.userId, req.body); res.status(201).json({ success: true, data: r }); } catch (e) { next(e); }
  }
  async revokeApiKey(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { const r = await platformService.revokeApiKey(req.params.id, req.tenantId!); res.json({ success: true, data: r }); } catch (e) { next(e); }
  }

  // Webhooks
  async listWebhooks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { const r = await platformService.listWebhooks(req.tenantId!); res.json({ success: true, data: r }); } catch (e) { next(e); }
  }
  async createWebhook(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { const r = await platformService.createWebhook(req.tenantId!, req.body); res.status(201).json({ success: true, data: r }); } catch (e) { next(e); }
  }
}

export const platformController = new PlatformController();
