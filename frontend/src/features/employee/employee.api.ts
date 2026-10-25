import api from '@lib/axios';
import type { Employee, PaginatedResponse } from '@types';

export interface EmployeeDetail extends Employee {
  middleName?: string;
  dateOfBirth?: string;
  maritalStatus?: string;
  bloodGroup?: string;
  nationality?: string;
  fatherName?: string;
  spouseName?: string;
  // Contact
  alternateMobile?: string;
  presentAddress?: string;
  permanentAddress?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  emergencyRelationship?: string;
  // Employment
  employeeType?: string;
  employmentStatus?: string;
  companyId?: string;
  branchId?: string;
  departmentId?: string;
  designationId?: string;
  gradeId?: string;
  reportingManagerId?: string;
  hrManagerId?: string;
  probationMonths?: number;
  noticePeriodDays?: number;
  confirmationDate?: string;
  // Nested
  statutoryDetails?: {
    aadhaarMasked?: string;
    panMasked?: string;
    uan?: string;
    pfNumber?: string;
    esiIpNumber?: string;
    ptApplicable?: boolean;
    lwfApplicable?: boolean;
    gratuityApplicable?: boolean;
  };
  bankDetails?: Array<{
    id: string;
    bankName: string;
    accountNumberMasked: string;
    ifsc: string;
    accountHolderName: string;
    paymentMode: string;
    isPrimary: boolean;
  }>;
  familyMembers?: Array<{
    id: string;
    familyMemberName: string;
    relation: string;
    dateOfBirth?: string;
    dependentFlag?: boolean;
    nomineeFlag?: boolean;
    nomineePercentage?: number;
  }>;
  documents?: Array<{
    id: string;
    documentType: string;
    fileName: string;
    uploadedAt: string;
  }>;
}

export async function getEmployee(id: string): Promise<EmployeeDetail> {
  const { data } = await api.get<{ data: EmployeeDetail }>(`/employees/${id}`);
  return data.data;
}

export async function updateEmployee(id: string, payload: Partial<EmployeeDetail>): Promise<EmployeeDetail> {
  const { data } = await api.put<{ data: EmployeeDetail }>(`/employees/${id}`, payload);
  return data.data;
}

export async function changeEmployeeStatus(id: string, status: string, reason?: string): Promise<EmployeeDetail> {
  const { data } = await api.patch<{ data: EmployeeDetail }>(`/employees/${id}/status`, { status, reason });
  return data.data;
}

export async function listEmployees(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}): Promise<PaginatedResponse<Employee>> {
  const p = new URLSearchParams({ page: String(params.page ?? 1), limit: String(params.limit ?? 20) });
  if (params.search) p.set('search', params.search);
  if (params.status) p.set('status', params.status);
  const { data } = await api.get<PaginatedResponse<Employee>>(`/employees?${p}`);
  return data;
}
