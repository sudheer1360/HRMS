import { query, queryOne, insert } from '../../config/database.js';
import { NotFoundError, BusinessRuleError, ConflictError } from '../../common/errors/index.js';

export class ShiftService {
  async listShifts(tenantId: string, companyId: string) {
    return query('SELECT * FROM shifts WHERE company_id = ? AND status = ? ORDER BY shift_name', [companyId, 'Active']);
  }

  async createShift(tenantId: string, input: any) {
    const exists = await queryOne('SELECT id FROM shifts WHERE company_id = ? AND shift_code = ?', [input.companyId, input.shiftCode]);
    if (exists) throw new ConflictError('Shift code already exists');
    const id = await insert(
      'INSERT INTO shifts (id, tenant_id, company_id, shift_name, shift_code, start_time, end_time, grace_period_mins, break_mins, is_night_shift, is_flexible, ot_eligible) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [tenantId, input.companyId, input.shiftName, input.shiftCode, input.startTime, input.endTime,
       input.gracePeriodMins || 15, input.breakMins || 30, input.isNightShift || false,
       input.isFlexible || false, input.otEligible !== false]
    );
    return queryOne('SELECT * FROM shifts WHERE id = ?', [id]);
  }

  async updateShift(id: string, tenantId: string, input: any) {
    const s = await queryOne('SELECT id FROM shifts WHERE id = ? AND tenant_id = ?', [id, tenantId]);
    if (!s) throw new NotFoundError('Shift', id);
    await query(
      'UPDATE shifts SET shift_name = ?, start_time = ?, end_time = ?, grace_period_mins = ?, break_mins = ?, is_night_shift = ?, ot_eligible = ?, status = ?, updated_at = NOW() WHERE id = ?',
      [input.shiftName, input.startTime, input.endTime, input.gracePeriodMins, input.breakMins, input.isNightShift, input.otEligible, input.status || 'Active', id]
    );
    return queryOne('SELECT * FROM shifts WHERE id = ?', [id]);
  }

  async deleteShift(id: string, tenantId: string) {
    const s = await queryOne('SELECT id FROM shifts WHERE id = ? AND tenant_id = ?', [id, tenantId]);
    if (!s) throw new NotFoundError('Shift', id);
    await query('UPDATE shifts SET status = ? WHERE id = ?', ['Inactive', id]);
    return { message: 'Shift deactivated' };
  }

  // ── Rosters ────────────────────────────────────────────────────────────────

  async listRosters(tenantId: string, params: any) {
    const { employeeId, shiftId, fromDate, toDate } = params;
    let where = 'WHERE r.tenant_id = ?'; const vals: any[] = [tenantId];
    if (employeeId) { where += ' AND r.employee_id = ?'; vals.push(employeeId); }
    if (shiftId) { where += ' AND r.shift_id = ?'; vals.push(shiftId); }
    if (fromDate) { where += ' AND r.to_date >= ?'; vals.push(fromDate); }
    if (toDate) { where += ' AND r.from_date <= ?'; vals.push(toDate); }
    return query(
      `SELECT r.*, s.shift_name, s.start_time, s.end_time, e.full_name, e.employee_code
       FROM rosters r JOIN shifts s ON r.shift_id = s.id LEFT JOIN employees e ON r.employee_id = e.id
       ${where} ORDER BY r.from_date DESC`,
      vals
    );
  }

  async assignRoster(tenantId: string, input: any) {
    const overlap = await queryOne(
      'SELECT id FROM rosters WHERE employee_id = ? AND from_date <= ? AND to_date >= ?',
      [input.employeeId, input.toDate, input.fromDate]
    );
    if (overlap) throw new BusinessRuleError('Employee already has a roster for overlapping dates');
    const id = await insert(
      'INSERT INTO rosters (id, tenant_id, employee_id, shift_id, from_date, to_date, roster_type) VALUES (UUID(), ?, ?, ?, ?, ?, ?)',
      [tenantId, input.employeeId, input.shiftId, input.fromDate, input.toDate, input.rosterType || 'Fixed']
    );
    return queryOne('SELECT * FROM rosters WHERE id = ?', [id]);
  }

  async updateRoster(id: string, tenantId: string, input: any) {
    const r = await queryOne('SELECT id FROM rosters WHERE id = ? AND tenant_id = ?', [id, tenantId]);
    if (!r) throw new NotFoundError('Roster', id);
    await query('UPDATE rosters SET shift_id = ?, from_date = ?, to_date = ?, roster_type = ?, updated_at = NOW() WHERE id = ?',
      [input.shiftId, input.fromDate, input.toDate, input.rosterType, id]);
    return queryOne('SELECT * FROM rosters WHERE id = ?', [id]);
  }

  async deleteRoster(id: string, tenantId: string) {
    const r = await queryOne('SELECT id FROM rosters WHERE id = ? AND tenant_id = ?', [id, tenantId]);
    if (!r) throw new NotFoundError('Roster', id);
    await query('DELETE FROM rosters WHERE id = ?', [id]);
    return { message: 'Roster deleted' };
  }

  async getEmployeeShift(tenantId: string, employeeId: string, date?: string) {
    const d = date || new Date().toISOString().slice(0, 10);
    return queryOne(
      `SELECT r.*, s.shift_name, s.start_time, s.end_time, s.grace_period_mins, s.break_mins, s.is_night_shift
       FROM rosters r JOIN shifts s ON r.shift_id = s.id
       WHERE r.employee_id = ? AND r.from_date <= ? AND r.to_date >= ?`,
      [employeeId, d, d]
    );
  }
}

export class OvertimeService {
  async listRequests(tenantId: string, params: any) {
    const { employeeId, status, page = 1, limit = 20 } = params;
    let where = 'WHERE ot.tenant_id = ?'; const vals: any[] = [tenantId];
    if (employeeId) { where += ' AND ot.employee_id = ?'; vals.push(employeeId); }
    if (status) { where += ' AND ot.status = ?'; vals.push(status); }
    const [rows, cnt] = await Promise.all([
      query(`SELECT ot.*, e.full_name, e.employee_code FROM overtime_requests ot LEFT JOIN employees e ON ot.employee_id = e.id ${where} ORDER BY ot.created_at DESC LIMIT ? OFFSET ?`,
        [...vals, Number(limit), (Number(page) - 1) * Number(limit)]),
      query<any>(`SELECT COUNT(*) as total FROM overtime_requests ot ${where}`, vals),
    ]);
    const total = (cnt as any[])[0]?.total || 0;
    return { data: rows, meta: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) } };
  }

  async submitRequest(tenantId: string, input: any) {
    const exists = await queryOne('SELECT id FROM overtime_requests WHERE employee_id = ? AND ot_date = ?', [input.employeeId, input.otDate]);
    if (exists) throw new ConflictError('OT request already submitted for this date');
    const id = await insert(
      'INSERT INTO overtime_requests (id, tenant_id, employee_id, ot_date, ot_hours, ot_type, rate_multiplier, reason, status) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?)',
      [tenantId, input.employeeId, input.otDate, input.otHours, input.otType, input.rateMultiplier || 1.5, input.reason, 'Pending']
    );
    return queryOne('SELECT * FROM overtime_requests WHERE id = ?', [id]);
  }

  async approveRequest(id: string, tenantId: string, approverId: string) {
    const ot = await queryOne<any>('SELECT * FROM overtime_requests WHERE id = ? AND tenant_id = ?', [id, tenantId]);
    if (!ot) throw new NotFoundError('OT request', id);
    if (ot.status !== 'Pending') throw new BusinessRuleError(`Request is already ${ot.status}`);
    await query('UPDATE overtime_requests SET status = ?, approved_by = ?, approved_at = NOW() WHERE id = ?', ['Approved', approverId, id]);
    return { message: 'OT request approved' };
  }

  async rejectRequest(id: string, tenantId: string, approverId: string, reason?: string) {
    const ot = await queryOne<any>('SELECT * FROM overtime_requests WHERE id = ? AND tenant_id = ?', [id, tenantId]);
    if (!ot) throw new NotFoundError('OT request', id);
    await query('UPDATE overtime_requests SET status = ?, approved_by = ?, updated_at = NOW() WHERE id = ?', ['Rejected', approverId, id]);
    return { message: 'OT request rejected' };
  }
}

export const shiftService = new ShiftService();
export const overtimeService = new OvertimeService();
