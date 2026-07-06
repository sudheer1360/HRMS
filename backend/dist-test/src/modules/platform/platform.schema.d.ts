import { z } from 'zod';
export declare const createTicketSchema: z.ZodObject<{
    category: z.ZodEnum<["Payroll", "Leave", "Attendance", "IT", "Policy", "Document", "Other"]>;
    priority: z.ZodEnum<["Low", "Medium", "High", "Critical"]>;
    subject: z.ZodString;
    description: z.ZodString;
}, "strip", z.ZodTypeAny, {
    description: string;
    category: "Other" | "Policy" | "Leave" | "Attendance" | "Payroll" | "IT" | "Document";
    priority: "Medium" | "Low" | "High" | "Critical";
    subject: string;
}, {
    description: string;
    category: "Other" | "Policy" | "Leave" | "Attendance" | "Payroll" | "IT" | "Document";
    priority: "Medium" | "Low" | "High" | "Critical";
    subject: string;
}>;
export declare const updateTicketSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["In Progress", "Resolved", "Closed"]>>;
    assignedTo: z.ZodOptional<z.ZodString>;
    resolution: z.ZodOptional<z.ZodString>;
    satisfactionRating: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    status?: "Closed" | "In Progress" | "Resolved" | undefined;
    assignedTo?: string | undefined;
    resolution?: string | undefined;
    satisfactionRating?: number | undefined;
}, {
    status?: "Closed" | "In Progress" | "Resolved" | undefined;
    assignedTo?: string | undefined;
    resolution?: string | undefined;
    satisfactionRating?: number | undefined;
}>;
export declare const aiQuerySchema: z.ZodObject<{
    query: z.ZodString;
}, "strip", z.ZodTypeAny, {
    query: string;
}, {
    query: string;
}>;
export declare const createWorkflowSchema: z.ZodObject<{
    workflowName: z.ZodString;
    triggerType: z.ZodEnum<["Time", "Event", "Condition"]>;
    triggerConfig: z.ZodOptional<z.ZodAny>;
    actions: z.ZodAny;
}, "strip", z.ZodTypeAny, {
    workflowName: string;
    triggerType: "Time" | "Event" | "Condition";
    triggerConfig?: any;
    actions?: any;
}, {
    workflowName: string;
    triggerType: "Time" | "Event" | "Condition";
    triggerConfig?: any;
    actions?: any;
}>;
export declare const createReportSchema: z.ZodObject<{
    reportName: z.ZodString;
    module: z.ZodString;
    reportType: z.ZodEnum<["Table", "Chart", "Summary", "Export"]>;
    configJson: z.ZodAny;
}, "strip", z.ZodTypeAny, {
    reportName: string;
    module: string;
    reportType: "Table" | "Chart" | "Summary" | "Export";
    configJson?: any;
}, {
    reportName: string;
    module: string;
    reportType: "Table" | "Chart" | "Summary" | "Export";
    configJson?: any;
}>;
export declare const createApiKeySchema: z.ZodObject<{
    keyName: z.ZodString;
    scopes: z.ZodString;
    ipRestrictions: z.ZodOptional<z.ZodString>;
    expiresAt: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    keyName: string;
    scopes: string;
    expiresAt?: Date | undefined;
    ipRestrictions?: string | undefined;
}, {
    keyName: string;
    scopes: string;
    expiresAt?: Date | undefined;
    ipRestrictions?: string | undefined;
}>;
export declare const createWebhookSchema: z.ZodObject<{
    webhookName: z.ZodString;
    eventType: z.ZodString;
    targetUrl: z.ZodString;
    secretHash: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    webhookName: string;
    eventType: string;
    targetUrl: string;
    secretHash?: string | undefined;
}, {
    webhookName: string;
    eventType: string;
    targetUrl: string;
    secretHash?: string | undefined;
}>;
//# sourceMappingURL=platform.schema.d.ts.map