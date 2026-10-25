import api from '@lib/axios';

export interface EmployeeListParams {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: string;
  status?: string;
  companyId?: string;
}

export const employeeService = {
  list: (params: EmployeeListParams = {}) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/employees?${q}`).then(r => r.data);
  },

  getById: (id: string) =>
    api.get(`/employees/${id}`).then(r => r.data.data),

  create: (payload: Record<string, any>) =>
    api.post('/employees', payload).then(r => r.data),

  update: (id: string, payload: Record<string, any>) =>
    api.put(`/employees/${id}`, payload).then(r => r.data),

  changeStatus: (id: string, status: string, reason?: string) =>
    api.patch(`/employees/${id}/status`, { status, reason }).then(r => r.data),

  delete: (id: string) =>
    api.delete(`/employees/${id}`).then(r => r.data),
};
