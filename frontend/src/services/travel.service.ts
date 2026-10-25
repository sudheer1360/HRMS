import api from '@lib/axios';

export const travelService = {
  // Travel Requests
  listRequests: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/travel/requests?${q}`).then(r => r.data);
  },
  createRequest: (payload: Record<string, any>) =>
    api.post('/travel/requests', payload).then(r => r.data),
  updateRequest: (id: string, payload: Record<string, any>) =>
    api.patch(`/travel/requests/${id}`, payload).then(r => r.data),
  approveRequest: (id: string) =>
    api.patch(`/travel/requests/${id}/approve`).then(r => r.data),
  rejectRequest: (id: string) =>
    api.patch(`/travel/requests/${id}/reject`).then(r => r.data),

  // Travel Expenses
  listExpenses: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/travel/expenses?${q}`).then(r => r.data);
  },
  createExpense: (payload: Record<string, any>) =>
    api.post('/travel/expenses', payload).then(r => r.data),
  approveExpense: (id: string) =>
    api.patch(`/travel/expenses/${id}/approve`).then(r => r.data),

  // Travel Advances
  listAdvances: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/travel/advances?${q}`).then(r => r.data);
  },
  createAdvance: (payload: Record<string, any>) =>
    api.post('/travel/advances', payload).then(r => r.data),
};
