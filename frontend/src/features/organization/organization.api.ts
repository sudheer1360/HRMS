import api from '@lib/axios';
import type {
  Company,
  Branch,
  Department,
  Designation,
  Grade,
  CostCenter,
  PaginatedResponse,
} from '@types';

export async function getCompanies(options?: { search?: string; status?: string; page?: number; limit?: number }) {
  const params = new URLSearchParams();
  if (options?.search) params.set('search', options.search);
  if (options?.status) params.set('status', options.status);
  params.set('page', String(options?.page ?? 1));
  params.set('limit', String(options?.limit ?? 50));

  const { data } = await api.get<PaginatedResponse<Company>>(`/organization/companies?${params}`);
  return data;
}

export async function createCompany(payload: Partial<Company>) {
  const { data } = await api.post<{ data: Company }>('/organization/companies', payload);
  return data.data;
}

export async function getBranches(companyId: string) {
  const { data } = await api.get<{ data: Branch[] }>(`/organization/companies/${companyId}/branches`);
  return data.data;
}

export async function createBranch(payload: { companyId: string; branchName: string; branchCode: string; branchType: string; address: string; city: string; state: string; country?: string; pinCode?: string; isPayrollLocation?: boolean }) {
  const { data } = await api.post<{ data: Branch }>('/organization/branches', payload);
  return data.data;
}

export async function getDepartments(companyId: string) {
  const { data } = await api.get<{ data: Department[] }>(`/organization/companies/${companyId}/departments`);
  return data.data;
}

export async function createDepartment(payload: { companyId: string; branchId?: string; parentDepartmentId?: string; departmentName: string; departmentCode: string; departmentHeadId?: string; costCenterId?: string }) {
  const { data } = await api.post<{ data: Department }>('/organization/departments', payload);
  return data.data;
}

export async function getDesignations(companyId: string) {
  const { data } = await api.get<{ data: Array<Designation & { grade_name?: string }> }>(`/organization/companies/${companyId}/designations`);
  return data.data.map((item) => ({
    ...item,
    grade: (item as any).gradeName ? { gradeName: (item as any).gradeName } : undefined,
  }));
}

export async function createDesignation(payload: { companyId: string; designationName: string; designationCode: string; gradeId?: string; level?: number }) {
  const { data } = await api.post<{ data: Designation }>('/organization/designations', payload);
  return data.data;
}

export async function getGrades(companyId: string) {
  const { data } = await api.get<{ data: Grade[] }>(`/organization/companies/${companyId}/grades`);
  return data.data;
}

export async function createGrade(payload: { companyId: string; gradeName: string; gradeCode: string; minSalary?: number; maxSalary?: number; sortOrder?: number }) {
  const { data } = await api.post<{ data: Grade }>('/organization/grades', payload);
  return data.data;
}

export async function getCostCenters(companyId: string) {
  const { data } = await api.get<{ data: CostCenter[] }>(`/organization/companies/${companyId}/cost-centers`);
  return data.data;
}

export async function createCostCenter(payload: { companyId: string; costCenterName: string; costCenterCode: string; branchId?: string; departmentId?: string }) {
  const { data } = await api.post<{ data: CostCenter }>('/organization/cost-centers', payload);
  return data.data;
}

// ── Update functions ────────────────────────────────────────────────────────

export async function updateCompany(id: string, payload: Partial<Company>) {
  const { data } = await api.put<{ data: Company }>(`/organization/companies/${id}`, payload);
  return data.data;
}

export async function updateBranch(id: string, payload: Partial<Branch>) {
  const { data } = await api.put<{ data: Branch }>(`/organization/branches/${id}`, payload);
  return data.data;
}

export async function updateDepartment(id: string, payload: { departmentName: string; status?: string; departmentHeadId?: string; parentDepartmentId?: string | null; branchId?: string | null }) {
  const { data } = await api.put<{ data: Department }>(`/organization/departments/${id}`, payload);
  return data.data;
}

export async function updateDesignation(id: string, payload: { designationName: string; gradeId?: string; level?: number; status?: string }) {
  const { data } = await api.put<{ data: Designation }>(`/organization/designations/${id}`, payload);
  return data.data;
}

export async function updateGrade(id: string, payload: { gradeName: string; minSalary?: number; maxSalary?: number; sortOrder?: number; status?: string }) {
  const { data } = await api.put<{ data: Grade }>(`/organization/grades/${id}`, payload);
  return data.data;
}

export async function updateCostCenter(id: string, payload: { costCenterName: string; status?: string }) {
  const { data } = await api.put<{ data: CostCenter }>(`/organization/cost-centers/${id}`, payload);
  return data.data;
}

// ── Delete functions ────────────────────────────────────────────────────────

export async function deleteBranch(id: string) {
  const { data } = await api.delete<{ data: { message: string } }>(`/organization/branches/${id}`);
  return data.data;
}

export async function deleteDepartment(id: string) {
  const { data } = await api.delete<{ data: { message: string } }>(`/organization/departments/${id}`);
  return data.data;
}

export async function deleteDesignation(id: string) {
  const { data } = await api.delete<{ data: { message: string } }>(`/organization/designations/${id}`);
  return data.data;
}

export async function deleteGrade(id: string) {
  const { data } = await api.delete<{ data: { message: string } }>(`/organization/grades/${id}`);
  return data.data;
}

export async function deleteCostCenter(id: string) {
  const { data } = await api.delete<{ data: { message: string } }>(`/organization/cost-centers/${id}`);
  return data.data;
}

// ── Hierarchy (Org Chart) ──────────────────────────────────────────────────

export interface DeptTreeNode {
  id: string;
  departmentName: string;
  departmentCode: string;
  level: number;
  status?: string;
  children: DeptTreeNode[];
}

export async function getDepartmentTree(companyId: string): Promise<DeptTreeNode[]> {
  const { data } = await api.get<{ data: DeptTreeNode[] }>(`/organization/companies/${companyId}/departments/tree`);
  return data.data;
}
