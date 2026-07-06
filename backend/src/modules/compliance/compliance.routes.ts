import { Router } from 'express';
import { complianceController } from './compliance.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();
router.use(authenticate);

// Compliance Calendar
router.get('/calendar', (req, res, next) => complianceController.listCalendar(req, res, next));
router.post('/calendar', (req, res, next) => complianceController.createCalendarEvent(req, res, next));

// Filings
router.get('/filings', (req, res, next) => complianceController.listFilings(req, res, next));
router.post('/filings', (req, res, next) => complianceController.createFiling(req, res, next));

// Reports
router.get('/reports', (req, res, next) => complianceController.listReports(req, res, next));

// Checklist
router.get('/checklist', (req, res, next) => complianceController.listChecklist(req, res, next));
router.patch('/checklist/:id', (req, res, next) => complianceController.updateChecklistItem(req, res, next));

// Documents
router.get('/documents', (req, res, next) => complianceController.listDocuments(req, res, next));
router.post('/documents', (req, res, next) => complianceController.createDocument(req, res, next));

export default router;
