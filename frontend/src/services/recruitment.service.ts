import api from '@lib/axios';

export const recruitmentService = {
  // Requisitions
  listRequisitions: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/recruitment/requisitions?${q}`).then(r => r.data);
  },
  getRequisition: (id: string) =>
    api.get(`/recruitment/requisitions/${id}`).then(r => r.data),
  createRequisition: (payload: Record<string, any>) =>
    api.post('/recruitment/requisitions', payload).then(r => r.data),
  updateRequisition: (id: string, payload: Record<string, any>) =>
    api.put(`/recruitment/requisitions/${id}`, payload).then(r => r.data),
  approveRequisition: (id: string) =>
    api.patch(`/recruitment/requisitions/${id}/approve`).then(r => r.data),
  deleteRequisition: (id: string) =>
    api.delete(`/recruitment/requisitions/${id}`).then(r => r.data),

  // Jobs
  listJobs: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/recruitment/jobs?${q}`).then(r => r.data.data ?? []);
  },
  getJob: (id: string) =>
    api.get(`/recruitment/jobs/${id}`).then(r => r.data),
  createJob: (payload: Record<string, any>) =>
    api.post('/recruitment/jobs', payload).then(r => r.data),
  updateJob: (id: string, payload: Record<string, any>) =>
    api.put(`/recruitment/jobs/${id}`, payload).then(r => r.data),
  deleteJob: (id: string) =>
    api.delete(`/recruitment/jobs/${id}`).then(r => r.data),

  // Candidates
  listCandidates: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/recruitment/candidates?${q}`).then(r => r.data);
  },
  getCandidate: (id: string) =>
    api.get(`/recruitment/candidates/${id}`).then(r => r.data),
  addCandidate: (payload: Record<string, any>) =>
    api.post('/recruitment/candidates', payload).then(r => r.data),
  updateCandidateStage: (id: string, stage: string) =>
    api.patch(`/recruitment/candidates/${id}/stage`, { stage }).then(r => r.data),
  rejectCandidate: (id: string, reason?: string) =>
    api.patch(`/recruitment/candidates/${id}/reject`, { reason }).then(r => r.data),

  // Interviews
  listInterviews: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/recruitment/interviews?${q}`).then(r => r.data.data ?? []);
  },
  scheduleInterview: (payload: Record<string, any>) =>
    api.post('/recruitment/interviews', payload).then(r => r.data),
  submitInterviewFeedback: (id: string, payload: Record<string, any>) =>
    api.patch(`/recruitment/interviews/${id}/feedback`, payload).then(r => r.data),

  // Offers
  listOffers: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/recruitment/offers?${q}`).then(r => r.data.data ?? []);
  },
  createOffer: (payload: Record<string, any>) =>
    api.post('/recruitment/offers', payload).then(r => r.data),
  updateOfferStatus: (id: string, status: string) =>
    api.patch(`/recruitment/offers/${id}/status`, { status }).then(r => r.data),

  // Salary Fitments
  listSalaryFitments: () =>
    api.get('/recruitment/salary-fitments').then(r => r.data),
  createSalaryFitment: (payload: Record<string, any>) =>
    api.post('/recruitment/salary-fitments', payload).then(r => r.data),

  // Joining Formalities
  listJoiningFormalities: () =>
    api.get('/recruitment/joining-formalities').then(r => r.data),
  createJoiningFormality: (payload: Record<string, any>) =>
    api.post('/recruitment/joining-formalities', payload).then(r => r.data),

  // Appointment Letters
  listAppointmentLetters: () =>
    api.get('/recruitment/appointment-letters').then(r => r.data),
  createAppointmentLetter: (payload: Record<string, any>) =>
    api.post('/recruitment/appointment-letters', payload).then(r => r.data),
};

export const trainingService = {
  listPrograms: () =>
    api.get('/recruitment/training/programs').then(r => r.data),
  createProgram: (payload: Record<string, any>) =>
    api.post('/recruitment/training/programs', payload).then(r => r.data),
  deleteProgram: (id: string) =>
    api.delete(`/recruitment/training/programs/${id}`).then(r => r.data),

  listSessions: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/recruitment/training/sessions?${q}`).then(r => r.data);
  },
  createSession: (payload: Record<string, any>) =>
    api.post('/recruitment/training/sessions', payload).then(r => r.data),
  enrollSession: (id: string, employeeIds: string[]) =>
    api.post(`/recruitment/training/sessions/${id}/enroll`, { employeeIds }).then(r => r.data),
  submitFeedback: (id: string, payload: Record<string, any>) =>
    api.post(`/recruitment/training/sessions/${id}/feedback`, payload).then(r => r.data),

  listMyTraining: () =>
    api.get('/recruitment/training/my-training').then(r => r.data),
  listSkillMatrix: () =>
    api.get('/recruitment/training/skill-matrix').then(r => r.data),
  listCertifications: () =>
    api.get('/recruitment/training/certifications').then(r => r.data),
  createCertification: (payload: Record<string, any>) =>
    api.post('/recruitment/training/certifications', payload).then(r => r.data),
};
