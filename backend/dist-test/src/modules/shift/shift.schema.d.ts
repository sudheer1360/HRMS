import { z } from 'zod';
export declare const createShiftSchema: z.ZodObject<{
    companyId: z.ZodString;
    shiftName: z.ZodString;
    shiftCode: z.ZodString;
    startTime: z.ZodString;
    endTime: z.ZodString;
    gracePeriodMins: z.ZodDefault<z.ZodNumber>;
    breakMins: z.ZodDefault<z.ZodNumber>;
    isNightShift: z.ZodDefault<z.ZodBoolean>;
    isFlexible: z.ZodDefault<z.ZodBoolean>;
    otEligible: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    companyId: string;
    shiftName: string;
    shiftCode: string;
    startTime: string;
    endTime: string;
    gracePeriodMins: number;
    breakMins: number;
    isNightShift: boolean;
    isFlexible: boolean;
    otEligible: boolean;
}, {
    companyId: string;
    shiftName: string;
    shiftCode: string;
    startTime: string;
    endTime: string;
    gracePeriodMins?: number | undefined;
    breakMins?: number | undefined;
    isNightShift?: boolean | undefined;
    isFlexible?: boolean | undefined;
    otEligible?: boolean | undefined;
}>;
export declare const createRosterSchema: z.ZodObject<{
    employeeIds: z.ZodArray<z.ZodString, "many">;
    shiftId: z.ZodString;
    fromDate: z.ZodDate;
    toDate: z.ZodDate;
    rosterType: z.ZodDefault<z.ZodEnum<["Fixed", "Rotating", "Dynamic"]>>;
}, "strip", z.ZodTypeAny, {
    fromDate: Date;
    toDate: Date;
    shiftId: string;
    employeeIds: string[];
    rosterType: "Fixed" | "Rotating" | "Dynamic";
}, {
    fromDate: Date;
    toDate: Date;
    shiftId: string;
    employeeIds: string[];
    rosterType?: "Fixed" | "Rotating" | "Dynamic" | undefined;
}>;
export declare const shiftFilterSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    companyId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    companyId?: string | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    companyId?: string | undefined;
}>;
export declare const overtimeRuleSchema: z.ZodObject<{
    companyId: z.ZodString;
    otType: z.ZodEnum<["Daily", "Weekly", "Holiday", "Double"]>;
    rateMultiplier: z.ZodNumber;
    dailyHourCap: z.ZodOptional<z.ZodNumber>;
    weeklyHourCap: z.ZodOptional<z.ZodNumber>;
    monthlyHourCap: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    companyId: string;
    otType: "Weekly" | "Holiday" | "Daily" | "Double";
    rateMultiplier: number;
    dailyHourCap?: number | undefined;
    weeklyHourCap?: number | undefined;
    monthlyHourCap?: number | undefined;
}, {
    companyId: string;
    otType: "Weekly" | "Holiday" | "Daily" | "Double";
    rateMultiplier: number;
    dailyHourCap?: number | undefined;
    weeklyHourCap?: number | undefined;
    monthlyHourCap?: number | undefined;
}>;
export declare const overtimeRequestSchema: z.ZodObject<{
    employeeId: z.ZodString;
    otDate: z.ZodDate;
    otHours: z.ZodNumber;
    otType: z.ZodEnum<["Daily", "Weekly", "Holiday", "Double"]>;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    employeeId: string;
    otType: "Weekly" | "Holiday" | "Daily" | "Double";
    otDate: Date;
    otHours: number;
    reason?: string | undefined;
}, {
    employeeId: string;
    otType: "Weekly" | "Holiday" | "Daily" | "Double";
    otDate: Date;
    otHours: number;
    reason?: string | undefined;
}>;
export declare const overtimeApprovalSchema: z.ZodObject<{
    status: z.ZodEnum<["Approved", "Rejected"]>;
    rejectedReason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "Approved" | "Rejected";
    rejectedReason?: string | undefined;
}, {
    status: "Approved" | "Rejected";
    rejectedReason?: string | undefined;
}>;
export type CreateShiftInput = z.infer<typeof createShiftSchema>;
export type CreateRosterInput = z.infer<typeof createRosterSchema>;
export type OvertimeRuleInput = z.infer<typeof overtimeRuleSchema>;
export type OvertimeRequestInput = z.infer<typeof overtimeRequestSchema>;
//# sourceMappingURL=shift.schema.d.ts.map