-- ============================================================
-- CLEAN UUID SEED — replaces legacy comp-001/br-021 style IDs
-- Usage: mysql -u root -p hrms < 15-clean-uuid-seed.sql
--        OR: run `npm run db:seed-clean` (see package.json)
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Truncate in safe order (children before parents)
TRUNCATE TABLE employee_status_logs;
TRUNCATE TABLE employee_documents;
TRUNCATE TABLE employee_family;
TRUNCATE TABLE employee_banks;
TRUNCATE TABLE employee_statutory;
TRUNCATE TABLE employees;
TRUNCATE TABLE cost_centers;
TRUNCATE TABLE designations;
TRUNCATE TABLE departments;
TRUNCATE TABLE grades;
TRUNCATE TABLE branches;
TRUNCATE TABLE companies;
TRUNCATE TABLE tenants;
TRUNCATE TABLE user_roles;
TRUNCATE TABLE users;
TRUNCATE TABLE role_permissions;
TRUNCATE TABLE permissions;
TRUNCATE TABLE roles;

SET FOREIGN_KEY_CHECKS = 1;

-- ── Define reusable UUID variables ────────────────────────────────────────────
-- Tenant
SET @tenant    = '00000001-0000-4000-8000-000000000001';

-- Companies
SET @comp1     = '10000001-0000-4000-8000-000000000001'; -- Fyndyne Technologies
SET @comp2     = '10000002-0000-4000-8000-000000000001'; -- Fyndyne Retail
SET @comp3     = '10000003-0000-4000-8000-000000000001'; -- Fyndyne Logistics
SET @comp4     = '10000004-0000-4000-8000-000000000001'; -- Fyndyne Manufacturing
SET @comp5     = '10000005-0000-4000-8000-000000000001'; -- Fyndyne Global

-- Branches (comp5 - Fyndyne Global, primary for UI)
SET @br5_1     = '20000501-0000-4000-8000-000000000001'; -- Mumbai HO
SET @br5_2     = '20000502-0000-4000-8000-000000000001'; -- Thane Branch
SET @br5_3     = '20000503-0000-4000-8000-000000000001'; -- Navi Mumbai Branch
SET @br5_4     = '20000504-0000-4000-8000-000000000001'; -- Pune Global Office
SET @br5_5     = '20000505-0000-4000-8000-000000000001'; -- Delhi Branch

-- Branches (comp1 - Fyndyne Technologies)
SET @br1_1     = '20000101-0000-4000-8000-000000000001'; -- Hyderabad HO
SET @br1_2     = '20000102-0000-4000-8000-000000000001'; -- Secunderabad Branch

-- Grades (comp5)
SET @g5_01     = '30000501-0000-4000-8000-000000000001';
SET @g5_02     = '30000502-0000-4000-8000-000000000001';
SET @g5_03     = '30000503-0000-4000-8000-000000000001';
SET @g5_04     = '30000504-0000-4000-8000-000000000001';
SET @g5_05     = '30000505-0000-4000-8000-000000000001';
SET @g5_06     = '30000506-0000-4000-8000-000000000001';
SET @g5_07     = '30000507-0000-4000-8000-000000000001';
SET @g5_08     = '30000508-0000-4000-8000-000000000001';

-- Grades (comp1)
SET @g1_01     = '30000101-0000-4000-8000-000000000001';
SET @g1_02     = '30000102-0000-4000-8000-000000000001';
SET @g1_03     = '30000103-0000-4000-8000-000000000001';
SET @g1_04     = '30000104-0000-4000-8000-000000000001';
SET @g1_05     = '30000105-0000-4000-8000-000000000001';

-- Departments (comp5)
SET @d5_hr     = '40000501-0000-4000-8000-000000000001';
SET @d5_fin    = '40000502-0000-4000-8000-000000000001';
SET @d5_eng    = '40000503-0000-4000-8000-000000000001';
SET @d5_sal    = '40000504-0000-4000-8000-000000000001';
SET @d5_mkt    = '40000505-0000-4000-8000-000000000001';
SET @d5_ops    = '40000506-0000-4000-8000-000000000001';
SET @d5_sup    = '40000507-0000-4000-8000-000000000001';
SET @d5_pm     = '40000508-0000-4000-8000-000000000001';
SET @d5_tech   = '40000509-0000-4000-8000-000000000001';
SET @d5_lgl    = '40000510-0000-4000-8000-000000000001';

-- Designations (comp5)
SET @des5_01   = '50000501-0000-4000-8000-000000000001'; -- Intern
SET @des5_02   = '50000502-0000-4000-8000-000000000001'; -- Executive
SET @des5_03   = '50000503-0000-4000-8000-000000000001'; -- Senior Executive
SET @des5_04   = '50000504-0000-4000-8000-000000000001'; -- Engineer
SET @des5_05   = '50000505-0000-4000-8000-000000000001'; -- Senior Engineer
SET @des5_06   = '50000506-0000-4000-8000-000000000001'; -- Team Lead
SET @des5_07   = '50000507-0000-4000-8000-000000000001'; -- Assistant Manager
SET @des5_08   = '50000508-0000-4000-8000-000000000001'; -- Manager
SET @des5_09   = '50000509-0000-4000-8000-000000000001'; -- Senior Manager
SET @des5_10   = '50000510-0000-4000-8000-000000000001'; -- Director
SET @des5_11   = '50000511-0000-4000-8000-000000000001'; -- Vice President
SET @des5_12   = '50000512-0000-4000-8000-000000000001'; -- CEO

-- Cost Centers (comp5)
SET @cc5_01    = '60000501-0000-4000-8000-000000000001';
SET @cc5_02    = '60000502-0000-4000-8000-000000000001';
SET @cc5_03    = '60000503-0000-4000-8000-000000000001';
SET @cc5_04    = '60000504-0000-4000-8000-000000000001';
SET @cc5_05    = '60000505-0000-4000-8000-000000000001';
SET @cc5_06    = '60000506-0000-4000-8000-000000000001';
SET @cc5_07    = '60000507-0000-4000-8000-000000000001';
SET @cc5_08    = '60000508-0000-4000-8000-000000000001';

-- Roles
SET @role_sa   = '70000001-0000-4000-8000-000000000001'; -- Super Admin
SET @role_ha   = '70000002-0000-4000-8000-000000000001'; -- HR Admin
SET @role_mgr  = '70000003-0000-4000-8000-000000000001'; -- Manager
SET @role_emp  = '70000004-0000-4000-8000-000000000001'; -- Employee

-- Users
SET @user_sa   = '80000001-0000-4000-8000-000000000001'; -- superadmin
SET @user_hr   = '80000002-0000-4000-8000-000000000001'; -- hradmin
SET @user_mgr  = '80000003-0000-4000-8000-000000000001'; -- manager

-- ── TENANT ────────────────────────────────────────────────────────────────────
INSERT INTO tenants (id, tenant_name, tenant_code, subscription_plan, status) VALUES
(@tenant, 'Fyndyne HRMS', 'FYND', 'Enterprise', 'Active');

-- ── COMPANIES ─────────────────────────────────────────────────────────────────
INSERT INTO companies (id, tenant_id, company_name, legal_name, company_code, registered_address, email, phone, status) VALUES
(@comp1, @tenant, 'Fyndyne Technologies', 'Fyndyne Technologies Pvt Ltd', 'FYT001', 'Madhapur, Hyderabad, Telangana 500081', 'info@fyndyne.com', '9000000001', 'Active'),
(@comp2, @tenant, 'Fyndyne Retail', 'Fyndyne Retail Pvt Ltd', 'FYR001', 'Electronic City, Bangalore, Karnataka 560100', 'retail@fyndyne.com', '9000000002', 'Active'),
(@comp3, @tenant, 'Fyndyne Logistics', 'Fyndyne Logistics Pvt Ltd', 'FYL001', 'OMR, Chennai, Tamil Nadu 600096', 'logistics@fyndyne.com', '9000000003', 'Active'),
(@comp4, @tenant, 'Fyndyne Manufacturing', 'Fyndyne Manufacturing Pvt Ltd', 'FYM001', 'Hinjewadi, Pune, Maharashtra 411057', 'manufacturing@fyndyne.com', '9000000004', 'Active'),
(@comp5, @tenant, 'Fyndyne Global', 'Fyndyne Global Pvt Ltd', 'FYG001', 'Andheri East, Mumbai, Maharashtra 400069', 'global@fyndyne.com', '9000000005', 'Active');

-- ── BRANCHES ──────────────────────────────────────────────────────────────────
-- comp5 — Fyndyne Global (primary in UI)
INSERT INTO branches (id, company_id, branch_name, branch_code, branch_type, address, city, state, country, pin_code, is_payroll_location, status) VALUES
(@br5_1, @comp5, 'Mumbai HO',           'MUM001', 'Head Office',      'Andheri East',    'Mumbai',     'Maharashtra', 'India', '400069', 1, 'Active'),
(@br5_2, @comp5, 'Thane Branch',        'THN001', 'Regional Office',  'Wagle Estate',    'Thane',      'Maharashtra', 'India', '400604', 1, 'Active'),
(@br5_3, @comp5, 'Navi Mumbai Branch',  'NVM001', 'Sales Office',     'Vashi',           'Navi Mumbai','Maharashtra', 'India', '400703', 1, 'Active'),
(@br5_4, @comp5, 'Pune Global Office',  'PUG001', 'Regional Office',  'Baner Road',      'Pune',       'Maharashtra', 'India', '411045', 1, 'Active'),
(@br5_5, @comp5, 'Delhi Branch',        'DEL001', 'Regional Office',  'Connaught Place', 'New Delhi',  'Delhi',       'India', '110001', 1, 'Active');

-- comp1 — Fyndyne Technologies
INSERT INTO branches (id, company_id, branch_name, branch_code, branch_type, address, city, state, country, pin_code, is_payroll_location, status) VALUES
(@br1_1, @comp1, 'Hyderabad HO',         'HYD001', 'Head Office',     'Madhapur',   'Hyderabad', 'Telangana', 'India', '500081', 1, 'Active'),
(@br1_2, @comp1, 'Secunderabad Branch',  'HYD002', 'Regional Office', 'Paradise',   'Hyderabad', 'Telangana', 'India', '500003', 1, 'Active');

-- ── GRADES ────────────────────────────────────────────────────────────────────
-- comp5
INSERT INTO grades (id, company_id, grade_name, grade_code, min_salary, max_salary, sort_order, status) VALUES
(@g5_01, @comp5, 'Grade 1 — Entry',    'G1',  200000,   400000,   1, 'Active'),
(@g5_02, @comp5, 'Grade 2 — Junior',   'G2',  400000,   600000,   2, 'Active'),
(@g5_03, @comp5, 'Grade 3 — Mid',      'G3',  600000,   900000,   3, 'Active'),
(@g5_04, @comp5, 'Grade 4 — Senior',   'G4',  900000,  1400000,   4, 'Active'),
(@g5_05, @comp5, 'Grade 5 — Lead',     'G5', 1400000,  2000000,   5, 'Active'),
(@g5_06, @comp5, 'Grade 6 — Manager',  'G6', 2000000,  3000000,   6, 'Active'),
(@g5_07, @comp5, 'Grade 7 — Director', 'G7', 3000000,  5000000,   7, 'Active'),
(@g5_08, @comp5, 'Grade 8 — C-Suite',  'G8', 5000000, 10000000,   8, 'Active');

-- comp1
INSERT INTO grades (id, company_id, grade_name, grade_code, min_salary, max_salary, sort_order, status) VALUES
(@g1_01, @comp1, 'Grade 1', 'G1',  200000,  400000, 1, 'Active'),
(@g1_02, @comp1, 'Grade 2', 'G2',  400000,  700000, 2, 'Active'),
(@g1_03, @comp1, 'Grade 3', 'G3',  700000, 1200000, 3, 'Active'),
(@g1_04, @comp1, 'Grade 4', 'G4', 1200000, 2000000, 4, 'Active'),
(@g1_05, @comp1, 'Grade 5', 'G5', 2000000, 5000000, 5, 'Active');

-- ── DEPARTMENTS ───────────────────────────────────────────────────────────────
-- comp5
INSERT INTO departments (id, company_id, branch_id, department_name, department_code, level, status) VALUES
(@d5_hr,   @comp5, @br5_1, 'Human Resources',  'HR',   1, 'Active'),
(@d5_fin,  @comp5, @br5_1, 'Finance',           'FIN',  1, 'Active'),
(@d5_eng,  @comp5, @br5_1, 'Engineering',       'ENG',  1, 'Active'),
(@d5_sal,  @comp5, @br5_1, 'Sales',             'SAL',  1, 'Active'),
(@d5_mkt,  @comp5, @br5_1, 'Marketing',         'MKT',  1, 'Active'),
(@d5_ops,  @comp5, @br5_1, 'Operations',        'OPS',  1, 'Active'),
(@d5_sup,  @comp5, @br5_2, 'Customer Support',  'SUP',  1, 'Active'),
(@d5_pm,   @comp5, @br5_2, 'Product Management','PM',   1, 'Active'),
(@d5_tech, @comp5, @br5_3, 'Technology',        'TECH', 1, 'Active'),
(@d5_lgl,  @comp5, @br5_5, 'Legal',             'LGL',  1, 'Active');

-- comp1 (minimal)
INSERT INTO departments (id, company_id, branch_id, department_name, department_code, level, status) VALUES
(UUID(), @comp1, @br1_1, 'Human Resources', 'HR',  1, 'Active'),
(UUID(), @comp1, @br1_1, 'Engineering',     'ENG', 1, 'Active'),
(UUID(), @comp1, @br1_1, 'Finance',         'FIN', 1, 'Active'),
(UUID(), @comp1, @br1_1, 'Sales',           'SAL', 1, 'Active'),
(UUID(), @comp1, @br1_1, 'Operations',      'OPS', 1, 'Active');

-- ── DESIGNATIONS ──────────────────────────────────────────────────────────────
-- comp5
INSERT INTO designations (id, company_id, grade_id, designation_name, designation_code, level, status) VALUES
(@des5_01, @comp5, @g5_01, 'Intern',              'INT',   1, 'Active'),
(@des5_02, @comp5, @g5_01, 'Executive',           'EXE',   2, 'Active'),
(@des5_03, @comp5, @g5_02, 'Senior Executive',    'SEXE',  3, 'Active'),
(@des5_04, @comp5, @g5_02, 'Engineer',            'ENG',   4, 'Active'),
(@des5_05, @comp5, @g5_03, 'Senior Engineer',     'SENG',  5, 'Active'),
(@des5_06, @comp5, @g5_03, 'Team Lead',           'TL',    6, 'Active'),
(@des5_07, @comp5, @g5_04, 'Assistant Manager',   'AM',    7, 'Active'),
(@des5_08, @comp5, @g5_05, 'Manager',             'MGR',   8, 'Active'),
(@des5_09, @comp5, @g5_06, 'Senior Manager',      'SMGR',  9, 'Active'),
(@des5_10, @comp5, @g5_07, 'Director',            'DIR',  10, 'Active'),
(@des5_11, @comp5, @g5_07, 'Vice President',      'VP',   11, 'Active'),
(@des5_12, @comp5, @g5_08, 'Chief Executive Officer', 'CEO', 12, 'Active');

-- comp1 (minimal)
INSERT INTO designations (id, company_id, designation_name, designation_code, level, status) VALUES
(UUID(), @comp1, 'Engineer',       'ENG', 1, 'Active'),
(UUID(), @comp1, 'Senior Engineer','SENG',2, 'Active'),
(UUID(), @comp1, 'Manager',        'MGR', 3, 'Active'),
(UUID(), @comp1, 'Director',       'DIR', 4, 'Active');

-- ── COST CENTERS ──────────────────────────────────────────────────────────────
-- comp5
INSERT INTO cost_centers (id, company_id, cost_center_name, cost_center_code, status) VALUES
(@cc5_01, @comp5, 'Corporate',            'CC001', 'Active'),
(@cc5_02, @comp5, 'Technology',           'CC002', 'Active'),
(@cc5_03, @comp5, 'HR Operations',        'CC003', 'Active'),
(@cc5_04, @comp5, 'Finance Operations',   'CC004', 'Active'),
(@cc5_05, @comp5, 'Sales & Marketing',    'CC005', 'Active'),
(@cc5_06, @comp5, 'Operations',           'CC006', 'Active'),
(@cc5_07, @comp5, 'Legal & Compliance',   'CC007', 'Active'),
(@cc5_08, @comp5, 'Product & Engineering','CC008', 'Active');

-- comp1
INSERT INTO cost_centers (id, company_id, cost_center_name, cost_center_code, status) VALUES
(UUID(), @comp1, 'Corporate',        'CC001', 'Active'),
(UUID(), @comp1, 'Engineering',      'CC002', 'Active'),
(UUID(), @comp1, 'HR Operations',    'CC003', 'Active'),
(UUID(), @comp1, 'Finance',          'CC004', 'Active'),
(UUID(), @comp1, 'Sales',            'CC005', 'Active');

-- ── ROLES ─────────────────────────────────────────────────────────────────────
INSERT INTO roles (id, tenant_id, role_name, role_code, description, is_system_role) VALUES
(@role_sa,  @tenant, 'Super Admin', 'SUPER_ADMIN', 'Full system access',      TRUE),
(@role_ha,  @tenant, 'HR Admin',    'HR_ADMIN',    'HR module full access',   FALSE),
(@role_mgr, @tenant, 'Manager',     'MANAGER',     'Manage team operations',  FALSE),
(@role_emp, @tenant, 'Employee',    'EMPLOYEE',    'Self-service access only', FALSE);

-- ── ROLE PERMISSIONS ──────────────────────────────────────────────────────────
-- Super Admin gets all permissions via role_code check in RBAC middleware,
-- so we only need baseline module permissions for other roles.
INSERT INTO permissions (id, module, action, description) VALUES
(UUID(), 'ORG',     'VIEW',   'View organization data'),
(UUID(), 'ORG',     'CREATE', 'Create organization records'),
(UUID(), 'ORG',     'EDIT',   'Edit organization records'),
(UUID(), 'ORG',     'DELETE', 'Delete organization records'),
(UUID(), 'EMP',     'VIEW',   'View employee data'),
(UUID(), 'EMP',     'CREATE', 'Create employees'),
(UUID(), 'EMP',     'EDIT',   'Edit employees'),
(UUID(), 'EMP',     'DELETE', 'Delete employees'),
(UUID(), 'ATTN',    'VIEW',   'View attendance'),
(UUID(), 'ATTN',    'CREATE', 'Manual attendance entry'),
(UUID(), 'ATTN',    'EDIT',   'Edit attendance'),
(UUID(), 'ATTN',    'APPROVE','Approve attendance'),
(UUID(), 'ATTN',    'LOCK',   'Lock attendance period'),
(UUID(), 'LEAVE',   'VIEW',   'View leaves'),
(UUID(), 'LEAVE',   'CREATE', 'Create leave records'),
(UUID(), 'LEAVE',   'EDIT',   'Edit leave records'),
(UUID(), 'LEAVE',   'DELETE', 'Delete leave records'),
(UUID(), 'LEAVE',   'APPROVE','Approve leave'),
(UUID(), 'PAYROLL', 'VIEW',   'View payroll'),
(UUID(), 'PAYROLL', 'CREATE', 'Create payroll'),
(UUID(), 'PAYROLL', 'RUN',    'Run payroll'),
(UUID(), 'PAYROLL', 'APPROVE','Approve payroll'),
(UUID(), 'RECR',    'VIEW',   'View recruitment'),
(UUID(), 'RECR',    'CREATE', 'Create recruitment records'),
(UUID(), 'RECR',    'EDIT',   'Edit recruitment records'),
(UUID(), 'RECR',    'DELETE', 'Delete recruitment records'),
(UUID(), 'RECR',    'APPROVE','Approve recruitment'),
(UUID(), 'PERF',    'VIEW',   'View performance'),
(UUID(), 'PERF',    'CREATE', 'Create performance records'),
(UUID(), 'PERF',    'EDIT',   'Edit performance records'),
(UUID(), 'ASSET',   'VIEW',   'View assets'),
(UUID(), 'ASSET',   'CREATE', 'Create assets'),
(UUID(), 'ASSET',   'EDIT',   'Edit assets'),
(UUID(), 'GRIEV',   'VIEW',   'View grievances'),
(UUID(), 'DISC',    'VIEW',   'View disciplinary'),
(UUID(), 'DISC',    'CREATE', 'Create disciplinary cases'),
(UUID(), 'EXIT',    'VIEW',   'View exits'),
(UUID(), 'EXIT',    'EDIT',   'Process exits');

-- ── USERS ─────────────────────────────────────────────────────────────────────
-- Passwords: 'Admin@1234' hashed with bcrypt (10 rounds)
-- Hash below is pre-computed: $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh7y
INSERT INTO users (id, tenant_id, company_id, username, email, password_hash, full_name, is_active) VALUES
(@user_sa,  @tenant, @comp5, 'superadmin', 'superadmin@fyndyne.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh7y', 'Super Admin',  TRUE),
(@user_hr,  @tenant, @comp5, 'hradmin',    'hr@fyndyne.com',         '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh7y', 'HR Admin',     TRUE),
(@user_mgr, @tenant, @comp5, 'manager1',   'manager@fyndyne.com',    '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh7y', 'John Manager', TRUE);

-- ── USER ROLES ────────────────────────────────────────────────────────────────
INSERT INTO user_roles (id, user_id, role_id) VALUES
(UUID(), @user_sa,  @role_sa),
(UUID(), @user_hr,  @role_ha),
(UUID(), @user_mgr, @role_mgr);

-- ── SAMPLE EMPLOYEES (comp5 / Fyndyne Global) ─────────────────────────────────
INSERT INTO employees (
  id, tenant_id, company_id, branch_id, department_id, designation_id, grade_id,
  employee_code, first_name, last_name, gender, date_of_birth,
  mobile, email, date_of_joining, employment_type, employment_status
) VALUES
(UUID(), @tenant, @comp5, @br5_1, @d5_hr,  @des5_08, @g5_05, 'EMP000001', 'Priya',    'Sharma',    'Female', '1988-03-12', '9800000001', 'priya.sharma@fyndyne.com',    '2020-01-15', 'Full Time', 'Active'),
(UUID(), @tenant, @comp5, @br5_1, @d5_eng, @des5_05, @g5_03, 'EMP000002', 'Rahul',    'Verma',     'Male',   '1993-07-22', '9800000002', 'rahul.verma@fyndyne.com',     '2021-03-01', 'Full Time', 'Active'),
(UUID(), @tenant, @comp5, @br5_1, @d5_fin, @des5_08, @g5_05, 'EMP000003', 'Ananya',   'Patel',     'Female', '1990-11-05', '9800000003', 'ananya.patel@fyndyne.com',    '2019-06-15', 'Full Time', 'Active'),
(UUID(), @tenant, @comp5, @br5_2, @d5_sal, @des5_06, @g5_03, 'EMP000004', 'Kiran',    'Reddy',     'Male',   '1992-02-28', '9800000004', 'kiran.reddy@fyndyne.com',     '2022-01-10', 'Full Time', 'Active'),
(UUID(), @tenant, @comp5, @br5_3, @d5_mkt, @des5_07, @g5_04, 'EMP000005', 'Sneha',    'Nair',      'Female', '1991-09-17', '9800000005', 'sneha.nair@fyndyne.com',      '2020-09-01', 'Full Time', 'Active'),
(UUID(), @tenant, @comp5, @br5_1, @d5_ops, @des5_09, @g5_06, 'EMP000006', 'Vikram',   'Singh',     'Male',   '1986-04-30', '9800000006', 'vikram.singh@fyndyne.com',    '2018-04-15', 'Full Time', 'Active'),
(UUID(), @tenant, @comp5, @br5_4, @d5_pm,  @des5_08, @g5_05, 'EMP000007', 'Deepika',  'Krishnan',  'Female', '1989-12-03', '9800000007', 'deepika.krishnan@fyndyne.com', '2019-11-01', 'Full Time', 'Active'),
(UUID(), @tenant, @comp5, @br5_5, @d5_lgl, @des5_09, @g5_06, 'EMP000008', 'Arun',     'Mehta',     'Male',   '1985-06-14', '9800000008', 'arun.mehta@fyndyne.com',      '2017-07-01', 'Full Time', 'Active'),
(UUID(), @tenant, @comp5, @br5_1, @d5_tech,@des5_10, @g5_07, 'EMP000009', 'Pooja',    'Gupta',     'Female', '1984-01-25', '9800000009', 'pooja.gupta@fyndyne.com',     '2016-02-15', 'Full Time', 'Active'),
(UUID(), @tenant, @comp5, @br5_1, @d5_sup, @des5_04, @g5_02, 'EMP000010', 'Suresh',   'Iyer',      'Male',   '1996-08-09', '9800000010', 'suresh.iyer@fyndyne.com',     '2023-05-01', 'Full Time', 'Probation');
