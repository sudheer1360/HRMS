"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const attendance_controller_js_1 = require("./attendance.controller.js");
const auth_js_1 = require("../../middleware/auth.js");
const rbac_js_1 = require("../../middleware/rbac.js");
const audit_js_1 = require("../../middleware/audit.js");
const router = (0, express_1.Router)();
router.use(auth_js_1.authenticate);
// Clock in/out (employee self)
router.post('/clock-in', (0, audit_js_1.auditLog)('ATTENDANCE', 'ClockIn'), (req, res, next) => attendance_controller_js_1.attendanceController.clockIn(req, res, next));
router.post('/clock-out', (0, audit_js_1.auditLog)('ATTENDANCE', 'ClockOut'), (req, res, next) => attendance_controller_js_1.attendanceController.clockOut(req, res, next));
// Daily summary (dashboard widget) — GET /attendance/summary?date=YYYY-MM-DD
router.get('/summary', (0, rbac_js_1.rbac)('ATTN', 'VIEW'), (req, res, next) => attendance_controller_js_1.attendanceController.getDailySummary(req, res, next));
// My attendance
router.get('/my', (req, res, next) => { req.query.my = 'true'; attendance_controller_js_1.attendanceController.listDaily(req, res, next); });
router.get('/my/summary', (req, res, next) => attendance_controller_js_1.attendanceController.getMonthlySummary(req, res, next));
// Manual entry & update (HR/Manager)
router.post('/', (0, rbac_js_1.rbac)('ATTN', 'CREATE'), (0, audit_js_1.auditLog)('ATTENDANCE', 'AttendanceLog'), (req, res, next) => attendance_controller_js_1.attendanceController.manualEntry(req, res, next));
router.put('/:id', (0, rbac_js_1.rbac)('ATTN', 'EDIT'), (0, audit_js_1.auditLog)('ATTENDANCE', 'AttendanceLog'), (req, res, next) => attendance_controller_js_1.attendanceController.updateEntry(req, res, next));
// List (admin view)
router.get('/', (0, rbac_js_1.rbac)('ATTN', 'VIEW'), (req, res, next) => attendance_controller_js_1.attendanceController.listDaily(req, res, next));
// Corrections
router.get('/corrections', (0, rbac_js_1.rbac)('ATTN', 'VIEW'), (req, res, next) => attendance_controller_js_1.attendanceController.listCorrectionRequests(req, res, next));
router.post('/corrections', (0, audit_js_1.auditLog)('ATTENDANCE', 'CorrectionRequest'), (req, res, next) => attendance_controller_js_1.attendanceController.submitCorrection(req, res, next));
router.patch('/corrections/:id/approve', (0, rbac_js_1.rbac)('ATTN', 'APPROVE'), (0, audit_js_1.auditLog)('ATTENDANCE', 'CorrectionRequest'), (req, res, next) => attendance_controller_js_1.attendanceController.approveCorrection(req, res, next));
router.patch('/corrections/:id/reject', (0, rbac_js_1.rbac)('ATTN', 'APPROVE'), (req, res, next) => attendance_controller_js_1.attendanceController.rejectCorrection(req, res, next));
// Locks
router.get('/locks/:companyId', (0, rbac_js_1.rbac)('ATTN', 'VIEW'), (req, res, next) => attendance_controller_js_1.attendanceController.listLocks(req, res, next));
router.post('/lock', (0, rbac_js_1.rbac)('ATTN', 'LOCK'), (0, audit_js_1.auditLog)('ATTENDANCE', 'Lock'), (req, res, next) => attendance_controller_js_1.attendanceController.lockPeriod(req, res, next));
router.patch('/lock/:id/unlock', (0, rbac_js_1.rbac)('ATTN', 'LOCK'), (0, audit_js_1.auditLog)('ATTENDANCE', 'Unlock'), (req, res, next) => attendance_controller_js_1.attendanceController.unlockPeriod(req, res, next));
exports.default = router;
//# sourceMappingURL=attendance.routes.js.map