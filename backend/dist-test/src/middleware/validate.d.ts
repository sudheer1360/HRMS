import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../common/types/index.js';
import { ZodSchema } from 'zod';
/**
 * Request validation middleware using Zod schemas.
 * Validates body, query, and params.
 */
export declare function validate(schemas: {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
}): (req: AuthenticatedRequest, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=validate.d.ts.map