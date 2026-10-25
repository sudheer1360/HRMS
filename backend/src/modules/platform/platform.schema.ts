import { z } from 'zod';

export const createTicketSchema = z.object({
  category: z.enum([
    'Payroll', 'Leave', 'Attendance', 'IT', 'Policy', 'Document', 'Other',
    'Payroll & Salary', 'Leave & Attendance', 'Benefits & Insurance',
    'IT Support', 'Policy Clarification', 'Onboarding',
    'Transfer & Relocation', 'Performance & Appraisal', 'Exit & Separation', 'Other HR',
  ]),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
  subject: z.string().min(5).max(255),
  description: z.string().min(10),
});

export const updateTicketSchema = z.object({
  status: z.enum(['In Progress', 'Resolved', 'Closed']).optional(),
  assignedTo: z.string().min(1).optional(),
  resolution: z.string().optional(),
  satisfactionRating: z.number().min(1).max(5).optional(),
});

export const aiQuerySchema = z.object({
  query: z.string().min(1),
});

export const createWorkflowSchema = z.object({
  workflowName: z.string().min(2),
  triggerType: z.enum(['Time', 'Event', 'Condition']),
  triggerConfig: z.any().optional(),
  actions: z.any(),
});

export const createReportSchema = z.object({
  reportName: z.string().min(2),
  module: z.string(),
  reportType: z.enum(['Table', 'Chart', 'Summary', 'Export']),
  configJson: z.any(),
});

export const createApiKeySchema = z.object({
  keyName: z.string().min(2),
  scopes: z.string(),
  ipRestrictions: z.string().optional(),
  expiresAt: z.coerce.date().optional(),
});

export const createWebhookSchema = z.object({
  webhookName: z.string().min(2),
  eventType: z.string(),
  targetUrl: z.string().url(),
  secretHash: z.string().optional(),
});
