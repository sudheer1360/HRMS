import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ZodError } from 'zod';
import { AppError } from '../common/errors/index.js';
import { ApiError } from '../common/types/index.js';
import logger from '../config/logger.js';

/**
 * Assigns a unique request ID to every incoming request.
 */
export function requestId(req: Request, _res: Response, next: NextFunction): void {
  (req as any).requestId = (req.headers['x-request-id'] as string) || uuidv4();
  _res.setHeader('X-Request-ID', (req as any).requestId);
  next();
}

/**
 * Global error handler middleware.
 * Catches all errors and returns standardized API error responses.
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = (req as any).requestId || 'unknown';

  // ── Zod validation errors → 400 Bad Request ─────────────────────────────
  if (err instanceof ZodError) {
    const fields = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    logger.warn({ requestId, code: 'VALIDATION_ERROR', fields, path: req.path });

    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: fields.map((f) => `${f.field}: ${f.message}`).join(', '),
        details: fields,
        requestId,
      },
    } satisfies ApiError);
    return;
  }

  if (err instanceof AppError) {
    const response: ApiError = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: (err as any).details,
        requestId,
      },
    };

    logger.warn({
      requestId,
      statusCode: err.statusCode,
      code: err.code,
      message: err.message,
      path: req.path,
    });

    res.status(err.statusCode).json(response);
    return;
  }

  // Unknown errors (500)
  logger.error({
    requestId,
    err: {
      message: err.message,
      stack: err.stack,
      name: err.name,
    },
    path: req.path,
    method: req.method,
  });

  const response: ApiError = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message:
        process.env.NODE_ENV === 'production'
          ? 'An unexpected error occurred'
          : err.message,
      requestId,
    },
  };

  res.status(500).json(response);
}
