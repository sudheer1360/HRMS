-- =====================================================
-- 07-payroll.sql  ·  UUID() / NOW() edition
-- salary_components, salary_structures, payroll_runs, payroll_payslips, expense_claims
-- =====================================================

-- SALARY COMPONENTS
INSERT INTO salary_components (id, tenant_id, company_id, component_name, component_code, component_type, calculation_type, is_taxable, is_pf_applicable, status) VALUES
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM companies WHERE company_code='FYT001'), 'Basic',               'BASIC', 'Earning',   'Fixed',      1, 1, 'Active'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM companies WHERE company_code='FYT001'), 'House Rent Allowance', 'HRA',   'Earning',   'Percentage', 1, 0, 'Active'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM companies WHERE company_code='FYT001'), 'Special Allowance',    'SA',    'Earning',   'Fixed',      1, 0, 'Active'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM companies WHERE company_code='FYT001'), 'Conveyance',           'CONV',  'Earning',   'Fixed',      0, 0, 'Active'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM companies WHERE company_code='FYT001'), 'Medical Allowance',    'MED',   'Earning',   'Fixed',      0, 0, 'Active'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM companies WHERE company_code='FYT001'), 'Provident Fund',       'PF',    'Deduction', 'Percentage', 0, 1, 'Active'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM companies WHERE company_code='FYT001'), 'Professional Tax',     'PT',    'Deduction', 'Fixed',      0, 0, 'Active'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM companies WHERE company_code='FYT001'), 'Income Tax',           'IT',    'Deduction', 'Calculated', 0, 0, 'Active'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM companies WHERE company_code='FYT001'), 'Bonus',                'BONUS', 'Earning',   'Fixed',      1, 0, 'Active');

-- SALARY STRUCTURES
INSERT INTO salary_structures (id, tenant_id, company_id, name, description, status) VALUES
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM companies WHERE company_code='FYT001'), 'Grade G1 Structure', 'Entry Level Employees', 'Active'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM companies WHERE company_code='FYT001'), 'Grade G2 Structure', 'Associate Level',       'Active'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM companies WHERE company_code='FYT001'), 'Grade G3 Structure', 'Senior Engineers',      'Active'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM companies WHERE company_code='FYT001'), 'Grade G4 Structure', 'Managers',              'Active');

-- PAYROLL RUNS
INSERT INTO payroll_runs (id, tenant_id, company_id, run_code, period_start, period_end, total_employees, status, processed_by) VALUES
(UUID(),
 (SELECT id FROM tenants WHERE tenant_code='FYND'),
 (SELECT id FROM companies WHERE company_code='FYT001'),
 'APR2026', '2026-04-01', '2026-04-30', 500, 'Approved',
 (SELECT id FROM users WHERE email='hr@fyndyne.com')),
(UUID(),
 (SELECT id FROM tenants WHERE tenant_code='FYND'),
 (SELECT id FROM companies WHERE company_code='FYT001'),
 'MAY2026', '2026-05-01', '2026-05-31', 500, 'Approved',
 (SELECT id FROM users WHERE email='hr@fyndyne.com'));

-- PAYROLL PAYSLIPS
INSERT INTO payroll_payslips (id, tenant_id, payroll_run_id, employee_id, gross_earnings, pf_employee, income_tax, total_deductions, net_pay, status) VALUES
(UUID(),
 (SELECT id FROM tenants WHERE tenant_code='FYND'),
 (SELECT id FROM payroll_runs WHERE run_code='APR2026'),
 (SELECT id FROM employees WHERE employee_code='EMP0001'),
 70833, 1800, 2500, 4300, 66533, 'Published'),
(UUID(),
 (SELECT id FROM tenants WHERE tenant_code='FYND'),
 (SELECT id FROM payroll_runs WHERE run_code='APR2026'),
 (SELECT id FROM employees WHERE employee_code='EMP0002'),
 58333, 1800, 1500, 3300, 55033, 'Published'),
(UUID(),
 (SELECT id FROM tenants WHERE tenant_code='FYND'),
 (SELECT id FROM payroll_runs WHERE run_code='APR2026'),
 (SELECT id FROM employees WHERE employee_code='EMP0003'),
 75000, 1800, 3500, 5300, 69700, 'Published');

-- EXPENSE CLAIMS
INSERT INTO expense_claims (id, tenant_id, employee_id, claim_code, expense_date, category, amount, description, status) VALUES
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM employees WHERE employee_code='EMP0001'), 'EXP2026001', '2026-05-10', 'Travel',   2500, 'Client Visit Hyderabad',          'Approved'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM employees WHERE employee_code='EMP0002'), 'EXP2026002', '2026-05-15', 'Food',     1200, 'Business Meeting',                 'Approved'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM employees WHERE employee_code='EMP0003'), 'EXP2026003', '2026-05-18', 'Internet',  999, 'WFH Internet Reimbursement',       'Pending'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM employees WHERE employee_code='EMP0004'), 'EXP2026004', '2026-05-20', 'Travel',   4200, 'Customer Visit',                   'Approved'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM employees WHERE employee_code='EMP0005'), 'EXP2026005', '2026-05-22', 'Hotel',    6500, 'Outstation Meeting',               'Pending');
