import api from '@lib/axios';

export const compensationService = {
  // Review Cycles
  listReviewCycles: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/compensation/review-cycles?${q}`).then(r => r.data);
  },
  createReviewCycle: (payload: Record<string, any>) =>
    api.post('/compensation/review-cycles', payload).then(r => r.data),
  activateReviewCycle: (id: string) =>
    api.post(`/compensation/review-cycles/${id}/activate`).then(r => r.data),

  // Bonuses
  listMyBonuses: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/compensation/bonuses/my?${q}`).then(r => r.data);
  },
  createBonus: (payload: Record<string, any>) =>
    api.post('/compensation/bonuses', payload).then(r => r.data),

  // Loans
  listMyLoans: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/compensation/loans/my?${q}`).then(r => r.data);
  },
  createLoan: (payload: Record<string, any>) =>
    api.post('/compensation/loans', payload).then(r => r.data),

  // Variable Pay
  listMyVariablePay: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/compensation/variable-pay/my?${q}`).then(r => r.data);
  },

  // CTC Revisions
  listMyCTCRevisions: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/compensation/ctc-revisions/my?${q}`).then(r => r.data);
  },
  createCTCRevision: (payload: Record<string, any>) =>
    api.post('/compensation/ctc-revisions', payload).then(r => r.data),
};
