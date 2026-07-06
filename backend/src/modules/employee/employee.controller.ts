import { Response, NextFunction } from 'express';
import { employeeService } from './employee.service.js';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  employeeFilterSchema,
  employeeStatusSchema,
} from './employee.schema.js';
import { AuthenticatedRequest } from '../../common/types/index.js';

export class EmployeeController {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const query = employeeFilterSchema.parse(req.query);
      const result = await employeeService.list(req.tenantId!, query);
      res.json({ success: true, ...result });
    } catch (e) { next(e); }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const employee = await employeeService.getById(req.params.id, req.tenantId!);
      res.json({ success: true, data: employee });
    } catch (e) { next(e); }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = createEmployeeSchema.parse(req.body);
      const employee = await employeeService.create(req.tenantId!, req.user!.userId, input);
      res.status(201).json({ success: true, data: employee });
    } catch (e) { next(e); }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = updateEmployeeSchema.parse(req.body);
      const employee = await employeeService.update(req.params.id, req.tenantId!, input);
      res.json({ success: true, data: employee });
    } catch (e) { next(e); }
  }

  async changeStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { status, reason } = employeeStatusSchema.parse(req.body);
      const employee = await employeeService.changeStatus(
        req.params.id,
        req.tenantId!,
        req.user!.userId,
        status,
        reason
      );
      res.json({ success: true, data: employee });
    } catch (e) { next(e); }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await employeeService.delete(req.params.id, req.tenantId!);
      res.json({ success: true, data: result });
    } catch (e) { next(e); }
  }
}

export const employeeController = new EmployeeController();
