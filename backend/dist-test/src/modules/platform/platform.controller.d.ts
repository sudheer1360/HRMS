import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../common/types/index.js';
export declare class PlatformController {
    listTickets(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    createTicket(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateTicket(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    addComment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listComments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    submitCSAT(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    ticketStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    askAI(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getConversations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listWorkflows(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    createWorkflow(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    toggleWorkflow(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listWorkflowLogs(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listReports(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    createReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listApiKeys(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    createApiKey(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    revokeApiKey(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listWebhooks(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    createWebhook(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const platformController: PlatformController;
//# sourceMappingURL=platform.controller.d.ts.map