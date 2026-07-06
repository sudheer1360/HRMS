"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaveController = exports.LeaveController = void 0;
const leave_service_js_1 = require("./leave.service.js");
const leave_schema_js_1 = require("./leave.schema.js");
const database_js_1 = require("../../config/database.js");
const index_js_1 = require("../../common/errors/index.js");
async function resolveEmployeeId(userId) {
    const emp = await (0, database_js_1.queryOne)('SELECT id FROM employees WHERE user_id = ? AND deleted_at IS NULL LIMIT 1', [userId]);
    return emp?.id ?? null;
}
class LeaveController {
    // Leave Types
    async listLeaveTypes(req, res, next) {
        try {
            res.json({ success: true, data: await leave_service_js_1.leaveService.listLeaveTypes(req.tenantId, req.params.companyId) });
        }
        catch (e) {
            next(e);
        }
    }
    async createLeaveType(req, res, next) {
        try {
            const i = leave_schema_js_1.createLeaveTypeSchema.parse(req.body);
            res.status(201).json({ success: true, data: await leave_service_js_1.leaveService.createLeaveType(req.tenantId, i) });
        }
        catch (e) {
            next(e);
        }
    }
    async updateLeaveType(req, res, next) {
        try {
            const i = leave_schema_js_1.createLeaveTypeSchema.partial().parse(req.body);
            res.json({ success: true, data: await leave_service_js_1.leaveService.updateLeaveType(req.params.id, req.tenantId, i) });
        }
        catch (e) {
            next(e);
        }
    }
    async deleteLeaveType(req, res, next) {
        try {
            res.json({ success: true, data: await leave_service_js_1.leaveService.deleteLeaveType(req.params.id, req.tenantId) });
        }
        catch (e) {
            next(e);
        }
    }
    // Leave Policies
    async createLeavePolicy(req, res, next) {
        try {
            const i = leave_schema_js_1.createLeavePolicySchema.parse(req.body);
            res.status(201).json({ success: true, data: await leave_service_js_1.leaveService.createLeavePolicy(req.tenantId, i) });
        }
        catch (e) {
            next(e);
        }
    }
    // Applications
    async apply(req, res, next) {
        try {
            const i = leave_schema_js_1.applyLeaveSchema.parse(req.body);
            const empId = req.body.employeeId || await resolveEmployeeId(req.user.userId);
            if (!empId)
                throw new index_js_1.ValidationError('No employee profile found for this user');
            res.status(201).json({ success: true, data: await leave_service_js_1.leaveService.apply(req.tenantId, empId, i) });
        }
        catch (e) {
            next(e);
        }
    }
    async approve(req, res, next) {
        try {
            const { status, rejectedReason } = leave_schema_js_1.leaveApprovalSchema.parse(req.body);
            const result = status === 'Approved'
                ? await leave_service_js_1.leaveService.approve(req.params.id, req.tenantId, req.user.userId)
                : await leave_service_js_1.leaveService.reject(req.params.id, req.tenantId, req.user.userId, rejectedReason);
            res.json({ success: true, data: result });
        }
        catch (e) {
            next(e);
        }
    }
    async cancel(req, res, next) {
        try {
            res.json({ success: true, data: await leave_service_js_1.leaveService.cancel(req.params.id, req.tenantId, req.user.userId) });
        }
        catch (e) {
            next(e);
        }
    }
    async listApplications(req, res, next) {
        try {
            const q = leave_schema_js_1.leaveFilterSchema.parse(req.query);
            if (req.query.my) {
                const empId = await resolveEmployeeId(req.user.userId);
                q.employeeId = empId ?? req.user.userId;
            }
            res.json({ success: true, ...(await leave_service_js_1.leaveService.listApplications(req.tenantId, q)) });
        }
        catch (e) {
            next(e);
        }
    }
    async getApplication(req, res, next) {
        try {
            res.json({ success: true, data: await leave_service_js_1.leaveService.getApplication(req.params.id, req.tenantId) });
        }
        catch (e) {
            next(e);
        }
    }
    // Balances
    async getBalance(req, res, next) {
        try {
            const empId = req.params.employeeId || await resolveEmployeeId(req.user.userId);
            res.json({ success: true, data: await leave_service_js_1.leaveService.getBalance(req.tenantId, empId) });
        }
        catch (e) {
            next(e);
        }
    }
    async initBalances(req, res, next) {
        try {
            const { companyId, year } = req.body;
            res.json({ success: true, data: await leave_service_js_1.leaveService.initBalances(req.tenantId, companyId, year || new Date().getFullYear()) });
        }
        catch (e) {
            next(e);
        }
    }
    async updateBalance(req, res, next) {
        try {
            res.json({ success: true, data: await leave_service_js_1.leaveService.updateBalance(req.params.id, req.tenantId, req.body) });
        }
        catch (e) {
            next(e);
        }
    }
    // Holidays
    async listHolidays(req, res, next) {
        try {
            const year = parseInt(req.query.year) || new Date().getFullYear();
            res.json({ success: true, data: await leave_service_js_1.leaveService.listHolidays(req.tenantId, req.params.companyId, year) });
        }
        catch (e) {
            next(e);
        }
    }
    async createHoliday(req, res, next) {
        try {
            res.status(201).json({ success: true, data: await leave_service_js_1.leaveService.createHoliday(req.tenantId, req.body) });
        }
        catch (e) {
            next(e);
        }
    }
    async updateHoliday(req, res, next) {
        try {
            res.json({ success: true, data: await leave_service_js_1.leaveService.updateHoliday(req.params.id, req.tenantId, req.body) });
        }
        catch (e) {
            next(e);
        }
    }
    async deleteHoliday(req, res, next) {
        try {
            res.json({ success: true, data: await leave_service_js_1.leaveService.deleteHoliday(req.params.id, req.tenantId) });
        }
        catch (e) {
            next(e);
        }
    }
    // Calendar
    async getCalendar(req, res, next) {
        try {
            const month = parseInt(req.query.month) || new Date().getMonth() + 1;
            const year = parseInt(req.query.year) || new Date().getFullYear();
            res.json({ success: true, data: await leave_service_js_1.leaveService.getCalendar(req.tenantId, req.user.userId, month, year) });
        }
        catch (e) {
            next(e);
        }
    }
}
exports.LeaveController = LeaveController;
exports.leaveController = new LeaveController();
//# sourceMappingURL=leave.controller.js.map