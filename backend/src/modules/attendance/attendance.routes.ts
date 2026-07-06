import { Router } from 'express';
import { attendanceController } from './attendance.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { rbac } from '../../middleware/rbac.js';
import { auditLog } from '../../middleware/audit.js';

const router = Router();
router.use(authenticate);

// Clock in/out (employee self)
router.post('/clock-in', auditLog('ATTENDANCE', 'ClockIn'), (req, res, next) => attendanceController.clockIn(req, res, next));
router.post('/clock-out', auditLog('ATTENDANCE', 'ClockOut'), (req, res, next) => attendanceController.clockOut(req, res, next));

// Daily summary (dashboard widget) — GET /attendance/summary?date=YYYY-MM-DD
router.get('/summary', rbac('ATTN', 'VIEW'), (req, res, next) => attendanceController.getDailySummary(req, res, next));

// My attendance
router.get('/my', (req, res, next) => { req.query.my = 'true'; attendanceController.listDaily(req, res, next); });
router.get('/my/summary', (req, res, next) => attendanceController.getMonthlySummary(req, res, next));

// Manual entry & update (HR/Manager)
router.post('/', rbac('ATTN', 'CREATE'), auditLog('ATTENDANCE', 'AttendanceLog'), (req, res, next) => attendanceController.manualEntry(req, res, next));
router.put('/:id', rbac('ATTN', 'EDIT'), auditLog('ATTENDANCE', 'AttendanceLog'), (req, res, next) => attendanceController.updateEntry(req, res, next));

// List (admin view)
router.get('/', rbac('ATTN', 'VIEW'), (req, res, next) => attendanceController.listDaily(req, res, next));

// Corrections
router.get('/corrections', rbac('ATTN', 'VIEW'), (req, res, next) => attendanceController.listCorrectionRequests(req, res, next));
router.post('/corrections', auditLog('ATTENDANCE', 'CorrectionRequest'), (req, res, next) => attendanceController.submitCorrection(req, res, next));
router.patch('/corrections/:id/approve', rbac('ATTN', 'APPROVE'), auditLog('ATTENDANCE', 'CorrectionRequest'), (req, res, next) => attendanceController.approveCorrection(req, res, next));
router.patch('/corrections/:id/reject', rbac('ATTN', 'APPROVE'), (req, res, next) => attendanceController.rejectCorrection(req, res, next));

// Locks
router.get('/locks/:companyId', rbac('ATTN', 'VIEW'), (req, res, next) => attendanceController.listLocks(req, res, next));
router.post('/lock', rbac('ATTN', 'LOCK'), auditLog('ATTENDANCE', 'Lock'), (req, res, next) => attendanceController.lockPeriod(req, res, next));
router.patch('/lock/:id/unlock', rbac('ATTN', 'LOCK'), auditLog('ATTENDANCE', 'Unlock'), (req, res, next) => attendanceController.unlockPeriod(req, res, next));

export default router;
