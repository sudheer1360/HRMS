/**
 * middlewares/v1/before.auth.middleware.ts
 *
 * Backend Structure versioned middleware re-export.
 * Canonical implementation: src/middleware/auth.ts
 *
 * Usage (Backend Structure style):
 *   import { authenticate } from '@middlewares/v1/before.auth.middleware.js';
 *   router.get('/protected', authenticate, rbac('employees', 'read'), controller.list);
 */
export { authenticate } from '../../middleware/auth.js';
