import api from '@lib/axios';

export const helpdeskService = {
  listMyTickets: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/platform/tickets/my?${q}`).then(r => r.data);
  },
  listTickets: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/platform/tickets?${q}`).then(r => r.data);
  },
  getTicketStats: () =>
    api.get('/platform/tickets/stats').then(r => r.data),
  createTicket: (payload: Record<string, any>) =>
    api.post('/platform/tickets', payload).then(r => r.data),
  updateTicket: (id: string, payload: Record<string, any>) =>
    api.patch(`/platform/tickets/${id}`, payload).then(r => r.data),
  listComments: (ticketId: string) =>
    api.get(`/platform/tickets/${ticketId}/comments`).then(r => r.data),
  addComment: (ticketId: string, comment: string, isInternal?: boolean) =>
    api.post(`/platform/tickets/${ticketId}/comments`, { comment, isInternal }).then(r => r.data),
  submitCSAT: (ticketId: string, rating: number) =>
    api.post(`/platform/tickets/${ticketId}/csat`, { rating }).then(r => r.data),
};

export const aiService = {
  ask: (query: string, conversationId?: string) =>
    api.post('/platform/ai/ask', { query, conversationId }).then(r => r.data),
  listConversations: () =>
    api.get('/platform/ai/conversations').then(r => r.data),
};

export const automationService = {
  listWorkflows: () =>
    api.get('/platform/automation/workflows').then(r => r.data),
  createWorkflow: (payload: Record<string, any>) =>
    api.post('/platform/automation/workflows', payload).then(r => r.data),
  toggleWorkflow: (id: string, isActive: boolean) =>
    api.patch(`/platform/automation/workflows/${id}`, { isActive }).then(r => r.data),
  listWorkflowLogs: (id: string) =>
    api.get(`/platform/automation/workflows/${id}/logs`).then(r => r.data),
};

export const reportsService = {
  list: () =>
    api.get('/platform/reports').then(r => r.data),
  create: (payload: Record<string, any>) =>
    api.post('/platform/reports', payload).then(r => r.data),
};

export const integrationService = {
  listApiKeys: () =>
    api.get('/platform/api-keys').then(r => r.data),
  createApiKey: (payload: Record<string, any>) =>
    api.post('/platform/api-keys', payload).then(r => r.data),
  revokeApiKey: (id: string) =>
    api.delete(`/platform/api-keys/${id}`).then(r => r.data),

  listWebhooks: () =>
    api.get('/platform/webhooks').then(r => r.data),
  createWebhook: (payload: Record<string, any>) =>
    api.post('/platform/webhooks', payload).then(r => r.data),
};
