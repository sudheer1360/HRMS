"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attendanceFilterSchema = exports.lockAttendanceSchema = exports.correctionApprovalSchema = exports.correctionRequestSchema = exports.manualAttendanceSchema = void 0;
const zod_1 = require("zod");
exports.manualAttendanceSchema = zod_1.z.object({
    employeeId: zod_1.z.string().min(1),
    attendanceDate: zod_1.z.string().min(1),
    inTime: zod_1.z.string().optional(),
    outTime: zod_1.z.string().optional(),
    status: zod_1.z.enum(['Present', 'Absent', 'Half Day', 'Weekly Off', 'Holiday', 'Work From Home', 'On Duty']),
    remarks: zod_1.z.string().optional(),
});
exports.correctionRequestSchema = zod_1.z.object({
    employeeId: zod_1.z.string().min(1),
    attendanceDate: zod_1.z.string().min(1),
    requestedStatus: zod_1.z.enum(['Present', 'Absent', 'Half Day', 'Work From Home', 'On Duty']),
    reason: zod_1.z.string().min(5, 'Reason must be at least 5 characters'),
});
exports.correctionApprovalSchema = zod_1.z.object({
    status: zod_1.z.enum(['Approved', 'Rejected']),
    rejectedReason: zod_1.z.string().optional(),
});
exports.lockAttendanceSchema = zod_1.z.object({
    companyId: zod_1.z.string().min(1),
    branchId: zod_1.z.string().min(1).optional(),
    deptId: zod_1.z.string().min(1).optional(),
    periodStart: zod_1.z.string().min(1),
    periodEnd: zod_1.z.string().min(1),
});
exports.attendanceFilterSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    fromDate: zod_1.z.string().optional(),
    toDate: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
    departmentId: zod_1.z.string().min(1).optional(),
    employeeId: zod_1.z.string().min(1).optional(),
});
//# sourceMappingURL=attendance.schema.js.map