import { z } from 'zod';
export declare const createRequisitionSchema: z.ZodObject<{
    companyId: z.ZodString;
    positionTitle: z.ZodString;
    departmentId: z.ZodString;
    numberOfPositions: z.ZodNumber;
    justification: z.ZodString;
    budgetCode: z.ZodOptional<z.ZodString>;
    priority: z.ZodDefault<z.ZodEnum<["Low", "Normal", "High", "Urgent"]>>;
    requiredDate: z.ZodOptional<z.ZodDate>;
    jobDescription: z.ZodOptional<z.ZodString>;
    skillsRequired: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    companyId: string;
    departmentId: string;
    priority: "Low" | "High" | "Normal" | "Urgent";
    positionTitle: string;
    numberOfPositions: number;
    justification: string;
    budgetCode?: string | undefined;
    requiredDate?: Date | undefined;
    jobDescription?: string | undefined;
    skillsRequired?: string | undefined;
}, {
    companyId: string;
    departmentId: string;
    positionTitle: string;
    numberOfPositions: number;
    justification: string;
    priority?: "Low" | "High" | "Normal" | "Urgent" | undefined;
    budgetCode?: string | undefined;
    requiredDate?: Date | undefined;
    jobDescription?: string | undefined;
    skillsRequired?: string | undefined;
}>;
export declare const createJobPostingSchema: z.ZodObject<{
    companyId: z.ZodString;
    requisitionId: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    departmentId: z.ZodString;
    location: z.ZodString;
    experienceMin: z.ZodOptional<z.ZodNumber>;
    experienceMax: z.ZodOptional<z.ZodNumber>;
    salaryMin: z.ZodOptional<z.ZodNumber>;
    salaryMax: z.ZodOptional<z.ZodNumber>;
    description: z.ZodString;
    skillsRequired: z.ZodOptional<z.ZodString>;
    postingChannels: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    companyId: string;
    departmentId: string;
    description: string;
    title: string;
    location: string;
    skillsRequired?: string | undefined;
    requisitionId?: string | undefined;
    experienceMin?: number | undefined;
    experienceMax?: number | undefined;
    salaryMin?: number | undefined;
    salaryMax?: number | undefined;
    postingChannels?: string | undefined;
}, {
    companyId: string;
    departmentId: string;
    description: string;
    title: string;
    location: string;
    skillsRequired?: string | undefined;
    requisitionId?: string | undefined;
    experienceMin?: number | undefined;
    experienceMax?: number | undefined;
    salaryMin?: number | undefined;
    salaryMax?: number | undefined;
    postingChannels?: string | undefined;
}>;
export declare const addCandidateSchema: z.ZodObject<{
    jobPostingId: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    mobile: z.ZodString;
    source: z.ZodDefault<z.ZodString>;
    currentCtc: z.ZodOptional<z.ZodNumber>;
    expectedCtc: z.ZodOptional<z.ZodNumber>;
    noticePeriodDays: z.ZodOptional<z.ZodNumber>;
    totalExperienceYears: z.ZodOptional<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    firstName: string;
    lastName: string;
    mobile: string;
    jobPostingId: string;
    source: string;
    noticePeriodDays?: number | undefined;
    currentCtc?: number | undefined;
    expectedCtc?: number | undefined;
    totalExperienceYears?: number | undefined;
    notes?: string | undefined;
}, {
    email: string;
    firstName: string;
    lastName: string;
    mobile: string;
    jobPostingId: string;
    noticePeriodDays?: number | undefined;
    source?: string | undefined;
    currentCtc?: number | undefined;
    expectedCtc?: number | undefined;
    totalExperienceYears?: number | undefined;
    notes?: string | undefined;
}>;
export declare const scheduleInterviewSchema: z.ZodObject<{
    candidateId: z.ZodString;
    interviewType: z.ZodEnum<["Phone", "Video", "In-Person", "Technical", "HR", "Final"]>;
    scheduledAt: z.ZodDate;
    durationMins: z.ZodDefault<z.ZodNumber>;
    panelMembers: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    candidateId: string;
    interviewType: "HR" | "Technical" | "Video" | "Final" | "Phone" | "In-Person";
    scheduledAt: Date;
    durationMins: number;
    location?: string | undefined;
    panelMembers?: string | undefined;
}, {
    candidateId: string;
    interviewType: "HR" | "Technical" | "Video" | "Final" | "Phone" | "In-Person";
    scheduledAt: Date;
    location?: string | undefined;
    durationMins?: number | undefined;
    panelMembers?: string | undefined;
}>;
export declare const submitFeedbackSchema: z.ZodObject<{
    overallRating: z.ZodNumber;
    strengths: z.ZodOptional<z.ZodString>;
    weaknesses: z.ZodOptional<z.ZodString>;
    recommendation: z.ZodEnum<["Strongly Hire", "Hire", "Hold", "Reject"]>;
    feedbackJson: z.ZodOptional<z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    overallRating: number;
    recommendation: "Strongly Hire" | "Hire" | "Hold" | "Reject";
    strengths?: string | undefined;
    weaknesses?: string | undefined;
    feedbackJson?: any;
}, {
    overallRating: number;
    recommendation: "Strongly Hire" | "Hire" | "Hold" | "Reject";
    strengths?: string | undefined;
    weaknesses?: string | undefined;
    feedbackJson?: any;
}>;
export declare const createOfferSchema: z.ZodObject<{
    candidateId: z.ZodString;
    positionTitle: z.ZodString;
    departmentId: z.ZodString;
    designationId: z.ZodString;
    gradeId: z.ZodOptional<z.ZodString>;
    ctcOffered: z.ZodNumber;
    salaryBreakupJson: z.ZodOptional<z.ZodAny>;
    joiningDate: z.ZodOptional<z.ZodDate>;
    probationMonths: z.ZodDefault<z.ZodNumber>;
    noticePeriodDays: z.ZodDefault<z.ZodNumber>;
    expiryDate: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    departmentId: string;
    designationId: string;
    probationMonths: number;
    noticePeriodDays: number;
    candidateId: string;
    positionTitle: string;
    ctcOffered: number;
    expiryDate: Date;
    gradeId?: string | undefined;
    salaryBreakupJson?: any;
    joiningDate?: Date | undefined;
}, {
    departmentId: string;
    designationId: string;
    candidateId: string;
    positionTitle: string;
    ctcOffered: number;
    expiryDate: Date;
    gradeId?: string | undefined;
    probationMonths?: number | undefined;
    noticePeriodDays?: number | undefined;
    salaryBreakupJson?: any;
    joiningDate?: Date | undefined;
}>;
export declare const createOnboardingSchema: z.ZodObject<{
    candidateName: z.ZodString;
    joiningDate: z.ZodDate;
    departmentId: z.ZodString;
    designationId: z.ZodString;
    assignedBuddyId: z.ZodOptional<z.ZodString>;
    assignedHrId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    departmentId: string;
    designationId: string;
    joiningDate: Date;
    candidateName: string;
    assignedBuddyId?: string | undefined;
    assignedHrId?: string | undefined;
}, {
    departmentId: string;
    designationId: string;
    joiningDate: Date;
    candidateName: string;
    assignedBuddyId?: string | undefined;
    assignedHrId?: string | undefined;
}>;
//# sourceMappingURL=recruitment.schema.d.ts.map