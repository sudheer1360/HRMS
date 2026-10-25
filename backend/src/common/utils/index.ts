// ── Handler utilities (Backend Structure pattern) ─────────────────────────────
export { ResponseHandler, responseHandler } from './ResponseHandler.js';
export { LoggingHandler, loggingHandler } from './LoggingHandler.js';
export { CommonHandler, commonHandler } from './CommonHandler.js';
export { CacheManager, cacheManager } from './CacheManager.js';

// ── Legacy HRMS utility functions (kept for backward compatibility) ────────────
export { generateEmployeeCode } from './legacyUtils.js';
export {
  maskAadhaar,
  maskPAN,
  maskAccountNumber,
  calculateAge,
  isValidPAN,
  isValidAadhaar,
  isValidIFSC,
  isValidGSTIN,
  isValidMobile,
  buildPaginationMeta,
} from './legacyUtils.js';
