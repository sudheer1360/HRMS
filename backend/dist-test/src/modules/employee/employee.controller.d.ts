import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../common/types/index.js';
export declare class EmployeeController {
    list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    changeStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const employeeController: EmployeeController;
//# sourceMappingURL=employee.controller.d.ts.map