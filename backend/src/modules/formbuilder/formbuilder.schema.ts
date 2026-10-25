import { z } from 'zod';

export const createFormSchema = z.object({
  companyId: z.string().min(1).optional(),
  name: z.string().min(2).max(255).optional(),
  formName: z.string().min(2).max(255).optional(),
  category: z.string().optional(),
  formCategory: z.string().optional(),
  description: z.string().optional(),
  fields: z.array(z.any()).optional().default([]),
  status: z.enum(['Draft', 'Published', 'Archived']).default('Draft'),
}).refine(d => d.name || d.formName, { message: 'name or formName is required' });

export const submitResponseSchema = z.object({
  formId: z.string().min(1),
  responses: z.record(z.any()),
});
