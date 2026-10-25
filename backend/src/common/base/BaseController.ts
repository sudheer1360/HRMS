/**
 * BaseController — Abstract base for all HRMS controller classes.
 *
 * Following the Backend Structure's AbstractController pattern, this class
 * injects the four core handler utilities as protected properties so every
 * concrete controller can use them without any extra imports:
 *
 *   this.response  → ResponseHandler  (format and send HTTP responses)
 *   this.logging   → LoggingHandler   (structured pino logging)
 *   this.common    → CommonHandler    (validators, maskers, utilities)
 *   this.cache     → CacheManager    (Redis get/set/invalidate)
 *
 * Legacy shortcut methods (ok / created / paginated / noContent / handle)
 * are preserved for backward-compatibility with existing controllers.
 *
 * New controllers should prefer:
 *   this.response.success(res, data, 'Message');
 *   this.response.paginated(res, list, meta, 'Message');
 *   this.logging.info('module.controller', 'Action description', { context });
 */
import { Response, NextFunction } from 'express';
import { ResponseHandler } from '../utils/ResponseHandler.js';
import { LoggingHandler } from '../utils/LoggingHandler.js';
import { CommonHandler } from '../utils/CommonHandler.js';
import { CacheManager } from '../utils/CacheManager.js';
import type { ApiResponse, PaginatedResponse } from '../types/index.js';

export abstract class BaseController {
  // ── Handler utilities (Backend Structure pattern) ─────────────────────────

  protected readonly response: ResponseHandler;
  protected readonly logging: LoggingHandler;
  protected readonly common: CommonHandler;
  protected readonly cache: CacheManager;

  constructor() {
    this.response = new ResponseHandler();
    this.logging = new LoggingHandler();
    this.common = new CommonHandler();
    this.cache = new CacheManager();
  }

  // ── Legacy response helpers (backward-compatible) ─────────────────────────

  /**
   * @deprecated Prefer this.response.success(res, data, message)
   */
  protected ok<T>(res: Response, data: T): void {
    const body: ApiResponse<T> = { success: true, data };
    res.json(body);
  }

  /**
   * @deprecated Prefer this.response.created(res, data, message)
   */
  protected created<T>(res: Response, data: T): void {
    res.status(201).json({ success: true, data });
  }

  /**
   * @deprecated Prefer this.response.paginated(res, data, meta, message)
   */
  protected paginated<T>(
    res: Response,
    data: T[],
    meta: PaginatedResponse<T>['meta']
  ): void {
    res.json({ success: true, data, meta });
  }

  /**
   * @deprecated Prefer this.response.noContent(res)
   */
  protected noContent(res: Response): void {
    res.status(204).send();
  }

  // ── Error forwarding ──────────────────────────────────────────────────────

  /**
   * Wraps an async controller body and automatically forwards any thrown error
   * to Express's next() error handler.  Eliminates boilerplate try/catch.
   *
   * @example
   * async getEmployee(req: AuthenticatedRequest, res: Response, next: NextFunction) {
   *   await this.handle(next, async () => {
   *     this.logging.info('employee.controller', 'getEmployee called', { id: req.params.id });
   *     const emp = await employeeService.getById(req.params.id, req.tenantId!);
   *     this.response.success(res, emp, 'Employee retrieved');
   *   });
   * }
   */
  protected async handle(
    next: NextFunction,
    fn: () => Promise<void>
  ): Promise<void> {
    try {
      await fn();
    } catch (err) {
      next(err);
    }
  }
}
