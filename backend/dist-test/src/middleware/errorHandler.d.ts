import { Request, Response, NextFunction } from 'express';
/**
 * Assigns a unique request ID to every incoming request.
 */
export declare function requestId(req: Request, _res: Response, next: NextFunction): void;
/**
 * Global error handler middleware.
 * Catches all errors and returns standardized API error responses.
 */
export declare function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void;
//# sourceMappingURL=errorHandler.d.ts.map