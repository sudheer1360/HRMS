import { z } from 'zod';

const boolCoerce = (defaultVal: boolean) =>
  z.preprocess(v => (v === 'true' || v === true ? true : v === 'false' || v === false ? false : defaultVal), z.boolean());

export const createLeaveTypeSchema = z.object({
  companyId: z.string().min(1),
  leaveName: z.string().min(2).max(100),
  leaveCode: z.string().min(2).max(20),
  description: z.string().optional(),
  isPaid: boolCoerce(true),
  requiresApproval: boolCoerce(true),
  minDurationDays: z.coerce.number().min(0.5).default(0.5),
  allowEncashment: boolCoerce(false),
});

export const createLeavePolicySchema = z.object({
  companyId: z.string().min(1),
  leaveTypeId: z.string().min(1),
  annualQuota: z.number().positive(),
  accrualFrequency: z.enum(['Monthly', 'Quarterly', 'Yearly']).default('Monthly'),
  carryForwardLimit: z.number().optional(),
  sandwichRule: z.boolean().default(false),
  minServiceDays: z.number().int().default(0),
});

export const applyLeaveSchema = z.object({
  leaveTypeId: z.string().min(1),
  fromDate: z.string().min(1, 'Required'),
  toDate: z.string().min(1, 'Required'),
  reason: z.string().optional(),
  contactDuringLeave: z.string().optional(),
}).refine(data => data.toDate >= data.fromDate, {
  message: 'To date must be on or after from date',
  path: ['toDate'],
});

export const leaveApprovalSchema = z.object({
  status: z.enum(['Approved', 'Rejected']),
  rejectedReason: z.string().optional(),
});

export const leaveFilterSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.string().optional(),
  leaveTypeId: z.string().min(1).optional(),
  employeeId: z.string().min(1).optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

export type CreateLeaveTypeInput = z.infer<typeof createLeaveTypeSchema>;
export type ApplyLeaveInput = z.infer<typeof applyLeaveSchema>;
export type LeaveFilterInput = z.infer<typeof leaveFilterSchema>;
