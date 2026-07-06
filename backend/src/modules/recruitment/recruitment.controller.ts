import { Response, NextFunction } from 'express';
import { recruitmentService, trainingService, offerJoiningService } from './recruitment.service.js';
import { AuthenticatedRequest } from '../../common/types/index.js';

export class RecruitmentController {
  // Requisitions
  async listRequisitions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, ...(await recruitmentService.listRequisitions(req.tenantId!, req.query)) }); } catch (e) { next(e); }
  }
  async getRequisition(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await recruitmentService.getRequisition(req.params.id, req.tenantId!) }); } catch (e) { next(e); }
  }
  async createRequisition(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.status(201).json({ success: true, data: await recruitmentService.createRequisition(req.tenantId!, req.user!.userId, req.body) }); } catch (e) { next(e); }
  }
  async updateRequisition(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await recruitmentService.updateRequisition(req.params.id, req.tenantId!, req.body) }); } catch (e) { next(e); }
  }
  async approveRequisition(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await recruitmentService.approveRequisition(req.params.id, req.tenantId!, req.user!.userId) }); } catch (e) { next(e); }
  }
  async deleteRequisition(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await recruitmentService.deleteRequisition(req.params.id, req.tenantId!) }); } catch (e) { next(e); }
  }

  // Job Postings
  async listJobs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, ...(await recruitmentService.listJobs(req.tenantId!, req.query)) }); } catch (e) { next(e); }
  }
  async getJob(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await recruitmentService.getJob(req.params.id, req.tenantId!) }); } catch (e) { next(e); }
  }
  async createJob(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.status(201).json({ success: true, data: await recruitmentService.createJob(req.tenantId!, req.user!.userId, req.body) }); } catch (e) { next(e); }
  }
  async updateJob(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await recruitmentService.updateJob(req.params.id, req.tenantId!, req.body) }); } catch (e) { next(e); }
  }
  async deleteJob(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await recruitmentService.deleteJob(req.params.id, req.tenantId!) }); } catch (e) { next(e); }
  }

  // Candidates
  async listCandidates(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, ...(await recruitmentService.listCandidates(req.tenantId!, req.query)) }); } catch (e) { next(e); }
  }
  async getCandidate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await recruitmentService.getCandidate(req.params.id, req.tenantId!) }); } catch (e) { next(e); }
  }
  async addCandidate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.status(201).json({ success: true, data: await recruitmentService.addCandidate(req.tenantId!, req.body) }); } catch (e) { next(e); }
  }
  async updateCandidateStage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await recruitmentService.updateCandidateStage(req.params.id, req.tenantId!, req.body.stage, req.body.notes) }); } catch (e) { next(e); }
  }
  async rejectCandidate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await recruitmentService.rejectCandidate(req.params.id, req.tenantId!, req.body.reason) }); } catch (e) { next(e); }
  }

  // Interviews
  async listInterviews(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await recruitmentService.listInterviews(req.tenantId!, req.query) }); } catch (e) { next(e); }
  }
  async scheduleInterview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.status(201).json({ success: true, data: await recruitmentService.scheduleInterview(req.tenantId!, req.body) }); } catch (e) { next(e); }
  }
  async submitInterviewFeedback(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await recruitmentService.submitInterviewFeedback(req.params.id, req.tenantId!, req.body) }); } catch (e) { next(e); }
  }

  // Offers
  async listOffers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await recruitmentService.listOffers(req.tenantId!, req.query) }); } catch (e) { next(e); }
  }
  async createOffer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.status(201).json({ success: true, data: await recruitmentService.createOffer(req.tenantId!, req.user!.userId, req.body) }); } catch (e) { next(e); }
  }
  async updateOfferStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await recruitmentService.updateOfferStatus(req.params.id, req.tenantId!, req.body.status, req.body.reason) }); } catch (e) { next(e); }
  }
}

export const recruitmentController = new RecruitmentController();

export class TrainingController {
  async listPrograms(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, ...(await trainingService.listPrograms(req.tenantId!, req.query)) }); } catch (e) { next(e); }
  }
  async createProgram(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.status(201).json({ success: true, data: await trainingService.createProgram(req.tenantId!, req.user!.userId, req.body) }); } catch (e) { next(e); }
  }
  async deleteProgram(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await trainingService.deleteProgram(req.params.id, req.tenantId!) }); } catch (e) { next(e); }
  }
  async listSessions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, ...(await trainingService.listSessions(req.tenantId!, req.query)) }); } catch (e) { next(e); }
  }
  async createSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.status(201).json({ success: true, data: await trainingService.createSession(req.tenantId!, req.body) }); } catch (e) { next(e); }
  }
  async enrollSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.status(201).json({ success: true, data: await trainingService.enrollSession(req.tenantId!, req.params.id, req.user!.userId) }); } catch (e) { next(e); }
  }
  async sessionFeedback(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await trainingService.submitSessionFeedback(req.tenantId!, req.params.id, req.user!.userId, req.body) }); } catch (e) { next(e); }
  }
  async listMyTraining(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, ...(await trainingService.listMyTraining(req.tenantId!, req.user!.userId, req.query)) }); } catch (e) { next(e); }
  }
  async listSkillMatrix(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, ...(await trainingService.listSkillMatrix(req.tenantId!, req.query)) }); } catch (e) { next(e); }
  }
  async listCertifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, ...(await trainingService.listCertifications(req.tenantId!, req.query)) }); } catch (e) { next(e); }
  }
  async createCertification(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.status(201).json({ success: true, data: await trainingService.createCertification(req.tenantId!, req.user!.userId, req.body) }); } catch (e) { next(e); }
  }
}

export class OfferJoiningController {
  async listSalaryFitments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, ...(await offerJoiningService.listSalaryFitments(req.tenantId!, req.query)) }); } catch (e) { next(e); }
  }
  async createSalaryFitment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.status(201).json({ success: true, data: await offerJoiningService.createSalaryFitment(req.tenantId!, req.user!.userId, req.body) }); } catch (e) { next(e); }
  }
  async listJoiningFormalities(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, ...(await offerJoiningService.listJoiningFormalities(req.tenantId!, req.query)) }); } catch (e) { next(e); }
  }
  async createJoiningFormality(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.status(201).json({ success: true, data: await offerJoiningService.createJoiningFormality(req.tenantId!, req.user!.userId, req.body) }); } catch (e) { next(e); }
  }
  async listAppointmentLetters(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ success: true, ...(await offerJoiningService.listAppointmentLetters(req.tenantId!, req.query)) }); } catch (e) { next(e); }
  }
  async createAppointmentLetter(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.status(201).json({ success: true, data: await offerJoiningService.createAppointmentLetter(req.tenantId!, req.user!.userId, req.body) }); } catch (e) { next(e); }
  }
}

export const trainingController = new TrainingController();
export const offerJoiningController = new OfferJoiningController();
