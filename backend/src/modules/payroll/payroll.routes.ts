import { Router } from 'express';
import { payrollController } from './payroll.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { rbac } from '../../middleware/rbac.js';
import { auditLog } from '../../middleware/audit.js';

const router = Router();
router.use(authenticate);

// Salary Components
router.get('/components/:companyId', rbac('PAYROLL', 'VIEW'), (req, res, next) => payrollController.listComponents(req, res, next));
router.post('/components', rbac('PAYROLL', 'CREATE'), (req, res, next) => payrollController.createComponent(req, res, next));

// Salary Structures
router.get('/salary-structures', rbac('PAYROLL', 'VIEW'), (req, res, next) => payrollController.listStructuresAll(req, res, next));
router.get('/structures/:companyId', rbac('PAYROLL', 'VIEW'), (req, res, next) => payrollController.listStructures(req, res, next));
router.post('/structures', rbac('PAYROLL', 'CREATE'), (req, res, next) => payrollController.createStructure(req, res, next));

// Payroll Runs
router.get('/runs', rbac('PAYROLL', 'VIEW'), (req, res, next) => payrollController.listRuns(req, res, next));
router.post('/runs', rbac('PAYROLL', 'RUN'), auditLog('PAYROLL', 'PayrollRun'), (req, res, next) => payrollController.createRun(req, res, next));
router.post('/runs/:id/process', rbac('PAYROLL', 'RUN'), auditLog('PAYROLL', 'PayrollRun'), (req, res, next) => payrollController.processRun(req, res, next));
router.post('/runs/:id/approve', rbac('PAYROLL', 'APPROVE'), auditLog('PAYROLL', 'PayrollRun'), (req, res, next) => payrollController.approveRun(req, res, next));

// Payslips
router.get('/my-payslips', (req, res, next) => payrollController.myPayslips(req, res, next));

// Expenses
router.get('/expenses/my', (req, res, next) => { req.query.my = 'true'; payrollController.listClaims(req, res, next); });
router.get('/expenses', rbac('PAYROLL', 'VIEW'), (req, res, next) => payrollController.listClaims(req, res, next));
router.post('/expenses', (req, res, next) => payrollController.submitClaim(req, res, next));
router.post('/expenses/:id', rbac('PAYROLL', 'APPROVE'), (req, res, next) => payrollController.approveClaim(req, res, next));

export default router;
