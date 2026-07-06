import { BaseService } from '../../common/base/index.js';
import { ICompany } from '../../common/interfaces/index.js';
export declare class OrganizationService extends BaseService {
    listCompanies(tenantId: string, params: any): Promise<{
        data: ICompany[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    getCompany(id: string, tenantId: string): Promise<any>;
    createCompany(tenantId: string, userId: string, input: any): Promise<any>;
    updateCompany(id: string, tenantId: string, input: any): Promise<ICompany | null>;
    deleteCompany(id: string, tenantId: string): Promise<{
        message: string;
    }>;
    listBranches(tenantId: string, companyId: string, params: any): Promise<{
        data: any[];
        meta: {
            total: number;
        };
    }>;
    getBranch(id: string, tenantId: string): Promise<any>;
    createBranch(tenantId: string, userId: string, input: any): Promise<any>;
    updateBranch(id: string, tenantId: string, input: any): Promise<any>;
    deleteBranch(id: string, tenantId: string): Promise<{
        message: string;
    }>;
    listDepartments(tenantId: string, companyId: string, params: any): Promise<{
        data: any[];
        meta: {
            total: number;
        };
    }>;
    getDepartmentTree(tenantId: string, companyId: string): Promise<any[]>;
    createDepartment(tenantId: string, userId: string, input: any): Promise<any>;
    updateDepartment(id: string, tenantId: string, input: any): Promise<any>;
    deleteDepartment(id: string, tenantId: string): Promise<{
        message: string;
    }>;
    listDesignations(tenantId: string, companyId: string, params: any): Promise<{
        data: any[];
        meta: {
            total: number;
        };
    }>;
    createDesignation(tenantId: string, userId: string, input: any): Promise<any>;
    updateDesignation(id: string, tenantId: string, input: any): Promise<any>;
    deleteDesignation(id: string, tenantId: string): Promise<{
        message: string;
    }>;
    listGrades(tenantId: string, companyId: string, params: any): Promise<{
        data: any[];
        meta: {
            total: number;
        };
    }>;
    createGrade(tenantId: string, userId: string, input: any): Promise<any>;
    updateGrade(id: string, tenantId: string, input: any): Promise<any>;
    deleteGrade(id: string, tenantId: string): Promise<{
        message: string;
    }>;
    listCostCenters(tenantId: string, companyId: string, params: any): Promise<{
        data: any[];
        meta: {
            total: number;
        };
    }>;
    createCostCenter(tenantId: string, userId: string, input: any): Promise<any>;
    updateCostCenter(id: string, tenantId: string, input: any): Promise<any>;
    deleteCostCenter(id: string, tenantId: string): Promise<{
        message: string;
    }>;
}
export declare const organizationService: OrganizationService;
//# sourceMappingURL=organization.service.d.ts.map