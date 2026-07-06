import { Router } from 'express';
import { compensationController } from './compensation.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();
router.use(authenticate);

// Review Cycles
router.get('/review-cycles', (req, res, next) => compensationController.listReviewCycles(req, res, next));
router.post('/review-cycles', (req, res, next) => compensationController.createReviewCycle(req, res, next));
router.post('/review-cycles/:id/activate', (req, res, next) => compensationController.activateReviewCycle(req, res, next));

// Bonuses
router.get('/bonuses/my', (req, res, next) => compensationController.listMyBonuses(req, res, next));
router.post('/bonuses', (req, res, next) => compensationController.createBonus(req, res, next));

// Loans
router.get('/loans/my', (req, res, next) => compensationController.listMyLoans(req, res, next));
router.post('/loans', (req, res, next) => compensationController.createLoan(req, res, next));

// Variable Pay
router.get('/variable-pay/my', (req, res, next) => compensationController.listMyVariablePay(req, res, next));

// CTC Revisions
router.get('/ctc-revisions/my', (req, res, next) => compensationController.listMyCTCRevisions(req, res, next));
router.post('/ctc-revisions', (req, res, next) => compensationController.createCTCRevision(req, res, next));

export default router;
