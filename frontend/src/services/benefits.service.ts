import api from '@lib/axios';

export const benefitsService = {
  // Benefit Policies
  listPolicies: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/extended/benefits/policies?${q}`).then(r => r.data);
  },
  getPolicyById: (id: string) =>
    api.get(`/extended/benefits/policies/${id}`).then(r => r.data),
  createPolicy: (payload: Record<string, any>) =>
    api.post('/extended/benefits/policies', payload).then(r => r.data),
  updatePolicy: (id: string, payload: Record<string, any>) =>
    api.put(`/extended/benefits/policies/${id}`, payload).then(r => r.data),
  deletePolicy: (id: string) =>
    api.delete(`/extended/benefits/policies/${id}`).then(r => r.data),

  // Claims
  listClaims: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/extended/benefits/claims?${q}`).then(r => r.data);
  },
  getMyClaims: () =>
    api.get('/extended/benefits/claims/my').then(r => r.data),
  submitClaim: (payload: Record<string, any>) =>
    api.post('/extended/benefits/claims', payload).then(r => r.data),
  approveClaim: (id: string, payload: Record<string, any>) =>
    api.patch(`/extended/benefits/claims/${id}/approve`, payload).then(r => r.data),
  rejectClaim: (id: string, reason: string) =>
    api.patch(`/extended/benefits/claims/${id}/reject`, { reason }).then(r => r.data),

  // Enrollments
  listEnrollments: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/extended/benefits/enrollments?${q}`).then(r => r.data);
  },
  enroll: (payload: Record<string, any>) =>
    api.post('/extended/benefits/enrollments', payload).then(r => r.data),
};
