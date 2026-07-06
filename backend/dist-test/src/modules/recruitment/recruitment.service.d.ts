export declare class RecruitmentService {
    listRequisitions(tenantId: string, params: any): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: any;
            totalPages: number;
        };
    }>;
    getRequisition(id: string, tenantId: string): Promise<any>;
    createRequisition(tenantId: string, userId: string, input: any): Promise<any>;
    updateRequisition(id: string, tenantId: string, input: any): Promise<any>;
    approveRequisition(id: string, tenantId: string, userId: string): Promise<{
        message: string;
    }>;
    deleteRequisition(id: string, tenantId: string): Promise<{
        message: string;
    }>;
    listJobs(tenantId: string, params: any): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: any;
            totalPages: number;
        };
    }>;
    getJob(id: string, tenantId: string): Promise<any>;
    createJob(tenantId: string, userId: string, input: any): Promise<any>;
    updateJob(id: string, tenantId: string, input: any): Promise<any>;
    deleteJob(id: string, tenantId: string): Promise<{
        message: string;
    }>;
    listCandidates(tenantId: string, params: any): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: any;
            totalPages: number;
        };
    }>;
    getCandidate(id: string, tenantId: string): Promise<any>;
    addCandidate(tenantId: string, input: any): Promise<any>;
    updateCandidateStage(id: string, tenantId: string, stage: string, notes?: string): Promise<any>;
    rejectCandidate(id: string, tenantId: string, reason: string): Promise<{
        message: string;
    }>;
    listInterviews(tenantId: string, params: any): Promise<any[]>;
    scheduleInterview(tenantId: string, input: any): Promise<any>;
    submitInterviewFeedback(id: string, tenantId: string, input: any): Promise<any>;
    listOffers(tenantId: string, params: any): Promise<any[]>;
    createOffer(tenantId: string, userId: string, input: any): Promise<any>;
    updateOfferStatus(id: string, tenantId: string, status: string, reason?: string): Promise<any>;
}
export declare const recruitmentService: RecruitmentService;
export declare class TrainingService {
    private paginate;
    listPrograms(tenantId: string, params: any): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: any;
            totalPages: number;
        };
    }>;
    createProgram(tenantId: string, userId: string, input: any): Promise<any>;
    deleteProgram(id: string, tenantId: string): Promise<{
        message: string;
    }>;
    createSession(tenantId: string, input: any): Promise<any>;
    enrollSession(tenantId: string, sessionId: string, employeeId: string): Promise<any>;
    submitSessionFeedback(tenantId: string, sessionId: string, employeeId: string, feedback: any): Promise<{
        sessionId: string;
        status: string;
    }>;
    createCertification(tenantId: string, employeeId: string, input: any): Promise<any>;
    listSessions(tenantId: string, params: any): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: any;
            totalPages: number;
        };
    }>;
    listMyTraining(tenantId: string, userId: string, params: any): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: any;
            totalPages: number;
        };
    }>;
    listSkillMatrix(tenantId: string, params: any): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: any;
            totalPages: number;
        };
    }>;
    listCertifications(tenantId: string, params: any): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: any;
            totalPages: number;
        };
    }>;
}
export declare class OfferJoiningService {
    private paginate;
    listSalaryFitments(tenantId: string, params: any): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: any;
            totalPages: number;
        };
    }>;
    createSalaryFitment(tenantId: string, userId: string, input: any): Promise<any>;
    listJoiningFormalities(tenantId: string, params: any): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: any;
            totalPages: number;
        };
    }>;
    createJoiningFormality(tenantId: string, userId: string, input: any): Promise<any>;
    listAppointmentLetters(tenantId: string, params: any): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: any;
            totalPages: number;
        };
    }>;
    createAppointmentLetter(tenantId: string, userId: string, input: any): Promise<any>;
}
export declare const trainingService: TrainingService;
export declare const offerJoiningService: OfferJoiningService;
//# sourceMappingURL=recruitment.service.d.ts.map