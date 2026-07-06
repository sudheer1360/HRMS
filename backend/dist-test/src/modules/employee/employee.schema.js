"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeeFilterSchema = exports.employeeStatusSchema = exports.updateEmployeeSchema = exports.createEmployeeSchema = void 0;
const zod_1 = require("zod");
exports.createEmployeeSchema = zod_1.z.object({
    companyId: zod_1.z.string().min(1),
    branchId: zod_1.z.string().min(1),
    departmentId: zod_1.z.string().min(1),
    designationId: zod_1.z.string().min(1),
    gradeId: zod_1.z.string().min(1).optional(),
    employeeCode: zod_1.z.string().min(2).max(50).optional(),
    firstName: zod_1.z.string().min(1).max(100),
    middleName: zod_1.z.string().max(100).optional(),
    lastName: zod_1.z.string().min(1).max(100),
    gender: zod_1.z.enum(['Male', 'Female', 'Other', 'Prefer not to say']),
    dateOfBirth: zod_1.z.coerce.date().refine((d) => {
        const age = new Date().getFullYear() - d.getFullYear();
        return age >= 18;
    }, 'Employee must be at least 18 years old'),
    maritalStatus: zod_1.z.enum(['Single', 'Married', 'Divorced', 'Widowed']).optional(),
    bloodGroup: zod_1.z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
    nationality: zod_1.z.string().default('Indian'),
    mobile: zod_1.z.string().regex(/^[6-9]\d{9}$/, 'Invalid mobile number'),
    email: zod_1.z.string().email('Invalid email'),
    alternateMobile: zod_1.z.string().regex(/^[6-9]\d{9}$/, 'Invalid mobile').optional().or(zod_1.z.literal('')),
    presentAddress: zod_1.z.string().min(5),
    permanentAddress: zod_1.z.string().optional(),
    emergencyContactName: zod_1.z.string().max(255).optional(),
    emergencyContactNumber: zod_1.z.string().optional(),
    emergencyRelationship: zod_1.z.string().optional(),
    dateOfJoining: zod_1.z.coerce.date(),
    employeeType: zod_1.z.enum([
        'Permanent', 'Probation', 'Contract', 'Consultant', 'Intern',
        'Apprentice', 'Daily wage', 'Temporary', 'Third-party labor', 'Retainer',
    ]),
    reportingManagerId: zod_1.z.string().min(1).optional(),
    hrManagerId: zod_1.z.string().min(1).optional(),
    probationMonths: zod_1.z.number().int().min(0).max(24).default(6),
    noticePeriodDays: zod_1.z.number().int().min(0).max(180).default(30),
    // Statutory
    aadhaar: zod_1.z.string().regex(/^\d{12}$/, 'Aadhaar must be 12 digits').optional(),
    pan: zod_1.z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN').optional(),
    uan: zod_1.z.string().max(20).optional(),
    pfNumber: zod_1.z.string().max(50).optional(),
    esiIpNumber: zod_1.z.string().max(20).optional(),
    ptApplicable: zod_1.z.boolean().default(false),
    lwfApplicable: zod_1.z.boolean().default(false),
    gratuityApplicable: zod_1.z.boolean().default(true),
    // Bank
    bankName: zod_1.z.string().optional(),
    accountNumber: zod_1.z.string().min(9).max(18).optional(),
    ifsc: zod_1.z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC').optional(),
    accountHolderName: zod_1.z.string().optional(),
    paymentMode: zod_1.z.enum(['Bank Transfer', 'Cheque', 'Cash']).default('Bank Transfer'),
});
exports.updateEmployeeSchema = exports.createEmployeeSchema.partial().extend({
    // Allow empty strings for optional enum/string fields in updates
    bloodGroup: zod_1.z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional().or(zod_1.z.literal('')),
    gender: zod_1.z.enum(['Male', 'Female', 'Other', 'Prefer not to say']).optional().or(zod_1.z.literal('')),
    maritalStatus: zod_1.z.enum(['Single', 'Married', 'Divorced', 'Widowed']).optional().or(zod_1.z.literal('')),
    employeeType: zod_1.z.enum([
        'Permanent', 'Probation', 'Contract', 'Consultant', 'Intern',
        'Apprentice', 'Daily wage', 'Temporary', 'Third-party labor', 'Retainer',
    ]).optional().or(zod_1.z.literal('')),
    paymentMode: zod_1.z.enum(['Bank Transfer', 'Cheque', 'Cash']).optional().or(zod_1.z.literal('')),
    presentAddress: zod_1.z.string().min(5).optional().or(zod_1.z.literal('')),
    permanentAddress: zod_1.z.string().optional().or(zod_1.z.literal('')),
});
exports.employeeStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['Active', 'Probation', 'Confirmed', 'Resigned', 'Terminated', 'Suspended', 'Exited']),
    reason: zod_1.z.string().optional(),
    effectiveDate: zod_1.z.coerce.date().optional(),
});
exports.employeeFilterSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    sort: zod_1.z.string().optional(),
    order: zod_1.z.enum(['asc', 'desc']).default('asc'),
    search: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
    departmentId: zod_1.z.string().min(1).optional(),
    designationId: zod_1.z.string().min(1).optional(),
    branchId: zod_1.z.string().min(1).optional(),
    employeeType: zod_1.z.string().optional(),
});
//# sourceMappingURL=employee.schema.js.map