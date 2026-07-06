-- =====================================================
-- 06-leave-management.sql  ·  UUID() / NOW() edition
-- leave_types, leave_policies, leave_balances, leave_applications
-- =====================================================

-- LEAVE TYPES
INSERT INTO leave_types (id, tenant_id, company_id, leave_name, leave_code, description, is_paid, requires_approval, status) VALUES
(UUID(), (SELECT id FROM tenants WHERE tenant_code = 'FYND'), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Casual Leave',    'CL',  'Casual Leave',       1, 1, 'Active'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code = 'FYND'), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Sick Leave',      'SL',  'Sick Leave',         1, 1, 'Active'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code = 'FYND'), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Earned Leave',    'EL',  'Earned Leave',       1, 1, 'Active'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code = 'FYND'), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Maternity Leave', 'ML',  'Maternity Leave',    1, 1, 'Active'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code = 'FYND'), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Paternity Leave', 'PL',  'Paternity Leave',    1, 1, 'Active'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code = 'FYND'), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Comp Off',        'CO',  'Compensatory Off',   1, 1, 'Active'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code = 'FYND'), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Loss Of Pay',     'LOP', 'Loss Of Pay',        0, 1, 'Active');

-- LEAVE POLICIES
INSERT INTO leave_policies (id, tenant_id, company_id, leave_type_id, annual_quota, accrual_frequency, carry_forward_limit, status) VALUES
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM companies WHERE company_code='FYT001'),
 (SELECT id FROM leave_types WHERE leave_code='CL'  AND company_id=(SELECT id FROM companies WHERE company_code='FYT001')),
 12, 'Monthly', 6, 'Active'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM companies WHERE company_code='FYT001'),
 (SELECT id FROM leave_types WHERE leave_code='SL'  AND company_id=(SELECT id FROM companies WHERE company_code='FYT001')),
 12, 'Monthly', 6, 'Active'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM companies WHERE company_code='FYT001'),
 (SELECT id FROM leave_types WHERE leave_code='EL'  AND company_id=(SELECT id FROM companies WHERE company_code='FYT001')),
 18, 'Monthly', 10, 'Active'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM companies WHERE company_code='FYT001'),
 (SELECT id FROM leave_types WHERE leave_code='ML'  AND company_id=(SELECT id FROM companies WHERE company_code='FYT001')),
 180, 'Yearly', 0, 'Active'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM companies WHERE company_code='FYT001'),
 (SELECT id FROM leave_types WHERE leave_code='PL'  AND company_id=(SELECT id FROM companies WHERE company_code='FYT001')),
 15, 'Yearly', 0, 'Active'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM companies WHERE company_code='FYT001'),
 (SELECT id FROM leave_types WHERE leave_code='CO'  AND company_id=(SELECT id FROM companies WHERE company_code='FYT001')),
 5, 'Monthly', 0, 'Active'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM companies WHERE company_code='FYT001'),
 (SELECT id FROM leave_types WHERE leave_code='LOP' AND company_id=(SELECT id FROM companies WHERE company_code='FYT001')),
 999, 'Monthly', 0, 'Active');

-- LEAVE BALANCES
INSERT INTO leave_balances (id, tenant_id, employee_id, leave_type_id, year, opening_balance, earned_ytd, used_ytd, current_balance) VALUES
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'),
 (SELECT id FROM employees WHERE employee_code='EMP0001'),
 (SELECT id FROM leave_types WHERE leave_code='CL' AND company_id=(SELECT id FROM companies WHERE company_code='FYT001')),
 2026, 12, 5, 2, 15),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'),
 (SELECT id FROM employees WHERE employee_code='EMP0001'),
 (SELECT id FROM leave_types WHERE leave_code='SL' AND company_id=(SELECT id FROM companies WHERE company_code='FYT001')),
 2026, 12, 5, 1, 16),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'),
 (SELECT id FROM employees WHERE employee_code='EMP0002'),
 (SELECT id FROM leave_types WHERE leave_code='CL' AND company_id=(SELECT id FROM companies WHERE company_code='FYT001')),
 2026, 12, 5, 3, 14),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'),
 (SELECT id FROM employees WHERE employee_code='EMP0002'),
 (SELECT id FROM leave_types WHERE leave_code='EL' AND company_id=(SELECT id FROM companies WHERE company_code='FYT001')),
 2026, 18, 8, 4, 22),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'),
 (SELECT id FROM employees WHERE employee_code='EMP0003'),
 (SELECT id FROM leave_types WHERE leave_code='CL' AND company_id=(SELECT id FROM companies WHERE company_code='FYT001')),
 2026, 12, 5, 1, 16);

-- LEAVE APPLICATIONS — Approved
INSERT INTO leave_applications (id, tenant_id, employee_id, leave_type_id, from_date, to_date, total_days, reason, status, approved_by) VALUES
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'),
 (SELECT id FROM employees WHERE employee_code='EMP0001'),
 (SELECT id FROM leave_types WHERE leave_code='CL' AND company_id=(SELECT id FROM companies WHERE company_code='FYT001')),
 '2026-04-10', '2026-04-11', 2, 'Personal Work', 'Approved',
 (SELECT id FROM users WHERE email='hr@fyndyne.com')),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'),
 (SELECT id FROM employees WHERE employee_code='EMP0002'),
 (SELECT id FROM leave_types WHERE leave_code='SL' AND company_id=(SELECT id FROM companies WHERE company_code='FYT001')),
 '2026-04-15', '2026-04-16', 2, 'Health Issue', 'Approved',
 (SELECT id FROM users WHERE email='hr@fyndyne.com'));

-- LEAVE APPLICATIONS — Pending
INSERT INTO leave_applications (id, tenant_id, employee_id, leave_type_id, from_date, to_date, total_days, reason, status) VALUES
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'),
 (SELECT id FROM employees WHERE employee_code='EMP0003'),
 (SELECT id FROM leave_types WHERE leave_code='CL' AND company_id=(SELECT id FROM companies WHERE company_code='FYT001')),
 '2026-06-10', '2026-06-12', 3, 'Family Function', 'Pending'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'),
 (SELECT id FROM employees WHERE employee_code='EMP0004'),
 (SELECT id FROM leave_types WHERE leave_code='EL' AND company_id=(SELECT id FROM companies WHERE company_code='FYT001')),
 '2026-07-01', '2026-07-05', 5, 'Vacation', 'Pending');

-- LEAVE APPLICATIONS — Rejected
INSERT INTO leave_applications (id, tenant_id, employee_id, leave_type_id, from_date, to_date, total_days, reason, status, rejected_reason) VALUES
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'),
 (SELECT id FROM employees WHERE employee_code='EMP0005'),
 (SELECT id FROM leave_types WHERE leave_code='CL' AND company_id=(SELECT id FROM companies WHERE company_code='FYT001')),
 '2026-05-20', '2026-05-21', 2, 'Personal Work', 'Rejected', 'Project Release Scheduled');
