"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attendanceController = exports.AttendanceController = void 0;
const attendance_service_js_1 = require("./attendance.service.js");
const attendance_schema_js_1 = require("./attendance.schema.js");
class AttendanceController {
    async clockIn(req, res, next) {
        try {
            res.status(201).json({ success: true, data: await attendance_service_js_1.attendanceService.clockIn(req.tenantId, req.user.userId, req.body) });
        }
        catch (e) {
            next(e);
        }
    }
    async clockOut(req, res, next) {
        try {
            res.json({ success: true, data: await attendance_service_js_1.attendanceService.clockOut(req.tenantId, req.user.userId, req.body) });
        }
        catch (e) {
            next(e);
        }
    }
    async manualEntry(req, res, next) {
        try {
            const input = attendance_schema_js_1.manualAttendanceSchema.parse(req.body);
            res.status(201).json({ success: true, data: await attendance_service_js_1.attendanceService.manualEntry(req.tenantId, input) });
        }
        catch (e) {
            next(e);
        }
    }
    async updateEntry(req, res, next) {
        try {
            res.json({ success: true, data: await attendance_service_js_1.attendanceService.updateEntry(req.params.id, req.tenantId, req.body) });
        }
        catch (e) {
            next(e);
        }
    }
    async listDaily(req, res, next) {
        try {
            const q = attendance_schema_js_1.attendanceFilterSchema.parse(req.query);
            if (req.query.my)
                q.employeeId = req.user.userId;
            res.json({ success: true, ...(await attendance_service_js_1.attendanceService.listDaily(req.tenantId, q)) });
        }
        catch (e) {
            next(e);
        }
    }
    async getDailySummary(req, res, next) {
        try {
            const date = req.query.date || new Date().toISOString().slice(0, 10);
            res.json({ success: true, data: await attendance_service_js_1.attendanceService.getDailySummary(req.tenantId, date) });
        }
        catch (e) {
            next(e);
        }
    }
    async getMonthlySummary(req, res, next) {
        try {
            const month = parseInt(req.query.month) || new Date().getMonth() + 1;
            const year = parseInt(req.query.year) || new Date().getFullYear();
            const empId = req.query.employeeId || req.user.userId;
            res.json({ success: true, data: await attendance_service_js_1.attendanceService.getMonthlySummary(req.tenantId, empId, month, year) });
        }
        catch (e) {
            next(e);
        }
    }
    async listCorrectionRequests(req, res, next) {
        try {
            res.json({ success: true, data: await attendance_service_js_1.attendanceService.listCorrectionRequests(req.tenantId, req.query) });
        }
        catch (e) {
            next(e);
        }
    }
    async submitCorrection(req, res, next) {
        try {
            const input = attendance_schema_js_1.correctionRequestSchema.parse(req.body);
            res.status(201).json({ success: true, data: await attendance_service_js_1.attendanceService.submitCorrection(req.tenantId, { ...input, employeeId: input.employeeId || req.user.userId }) });
        }
        catch (e) {
            next(e);
        }
    }
    async approveCorrection(req, res, next) {
        try {
            res.json({ success: true, data: await attendance_service_js_1.attendanceService.approveCorrection(req.params.id, req.tenantId, req.user.userId) });
        }
        catch (e) {
            next(e);
        }
    }
    async rejectCorrection(req, res, next) {
        try {
            res.json({ success: true, data: await attendance_service_js_1.attendanceService.rejectCorrection(req.params.id, req.tenantId, req.user.userId, req.body.reason) });
        }
        catch (e) {
            next(e);
        }
    }
    async lockPeriod(req, res, next) {
        try {
            const input = attendance_schema_js_1.lockAttendanceSchema.parse(req.body);
            res.status(201).json({ success: true, data: await attendance_service_js_1.attendanceService.lockPeriod(req.tenantId, input, req.user.userId) });
        }
        catch (e) {
            next(e);
        }
    }
    async unlockPeriod(req, res, next) {
        try {
            res.json({ success: true, data: await attendance_service_js_1.attendanceService.unlockPeriod(req.params.id, req.tenantId, req.user.userId, req.body.reason) });
        }
        catch (e) {
            next(e);
        }
    }
    async listLocks(req, res, next) {
        try {
            res.json({ success: true, data: await attendance_service_js_1.attendanceService.listLocks(req.tenantId, req.params.companyId) });
        }
        catch (e) {
            next(e);
        }
    }
}
exports.AttendanceController = AttendanceController;
exports.attendanceController = new AttendanceController();
//# sourceMappingURL=attendance.controller.js.map