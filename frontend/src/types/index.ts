export interface User {
  id: string;
  email: string;
  fullName: string;
  tenantId: string;
  employeeId?: string;
  roles: string[];
}

export interface LoginResponse {
  mfaRequired: boolean;
  sessionToken?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
  error?: {
    code: string;
    message: string;
    details?: { field: string; message: string }[];
  };
}

// Organization
export interface Company {
  id: string;
  companyName: string;
  legalName: string;
  companyCode: string;
  pan?: string;
  gstin?: string;
  status?: string;
  _count?: { branches: number; employees: number };
}

export interface Branch {
  id: string;
  companyId?: string;
  branchName: string;
  branchCode: string;
  branchType: string;
  address?: string;
  city: string;
  state: string;
  country?: string;
  pinCode?: string;
  isPayrollLocation?: boolean;
  status?: string;
}

export interface Department {
  id: string;
  companyId?: string;
  branchId?: string;
  parentDepartmentId?: string;
  departmentName: string;
  departmentCode: string;
  level?: number;
  status?: string;
}

export interface Designation {
  id: string;
  companyId?: string;
  designationName: string;
  designationCode: string;
  gradeId?: string;
  grade?: { gradeName: string };
  level?: number;
  status?: string;
}

export interface Grade {
  id: string;
  companyId?: string;
  gradeName: string;
  gradeCode: string;
  minSalary?: number;
  maxSalary?: number;
  sortOrder?: number;
  status?: string;
}

export interface CostCenter {
  id: string;
  companyId?: string;
  costCenterName: string;
  costCenterCode: string;
  branchId?: string;
  departmentId?: string;
  status?: string;
}

// Employee
export interface Employee {
  id: string;
  employeeCode: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  gender: string;
  dateOfBirth: string;
  dateOfJoining: string;
  employeeType: string;
  employmentStatus: string;
  department?: { departmentName: string };
  designation?: { designationName: string };
  branch?: { branchName: string };
  grade?: { gradeName: string };
  reportingManager?: { id: string; fullName: string };
}
