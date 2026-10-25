import api from '@lib/axios';

export const organizationService = {
  // Companies
  listCompanies: () =>
    api.get('/organization/companies').then(r => r.data),

  getCompany: (id: string) =>
    api.get(`/organization/companies/${id}`).then(r => r.data),

  createCompany: (payload: Record<string, any>) =>
    api.post('/organization/companies', payload).then(r => r.data),

  updateCompany: (id: string, payload: Record<string, any>) =>
    api.put(`/organization/companies/${id}`, payload).then(r => r.data),

  deleteCompany: (id: string) =>
    api.delete(`/organization/companies/${id}`).then(r => r.data),

  // Branches
  listBranches: (companyId: string) =>
    api.get(`/organization/companies/${companyId}/branches`).then(r => r.data),

  getBranch: (id: string) =>
    api.get(`/organization/branches/${id}`).then(r => r.data),

  createBranch: (payload: Record<string, any>) =>
    api.post('/organization/branches', payload).then(r => r.data),

  updateBranch: (id: string, payload: Record<string, any>) =>
    api.put(`/organization/branches/${id}`, payload).then(r => r.data),

  deleteBranch: (id: string) =>
    api.delete(`/organization/branches/${id}`).then(r => r.data),

  // Departments
  listDepartments: (companyId: string) =>
    api.get(`/organization/companies/${companyId}/departments`).then(r => r.data),

  getDepartmentTree: (companyId: string) =>
    api.get(`/organization/companies/${companyId}/departments/tree`).then(r => r.data),

  createDepartment: (payload: Record<string, any>) =>
    api.post('/organization/departments', payload).then(r => r.data),

  updateDepartment: (id: string, payload: Record<string, any>) =>
    api.put(`/organization/departments/${id}`, payload).then(r => r.data),

  deleteDepartment: (id: string) =>
    api.delete(`/organization/departments/${id}`).then(r => r.data),

  // Designations
  listDesignations: (companyId: string) =>
    api.get(`/organization/companies/${companyId}/designations`).then(r => r.data),

  createDesignation: (payload: Record<string, any>) =>
    api.post('/organization/designations', payload).then(r => r.data),

  updateDesignation: (id: string, payload: Record<string, any>) =>
    api.put(`/organization/designations/${id}`, payload).then(r => r.data),

  deleteDesignation: (id: string) =>
    api.delete(`/organization/designations/${id}`).then(r => r.data),

  // Grades
  listGrades: (companyId: string) =>
    api.get(`/organization/companies/${companyId}/grades`).then(r => r.data),

  createGrade: (payload: Record<string, any>) =>
    api.post('/organization/grades', payload).then(r => r.data),

  updateGrade: (id: string, payload: Record<string, any>) =>
    api.put(`/organization/grades/${id}`, payload).then(r => r.data),

  deleteGrade: (id: string) =>
    api.delete(`/organization/grades/${id}`).then(r => r.data),

  // Cost Centers
  listCostCenters: (companyId: string) =>
    api.get(`/organization/companies/${companyId}/cost-centers`).then(r => r.data),

  createCostCenter: (payload: Record<string, any>) =>
    api.post('/organization/cost-centers', payload).then(r => r.data),

  updateCostCenter: (id: string, payload: Record<string, any>) =>
    api.put(`/organization/cost-centers/${id}`, payload).then(r => r.data),

  deleteCostCenter: (id: string) =>
    api.delete(`/organization/cost-centers/${id}`).then(r => r.data),
};
