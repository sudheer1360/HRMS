"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const policy_controller_js_1 = require("./policy.controller.js");
const auth_js_1 = require("../../middleware/auth.js");
const rbac_js_1 = require("../../middleware/rbac.js");
const audit_js_1 = require("../../middleware/audit.js");
const router = (0, express_1.Router)();
router.use(auth_js_1.authenticate);
// Admin
router.get('/', (0, rbac_js_1.rbac)('POLICY', 'VIEW'), (req, res, next) => policy_controller_js_1.policyController.list(req, res, next));
router.post('/', (0, rbac_js_1.rbac)('POLICY', 'CREATE'), (0, audit_js_1.auditLog)('POLICY', 'Policy'), (req, res, next) => policy_controller_js_1.policyController.create(req, res, next));
router.post('/:id/publish', (0, rbac_js_1.rbac)('POLICY', 'PUBLISH'), (0, audit_js_1.auditLog)('POLICY', 'Policy'), (req, res, next) => policy_controller_js_1.policyController.publish(req, res, next));
router.get('/:id', (req, res, next) => policy_controller_js_1.policyController.getById(req, res, next));
router.get('/:id/stats', (0, rbac_js_1.rbac)('POLICY', 'VIEW'), (req, res, next) => policy_controller_js_1.policyController.stats(req, res, next));
// Employee
router.get('/my/all', (req, res, next) => policy_controller_js_1.policyController.myPolicies(req, res, next));
router.post('/acknowledge', (req, res, next) => policy_controller_js_1.policyController.acknowledge(req, res, next));
exports.default = router;
//# sourceMappingURL=policy.routes.js.map