import { z } from 'zod';

export const manualAttendanceSchema = z.object({
  employeeId: z.string().min(1),
  attendanceDate: z.string().min(1),
  inTime: z.string().optional(),
  outTime: z.string().optional(),
  status: z.enum(['Present', 'Absent', 'Half Day', 'Weekly Off', 'Holiday', 'Work From Home', 'On Duty']),
  remarks: z.string().optional(),
});

export const correctionRequestSchema = z.object({
  employeeId: z.string().min(1),
  attendanceDate: z.string().min(1),
  requestedStatus: z.enum(['Present', 'Absent', 'Half Day', 'Work From Home', 'On Duty']),
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
});

export const correctionApprovalSchema = z.object({
  status: z.enum(['Approved', 'Rejected']),
  rejectedReason: z.string().optional(),
});

export const lockAttendanceSchema = z.object({
  companyId: z.string().min(1),
  branchId: z.string().min(1).optional(),
  deptId: z.string().min(1).optional(),
  periodStart: z.string().min(1),
  periodEnd: z.string().min(1),
});

export const attendanceFilterSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  status: z.string().optional(),
  departmentId: z.string().min(1).optional(),
  employeeId: z.string().min(1).optional(),
});

export type ManualAttendanceInput = z.infer<typeof manualAttendanceSchema>;
export type CorrectionRequestInput = z.infer<typeof correctionRequestSchema>;
export type AttendanceFilterInput = z.infer<typeof attendanceFilterSchema>;
