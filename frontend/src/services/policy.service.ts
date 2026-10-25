import api from '@lib/axios';

export const policyService = {
  list: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/policies?${q}`).then(r => r.data.data ?? []);
  },
  getById: (id: string) =>
    api.get(`/policies/${id}`).then(r => r.data),
  create: (payload: Record<string, any>) =>
    api.post('/policies', payload).then(r => r.data),
  update: (id: string, payload: Record<string, any>) =>
    api.put(`/policies/${id}`, payload).then(r => r.data),
  publish: (id: string) =>
    api.post(`/policies/${id}/publish`).then(r => r.data),
  delete: (id: string) =>
    api.delete(`/policies/${id}`).then(r => r.data),
  getStats: (id: string) =>
    api.get(`/policies/${id}/stats`).then(r => r.data),

  // Employee
  listMy: () =>
    api.get('/policies/my/all').then(r => r.data.data ?? []),
  acknowledge: (policyId: string) =>
    api.post('/policies/acknowledge', { policyId }).then(r => r.data),
};
