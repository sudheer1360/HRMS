"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const recruitment_controller_js_1 = require("./recruitment.controller.js");
const auth_js_1 = require("../../middleware/auth.js");
const rbac_js_1 = require("../../middleware/rbac.js");
const audit_js_1 = require("../../middleware/audit.js");
const router = (0, express_1.Router)();
router.use(auth_js_1.authenticate);
// Requisitions
router.get('/requisitions', (0, rbac_js_1.rbac)('RECR', 'VIEW'), (req, res, next) => recruitment_controller_js_1.recruitmentController.listRequisitions(req, res, next));
router.get('/requisitions/:id', (0, rbac_js_1.rbac)('RECR', 'VIEW'), (req, res, next) => recruitment_controller_js_1.recruitmentController.getRequisition(req, res, next));
router.post('/requisitions', (0, rbac_js_1.rbac)('RECR', 'CREATE'), (0, audit_js_1.auditLog)('RECRUITMENT', 'Requisition'), (req, res, next) => recruitment_controller_js_1.recruitmentController.createRequisition(req, res, next));
router.put('/requisitions/:id', (0, rbac_js_1.rbac)('RECR', 'EDIT'), (0, audit_js_1.auditLog)('RECRUITMENT', 'Requisition'), (req, res, next) => recruitment_controller_js_1.recruitmentController.updateRequisition(req, res, next));
router.patch('/requisitions/:id/approve', (0, rbac_js_1.rbac)('RECR', 'APPROVE'), (req, res, next) => recruitment_controller_js_1.recruitmentController.approveRequisition(req, res, next));
router.delete('/requisitions/:id', (0, rbac_js_1.rbac)('RECR', 'DELETE'), (req, res, next) => recruitment_controller_js_1.recruitmentController.deleteRequisition(req, res, next));
// Job Postings
router.get('/jobs', (0, rbac_js_1.rbac)('RECR', 'VIEW'), (req, res, next) => recruitment_controller_js_1.recruitmentController.listJobs(req, res, next));
router.get('/jobs/:id', (0, rbac_js_1.rbac)('RECR', 'VIEW'), (req, res, next) => recruitment_controller_js_1.recruitmentController.getJob(req, res, next));
router.post('/jobs', (0, rbac_js_1.rbac)('RECR', 'CREATE'), (0, audit_js_1.auditLog)('RECRUITMENT', 'JobPosting'), (req, res, next) => recruitment_controller_js_1.recruitmentController.createJob(req, res, next));
router.put('/jobs/:id', (0, rbac_js_1.rbac)('RECR', 'EDIT'), (0, audit_js_1.auditLog)('RECRUITMENT', 'JobPosting'), (req, res, next) => recruitment_controller_js_1.recruitmentController.updateJob(req, res, next));
router.delete('/jobs/:id', (0, rbac_js_1.rbac)('RECR', 'DELETE'), (req, res, next) => recruitment_controller_js_1.recruitmentController.deleteJob(req, res, next));
// Candidates
router.get('/candidates', (0, rbac_js_1.rbac)('RECR', 'VIEW'), (req, res, next) => recruitment_controller_js_1.recruitmentController.listCandidates(req, res, next));
router.get('/candidates/:id', (0, rbac_js_1.rbac)('RECR', 'VIEW'), (req, res, next) => recruitment_controller_js_1.recruitmentController.getCandidate(req, res, next));
router.post('/candidates', (0, rbac_js_1.rbac)('RECR', 'CREATE'), (0, audit_js_1.auditLog)('RECRUITMENT', 'Candidate'), (req, res, next) => recruitment_controller_js_1.recruitmentController.addCandidate(req, res, next));
router.patch('/candidates/:id/stage', (0, rbac_js_1.rbac)('RECR', 'EDIT'), (req, res, next) => recruitment_controller_js_1.recruitmentController.updateCandidateStage(req, res, next));
router.patch('/candidates/:id/reject', (0, rbac_js_1.rbac)('RECR', 'EDIT'), (req, res, next) => recruitment_controller_js_1.recruitmentController.rejectCandidate(req, res, next));
// Interviews
router.get('/interviews', (0, rbac_js_1.rbac)('RECR', 'VIEW'), (req, res, next) => recruitment_controller_js_1.recruitmentController.listInterviews(req, res, next));
router.post('/interviews', (0, rbac_js_1.rbac)('RECR', 'CREATE'), (0, audit_js_1.auditLog)('RECRUITMENT', 'Interview'), (req, res, next) => recruitment_controller_js_1.recruitmentController.scheduleInterview(req, res, next));
router.patch('/interviews/:id/feedback', (0, rbac_js_1.rbac)('RECR', 'EDIT'), (req, res, next) => recruitment_controller_js_1.recruitmentController.submitInterviewFeedback(req, res, next));
// Offers
router.get('/offers', (0, rbac_js_1.rbac)('RECR', 'VIEW'), (req, res, next) => recruitment_controller_js_1.recruitmentController.listOffers(req, res, next));
router.post('/offers', (0, rbac_js_1.rbac)('RECR', 'CREATE'), (0, audit_js_1.auditLog)('RECRUITMENT', 'Offer'), (req, res, next) => recruitment_controller_js_1.recruitmentController.createOffer(req, res, next));
router.patch('/offers/:id/status', (0, rbac_js_1.rbac)('RECR', 'EDIT'), (0, audit_js_1.auditLog)('RECRUITMENT', 'Offer'), (req, res, next) => recruitment_controller_js_1.recruitmentController.updateOfferStatus(req, res, next));
// Training & Development
router.get('/training/programs', (req, res, next) => recruitment_controller_js_1.trainingController.listPrograms(req, res, next));
router.post('/training/programs', (req, res, next) => recruitment_controller_js_1.trainingController.createProgram(req, res, next));
router.delete('/training/programs/:id', (req, res, next) => recruitment_controller_js_1.trainingController.deleteProgram(req, res, next));
router.get('/training/sessions', (req, res, next) => recruitment_controller_js_1.trainingController.listSessions(req, res, next));
router.post('/training/sessions', (req, res, next) => recruitment_controller_js_1.trainingController.createSession(req, res, next));
router.post('/training/sessions/:id/enroll', (req, res, next) => recruitment_controller_js_1.trainingController.enrollSession(req, res, next));
router.post('/training/sessions/:id/feedback', (req, res, next) => recruitment_controller_js_1.trainingController.sessionFeedback(req, res, next));
router.get('/training/my-training', (req, res, next) => recruitment_controller_js_1.trainingController.listMyTraining(req, res, next));
router.get('/training/skill-matrix', (req, res, next) => recruitment_controller_js_1.trainingController.listSkillMatrix(req, res, next));
router.get('/training/certifications', (req, res, next) => recruitment_controller_js_1.trainingController.listCertifications(req, res, next));
router.post('/training/certifications', (req, res, next) => recruitment_controller_js_1.trainingController.createCertification(req, res, next));
// Salary Fitments
router.get('/salary-fitments', (0, rbac_js_1.rbac)('RECR', 'VIEW'), (req, res, next) => recruitment_controller_js_1.offerJoiningController.listSalaryFitments(req, res, next));
router.post('/salary-fitments', (0, rbac_js_1.rbac)('RECR', 'CREATE'), (req, res, next) => recruitment_controller_js_1.offerJoiningController.createSalaryFitment(req, res, next));
// Joining Formalities
router.get('/joining-formalities', (0, rbac_js_1.rbac)('RECR', 'VIEW'), (req, res, next) => recruitment_controller_js_1.offerJoiningController.listJoiningFormalities(req, res, next));
router.post('/joining-formalities', (0, rbac_js_1.rbac)('RECR', 'CREATE'), (req, res, next) => recruitment_controller_js_1.offerJoiningController.createJoiningFormality(req, res, next));
// Appointment Letters
router.get('/appointment-letters', (0, rbac_js_1.rbac)('RECR', 'VIEW'), (req, res, next) => recruitment_controller_js_1.offerJoiningController.listAppointmentLetters(req, res, next));
router.post('/appointment-letters', (0, rbac_js_1.rbac)('RECR', 'CREATE'), (req, res, next) => recruitment_controller_js_1.offerJoiningController.createAppointmentLetter(req, res, next));
exports.default = router;
//# sourceMappingURL=recruitment.routes.js.map