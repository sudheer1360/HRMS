import api from '@lib/axios';

export const shiftService = {
  // Shifts
  listShifts: (companyId: string) =>
    api.get(`/shifts/shifts/${companyId}`).then(r => r.data.data ?? []),
  createShift: (payload: Record<string, any>) =>
    api.post('/shifts/shifts', payload).then(r => r.data),
  updateShift: (id: string, payload: Record<string, any>) =>
    api.put(`/shifts/shifts/${id}`, payload).then(r => r.data),
  deleteShift: (id: string) =>
    api.delete(`/shifts/shifts/${id}`).then(r => r.data),

  // Rosters
  listRosters: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/shifts/rosters?${q}`).then(r => r.data.data ?? []);
  },
  createRoster: (payload: Record<string, any>) =>
    api.post('/shifts/rosters', payload).then(r => r.data),
  updateRoster: (id: string, payload: Record<string, any>) =>
    api.put(`/shifts/rosters/${id}`, payload).then(r => r.data),
  deleteRoster: (id: string) =>
    api.delete(`/shifts/rosters/${id}`).then(r => r.data),

  getMyShift: () =>
    api.get('/shifts/my-shift').then(r => r.data.data),
  getEmployeeShift: (employeeId: string) =>
    api.get(`/shifts/employee-shift/${employeeId}`).then(r => r.data),

  // Overtime
  listMyOvertime: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/shifts/overtime/my?${q}`).then(r => r.data.data ?? []);
  },
  listOvertime: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/shifts/overtime?${q}`).then(r => r.data.data ?? []);
  },
  submitOvertime: (payload: Record<string, any>) =>
    api.post('/shifts/overtime', payload).then(r => r.data),
  approveOvertime: (id: string, status: string, approvedHours?: number) =>
    api.patch(`/shifts/overtime/${id}/approve`, { status, approvedHours }).then(r => r.data),
};
