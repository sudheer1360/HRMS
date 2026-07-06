"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payroll_controller_js_1 = require("./payroll.controller.js");
const auth_js_1 = require("../../middleware/auth.js");
const rbac_js_1 = require("../../middleware/rbac.js");
const audit_js_1 = require("../../middleware/audit.js");
const router = (0, express_1.Router)();
router.use(auth_js_1.authenticate);
// Salary Components
router.get('/components/:companyId', (0, rbac_js_1.rbac)('PAYROLL', 'VIEW'), (req, res, next) => payroll_controller_js_1.payrollController.listComponents(req, res, next));
router.post('/components', (0, rbac_js_1.rbac)('PAYROLL', 'CREATE'), (req, res, next) => payroll_controller_js_1.payrollController.createComponent(req, res, next));
// Salary Structures
router.get('/salary-structures', (0, rbac_js_1.rbac)('PAYROLL', 'VIEW'), (req, res, next) => payroll_controller_js_1.payrollController.listStructuresAll(req, res, next));
router.get('/structures/:companyId', (0, rbac_js_1.rbac)('PAYROLL', 'VIEW'), (req, res, next) => payroll_controller_js_1.payrollController.listStructures(req, res, next));
router.post('/structures', (0, rbac_js_1.rbac)('PAYROLL', 'CREATE'), (req, res, next) => payroll_controller_js_1.payrollController.createStructure(req, res, next));
// Payroll Runs
router.get('/runs', (0, rbac_js_1.rbac)('PAYROLL', 'VIEW'), (req, res, next) => payroll_controller_js_1.payrollController.listRuns(req, res, next));
router.post('/runs', (0, rbac_js_1.rbac)('PAYROLL', 'RUN'), (0, audit_js_1.auditLog)('PAYROLL', 'PayrollRun'), (req, res, next) => payroll_controller_js_1.payrollController.createRun(req, res, next));
router.post('/runs/:id/process', (0, rbac_js_1.rbac)('PAYROLL', 'RUN'), (0, audit_js_1.auditLog)('PAYROLL', 'PayrollRun'), (req, res, next) => payroll_controller_js_1.payrollController.processRun(req, res, next));
router.post('/runs/:id/approve', (0, rbac_js_1.rbac)('PAYROLL', 'APPROVE'), (0, audit_js_1.auditLog)('PAYROLL', 'PayrollRun'), (req, res, next) => payroll_controller_js_1.payrollController.approveRun(req, res, next));
// Payslips
router.get('/my-payslips', (req, res, next) => payroll_controller_js_1.payrollController.myPayslips(req, res, next));
// Expenses
router.get('/expenses/my', (req, res, next) => { req.query.my = 'true'; payroll_controller_js_1.payrollController.listClaims(req, res, next); });
router.get('/expenses', (0, rbac_js_1.rbac)('PAYROLL', 'VIEW'), (req, res, next) => payroll_controller_js_1.payrollController.listClaims(req, res, next));
router.post('/expenses', (req, res, next) => payroll_controller_js_1.payrollController.submitClaim(req, res, next));
router.post('/expenses/:id', (0, rbac_js_1.rbac)('PAYROLL', 'APPROVE'), (req, res, next) => payroll_controller_js_1.payrollController.approveClaim(req, res, next));
exports.default = router;
//# sourceMappingURL=payroll.routes.js.map