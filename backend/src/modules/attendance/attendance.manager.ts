/**
 * attendance.manager.ts — Attendance business logic manager.
 *
 * Backend Structure pattern: controller → manager → service → db
 * Orchestrates multi-step operations: cache, notifications, audit logs.
 */
import { BaseService } from '../../common/base/BaseService.js';
import { AttendanceService } from './attendance.service.js';
import { emailClient } from '../../clients/email/client.js';

const MODULE = 'attendance.manager';
const attendanceService = new AttendanceService();

export class AttendanceManager extends BaseService {

  async clockIn(tenantId: string, employeeId: string, payload: { location?: string; notes?: string }) {
    this.logging.info(MODULE, 'clockIn', { tenantId, employeeId });
    const record = await attendanceService.clockIn(tenantId, employeeId, payload);
    await this.invalidateTenantCache('attendance', tenantId);
    this.logAction(MODULE, 'CLOCK_IN', tenantId, employeeId, {});
    return record;
  }

  async clockOut(tenantId: string, employeeId: string, payload: { notes?: string }) {
    this.logging.info(MODULE, 'clockOut', { tenantId, employeeId });
    const record = await attendanceService.clockOut(tenantId, employeeId, payload);
    await this.invalidateTenantCache('attendance', tenantId);
    this.logAction(MODULE, 'CLOCK_OUT', tenantId, employeeId, {});
    return record;
  }

  async listAttendance(tenantId: string, params: Record<string, any>) {
    const { page, limit, offset } = this.buildPagination(params);
    const key = this.cacheKey('attendance', tenantId, 'list', page, limit, params.date || '');
    return this.withCache(key, 60, () =>
      attendanceService.listDaily(tenantId, { ...params, page, limit, offset })
    );
  }

  async approveCorrection(
    tenantId: string,
    correctionId: string,
    approverId: string,
    employeeEmail: string,
    employeeName: string
  ) {
    this.logging.info(MODULE, 'approveCorrection', { tenantId, correctionId });
    const result = await attendanceService.approveCorrection(correctionId, tenantId, approverId);

    emailClient
      .send({
        to: employeeEmail,
        subject: 'Attendance Correction Approved',
        templateId: 'attendance-correction',
        templateData: { name: employeeName, status: 'approved' },
      })
      .catch((err) => this.logging.error(MODULE, 'Email notification failed', err));

    await this.invalidateTenantCache('attendance', tenantId);
    this.logAction(MODULE, 'APPROVE_CORRECTION', tenantId, approverId, { correctionId });
    return result;
  }
}
