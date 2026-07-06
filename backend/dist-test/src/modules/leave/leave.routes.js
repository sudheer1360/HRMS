"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const leave_controller_js_1 = require("./leave.controller.js");
const auth_js_1 = require("../../middleware/auth.js");
const rbac_js_1 = require("../../middleware/rbac.js");
const audit_js_1 = require("../../middleware/audit.js");
const router = (0, express_1.Router)();
router.use(auth_js_1.authenticate);
// Leave Types
router.get('/types/:companyId', (0, rbac_js_1.rbac)('LEAVE', 'VIEW'), (req, res, next) => leave_controller_js_1.leaveController.listLeaveTypes(req, res, next));
router.post('/types', (0, rbac_js_1.rbac)('LEAVE', 'CREATE'), (req, res, next) => leave_controller_js_1.leaveController.createLeaveType(req, res, next));
router.put('/types/:id', (0, rbac_js_1.rbac)('LEAVE', 'EDIT'), (req, res, next) => leave_controller_js_1.leaveController.updateLeaveType(req, res, next));
router.delete('/types/:id', (0, rbac_js_1.rbac)('LEAVE', 'DELETE'), (req, res, next) => leave_controller_js_1.leaveController.deleteLeaveType(req, res, next));
// Leave Policies
router.post('/policies', (0, rbac_js_1.rbac)('LEAVE', 'CREATE'), (req, res, next) => leave_controller_js_1.leaveController.createLeavePolicy(req, res, next));
// Holidays
router.get('/holidays/:companyId', (0, rbac_js_1.rbac)('LEAVE', 'VIEW'), (req, res, next) => leave_controller_js_1.leaveController.listHolidays(req, res, next));
router.post('/holidays', (0, rbac_js_1.rbac)('LEAVE', 'CREATE'), (req, res, next) => leave_controller_js_1.leaveController.createHoliday(req, res, next));
router.put('/holidays/:id', (0, rbac_js_1.rbac)('LEAVE', 'EDIT'), (req, res, next) => leave_controller_js_1.leaveController.updateHoliday(req, res, next));
router.delete('/holidays/:id', (0, rbac_js_1.rbac)('LEAVE', 'DELETE'), (req, res, next) => leave_controller_js_1.leaveController.deleteHoliday(req, res, next));
// My Leave (employee self-service)
router.get('/my-leaves', (req, res, next) => { req.query.my = 'true'; leave_controller_js_1.leaveController.listApplications(req, res, next); });
router.get('/my/all', (req, res, next) => { req.query.my = 'true'; leave_controller_js_1.leaveController.listApplications(req, res, next); });
router.get('/my-balance', (req, res, next) => leave_controller_js_1.leaveController.getBalance(req, res, next));
router.get('/my-calendar', (req, res, next) => leave_controller_js_1.leaveController.getCalendar(req, res, next));
router.post('/apply', (0, audit_js_1.auditLog)('LEAVE', 'LeaveApplication'), (req, res, next) => leave_controller_js_1.leaveController.apply(req, res, next));
router.patch('/:id/cancel', (0, audit_js_1.auditLog)('LEAVE', 'LeaveApplication'), (req, res, next) => leave_controller_js_1.leaveController.cancel(req, res, next));
// Admin/Manager routes
router.get('/', (0, rbac_js_1.rbac)('LEAVE', 'VIEW'), (req, res, next) => leave_controller_js_1.leaveController.listApplications(req, res, next));
router.get('/:id', (0, rbac_js_1.rbac)('LEAVE', 'VIEW'), (req, res, next) => leave_controller_js_1.leaveController.getApplication(req, res, next));
router.patch('/:id/approve', (0, rbac_js_1.rbac)('LEAVE', 'APPROVE'), (0, audit_js_1.auditLog)('LEAVE', 'LeaveApplication'), (req, res, next) => leave_controller_js_1.leaveController.approve(req, res, next));
// Balance management
router.get('/balance/:employeeId', (0, rbac_js_1.rbac)('LEAVE', 'VIEW'), (req, res, next) => leave_controller_js_1.leaveController.getBalance(req, res, next));
router.post('/balances/init', (0, rbac_js_1.rbac)('LEAVE', 'CREATE'), (req, res, next) => leave_controller_js_1.leaveController.initBalances(req, res, next));
router.put('/balances/:id', (0, rbac_js_1.rbac)('LEAVE', 'EDIT'), (req, res, next) => leave_controller_js_1.leaveController.updateBalance(req, res, next));
exports.default = router;
//# sourceMappingURL=leave.routes.js.map