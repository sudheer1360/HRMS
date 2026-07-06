import { z } from 'zod';
export declare const createComponentSchema: z.ZodObject<{
    companyId: z.ZodString;
    componentName: z.ZodString;
    componentCode: z.ZodString;
    componentType: z.ZodEnum<["Earning", "Deduction", "Employer Contribution"]>;
    calculationType: z.ZodEnum<["Fixed", "Percentage", "Formula"]>;
    isTaxable: z.ZodDefault<z.ZodBoolean>;
    isPfApplicable: z.ZodDefault<z.ZodBoolean>;
    isEsiApplicable: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    companyId: string;
    componentName: string;
    componentCode: string;
    componentType: "Earning" | "Deduction" | "Employer Contribution";
    calculationType: "Fixed" | "Percentage" | "Formula";
    isTaxable: boolean;
    isPfApplicable: boolean;
    isEsiApplicable: boolean;
}, {
    companyId: string;
    componentName: string;
    componentCode: string;
    componentType: "Earning" | "Deduction" | "Employer Contribution";
    calculationType: "Fixed" | "Percentage" | "Formula";
    isTaxable?: boolean | undefined;
    isPfApplicable?: boolean | undefined;
    isEsiApplicable?: boolean | undefined;
}>;
export declare const createStructureSchema: z.ZodObject<{
    companyId: z.ZodString;
    structureName: z.ZodString;
    structureCode: z.ZodString;
    effectiveDate: z.ZodDate;
    items: z.ZodArray<z.ZodObject<{
        componentId: z.ZodString;
        amountOrPct: z.ZodNumber;
        isPercentage: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        componentId: string;
        amountOrPct: number;
        isPercentage: boolean;
    }, {
        componentId: string;
        amountOrPct: number;
        isPercentage?: boolean | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    companyId: string;
    effectiveDate: Date;
    structureName: string;
    structureCode: string;
    items: {
        componentId: string;
        amountOrPct: number;
        isPercentage: boolean;
    }[];
}, {
    companyId: string;
    effectiveDate: Date;
    structureName: string;
    structureCode: string;
    items: {
        componentId: string;
        amountOrPct: number;
        isPercentage?: boolean | undefined;
    }[];
}>;
export declare const createPayrollRunSchema: z.ZodObject<{
    companyId: z.ZodString;
    periodStart: z.ZodDate;
    periodEnd: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    companyId: string;
    periodStart: Date;
    periodEnd: Date;
}, {
    companyId: string;
    periodStart: Date;
    periodEnd: Date;
}>;
export declare const expenseClaimSchema: z.ZodObject<{
    employeeId: z.ZodString;
    expenseDate: z.ZodDate;
    category: z.ZodEnum<["Travel", "Food", "Accommodation", "Office Supplies", "Client Entertainment", "Other"]>;
    amount: z.ZodNumber;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    employeeId: string;
    category: "Other" | "Travel" | "Food" | "Accommodation" | "Office Supplies" | "Client Entertainment";
    expenseDate: Date;
    amount: number;
    description?: string | undefined;
}, {
    employeeId: string;
    category: "Other" | "Travel" | "Food" | "Accommodation" | "Office Supplies" | "Client Entertainment";
    expenseDate: Date;
    amount: number;
    description?: string | undefined;
}>;
export declare const expenseApprovalSchema: z.ZodObject<{
    status: z.ZodEnum<["Approved", "Rejected"]>;
    rejectedReason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "Approved" | "Rejected";
    rejectedReason?: string | undefined;
}, {
    status: "Approved" | "Rejected";
    rejectedReason?: string | undefined;
}>;
//# sourceMappingURL=payroll.schema.d.ts.map