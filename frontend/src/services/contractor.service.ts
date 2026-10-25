import api from '@lib/axios';

export const contractorService = {
  // Contractors
  list: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/extended/contractors?${q}`).then(r => r.data);
  },
  getById: (id: string) =>
    api.get(`/extended/contractors/${id}`).then(r => r.data),
  create: (payload: Record<string, any>) =>
    api.post('/extended/contractors', payload).then(r => r.data),
  update: (id: string, payload: Record<string, any>) =>
    api.put(`/extended/contractors/${id}`, payload).then(r => r.data),
  delete: (id: string) =>
    api.delete(`/extended/contractors/${id}`).then(r => r.data),

  // Workers
  listWorkers: (contractorId: string) =>
    api.get(`/extended/contractors/${contractorId}/workers`).then(r => r.data),
  addWorker: (contractorId: string, payload: Record<string, any>) =>
    api.post(`/extended/contractors/${contractorId}/workers`, payload).then(r => r.data),
  updateWorker: (contractorId: string, workerId: string, payload: Record<string, any>) =>
    api.put(`/extended/contractors/${contractorId}/workers/${workerId}`, payload).then(r => r.data),

  // Attendance
  listAttendance: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return api.get(`/extended/contractors/attendance?${q}`).then(r => r.data);
  },
  markAttendance: (payload: Record<string, any>) =>
    api.post('/extended/contractors/attendance', payload).then(r => r.data),

  // Invoices
  listInvoices: (contractorId: string) =>
    api.get(`/extended/contractors/${contractorId}/invoices`).then(r => r.data),
  createInvoice: (contractorId: string, payload: Record<string, any>) =>
    api.post(`/extended/contractors/${contractorId}/invoices`, payload).then(r => r.data),
  approveInvoice: (contractorId: string, invoiceId: string) =>
    api.patch(`/extended/contractors/${contractorId}/invoices/${invoiceId}/approve`).then(r => r.data),

  // Compliance
  getCompliance: (contractorId: string) =>
    api.get(`/extended/contractors/${contractorId}/compliance`).then(r => r.data),
  updateCompliance: (contractorId: string, payload: Record<string, any>) =>
    api.put(`/extended/contractors/${contractorId}/compliance`, payload).then(r => r.data),
};
