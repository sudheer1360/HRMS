"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const organization_controller_js_1 = require("./organization.controller.js");
const auth_js_1 = require("../../middleware/auth.js");
const rbac_js_1 = require("../../middleware/rbac.js");
const audit_js_1 = require("../../middleware/audit.js");
const router = (0, express_1.Router)();
router.use(auth_js_1.authenticate);
// Companies
router.get('/companies', (0, rbac_js_1.rbac)('ORG', 'VIEW'), (req, res, next) => organization_controller_js_1.organizationController.listCompanies(req, res, next));
router.get('/companies/:id', (0, rbac_js_1.rbac)('ORG', 'VIEW'), (req, res, next) => organization_controller_js_1.organizationController.getCompany(req, res, next));
router.post('/companies', (0, rbac_js_1.rbac)('ORG', 'CREATE'), (0, audit_js_1.auditLog)('ORGANIZATION', 'Company'), (req, res, next) => organization_controller_js_1.organizationController.createCompany(req, res, next));
router.put('/companies/:id', (0, rbac_js_1.rbac)('ORG', 'EDIT'), (0, audit_js_1.auditLog)('ORGANIZATION', 'Company'), (req, res, next) => organization_controller_js_1.organizationController.updateCompany(req, res, next));
router.delete('/companies/:id', (0, rbac_js_1.rbac)('ORG', 'DELETE'), (0, audit_js_1.auditLog)('ORGANIZATION', 'Company'), (req, res, next) => organization_controller_js_1.organizationController.deleteCompany(req, res, next));
// Branches
router.get('/companies/:companyId/branches', (0, rbac_js_1.rbac)('ORG', 'VIEW'), (req, res, next) => organization_controller_js_1.organizationController.listBranches(req, res, next));
router.get('/branches/:id', (0, rbac_js_1.rbac)('ORG', 'VIEW'), (req, res, next) => organization_controller_js_1.organizationController.getBranch(req, res, next));
router.post('/branches', (0, rbac_js_1.rbac)('ORG', 'CREATE'), (0, audit_js_1.auditLog)('ORGANIZATION', 'Branch'), (req, res, next) => organization_controller_js_1.organizationController.createBranch(req, res, next));
router.put('/branches/:id', (0, rbac_js_1.rbac)('ORG', 'EDIT'), (0, audit_js_1.auditLog)('ORGANIZATION', 'Branch'), (req, res, next) => organization_controller_js_1.organizationController.updateBranch(req, res, next));
router.delete('/branches/:id', (0, rbac_js_1.rbac)('ORG', 'DELETE'), (req, res, next) => organization_controller_js_1.organizationController.deleteBranch(req, res, next));
// Departments
router.get('/companies/:companyId/departments', (0, rbac_js_1.rbac)('ORG', 'VIEW'), (req, res, next) => organization_controller_js_1.organizationController.listDepartments(req, res, next));
router.get('/companies/:companyId/departments/tree', (0, rbac_js_1.rbac)('ORG', 'VIEW'), (req, res, next) => organization_controller_js_1.organizationController.getDepartmentTree(req, res, next));
router.post('/departments', (0, rbac_js_1.rbac)('ORG', 'CREATE'), (0, audit_js_1.auditLog)('ORGANIZATION', 'Department'), (req, res, next) => organization_controller_js_1.organizationController.createDepartment(req, res, next));
router.put('/departments/:id', (0, rbac_js_1.rbac)('ORG', 'EDIT'), (0, audit_js_1.auditLog)('ORGANIZATION', 'Department'), (req, res, next) => organization_controller_js_1.organizationController.updateDepartment(req, res, next));
router.delete('/departments/:id', (0, rbac_js_1.rbac)('ORG', 'DELETE'), (req, res, next) => organization_controller_js_1.organizationController.deleteDepartment(req, res, next));
// Designations
router.get('/companies/:companyId/designations', (0, rbac_js_1.rbac)('ORG', 'VIEW'), (req, res, next) => organization_controller_js_1.organizationController.listDesignations(req, res, next));
router.post('/designations', (0, rbac_js_1.rbac)('ORG', 'CREATE'), (0, audit_js_1.auditLog)('ORGANIZATION', 'Designation'), (req, res, next) => organization_controller_js_1.organizationController.createDesignation(req, res, next));
router.put('/designations/:id', (0, rbac_js_1.rbac)('ORG', 'EDIT'), (req, res, next) => organization_controller_js_1.organizationController.updateDesignation(req, res, next));
router.delete('/designations/:id', (0, rbac_js_1.rbac)('ORG', 'DELETE'), (req, res, next) => organization_controller_js_1.organizationController.deleteDesignation(req, res, next));
// Grades
router.get('/companies/:companyId/grades', (0, rbac_js_1.rbac)('ORG', 'VIEW'), (req, res, next) => organization_controller_js_1.organizationController.listGrades(req, res, next));
router.post('/grades', (0, rbac_js_1.rbac)('ORG', 'CREATE'), (0, audit_js_1.auditLog)('ORGANIZATION', 'Grade'), (req, res, next) => organization_controller_js_1.organizationController.createGrade(req, res, next));
router.put('/grades/:id', (0, rbac_js_1.rbac)('ORG', 'EDIT'), (req, res, next) => organization_controller_js_1.organizationController.updateGrade(req, res, next));
router.delete('/grades/:id', (0, rbac_js_1.rbac)('ORG', 'DELETE'), (req, res, next) => organization_controller_js_1.organizationController.deleteGrade(req, res, next));
// Cost Centers
router.get('/companies/:companyId/cost-centers', (0, rbac_js_1.rbac)('ORG', 'VIEW'), (req, res, next) => organization_controller_js_1.organizationController.listCostCenters(req, res, next));
router.post('/cost-centers', (0, rbac_js_1.rbac)('ORG', 'CREATE'), (0, audit_js_1.auditLog)('ORGANIZATION', 'CostCenter'), (req, res, next) => organization_controller_js_1.organizationController.createCostCenter(req, res, next));
router.put('/cost-centers/:id', (0, rbac_js_1.rbac)('ORG', 'EDIT'), (req, res, next) => organization_controller_js_1.organizationController.updateCostCenter(req, res, next));
router.delete('/cost-centers/:id', (0, rbac_js_1.rbac)('ORG', 'DELETE'), (req, res, next) => organization_controller_js_1.organizationController.deleteCostCenter(req, res, next));
exports.default = router;
//# sourceMappingURL=organization.routes.js.map