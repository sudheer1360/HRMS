-- =====================================================
-- 11-grievance-disciplinary-exit.sql  ·  UUID() / NOW() edition
-- grievances, disciplinary_cases, exit_cases
-- =====================================================

-- GRIEVANCES
INSERT INTO grievances (id, tenant_id, employee_id, grievance_code, category, subject, description, priority, status) VALUES
(UUID(),
 (SELECT id FROM tenants WHERE tenant_code = 'FYND'),
 (SELECT id FROM employees WHERE employee_code = 'EMP0001'),
 'GRV2026001', 'Workplace', 'Workstation Issue',
 'Laptop frequently crashes during work.', 'Medium', 'Open'),
(UUID(),
 (SELECT id FROM tenants WHERE tenant_code = 'FYND'),
 (SELECT id FROM employees WHERE employee_code = 'EMP0002'),
 'GRV2026002', 'Payroll', 'Salary Mismatch',
 'Variable pay not reflected in payslip.', 'High', 'In Progress'),
(UUID(),
 (SELECT id FROM tenants WHERE tenant_code = 'FYND'),
 (SELECT id FROM employees WHERE employee_code = 'EMP0003'),
 'GRV2026003', 'Manager', 'Workload Concern',
 'Excessive workload assigned continuously.', 'Medium', 'Resolved');

-- DISCIPLINARY CASES
INSERT INTO disciplinary_cases (id, tenant_id, employee_id, case_code, incident_date, category, description, action_taken, status) VALUES
(UUID(),
 (SELECT id FROM tenants WHERE tenant_code = 'FYND'),
 (SELECT id FROM employees WHERE employee_code = 'EMP0004'),
 'DISC2026001', '2026-04-12', 'Attendance',
 'Repeated late arrivals.', 'Written Warning', 'Closed'),
(UUID(),
 (SELECT id FROM tenants WHERE tenant_code = 'FYND'),
 (SELECT id FROM employees WHERE employee_code = 'EMP0005'),
 'DISC2026002', '2026-05-10', 'Policy Violation',
 'Unauthorized software installation.', 'Final Warning', 'Closed'),
(UUID(),
 (SELECT id FROM tenants WHERE tenant_code = 'FYND'),
 (SELECT id FROM employees WHERE employee_code = 'EMP0006'),
 'DISC2026003', '2026-06-01', 'Conduct',
 'Inappropriate workplace behavior.', 'Investigation', 'Open');

-- EXIT CASES
INSERT INTO exit_cases (id, tenant_id, employee_id, exit_type, resignation_date, last_working_day, reason, exit_interview_done, clearance_status, status) VALUES
(UUID(),
 (SELECT id FROM tenants WHERE tenant_code = 'FYND'),
 (SELECT id FROM employees WHERE employee_code = 'EMP0007'),
 'Resignation', '2026-04-01', '2026-04-30', 'Higher Education', 1, 'Completed', 'Closed'),
(UUID(),
 (SELECT id FROM tenants WHERE tenant_code = 'FYND'),
 (SELECT id FROM employees WHERE employee_code = 'EMP0008'),
 'Resignation', '2026-05-15', '2026-06-15', 'Better Opportunity', 0, 'Pending', 'Initiated'),
(UUID(),
 (SELECT id FROM tenants WHERE tenant_code = 'FYND'),
 (SELECT id FROM employees WHERE employee_code = 'EMP0009'),
 'Termination', '2026-03-01', '2026-03-15', 'Performance Issues', 1, 'Completed', 'Closed');
