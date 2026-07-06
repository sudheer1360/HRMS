"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWebhookSchema = exports.createApiKeySchema = exports.createReportSchema = exports.createWorkflowSchema = exports.aiQuerySchema = exports.updateTicketSchema = exports.createTicketSchema = void 0;
const zod_1 = require("zod");
exports.createTicketSchema = zod_1.z.object({
    category: zod_1.z.enum(['Payroll', 'Leave', 'Attendance', 'IT', 'Policy', 'Document', 'Other']),
    priority: zod_1.z.enum(['Low', 'Medium', 'High', 'Critical']),
    subject: zod_1.z.string().min(5).max(255),
    description: zod_1.z.string().min(10),
});
exports.updateTicketSchema = zod_1.z.object({
    status: zod_1.z.enum(['In Progress', 'Resolved', 'Closed']).optional(),
    assignedTo: zod_1.z.string().min(1).optional(),
    resolution: zod_1.z.string().optional(),
    satisfactionRating: zod_1.z.number().min(1).max(5).optional(),
});
exports.aiQuerySchema = zod_1.z.object({
    query: zod_1.z.string().min(1),
});
exports.createWorkflowSchema = zod_1.z.object({
    workflowName: zod_1.z.string().min(2),
    triggerType: zod_1.z.enum(['Time', 'Event', 'Condition']),
    triggerConfig: zod_1.z.any().optional(),
    actions: zod_1.z.any(),
});
exports.createReportSchema = zod_1.z.object({
    reportName: zod_1.z.string().min(2),
    module: zod_1.z.string(),
    reportType: zod_1.z.enum(['Table', 'Chart', 'Summary', 'Export']),
    configJson: zod_1.z.any(),
});
exports.createApiKeySchema = zod_1.z.object({
    keyName: zod_1.z.string().min(2),
    scopes: zod_1.z.string(),
    ipRestrictions: zod_1.z.string().optional(),
    expiresAt: zod_1.z.coerce.date().optional(),
});
exports.createWebhookSchema = zod_1.z.object({
    webhookName: zod_1.z.string().min(2),
    eventType: zod_1.z.string(),
    targetUrl: zod_1.z.string().url(),
    secretHash: zod_1.z.string().optional(),
});
//# sourceMappingURL=platform.schema.js.map