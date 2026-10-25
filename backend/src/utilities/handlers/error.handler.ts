/**
 * error.handler.ts — Backend Structure path alias for HRMS error classes.
 * Canonical implementation: src/common/errors/index.ts
 *
 * Usage (Backend Structure style):
 *   import { NotFoundError, ValidationError } from '@utilities/handlers/error.handler.js';
 */
export {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  BusinessRuleError,
  RateLimitError,
} from '../../common/errors/index.js';
