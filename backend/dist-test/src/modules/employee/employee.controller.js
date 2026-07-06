"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeeController = exports.EmployeeController = void 0;
const employee_service_js_1 = require("./employee.service.js");
const employee_schema_js_1 = require("./employee.schema.js");
class EmployeeController {
    async list(req, res, next) {
        try {
            const query = employee_schema_js_1.employeeFilterSchema.parse(req.query);
            const result = await employee_service_js_1.employeeService.list(req.tenantId, query);
            res.json({ success: true, ...result });
        }
        catch (e) {
            next(e);
        }
    }
    async getById(req, res, next) {
        try {
            const employee = await employee_service_js_1.employeeService.getById(req.params.id, req.tenantId);
            res.json({ success: true, data: employee });
        }
        catch (e) {
            next(e);
        }
    }
    async create(req, res, next) {
        try {
            const input = employee_schema_js_1.createEmployeeSchema.parse(req.body);
            const employee = await employee_service_js_1.employeeService.create(req.tenantId, req.user.userId, input);
            res.status(201).json({ success: true, data: employee });
        }
        catch (e) {
            next(e);
        }
    }
    async update(req, res, next) {
        try {
            const input = employee_schema_js_1.updateEmployeeSchema.parse(req.body);
            const employee = await employee_service_js_1.employeeService.update(req.params.id, req.tenantId, input);
            res.json({ success: true, data: employee });
        }
        catch (e) {
            next(e);
        }
    }
    async changeStatus(req, res, next) {
        try {
            const { status, reason } = employee_schema_js_1.employeeStatusSchema.parse(req.body);
            const employee = await employee_service_js_1.employeeService.changeStatus(req.params.id, req.tenantId, req.user.userId, status, reason);
            res.json({ success: true, data: employee });
        }
        catch (e) {
            next(e);
        }
    }
    async delete(req, res, next) {
        try {
            const result = await employee_service_js_1.employeeService.delete(req.params.id, req.tenantId);
            res.json({ success: true, data: result });
        }
        catch (e) {
            next(e);
        }
    }
}
exports.EmployeeController = EmployeeController;
exports.employeeController = new EmployeeController();
//# sourceMappingURL=employee.controller.js.map