import api from '@lib/axios';

export const statutoryService = {
  // PF
  calculatePF: (payload: Record<string, any>) =>
    api.post('/extended/statutory/pf/calculate', payload).then(r => r.data),
  getPFSummary: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/extended/statutory/pf/summary?${q}`).then(r => r.data);
  },
  listPFReturns: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/extended/statutory/pf/returns?${q}`).then(r => r.data);
  },

  // ESI
  calculateESI: (payload: Record<string, any>) =>
    api.post('/extended/statutory/esi/calculate', payload).then(r => r.data),
  getESISummary: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/extended/statutory/esi/summary?${q}`).then(r => r.data);
  },

  // TDS
  calculateTDS: (payload: Record<string, any>) =>
    api.post('/extended/statutory/tds/calculate', payload).then(r => r.data),
  getTDSSummary: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/extended/statutory/tds/summary?${q}`).then(r => r.data);
  },
  listForm16: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/extended/statutory/tds/form16?${q}`).then(r => r.data);
  },
  generateForm16: (employeeId: string, financialYear: string) =>
    api.post('/extended/statutory/tds/form16', { employeeId, financialYear }).then(r => r.data),

  // PT (Professional Tax)
  getPTSummary: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/extended/statutory/pt/summary?${q}`).then(r => r.data);
  },
};
