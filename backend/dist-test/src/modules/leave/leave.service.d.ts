export declare class LeaveService {
    listLeaveTypes(tenantId: string, companyId: string): Promise<any[]>;
    createLeaveType(tenantId: string, input: any): Promise<any>;
    updateLeaveType(id: string, tenantId: string, input: any): Promise<any>;
    deleteLeaveType(id: string, tenantId: string): Promise<{
        message: string;
    }>;
    createLeavePolicy(tenantId: string, input: any): Promise<any>;
    apply(tenantId: string, employeeId: string, input: any): Promise<{
        message: string;
        totalDays: number;
        applicationId: string;
    }>;
    approve(id: string, tenantId: string, approverId: string): Promise<{
        message: string;
        applicationId: string;
    }>;
    reject(id: string, tenantId: string, approverId: string, reason?: string): Promise<{
        message: string;
        applicationId: string;
    }>;
    cancel(id: string, tenantId: string, userId: string): Promise<{
        message: string;
    }>;
    listApplications(tenantId: string, params: any): Promise<{
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
    getApplication(id: string, tenantId: string): Promise<any>;
    getBalance(tenantId: string, employeeId: string, year?: number): Promise<any[]>;
    initBalances(tenantId: string, companyId: string, year: number): Promise<{
        message: string;
    }>;
    updateBalance(id: string, tenantId: string, input: any): Promise<any>;
    listHolidays(tenantId: string, companyId: string, year: number): Promise<any[]>;
    createHoliday(tenantId: string, input: any): Promise<any>;
    updateHoliday(id: string, tenantId: string, input: any): Promise<any>;
    deleteHoliday(id: string, tenantId: string): Promise<{
        message: string;
    }>;
    getCalendar(tenantId: string, employeeId: string, month: number, year: number): Promise<{
        applications: any[];
        holidays: any[];
    }>;
}
export declare const leaveService: LeaveService;
//# sourceMappingURL=leave.service.d.ts.map