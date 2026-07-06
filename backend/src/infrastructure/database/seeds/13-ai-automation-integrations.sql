-- =====================================================
-- 13-ai-automation-integrations.sql  ·  UUID() / NOW() edition
-- ai_conversations, automation_workflows, report_definitions, api_keys, webhook_configs
-- =====================================================

-- AI CONVERSATIONS
INSERT INTO ai_conversations (id, tenant_id, user_id, query, response, confidence, feedback) VALUES
(UUID(),
 (SELECT id FROM tenants WHERE tenant_code = 'FYND'),
 (SELECT id FROM users WHERE email = 'employee@fyndyne.com'),
 'How many leave days do I have remaining?',
 'You currently have 15 Casual Leave days remaining.',
 0.97, 'Positive'),
(UUID(),
 (SELECT id FROM tenants WHERE tenant_code = 'FYND'),
 (SELECT id FROM users WHERE email = 'manager@fyndyne.com'),
 'Show pending performance reviews.',
 'There are 24 pending performance reviews.',
 0.95, 'Positive'),
(UUID(),
 (SELECT id FROM tenants WHERE tenant_code = 'FYND'),
 (SELECT id FROM users WHERE email = 'hr@fyndyne.com'),
 'Generate attendance summary.',
 'Attendance report generated successfully.',
 0.99, 'Positive');

-- AUTOMATION WORKFLOWS
INSERT INTO automation_workflows (id, tenant_id, workflow_name, trigger_event, actions_json, is_active, run_count) VALUES
(UUID(),
 (SELECT id FROM tenants WHERE tenant_code = 'FYND'),
 'Auto Leave Approval',  'leave_application_created', '{"action":"notify_manager"}',      1, 125),
(UUID(),
 (SELECT id FROM tenants WHERE tenant_code = 'FYND'),
 'Employee Onboarding',  'employee_created',           '{"action":"create_user_account"}', 1,  78),
(UUID(),
 (SELECT id FROM tenants WHERE tenant_code = 'FYND'),
 'Payroll Notification', 'payroll_processed',          '{"action":"send_payslip"}',        1,  24);

-- REPORT DEFINITIONS
INSERT INTO report_definitions (id, tenant_id, report_name, module, query_config) VALUES
(UUID(), (SELECT id FROM tenants WHERE tenant_code = 'FYND'), 'Employee Master Report',    'Employee',  '{"table":"employees"}'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code = 'FYND'), 'Attendance Monthly Report', 'Attendance','{"table":"attendance_logs"}'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code = 'FYND'), 'Payroll Summary Report',    'Payroll',   '{"table":"payroll_payslips"}');

-- API KEYS
INSERT INTO api_keys (id, tenant_id, key_name, prefix, key_hash, is_active) VALUES
(UUID(), (SELECT id FROM tenants WHERE tenant_code = 'FYND'), 'HRMS Integration Key', 'HRMS', 'SHA256_HASH_SAMPLE_001', 1),
(UUID(), (SELECT id FROM tenants WHERE tenant_code = 'FYND'), 'Payroll Service Key',  'PAY',  'SHA256_HASH_SAMPLE_002', 1);

-- WEBHOOK CONFIGS
INSERT INTO webhook_configs (id, tenant_id, webhook_name, url, events, is_active) VALUES
(UUID(), (SELECT id FROM tenants WHERE tenant_code = 'FYND'), 'Employee Created Webhook', 'https://api.fyndyne.com/webhooks/employees', '["employee.created"]', 1),
(UUID(), (SELECT id FROM tenants WHERE tenant_code = 'FYND'), 'Leave Approved Webhook',   'https://api.fyndyne.com/webhooks/leaves',    '["leave.approved"]',   1);
