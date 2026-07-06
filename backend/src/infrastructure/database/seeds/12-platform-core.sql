-- =====================================================
-- 12-platform-core.sql  ·  UUID() / NOW() edition
-- helpdesk_tickets, ticket_comments, notifications, audit_logs, login_logs
-- =====================================================

-- HELPDESK TICKETS
INSERT INTO helpdesk_tickets (id, tenant_id, ticket_code, requester_id, assignee_id, category, priority, subject, description, status) VALUES
(UUID(),
 (SELECT id FROM tenants WHERE tenant_code = 'FYND'),
 'TKT2026001',
 (SELECT id FROM users WHERE email = 'employee@fyndyne.com'),
 (SELECT id FROM users WHERE email = 'hr@fyndyne.com'),
 'Payroll', 'High', 'Salary Not Credited',
 'Salary not credited for current month.', 'Open'),
(UUID(),
 (SELECT id FROM tenants WHERE tenant_code = 'FYND'),
 'TKT2026002',
 (SELECT id FROM users WHERE email = 'employee@fyndyne.com'),
 (SELECT id FROM users WHERE email = 'hr@fyndyne.com'),
 'Attendance', 'Medium', 'Attendance Missing',
 'Attendance record missing for one day.', 'In Progress'),
(UUID(),
 (SELECT id FROM tenants WHERE tenant_code = 'FYND'),
 'TKT2026003',
 (SELECT id FROM users WHERE email = 'employee@fyndyne.com'),
 (SELECT id FROM users WHERE email = 'hr@fyndyne.com'),
 'IT Support', 'Low', 'VPN Access Request',
 'Need VPN access for remote work.', 'Resolved');

-- TICKET COMMENTS
INSERT INTO ticket_comments (id, ticket_id, user_id, comment, is_internal) VALUES
(UUID(),
 (SELECT id FROM helpdesk_tickets WHERE ticket_code = 'TKT2026001'),
 (SELECT id FROM users WHERE email = 'hr@fyndyne.com'),
 'Payroll team notified.', 0),
(UUID(),
 (SELECT id FROM helpdesk_tickets WHERE ticket_code = 'TKT2026001'),
 (SELECT id FROM users WHERE email = 'hr@fyndyne.com'),
 'Waiting for finance confirmation.', 1),
(UUID(),
 (SELECT id FROM helpdesk_tickets WHERE ticket_code = 'TKT2026003'),
 (SELECT id FROM users WHERE email = 'hr@fyndyne.com'),
 'VPN access granted successfully.', 0);

-- NOTIFICATIONS
INSERT INTO notifications (id, tenant_id, user_id, type, title, body, is_read) VALUES
(UUID(),
 (SELECT id FROM tenants WHERE tenant_code = 'FYND'),
 (SELECT id FROM users WHERE email = 'employee@fyndyne.com'),
 'Leave', 'Leave Approved', 'Your leave request has been approved.', 1),
(UUID(),
 (SELECT id FROM tenants WHERE tenant_code = 'FYND'),
 (SELECT id FROM users WHERE email = 'employee@fyndyne.com'),
 'Payroll', 'Payslip Available', 'Your May 2026 payslip is available.', 0),
(UUID(),
 (SELECT id FROM tenants WHERE tenant_code = 'FYND'),
 (SELECT id FROM users WHERE email = 'manager@fyndyne.com'),
 'Performance', 'Review Pending', 'Complete employee reviews before deadline.', 0);

-- AUDIT LOGS
INSERT INTO audit_logs (id, tenant_id, user_id, module, action, entity_type, entity_id, ip_address) VALUES
(UUID(),
 (SELECT id FROM tenants WHERE tenant_code = 'FYND'),
 (SELECT id FROM users WHERE email = 'hr@fyndyne.com'),
 'Employee', 'Create', 'Employee',
 (SELECT id FROM employees WHERE employee_code = 'EMP0001'),
 '192.168.1.10'),
(UUID(),
 (SELECT id FROM tenants WHERE tenant_code = 'FYND'),
 (SELECT id FROM users WHERE email = 'hr@fyndyne.com'),
 'Leave', 'Approve', 'LeaveApplication', 'la-001', '192.168.1.10'),
(UUID(),
 (SELECT id FROM tenants WHERE tenant_code = 'FYND'),
 (SELECT id FROM users WHERE email = 'admin@fyndyne.com'),
 'Payroll', 'Process', 'PayrollRun',
 (SELECT id FROM payroll_runs WHERE run_code = 'MAY2026'),
 '192.168.1.11');

-- LOGIN LOGS
INSERT INTO login_logs (id, user_id, email, status, ip_address, location, device_info) VALUES
(UUID(), (SELECT id FROM users WHERE email = 'admin@fyndyne.com'),    'admin@fyndyne.com',    'Success', '192.168.1.1', 'Hyderabad', 'Chrome Windows'),
(UUID(), (SELECT id FROM users WHERE email = 'hr@fyndyne.com'),       'hr@fyndyne.com',       'Success', '192.168.1.2', 'Hyderabad', 'Edge Windows'),
(UUID(), (SELECT id FROM users WHERE email = 'employee@fyndyne.com'), 'employee@fyndyne.com', 'Failed',  '192.168.1.5', 'Bangalore', 'Chrome Android');
