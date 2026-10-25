import api from '@lib/axios';

export const performanceService = {
  // Goals
  listMyGoals: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/performance/goals/my?${q}`).then(r => r.data);
  },
  createGoal: (payload: Record<string, any>) =>
    api.post('/performance/goals', payload).then(r => r.data),
  updateGoalProgress: (id: string, progress: number, notes?: string) =>
    api.patch(`/performance/goals/${id}/progress`, { progress, notes }).then(r => r.data),
  deleteGoal: (id: string) =>
    api.delete(`/performance/goals/${id}`).then(r => r.data),

  // Appraisals
  listMyAppraisals: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/performance/appraisals/my?${q}`).then(r => r.data);
  },
  listTeamAppraisals: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/performance/appraisals/team?${q}`).then(r => r.data);
  },
  selfAssessment: (id: string, payload: Record<string, any>) =>
    api.post(`/performance/appraisals/${id}/self-assessment`, payload).then(r => r.data),
  managerRating: (id: string, rating: number, comments: string) =>
    api.patch(`/performance/appraisals/${id}/manager-rating`, { rating, comments }).then(r => r.data),

  // Feedback
  listMyFeedback: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/performance/feedback/my?${q}`).then(r => r.data);
  },
  submitFeedback: (payload: Record<string, any>) =>
    api.post('/performance/feedback', payload).then(r => r.data),

  // Reviews
  listReviews: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/performance/reviews?${q}`).then(r => r.data);
  },

  // Probation
  listProbation: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/performance/probation?${q}`).then(r => r.data);
  },
  probationDecision: (id: string, decision: string, notes?: string) =>
    api.patch(`/performance/probation/${id}/decision`, { decision, notes }).then(r => r.data),
};
