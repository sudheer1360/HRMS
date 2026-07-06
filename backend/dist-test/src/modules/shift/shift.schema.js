"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.overtimeApprovalSchema = exports.overtimeRequestSchema = exports.overtimeRuleSchema = exports.shiftFilterSchema = exports.createRosterSchema = exports.createShiftSchema = void 0;
const zod_1 = require("zod");
exports.createShiftSchema = zod_1.z.object({
    companyId: zod_1.z.string().min(1),
    shiftName: zod_1.z.string().min(2).max(100),
    shiftCode: zod_1.z.string().min(2).max(20),
    startTime: zod_1.z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'HH:MM format'),
    endTime: zod_1.z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'HH:MM format'),
    gracePeriodMins: zod_1.z.number().int().default(15),
    breakMins: zod_1.z.number().int().default(30),
    isNightShift: zod_1.z.boolean().default(false),
    isFlexible: zod_1.z.boolean().default(false),
    otEligible: zod_1.z.boolean().default(true),
});
exports.createRosterSchema = zod_1.z.object({
    employeeIds: zod_1.z.array(zod_1.z.string().min(1)).min(1),
    shiftId: zod_1.z.string().min(1),
    fromDate: zod_1.z.coerce.date(),
    toDate: zod_1.z.coerce.date(),
    rosterType: zod_1.z.enum(['Fixed', 'Rotating', 'Dynamic']).default('Fixed'),
});
exports.shiftFilterSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    companyId: zod_1.z.string().min(1).optional(),
});
exports.overtimeRuleSchema = zod_1.z.object({
    companyId: zod_1.z.string().min(1),
    otType: zod_1.z.enum(['Daily', 'Weekly', 'Holiday', 'Double']),
    rateMultiplier: zod_1.z.number().min(1).max(5),
    dailyHourCap: zod_1.z.number().optional(),
    weeklyHourCap: zod_1.z.number().optional(),
    monthlyHourCap: zod_1.z.number().optional(),
});
exports.overtimeRequestSchema = zod_1.z.object({
    employeeId: zod_1.z.string().min(1),
    otDate: zod_1.z.coerce.date(),
    otHours: zod_1.z.number().positive().max(24),
    otType: zod_1.z.enum(['Daily', 'Weekly', 'Holiday', 'Double']),
    reason: zod_1.z.string().optional(),
});
exports.overtimeApprovalSchema = zod_1.z.object({
    status: zod_1.z.enum(['Approved', 'Rejected']),
    rejectedReason: zod_1.z.string().optional(),
});
//# sourceMappingURL=shift.schema.js.map