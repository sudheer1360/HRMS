import api from '@lib/axios';

export const operationsService = {
  // Performance
  listCycles: (companyId: string) =>
    api.get(`/operations/performance/cycles/${companyId}`).then(r => r.data),
  createCycle: (payload: Record<string, any>) =>
    api.post('/operations/performance/cycles', payload).then(r => r.data),
  submitSelfReview: (cycleId: string, payload: Record<string, any>) =>
    api.post(`/operations/performance/cycles/${cycleId}/self-review`, payload).then(r => r.data),
  submitManagerReview: (reviewId: string, payload: Record<string, any>) =>
    api.post(`/operations/performance/reviews/${reviewId}/manager-review`, payload).then(r => r.data),
  listReviews: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/operations/performance/reviews?${q}`).then(r => r.data);
  },

  // Assets
  listAssets: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/operations/assets?${q}`).then(r => r.data);
  },
  createAsset: (payload: Record<string, any>) =>
    api.post('/operations/assets', payload).then(r => r.data),
  allocateAsset: (id: string, payload: Record<string, any>) =>
    api.patch(`/operations/assets/${id}/allocate`, payload).then(r => r.data),
  returnAsset: (id: string, payload: Record<string, any>) =>
    api.patch(`/operations/assets/${id}/return`, payload).then(r => r.data),

  // Grievances
  listGrievances: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/operations/grievances?${q}`).then(r => r.data);
  },
  submitGrievance: (payload: Record<string, any>) =>
    api.post('/operations/grievances', payload).then(r => r.data),

  // Disciplinary
  listDisciplinary: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/operations/disciplinary?${q}`).then(r => r.data);
  },
  createDisciplinary: (payload: Record<string, any>) =>
    api.post('/operations/disciplinary', payload).then(r => r.data),

  // Exits
  listExits: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/operations/exits?${q}`).then(r => r.data);
  },
  initiateExit: (payload: Record<string, any>) =>
    api.post('/operations/exits', payload).then(r => r.data),
  processFnf: (id: string, payload: Record<string, any>) =>
    api.patch(`/operations/exits/${id}/fnf`, payload).then(r => r.data),
};
