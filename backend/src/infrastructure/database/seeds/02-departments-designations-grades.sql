-- =====================================================
-- 02-departments-designations-grades.sql  ·  UUID() / NOW() edition
-- grades, departments, designations, cost_centers
-- =====================================================

-- =====================================================
-- GRADES — Fyndyne Technologies (FYT001)
-- =====================================================
INSERT INTO grades (id, company_id, grade_name, grade_code, min_salary, max_salary, sort_order, status) VALUES
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Grade 1',  'G1',  200000,   400000,   1,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Grade 2',  'G2',  400000,   600000,   2,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Grade 3',  'G3',  600000,   800000,   3,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Grade 4',  'G4',  800000,  1200000,   4,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Grade 5',  'G5', 1200000,  1500000,   5,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Grade 6',  'G6', 1500000,  2000000,   6,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Grade 7',  'G7', 2000000,  2500000,   7,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Grade 8',  'G8', 2500000,  3500000,   8,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Grade 9',  'G9', 3500000,  5000000,   9,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Grade 10','G10', 5000000, 10000000,  10,  'Active');

-- =====================================================
-- DEPARTMENTS — Fyndyne Technologies (FYT001)
-- =====================================================
INSERT INTO departments (id, company_id, department_name, department_code, level, status) VALUES
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Human Resources',       'HR',   1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Finance',               'FIN',  1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Accounts',              'ACC',  1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Engineering',           'ENG',  1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Frontend Development',  'FED',  2, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Backend Development',   'BED',  2, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'QA',                    'QA',   1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'DevOps',                'DOPS', 1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Cloud Engineering',     'CLD',  2, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Security',              'SEC',  1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Operations',            'OPS',  1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Sales',                 'SAL',  1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Marketing',             'MKT',  1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Business Development',  'BD',   1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Customer Support',      'SUP',  1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Administration',        'ADM',  1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Legal',                 'LGL',  1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Compliance',            'CMP',  1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Procurement',           'PRC',  1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Training',              'TRN',  1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Learning & Development','LND',  1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Payroll',               'PAY',  1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Recruitment',           'REC',  1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Product Management',    'PM',   1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'UI UX',                 'UIUX', 1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Data Engineering',      'DE',   1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'AI Engineering',        'AI',   1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Business Intelligence', 'BI',   1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Infrastructure',        'INF',  1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Network Operations',    'NET',  1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Manufacturing',         'MFG',  1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Warehouse',             'WH',   1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Supply Chain',          'SCM',  1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Transport',             'TRP',  1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Field Operations',      'FOPS', 1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Research',              'RND',  1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Innovation',            'INN',  1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Investor Relations',    'IR',   1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Corporate Strategy',    'STR',  1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Corporate Communications','COM', 1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Audit',                 'ADT',  1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Risk Management',       'RISK', 1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'CSR',                   'CSR',  1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'PMO',                   'PMO',  1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Projects',              'PROJ', 1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Mobile Engineering',    'MOB',  1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'ERP Team',              'ERP',  1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Analytics',             'ANA',  1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Automation',            'AUTO', 1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Digital Transformation','DT',   1, 'Active');

-- =====================================================
-- DESIGNATIONS — Fyndyne Technologies (FYT001)
-- =====================================================
INSERT INTO designations (id, company_id, designation_name, designation_code, level, status) VALUES
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Intern',                       'INT',    1,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Graduate Trainee',             'GT',     2,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Associate',                    'ASC',    3,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Junior Executive',             'JE',     4,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Executive',                    'EXE',    5,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Senior Executive',             'SEXE',   6,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Engineer',                     'ENGR',   7,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Senior Engineer',              'SENG',   8,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Lead Engineer',                'LENG',   9,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Principal Engineer',           'PENG',  10,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Architect',                    'ARC',   11,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Senior Architect',             'SARC',  12,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Consultant',                   'CON',   13,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Senior Consultant',            'SCON',  14,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Team Lead',                    'TL',    15,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Assistant Manager',            'AM',    16,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Manager',                      'MGR',   17,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Senior Manager',               'SMGR',  18,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Associate Director',           'AD',    19,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Director',                     'DIR',   20,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Senior Director',              'SDIR',  21,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Vice President',               'VP',    22,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Senior Vice President',        'SVP',   23,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Executive Vice President',     'EVP',   24,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Chief Technology Officer',     'CTO',   25,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Chief Operating Officer',      'COO',   26,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Chief Financial Officer',      'CFO',   27,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Chief Human Resources Officer','CHRO',  28,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Chief Executive Officer',      'CEO',   29,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'President',                    'PRES',  30,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Product Manager',              'PM',    31,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Senior Product Manager',       'SPM',   32,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'QA Engineer',                  'QAE',   33,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'QA Lead',                      'QAL',   34,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'DevOps Engineer',              'DEVOPS',35,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Cloud Engineer',               'CLDE',  36,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'AI Engineer',                  'AIE',   37,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Data Scientist',               'DS',    38,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Business Analyst',             'BA',    39,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Solution Architect',           'SA',    40,  'Active');

-- =====================================================
-- COST CENTERS — Fyndyne Technologies (FYT001)
-- =====================================================
INSERT INTO cost_centers (id, company_id, cost_center_name, cost_center_code, status) VALUES
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Corporate',            'CC001', 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Technology',           'CC002', 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Engineering',          'CC003', 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'HR Operations',        'CC004', 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Finance Operations',   'CC005', 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Marketing',            'CC006', 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Sales',                'CC007', 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Support',              'CC008', 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Cloud',                'CC009', 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Infrastructure',       'CC010', 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Security',             'CC011', 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'AI Research',          'CC012', 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Recruitment',          'CC013', 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Training',             'CC014', 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Legal',                'CC015', 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Operations',           'CC016', 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Projects',             'CC017', 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Product',              'CC018', 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Analytics',            'CC019', 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Innovation',           'CC020', 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Manufacturing',        'CC021', 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Warehouse',            'CC022', 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Supply Chain',         'CC023', 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Corporate Strategy',   'CC024', 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Digital Transformation','CC025','Active');

-- =====================================================
-- GRADES — Fyndyne Global (FYG001)
-- =====================================================
INSERT INTO grades (id, company_id, grade_name, grade_code, min_salary, max_salary, sort_order, status) VALUES
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYG001'), 'Grade 1', 'G1',  200000,   400000, 1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYG001'), 'Grade 2', 'G2',  400000,   600000, 2, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYG001'), 'Grade 3', 'G3',  600000,   900000, 3, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYG001'), 'Grade 4', 'G4',  900000,  1400000, 4, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYG001'), 'Grade 5', 'G5', 1400000,  2000000, 5, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYG001'), 'Grade 6', 'G6', 2000000,  3000000, 6, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYG001'), 'Grade 7', 'G7', 3000000,  5000000, 7, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYG001'), 'Grade 8', 'G8', 5000000, 10000000, 8, 'Active');

-- =====================================================
-- DEPARTMENTS — Fyndyne Global (FYG001)
-- =====================================================
INSERT INTO departments (id, company_id, branch_id, department_name, department_code, level, status) VALUES
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYG001'), (SELECT id FROM branches WHERE branch_code = 'MUM001'), 'Human Resources',   'HR',   1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYG001'), (SELECT id FROM branches WHERE branch_code = 'MUM001'), 'Finance',           'FIN',  1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYG001'), (SELECT id FROM branches WHERE branch_code = 'MUM001'), 'Engineering',       'ENG',  1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYG001'), (SELECT id FROM branches WHERE branch_code = 'MUM001'), 'Sales',             'SAL',  1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYG001'), (SELECT id FROM branches WHERE branch_code = 'MUM001'), 'Marketing',         'MKT',  1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYG001'), (SELECT id FROM branches WHERE branch_code = 'MUM001'), 'Operations',        'OPS',  1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYG001'), (SELECT id FROM branches WHERE branch_code = 'THN001'), 'Customer Support',  'SUP',  1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYG001'), (SELECT id FROM branches WHERE branch_code = 'THN001'), 'Product Management','PM',   1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYG001'), (SELECT id FROM branches WHERE branch_code = 'NVM001'), 'Technology',        'TECH', 1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYG001'), (SELECT id FROM branches WHERE branch_code = 'DEL001'), 'Legal',             'LGL',  1, 'Active');

-- =====================================================
-- DESIGNATIONS — Fyndyne Global (FYG001)
-- =====================================================
INSERT INTO designations (id, company_id, designation_name, designation_code, level, status) VALUES
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYG001'), 'Intern',               'INT',  1,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYG001'), 'Executive',            'EXE',  2,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYG001'), 'Senior Executive',     'SEXE', 3,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYG001'), 'Engineer',             'ENGR', 4,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYG001'), 'Senior Engineer',      'SENG', 5,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYG001'), 'Team Lead',            'TL',   6,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYG001'), 'Assistant Manager',    'AM',   7,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYG001'), 'Manager',              'MGR',  8,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYG001'), 'Senior Manager',       'SMGR', 9,  'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYG001'), 'Director',             'DIR',  10, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYG001'), 'Vice President',       'VP',   11, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYG001'), 'Chief Executive Officer','CEO', 12, 'Active');

-- =====================================================
-- COST CENTERS — Fyndyne Global (FYG001)
-- =====================================================
INSERT INTO cost_centers (id, company_id, cost_center_name, cost_center_code, status) VALUES
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYG001'), 'Corporate',              'GCC001', 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYG001'), 'Technology',             'GCC002', 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYG001'), 'HR Operations',          'GCC003', 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYG001'), 'Finance Operations',     'GCC004', 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYG001'), 'Sales & Marketing',      'GCC005', 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYG001'), 'Operations',             'GCC006', 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYG001'), 'Legal & Compliance',     'GCC007', 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYG001'), 'Product & Engineering',  'GCC008', 'Active');
