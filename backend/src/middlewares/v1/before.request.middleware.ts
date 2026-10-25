/**
 * middlewares/v1/before.request.middleware.ts
 *
 * Backend Structure versioned middleware re-export.
 * Canonical implementation: src/middleware/beforeRequest.ts
 *
 * In the Backend Structure pattern, middlewares live under middlewares/v1/.
 * This re-export keeps that convention while avoiding code duplication.
 */
export { beforeRequest, apiVersionHeader } from '../../middleware/beforeRequest.js';
