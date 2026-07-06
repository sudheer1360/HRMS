"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const shift_controller_js_1 = require("./shift.controller.js");
const auth_js_1 = require("../../middleware/auth.js");
const rbac_js_1 = require("../../middleware/rbac.js");
const audit_js_1 = require("../../middleware/audit.js");
const router = (0, express_1.Router)();
router.use(auth_js_1.authenticate);
// Shifts
router.get('/shifts/:companyId', (0, rbac_js_1.rbac)('SHIFT', 'VIEW'), (req, res, next) => shift_controller_js_1.shiftOvertimeController.listShifts(req, res, next));
router.post('/shifts', (0, rbac_js_1.rbac)('SHIFT', 'CREATE'), (0, audit_js_1.auditLog)('SHIFT', 'Shift'), (req, res, next) => shift_controller_js_1.shiftOvertimeController.createShift(req, res, next));
router.put('/shifts/:id', (0, rbac_js_1.rbac)('SHIFT', 'EDIT'), (req, res, next) => shift_controller_js_1.shiftOvertimeController.updateShift(req, res, next));
router.delete('/shifts/:id', (0, rbac_js_1.rbac)('SHIFT', 'DELETE'), (req, res, next) => shift_controller_js_1.shiftOvertimeController.deleteShift(req, res, next));
// Rosters
router.get('/rosters', (0, rbac_js_1.rbac)('SHIFT', 'VIEW'), (req, res, next) => shift_controller_js_1.shiftOvertimeController.listRosters(req, res, next));
router.post('/rosters', (0, rbac_js_1.rbac)('SHIFT', 'CREATE'), (0, audit_js_1.auditLog)('SHIFT', 'Roster'), (req, res, next) => shift_controller_js_1.shiftOvertimeController.createRoster(req, res, next));
router.put('/rosters/:id', (0, rbac_js_1.rbac)('SHIFT', 'EDIT'), (req, res, next) => shift_controller_js_1.shiftOvertimeController.updateRoster(req, res, next));
router.delete('/rosters/:id', (0, rbac_js_1.rbac)('SHIFT', 'DELETE'), (req, res, next) => shift_controller_js_1.shiftOvertimeController.deleteRoster(req, res, next));
router.get('/my-shift', (req, res, next) => shift_controller_js_1.shiftOvertimeController.getEmployeeShift(req, res, next));
router.get('/employee-shift/:employeeId', (0, rbac_js_1.rbac)('SHIFT', 'VIEW'), (req, res, next) => shift_controller_js_1.shiftOvertimeController.getEmployeeShift(req, res, next));
// Overtime Requests
router.get('/overtime/my', (req, res, next) => { req.query.my = 'true'; shift_controller_js_1.shiftOvertimeController.listOT(req, res, next); });
router.get('/overtime', (0, rbac_js_1.rbac)('OT', 'VIEW'), (req, res, next) => shift_controller_js_1.shiftOvertimeController.listOT(req, res, next));
router.post('/overtime', (0, audit_js_1.auditLog)('OT', 'OvertimeRequest'), (req, res, next) => shift_controller_js_1.shiftOvertimeController.submitOT(req, res, next));
router.patch('/overtime/:id/approve', (0, rbac_js_1.rbac)('OT', 'APPROVE'), (0, audit_js_1.auditLog)('OT', 'OvertimeRequest'), (req, res, next) => shift_controller_js_1.shiftOvertimeController.approveOT(req, res, next));
exports.default = router;
//# sourceMappingURL=shift.routes.js.map