"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const operations_controller_js_1 = require("./operations.controller.js");
const auth_js_1 = require("../../middleware/auth.js");
const rbac_js_1 = require("../../middleware/rbac.js");
const router = (0, express_1.Router)();
router.use(auth_js_1.authenticate);
// Performance
router.get('/performance/cycles/:companyId', (0, rbac_js_1.rbac)('PERF', 'VIEW'), (req, res, next) => operations_controller_js_1.operationsController.listCycles(req, res, next));
router.post('/performance/cycles', (0, rbac_js_1.rbac)('PERF', 'CREATE'), (req, res, next) => operations_controller_js_1.operationsController.createCycle(req, res, next));
router.post('/performance/cycles/:cycleId/self-review', (req, res, next) => operations_controller_js_1.operationsController.submitSelfReview(req, res, next));
router.post('/performance/reviews/:id/manager-review', (0, rbac_js_1.rbac)('PERF', 'EDIT'), (req, res, next) => operations_controller_js_1.operationsController.submitManagerReview(req, res, next));
router.get('/performance/reviews', (req, res, next) => operations_controller_js_1.operationsController.listReviews(req, res, next));
// Assets
router.get('/assets', (req, res, next) => operations_controller_js_1.operationsController.listAssets(req, res, next));
router.post('/assets', (0, rbac_js_1.rbac)('ASSET', 'CREATE'), (req, res, next) => operations_controller_js_1.operationsController.createAsset(req, res, next));
router.patch('/assets/:id/allocate', (0, rbac_js_1.rbac)('ASSET', 'EDIT'), (req, res, next) => operations_controller_js_1.operationsController.allocateAsset(req, res, next));
router.patch('/assets/:id/return', (0, rbac_js_1.rbac)('ASSET', 'EDIT'), (req, res, next) => operations_controller_js_1.operationsController.returnAsset(req, res, next));
// Grievance
router.get('/grievances', (0, rbac_js_1.rbac)('GRIEV', 'VIEW'), (req, res, next) => operations_controller_js_1.operationsController.listGrievances(req, res, next));
router.post('/grievances', (req, res, next) => operations_controller_js_1.operationsController.submitGrievance(req, res, next));
// Disciplinary
router.get('/disciplinary', (0, rbac_js_1.rbac)('DISC', 'VIEW'), (req, res, next) => operations_controller_js_1.operationsController.listDisciplinary(req, res, next));
router.post('/disciplinary', (0, rbac_js_1.rbac)('DISC', 'CREATE'), (req, res, next) => operations_controller_js_1.operationsController.createDisciplinary(req, res, next));
// Exit
router.get('/exits', (0, rbac_js_1.rbac)('EXIT', 'VIEW'), (req, res, next) => operations_controller_js_1.operationsController.listExits(req, res, next));
router.post('/exits', (req, res, next) => operations_controller_js_1.operationsController.initiateExit(req, res, next));
router.patch('/exits/:id/fnf', (0, rbac_js_1.rbac)('EXIT', 'EDIT'), (req, res, next) => operations_controller_js_1.operationsController.processFnf(req, res, next));
exports.default = router;
//# sourceMappingURL=operations.routes.js.map