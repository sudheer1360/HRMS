import { Router } from 'express';
import { operationsController } from './operations.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { rbac } from '../../middleware/rbac.js';
import { auditLog } from '../../middleware/audit.js';

const router = Router();
router.use(authenticate);

// Performance
router.get('/performance/cycles/:companyId', rbac('PERF', 'VIEW'), (req, res, next) => operationsController.listCycles(req, res, next));
router.post('/performance/cycles', rbac('PERF', 'CREATE'), (req, res, next) => operationsController.createCycle(req, res, next));
router.post('/performance/cycles/:cycleId/self-review', (req, res, next) => operationsController.submitSelfReview(req, res, next));
router.post('/performance/reviews/:id/manager-review', rbac('PERF', 'EDIT'), (req, res, next) => operationsController.submitManagerReview(req, res, next));
router.get('/performance/reviews', (req, res, next) => operationsController.listReviews(req, res, next));

// Assets
router.get('/assets', (req, res, next) => operationsController.listAssets(req, res, next));
router.post('/assets', rbac('ASSET', 'CREATE'), (req, res, next) => operationsController.createAsset(req, res, next));
router.patch('/assets/:id/allocate', rbac('ASSET', 'EDIT'), (req, res, next) => operationsController.allocateAsset(req, res, next));
router.patch('/assets/:id/return', rbac('ASSET', 'EDIT'), (req, res, next) => operationsController.returnAsset(req, res, next));

// Grievance
router.get('/grievances', rbac('GRIEV', 'VIEW'), (req, res, next) => operationsController.listGrievances(req, res, next));
router.post('/grievances', (req, res, next) => operationsController.submitGrievance(req, res, next));

// Disciplinary
router.get('/disciplinary', rbac('DISC', 'VIEW'), (req, res, next) => operationsController.listDisciplinary(req, res, next));
router.post('/disciplinary', rbac('DISC', 'CREATE'), (req, res, next) => operationsController.createDisciplinary(req, res, next));

// Exit
router.get('/exits', rbac('EXIT', 'VIEW'), (req, res, next) => operationsController.listExits(req, res, next));
router.post('/exits', (req, res, next) => operationsController.initiateExit(req, res, next));
router.patch('/exits/:id/fnf', rbac('EXIT', 'EDIT'), (req, res, next) => operationsController.processFnf(req, res, next));

export default router;
