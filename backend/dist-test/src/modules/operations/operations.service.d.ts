export declare class PerformanceService {
    listCycles(tenantId: string, companyId: string): Promise<any[]>;
    createCycle(tenantId: string, input: any): Promise<any>;
    listReviews(tenantId: string, params: any): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: any;
        };
    }>;
    submitSelfReview(tenantId: string, cycleId: string, employeeId: string, input: any): Promise<any>;
    submitManagerReview(tenantId: string, reviewId: string, input: any): Promise<any>;
}
export declare class AssetService {
    listAssets(tenantId: string, params: any): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: any;
        };
    }>;
    createAsset(tenantId: string, input: any): Promise<any>;
    allocateAsset(assetId: string, tenantId: string, input: any): Promise<any>;
    returnAsset(assetId: string, tenantId: string): Promise<{
        message: string;
    }>;
}
export declare class GrievanceService {
    listGrievances(tenantId: string, params: any): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: any;
        };
    }>;
    submitGrievance(tenantId: string, input: any): Promise<any>;
}
export declare class DisciplinaryService {
    listDisciplinaryCases(tenantId: string, params: any): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: any;
        };
    }>;
    createDisciplinaryCase(tenantId: string, input: any): Promise<any>;
}
export declare class ExitService {
    listExitCases(tenantId: string, params: any): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: any;
        };
    }>;
    initiateExit(tenantId: string, input: any): Promise<any>;
    processFnf(id: string, tenantId: string, fnfAmount: number): Promise<any>;
}
declare class OperationsService {
    private perf;
    private asset;
    private grievance;
    private disc;
    private exit;
    listCycles(t: string, c: string): Promise<any[]>;
    createCycle(t: string, i: any): Promise<any>;
    listReviews(t: string, p: any): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: any;
        };
    }>;
    submitSelfReview(t: string, c: string, e: string, i: any): Promise<any>;
    submitManagerReview(t: string, r: string, i: any): Promise<any>;
    listAssets(t: string, p: any): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: any;
        };
    }>;
    createAsset(t: string, i: any): Promise<any>;
    allocateAsset(id: string, t: string, i: any): Promise<any>;
    returnAsset(id: string, t: string): Promise<{
        message: string;
    }>;
    listGrievances(t: string, p: any): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: any;
        };
    }>;
    submitGrievance(t: string, i: any): Promise<any>;
    listDisciplinaryCases(t: string, p: any): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: any;
        };
    }>;
    createDisciplinaryCase(t: string, i: any): Promise<any>;
    listExitCases(t: string, p: any): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: any;
        };
    }>;
    initiateExit(t: string, i: any): Promise<any>;
    processFnf(id: string, t: string, a: number): Promise<any>;
}
export declare const operationsService: OperationsService;
export {};
//# sourceMappingURL=operations.service.d.ts.map