import api from '@lib/axios';

export const formbuilderService = {
  list: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/extended/formbuilder/forms?${q}`).then(r => r.data);
  },
  getById: (id: string) =>
    api.get(`/extended/formbuilder/forms/${id}`).then(r => r.data),
  create: (payload: Record<string, any>) =>
    api.post('/extended/formbuilder/forms', payload).then(r => r.data),
  update: (id: string, payload: Record<string, any>) =>
    api.put(`/extended/formbuilder/forms/${id}`, payload).then(r => r.data),
  delete: (id: string) =>
    api.delete(`/extended/formbuilder/forms/${id}`).then(r => r.data),
  publish: (id: string) =>
    api.post(`/extended/formbuilder/forms/${id}/publish`).then(r => r.data),

  // Submissions
  listSubmissions: (formId: string, params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/extended/formbuilder/forms/${formId}/submissions?${q}`).then(r => r.data);
  },
  submitResponse: (formId: string, payload: Record<string, any>) =>
    api.post(`/extended/formbuilder/forms/${formId}/submit`, payload).then(r => r.data),
  getSubmission: (formId: string, submissionId: string) =>
    api.get(`/extended/formbuilder/forms/${formId}/submissions/${submissionId}`).then(r => r.data),
};
