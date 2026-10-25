import api from '@lib/axios';

export const onboardingService = {
  // Onboarding Records
  list: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/extended/onboarding?${q}`).then(r => r.data);
  },
  getById: (id: string) =>
    api.get(`/extended/onboarding/${id}`).then(r => r.data),
  create: (payload: Record<string, any>) =>
    api.post('/extended/onboarding', payload).then(r => r.data),
  update: (id: string, payload: Record<string, any>) =>
    api.put(`/extended/onboarding/${id}`, payload).then(r => r.data),

  // Templates
  listTemplates: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/extended/onboarding/templates?${q}`).then(r => r.data);
  },
  createTemplate: (payload: Record<string, any>) =>
    api.post('/extended/onboarding/templates', payload).then(r => r.data),
  updateTemplate: (id: string, payload: Record<string, any>) =>
    api.put(`/extended/onboarding/templates/${id}`, payload).then(r => r.data),
  deleteTemplate: (id: string) =>
    api.delete(`/extended/onboarding/templates/${id}`).then(r => r.data),

  // Tasks
  listTasks: (onboardingId: string) =>
    api.get(`/extended/onboarding/${onboardingId}/tasks`).then(r => r.data),
  updateTask: (onboardingId: string, taskId: string, payload: Record<string, any>) =>
    api.patch(`/extended/onboarding/${onboardingId}/tasks/${taskId}`, payload).then(r => r.data),

  // My Onboarding (new joinees)
  getMyOnboarding: () =>
    api.get('/extended/onboarding/my').then(r => r.data),
  listMyTasks: () =>
    api.get('/extended/onboarding/my/tasks').then(r => r.data),
  completeMyTask: (taskId: string) =>
    api.patch(`/extended/onboarding/my/tasks/${taskId}/complete`).then(r => r.data),

  // BGV
  listBGV: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/extended/onboarding/bgv?${q}`).then(r => r.data);
  },
  updateBGV: (id: string, payload: Record<string, any>) =>
    api.patch(`/extended/onboarding/bgv/${id}`, payload).then(r => r.data),
};
