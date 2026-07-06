import { Router } from 'express';
import { recruitmentController, trainingController, offerJoiningController } from './recruitment.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { rbac } from '../../middleware/rbac.js';
import { auditLog } from '../../middleware/audit.js';

const router = Router();
router.use(authenticate);

// Requisitions
router.get('/requisitions', rbac('RECR', 'VIEW'), (req, res, next) => recruitmentController.listRequisitions(req, res, next));
router.get('/requisitions/:id', rbac('RECR', 'VIEW'), (req, res, next) => recruitmentController.getRequisition(req, res, next));
router.post('/requisitions', rbac('RECR', 'CREATE'), auditLog('RECRUITMENT', 'Requisition'), (req, res, next) => recruitmentController.createRequisition(req, res, next));
router.put('/requisitions/:id', rbac('RECR', 'EDIT'), auditLog('RECRUITMENT', 'Requisition'), (req, res, next) => recruitmentController.updateRequisition(req, res, next));
router.patch('/requisitions/:id/approve', rbac('RECR', 'APPROVE'), (req, res, next) => recruitmentController.approveRequisition(req, res, next));
router.delete('/requisitions/:id', rbac('RECR', 'DELETE'), (req, res, next) => recruitmentController.deleteRequisition(req, res, next));

// Job Postings
router.get('/jobs', rbac('RECR', 'VIEW'), (req, res, next) => recruitmentController.listJobs(req, res, next));
router.get('/jobs/:id', rbac('RECR', 'VIEW'), (req, res, next) => recruitmentController.getJob(req, res, next));
router.post('/jobs', rbac('RECR', 'CREATE'), auditLog('RECRUITMENT', 'JobPosting'), (req, res, next) => recruitmentController.createJob(req, res, next));
router.put('/jobs/:id', rbac('RECR', 'EDIT'), auditLog('RECRUITMENT', 'JobPosting'), (req, res, next) => recruitmentController.updateJob(req, res, next));
router.delete('/jobs/:id', rbac('RECR', 'DELETE'), (req, res, next) => recruitmentController.deleteJob(req, res, next));

// Candidates
router.get('/candidates', rbac('RECR', 'VIEW'), (req, res, next) => recruitmentController.listCandidates(req, res, next));
router.get('/candidates/:id', rbac('RECR', 'VIEW'), (req, res, next) => recruitmentController.getCandidate(req, res, next));
router.post('/candidates', rbac('RECR', 'CREATE'), auditLog('RECRUITMENT', 'Candidate'), (req, res, next) => recruitmentController.addCandidate(req, res, next));
router.patch('/candidates/:id/stage', rbac('RECR', 'EDIT'), (req, res, next) => recruitmentController.updateCandidateStage(req, res, next));
router.patch('/candidates/:id/reject', rbac('RECR', 'EDIT'), (req, res, next) => recruitmentController.rejectCandidate(req, res, next));

// Interviews
router.get('/interviews', rbac('RECR', 'VIEW'), (req, res, next) => recruitmentController.listInterviews(req, res, next));
router.post('/interviews', rbac('RECR', 'CREATE'), auditLog('RECRUITMENT', 'Interview'), (req, res, next) => recruitmentController.scheduleInterview(req, res, next));
router.patch('/interviews/:id/feedback', rbac('RECR', 'EDIT'), (req, res, next) => recruitmentController.submitInterviewFeedback(req, res, next));

// Offers
router.get('/offers', rbac('RECR', 'VIEW'), (req, res, next) => recruitmentController.listOffers(req, res, next));
router.post('/offers', rbac('RECR', 'CREATE'), auditLog('RECRUITMENT', 'Offer'), (req, res, next) => recruitmentController.createOffer(req, res, next));
router.patch('/offers/:id/status', rbac('RECR', 'EDIT'), auditLog('RECRUITMENT', 'Offer'), (req, res, next) => recruitmentController.updateOfferStatus(req, res, next));

// Training & Development
router.get('/training/programs', (req, res, next) => trainingController.listPrograms(req, res, next));
router.post('/training/programs', (req, res, next) => trainingController.createProgram(req, res, next));
router.delete('/training/programs/:id', (req, res, next) => trainingController.deleteProgram(req, res, next));
router.get('/training/sessions', (req, res, next) => trainingController.listSessions(req, res, next));
router.post('/training/sessions', (req, res, next) => trainingController.createSession(req, res, next));
router.post('/training/sessions/:id/enroll', (req, res, next) => trainingController.enrollSession(req, res, next));
router.post('/training/sessions/:id/feedback', (req, res, next) => trainingController.sessionFeedback(req, res, next));
router.get('/training/my-training', (req, res, next) => trainingController.listMyTraining(req, res, next));
router.get('/training/skill-matrix', (req, res, next) => trainingController.listSkillMatrix(req, res, next));
router.get('/training/certifications', (req, res, next) => trainingController.listCertifications(req, res, next));
router.post('/training/certifications', (req, res, next) => trainingController.createCertification(req, res, next));

// Salary Fitments
router.get('/salary-fitments', rbac('RECR', 'VIEW'), (req, res, next) => offerJoiningController.listSalaryFitments(req, res, next));
router.post('/salary-fitments', rbac('RECR', 'CREATE'), (req, res, next) => offerJoiningController.createSalaryFitment(req, res, next));

// Joining Formalities
router.get('/joining-formalities', rbac('RECR', 'VIEW'), (req, res, next) => offerJoiningController.listJoiningFormalities(req, res, next));
router.post('/joining-formalities', rbac('RECR', 'CREATE'), (req, res, next) => offerJoiningController.createJoiningFormality(req, res, next));

// Appointment Letters
router.get('/appointment-letters', rbac('RECR', 'VIEW'), (req, res, next) => offerJoiningController.listAppointmentLetters(req, res, next));
router.post('/appointment-letters', rbac('RECR', 'CREATE'), (req, res, next) => offerJoiningController.createAppointmentLetter(req, res, next));

export default router;
