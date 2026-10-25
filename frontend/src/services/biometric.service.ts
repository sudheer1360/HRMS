import api from '@lib/axios';

export const biometricService = {
  // Devices
  listDevices: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/extended/biometric/devices?${q}`).then(r => r.data);
  },
  createDevice: (payload: Record<string, any>) =>
    api.post('/extended/biometric/devices', payload).then(r => r.data),
  updateDevice: (id: string, payload: Record<string, any>) =>
    api.put(`/extended/biometric/devices/${id}`, payload).then(r => r.data),
  deleteDevice: (id: string) =>
    api.delete(`/extended/biometric/devices/${id}`).then(r => r.data),
  syncDevice: (id: string) =>
    api.post(`/extended/biometric/devices/${id}/sync`).then(r => r.data),
  getSyncStatus: (id: string) =>
    api.get(`/extended/biometric/devices/${id}/sync-status`).then(r => r.data),

  // Logs
  listLogs: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/extended/biometric/logs?${q}`).then(r => r.data);
  },

  // Exceptions
  listExceptions: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/extended/biometric/exceptions?${q}`).then(r => r.data);
  },
  resolveException: (id: string, resolution: string) =>
    api.patch(`/extended/biometric/exceptions/${id}/resolve`, { resolution }).then(r => r.data),
};
