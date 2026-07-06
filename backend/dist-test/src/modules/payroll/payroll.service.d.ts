export declare class PayrollService {
    listComponents(tenantId: string, companyId: string): Promise<any[]>;
    createComponent(tenantId: string, input: any): Promise<any>;
    listStructuresAll(tenantId: string, params: any): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: any;
        };
    }>;
    listStructures(tenantId: string, companyId: string): Promise<any[]>;
    createStructure(tenantId: string, input: any): Promise<any>;
    listRuns(tenantId: string, params: any): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: any;
        };
    }>;
    createRun(tenantId: string, userId: string, input: any): Promise<any>;
    processRun(id: string, tenantId: string, userId: string): Promise<any>;
    approveRun(id: string, tenantId: string, userId: string): Promise<any>;
    getPayslips(tenantId: string, employeeId: string): Promise<any[]>;
}
export declare class ExpenseService {
    listClaims(tenantId: string, params: any): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: any;
        };
    }>;
    submitClaim(tenantId: string, input: any): Promise<any>;
    approveClaim(id: string, tenantId: string, approvedBy: string): Promise<any>;
    rejectClaim(id: string, tenantId: string, rejectedBy: string, reason?: string): Promise<any>;
}
export declare const payrollService: PayrollService;
export declare const expenseService: ExpenseService;
//# sourceMappingURL=payroll.service.d.ts.map