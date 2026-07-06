"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitResponseSchema = exports.createFormSchema = void 0;
const zod_1 = require("zod");
exports.createFormSchema = zod_1.z.object({
    companyId: zod_1.z.string().min(1),
    formName: zod_1.z.string().min(2).max(255),
    formCategory: zod_1.z.string(),
    fields: zod_1.z.array(zod_1.z.object({
        fieldName: zod_1.z.string().min(1),
        fieldLabel: zod_1.z.string(),
        fieldType: zod_1.z.enum(['text', 'number', 'date', 'dropdown', 'multi-select', 'checkbox', 'radio', 'file', 'textarea', 'rating', 'signature', 'calculated', 'richtext', 'section']),
        required: zod_1.z.boolean().default(false),
        options: zod_1.z.array(zod_1.z.string()).optional(),
        placeholder: zod_1.z.string().optional(),
        conditionalLogic: zod_1.z.any().optional(),
    })),
    status: zod_1.z.enum(['Draft', 'Published', 'Archived']).default('Draft'),
});
exports.submitResponseSchema = zod_1.z.object({
    formId: zod_1.z.string().min(1),
    responses: zod_1.z.record(zod_1.z.any()),
});
//# sourceMappingURL=formbuilder.schema.js.map