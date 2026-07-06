import { Router } from 'express';
import { leaveController } from './leave.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { rbac } from '../../middleware/rbac.js';
import { auditLog } from '../../middleware/audit.js';

const router = Router();
router.use(authenticate);

// Leave Types
router.get('/types/:companyId', rbac('LEAVE', 'VIEW'), (req, res, next) => leaveController.listLeaveTypes(req, res, next));
router.post('/types', rbac('LEAVE', 'CREATE'), (req, res, next) => leaveController.createLeaveType(req, res, next));
router.put('/types/:id', rbac('LEAVE', 'EDIT'), (req, res, next) => leaveController.updateLeaveType(req, res, next));
router.delete('/types/:id', rbac('LEAVE', 'DELETE'), (req, res, next) => leaveController.deleteLeaveType(req, res, next));

// Leave Policies
router.post('/policies', rbac('LEAVE', 'CREATE'), (req, res, next) => leaveController.createLeavePolicy(req, res, next));

// Holidays
router.get('/holidays/:companyId', rbac('LEAVE', 'VIEW'), (req, res, next) => leaveController.listHolidays(req, res, next));
router.post('/holidays', rbac('LEAVE', 'CREATE'), (req, res, next) => leaveController.createHoliday(req, res, next));
router.put('/holidays/:id', rbac('LEAVE', 'EDIT'), (req, res, next) => leaveController.updateHoliday(req, res, next));
router.delete('/holidays/:id', rbac('LEAVE', 'DELETE'), (req, res, next) => leaveController.deleteHoliday(req, res, next));

// My Leave (employee self-service)
router.get('/my-leaves', (req, res, next) => { req.query.my = 'true'; leaveController.listApplications(req, res, next); });
router.get('/my/all', (req, res, next) => { req.query.my = 'true'; leaveController.listApplications(req, res, next); });
router.get('/my-balance', (req, res, next) => leaveController.getBalance(req, res, next));
router.get('/my-calendar', (req, res, next) => leaveController.getCalendar(req, res, next));
router.post('/apply', auditLog('LEAVE', 'LeaveApplication'), (req, res, next) => leaveController.apply(req, res, next));
router.patch('/:id/cancel', auditLog('LEAVE', 'LeaveApplication'), (req, res, next) => leaveController.cancel(req, res, next));

// Admin/Manager routes
router.get('/', rbac('LEAVE', 'VIEW'), (req, res, next) => leaveController.listApplications(req, res, next));
router.get('/:id', rbac('LEAVE', 'VIEW'), (req, res, next) => leaveController.getApplication(req, res, next));
router.patch('/:id/approve', rbac('LEAVE', 'APPROVE'), auditLog('LEAVE', 'LeaveApplication'), (req, res, next) => leaveController.approve(req, res, next));

// Balance management
router.get('/balance/:employeeId', rbac('LEAVE', 'VIEW'), (req, res, next) => leaveController.getBalance(req, res, next));
router.post('/balances/init', rbac('LEAVE', 'CREATE'), (req, res, next) => leaveController.initBalances(req, res, next));
router.put('/balances/:id', rbac('LEAVE', 'EDIT'), (req, res, next) => leaveController.updateBalance(req, res, next));

export default router;
