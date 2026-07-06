import { query, queryOne, insert } from '../../config/database.js';
import { NotFoundError, BusinessRuleError } from '../../common/errors/index.js';

// ── Performance ───────────────────────────────────────────────────────────────

export class PerformanceService {
  async listCycles(tenantId: string, companyId: string) {
    return query(
      'SELECT * FROM performance_cycles WHERE tenant_id = ? AND company_id = ? ORDER BY created_at DESC',
      [tenantId, companyId]
    );
  }

  async createCycle(tenantId: string, input: any) {
    const id = await insert(
      `INSERT INTO performance_cycles
         (id, tenant_id, company_id, cycle_name, cycle_type, period_start, period_end, self_review_deadline, manager_review_deadline, status)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, 'Planning')`,
      [tenantId, input.companyId, input.name, input.reviewType || 'Annual',
       input.periodStart, input.periodEnd, input.selfReviewDeadline, input.managerReviewDeadline]
    );
    return queryOne('SELECT * FROM performance_cycles WHERE id = ?', [id]);
  }

  async listReviews(tenantId: string, params: any) {
    const { employeeId, cycleId, status, page = 1, limit = 20 } = params;
    let where = 'WHERE pr.tenant_id = ?'; const vals: any[] = [tenantId];
    if (employeeId) { where += ' AND pr.employee_id = ?'; vals.push(employeeId); }
    if (cycleId) { where += ' AND pr.cycle_id = ?'; vals.push(cycleId); }
    if (status) { where += ' AND pr.status = ?'; vals.push(status); }
    const [rows, cnt] = await Promise.all([
      query(
        `SELECT pr.*, e.first_name, e.last_name, pc.cycle_name
         FROM performance_reviews pr
         LEFT JOIN employees e ON pr.employee_id = e.id
         LEFT JOIN performance_cycles pc ON pr.cycle_id = pc.id
         ${where} ORDER BY pr.created_at DESC LIMIT ? OFFSET ?`,
        [...vals, Number(limit), (Number(page) - 1) * Number(limit)]
      ),
      query<any>(`SELECT COUNT(*) as total FROM performance_reviews pr ${where}`, vals),
    ]);
    const total = (cnt as any[])[0]?.total || 0;
    return { data: rows, meta: { page: Number(page), limit: Number(limit), total } };
  }

  async submitSelfReview(tenantId: string, cycleId: string, employeeId: string, input: any) {
    const cycle = await queryOne<any>('SELECT * FROM performance_cycles WHERE id = ? AND tenant_id = ?', [cycleId, tenantId]);
    if (!cycle) throw new NotFoundError('Performance cycle', cycleId);
    // Upsert review
    const existing = await queryOne<any>('SELECT id FROM performance_reviews WHERE cycle_id = ? AND employee_id = ?', [cycleId, employeeId]);
    if (existing) {
      await query(
        'UPDATE performance_reviews SET self_rating = ?, self_comments = ?, self_submitted_at = NOW(), status = ?, updated_at = NOW() WHERE id = ?',
        [input.rating, JSON.stringify(input.answers || input.comments), 'SelfReviewDone', existing.id]
      );
      return queryOne('SELECT * FROM performance_reviews WHERE id = ?', [existing.id]);
    }
    const id = await insert(
      `INSERT INTO performance_reviews (id, tenant_id, cycle_id, employee_id, self_rating, self_comments, self_submitted_at, status)
       VALUES (UUID(), ?, ?, ?, ?, ?, NOW(), 'SelfReviewDone')`,
      [tenantId, cycleId, employeeId, input.rating, JSON.stringify(input.answers || input.comments)]
    );
    return queryOne('SELECT * FROM performance_reviews WHERE id = ?', [id]);
  }

  async submitManagerReview(tenantId: string, reviewId: string, input: any) {
    const review = await queryOne<any>('SELECT * FROM performance_reviews WHERE id = ? AND tenant_id = ?', [reviewId, tenantId]);
    if (!review) throw new NotFoundError('Performance review', reviewId);
    await query(
      'UPDATE performance_reviews SET manager_rating = ?, manager_comments = ?, manager_submitted_at = NOW(), final_rating = ?, status = ?, updated_at = NOW() WHERE id = ?',
      [input.rating, JSON.stringify(input.answers || input.comments), input.finalRating ?? input.rating, 'Completed', reviewId]
    );
    return queryOne('SELECT * FROM performance_reviews WHERE id = ?', [reviewId]);
  }
}

// ── Assets ────────────────────────────────────────────────────────────────────

export class AssetService {
  async listAssets(tenantId: string, params: any) {
    const { assignedTo, status, search, page = 1, limit = 20 } = params;
    let where = 'WHERE a.tenant_id = ?'; const vals: any[] = [tenantId];
    if (assignedTo) { where += ' AND aa.employee_id = ?'; vals.push(assignedTo); }
    if (status) { where += ' AND a.status = ?'; vals.push(status); }
    if (search) { where += ' AND (a.asset_name LIKE ? OR a.asset_code LIKE ?)'; vals.push(`%${search}%`, `%${search}%`); }
    const [rows, cnt] = await Promise.all([
      query(
        `SELECT a.*, aa.employee_id AS current_holder, aa.allocated_at
         FROM assets a
         LEFT JOIN asset_allocations aa ON aa.asset_id = a.id AND aa.returned_at IS NULL
         ${where} ORDER BY a.created_at DESC LIMIT ? OFFSET ?`,
        [...vals, Number(limit), (Number(page) - 1) * Number(limit)]
      ),
      query<any>(`SELECT COUNT(*) as total FROM assets a LEFT JOIN asset_allocations aa ON aa.asset_id = a.id AND aa.returned_at IS NULL ${where}`, vals),
    ]);
    const total = (cnt as any[])[0]?.total || 0;
    return { data: rows, meta: { page: Number(page), limit: Number(limit), total } };
  }

  async createAsset(tenantId: string, input: any) {
    const code = `AST-${Date.now().toString(36).toUpperCase()}`;
    const id = await insert(
      `INSERT INTO assets (id, tenant_id, company_id, asset_code, asset_name, category, brand, model, serial_number, purchase_date, purchase_cost, warranty_expiry, status)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Available')`,
      [tenantId, input.companyId, code, input.name, input.category, input.brand,
       input.model, input.serialNumber, input.purchaseDate, input.purchasePrice, input.warrantyExpiresAt]
    );
    return queryOne('SELECT * FROM assets WHERE id = ?', [id]);
  }

  async allocateAsset(assetId: string, tenantId: string, input: any) {
    const asset = await queryOne<any>('SELECT * FROM assets WHERE id = ? AND tenant_id = ?', [assetId, tenantId]);
    if (!asset) throw new NotFoundError('Asset', assetId);
    if (asset.status !== 'Available') throw new BusinessRuleError(`Asset is ${asset.status} and cannot be allocated`);
    await insert(
      'INSERT INTO asset_allocations (id, asset_id, employee_id, notes) VALUES (UUID(), ?, ?, ?)',
      [assetId, input.employeeId, input.notes]
    );
    await query('UPDATE assets SET status = ?, assigned_to = ?, assigned_at = NOW(), updated_at = NOW() WHERE id = ?', ['Allocated', input.employeeId, assetId]);
    return queryOne('SELECT * FROM assets WHERE id = ?', [assetId]);
  }

  async returnAsset(assetId: string, tenantId: string) {
    const asset = await queryOne<any>('SELECT * FROM assets WHERE id = ? AND tenant_id = ?', [assetId, tenantId]);
    if (!asset) throw new NotFoundError('Asset', assetId);
    if (asset.status !== 'Allocated') throw new BusinessRuleError('Asset is not currently allocated');
    await query('UPDATE asset_allocations SET returned_at = NOW(), condition_at_return = ? WHERE asset_id = ? AND returned_at IS NULL', ['Good', assetId]);
    await query('UPDATE assets SET status = ?, updated_at = NOW() WHERE id = ?', ['Available', assetId]);
    return { message: 'Asset returned successfully' };
  }
}

// ── Grievances ────────────────────────────────────────────────────────────────

export class GrievanceService {
  async listGrievances(tenantId: string, params: any) {
    const { status, employeeId, page = 1, limit = 20 } = params;
    let where = 'WHERE tenant_id = ?'; const vals: any[] = [tenantId];
    if (status) { where += ' AND status = ?'; vals.push(status); }
    if (employeeId) { where += ' AND employee_id = ?'; vals.push(employeeId); }
    const [rows, cnt] = await Promise.all([
      query(`SELECT * FROM grievances ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [...vals, Number(limit), (Number(page) - 1) * Number(limit)]),
      query<any>(`SELECT COUNT(*) as total FROM grievances ${where}`, vals),
    ]);
    const total = (cnt as any[])[0]?.total || 0;
    return { data: rows, meta: { page: Number(page), limit: Number(limit), total } };
  }

  async submitGrievance(tenantId: string, input: any) {
    const code = `GRV-${Date.now().toString(36).toUpperCase()}`;
    const id = await insert(
      `INSERT INTO grievances (id, tenant_id, employee_id, grievance_code, category, subject, description, is_anonymous, status)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, 'Open')`,
      [tenantId, input.employeeId, code, input.category, input.subject, input.description, input.isAnonymous ? 1 : 0]
    );
    return queryOne('SELECT * FROM grievances WHERE id = ?', [id]);
  }
}

// ── Disciplinary ──────────────────────────────────────────────────────────────

export class DisciplinaryService {
  async listDisciplinaryCases(tenantId: string, params: any) {
    const { status, employeeId, page = 1, limit = 20 } = params;
    let where = 'WHERE tenant_id = ?'; const vals: any[] = [tenantId];
    if (status) { where += ' AND status = ?'; vals.push(status); }
    if (employeeId) { where += ' AND employee_id = ?'; vals.push(employeeId); }
    const [rows, cnt] = await Promise.all([
      query(`SELECT * FROM disciplinary_cases ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [...vals, Number(limit), (Number(page) - 1) * Number(limit)]),
      query<any>(`SELECT COUNT(*) as total FROM disciplinary_cases ${where}`, vals),
    ]);
    const total = (cnt as any[])[0]?.total || 0;
    return { data: rows, meta: { page: Number(page), limit: Number(limit), total } };
  }

  async createDisciplinaryCase(tenantId: string, input: any) {
    const code = `DISC-${Date.now().toString(36).toUpperCase()}`;
    const id = await insert(
      `INSERT INTO disciplinary_cases (id, tenant_id, employee_id, case_code, category, incident_date, description, status)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, 'Open')`,
      [tenantId, input.employeeId, code, input.category, input.incidentDate, input.description]
    );
    return queryOne('SELECT * FROM disciplinary_cases WHERE id = ?', [id]);
  }
}

// ── Exit ──────────────────────────────────────────────────────────────────────

export class ExitService {
  async listExitCases(tenantId: string, params: any) {
    const { status, employeeId, page = 1, limit = 20 } = params;
    let where = 'WHERE ec.tenant_id = ?'; const vals: any[] = [tenantId];
    if (status) { where += ' AND ec.status = ?'; vals.push(status); }
    if (employeeId) { where += ' AND ec.employee_id = ?'; vals.push(employeeId); }
    const [rows, cnt] = await Promise.all([
      query(
        `SELECT ec.*, e.first_name, e.last_name FROM exit_cases ec
         LEFT JOIN employees e ON ec.employee_id = e.id
         ${where} ORDER BY ec.created_at DESC LIMIT ? OFFSET ?`,
        [...vals, Number(limit), (Number(page) - 1) * Number(limit)]
      ),
      query<any>(`SELECT COUNT(*) as total FROM exit_cases ec ${where}`, vals),
    ]);
    const total = (cnt as any[])[0]?.total || 0;
    return { data: rows, meta: { page: Number(page), limit: Number(limit), total } };
  }

  async initiateExit(tenantId: string, input: any) {
    const existing = await queryOne('SELECT id FROM exit_cases WHERE employee_id = ? AND status NOT IN (?,?)', [input.employeeId, 'Completed', 'Cancelled']);
    if (existing) throw new BusinessRuleError('An active exit case already exists for this employee');
    const id = await insert(
      `INSERT INTO exit_cases (id, tenant_id, employee_id, exit_type, resignation_date, last_working_day, reason, status)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, 'Initiated')`,
      [tenantId, input.employeeId, input.exitType, input.resignationDate, input.lastWorkingDay, input.reason]
    );
    return queryOne('SELECT * FROM exit_cases WHERE id = ?', [id]);
  }

  async processFnf(id: string, tenantId: string, fnfAmount: number) {
    const ec = await queryOne<any>('SELECT * FROM exit_cases WHERE id = ? AND tenant_id = ?', [id, tenantId]);
    if (!ec) throw new NotFoundError('Exit case', id);
    await query(
      'UPDATE exit_cases SET fnf_amount = ?, fnf_processed_at = NOW(), status = ?, updated_at = NOW() WHERE id = ?',
      [fnfAmount, 'FnfDone', id]
    );
    return queryOne('SELECT * FROM exit_cases WHERE id = ?', [id]);
  }
}

// ── Aggregate facade ──────────────────────────────────────────────────────────

class OperationsService {
  private perf = new PerformanceService();
  private asset = new AssetService();
  private grievance = new GrievanceService();
  private disc = new DisciplinaryService();
  private exit = new ExitService();

  listCycles(t: string, c: string) { return this.perf.listCycles(t, c); }
  createCycle(t: string, i: any) { return this.perf.createCycle(t, i); }
  listReviews(t: string, p: any) { return this.perf.listReviews(t, p); }
  submitSelfReview(t: string, c: string, e: string, i: any) { return this.perf.submitSelfReview(t, c, e, i); }
  submitManagerReview(t: string, r: string, i: any) { return this.perf.submitManagerReview(t, r, i); }

  listAssets(t: string, p: any) { return this.asset.listAssets(t, p); }
  createAsset(t: string, i: any) { return this.asset.createAsset(t, i); }
  allocateAsset(id: string, t: string, i: any) { return this.asset.allocateAsset(id, t, i); }
  returnAsset(id: string, t: string) { return this.asset.returnAsset(id, t); }

  listGrievances(t: string, p: any) { return this.grievance.listGrievances(t, p); }
  submitGrievance(t: string, i: any) { return this.grievance.submitGrievance(t, i); }

  listDisciplinaryCases(t: string, p: any) { return this.disc.listDisciplinaryCases(t, p); }
  createDisciplinaryCase(t: string, i: any) { return this.disc.createDisciplinaryCase(t, i); }

  listExitCases(t: string, p: any) { return this.exit.listExitCases(t, p); }
  initiateExit(t: string, i: any) { return this.exit.initiateExit(t, i); }
  processFnf(id: string, t: string, a: number) { return this.exit.processFnf(id, t, a); }
}

export const operationsService = new OperationsService();
