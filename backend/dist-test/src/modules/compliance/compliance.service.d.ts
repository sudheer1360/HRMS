export declare class ComplianceService {
    listCalendarEvents(tenantId: string, params: any): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: any;
            totalPages: number;
        };
    }>;
    createCalendarEvent(tenantId: string, userId: string, input: any): Promise<any>;
    listFilings(tenantId: string, params: any): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: any;
            totalPages: number;
        };
    }>;
    createFiling(tenantId: string, userId: string, input: any): Promise<any>;
    listReports(tenantId: string, params: any): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: any;
            totalPages: number;
        };
    }>;
    listChecklist(tenantId: string, params: any): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: any;
            totalPages: number;
        };
    }>;
    updateChecklistItem(id: string, tenantId: string, input: any): Promise<any>;
    listDocuments(tenantId: string, params: any): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: any;
            totalPages: number;
        };
    }>;
    createDocument(tenantId: string, userId: string, input: any): Promise<any>;
}
export declare const complianceService: ComplianceService;
//# sourceMappingURL=compliance.service.d.ts.map