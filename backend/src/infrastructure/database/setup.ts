import mysql from 'mysql2/promise';
import { config } from '../../config/index.js';

const SCHEMA = `
-- =============================================================================
-- HRMS Platform — MySQL Schema (All 37 Modules)
-- =============================================================================

CREATE TABLE IF NOT EXISTS tenants (
  id VARCHAR(36) PRIMARY KEY,
  tenant_name VARCHAR(255) NOT NULL,
  tenant_code VARCHAR(50) NOT NULL UNIQUE,
  subscription_plan VARCHAR(50) NOT NULL DEFAULT 'Enterprise',
  status VARCHAR(20) NOT NULL DEFAULT 'Active',
  max_companies INT DEFAULT 1,
  max_employees INT DEFAULT 1000,
  settings_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(36),
  deleted_at TIMESTAMP NULL,
  INDEX idx_tenants_code (tenant_code),
  INDEX idx_tenants_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS companies (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  legal_name VARCHAR(255) NOT NULL,
  company_code VARCHAR(50) NOT NULL,
  logo_url VARCHAR(500),
  pan VARCHAR(10), tan VARCHAR(10), gstin VARCHAR(15), cin VARCHAR(21),
  pf_registration_number VARCHAR(50),
  esi_registration_number VARCHAR(50),
  pt_registration_number VARCHAR(50),
  registered_address TEXT NOT NULL,
  corporate_address TEXT,
  email VARCHAR(255), phone VARCHAR(15), website VARCHAR(500),
  financial_year_start_month VARCHAR(15) DEFAULT 'April',
  payroll_cycle VARCHAR(20) DEFAULT 'Monthly',
  timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
  currency VARCHAR(3) DEFAULT 'INR',
  status VARCHAR(20) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(36),
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  UNIQUE KEY uq_company_tenant_code (tenant_id, company_code),
  INDEX idx_companies_tenant (tenant_id),
  INDEX idx_companies_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS branches (
  id VARCHAR(36) PRIMARY KEY,
  company_id VARCHAR(36) NOT NULL,
  branch_name VARCHAR(255) NOT NULL,
  branch_code VARCHAR(50) NOT NULL,
  branch_type VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  country VARCHAR(100) DEFAULT 'India',
  pin_code VARCHAR(10),
  is_payroll_location BOOLEAN DEFAULT FALSE,
  latitude DECIMAL(10,7), longitude DECIMAL(10,7),
  status VARCHAR(20) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(36),
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (company_id) REFERENCES companies(id),
  UNIQUE KEY uq_branch_company_code (company_id, branch_code),
  INDEX idx_branches_company (company_id),
  INDEX idx_branches_type (branch_type),
  INDEX idx_branches_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS departments (
  id VARCHAR(36) PRIMARY KEY,
  company_id VARCHAR(36) NOT NULL,
  branch_id VARCHAR(36),
  parent_department_id VARCHAR(36),
  department_name VARCHAR(255) NOT NULL,
  department_code VARCHAR(50) NOT NULL,
  department_head_id VARCHAR(36),
  cost_center_id VARCHAR(36),
  level INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(36),
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (company_id) REFERENCES companies(id),
  FOREIGN KEY (branch_id) REFERENCES branches(id),
  FOREIGN KEY (parent_department_id) REFERENCES departments(id),
  UNIQUE KEY uq_dept_company_code (company_id, department_code),
  INDEX idx_dept_company (company_id),
  INDEX idx_dept_branch (branch_id),
  INDEX idx_dept_parent (parent_department_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS designations (
  id VARCHAR(36) PRIMARY KEY,
  company_id VARCHAR(36) NOT NULL,
  designation_name VARCHAR(255) NOT NULL,
  designation_code VARCHAR(50) NOT NULL,
  grade_id VARCHAR(36),
  level INT,
  status VARCHAR(20) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(36),
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (company_id) REFERENCES companies(id),
  UNIQUE KEY uq_des_company_code (company_id, designation_code),
  INDEX idx_des_company (company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS grades (
  id VARCHAR(36) PRIMARY KEY,
  company_id VARCHAR(36) NOT NULL,
  grade_name VARCHAR(100) NOT NULL,
  grade_code VARCHAR(20) NOT NULL,
  min_salary DECIMAL(12,2),
  max_salary DECIMAL(12,2),
  sort_order INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(36),
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (company_id) REFERENCES companies(id),
  UNIQUE KEY uq_grade_company_code (company_id, grade_code),
  INDEX idx_grade_company (company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS cost_centers (
  id VARCHAR(36) PRIMARY KEY,
  company_id VARCHAR(36) NOT NULL,
  cost_center_name VARCHAR(255) NOT NULL,
  cost_center_code VARCHAR(50) NOT NULL,
  branch_id VARCHAR(36),
  department_id VARCHAR(36),
  status VARCHAR(20) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(36),
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (company_id) REFERENCES companies(id),
  UNIQUE KEY uq_cc_company_code (company_id, cost_center_code),
  INDEX idx_cc_company (company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Employee Master
CREATE TABLE IF NOT EXISTS employees (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  company_id VARCHAR(36) NOT NULL,
  branch_id VARCHAR(36) NOT NULL,
  department_id VARCHAR(36) NOT NULL,
  designation_id VARCHAR(36) NOT NULL,
  grade_id VARCHAR(36),
  salary_structure_id VARCHAR(36),
  user_id VARCHAR(36),
  employee_code VARCHAR(50) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  last_name VARCHAR(100) NOT NULL,
  full_name VARCHAR(255) GENERATED ALWAYS AS (TRIM(CONCAT(first_name, ' ', COALESCE(middle_name, ''), ' ', last_name))) STORED,
  gender VARCHAR(20) DEFAULT 'Male',
  date_of_birth DATE DEFAULT '1990-01-01',
  marital_status VARCHAR(20) DEFAULT 'Single',
  blood_group VARCHAR(5),
  nationality VARCHAR(50) DEFAULT 'Indian',
  photo_url VARCHAR(500),
  mobile VARCHAR(15) NOT NULL,
  email VARCHAR(255) NOT NULL,
  alternate_mobile VARCHAR(15),
  present_address TEXT,
  permanent_address TEXT,
  emergency_contact_name VARCHAR(255),
  emergency_contact_number VARCHAR(15),
  emergency_relationship VARCHAR(50),
  date_of_joining DATE NOT NULL,
  employment_type VARCHAR(30) DEFAULT 'Permanent',
  work_type VARCHAR(20) DEFAULT 'On-site',
  reporting_manager_id VARCHAR(36),
  hr_manager_id VARCHAR(36),
  probation_months INT DEFAULT 6,
  confirmation_date DATE,
  notice_period_days INT DEFAULT 30,
  cost_to_company DECIMAL(14,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'Active',
  employment_status VARCHAR(20) DEFAULT 'Confirmed',
  salary_json JSON,
  settings_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(36),
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (company_id) REFERENCES companies(id),
  FOREIGN KEY (branch_id) REFERENCES branches(id),
  FOREIGN KEY (department_id) REFERENCES departments(id),
  FOREIGN KEY (designation_id) REFERENCES designations(id),
  UNIQUE KEY uq_emp_tenant_email (tenant_id, email),
  INDEX idx_emp_tenant (tenant_id),
  INDEX idx_emp_dept (company_id, department_id),
  INDEX idx_emp_status (status),
  INDEX idx_emp_code (employee_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS employee_statutory (
  id VARCHAR(36) PRIMARY KEY,
  employee_id VARCHAR(36) NOT NULL UNIQUE,
  aadhaar_encrypted TEXT,
  aadhaar_masked VARCHAR(16),
  pan_encrypted TEXT,
  pan_masked VARCHAR(10),
  uan VARCHAR(20),
  pf_number VARCHAR(50),
  esi_ip_number VARCHAR(20),
  pt_applicable BOOLEAN DEFAULT FALSE,
  lwf_applicable BOOLEAN DEFAULT FALSE,
  gratuity_applicable BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS employee_banks (
  id VARCHAR(36) PRIMARY KEY,
  employee_id VARCHAR(36) NOT NULL,
  bank_name VARCHAR(255),
  account_number_encrypted TEXT,
  account_number_masked VARCHAR(20),
  ifsc VARCHAR(15),
  account_holder_name VARCHAR(255),
  payment_mode VARCHAR(20) DEFAULT 'Bank Transfer',
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  INDEX idx_bank_emp (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS employee_family (
  id VARCHAR(36) PRIMARY KEY,
  employee_id VARCHAR(36) NOT NULL,
  family_member_name VARCHAR(255) NOT NULL,
  relation VARCHAR(50) NOT NULL,
  date_of_birth DATE,
  dependent_flag BOOLEAN DEFAULT FALSE,
  nominee_flag BOOLEAN DEFAULT FALSE,
  insurance_coverage_flag BOOLEAN DEFAULT FALSE,
  nominee_percentage DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  INDEX idx_fam_emp (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS employee_documents (
  id VARCHAR(36) PRIMARY KEY,
  employee_id VARCHAR(36) NOT NULL,
  document_type VARCHAR(50) NOT NULL,
  file_name VARCHAR(255),
  file_url VARCHAR(500),
  file_size INT,
  mime_type VARCHAR(100),
  is_verified BOOLEAN DEFAULT FALSE,
  verified_by VARCHAR(36),
  verified_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  INDEX idx_doc_emp (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS employment_history (
  id VARCHAR(36) PRIMARY KEY,
  employee_id VARCHAR(36) NOT NULL,
  employer_name VARCHAR(255) NOT NULL,
  designation VARCHAR(255) NOT NULL,
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  reason_for_leaving TEXT,
  reference_contact VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  INDEX idx_hist_emp (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS employee_status_logs (
  id VARCHAR(36) PRIMARY KEY,
  employee_id VARCHAR(36) NOT NULL,
  from_status VARCHAR(20) NOT NULL,
  to_status VARCHAR(20) NOT NULL,
  reason TEXT,
  changed_by VARCHAR(36) NOT NULL,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  INDEX idx_status_emp (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Auth & Security
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  employee_id VARCHAR(36) UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  mfa_enabled BOOLEAN DEFAULT FALSE,
  mfa_secret VARCHAR(255),
  last_login_at TIMESTAMP NULL,
  last_login_ip VARCHAR(45),
  failed_login_attempts INT DEFAULT 0,
  locked_until TIMESTAMP NULL,
  password_changed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  INDEX idx_users_tenant (tenant_id),
  INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS roles (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  UNIQUE KEY uq_role_tenant_name (tenant_id, name),
  INDEX idx_roles_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS permissions (
  id VARCHAR(36) PRIMARY KEY,
  code VARCHAR(100) NOT NULL UNIQUE,
  module VARCHAR(50) NOT NULL,
  action VARCHAR(20) NOT NULL,
  description VARCHAR(255),
  INDEX idx_perm_module (module)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS role_permissions (
  id VARCHAR(36) PRIMARY KEY,
  role_id VARCHAR(36) NOT NULL,
  permission_id VARCHAR(36) NOT NULL,
  FOREIGN KEY (role_id) REFERENCES roles(id),
  FOREIGN KEY (permission_id) REFERENCES permissions(id),
  UNIQUE KEY uq_rp (role_id, permission_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS user_roles (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  role_id VARCHAR(36) NOT NULL,
  branch_id VARCHAR(36),
  dept_id VARCHAR(36),
  valid_from TIMESTAMP NULL,
  valid_to TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (role_id) REFERENCES roles(id),
  UNIQUE KEY uq_ur (user_id, role_id, branch_id, dept_id),
  INDEX idx_ur_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  token VARCHAR(500) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_rt_user (user_id),
  INDEX idx_rt_token (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Audit & Logging
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  module VARCHAR(50) NOT NULL,
  action VARCHAR(20) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(36) NOT NULL,
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  request_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_tenant_date (tenant_id, created_at),
  INDEX idx_audit_user (user_id),
  INDEX idx_audit_entity (entity_type, entity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS login_logs (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36),
  email VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  location VARCHAR(255),
  device_info TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ll_user (user_id),
  INDEX idx_ll_email (email),
  INDEX idx_ll_status (status),
  INDEX idx_ll_date (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  data_json JSON,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notif_user (user_id, is_read),
  INDEX idx_notif_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Attendance
CREATE TABLE IF NOT EXISTS attendance_logs (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  employee_id VARCHAR(36) NOT NULL,
  attendance_date DATE NOT NULL,
  in_time TIMESTAMP NULL,
  out_time TIMESTAMP NULL,
  total_hours DECIMAL(5,2),
  status VARCHAR(20) NOT NULL,
  source VARCHAR(20) DEFAULT 'Manual',
  late_mins INT, early_exit_mins INT,
  is_corrected BOOLEAN DEFAULT FALSE,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_attn (employee_id, attendance_date),
  INDEX idx_attn_tenant_date (tenant_id, attendance_date),
  INDEX idx_attn_emp (employee_id),
  INDEX idx_attn_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS attendance_correction_requests (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  employee_id VARCHAR(36) NOT NULL,
  attendance_date DATE NOT NULL,
  current_status VARCHAR(20) NOT NULL,
  requested_status VARCHAR(20) NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'Pending',
  approved_by VARCHAR(36),
  approved_at TIMESTAMP NULL,
  rejected_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_acr_emp (employee_id, attendance_date),
  INDEX idx_acr_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS attendance_locks (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  company_id VARCHAR(36) NOT NULL,
  branch_id VARCHAR(36),
  dept_id VARCHAR(36),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  locked_by VARCHAR(36) NOT NULL,
  locked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  unlocked_by VARCHAR(36),
  unlocked_at TIMESTAMP NULL,
  unlock_reason TEXT,
  INDEX idx_lock (company_id, period_start, period_end)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Leave
CREATE TABLE IF NOT EXISTS leave_types (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  company_id VARCHAR(36) NOT NULL,
  leave_name VARCHAR(100) NOT NULL,
  leave_code VARCHAR(20) NOT NULL,
  description TEXT,
  is_paid BOOLEAN DEFAULT TRUE,
  requires_approval BOOLEAN DEFAULT TRUE,
  min_duration_days DECIMAL(3,1) DEFAULT 0.5,
  allow_encashment BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_lt (company_id, leave_code),
  INDEX idx_lt_company (company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS leave_policies (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  company_id VARCHAR(36) NOT NULL,
  leave_type_id VARCHAR(36) NOT NULL,
  annual_quota DECIMAL(5,1) NOT NULL,
  accrual_frequency VARCHAR(20) DEFAULT 'Monthly',
  carry_forward_limit DECIMAL(5,1),
  sandwich_rule BOOLEAN DEFAULT FALSE,
  min_service_days INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (leave_type_id) REFERENCES leave_types(id),
  INDEX idx_lp_company (company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS leave_balances (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  employee_id VARCHAR(36) NOT NULL,
  leave_type_id VARCHAR(36) NOT NULL,
  year INT NOT NULL,
  opening_balance DECIMAL(6,1) DEFAULT 0,
  earned_ytd DECIMAL(6,1) DEFAULT 0,
  used_ytd DECIMAL(6,1) DEFAULT 0,
  pending_ytd DECIMAL(6,1) DEFAULT 0,
  encashed_ytd DECIMAL(6,1) DEFAULT 0,
  current_balance DECIMAL(6,1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_lb (employee_id, leave_type_id, year),
  INDEX idx_lb_emp (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS leave_applications (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  employee_id VARCHAR(36) NOT NULL,
  leave_type_id VARCHAR(36) NOT NULL,
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  total_days DECIMAL(4,1) NOT NULL,
  reason TEXT,
  contact_during_leave VARCHAR(100),
  status VARCHAR(20) DEFAULT 'Pending',
  approved_by VARCHAR(36),
  approved_at TIMESTAMP NULL,
  rejected_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_la_emp (employee_id),
  INDEX idx_la_status (status),
  INDEX idx_la_dates (from_date, to_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Shifts & Overtime
CREATE TABLE IF NOT EXISTS shifts (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  company_id VARCHAR(36) NOT NULL,
  shift_name VARCHAR(100) NOT NULL,
  shift_code VARCHAR(20) NOT NULL,
  start_time VARCHAR(5) NOT NULL,
  end_time VARCHAR(5) NOT NULL,
  grace_period_mins INT DEFAULT 15,
  break_mins INT DEFAULT 30,
  is_night_shift BOOLEAN DEFAULT FALSE,
  is_flexible BOOLEAN DEFAULT FALSE,
  ot_eligible BOOLEAN DEFAULT TRUE,
  status VARCHAR(20) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_shift (company_id, shift_code),
  INDEX idx_shift_company (company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS rosters (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  employee_id VARCHAR(36) NOT NULL,
  shift_id VARCHAR(36) NOT NULL,
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  roster_type VARCHAR(20) DEFAULT 'Fixed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (shift_id) REFERENCES shifts(id),
  INDEX idx_roster_emp (employee_id),
  INDEX idx_roster_shift (shift_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS overtime_requests (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  employee_id VARCHAR(36) NOT NULL,
  ot_date DATE NOT NULL,
  ot_hours DECIMAL(4,1) NOT NULL,
  ot_type VARCHAR(20) NOT NULL,
  rate_multiplier DECIMAL(3,2) DEFAULT 1.5,
  ot_amount DECIMAL(10,2),
  reason TEXT,
  status VARCHAR(20) DEFAULT 'Pending',
  approved_by VARCHAR(36),
  approved_at TIMESTAMP NULL,
  payroll_status VARCHAR(20) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_ot_emp (employee_id),
  INDEX idx_ot_status (status),
  INDEX idx_ot_date (ot_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- HR Policies
CREATE TABLE IF NOT EXISTS policies (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  company_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  policy_code VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  effective_date DATE NOT NULL,
  review_date DATE,
  version INT DEFAULT 1,
  requires_acknowledgement BOOLEAN DEFAULT TRUE,
  requires_quiz BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'Draft',
  published_by VARCHAR(36),
  published_at TIMESTAMP NULL,
  created_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  UNIQUE KEY uq_policy (company_id, policy_code, version),
  INDEX idx_policy_company_cat (company_id, category),
  INDEX idx_policy_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS policy_acknowledgements (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  policy_id VARCHAR(36) NOT NULL,
  employee_id VARCHAR(36) NOT NULL,
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_at TIMESTAMP NULL,
  quiz_score DECIMAL(5,2),
  status VARCHAR(20) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (policy_id) REFERENCES policies(id),
  UNIQUE KEY uq_pa (policy_id, employee_id),
  INDEX idx_pa_emp (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Payroll
CREATE TABLE IF NOT EXISTS salary_components (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  company_id VARCHAR(36) NOT NULL,
  component_name VARCHAR(100) NOT NULL,
  component_code VARCHAR(20) NOT NULL,
  component_type VARCHAR(20) NOT NULL,
  calculation_type VARCHAR(20) NOT NULL,
  is_taxable BOOLEAN DEFAULT TRUE,
  is_pf_applicable BOOLEAN DEFAULT FALSE,
  is_esi_applicable BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_sc (company_id, component_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS salary_structures (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  company_id VARCHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  components_json JSON,
  status VARCHAR(20) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  INDEX idx_ss_company (company_id),
  INDEX idx_ss_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS payroll_runs (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  company_id VARCHAR(36) NOT NULL,
  run_code VARCHAR(50) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_employees INT DEFAULT 0,
  total_earnings DECIMAL(14,2) DEFAULT 0,
  total_deductions DECIMAL(14,2) DEFAULT 0,
  total_net_pay DECIMAL(14,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'Draft',
  processed_by VARCHAR(36),
  processed_at TIMESTAMP NULL,
  approved_by VARCHAR(36),
  approved_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(36),
  UNIQUE KEY uq_pr (company_id, period_start, period_end),
  INDEX idx_pr_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS payroll_payslips (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  payroll_run_id VARCHAR(36) NOT NULL,
  employee_id VARCHAR(36) NOT NULL,
  gross_earnings DECIMAL(12,2) NOT NULL DEFAULT 0,
  pf_employee DECIMAL(12,2) NOT NULL DEFAULT 0,
  pf_employer DECIMAL(12,2) NOT NULL DEFAULT 0,
  income_tax DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_deductions DECIMAL(12,2) NOT NULL DEFAULT 0,
  net_pay DECIMAL(12,2) NOT NULL DEFAULT 0,
  earnings_json JSON,
  deductions_json JSON,
  status VARCHAR(20) DEFAULT 'Draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (payroll_run_id) REFERENCES payroll_runs(id),
  UNIQUE KEY uq_ps (payroll_run_id, employee_id),
  INDEX idx_ps_emp (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS expense_claims (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  employee_id VARCHAR(36) NOT NULL,
  claim_code VARCHAR(50) NOT NULL,
  expense_date DATE NOT NULL,
  category VARCHAR(50) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  description TEXT,
  receipt_url VARCHAR(500),
  status VARCHAR(20) DEFAULT 'Pending',
  approved_by VARCHAR(36),
  approved_at TIMESTAMP NULL,
  rejected_by VARCHAR(36),
  rejection_reason TEXT,
  reimbursement_status VARCHAR(20) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_exp_emp (employee_id),
  INDEX idx_exp_status (status),
  INDEX idx_exp_date (expense_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================================
-- Recruitment Pipeline
-- =============================================================================

CREATE TABLE IF NOT EXISTS requisitions (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  company_id VARCHAR(36) NOT NULL,
  department_id VARCHAR(36) NOT NULL,
  designation_id VARCHAR(36),
  requisition_code VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  positions_count INT NOT NULL DEFAULT 1,
  employment_type VARCHAR(30) NOT NULL DEFAULT 'Permanent',
  min_experience_years DECIMAL(4,1),
  max_experience_years DECIMAL(4,1),
  min_salary DECIMAL(12,2),
  max_salary DECIMAL(12,2),
  priority VARCHAR(20) DEFAULT 'Medium',
  required_by DATE,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'Draft',
  approved_by VARCHAR(36),
  approved_at TIMESTAMP NULL,
  rejected_reason TEXT,
  created_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  UNIQUE KEY uq_req_code (tenant_id, requisition_code),
  INDEX idx_req_tenant (tenant_id),
  INDEX idx_req_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS job_postings (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  company_id VARCHAR(36) NOT NULL,
  requisition_id VARCHAR(36),
  posting_code VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  department VARCHAR(255),
  location VARCHAR(255),
  employment_type VARCHAR(30) DEFAULT 'Full-time',
  work_mode VARCHAR(20) DEFAULT 'On-site',
  min_experience_years DECIMAL(4,1),
  max_experience_years DECIMAL(4,1),
  min_salary DECIMAL(12,2),
  max_salary DECIMAL(12,2),
  description TEXT,
  requirements TEXT,
  skills_required JSON,
  status VARCHAR(20) DEFAULT 'Draft',
  published_at TIMESTAMP NULL,
  closes_at DATE,
  applications_count INT DEFAULT 0,
  created_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  UNIQUE KEY uq_jp_code (tenant_id, posting_code),
  INDEX idx_jp_tenant (tenant_id),
  INDEX idx_jp_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS candidates (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  job_posting_id VARCHAR(36),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  mobile VARCHAR(15),
  source VARCHAR(50) DEFAULT 'Direct',
  current_ctc DECIMAL(12,2),
  expected_ctc DECIMAL(12,2),
  notice_period_days INT,
  total_experience_years DECIMAL(4,1),
  resume_url VARCHAR(500),
  stage VARCHAR(30) DEFAULT 'Applied',
  status VARCHAR(20) DEFAULT 'Active',
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_cand_tenant (tenant_id),
  INDEX idx_cand_job (job_posting_id),
  INDEX idx_cand_stage (stage),
  INDEX idx_cand_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS interview_schedules (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  candidate_id VARCHAR(36) NOT NULL,
  job_posting_id VARCHAR(36),
  round_number INT DEFAULT 1,
  interview_type VARCHAR(30) DEFAULT 'Technical',
  scheduled_at TIMESTAMP NOT NULL,
  duration_mins INT DEFAULT 60,
  mode VARCHAR(20) DEFAULT 'Video',
  location VARCHAR(255),
  meet_link VARCHAR(500),
  interviewers_json JSON,
  status VARCHAR(20) DEFAULT 'Scheduled',
  feedback TEXT,
  rating DECIMAL(3,1),
  outcome VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id),
  INDEX idx_int_tenant (tenant_id),
  INDEX idx_int_candidate (candidate_id),
  INDEX idx_int_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS job_offers (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  candidate_id VARCHAR(36) NOT NULL,
  job_posting_id VARCHAR(36),
  offer_code VARCHAR(50) NOT NULL,
  ctc_offered DECIMAL(12,2) NOT NULL,
  joining_date DATE,
  offer_letter_url VARCHAR(500),
  valid_until DATE,
  status VARCHAR(20) DEFAULT 'Pending',
  accepted_at TIMESTAMP NULL,
  rejected_at TIMESTAMP NULL,
  rejection_reason TEXT,
  created_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id),
  UNIQUE KEY uq_offer_code (tenant_id, offer_code),
  INDEX idx_offer_tenant (tenant_id),
  INDEX idx_offer_candidate (candidate_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================================
-- Performance Management
-- =============================================================================

CREATE TABLE IF NOT EXISTS performance_cycles (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  company_id VARCHAR(36) NOT NULL,
  cycle_name VARCHAR(255) NOT NULL,
  cycle_type VARCHAR(30) DEFAULT 'Annual',
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  self_review_deadline DATE,
  manager_review_deadline DATE,
  status VARCHAR(20) DEFAULT 'Planning',
  created_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_pc_tenant (tenant_id),
  INDEX idx_pc_company (company_id),
  INDEX idx_pc_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS performance_reviews (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  cycle_id VARCHAR(36) NOT NULL,
  employee_id VARCHAR(36) NOT NULL,
  reviewer_id VARCHAR(36),
  self_rating DECIMAL(3,1),
  self_comments TEXT,
  self_submitted_at TIMESTAMP NULL,
  manager_rating DECIMAL(3,1),
  manager_comments TEXT,
  manager_submitted_at TIMESTAMP NULL,
  final_rating DECIMAL(3,1),
  goals_json JSON,
  status VARCHAR(20) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cycle_id) REFERENCES performance_cycles(id),
  UNIQUE KEY uq_pr_emp_cycle (cycle_id, employee_id),
  INDEX idx_pr_tenant (tenant_id),
  INDEX idx_pr_employee (employee_id),
  INDEX idx_pr_reviewer (reviewer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================================
-- Assets
-- =============================================================================

CREATE TABLE IF NOT EXISTS assets (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  company_id VARCHAR(36) NOT NULL,
  asset_code VARCHAR(50) NOT NULL,
  asset_name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  brand VARCHAR(100),
  model VARCHAR(100),
  serial_number VARCHAR(100),
  purchase_date DATE,
  purchase_cost DECIMAL(12,2),
  warranty_expiry DATE,
  location VARCHAR(255),
  assigned_to VARCHAR(36),
  assigned_at TIMESTAMP NULL,
  status VARCHAR(20) DEFAULT 'Available',
  condition_status VARCHAR(20) DEFAULT 'Good',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  UNIQUE KEY uq_asset_code (tenant_id, asset_code),
  INDEX idx_asset_tenant (tenant_id),
  INDEX idx_asset_status (status),
  INDEX idx_asset_assigned (assigned_to)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS asset_allocations (
  id VARCHAR(36) PRIMARY KEY,
  asset_id VARCHAR(36) NOT NULL,
  employee_id VARCHAR(36) NOT NULL,
  allocated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  returned_at TIMESTAMP NULL,
  condition_at_alloc VARCHAR(20) DEFAULT 'Good',
  condition_at_return VARCHAR(20),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (asset_id) REFERENCES assets(id),
  INDEX idx_alloc_asset (asset_id),
  INDEX idx_alloc_emp (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================================
-- Grievance & Disciplinary
-- =============================================================================

CREATE TABLE IF NOT EXISTS grievances (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  employee_id VARCHAR(36) NOT NULL,
  grievance_code VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT FALSE,
  priority VARCHAR(20) DEFAULT 'Medium',
  status VARCHAR(20) DEFAULT 'Open',
  assigned_to VARCHAR(36),
  resolution TEXT,
  resolved_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_griev_code (tenant_id, grievance_code),
  INDEX idx_griev_tenant (tenant_id),
  INDEX idx_griev_emp (employee_id),
  INDEX idx_griev_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS disciplinary_cases (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  employee_id VARCHAR(36) NOT NULL,
  case_code VARCHAR(50) NOT NULL,
  incident_date DATE NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  action_taken VARCHAR(50),
  action_date DATE,
  action_by VARCHAR(36),
  status VARCHAR(20) DEFAULT 'Open',
  outcome TEXT,
  closed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_disc_code (tenant_id, case_code),
  INDEX idx_disc_tenant (tenant_id),
  INDEX idx_disc_emp (employee_id),
  INDEX idx_disc_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================================
-- Exit Management
-- =============================================================================

CREATE TABLE IF NOT EXISTS exit_cases (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  employee_id VARCHAR(36) NOT NULL,
  exit_type VARCHAR(30) NOT NULL,
  resignation_date DATE,
  last_working_day DATE,
  reason TEXT,
  exit_interview_done BOOLEAN DEFAULT FALSE,
  clearance_status VARCHAR(20) DEFAULT 'Pending',
  fnf_amount DECIMAL(12,2),
  fnf_processed_at TIMESTAMP NULL,
  fnf_processed_by VARCHAR(36),
  status VARCHAR(20) DEFAULT 'Initiated',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_exit_tenant (tenant_id),
  INDEX idx_exit_emp (employee_id),
  INDEX idx_exit_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================================
-- Platform — Helpdesk, AI, Automation, Reports, API
-- =============================================================================

CREATE TABLE IF NOT EXISTS helpdesk_tickets (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  ticket_code VARCHAR(50) NOT NULL,
  requester_id VARCHAR(36) NOT NULL,
  assignee_id VARCHAR(36),
  category VARCHAR(50) NOT NULL,
  priority VARCHAR(20) DEFAULT 'Medium',
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'Open',
  resolution TEXT,
  resolved_at TIMESTAMP NULL,
  first_response_at TIMESTAMP NULL,
  sla_breach BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_ticket_code (tenant_id, ticket_code),
  INDEX idx_ticket_tenant (tenant_id),
  INDEX idx_ticket_requester (requester_id),
  INDEX idx_ticket_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ticket_comments (
  id VARCHAR(36) PRIMARY KEY,
  ticket_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  comment TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES helpdesk_tickets(id),
  INDEX idx_tc_ticket (ticket_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ai_conversations (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  query TEXT NOT NULL,
  response TEXT NOT NULL,
  confidence DECIMAL(5,4),
  action_taken VARCHAR(100),
  needs_approval BOOLEAN DEFAULT FALSE,
  feedback VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ai_tenant (tenant_id),
  INDEX idx_ai_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS automation_workflows (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  workflow_name VARCHAR(255) NOT NULL,
  trigger_event VARCHAR(100) NOT NULL,
  conditions_json JSON,
  actions_json JSON NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  run_count INT DEFAULT 0,
  last_run_at TIMESTAMP NULL,
  created_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_wf_tenant (tenant_id),
  INDEX idx_wf_trigger (trigger_event)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS report_definitions (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  report_name VARCHAR(255) NOT NULL,
  module VARCHAR(50) NOT NULL,
  query_config JSON NOT NULL,
  columns_json JSON,
  filters_json JSON,
  is_scheduled BOOLEAN DEFAULT FALSE,
  schedule_cron VARCHAR(100),
  created_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_rpt_tenant (tenant_id),
  INDEX idx_rpt_module (module)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS api_keys (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  key_name VARCHAR(255) NOT NULL,
  prefix VARCHAR(10) NOT NULL,
  key_hash VARCHAR(255) NOT NULL,
  scopes JSON,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP NULL,
  last_used_at TIMESTAMP NULL,
  created_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_ak_tenant (tenant_id),
  INDEX idx_ak_prefix (prefix)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS webhook_configs (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  webhook_name VARCHAR(255) NOT NULL,
  url VARCHAR(1000) NOT NULL,
  secret VARCHAR(255),
  events JSON NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  retry_count INT DEFAULT 3,
  last_triggered_at TIMESTAMP NULL,
  failure_count INT DEFAULT 0,
  created_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_wh_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================================
-- Form Builder
-- =============================================================================

CREATE TABLE IF NOT EXISTS form_templates (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  company_id VARCHAR(36),
  form_code VARCHAR(50) NOT NULL,
  form_name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  fields_json JSON NOT NULL,
  status VARCHAR(20) DEFAULT 'Draft',
  version INT DEFAULT 1,
  published_at TIMESTAMP NULL,
  created_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  UNIQUE KEY uq_form_code (tenant_id, form_code),
  INDEX idx_form_tenant (tenant_id),
  INDEX idx_form_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS form_submissions (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  form_template_id VARCHAR(36) NOT NULL,
  submitted_by VARCHAR(36) NOT NULL,
  employee_id VARCHAR(36),
  data_json JSON NOT NULL,
  status VARCHAR(20) DEFAULT 'Submitted',
  reviewed_by VARCHAR(36),
  reviewed_at TIMESTAMP NULL,
  review_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (form_template_id) REFERENCES form_templates(id),
  INDEX idx_fs_template (form_template_id),
  INDEX idx_fs_submitted_by (submitted_by),
  INDEX idx_fs_employee (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================================
-- Holidays
-- =============================================================================

CREATE TABLE IF NOT EXISTS holidays (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  company_id VARCHAR(36) NOT NULL,
  holiday_name VARCHAR(255) NOT NULL,
  holiday_date DATE NOT NULL,
  holiday_type VARCHAR(30) DEFAULT 'National',
  is_optional BOOLEAN DEFAULT FALSE,
  year INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_hol (company_id, holiday_date),
  INDEX idx_hol_company_year (company_id, year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================================
-- Training
-- =============================================================================

CREATE TABLE IF NOT EXISTS training_programs (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  company_id VARCHAR(36) NOT NULL,
  program_code VARCHAR(50) NOT NULL,
  program_name VARCHAR(255) NOT NULL,
  category VARCHAR(50),
  vendor VARCHAR(255),
  mode VARCHAR(20) DEFAULT 'Online',
  duration_days INT,
  cost DECIMAL(12,2),
  start_date DATE,
  end_date DATE,
  max_participants INT,
  location VARCHAR(255),
  description TEXT,
  status VARCHAR(20) DEFAULT 'Planned',
  created_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_tp_code (tenant_id, program_code),
  INDEX idx_tp_tenant (tenant_id),
  INDEX idx_tp_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS training_enrollments (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  program_id VARCHAR(36) NOT NULL,
  employee_id VARCHAR(36) NOT NULL,
  status VARCHAR(20) DEFAULT 'Enrolled',
  attendance DECIMAL(5,2),
  score DECIMAL(5,2),
  completion_date DATE,
  certificate_url VARCHAR(500),
  feedback TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (program_id) REFERENCES training_programs(id),
  UNIQUE KEY uq_enroll (program_id, employee_id),
  INDEX idx_enroll_emp (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

export async function setupDatabase() {
  const connection = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    multipleStatements: true,
  });

  try {
    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config.db.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await connection.query(`USE \`${config.db.database}\``);

    // Execute schema
    await connection.query(SCHEMA);
    console.log('✅ Database schema created successfully');
  } catch (err) {
    console.error('❌ Schema setup failed:', err);
    throw err;
  } finally {
    await connection.end();
  }
}

// Run directly
setupDatabase().catch(console.error);
