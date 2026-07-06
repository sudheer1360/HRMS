-- =====================================================
-- 04-employees.sql  ·  UUID() / NOW() edition
-- employees, statutory, banks, family, history, documents
-- =====================================================

-- Helper aliases (subqueries used inline below)
-- company FYT001  → (SELECT id FROM companies WHERE company_code = 'FYT001')
-- tenant  FYND    → (SELECT id FROM tenants  WHERE tenant_code  = 'FYND')
-- branch  HYD001  → (SELECT id FROM branches WHERE branch_code  = 'HYD001')
-- dept    ENG     → (SELECT id FROM departments  WHERE department_code  = 'ENG'  AND company_id = (SELECT id FROM companies WHERE company_code = 'FYT001'))
-- desig   SENG    → (SELECT id FROM designations WHERE designation_code = 'SENG' AND company_id = (SELECT id FROM companies WHERE company_code = 'FYT001'))
-- grade   G3      → (SELECT id FROM grades       WHERE grade_code       = 'G3'   AND company_id = (SELECT id FROM companies WHERE company_code = 'FYT001'))

INSERT INTO employees (id, tenant_id, company_id, branch_id, department_id, designation_id, grade_id,
  employee_code, first_name, last_name, gender, mobile, email, date_of_joining,
  employment_type, work_type, cost_to_company, status, employment_status) VALUES

(UUID(),
 (SELECT id FROM tenants  WHERE tenant_code  = 'FYND'),
 (SELECT id FROM companies WHERE company_code = 'FYT001'),
 (SELECT id FROM branches WHERE branch_code  = 'HYD001'),
 (SELECT id FROM departments  WHERE department_code  = 'ENG'  AND company_id = (SELECT id FROM companies WHERE company_code = 'FYT001')),
 (SELECT id FROM designations WHERE designation_code = 'SENG' AND company_id = (SELECT id FROM companies WHERE company_code = 'FYT001')),
 (SELECT id FROM grades       WHERE grade_code       = 'G3'   AND company_id = (SELECT id FROM companies WHERE company_code = 'FYT001')),
 'EMP0001','Rahul','Sharma','Male','9876500001','rahul.sharma@fyndyne.com','2023-01-10','Permanent','On-site',850000,'Active','Confirmed'),

(UUID(),
 (SELECT id FROM tenants  WHERE tenant_code  = 'FYND'),
 (SELECT id FROM companies WHERE company_code = 'FYT001'),
 (SELECT id FROM branches WHERE branch_code  = 'HYD001'),
 (SELECT id FROM departments  WHERE department_code  = 'FED'  AND company_id = (SELECT id FROM companies WHERE company_code = 'FYT001')),
 (SELECT id FROM designations WHERE designation_code = 'ENGR' AND company_id = (SELECT id FROM companies WHERE company_code = 'FYT001')),
 (SELECT id FROM grades       WHERE grade_code       = 'G2'   AND company_id = (SELECT id FROM companies WHERE company_code = 'FYT001')),
 'EMP0002','Priya','Reddy','Female','9876500002','priya.reddy@fyndyne.com','2023-02-15','Permanent','Hybrid',700000,'Active','Confirmed'),

(UUID(),
 (SELECT id FROM tenants  WHERE tenant_code  = 'FYND'),
 (SELECT id FROM companies WHERE company_code = 'FYT001'),
 (SELECT id FROM branches WHERE branch_code  = 'HYD002'),
 (SELECT id FROM departments  WHERE department_code  = 'BED'  AND company_id = (SELECT id FROM companies WHERE company_code = 'FYT001')),
 (SELECT id FROM designations WHERE designation_code = 'SENG' AND company_id = (SELECT id FROM companies WHERE company_code = 'FYT001')),
 (SELECT id FROM grades       WHERE grade_code       = 'G3'   AND company_id = (SELECT id FROM companies WHERE company_code = 'FYT001')),
 'EMP0003','Kiran','Kumar','Male','9876500003','kiran.kumar@fyndyne.com','2023-03-01','Permanent','Remote',900000,'Active','Confirmed'),

(UUID(),
 (SELECT id FROM tenants  WHERE tenant_code  = 'FYND'),
 (SELECT id FROM companies WHERE company_code = 'FYT001'),
 (SELECT id FROM branches WHERE branch_code  = 'VJA001'),
 (SELECT id FROM departments  WHERE department_code  = 'QA'   AND company_id = (SELECT id FROM companies WHERE company_code = 'FYT001')),
 (SELECT id FROM designations WHERE designation_code = 'QAE'  AND company_id = (SELECT id FROM companies WHERE company_code = 'FYT001')),
 (SELECT id FROM grades       WHERE grade_code       = 'G2'   AND company_id = (SELECT id FROM companies WHERE company_code = 'FYT001')),
 'EMP0004','Anjali','Verma','Female','9876500004','anjali.verma@fyndyne.com','2023-04-20','Permanent','On-site',650000,'Active','Confirmed'),

(UUID(),
 (SELECT id FROM tenants  WHERE tenant_code  = 'FYND'),
 (SELECT id FROM companies WHERE company_code = 'FYT001'),
 (SELECT id FROM branches WHERE branch_code  = 'VZG001'),
 (SELECT id FROM departments  WHERE department_code  = 'DOPS' AND company_id = (SELECT id FROM companies WHERE company_code = 'FYT001')),
 (SELECT id FROM designations WHERE designation_code = 'DEVOPS' AND company_id = (SELECT id FROM companies WHERE company_code = 'FYT001')),
 (SELECT id FROM grades       WHERE grade_code       = 'G3'   AND company_id = (SELECT id FROM companies WHERE company_code = 'FYT001')),
 'EMP0005','Vikram','Patel','Male','9876500005','vikram.patel@fyndyne.com','2023-05-10','Permanent','Hybrid',950000,'Active','Confirmed'),

(UUID(),
 (SELECT id FROM tenants  WHERE tenant_code  = 'FYND'),
 (SELECT id FROM companies WHERE company_code = 'FYT001'),
 (SELECT id FROM branches WHERE branch_code  = 'HYD001'),
 (SELECT id FROM departments  WHERE department_code  = 'HR'   AND company_id = (SELECT id FROM companies WHERE company_code = 'FYT001')),
 (SELECT id FROM designations WHERE designation_code = 'MGR'  AND company_id = (SELECT id FROM companies WHERE company_code = 'FYT001')),
 (SELECT id FROM grades       WHERE grade_code       = 'G4'   AND company_id = (SELECT id FROM companies WHERE company_code = 'FYT001')),
 'EMP0006','Sneha','Rao','Female','9876500006','sneha.rao@fyndyne.com','2022-11-12','Permanent','On-site',1200000,'Active','Confirmed'),

(UUID(),
 (SELECT id FROM tenants  WHERE tenant_code  = 'FYND'),
 (SELECT id FROM companies WHERE company_code = 'FYT001'),
 (SELECT id FROM branches WHERE branch_code  = 'HYD001'),
 (SELECT id FROM departments  WHERE department_code  = 'FIN'  AND company_id = (SELECT id FROM companies WHERE company_code = 'FYT001')),
 (SELECT id FROM designations WHERE designation_code = 'MGR'  AND company_id = (SELECT id FROM companies WHERE company_code = 'FYT001')),
 (SELECT id FROM grades       WHERE grade_code       = 'G4'   AND company_id = (SELECT id FROM companies WHERE company_code = 'FYT001')),
 'EMP0007','Arjun','Singh','Male','9876500007','arjun.singh@fyndyne.com','2022-10-05','Permanent','On-site',1300000,'Active','Confirmed'),

(UUID(),
 (SELECT id FROM tenants  WHERE tenant_code  = 'FYND'),
 (SELECT id FROM companies WHERE company_code = 'FYT001'),
 (SELECT id FROM branches WHERE branch_code  = 'TPT001'),
 (SELECT id FROM departments  WHERE department_code  = 'SAL'  AND company_id = (SELECT id FROM companies WHERE company_code = 'FYT001')),
 (SELECT id FROM designations WHERE designation_code = 'TL'   AND company_id = (SELECT id FROM companies WHERE company_code = 'FYT001')),
 (SELECT id FROM grades       WHERE grade_code       = 'G3'   AND company_id = (SELECT id FROM companies WHERE company_code = 'FYT001')),
 'EMP0008','Megha','Joshi','Female','9876500008','megha.joshi@fyndyne.com','2023-06-14','Permanent','Hybrid',850000,'Active','Confirmed'),

(UUID(),
 (SELECT id FROM tenants  WHERE tenant_code  = 'FYND'),
 (SELECT id FROM companies WHERE company_code = 'FYT001'),
 (SELECT id FROM branches WHERE branch_code  = 'HYD002'),
 (SELECT id FROM departments  WHERE department_code  = 'MKT'  AND company_id = (SELECT id FROM companies WHERE company_code = 'FYT001')),
 (SELECT id FROM designations WHERE designation_code = 'TL'   AND company_id = (SELECT id FROM companies WHERE company_code = 'FYT001')),
 (SELECT id FROM grades       WHERE grade_code       = 'G3'   AND company_id = (SELECT id FROM companies WHERE company_code = 'FYT001')),
 'EMP0009','Rohit','Agarwal','Male','9876500009','rohit.agarwal@fyndyne.com','2023-07-01','Permanent','On-site',800000,'Active','Confirmed'),

(UUID(),
 (SELECT id FROM tenants  WHERE tenant_code  = 'FYND'),
 (SELECT id FROM companies WHERE company_code = 'FYT001'),
 (SELECT id FROM branches WHERE branch_code  = 'VJA001'),
 (SELECT id FROM departments  WHERE department_code  = 'SUP'  AND company_id = (SELECT id FROM companies WHERE company_code = 'FYT001')),
 (SELECT id FROM designations WHERE designation_code = 'EXE'  AND company_id = (SELECT id FROM companies WHERE company_code = 'FYT001')),
 (SELECT id FROM grades       WHERE grade_code       = 'G2'   AND company_id = (SELECT id FROM companies WHERE company_code = 'FYT001')),
 'EMP0010','Pooja','Nair','Female','9876500010','pooja.nair@fyndyne.com','2024-01-05','Permanent','Remote',550000,'Active','Probation');

-- EMPLOYEE STATUTORY
INSERT INTO employee_statutory (id, employee_id, aadhaar_masked, pan_masked, uan, pf_number, pt_applicable, gratuity_applicable) VALUES
(UUID(), (SELECT id FROM employees WHERE employee_code = 'EMP0001'), 'XXXX-XXXX-1234', 'ABCDE1234F', '100000001', 'PF000001', 1, 1),
(UUID(), (SELECT id FROM employees WHERE employee_code = 'EMP0002'), 'XXXX-XXXX-1235', 'ABCDE1235F', '100000002', 'PF000002', 1, 1),
(UUID(), (SELECT id FROM employees WHERE employee_code = 'EMP0003'), 'XXXX-XXXX-1236', 'ABCDE1236F', '100000003', 'PF000003', 1, 1),
(UUID(), (SELECT id FROM employees WHERE employee_code = 'EMP0004'), 'XXXX-XXXX-1237', 'ABCDE1237F', '100000004', 'PF000004', 1, 1),
(UUID(), (SELECT id FROM employees WHERE employee_code = 'EMP0005'), 'XXXX-XXXX-1238', 'ABCDE1238F', '100000005', 'PF000005', 1, 1);

-- EMPLOYEE BANKS
INSERT INTO employee_banks (id, employee_id, bank_name, account_number_masked, ifsc, account_holder_name, payment_mode, is_primary) VALUES
(UUID(), (SELECT id FROM employees WHERE employee_code = 'EMP0001'), 'HDFC Bank', 'XXXX4567', 'HDFC0001234', 'Rahul Sharma',  'Bank Transfer', 1),
(UUID(), (SELECT id FROM employees WHERE employee_code = 'EMP0002'), 'ICICI Bank','XXXX5678', 'ICIC0001234', 'Priya Reddy',   'Bank Transfer', 1),
(UUID(), (SELECT id FROM employees WHERE employee_code = 'EMP0003'), 'SBI',        'XXXX6789', 'SBIN0001234', 'Kiran Kumar',   'Bank Transfer', 1),
(UUID(), (SELECT id FROM employees WHERE employee_code = 'EMP0004'), 'Axis Bank', 'XXXX7890', 'UTIB0001234', 'Anjali Verma',  'Bank Transfer', 1),
(UUID(), (SELECT id FROM employees WHERE employee_code = 'EMP0005'), 'HDFC Bank', 'XXXX8901', 'HDFC0005678', 'Vikram Patel',  'Bank Transfer', 1);

-- EMPLOYEE FAMILY
INSERT INTO employee_family (id, employee_id, family_member_name, relation, dependent_flag, nominee_flag) VALUES
(UUID(), (SELECT id FROM employees WHERE employee_code = 'EMP0001'), 'Suresh Sharma', 'Father', 1, 0),
(UUID(), (SELECT id FROM employees WHERE employee_code = 'EMP0001'), 'Lakshmi Sharma','Mother', 1, 1),
(UUID(), (SELECT id FROM employees WHERE employee_code = 'EMP0002'), 'Ramesh Reddy',  'Father', 1, 0),
(UUID(), (SELECT id FROM employees WHERE employee_code = 'EMP0002'), 'Sita Reddy',    'Mother', 1, 1),
(UUID(), (SELECT id FROM employees WHERE employee_code = 'EMP0003'), 'Anitha Kumar',  'Spouse', 1, 1);

-- EMPLOYMENT HISTORY
INSERT INTO employment_history (id, employee_id, employer_name, designation, from_date, to_date) VALUES
(UUID(), (SELECT id FROM employees WHERE employee_code = 'EMP0001'), 'Infosys', 'Software Engineer',   '2020-01-01', '2022-12-31'),
(UUID(), (SELECT id FROM employees WHERE employee_code = 'EMP0002'), 'TCS',     'Associate Engineer',  '2021-01-01', '2023-01-31'),
(UUID(), (SELECT id FROM employees WHERE employee_code = 'EMP0003'), 'Wipro',   'Senior Engineer',     '2019-05-01', '2023-02-15');

-- EMPLOYEE DOCUMENTS
INSERT INTO employee_documents (id, employee_id, document_type, file_name, is_verified) VALUES
(UUID(), (SELECT id FROM employees WHERE employee_code = 'EMP0001'), 'Aadhaar', 'aadhaar_emp1.pdf', 1),
(UUID(), (SELECT id FROM employees WHERE employee_code = 'EMP0001'), 'PAN',     'pan_emp1.pdf',     1),
(UUID(), (SELECT id FROM employees WHERE employee_code = 'EMP0002'), 'Aadhaar', 'aadhaar_emp2.pdf', 1),
(UUID(), (SELECT id FROM employees WHERE employee_code = 'EMP0002'), 'PAN',     'pan_emp2.pdf',     1),
(UUID(), (SELECT id FROM employees WHERE employee_code = 'EMP0003'), 'Aadhaar', 'aadhaar_emp3.pdf', 1),
(UUID(), (SELECT id FROM employees WHERE employee_code = 'EMP0003'), 'PAN',     'pan_emp3.pdf',     1);
