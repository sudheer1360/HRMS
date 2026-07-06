"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizationService = exports.OrganizationService = void 0;
const database_js_1 = require("../../config/database.js");
const index_js_1 = require("../../common/errors/index.js");
const index_js_2 = require("../../common/base/index.js");
// Allowed sort columns per entity — prevents SQL injection
const COMPANY_SORT_COLS = ['company_name', 'company_code', 'created_at', 'status'];
class OrganizationService extends index_js_2.BaseService {
    // ── Companies ──────────────────────────────────────────────────────────────
    async listCompanies(tenantId, params) {
        const { search, status } = params;
        const sort = this.sanitiseSortColumn(params.sort, COMPANY_SORT_COLS);
        const dir = this.sanitiseSortOrder(params.order);
        const { page, limit, offset } = this.buildPagination(params);
        let where = 'WHERE tenant_id = ? AND deleted_at IS NULL';
        const vals = [tenantId];
        if (status) {
            where += ' AND status = ?';
            vals.push(status);
        }
        if (search) {
            where += ' AND (company_name LIKE ? OR company_code LIKE ?)';
            vals.push(`%${search}%`, `%${search}%`);
        }
        const [rows, countResult] = await Promise.all([
            (0, database_js_1.query)(`SELECT * FROM companies ${where} ORDER BY ${sort} ${dir} LIMIT ? OFFSET ?`, [...vals, limit, offset]),
            (0, database_js_1.query)(`SELECT COUNT(*) as total FROM companies ${where}`, vals),
        ]);
        const total = countResult[0]?.total || 0;
        return { data: rows, meta: this.buildPaginatedMeta(total, page, limit) };
    }
    async getCompany(id, tenantId) {
        const c = await (0, database_js_1.queryOne)('SELECT * FROM companies WHERE id = ? AND tenant_id = ? AND deleted_at IS NULL', [id, tenantId]);
        if (!c)
            throw new index_js_1.NotFoundError('Company', id);
        const branches = await (0, database_js_1.query)('SELECT * FROM branches WHERE company_id = ? AND deleted_at IS NULL', [id]);
        const departments = await (0, database_js_1.query)('SELECT * FROM departments WHERE company_id = ? AND deleted_at IS NULL', [id]);
        return { ...c, branches, departments };
    }
    async createCompany(tenantId, userId, input) {
        const exists = await (0, database_js_1.queryOne)('SELECT id FROM companies WHERE tenant_id = ? AND company_code = ? AND deleted_at IS NULL', [tenantId, input.companyCode]);
        if (exists)
            throw new index_js_1.ConflictError('Company code already exists');
        const id = await (0, database_js_1.insert)(`INSERT INTO companies (id, tenant_id, company_name, legal_name, company_code, pan, tan, gstin, cin,
        pf_registration_number, esi_registration_number, registered_address, corporate_address,
        email, phone, website, financial_year_start_month, payroll_cycle, timezone, currency, created_by, status)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')`, [tenantId, input.companyName, input.legalName, input.companyCode,
            input.pan, input.tan, input.gstin, input.cin,
            input.pfRegistrationNumber, input.esiRegistrationNumber,
            input.registeredAddress, input.corporateAddress,
            input.email, input.phone, input.website,
            input.financialYearStartMonth || 'April',
            input.payrollCycle || 'Monthly',
            input.timezone || 'Asia/Kolkata',
            input.currency || 'INR', userId]);
        return (0, database_js_1.queryOne)('SELECT * FROM companies WHERE id = ?', [id]);
    }
    async updateCompany(id, tenantId, input) {
        const c = await (0, database_js_1.queryOne)('SELECT id FROM companies WHERE id = ? AND tenant_id = ? AND deleted_at IS NULL', [id, tenantId]);
        if (!c)
            throw new index_js_1.NotFoundError('Company', id);
        const { fields, vals } = this.buildUpdateFields(input, {
            companyName: 'company_name',
            legalName: 'legal_name',
            registeredAddress: 'registered_address',
            corporateAddress: 'corporate_address',
            email: 'email',
            phone: 'phone',
            website: 'website',
            pan: 'pan',
            tan: 'tan',
            gstin: 'gstin',
            cin: 'cin',
            financialYearStartMonth: 'financial_year_start_month',
            payrollCycle: 'payroll_cycle',
            status: 'status',
        });
        if (!fields.length)
            return (0, database_js_1.queryOne)('SELECT * FROM companies WHERE id = ?', [id]);
        await (0, database_js_1.query)(`UPDATE companies SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`, [...vals, id]);
        return (0, database_js_1.queryOne)('SELECT * FROM companies WHERE id = ?', [id]);
    }
    async deleteCompany(id, tenantId) {
        const c = await (0, database_js_1.queryOne)('SELECT id FROM companies WHERE id = ? AND tenant_id = ? AND deleted_at IS NULL', [id, tenantId]);
        if (!c)
            throw new index_js_1.NotFoundError('Company', id);
        await (0, database_js_1.query)('UPDATE companies SET deleted_at = NOW() WHERE id = ?', [id]);
        return { message: 'Company deleted' };
    }
    // ── Branches ───────────────────────────────────────────────────────────────
    async listBranches(tenantId, companyId, params) {
        const { search, status } = params || {};
        let where = 'WHERE company_id = ? AND deleted_at IS NULL';
        const vals = [companyId];
        if (status) {
            where += ' AND status = ?';
            vals.push(status);
        }
        if (search) {
            where += ' AND (branch_name LIKE ? OR branch_code LIKE ?)';
            vals.push(`%${search}%`, `%${search}%`);
        }
        const rows = await (0, database_js_1.query)(`SELECT * FROM branches ${where} ORDER BY branch_name`, vals);
        return { data: rows, meta: { total: rows.length } };
    }
    async getBranch(id, tenantId) {
        const b = await (0, database_js_1.queryOne)('SELECT * FROM branches WHERE id = ? AND deleted_at IS NULL', [id]);
        if (!b)
            throw new index_js_1.NotFoundError('Branch', id);
        return b;
    }
    async createBranch(tenantId, userId, input) {
        const exists = await (0, database_js_1.queryOne)('SELECT id FROM branches WHERE company_id = ? AND branch_code = ? AND deleted_at IS NULL', [input.companyId, input.branchCode]);
        if (exists)
            throw new index_js_1.ConflictError('Branch code already exists');
        const id = await (0, database_js_1.insert)(`INSERT INTO branches (id, company_id, branch_name, branch_code, branch_type, address, city, state, country, pin_code, is_payroll_location, latitude, longitude, created_by)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [input.companyId, input.branchName, input.branchCode, input.branchType ?? null,
            input.address ?? null, input.city ?? null, input.state ?? null, input.country || 'India',
            input.pinCode ?? null, input.isPayrollLocation || false,
            input.latitude ?? null, input.longitude ?? null, userId]);
        return (0, database_js_1.queryOne)('SELECT * FROM branches WHERE id = ?', [id]);
    }
    async updateBranch(id, tenantId, input) {
        const b = await (0, database_js_1.queryOne)('SELECT id FROM branches WHERE id = ? AND deleted_at IS NULL', [id]);
        if (!b)
            throw new index_js_1.NotFoundError('Branch', id);
        await (0, database_js_1.query)('UPDATE branches SET branch_name = ?, branch_type = ?, address = ?, city = ?, state = ?, pin_code = ?, is_payroll_location = ?, status = ?, updated_at = NOW() WHERE id = ?', [input.branchName, input.branchType, input.address, input.city, input.state, input.pinCode, input.isPayrollLocation, input.status || 'Active', id]);
        return (0, database_js_1.queryOne)('SELECT * FROM branches WHERE id = ?', [id]);
    }
    async deleteBranch(id, tenantId) {
        const b = await (0, database_js_1.queryOne)('SELECT id FROM branches WHERE id = ? AND deleted_at IS NULL', [id]);
        if (!b)
            throw new index_js_1.NotFoundError('Branch', id);
        await (0, database_js_1.query)('UPDATE branches SET deleted_at = NOW() WHERE id = ?', [id]);
        return { message: 'Branch deleted' };
    }
    // ── Departments ────────────────────────────────────────────────────────────
    async listDepartments(tenantId, companyId, params) {
        const { search, status } = params || {};
        let where = 'WHERE company_id = ? AND deleted_at IS NULL';
        const vals = [companyId];
        if (status) {
            where += ' AND status = ?';
            vals.push(status);
        }
        if (search) {
            where += ' AND department_name LIKE ?';
            vals.push(`%${search}%`);
        }
        const rows = await (0, database_js_1.query)(`SELECT * FROM departments ${where} ORDER BY department_name`, vals);
        return { data: rows, meta: { total: rows.length } };
    }
    async getDepartmentTree(tenantId, companyId) {
        const rows = await (0, database_js_1.query)('SELECT * FROM departments WHERE company_id = ? AND deleted_at IS NULL ORDER BY department_name', [companyId]);
        const buildTree = (items, parentId = null) => items.filter(i => (i.parent_department_id || null) === parentId)
            .map(i => ({ ...i, children: buildTree(items, i.id) }));
        return buildTree(rows);
    }
    async createDepartment(tenantId, userId, input) {
        const exists = await (0, database_js_1.queryOne)('SELECT id FROM departments WHERE company_id = ? AND department_code = ? AND deleted_at IS NULL', [input.companyId, input.departmentCode]);
        if (exists)
            throw new index_js_1.ConflictError('Department code already exists');
        let level = 0;
        if (input.parentDepartmentId) {
            const parent = await (0, database_js_1.queryOne)('SELECT level FROM departments WHERE id = ?', [input.parentDepartmentId]);
            level = (parent?.level || 0) + 1;
        }
        const id = await (0, database_js_1.insert)(`INSERT INTO departments (id, company_id, branch_id, parent_department_id, department_name, department_code, department_head_id, cost_center_id, level, created_by)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [input.companyId, input.branchId ?? null, input.parentDepartmentId ?? null, input.departmentName, input.departmentCode, input.departmentHeadId ?? null, input.costCenterId ?? null, level, userId]);
        return (0, database_js_1.queryOne)('SELECT * FROM departments WHERE id = ?', [id]);
    }
    async updateDepartment(id, tenantId, input) {
        const d = await (0, database_js_1.queryOne)('SELECT id, level FROM departments WHERE id = ? AND deleted_at IS NULL', [id]);
        if (!d)
            throw new index_js_1.NotFoundError('Department', id);
        // Recalculate level if parentDepartmentId is being changed
        let level = d.level ?? 0;
        if (input.parentDepartmentId !== undefined) {
            if (input.parentDepartmentId) {
                const parent = await (0, database_js_1.queryOne)('SELECT level FROM departments WHERE id = ?', [input.parentDepartmentId]);
                level = (parent?.level ?? 0) + 1;
            }
            else {
                level = 0;
            }
        }
        const { fields, vals } = this.buildUpdateFields(input, {
            departmentName: 'department_name',
            departmentHeadId: 'department_head_id',
            parentDepartmentId: 'parent_department_id',
            branchId: 'branch_id',
            status: 'status',
        });
        if (!fields.length && level === (d.level ?? 0)) {
            return (0, database_js_1.queryOne)('SELECT * FROM departments WHERE id = ?', [id]);
        }
        await (0, database_js_1.query)(`UPDATE departments SET ${fields.length ? fields.join(', ') + ', ' : ''}level = ?, updated_at = NOW() WHERE id = ?`, [...vals, level, id]);
        return (0, database_js_1.queryOne)('SELECT * FROM departments WHERE id = ?', [id]);
    }
    async deleteDepartment(id, tenantId) {
        const d = await (0, database_js_1.queryOne)('SELECT id FROM departments WHERE id = ? AND deleted_at IS NULL', [id]);
        if (!d)
            throw new index_js_1.NotFoundError('Department', id);
        await (0, database_js_1.query)('UPDATE departments SET deleted_at = NOW() WHERE id = ?', [id]);
        return { message: 'Department deleted' };
    }
    // ── Designations ───────────────────────────────────────────────────────────
    async listDesignations(tenantId, companyId, params) {
        const rows = await (0, database_js_1.query)('SELECT d.*, g.grade_name FROM designations d LEFT JOIN grades g ON d.grade_id = g.id WHERE d.company_id = ? AND d.deleted_at IS NULL ORDER BY d.designation_name', [companyId]);
        return { data: rows, meta: { total: rows.length } };
    }
    async createDesignation(tenantId, userId, input) {
        const exists = await (0, database_js_1.queryOne)('SELECT id FROM designations WHERE company_id = ? AND designation_code = ? AND deleted_at IS NULL', [input.companyId, input.designationCode]);
        if (exists)
            throw new index_js_1.ConflictError('Designation code already exists');
        const id = await (0, database_js_1.insert)('INSERT INTO designations (id, company_id, designation_name, designation_code, grade_id, level, created_by) VALUES (UUID(), ?, ?, ?, ?, ?, ?)', [input.companyId, input.designationName, input.designationCode, input.gradeId, input.level, userId]);
        return (0, database_js_1.queryOne)('SELECT * FROM designations WHERE id = ?', [id]);
    }
    async updateDesignation(id, tenantId, input) {
        const d = await (0, database_js_1.queryOne)('SELECT id FROM designations WHERE id = ? AND deleted_at IS NULL', [id]);
        if (!d)
            throw new index_js_1.NotFoundError('Designation', id);
        await (0, database_js_1.query)('UPDATE designations SET designation_name = ?, grade_id = ?, level = ?, status = ?, updated_at = NOW() WHERE id = ?', [input.designationName, input.gradeId, input.level, input.status || 'Active', id]);
        return (0, database_js_1.queryOne)('SELECT * FROM designations WHERE id = ?', [id]);
    }
    async deleteDesignation(id, tenantId) {
        const d = await (0, database_js_1.queryOne)('SELECT id FROM designations WHERE id = ? AND deleted_at IS NULL', [id]);
        if (!d)
            throw new index_js_1.NotFoundError('Designation', id);
        await (0, database_js_1.query)('UPDATE designations SET deleted_at = NOW() WHERE id = ?', [id]);
        return { message: 'Designation deleted' };
    }
    // ── Grades ─────────────────────────────────────────────────────────────────
    async listGrades(tenantId, companyId, params) {
        const rows = await (0, database_js_1.query)('SELECT * FROM grades WHERE company_id = ? AND deleted_at IS NULL ORDER BY sort_order', [companyId]);
        return { data: rows, meta: { total: rows.length } };
    }
    async createGrade(tenantId, userId, input) {
        const exists = await (0, database_js_1.queryOne)('SELECT id FROM grades WHERE company_id = ? AND grade_code = ?', [input.companyId, input.gradeCode]);
        if (exists)
            throw new index_js_1.ConflictError('Grade code already exists');
        const id = await (0, database_js_1.insert)('INSERT INTO grades (id, company_id, grade_name, grade_code, min_salary, max_salary, sort_order, created_by) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)', [input.companyId, input.gradeName, input.gradeCode, input.minSalary, input.maxSalary, input.sortOrder || 0, userId]);
        return (0, database_js_1.queryOne)('SELECT * FROM grades WHERE id = ?', [id]);
    }
    async updateGrade(id, tenantId, input) {
        const g = await (0, database_js_1.queryOne)('SELECT id FROM grades WHERE id = ? AND deleted_at IS NULL', [id]);
        if (!g)
            throw new index_js_1.NotFoundError('Grade', id);
        await (0, database_js_1.query)('UPDATE grades SET grade_name = ?, min_salary = ?, max_salary = ?, sort_order = ?, status = ?, updated_at = NOW() WHERE id = ?', [input.gradeName, input.minSalary, input.maxSalary, input.sortOrder, input.status || 'Active', id]);
        return (0, database_js_1.queryOne)('SELECT * FROM grades WHERE id = ?', [id]);
    }
    async deleteGrade(id, tenantId) {
        const g = await (0, database_js_1.queryOne)('SELECT id FROM grades WHERE id = ? AND deleted_at IS NULL', [id]);
        if (!g)
            throw new index_js_1.NotFoundError('Grade', id);
        await (0, database_js_1.query)('UPDATE grades SET deleted_at = NOW() WHERE id = ?', [id]);
        return { message: 'Grade deleted' };
    }
    // ── Cost Centers ───────────────────────────────────────────────────────────
    async listCostCenters(tenantId, companyId, params) {
        const rows = await (0, database_js_1.query)('SELECT * FROM cost_centers WHERE company_id = ? AND deleted_at IS NULL ORDER BY cost_center_name', [companyId]);
        return { data: rows, meta: { total: rows.length } };
    }
    async createCostCenter(tenantId, userId, input) {
        const exists = await (0, database_js_1.queryOne)('SELECT id FROM cost_centers WHERE company_id = ? AND cost_center_code = ? AND deleted_at IS NULL', [input.companyId, input.costCenterCode]);
        if (exists)
            throw new index_js_1.ConflictError('Cost center code already exists');
        const id = await (0, database_js_1.insert)('INSERT INTO cost_centers (id, company_id, cost_center_name, cost_center_code, branch_id, department_id, created_by) VALUES (UUID(), ?, ?, ?, ?, ?, ?)', [input.companyId, input.costCenterName, input.costCenterCode, input.branchId, input.departmentId, userId]);
        return (0, database_js_1.queryOne)('SELECT * FROM cost_centers WHERE id = ?', [id]);
    }
    async updateCostCenter(id, tenantId, input) {
        const cc = await (0, database_js_1.queryOne)('SELECT id FROM cost_centers WHERE id = ? AND deleted_at IS NULL', [id]);
        if (!cc)
            throw new index_js_1.NotFoundError('Cost Center', id);
        await (0, database_js_1.query)('UPDATE cost_centers SET cost_center_name = ?, status = ?, updated_at = NOW() WHERE id = ?', [input.costCenterName, input.status || 'Active', id]);
        return (0, database_js_1.queryOne)('SELECT * FROM cost_centers WHERE id = ?', [id]);
    }
    async deleteCostCenter(id, tenantId) {
        const cc = await (0, database_js_1.queryOne)('SELECT id FROM cost_centers WHERE id = ? AND deleted_at IS NULL', [id]);
        if (!cc)
            throw new index_js_1.NotFoundError('Cost Center', id);
        await (0, database_js_1.query)('UPDATE cost_centers SET deleted_at = NOW() WHERE id = ?', [id]);
        return { message: 'Cost center deleted' };
    }
}
exports.OrganizationService = OrganizationService;
exports.organizationService = new OrganizationService();
//# sourceMappingURL=organization.service.js.map