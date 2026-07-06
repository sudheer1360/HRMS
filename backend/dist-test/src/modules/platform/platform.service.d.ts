export declare class PlatformService {
    listTickets(tenantId: string, params: any): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: any;
        };
    }>;
    createTicket(tenantId: string, userId: string, input: any): Promise<any>;
    updateTicket(id: string, tenantId: string, input: any): Promise<any>;
    addComment(ticketId: string, tenantId: string, userId: string, comment: string, isInternal: boolean): Promise<{
        id: string;
        ticketId: string;
        comment: string;
        isInternal: boolean;
        createdAt: string;
    }>;
    listComments(ticketId: string, tenantId: string): Promise<{
        data: any[];
    }>;
    submitCSAT(ticketId: string, tenantId: string, rating: number, feedback: string): Promise<{
        ticketId: string;
        rating: number;
        feedback: string;
    }>;
    ticketStats(tenantId: string): Promise<{
        data: any;
    }>;
    askAI(tenantId: string, userId: string, queryText: string): Promise<{
        response: string;
        confidence: number;
        actionTaken: null;
        needsApproval: boolean;
    }>;
    getConversations(tenantId: string, userId: string): Promise<any[]>;
    listWorkflows(tenantId: string): Promise<any[]>;
    createWorkflow(tenantId: string, input: any): Promise<any>;
    toggleWorkflow(id: string, tenantId: string, isActive: boolean): Promise<any>;
    listWorkflowLogs(id: string, tenantId: string): Promise<{
        data: any[];
    }>;
    listReports(tenantId: string, module?: string): Promise<any[]>;
    createReport(tenantId: string, userId: string, input: any): Promise<any>;
    listApiKeys(tenantId: string): Promise<any[]>;
    createApiKey(tenantId: string, userId: string, input: any): Promise<{
        id: string;
        keyName: any;
        prefix: string;
        key: string;
        message: string;
    }>;
    revokeApiKey(id: string, tenantId: string): Promise<{
        message: string;
    }>;
    listWebhooks(tenantId: string): Promise<any[]>;
    createWebhook(tenantId: string, input: any): Promise<any>;
}
export declare class PolicyService {
    list(tenantId: string, params: any): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: any;
        };
    }>;
    create(tenantId: string, userId: string, input: any): Promise<any>;
    getById(id: string, tenantId: string): Promise<any>;
    publish(id: string, tenantId: string): Promise<any>;
    stats(id: string, tenantId: string): Promise<{
        policyId: string;
        totalSent: any;
        acknowledged: any;
        pending: number;
    }>;
    getMyPolicies(tenantId: string, employeeId: string): Promise<any[]>;
    acknowledge(tenantId: string, employeeId: string, policyId: string): Promise<{
        message: string;
    }>;
}
export declare const platformService: PlatformService;
export declare const policyService: PolicyService;
//# sourceMappingURL=platform.service.d.ts.map