import { Router } from 'express';
import { organizationController } from './organization.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { rbac } from '../../middleware/rbac.js';
import { auditLog } from '../../middleware/audit.js';

const router = Router();
router.use(authenticate);

// Companies
router.get('/companies', rbac('ORG', 'VIEW'), (req, res, next) => organizationController.listCompanies(req, res, next));
router.get('/companies/:id', rbac('ORG', 'VIEW'), (req, res, next) => organizationController.getCompany(req, res, next));
router.post('/companies', rbac('ORG', 'CREATE'), auditLog('ORGANIZATION', 'Company'), (req, res, next) => organizationController.createCompany(req, res, next));
router.put('/companies/:id', rbac('ORG', 'EDIT'), auditLog('ORGANIZATION', 'Company'), (req, res, next) => organizationController.updateCompany(req, res, next));
router.delete('/companies/:id', rbac('ORG', 'DELETE'), auditLog('ORGANIZATION', 'Company'), (req, res, next) => organizationController.deleteCompany(req, res, next));

// Branches
router.get('/companies/:companyId/branches', rbac('ORG', 'VIEW'), (req, res, next) => organizationController.listBranches(req, res, next));
router.get('/branches/:id', rbac('ORG', 'VIEW'), (req, res, next) => organizationController.getBranch(req, res, next));
router.post('/branches', rbac('ORG', 'CREATE'), auditLog('ORGANIZATION', 'Branch'), (req, res, next) => organizationController.createBranch(req, res, next));
router.put('/branches/:id', rbac('ORG', 'EDIT'), auditLog('ORGANIZATION', 'Branch'), (req, res, next) => organizationController.updateBranch(req, res, next));
router.delete('/branches/:id', rbac('ORG', 'DELETE'), (req, res, next) => organizationController.deleteBranch(req, res, next));

// Departments
router.get('/companies/:companyId/departments', rbac('ORG', 'VIEW'), (req, res, next) => organizationController.listDepartments(req, res, next));
router.get('/companies/:companyId/departments/tree', rbac('ORG', 'VIEW'), (req, res, next) => organizationController.getDepartmentTree(req, res, next));
router.post('/departments', rbac('ORG', 'CREATE'), auditLog('ORGANIZATION', 'Department'), (req, res, next) => organizationController.createDepartment(req, res, next));
router.put('/departments/:id', rbac('ORG', 'EDIT'), auditLog('ORGANIZATION', 'Department'), (req, res, next) => organizationController.updateDepartment(req, res, next));
router.delete('/departments/:id', rbac('ORG', 'DELETE'), (req, res, next) => organizationController.deleteDepartment(req, res, next));

// Designations
router.get('/companies/:companyId/designations', rbac('ORG', 'VIEW'), (req, res, next) => organizationController.listDesignations(req, res, next));
router.post('/designations', rbac('ORG', 'CREATE'), auditLog('ORGANIZATION', 'Designation'), (req, res, next) => organizationController.createDesignation(req, res, next));
router.put('/designations/:id', rbac('ORG', 'EDIT'), (req, res, next) => organizationController.updateDesignation(req, res, next));
router.delete('/designations/:id', rbac('ORG', 'DELETE'), (req, res, next) => organizationController.deleteDesignation(req, res, next));

// Grades
router.get('/companies/:companyId/grades', rbac('ORG', 'VIEW'), (req, res, next) => organizationController.listGrades(req, res, next));
router.post('/grades', rbac('ORG', 'CREATE'), auditLog('ORGANIZATION', 'Grade'), (req, res, next) => organizationController.createGrade(req, res, next));
router.put('/grades/:id', rbac('ORG', 'EDIT'), (req, res, next) => organizationController.updateGrade(req, res, next));
router.delete('/grades/:id', rbac('ORG', 'DELETE'), (req, res, next) => organizationController.deleteGrade(req, res, next));

// Cost Centers
router.get('/companies/:companyId/cost-centers', rbac('ORG', 'VIEW'), (req, res, next) => organizationController.listCostCenters(req, res, next));
router.post('/cost-centers', rbac('ORG', 'CREATE'), auditLog('ORGANIZATION', 'CostCenter'), (req, res, next) => organizationController.createCostCenter(req, res, next));
router.put('/cost-centers/:id', rbac('ORG', 'EDIT'), (req, res, next) => organizationController.updateCostCenter(req, res, next));
router.delete('/cost-centers/:id', rbac('ORG', 'DELETE'), (req, res, next) => organizationController.deleteCostCenter(req, res, next));

export default router;
