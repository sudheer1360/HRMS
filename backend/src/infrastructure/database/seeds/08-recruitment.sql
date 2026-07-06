-- =====================================================
-- 08-recruitment.sql  ·  UUID() / NOW() edition
-- requisitions, job_postings, candidates, interview_schedules, job_offers
-- =====================================================

-- REQUISITIONS
INSERT INTO requisitions (id, tenant_id, company_id, department_id, designation_id, requisition_code, title, positions_count, employment_type, priority, required_by, status, created_by) VALUES
(UUID(),
 (SELECT id FROM tenants   WHERE tenant_code  = 'FYND'),
 (SELECT id FROM companies WHERE company_code = 'FYT001'),
 (SELECT id FROM departments  WHERE department_code  = 'ENG'  AND company_id = (SELECT id FROM companies WHERE company_code = 'FYT001')),
 (SELECT id FROM designations WHERE designation_code = 'SENG' AND company_id = (SELECT id FROM companies WHERE company_code = 'FYT001')),
 'REQ2026001', 'Senior Backend Engineer', 3, 'Permanent', 'High',   '2026-08-01', 'Approved',
 (SELECT id FROM users WHERE email = 'hr@fyndyne.com')),

(UUID(),
 (SELECT id FROM tenants   WHERE tenant_code  = 'FYND'),
 (SELECT id FROM companies WHERE company_code = 'FYT001'),
 (SELECT id FROM departments  WHERE department_code  = 'FED'  AND company_id = (SELECT id FROM companies WHERE company_code = 'FYT001')),
 (SELECT id FROM designations WHERE designation_code = 'ENGR' AND company_id = (SELECT id FROM companies WHERE company_code = 'FYT001')),
 'REQ2026002', 'Frontend Engineer', 2, 'Permanent', 'Medium', '2026-08-15', 'Approved',
 (SELECT id FROM users WHERE email = 'hr@fyndyne.com')),

(UUID(),
 (SELECT id FROM tenants   WHERE tenant_code  = 'FYND'),
 (SELECT id FROM companies WHERE company_code = 'FYT001'),
 (SELECT id FROM departments  WHERE department_code  = 'AI'   AND company_id = (SELECT id FROM companies WHERE company_code = 'FYT001')),
 (SELECT id FROM designations WHERE designation_code = 'AIE'  AND company_id = (SELECT id FROM companies WHERE company_code = 'FYT001')),
 'REQ2026003', 'AI Engineer', 5, 'Permanent', 'High', '2026-09-01', 'Approved',
 (SELECT id FROM users WHERE email = 'hr@fyndyne.com'));

-- JOB POSTINGS
INSERT INTO job_postings (id, tenant_id, company_id, requisition_id, posting_code, title, department, location, employment_type, work_mode, status) VALUES
(UUID(),
 (SELECT id FROM tenants   WHERE tenant_code  = 'FYND'),
 (SELECT id FROM companies WHERE company_code = 'FYT001'),
 (SELECT id FROM requisitions WHERE requisition_code = 'REQ2026001'),
 'JOB2026001', 'Senior Backend Engineer', 'Engineering',    'Hyderabad',  'Full-time', 'Hybrid',  'Published'),
(UUID(),
 (SELECT id FROM tenants   WHERE tenant_code  = 'FYND'),
 (SELECT id FROM companies WHERE company_code = 'FYT001'),
 (SELECT id FROM requisitions WHERE requisition_code = 'REQ2026002'),
 'JOB2026002', 'Frontend Engineer',       'Engineering',    'Bangalore',  'Hybrid',    'Remote',  'Published'),
(UUID(),
 (SELECT id FROM tenants   WHERE tenant_code  = 'FYND'),
 (SELECT id FROM companies WHERE company_code = 'FYT001'),
 (SELECT id FROM requisitions WHERE requisition_code = 'REQ2026003'),
 'JOB2026003', 'AI Engineer',             'AI Engineering', 'Hyderabad',  'Full-time', 'Hybrid',  'Published');

-- CANDIDATES
INSERT INTO candidates (id, tenant_id, job_posting_id, first_name, last_name, email, mobile, source, current_ctc, expected_ctc, notice_period_days, total_experience_years, stage, status) VALUES
(UUID(),
 (SELECT id FROM tenants WHERE tenant_code = 'FYND'),
 (SELECT id FROM job_postings WHERE posting_code = 'JOB2026001'),
 'Ramesh', 'Kumar', 'ramesh@gmail.com', '9876100001', 'Naukri',
 850000, 1100000, 30, 5, 'Technical Round', 'Active'),
(UUID(),
 (SELECT id FROM tenants WHERE tenant_code = 'FYND'),
 (SELECT id FROM job_postings WHERE posting_code = 'JOB2026002'),
 'Divya', 'Reddy', 'divya@gmail.com', '9876100002', 'LinkedIn',
 700000, 950000, 60, 4, 'HR Round', 'Active'),
(UUID(),
 (SELECT id FROM tenants WHERE tenant_code = 'FYND'),
 (SELECT id FROM job_postings WHERE posting_code = 'JOB2026003'),
 'Surya', 'Prakash', 'surya@gmail.com', '9876100003', 'Referral',
 1200000, 1500000, 45, 6, 'Offer', 'Active');

-- INTERVIEW SCHEDULES
INSERT INTO interview_schedules (id, tenant_id, candidate_id, job_posting_id, round_number, interview_type, scheduled_at, duration_mins, mode, status) VALUES
(UUID(),
 (SELECT id FROM tenants WHERE tenant_code = 'FYND'),
 (SELECT id FROM candidates WHERE email = 'ramesh@gmail.com'),
 (SELECT id FROM job_postings WHERE posting_code = 'JOB2026001'),
 1, 'Technical', '2026-07-05 11:00:00', 60, 'Video', 'Completed'),
(UUID(),
 (SELECT id FROM tenants WHERE tenant_code = 'FYND'),
 (SELECT id FROM candidates WHERE email = 'divya@gmail.com'),
 (SELECT id FROM job_postings WHERE posting_code = 'JOB2026002'),
 2, 'Managerial', '2026-07-06 14:00:00', 45, 'Video', 'Scheduled'),
(UUID(),
 (SELECT id FROM tenants WHERE tenant_code = 'FYND'),
 (SELECT id FROM candidates WHERE email = 'surya@gmail.com'),
 (SELECT id FROM job_postings WHERE posting_code = 'JOB2026003'),
 3, 'HR', '2026-07-07 15:00:00', 30, 'Video', 'Completed');

-- JOB OFFERS
INSERT INTO job_offers (id, tenant_id, candidate_id, job_posting_id, offer_code, ctc_offered, joining_date, valid_until, status, created_by) VALUES
(UUID(),
 (SELECT id FROM tenants WHERE tenant_code = 'FYND'),
 (SELECT id FROM candidates WHERE email = 'surya@gmail.com'),
 (SELECT id FROM job_postings WHERE posting_code = 'JOB2026003'),
 'OFF2026001', 1450000, '2026-08-01', '2026-07-20', 'Accepted',
 (SELECT id FROM users WHERE email = 'hr@fyndyne.com')),
(UUID(),
 (SELECT id FROM tenants WHERE tenant_code = 'FYND'),
 (SELECT id FROM candidates WHERE email = 'divya@gmail.com'),
 (SELECT id FROM job_postings WHERE posting_code = 'JOB2026002'),
 'OFF2026002', 900000, '2026-08-15', '2026-07-25', 'Pending',
 (SELECT id FROM users WHERE email = 'hr@fyndyne.com'));
