import { z } from 'zod';
export declare const createCompanySchema: z.ZodObject<{
    companyName: z.ZodString;
    legalName: z.ZodString;
    companyCode: z.ZodString;
    logoUrl: z.ZodOptional<z.ZodString>;
    pan: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    tan: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    gstin: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    cin: z.ZodOptional<z.ZodString>;
    registeredAddress: z.ZodString;
    corporateAddress: z.ZodOptional<z.ZodString>;
    email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    phone: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    website: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    financialYearStartMonth: z.ZodOptional<z.ZodString>;
    payrollCycle: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    companyName: string;
    legalName: string;
    registeredAddress: string;
    companyCode: string;
    email?: string | undefined;
    corporateAddress?: string | undefined;
    phone?: string | undefined;
    website?: string | undefined;
    pan?: string | undefined;
    tan?: string | undefined;
    gstin?: string | undefined;
    cin?: string | undefined;
    financialYearStartMonth?: string | undefined;
    payrollCycle?: string | undefined;
    logoUrl?: string | undefined;
}, {
    companyName: string;
    legalName: string;
    registeredAddress: string;
    companyCode: string;
    email?: string | undefined;
    corporateAddress?: string | undefined;
    phone?: string | undefined;
    website?: string | undefined;
    pan?: string | undefined;
    tan?: string | undefined;
    gstin?: string | undefined;
    cin?: string | undefined;
    financialYearStartMonth?: string | undefined;
    payrollCycle?: string | undefined;
    logoUrl?: string | undefined;
}>;
export declare const createBranchSchema: z.ZodObject<{
    companyId: z.ZodString;
    branchName: z.ZodString;
    branchCode: z.ZodString;
    branchType: z.ZodEnum<["Head Office", "Regional Office", "Sales Office", "Plant", "Factory", "Warehouse", "Site"]>;
    address: z.ZodString;
    city: z.ZodString;
    state: z.ZodString;
    country: z.ZodDefault<z.ZodString>;
    pinCode: z.ZodOptional<z.ZodString>;
    isPayrollLocation: z.ZodDefault<z.ZodBoolean>;
    latitude: z.ZodOptional<z.ZodNumber>;
    longitude: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    companyId: string;
    branchName: string;
    branchCode: string;
    branchType: "Head Office" | "Regional Office" | "Sales Office" | "Plant" | "Factory" | "Warehouse" | "Site";
    address: string;
    city: string;
    state: string;
    country: string;
    isPayrollLocation: boolean;
    pinCode?: string | undefined;
    latitude?: number | undefined;
    longitude?: number | undefined;
}, {
    companyId: string;
    branchName: string;
    branchCode: string;
    branchType: "Head Office" | "Regional Office" | "Sales Office" | "Plant" | "Factory" | "Warehouse" | "Site";
    address: string;
    city: string;
    state: string;
    country?: string | undefined;
    pinCode?: string | undefined;
    isPayrollLocation?: boolean | undefined;
    latitude?: number | undefined;
    longitude?: number | undefined;
}>;
export declare const createDepartmentSchema: z.ZodObject<{
    companyId: z.ZodString;
    branchId: z.ZodOptional<z.ZodString>;
    parentDepartmentId: z.ZodOptional<z.ZodString>;
    departmentName: z.ZodString;
    departmentCode: z.ZodString;
    departmentHeadId: z.ZodOptional<z.ZodString>;
    costCenterId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    departmentName: string;
    companyId: string;
    departmentCode: string;
    departmentHeadId?: string | undefined;
    parentDepartmentId?: string | undefined;
    branchId?: string | undefined;
    costCenterId?: string | undefined;
}, {
    departmentName: string;
    companyId: string;
    departmentCode: string;
    departmentHeadId?: string | undefined;
    parentDepartmentId?: string | undefined;
    branchId?: string | undefined;
    costCenterId?: string | undefined;
}>;
export declare const createDesignationSchema: z.ZodObject<{
    companyId: z.ZodString;
    designationName: z.ZodString;
    designationCode: z.ZodString;
    gradeId: z.ZodOptional<z.ZodString>;
    level: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    companyId: string;
    designationName: string;
    designationCode: string;
    level?: number | undefined;
    gradeId?: string | undefined;
}, {
    companyId: string;
    designationName: string;
    designationCode: string;
    level?: number | undefined;
    gradeId?: string | undefined;
}>;
export declare const createGradeSchema: z.ZodObject<{
    companyId: z.ZodString;
    gradeName: z.ZodString;
    gradeCode: z.ZodString;
    minSalary: z.ZodOptional<z.ZodNumber>;
    maxSalary: z.ZodOptional<z.ZodNumber>;
    sortOrder: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    companyId: string;
    gradeName: string;
    gradeCode: string;
    sortOrder: number;
    minSalary?: number | undefined;
    maxSalary?: number | undefined;
}, {
    companyId: string;
    gradeName: string;
    gradeCode: string;
    minSalary?: number | undefined;
    maxSalary?: number | undefined;
    sortOrder?: number | undefined;
}>;
export declare const createCostCenterSchema: z.ZodObject<{
    companyId: z.ZodString;
    costCenterName: z.ZodString;
    costCenterCode: z.ZodString;
    branchId: z.ZodOptional<z.ZodString>;
    departmentId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    companyId: string;
    costCenterName: string;
    costCenterCode: string;
    branchId?: string | undefined;
    departmentId?: string | undefined;
}, {
    companyId: string;
    costCenterName: string;
    costCenterCode: string;
    branchId?: string | undefined;
    departmentId?: string | undefined;
}>;
export declare const updateCompanySchema: z.ZodObject<{
    companyName: z.ZodOptional<z.ZodString>;
    legalName: z.ZodOptional<z.ZodString>;
    companyCode: z.ZodOptional<z.ZodString>;
    logoUrl: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    pan: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
    tan: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
    gstin: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
    cin: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    registeredAddress: z.ZodOptional<z.ZodString>;
    corporateAddress: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    email: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
    phone: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
    website: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
    financialYearStartMonth: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    payrollCycle: z.ZodOptional<z.ZodOptional<z.ZodString>>;
} & {
    status: z.ZodOptional<z.ZodEnum<["Active", "Inactive"]>>;
}, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    status?: "Active" | "Inactive" | undefined;
    companyName?: string | undefined;
    legalName?: string | undefined;
    registeredAddress?: string | undefined;
    corporateAddress?: string | undefined;
    phone?: string | undefined;
    website?: string | undefined;
    pan?: string | undefined;
    tan?: string | undefined;
    gstin?: string | undefined;
    cin?: string | undefined;
    financialYearStartMonth?: string | undefined;
    payrollCycle?: string | undefined;
    companyCode?: string | undefined;
    logoUrl?: string | undefined;
}, {
    email?: string | undefined;
    status?: "Active" | "Inactive" | undefined;
    companyName?: string | undefined;
    legalName?: string | undefined;
    registeredAddress?: string | undefined;
    corporateAddress?: string | undefined;
    phone?: string | undefined;
    website?: string | undefined;
    pan?: string | undefined;
    tan?: string | undefined;
    gstin?: string | undefined;
    cin?: string | undefined;
    financialYearStartMonth?: string | undefined;
    payrollCycle?: string | undefined;
    companyCode?: string | undefined;
    logoUrl?: string | undefined;
}>;
export declare const updateBranchSchema: z.ZodObject<{
    companyId: z.ZodOptional<z.ZodString>;
    branchName: z.ZodOptional<z.ZodString>;
    branchCode: z.ZodOptional<z.ZodString>;
    branchType: z.ZodOptional<z.ZodEnum<["Head Office", "Regional Office", "Sales Office", "Plant", "Factory", "Warehouse", "Site"]>>;
    address: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    state: z.ZodOptional<z.ZodString>;
    country: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    pinCode: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    isPayrollLocation: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    latitude: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    longitude: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
} & {
    status: z.ZodOptional<z.ZodEnum<["Active", "Inactive"]>>;
}, "strip", z.ZodTypeAny, {
    status?: "Active" | "Inactive" | undefined;
    companyId?: string | undefined;
    branchName?: string | undefined;
    branchCode?: string | undefined;
    branchType?: "Head Office" | "Regional Office" | "Sales Office" | "Plant" | "Factory" | "Warehouse" | "Site" | undefined;
    address?: string | undefined;
    city?: string | undefined;
    state?: string | undefined;
    country?: string | undefined;
    pinCode?: string | undefined;
    isPayrollLocation?: boolean | undefined;
    latitude?: number | undefined;
    longitude?: number | undefined;
}, {
    status?: "Active" | "Inactive" | undefined;
    companyId?: string | undefined;
    branchName?: string | undefined;
    branchCode?: string | undefined;
    branchType?: "Head Office" | "Regional Office" | "Sales Office" | "Plant" | "Factory" | "Warehouse" | "Site" | undefined;
    address?: string | undefined;
    city?: string | undefined;
    state?: string | undefined;
    country?: string | undefined;
    pinCode?: string | undefined;
    isPayrollLocation?: boolean | undefined;
    latitude?: number | undefined;
    longitude?: number | undefined;
}>;
export declare const updateDepartmentSchema: z.ZodObject<{
    companyId: z.ZodOptional<z.ZodString>;
    branchId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    departmentName: z.ZodOptional<z.ZodString>;
    departmentCode: z.ZodOptional<z.ZodString>;
    departmentHeadId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    costCenterId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
} & {
    status: z.ZodOptional<z.ZodEnum<["Active", "Inactive"]>>;
    parentDepartmentId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    status?: "Active" | "Inactive" | undefined;
    departmentName?: string | undefined;
    departmentHeadId?: string | undefined;
    parentDepartmentId?: string | null | undefined;
    branchId?: string | undefined;
    companyId?: string | undefined;
    departmentCode?: string | undefined;
    costCenterId?: string | undefined;
}, {
    status?: "Active" | "Inactive" | undefined;
    departmentName?: string | undefined;
    departmentHeadId?: string | undefined;
    parentDepartmentId?: string | null | undefined;
    branchId?: string | undefined;
    companyId?: string | undefined;
    departmentCode?: string | undefined;
    costCenterId?: string | undefined;
}>;
export declare const updateDesignationSchema: z.ZodObject<{
    companyId: z.ZodOptional<z.ZodString>;
    designationName: z.ZodOptional<z.ZodString>;
    designationCode: z.ZodOptional<z.ZodString>;
    gradeId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    level: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
} & {
    status: z.ZodOptional<z.ZodEnum<["Active", "Inactive"]>>;
}, "strip", z.ZodTypeAny, {
    level?: number | undefined;
    status?: "Active" | "Inactive" | undefined;
    companyId?: string | undefined;
    designationName?: string | undefined;
    designationCode?: string | undefined;
    gradeId?: string | undefined;
}, {
    level?: number | undefined;
    status?: "Active" | "Inactive" | undefined;
    companyId?: string | undefined;
    designationName?: string | undefined;
    designationCode?: string | undefined;
    gradeId?: string | undefined;
}>;
export declare const updateGradeSchema: z.ZodObject<{
    companyId: z.ZodOptional<z.ZodString>;
    gradeName: z.ZodOptional<z.ZodString>;
    gradeCode: z.ZodOptional<z.ZodString>;
    minSalary: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    maxSalary: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    sortOrder: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
} & {
    status: z.ZodOptional<z.ZodEnum<["Active", "Inactive"]>>;
}, "strip", z.ZodTypeAny, {
    status?: "Active" | "Inactive" | undefined;
    companyId?: string | undefined;
    gradeName?: string | undefined;
    gradeCode?: string | undefined;
    minSalary?: number | undefined;
    maxSalary?: number | undefined;
    sortOrder?: number | undefined;
}, {
    status?: "Active" | "Inactive" | undefined;
    companyId?: string | undefined;
    gradeName?: string | undefined;
    gradeCode?: string | undefined;
    minSalary?: number | undefined;
    maxSalary?: number | undefined;
    sortOrder?: number | undefined;
}>;
export declare const updateCostCenterSchema: z.ZodObject<{
    companyId: z.ZodOptional<z.ZodString>;
    costCenterName: z.ZodOptional<z.ZodString>;
    costCenterCode: z.ZodOptional<z.ZodString>;
    branchId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    departmentId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
} & {
    status: z.ZodOptional<z.ZodEnum<["Active", "Inactive"]>>;
}, "strip", z.ZodTypeAny, {
    status?: "Active" | "Inactive" | undefined;
    branchId?: string | undefined;
    companyId?: string | undefined;
    costCenterName?: string | undefined;
    costCenterCode?: string | undefined;
    departmentId?: string | undefined;
}, {
    status?: "Active" | "Inactive" | undefined;
    branchId?: string | undefined;
    companyId?: string | undefined;
    costCenterName?: string | undefined;
    costCenterCode?: string | undefined;
    departmentId?: string | undefined;
}>;
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sort: z.ZodOptional<z.ZodString>;
    order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
    search: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    order: "asc" | "desc";
    sort?: string | undefined;
    search?: string | undefined;
    status?: string | undefined;
}, {
    sort?: string | undefined;
    search?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    status?: string | undefined;
    order?: "asc" | "desc" | undefined;
}>;
export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type CreateBranchInput = z.infer<typeof createBranchSchema>;
export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type CreateDesignationInput = z.infer<typeof createDesignationSchema>;
export type CreateGradeInput = z.infer<typeof createGradeSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
//# sourceMappingURL=organization.schema.d.ts.map