"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationSchema = exports.updateCostCenterSchema = exports.updateGradeSchema = exports.updateDesignationSchema = exports.updateDepartmentSchema = exports.updateBranchSchema = exports.updateCompanySchema = exports.createCostCenterSchema = exports.createGradeSchema = exports.createDesignationSchema = exports.createDepartmentSchema = exports.createBranchSchema = exports.createCompanySchema = void 0;
const zod_1 = require("zod");
exports.createCompanySchema = zod_1.z.object({
    companyName: zod_1.z.string().min(2).max(255),
    legalName: zod_1.z.string().min(2).max(255),
    companyCode: zod_1.z.string().min(2).max(50).regex(/^[A-Z0-9_-]+$/, 'Only uppercase letters, numbers, hyphens and underscores'),
    logoUrl: zod_1.z.string().url().optional(),
    pan: zod_1.z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format').optional().or(zod_1.z.literal('')),
    tan: zod_1.z.string().regex(/^[A-Z]{4}[0-9]{5}[A-Z]{1}$/, 'Invalid TAN format').optional().or(zod_1.z.literal('')),
    gstin: zod_1.z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format').optional().or(zod_1.z.literal('')),
    cin: zod_1.z.string().optional(),
    registeredAddress: zod_1.z.string().min(5),
    corporateAddress: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional().or(zod_1.z.literal('')),
    phone: zod_1.z.string().regex(/^[6-9]\d{9}$/, 'Invalid mobile').optional().or(zod_1.z.literal('')),
    website: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    financialYearStartMonth: zod_1.z.string().optional(),
    payrollCycle: zod_1.z.string().optional(),
});
exports.createBranchSchema = zod_1.z.object({
    companyId: zod_1.z.string().min(1),
    branchName: zod_1.z.string().min(2).max(255),
    branchCode: zod_1.z.string().min(2).max(50),
    branchType: zod_1.z.enum(['Head Office', 'Regional Office', 'Sales Office', 'Plant', 'Factory', 'Warehouse', 'Site']),
    address: zod_1.z.string().min(5),
    city: zod_1.z.string().min(2).max(100),
    state: zod_1.z.string().min(2).max(100),
    country: zod_1.z.string().default('India'),
    pinCode: zod_1.z.string().optional(),
    isPayrollLocation: zod_1.z.boolean().default(false),
    latitude: zod_1.z.number().min(-90).max(90).optional(),
    longitude: zod_1.z.number().min(-180).max(180).optional(),
});
exports.createDepartmentSchema = zod_1.z.object({
    companyId: zod_1.z.string().min(1),
    branchId: zod_1.z.string().min(1).optional(),
    parentDepartmentId: zod_1.z.string().min(1).optional(),
    departmentName: zod_1.z.string().min(2).max(255),
    departmentCode: zod_1.z.string().min(2).max(50),
    departmentHeadId: zod_1.z.string().min(1).optional(),
    costCenterId: zod_1.z.string().min(1).optional(),
});
exports.createDesignationSchema = zod_1.z.object({
    companyId: zod_1.z.string().min(1),
    designationName: zod_1.z.string().min(2).max(255),
    designationCode: zod_1.z.string().min(2).max(50),
    gradeId: zod_1.z.string().min(1).optional(),
    level: zod_1.z.number().int().min(0).optional(),
});
exports.createGradeSchema = zod_1.z.object({
    companyId: zod_1.z.string().min(1),
    gradeName: zod_1.z.string().min(1).max(100),
    gradeCode: zod_1.z.string().min(1).max(20),
    minSalary: zod_1.z.number().positive().optional(),
    maxSalary: zod_1.z.number().positive().optional(),
    sortOrder: zod_1.z.number().int().default(0),
});
exports.createCostCenterSchema = zod_1.z.object({
    companyId: zod_1.z.string().min(1),
    costCenterName: zod_1.z.string().min(2).max(255),
    costCenterCode: zod_1.z.string().min(2).max(50),
    branchId: zod_1.z.string().min(1).optional(),
    departmentId: zod_1.z.string().min(1).optional(),
});
// ── Update schemas (extend create schemas with optional status) ───────────────
exports.updateCompanySchema = exports.createCompanySchema.partial().extend({
    status: zod_1.z.enum(['Active', 'Inactive']).optional(),
});
exports.updateBranchSchema = exports.createBranchSchema.partial().extend({
    status: zod_1.z.enum(['Active', 'Inactive']).optional(),
});
exports.updateDepartmentSchema = exports.createDepartmentSchema.partial().extend({
    status: zod_1.z.enum(['Active', 'Inactive']).optional(),
    parentDepartmentId: zod_1.z.string().min(1).optional().nullable(),
});
exports.updateDesignationSchema = exports.createDesignationSchema.partial().extend({
    status: zod_1.z.enum(['Active', 'Inactive']).optional(),
});
exports.updateGradeSchema = exports.createGradeSchema.partial().extend({
    status: zod_1.z.enum(['Active', 'Inactive']).optional(),
});
exports.updateCostCenterSchema = exports.createCostCenterSchema.partial().extend({
    status: zod_1.z.enum(['Active', 'Inactive']).optional(),
});
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    sort: zod_1.z.string().optional(),
    order: zod_1.z.enum(['asc', 'desc']).default('asc'),
    search: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
});
//# sourceMappingURL=organization.schema.js.map