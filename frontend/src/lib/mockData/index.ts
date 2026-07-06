// ─────────────────────────────────────────────────────────────────────────────
// HRMS Mock Data — used when API is unavailable or for demo mode
// ─────────────────────────────────────────────────────────────────────────────

export const mockCompanies = [
  { id: 'c1', company_name: 'TechCorp India Pvt Ltd', company_code: 'TCI', legal_name: 'TechCorp India Private Limited', email: 'info@techcorp.in', phone: '+919876543210', status: 'Active', pan: 'AAACT1234C', gstin: '29AAACT1234C1Z5', city: 'Bengaluru', state: 'Karnataka', total_employees: 248, created_at: '2024-01-15' },
  { id: 'c2', company_name: 'Horizon Solutions LLP', company_code: 'HSL', legal_name: 'Horizon Solutions LLP', email: 'hr@horizonsol.com', phone: '+918765432109', status: 'Active', pan: 'AABCH5678D', gstin: '27AABCH5678D1Z2', city: 'Mumbai', state: 'Maharashtra', total_employees: 92, created_at: '2024-03-20' },
  { id: 'c3', company_name: 'NovaTech Systems', company_code: 'NTS', legal_name: 'NovaTech Systems Private Limited', email: 'admin@novatech.io', phone: '+917654321098', status: 'Inactive', pan: 'AACNO9012E', gstin: '09AACNO9012E1Z8', city: 'Noida', state: 'Uttar Pradesh', total_employees: 34, created_at: '2024-06-10' },
];

export const mockDepartments = [
  { id: 'd1', department_name: 'Engineering', department_code: 'ENG', level: 0, status: 'Active', head_name: 'Rajesh Kumar', employee_count: 85 },
  { id: 'd2', department_name: 'Frontend', department_code: 'FE', level: 1, parent_department_id: 'd1', status: 'Active', head_name: 'Priya Sharma', employee_count: 32 },
  { id: 'd3', department_name: 'Backend', department_code: 'BE', level: 1, parent_department_id: 'd1', status: 'Active', head_name: 'Amit Patel', employee_count: 38 },
  { id: 'd4', department_name: 'DevOps', department_code: 'DO', level: 1, parent_department_id: 'd1', status: 'Active', head_name: 'Suresh Nair', employee_count: 15 },
  { id: 'd5', department_name: 'Human Resources', department_code: 'HR', level: 0, status: 'Active', head_name: 'Meena Reddy', employee_count: 12 },
  { id: 'd6', department_name: 'Finance & Accounts', department_code: 'FIN', level: 0, status: 'Active', head_name: 'Vikram Joshi', employee_count: 18 },
  { id: 'd7', department_name: 'Sales', department_code: 'SLS', level: 0, status: 'Active', head_name: 'Anita Singh', employee_count: 45 },
  { id: 'd8', department_name: 'Marketing', department_code: 'MKT', level: 0, status: 'Active', head_name: 'Ravi Menon', employee_count: 22 },
  { id: 'd9', department_name: 'Customer Success', department_code: 'CS', level: 0, status: 'Active', head_name: 'Deepa Krishnan', employee_count: 30 },
  { id: 'd10', department_name: 'Legal & Compliance', department_code: 'LEG', level: 0, status: 'Active', head_name: 'Arun Iyer', employee_count: 6 },
];

export const mockDesignations = [
  { id: 'des1', designation_name: 'Software Engineer', designation_code: 'SWE', grade_name: 'L3', level: 3, status: 'Active' },
  { id: 'des2', designation_name: 'Senior Software Engineer', designation_code: 'SSE', grade_name: 'L4', level: 4, status: 'Active' },
  { id: 'des3', designation_name: 'Principal Engineer', designation_code: 'PE', grade_name: 'L5', level: 5, status: 'Active' },
  { id: 'des4', designation_name: 'Engineering Manager', designation_code: 'EM', grade_name: 'L6', level: 6, status: 'Active' },
  { id: 'des5', designation_name: 'VP Engineering', designation_code: 'VPE', grade_name: 'L7', level: 7, status: 'Active' },
  { id: 'des6', designation_name: 'HR Executive', designation_code: 'HRE', grade_name: 'L2', level: 2, status: 'Active' },
  { id: 'des7', designation_name: 'HR Manager', designation_code: 'HRM', grade_name: 'L5', level: 5, status: 'Active' },
  { id: 'des8', designation_name: 'Sales Executive', designation_code: 'SE', grade_name: 'L2', level: 2, status: 'Active' },
  { id: 'des9', designation_name: 'Sales Manager', designation_code: 'SM', grade_name: 'L5', level: 5, status: 'Active' },
  { id: 'des10', designation_name: 'Product Manager', designation_code: 'PM', grade_name: 'L5', level: 5, status: 'Active' },
];

export const mockGrades = [
  { id: 'g1', grade_name: 'L1 — Associate', grade_code: 'L1', min_salary: 300000, max_salary: 500000, sort_order: 1, status: 'Active' },
  { id: 'g2', grade_name: 'L2 — Junior', grade_code: 'L2', min_salary: 500000, max_salary: 800000, sort_order: 2, status: 'Active' },
  { id: 'g3', grade_name: 'L3 — Mid', grade_code: 'L3', min_salary: 800000, max_salary: 1400000, sort_order: 3, status: 'Active' },
  { id: 'g4', grade_name: 'L4 — Senior', grade_code: 'L4', min_salary: 1400000, max_salary: 2200000, sort_order: 4, status: 'Active' },
  { id: 'g5', grade_name: 'L5 — Lead', grade_code: 'L5', min_salary: 2200000, max_salary: 3500000, sort_order: 5, status: 'Active' },
  { id: 'g6', grade_name: 'L6 — Manager', grade_code: 'L6', min_salary: 3500000, max_salary: 5500000, sort_order: 6, status: 'Active' },
  { id: 'g7', grade_name: 'L7 — Director', grade_code: 'L7', min_salary: 5500000, max_salary: 10000000, sort_order: 7, status: 'Active' },
];

export const mockBranches = [
  { id: 'b1', branch_name: 'Bengaluru HQ', branch_code: 'BLR', branch_type: 'HeadOffice', city: 'Bengaluru', state: 'Karnataka', is_payroll_location: true, status: 'Active' },
  { id: 'b2', branch_name: 'Mumbai Office', branch_code: 'MUM', branch_type: 'RegionalOffice', city: 'Mumbai', state: 'Maharashtra', is_payroll_location: true, status: 'Active' },
  { id: 'b3', branch_name: 'Delhi NCR', branch_code: 'DEL', branch_type: 'RegionalOffice', city: 'Noida', state: 'Uttar Pradesh', is_payroll_location: false, status: 'Active' },
  { id: 'b4', branch_name: 'Hyderabad Office', branch_code: 'HYD', branch_type: 'BranchOffice', city: 'Hyderabad', state: 'Telangana', is_payroll_location: false, status: 'Active' },
  { id: 'b5', branch_name: 'Pune Office', branch_code: 'PNQ', branch_type: 'BranchOffice', city: 'Pune', state: 'Maharashtra', is_payroll_location: false, status: 'Inactive' },
];

export const mockEmployees = [
  { id: 'e1', employee_code: 'EMP000001', full_name: 'Rajesh Kumar', first_name: 'Rajesh', last_name: 'Kumar', email: 'rajesh.kumar@techcorp.in', mobile: '9876543210', department_name: 'Engineering', designation_name: 'Engineering Manager', branch_name: 'Bengaluru HQ', grade_name: 'L6', employment_status: 'Active', employment_type: 'Permanent', gender: 'Male', date_of_joining: '2021-03-15', cost_to_company: 4800000, avatar: 'RK' },
  { id: 'e2', employee_code: 'EMP000002', full_name: 'Priya Sharma', first_name: 'Priya', last_name: 'Sharma', email: 'priya.sharma@techcorp.in', mobile: '9765432109', department_name: 'Engineering', designation_name: 'Senior Software Engineer', branch_name: 'Bengaluru HQ', grade_name: 'L4', employment_status: 'Active', employment_type: 'Permanent', gender: 'Female', date_of_joining: '2022-07-01', cost_to_company: 1800000, avatar: 'PS' },
  { id: 'e3', employee_code: 'EMP000003', full_name: 'Amit Patel', first_name: 'Amit', last_name: 'Patel', email: 'amit.patel@techcorp.in', mobile: '9654321098', department_name: 'Engineering', designation_name: 'Principal Engineer', branch_name: 'Bengaluru HQ', grade_name: 'L5', employment_status: 'Active', employment_type: 'Permanent', gender: 'Male', date_of_joining: '2020-11-20', cost_to_company: 3200000, avatar: 'AP' },
  { id: 'e4', employee_code: 'EMP000004', full_name: 'Meena Reddy', first_name: 'Meena', last_name: 'Reddy', email: 'meena.reddy@techcorp.in', mobile: '9543210987', department_name: 'Human Resources', designation_name: 'HR Manager', branch_name: 'Bengaluru HQ', grade_name: 'L5', employment_status: 'Active', employment_type: 'Permanent', gender: 'Female', date_of_joining: '2021-08-10', cost_to_company: 2400000, avatar: 'MR' },
  { id: 'e5', employee_code: 'EMP000005', full_name: 'Vikram Joshi', first_name: 'Vikram', last_name: 'Joshi', email: 'vikram.joshi@techcorp.in', mobile: '9432109876', department_name: 'Finance & Accounts', designation_name: 'Senior Software Engineer', branch_name: 'Mumbai Office', grade_name: 'L4', employment_status: 'Active', employment_type: 'Permanent', gender: 'Male', date_of_joining: '2022-01-05', cost_to_company: 1600000, avatar: 'VJ' },
  { id: 'e6', employee_code: 'EMP000006', full_name: 'Anita Singh', first_name: 'Anita', last_name: 'Singh', email: 'anita.singh@techcorp.in', mobile: '9321098765', department_name: 'Sales', designation_name: 'Sales Manager', branch_name: 'Delhi NCR', grade_name: 'L5', employment_status: 'Active', employment_type: 'Permanent', gender: 'Female', date_of_joining: '2021-06-14', cost_to_company: 2800000, avatar: 'AS' },
  { id: 'e7', employee_code: 'EMP000007', full_name: 'Suresh Nair', first_name: 'Suresh', last_name: 'Nair', email: 'suresh.nair@techcorp.in', mobile: '9210987654', department_name: 'Engineering', designation_name: 'Senior Software Engineer', branch_name: 'Bengaluru HQ', grade_name: 'L4', employment_status: 'Probation', employment_type: 'Permanent', gender: 'Male', date_of_joining: '2026-01-10', cost_to_company: 1400000, avatar: 'SN' },
  { id: 'e8', employee_code: 'EMP000008', full_name: 'Deepa Krishnan', first_name: 'Deepa', last_name: 'Krishnan', email: 'deepa.k@techcorp.in', mobile: '9109876543', department_name: 'Customer Success', designation_name: 'HR Executive', branch_name: 'Bengaluru HQ', grade_name: 'L3', employment_status: 'Active', employment_type: 'Contract', gender: 'Female', date_of_joining: '2023-04-01', cost_to_company: 900000, avatar: 'DK' },
  { id: 'e9', employee_code: 'EMP000009', full_name: 'Ravi Menon', first_name: 'Ravi', last_name: 'Menon', email: 'ravi.menon@techcorp.in', mobile: '9098765432', department_name: 'Marketing', designation_name: 'Product Manager', branch_name: 'Mumbai Office', grade_name: 'L5', employment_status: 'Active', employment_type: 'Permanent', gender: 'Male', date_of_joining: '2022-09-15', cost_to_company: 2600000, avatar: 'RM' },
  { id: 'e10', employee_code: 'EMP000010', full_name: 'Kavya Iyer', first_name: 'Kavya', last_name: 'Iyer', email: 'kavya.iyer@techcorp.in', mobile: '8987654321', department_name: 'Engineering', designation_name: 'Software Engineer', branch_name: 'Bengaluru HQ', grade_name: 'L3', employment_status: 'Active', employment_type: 'Permanent', gender: 'Female', date_of_joining: '2023-07-17', cost_to_company: 1100000, avatar: 'KI' },
  { id: 'e11', employee_code: 'EMP000011', full_name: 'Arun Iyer', first_name: 'Arun', last_name: 'Iyer', email: 'arun.iyer@techcorp.in', mobile: '8876543210', department_name: 'Legal & Compliance', designation_name: 'Software Engineer', branch_name: 'Bengaluru HQ', grade_name: 'L5', employment_status: 'Active', employment_type: 'Permanent', gender: 'Male', date_of_joining: '2020-05-03', cost_to_company: 3000000, avatar: 'AI' },
  { id: 'e12', employee_code: 'EMP000012', full_name: 'Nandini Bhat', first_name: 'Nandini', last_name: 'Bhat', email: 'nandini.bhat@techcorp.in', mobile: '8765432109', department_name: 'Engineering', designation_name: 'Software Engineer', branch_name: 'Bengaluru HQ', grade_name: 'L3', employment_status: 'Terminated', employment_type: 'Permanent', gender: 'Female', date_of_joining: '2022-03-21', cost_to_company: 1000000, avatar: 'NB' },
];

export const mockAttendance = [
  { id: 'a1', employee_code: 'EMP000001', full_name: 'Rajesh Kumar', attendance_date: '2026-06-14', in_time: '09:02:00', out_time: '18:15:00', total_hours: 9.22, status: 'Present', source: 'Web' },
  { id: 'a2', employee_code: 'EMP000002', full_name: 'Priya Sharma', attendance_date: '2026-06-14', in_time: '09:30:00', out_time: '18:00:00', total_hours: 8.5, status: 'Present', source: 'Web' },
  { id: 'a3', employee_code: 'EMP000003', full_name: 'Amit Patel', attendance_date: '2026-06-14', in_time: '10:05:00', out_time: '19:00:00', total_hours: 8.92, status: 'Present', source: 'Biometric' },
  { id: 'a4', employee_code: 'EMP000004', full_name: 'Meena Reddy', attendance_date: '2026-06-14', in_time: null, out_time: null, total_hours: 0, status: 'Absent', source: null },
  { id: 'a5', employee_code: 'EMP000005', full_name: 'Vikram Joshi', attendance_date: '2026-06-14', in_time: '09:45:00', out_time: '14:00:00', total_hours: 4.25, status: 'Half Day', source: 'Web' },
  { id: 'a6', employee_code: 'EMP000006', full_name: 'Anita Singh', attendance_date: '2026-06-14', in_time: '09:00:00', out_time: '18:00:00', total_hours: 9, status: 'Present', source: 'Mobile' },
  { id: 'a7', employee_code: 'EMP000007', full_name: 'Suresh Nair', attendance_date: '2026-06-14', in_time: null, out_time: null, total_hours: 0, status: 'Leave', source: null },
  { id: 'a8', employee_code: 'EMP000008', full_name: 'Deepa Krishnan', attendance_date: '2026-06-14', in_time: '08:55:00', out_time: '18:10:00', total_hours: 9.25, status: 'Present', source: 'Web' },
];

export const mockLeaveRequests = [
  { id: 'l1', employee_code: 'EMP000002', full_name: 'Priya Sharma', leave_type: 'Casual Leave', from_date: '2026-06-20', to_date: '2026-06-22', days: 3, reason: 'Personal work', status: 'Pending', applied_on: '2026-06-14' },
  { id: 'l2', employee_code: 'EMP000007', full_name: 'Suresh Nair', leave_type: 'Sick Leave', from_date: '2026-06-14', to_date: '2026-06-15', days: 2, reason: 'Fever and cold', status: 'Approved', applied_on: '2026-06-13' },
  { id: 'l3', employee_code: 'EMP000010', full_name: 'Kavya Iyer', leave_type: 'Earned Leave', from_date: '2026-07-01', to_date: '2026-07-05', days: 5, reason: 'Vacation', status: 'Pending', applied_on: '2026-06-12' },
  { id: 'l4', employee_code: 'EMP000005', full_name: 'Vikram Joshi', leave_type: 'Casual Leave', from_date: '2026-06-10', to_date: '2026-06-10', days: 1, reason: 'Family function', status: 'Rejected', applied_on: '2026-06-08' },
  { id: 'l5', employee_code: 'EMP000009', full_name: 'Ravi Menon', leave_type: 'Sick Leave', from_date: '2026-06-05', to_date: '2026-06-07', days: 3, reason: 'Medical checkup', status: 'Approved', applied_on: '2026-06-04' },
];

export const mockLeaveTypes = [
  { id: 'lt1', leave_type_name: 'Casual Leave', leave_code: 'CL', days_allowed: 12, carry_forward: false, gender_specific: null, status: 'Active' },
  { id: 'lt2', leave_type_name: 'Sick Leave', leave_code: 'SL', days_allowed: 8, carry_forward: false, gender_specific: null, status: 'Active' },
  { id: 'lt3', leave_type_name: 'Earned Leave', leave_code: 'EL', days_allowed: 21, carry_forward: true, gender_specific: null, status: 'Active' },
  { id: 'lt4', leave_type_name: 'Maternity Leave', leave_code: 'ML', days_allowed: 180, carry_forward: false, gender_specific: 'Female', status: 'Active' },
  { id: 'lt5', leave_type_name: 'Paternity Leave', leave_code: 'PL', days_allowed: 15, carry_forward: false, gender_specific: 'Male', status: 'Active' },
  { id: 'lt6', leave_type_name: 'Compensatory Off', leave_code: 'CO', days_allowed: 0, carry_forward: true, gender_specific: null, status: 'Active' },
];

export const mockRecruitmentJobs = [
  { id: 'j1', posting_code: 'JOB-L7EJ5K', title: 'Senior React Developer', department: 'Engineering', location: 'Bengaluru', employment_type: 'Full-time', work_mode: 'Hybrid', status: 'Published', applications_count: 24, min_experience_years: 3, max_experience_years: 7, min_salary: 1200000, max_salary: 2000000, created_at: '2026-06-01' },
  { id: 'j2', posting_code: 'JOB-M8FK6L', title: 'DevOps Engineer', department: 'Engineering', location: 'Bengaluru', employment_type: 'Full-time', work_mode: 'On-site', status: 'Published', applications_count: 11, min_experience_years: 2, max_experience_years: 5, min_salary: 900000, max_salary: 1600000, created_at: '2026-06-05' },
  { id: 'j3', posting_code: 'JOB-N9GL7M', title: 'HR Business Partner', department: 'Human Resources', location: 'Mumbai', employment_type: 'Full-time', work_mode: 'On-site', status: 'Draft', applications_count: 0, min_experience_years: 5, max_experience_years: 10, min_salary: 1500000, max_salary: 2800000, created_at: '2026-06-10' },
  { id: 'j4', posting_code: 'JOB-O0HM8N', title: 'Sales Executive', department: 'Sales', location: 'Delhi NCR', employment_type: 'Full-time', work_mode: 'On-site', status: 'Published', applications_count: 38, min_experience_years: 1, max_experience_years: 3, min_salary: 400000, max_salary: 700000, created_at: '2026-05-28' },
];

export const mockCandidates = [
  { id: 'ca1', first_name: 'Arjun', last_name: 'Mehta', email: 'arjun.mehta@gmail.com', mobile: '9871234567', job_title: 'Senior React Developer', stage: 'Screening', source: 'LinkedIn', total_experience_years: 5, current_ctc: 1100000, expected_ctc: 1600000, created_at: '2026-06-03' },
  { id: 'ca2', first_name: 'Sneha', last_name: 'Gupta', email: 'sneha.g@outlook.com', mobile: '9762345678', job_title: 'Senior React Developer', stage: 'Technical Round', source: 'Naukri', total_experience_years: 4, current_ctc: 900000, expected_ctc: 1400000, created_at: '2026-06-04' },
  { id: 'ca3', first_name: 'Mohit', last_name: 'Verma', email: 'mohit.v@yahoo.com', mobile: '9653456789', job_title: 'DevOps Engineer', stage: 'HR Round', source: 'Direct', total_experience_years: 3, current_ctc: 800000, expected_ctc: 1100000, created_at: '2026-06-06' },
  { id: 'ca4', first_name: 'Pooja', last_name: 'Saxena', email: 'pooja.s@gmail.com', mobile: '9544567890', job_title: 'Senior React Developer', stage: 'Offered', source: 'Referral', total_experience_years: 6, current_ctc: 1400000, expected_ctc: 1900000, created_at: '2026-05-30' },
  { id: 'ca5', first_name: 'Kiran', last_name: 'Bose', email: 'kiran.b@gmail.com', mobile: '9435678901', job_title: 'Sales Executive', stage: 'New', source: 'LinkedIn', total_experience_years: 2, current_ctc: 350000, expected_ctc: 550000, created_at: '2026-06-12' },
];

export const mockPayrollRuns = [
  { id: 'pr1', run_code: 'PAY-2026-05-ABC1', period_start: '2026-05-01', period_end: '2026-05-31', status: 'Approved', total_employees: 248, total_earnings: 45600000, total_deductions: 7200000, total_net_pay: 38400000, created_at: '2026-06-01' },
  { id: 'pr2', run_code: 'PAY-2026-04-DEF2', period_start: '2026-04-01', period_end: '2026-04-30', status: 'Approved', total_employees: 245, total_earnings: 44800000, total_deductions: 7050000, total_net_pay: 37750000, created_at: '2026-05-02' },
  { id: 'pr3', run_code: 'PAY-2026-06-GHI3', period_start: '2026-06-01', period_end: '2026-06-30', status: 'Draft', total_employees: 0, total_earnings: 0, total_deductions: 0, total_net_pay: 0, created_at: '2026-06-14' },
];

export const mockDashboardStats = {
  totalEmployees: 248,
  activeEmployees: 232,
  onLeaveToday: 14,
  presentToday: 201,
  absentToday: 33,
  pendingLeaves: 8,
  payrollDue: 'Jun 2026',
  openTickets: 5,
  openPositions: 3,
  newJoinees: 4,
  exitingThisMonth: 2,
};

export const mockDashboardChartData = {
  attendanceTrend: [
    { day: 'Mon', present: 218, absent: 30 },
    { day: 'Tue', present: 225, absent: 23 },
    { day: 'Wed', present: 211, absent: 37 },
    { day: 'Thu', present: 220, absent: 28 },
    { day: 'Fri', present: 201, absent: 47 },
  ],
  departmentHeadcount: [
    { dept: 'Engineering', count: 85 },
    { dept: 'Sales', count: 45 },
    { dept: 'Customer Success', count: 30 },
    { dept: 'Marketing', count: 22 },
    { dept: 'Finance', count: 18 },
    { dept: 'HR', count: 12 },
  ],
  leaveTypeSplit: [
    { name: 'Casual', value: 35 },
    { name: 'Sick', value: 28 },
    { name: 'Earned', value: 22 },
    { name: 'Other', value: 15 },
  ],
};
