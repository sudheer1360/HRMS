"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizationController = exports.OrganizationController = void 0;
const organization_service_js_1 = require("./organization.service.js");
const organization_schema_js_1 = require("./organization.schema.js");
const index_js_1 = require("../../common/base/index.js");
class OrganizationController extends index_js_1.BaseController {
    // ── Companies ──────────────────────────────────────────────────────────────
    async listCompanies(req, res, next) {
        await this.handle(next, async () => {
            const q = organization_schema_js_1.paginationSchema.parse(req.query);
            const result = await organization_service_js_1.organizationService.listCompanies(req.tenantId, q);
            res.json({ success: true, ...result });
        });
    }
    async getCompany(req, res, next) {
        await this.handle(next, async () => {
            this.ok(res, await organization_service_js_1.organizationService.getCompany(req.params.id, req.tenantId));
        });
    }
    async createCompany(req, res, next) {
        await this.handle(next, async () => {
            const input = organization_schema_js_1.createCompanySchema.parse(req.body);
            this.created(res, await organization_service_js_1.organizationService.createCompany(req.tenantId, req.user.userId, input));
        });
    }
    async updateCompany(req, res, next) {
        await this.handle(next, async () => {
            const input = organization_schema_js_1.updateCompanySchema.parse(req.body);
            this.ok(res, await organization_service_js_1.organizationService.updateCompany(req.params.id, req.tenantId, input));
        });
    }
    async deleteCompany(req, res, next) {
        await this.handle(next, async () => {
            this.ok(res, await organization_service_js_1.organizationService.deleteCompany(req.params.id, req.tenantId));
        });
    }
    // ── Branches ───────────────────────────────────────────────────────────────
    async listBranches(req, res, next) {
        await this.handle(next, async () => {
            const result = await organization_service_js_1.organizationService.listBranches(req.tenantId, req.params.companyId, req.query);
            res.json({ success: true, ...result });
        });
    }
    async createBranch(req, res, next) {
        await this.handle(next, async () => {
            const input = organization_schema_js_1.createBranchSchema.parse(req.body);
            this.created(res, await organization_service_js_1.organizationService.createBranch(req.tenantId, req.user.userId, input));
        });
    }
    async updateBranch(req, res, next) {
        await this.handle(next, async () => {
            const input = organization_schema_js_1.updateBranchSchema.parse(req.body);
            this.ok(res, await organization_service_js_1.organizationService.updateBranch(req.params.id, req.tenantId, input));
        });
    }
    async deleteBranch(req, res, next) {
        await this.handle(next, async () => {
            this.ok(res, await organization_service_js_1.organizationService.deleteBranch(req.params.id, req.tenantId));
        });
    }
    // ── Departments ────────────────────────────────────────────────────────────
    async listDepartments(req, res, next) {
        await this.handle(next, async () => {
            const result = await organization_service_js_1.organizationService.listDepartments(req.tenantId, req.params.companyId, req.query);
            res.json({ success: true, ...result });
        });
    }
    async getDepartmentTree(req, res, next) {
        await this.handle(next, async () => {
            this.ok(res, await organization_service_js_1.organizationService.getDepartmentTree(req.tenantId, req.params.companyId));
        });
    }
    async createDepartment(req, res, next) {
        await this.handle(next, async () => {
            const input = organization_schema_js_1.createDepartmentSchema.parse(req.body);
            this.created(res, await organization_service_js_1.organizationService.createDepartment(req.tenantId, req.user.userId, input));
        });
    }
    async updateDepartment(req, res, next) {
        await this.handle(next, async () => {
            const input = organization_schema_js_1.updateDepartmentSchema.parse(req.body);
            this.ok(res, await organization_service_js_1.organizationService.updateDepartment(req.params.id, req.tenantId, input));
        });
    }
    async deleteDepartment(req, res, next) {
        await this.handle(next, async () => {
            this.ok(res, await organization_service_js_1.organizationService.deleteDepartment(req.params.id, req.tenantId));
        });
    }
    // ── Designations ───────────────────────────────────────────────────────────
    async listDesignations(req, res, next) {
        await this.handle(next, async () => {
            const result = await organization_service_js_1.organizationService.listDesignations(req.tenantId, req.params.companyId, req.query);
            res.json({ success: true, ...result });
        });
    }
    async createDesignation(req, res, next) {
        await this.handle(next, async () => {
            const input = organization_schema_js_1.createDesignationSchema.parse(req.body);
            this.created(res, await organization_service_js_1.organizationService.createDesignation(req.tenantId, req.user.userId, input));
        });
    }
    async updateDesignation(req, res, next) {
        await this.handle(next, async () => {
            const input = organization_schema_js_1.updateDesignationSchema.parse(req.body);
            this.ok(res, await organization_service_js_1.organizationService.updateDesignation(req.params.id, req.tenantId, input));
        });
    }
    async deleteDesignation(req, res, next) {
        await this.handle(next, async () => {
            this.ok(res, await organization_service_js_1.organizationService.deleteDesignation(req.params.id, req.tenantId));
        });
    }
    // ── Grades ─────────────────────────────────────────────────────────────────
    async listGrades(req, res, next) {
        await this.handle(next, async () => {
            const result = await organization_service_js_1.organizationService.listGrades(req.tenantId, req.params.companyId, req.query);
            res.json({ success: true, ...result });
        });
    }
    async createGrade(req, res, next) {
        await this.handle(next, async () => {
            const input = organization_schema_js_1.createGradeSchema.parse(req.body);
            this.created(res, await organization_service_js_1.organizationService.createGrade(req.tenantId, req.user.userId, input));
        });
    }
    async updateGrade(req, res, next) {
        await this.handle(next, async () => {
            const input = organization_schema_js_1.updateGradeSchema.parse(req.body);
            this.ok(res, await organization_service_js_1.organizationService.updateGrade(req.params.id, req.tenantId, input));
        });
    }
    async deleteGrade(req, res, next) {
        await this.handle(next, async () => {
            this.ok(res, await organization_service_js_1.organizationService.deleteGrade(req.params.id, req.tenantId));
        });
    }
    // ── Cost Centers ───────────────────────────────────────────────────────────
    async listCostCenters(req, res, next) {
        await this.handle(next, async () => {
            const result = await organization_service_js_1.organizationService.listCostCenters(req.tenantId, req.params.companyId, req.query);
            res.json({ success: true, ...result });
        });
    }
    async createCostCenter(req, res, next) {
        await this.handle(next, async () => {
            const input = organization_schema_js_1.createCostCenterSchema.parse(req.body);
            this.created(res, await organization_service_js_1.organizationService.createCostCenter(req.tenantId, req.user.userId, input));
        });
    }
    async updateCostCenter(req, res, next) {
        await this.handle(next, async () => {
            const input = organization_schema_js_1.createCostCenterSchema.partial().parse(req.body);
            this.ok(res, await organization_service_js_1.organizationService.updateCostCenter(req.params.id, req.tenantId, input));
        });
    }
    async deleteCostCenter(req, res, next) {
        await this.handle(next, async () => {
            this.ok(res, await organization_service_js_1.organizationService.deleteCostCenter(req.params.id, req.tenantId));
        });
    }
    // ── Branch detail ──────────────────────────────────────────────────────────
    async getBranch(req, res, next) {
        await this.handle(next, async () => {
            this.ok(res, await organization_service_js_1.organizationService.getBranch(req.params.id, req.tenantId));
        });
    }
}
exports.OrganizationController = OrganizationController;
exports.organizationController = new OrganizationController();
//# sourceMappingURL=organization.controller.js.map