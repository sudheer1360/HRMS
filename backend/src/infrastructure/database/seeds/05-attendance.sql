-- =====================================================
-- 05-attendance.sql  ·  UUID() / NOW() edition
-- attendance_locks, attendance_logs, attendance_correction_requests
-- =====================================================

-- ATTENDANCE LOCK (May 2026, comp FYT001, locked by HR admin)
INSERT INTO attendance_locks (id, tenant_id, company_id, period_start, period_end, locked_by) VALUES
(UUID(),
 (SELECT id FROM tenants   WHERE tenant_code  = 'FYND'),
 (SELECT id FROM companies WHERE company_code = 'FYT001'),
 '2026-05-01', '2026-05-31',
 (SELECT id FROM users WHERE email = 'hr@fyndyne.com'));

-- ATTENDANCE LOGS — EMP0001
INSERT INTO attendance_logs (id, tenant_id, employee_id, attendance_date, in_time, out_time, total_hours, status, source) VALUES
(UUID(), (SELECT id FROM tenants WHERE tenant_code = 'FYND'), (SELECT id FROM employees WHERE employee_code = 'EMP0001'), '2026-05-01', '2026-05-01 09:03:00', '2026-05-01 18:12:00', 9.15, 'Present',    'Biometric'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code = 'FYND'), (SELECT id FROM employees WHERE employee_code = 'EMP0001'), '2026-05-02', '2026-05-02 09:08:00', '2026-05-02 18:05:00', 8.95, 'Present',    'Biometric'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code = 'FYND'), (SELECT id FROM employees WHERE employee_code = 'EMP0001'), '2026-05-03', NULL,                  NULL,                  0,    'Weekly Off', 'System'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code = 'FYND'), (SELECT id FROM employees WHERE employee_code = 'EMP0001'), '2026-05-04', '2026-05-04 09:35:00', '2026-05-04 18:20:00', 8.75, 'Late',       'Biometric'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code = 'FYND'), (SELECT id FROM employees WHERE employee_code = 'EMP0001'), '2026-05-05', '2026-05-05 09:00:00', '2026-05-05 18:00:00', 9.00, 'Present',    'Biometric');

-- ATTENDANCE LOGS — EMP0002
INSERT INTO attendance_logs (id, tenant_id, employee_id, attendance_date, in_time, out_time, total_hours, status, source) VALUES
(UUID(), (SELECT id FROM tenants WHERE tenant_code = 'FYND'), (SELECT id FROM employees WHERE employee_code = 'EMP0002'), '2026-05-01', '2026-05-01 09:01:00', '2026-05-01 18:00:00', 8.98, 'Present',    'Biometric'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code = 'FYND'), (SELECT id FROM employees WHERE employee_code = 'EMP0002'), '2026-05-02', '2026-05-02 09:04:00', '2026-05-02 18:03:00', 8.99, 'Present',    'Biometric'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code = 'FYND'), (SELECT id FROM employees WHERE employee_code = 'EMP0002'), '2026-05-03', NULL,                  NULL,                  0,    'Weekly Off', 'System'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code = 'FYND'), (SELECT id FROM employees WHERE employee_code = 'EMP0002'), '2026-05-04', NULL,                  NULL,                  0,    'Leave',      'System'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code = 'FYND'), (SELECT id FROM employees WHERE employee_code = 'EMP0002'), '2026-05-05', '2026-05-05 09:02:00', '2026-05-05 18:10:00', 9.13, 'Present',    'Biometric');

-- ATTENDANCE LOGS — EMP0003
INSERT INTO attendance_logs (id, tenant_id, employee_id, attendance_date, in_time, out_time, total_hours, status, source) VALUES
(UUID(), (SELECT id FROM tenants WHERE tenant_code = 'FYND'), (SELECT id FROM employees WHERE employee_code = 'EMP0003'), '2026-05-01', '2026-05-01 08:58:00', '2026-05-01 18:01:00', 9.05, 'Present',    'Biometric'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code = 'FYND'), (SELECT id FROM employees WHERE employee_code = 'EMP0003'), '2026-05-02', '2026-05-02 09:10:00', '2026-05-02 18:00:00', 8.83, 'Present',    'Biometric'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code = 'FYND'), (SELECT id FROM employees WHERE employee_code = 'EMP0003'), '2026-05-03', NULL,                  NULL,                  0,    'Weekly Off', 'System'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code = 'FYND'), (SELECT id FROM employees WHERE employee_code = 'EMP0003'), '2026-05-04', '2026-05-04 09:55:00', '2026-05-04 18:05:00', 8.17, 'Late',       'Biometric'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code = 'FYND'), (SELECT id FROM employees WHERE employee_code = 'EMP0003'), '2026-05-05', '2026-05-05 09:00:00', '2026-05-05 18:08:00', 9.13, 'Present',    'Biometric');

-- ATTENDANCE CORRECTION REQUESTS
INSERT INTO attendance_correction_requests (id, tenant_id, employee_id, attendance_date, current_status, requested_status, reason, status) VALUES
(UUID(),
 (SELECT id FROM tenants WHERE tenant_code = 'FYND'),
 (SELECT id FROM employees WHERE employee_code = 'EMP0001'),
 '2026-05-04', 'Late', 'Present', 'Biometric machine delay', 'Approved'),
(UUID(),
 (SELECT id FROM tenants WHERE tenant_code = 'FYND'),
 (SELECT id FROM employees WHERE employee_code = 'EMP0003'),
 '2026-05-04', 'Late', 'Present', 'Client meeting outside office', 'Pending');
