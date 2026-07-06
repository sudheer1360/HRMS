export declare class TravelService {
    listRequests(tenantId: string, userId: string | undefined, params: any): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: any;
            totalPages: number;
        };
    }>;
    createRequest(tenantId: string, userId: string, input: any): Promise<any>;
    updateRequest(id: string, tenantId: string, input: any): Promise<any>;
    listExpenses(tenantId: string, userId: string | undefined, params: any): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: any;
            totalPages: number;
        };
    }>;
    updateExpense(id: string, tenantId: string, input: any): Promise<any>;
    createExpense(tenantId: string, userId: string, input: any): Promise<any>;
    listAdvances(tenantId: string, userId: string | undefined, params: any): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: any;
            totalPages: number;
        };
    }>;
    createAdvance(tenantId: string, userId: string, input: any): Promise<any>;
}
export declare const travelService: TravelService;
//# sourceMappingURL=travel.service.d.ts.map