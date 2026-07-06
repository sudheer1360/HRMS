import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../common/types/index.js';
export declare class RecruitmentController {
    listRequisitions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getRequisition(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    createRequisition(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateRequisition(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    approveRequisition(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    deleteRequisition(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listJobs(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getJob(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    createJob(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateJob(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    deleteJob(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listCandidates(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getCandidate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    addCandidate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateCandidateStage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    rejectCandidate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listInterviews(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    scheduleInterview(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    submitInterviewFeedback(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listOffers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    createOffer(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateOfferStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const recruitmentController: RecruitmentController;
export declare class TrainingController {
    listPrograms(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    createProgram(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    deleteProgram(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listSessions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    createSession(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    enrollSession(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    sessionFeedback(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listMyTraining(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listSkillMatrix(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listCertifications(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    createCertification(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare class OfferJoiningController {
    listSalaryFitments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    createSalaryFitment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listJoiningFormalities(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    createJoiningFormality(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listAppointmentLetters(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    createAppointmentLetter(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const trainingController: TrainingController;
export declare const offerJoiningController: OfferJoiningController;
//# sourceMappingURL=recruitment.controller.d.ts.map