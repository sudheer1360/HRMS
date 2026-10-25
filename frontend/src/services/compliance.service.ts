import api from '@lib/axios';

export const complianceService = {
  // Calendar
  listCalendar: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/compliance/calendar?${q}`).then(r => r.data);
  },
  createCalendarEvent: (payload: Record<string, any>) =>
    api.post('/compliance/calendar', payload).then(r => r.data),

  // Filings
  listFilings: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/compliance/filings?${q}`).then(r => r.data);
  },
  createFiling: (payload: Record<string, any>) =>
    api.post('/compliance/filings', payload).then(r => r.data),
  markFiled: (id: string, challanNo?: string) =>
    api.patch(`/compliance/filings/${id}/mark-filed`, { challanNo }).then(r => r.data),

  // Reports
  listReports: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/compliance/reports?${q}`).then(r => r.data);
  },
  generateReport: (id: string) =>
    api.post(`/compliance/reports/${id}/generate`).then(r => r.data),

  // Checklist
  listChecklist: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/compliance/checklist?${q}`).then(r => r.data);
  },
  toggleChecklistItem: (id: string) =>
    api.patch(`/compliance/checklist/${id}/toggle`).then(r => r.data),

  // Documents
  listDocuments: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/compliance/documents?${q}`).then(r => r.data);
  },
  createDocument: (payload: Record<string, any>) =>
    api.post('/compliance/documents', payload).then(r => r.data),
};
