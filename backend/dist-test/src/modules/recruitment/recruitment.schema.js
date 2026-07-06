"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOnboardingSchema = exports.createOfferSchema = exports.submitFeedbackSchema = exports.scheduleInterviewSchema = exports.addCandidateSchema = exports.createJobPostingSchema = exports.createRequisitionSchema = void 0;
const zod_1 = require("zod");
exports.createRequisitionSchema = zod_1.z.object({
    companyId: zod_1.z.string().min(1),
    positionTitle: zod_1.z.string().min(2).max(255),
    departmentId: zod_1.z.string().min(1),
    numberOfPositions: zod_1.z.number().int().min(1),
    justification: zod_1.z.string().min(10),
    budgetCode: zod_1.z.string().optional(),
    priority: zod_1.z.enum(['Low', 'Normal', 'High', 'Urgent']).default('Normal'),
    requiredDate: zod_1.z.coerce.date().optional(),
    jobDescription: zod_1.z.string().optional(),
    skillsRequired: zod_1.z.string().optional(),
});
exports.createJobPostingSchema = zod_1.z.object({
    companyId: zod_1.z.string().min(1),
    requisitionId: zod_1.z.string().min(1).optional(),
    title: zod_1.z.string().min(2).max(255),
    departmentId: zod_1.z.string().min(1),
    location: zod_1.z.string(),
    experienceMin: zod_1.z.number().int().optional(),
    experienceMax: zod_1.z.number().int().optional(),
    salaryMin: zod_1.z.number().optional(),
    salaryMax: zod_1.z.number().optional(),
    description: zod_1.z.string().min(10),
    skillsRequired: zod_1.z.string().optional(),
    postingChannels: zod_1.z.string().optional(),
});
exports.addCandidateSchema = zod_1.z.object({
    jobPostingId: zod_1.z.string().min(1),
    firstName: zod_1.z.string().min(1).max(100),
    lastName: zod_1.z.string().min(1).max(100),
    email: zod_1.z.string().email(),
    mobile: zod_1.z.string().regex(/^[6-9]\d{9}$/),
    source: zod_1.z.string().default('Direct'),
    currentCtc: zod_1.z.number().optional(),
    expectedCtc: zod_1.z.number().optional(),
    noticePeriodDays: zod_1.z.number().int().optional(),
    totalExperienceYears: zod_1.z.number().optional(),
    notes: zod_1.z.string().optional(),
});
exports.scheduleInterviewSchema = zod_1.z.object({
    candidateId: zod_1.z.string().min(1),
    interviewType: zod_1.z.enum(['Phone', 'Video', 'In-Person', 'Technical', 'HR', 'Final']),
    scheduledAt: zod_1.z.coerce.date(),
    durationMins: zod_1.z.number().int().default(60),
    panelMembers: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
});
exports.submitFeedbackSchema = zod_1.z.object({
    overallRating: zod_1.z.number().min(1).max(10),
    strengths: zod_1.z.string().optional(),
    weaknesses: zod_1.z.string().optional(),
    recommendation: zod_1.z.enum(['Strongly Hire', 'Hire', 'Hold', 'Reject']),
    feedbackJson: zod_1.z.any().optional(),
});
exports.createOfferSchema = zod_1.z.object({
    candidateId: zod_1.z.string().min(1),
    positionTitle: zod_1.z.string(),
    departmentId: zod_1.z.string().min(1),
    designationId: zod_1.z.string().min(1),
    gradeId: zod_1.z.string().min(1).optional(),
    ctcOffered: zod_1.z.number().positive(),
    salaryBreakupJson: zod_1.z.any().optional(),
    joiningDate: zod_1.z.coerce.date().optional(),
    probationMonths: zod_1.z.number().int().default(6),
    noticePeriodDays: zod_1.z.number().int().default(30),
    expiryDate: zod_1.z.coerce.date(),
});
exports.createOnboardingSchema = zod_1.z.object({
    candidateName: zod_1.z.string(),
    joiningDate: zod_1.z.coerce.date(),
    departmentId: zod_1.z.string().min(1),
    designationId: zod_1.z.string().min(1),
    assignedBuddyId: zod_1.z.string().min(1).optional(),
    assignedHrId: zod_1.z.string().min(1).optional(),
});
//# sourceMappingURL=recruitment.schema.js.map