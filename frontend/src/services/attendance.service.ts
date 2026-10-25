import api from '@lib/axios';

export const attendanceService = {
  // Clock
  clockIn: (payload?: { location?: string; notes?: string }) =>
    api.post('/attendance/clock-in', payload ?? {}).then(r => r.data),

  clockOut: (payload?: { notes?: string }) =>
    api.post('/attendance/clock-out', payload ?? {}).then(r => r.data),

  // Lists
  list: (params: Record<string, string | number>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/attendance?${q}`).then(r => r.data);
  },

  listMy: (params: Record<string, string | number>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/attendance/my?${q}`).then(r => r.data);
  },

  getDailySummary: (date: string) =>
    api.get(`/attendance/summary?date=${date}`).then(r => r.data),

  getMonthlySummary: (year: number, month: number) =>
    api.get(`/attendance/my/summary?year=${year}&month=${month}`).then(r => r.data.data?.summary),

  // Manual entry / update
  manualEntry: (payload: {
    employeeId: string;
    date: string;
    checkIn?: string;
    checkOut?: string;
    status: string;
  }) => api.post('/attendance', payload).then(r => r.data),

  updateEntry: (id: string, payload: { checkIn?: string; checkOut?: string }) =>
    api.put(`/attendance/${id}`, payload).then(r => r.data),

  // Corrections
  listCorrections: (params?: Record<string, string | number>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/attendance/corrections?${q}`).then(r => r.data);
  },

  submitCorrection: (payload: {
    attendanceDate: string;
    requestedInTime?: string;
    requestedOutTime?: string;
    reason: string;
  }) => api.post('/attendance/corrections', payload).then(r => r.data),

  approveCorrection: (id: string, notes?: string) =>
    api.patch(`/attendance/corrections/${id}/approve`, { notes }).then(r => r.data),

  rejectCorrection: (id: string, notes?: string) =>
    api.patch(`/attendance/corrections/${id}/reject`, { notes }).then(r => r.data),

  // Locks
  listLocks: (companyId: string) =>
    api.get(`/attendance/locks/${companyId}`).then(r => r.data.data ?? []),

  lockPeriod: (payload: { companyId: string; fromDate: string; toDate: string }) =>
    api.post('/attendance/lock', payload).then(r => r.data),

  unlockPeriod: (id: string, reason?: string) =>
    api.patch(`/attendance/lock/${id}/unlock`, { reason }).then(r => r.data),
};
