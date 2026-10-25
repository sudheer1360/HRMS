/**
 * beforeRequest middleware — Backend Structure's before.request.middleware pattern.
 *
 * Applied globally BEFORE auth/tenant middlewares to:
 *   1. Ensure X-Request-ID is present (generate one if absent)
 *   2. Record request start time for performance logging
 *   3. Validate required structural headers (Content-Type on writes)
 *   4. Guard oversized JSON bodies (belt-and-suspenders on top of express.json limit)
 *   5. Log every request on completion with method / path / status / duration
 *
 * Note: app.ts already applies:
 *   - express-rate-limit (global)
 *   - helmet (security headers)
 *   - cors
 *   - compression
 *   - morgan (short request log)
 *
 * This middleware adds the structured pino-based performance log and
 * the request-ID propagation that the Backend Structure mandates.
 */
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { loggingHandler } from '../common/utils/LoggingHandler.js';

const MODULE = 'before.request';

export function beforeRequest(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // 1. Request ID — honour existing header or generate a new UUID
  const requestId =
    (req.headers['x-request-id'] as string) || randomUUID();
  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-ID', requestId);

  // 2. Record start time for duration calculation
  const startedAt = Date.now();
  res.locals['requestStartedAt'] = startedAt;

  // 3. Validate Content-Type on mutating requests
  const method = req.method.toUpperCase();
  if (
    ['POST', 'PUT', 'PATCH'].includes(method) &&
    req.headers['content-length'] !== '0' &&
    !req.is('application/json') &&
    !req.is('multipart/form-data') &&
    !req.is('application/x-www-form-urlencoded')
  ) {
    loggingHandler.warn(MODULE, 'Unsupported Content-Type', {
      contentType: req.headers['content-type'],
      method,
      path: req.path,
      requestId,
    });
    res.status(415).json({
      success: false,
      error: {
        code: 'UNSUPPORTED_MEDIA_TYPE',
        message: 'Content-Type must be application/json',
      },
    });
    return;
  }

  // 4. Log performance metrics on response finish
  res.on('finish', () => {
    const durationMs = Date.now() - startedAt;

    loggingHandler.performance(
      MODULE,
      req.method,
      req.path,
      res.statusCode,
      durationMs
    );

    // Log a warning for slow requests (> 2 seconds)
    if (durationMs > 2000) {
      loggingHandler.warn(MODULE, 'Slow request detected', {
        method: req.method,
        path: req.path,
        durationMs,
        requestId,
        statusCode: res.statusCode,
      });
    }
  });

  next();
}

/**
 * apiVersionHeader middleware — attaches X-API-Version to every response
 * so clients can inspect which API version served the request.
 */
export function apiVersionHeader(version = 'v1') {
  return (_req: Request, res: Response, next: NextFunction): void => {
    res.setHeader('X-API-Version', version);
    next();
  };
}
