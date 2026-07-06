"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expenseApprovalSchema = exports.expenseClaimSchema = exports.createPayrollRunSchema = exports.createStructureSchema = exports.createComponentSchema = void 0;
const zod_1 = require("zod");
exports.createComponentSchema = zod_1.z.object({
    companyId: zod_1.z.string().min(1),
    componentName: zod_1.z.string().min(2).max(100),
    componentCode: zod_1.z.string().min(2).max(20),
    componentType: zod_1.z.enum(['Earning', 'Deduction', 'Employer Contribution']),
    calculationType: zod_1.z.enum(['Fixed', 'Percentage', 'Formula']),
    isTaxable: zod_1.z.boolean().default(true),
    isPfApplicable: zod_1.z.boolean().default(false),
    isEsiApplicable: zod_1.z.boolean().default(false),
});
exports.createStructureSchema = zod_1.z.object({
    companyId: zod_1.z.string().min(1),
    structureName: zod_1.z.string().min(2).max(100),
    structureCode: zod_1.z.string().min(2).max(20),
    effectiveDate: zod_1.z.coerce.date(),
    items: zod_1.z.array(zod_1.z.object({
        componentId: zod_1.z.string().min(1),
        amountOrPct: zod_1.z.number().positive(),
        isPercentage: zod_1.z.boolean().default(false),
    })),
});
exports.createPayrollRunSchema = zod_1.z.object({
    companyId: zod_1.z.string().min(1),
    periodStart: zod_1.z.coerce.date(),
    periodEnd: zod_1.z.coerce.date(),
});
exports.expenseClaimSchema = zod_1.z.object({
    employeeId: zod_1.z.string().min(1),
    expenseDate: zod_1.z.coerce.date(),
    category: zod_1.z.enum(['Travel', 'Food', 'Accommodation', 'Office Supplies', 'Client Entertainment', 'Other']),
    amount: zod_1.z.number().positive(),
    description: zod_1.z.string().optional(),
});
exports.expenseApprovalSchema = zod_1.z.object({
    status: zod_1.z.enum(['Approved', 'Rejected']),
    rejectedReason: zod_1.z.string().optional(),
});
//# sourceMappingURL=payroll.schema.js.map