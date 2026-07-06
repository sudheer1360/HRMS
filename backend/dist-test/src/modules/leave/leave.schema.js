"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaveFilterSchema = exports.leaveApprovalSchema = exports.applyLeaveSchema = exports.createLeavePolicySchema = exports.createLeaveTypeSchema = void 0;
const zod_1 = require("zod");
const boolCoerce = (defaultVal) => zod_1.z.preprocess(v => (v === 'true' || v === true ? true : v === 'false' || v === false ? false : defaultVal), zod_1.z.boolean());
exports.createLeaveTypeSchema = zod_1.z.object({
    companyId: zod_1.z.string().min(1),
    leaveName: zod_1.z.string().min(2).max(100),
    leaveCode: zod_1.z.string().min(2).max(20),
    description: zod_1.z.string().optional(),
    isPaid: boolCoerce(true),
    requiresApproval: boolCoerce(true),
    minDurationDays: zod_1.z.coerce.number().min(0.5).default(0.5),
    allowEncashment: boolCoerce(false),
});
exports.createLeavePolicySchema = zod_1.z.object({
    companyId: zod_1.z.string().min(1),
    leaveTypeId: zod_1.z.string().min(1),
    annualQuota: zod_1.z.number().positive(),
    accrualFrequency: zod_1.z.enum(['Monthly', 'Quarterly', 'Yearly']).default('Monthly'),
    carryForwardLimit: zod_1.z.number().optional(),
    sandwichRule: zod_1.z.boolean().default(false),
    minServiceDays: zod_1.z.number().int().default(0),
});
exports.applyLeaveSchema = zod_1.z.object({
    leaveTypeId: zod_1.z.string().min(1),
    fromDate: zod_1.z.string().min(1, 'Required'),
    toDate: zod_1.z.string().min(1, 'Required'),
    reason: zod_1.z.string().optional(),
    contactDuringLeave: zod_1.z.string().optional(),
}).refine(data => data.toDate >= data.fromDate, {
    message: 'To date must be on or after from date',
    path: ['toDate'],
});
exports.leaveApprovalSchema = zod_1.z.object({
    status: zod_1.z.enum(['Approved', 'Rejected']),
    rejectedReason: zod_1.z.string().optional(),
});
exports.leaveFilterSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    status: zod_1.z.string().optional(),
    leaveTypeId: zod_1.z.string().min(1).optional(),
    employeeId: zod_1.z.string().min(1).optional(),
    fromDate: zod_1.z.string().optional(),
    toDate: zod_1.z.string().optional(),
});
