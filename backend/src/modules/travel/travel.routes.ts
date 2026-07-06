import { Router } from 'express';
import { travelController } from './travel.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { auditLog } from '../../middleware/audit.js';

const router = Router();
router.use(authenticate);

// Travel Requests
router.get('/requests', (req, res, next) => travelController.listRequests(req, res, next));
router.post('/requests', auditLog('TRAVEL', 'TravelRequest'), (req, res, next) => travelController.createRequest(req, res, next));
router.patch('/requests/:id', (req, res, next) => travelController.updateRequest(req, res, next));
router.patch('/requests/:id/approve', (req, res, next) => { req.body.status = 'Approved'; travelController.updateRequest(req, res, next); });
router.patch('/requests/:id/reject', (req, res, next) => { req.body.status = 'Rejected'; travelController.updateRequest(req, res, next); });

// Expenses
router.get('/expenses', (req, res, next) => travelController.listExpenses(req, res, next));
router.post('/expenses', auditLog('TRAVEL', 'TravelExpense'), (req, res, next) => travelController.createExpense(req, res, next));
router.patch('/expenses/:id/approve', (req, res, next) => { req.body.status = 'Approved'; travelController.updateExpense(req, res, next); });

// Advances
router.get('/advances', (req, res, next) => travelController.listAdvances(req, res, next));
router.post('/advances', auditLog('TRAVEL', 'TravelAdvance'), (req, res, next) => travelController.createAdvance(req, res, next));

export default router;
