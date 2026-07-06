-- =====================================================
-- 09-performance-management.sql  ·  UUID() / NOW() edition
-- performance_cycles, performance_reviews
-- =====================================================

-- PERFORMANCE CYCLES
INSERT INTO performance_cycles (id, tenant_id, company_id, cycle_name, cycle_type, period_start, period_end, self_review_deadline, manager_review_deadline, status, created_by) VALUES
(UUID(),
 (SELECT id FROM tenants   WHERE tenant_code  = 'FYND'),
 (SELECT id FROM companies WHERE company_code = 'FYT001'),
 '2025 H1 Review', 'Half-Yearly', '2025-01-01', '2025-06-30', '2025-07-05', '2025-07-15', 'Completed',
 (SELECT id FROM users WHERE email = 'hr@fyndyne.com')),
(UUID(),
 (SELECT id FROM tenants   WHERE tenant_code  = 'FYND'),
 (SELECT id FROM companies WHERE company_code = 'FYT001'),
 '2025 H2 Review', 'Half-Yearly', '2025-07-01', '2025-12-31', '2026-01-05', '2026-01-15', 'Completed',
 (SELECT id FROM users WHERE email = 'hr@fyndyne.com')),
(UUID(),
 (SELECT id FROM tenants   WHERE tenant_code  = 'FYND'),
 (SELECT id FROM companies WHERE company_code = 'FYT001'),
 '2026 H1 Review', 'Half-Yearly', '2026-01-01', '2026-06-30', '2026-07-05', '2026-07-15', 'In Progress',
 (SELECT id FROM users WHERE email = 'hr@fyndyne.com'));

-- PERFORMANCE REVIEWS — detailed
INSERT INTO performance_reviews (id, tenant_id, cycle_id, employee_id, reviewer_id, self_rating, self_comments, manager_rating, manager_comments, final_rating, status) VALUES
(UUID(),
 (SELECT id FROM tenants WHERE tenant_code = 'FYND'),
 (SELECT id FROM performance_cycles WHERE cycle_name = '2026 H1 Review'),
 (SELECT id FROM employees WHERE employee_code = 'EMP0001'),
 (SELECT id FROM users     WHERE email = 'manager@fyndyne.com'),
 4.5, 'Delivered all sprint goals successfully.',
 4.2, 'Excellent backend ownership and delivery.',
 4.3, 'Completed'),
(UUID(),
 (SELECT id FROM tenants WHERE tenant_code = 'FYND'),
 (SELECT id FROM performance_cycles WHERE cycle_name = '2026 H1 Review'),
 (SELECT id FROM employees WHERE employee_code = 'EMP0002'),
 (SELECT id FROM users     WHERE email = 'manager@fyndyne.com'),
 4.0, 'Improved frontend performance significantly.',
 4.1, 'Strong contributor and team player.',
 4.1, 'Completed'),
(UUID(),
 (SELECT id FROM tenants WHERE tenant_code = 'FYND'),
 (SELECT id FROM performance_cycles WHERE cycle_name = '2026 H1 Review'),
 (SELECT id FROM employees WHERE employee_code = 'EMP0003'),
 (SELECT id FROM users     WHERE email = 'manager@fyndyne.com'),
 4.8, 'Led architecture modernization initiative.',
 4.7, 'Outstanding technical leadership.',
 4.8, 'Completed');

-- PERFORMANCE REVIEWS — summary only
INSERT INTO performance_reviews (id, tenant_id, cycle_id, employee_id, reviewer_id, final_rating, status) VALUES
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM performance_cycles WHERE cycle_name='2026 H1 Review'), (SELECT id FROM employees WHERE employee_code='EMP0004'), (SELECT id FROM users WHERE email='manager@fyndyne.com'), 3.8, 'Completed'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM performance_cycles WHERE cycle_name='2026 H1 Review'), (SELECT id FROM employees WHERE employee_code='EMP0005'), (SELECT id FROM users WHERE email='manager@fyndyne.com'), 4.6, 'Completed'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM performance_cycles WHERE cycle_name='2026 H1 Review'), (SELECT id FROM employees WHERE employee_code='EMP0006'), (SELECT id FROM users WHERE email='manager@fyndyne.com'), 4.1, 'Completed'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM performance_cycles WHERE cycle_name='2026 H1 Review'), (SELECT id FROM employees WHERE employee_code='EMP0007'), (SELECT id FROM users WHERE email='manager@fyndyne.com'), 3.9, 'Completed'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM performance_cycles WHERE cycle_name='2026 H1 Review'), (SELECT id FROM employees WHERE employee_code='EMP0008'), (SELECT id FROM users WHERE email='manager@fyndyne.com'), 4.4, 'Completed');
