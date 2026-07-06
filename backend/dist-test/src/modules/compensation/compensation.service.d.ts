export declare class CompensationService {
    listReviewCycles(tenantId: string, params: any): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: any;
            totalPages: number;
        };
    }>;
    createReviewCycle(tenantId: string, userId: string, input: any): Promise<any>;
    activateReviewCycle(id: string, tenantId: string): Promise<any>;
    listMyBonuses(tenantId: string, userId: string, params: any): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: any;
            totalPages: number;
        };
    }>;
    createBonus(tenantId: string, userId: string, input: any): Promise<any>;
    listMyLoans(tenantId: string, userId: string, params: any): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: any;
            totalPages: number;
        };
    }>;
    createLoan(tenantId: string, userId: string, input: any): Promise<any>;
    listMyVariablePay(tenantId: string, userId: string, params: any): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: any;
            totalPages: number;
        };
    }>;
    listMyCTCRevisions(tenantId: string, userId: string, params: any): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: any;
            totalPages: number;
        };
    }>;
    createCTCRevision(tenantId: string, userId: string, input: any): Promise<any>;
}
export declare const compensationService: CompensationService;
//# sourceMappingURL=compensation.service.d.ts.map