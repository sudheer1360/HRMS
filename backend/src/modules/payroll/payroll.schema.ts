import { z } from 'zod';

export const createComponentSchema = z.object({
  companyId: z.string().min(1),
  componentName: z.string().min(2).max(100),
  componentCode: z.string().min(2).max(20),
  componentType: z.enum(['Earning', 'Deduction', 'Employer Contribution']),
  calculationType: z.enum(['Fixed', 'Percentage', 'Formula']),
  isTaxable: z.boolean().default(true),
  isPfApplicable: z.boolean().default(false),
  isEsiApplicable: z.boolean().default(false),
});

export const createStructureSchema = z.object({
  companyId: z.string().min(1),
  structureName: z.string().min(2).max(100),
  structureCode: z.string().min(2).max(20),
  effectiveDate: z.coerce.date(),
  items: z.array(z.object({
    componentId: z.string().min(1),
    amountOrPct: z.number().positive(),
    isPercentage: z.boolean().default(false),
  })),
});

export const createPayrollRunSchema = z.object({
  companyId: z.string().min(1),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
});

export const expenseClaimSchema = z.object({
  employeeId: z.string().min(1),
  expenseDate: z.coerce.date(),
  category: z.enum(['Travel', 'Food', 'Accommodation', 'Office Supplies', 'Client Entertainment', 'Other']),
  amount: z.number().positive(),
  description: z.string().optional(),
});

export const expenseApprovalSchema = z.object({
  status: z.enum(['Approved', 'Rejected']),
  rejectedReason: z.string().optional(),
});
