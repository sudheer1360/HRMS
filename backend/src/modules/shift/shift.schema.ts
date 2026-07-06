import { z } from 'zod';

export const createShiftSchema = z.object({
  companyId: z.string().min(1),
  shiftName: z.string().min(2).max(100),
  shiftCode: z.string().min(2).max(20),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'HH:MM format'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'HH:MM format'),
  gracePeriodMins: z.number().int().default(15),
  breakMins: z.number().int().default(30),
  isNightShift: z.boolean().default(false),
  isFlexible: z.boolean().default(false),
  otEligible: z.boolean().default(true),
});

export const createRosterSchema = z.object({
  employeeIds: z.array(z.string().min(1)).min(1),
  shiftId: z.string().min(1),
  fromDate: z.coerce.date(),
  toDate: z.coerce.date(),
  rosterType: z.enum(['Fixed', 'Rotating', 'Dynamic']).default('Fixed'),
});

export const shiftFilterSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  companyId: z.string().min(1).optional(),
});

export const overtimeRuleSchema = z.object({
  companyId: z.string().min(1),
  otType: z.enum(['Daily', 'Weekly', 'Holiday', 'Double']),
  rateMultiplier: z.number().min(1).max(5),
  dailyHourCap: z.number().optional(),
  weeklyHourCap: z.number().optional(),
  monthlyHourCap: z.number().optional(),
});

export const overtimeRequestSchema = z.object({
  employeeId: z.string().min(1),
  otDate: z.coerce.date(),
  otHours: z.number().positive().max(24),
  otType: z.enum(['Daily', 'Weekly', 'Holiday', 'Double']),
  reason: z.string().optional(),
});

export const overtimeApprovalSchema = z.object({
  status: z.enum(['Approved', 'Rejected']),
  rejectedReason: z.string().optional(),
});

export type CreateShiftInput = z.infer<typeof createShiftSchema>;
export type CreateRosterInput = z.infer<typeof createRosterSchema>;
export type OvertimeRuleInput = z.infer<typeof overtimeRuleSchema>;
export type OvertimeRequestInput = z.infer<typeof overtimeRequestSchema>;
