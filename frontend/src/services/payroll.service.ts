import api from '@lib/axios';

export const payrollService = {
  // Salary Components
  listComponents: (companyId: string) =>
    api.get(`/payroll/components/${companyId}`).then(r => r.data),

  createComponent: (payload: Record<string, any>) =>
    api.post('/payroll/components', payload).then(r => r.data),

  // Salary Structures
  listAllStructures: () =>
    api.get('/payroll/salary-structures?limit=30').then(r => r.data),

  listStructures: (companyId: string) =>
    api.get(`/payroll/structures/${companyId}`).then(r => r.data),

  createStructure: (payload: Record<string, any>) =>
    api.post('/payroll/salary-structures', payload).then(r => r.data),

  deleteStructure: (id: string) =>
    api.delete(`/payroll/salary-structures/${id}`).then(r => r.data),

  // Payroll Runs
  listRuns: (params?: Record<string, string | number>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/payroll/runs?${q}`).then(r => r.data);
  },

  createRun: (payload: Record<string, any>) =>
    api.post('/payroll/runs', payload).then(r => r.data),

  processRun: (id: string) =>
    api.post(`/payroll/runs/${id}/process`).then(r => r.data),

  approveRun: (id: string, notes?: string) =>
    api.post(`/payroll/runs/${id}/approve`, { notes }).then(r => r.data),

  // Payslips
  listMyPayslips: () =>
    api.get('/payroll/my-payslips').then(r => r.data),

  // Expense Claims
  listMyExpenses: (params?: Record<string, string | number>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/payroll/expenses/my?${q}`).then(r => r.data);
  },

  listExpenses: (params?: Record<string, string | number>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/payroll/expenses?${q}`).then(r => r.data);
  },

  submitExpense: (payload: Record<string, any>) =>
    api.post('/payroll/expenses', payload).then(r => r.data),

  actionExpense: (id: string, action: 'approve' | 'reject') =>
    api.patch(`/payroll/expenses/${id}/${action}`).then(r => r.data),
};
