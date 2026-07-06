import { z } from 'zod';

export const createCycleSchema = z.object({
  companyId: z.string().min(1),
  cycleName: z.string().min(2),
  cycleType: z.enum(['Monthly', 'Quarterly', 'Half-yearly', 'Yearly']),
  reviewPeriodStart: z.coerce.date(),
  reviewPeriodEnd: z.coerce.date(),
});

export const submitReviewSchema = z.object({
  selfRating: z.number().min(1).max(10).optional(),
  selfComments: z.string().optional(),
  managerRating: z.number().min(1).max(10).optional(),
  managerComments: z.string().optional(),
});

export const createAssetSchema = z.object({
  companyId: z.string().min(1),
  assetName: z.string().min(2),
  assetCode: z.string().min(2),
  category: z.enum(['Laptop', 'Monitor', 'Phone', 'Vehicle', 'Furniture', 'Other']),
  serialNumber: z.string().optional(),
  purchaseValue: z.number().positive().optional(),
  location: z.string().optional(),
});

export const allocateAssetSchema = z.object({
  assignedTo: z.string().min(1),
  assignedDate: z.coerce.date().optional(),
});

export const createGrievanceSchema = z.object({
  complaintType: z.enum(['Harassment', 'Discrimination', 'Unfair Treatment', 'POSH', 'Other']),
  respondentId: z.string().min(1).optional(),
  isAnonymous: z.boolean().default(false),
  description: z.string().min(10),
});

export const createDisciplinarySchema = z.object({
  employeeId: z.string().min(1),
  incidentDate: z.coerce.date(),
  incidentDesc: z.string().min(10),
  actionType: z.enum(['Warning', 'Written Warning', 'Final Warning', 'Suspension', 'Termination']).optional(),
});

export const createExitSchema = z.object({
  employeeId: z.string().min(1),
  exitType: z.enum(['Resignation', 'Termination', 'Retirement']),
  resignationDate: z.coerce.date(),
  lastWorkingDay: z.coerce.date(),
  reason: z.string().optional(),
});
