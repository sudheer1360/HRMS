/**
 * ResponseHandler — Centralised HTTP response formatting for all controllers.
 *
 * Adapts the Backend Structure's ResponseHandler pattern to HRMS's existing
 * { success, data, meta } shape while adding:
 *   - Optional human-readable `message` field
 *   - `timestamp` on every response
 *   - HTTP status code control on every method
 *
 * Usage in a controller that extends BaseController:
 *   this.response.success(res, data, 'Employee retrieved');
 *   this.response.paginated(res, list, meta, 'Employees listed');
 *   this.response.created(res, record, 'Employee created');
 *   this.response.noContent(res);
 *   this.response.error(res, err);
 */
import { Response } from 'express';
import { AppError, ValidationError } from '../errors/index.js';
import type { PaginatedResponse } from '../types/index.js';

export class ResponseHandler {
  // ── 2xx Success ──────────────────────────────────────────────────────────

  success<T>(res: Response, data: T, message = 'Success', statusCode = 200): void {
    res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  created<T>(res: Response, data: T, message = 'Created successfully'): void {
    res.status(201).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  accepted<T>(res: Response, data: T, message = 'Accepted'): void {
    res.status(202).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  noContent(res: Response): void {
    res.status(204).send();
  }

  paginated<T>(
    res: Response,
    data: T[],
    meta: PaginatedResponse<T>['meta'],
    message = 'Success'
  ): void {
    res.status(200).json({
      success: true,
      message,
      data,
      meta,
      timestamp: new Date().toISOString(),
    });
  }

  // ── Error responses ──────────────────────────────────────────────────────

  /**
   * Formats any thrown error into the HRMS standard error envelope.
   * Prefer throwing AppError subclasses (ValidationError, NotFoundError, etc.)
   * and letting the global errorHandler handle them; use this only when you
   * need to send an error response without going through next(err).
   */
  error(res: Response, error: unknown, statusCode = 500): void {
    if (error instanceof AppError) {
      const extraFields =
        error instanceof ValidationError && error.details
          ? { details: error.details }
          : {};

      res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          ...extraFields,
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred';

    res.status(statusCode).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message,
      },
      timestamp: new Date().toISOString(),
    });
  }
}

// Singleton — controllers share one instance
export const responseHandler = new ResponseHandler();
