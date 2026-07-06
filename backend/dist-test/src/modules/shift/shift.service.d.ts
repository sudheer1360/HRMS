export declare class ShiftService {
    listShifts(tenantId: string, companyId: string): Promise<any[]>;
    createShift(tenantId: string, input: any): Promise<any>;
    updateShift(id: string, tenantId: string, input: any): Promise<any>;
    deleteShift(id: string, tenantId: string): Promise<{
        message: string;
    }>;
    listRosters(tenantId: string, params: any): Promise<any[]>;
    assignRoster(tenantId: string, input: any): Promise<any>;
    updateRoster(id: string, tenantId: string, input: any): Promise<any>;
    deleteRoster(id: string, tenantId: string): Promise<{
        message: string;
    }>;
    getEmployeeShift(tenantId: string, employeeId: string, date?: string): Promise<any>;
}
export declare class OvertimeService {
    listRequests(tenantId: string, params: any): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: any;
            totalPages: number;
        };
    }>;
    submitRequest(tenantId: string, input: any): Promise<any>;
    approveRequest(id: string, tenantId: string, approverId: string): Promise<{
        message: string;
    }>;
    rejectRequest(id: string, tenantId: string, approverId: string, reason?: string): Promise<{
        message: string;
    }>;
}
export declare const shiftService: ShiftService;
export declare const overtimeService: OvertimeService;
//# sourceMappingURL=shift.service.d.ts.map