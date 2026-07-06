import { z } from 'zod';

export const createCompanySchema = z.object({
  companyName: z.string().min(2).max(255),
  legalName: z.string().min(2).max(255),
  companyCode: z.string().min(2).max(50).regex(/^[A-Z0-9_-]+$/, 'Only uppercase letters, numbers, hyphens and underscores'),
  logoUrl: z.string().url().optional(),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format').optional().or(z.literal('')),
  tan: z.string().regex(/^[A-Z]{4}[0-9]{5}[A-Z]{1}$/, 'Invalid TAN format').optional().or(z.literal('')),
  gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format').optional().or(z.literal('')),
  cin: z.string().optional(),
  registeredAddress: z.string().min(5),
  corporateAddress: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid mobile').optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  financialYearStartMonth: z.string().optional(),
  payrollCycle: z.string().optional(),
});

export const createBranchSchema = z.object({
  companyId: z.string().min(1),
  branchName: z.string().min(2).max(255),
  branchCode: z.string().min(2).max(50),
  branchType: z.enum(['Head Office', 'Regional Office', 'Sales Office', 'Plant', 'Factory', 'Warehouse', 'Site']),
  address: z.string().min(5),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  country: z.string().default('India'),
  pinCode: z.string().optional(),
  isPayrollLocation: z.boolean().default(false),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const createDepartmentSchema = z.object({
  companyId: z.string().min(1),
  branchId: z.string().min(1).optional(),
  parentDepartmentId: z.string().min(1).optional(),
  departmentName: z.string().min(2).max(255),
  departmentCode: z.string().min(2).max(50),
  departmentHeadId: z.string().min(1).optional(),
  costCenterId: z.string().min(1).optional(),
});

export const createDesignationSchema = z.object({
  companyId: z.string().min(1),
  designationName: z.string().min(2).max(255),
  designationCode: z.string().min(2).max(50),
  gradeId: z.string().min(1).optional(),
  level: z.number().int().min(0).optional(),
});

export const createGradeSchema = z.object({
  companyId: z.string().min(1),
  gradeName: z.string().min(1).max(100),
  gradeCode: z.string().min(1).max(20),
  minSalary: z.number().positive().optional(),
  maxSalary: z.number().positive().optional(),
  sortOrder: z.number().int().default(0),
});

export const createCostCenterSchema = z.object({
  companyId: z.string().min(1),
  costCenterName: z.string().min(2).max(255),
  costCenterCode: z.string().min(2).max(50),
  branchId: z.string().min(1).optional(),
  departmentId: z.string().min(1).optional(),
});

// ── Update schemas (extend create schemas with optional status) ───────────────

export const updateCompanySchema = createCompanySchema.partial().extend({
  status: z.enum(['Active', 'Inactive']).optional(),
});

export const updateBranchSchema = createBranchSchema.partial().extend({
  status: z.enum(['Active', 'Inactive']).optional(),
});

export const updateDepartmentSchema = createDepartmentSchema.partial().extend({
  status: z.enum(['Active', 'Inactive']).optional(),
  parentDepartmentId: z.string().min(1).optional().nullable(),
});

export const updateDesignationSchema = createDesignationSchema.partial().extend({
  status: z.enum(['Active', 'Inactive']).optional(),
});

export const updateGradeSchema = createGradeSchema.partial().extend({
  status: z.enum(['Active', 'Inactive']).optional(),
});

export const updateCostCenterSchema = createCostCenterSchema.partial().extend({
  status: z.enum(['Active', 'Inactive']).optional(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('asc'),
  search: z.string().optional(),
  status: z.string().optional(),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type CreateBranchInput = z.infer<typeof createBranchSchema>;
export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type CreateDesignationInput = z.infer<typeof createDesignationSchema>;
export type CreateGradeInput = z.infer<typeof createGradeSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
