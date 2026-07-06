"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const compliance_controller_js_1 = require("./compliance.controller.js");
const auth_js_1 = require("../../middleware/auth.js");
const router = (0, express_1.Router)();
router.use(auth_js_1.authenticate);
// Compliance Calendar
router.get('/calendar', (req, res, next) => compliance_controller_js_1.complianceController.listCalendar(req, res, next));
router.post('/calendar', (req, res, next) => compliance_controller_js_1.complianceController.createCalendarEvent(req, res, next));
// Filings
router.get('/filings', (req, res, next) => compliance_controller_js_1.complianceController.listFilings(req, res, next));
router.post('/filings', (req, res, next) => compliance_controller_js_1.complianceController.createFiling(req, res, next));
// Reports
router.get('/reports', (req, res, next) => compliance_controller_js_1.complianceController.listReports(req, res, next));
// Checklist
router.get('/checklist', (req, res, next) => compliance_controller_js_1.complianceController.listChecklist(req, res, next));
router.patch('/checklist/:id', (req, res, next) => compliance_controller_js_1.complianceController.updateChecklistItem(req, res, next));
// Documents
router.get('/documents', (req, res, next) => compliance_controller_js_1.complianceController.listDocuments(req, res, next));
router.post('/documents', (req, res, next) => compliance_controller_js_1.complianceController.createDocument(req, res, next));
exports.default = router;
//# sourceMappingURL=compliance.routes.js.map