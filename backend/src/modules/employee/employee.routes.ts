import { Router } from 'express';
import { employeeController } from './employee.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { rbac } from '../../middleware/rbac.js';
import { auditLog } from '../../middleware/audit.js';

const router = Router();
router.use(authenticate);

router.get('/', rbac('EMP', 'VIEW'), (req, res, next) => employeeController.list(req, res, next));
router.get('/:id', rbac('EMP', 'VIEW'), (req, res, next) => employeeController.getById(req, res, next));
router.post('/', rbac('EMP', 'CREATE'), auditLog('EMPLOYEE', 'Employee'), (req, res, next) => employeeController.create(req, res, next));
router.put('/:id', rbac('EMP', 'EDIT'), auditLog('EMPLOYEE', 'Employee'), (req, res, next) => employeeController.update(req, res, next));
router.patch('/:id/status', rbac('EMP', 'EDIT'), auditLog('EMPLOYEE', 'Employee'), (req, res, next) => employeeController.changeStatus(req, res, next));
router.delete('/:id', rbac('EMP', 'DELETE'), auditLog('EMPLOYEE', 'Employee'), (req, res, next) => employeeController.delete(req, res, next));

export default router;
