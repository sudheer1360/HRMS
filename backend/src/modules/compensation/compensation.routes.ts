import { Router } from 'express';
import { compensationController } from './compensation.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { rbac } from '../../middleware/rbac.js';

const router = Router();
router.use(authenticate);

// Review Cycles (admin/HR only)
router.get('/review-cycles', rbac('COMPENSATION', 'VIEW'), (req, res, next) => compensationController.listReviewCycles(req, res, next));
router.post('/review-cycles', rbac('COMPENSATION', 'CREATE'), (req, res, next) => compensationController.createReviewCycle(req, res, next));
router.post('/review-cycles/:id/activate', rbac('COMPENSATION', 'EDIT'), (req, res, next) => compensationController.activateReviewCycle(req, res, next));

// Bonuses
router.get('/bonuses/my', (req, res, next) => compensationController.listMyBonuses(req, res, next));
router.post('/bonuses', rbac('COMPENSATION', 'CREATE'), (req, res, next) => compensationController.createBonus(req, res, next));

// Loans
router.get('/loans/my', (req, res, next) => compensationController.listMyLoans(req, res, next));
  router.post('/loans', rbac('COMPENSATION', 'CREATE'), (req, res, next) => compensationController.createLoan(req, res, next));

// Variable Pay
router.get('/variable-pay/my', (req, res, next) => compensationController.listMyVariablePay(req, res, next));

// CTC Revisions
router.get('/ctc-revisions/my', (req, res, next) => compensationController.listMyCTCRevisions(req, res, next));
router.post('/ctc-revisions', rbac('COMPENSATION', 'CREATE'), (req, res, next) => compensationController.createCTCRevision(req, res, next));

export default router;
