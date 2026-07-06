export declare class AttendanceService {
    clockIn(tenantId: string, employeeId: string, input: any): Promise<any>;
    clockOut(tenantId: string, employeeId: string, input: any): Promise<any>;
    manualEntry(tenantId: string, input: any): Promise<any>;
    updateEntry(id: string, tenantId: string, input: any): Promise<any>;
    listDaily(tenantId: string, params: any): Promise<{
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
    getDailySummary(tenantId: string, date: string): Promise<{
        date: string;
        total: number;
        present: number;
        absent: number;
        late: number;
        halfDay: number;
    }>;
    getMonthlySummary(tenantId: string, employeeId: string, month: number, year: number): Promise<{
        records: any[];
        summary: {
            present: number;
            absent: number;
            halfDay: number;
            workFromHome: number;
            weeklyOff: number;
            holiday: number;
            late: number;
            earlyExit: number;
            totalHours: number;
            totalWorkingDays: number;
        };
    }>;
    submitCorrection(tenantId: string, input: any): Promise<{
        message: string;
        id: string;
    }>;
    listCorrectionRequests(tenantId: string, params: any): Promise<any[]>;
    approveCorrection(id: string, tenantId: string, approverId: string): Promise<{
        message: string;
    }>;
    rejectCorrection(id: string, tenantId: string, approverId: string, reason?: string): Promise<{
        message: string;
    }>;
    lockPeriod(tenantId: string, input: any, userId: string): Promise<{
        message: string;
        id: string;
    }>;
    unlockPeriod(id: string, tenantId: string, userId: string, reason: string): Promise<{
        message: string;
    }>;
    listLocks(tenantId: string, companyId: string): Promise<any[]>;
}
export declare const attendanceService: AttendanceService;
//# sourceMappingURL=attendance.service.d.ts.map