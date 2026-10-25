/**
 * leave.manager.ts — Leave business logic manager.
 *
 * Backend Structure pattern: controller → manager → service → db + clients
 */
import { BaseService } from '../../common/base/BaseService.js';
import { LeaveService } from './leave.service.js';
import { emailClient } from '../../clients/email/client.js';
import { smsClient } from '../../clients/sms/client.js';

const MODULE = 'leave.manager';
const leaveService = new LeaveService();

export class LeaveManager extends BaseService {

  async applyLeave(tenantId: string, employeeId: string, data: Record<string, any>) {
    this.logging.info(MODULE, 'applyLeave', { tenantId, employeeId });
    const application = await leaveService.apply(tenantId, employeeId, data);
    await this.invalidateTenantCache('leaves', tenantId);
    this.logAction(MODULE, 'APPLY_LEAVE', tenantId, employeeId, { applicationId: (application as any).id });
    return application;
  }

  async approveLeave(
    tenantId: string,
    applicationId: string,
    approverId: string,
    employeeEmail: string,
    employeeMobile: string,
    employeeName: string,
    leaveType: string
  ) {
    this.logging.info(MODULE, 'approveLeave', { tenantId, applicationId });
    const result = await leaveService.approve(applicationId, tenantId, approverId);

    emailClient
      .sendLeaveApprovalEmail(employeeEmail, employeeName, 'approved', leaveType)
      .catch((err) => this.logging.error(MODULE, 'Leave approval email failed', err));

    if (employeeMobile) {
      smsClient
        .sendLeaveAlert(employeeMobile, employeeName, leaveType, 'approved')
        .catch((err) => this.logging.error(MODULE, 'Leave approval SMS failed', err));
    }

    await this.invalidateTenantCache('leaves', tenantId);
    this.logAction(MODULE, 'APPROVE_LEAVE', tenantId, approverId, { applicationId });
    return result;
  }

  async rejectLeave(
    tenantId: string,
    applicationId: string,
    approverId: string,
    employeeEmail: string,
    employeeName: string,
    leaveType: string,
    reason: string
  ) {
    this.logging.info(MODULE, 'rejectLeave', { tenantId, applicationId });
    const result = await leaveService.reject(applicationId, tenantId, approverId, reason);

    emailClient
      .sendLeaveApprovalEmail(employeeEmail, employeeName, 'rejected', leaveType)
      .catch((err) => this.logging.error(MODULE, 'Leave rejection email failed', err));

    await this.invalidateTenantCache('leaves', tenantId);
    this.logAction(MODULE, 'REJECT_LEAVE', tenantId, approverId, { applicationId });
    return result;
  }

  async listLeaves(tenantId: string, params: Record<string, any>) {
    const { page, limit, offset } = this.buildPagination(params);
    const key = this.cacheKey('leaves', tenantId, 'list', page, limit, params.status || '', params.employeeId || '');
    return this.withCache(key, 60, () =>
      leaveService.listApplications(tenantId, { ...params, page, limit, offset })
    );
  }
}
