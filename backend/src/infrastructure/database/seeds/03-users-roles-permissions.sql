-- =====================================================
-- 03-users-roles-permissions.sql  ·  UUID() / NOW() edition
-- permissions, roles, role_permissions, users, user_roles
-- =====================================================

-- PERMISSIONS
INSERT INTO permissions (id, code, module, action, description) VALUES
(UUID(), 'employee.view',       'Employee',   'View',   'View Employees'),
(UUID(), 'employee.create',     'Employee',   'Create', 'Create Employee'),
(UUID(), 'employee.update',     'Employee',   'Update', 'Update Employee'),
(UUID(), 'employee.delete',     'Employee',   'Delete', 'Delete Employee'),
(UUID(), 'attendance.view',     'Attendance', 'View',   'View Attendance'),
(UUID(), 'attendance.manage',   'Attendance', 'Manage', 'Manage Attendance'),
(UUID(), 'leave.view',          'Leave',      'View',   'View Leave'),
(UUID(), 'leave.manage',        'Leave',      'Manage', 'Manage Leave'),
(UUID(), 'payroll.view',        'Payroll',    'View',   'View Payroll'),
(UUID(), 'payroll.manage',      'Payroll',    'Manage', 'Manage Payroll'),
(UUID(), 'recruitment.view',    'Recruitment','View',   'View Recruitment'),
(UUID(), 'recruitment.manage',  'Recruitment','Manage', 'Manage Recruitment'),
(UUID(), 'assets.view',         'Assets',     'View',   'View Assets'),
(UUID(), 'assets.manage',       'Assets',     'Manage', 'Manage Assets'),
(UUID(), 'reports.view',        'Reports',    'View',   'View Reports'),
(UUID(), 'settings.manage',     'Settings',   'Manage', 'Manage Settings'),
(UUID(), 'branch.view',         'Branch',     'View',   'View Branches'),
(UUID(), 'branch.manage',       'Branch',     'Manage', 'Manage Branches'),
(UUID(), 'company.view',        'Company',    'View',   'View Companies'),
(UUID(), 'company.manage',      'Company',    'Manage', 'Manage Companies');

-- ROLES
INSERT INTO roles (id, tenant_id, name, description, is_system) VALUES
(UUID(), (SELECT id FROM tenants WHERE tenant_code = 'FYND'), 'Super Admin', 'Full System Access',  1),
(UUID(), (SELECT id FROM tenants WHERE tenant_code = 'FYND'), 'HR Admin',    'HR Operations',       1),
(UUID(), (SELECT id FROM tenants WHERE tenant_code = 'FYND'), 'Manager',     'Department Manager',  1),
(UUID(), (SELECT id FROM tenants WHERE tenant_code = 'FYND'), 'Employee',    'Regular Employee',    1);

-- ROLE PERMISSIONS — Super Admin (all permissions)
INSERT INTO role_permissions (id, role_id, permission_id) VALUES
(UUID(), (SELECT id FROM roles WHERE name = 'Super Admin'), (SELECT id FROM permissions WHERE code = 'employee.view')),
(UUID(), (SELECT id FROM roles WHERE name = 'Super Admin'), (SELECT id FROM permissions WHERE code = 'employee.create')),
(UUID(), (SELECT id FROM roles WHERE name = 'Super Admin'), (SELECT id FROM permissions WHERE code = 'employee.update')),
(UUID(), (SELECT id FROM roles WHERE name = 'Super Admin'), (SELECT id FROM permissions WHERE code = 'employee.delete')),
(UUID(), (SELECT id FROM roles WHERE name = 'Super Admin'), (SELECT id FROM permissions WHERE code = 'attendance.view')),
(UUID(), (SELECT id FROM roles WHERE name = 'Super Admin'), (SELECT id FROM permissions WHERE code = 'attendance.manage')),
(UUID(), (SELECT id FROM roles WHERE name = 'Super Admin'), (SELECT id FROM permissions WHERE code = 'leave.view')),
(UUID(), (SELECT id FROM roles WHERE name = 'Super Admin'), (SELECT id FROM permissions WHERE code = 'leave.manage')),
(UUID(), (SELECT id FROM roles WHERE name = 'Super Admin'), (SELECT id FROM permissions WHERE code = 'payroll.view')),
(UUID(), (SELECT id FROM roles WHERE name = 'Super Admin'), (SELECT id FROM permissions WHERE code = 'payroll.manage')),
(UUID(), (SELECT id FROM roles WHERE name = 'Super Admin'), (SELECT id FROM permissions WHERE code = 'recruitment.view')),
(UUID(), (SELECT id FROM roles WHERE name = 'Super Admin'), (SELECT id FROM permissions WHERE code = 'recruitment.manage')),
(UUID(), (SELECT id FROM roles WHERE name = 'Super Admin'), (SELECT id FROM permissions WHERE code = 'assets.view')),
(UUID(), (SELECT id FROM roles WHERE name = 'Super Admin'), (SELECT id FROM permissions WHERE code = 'assets.manage')),
(UUID(), (SELECT id FROM roles WHERE name = 'Super Admin'), (SELECT id FROM permissions WHERE code = 'reports.view')),
(UUID(), (SELECT id FROM roles WHERE name = 'Super Admin'), (SELECT id FROM permissions WHERE code = 'settings.manage')),
(UUID(), (SELECT id FROM roles WHERE name = 'Super Admin'), (SELECT id FROM permissions WHERE code = 'branch.view')),
(UUID(), (SELECT id FROM roles WHERE name = 'Super Admin'), (SELECT id FROM permissions WHERE code = 'branch.manage')),
(UUID(), (SELECT id FROM roles WHERE name = 'Super Admin'), (SELECT id FROM permissions WHERE code = 'company.view')),
(UUID(), (SELECT id FROM roles WHERE name = 'Super Admin'), (SELECT id FROM permissions WHERE code = 'company.manage'));

-- ROLE PERMISSIONS — HR Admin
INSERT INTO role_permissions (id, role_id, permission_id) VALUES
(UUID(), (SELECT id FROM roles WHERE name = 'HR Admin'), (SELECT id FROM permissions WHERE code = 'employee.view')),
(UUID(), (SELECT id FROM roles WHERE name = 'HR Admin'), (SELECT id FROM permissions WHERE code = 'employee.create')),
(UUID(), (SELECT id FROM roles WHERE name = 'HR Admin'), (SELECT id FROM permissions WHERE code = 'employee.update')),
(UUID(), (SELECT id FROM roles WHERE name = 'HR Admin'), (SELECT id FROM permissions WHERE code = 'attendance.view')),
(UUID(), (SELECT id FROM roles WHERE name = 'HR Admin'), (SELECT id FROM permissions WHERE code = 'attendance.manage')),
(UUID(), (SELECT id FROM roles WHERE name = 'HR Admin'), (SELECT id FROM permissions WHERE code = 'leave.view')),
(UUID(), (SELECT id FROM roles WHERE name = 'HR Admin'), (SELECT id FROM permissions WHERE code = 'leave.manage')),
(UUID(), (SELECT id FROM roles WHERE name = 'HR Admin'), (SELECT id FROM permissions WHERE code = 'recruitment.view')),
(UUID(), (SELECT id FROM roles WHERE name = 'HR Admin'), (SELECT id FROM permissions WHERE code = 'recruitment.manage')),
(UUID(), (SELECT id FROM roles WHERE name = 'HR Admin'), (SELECT id FROM permissions WHERE code = 'reports.view'));

-- ROLE PERMISSIONS — Manager
INSERT INTO role_permissions (id, role_id, permission_id) VALUES
(UUID(), (SELECT id FROM roles WHERE name = 'Manager'), (SELECT id FROM permissions WHERE code = 'employee.view')),
(UUID(), (SELECT id FROM roles WHERE name = 'Manager'), (SELECT id FROM permissions WHERE code = 'attendance.view')),
(UUID(), (SELECT id FROM roles WHERE name = 'Manager'), (SELECT id FROM permissions WHERE code = 'leave.view')),
(UUID(), (SELECT id FROM roles WHERE name = 'Manager'), (SELECT id FROM permissions WHERE code = 'recruitment.view')),
(UUID(), (SELECT id FROM roles WHERE name = 'Manager'), (SELECT id FROM permissions WHERE code = 'reports.view'));

-- ROLE PERMISSIONS — Employee
INSERT INTO role_permissions (id, role_id, permission_id) VALUES
(UUID(), (SELECT id FROM roles WHERE name = 'Employee'), (SELECT id FROM permissions WHERE code = 'employee.view')),
(UUID(), (SELECT id FROM roles WHERE name = 'Employee'), (SELECT id FROM permissions WHERE code = 'attendance.view')),
(UUID(), (SELECT id FROM roles WHERE name = 'Employee'), (SELECT id FROM permissions WHERE code = 'leave.view'));

-- USERS  (password_hash replaced at runtime by seed runner)
INSERT INTO users (id, tenant_id, email, password_hash, full_name, is_active) VALUES
(UUID(), (SELECT id FROM tenants WHERE tenant_code = 'FYND'), 'admin@fyndyne.com',    '$2b$10$AdminPasswordHash',    'System Administrator', 1),
(UUID(), (SELECT id FROM tenants WHERE tenant_code = 'FYND'), 'hr@fyndyne.com',       '$2b$10$HRPasswordHash',       'HR Administrator',     1),
(UUID(), (SELECT id FROM tenants WHERE tenant_code = 'FYND'), 'manager@fyndyne.com',  '$2b$10$ManagerPasswordHash',  'Engineering Manager',  1),
(UUID(), (SELECT id FROM tenants WHERE tenant_code = 'FYND'), 'employee@fyndyne.com', '$2b$10$EmployeePasswordHash', 'Demo Employee',        1);

-- USER ROLES
INSERT INTO user_roles (id, user_id, role_id) VALUES
(UUID(), (SELECT id FROM users WHERE email = 'admin@fyndyne.com'),    (SELECT id FROM roles WHERE name = 'Super Admin')),
(UUID(), (SELECT id FROM users WHERE email = 'hr@fyndyne.com'),       (SELECT id FROM roles WHERE name = 'HR Admin')),
(UUID(), (SELECT id FROM users WHERE email = 'manager@fyndyne.com'),  (SELECT id FROM roles WHERE name = 'Manager')),
(UUID(), (SELECT id FROM users WHERE email = 'employee@fyndyne.com'), (SELECT id FROM roles WHERE name = 'Employee'));
