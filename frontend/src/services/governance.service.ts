import api from '@lib/axios';

export const governanceService = {
  // Audit Logs
  listAuditLogs: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/extended/governance/audit-logs?${q}`).then(r => r.data);
  },

  // Sessions
  listSessions: () =>
    api.get('/extended/governance/sessions').then(r => r.data.data),

  // Health & System
  getHealth: () =>
    api.get('/extended/governance/health').then(r => r.data.data),
  getScope: () =>
    api.get('/extended/governance/scope').then(r => r.data.data),
  getFeatureFlags: () =>
    api.get('/extended/governance/feature-flags').then(r => r.data.data),

  // NFR
  getNFRPerformance: () =>
    api.get('/extended/governance/nfr/performance').then(r => r.data),
  getNFRScalability: () =>
    api.get('/extended/governance/nfr/scalability').then(r => r.data),
  getNFRDRStatus: () =>
    api.get('/extended/governance/nfr/dr-status').then(r => r.data),
  getNFRCompliance: () =>
    api.get('/extended/governance/nfr/compliance').then(r => r.data),
  getNFRAlerts: () =>
    api.get('/extended/governance/nfr/alerts').then(r => r.data),
};
