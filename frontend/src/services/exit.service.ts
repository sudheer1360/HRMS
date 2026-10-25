import api from '@lib/axios';

export const exitService = {
  // Exit Requests
  list: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/extended/exit/requests?${q}`).then(r => r.data);
  },
  getById: (id: string) =>
    api.get(`/extended/exit/requests/${id}`).then(r => r.data),
  initiate: (payload: Record<string, any>) =>
    api.post('/extended/exit/requests', payload).then(r => r.data),
  update: (id: string, payload: Record<string, any>) =>
    api.put(`/extended/exit/requests/${id}`, payload).then(r => r.data),
  approve: (id: string, payload: Record<string, any>) =>
    api.patch(`/extended/exit/requests/${id}/approve`, payload).then(r => r.data),
  reject: (id: string, reason: string) =>
    api.patch(`/extended/exit/requests/${id}/reject`, { reason }).then(r => r.data),
  withdraw: (id: string) =>
    api.patch(`/extended/exit/requests/${id}/withdraw`).then(r => r.data),

  // Clearances
  listClearances: (exitId: string) =>
    api.get(`/extended/exit/requests/${exitId}/clearances`).then(r => r.data),
  updateClearance: (exitId: string, clearanceId: string, payload: Record<string, any>) =>
    api.patch(`/extended/exit/requests/${exitId}/clearances/${clearanceId}`, payload).then(r => r.data),

  // FnF
  processFnf: (exitId: string, payload: Record<string, any>) =>
    api.post(`/extended/exit/requests/${exitId}/fnf`, payload).then(r => r.data),
  getFnf: (exitId: string) =>
    api.get(`/extended/exit/requests/${exitId}/fnf`).then(r => r.data),

  // Exit Interviews
  listInterviews: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/extended/exit/interviews?${q}`).then(r => r.data);
  },
  submitInterview: (payload: Record<string, any>) =>
    api.post('/extended/exit/interviews', payload).then(r => r.data),
};
