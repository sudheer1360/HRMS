import { Router } from 'express';
import { shiftOvertimeController } from './shift.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { rbac } from '../../middleware/rbac.js';
import { auditLog } from '../../middleware/audit.js';

const router = Router();
router.use(authenticate);

// Shifts
router.get('/shifts/:companyId', rbac('SHIFT', 'VIEW'), (req, res, next) => shiftOvertimeController.listShifts(req, res, next));
router.post('/shifts', rbac('SHIFT', 'CREATE'), auditLog('SHIFT', 'Shift'), (req, res, next) => shiftOvertimeController.createShift(req, res, next));
router.put('/shifts/:id', rbac('SHIFT', 'EDIT'), (req, res, next) => shiftOvertimeController.updateShift(req, res, next));
router.delete('/shifts/:id', rbac('SHIFT', 'DELETE'), (req, res, next) => shiftOvertimeController.deleteShift(req, res, next));

// Rosters
router.get('/rosters', rbac('SHIFT', 'VIEW'), (req, res, next) => shiftOvertimeController.listRosters(req, res, next));
router.post('/rosters', rbac('SHIFT', 'CREATE'), auditLog('SHIFT', 'Roster'), (req, res, next) => shiftOvertimeController.createRoster(req, res, next));
router.put('/rosters/:id', rbac('SHIFT', 'EDIT'), (req, res, next) => shiftOvertimeController.updateRoster(req, res, next));
router.delete('/rosters/:id', rbac('SHIFT', 'DELETE'), (req, res, next) => shiftOvertimeController.deleteRoster(req, res, next));
router.get('/my-shift', (req, res, next) => shiftOvertimeController.getEmployeeShift(req, res, next));
router.get('/employee-shift/:employeeId', rbac('SHIFT', 'VIEW'), (req, res, next) => shiftOvertimeController.getEmployeeShift(req, res, next));

// Overtime Requests
router.get('/overtime/my', (req, res, next) => { req.query.my = 'true'; shiftOvertimeController.listOT(req, res, next); });
router.get('/overtime', rbac('OT', 'VIEW'), (req, res, next) => shiftOvertimeController.listOT(req, res, next));
router.post('/overtime', auditLog('OT', 'OvertimeRequest'), (req, res, next) => shiftOvertimeController.submitOT(req, res, next));
router.patch('/overtime/:id/approve', rbac('OT', 'APPROVE'), auditLog('OT', 'OvertimeRequest'), (req, res, next) => shiftOvertimeController.approveOT(req, res, next));

export default router;
