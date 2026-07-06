import { query, queryOne, insert } from '../../config/database.js';
import { NotFoundError, BusinessRuleError } from '../../common/errors/index.js';

// ── Payroll ───────────────────────────────────────────────────────────────────

export class PayrollService {
  // Salary Components
  async listComponents(tenantId: string, companyId: string) {
    return query(
      'SELECT * FROM salary_components WHERE company_id = ? AND status = ? ORDER BY component_type, component_name',
      [companyId, 'Active']
    );
  }

  async createComponent(tenantId: string, input: any) {
    const id = await insert(
      `INSERT INTO salary_components
         (id, tenant_id, company_id, component_name, component_code, component_type, calculation_type, is_taxable, is_pf_applicable, status)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, 'Active')`,
      [tenantId, input.companyId, input.name, input.code, input.type || 'Earning',
       input.calculationType || 'Fixed',
       input.taxable ? 1 : 0, input.pfApplicable ? 1 : 0]
    );
    return queryOne('SELECT * FROM salary_components WHERE id = ?', [id]);
  }

  // Salary Structures
  async listStructuresAll(tenantId: string, params: any) {
    const { limit = 30, page = 1 } = params;
    const [rows, cnt] = await Promise.all([
      query('SELECT * FROM salary_structures WHERE tenant_id = ? AND status = ? ORDER BY name LIMIT ? OFFSET ?',
        [tenantId, 'Active', Number(limit), (Number(page) - 1) * Number(limit)]),
      query<any>('SELECT COUNT(*) as total FROM salary_structures WHERE tenant_id = ? AND status = ?', [tenantId, 'Active']),
    ]);
    const total = (cnt as any[])[0]?.total || 0;
    return { data: rows, meta: { page: Number(page), limit: Number(limit), total } };
  }

  async listStructures(tenantId: string, companyId: string) {
    return query(
      'SELECT * FROM salary_structures WHERE company_id = ? AND status = ? ORDER BY name',
      [companyId, 'Active']
    );
  }

  async createStructure(tenantId: string, input: any) {
    const id = await insert(
      `INSERT INTO salary_structures (id, tenant_id, company_id, name, description, components_json, status)
       VALUES (UUID(), ?, ?, ?, ?, ?, 'Active')`,
      [tenantId, input.companyId, input.name, input.description || null,
       input.components ? JSON.stringify(input.components) : '[]']
    );
    return queryOne('SELECT * FROM salary_structures WHERE id = ?', [id]);
  }

  // Payroll Runs
  async listRuns(tenantId: string, params: any) {
    const { page = 1, limit = 20, status, companyId } = params;
    let where = 'WHERE tenant_id = ?'; const vals: any[] = [tenantId];
    if (status) { where += ' AND status = ?'; vals.push(status); }
    if (companyId) { where += ' AND company_id = ?'; vals.push(companyId); }
    const [rows, cnt] = await Promise.all([
      query(`SELECT * FROM payroll_runs ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [...vals, Number(limit), (Number(page) - 1) * Number(limit)]),
      query<any>(`SELECT COUNT(*) as total FROM payroll_runs ${where}`, vals),
    ]);
    const total = (cnt as any[])[0]?.total || 0;
    return { data: rows, meta: { page: Number(page), limit: Number(limit), total } };
  }

  async createRun(tenantId: string, userId: string, input: any) {
    const exists = await queryOne(
      'SELECT id FROM payroll_runs WHERE company_id = ? AND period_start = ? AND period_end = ? AND status != ?',
      [input.companyId, input.periodStart, input.periodEnd, 'Cancelled']
    );
    if (exists) throw new BusinessRuleError('Payroll run already exists for this period');
    const code = `PAY-${new Date(input.periodStart).toISOString().slice(0, 7)}-${Date.now().toString(36).toUpperCase()}`;
    const id = await insert(
      'INSERT INTO payroll_runs (id, tenant_id, company_id, run_code, period_start, period_end, status, created_by) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)',
      [tenantId, input.companyId, code, input.periodStart, input.periodEnd, 'Draft', userId]
    );
    return queryOne('SELECT * FROM payroll_runs WHERE id = ?', [id]);
  }

  async processRun(id: string, tenantId: string, userId: string) {
    const run = await queryOne<any>('SELECT * FROM payroll_runs WHERE id = ? AND tenant_id = ?', [id, tenantId]);
    if (!run) throw new NotFoundError('Payroll run', id);
    if (run.status !== 'Draft') throw new BusinessRuleError(`Cannot process run in ${run.status} status`);

    // Fetch all active employees for this company
    const employees = await query<any>(
      `SELECT e.id, e.first_name, e.last_name, e.cost_to_company
       FROM employees e WHERE e.company_id = ? AND e.status = 'Active'`,
      [run.companyId]
    );

    let totalEarnings = 0; let totalNetPay = 0; let totalDeductions = 0;
    for (const emp of employees as any[]) {
      const ctc = Number(emp.costToCompany) || 0;
      const grossEarnings = Math.round(ctc / 12);
      const pfEmployee = Math.min(Math.round(grossEarnings * 0.12), 1800);
      const pfEmployer = Math.min(Math.round(grossEarnings * 0.12), 1800);
      const incomeTax = grossEarnings > 50000 ? Math.round(grossEarnings * 0.1) : 0;
      const deductions = pfEmployee + incomeTax;
      const netPay = grossEarnings - deductions;
      totalEarnings += grossEarnings;
      totalDeductions += deductions;
      totalNetPay += netPay;

      await query(
        `INSERT INTO payroll_payslips
           (id, tenant_id, payroll_run_id, employee_id, gross_earnings, pf_employee, pf_employer, income_tax, total_deductions, net_pay, status)
         VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Draft')
         ON DUPLICATE KEY UPDATE gross_earnings = VALUES(gross_earnings), net_pay = VALUES(net_pay), total_deductions = VALUES(total_deductions)`,
        [tenantId, id, emp.id, grossEarnings, pfEmployee, pfEmployer, incomeTax, deductions, netPay]
      );
    }

    await query(
      'UPDATE payroll_runs SET status = ?, total_employees = ?, total_earnings = ?, total_deductions = ?, total_net_pay = ?, processed_at = NOW(), processed_by = ?, updated_at = NOW() WHERE id = ?',
      ['Processed', (employees as any[]).length, totalEarnings, totalDeductions, totalNetPay, userId, id]
    );
    return queryOne('SELECT * FROM payroll_runs WHERE id = ?', [id]);
  }

  async approveRun(id: string, tenantId: string, userId: string) {
    const run = await queryOne<any>('SELECT * FROM payroll_runs WHERE id = ? AND tenant_id = ?', [id, tenantId]);
    if (!run) throw new NotFoundError('Payroll run', id);
    if (run.status !== 'Processed') throw new BusinessRuleError(`Cannot approve run in ${run.status} status`);
    await query(
      'UPDATE payroll_runs SET status = ?, approved_by = ?, approved_at = NOW(), updated_at = NOW() WHERE id = ?',
      ['Approved', userId, id]
    );
    await query('UPDATE payroll_payslips SET status = ? WHERE payroll_run_id = ?', ['Final', id]);
    return queryOne('SELECT * FROM payroll_runs WHERE id = ?', [id]);
  }

  async getPayslips(tenantId: string, employeeId: string) {
    return query(
      `SELECT ps.*, pr.run_code, pr.period_start, pr.period_end
       FROM payroll_payslips ps
       JOIN payroll_runs pr ON ps.payroll_run_id = pr.id
       WHERE ps.employee_id = ? AND ps.status = 'Final'
       ORDER BY ps.created_at DESC LIMIT 12`,
      [employeeId]
    );
  }
}

// ── Expenses ──────────────────────────────────────────────────────────────────

export class ExpenseService {
  async listClaims(tenantId: string, params: any) {
    const { page = 1, limit = 20, employeeId, status } = params;
    let where = 'WHERE ec.tenant_id = ?'; const vals: any[] = [tenantId];
    if (employeeId) { where += ' AND ec.employee_id = ?'; vals.push(employeeId); }
    if (status) { where += ' AND ec.status = ?'; vals.push(status); }
    const [rows, cnt] = await Promise.all([
      query(
        `SELECT ec.*, e.first_name, e.last_name FROM expense_claims ec
         LEFT JOIN employees e ON ec.employee_id = e.id
         ${where} ORDER BY ec.created_at DESC LIMIT ? OFFSET ?`,
        [...vals, Number(limit), (Number(page) - 1) * Number(limit)]
      ),
      query<any>(`SELECT COUNT(*) as total FROM expense_claims ec ${where}`, vals),
    ]);
    const total = (cnt as any[])[0]?.total || 0;
    return { data: rows, meta: { page: Number(page), limit: Number(limit), total } };
  }

  async submitClaim(tenantId: string, input: any) {
    const code = `EXP-${Date.now().toString(36).toUpperCase()}`;
    const id = await insert(
      `INSERT INTO expense_claims
         (id, tenant_id, employee_id, claim_code, expense_date, category, amount, currency, description, receipt_url, status)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
      [tenantId, input.employeeId, code, input.expenseDate, input.category,
       input.amount, input.currency || 'INR', input.description, input.receiptUrl || null]
    );
    return queryOne('SELECT * FROM expense_claims WHERE id = ?', [id]);
  }

  async approveClaim(id: string, tenantId: string, approvedBy: string) {
    const claim = await queryOne('SELECT id FROM expense_claims WHERE id = ? AND tenant_id = ?', [id, tenantId]);
    if (!claim) throw new NotFoundError('Expense claim', id);
    await query(
      'UPDATE expense_claims SET status = ?, approved_by = ?, approved_at = NOW(), updated_at = NOW() WHERE id = ?',
      ['Approved', approvedBy, id]
    );
    return queryOne('SELECT * FROM expense_claims WHERE id = ?', [id]);
  }

  async rejectClaim(id: string, tenantId: string, rejectedBy: string, reason?: string) {
    const claim = await queryOne('SELECT id FROM expense_claims WHERE id = ? AND tenant_id = ?', [id, tenantId]);
    if (!claim) throw new NotFoundError('Expense claim', id);
    await query(
      'UPDATE expense_claims SET status = ?, rejected_by = ?, rejection_reason = ?, updated_at = NOW() WHERE id = ?',
      ['Rejected', rejectedBy, reason || null, id]
    );
    return queryOne('SELECT * FROM expense_claims WHERE id = ?', [id]);
  }
}

export const payrollService = new PayrollService();
export const expenseService = new ExpenseService();
