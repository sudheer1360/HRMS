import { z } from 'zod';

export const createEmployeeSchema = z.object({
  companyId: z.string().min(1),
  branchId: z.string().min(1),
  departmentId: z.string().min(1),
  designationId: z.string().min(1),
  gradeId: z.string().min(1).optional(),
  employeeCode: z.string().min(2).max(50).optional(),
  firstName: z.string().min(1).max(100),
  middleName: z.string().max(100).optional(),
  lastName: z.string().min(1).max(100),
  gender: z.enum(['Male', 'Female', 'Other', 'Prefer not to say']),
  dateOfBirth: z.coerce.date().refine((d) => {
    const age = new Date().getFullYear() - d.getFullYear();
    return age >= 18;
  }, 'Employee must be at least 18 years old'),
  maritalStatus: z.enum(['Single', 'Married', 'Divorced', 'Widowed']).optional(),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  nationality: z.string().default('Indian'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid mobile number'),
  email: z.string().email('Invalid email'),
  alternateMobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid mobile').optional().or(z.literal('')),
  presentAddress: z.string().min(5),
  permanentAddress: z.string().optional(),
  emergencyContactName: z.string().max(255).optional(),
  emergencyContactNumber: z.string().optional(),
  emergencyRelationship: z.string().optional(),
  dateOfJoining: z.coerce.date(),
  employeeType: z.enum([
    'Permanent', 'Probation', 'Contract', 'Consultant', 'Intern',
    'Apprentice', 'Daily wage', 'Temporary', 'Third-party labor', 'Retainer',
  ]),
  reportingManagerId: z.string().min(1).optional(),
  hrManagerId: z.string().min(1).optional(),
  probationMonths: z.number().int().min(0).max(24).default(6),
  noticePeriodDays: z.number().int().min(0).max(180).default(30),

  // Statutory
  aadhaar: z.string().regex(/^\d{12}$/, 'Aadhaar must be 12 digits').optional(),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN').optional(),
  uan: z.string().max(20).optional(),
  pfNumber: z.string().max(50).optional(),
  esiIpNumber: z.string().max(20).optional(),
  ptApplicable: z.boolean().default(false),
  lwfApplicable: z.boolean().default(false),
  gratuityApplicable: z.boolean().default(true),

  // Bank
  bankName: z.string().optional(),
  accountNumber: z.string().min(9).max(18).optional(),
  ifsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC').optional(),
  accountHolderName: z.string().optional(),
  paymentMode: z.enum(['Bank Transfer', 'Cheque', 'Cash']).default('Bank Transfer'),
});

export const updateEmployeeSchema = createEmployeeSchema.partial().extend({
  // Allow empty strings for optional enum/string fields in updates
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional().or(z.literal('')),
  gender: z.enum(['Male', 'Female', 'Other', 'Prefer not to say']).optional().or(z.literal('')),
  maritalStatus: z.enum(['Single', 'Married', 'Divorced', 'Widowed']).optional().or(z.literal('')),
  employeeType: z.enum([
    'Permanent', 'Probation', 'Contract', 'Consultant', 'Intern',
    'Apprentice', 'Daily wage', 'Temporary', 'Third-party labor', 'Retainer',
  ]).optional().or(z.literal('')),
  paymentMode: z.enum(['Bank Transfer', 'Cheque', 'Cash']).optional().or(z.literal('')),
  presentAddress: z.string().min(5).optional().or(z.literal('')),
  permanentAddress: z.string().optional().or(z.literal('')),
});

export const employeeStatusSchema = z.object({
  status: z.enum(['Active', 'Probation', 'Confirmed', 'Resigned', 'Terminated', 'Suspended', 'Exited']),
  reason: z.string().optional(),
  effectiveDate: z.coerce.date().optional(),
});

export const employeeFilterSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('asc'),
  search: z.string().optional(),
  status: z.string().optional(),
  departmentId: z.string().min(1).optional(),
  designationId: z.string().min(1).optional(),
  branchId: z.string().min(1).optional(),
  employeeType: z.string().optional(),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
export type EmployeeFilterInput = z.infer<typeof employeeFilterSchema>;
