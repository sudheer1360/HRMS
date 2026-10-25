/**
 * employee.manager.ts — Employee business logic manager.
 *
 * Backend Structure pattern: controller → manager → service → db + clients
 */
import { BaseService } from '../../common/base/BaseService.js';
import { EmployeeService } from './employee.service.js';
import { emailClient } from '../../clients/email/client.js';
import { storageClient } from '../../clients/storage/client.js';

const MODULE = 'employee.manager';
const employeeService = new EmployeeService();

export class EmployeeManager extends BaseService {

  async listEmployees(tenantId: string, params: Record<string, any>) {
    const { page, limit, offset } = this.buildPagination(params);
    const key = this.cacheKey('employees', tenantId, 'list', page, limit, params.search || '', params.departmentId || '');
    return this.withCache(key, 120, () =>
      employeeService.list(tenantId, { ...params, page, limit, offset })
    );
  }

  async getEmployee(tenantId: string, employeeId: string) {
    const key = this.cacheKey('employees', tenantId, employeeId);
    return this.withCache(key, 300, () =>
      employeeService.getById(employeeId, tenantId)
    );
  }

  async createEmployee(tenantId: string, createdBy: string, data: Record<string, any>) {
    this.logging.info(MODULE, 'createEmployee', { tenantId, email: data.email });
    const employee = await employeeService.create(tenantId, createdBy, data);

    if (data.email) {
      emailClient
        .sendWelcomeEmail(data.email, data.firstName, data.tenantName || 'HRMS')
        .catch((err) => this.logging.error(MODULE, 'Welcome email failed', err));
    }

    await this.invalidateTenantCache('employees', tenantId);
    this.logAction(MODULE, 'CREATE_EMPLOYEE', tenantId, createdBy, { employeeId: (employee as any).id });
    return employee;
  }

  async updateEmployee(tenantId: string, employeeId: string, updatedBy: string, data: Record<string, any>) {
    this.logging.info(MODULE, 'updateEmployee', { tenantId, employeeId });
    const employee = await employeeService.update(employeeId, tenantId, data);
    await this.cache.del(this.cacheKey('employees', tenantId, employeeId));
    await this.invalidateTenantCache('employees', tenantId);
    this.logAction(MODULE, 'UPDATE_EMPLOYEE', tenantId, updatedBy, { employeeId });
    return employee;
  }

  async uploadPhoto(tenantId: string, employeeId: string, updatedBy: string, fileBuffer: Buffer, originalName: string, mimeType: string) {
    this.logging.info(MODULE, 'uploadPhoto', { tenantId, employeeId });
    const { url } = await storageClient.upload('photos', `${employeeId}-${originalName}`, fileBuffer, mimeType);
    await employeeService.update(employeeId, tenantId, { photoUrl: url });
    await this.cache.del(this.cacheKey('employees', tenantId, employeeId));
    this.logAction(MODULE, 'UPLOAD_PHOTO', tenantId, updatedBy, { employeeId, url });
    return { photoUrl: url };
  }
}
