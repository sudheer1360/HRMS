import { z } from 'zod';

export const createRequisitionSchema = z.object({
  companyId: z.string().min(1),
  positionTitle: z.string().min(2).max(255),
  departmentId: z.string().min(1),
  numberOfPositions: z.number().int().min(1),
  justification: z.string().min(10),
  budgetCode: z.string().optional(),
  priority: z.enum(['Low', 'Normal', 'High', 'Urgent']).default('Normal'),
  requiredDate: z.coerce.date().optional(),
  jobDescription: z.string().optional(),
  skillsRequired: z.string().optional(),
});

export const createJobPostingSchema = z.object({
  companyId: z.string().min(1),
  requisitionId: z.string().min(1).optional(),
  title: z.string().min(2).max(255),
  departmentId: z.string().min(1),
  location: z.string(),
  experienceMin: z.number().int().optional(),
  experienceMax: z.number().int().optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  description: z.string().min(10),
  skillsRequired: z.string().optional(),
  postingChannels: z.string().optional(),
});

export const addCandidateSchema = z.object({
  jobPostingId: z.string().min(1),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  mobile: z.string().regex(/^[6-9]\d{9}$/),
  source: z.string().default('Direct'),
  currentCtc: z.number().optional(),
  expectedCtc: z.number().optional(),
  noticePeriodDays: z.number().int().optional(),
  totalExperienceYears: z.number().optional(),
  notes: z.string().optional(),
});

export const scheduleInterviewSchema = z.object({
  candidateId: z.string().min(1),
  interviewType: z.enum(['Phone', 'Video', 'In-Person', 'Technical', 'HR', 'Final']),
  scheduledAt: z.coerce.date(),
  durationMins: z.number().int().default(60),
  panelMembers: z.string().optional(),
  location: z.string().optional(),
});

export const submitFeedbackSchema = z.object({
  overallRating: z.number().min(1).max(10),
  strengths: z.string().optional(),
  weaknesses: z.string().optional(),
  recommendation: z.enum(['Strongly Hire', 'Hire', 'Hold', 'Reject']),
  feedbackJson: z.any().optional(),
});

export const createOfferSchema = z.object({
  candidateId: z.string().min(1),
  positionTitle: z.string(),
  departmentId: z.string().min(1),
  designationId: z.string().min(1),
  gradeId: z.string().min(1).optional(),
  ctcOffered: z.number().positive(),
  salaryBreakupJson: z.any().optional(),
  joiningDate: z.coerce.date().optional(),
  probationMonths: z.number().int().default(6),
  noticePeriodDays: z.number().int().default(30),
  expiryDate: z.coerce.date(),
});

export const createOnboardingSchema = z.object({
  candidateName: z.string(),
  joiningDate: z.coerce.date(),
  departmentId: z.string().min(1),
  designationId: z.string().min(1),
  assignedBuddyId: z.string().min(1).optional(),
  assignedHrId: z.string().min(1).optional(),
});
