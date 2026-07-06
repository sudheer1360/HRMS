import { z } from 'zod';
export declare const createCycleSchema: z.ZodObject<{
    companyId: z.ZodString;
    cycleName: z.ZodString;
    cycleType: z.ZodEnum<["Monthly", "Quarterly", "Half-yearly", "Yearly"]>;
    reviewPeriodStart: z.ZodDate;
    reviewPeriodEnd: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    companyId: string;
    cycleName: string;
    cycleType: "Monthly" | "Quarterly" | "Yearly" | "Half-yearly";
    reviewPeriodStart: Date;
    reviewPeriodEnd: Date;
}, {
    companyId: string;
    cycleName: string;
    cycleType: "Monthly" | "Quarterly" | "Yearly" | "Half-yearly";
    reviewPeriodStart: Date;
    reviewPeriodEnd: Date;
}>;
export declare const submitReviewSchema: z.ZodObject<{
    selfRating: z.ZodOptional<z.ZodNumber>;
    selfComments: z.ZodOptional<z.ZodString>;
    managerRating: z.ZodOptional<z.ZodNumber>;
    managerComments: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    selfRating?: number | undefined;
    selfComments?: string | undefined;
    managerRating?: number | undefined;
    managerComments?: string | undefined;
}, {
    selfRating?: number | undefined;
    selfComments?: string | undefined;
    managerRating?: number | undefined;
    managerComments?: string | undefined;
}>;
export declare const createAssetSchema: z.ZodObject<{
    companyId: z.ZodString;
    assetName: z.ZodString;
    assetCode: z.ZodString;
    category: z.ZodEnum<["Laptop", "Monitor", "Phone", "Vehicle", "Furniture", "Other"]>;
    serialNumber: z.ZodOptional<z.ZodString>;
    purchaseValue: z.ZodOptional<z.ZodNumber>;
    location: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    companyId: string;
    category: "Other" | "Laptop" | "Monitor" | "Phone" | "Vehicle" | "Furniture";
    assetName: string;
    assetCode: string;
    location?: string | undefined;
    serialNumber?: string | undefined;
    purchaseValue?: number | undefined;
}, {
    companyId: string;
    category: "Other" | "Laptop" | "Monitor" | "Phone" | "Vehicle" | "Furniture";
    assetName: string;
    assetCode: string;
    location?: string | undefined;
    serialNumber?: string | undefined;
    purchaseValue?: number | undefined;
}>;
export declare const allocateAssetSchema: z.ZodObject<{
    assignedTo: z.ZodString;
    assignedDate: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    assignedTo: string;
    assignedDate?: Date | undefined;
}, {
    assignedTo: string;
    assignedDate?: Date | undefined;
}>;
export declare const createGrievanceSchema: z.ZodObject<{
    complaintType: z.ZodEnum<["Harassment", "Discrimination", "Unfair Treatment", "POSH", "Other"]>;
    respondentId: z.ZodOptional<z.ZodString>;
    isAnonymous: z.ZodDefault<z.ZodBoolean>;
    description: z.ZodString;
}, "strip", z.ZodTypeAny, {
    description: string;
    complaintType: "Other" | "Harassment" | "Discrimination" | "Unfair Treatment" | "POSH";
    isAnonymous: boolean;
    respondentId?: string | undefined;
}, {
    description: string;
    complaintType: "Other" | "Harassment" | "Discrimination" | "Unfair Treatment" | "POSH";
    respondentId?: string | undefined;
    isAnonymous?: boolean | undefined;
}>;
export declare const createDisciplinarySchema: z.ZodObject<{
    employeeId: z.ZodString;
    incidentDate: z.ZodDate;
    incidentDesc: z.ZodString;
    actionType: z.ZodOptional<z.ZodEnum<["Warning", "Written Warning", "Final Warning", "Suspension", "Termination"]>>;
}, "strip", z.ZodTypeAny, {
    employeeId: string;
    incidentDate: Date;
    incidentDesc: string;
    actionType?: "Warning" | "Written Warning" | "Final Warning" | "Suspension" | "Termination" | undefined;
}, {
    employeeId: string;
    incidentDate: Date;
    incidentDesc: string;
    actionType?: "Warning" | "Written Warning" | "Final Warning" | "Suspension" | "Termination" | undefined;
}>;
export declare const createExitSchema: z.ZodObject<{
    employeeId: z.ZodString;
    exitType: z.ZodEnum<["Resignation", "Termination", "Retirement"]>;
    resignationDate: z.ZodDate;
    lastWorkingDay: z.ZodDate;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    employeeId: string;
    exitType: "Termination" | "Resignation" | "Retirement";
    resignationDate: Date;
    lastWorkingDay: Date;
    reason?: string | undefined;
}, {
    employeeId: string;
    exitType: "Termination" | "Resignation" | "Retirement";
    resignationDate: Date;
    lastWorkingDay: Date;
    reason?: string | undefined;
}>;
//# sourceMappingURL=operations.schema.d.ts.map