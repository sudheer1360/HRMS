/**
 * middlewares/v1/before.rbac.middleware.ts
 *
 * Backend Structure versioned middleware re-export.
 * Canonical implementation: src/middleware/rbac.ts
 *
 * Usage:
 *   import { rbac } from '@middlewares/v1/before.rbac.middleware.js';
 *   router.get('/', authenticate, rbac('employees', 'read'), controller.list);
 */
export { rbac } from '../../middleware/rbac.js';
