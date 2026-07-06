import { z } from 'zod';

export const createFormSchema = z.object({
  companyId: z.string().min(1),
  formName: z.string().min(2).max(255),
  formCategory: z.string(),
  fields: z.array(z.object({
    fieldName: z.string().min(1),
    fieldLabel: z.string(),
    fieldType: z.enum(['text', 'number', 'date', 'dropdown', 'multi-select', 'checkbox', 'radio', 'file', 'textarea', 'rating', 'signature', 'calculated', 'richtext', 'section']),
    required: z.boolean().default(false),
    options: z.array(z.string()).optional(),
    placeholder: z.string().optional(),
    conditionalLogic: z.any().optional(),
  })),
  status: z.enum(['Draft', 'Published', 'Archived']).default('Draft'),
});

export const submitResponseSchema = z.object({
  formId: z.string().min(1),
  responses: z.record(z.any()),
});
