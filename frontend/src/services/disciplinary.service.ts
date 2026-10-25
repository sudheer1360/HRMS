import api from '@lib/axios';

export const disciplinaryService = {
  // Cases
  list: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/extended/disciplinary?${q}`).then(r => r.data);
  },
  getById: (id: string) =>
    api.get(`/extended/disciplinary/${id}`).then(r => r.data),
  create: (payload: Record<string, any>) =>
    api.post('/extended/disciplinary', payload).then(r => r.data),
  update: (id: string, payload: Record<string, any>) =>
    api.put(`/extended/disciplinary/${id}`, payload).then(r => r.data),

  // Workflow
  issueShowCause: (id: string, payload: Record<string, any>) =>
    api.post(`/extended/disciplinary/${id}/show-cause`, payload).then(r => r.data),
  submitShowCauseResponse: (id: string, response: string) =>
    api.post(`/extended/disciplinary/${id}/show-cause-response`, { response }).then(r => r.data),
  scheduleHearing: (id: string, payload: Record<string, any>) =>
    api.post(`/extended/disciplinary/${id}/hearing`, payload).then(r => r.data),
  recordAction: (id: string, payload: Record<string, any>) =>
    api.post(`/extended/disciplinary/${id}/action`, payload).then(r => r.data),
  close: (id: string, summary: string) =>
    api.patch(`/extended/disciplinary/${id}/close`, { summary }).then(r => r.data),

  getSummary: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/extended/disciplinary/summary?${q}`).then(r => r.data);
  },
};
