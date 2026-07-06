import { query, queryOne, insert } from '../../config/database.js';
import { NotFoundError, BusinessRuleError, ConflictError } from '../../common/errors/index.js';

export class AttendanceService {
  // ── Manual Entry / Clock in-out ────────────────────────────────────────────

  async clockIn(tenantId: string, employeeId: string, input: any) {
    const today = new Date().toISOString().slice(0, 10);
    const existing = await queryOne<any>('SELECT * FROM attendance_logs WHERE employee_id = ? AND attendance_date = ?', [employeeId, today]);
    if (existing && existing.inTime) throw new BusinessRuleError('Already clocked in today');
    if (existing) {
      await query('UPDATE attendance_logs SET in_time = NOW(), status = ?, source = ?, updated_at = NOW() WHERE id = ?',
        ['Present', input.source || 'Web', existing.id]);
      return queryOne('SELECT * FROM attendance_logs WHERE id = ?', [existing.id]);
    }
    const id = await insert(
      'INSERT INTO attendance_logs (id, tenant_id, employee_id, attendance_date, in_time, status, source, remarks) VALUES (UUID(), ?, ?, ?, NOW(), ?, ?, ?)',
      [tenantId, employeeId, today, 'Present', input.source || 'Web', input.remarks]
    );
    return queryOne('SELECT * FROM attendance_logs WHERE id = ?', [id]);
  }

  async clockOut(tenantId: string, employeeId: string, input: any) {
    const today = new Date().toISOString().slice(0, 10);
    const existing = await queryOne<any>('SELECT * FROM attendance_logs WHERE employee_id = ? AND attendance_date = ?', [employeeId, today]);
    if (!existing || !existing.inTime) throw new BusinessRuleError('Clock-in not found for today');
    if (existing.outTime) throw new BusinessRuleError('Already clocked out today');
    const inTime = new Date(existing.inTime);
    const outTime = new Date();
    const totalHours = Math.round(((outTime.getTime() - inTime.getTime()) / 3600000) * 100) / 100;
    await query('UPDATE attendance_logs SET out_time = NOW(), total_hours = ?, updated_at = NOW() WHERE id = ?', [totalHours, existing.id]);
    return queryOne('SELECT * FROM attendance_logs WHERE id = ?', [existing.id]);
  }

  async manualEntry(tenantId: string, input: any) {
    const exists = await queryOne('SELECT id FROM attendance_logs WHERE employee_id = ? AND attendance_date = ?',
      [input.employeeId, input.attendanceDate]);
    if (exists) throw new ConflictError('Attendance already recorded for this date');
    const id = await insert(
      'INSERT INTO attendance_logs (id, tenant_id, employee_id, attendance_date, in_time, out_time, total_hours, status, source, remarks) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [tenantId, input.employeeId, input.attendanceDate, input.inTime, input.outTime, input.totalHours, input.status || 'Present', 'Manual', input.remarks]
    );
    return queryOne('SELECT * FROM attendance_logs WHERE id = ?', [id]);
  }

  async updateEntry(id: string, tenantId: string, input: any) {
    const a = await queryOne('SELECT id FROM attendance_logs WHERE id = ? AND tenant_id = ?', [id, tenantId]);
    if (!a) throw new NotFoundError('Attendance record', id);
    await query(
      'UPDATE attendance_logs SET in_time = ?, out_time = ?, total_hours = ?, status = ?, remarks = ?, is_corrected = TRUE, updated_at = NOW() WHERE id = ?',
      [input.inTime, input.outTime, input.totalHours, input.status, input.remarks, id]
    );
    return queryOne('SELECT * FROM attendance_logs WHERE id = ?', [id]);
  }

  async listDaily(tenantId: string, params: any) {
    const { page = 1, limit = 20, fromDate, toDate, status, employeeId, departmentId } = params;
    let where = 'WHERE al.tenant_id = ?'; const vals: any[] = [tenantId];
    if (status) { where += ' AND al.status = ?'; vals.push(status); }
    if (employeeId) { where += ' AND al.employee_id = ?'; vals.push(employeeId); }
    if (fromDate) { where += ' AND al.attendance_date >= ?'; vals.push(fromDate); }
    if (toDate) { where += ' AND al.attendance_date <= ?'; vals.push(toDate); }
    if (departmentId) { where += ' AND e.department_id = ?'; vals.push(departmentId); }

    const joinClause = departmentId ? 'LEFT JOIN employees e ON al.employee_id = e.id' : '';
    const [rows, cnt] = await Promise.all([
      query(`SELECT al.*, e.full_name, e.employee_code FROM attendance_logs al LEFT JOIN employees e ON al.employee_id = e.id ${where} ORDER BY al.attendance_date DESC LIMIT ? OFFSET ?`,
        [...vals, Number(limit), (Number(page) - 1) * Number(limit)]),
      query<any>(`SELECT COUNT(*) as total FROM attendance_logs al ${joinClause} ${where}`, vals),
    ]);
    const total = (cnt as any[])[0]?.total || 0;
    return { data: rows, meta: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)), hasNext: Number(page) * Number(limit) < total, hasPrev: Number(page) > 1 } };
  }

  async getDailySummary(tenantId: string, date: string) {
    const rows = await query<any>(
      `SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status IN ('Present','Work From Home') THEN 1 ELSE 0 END) AS present,
        SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) AS absent,
        SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) AS late,
        SUM(CASE WHEN status = 'Half Day' THEN 1 ELSE 0 END) AS halfDay
       FROM attendance_logs
       WHERE tenant_id = ? AND attendance_date = ?`,
      [tenantId, date]
    );
    const row = (rows as any[])[0] ?? {};
    return {
      date,
      total:   Number(row.total   ?? 0),
      present: Number(row.present ?? 0),
      absent:  Number(row.absent  ?? 0),
      late:    Number(row.late    ?? 0),
      halfDay: Number(row.halfDay ?? 0),
    };
  }

  async getMonthlySummary(tenantId: string, employeeId: string, month: number, year: number) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().slice(0, 10);
    const rows = await query<any[]>(
      'SELECT * FROM attendance_logs WHERE employee_id = ? AND attendance_date BETWEEN ? AND ? ORDER BY attendance_date',
      [employeeId, startDate, endDate]
    ) as any[];
    const summary = { present: 0, absent: 0, halfDay: 0, workFromHome: 0, weeklyOff: 0, holiday: 0, late: 0, earlyExit: 0, totalHours: 0, totalWorkingDays: 0 };
    for (const r of rows) {
      if (r.status === 'Present') { summary.present++; summary.totalWorkingDays++; }
      else if (r.status === 'Absent') summary.absent++;
      else if (r.status === 'Half Day') { summary.halfDay++; summary.totalWorkingDays += 0.5; }
      else if (r.status === 'Work From Home') { summary.workFromHome++; summary.totalWorkingDays++; }
      else if (r.status === 'Weekly Off') summary.weeklyOff++;
      else if (r.status === 'Holiday') summary.holiday++;
      // NOTE: DB transformer converts snake_case → camelCase
      if (r.lateMins > 0) summary.late++;
      if (r.earlyExitMins > 0) summary.earlyExit++;
      summary.totalHours += Number(r.totalHours || 0);
    }
    return { records: rows, summary };
  }

  // ── Correction Requests ────────────────────────────────────────────────────

  async submitCorrection(tenantId: string, input: any) {
    const orig = await queryOne<any>('SELECT status FROM attendance_logs WHERE employee_id = ? AND attendance_date = ?', [input.employeeId, input.attendanceDate]);
    if (!orig) throw new NotFoundError('Attendance record for date', input.attendanceDate);
    const id = await insert(
      'INSERT INTO attendance_correction_requests (id, tenant_id, employee_id, attendance_date, current_status, requested_status, reason) VALUES (UUID(), ?, ?, ?, ?, ?, ?)',
      [tenantId, input.employeeId, input.attendanceDate, (orig as any).status, input.requestedStatus, input.reason]
    );
    return { message: 'Correction request submitted', id };
  }

  async listCorrectionRequests(tenantId: string, params: any) {
    const { status, employeeId } = params;
    let where = 'WHERE acr.tenant_id = ?'; const vals: any[] = [tenantId];
    if (status) { where += ' AND acr.status = ?'; vals.push(status); }
    if (employeeId) { where += ' AND acr.employee_id = ?'; vals.push(employeeId); }
    return query(`SELECT acr.*, e.full_name, e.employee_code FROM attendance_correction_requests acr LEFT JOIN employees e ON acr.employee_id = e.id ${where} ORDER BY acr.created_at DESC`, vals);
  }

  async approveCorrection(id: string, tenantId: string, approverId: string) {
    const cr = await queryOne<any>('SELECT * FROM attendance_correction_requests WHERE id = ? AND tenant_id = ?', [id, tenantId]);
    if (!cr) throw new NotFoundError('Correction request', id);
    if (cr.status !== 'Pending') throw new BusinessRuleError('Request is not pending');
    await query('UPDATE attendance_correction_requests SET status = ?, approved_by = ?, approved_at = NOW() WHERE id = ?', ['Approved', approverId, id]);
    await query('UPDATE attendance_logs SET status = ?, is_corrected = TRUE, updated_at = NOW() WHERE employee_id = ? AND attendance_date = ?',
      [cr.requestedStatus, cr.employeeId, cr.attendanceDate]);
    return { message: 'Correction approved and attendance updated' };
  }

  async rejectCorrection(id: string, tenantId: string, approverId: string, reason?: string) {
    const cr = await queryOne<any>('SELECT * FROM attendance_correction_requests WHERE id = ?', [id]);
    if (!cr) throw new NotFoundError('Correction request', id);
    await query('UPDATE attendance_correction_requests SET status = ?, approved_by = ?, rejected_reason = ? WHERE id = ?', ['Rejected', approverId, reason ?? null, id]);
    return { message: 'Correction rejected' };
  }

  // ── Attendance Locks ───────────────────────────────────────────────────────

  async lockPeriod(tenantId: string, input: any, userId: string) {
    const existing = await queryOne('SELECT id FROM attendance_locks WHERE company_id = ? AND period_start = ? AND period_end = ? AND unlocked_at IS NULL',
      [input.companyId, input.periodStart, input.periodEnd]);
    if (existing) throw new ConflictError('Period is already locked');
    const id = await insert(
      'INSERT INTO attendance_locks (id, tenant_id, company_id, branch_id, dept_id, period_start, period_end, locked_by) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)',
      [tenantId, input.companyId, input.branchId, input.deptId, input.periodStart, input.periodEnd, userId]
    );
    return { message: 'Attendance period locked', id };
  }

  async unlockPeriod(id: string, tenantId: string, userId: string, reason: string) {
    const lock = await queryOne('SELECT id FROM attendance_locks WHERE id = ? AND unlocked_at IS NULL', [id]);
    if (!lock) throw new NotFoundError('Lock', id);
    await query('UPDATE attendance_locks SET unlocked_by = ?, unlocked_at = NOW(), unlock_reason = ? WHERE id = ?', [userId, reason, id]);
    return { message: 'Attendance period unlocked' };
  }

  async listLocks(tenantId: string, companyId: string) {
    return query('SELECT * FROM attendance_locks WHERE tenant_id = ? AND company_id = ? ORDER BY locked_at DESC', [tenantId, companyId]);
  }
}

export const attendanceService = new AttendanceService();
