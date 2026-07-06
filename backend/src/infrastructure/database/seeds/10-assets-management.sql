-- =====================================================
-- 10-assets-management.sql  ·  UUID() / NOW() edition
-- assets, asset_allocations
-- =====================================================

-- ASSETS — Laptops
INSERT INTO assets (id, tenant_id, company_id, asset_code, asset_name, category, brand, model, serial_number, purchase_date, purchase_cost, warranty_expiry, location, status, condition_status) VALUES
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM companies WHERE company_code='FYT001'), 'AST0001', 'Dell Latitude 5440',  'Laptop', 'Dell',   'Latitude 5440', 'DLL5440001', '2025-01-10', 75000, '2028-01-10', 'Hyderabad HO', 'Allocated', 'Good'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM companies WHERE company_code='FYT001'), 'AST0002', 'HP EliteBook 840',    'Laptop', 'HP',     'EliteBook 840', 'HP840001',   '2025-01-15', 72000, '2028-01-15', 'Hyderabad HO', 'Allocated', 'Good'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM companies WHERE company_code='FYT001'), 'AST0003', 'Lenovo ThinkPad E14', 'Laptop', 'Lenovo', 'ThinkPad E14',  'LEN001',     '2025-02-01', 68000, '2028-02-01', 'Bangalore HO', 'Available', 'Good');

-- ASSETS — Monitors
INSERT INTO assets (id, tenant_id, company_id, asset_code, asset_name, category, brand, model, serial_number, purchase_date, purchase_cost, location, status, condition_status) VALUES
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM companies WHERE company_code='FYT001'), 'AST0004', 'Dell 24 Monitor', 'Monitor', 'Dell', 'P2422H', 'MON001', '2025-01-10', 12000, 'Hyderabad HO', 'Allocated', 'Good'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM companies WHERE company_code='FYT001'), 'AST0005', 'LG 27 Monitor',   'Monitor', 'LG',   '27MP400','MON002', '2025-02-10', 15000, 'Bangalore HO', 'Available', 'Good');

-- ASSETS — Mobiles
INSERT INTO assets (id, tenant_id, company_id, asset_code, asset_name, category, brand, model, serial_number, purchase_date, purchase_cost, location, status, condition_status) VALUES
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM companies WHERE company_code='FYT001'), 'AST0006', 'iPhone 15',    'Mobile', 'Apple',   'iPhone 15', 'IPH001', '2025-03-10', 80000, 'Hyderabad HO', 'Allocated', 'Good'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM companies WHERE company_code='FYT001'), 'AST0007', 'Samsung S25',  'Mobile', 'Samsung', 'S25',       'SAM001', '2025-03-15', 70000, 'Mumbai HO',    'Available', 'Good');

-- ASSETS — Headsets
INSERT INTO assets (id, tenant_id, company_id, asset_code, asset_name, category, brand, model, serial_number, purchase_date, purchase_cost, location, status, condition_status) VALUES
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM companies WHERE company_code='FYT001'), 'AST0008', 'Jabra Evolve 40',  'Headset', 'Jabra',    'Evolve 40', 'JAB001', '2025-02-10', 5500, 'Hyderabad HO', 'Allocated', 'Good'),
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM companies WHERE company_code='FYT001'), 'AST0009', 'Logitech H390',    'Headset', 'Logitech', 'H390',      'LOG001', '2025-02-20', 3200, 'Bangalore HO', 'Available', 'Good');

-- ASSETS — Access Cards
INSERT INTO assets (id, tenant_id, company_id, asset_code, asset_name, category, purchase_date, purchase_cost, location, status, condition_status) VALUES
(UUID(), (SELECT id FROM tenants WHERE tenant_code='FYND'), (SELECT id FROM companies WHERE company_code='FYT001'), 'AST0010', 'RFID Access Card', 'Access Card', '2025-01-01', 150, 'Hyderabad HO', 'Allocated', 'Good');

-- ASSET ALLOCATIONS
INSERT INTO asset_allocations (id, asset_id, employee_id, allocated_at, condition_at_alloc, notes) VALUES
(UUID(), (SELECT id FROM assets WHERE asset_code='AST0001'), (SELECT id FROM employees WHERE employee_code='EMP0001'), '2025-01-15 10:00:00', 'Good', 'Dell Laptop Assigned'),
(UUID(), (SELECT id FROM assets WHERE asset_code='AST0004'), (SELECT id FROM employees WHERE employee_code='EMP0001'), '2025-01-15 10:05:00', 'Good', 'Dell Monitor Assigned'),
(UUID(), (SELECT id FROM assets WHERE asset_code='AST0006'), (SELECT id FROM employees WHERE employee_code='EMP0002'), '2025-03-20 11:00:00', 'Good', 'Official Mobile Assigned'),
(UUID(), (SELECT id FROM assets WHERE asset_code='AST0008'), (SELECT id FROM employees WHERE employee_code='EMP0003'), '2025-02-20 09:00:00', 'Good', 'Headset Assigned'),
(UUID(), (SELECT id FROM assets WHERE asset_code='AST0010'), (SELECT id FROM employees WHERE employee_code='EMP0001'), '2025-01-15 09:00:00', 'Good', 'Access Card Issued');
