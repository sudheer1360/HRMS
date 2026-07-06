export declare class FormBuilderService {
    listForms(tenantId: string, params: any): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: any;
        };
    }>;
    getForm(id: string, tenantId: string): Promise<any>;
    createForm(tenantId: string, input: any): Promise<any>;
    updateForm(id: string, tenantId: string, input: any): Promise<any>;
    deleteForm(id: string, tenantId: string): Promise<{
        message: string;
    }>;
    submitResponse(tenantId: string, formId: string, input: any): Promise<any>;
    listSubmissions(tenantId: string, formId: string): Promise<any[]>;
}
export declare class TemplateService {
    listTemplates(tenantId: string, type?: string): Promise<{
        data: any[];
        meta: {
            total: number;
        };
    }>;
    createTemplate(tenantId: string, input: any): Promise<any>;
}
export declare class BiometricService {
    listDevices(tenantId: string): Promise<{
        data: never[];
        meta: {
            total: number;
            message: string;
        };
    }>;
    registerDevice(tenantId: string, input: any): Promise<any>;
    syncDevice(deviceId: string, tenantId: string): Promise<{
        deviceId: string;
        syncedAt: string;
        recordsProcessed: number;
        message: string;
    }>;
    updateDevice(deviceId: string, tenantId: string, input: any): Promise<any>;
    deleteDevice(deviceId: string, tenantId: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
    listLogs(tenantId: string, params: {
        from?: string;
        to?: string;
        deviceId?: string;
        limit?: number;
        page?: number;
    }): Promise<{
        data: any;
        meta: {
            total: any;
        };
    }>;
    listExceptions(tenantId: string, params: {
        resolved?: boolean;
        limit?: number;
    }): Promise<{
        data: any;
        meta: {
            total: any;
        };
    }>;
    resolveException(exceptionId: string, tenantId: string, resolution: string): Promise<{
        id: string;
        resolved: boolean;
        resolution: string;
        resolvedAt: string;
    }>;
    getSyncStatus(tenantId: string): Promise<any>;
}
export declare class StatutoryService {
    calculatePF(tenantId: string, employeeId: string): Promise<{
        employeeId: string;
        pfWage: number;
        employeeContribution: number;
        employerContribution: number;
        eps: number;
        edli: number;
    }>;
    calculateESI(tenantId: string, employeeId: string): Promise<{
        employeeId: string;
        grossSalary: number;
        applicable: boolean;
        employeeESI: number;
        employerESI: number;
    }>;
    calculateTDS(tenantId: string, employeeId: string): Promise<{
        employeeId: string;
        projectedAnnualIncome: number;
        taxableIncome: number;
        taxLiability: number;
        monthlyTDS: number;
    }>;
}
export declare class BenefitsService {
    listPolicies(tenantId: string): Promise<{
        data: never[];
        meta: {
            total: number;
            message: string;
        };
    }>;
    createPolicy(tenantId: string, input: any): Promise<any>;
    listClaims(tenantId: string, params?: any): Promise<{
        data: never[];
        meta: {
            total: number;
            page: number;
            limit: number;
        };
    }>;
    submitClaim(tenantId: string, employeeId: string, input: any): Promise<any>;
}
export declare class GovernanceService {
    getFeatureFlags(tenantId: string): Promise<{
        flags: {
            name: string;
            enabled: boolean;
            rolloutPercent: number;
        }[];
    }>;
    getSystemHealth(tenantId: string): Promise<{
        status: string;
        uptime: number;
        memory: NodeJS.MemoryUsage;
        dbStatus: string;
        redisStatus: string;
        timestamp: string;
    }>;
    getScopeStatus(tenantId: string): Promise<{
        phases: {
            name: string;
            status: string;
            completion: number;
        }[];
        totalModules: number;
        completedModules: number;
        overallCompletion: number;
    }>;
    getNFRPerformance(tenantId: string): Promise<any[]>;
    getNFRScalability(tenantId: string): Promise<{
        config: any;
        current: {
            employees: number;
            activeUsers: number;
            dbConnections: number;
            cpuPercent: number;
            memoryPercent: number;
        };
    }>;
    getNFRDRStatus(tenantId: string): Promise<any>;
    getNFRCompliance(tenantId: string): Promise<any[]>;
    getNFRAlerts(tenantId: string): Promise<any[]>;
    getAuditLogs(tenantId: string, params: {
        page?: number;
        limit?: number;
        entity?: string;
    }): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: number;
        };
    }>;
    getLoginSessions(tenantId: string): Promise<any[]>;
}
export declare class ContractorService {
    list(tenantId: string, params: {
        limit?: number;
    }): Promise<{
        data: any[];
    }>;
    create(tenantId: string, input: any): Promise<any>;
    update(id: string, tenantId: string, input: any): Promise<any>;
    delete(id: string, tenantId: string): Promise<{
        deleted: boolean;
    }>;
    listWorkers(tenantId: string, params: {
        limit?: number;
    }): Promise<{
        data: any[];
    }>;
    createWorker(tenantId: string, input: any): Promise<any>;
    listAttendance(tenantId: string, params: {
        date?: string;
        limit?: number;
    }): Promise<{
        data: any[];
    }>;
    listInvoices(tenantId: string, params: {
        limit?: number;
    }): Promise<{
        data: any[];
    }>;
    createInvoice(tenantId: string, input: any): Promise<any>;
    approveInvoice(id: string, tenantId: string): Promise<{
        id: string;
        status: string;
    }>;
    listCompliance(tenantId: string, params: {
        limit?: number;
    }): Promise<{
        data: any[];
    }>;
}
export declare class OnboardingService {
    listOnboarding(tenantId: string, params: {
        status?: string;
        limit?: number;
    }): Promise<{
        data: any[];
    }>;
    completeOnboarding(id: string, tenantId: string): Promise<{
        id: string;
        status: string;
    }>;
    listTemplates(tenantId: string, params: {
        limit?: number;
    }): Promise<{
        data: any[];
    }>;
    createTemplate(tenantId: string, input: any): Promise<any>;
    listTemplateTasks(templateId: string, tenantId: string): Promise<{
        data: any[];
    }>;
    addTemplateTask(templateId: string, tenantId: string, input: any): Promise<any>;
    deleteTemplateTask(taskId: string, tenantId: string): Promise<{
        deleted: boolean;
    }>;
    listMyTasks(tenantId: string, userId: string): Promise<{
        data: any[];
    }>;
    completeTask(taskId: string, tenantId: string): Promise<{
        id: string;
        status: string;
    }>;
    listBGV(tenantId: string, params: {
        limit?: number;
    }): Promise<{
        data: any[];
    }>;
}
export declare class AssetService {
    listAssets(tenantId: string, params: any): Promise<{
        data: any[];
    }>;
    createAsset(tenantId: string, input: any): Promise<any>;
    deleteAsset(id: string, tenantId: string): Promise<{
        deleted: boolean;
    }>;
    myAssets(tenantId: string, userId: string): Promise<{
        data: any[];
    }>;
    listAllocations(tenantId: string, params: any): Promise<{
        data: any[];
    }>;
    allocateAsset(tenantId: string, input: any): Promise<any>;
    returnAsset(allocationId: string, tenantId: string): Promise<{
        id: string;
        status: string;
    }>;
    listMaintenance(tenantId: string, params: any): Promise<{
        data: any[];
    }>;
    createMaintenance(tenantId: string, input: any): Promise<any>;
    completeMaintenance(maintenanceId: string, tenantId: string): Promise<{
        id: string;
        status: string;
    }>;
}
export declare class ExitService {
    listExitRequests(tenantId: string, params: any): Promise<{
        data: any[];
    }>;
    createExitRequest(tenantId: string, input: any): Promise<any>;
    approveExitRequest(id: string, tenantId: string): Promise<{
        id: string;
        status: string;
    }>;
    rejectExitRequest(id: string, tenantId: string, input: any): Promise<{
        id: string;
        status: string;
    }>;
    listClearances(tenantId: string, params: any): Promise<{
        data: any[];
    }>;
    clearDepartment(id: string, tenantId: string): Promise<{
        id: string;
        status: string;
    }>;
    listFnF(tenantId: string, params: any): Promise<{
        data: any[];
    }>;
    processFnF(id: string, tenantId: string): Promise<{
        id: string;
        status: string;
    }>;
    listExitInterviews(tenantId: string, params: any): Promise<{
        data: any[];
    }>;
    createExitInterview(tenantId: string, input: any): Promise<any>;
}
export declare class AnalyticsService {
    headcount(tenantId: string, params: any): Promise<{
        data: any;
    }>;
    attrition(tenantId: string, params: any): Promise<{
        data: any;
    }>;
    payrollSummary(tenantId: string, params: any): Promise<{
        data: any;
    }>;
    attendanceSummary(tenantId: string, params: any): Promise<{
        data: any;
    }>;
    generateReport(tenantId: string, type: string, params: any): Promise<{
        data: any[];
    }>;
    statutoryPFSummary(tenantId: string): Promise<{
        data: any;
    }>;
    statutoryESISummary(tenantId: string): Promise<{
        data: any;
    }>;
    statutoryTDSSummary(tenantId: string): Promise<{
        data: any;
    }>;
}
export declare const formBuilderService: FormBuilderService;
export declare const templateService: TemplateService;
export declare const biometricService: BiometricService;
export declare const statutoryService: StatutoryService;
export declare const benefitsService: BenefitsService;
export declare const governanceService: GovernanceService;
export declare const onboardingService: OnboardingService;
export declare const contractorService: ContractorService;
export declare const assetService: AssetService;
export declare const exitService: ExitService;
export declare const analyticsService: AnalyticsService;
export declare class GrievanceService {
    private fallbackComplaints;
    listGrievances(tenantId: string, params: any): Promise<{
        data: any[];
        meta: {
            total: number;
        };
    }>;
    getGrievance(id: string, tenantId: string): Promise<any>;
    createGrievance(tenantId: string, userId: string, input: any): Promise<{
        id: string;
        ticketNumber: string;
    }>;
    updateGrievance(id: string, tenantId: string, input: any): Promise<any>;
    slaStatus(tenantId: string): Promise<{
        data: {
            total: number;
            breached: number;
            byStatus: any[];
            withinSLA?: undefined;
            avgResolutionDays?: undefined;
            poshCases?: undefined;
            anonymousCases?: undefined;
        };
    } | {
        data: {
            total: number;
            breached: number;
            withinSLA: number;
            byStatus: {
                status: string;
                count: number;
            }[];
            avgResolutionDays: number;
            poshCases: number;
            anonymousCases: number;
        };
    }>;
}
export declare class DisciplinaryService {
    private fallbackCases;
    listCases(tenantId: string, params: any): Promise<{
        data: any[];
        meta: {
            total: number;
        };
    }>;
    getCase(id: string, tenantId: string): Promise<any>;
    createCase(tenantId: string, userId: string, input: any): Promise<{
        id: string;
        caseNumber: string;
    }>;
    updateCase(id: string, tenantId: string, input: any): Promise<any>;
    issuShowCause(id: string, tenantId: string, data: any): Promise<any>;
    scheduleHearing(id: string, tenantId: string, data: any): Promise<any>;
    recordAction(id: string, tenantId: string, data: any): Promise<any>;
    summary(tenantId: string): Promise<{
        data: {
            byStatus: any[];
            total: number;
            open?: undefined;
            closed?: undefined;
            pendingShowCause?: undefined;
            bySeverity?: undefined;
        };
    } | {
        data: {
            total: number;
            open: number;
            closed: number;
            pendingShowCause: number;
            byStatus: {
                status: string;
                count: number;
            }[];
            bySeverity: {
                severity: string;
                count: number;
            }[];
        };
    }>;
}
export declare const grievanceService: GrievanceService;
export declare const disciplinaryService: DisciplinaryService;
//# sourceMappingURL=formbuilder.service.d.ts.map