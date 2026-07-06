-- =====================================================
-- 01-master-data.sql  ·  UUID() / NOW() edition
-- tenants → companies → branches
-- =====================================================

-- TENANT
INSERT INTO tenants (id, tenant_name, tenant_code, subscription_plan, status)
VALUES (UUID(), 'Fyndyne HRMS', 'FYND', 'Enterprise', 'Active');

-- COMPANIES
INSERT INTO companies (id, tenant_id, company_name, legal_name, company_code, registered_address, email, phone, status) VALUES
(UUID(), (SELECT id FROM tenants WHERE tenant_code = 'FYND'), 'Fyndyne Technologies',  'Fyndyne Technologies Pvt Ltd',  'FYT001', 'Hyderabad, Telangana',   'info@fyndyne.com',          '9000000001', 'Active'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code = 'FYND'), 'Fyndyne Retail',         'Fyndyne Retail Pvt Ltd',         'FYR001', 'Bangalore, Karnataka',  'retail@fyndyne.com',        '9000000002', 'Active'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code = 'FYND'), 'Fyndyne Logistics',      'Fyndyne Logistics Pvt Ltd',      'FYL001', 'Chennai, Tamil Nadu',   'logistics@fyndyne.com',     '9000000003', 'Active'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code = 'FYND'), 'Fyndyne Manufacturing',  'Fyndyne Manufacturing Pvt Ltd',  'FYM001', 'Pune, Maharashtra',     'manufacturing@fyndyne.com', '9000000004', 'Active'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code = 'FYND'), 'Fyndyne Global',         'Fyndyne Global Pvt Ltd',         'FYG001', 'Mumbai, Maharashtra',   'global@fyndyne.com',        '9000000005', 'Active');

-- BRANCHES  — Fyndyne Technologies (FYT001)
INSERT INTO branches (id, company_id, branch_name, branch_code, branch_type, address, city, state, country, pin_code, is_payroll_location, status) VALUES
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Hyderabad HO',        'HYD001', 'Head Office',     'Madhapur',      'Hyderabad',    'Telangana',      'India', '500081', 1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Secunderabad Branch', 'HYD002', 'Regional Office', 'Paradise',      'Hyderabad',    'Telangana',      'India', '500003', 1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Vijayawada Branch',   'VJA001', 'Sales Office',    'Benz Circle',   'Vijayawada',   'Andhra Pradesh', 'India', '520010', 1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Visakhapatnam Branch','VZG001', 'Sales Office',    'MVP Colony',    'Visakhapatnam','Andhra Pradesh', 'India', '530017', 1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYT001'), 'Tirupati Branch',     'TPT001', 'Regional Office', 'Air Bypass Rd', 'Tirupati',     'Andhra Pradesh', 'India', '517501', 0, 'Active');

-- BRANCHES  — Fyndyne Retail (FYR001)
INSERT INTO branches (id, company_id, branch_name, branch_code, branch_type, address, city, state, country, pin_code, is_payroll_location, status) VALUES
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYR001'), 'Bangalore HO',    'BLR001', 'Head Office',     'Electronic City', 'Bangalore', 'Karnataka', 'India', '560100', 1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYR001'), 'Mysore Branch',   'MYS001', 'Regional Office', 'VV Mohalla',      'Mysore',    'Karnataka', 'India', '570002', 1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYR001'), 'Hubli Branch',    'HBL001', 'Sales Office',    'Gokul Road',      'Hubli',     'Karnataka', 'India', '580030', 0, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYR001'), 'Mangalore Branch','MNG001', 'Sales Office',    'Kadri',           'Mangalore', 'Karnataka', 'India', '575003', 1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYR001'), 'Belgaum Branch',  'BLG001', 'Regional Office', 'Tilakwadi',       'Belgaum',   'Karnataka', 'India', '590006', 0, 'Active');

-- BRANCHES  — Fyndyne Logistics (FYL001)
INSERT INTO branches (id, company_id, branch_name, branch_code, branch_type, address, city, state, country, pin_code, is_payroll_location, status) VALUES
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYL001'), 'Chennai HO',        'CHE001', 'Head Office',     'OMR',        'Chennai',    'Tamil Nadu', 'India', '600096', 1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYL001'), 'Coimbatore Branch', 'CBE001', 'Regional Office', 'RS Puram',   'Coimbatore', 'Tamil Nadu', 'India', '641002', 1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYL001'), 'Madurai Branch',    'MDU001', 'Sales Office',    'KK Nagar',   'Madurai',    'Tamil Nadu', 'India', '625020', 0, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYL001'), 'Salem Branch',      'SLM001', 'Sales Office',    'Fairlands',  'Salem',      'Tamil Nadu', 'India', '636016', 0, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYL001'), 'Trichy Branch',     'TRY001', 'Regional Office', 'Cantonment', 'Trichy',     'Tamil Nadu', 'India', '620001', 1, 'Active');

-- BRANCHES  — Fyndyne Manufacturing (FYM001)
INSERT INTO branches (id, company_id, branch_name, branch_code, branch_type, address, city, state, country, pin_code, is_payroll_location, status) VALUES
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYM001'), 'Pune HO',           'PUN001', 'Head Office',     'Hinjewadi',   'Pune',       'Maharashtra', 'India', '411057', 1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYM001'), 'Nagpur Branch',     'NGP001', 'Regional Office', 'Dharampeth',  'Nagpur',     'Maharashtra', 'India', '440010', 1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYM001'), 'Nashik Branch',     'NSK001', 'Sales Office',    'College Road','Nashik',     'Maharashtra', 'India', '422005', 0, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYM001'), 'Aurangabad Branch', 'AUR001', 'Regional Office', 'CIDCO',       'Aurangabad', 'Maharashtra', 'India', '431003', 1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYM001'), 'Kolhapur Branch',   'KOL001', 'Sales Office',    'Shahupuri',   'Kolhapur',   'Maharashtra', 'India', '416001', 0, 'Active');

-- BRANCHES  — Fyndyne Global (FYG001)
INSERT INTO branches (id, company_id, branch_name, branch_code, branch_type, address, city, state, country, pin_code, is_payroll_location, status) VALUES
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYG001'), 'Mumbai HO',          'MUM001', 'Head Office',     'Andheri East',    'Mumbai',      'Maharashtra', 'India', '400069', 1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYG001'), 'Thane Branch',       'THN001', 'Regional Office', 'Wagle Estate',    'Thane',       'Maharashtra', 'India', '400604', 1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYG001'), 'Navi Mumbai Branch', 'NVM001', 'Sales Office',    'Vashi',           'Navi Mumbai', 'Maharashtra', 'India', '400703', 1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYG001'), 'Pune Global Office', 'PUG001', 'Regional Office', 'Baner',           'Pune',        'Maharashtra', 'India', '411045', 1, 'Active'),
(UUID(), (SELECT id FROM companies WHERE company_code = 'FYG001'), 'Delhi Branch',       'DEL001', 'Regional Office', 'Connaught Place', 'New Delhi',   'Delhi',       'India', '110001', 1, 'Active');
