import { Router } from 'express';
import { policyController } from './policy.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { rbac } from '../../middleware/rbac.js';
import { auditLog } from '../../middleware/audit.js';

const router = Router();
router.use(authenticate);

// Admin
router.get('/', rbac('POLICY', 'VIEW'), (req, res, next) => policyController.list(req, res, next));
router.post('/', rbac('POLICY', 'CREATE'), auditLog('POLICY', 'Policy'), (req, res, next) => policyController.create(req, res, next));
router.post('/:id/publish', rbac('POLICY', 'PUBLISH'), auditLog('POLICY', 'Policy'), (req, res, next) => policyController.publish(req, res, next));
router.get('/:id', (req, res, next) => policyController.getById(req, res, next));
router.get('/:id/stats', rbac('POLICY', 'VIEW'), (req, res, next) => policyController.stats(req, res, next));

// Employee
router.get('/my/all', (req, res, next) => policyController.myPolicies(req, res, next));
router.post('/acknowledge', (req, res, next) => policyController.acknowledge(req, res, next));

export default router;
