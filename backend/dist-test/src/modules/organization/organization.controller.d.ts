import { Response, NextFunction } from 'express';
import { BaseController } from '../../common/base/index.js';
import { AuthenticatedRequest } from '../../common/types/index.js';
export declare class OrganizationController extends BaseController {
    listCompanies(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getCompany(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    createCompany(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateCompany(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    deleteCompany(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listBranches(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    createBranch(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateBranch(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    deleteBranch(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listDepartments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getDepartmentTree(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    createDepartment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateDepartment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    deleteDepartment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listDesignations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    createDesignation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateDesignation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    deleteDesignation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listGrades(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    createGrade(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateGrade(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    deleteGrade(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listCostCenters(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    createCostCenter(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateCostCenter(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    deleteCostCenter(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getBranch(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const organizationController: OrganizationController;
//# sourceMappingURL=organization.controller.d.ts.map