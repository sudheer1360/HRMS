import { z } from 'zod';
export declare const createLeaveTypeSchema: z.ZodObject<{
    companyId: z.ZodString;
    leaveName: z.ZodString;
    leaveCode: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    isPaid: z.ZodEffects<z.ZodBoolean, boolean, unknown>;
    requiresApproval: z.ZodEffects<z.ZodBoolean, boolean, unknown>;
    minDurationDays: z.ZodDefault<z.ZodNumber>;
    allowEncashment: z.ZodEffects<z.ZodBoolean, boolean, unknown>;
}, "strip", z.ZodTypeAny, {
    companyId: string;
    leaveName: string;
    leaveCode: string;
    isPaid: boolean;
    requiresApproval: boolean;
    minDurationDays: number;
    allowEncashment: boolean;
    description?: string | undefined;
}, {
    companyId: string;
    leaveName: string;
    leaveCode: string;
    description?: string | undefined;
    isPaid?: unknown;
    requiresApproval?: unknown;
    minDurationDays?: number | undefined;
    allowEncashment?: unknown;
}>;
export declare const createLeavePolicySchema: z.ZodObject<{
    companyId: z.ZodString;
    leaveTypeId: z.ZodString;
    annualQuota: z.ZodNumber;
    accrualFrequency: z.ZodDefault<z.ZodEnum<["Monthly", "Quarterly", "Yearly"]>>;
    carryForwardLimit: z.ZodOptional<z.ZodNumber>;
    sandwichRule: z.ZodDefault<z.ZodBoolean>;
    minServiceDays: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    companyId: string;
    leaveTypeId: string;
    annualQuota: number;
    accrualFrequency: "Monthly" | "Quarterly" | "Yearly";
    sandwichRule: boolean;
    minServiceDays: number;
    carryForwardLimit?: number | undefined;
}, {
    companyId: string;
    leaveTypeId: string;
    annualQuota: number;
    accrualFrequency?: "Monthly" | "Quarterly" | "Yearly" | undefined;
    carryForwardLimit?: number | undefined;
    sandwichRule?: boolean | undefined;
    minServiceDays?: number | undefined;
}>;
export declare const applyLeaveSchema: z.ZodEffects<z.ZodObject<{
    leaveTypeId: z.ZodString;
    fromDate: z.ZodString;
    toDate: z.ZodString;
    reason: z.ZodOptional<z.ZodString>;
    contactDuringLeave: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fromDate: string;
    toDate: string;
    leaveTypeId: string;
    reason?: string | undefined;
    contactDuringLeave?: string | undefined;
}, {
    fromDate: string;
    toDate: string;
    leaveTypeId: string;
    reason?: string | undefined;
    contactDuringLeave?: string | undefined;
}>, {
    fromDate: string;
    toDate: string;
    leaveTypeId: string;
    reason?: string | undefined;
    contactDuringLeave?: string | undefined;
}, {
    fromDate: string;
    toDate: string;
    leaveTypeId: string;
    reason?: string | undefined;
    contactDuringLeave?: string | undefined;
}>;
export declare const leaveApprovalSchema: z.ZodObject<{
    status: z.ZodEnum<["Approved", "Rejected"]>;
    rejectedReason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "Approved" | "Rejected";
    rejectedReason?: string | undefined;
}, {
    status: "Approved" | "Rejected";
    rejectedReason?: string | undefined;
}>;
export declare const leaveFilterSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    status: z.ZodOptional<z.ZodString>;
    leaveTypeId: z.ZodOptional<z.ZodString>;
    employeeId: z.ZodOptional<z.ZodString>;
    fromDate: z.ZodOptional<z.ZodString>;
    toDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    employeeId?: string | undefined;
    status?: string | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
    leaveTypeId?: string | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    employeeId?: string | undefined;
    status?: string | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
    leaveTypeId?: string | undefined;
}>;
export type CreateLeaveTypeInput = z.infer<typeof createLeaveTypeSchema>;
export type ApplyLeaveInput = z.infer<typeof applyLeaveSchema>;
export type LeaveFilterInput = z.infer<typeof leaveFilterSchema>;
//# sourceMappingURL=leave.schema.d.ts.map