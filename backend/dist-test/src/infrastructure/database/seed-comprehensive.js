"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedComprehensive = seedComprehensive;
const database_js_1 = require("../../config/database.js");
const bcrypt_1 = __importDefault(require("bcrypt"));
const faker_1 = require("@faker-js/faker");
faker_1.faker.seed(123); // Reproducible data
function uuid(n) {
    if (n !== undefined)
        return `${String(n).padStart(8, '0')}-0000-0000-0000-000000000000`;
    return faker_1.faker.string.uuid();
}
function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
async function seedComprehensive() {
    console.log('Seeding HRMS database with comprehensive dataset...');
    // 1. Clean slate
    await (0, database_js_1.query)('SET FOREIGN_KEY_CHECKS = 0');
    const tables = [
        'form_submissions', 'form_templates',
        'ai_conversations', 'automation_workflows', 'webhook_configs', 'api_keys', 'report_definitions',
        'helpdesk_tickets', 'ticket_comments',
        'policy_acknowledgements', 'policies',
        'exit_cases', 'disciplinary_cases', 'grievances',
        'asset_allocations', 'assets',
        'performance_reviews', 'performance_cycles',
        'job_offers', 'interview_schedules', 'candidates', 'job_postings', 'requisitions',
        'training_enrollments', 'training_programs',
        'expense_claims', 'payroll_payslips', 'payroll_runs', 'salary_structures', 'salary_components',
        'overtime_requests', 'rosters', 'shifts',
        'leave_applications', 'leave_balances', 'leave_policies', 'leave_types', 'holidays',
        'attendance_locks', 'attendance_correction_requests', 'attendance_logs',
        'notifications', 'login_logs', 'audit_logs', 'refresh_tokens',
        'user_roles', 'role_permissions', 'permissions', 'roles', 'users',
        'employee_status_logs', 'employment_history', 'employee_documents', 'employee_family', 'employee_banks', 'employee_statutory', 'employees',
        'cost_centers', 'grades', 'designations', 'departments', 'branches', 'companies', 'tenants',
    ];
    for (const t of tables) {
        try {
            await (0, database_js_1.query)(`DELETE FROM \`${t}\``);
        }
        catch { /* ignore */ }
    }
    await (0, database_js_1.query)('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Cleaned existing data');
    // 2. Tenant
    const tenantId = uuid(1);
    await (0, database_js_1.query)(`INSERT INTO tenants (id, tenant_name, tenant_code, subscription_plan, status, max_companies, max_employees)
     VALUES (?, ?, ?, 'Enterprise', 'Active', 10, 50000)`, [tenantId, 'Nexus Global HR', 'NEXUS']);
    // 3. Company
    const companyId = uuid(2);
    await (0, database_js_1.query)(`INSERT INTO companies (id, tenant_id, company_name, legal_name, company_code, registered_address, email, phone, currency, timezone, status)
     VALUES (?, ?, 'Nexus Corp', 'Nexus Corporation Limited', 'NEX001', 'Tech Park, Whitefield, Bangalore', 'hr@nexuscorp.com', '+918023456789', 'INR', 'Asia/Kolkata', 'Active')`, [companyId, tenantId]);
    // 4. Branch
    const branchId = uuid(3);
    await (0, database_js_1.query)(`INSERT INTO branches (id, company_id, branch_name, branch_code, branch_type, address, city, state, country, pin_code, is_payroll_location, status)
     VALUES (?, ?, 'Bangalore HQ', 'BLR-HQ', 'office', 'Tech Park, Whitefield', 'Bangalore', 'Karnataka', 'India', '560066', TRUE, 'Active')`, [branchId, companyId]);
    // 5. Departments
    const departments = [
        { id: uuid(10), name: 'Human Resources', code: 'HR' },
        { id: uuid(11), name: 'Engineering', code: 'ENG' },
        { id: uuid(12), name: 'Finance', code: 'FIN' },
        { id: uuid(13), name: 'Sales', code: 'SALES' },
        { id: uuid(14), name: 'Operations', code: 'OPS' },
        { id: uuid(15), name: 'Marketing', code: 'MKT' },
        { id: uuid(16), name: 'Product', code: 'PROD' },
        { id: uuid(17), name: 'Customer Support', code: 'CS' },
    ];
    for (const dept of departments) {
        await (0, database_js_1.query)(`INSERT INTO departments (id, company_id, branch_id, department_name, department_code, parent_department_id, status)
       VALUES (?, ?, ?, ?, ?, NULL, 'Active')`, [dept.id, companyId, branchId, dept.name, dept.code]);
    }
    // 6. Designations
    const designations = [
        { id: uuid(20), name: 'Chief Executive Officer', code: 'CEO', level: 1 },
        { id: uuid(21), name: 'HR Manager', code: 'HRM', level: 2 },
        { id: uuid(22), name: 'HR Executive', code: 'HRE', level: 3 },
        { id: uuid(23), name: 'Software Engineer', code: 'SE', level: 3 },
        { id: uuid(24), name: 'Senior Software Engineer', code: 'SSE', level: 2 },
        { id: uuid(25), name: 'Engineering Manager', code: 'EM', level: 1 },
        { id: uuid(26), name: 'Finance Manager', code: 'FM', level: 2 },
        { id: uuid(27), name: 'Accountant', code: 'ACCT', level: 3 },
        { id: uuid(28), name: 'Sales Executive', code: 'SALESEX', level: 3 },
        { id: uuid(29), name: 'Sales Manager', code: 'SM', level: 2 },
        { id: uuid(30), name: 'DevOps Engineer', code: 'DEVOPS', level: 3 },
        { id: uuid(31), name: 'Product Manager', code: 'PM', level: 2 },
        { id: uuid(32), name: 'QA Engineer', code: 'QA', level: 3 },
        { id: uuid(33), name: 'Marketing Executive', code: 'MKTEX', level: 3 },
        { id: uuid(34), name: 'Customer Support Rep', code: 'CSR', level: 4 },
    ];
    for (const desig of designations) {
        await (0, database_js_1.query)(`INSERT INTO designations (id, company_id, designation_name, designation_code, level, status)
       VALUES (?, ?, ?, ?, ?, 'Active')`, [desig.id, companyId, desig.name, desig.code, desig.level]);
    }
    // 7. Grades
    const grades = [
        { id: uuid(40), code: 'E1', name: 'Entry Level', min: 300000, max: 700000 },
        { id: uuid(41), code: 'E2', name: 'Mid Level', min: 700000, max: 1500000 },
        { id: uuid(42), code: 'M1', name: 'Manager Level', min: 1500000, max: 3000000 },
        { id: uuid(43), code: 'M2', name: 'Senior Manager', min: 3000000, max: 6000000 },
        { id: uuid(44), code: 'L1', name: 'Leadership', min: 6000000, max: 20000000 },
    ];
    for (const grade of grades) {
        await (0, database_js_1.query)(`INSERT INTO grades (id, company_id, grade_name, grade_code, min_salary, max_salary, status)
       VALUES (?, ?, ?, ?, ?, ?, 'Active')`, [grade.id, companyId, grade.name, grade.code, grade.min, grade.max]);
    }
    // 8. Roles & 9. Permissions (Standard copy from seed.ts)
    const roleMap = {};
    const roleList = [
        ['Super Admin', 'Full system access'],
        ['HR Admin', 'Full HR module access'],
        ['HR Executive', 'Employee management and leave/attendance'],
        ['Payroll Admin', 'Payroll processing access'],
        ['Manager', 'Team management'],
        ['Employee', 'Self-service access'],
        ['Auditor', 'Read-only access'],
        ['Recruiter', 'Recruitment module access'],
    ];
    for (const [name, desc] of roleList) {
        const id = `role-${name.toLowerCase().replace(/\s+/g, '-')}`;
        await (0, database_js_1.query)(`INSERT IGNORE INTO roles (id, tenant_id, name, description, is_system) VALUES (?, ?, ?, ?, TRUE)`, [id, tenantId, name, desc]);
        roleMap[name] = id;
    }
    const perms = [
        ['ORG_VIEW', 'ORGANIZATION', 'VIEW'], ['ORG_CREATE', 'ORGANIZATION', 'CREATE'], ['ORG_EDIT', 'ORGANIZATION', 'EDIT'],
        ['EMP_VIEW', 'EMPLOYEE', 'VIEW'], ['EMP_CREATE', 'EMPLOYEE', 'CREATE'], ['EMP_EDIT', 'EMPLOYEE', 'EDIT'], ['EMP_DELETE', 'EMPLOYEE', 'DELETE'],
        ['ATTN_VIEW', 'ATTENDANCE', 'VIEW'], ['ATTN_CREATE', 'ATTENDANCE', 'CREATE'], ['ATTN_APPROVE', 'ATTENDANCE', 'APPROVE'],
        ['LEAVE_VIEW', 'LEAVE', 'VIEW'], ['LEAVE_APPLY', 'LEAVE', 'APPLY'], ['LEAVE_APPROVE', 'LEAVE', 'APPROVE'],
        ['SHIFT_VIEW', 'SHIFT', 'VIEW'], ['SHIFT_CREATE', 'SHIFT', 'CREATE'],
        ['OT_VIEW', 'OT', 'VIEW'], ['OT_APPROVE', 'OT', 'APPROVE'],
        ['PAYROLL_VIEW', 'PAYROLL', 'VIEW'], ['PAYROLL_RUN', 'PAYROLL', 'RUN'], ['PAYROLL_APPROVE', 'PAYROLL', 'APPROVE'],
        ['RECR_VIEW', 'RECR', 'VIEW'], ['RECR_CREATE', 'RECR', 'CREATE'],
        ['PERF_VIEW', 'PERF', 'VIEW'], ['PERF_CREATE', 'PERF', 'CREATE'], ['PERF_EDIT', 'PERF', 'EDIT'],
        ['ASSET_VIEW', 'ASSET', 'VIEW'], ['ASSET_CREATE', 'ASSET', 'CREATE'], ['ASSET_EDIT', 'ASSET', 'EDIT'],
        ['EXIT_VIEW', 'EXIT', 'VIEW'], ['EXIT_EDIT', 'EXIT', 'EDIT'],
        ['POLICY_VIEW', 'POLICY', 'VIEW'], ['POLICY_CREATE', 'POLICY', 'CREATE'],
        ['TICKET_VIEW', 'TICKET', 'VIEW'], ['REPORT_VIEW', 'REPORT', 'VIEW'],
        ['FORM_CREATE', 'FORM', 'CREATE'], ['STAT_VIEW', 'STAT', 'VIEW'],
    ];
    const permIdMap = {};
    for (const [code, module, action] of perms) {
        const id = `perm-${code.toLowerCase()}`;
        await (0, database_js_1.query)(`INSERT IGNORE INTO permissions (id, code, module, action) VALUES (?, ?, ?, ?)`, [id, code, module, action]);
        permIdMap[code] = id;
    }
    for (const permId of Object.values(permIdMap)) {
        await (0, database_js_1.query)(`INSERT IGNORE INTO role_permissions (id, role_id, permission_id) VALUES (UUID(), ?, ?)`, [roleMap['Super Admin'], permId]);
        await (0, database_js_1.query)(`INSERT IGNORE INTO role_permissions (id, role_id, permission_id) VALUES (UUID(), ?, ?)`, [roleMap['HR Admin'], permId]);
    }
    for (const code of ['EMP_VIEW', 'ATTN_VIEW', 'ATTN_CREATE', 'LEAVE_VIEW', 'LEAVE_APPLY', 'POLICY_VIEW', 'TICKET_VIEW']) {
        await (0, database_js_1.query)(`INSERT IGNORE INTO role_permissions (id, role_id, permission_id) VALUES (UUID(), ?, ?)`, [roleMap['Employee'], permIdMap[code]]);
    }
    for (const code of ['EMP_VIEW', 'ATTN_VIEW', 'ATTN_APPROVE', 'LEAVE_VIEW', 'LEAVE_APPROVE', 'OT_VIEW', 'OT_APPROVE', 'PERF_VIEW', 'PERF_EDIT', 'POLICY_VIEW']) {
        await (0, database_js_1.query)(`INSERT IGNORE INTO role_permissions (id, role_id, permission_id) VALUES (UUID(), ?, ?)`, [roleMap['Manager'], permIdMap[code]]);
    }
    for (const code of ['PAYROLL_VIEW', 'PAYROLL_RUN', 'PAYROLL_APPROVE', 'EMP_VIEW', 'REPORT_VIEW']) {
        await (0, database_js_1.query)(`INSERT IGNORE INTO role_permissions (id, role_id, permission_id) VALUES (UUID(), ?, ?)`, [roleMap['Payroll Admin'], permIdMap[code]]);
    }
    console.log('Roles & Permissions seeded');
    // 10. Generating 50 Employees
    const passwordHash = await bcrypt_1.default.hash('Admin@123', 12);
    const employees = [];
    const TOTAL_EMPLOYEES = 50;
    // We need at least 1 Admin, 1 HR, 1 Payroll, some Managers, many Employees.
    // We'll hardcode the first few for easy login, then generate the rest.
    employees.push({
        userId: uuid(100), empId: uuid(200), email: 'admin@nexus.com', name: 'System Admin', firstName: 'System', lastName: 'Admin',
        role: 'Super Admin', deptId: departments[0].id, desigId: designations[0].id, ctc: 5000000, gender: 'Male',
        dob: '1980-05-10', joined: '2020-01-01', status: 'Confirmed', mgrId: null
    });
    employees.push({
        userId: uuid(101), empId: uuid(201), email: 'hr.manager@nexus.com', name: 'Jane HR', firstName: 'Jane', lastName: 'HR',
        role: 'HR Admin', deptId: departments[0].id, desigId: designations[1].id, ctc: 1800000, gender: 'Female',
        dob: '1985-03-12', joined: '2021-03-15', status: 'Confirmed', mgrId: uuid(200)
    });
    employees.push({
        userId: uuid(102), empId: uuid(202), email: 'payroll@nexus.com', name: 'John Payroll', firstName: 'John', lastName: 'Payroll',
        role: 'Payroll Admin', deptId: departments[2].id, desigId: designations[6].id, ctc: 1500000, gender: 'Male',
        dob: '1988-06-20', joined: '2021-05-10', status: 'Confirmed', mgrId: uuid(200)
    });
    employees.push({
        userId: uuid(103), empId: uuid(203), email: 'manager@nexus.com', name: 'Bob Manager', firstName: 'Bob', lastName: 'Manager',
        role: 'Manager', deptId: departments[1].id, desigId: designations[5].id, ctc: 2500000, gender: 'Male',
        dob: '1982-11-08', joined: '2020-07-01', status: 'Confirmed', mgrId: uuid(200)
    });
    employees.push({
        userId: uuid(104), empId: uuid(204), email: 'employee@nexus.com', name: 'Alice Employee', firstName: 'Alice', lastName: 'Employee',
        role: 'Employee', deptId: departments[1].id, desigId: designations[3].id, ctc: 1200000, gender: 'Female',
        dob: '1995-02-14', joined: '2022-08-16', status: 'Confirmed', mgrId: uuid(203)
    });
    // Generate 45 more employees
    for (let i = 5; i < TOTAL_EMPLOYEES; i++) {
        const firstName = faker_1.faker.person.firstName();
        const lastName = faker_1.faker.person.lastName();
        const isManager = Math.random() < 0.15; // 15% are managers
        const role = isManager ? 'Manager' : 'Employee';
        const dept = randomItem(departments);
        const desigPool = designations.filter(d => isManager ? d.level <= 2 : d.level >= 3);
        const desig = desigPool.length > 0 ? randomItem(desigPool) : designations[3];
        const ctc = isManager ? faker_1.faker.number.int({ min: 1500000, max: 4000000 }) : faker_1.faker.number.int({ min: 400000, max: 1500000 });
        // Pick a random manager for employees
        let mgrId = null;
        if (!isManager) {
            const possibleMgrs = employees.filter(e => e.role === 'Manager' || e.role === 'Super Admin');
            mgrId = possibleMgrs.length > 0 ? randomItem(possibleMgrs).empId : uuid(200);
        }
        else {
            mgrId = uuid(200); // Admin manages managers
        }
        employees.push({
            userId: uuid(), empId: uuid(), email: faker_1.faker.internet.email({ firstName, lastName, provider: 'nexus.com' }).toLowerCase(),
            name: `${firstName} ${lastName}`, firstName, lastName,
            role, deptId: dept.id, desigId: desig.id, ctc, gender: faker_1.faker.person.sexType() === 'female' ? 'Female' : 'Male',
            dob: faker_1.faker.date.birthdate({ min: 22, max: 60, mode: 'age' }).toISOString().slice(0, 10),
            joined: faker_1.faker.date.past({ years: 4 }).toISOString().slice(0, 10),
            status: Math.random() > 0.1 ? 'Confirmed' : 'Probation',
            mgrId
        });
    }
    for (let i = 0; i < employees.length; i++) {
        const e = employees[i];
        const empCode = `NEX-${String(i + 1).padStart(3, '0')}`;
        await (0, database_js_1.query)(`INSERT INTO users (id, tenant_id, email, password_hash, full_name, is_active) VALUES (?, ?, ?, ?, ?, TRUE)`, [e.userId, tenantId, e.email, passwordHash, e.name]);
        await (0, database_js_1.query)(`INSERT INTO user_roles (id, user_id, role_id) VALUES (UUID(), ?, ?)`, [e.userId, roleMap[e.role]]);
        // Calculate dates
        const joinDate = new Date(e.joined);
        const confDate = new Date(joinDate);
        confDate.setMonth(confDate.getMonth() + 6);
        await (0, database_js_1.query)(`INSERT INTO employees
         (id, tenant_id, company_id, branch_id, department_id, designation_id, employee_code,
          first_name, last_name, email, mobile, date_of_joining, date_of_birth, gender,
          employment_type, work_type, cost_to_company, status, employment_status, user_id,
          reporting_manager_id, probation_months, confirmation_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Permanent', 'On-site', ?, 'Active', ?, ?, ?, 6, ?)`, [e.empId, tenantId, companyId, branchId, e.deptId, e.desigId,
            empCode, e.firstName, e.lastName, e.email, faker_1.faker.phone.number({ style: 'national' }).substring(0, 15),
            e.joined, e.dob, e.gender, e.ctc, e.status, e.userId, e.mgrId,
            e.status === 'Probation' ? null : confDate.toISOString().slice(0, 10)]);
        // Statutory
        await (0, database_js_1.query)(`INSERT INTO employee_statutory (id, employee_id, pan_masked, uan, pf_number) VALUES (UUID(), ?, ?, ?, ?)`, [e.empId, `ABCP${faker_1.faker.string.alphanumeric({ length: 4 }).toUpperCase()}Z`, `1001${faker_1.faker.string.numeric(8)}`, `MH/BOM/001/${faker_1.faker.string.numeric(5)}`]);
        // Bank
        await (0, database_js_1.query)(`INSERT INTO employee_banks (id, employee_id, bank_name, account_number_masked, ifsc, account_holder_name, payment_mode, is_primary)
       VALUES (UUID(), ?, ?, ?, ?, ?, 'Bank Transfer', TRUE)`, [e.empId, faker_1.faker.company.name() + ' Bank', `****${faker_1.faker.string.numeric(4)}`, `IFSC000${faker_1.faker.string.numeric(4)}`, e.name]);
    }
    console.log(`Seeded ${TOTAL_EMPLOYEES} employees`);
    // 11. Shifts & Rosters
    const shiftGenId = `shift-gen-${companyId.slice(0, 8)}`;
    await (0, database_js_1.query)(`INSERT INTO shifts (id, tenant_id, company_id, shift_name, shift_code, start_time, end_time, break_mins, status)
     VALUES (?, ?, ?, 'General Shift', 'GEN', '09:00', '18:00', 60, 'Active')`, [shiftGenId, tenantId, companyId]);
    for (const e of employees) {
        await (0, database_js_1.query)(`INSERT INTO rosters (id, tenant_id, employee_id, shift_id, from_date, to_date, roster_type)
       VALUES (UUID(), ?, ?, ?, '2025-01-01', '2026-12-31', 'Fixed')`, [tenantId, e.empId, shiftGenId]);
    }
    // 12. Leaves
    const leaveTypesData = [
        { name: 'Casual Leave', code: 'CL', quota: 8 },
        { name: 'Sick Leave', code: 'SL', quota: 12 },
        { name: 'Earned Leave', code: 'EL', quota: 15 },
    ];
    const leaveTypeMap = {};
    for (const lt of leaveTypesData) {
        const id = `lt-${lt.code.toLowerCase()}`;
        await (0, database_js_1.query)(`INSERT INTO leave_types (id, tenant_id, company_id, leave_name, leave_code, is_paid, status)
       VALUES (?, ?, ?, ?, ?, TRUE, 'Active')`, [id, tenantId, companyId, lt.name, lt.code]);
        leaveTypeMap[lt.code] = id;
    }
    const yr = 2026;
    for (const e of employees) {
        for (const lt of leaveTypesData) {
            const used = faker_1.faker.number.int({ min: 0, max: Math.min(lt.quota, 5) });
            await (0, database_js_1.query)(`INSERT INTO leave_balances (id, tenant_id, employee_id, leave_type_id, year, opening_balance, current_balance, used_ytd, pending_ytd)
         VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, 0)`, [tenantId, e.empId, leaveTypeMap[lt.code], yr, lt.quota, Math.max(0, lt.quota - used), used]);
        }
    }
    // Random Leave Apps
    for (let i = 0; i < 60; i++) {
        const e = randomItem(employees);
        const lt = randomItem(leaveTypesData);
        const days = faker_1.faker.number.int({ min: 1, max: 3 });
        const fromDate = faker_1.faker.date.recent({ days: 60 });
        const toDate = new Date(fromDate);
        toDate.setDate(toDate.getDate() + days - 1);
        await (0, database_js_1.query)(`INSERT INTO leave_applications (id, tenant_id, employee_id, leave_type_id, from_date, to_date, total_days, reason, status, approved_by, approved_at)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, 'Approved', ?, ?)`, [tenantId, e.empId, leaveTypeMap[lt.code], fromDate.toISOString().slice(0, 10), toDate.toISOString().slice(0, 10), days, faker_1.faker.lorem.sentence(), e.mgrId || uuid(200), new Date().toISOString().slice(0, 19).replace('T', ' ')]);
    }
    // 13. Salary Structures
    const components = [
        { code: 'BASIC', name: 'Basic Salary', type: 'Earning', tax: true, pf: true },
        { code: 'HRA', name: 'House Rent Allowance', type: 'Earning', tax: false, pf: false },
        { code: 'SPECIAL', name: 'Special Allowance', type: 'Earning', tax: true, pf: false },
        { code: 'PF', name: 'Provident Fund', type: 'Deduction', tax: false, pf: true },
        { code: 'PT', name: 'Professional Tax', type: 'Deduction', tax: false, pf: false },
    ];
    for (const c of components) {
        await (0, database_js_1.query)(`INSERT INTO salary_components (id, tenant_id, company_id, component_name, component_code, component_type, calculation_type, is_taxable, is_pf_applicable, status)
       VALUES (UUID(), ?, ?, ?, ?, ?, 'Percentage', ?, ?, 'Active')`, [tenantId, companyId, c.name, c.code, c.type, c.tax, c.pf]);
    }
    const ssStdId = `ss-std-${companyId.slice(0, 8)}`;
    await (0, database_js_1.query)(`INSERT INTO salary_structures (id, tenant_id, company_id, name, description, components_json, status) VALUES (?, ?, ?, ?, ?, ?, 'Active')`, [ssStdId, tenantId, companyId, 'Standard Structure', 'Default',
        JSON.stringify([{ code: 'BASIC', type: 'Earning', calc: 'Percentage', value: 50 }, { code: 'HRA', type: 'Earning', calc: 'Percentage', value: 20 }, { code: 'SPECIAL', type: 'Earning', calc: 'Percentage', value: 30 }, { code: 'PF', type: 'Deduction', calc: 'Percentage', value: 12 }, { code: 'PT', type: 'Deduction', calc: 'Fixed', value: 200 }])]);
    // 14. Payroll Runs (Last 3 months)
    const payrollPeriods = [
        { id: 'pr-comp-04', code: 'PR-COMP-2026-04', start: '2026-04-01', end: '2026-04-30', status: 'Approved' },
        { id: 'pr-comp-05', code: 'PR-COMP-2026-05', start: '2026-05-01', end: '2026-05-31', status: 'Approved' },
        { id: 'pr-comp-06', code: 'PR-COMP-2026-06', start: '2026-06-01', end: '2026-06-30', status: 'Processing' },
    ];
    for (const pp of payrollPeriods) {
        let totEarnings = 0, totDeductions = 0, totNet = 0;
        const slips = employees.map(e => {
            const basic = (e.ctc / 12) * 0.5;
            const hra = (e.ctc / 12) * 0.2;
            const special = (e.ctc / 12) * 0.3;
            const gross = basic + hra + special;
            const pf = basic * 0.12;
            const pt = 200;
            const deductions = pf + pt;
            const net = gross - deductions;
            totEarnings += gross;
            totDeductions += deductions;
            totNet += net;
            return { empId: e.empId, gross, pf, pt, deductions, net };
        });
        await (0, database_js_1.query)(`INSERT INTO payroll_runs (id, tenant_id, company_id, run_code, period_start, period_end, total_employees, total_earnings, total_deductions, total_net_pay, status, processed_by, approved_by, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [pp.id, tenantId, companyId, pp.code, pp.start, pp.end, employees.length,
            Math.round(totEarnings), Math.round(totDeductions), Math.round(totNet),
            pp.status, employees[2].empId, pp.status === 'Approved' ? employees[1].empId : null, employees[2].empId]);
        for (const s of slips) {
            await (0, database_js_1.query)(`INSERT INTO payroll_payslips (id, tenant_id, payroll_run_id, employee_id, gross_earnings, pf_employee, pf_employer, income_tax, total_deductions, net_pay, status, earnings_json, deductions_json)
         VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [tenantId, pp.id, s.empId, Math.round(s.gross), Math.round(s.pf), Math.round(s.pf), 0,
                Math.round(s.deductions), Math.round(s.net),
                pp.status === 'Approved' ? 'Published' : 'Draft',
                JSON.stringify([{ name: 'Basic', amount: Math.round(s.gross * 0.5) }, { name: 'HRA', amount: Math.round(s.gross * 0.2) }, { name: 'Special Allowance', amount: Math.round(s.gross * 0.3) }]),
                JSON.stringify([{ name: 'Provident Fund', amount: Math.round(s.pf) }, { name: 'Professional Tax', amount: 200 }])]);
        }
    }
    console.log('Payroll and Payslips seeded for 3 months');
    // 15. Attendance Logs (Last 20 days)
    console.log('Generating attendance logs... this may take a few seconds.');
    const baseDate = new Date('2026-06-20');
    for (let d = 20; d >= 1; d--) {
        const dt = new Date(baseDate);
        dt.setDate(baseDate.getDate() - d);
        if (dt.getDay() === 0 || dt.getDay() === 6)
            continue;
        const dateStr = dt.toISOString().slice(0, 10);
        for (const e of employees) {
            const rand = Math.random();
            let status, inTime = null, outTime = null, hours = null;
            if (rand < 0.9) {
                status = 'Present';
                inTime = `${dateStr} 09:00:00`;
                outTime = `${dateStr} 18:00:00`;
                hours = 8;
            }
            else {
                status = 'Absent';
            }
            try {
                await (0, database_js_1.query)(`INSERT IGNORE INTO attendance_logs (id, tenant_id, employee_id, attendance_date, in_time, out_time, total_hours, status, source)
           VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, 'System')`, [tenantId, e.empId, dateStr, inTime, outTime, hours, status]);
            }
            catch { /* ignore */ }
        }
    }
    // 16. Assets
    for (let i = 0; i < 30; i++) {
        const isAllocated = Math.random() > 0.3;
        const assignedEi = isAllocated ? randomItem(employees).empId : null;
        await (0, database_js_1.query)(`INSERT INTO assets (id, tenant_id, company_id, asset_code, asset_name, category, brand, model, serial_number, purchase_date, purchase_cost, status, condition_status, assigned_to)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Good', ?)`, [tenantId, companyId, `AST-${faker_1.faker.string.numeric(4)}`, faker_1.faker.commerce.productName(), randomItem(['Laptop', 'Monitor', 'Mobile']), faker_1.faker.company.name(), faker_1.faker.commerce.productAdjective(), faker_1.faker.string.uuid(), faker_1.faker.date.past().toISOString().slice(0, 10), faker_1.faker.commerce.price(), isAllocated ? 'Allocated' : 'Available', assignedEi]);
    }
    console.log('Seed Complete - Comprehensive');
}
seedComprehensive().catch(err => { console.error('Comprehensive Seed error:', err); process.exit(1); });
//# sourceMappingURL=seed-comprehensive.js.map