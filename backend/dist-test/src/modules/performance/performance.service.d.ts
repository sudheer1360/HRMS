export declare class PerformanceService {
    listMyGoals(tenantId: string, userId: string, params: any): Promise<{
        data: any[];
    }>;
    createGoal(tenantId: string, userId: string, input: any): Promise<any>;
    updateGoalProgress(goalId: string, tenantId: string, progress: number): Promise<{
        id: string;
        progress: number;
    }>;
    deleteGoal(goalId: string, tenantId: string): Promise<{
        deleted: boolean;
    }>;
    listMyAppraisals(tenantId: string, userId: string, params: any): Promise<{
        data: any[];
    }>;
    listTeamAppraisals(tenantId: string, userId: string, params: any): Promise<{
        data: any[];
    }>;
    selfAssessment(appraisalId: string, tenantId: string, input: any): Promise<{
        id: string;
        selfRating: any;
    }>;
    managerRating(appraisalId: string, tenantId: string, input: any): Promise<{
        id: string;
        managerRating: any;
    }>;
    listMyFeedback(tenantId: string, userId: string, params: any): Promise<{
        data: any[];
    }>;
    submitFeedback(tenantId: string, userId: string, input: any): Promise<any>;
    listReviews(tenantId: string, params: any): Promise<{
        data: any[];
    }>;
    listProbation(tenantId: string, params: any): Promise<{
        data: any[];
    }>;
    probationDecision(id: string, tenantId: string, decision: string): Promise<{
        id: string;
        status: string;
    }>;
}
export declare const performanceService: PerformanceService;
//# sourceMappingURL=performance.service.d.ts.map