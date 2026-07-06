import { query, insert } from '../../config/database.js';
import bcrypt from 'bcrypt';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function uuid(n: number) { return `${String(n).padStart(8,'0')}-0000-0000-0000-000000000000`; }

function daysBefore(n: number, base = '2026-06-15'): string {
  const d = new Date(base);
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export async function seed() {
  console.log('Seeding HRMS database...');

  // ── 1. Clean slate ────────────────────────────────────────────────────────
  await query('SET FOREIGN_KEY_CHECKS = 0');
  const tables = [
    'form_submissions','form_templates',
    'ai_conversations','automation_workflows','webhook_configs','api_keys','report_definitions',
    'helpdesk_tickets','ticket_comments',
    'policy_acknowledgements','policies',
    'exit_cases','disciplinary_cases','grievances',
    'asset_allocations','assets',
    'performance_reviews','performance_cycles',
    'job_offers','interview_schedules','candidates','job_postings','requisitions',
    'training_enrollments','training_programs',
    'expense_claims','payroll_payslips','payroll_runs','salary_structures','salary_components',
    'overtime_requests','rosters','shifts',
    'leave_applications','leave_balances','leave_policies','leave_types','holidays',
    'attendance_locks','attendance_correction_requests','attendance_logs',
    'notifications','login_logs','audit_logs','refresh_tokens',
    'user_roles','role_permissions','permissions','roles','users',
    'employee_status_logs','employment_history','employee_documents','employee_family','employee_banks','employee_statutory','employees',
    'cost_centers','grades','designations','departments','branches','companies','tenants',
  ];
  for (const t of tables) { try { await query(`DELETE FROM \`${t}\``); } catch { /* table may not exist yet */ } }
  await query('SET FOREIGN_KEY_CHECKS = 1');
  console.log('Cleaned existing data');

  // ── 2. Tenant ─────────────────────────────────────────────────────────────
  const tenantId = uuid(1);
  await query(
    `INSERT INTO tenants (id, tenant_name, tenant_code, subscription_plan, status, max_companies, max_employees)
     VALUES (?, 'Acme Global HR', 'ACME', 'Enterprise', 'Active', 5, 50000)`,
    [tenantId]
  );

  // ── 3. Company ────────────────────────────────────────────────────────────
  const companyId = uuid(2);
  await query(
    `INSERT INTO companies (id, tenant_id, company_name, legal_name, company_code, registered_address, email, phone, currency, timezone, status)
     VALUES (?, ?, 'Acme Corp', 'Acme Corporation Pvt Ltd', 'ACME001', '123 Business Park, Andheri East, Mumbai 400069', 'hr@acmecorp.com', '+912212345678', 'INR', 'Asia/Kolkata', 'Active')`,
    [companyId, tenantId]
  );

  // ── 4. Branch ─────────────────────────────────────────────────────────────
  const branchId = uuid(3);
  await query(
    `INSERT INTO branches (id, company_id, branch_name, branch_code, branch_type, address, city, state, country, pin_code, is_payroll_location, status)
     VALUES (?, ?, 'Mumbai Head Office', 'MUM-HO', 'office', '123 Business Park, Andheri East', 'Mumbai', 'Maharashtra', 'India', '400069', TRUE, 'Active')`,
    [branchId, companyId]
  );

  // ── 5. Departments ────────────────────────────────────────────────────────
  const deptData: [string, string, string, null][] = [
    [uuid(10), 'Human Resources',  'HR',    null],
    [uuid(11), 'Engineering',      'ENG',   null],
    [uuid(12), 'Finance',          'FIN',   null],
    [uuid(13), 'Sales',            'SALES', null],
    [uuid(14), 'Operations',       'OPS',   null],
    [uuid(15), 'Marketing',        'MKT',   null],
  ];
  for (const [id, name, code, parent] of deptData) {
    await query(
      `INSERT INTO departments (id, company_id, branch_id, department_name, department_code, parent_department_id, status)
       VALUES (?, ?, ?, ?, ?, ?, 'Active')`,
      [id, companyId, branchId, name, code, parent]
    );
  }
  const [hrDeptId, engDeptId, finDeptId, salesDeptId, opsDeptId, mktDeptId] = deptData.map(d => d[0]);

  // ── 6. Designations ───────────────────────────────────────────────────────
  const desigData: [string, string, string, number][] = [
    [uuid(20), 'Chief Executive Officer',   'CEO',     1],
    [uuid(21), 'HR Manager',                'HRM',     2],
    [uuid(22), 'HR Executive',              'HRE',     3],
    [uuid(23), 'Software Engineer',         'SE',      3],
    [uuid(24), 'Senior Software Engineer',  'SSE',     2],
    [uuid(25), 'Engineering Manager',       'EM',      1],
    [uuid(26), 'Finance Manager',           'FM',      2],
    [uuid(27), 'Accountant',                'ACCT',    3],
    [uuid(28), 'Sales Executive',           'SALESEX', 3],
    [uuid(29), 'Sales Manager',             'SM',      2],
    [uuid(30), 'DevOps Engineer',           'DEVOPS',  3],
    [uuid(31), 'Product Manager',           'PM',      2],
    [uuid(32), 'QA Engineer',               'QA',      3],
    [uuid(33), 'Marketing Executive',       'MKTEX',   3],
  ];
  for (const [id, name, code, level] of desigData) {
    await query(
      `INSERT INTO designations (id, company_id, designation_name, designation_code, level, status)
       VALUES (?, ?, ?, ?, ?, 'Active')`,
      [id, companyId, name, code, level]
    );
  }

  // ── 7. Grades ─────────────────────────────────────────────────────────────
  const gradeData = [
    [uuid(40), 'E1', 'Entry Level',      300000,   700000],
    [uuid(41), 'E2', 'Mid Level',        700000,  1500000],
    [uuid(42), 'M1', 'Manager Level',   1500000,  3000000],
    [uuid(43), 'M2', 'Senior Manager',  3000000,  6000000],
    [uuid(44), 'L1', 'Leadership',      6000000, 20000000],
  ];
  for (const [id, code, name, min, max] of gradeData) {
    await query(
      `INSERT INTO grades (id, company_id, grade_name, grade_code, min_salary, max_salary, status)
       VALUES (?, ?, ?, ?, ?, ?, 'Active')`,
      [id, companyId, name, code, min, max]
    );
  }

  // ── 8. Roles ──────────────────────────────────────────────────────────────
  const roleMap: Record<string, string> = {};
  const roleList = [
    ['Super Admin',   'Full system access'],
    ['HR Admin',      'Full HR module access'],
    ['HR Executive',  'Employee management and leave/attendance'],
    ['Payroll Admin', 'Payroll processing access'],
    ['Manager',       'Team management — approve leaves, attendance'],
    ['Employee',      'Self-service access'],
    ['Auditor',       'Read-only access across all modules'],
    ['Recruiter',     'Recruitment module access'],
  ];
  for (const [name, desc] of roleList) {
    const id = `role-${name.toLowerCase().replace(/\s+/g, '-')}`;
    await query(`INSERT IGNORE INTO roles (id, tenant_id, name, description, is_system) VALUES (?, ?, ?, ?, TRUE)`,
      [id, tenantId, name, desc]);
    roleMap[name] = id;
  }

  // ── 9. Permissions ────────────────────────────────────────────────────────
  const perms: [string, string, string][] = [
    ['ORG_VIEW','ORGANIZATION','VIEW'],   ['ORG_CREATE','ORGANIZATION','CREATE'], ['ORG_EDIT','ORGANIZATION','EDIT'],
    ['EMP_VIEW','EMPLOYEE','VIEW'],       ['EMP_CREATE','EMPLOYEE','CREATE'],     ['EMP_EDIT','EMPLOYEE','EDIT'],       ['EMP_DELETE','EMPLOYEE','DELETE'],
    ['ATTN_VIEW','ATTENDANCE','VIEW'],    ['ATTN_CREATE','ATTENDANCE','CREATE'],  ['ATTN_APPROVE','ATTENDANCE','APPROVE'],
    ['LEAVE_VIEW','LEAVE','VIEW'],        ['LEAVE_APPLY','LEAVE','APPLY'],        ['LEAVE_APPROVE','LEAVE','APPROVE'],  ['LEAVE_CREATE','LEAVE','CREATE'],  ['LEAVE_EDIT','LEAVE','EDIT'],  ['LEAVE_DELETE','LEAVE','DELETE'],
    ['SHIFT_VIEW','SHIFT','VIEW'],        ['SHIFT_CREATE','SHIFT','CREATE'],
    ['OT_VIEW','OT','VIEW'],              ['OT_APPROVE','OT','APPROVE'],
    ['PAYROLL_VIEW','PAYROLL','VIEW'],    ['PAYROLL_RUN','PAYROLL','RUN'],        ['PAYROLL_APPROVE','PAYROLL','APPROVE'],
    ['RECR_VIEW','RECR','VIEW'],          ['RECR_CREATE','RECR','CREATE'],
    ['PERF_VIEW','PERF','VIEW'],          ['PERF_CREATE','PERF','CREATE'],        ['PERF_EDIT','PERF','EDIT'],
    ['ASSET_VIEW','ASSET','VIEW'],        ['ASSET_CREATE','ASSET','CREATE'],      ['ASSET_EDIT','ASSET','EDIT'],
    ['EXIT_VIEW','EXIT','VIEW'],          ['EXIT_EDIT','EXIT','EDIT'],
    ['POLICY_VIEW','POLICY','VIEW'],      ['POLICY_CREATE','POLICY','CREATE'],
    ['TICKET_VIEW','TICKET','VIEW'],
    ['REPORT_VIEW','REPORT','VIEW'],
    ['FORM_CREATE','FORM','CREATE'],
    ['STAT_VIEW','STAT','VIEW'],
  ];
  const permIdMap: Record<string, string> = {};
  for (const [code, module, action] of perms) {
    const id = `perm-${code.toLowerCase()}`;
    await query(`INSERT IGNORE INTO permissions (id, code, module, action) VALUES (?, ?, ?, ?)`, [id, code, module, action]);
    permIdMap[code] = id;
  }
  for (const permId of Object.values(permIdMap)) {
    await query(`INSERT IGNORE INTO role_permissions (id, role_id, permission_id) VALUES (UUID(), ?, ?)`, [roleMap['Super Admin'], permId]);
  }
  for (const permId of Object.values(permIdMap)) {
    await query(`INSERT IGNORE INTO role_permissions (id, role_id, permission_id) VALUES (UUID(), ?, ?)`, [roleMap['HR Admin'], permId]);
  }
  for (const code of ['EMP_VIEW','ATTN_VIEW','ATTN_CREATE','LEAVE_VIEW','LEAVE_APPLY','POLICY_VIEW','TICKET_VIEW']) {
    await query(`INSERT IGNORE INTO role_permissions (id, role_id, permission_id) VALUES (UUID(), ?, ?)`, [roleMap['Employee'], permIdMap[code]]);
  }
  for (const code of ['EMP_VIEW','ATTN_VIEW','ATTN_APPROVE','LEAVE_VIEW','LEAVE_APPROVE','OT_VIEW','OT_APPROVE','PERF_VIEW','PERF_EDIT','POLICY_VIEW']) {
    await query(`INSERT IGNORE INTO role_permissions (id, role_id, permission_id) VALUES (UUID(), ?, ?)`, [roleMap['Manager'], permIdMap[code]]);
  }
  for (const code of ['PAYROLL_VIEW','PAYROLL_RUN','PAYROLL_APPROVE','EMP_VIEW','REPORT_VIEW']) {
    await query(`INSERT IGNORE INTO role_permissions (id, role_id, permission_id) VALUES (UUID(), ?, ?)`, [roleMap['Payroll Admin'], permIdMap[code]]);
  }
  console.log('Roles and permissions seeded');

  // ── 10. Users & Employees ─────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Admin@123', 12);

  type EmpDef = {
    userId: string; empId: string; email: string; name: string;
    firstName: string; lastName: string; role: string;
    deptId: string; desigIdx: number; ctc: number;
    gender: string; dob: string; joined: string;
    status: string; mgr: string | null;
  };

  const empDefs: EmpDef[] = [
    // Original 9 employees
    { userId: uuid(100), empId: uuid(200), email: 'admin@hrms.com',        name: 'System Administrator', firstName: 'System',  lastName: 'Administrator', role: 'Super Admin',  deptId: hrDeptId,    desigIdx: 0,  ctc: 5000000, gender: 'Male',   dob: '1980-05-10', joined: '2020-01-01', status: 'Confirmed', mgr: null },
    { userId: uuid(101), empId: uuid(201), email: 'hr.manager@hrms.com',   name: 'Priya Sharma',         firstName: 'Priya',  lastName: 'Sharma',        role: 'HR Admin',     deptId: hrDeptId,    desigIdx: 1,  ctc: 1800000, gender: 'Female', dob: '1985-03-12', joined: '2021-03-15', status: 'Confirmed', mgr: uuid(200) },
    { userId: uuid(102), empId: uuid(202), email: 'hr.exec@hrms.com',      name: 'Riya Patel',           firstName: 'Riya',   lastName: 'Patel',         role: 'HR Executive', deptId: hrDeptId,    desigIdx: 2,  ctc: 900000,  gender: 'Female', dob: '1993-07-22', joined: '2022-06-01', status: 'Confirmed', mgr: uuid(201) },
    { userId: uuid(103), empId: uuid(203), email: 'eng.manager@hrms.com',  name: 'Arjun Nair',           firstName: 'Arjun',  lastName: 'Nair',          role: 'Manager',      deptId: engDeptId,   desigIdx: 5,  ctc: 2500000, gender: 'Male',   dob: '1983-11-08', joined: '2020-07-01', status: 'Confirmed', mgr: uuid(200) },
    { userId: uuid(104), empId: uuid(204), email: 'dev1@hrms.com',         name: 'Vikram Singh',         firstName: 'Vikram', lastName: 'Singh',         role: 'Employee',     deptId: engDeptId,   desigIdx: 4,  ctc: 1400000, gender: 'Male',   dob: '1990-02-14', joined: '2021-08-16', status: 'Confirmed', mgr: uuid(203) },
    { userId: uuid(105), empId: uuid(205), email: 'dev2@hrms.com',         name: 'Ananya Menon',         firstName: 'Ananya', lastName: 'Menon',         role: 'Employee',     deptId: engDeptId,   desigIdx: 3,  ctc: 900000,  gender: 'Female', dob: '1995-09-30', joined: '2023-01-09', status: 'Confirmed', mgr: uuid(203) },
    { userId: uuid(106), empId: uuid(206), email: 'finance.mgr@hrms.com',  name: 'Suresh Kumar',         firstName: 'Suresh', lastName: 'Kumar',         role: 'Manager',      deptId: finDeptId,   desigIdx: 6,  ctc: 2000000, gender: 'Male',   dob: '1982-12-01', joined: '2020-04-01', status: 'Confirmed', mgr: uuid(200) },
    { userId: uuid(107), empId: uuid(207), email: 'sales.exec@hrms.com',   name: 'Deepa Reddy',          firstName: 'Deepa',  lastName: 'Reddy',         role: 'Employee',     deptId: salesDeptId, desigIdx: 8,  ctc: 800000,  gender: 'Female', dob: '1994-06-18', joined: '2023-04-03', status: 'Confirmed', mgr: null },
    { userId: uuid(108), empId: uuid(208), email: 'payroll@hrms.com',      name: 'Kavya Iyer',           firstName: 'Kavya',  lastName: 'Iyer',          role: 'Payroll Admin',deptId: finDeptId,   desigIdx: 7,  ctc: 1100000, gender: 'Female', dob: '1989-04-05', joined: '2021-10-11', status: 'Confirmed', mgr: uuid(206) },
    // Additional 6 employees
    { userId: uuid(109), empId: uuid(209), email: 'rahul.verma@hrms.com',  name: 'Rahul Verma',          firstName: 'Rahul',  lastName: 'Verma',         role: 'Employee',     deptId: engDeptId,   desigIdx: 10, ctc: 950000,  gender: 'Male',   dob: '1992-08-20', joined: '2022-11-07', status: 'Confirmed', mgr: uuid(203) },
    { userId: uuid(110), empId: uuid(210), email: 'neha.joshi@hrms.com',   name: 'Neha Joshi',           firstName: 'Neha',   lastName: 'Joshi',         role: 'Employee',     deptId: hrDeptId,    desigIdx: 2,  ctc: 780000,  gender: 'Female', dob: '1996-01-15', joined: '2024-04-01', status: 'Probation', mgr: uuid(201) },
    { userId: uuid(111), empId: uuid(211), email: 'karan.mehta@hrms.com',  name: 'Karan Mehta',          firstName: 'Karan',  lastName: 'Mehta',         role: 'Employee',     deptId: engDeptId,   desigIdx: 11, ctc: 1800000, gender: 'Male',   dob: '1988-03-25', joined: '2021-05-17', status: 'Confirmed', mgr: uuid(203) },
    { userId: uuid(112), empId: uuid(212), email: 'meena.pillai@hrms.com', name: 'Meena Pillai',         firstName: 'Meena',  lastName: 'Pillai',        role: 'Employee',     deptId: salesDeptId, desigIdx: 9,  ctc: 1500000, gender: 'Female', dob: '1986-09-22', joined: '2021-01-04', status: 'Confirmed', mgr: null },
    { userId: uuid(113), empId: uuid(213), email: 'ravi.nair@hrms.com',    name: 'Ravi Nair',            firstName: 'Ravi',   lastName: 'Nair',          role: 'Employee',     deptId: engDeptId,   desigIdx: 12, ctc: 820000,  gender: 'Male',   dob: '1997-04-11', joined: '2024-06-10', status: 'Probation', mgr: uuid(203) },
    { userId: uuid(114), empId: uuid(214), email: 'amit.sharma@hrms.com',  name: 'Amit Sharma',          firstName: 'Amit',   lastName: 'Sharma',        role: 'Employee',     deptId: mktDeptId,   desigIdx: 13, ctc: 720000,  gender: 'Male',   dob: '1995-07-30', joined: '2023-09-11', status: 'Confirmed', mgr: null },
  ];

  const empCodes = empDefs.map((_, i) => `EMP-${String(i + 1).padStart(3, '0')}`);

  for (let i = 0; i < empDefs.length; i++) {
    const e = empDefs[i];
    await query(
      `INSERT INTO users (id, tenant_id, email, password_hash, full_name, is_active) VALUES (?, ?, ?, ?, ?, TRUE)`,
      [e.userId, tenantId, e.email, passwordHash, e.name]
    );
    await query(`INSERT INTO user_roles (id, user_id, role_id) VALUES (UUID(), ?, ?)`, [e.userId, roleMap[e.role]]);
    await query(
      `INSERT INTO employees
         (id, tenant_id, company_id, branch_id, department_id, designation_id, employee_code,
          first_name, last_name, email, mobile, date_of_joining, date_of_birth, gender,
          employment_type, work_type, cost_to_company, status, employment_status, user_id,
          reporting_manager_id, probation_months, confirmation_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Permanent', 'On-site', ?, 'Active', ?, ?, ?, 6, ?)`,
      [e.empId, tenantId, companyId, branchId, e.deptId, desigData[e.desigIdx][0],
       empCodes[i], e.firstName, e.lastName, e.email, `98765${String(i).padStart(5,'0')}`,
       e.joined, e.dob, e.gender, e.ctc, e.status, e.userId, e.mgr,
       e.status === 'Probation' ? null : daysBefore(0, daysBefore(-180, e.joined))]
    );
    // Statutory
    try {
      await query(
        `INSERT INTO employee_statutory (id, employee_id, pan_masked, uan, pf_number) VALUES (UUID(), ?, ?, ?, ?)`,
        [e.empId, `ABCP${String(i+1).padStart(4,'0')}Z`, `1001${String(i).padStart(8,'0')}`, `MH/BOM/001/${String(i+1).padStart(5,'0')}`]
      );
    } catch { /* ignore */ }
    // Bank
    try {
      await query(
        `INSERT INTO employee_banks (id, employee_id, bank_name, account_number_masked, ifsc, account_holder_name, payment_mode, is_primary)
         VALUES (UUID(), ?, 'HDFC Bank', ?, 'HDFC0001234', ?, 'Bank Transfer', TRUE)`,
        [e.empId, `****${String(1000 + i)}`, e.name]
      );
    } catch { /* ignore */ }
  }
  console.log(`${empDefs.length} users/employees seeded`);

  // ── 11. Leave Types & Balances ────────────────────────────────────────────
  const leaveTypeMap: Record<string, string> = {};
  const leaveTypesData: [string, string, number, boolean][] = [
    ['Casual Leave',    'CL',  8,   true],
    ['Sick Leave',      'SL',  12,  true],
    ['Earned Leave',    'EL',  15,  true],
    ['Maternity Leave', 'ML',  180, true],
    ['Paternity Leave', 'PL',  15,  true],
    ['Compensatory',    'CO',  0,   true],
  ];
  for (const [name, code, , paid] of leaveTypesData) {
    const id = `lt-${code.toLowerCase()}`;
    await query(
      `INSERT INTO leave_types (id, tenant_id, company_id, leave_name, leave_code, is_paid, status)
       VALUES (?, ?, ?, ?, ?, ?, 'Active')`,
      [id, tenantId, companyId, name, code, paid]
    );
    leaveTypeMap[code] = id;
  }
  const yr = 2026;
  for (const e of empDefs) {
    for (const [, code, quota] of leaveTypesData) {
      const used = quota > 0 ? Math.floor(Math.random() * Math.min(quota, 4)) : 0;
      await query(
        `INSERT IGNORE INTO leave_balances (id, tenant_id, employee_id, leave_type_id, year, opening_balance, current_balance, used_ytd, pending_ytd)
         VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, 0)`,
        [tenantId, e.empId, leaveTypeMap[code], yr, quota, Math.max(0, quota - used), used]
      );
    }
  }

  // Leave Applications
  const leaveApps = [
    { ei: 4,  type: 'CL', from: '2026-06-02', to: '2026-06-03', days: 2, reason: 'Family function',            status: 'Approved', appEi: 3 },
    { ei: 5,  type: 'SL', from: '2026-05-20', to: '2026-05-21', days: 2, reason: 'Fever and cold',             status: 'Approved', appEi: 3 },
    { ei: 7,  type: 'CL', from: '2026-06-16', to: '2026-06-16', days: 1, reason: 'Personal work',              status: 'Pending',  appEi: null },
    { ei: 9,  type: 'EL', from: '2026-07-01', to: '2026-07-05', days: 5, reason: 'Annual vacation',            status: 'Pending',  appEi: null },
    { ei: 2,  type: 'CL', from: '2026-05-08', to: '2026-05-08', days: 1, reason: 'Doctor appointment',         status: 'Approved', appEi: 1 },
    { ei: 8,  type: 'SL', from: '2026-06-10', to: '2026-06-11', days: 2, reason: 'Stomach infection',          status: 'Approved', appEi: 6 },
    { ei: 11, type: 'EL', from: '2026-06-20', to: '2026-06-24', days: 4, reason: 'Travel — Goa trip',          status: 'Approved', appEi: 3 },
    { ei: 13, type: 'CL', from: '2026-06-25', to: '2026-06-25', days: 1, reason: 'Personal work',              status: 'Rejected', appEi: 3, rr: 'Critical delivery scheduled that week' },
    { ei: 10, type: 'SL', from: '2026-05-14', to: '2026-05-15', days: 2, reason: 'Viral fever',                status: 'Approved', appEi: 1 },
    { ei: 14, type: 'CL', from: '2026-06-30', to: '2026-06-30', days: 1, reason: 'Personal work',              status: 'Pending',  appEi: null },
  ] as const;

  for (const la of leaveApps) {
    await query(
      `INSERT INTO leave_applications (id, tenant_id, employee_id, leave_type_id, from_date, to_date, total_days, reason, status, approved_by, approved_at, rejected_reason)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [tenantId, empDefs[la.ei].empId, leaveTypeMap[la.type], la.from, la.to, la.days, la.reason, la.status,
       la.appEi != null ? empDefs[la.appEi].empId : null,
       la.status !== 'Pending' ? '2026-05-22 10:00:00' : null,
       la.status === 'Rejected' ? (la as any).rr ?? null : null]
    );
  }
  console.log('Leave data seeded');

  // ── 12. Shifts (with fixed IDs for rosters) ───────────────────────────────
  const shiftGenId = `shift-gen-${companyId.slice(0,8)}`;
  const shiftMornId = `shift-morn-${companyId.slice(0,8)}`;
  await query(
    `INSERT INTO shifts (id, tenant_id, company_id, shift_name, shift_code, start_time, end_time, break_mins, status)
     VALUES (?, ?, ?, 'General Shift', 'GEN', '09:00', '18:00', 60, 'Active')`,
    [shiftGenId, tenantId, companyId]
  );
  await query(
    `INSERT INTO shifts (id, tenant_id, company_id, shift_name, shift_code, start_time, end_time, break_mins, status)
     VALUES (?, ?, ?, 'Morning Shift', 'MORN', '06:00', '14:00', 30, 'Active')`,
    [shiftMornId, tenantId, companyId]
  );

  // Rosters — all employees on General Shift
  for (const e of empDefs) {
    await query(
      `INSERT INTO rosters (id, tenant_id, employee_id, shift_id, from_date, to_date, roster_type)
       VALUES (UUID(), ?, ?, ?, '2026-01-01', '2026-12-31', 'Fixed')`,
      [tenantId, e.empId, shiftGenId]
    );
  }

  // Overtime Requests
  const otEntries = [
    { ei: 4,  date: '2026-06-07', hours: 2.5, type: 'Weekday', reason: 'Sprint delivery — auth module',    status: 'Approved', appEi: 3 },
    { ei: 9,  date: '2026-06-08', hours: 3.0, type: 'Weekend', reason: 'Production hotfix deployment',     status: 'Approved', appEi: 3 },
    { ei: 11, date: '2026-06-14', hours: 2.0, type: 'Weekday', reason: 'Product launch preparation',       status: 'Pending',  appEi: null },
    { ei: 13, date: '2026-06-07', hours: 4.0, type: 'Weekend', reason: 'Client deliverable — urgent',      status: 'Approved', appEi: 3 },
    { ei: 5,  date: '2026-06-10', hours: 1.5, type: 'Weekday', reason: 'Feature deadline — checkout flow', status: 'Pending',  appEi: null },
    { ei: 4,  date: '2026-05-31', hours: 3.5, type: 'Weekend', reason: 'Month-end release',                status: 'Approved', appEi: 3 },
  ] as const;
  for (const ot of otEntries) {
    const dailyRate = empDefs[ot.ei].ctc / 12 / 26 / 8;
    const mult = ot.type === 'Weekend' ? 2.0 : 1.5;
    await query(
      `INSERT INTO overtime_requests (id, tenant_id, employee_id, ot_date, ot_hours, ot_type, rate_multiplier, ot_amount, reason, status, approved_by, approved_at)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [tenantId, empDefs[ot.ei].empId, ot.date, ot.hours, ot.type, mult,
       Math.round(dailyRate * ot.hours * mult), ot.reason, ot.status,
       ot.appEi != null ? empDefs[ot.appEi].empId : null,
       ot.status === 'Approved' ? '2026-06-09 09:00:00' : null]
    );
  }
  console.log('Shifts, rosters, overtime seeded');

  // ── 13. Salary Components & Structures ────────────────────────────────────
  const componentList: [string, string, string, boolean, boolean][] = [
    ['Basic Salary',         'BASIC',   'Earning',   true,  true ],
    ['House Rent Allowance', 'HRA',     'Earning',   false, false],
    ['Special Allowance',    'SPECIAL', 'Earning',   true,  false],
    ['Conveyance',           'CONV',    'Earning',   false, false],
    ['Provident Fund',       'PF',      'Deduction', false, true ],
    ['Professional Tax',     'PT',      'Deduction', false, false],
    ['Income Tax (TDS)',     'TDS',     'Deduction', false, false],
  ];
  for (const [name, code, type, taxable, pfAppl] of componentList) {
    await query(
      `INSERT INTO salary_components (id, tenant_id, company_id, component_name, component_code, component_type, calculation_type, is_taxable, is_pf_applicable, status)
       VALUES (UUID(), ?, ?, ?, ?, ?, 'Percentage', ?, ?, 'Active')`,
      [tenantId, companyId, name, code, type, taxable, pfAppl]
    );
  }

  const ssStdId = `ss-std-${companyId.slice(0,8)}`;
  const ssSenId = `ss-sen-${companyId.slice(0,8)}`;
  await query(
    `INSERT INTO salary_structures (id, tenant_id, company_id, name, description, components_json, status) VALUES (?, ?, ?, ?, ?, ?, 'Active')`,
    [ssStdId, tenantId, companyId, 'Standard Structure', 'Default structure for all employees',
     JSON.stringify([{code:'BASIC',type:'Earning',calc:'Percentage',value:40},{code:'HRA',type:'Earning',calc:'Percentage',value:20},{code:'SPECIAL',type:'Earning',calc:'Percentage',value:30},{code:'CONV',type:'Earning',calc:'Fixed',value:1600},{code:'PF',type:'Deduction',calc:'Percentage',value:12},{code:'PT',type:'Deduction',calc:'Fixed',value:200}])]
  );
  await query(
    `INSERT INTO salary_structures (id, tenant_id, company_id, name, description, components_json, status) VALUES (?, ?, ?, ?, ?, ?, 'Active')`,
    [ssSenId, tenantId, companyId, 'Senior Structure', 'Enhanced structure for senior/management employees',
     JSON.stringify([{code:'BASIC',type:'Earning',calc:'Percentage',value:45},{code:'HRA',type:'Earning',calc:'Percentage',value:22},{code:'SPECIAL',type:'Earning',calc:'Percentage',value:25},{code:'CONV',type:'Earning',calc:'Fixed',value:2000},{code:'PF',type:'Deduction',calc:'Percentage',value:12},{code:'PT',type:'Deduction',calc:'Fixed',value:200}])]
  );
  console.log('Salary structures seeded');

  // ── 14. Payroll Runs + Payslips (Apr–Jun 2026) ────────────────────────────
  const payrollPeriods = [
    { id: 'pr-2026-04', code: 'PR-2026-04', start: '2026-04-01', end: '2026-04-30', status: 'Approved' },
    { id: 'pr-2026-05', code: 'PR-2026-05', start: '2026-05-01', end: '2026-05-31', status: 'Approved' },
    { id: 'pr-2026-06', code: 'PR-2026-06', start: '2026-06-01', end: '2026-06-30', status: 'Processing' },
  ];

  function calcPayslip(ctc: number) {
    const monthly = ctc / 12;
    const basic   = monthly * 0.40;
    const hra     = monthly * 0.20;
    const special = monthly * 0.30;
    const conv    = 1600;
    const gross   = basic + hra + special + conv;
    const pf      = basic * 0.12;
    const pfEr    = basic * 0.1333;
    const pt      = 200;
    const tds     = Math.max(0, (ctc - 500000) / 12 * 0.1);
    const deductions = pf + pt + tds;
    return { gross, pf, pfEr, pt, tds, deductions, net: gross - deductions };
  }

  for (const pp of payrollPeriods) {
    let totEarnings = 0, totDeductions = 0, totNet = 0;
    const slips = empDefs.map(e => { const s = calcPayslip(e.ctc); totEarnings += s.gross; totDeductions += s.deductions; totNet += s.net; return { empId: e.empId, ...s }; });

    await query(
      `INSERT INTO payroll_runs (id, tenant_id, company_id, run_code, period_start, period_end, total_employees, total_earnings, total_deductions, total_net_pay, status, processed_by, approved_by, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [pp.id, tenantId, companyId, pp.code, pp.start, pp.end, empDefs.length,
       Math.round(totEarnings), Math.round(totDeductions), Math.round(totNet),
       pp.status, empDefs[8].empId,
       pp.status === 'Approved' ? empDefs[6].empId : null,
       empDefs[8].empId]
    );

    for (const s of slips) {
      await query(
        `INSERT INTO payroll_payslips (id, tenant_id, payroll_run_id, employee_id, gross_earnings, pf_employee, pf_employer, income_tax, total_deductions, net_pay, status, earnings_json, deductions_json)
         VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [tenantId, pp.id, s.empId, Math.round(s.gross), Math.round(s.pf), Math.round(s.pfEr), Math.round(s.tds),
         Math.round(s.deductions), Math.round(s.net),
         pp.status === 'Approved' ? 'Published' : 'Draft',
         JSON.stringify([{name:'Basic',amount:Math.round(s.gross*0.47)},{name:'HRA',amount:Math.round(s.gross*0.23)},{name:'Special Allowance',amount:Math.round(s.gross*0.27)},{name:'Conveyance',amount:1600}]),
         JSON.stringify([{name:'Provident Fund',amount:Math.round(s.pf)},{name:'Professional Tax',amount:200},{name:'Income Tax (TDS)',amount:Math.round(s.tds)}])]
      );
    }
  }
  console.log(`Payroll: 3 runs (Apr–Jun 2026) × ${empDefs.length} payslips each`);

  // Expense Claims
  const expenses = [
    { ei: 4,  code: 'EXP-001', date: '2026-06-01', cat: 'Travel',         amount: 2500,  desc: 'Cab fare to client site — BKC',       status: 'Approved', appEi: 3 },
    { ei: 7,  code: 'EXP-002', date: '2026-05-28', cat: 'Entertainment',  amount: 4800,  desc: 'Client dinner — Taj Lands End',        status: 'Approved', appEi: null },
    { ei: 11, code: 'EXP-003', date: '2026-06-05', cat: 'Training',       amount: 12000, desc: 'AWS Certified Solutions Architect exam',status: 'Pending',  appEi: null },
    { ei: 9,  code: 'EXP-004', date: '2026-06-08', cat: 'Travel',         amount: 7800,  desc: 'Return flight MUM-BLR for sprint review',status: 'Pending', appEi: null },
    { ei: 5,  code: 'EXP-005', date: '2026-05-15', cat: 'Office Supplies',amount: 1500,  desc: 'Stationery and printer cartridges',    status: 'Approved', appEi: 3 },
    { ei: 2,  code: 'EXP-006', date: '2026-06-10', cat: 'Meal',           amount: 850,   desc: 'Working lunch — interview panel',      status: 'Approved', appEi: 1 },
    { ei: 12, code: 'EXP-007', date: '2026-06-03', cat: 'Travel',         amount: 3200,  desc: 'Sales visit — Pune day trip',          status: 'Approved', appEi: null },
  ] as const;
  for (const ex of expenses) {
    await query(
      `INSERT INTO expense_claims (id, tenant_id, employee_id, claim_code, expense_date, category, amount, description, status, approved_by, approved_at)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [tenantId, empDefs[ex.ei].empId, ex.code, ex.date, ex.cat, ex.amount, ex.desc, ex.status,
       ex.appEi != null ? empDefs[ex.appEi].empId : null,
       ex.status === 'Approved' ? '2026-06-12 11:00:00' : null]
    );
  }
  console.log('Expense claims seeded');

  // ── 15. Holidays ──────────────────────────────────────────────────────────
  const holidays = [
    ['Republic Day',     `${yr}-01-26`, false],
    ['Holi',            `${yr}-03-13`, true ],
    ['Independence Day', `${yr}-08-15`, false],
    ['Gandhi Jayanti',   `${yr}-10-02`, false],
    ['Diwali',           `${yr}-10-20`, true ],
    ['Diwali Holiday',   `${yr}-10-21`, false],
    ['Christmas',        `${yr}-12-25`, true ],
  ] as const;
  for (const [name, date, optional] of holidays) {
    await query(
      `INSERT INTO holidays (id, tenant_id, company_id, holiday_name, holiday_date, holiday_type, is_optional, year)
       VALUES (UUID(), ?, ?, ?, ?, 'National', ?, ?)`,
      [tenantId, companyId, name, date, optional ? 1 : 0, yr]
    );
  }

  // ── 16. Policies & Acknowledgements ──────────────────────────────────────
  const policiesData = [
    ['pol-wfh',  'POL-WFH',  'Work From Home Policy',   'Work Policy',  'Employees may work from home up to 2 days per week with manager approval.'],
    ['pol-lve',  'POL-LVE',  'Leave Policy',            'Leave',        'Annual leave entitlements and procedures are outlined in this policy.'],
    ['pol-coc',  'POL-COC',  'Code of Conduct',         'Conduct',      'All employees must adhere to professional and ethical standards at all times.'],
    ['pol-its',  'POL-ITS',  'IT Security Policy',      'IT Security',  'Guidelines for secure use of company systems, data, and networks.'],
    ['pol-ahp',  'POL-AHP',  'Anti-Harassment Policy',  'Conduct',      'Zero tolerance for any form of harassment or discrimination in the workplace.'],
  ] as const;
  for (const [id, code, title, category, content] of policiesData) {
    await query(
      `INSERT INTO policies (id, tenant_id, company_id, title, policy_code, category, content, effective_date, requires_acknowledgement, status, published_at, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE(), TRUE, 'Published', NOW(), ?)`,
      [id, tenantId, companyId, title, code, category, content, empDefs[1].empId]
    );
  }
  // Acknowledge top 3 policies for first 10 employees
  for (const e of empDefs.slice(0, 10)) {
    for (const [polId] of policiesData.slice(0, 3)) {
      await query(
        `INSERT IGNORE INTO policy_acknowledgements (id, tenant_id, policy_id, employee_id, acknowledged, acknowledged_at, status)
         VALUES (UUID(), ?, ?, ?, TRUE, NOW(), 'Acknowledged')`,
        [tenantId, polId, e.empId]
      );
    }
  }
  console.log('Policies seeded');

  // ── 17. Attendance Logs (last 30 working days) ───────────────────────────
  const baseDate = new Date('2026-06-15');
  for (let d = 30; d >= 1; d--) {
    const dt = new Date(baseDate);
    dt.setDate(baseDate.getDate() - d);
    if (dt.getDay() === 0 || dt.getDay() === 6) continue; // skip weekends
    const dateStr = dt.toISOString().slice(0, 10);

    for (let ei = 0; ei < empDefs.length; ei++) {
      const e = empDefs[ei];
      const rand = Math.random();
      let status: string, inTime: string | null = null, outTime: string | null = null, hours: number | null = null;

      if (rand < 0.87) {
        const late = Math.random() < 0.12;
        status = late ? 'Late' : 'Present';
        const inH = late ? 10 : 9;
        const inM = late ? Math.floor(Math.random() * 60) : Math.floor(Math.random() * 20);
        const outH = 18 + (Math.random() < 0.25 ? 1 : 0);
        const outM = Math.floor(Math.random() * 60);
        inTime  = `${dateStr} ${String(inH).padStart(2,'0')}:${String(inM).padStart(2,'0')}:00`;
        outTime = `${dateStr} ${String(outH).padStart(2,'0')}:${String(outM).padStart(2,'0')}:00`;
        hours   = Math.round(((outH * 60 + outM) - (inH * 60 + inM) - 60) / 60 * 100) / 100;
      } else {
        status = 'Absent';
      }

      try {
        await query(
          `INSERT IGNORE INTO attendance_logs (id, tenant_id, employee_id, attendance_date, in_time, out_time, total_hours, status, source)
           VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, 'System')`,
          [tenantId, e.empId, dateStr, inTime, outTime, hours, status]
        );
      } catch { /* ignore duplicate */ }
    }
  }
  console.log('Attendance logs seeded (last 30 working days)');

  // Attendance Correction Requests
  await query(
    `INSERT INTO attendance_correction_requests (id, tenant_id, employee_id, attendance_date, current_status, requested_status, reason, status)
     VALUES (UUID(), ?, ?, '2026-06-09', 'Absent', 'Present', 'Was at client site — forgot to swipe. Cab receipt attached.', 'Pending')`,
    [tenantId, empDefs[4].empId]
  );
  await query(
    `INSERT INTO attendance_correction_requests (id, tenant_id, employee_id, attendance_date, current_status, requested_status, reason, status, approved_by, approved_at)
     VALUES (UUID(), ?, ?, '2026-06-05', 'Absent', 'Present', 'System biometric failure — IT confirmed.', 'Approved', ?, NOW())`,
    [tenantId, empDefs[9].empId, empDefs[3].empId]
  );

  // ── 18. Recruitment ──────────────────────────────────────────────────────
  const reqSE   = 'req-se-2026';
  const reqPM   = 'req-pm-2026';
  const reqHR   = 'req-hr-2026';
  await query(
    `INSERT INTO requisitions (id, tenant_id, company_id, department_id, designation_id, requisition_code, title, positions_count, employment_type, min_experience_years, max_experience_years, min_salary, max_salary, priority, required_by, reason, status, approved_by, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, 3, 'Permanent', 2, 5, 800000, 1400000, 'High', '2026-07-31', 'New product team expansion', 'Approved', ?, ?)`,
    [reqSE, tenantId, companyId, engDeptId, desigData[3][0], 'REQ-2026-001', 'Software Engineer – Full Stack', empDefs[0].empId, empDefs[3].empId]
  );
  await query(
    `INSERT INTO requisitions (id, tenant_id, company_id, department_id, designation_id, requisition_code, title, positions_count, employment_type, min_experience_years, max_experience_years, min_salary, max_salary, priority, required_by, reason, status, approved_by, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1, 'Permanent', 5, 10, 1500000, 2500000, 'Medium', '2026-08-15', 'Product team growth', 'Approved', ?, ?)`,
    [reqPM, tenantId, companyId, engDeptId, desigData[11][0], 'REQ-2026-002', 'Senior Product Manager', empDefs[0].empId, empDefs[3].empId]
  );
  await query(
    `INSERT INTO requisitions (id, tenant_id, company_id, department_id, designation_id, requisition_code, title, positions_count, employment_type, min_experience_years, max_experience_years, min_salary, max_salary, priority, required_by, reason, status, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, 2, 'Permanent', 1, 3, 500000, 900000, 'Low', '2026-09-01', 'HR team expansion', 'Draft', ?)`,
    [reqHR, tenantId, companyId, hrDeptId, desigData[2][0], 'REQ-2026-003', 'HR Executive', empDefs[1].empId]
  );

  const jpSE = 'jp-se-2026';
  const jpPM = 'jp-pm-2026';
  await query(
    `INSERT INTO job_postings (id, tenant_id, company_id, requisition_id, posting_code, title, department, location, employment_type, work_mode, min_experience_years, max_experience_years, min_salary, max_salary, description, requirements, status, published_at, closes_at, applications_count, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Full-time', 'Hybrid', 2, 5, 800000, 1400000, ?, ?, 'Active', NOW(), ?, 45, ?)`,
    [jpSE, tenantId, companyId, reqSE, 'JP-2026-001', 'Full Stack Software Engineer', 'Engineering', 'Mumbai / Remote',
     'Join our growing engineering team and work on our flagship HRMS platform. You will design, build, and ship features used by thousands of HR professionals.',
     'Node.js, TypeScript, React, MySQL, REST APIs, 2–5 years experience, B.E/B.Tech in CS',
     '2026-08-31', empDefs[3].empId]
  );
  await query(
    `INSERT INTO job_postings (id, tenant_id, company_id, requisition_id, posting_code, title, department, location, employment_type, work_mode, min_experience_years, max_experience_years, min_salary, max_salary, description, status, published_at, closes_at, applications_count, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Full-time', 'On-site', 5, 10, 1500000, 2500000, ?, 'Active', NOW(), ?, 12, ?)`,
    [jpPM, tenantId, companyId, reqPM, 'JP-2026-002', 'Senior Product Manager', 'Product', 'Mumbai',
     'Lead product strategy and roadmap for our HR SaaS platform. Collaborate with design, engineering, and sales to drive growth.',
     '2026-07-31', empDefs[3].empId]
  );

  type CandDef = { id: string; jpId: string; firstName: string; lastName: string; email: string; stage: string; exp: number; ctc: number; expected: number; source: string; notice: number };
  const cands: CandDef[] = [
    { id: 'cand-001', jpId: jpSE, firstName: 'Aditya',  lastName: 'Sharma',  email: 'aditya.sharma@gmail.com',  stage: 'Offered',   exp: 3.5, ctc: 800000,  expected: 1200000, source: 'LinkedIn',         notice: 30 },
    { id: 'cand-002', jpId: jpSE, firstName: 'Pooja',   lastName: 'Gupta',   email: 'pooja.gupta@gmail.com',    stage: 'Interview', exp: 2.0, ctc: 650000,  expected: 950000,  source: 'Naukri',           notice: 15 },
    { id: 'cand-003', jpId: jpSE, firstName: 'Rohan',   lastName: 'Kapoor',  email: 'rohan.kapoor@gmail.com',   stage: 'Screening', exp: 4.0, ctc: 950000,  expected: 1300000, source: 'Direct',           notice: 60 },
    { id: 'cand-004', jpId: jpSE, firstName: 'Nisha',   lastName: 'Verma',   email: 'nisha.verma@gmail.com',    stage: 'Hired',     exp: 3.0, ctc: 750000,  expected: 1100000, source: 'Employee Referral',notice: 30 },
    { id: 'cand-005', jpId: jpSE, firstName: 'Sanjay',  lastName: 'Kumar',   email: 'sanjay.kumar@gmail.com',   stage: 'Rejected',  exp: 1.5, ctc: 500000,  expected: 800000,  source: 'LinkedIn',         notice: 0  },
    { id: 'cand-006', jpId: jpSE, firstName: 'Divya',   lastName: 'Nair',    email: 'divya.nair@gmail.com',     stage: 'Applied',   exp: 2.5, ctc: 700000,  expected: 1000000, source: 'Indeed',           notice: 30 },
    { id: 'cand-007', jpId: jpPM, firstName: 'Pranav',  lastName: 'Iyer',    email: 'pranav.iyer@gmail.com',    stage: 'Interview', exp: 7.0, ctc: 1800000, expected: 2400000, source: 'LinkedIn',         notice: 60 },
    { id: 'cand-008', jpId: jpPM, firstName: 'Kavita',  lastName: 'Pillai',  email: 'kavita.pillai@gmail.com',  stage: 'Offered',   exp: 6.0, ctc: 1600000, expected: 2200000, source: 'Headhunter',       notice: 45 },
    { id: 'cand-009', jpId: jpSE, firstName: 'Ashish',  lastName: 'Pandey',  email: 'ashish.pandey@gmail.com',  stage: 'Screening', exp: 3.0, ctc: 820000,  expected: 1150000, source: 'Naukri',           notice: 30 },
    { id: 'cand-010', jpId: jpSE, firstName: 'Sneha',   lastName: 'Bansal',  email: 'sneha.bansal@gmail.com',   stage: 'Applied',   exp: 2.0, ctc: 580000,  expected: 900000,  source: 'Campus',           notice: 0  },
  ];
  for (const c of cands) {
    await query(
      `INSERT INTO candidates (id, tenant_id, job_posting_id, first_name, last_name, email, mobile, source, current_ctc, expected_ctc, total_experience_years, notice_period_days, stage, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [c.id, tenantId, c.jpId, c.firstName, c.lastName, c.email, '9876500000', c.source,
       c.ctc, c.expected, c.exp, c.notice, c.stage, c.stage === 'Rejected' ? 'Rejected' : 'Active']
    );
  }

  const interviews = [
    { ci: 'cand-001', jp: jpSE, round: 1, type: 'HR Screening',    at: '2026-05-20 11:00:00', status: 'Completed', rating: 4.0, outcome: 'Pass' },
    { ci: 'cand-001', jp: jpSE, round: 2, type: 'Technical',        at: '2026-05-25 14:00:00', status: 'Completed', rating: 4.2, outcome: 'Pass' },
    { ci: 'cand-001', jp: jpSE, round: 3, type: 'Culture Fit',      at: '2026-06-01 11:00:00', status: 'Completed', rating: 4.5, outcome: 'Pass' },
    { ci: 'cand-002', jp: jpSE, round: 1, type: 'HR Screening',    at: '2026-06-10 10:30:00', status: 'Completed', rating: 3.8, outcome: 'Pass' },
    { ci: 'cand-002', jp: jpSE, round: 2, type: 'Technical',        at: '2026-06-17 15:00:00', status: 'Scheduled', rating: null, outcome: null },
    { ci: 'cand-004', jp: jpSE, round: 1, type: 'HR Screening',    at: '2026-05-15 10:00:00', status: 'Completed', rating: 4.5, outcome: 'Pass' },
    { ci: 'cand-004', jp: jpSE, round: 2, type: 'Technical',        at: '2026-05-20 14:00:00', status: 'Completed', rating: 4.8, outcome: 'Pass' },
    { ci: 'cand-007', jp: jpPM, round: 1, type: 'HR Screening',    at: '2026-06-05 11:00:00', status: 'Completed', rating: 4.5, outcome: 'Pass' },
    { ci: 'cand-007', jp: jpPM, round: 2, type: 'Panel Interview',  at: '2026-06-18 14:00:00', status: 'Scheduled', rating: null, outcome: null },
    { ci: 'cand-008', jp: jpPM, round: 1, type: 'HR Screening',    at: '2026-05-28 10:00:00', status: 'Completed', rating: 4.0, outcome: 'Pass' },
    { ci: 'cand-008', jp: jpPM, round: 2, type: 'Technical',        at: '2026-06-03 14:00:00', status: 'Completed', rating: 4.3, outcome: 'Pass' },
  ] as const;
  for (const iv of interviews) {
    await query(
      `INSERT INTO interview_schedules (id, tenant_id, candidate_id, job_posting_id, round_number, interview_type, scheduled_at, duration_mins, mode, status, feedback, rating, outcome, interviewers_json)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, 60, 'Video', ?, ?, ?, ?, ?)`,
      [tenantId, iv.ci, iv.jp, iv.round, iv.type, iv.at, iv.status,
       iv.outcome ? `Candidate ${iv.outcome === 'Pass' ? 'performed well and cleared the round' : 'did not meet expectations'}` : null,
       iv.rating, iv.outcome,
       JSON.stringify([{name: empDefs[3].name, email: empDefs[3].email}])]
    );
  }
  await query(
    `INSERT INTO job_offers (id, tenant_id, candidate_id, job_posting_id, offer_code, ctc_offered, joining_date, valid_until, status, accepted_at, created_by)
     VALUES (UUID(), ?, 'cand-001', ?, 'OFF-2026-001', 1200000, '2026-07-15', '2026-06-30', 'Accepted', NOW(), ?)`,
    [tenantId, jpSE, empDefs[1].empId]
  );
  await query(
    `INSERT INTO job_offers (id, tenant_id, candidate_id, job_posting_id, offer_code, ctc_offered, joining_date, valid_until, status, created_by)
     VALUES (UUID(), ?, 'cand-008', ?, 'OFF-2026-002', 2200000, '2026-07-01', '2026-06-25', 'Pending', ?)`,
    [tenantId, jpPM, empDefs[1].empId]
  );
  console.log('Recruitment data seeded (10 candidates, interviews, 2 offers)');

  // ── 19. Performance Cycles & Reviews ─────────────────────────────────────
  const cycleAnnual = 'cycle-annual-2025';
  const cycleQ1     = 'cycle-q1-2026';
  const cycleQ2     = 'cycle-q2-2026';
  await query(
    `INSERT INTO performance_cycles (id, tenant_id, company_id, cycle_name, cycle_type, period_start, period_end, self_review_deadline, manager_review_deadline, status, created_by)
     VALUES (?, ?, ?, 'Annual Review 2025', 'Annual', '2025-01-01', '2025-12-31', '2026-01-15', '2026-01-31', 'Completed', ?)`,
    [cycleAnnual, tenantId, companyId, empDefs[1].empId]
  );
  await query(
    `INSERT INTO performance_cycles (id, tenant_id, company_id, cycle_name, cycle_type, period_start, period_end, self_review_deadline, manager_review_deadline, status, created_by)
     VALUES (?, ?, ?, 'Q1 Review 2026', 'Quarterly', '2026-01-01', '2026-03-31', '2026-04-10', '2026-04-20', 'Completed', ?)`,
    [cycleQ1, tenantId, companyId, empDefs[1].empId]
  );
  await query(
    `INSERT INTO performance_cycles (id, tenant_id, company_id, cycle_name, cycle_type, period_start, period_end, self_review_deadline, manager_review_deadline, status, created_by)
     VALUES (?, ?, ?, 'Q2 Review 2026', 'Quarterly', '2026-04-01', '2026-06-30', '2026-07-10', '2026-07-20', 'Active', ?)`,
    [cycleQ2, tenantId, companyId, empDefs[1].empId]
  );

  const reviews = [
    // Annual 2025 — Completed
    { cycle: cycleAnnual, ei: 4,  ri: 3, selfR: 4.0, mgrR: 3.9, finalR: 3.95, status: 'Completed', selfC: '2025 was a great year — delivered the new auth module and improved test coverage by 40%.', mgrC: 'Exceeds expectations in technical delivery. Reliable and proactive.' },
    { cycle: cycleAnnual, ei: 5,  ri: 3, selfR: 3.5, mgrR: 3.4, finalR: 3.45, status: 'Completed', selfC: 'Learned new tech stack. Delivered frontend refactor as planned.', mgrC: 'Growing developer. Needs to take more initiative on design decisions.' },
    { cycle: cycleAnnual, ei: 9,  ri: 3, selfR: 4.2, mgrR: 4.1, finalR: 4.15, status: 'Completed', selfC: 'Achieved 99.9% uptime on all production systems. Built CI/CD pipeline from scratch.', mgrC: 'Outstanding DevOps skills. Automation initiatives saved 20 hours/week.' },
    { cycle: cycleAnnual, ei: 11, ri: 3, selfR: 4.5, mgrR: 4.4, finalR: 4.45, status: 'Completed', selfC: 'Successfully launched v2 product with 95% user adoption in 30 days.', mgrC: 'Outstanding PM. Highest performing team member this cycle. Promotion recommended.' },
    // Q1 2026 — Completed
    { cycle: cycleQ1, ei: 4,  ri: 3, selfR: 4.0, mgrR: 3.8, finalR: 3.9,  status: 'Completed', selfC: 'Met all sprint goals Q1. Delivered user management module ahead of schedule.', mgrC: 'Reliable performer. Improve code documentation practices.' },
    { cycle: cycleQ1, ei: 5,  ri: 3, selfR: 3.5, mgrR: 3.5, finalR: 3.5,  status: 'Completed', selfC: 'Good quarter. Completed React migration for 3 legacy modules.', mgrC: 'Steady growth. More independence expected in Q2.' },
    { cycle: cycleQ1, ei: 9,  ri: 3, selfR: 4.2, mgrR: 4.0, finalR: 4.1,  status: 'Completed', selfC: 'Zero downtime achieved in Q1. Kubernetes cluster optimised.', mgrC: 'Solid DevOps delivery. Automation skills exceptional.' },
    { cycle: cycleQ1, ei: 11, ri: 3, selfR: 4.5, mgrR: 4.3, finalR: 4.4,  status: 'Completed', selfC: 'Led two major product launches in Q1. Stakeholder satisfaction at all-time high.', mgrC: 'Strategic thinker. Great cross-functional collaboration.' },
    // Q2 2026 — In Progress
    { cycle: cycleQ2, ei: 4,  ri: 3, selfR: 4.2, mgrR: null, finalR: null, status: 'SelfSubmitted', selfC: 'Strong Q2. New checkout flow delivered 2 weeks early. 98% test coverage.', mgrC: null },
    { cycle: cycleQ2, ei: 5,  ri: 3, selfR: 3.8, mgrR: null, finalR: null, status: 'SelfSubmitted', selfC: 'Completed API integration for 3 third-party services. Improved response time by 35%.', mgrC: null },
    { cycle: cycleQ2, ei: 11, ri: 3, selfR: 4.8, mgrR: null, finalR: null, status: 'SelfSubmitted', selfC: 'Shipped mobile app MVP — 500+ downloads in week 1.', mgrC: null },
    { cycle: cycleQ2, ei: 9,  ri: 3, selfR: null, mgrR: null, finalR: null, status: 'Pending', selfC: null, mgrC: null },
    { cycle: cycleQ2, ei: 13, ri: 3, selfR: null, mgrR: null, finalR: null, status: 'Pending', selfC: null, mgrC: null },
  ] as const;
  for (const rv of reviews) {
    await query(
      `INSERT IGNORE INTO performance_reviews (id, tenant_id, cycle_id, employee_id, reviewer_id, self_rating, self_comments, self_submitted_at, manager_rating, manager_comments, manager_submitted_at, final_rating, status)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [tenantId, rv.cycle, empDefs[rv.ei].empId, empDefs[rv.ri].empId,
       rv.selfR, rv.selfC, rv.selfR ? '2026-07-05 10:00:00' : null,
       rv.mgrR,  rv.mgrC,  rv.mgrR  ? '2026-07-12 14:00:00' : null,
       rv.finalR, rv.status]
    );
  }
  console.log('Performance cycles and reviews seeded');

  // ── 20. Assets & Allocations ─────────────────────────────────────────────
  type AssetDef = { id: string; code: string; name: string; cat: string; brand: string; model: string; serial: string; purchaseDate: string; cost: number; status: string; cond: string; assignedEi?: number };
  const assets: AssetDef[] = [
    { id: 'asset-001', code: 'LT-001', name: 'Dell Latitude 5520',    cat: 'Laptop',   brand: 'Dell',    model: 'Latitude 5520',  serial: 'DL5520-001',  purchaseDate: '2024-01-15', cost: 75000,  status: 'Allocated',   cond: 'Good',        assignedEi: 4  },
    { id: 'asset-002', code: 'LT-002', name: 'HP EliteBook 840',      cat: 'Laptop',   brand: 'HP',      model: 'EliteBook 840',  serial: 'HP840-002',   purchaseDate: '2024-02-10', cost: 80000,  status: 'Available',   cond: 'Good'  },
    { id: 'asset-003', code: 'LT-003', name: 'Lenovo ThinkPad X1',   cat: 'Laptop',   brand: 'Lenovo',  model: 'ThinkPad X1',    serial: 'LNVX1-003',   purchaseDate: '2024-04-05', cost: 95000,  status: 'Maintenance', cond: 'Needs Repair' },
    { id: 'asset-004', code: 'MB-001', name: 'Samsung Galaxy A54',   cat: 'Mobile',   brand: 'Samsung', model: 'Galaxy A54',     serial: 'SGA54-001',   purchaseDate: '2024-03-01', cost: 35000,  status: 'Allocated',   cond: 'Good',        assignedEi: 11 },
    { id: 'asset-005', code: 'MN-001', name: 'LG 27" 4K Monitor',   cat: 'Monitor',  brand: 'LG',      model: '27UK850',         serial: 'LG27-001',    purchaseDate: '2023-11-20', cost: 28000,  status: 'Allocated',   cond: 'Good',        assignedEi: 3  },
    { id: 'asset-006', code: 'MN-002', name: 'Dell UltraSharp 24"', cat: 'Monitor',  brand: 'Dell',    model: 'U2422H',          serial: 'DLU24-002',   purchaseDate: '2024-01-10', cost: 22000,  status: 'Available',   cond: 'Good'  },
    { id: 'asset-007', code: 'CH-001', name: 'Herman Miller Aeron',  cat: 'Chair',    brand: 'Herman Miller', model: 'Aeron',    serial: 'HMCH-001',    purchaseDate: '2023-06-15', cost: 45000,  status: 'Allocated',   cond: 'Good',        assignedEi: 1  },
    { id: 'asset-008', code: 'HS-001', name: 'Sony WH-1000XM5',     cat: 'Headset',  brand: 'Sony',    model: 'WH-1000XM5',     serial: 'SNHS-001',    purchaseDate: '2024-05-10', cost: 22000,  status: 'Available',   cond: 'New'  },
    { id: 'asset-009', code: 'LT-004', name: 'MacBook Pro 14"',     cat: 'Laptop',   brand: 'Apple',   model: 'MacBook Pro M3',  serial: 'AAPL-001',    purchaseDate: '2024-06-01', cost: 160000, status: 'Allocated',   cond: 'Good',        assignedEi: 11 },
    { id: 'asset-010', code: 'KB-001', name: 'Logitech MX Keys',    cat: 'Keyboard', brand: 'Logitech',model: 'MX Keys',         serial: 'LGTMX-001',   purchaseDate: '2024-02-15', cost: 8000,   status: 'Allocated',   cond: 'Good',        assignedEi: 4  },
    { id: 'asset-011', code: 'LT-005', name: 'Dell XPS 15',         cat: 'Laptop',   brand: 'Dell',    model: 'XPS 15 9520',    serial: 'DLXPS-001',   purchaseDate: '2023-09-12', cost: 120000, status: 'Allocated',   cond: 'Good',        assignedEi: 3  },
    { id: 'asset-012', code: 'PR-001', name: 'HP LaserJet Pro M404', cat: 'Printer', brand: 'HP',      model: 'LaserJet M404',  serial: 'HPLJ-001',    purchaseDate: '2023-03-05', cost: 18000,  status: 'Available',   cond: 'Good'  },
  ];

  for (const a of assets) {
    await query(
      `INSERT INTO assets (id, tenant_id, company_id, asset_code, asset_name, category, brand, model, serial_number, purchase_date, purchase_cost, status, condition_status, assigned_to, assigned_at, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [a.id, tenantId, companyId, a.code, a.name, a.cat, a.brand, a.model, a.serial, a.purchaseDate, a.cost,
       a.status, a.cond,
       a.assignedEi !== undefined ? empDefs[a.assignedEi].empId : null,
       a.assignedEi !== undefined ? '2024-07-01 09:00:00' : null,
       a.status === 'Maintenance' ? 'Screen repair — sent to service centre (Dell India)' : null]
    );
    if (a.assignedEi !== undefined) {
      await query(
        `INSERT INTO asset_allocations (id, asset_id, employee_id, allocated_at, condition_at_alloc, notes)
         VALUES (UUID(), ?, ?, '2024-07-01 09:00:00', 'Good', ?)`,
        [a.id, empDefs[a.assignedEi].empId, `Allocated to ${empDefs[a.assignedEi].name}`]
      );
    }
  }
  console.log('Assets and allocations seeded');

  // ── 21. Training Programs & Enrollments ──────────────────────────────────
  const trainingProgs = [
    { id: 'tp-001', code: 'TP-001', name: 'React & TypeScript Advanced',  cat: 'Technical',   mode: 'Online',    days: 3,  cost: 15000, start: '2026-06-20', end: '2026-06-22', max: 20, status: 'Active'    },
    { id: 'tp-002', code: 'TP-002', name: 'Leadership Essentials',         cat: 'Leadership',  mode: 'Classroom', days: 2,  cost: 25000, start: '2026-07-10', end: '2026-07-11', max: 15, status: 'Planned'   },
    { id: 'tp-003', code: 'TP-003', name: 'AWS Solutions Architect',       cat: 'Cloud',       mode: 'Online',    days: 10, cost: 45000, start: '2026-06-01', end: '2026-06-10', max: 25, status: 'Completed' },
    { id: 'tp-004', code: 'TP-004', name: 'Data Analytics with Python',    cat: 'Analytics',   mode: 'Online',    days: 5,  cost: 18000, start: '2026-07-15', end: '2026-07-19', max: 30, status: 'Planned'   },
    { id: 'tp-005', code: 'TP-005', name: 'POSH Awareness Training',       cat: 'Compliance',  mode: 'Classroom', days: 1,  cost: 5000,  start: '2026-06-05', end: '2026-06-05', max: 100,status: 'Completed' },
    { id: 'tp-006', code: 'TP-006', name: 'Agile & Scrum Certification',   cat: 'Methodology', mode: 'Online',    days: 3,  cost: 12000, start: '2026-06-25', end: '2026-06-27', max: 20, status: 'Active'    },
  ] as const;
  for (const tp of trainingProgs) {
    await query(
      `INSERT INTO training_programs (id, tenant_id, company_id, program_code, program_name, category, mode, duration_days, cost, start_date, end_date, max_participants, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [tp.id, tenantId, companyId, tp.code, tp.name, tp.cat, tp.mode, tp.days, tp.cost, tp.start, tp.end, tp.max, tp.status, empDefs[1].empId]
    );
  }

  const enrollments = [
    { prog: 'tp-001', ei: 4,  status: 'Enrolled',  score: null, attend: null, compDate: null,       feedback: null },
    { prog: 'tp-001', ei: 9,  status: 'Enrolled',  score: null, attend: null, compDate: null,       feedback: null },
    { prog: 'tp-001', ei: 11, status: 'Enrolled',  score: null, attend: null, compDate: null,       feedback: null },
    { prog: 'tp-003', ei: 4,  status: 'Completed', score: 85.0, attend: 100,  compDate: '2026-06-10', feedback: 'Excellent course. Hands-on labs were very practical.' },
    { prog: 'tp-003', ei: 9,  status: 'Completed', score: 78.0, attend: 90,   compDate: '2026-06-10', feedback: 'Good depth. Slightly rushed on networking topics.' },
    { prog: 'tp-003', ei: 11, status: 'Completed', score: 92.5, attend: 100,  compDate: '2026-06-10', feedback: 'Outstanding content. Passed exam on first attempt.' },
    { prog: 'tp-005', ei: 1,  status: 'Completed', score: 100,  attend: 100,  compDate: '2026-06-05', feedback: 'Important awareness session. Well structured.' },
    { prog: 'tp-005', ei: 2,  status: 'Completed', score: 100,  attend: 100,  compDate: '2026-06-05', feedback: null },
    { prog: 'tp-005', ei: 4,  status: 'Completed', score: 100,  attend: 100,  compDate: '2026-06-05', feedback: null },
    { prog: 'tp-005', ei: 5,  status: 'Completed', score: 100,  attend: 100,  compDate: '2026-06-05', feedback: null },
    { prog: 'tp-005', ei: 7,  status: 'Completed', score: 100,  attend: 100,  compDate: '2026-06-05', feedback: null },
    { prog: 'tp-006', ei: 3,  status: 'Enrolled',  score: null, attend: null, compDate: null,         feedback: null },
    { prog: 'tp-006', ei: 11, status: 'Enrolled',  score: null, attend: null, compDate: null,         feedback: null },
    { prog: 'tp-002', ei: 3,  status: 'Enrolled',  score: null, attend: null, compDate: null,         feedback: null },
    { prog: 'tp-002', ei: 6,  status: 'Enrolled',  score: null, attend: null, compDate: null,         feedback: null },
  ] as const;
  for (const en of enrollments) {
    await query(
      `INSERT IGNORE INTO training_enrollments (id, tenant_id, program_id, employee_id, status, score, attendance, completion_date, feedback)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?)`,
      [tenantId, en.prog, empDefs[en.ei].empId, en.status, en.score, en.attend, en.compDate, en.feedback]
    );
  }
  console.log('Training programs and enrollments seeded');

  // ── 22. Exit Cases ────────────────────────────────────────────────────────
  // Employee 13 (Ravi Nair) — in progress
  await query(
    `INSERT INTO exit_cases (id, tenant_id, employee_id, exit_type, resignation_date, last_working_day, reason, exit_interview_done, clearance_status, status)
     VALUES (UUID(), ?, ?, 'Voluntary', '2026-06-01', '2026-06-30', 'Better career opportunity — Product role in a Series B startup', FALSE, 'Pending', 'Initiated')`,
    [tenantId, empDefs[13].empId]
  );
  // Employee 7 (Deepa Reddy) — completed (historical)
  await query(
    `INSERT INTO exit_cases (id, tenant_id, employee_id, exit_type, resignation_date, last_working_day, reason, exit_interview_done, clearance_status, fnf_amount, fnf_processed_at, fnf_processed_by, status)
     VALUES (UUID(), ?, ?, 'Voluntary', '2025-11-01', '2025-11-30', 'Relocating to Bengaluru — spouse transfer', TRUE, 'Cleared', 67800, '2025-12-10 11:00:00', ?, 'Completed')`,
    [tenantId, empDefs[7].empId, empDefs[8].empId]
  );
  console.log('Exit cases seeded');

  // ── 23. Helpdesk Tickets ─────────────────────────────────────────────────
  const tickets = [
    { code: 'TKT-001', ei: 4,  cat: 'IT',      prio: 'High',   subj: 'VPN access not working',             desc: 'Cannot connect to company VPN from home. Error: "Authentication failed". Urgent.', status: 'Open'      },
    { code: 'TKT-002', ei: 5,  cat: 'IT',      prio: 'Medium', subj: 'Laptop running very slowly',         desc: 'System has become extremely slow since the last Windows update (June 2026).', status: 'InProgress' },
    { code: 'TKT-003', ei: 7,  cat: 'HR',      prio: 'Low',    subj: 'Leave balance shows incorrect days', desc: 'CL balance shows 3 days but should be 5 per policy.', status: 'Resolved'   },
    { code: 'TKT-004', ei: 9,  cat: 'Payroll', prio: 'High',   subj: 'June payslip not visible in portal', desc: 'June 2026 payslip has not been generated yet. Other colleagues can see theirs.', status: 'Open'      },
    { code: 'TKT-005', ei: 2,  cat: 'IT',      prio: 'Medium', subj: 'Shared printer not accessible',      desc: 'Cannot print from my workstation. Network path \\\\server\\HP-3F not found.', status: 'Resolved'   },
    { code: 'TKT-006', ei: 10, cat: 'HR',      prio: 'Low',    subj: 'Appointment letter not received',    desc: 'I joined on 1 April but have not yet received my appointment letter via email.', status: 'Resolved'   },
  ] as const;
  for (const tk of tickets) {
    await query(
      `INSERT INTO helpdesk_tickets (id, tenant_id, ticket_code, requester_id, category, priority, subject, description, status, resolved_at)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [tenantId, tk.code, empDefs[tk.ei].empId, tk.cat, tk.prio, tk.subj, tk.desc, tk.status,
       tk.status === 'Resolved' ? '2026-06-12 15:00:00' : null]
    );
  }

  // ── 24. Audit Logs ────────────────────────────────────────────────────────
  const auditEntries = [
    { ui: 1, module: 'EMPLOYEE', action: 'CREATE', entity: 'employees',        entityId: empDefs[13].empId, vals: { employee_code: empCodes[13], name: empDefs[13].name, department: 'Marketing' } },
    { ui: 1, module: 'LEAVE',    action: 'APPROVE',entity: 'leave_applications',entityId: 'la-011',          vals: { status: 'Approved', approved_by: empDefs[1].name } },
    { ui: 8, module: 'PAYROLL',  action: 'PROCESS',entity: 'payroll_runs',      entityId: 'pr-2026-06',      vals: { run_code: 'PR-2026-06', status: 'Processing' } },
    { ui: 3, module: 'EMPLOYEE', action: 'EDIT',   entity: 'employees',         entityId: empDefs[4].empId,  vals: { field: 'reporting_manager_id', new_value: empDefs[3].empId } },
    { ui: 1, module: 'POLICY',   action: 'PUBLISH',entity: 'policies',          entityId: 'pol-wfh',         vals: { policy_code: 'POL-WFH', status: 'Published' } },
  ] as const;
  for (const al of auditEntries) {
    await query(
      `INSERT INTO audit_logs (id, tenant_id, user_id, module, action, entity_type, entity_id, new_values, ip_address, created_at)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, '10.0.0.1', NOW())`,
      [tenantId, empDefs[al.ui].userId, al.module, al.action, al.entity, al.entityId, JSON.stringify(al.vals)]
    );
  }

  // ── 25. Summary ───────────────────────────────────────────────────────────
  console.log('\n' + '='.repeat(60));
  console.log('✅  HRMS Seed Complete — All modules populated');
  console.log('='.repeat(60));
  console.log('Default accounts (password: Admin@123)');
  console.log('-'.repeat(60));
  for (const e of empDefs) {
    console.log(`  ${e.email.padEnd(38)} [${e.role}]`);
  }
  console.log('='.repeat(60));
  console.log(`\nData seeded:`);
  console.log(`  ${empDefs.length} employees across ${deptData.length} departments`);
  console.log(`  ~${empDefs.length * 22} attendance log entries (last 30 working days)`);
  console.log(`  3 payroll runs (Apr–Jun 2026) × ${empDefs.length} payslips`);
  console.log(`  ${trainingProgs.length} training programs · ${enrollments.length} enrollments`);
  console.log(`  3 performance cycles · ${reviews.length} reviews`);
  console.log(`  ${assets.length} assets · ${assets.filter(a => a.assignedEi !== undefined).length} allocated`);
  console.log(`  ${cands.length} candidates · ${interviews.length} interviews · 2 offers`);
  console.log(`  2 exit cases · 6 helpdesk tickets · 7 expense claims`);
  console.log('');
}

seed().catch(err => { console.error('Seed error:', err); process.exit(1); });
