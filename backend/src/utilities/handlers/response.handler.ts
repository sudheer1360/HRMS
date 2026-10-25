/**
 * response.handler.ts — Backend Structure path alias for ResponseHandler.
 *
 * The canonical implementation lives in src/common/utils/ResponseHandler.ts.
 * This file re-exports it under the Backend Structure's naming convention so
 * both import paths resolve correctly:
 *
 *   import { ResponseHandler } from '@common/utils/ResponseHandler.js';  ← HRMS style
 *   import ResponseHandler from '@utilities/handlers/response.handler.js'; ← Backend Structure style
 */
export { ResponseHandler, responseHandler as default } from '../../common/utils/ResponseHandler.js';
export { responseHandler } from '../../common/utils/ResponseHandler.js';
