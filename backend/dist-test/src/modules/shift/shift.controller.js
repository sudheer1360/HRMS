"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shiftOvertimeController = exports.ShiftOvertimeController = void 0;
const shift_service_js_1 = require("./shift.service.js");
const shift_schema_js_1 = require("./shift.schema.js");
class ShiftOvertimeController {
    // Shifts
    async listShifts(req, res, next) {
        try {
            res.json({ success: true, data: await shift_service_js_1.shiftService.listShifts(req.tenantId, req.params.companyId) });
        }
        catch (e) {
            next(e);
        }
    }
    async createShift(req, res, next) {
        try {
            const i = shift_schema_js_1.createShiftSchema.parse(req.body);
            res.status(201).json({ success: true, data: await shift_service_js_1.shiftService.createShift(req.tenantId, i) });
        }
        catch (e) {
            next(e);
        }
    }
    async updateShift(req, res, next) {
        try {
            const i = shift_schema_js_1.createShiftSchema.partial().parse(req.body);
            res.json({ success: true, data: await shift_service_js_1.shiftService.updateShift(req.params.id, req.tenantId, i) });
        }
        catch (e) {
            next(e);
        }
    }
    async deleteShift(req, res, next) {
        try {
            res.json({ success: true, data: await shift_service_js_1.shiftService.deleteShift(req.params.id, req.tenantId) });
        }
        catch (e) {
            next(e);
        }
    }
    // Rosters
    async listRosters(req, res, next) {
        try {
            res.json({ success: true, data: await shift_service_js_1.shiftService.listRosters(req.tenantId, req.query) });
        }
        catch (e) {
            next(e);
        }
    }
    async createRoster(req, res, next) {
        try {
            const i = shift_schema_js_1.createRosterSchema.parse(req.body);
            res.status(201).json({ success: true, data: await shift_service_js_1.shiftService.assignRoster(req.tenantId, i) });
        }
        catch (e) {
            next(e);
        }
    }
    async updateRoster(req, res, next) {
        try {
            res.json({ success: true, data: await shift_service_js_1.shiftService.updateRoster(req.params.id, req.tenantId, req.body) });
        }
        catch (e) {
            next(e);
        }
    }
    async deleteRoster(req, res, next) {
        try {
            res.json({ success: true, data: await shift_service_js_1.shiftService.deleteRoster(req.params.id, req.tenantId) });
        }
        catch (e) {
            next(e);
        }
    }
    async getEmployeeShift(req, res, next) {
        try {
            const empId = req.params.employeeId || req.user.userId;
            res.json({ success: true, data: await shift_service_js_1.shiftService.getEmployeeShift(req.tenantId, empId, req.query.date) });
        }
        catch (e) {
            next(e);
        }
    }
    // Overtime
    async listOT(req, res, next) {
        try {
            if (req.query.my)
                req.query.employeeId = req.user.userId;
            res.json({ success: true, ...(await shift_service_js_1.overtimeService.listRequests(req.tenantId, req.query)) });
        }
        catch (e) {
            next(e);
        }
    }
    async submitOT(req, res, next) {
        try {
            const i = shift_schema_js_1.overtimeRequestSchema.parse(req.body);
            res.status(201).json({ success: true, data: await shift_service_js_1.overtimeService.submitRequest(req.tenantId, i) });
        }
        catch (e) {
            next(e);
        }
    }
    async approveOT(req, res, next) {
        try {
            const { status, rejectedReason } = shift_schema_js_1.overtimeApprovalSchema.parse(req.body);
            const result = status === 'Approved'
                ? await shift_service_js_1.overtimeService.approveRequest(req.params.id, req.tenantId, req.user.userId)
                : await shift_service_js_1.overtimeService.rejectRequest(req.params.id, req.tenantId, req.user.userId, rejectedReason);
            res.json({ success: true, data: result });
        }
        catch (e) {
            next(e);
        }
    }
}
exports.ShiftOvertimeController = ShiftOvertimeController;
exports.shiftOvertimeController = new ShiftOvertimeController();
//# sourceMappingURL=shift.controller.js.map