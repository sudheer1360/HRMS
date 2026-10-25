import api from '@lib/axios';

export const assetsService = {
  list: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/extended/assets?${q}`).then(r => r.data);
  },
  getById: (id: string) =>
    api.get(`/extended/assets/${id}`).then(r => r.data),
  create: (payload: Record<string, any>) =>
    api.post('/extended/assets', payload).then(r => r.data),
  update: (id: string, payload: Record<string, any>) =>
    api.put(`/extended/assets/${id}`, payload).then(r => r.data),
  delete: (id: string) =>
    api.delete(`/extended/assets/${id}`).then(r => r.data),

  // Allocations
  listAllocations: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/extended/assets/allocations?${q}`).then(r => r.data);
  },
  allocate: (assetId: string, payload: Record<string, any>) =>
    api.post(`/extended/assets/${assetId}/allocate`, payload).then(r => r.data),
  returnAsset: (assetId: string, payload: Record<string, any>) =>
    api.post(`/extended/assets/${assetId}/return`, payload).then(r => r.data),

  // Maintenance
  listMaintenance: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/extended/assets/maintenance?${q}`).then(r => r.data);
  },
  scheduleMaintenance: (assetId: string, payload: Record<string, any>) =>
    api.post(`/extended/assets/${assetId}/maintenance`, payload).then(r => r.data),
};
