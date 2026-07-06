import { z } from 'zod';
export declare const createPolicySchema: z.ZodObject<{
    companyId: z.ZodString;
    title: z.ZodString;
    policyCode: z.ZodString;
    category: z.ZodEnum<["General", "Leave", "Attendance", "Payroll", "Code of Conduct", "IT", "Safety", "Benefits", "Travel", "Other"]>;
    content: z.ZodString;
    effectiveDate: z.ZodDate;
    reviewDate: z.ZodOptional<z.ZodDate>;
    requiresAcknowledgement: z.ZodDefault<z.ZodBoolean>;
    requiresQuiz: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    companyId: string;
    effectiveDate: Date;
    category: "Other" | "General" | "Leave" | "Attendance" | "Payroll" | "Code of Conduct" | "IT" | "Safety" | "Benefits" | "Travel";
    title: string;
    policyCode: string;
    content: string;
    requiresAcknowledgement: boolean;
    requiresQuiz: boolean;
    reviewDate?: Date | undefined;
}, {
    companyId: string;
    effectiveDate: Date;
    category: "Other" | "General" | "Leave" | "Attendance" | "Payroll" | "Code of Conduct" | "IT" | "Safety" | "Benefits" | "Travel";
    title: string;
    policyCode: string;
    content: string;
    reviewDate?: Date | undefined;
    requiresAcknowledgement?: boolean | undefined;
    requiresQuiz?: boolean | undefined;
}>;
export declare const acknowledgeSchema: z.ZodObject<{
    policyId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    policyId: string;
}, {
    policyId: string;
}>;
export type CreatePolicyInput = z.infer<typeof createPolicySchema>;
//# sourceMappingURL=policy.schema.d.ts.map