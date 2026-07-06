"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const travel_controller_js_1 = require("./travel.controller.js");
const auth_js_1 = require("../../middleware/auth.js");
const audit_js_1 = require("../../middleware/audit.js");
const router = (0, express_1.Router)();
router.use(auth_js_1.authenticate);
// Travel Requests
router.get('/requests', (req, res, next) => travel_controller_js_1.travelController.listRequests(req, res, next));
router.post('/requests', (0, audit_js_1.auditLog)('TRAVEL', 'TravelRequest'), (req, res, next) => travel_controller_js_1.travelController.createRequest(req, res, next));
router.patch('/requests/:id', (req, res, next) => travel_controller_js_1.travelController.updateRequest(req, res, next));
router.patch('/requests/:id/approve', (req, res, next) => { req.body.status = 'Approved'; travel_controller_js_1.travelController.updateRequest(req, res, next); });
router.patch('/requests/:id/reject', (req, res, next) => { req.body.status = 'Rejected'; travel_controller_js_1.travelController.updateRequest(req, res, next); });
// Expenses
router.get('/expenses', (req, res, next) => travel_controller_js_1.travelController.listExpenses(req, res, next));
router.post('/expenses', (0, audit_js_1.auditLog)('TRAVEL', 'TravelExpense'), (req, res, next) => travel_controller_js_1.travelController.createExpense(req, res, next));
router.patch('/expenses/:id/approve', (req, res, next) => { req.body.status = 'Approved'; travel_controller_js_1.travelController.updateExpense(req, res, next); });
// Advances
router.get('/advances', (req, res, next) => travel_controller_js_1.travelController.listAdvances(req, res, next));
router.post('/advances', (0, audit_js_1.auditLog)('TRAVEL', 'TravelAdvance'), (req, res, next) => travel_controller_js_1.travelController.createAdvance(req, res, next));
exports.default = router;
//# sourceMappingURL=travel.routes.js.map