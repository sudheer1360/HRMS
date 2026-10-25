import { z } from 'zod';

export const createPolicySchema = z.object({
  companyId: z.string().min(1).optional(),
  title: z.string().min(2).max(255),
  policyCode: z.string().min(2).max(50).optional(),
  category: z.enum(['General', 'Leave', 'Attendance', 'Payroll', 'Code of Conduct', 'IT', 'Safety', 'Benefits', 'Travel', 'Other', 'HR', 'Finance', 'Legal', 'Operations']),
  content: z.string().min(10),
  effectiveDate: z.coerce.date(),
  reviewDate: z.coerce.date().optional(),
  requiresAcknowledgement: z.boolean().default(true),
  requiresQuiz: z.boolean().default(false),
});

export const acknowledgeSchema = z.object({
  policyId: z.string().min(1),
});

export type CreatePolicyInput = z.infer<typeof createPolicySchema>;
