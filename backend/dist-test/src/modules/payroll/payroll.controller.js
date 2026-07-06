"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.payrollController = exports.PayrollController = void 0;
const payroll_service_js_1 = require("./payroll.service.js");
const payroll_schema_js_1 = require("./payroll.schema.js");
class PayrollController {
    // Components
    async createComponent(req, res, next) {
        try {
            const input = payroll_schema_js_1.createComponentSchema.parse(req.body);
            const c = await payroll_service_js_1.payrollService.createComponent(req.tenantId, input);
            res.status(201).json({ success: true, data: c });
        }
        catch (e) {
            next(e);
        }
    }
    async listComponents(req, res, next) {
        try {
            const list = await payroll_service_js_1.payrollService.listComponents(req.tenantId, req.params.companyId);
            res.json({ success: true, data: list });
        }
        catch (e) {
            next(e);
        }
    }
    // Structures
    async createStructure(req, res, next) {
        try {
            const input = payroll_schema_js_1.createStructureSchema.parse(req.body);
            const s = await payroll_service_js_1.payrollService.createStructure(req.tenantId, input);
            res.status(201).json({ success: true, data: s });
        }
        catch (e) {
            next(e);
        }
    }
    async listStructures(req, res, next) {
        try {
            const list = await payroll_service_js_1.payrollService.listStructures(req.tenantId, req.params.companyId);
            res.json({ success: true, data: list });
        }
        catch (e) {
            next(e);
        }
    }
    async listStructuresAll(req, res, next) {
        try {
            const r = await payroll_service_js_1.payrollService.listStructuresAll(req.tenantId, req.query);
            res.json({ success: true, ...r });
        }
        catch (e) {
            next(e);
        }
    }
    // Runs
    async createRun(req, res, next) {
        try {
            const input = payroll_schema_js_1.createPayrollRunSchema.parse(req.body);
            const r = await payroll_service_js_1.payrollService.createRun(req.tenantId, req.user.userId, input);
            res.status(201).json({ success: true, data: r });
        }
        catch (e) {
            next(e);
        }
    }
    async processRun(req, res, next) {
        try {
            const r = await payroll_service_js_1.payrollService.processRun(req.params.id, req.tenantId, req.user.userId);
            res.json({ success: true, data: r });
        }
        catch (e) {
            next(e);
        }
    }
    async approveRun(req, res, next) {
        try {
            const r = await payroll_service_js_1.payrollService.approveRun(req.params.id, req.tenantId, req.user.userId);
            res.json({ success: true, data: r });
        }
        catch (e) {
            next(e);
        }
    }
    async listRuns(req, res, next) {
        try {
            const r = await payroll_service_js_1.payrollService.listRuns(req.tenantId, req.query);
            res.json({ success: true, ...r });
        }
        catch (e) {
            next(e);
        }
    }
    async myPayslips(req, res, next) {
        try {
            const slips = await payroll_service_js_1.payrollService.getPayslips(req.tenantId, req.user.userId);
            res.json({ success: true, data: slips });
        }
        catch (e) {
            next(e);
        }
    }
    // Expenses
    async submitClaim(req, res, next) {
        try {
            const input = payroll_schema_js_1.expenseClaimSchema.parse(req.body);
            const c = await payroll_service_js_1.expenseService.submitClaim(req.tenantId, input);
            res.status(201).json({ success: true, data: c });
        }
        catch (e) {
            next(e);
        }
    }
    async listClaims(req, res, next) {
        try {
            if (req.query.my)
                req.query.employeeId = req.user.userId;
            const r = await payroll_service_js_1.expenseService.listClaims(req.tenantId, req.query);
            res.json({ success: true, ...r });
        }
        catch (e) {
            next(e);
        }
    }
    async approveClaim(req, res, next) {
        try {
            const { status, rejectedReason } = payroll_schema_js_1.expenseApprovalSchema.parse(req.body);
            const r = status === 'Approved' ? await payroll_service_js_1.expenseService.approveClaim(req.params.id, req.tenantId, req.user.userId) : await payroll_service_js_1.expenseService.rejectClaim(req.params.id, req.tenantId, req.user.userId);
            res.json({ success: true, data: r });
        }
        catch (e) {
            next(e);
        }
    }
}
exports.PayrollController = PayrollController;
exports.payrollController = new PayrollController();
//# sourceMappingURL=payroll.controller.js.map