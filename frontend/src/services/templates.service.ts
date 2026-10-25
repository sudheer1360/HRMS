import api from '@lib/axios';

export const templatesService = {
  list: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/extended/templates?${q}`).then(r => r.data);
  },
  getById: (id: string) =>
    api.get(`/extended/templates/${id}`).then(r => r.data),
  create: (payload: Record<string, any>) =>
    api.post('/extended/templates', payload).then(r => r.data),
  update: (id: string, payload: Record<string, any>) =>
    api.put(`/extended/templates/${id}`, payload).then(r => r.data),
  archive: (id: string) =>
    api.patch(`/extended/templates/${id}/archive`).then(r => r.data),
  delete: (id: string) =>
    api.delete(`/extended/templates/${id}`).then(r => r.data),
  preview: (id: string, variables?: Record<string, any>) =>
    api.post(`/extended/templates/${id}/preview`, { variables }).then(r => r.data),
};
