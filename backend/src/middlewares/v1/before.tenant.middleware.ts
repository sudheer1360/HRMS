/**
 * middlewares/v1/before.tenant.middleware.ts
 *
 * Backend Structure versioned middleware re-export.
 * Canonical implementation: src/middleware/tenant.ts
 *
 * The HRMS tenant middleware extracts X-Tenant-Id from request headers
 * and populates req.tenantId for all subsequent route handlers.
 */
export { tenantResolver } from '../../middleware/tenant.js';
