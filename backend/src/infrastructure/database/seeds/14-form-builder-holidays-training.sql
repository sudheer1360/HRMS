-- =====================================================
-- 14-form-builder-holidays-training.sql  ·  UUID() / NOW() edition
-- form_templates, form_submissions, holidays, training_programs, training_enrollments
-- =====================================================

-- FORM TEMPLATES
INSERT INTO form_templates (id, tenant_id, company_id, form_code, form_name, category, description, fields_json, status) VALUES
(UUID(),
 (SELECT id FROM tenants   WHERE tenant_code  = 'FYND'),
 (SELECT id FROM companies WHERE company_code = 'FYT001'),
 'EMP_ONBOARD', 'Employee Onboarding Form', 'Employee',
 'New employee onboarding details',
 '{"fields":["name","email","department"]}', 'Published'),
(UUID(),
 (SELECT id FROM tenants   WHERE tenant_code  = 'FYND'),
 (SELECT id FROM companies WHERE company_code = 'FYT001'),
 'ASSET_REQ', 'Asset Request Form', 'Assets',
 'Request for IT assets',
 '{"fields":["asset_type","reason"]}', 'Published'),
(UUID(),
 (SELECT id FROM tenants   WHERE tenant_code  = 'FYND'),
 (SELECT id FROM companies WHERE company_code = 'FYT001'),
 'TRAVEL_REQ', 'Travel Request Form', 'Travel',
 'Business travel approval',
 '{"fields":["destination","purpose","cost"]}', 'Published');

-- FORM SUBMISSIONS
INSERT INTO form_submissions (id, tenant_id, form_template_id, submitted_by, employee_id, data_json, status) VALUES
(UUID(),
 (SELECT id FROM tenants WHERE tenant_code = 'FYND'),
 (SELECT id FROM form_templates WHERE form_code = 'EMP_ONBOARD'),
 (SELECT id FROM users     WHERE email = 'employee@fyndyne.com'),
 (SELECT id FROM employees WHERE employee_code = 'EMP0001'),
 '{"department":"Engineering"}', 'Submitted'),
(UUID(),
 (SELECT id FROM tenants WHERE tenant_code = 'FYND'),
 (SELECT id FROM form_templates WHERE form_code = 'ASSET_REQ'),
 (SELECT id FROM users     WHERE email = 'employee@fyndyne.com'),
 (SELECT id FROM employees WHERE employee_code = 'EMP0002'),
 '{"asset_type":"Laptop"}', 'Approved'),
(UUID(),
 (SELECT id FROM tenants WHERE tenant_code = 'FYND'),
 (SELECT id FROM form_templates WHERE form_code = 'TRAVEL_REQ'),
 (SELECT id FROM users     WHERE email = 'employee@fyndyne.com'),
 (SELECT id FROM employees WHERE employee_code = 'EMP0003'),
 '{"destination":"Mumbai"}', 'Pending');

-- HOLIDAYS (2026)
INSERT INTO holidays (id, tenant_id, company_id, holiday_name, holiday_date, holiday_type, year) VALUES
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM companies WHERE company_code='FYT001'), 'New Year',        '2026-01-01', 'National', 2026),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM companies WHERE company_code='FYT001'), 'Republic Day',    '2026-01-26', 'National', 2026),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM companies WHERE company_code='FYT001'), 'Independence Day','2026-08-15', 'National', 2026),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM companies WHERE company_code='FYT001'), 'Gandhi Jayanti',  '2026-10-02', 'National', 2026),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM companies WHERE company_code='FYT001'), 'Christmas',       '2026-12-25', 'National', 2026),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM companies WHERE company_code='FYT001'), 'Holi',            '2026-03-02', 'National', 2026),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM companies WHERE company_code='FYT001'), 'Diwali',          '2026-10-20', 'National', 2026),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM companies WHERE company_code='FYT001'), 'Eid ul-Fitr',     '2026-03-31', 'National', 2026),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM companies WHERE company_code='FYT001'), 'Ugadi',           '2026-03-20', 'Regional', 2026),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM companies WHERE company_code='FYT001'), 'Dussehra',        '2026-10-09', 'National', 2026);

-- TRAINING PROGRAMS
INSERT INTO training_programs (id, tenant_id, company_id, program_code, program_name, category, vendor, mode, duration_days, status) VALUES
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM companies WHERE company_code='FYT001'), 'TRN001', 'React Advanced',           'Technical',  'Udemy',    'Online',    5, 'Completed'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM companies WHERE company_code='FYT001'), 'TRN002', 'AWS Cloud Practitioner',   'Cloud',      'AWS',      'Online',    3, 'Completed'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM companies WHERE company_code='FYT001'), 'TRN003', 'Leadership Program',       'Management', 'Internal', 'Classroom', 2, 'Planned'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM companies WHERE company_code='FYT001'), 'TRN004', 'Node.js Fundamentals',     'Technical',  'Udemy',    'Online',    3, 'Planned'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM companies WHERE company_code='FYT001'), 'TRN005', 'MySQL Performance Tuning', 'Technical',  'Internal', 'Online',    2, 'Planned');

-- TRAINING ENROLLMENTS
INSERT INTO training_enrollments (id, tenant_id, program_id, employee_id, status, attendance, score) VALUES
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'),
 (SELECT id FROM training_programs WHERE program_code='TRN001'),
 (SELECT id FROM employees WHERE employee_code='EMP0001'),
 'Completed', 100, 92),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'),
 (SELECT id FROM training_programs WHERE program_code='TRN001'),
 (SELECT id FROM employees WHERE employee_code='EMP0002'),
 'Completed', 95, 88),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'),
 (SELECT id FROM training_programs WHERE program_code='TRN002'),
 (SELECT id FROM employees WHERE employee_code='EMP0003'),
 'Completed', 100, 95),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'),
 (SELECT id FROM training_programs WHERE program_code='TRN003'),
 (SELECT id FROM employees WHERE employee_code='EMP0004'),
 'Enrolled', NULL, NULL),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'),
 (SELECT id FROM training_programs WHERE program_code='TRN004'),
 (SELECT id FROM employees WHERE employee_code='EMP0005'),
 'Enrolled', NULL, NULL);
