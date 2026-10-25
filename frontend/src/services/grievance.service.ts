import api from '@lib/axios';

export const grievanceService = {
  list: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/extended/grievances?${q}`).then(r => r.data);
  },
  getById: (id: string) =>
    api.get(`/extended/grievances/${id}`).then(r => r.data),
  submit: (payload: Record<string, any>) =>
    api.post('/extended/grievances', payload).then(r => r.data),
  update: (id: string, payload: Record<string, any>) =>
    api.put(`/extended/grievances/${id}`, payload).then(r => r.data),
  escalate: (id: string, reason: string) =>
    api.patch(`/extended/grievances/${id}/escalate`, { reason }).then(r => r.data),
  resolve: (id: string, resolution: string) =>
    api.patch(`/extended/grievances/${id}/resolve`, { resolution }).then(r => r.data),
  close: (id: string) =>
    api.patch(`/extended/grievances/${id}/close`).then(r => r.data),

  // Comments
  listComments: (id: string) =>
    api.get(`/extended/grievances/${id}/comments`).then(r => r.data),
  addComment: (id: string, comment: string) =>
    api.post(`/extended/grievances/${id}/comments`, { comment }).then(r => r.data),

  getSLAStatus: (id: string) =>
    api.get(`/extended/grievances/${id}/sla`).then(r => r.data),
};
