"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.offerJoiningController = exports.trainingController = exports.OfferJoiningController = exports.TrainingController = exports.recruitmentController = exports.RecruitmentController = void 0;
const recruitment_service_js_1 = require("./recruitment.service.js");
class RecruitmentController {
    // Requisitions
    async listRequisitions(req, res, next) {
        try {
            res.json({ success: true, ...(await recruitment_service_js_1.recruitmentService.listRequisitions(req.tenantId, req.query)) });
        }
        catch (e) {
            next(e);
        }
    }
    async getRequisition(req, res, next) {
        try {
            res.json({ success: true, data: await recruitment_service_js_1.recruitmentService.getRequisition(req.params.id, req.tenantId) });
        }
        catch (e) {
            next(e);
        }
    }
    async createRequisition(req, res, next) {
        try {
            res.status(201).json({ success: true, data: await recruitment_service_js_1.recruitmentService.createRequisition(req.tenantId, req.user.userId, req.body) });
        }
        catch (e) {
            next(e);
        }
    }
    async updateRequisition(req, res, next) {
        try {
            res.json({ success: true, data: await recruitment_service_js_1.recruitmentService.updateRequisition(req.params.id, req.tenantId, req.body) });
        }
        catch (e) {
            next(e);
        }
    }
    async approveRequisition(req, res, next) {
        try {
            res.json({ success: true, data: await recruitment_service_js_1.recruitmentService.approveRequisition(req.params.id, req.tenantId, req.user.userId) });
        }
        catch (e) {
            next(e);
        }
    }
    async deleteRequisition(req, res, next) {
        try {
            res.json({ success: true, data: await recruitment_service_js_1.recruitmentService.deleteRequisition(req.params.id, req.tenantId) });
        }
        catch (e) {
            next(e);
        }
    }
    // Job Postings
    async listJobs(req, res, next) {
        try {
            res.json({ success: true, ...(await recruitment_service_js_1.recruitmentService.listJobs(req.tenantId, req.query)) });
        }
        catch (e) {
            next(e);
        }
    }
    async getJob(req, res, next) {
        try {
            res.json({ success: true, data: await recruitment_service_js_1.recruitmentService.getJob(req.params.id, req.tenantId) });
        }
        catch (e) {
            next(e);
        }
    }
    async createJob(req, res, next) {
        try {
            res.status(201).json({ success: true, data: await recruitment_service_js_1.recruitmentService.createJob(req.tenantId, req.user.userId, req.body) });
        }
        catch (e) {
            next(e);
        }
    }
    async updateJob(req, res, next) {
        try {
            res.json({ success: true, data: await recruitment_service_js_1.recruitmentService.updateJob(req.params.id, req.tenantId, req.body) });
        }
        catch (e) {
            next(e);
        }
    }
    async deleteJob(req, res, next) {
        try {
            res.json({ success: true, data: await recruitment_service_js_1.recruitmentService.deleteJob(req.params.id, req.tenantId) });
        }
        catch (e) {
            next(e);
        }
    }
    // Candidates
    async listCandidates(req, res, next) {
        try {
            res.json({ success: true, ...(await recruitment_service_js_1.recruitmentService.listCandidates(req.tenantId, req.query)) });
        }
        catch (e) {
            next(e);
        }
    }
    async getCandidate(req, res, next) {
        try {
            res.json({ success: true, data: await recruitment_service_js_1.recruitmentService.getCandidate(req.params.id, req.tenantId) });
        }
        catch (e) {
            next(e);
        }
    }
    async addCandidate(req, res, next) {
        try {
            res.status(201).json({ success: true, data: await recruitment_service_js_1.recruitmentService.addCandidate(req.tenantId, req.body) });
        }
        catch (e) {
            next(e);
        }
    }
    async updateCandidateStage(req, res, next) {
        try {
            res.json({ success: true, data: await recruitment_service_js_1.recruitmentService.updateCandidateStage(req.params.id, req.tenantId, req.body.stage, req.body.notes) });
        }
        catch (e) {
            next(e);
        }
    }
    async rejectCandidate(req, res, next) {
        try {
            res.json({ success: true, data: await recruitment_service_js_1.recruitmentService.rejectCandidate(req.params.id, req.tenantId, req.body.reason) });
        }
        catch (e) {
            next(e);
        }
    }
    // Interviews
    async listInterviews(req, res, next) {
        try {
            res.json({ success: true, data: await recruitment_service_js_1.recruitmentService.listInterviews(req.tenantId, req.query) });
        }
        catch (e) {
            next(e);
        }
    }
    async scheduleInterview(req, res, next) {
        try {
            res.status(201).json({ success: true, data: await recruitment_service_js_1.recruitmentService.scheduleInterview(req.tenantId, req.body) });
        }
        catch (e) {
            next(e);
        }
    }
    async submitInterviewFeedback(req, res, next) {
        try {
            res.json({ success: true, data: await recruitment_service_js_1.recruitmentService.submitInterviewFeedback(req.params.id, req.tenantId, req.body) });
        }
        catch (e) {
            next(e);
        }
    }
    // Offers
    async listOffers(req, res, next) {
        try {
            res.json({ success: true, data: await recruitment_service_js_1.recruitmentService.listOffers(req.tenantId, req.query) });
        }
        catch (e) {
            next(e);
        }
    }
    async createOffer(req, res, next) {
        try {
            res.status(201).json({ success: true, data: await recruitment_service_js_1.recruitmentService.createOffer(req.tenantId, req.user.userId, req.body) });
        }
        catch (e) {
            next(e);
        }
    }
    async updateOfferStatus(req, res, next) {
        try {
            res.json({ success: true, data: await recruitment_service_js_1.recruitmentService.updateOfferStatus(req.params.id, req.tenantId, req.body.status, req.body.reason) });
        }
        catch (e) {
            next(e);
        }
    }
}
exports.RecruitmentController = RecruitmentController;
exports.recruitmentController = new RecruitmentController();
class TrainingController {
    async listPrograms(req, res, next) {
        try {
            res.json({ success: true, ...(await recruitment_service_js_1.trainingService.listPrograms(req.tenantId, req.query)) });
        }
        catch (e) {
            next(e);
        }
    }
    async createProgram(req, res, next) {
        try {
            res.status(201).json({ success: true, data: await recruitment_service_js_1.trainingService.createProgram(req.tenantId, req.user.userId, req.body) });
        }
        catch (e) {
            next(e);
        }
    }
    async deleteProgram(req, res, next) {
        try {
            res.json({ success: true, data: await recruitment_service_js_1.trainingService.deleteProgram(req.params.id, req.tenantId) });
        }
        catch (e) {
            next(e);
        }
    }
    async listSessions(req, res, next) {
        try {
            res.json({ success: true, ...(await recruitment_service_js_1.trainingService.listSessions(req.tenantId, req.query)) });
        }
        catch (e) {
            next(e);
        }
    }
    async createSession(req, res, next) {
        try {
            res.status(201).json({ success: true, data: await recruitment_service_js_1.trainingService.createSession(req.tenantId, req.body) });
        }
        catch (e) {
            next(e);
        }
    }
    async enrollSession(req, res, next) {
        try {
            res.status(201).json({ success: true, data: await recruitment_service_js_1.trainingService.enrollSession(req.tenantId, req.params.id, req.user.userId) });
        }
        catch (e) {
            next(e);
        }
    }
    async sessionFeedback(req, res, next) {
        try {
            res.json({ success: true, data: await recruitment_service_js_1.trainingService.submitSessionFeedback(req.tenantId, req.params.id, req.user.userId, req.body) });
        }
        catch (e) {
            next(e);
        }
    }
    async listMyTraining(req, res, next) {
        try {
            res.json({ success: true, ...(await recruitment_service_js_1.trainingService.listMyTraining(req.tenantId, req.user.userId, req.query)) });
        }
        catch (e) {
            next(e);
        }
    }
    async listSkillMatrix(req, res, next) {
        try {
            res.json({ success: true, ...(await recruitment_service_js_1.trainingService.listSkillMatrix(req.tenantId, req.query)) });
        }
        catch (e) {
            next(e);
        }
    }
    async listCertifications(req, res, next) {
        try {
            res.json({ success: true, ...(await recruitment_service_js_1.trainingService.listCertifications(req.tenantId, req.query)) });
        }
        catch (e) {
            next(e);
        }
    }
    async createCertification(req, res, next) {
        try {
            res.status(201).json({ success: true, data: await recruitment_service_js_1.trainingService.createCertification(req.tenantId, req.user.userId, req.body) });
        }
        catch (e) {
            next(e);
        }
    }
}
exports.TrainingController = TrainingController;
class OfferJoiningController {
    async listSalaryFitments(req, res, next) {
        try {
            res.json({ success: true, ...(await recruitment_service_js_1.offerJoiningService.listSalaryFitments(req.tenantId, req.query)) });
        }
        catch (e) {
            next(e);
        }
    }
    async createSalaryFitment(req, res, next) {
        try {
            res.status(201).json({ success: true, data: await recruitment_service_js_1.offerJoiningService.createSalaryFitment(req.tenantId, req.user.userId, req.body) });
        }
        catch (e) {
            next(e);
        }
    }
    async listJoiningFormalities(req, res, next) {
        try {
            res.json({ success: true, ...(await recruitment_service_js_1.offerJoiningService.listJoiningFormalities(req.tenantId, req.query)) });
        }
        catch (e) {
            next(e);
        }
    }
    async createJoiningFormality(req, res, next) {
        try {
            res.status(201).json({ success: true, data: await recruitment_service_js_1.offerJoiningService.createJoiningFormality(req.tenantId, req.user.userId, req.body) });
        }
        catch (e) {
            next(e);
        }
    }
    async listAppointmentLetters(req, res, next) {
        try {
            res.json({ success: true, ...(await recruitment_service_js_1.offerJoiningService.listAppointmentLetters(req.tenantId, req.query)) });
        }
        catch (e) {
            next(e);
        }
    }
    async createAppointmentLetter(req, res, next) {
        try {
            res.status(201).json({ success: true, data: await recruitment_service_js_1.offerJoiningService.createAppointmentLetter(req.tenantId, req.user.userId, req.body) });
        }
        catch (e) {
            next(e);
        }
    }
}
exports.OfferJoiningController = OfferJoiningController;
exports.trainingController = new TrainingController();
exports.offerJoiningController = new OfferJoiningController();
//# sourceMappingURL=recruitment.controller.js.map