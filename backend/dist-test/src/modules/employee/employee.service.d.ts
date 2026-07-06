export declare class EmployeeService {
    list(tenantId: string, params: any): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: any;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    getById(id: string, tenantId: string): Promise<any>;
    create(tenantId: string, userId: string, input: any): Promise<any>;
    update(id: string, tenantId: string, input: any): Promise<any>;
    delete(id: string, tenantId: string): Promise<{
        message: string;
    }>;
    changeStatus(id: string, tenantId: string, userId: string, newStatus: string, reason?: string): Promise<any>;
    private encrypt;
}
export declare const employeeService: EmployeeService;
//# sourceMappingURL=employee.service.d.ts.map