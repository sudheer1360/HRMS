"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.acknowledgeSchema = exports.createPolicySchema = void 0;
const zod_1 = require("zod");
exports.createPolicySchema = zod_1.z.object({
    companyId: zod_1.z.string().min(1),
    title: zod_1.z.string().min(2).max(255),
    policyCode: zod_1.z.string().min(2).max(50),
    category: zod_1.z.enum(['General', 'Leave', 'Attendance', 'Payroll', 'Code of Conduct', 'IT', 'Safety', 'Benefits', 'Travel', 'Other']),
    content: zod_1.z.string().min(10),
    effectiveDate: zod_1.z.coerce.date(),
    reviewDate: zod_1.z.coerce.date().optional(),
    requiresAcknowledgement: zod_1.z.boolean().default(true),
    requiresQuiz: zod_1.z.boolean().default(false),
});
exports.acknowledgeSchema = zod_1.z.object({
    policyId: zod_1.z.string().min(1),
});
//# sourceMappingURL=policy.schema.js.map