"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeeService = exports.EmployeeService = void 0;
const database_js_1 = require("../../config/database.js");
const index_js_1 = require("../../common/errors/index.js");
const index_js_2 = require("../../common/utils/index.js");
const index_js_3 = require("../../config/index.js");
const crypto_1 = __importDefault(require("crypto"));
class EmployeeService {
    async list(tenantId, params) {
        const { search, status, departmentId, designationId, employeeType, sort = 'created_at', order = 'desc' } = params;
        const page = Number(params.page || 1);
        const limit = Number(params.limit || 20);
        let where = 'WHERE e.tenant_id = ? AND e.deleted_at IS NULL';
        const vals = [tenantId];
        if (status) {
            where += ' AND e.employment_status = ?';
            vals.push(status);
        }
        if (departmentId) {
            where += ' AND e.department_id = ?';
            vals.push(departmentId);
        }
        if (designationId) {
            where += ' AND e.designation_id = ?';
            vals.push(designationId);
        }
        if (employeeType) {
            where += ' AND e.employment_type = ?';
            vals.push(employeeType);
        }
        if (search) {
            where += ' AND (e.full_name LIKE ? OR e.employee_code LIKE ? OR e.email LIKE ?)';
            vals.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        const [rows, countResult] = await Promise.all([
            (0, database_js_1.query)(`SELECT e.*, d.department_name, des.designation_name, b.branch_name, g.grade_name
        FROM employees e LEFT JOIN departments d ON e.department_id = d.id LEFT JOIN designations des ON e.designation_id = des.id
        LEFT JOIN branches b ON e.branch_id = b.id LEFT JOIN grades g ON e.grade_id = g.id
        ${where} ORDER BY e.${sort} ${order} LIMIT ? OFFSET ?`, [...vals, limit, (page - 1) * limit]),
            (0, database_js_1.query)(`SELECT COUNT(*) as total FROM employees e ${where}`, vals),
        ]);
        const total = countResult[0]?.total || 0;
        return { data: rows, meta: { page, limit, total, totalPages: Math.ceil(total / limit), hasNext: page * limit < total, hasPrev: page > 1 } };
    }
    async getById(id, tenantId) {
        const emp = await (0, database_js_1.queryOne)(`SELECT e.*,
        b.branch_name, b.branch_code, b.branch_type,
        d.department_name, d.department_code,
        des.designation_name, des.designation_code,
        g.grade_name, g.grade_code,
        CONCAT(rm.first_name, ' ', rm.last_name) AS reporting_manager_name,
        rm.employee_code AS reporting_manager_code
       FROM employees e
       LEFT JOIN branches      b   ON e.branch_id      = b.id
       LEFT JOIN departments   d   ON e.department_id  = d.id
       LEFT JOIN designations  des ON e.designation_id = des.id
       LEFT JOIN grades        g   ON e.grade_id       = g.id
       LEFT JOIN employees     rm  ON e.reporting_manager_id = rm.id
       WHERE e.id = ? AND e.tenant_id = ? AND e.deleted_at IS NULL`, [id, tenantId]);
        if (!emp)
            throw new index_js_1.NotFoundError('Employee', id);
        const statutory = await (0, database_js_1.queryOne)('SELECT * FROM employee_statutory WHERE employee_id = ?', [id]);
        const banks = await (0, database_js_1.query)('SELECT * FROM employee_banks WHERE employee_id = ?', [id]);
        const family = await (0, database_js_1.query)('SELECT * FROM employee_family WHERE employee_id = ?', [id]);
        const docs = await (0, database_js_1.query)('SELECT * FROM employee_documents WHERE employee_id = ?', [id]);
        // NOTE: DB driver returns camelCase — statutory/bank fields already transformed
        // (aadhaarMasked, panMasked, accountNumberMasked, etc.)
        // Shape nested relation objects for the frontend
        // NOTE: DB driver auto-converts snake_case → camelCase, so use camelCase keys here
        return {
            ...emp,
            // Use field names the frontend expects (branchName, departmentName, etc.)
            branch: emp.branchId ? { id: emp.branchId, branchName: emp.branchName, code: emp.branchCode } : null,
            department: emp.departmentId ? { id: emp.departmentId, departmentName: emp.departmentName, code: emp.departmentCode } : null,
            designation: emp.designationId ? { id: emp.designationId, designationName: emp.designationName, code: emp.designationCode } : null,
            grade: emp.gradeId ? { id: emp.gradeId, gradeName: emp.gradeName, code: emp.gradeCode } : null,
            reportingManager: emp.reportingManagerId ? { id: emp.reportingManagerId, fullName: emp.reportingManagerName, code: emp.reportingManagerCode } : null,
            statutoryDetails: statutory,
            bankDetails: banks,
            familyMembers: family,
            documents: docs,
        };
    }
    async create(tenantId, userId, input) {
        // Validate uniqueness
        const dup = await (0, database_js_1.queryOne)('SELECT id FROM employees WHERE tenant_id = ? AND (email = ? OR mobile = ?) AND deleted_at IS NULL', [tenantId, input.email, input.mobile]);
        if (dup)
            throw new index_js_1.ConflictError('Email or mobile already exists');
        if (input.pan && (0, index_js_2.isValidPAN)(input.pan)) {
            const masked = (0, index_js_2.maskPAN)(input.pan);
            const dupPan = await (0, database_js_1.queryOne)('SELECT id FROM employee_statutory WHERE pan_masked = ?', [masked]);
            if (dupPan)
                throw new index_js_1.ConflictError('PAN already exists');
        }
        // Generate employee code
        const last = await (0, database_js_1.queryOne)('SELECT employee_code FROM employees WHERE tenant_id = ? ORDER BY employee_code DESC LIMIT 1', [tenantId]);
        let seq = 1;
        if (last) {
            const n = parseInt((last.employeeCode || '').replace(/\D/g, ''), 10);
            if (!isNaN(n))
                seq = n + 1;
        }
        const code = input.employeeCode || `EMP${String(seq).padStart(6, '0')}`;
        const fullName = [input.firstName, input.middleName, input.lastName].filter(Boolean).join(' ');
        return (0, database_js_1.transaction)(async (conn) => {
            const empId = crypto_1.default.randomUUID();
            await conn.execute(`INSERT INTO employees (id, tenant_id, company_id, branch_id, department_id, designation_id, grade_id, employee_code,
          first_name, middle_name, last_name, gender, date_of_birth, marital_status, blood_group, nationality,
          mobile, email, present_address, permanent_address, emergency_contact_name, emergency_contact_number, emergency_relationship,
          date_of_joining, employment_type, reporting_manager_id, hr_manager_id, probation_months, notice_period_days, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [empId, tenantId, input.companyId, input.branchId ?? null, input.departmentId ?? null, input.designationId ?? null, input.gradeId ?? null, code,
                input.firstName, input.middleName ?? null, input.lastName, input.gender ?? null, input.dateOfBirth ?? null, input.maritalStatus ?? null, input.bloodGroup ?? null, input.nationality ?? null,
                input.mobile, input.email, input.presentAddress ?? null, input.permanentAddress ?? null, input.emergencyContactName ?? null, input.emergencyContactNumber ?? null, input.emergencyRelationship ?? null,
                input.dateOfJoining, input.employeeType ?? null, input.reportingManagerId ?? null, input.hrManagerId ?? null, input.probationMonths || 6, input.noticePeriodDays || 30, userId]);
            if (input.pan || input.aadhaar || input.uan) {
                const aadhaarEnc = input.aadhaar ? this.encrypt(input.aadhaar) : null;
                const panEnc = input.pan ? this.encrypt(input.pan) : null;
                await conn.execute(`INSERT INTO employee_statutory (id, employee_id, aadhaar_encrypted, aadhaar_masked, pan_encrypted, pan_masked, uan, pf_number, esi_ip_number, pt_applicable, lwf_applicable, gratuity_applicable)
           VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [empId, aadhaarEnc, input.aadhaar ? (0, index_js_2.maskAadhaar)(input.aadhaar) : null, panEnc, input.pan ? (0, index_js_2.maskPAN)(input.pan) : null, input.uan, input.pfNumber, input.esiIpNumber, input.ptApplicable || false, input.lwfApplicable || false, input.gratuityApplicable !== false]);
            }
            if (input.bankName && input.accountNumber) {
                await conn.execute(`INSERT INTO employee_banks (id, employee_id, bank_name, account_number_encrypted, account_number_masked, ifsc, account_holder_name, payment_mode, is_primary)
           VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, TRUE)`, [empId, input.bankName, this.encrypt(input.accountNumber), (0, index_js_2.maskAccountNumber)(input.accountNumber), input.ifsc, input.accountHolderName || fullName, input.paymentMode || 'Bank Transfer']);
            }
            await conn.execute('INSERT INTO employee_status_logs (id, employee_id, from_status, to_status, changed_by) VALUES (UUID(), ?, ?, ?, ?)', [empId, 'Draft', 'Probation', userId]);
            return (0, database_js_1.queryOne)('SELECT * FROM employees WHERE id = ?', [empId]);
        });
    }
    async update(id, tenantId, input) {
        const emp = await (0, database_js_1.queryOne)('SELECT id FROM employees WHERE id = ? AND tenant_id = ? AND deleted_at IS NULL', [id, tenantId]);
        if (!emp)
            throw new index_js_1.NotFoundError('Employee', id);
        // Normalise: treat empty strings as null for optional fields
        const or = (v) => (v === '' || v === undefined ? null : v);
        await (0, database_js_1.execute)(`UPDATE employees SET
        first_name              = COALESCE(?, first_name),
        middle_name             = ?,
        last_name               = COALESCE(?, last_name),
        gender                  = ?,
        date_of_birth           = COALESCE(?, date_of_birth),
        marital_status          = ?,
        blood_group             = ?,
        nationality             = COALESCE(?, nationality),
        mobile                  = COALESCE(?, mobile),
        email                   = COALESCE(?, email),
        alternate_mobile        = ?,
        present_address         = ?,
        permanent_address       = ?,
        emergency_contact_name  = ?,
        emergency_contact_number= ?,
        emergency_relationship  = ?,
        date_of_joining         = COALESCE(?, date_of_joining),
        employment_type         = ?,
        branch_id               = ?,
        department_id           = ?,
        designation_id          = ?,
        grade_id                = ?,
        reporting_manager_id    = ?,
        probation_months        = COALESCE(?, probation_months),
        notice_period_days      = COALESCE(?, notice_period_days),
        confirmation_date       = ?,
        updated_at              = NOW()
       WHERE id = ?`, [
            or(input.firstName), or(input.middleName),
            or(input.lastName), or(input.gender),
            or(input.dateOfBirth), or(input.maritalStatus),
            or(input.bloodGroup), or(input.nationality),
            or(input.mobile), or(input.email),
            or(input.alternateMobile),
            or(input.presentAddress), or(input.permanentAddress),
            or(input.emergencyContactName), or(input.emergencyContactNumber), or(input.emergencyRelationship),
            or(input.dateOfJoining), or(input.employeeType),
            or(input.branchId), or(input.departmentId),
            or(input.designationId), or(input.gradeId),
            or(input.reportingManagerId),
            or(input.probationMonths), or(input.noticePeriodDays),
            or(input.confirmationDate),
            id,
        ]);
        return (0, database_js_1.queryOne)('SELECT * FROM employees WHERE id = ?', [id]);
    }
    async delete(id, tenantId) {
        const emp = await (0, database_js_1.queryOne)('SELECT id FROM employees WHERE id = ? AND tenant_id = ? AND deleted_at IS NULL', [id, tenantId]);
        if (!emp)
            throw new index_js_1.NotFoundError('Employee', id);
        await (0, database_js_1.execute)('UPDATE employees SET deleted_at = NOW() WHERE id = ?', [id]);
        return { message: 'Employee deleted' };
    }
    async changeStatus(id, tenantId, userId, newStatus, reason) {
        const emp = await (0, database_js_1.queryOne)('SELECT employment_status FROM employees WHERE id = ? AND tenant_id = ?', [id, tenantId]);
        if (!emp)
            throw new index_js_1.NotFoundError('Employee', id);
        await (0, database_js_1.transaction)(async (conn) => {
            await conn.execute('UPDATE employees SET employment_status = ? WHERE id = ?', [newStatus, id]);
            await conn.execute('INSERT INTO employee_status_logs (id, employee_id, from_status, to_status, reason, changed_by) VALUES (UUID(), ?, ?, ?, ?, ?)', [id, emp.employmentStatus ?? null, newStatus, reason ?? null, userId ?? null]);
        });
        return (0, database_js_1.queryOne)('SELECT * FROM employees WHERE id = ?', [id]);
    }
    encrypt(text) {
        const key = Buffer.from(index_js_3.config.encryption.key, 'utf8').subarray(0, 32);
        const iv = crypto_1.default.randomBytes(16);
        const cipher = crypto_1.default.createCipheriv('aes-256-gcm', key, iv);
        let enc = cipher.update(text, 'utf8', 'hex');
        enc += cipher.final('hex');
        return `${iv.toString('hex')}:${cipher.getAuthTag().toString('hex')}:${enc}`;
    }
}
exports.EmployeeService = EmployeeService;
exports.employeeService = new EmployeeService();
//# sourceMappingURL=employee.service.js.map