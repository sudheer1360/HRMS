import api from '@lib/axios';

export const analyticsService = {
  getHeadcount: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/extended/analytics/headcount?${q}`).then(r => r.data);
  },
  getAttrition: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/extended/analytics/attrition?${q}`).then(r => r.data);
  },
  getPayrollAnalytics: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/extended/analytics/payroll?${q}`).then(r => r.data);
  },
  getAttendanceAnalytics: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/extended/analytics/attendance?${q}`).then(r => r.data);
  },
  generateReport: (type: string, params?: Record<string, any>) =>
    api.post(`/extended/analytics/reports/${type}`, params).then(r => r.data),
  getDashboardMetrics: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/extended/analytics/dashboard?${q}`).then(r => r.data);
  },
};
