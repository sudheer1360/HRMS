-- ============================================================
-- Migration: Add missing module tables
-- Run: mysql -u root -p hrms < migrate-missing-modules.sql
-- ============================================================

-- ── Training & Development ────────────────────────────────────

CREATE TABLE IF NOT EXISTS training_programs (
  id            VARCHAR(36)  NOT NULL PRIMARY KEY,
  tenant_id     VARCHAR(36)  NOT NULL,
  title         VARCHAR(255) NOT NULL,
  description   TEXT,
  category      VARCHAR(100) DEFAULT 'General',
  mode          VARCHAR(50)  DEFAULT 'Online',
  duration_hours DECIMAL(5,1),
  max_participants INT,
  trainer_name  VARCHAR(255),
  start_date    DATE,
  end_date      DATE,
  status        VARCHAR(50)  NOT NULL DEFAULT 'Active',
  created_by    VARCHAR(36),
  deleted_at    DATETIME,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS training_sessions (
  id            VARCHAR(36)  NOT NULL PRIMARY KEY,
  tenant_id     VARCHAR(36)  NOT NULL,
  program_id    VARCHAR(36)  NOT NULL,
  session_date  DATE         NOT NULL,
  start_time    TIME,
  end_time      TIME,
  venue         VARCHAR(255),
  trainer_name  VARCHAR(255),
  max_seats     INT          DEFAULT 30,
  seats_booked  INT          DEFAULT 0,
  status        VARCHAR(50)  NOT NULL DEFAULT 'Scheduled',
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tenant (tenant_id),
  INDEX idx_program (program_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS training_enrollments (
  id            VARCHAR(36)  NOT NULL PRIMARY KEY,
  tenant_id     VARCHAR(36)  NOT NULL,
  program_id    VARCHAR(36)  NOT NULL,
  session_id    VARCHAR(36),
  employee_id   VARCHAR(36)  NOT NULL,
  enrolled_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
  completion_date DATE,
  score         DECIMAL(5,2),
  status        VARCHAR(50)  NOT NULL DEFAULT 'Enrolled',
  feedback      TEXT,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tenant (tenant_id),
  INDEX idx_employee (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS skill_matrix (
  id            VARCHAR(36)  NOT NULL PRIMARY KEY,
  tenant_id     VARCHAR(36)  NOT NULL,
  employee_id   VARCHAR(36)  NOT NULL,
  skill_name    VARCHAR(255) NOT NULL,
  category      VARCHAR(100),
  proficiency   VARCHAR(50)  DEFAULT 'Beginner',
  years_exp     DECIMAL(4,1),
  last_used_year INT,
  certified     TINYINT(1)   DEFAULT 0,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tenant (tenant_id),
  INDEX idx_employee (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS employee_certifications (
  id              VARCHAR(36)  NOT NULL PRIMARY KEY,
  tenant_id       VARCHAR(36)  NOT NULL,
  employee_id     VARCHAR(36)  NOT NULL,
  certification_name VARCHAR(255) NOT NULL,
  issuing_body    VARCHAR(255),
  issued_date     DATE,
  expiry_date     DATE,
  credential_id   VARCHAR(255),
  status          VARCHAR(50)  NOT NULL DEFAULT 'Active',
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tenant (tenant_id),
  INDEX idx_employee (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Offer & Joining ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS salary_fitments (
  id              VARCHAR(36)  NOT NULL PRIMARY KEY,
  tenant_id       VARCHAR(36)  NOT NULL,
  candidate_id    VARCHAR(36),
  offer_id        VARCHAR(36),
  basic_salary    DECIMAL(12,2) NOT NULL DEFAULT 0,
  hra             DECIMAL(12,2) DEFAULT 0,
  allowances      JSON,
  deductions      JSON,
  gross_salary    DECIMAL(12,2) NOT NULL DEFAULT 0,
  net_salary      DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_by      VARCHAR(36),
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS joining_formalities (
  id                    VARCHAR(36)  NOT NULL PRIMARY KEY,
  tenant_id             VARCHAR(36)  NOT NULL,
  employee_id           VARCHAR(36),
  offer_id              VARCHAR(36),
  joining_date          DATE         NOT NULL,
  documents_verified    TINYINT(1)   DEFAULT 0,
  system_access_created TINYINT(1)   DEFAULT 0,
  id_card_issued        TINYINT(1)   DEFAULT 0,
  induction_scheduled   TINYINT(1)   DEFAULT 0,
  status                VARCHAR(50)  NOT NULL DEFAULT 'Pending',
  created_by            VARCHAR(36),
  created_at            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS appointment_letters (
  id              VARCHAR(36)  NOT NULL PRIMARY KEY,
  tenant_id       VARCHAR(36)  NOT NULL,
  candidate_id    VARCHAR(36),
  offer_id        VARCHAR(36),
  letter_code     VARCHAR(100) NOT NULL,
  designation     VARCHAR(255) NOT NULL,
  department      VARCHAR(255) NOT NULL,
  joining_date    DATE         NOT NULL,
  ctc             DECIMAL(12,2) NOT NULL DEFAULT 0,
  letter_content  LONGTEXT,
  status          VARCHAR(50)  NOT NULL DEFAULT 'Draft',
  sent_at         DATETIME,
  signed_at       DATETIME,
  created_by      VARCHAR(36),
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Travel ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS travel_requests (
  id              VARCHAR(36)  NOT NULL PRIMARY KEY,
  tenant_id       VARCHAR(36)  NOT NULL,
  employee_id     VARCHAR(36)  NOT NULL,
  travel_code     VARCHAR(100) NOT NULL,
  destination     VARCHAR(255) NOT NULL,
  purpose         TEXT         NOT NULL,
  departure_date  DATE         NOT NULL,
  return_date     DATE         NOT NULL,
  travel_mode     VARCHAR(50)  DEFAULT 'Air',
  estimated_cost  DECIMAL(12,2) DEFAULT 0,
  itinerary       JSON,
  status          VARCHAR(50)  NOT NULL DEFAULT 'Pending',
  approved_by     VARCHAR(36),
  approved_at     DATETIME,
  submitted_date  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  created_by      VARCHAR(36),
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tenant (tenant_id),
  INDEX idx_employee (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS travel_expenses (
  id                  VARCHAR(36)  NOT NULL PRIMARY KEY,
  tenant_id           VARCHAR(36)  NOT NULL,
  employee_id         VARCHAR(36)  NOT NULL,
  claim_code          VARCHAR(100) NOT NULL,
  travel_request_id   VARCHAR(36),
  category            VARCHAR(100) NOT NULL,
  description         TEXT,
  amount              DECIMAL(12,2) NOT NULL DEFAULT 0,
  receipt_date        DATE         NOT NULL,
  status              VARCHAR(50)  NOT NULL DEFAULT 'Pending',
  approved_by         VARCHAR(36),
  approved_date       DATETIME,
  created_by          VARCHAR(36),
  created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tenant (tenant_id),
  INDEX idx_employee (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS travel_advances (
  id                  VARCHAR(36)  NOT NULL PRIMARY KEY,
  tenant_id           VARCHAR(36)  NOT NULL,
  employee_id         VARCHAR(36)  NOT NULL,
  advance_code        VARCHAR(100) NOT NULL,
  travel_request_id   VARCHAR(36),
  purpose             TEXT,
  amount              DECIMAL(12,2) NOT NULL DEFAULT 0,
  disbursed_date      DATETIME,
  settled_date        DATETIME,
  settled_amount      DECIMAL(12,2) DEFAULT 0,
  remaining_amount    DECIMAL(12,2) DEFAULT 0,
  status              VARCHAR(50)  NOT NULL DEFAULT 'Requested',
  created_by          VARCHAR(36),
  created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tenant (tenant_id),
  INDEX idx_employee (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Compliance ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS compliance_events (
  id              VARCHAR(36)  NOT NULL PRIMARY KEY,
  tenant_id       VARCHAR(36)  NOT NULL,
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  event_type      VARCHAR(100) DEFAULT 'Regulatory',
  due_date        DATE         NOT NULL,
  frequency       VARCHAR(50)  DEFAULT 'One-time',
  status          VARCHAR(50)  NOT NULL DEFAULT 'Pending',
  completed_at    DATETIME,
  created_by      VARCHAR(36),
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS compliance_filings (
  id               VARCHAR(36)  NOT NULL PRIMARY KEY,
  tenant_id        VARCHAR(36)  NOT NULL,
  filing_type      VARCHAR(100) NOT NULL,
  period           VARCHAR(50)  NOT NULL,
  filing_date      DATE         NOT NULL,
  due_date         DATE,
  status           VARCHAR(50)  NOT NULL DEFAULT 'Filed',
  amount_paid      DECIMAL(12,2),
  reference_number VARCHAR(255),
  created_by       VARCHAR(36),
  created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS compliance_reports (
  id              VARCHAR(36)  NOT NULL PRIMARY KEY,
  tenant_id       VARCHAR(36)  NOT NULL,
  report_name     VARCHAR(255) NOT NULL,
  report_type     VARCHAR(100),
  period          VARCHAR(50),
  generated_at    DATETIME     DEFAULT CURRENT_TIMESTAMP,
  generated_by    VARCHAR(36),
  file_url        VARCHAR(1000),
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS compliance_checklist (
  id              VARCHAR(36)  NOT NULL PRIMARY KEY,
  tenant_id       VARCHAR(36)  NOT NULL,
  item_name       VARCHAR(255) NOT NULL,
  description     TEXT,
  category        VARCHAR(100),
  due_date        DATE,
  assigned_to     VARCHAR(36),
  status          VARCHAR(50)  NOT NULL DEFAULT 'Pending',
  completed_at    DATETIME,
  created_by      VARCHAR(36),
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS compliance_documents (
  id                VARCHAR(36)  NOT NULL PRIMARY KEY,
  tenant_id         VARCHAR(36)  NOT NULL,
  document_name     VARCHAR(255) NOT NULL,
  document_type     VARCHAR(100) DEFAULT 'License',
  issued_date       DATE,
  expiry_date       DATE,
  issuing_authority VARCHAR(255),
  status            VARCHAR(50)  NOT NULL DEFAULT 'Active',
  created_by        VARCHAR(36),
  created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Compensation ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS compensation_cycles (
  id              VARCHAR(36)  NOT NULL PRIMARY KEY,
  tenant_id       VARCHAR(36)  NOT NULL,
  cycle_name      VARCHAR(255) NOT NULL,
  cycle_type      VARCHAR(50)  DEFAULT 'Annual',
  period_start    DATE         NOT NULL,
  period_end      DATE         NOT NULL,
  budget_percent  DECIMAL(5,2),
  status          VARCHAR(50)  NOT NULL DEFAULT 'Planning',
  created_by      VARCHAR(36),
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS employee_bonuses (
  id              VARCHAR(36)  NOT NULL PRIMARY KEY,
  tenant_id       VARCHAR(36)  NOT NULL,
  employee_id     VARCHAR(36)  NOT NULL,
  cycle_id        VARCHAR(36),
  bonus_type      VARCHAR(100) DEFAULT 'Performance',
  amount          DECIMAL(12,2) NOT NULL DEFAULT 0,
  payment_date    DATE,
  status          VARCHAR(50)  NOT NULL DEFAULT 'Pending',
  created_by      VARCHAR(36),
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tenant (tenant_id),
  INDEX idx_employee (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS employee_loans (
  id               VARCHAR(36)  NOT NULL PRIMARY KEY,
  tenant_id        VARCHAR(36)  NOT NULL,
  employee_id      VARCHAR(36)  NOT NULL,
  loan_type        VARCHAR(100) DEFAULT 'Personal',
  principal_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  tenure_months    INT          DEFAULT 12,
  emi_amount       DECIMAL(12,2),
  interest_rate    DECIMAL(5,2) DEFAULT 0,
  disbursement_date DATE,
  outstanding_amount DECIMAL(12,2),
  status           VARCHAR(50)  NOT NULL DEFAULT 'Requested',
  created_by       VARCHAR(36),
  created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tenant (tenant_id),
  INDEX idx_employee (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS variable_pay (
  id              VARCHAR(36)  NOT NULL PRIMARY KEY,
  tenant_id       VARCHAR(36)  NOT NULL,
  employee_id     VARCHAR(36)  NOT NULL,
  cycle_id        VARCHAR(36),
  component_name  VARCHAR(255) NOT NULL,
  target_amount   DECIMAL(12,2) DEFAULT 0,
  achieved_amount DECIMAL(12,2) DEFAULT 0,
  achievement_pct DECIMAL(5,2)  DEFAULT 0,
  payout_amount   DECIMAL(12,2) DEFAULT 0,
  payout_date     DATE,
  status          VARCHAR(50)  NOT NULL DEFAULT 'Pending',
  created_by      VARCHAR(36),
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tenant (tenant_id),
  INDEX idx_employee (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ctc_revisions (
  id              VARCHAR(36)  NOT NULL PRIMARY KEY,
  tenant_id       VARCHAR(36)  NOT NULL,
  employee_id     VARCHAR(36)  NOT NULL,
  cycle_id        VARCHAR(36),
  previous_ctc    DECIMAL(12,2) DEFAULT 0,
  revised_ctc     DECIMAL(12,2) NOT NULL DEFAULT 0,
  hike_percent    DECIMAL(5,2),
  effective_date  DATE         NOT NULL,
  reason          TEXT,
  status          VARCHAR(50)  NOT NULL DEFAULT 'Pending',
  approved_by     VARCHAR(36),
  approved_at     DATETIME,
  created_by      VARCHAR(36),
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tenant (tenant_id),
  INDEX idx_employee (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SELECT 'Migration complete: all missing module tables created.' AS result;
