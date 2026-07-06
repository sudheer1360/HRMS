import { z } from 'zod';
export declare const manualAttendanceSchema: z.ZodObject<{
    employeeId: z.ZodString;
    attendanceDate: z.ZodString;
    inTime: z.ZodOptional<z.ZodString>;
    outTime: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<["Present", "Absent", "Half Day", "Weekly Off", "Holiday", "Work From Home", "On Duty"]>;
    remarks: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    employeeId: string;
    status: "Present" | "Absent" | "Half Day" | "Holiday" | "Work From Home" | "Weekly Off" | "On Duty";
    attendanceDate: string;
    inTime?: string | undefined;
    outTime?: string | undefined;
    remarks?: string | undefined;
}, {
    employeeId: string;
    status: "Present" | "Absent" | "Half Day" | "Holiday" | "Work From Home" | "Weekly Off" | "On Duty";
    attendanceDate: string;
    inTime?: string | undefined;
    outTime?: string | undefined;
    remarks?: string | undefined;
}>;
export declare const correctionRequestSchema: z.ZodObject<{
    employeeId: z.ZodString;
    attendanceDate: z.ZodString;
    requestedStatus: z.ZodEnum<["Present", "Absent", "Half Day", "Work From Home", "On Duty"]>;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    employeeId: string;
    reason: string;
    attendanceDate: string;
    requestedStatus: "Present" | "Absent" | "Half Day" | "Work From Home" | "On Duty";
}, {
    employeeId: string;
    reason: string;
    attendanceDate: string;
    requestedStatus: "Present" | "Absent" | "Half Day" | "Work From Home" | "On Duty";
}>;
export declare const correctionApprovalSchema: z.ZodObject<{
    status: z.ZodEnum<["Approved", "Rejected"]>;
    rejectedReason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "Approved" | "Rejected";
    rejectedReason?: string | undefined;
}, {
    status: "Approved" | "Rejected";
    rejectedReason?: string | undefined;
}>;
export declare const lockAttendanceSchema: z.ZodObject<{
    companyId: z.ZodString;
    branchId: z.ZodOptional<z.ZodString>;
    deptId: z.ZodOptional<z.ZodString>;
    periodStart: z.ZodString;
    periodEnd: z.ZodString;
}, "strip", z.ZodTypeAny, {
    companyId: string;
    periodStart: string;
    periodEnd: string;
    branchId?: string | undefined;
    deptId?: string | undefined;
}, {
    companyId: string;
    periodStart: string;
    periodEnd: string;
    branchId?: string | undefined;
    deptId?: string | undefined;
}>;
export declare const attendanceFilterSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    fromDate: z.ZodOptional<z.ZodString>;
    toDate: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodString>;
    departmentId: z.ZodOptional<z.ZodString>;
    employeeId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    employeeId?: string | undefined;
    status?: string | undefined;
    departmentId?: string | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    employeeId?: string | undefined;
    status?: string | undefined;
    departmentId?: string | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
}>;
export type ManualAttendanceInput = z.infer<typeof manualAttendanceSchema>;
export type CorrectionRequestInput = z.infer<typeof correctionRequestSchema>;
export type AttendanceFilterInput = z.infer<typeof attendanceFilterSchema>;
//# sourceMappingURL=attendance.schema.d.ts.map