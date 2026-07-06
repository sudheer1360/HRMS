/**
 * Domain entity interfaces — typed shapes for every DB-backed object.
 * Services should cast query results to these rather than `any`.
 */
export interface IUser {
    id: string;
    tenant_id: string;
    employee_id: string | null;
    email: string;
    password_hash: string;
    full_name: string;
    failed_login_attempts: number;
    locked_until: Date | null;
    last_login_at: Date | null;
    last_login_ip: string | null;
    mfa_enabled: boolean;
    mfa_secret: string | null;
    status: 'Active' | 'Inactive' | 'Suspended';
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
}
export interface IRefreshToken {
    id: string;
    user_id: string;
    token: string;
    expires_at: Date;
    revoked_at: Date | null;
    created_at: Date;
}
export interface ILoginLog {
    id: string;
    user_id: string | null;
    email: string;
    status: 'SUCCESS' | 'FAILED' | 'LOCKED';
    ip_address: string | null;
    user_agent: string | null;
    created_at: Date;
}
export interface ICompany {
    id: string;
    tenant_id: string;
    company_name: string;
    legal_name: string | null;
    company_code: string;
    pan: string | null;
    tan: string | null;
    gstin: string | null;
    cin: string | null;
    pf_registration_number: string | null;
    esi_registration_number: string | null;
    registered_address: string | null;
    corporate_address: string | null;
    email: string | null;
    phone: string | null;
    website: string | null;
    financial_year_start_month: string;
    payroll_cycle: 'Monthly' | 'Weekly' | 'Bi-Weekly';
    timezone: string;
    currency: string;
    status: 'Active' | 'Inactive';
    created_by: string;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
}
export interface IBranch {
    id: string;
    company_id: string;
    tenant_id: string;
    branch_name: string;
    branch_code: string;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string;
    pincode: string | null;
    email: string | null;
    phone: string | null;
    is_head_office: boolean;
    status: 'Active' | 'Inactive';
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
}
export interface IDepartment {
    id: string;
    company_id: string;
    tenant_id: string;
    department_name: string;
    department_code: string | null;
    parent_department_id: string | null;
    description: string | null;
    status: 'Active' | 'Inactive';
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
}
export interface IDesignation {
    id: string;
    company_id: string;
    tenant_id: string;
    designation_name: string;
    designation_code: string | null;
    department_id: string | null;
    level: number | null;
    description: string | null;
    status: 'Active' | 'Inactive';
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
}
export interface IGrade {
    id: string;
    company_id: string;
    tenant_id: string;
    grade_name: string;
    grade_code: string | null;
    min_salary: number | null;
    max_salary: number | null;
    description: string | null;
    status: 'Active' | 'Inactive';
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
}
export interface ICostCenter {
    id: string;
    company_id: string;
    tenant_id: string;
    cost_center_name: string;
    cost_center_code: string;
    description: string | null;
    status: 'Active' | 'Inactive';
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
}
export interface IEmployee {
    id: string;
    tenant_id: string;
    employee_code: string;
    first_name: string;
    last_name: string | null;
    full_name: string;
    email: string;
    personal_email: string | null;
    mobile: string | null;
    date_of_birth: string | null;
    gender: 'Male' | 'Female' | 'Other' | null;
    blood_group: string | null;
    marital_status: 'Single' | 'Married' | 'Divorced' | 'Widowed' | null;
    nationality: string | null;
    religion: string | null;
    company_id: string | null;
    branch_id: string | null;
    department_id: string | null;
    designation_id: string | null;
    grade_id: string | null;
    cost_center_id: string | null;
    reporting_manager_id: string | null;
    date_of_joining: string | null;
    date_of_confirmation: string | null;
    date_of_exit: string | null;
    employment_type: 'Full-Time' | 'Part-Time' | 'Contract' | 'Intern' | null;
    work_location: string | null;
    shift_id: string | null;
    probation_period_months: number | null;
    notice_period_days: number | null;
    status: 'Active' | 'Inactive' | 'On Leave' | 'Resigned' | 'Terminated' | 'Absconded';
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
}
export interface IAttendanceRecord {
    id: string;
    employee_id: string;
    tenant_id: string;
    attendance_date: string;
    check_in_time: string | null;
    check_out_time: string | null;
    total_hours: number | null;
    overtime_hours: number | null;
    status: 'Present' | 'Absent' | 'Half Day' | 'Holiday' | 'Weekend' | 'On Leave';
    source: 'Manual' | 'Biometric' | 'Web' | 'Mobile';
    remarks: string | null;
    created_at: Date;
    updated_at: Date;
}
export interface ILeaveRequest {
    id: string;
    employee_id: string;
    tenant_id: string;
    leave_type_id: string;
    from_date: string;
    to_date: string;
    total_days: number;
    reason: string | null;
    status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
    applied_on: Date;
    actioned_by: string | null;
    actioned_on: Date | null;
    remarks: string | null;
    created_at: Date;
    updated_at: Date;
}
export interface ILeaveType {
    id: string;
    tenant_id: string;
    company_id: string | null;
    leave_type_name: string;
    leave_type_code: string;
    days_allowed: number;
    carry_forward: boolean;
    max_carry_forward_days: number;
    is_paid: boolean;
    applicable_gender: 'All' | 'Male' | 'Female' | null;
    description: string | null;
    status: 'Active' | 'Inactive';
    created_at: Date;
    updated_at: Date;
}
export interface IPayslip {
    id: string;
    employee_id: string;
    tenant_id: string;
    payroll_month: string;
    gross_salary: number;
    total_deductions: number;
    net_salary: number;
    status: 'Draft' | 'Processed' | 'Paid' | 'Cancelled';
    processed_on: Date | null;
    paid_on: Date | null;
    payment_mode: string | null;
    created_at: Date;
    updated_at: Date;
}
export interface IJobPosting {
    id: string;
    tenant_id: string;
    company_id: string | null;
    department_id: string | null;
    designation_id: string | null;
    job_title: string;
    job_code: string | null;
    vacancies: number;
    experience_min: number | null;
    experience_max: number | null;
    job_description: string | null;
    status: 'Draft' | 'Open' | 'On Hold' | 'Closed' | 'Cancelled';
    posted_on: Date | null;
    closing_date: string | null;
    created_at: Date;
    updated_at: Date;
}
export interface ICandidate {
    id: string;
    tenant_id: string;
    job_posting_id: string;
    first_name: string;
    last_name: string | null;
    email: string;
    mobile: string | null;
    resume_url: string | null;
    current_ctc: number | null;
    expected_ctc: number | null;
    notice_period_days: number | null;
    current_company: string | null;
    experience_years: number | null;
    stage: 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Hired' | 'Rejected';
    created_at: Date;
    updated_at: Date;
}
export interface IPerformanceReview {
    id: string;
    employee_id: string;
    tenant_id: string;
    review_period_start: string;
    review_period_end: string;
    reviewer_id: string | null;
    overall_rating: number | null;
    status: 'Draft' | 'In Progress' | 'Completed' | 'Acknowledged';
    submitted_on: Date | null;
    created_at: Date;
    updated_at: Date;
}
export interface ITenant {
    id: string;
    tenant_name: string;
    subdomain: string | null;
    plan: string;
    status: 'Active' | 'Suspended' | 'Cancelled';
    created_at: Date;
    updated_at: Date;
}
export interface IRole {
    id: string;
    tenant_id: string;
    name: string;
    description: string | null;
    is_system: boolean;
    created_at: Date;
    updated_at: Date;
}
export interface IPermission {
    id: string;
    resource: string;
    action: string;
    description: string | null;
}
//# sourceMappingURL=entities.d.ts.map