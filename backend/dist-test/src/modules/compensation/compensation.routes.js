"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const compensation_controller_js_1 = require("./compensation.controller.js");
const auth_js_1 = require("../../middleware/auth.js");
const router = (0, express_1.Router)();
router.use(auth_js_1.authenticate);
// Review Cycles
router.get('/review-cycles', (req, res, next) => compensation_controller_js_1.compensationController.listReviewCycles(req, res, next));
router.post('/review-cycles', (req, res, next) => compensation_controller_js_1.compensationController.createReviewCycle(req, res, next));
router.post('/review-cycles/:id/activate', (req, res, next) => compensation_controller_js_1.compensationController.activateReviewCycle(req, res, next));
// Bonuses
router.get('/bonuses/my', (req, res, next) => compensation_controller_js_1.compensationController.listMyBonuses(req, res, next));
router.post('/bonuses', (req, res, next) => compensation_controller_js_1.compensationController.createBonus(req, res, next));
// Loans
router.get('/loans/my', (req, res, next) => compensation_controller_js_1.compensationController.listMyLoans(req, res, next));
router.post('/loans', (req, res, next) => compensation_controller_js_1.compensationController.createLoan(req, res, next));
// Variable Pay
router.get('/variable-pay/my', (req, res, next) => compensation_controller_js_1.compensationController.listMyVariablePay(req, res, next));
// CTC Revisions
router.get('/ctc-revisions/my', (req, res, next) => compensation_controller_js_1.compensationController.listMyCTCRevisions(req, res, next));
router.post('/ctc-revisions', (req, res, next) => compensation_controller_js_1.compensationController.createCTCRevision(req, res, next));
exports.default = router;
//# sourceMappingURL=compensation.routes.js.map