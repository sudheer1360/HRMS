import api from '@lib/axios';

export const leaveService = {
  // Leave Types
  listTypes: (companyId: string) =>
    api.get(`/leaves/types/${companyId}`).then(r => r.data.data ?? []),

  createType: (payload: Record<string, any>) =>
    api.post('/leaves/types', payload).then(r => r.data),

  updateType: (id: string, payload: Record<string, any>) =>
    api.put(`/leaves/types/${id}`, payload).then(r => r.data),

  deleteType: (id: string) =>
    api.delete(`/leaves/types/${id}`).then(r => r.data),

  // Leave Policies
  createPolicy: (payload: Record<string, any>) =>
    api.post('/leaves/policies', payload).then(r => r.data),

  // Holidays
  listHolidays: (companyId: string, year?: number) => {
    const q = year ? `?year=${year}` : '';
    return api.get(`/leaves/holidays/${companyId}${q}`).then(r => r.data.data ?? []);
  },

  createHoliday: (payload: Record<string, any>) =>
    api.post('/leaves/holidays', payload).then(r => r.data),

  updateHoliday: (id: string, payload: Record<string, any>) =>
    api.put(`/leaves/holidays/${id}`, payload).then(r => r.data),

  deleteHoliday: (id: string) =>
    api.delete(`/leaves/holidays/${id}`).then(r => r.data),

  // Employee self-service
  listMy: (params?: Record<string, string | number>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/leaves/my-leaves?${q}`).then(r => r.data);
  },

  getMyBalance: () =>
    api.get('/leaves/my-balance').then(r => r.data.data ?? []),

  getMyCalendar: (month?: string) => {
    const q = month ? `?month=${month}` : '';
    return api.get(`/leaves/my-calendar${q}`).then(r => r.data);
  },

  apply: (payload: {
    leaveTypeId: string;
    fromDate: string;
    toDate: string;
    reason?: string;
    halfDay?: string;
  }) => api.post('/leaves/apply', payload).then(r => r.data),

  cancel: (id: string, reason?: string) =>
    api.patch(`/leaves/${id}/cancel`, { reason }).then(r => r.data),

  // Admin / Manager
  list: (params?: Record<string, string | number>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/leaves?${q}`).then(r => r.data);
  },

  getById: (id: string) =>
    api.get(`/leaves/${id}`).then(r => r.data),

  approve: (id: string, payload: { status: string; comments?: string; remarks?: string }) =>
    api.patch(`/leaves/${id}/approve`, payload).then(r => r.data),

  // Balance management
  getBalance: (employeeId: string) =>
    api.get(`/leaves/balance/${employeeId}`).then(r => r.data),

  initBalances: (payload: { companyId: string; year: number }) =>
    api.post('/leaves/balances/init', payload).then(r => r.data),

  updateBalance: (id: string, payload: Record<string, any>) =>
    api.put(`/leaves/balances/${id}`, payload).then(r => r.data),
};
