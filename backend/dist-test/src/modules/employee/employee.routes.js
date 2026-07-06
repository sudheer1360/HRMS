"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const employee_controller_js_1 = require("./employee.controller.js");
const auth_js_1 = require("../../middleware/auth.js");
const rbac_js_1 = require("../../middleware/rbac.js");
const audit_js_1 = require("../../middleware/audit.js");
const router = (0, express_1.Router)();
router.use(auth_js_1.authenticate);
router.get('/', (0, rbac_js_1.rbac)('EMP', 'VIEW'), (req, res, next) => employee_controller_js_1.employeeController.list(req, res, next));
router.get('/:id', (0, rbac_js_1.rbac)('EMP', 'VIEW'), (req, res, next) => employee_controller_js_1.employeeController.getById(req, res, next));
router.post('/', (0, rbac_js_1.rbac)('EMP', 'CREATE'), (0, audit_js_1.auditLog)('EMPLOYEE', 'Employee'), (req, res, next) => employee_controller_js_1.employeeController.create(req, res, next));
router.put('/:id', (0, rbac_js_1.rbac)('EMP', 'EDIT'), (0, audit_js_1.auditLog)('EMPLOYEE', 'Employee'), (req, res, next) => employee_controller_js_1.employeeController.update(req, res, next));
router.patch('/:id/status', (0, rbac_js_1.rbac)('EMP', 'EDIT'), (0, audit_js_1.auditLog)('EMPLOYEE', 'Employee'), (req, res, next) => employee_controller_js_1.employeeController.changeStatus(req, res, next));
router.delete('/:id', (0, rbac_js_1.rbac)('EMP', 'DELETE'), (0, audit_js_1.auditLog)('EMPLOYEE', 'Employee'), (req, res, next) => employee_controller_js_1.employeeController.delete(req, res, next));
exports.default = router;
//# sourceMappingURL=employee.routes.js.map