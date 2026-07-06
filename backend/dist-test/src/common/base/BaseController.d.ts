/**
 * BaseController — Abstract base for all HRMS controller classes.
 *
 * Eliminates the repeated try/catch + res.json({ success: true, data }) in
 * every controller method by providing:
 *
 *  handle()   → wraps an async handler and forwards errors to next()
 *  ok()       → 200 { success: true, data }
 *  created()  → 201 { success: true, data }
 *  paginated()→ 200 { success: true, data, meta }
 *  noContent()→ 204
 */
import { Response, NextFunction } from 'express';
import { PaginatedResponse } from '../types/index.js';
export declare abstract class BaseController {
    protected ok<T>(res: Response, data: T): void;
    protected created<T>(res: Response, data: T): void;
    protected paginated<T>(res: Response, data: T[], meta: PaginatedResponse<T>['meta']): void;
    protected noContent(res: Response): void;
    /**
     * Wraps an async controller body and automatically forwards any thrown error
     * to Express's next() error handler.  Eliminates boilerplate try/catch.
     *
     * @example
     * async getEmployee(req, res, next) {
     *   await this.handle(next, async () => {
     *     const emp = await employeeService.getById(req.params.id, req.tenantId!);
     *     this.ok(res, emp);
     *   });
     * }
     */
    protected handle(next: NextFunction, fn: () => Promise<void>): Promise<void>;
}
//# sourceMappingURL=BaseController.d.ts.map