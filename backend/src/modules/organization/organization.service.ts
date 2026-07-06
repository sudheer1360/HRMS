import { query, queryOne, insert, execute } from '../../config/database.js';
import { NotFoundError, ConflictError } from '../../common/errors/index.js';
import { BaseService } from '../../common/base/index.js';
import { ICompany, IBranch, IDepartment, IDesignation, IGrade, ICostCenter } from '../../common/interfaces/index.js';

// Allowed sort columns per entity — prevents SQL injection
const COMPANY_SORT_COLS = ['company_name', 'company_code', 'created_at', 'status'];

export class OrganizationService extends BaseService {
  // ── Companies ──────────────────────────────────────────────────────────────

  async listCompanies(tenantId: string, params: any) {
    const { search, status } = params;
    const sort = this.sanitiseSortColumn(params.sort, COMPANY_SORT_COLS);
    const dir  = this.sanitiseSortOrder(params.order);
    const { page, limit, offset } = this.buildPagination(params);

    let where = 'WHERE tenant_id = ? AND deleted_at IS NULL';
    const vals: any[] = [tenantId];
    if (status) { where += ' AND status = ?'; vals.push(status); }
    if (search) { where += ' AND (company_name LIKE ? OR company_code LIKE ?)'; vals.push(`%${search}%`, `%${search}%`); }

    const [rows, countResult] = await Promise.all([
      query<ICompany>(`SELECT * FROM companies ${where} ORDER BY ${sort} ${dir} LIMIT ? OFFSET ?`, [...vals, limit, offset]),
      query<{ total: number }>(`SELECT COUNT(*) as total FROM companies ${where}`, vals),
    ]);
    const total = countResult[0]?.total || 0;
    return { data: rows, meta: this.buildPaginatedMeta(total, page, limit) };
  }

  async getCompany(id: string, tenantId: string) {
    const c = await queryOne<any>('SELECT * FROM companies WHERE id = ? AND tenant_id = ? AND deleted_at IS NULL', [id, tenantId]);
    if (!c) throw new NotFoundError('Company', id);
    const branches = await query('SELECT * FROM branches WHERE company_id = ? AND deleted_at IS NULL', [id]);
    const departments = await query('SELECT * FROM departments WHERE company_id = ? AND deleted_at IS NULL', [id]);
    return { ...c, branches, departments };
  }

  async createCompany(tenantId: string, userId: string, input: any) {
    const exists = await queryOne('SELECT id FROM companies WHERE tenant_id = ? AND company_code = ? AND deleted_at IS NULL', [tenantId, input.companyCode]);
    if (exists) throw new ConflictError('Company code already exists');
    const id = await insert(
      `INSERT INTO companies (id, tenant_id, company_name, legal_name, company_code, pan, tan, gstin, cin,
        pf_registration_number, esi_registration_number, registered_address, corporate_address,
        email, phone, website, financial_year_start_month, payroll_cycle, timezone, currency, created_by, status)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')`,
      [tenantId, input.companyName, input.legalName, input.companyCode,
       input.pan, input.tan, input.gstin, input.cin,
       input.pfRegistrationNumber, input.esiRegistrationNumber,
       input.registeredAddress, input.corporateAddress,
       input.email, input.phone, input.website,
       input.financialYearStartMonth || 'April',
       input.payrollCycle || 'Monthly',
       input.timezone || 'Asia/Kolkata',
       input.currency || 'INR', userId]
    );
    return queryOne('SELECT * FROM companies WHERE id = ?', [id]);
  }

  async updateCompany(id: string, tenantId: string, input: any) {
    const c = await queryOne('SELECT id FROM companies WHERE id = ? AND tenant_id = ? AND deleted_at IS NULL', [id, tenantId]);
    if (!c) throw new NotFoundError('Company', id);

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

    if (!fields.length) return queryOne<ICompany>('SELECT * FROM companies WHERE id = ?', [id]);
    await query(`UPDATE companies SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`, [...vals, id]);
    return queryOne<ICompany>('SELECT * FROM companies WHERE id = ?', [id]);
  }

  async deleteCompany(id: string, tenantId: string) {
    const c = await queryOne('SELECT id FROM companies WHERE id = ? AND tenant_id = ? AND deleted_at IS NULL', [id, tenantId]);
    if (!c) throw new NotFoundError('Company', id);
    await query('UPDATE companies SET deleted_at = NOW() WHERE id = ?', [id]);
    return { message: 'Company deleted' };
  }

  // ── Branches ───────────────────────────────────────────────────────────────

  async listBranches(tenantId: string, companyId: string, params: any) {
    const { search, status } = params || {};
    let where = 'WHERE company_id = ? AND deleted_at IS NULL';
    const vals: any[] = [companyId];
    if (status) { where += ' AND status = ?'; vals.push(status); }
    if (search) { where += ' AND (branch_name LIKE ? OR branch_code LIKE ?)'; vals.push(`%${search}%`, `%${search}%`); }
    const rows = await query(`SELECT * FROM branches ${where} ORDER BY branch_name`, vals);
    return { data: rows, meta: { total: rows.length } };
  }

  async getBranch(id: string, tenantId: string) {
    const b = await queryOne('SELECT * FROM branches WHERE id = ? AND deleted_at IS NULL', [id]);
    if (!b) throw new NotFoundError('Branch', id);
    return b;
  }

  async createBranch(tenantId: string, userId: string, input: any) {
    const exists = await queryOne('SELECT id FROM branches WHERE company_id = ? AND branch_code = ? AND deleted_at IS NULL', [input.companyId, input.branchCode]);
    if (exists) throw new ConflictError('Branch code already exists');
    const id = await insert(
      `INSERT INTO branches (id, company_id, branch_name, branch_code, branch_type, address, city, state, country, pin_code, is_payroll_location, latitude, longitude, created_by)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [input.companyId, input.branchName, input.branchCode, input.branchType ?? null,
       input.address ?? null, input.city ?? null, input.state ?? null, input.country || 'India',
       input.pinCode ?? null, input.isPayrollLocation || false,
       input.latitude ?? null, input.longitude ?? null, userId]
    );
    return queryOne('SELECT * FROM branches WHERE id = ?', [id]);
  }

  async updateBranch(id: string, tenantId: string, input: any) {
    const b = await queryOne('SELECT id FROM branches WHERE id = ? AND deleted_at IS NULL', [id]);
    if (!b) throw new NotFoundError('Branch', id);
    await query(
      'UPDATE branches SET branch_name = ?, branch_type = ?, address = ?, city = ?, state = ?, pin_code = ?, is_payroll_location = ?, status = ?, updated_at = NOW() WHERE id = ?',
      [input.branchName, input.branchType, input.address, input.city, input.state, input.pinCode, input.isPayrollLocation, input.status || 'Active', id]
    );
    return queryOne('SELECT * FROM branches WHERE id = ?', [id]);
  }

  async deleteBranch(id: string, tenantId: string) {
    const b = await queryOne('SELECT id FROM branches WHERE id = ? AND deleted_at IS NULL', [id]);
    if (!b) throw new NotFoundError('Branch', id);
    await query('UPDATE branches SET deleted_at = NOW() WHERE id = ?', [id]);
    return { message: 'Branch deleted' };
  }

  // ── Departments ────────────────────────────────────────────────────────────

  async listDepartments(tenantId: string, companyId: string, params: any) {
    const { search, status } = params || {};
    let where = 'WHERE company_id = ? AND deleted_at IS NULL';
    const vals: any[] = [companyId];
    if (status) { where += ' AND status = ?'; vals.push(status); }
    if (search) { where += ' AND department_name LIKE ?'; vals.push(`%${search}%`); }
    const rows = await query(`SELECT * FROM departments ${where} ORDER BY department_name`, vals);
    return { data: rows, meta: { total: rows.length } };
  }

  async getDepartmentTree(tenantId: string, companyId: string) {
    const rows = await query<any[]>('SELECT * FROM departments WHERE company_id = ? AND deleted_at IS NULL ORDER BY department_name', [companyId]) as any[];
    const buildTree = (items: any[], parentId: string | null = null): any[] =>
      items.filter(i => (i.parent_department_id || null) === parentId)
           .map(i => ({ ...i, children: buildTree(items, i.id) }));
    return buildTree(rows as any[]);
  }

  async createDepartment(tenantId: string, userId: string, input: any) {
    const exists = await queryOne('SELECT id FROM departments WHERE company_id = ? AND department_code = ? AND deleted_at IS NULL', [input.companyId, input.departmentCode]);
    if (exists) throw new ConflictError('Department code already exists');
    let level = 0;
    if (input.parentDepartmentId) {
      const parent = await queryOne<any>('SELECT level FROM departments WHERE id = ?', [input.parentDepartmentId]);
      level = (parent?.level || 0) + 1;
    }
    const id = await insert(
      `INSERT INTO departments (id, company_id, branch_id, parent_department_id, department_name, department_code, department_head_id, cost_center_id, level, created_by)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [input.companyId, input.branchId ?? null, input.parentDepartmentId ?? null, input.departmentName, input.departmentCode, input.departmentHeadId ?? null, input.costCenterId ?? null, level, userId]
    );
    return queryOne('SELECT * FROM departments WHERE id = ?', [id]);
  }

  async updateDepartment(id: string, tenantId: string, input: any) {
    const d = await queryOne<any>('SELECT id, level FROM departments WHERE id = ? AND deleted_at IS NULL', [id]);
    if (!d) throw new NotFoundError('Department', id);

    // Recalculate level if parentDepartmentId is being changed
    let level = d.level ?? 0;
    if (input.parentDepartmentId !== undefined) {
      if (input.parentDepartmentId) {
        const parent = await queryOne<any>('SELECT level FROM departments WHERE id = ?', [input.parentDepartmentId]);
        level = (parent?.level ?? 0) + 1;
      } else {
        level = 0;
      }
    }

    const { fields, vals } = this.buildUpdateFields(input, {
      departmentName:     'department_name',
      departmentHeadId:   'department_head_id',
      parentDepartmentId: 'parent_department_id',
      branchId:           'branch_id',
      status:             'status',
    });

    if (!fields.length && level === (d.level ?? 0)) {
      return queryOne('SELECT * FROM departments WHERE id = ?', [id]);
    }

    await query(
      `UPDATE departments SET ${fields.length ? fields.join(', ') + ', ' : ''}level = ?, updated_at = NOW() WHERE id = ?`,
      [...vals, level, id]
    );
    return queryOne('SELECT * FROM departments WHERE id = ?', [id]);
  }

  async deleteDepartment(id: string, tenantId: string) {
    const d = await queryOne('SELECT id FROM departments WHERE id = ? AND deleted_at IS NULL', [id]);
    if (!d) throw new NotFoundError('Department', id);
    await query('UPDATE departments SET deleted_at = NOW() WHERE id = ?', [id]);
    return { message: 'Department deleted' };
  }

  // ── Designations ───────────────────────────────────────────────────────────

  async listDesignations(tenantId: string, companyId: string, params: any) {
    const rows = await query(
      'SELECT d.*, g.grade_name FROM designations d LEFT JOIN grades g ON d.grade_id = g.id WHERE d.company_id = ? AND d.deleted_at IS NULL ORDER BY d.designation_name',
      [companyId]
    );
    return { data: rows, meta: { total: (rows as any[]).length } };
  }

  async createDesignation(tenantId: string, userId: string, input: any) {
    const exists = await queryOne('SELECT id FROM designations WHERE company_id = ? AND designation_code = ? AND deleted_at IS NULL', [input.companyId, input.designationCode]);
    if (exists) throw new ConflictError('Designation code already exists');
    const id = await insert(
      'INSERT INTO designations (id, company_id, designation_name, designation_code, grade_id, level, created_by) VALUES (UUID(), ?, ?, ?, ?, ?, ?)',
      [input.companyId, input.designationName, input.designationCode, input.gradeId, input.level, userId]
    );
    return queryOne('SELECT * FROM designations WHERE id = ?', [id]);
  }

  async updateDesignation(id: string, tenantId: string, input: any) {
    const d = await queryOne('SELECT id FROM designations WHERE id = ? AND deleted_at IS NULL', [id]);
    if (!d) throw new NotFoundError('Designation', id);
    await query('UPDATE designations SET designation_name = ?, grade_id = ?, level = ?, status = ?, updated_at = NOW() WHERE id = ?',
      [input.designationName, input.gradeId, input.level, input.status || 'Active', id]);
    return queryOne('SELECT * FROM designations WHERE id = ?', [id]);
  }

  async deleteDesignation(id: string, tenantId: string) {
    const d = await queryOne('SELECT id FROM designations WHERE id = ? AND deleted_at IS NULL', [id]);
    if (!d) throw new NotFoundError('Designation', id);
    await query('UPDATE designations SET deleted_at = NOW() WHERE id = ?', [id]);
    return { message: 'Designation deleted' };
  }

  // ── Grades ─────────────────────────────────────────────────────────────────

  async listGrades(tenantId: string, companyId: string, params: any) {
    const rows = await query('SELECT * FROM grades WHERE company_id = ? AND deleted_at IS NULL ORDER BY sort_order', [companyId]);
    return { data: rows, meta: { total: (rows as any[]).length } };
  }

  async createGrade(tenantId: string, userId: string, input: any) {
    const exists = await queryOne('SELECT id FROM grades WHERE company_id = ? AND grade_code = ?', [input.companyId, input.gradeCode]);
    if (exists) throw new ConflictError('Grade code already exists');
    const id = await insert(
      'INSERT INTO grades (id, company_id, grade_name, grade_code, min_salary, max_salary, sort_order, created_by) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)',
      [input.companyId, input.gradeName, input.gradeCode, input.minSalary, input.maxSalary, input.sortOrder || 0, userId]
    );
    return queryOne('SELECT * FROM grades WHERE id = ?', [id]);
  }

  async updateGrade(id: string, tenantId: string, input: any) {
    const g = await queryOne('SELECT id FROM grades WHERE id = ? AND deleted_at IS NULL', [id]);
    if (!g) throw new NotFoundError('Grade', id);
    await query('UPDATE grades SET grade_name = ?, min_salary = ?, max_salary = ?, sort_order = ?, status = ?, updated_at = NOW() WHERE id = ?',
      [input.gradeName, input.minSalary, input.maxSalary, input.sortOrder, input.status || 'Active', id]);
    return queryOne('SELECT * FROM grades WHERE id = ?', [id]);
  }

  async deleteGrade(id: string, tenantId: string) {
    const g = await queryOne('SELECT id FROM grades WHERE id = ? AND deleted_at IS NULL', [id]);
    if (!g) throw new NotFoundError('Grade', id);
    await query('UPDATE grades SET deleted_at = NOW() WHERE id = ?', [id]);
    return { message: 'Grade deleted' };
  }

  // ── Cost Centers ───────────────────────────────────────────────────────────

  async listCostCenters(tenantId: string, companyId: string, params: any) {
    const rows = await query('SELECT * FROM cost_centers WHERE company_id = ? AND deleted_at IS NULL ORDER BY cost_center_name', [companyId]);
    return { data: rows, meta: { total: (rows as any[]).length } };
  }

  async createCostCenter(tenantId: string, userId: string, input: any) {
    const exists = await queryOne('SELECT id FROM cost_centers WHERE company_id = ? AND cost_center_code = ? AND deleted_at IS NULL', [input.companyId, input.costCenterCode]);
    if (exists) throw new ConflictError('Cost center code already exists');
    const id = await insert(
      'INSERT INTO cost_centers (id, company_id, cost_center_name, cost_center_code, branch_id, department_id, created_by) VALUES (UUID(), ?, ?, ?, ?, ?, ?)',
      [input.companyId, input.costCenterName, input.costCenterCode, input.branchId, input.departmentId, userId]
    );
    return queryOne('SELECT * FROM cost_centers WHERE id = ?', [id]);
  }

  async updateCostCenter(id: string, tenantId: string, input: any) {
    const cc = await queryOne('SELECT id FROM cost_centers WHERE id = ? AND deleted_at IS NULL', [id]);
    if (!cc) throw new NotFoundError('Cost Center', id);
    await query('UPDATE cost_centers SET cost_center_name = ?, status = ?, updated_at = NOW() WHERE id = ?',
      [input.costCenterName, input.status || 'Active', id]);
    return queryOne('SELECT * FROM cost_centers WHERE id = ?', [id]);
  }

  async deleteCostCenter(id: string, tenantId: string) {
    const cc = await queryOne('SELECT id FROM cost_centers WHERE id = ? AND deleted_at IS NULL', [id]);
    if (!cc) throw new NotFoundError('Cost Center', id);
    await query('UPDATE cost_centers SET deleted_at = NOW() WHERE id = ?', [id]);
    return { message: 'Cost center deleted' };
  }
}

export const organizationService = new OrganizationService();
