import { Response, NextFunction } from 'express';
import { organizationService } from './organization.service.js';
import {
  createCompanySchema, updateCompanySchema,
  createBranchSchema, updateBranchSchema,
  createDepartmentSchema, updateDepartmentSchema,
  createDesignationSchema, updateDesignationSchema,
  createGradeSchema, updateGradeSchema,
  createCostCenterSchema, updateCostCenterSchema,
  paginationSchema,
} from './organization.schema.js';
import { BaseController } from '../../common/base/index.js';
import { AuthenticatedRequest } from '../../common/types/index.js';

export class OrganizationController extends BaseController {
  // ── Companies ──────────────────────────────────────────────────────────────

  async listCompanies(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    await this.handle(next, async () => {
      const q = paginationSchema.parse(req.query);
      const result = await organizationService.listCompanies(req.tenantId!, q);
      res.json({ success: true, ...result });
    });
  }

  async getCompany(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    await this.handle(next, async () => {
      this.ok(res, await organizationService.getCompany(req.params.id, req.tenantId!));
    });
  }

  async createCompany(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    await this.handle(next, async () => {
      const input = createCompanySchema.parse(req.body);
      this.created(res, await organizationService.createCompany(req.tenantId!, req.user!.userId, input));
    });
  }

  async updateCompany(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    await this.handle(next, async () => {
      const input = updateCompanySchema.parse(req.body);
      this.ok(res, await organizationService.updateCompany(req.params.id, req.tenantId!, input));
    });
  }

  async deleteCompany(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    await this.handle(next, async () => {
      this.ok(res, await organizationService.deleteCompany(req.params.id, req.tenantId!));
    });
  }

  // ── Branches ───────────────────────────────────────────────────────────────

  async listBranches(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    await this.handle(next, async () => {
      const result = await organizationService.listBranches(req.tenantId!, req.params.companyId, req.query);
      res.json({ success: true, ...result });
    });
  }

  async createBranch(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    await this.handle(next, async () => {
      const input = createBranchSchema.parse(req.body);
      this.created(res, await organizationService.createBranch(req.tenantId!, req.user!.userId, input));
    });
  }

  async updateBranch(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    await this.handle(next, async () => {
      const input = updateBranchSchema.parse(req.body);
      this.ok(res, await organizationService.updateBranch(req.params.id, req.tenantId!, input));
    });
  }

  async deleteBranch(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    await this.handle(next, async () => {
      this.ok(res, await organizationService.deleteBranch(req.params.id, req.tenantId!));
    });
  }

  // ── Departments ────────────────────────────────────────────────────────────

  async listDepartments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    await this.handle(next, async () => {
      const result = await organizationService.listDepartments(req.tenantId!, req.params.companyId, req.query);
      res.json({ success: true, ...result });
    });
  }

  async getDepartmentTree(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    await this.handle(next, async () => {
      this.ok(res, await organizationService.getDepartmentTree(req.tenantId!, req.params.companyId));
    });
  }

  async createDepartment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    await this.handle(next, async () => {
      const input = createDepartmentSchema.parse(req.body);
      this.created(res, await organizationService.createDepartment(req.tenantId!, req.user!.userId, input));
    });
  }

  async updateDepartment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    await this.handle(next, async () => {
      const input = updateDepartmentSchema.parse(req.body);
      this.ok(res, await organizationService.updateDepartment(req.params.id, req.tenantId!, input));
    });
  }

  async deleteDepartment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    await this.handle(next, async () => {
      this.ok(res, await organizationService.deleteDepartment(req.params.id, req.tenantId!));
    });
  }

  // ── Designations ───────────────────────────────────────────────────────────

  async listDesignations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    await this.handle(next, async () => {
      const result = await organizationService.listDesignations(req.tenantId!, req.params.companyId, req.query);
      res.json({ success: true, ...result });
    });
  }

  async createDesignation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    await this.handle(next, async () => {
      const input = createDesignationSchema.parse(req.body);
      this.created(res, await organizationService.createDesignation(req.tenantId!, req.user!.userId, input));
    });
  }

  async updateDesignation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    await this.handle(next, async () => {
      const input = updateDesignationSchema.parse(req.body);
      this.ok(res, await organizationService.updateDesignation(req.params.id, req.tenantId!, input));
    });
  }

  async deleteDesignation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    await this.handle(next, async () => {
      this.ok(res, await organizationService.deleteDesignation(req.params.id, req.tenantId!));
    });
  }

  // ── Grades ─────────────────────────────────────────────────────────────────

  async listGrades(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    await this.handle(next, async () => {
      const result = await organizationService.listGrades(req.tenantId!, req.params.companyId, req.query);
      res.json({ success: true, ...result });
    });
  }

  async createGrade(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    await this.handle(next, async () => {
      const input = createGradeSchema.parse(req.body);
      this.created(res, await organizationService.createGrade(req.tenantId!, req.user!.userId, input));
    });
  }

  async updateGrade(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    await this.handle(next, async () => {
      const input = updateGradeSchema.parse(req.body);
      this.ok(res, await organizationService.updateGrade(req.params.id, req.tenantId!, input));
    });
  }

  async deleteGrade(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    await this.handle(next, async () => {
      this.ok(res, await organizationService.deleteGrade(req.params.id, req.tenantId!));
    });
  }

  // ── Cost Centers ───────────────────────────────────────────────────────────

  async listCostCenters(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    await this.handle(next, async () => {
      const result = await organizationService.listCostCenters(req.tenantId!, req.params.companyId, req.query);
      res.json({ success: true, ...result });
    });
  }

  async createCostCenter(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    await this.handle(next, async () => {
      const input = createCostCenterSchema.parse(req.body);
      this.created(res, await organizationService.createCostCenter(req.tenantId!, req.user!.userId, input));
    });
  }

  async updateCostCenter(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    await this.handle(next, async () => {
      const input = createCostCenterSchema.partial().parse(req.body);
      this.ok(res, await organizationService.updateCostCenter(req.params.id, req.tenantId!, input));
    });
  }

  async deleteCostCenter(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    await this.handle(next, async () => {
      this.ok(res, await organizationService.deleteCostCenter(req.params.id, req.tenantId!));
    });
  }

  // ── Branch detail ──────────────────────────────────────────────────────────

  async getBranch(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    await this.handle(next, async () => {
      this.ok(res, await organizationService.getBranch(req.params.id, req.tenantId!));
    });
  }
}

export const organizationController = new OrganizationController();
