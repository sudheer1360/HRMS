import { Router } from 'express';
import { extendedController } from './formbuilder.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { rbac } from '../../middleware/rbac.js';

const router = Router();
router.use(authenticate);

// M09 Form Builder
router.get('/forms', (req, res, next) => extendedController.listForms(req, res, next));
router.post('/forms', rbac('FORM', 'CREATE'), (req, res, next) => extendedController.createForm(req, res, next));
router.get('/forms/:id', (req, res, next) => extendedController.getForm(req, res, next));
router.put('/forms/:id', rbac('FORM', 'EDIT'), (req, res, next) => extendedController.updateForm(req, res, next));
router.delete('/forms/:id', rbac('FORM', 'DELETE'), (req, res, next) => extendedController.deleteForm(req, res, next));
router.post('/forms/:id/submit', (req, res, next) => extendedController.submitFormResponse(req, res, next));
router.get('/forms/:id/submissions', rbac('FORM', 'VIEW'), (req, res, next) => extendedController.listSubmissions(req, res, next));

// M10 Templates
router.get('/templates', (req, res, next) => extendedController.listTemplates(req, res, next));
router.post('/templates', rbac('TEMPLATE', 'CREATE'), (req, res, next) => extendedController.createTemplate(req, res, next));
router.get('/templates/:id', (req, res, next) => extendedController.getTemplate(req, res, next));
router.put('/templates/:id', rbac('TEMPLATE', 'EDIT'), (req, res, next) => extendedController.updateTemplate(req, res, next));

// M12 Biometric
router.get('/biometric/devices', rbac('BIO', 'VIEW'), (req, res, next) => extendedController.listDevices(req, res, next));
router.post('/biometric/devices', rbac('BIO', 'CREATE'), (req, res, next) => extendedController.registerDevice(req, res, next));
router.put('/biometric/devices/:id', rbac('BIO', 'EDIT'), (req, res, next) => extendedController.updateDevice(req, res, next));
router.delete('/biometric/devices/:id', rbac('BIO', 'DELETE'), (req, res, next) => extendedController.deleteDevice(req, res, next));
router.post('/biometric/devices/:id/sync', rbac('BIO', 'EDIT'), (req, res, next) => extendedController.syncDevice(req, res, next));
router.get('/biometric/logs', rbac('BIO', 'VIEW'), (req, res, next) => extendedController.listBioLogs(req, res, next));
router.get('/biometric/exceptions', rbac('BIO', 'VIEW'), (req, res, next) => extendedController.listBioExceptions(req, res, next));
router.patch('/biometric/exceptions/:id/resolve', rbac('BIO', 'EDIT'), (req, res, next) => extendedController.resolveBioException(req, res, next));
router.get('/biometric/sync-status', rbac('BIO', 'VIEW'), (req, res, next) => extendedController.bioSyncStatus(req, res, next));

// M17 Statutory
router.get('/statutory/pf/:employeeId', rbac('STAT', 'VIEW'), (req, res, next) => extendedController.calculatePF(req, res, next));
router.get('/statutory/esi/:employeeId', rbac('STAT', 'VIEW'), (req, res, next) => extendedController.calculateESI(req, res, next));
router.get('/statutory/tds/:employeeId', rbac('STAT', 'VIEW'), (req, res, next) => extendedController.calculateTDS(req, res, next));

// M18 Benefits
router.get('/benefits/policies', (req, res, next) => extendedController.listPolicies(req, res, next));
router.post('/benefits/policies', rbac('BENEFITS', 'CREATE'), (req, res, next) => extendedController.createPolicy(req, res, next));
router.get('/benefits/claims', (req, res, next) => extendedController.listClaims(req, res, next));
router.post('/benefits/claims', (req, res, next) => extendedController.submitClaim(req, res, next));

// M35-M37 Governance
router.get('/governance/feature-flags', (req, res, next) => extendedController.featureFlags(req, res, next));
router.get('/governance/health', (req, res, next) => extendedController.systemHealth(req, res, next));
router.get('/governance/scope', (req, res, next) => extendedController.scopeStatus(req, res, next));

// M35 NFR
router.get('/governance/nfr/performance', (req, res, next) => extendedController.nfrPerformance(req, res, next));
router.get('/governance/nfr/scalability', (req, res, next) => extendedController.nfrScalability(req, res, next));
router.get('/governance/nfr/dr-status', (req, res, next) => extendedController.nfrDRStatus(req, res, next));
router.get('/governance/nfr/compliance', (req, res, next) => extendedController.nfrCompliance(req, res, next));
router.get('/governance/nfr/alerts', (req, res, next) => extendedController.nfrAlerts(req, res, next));

// M34 Audit + Sessions
router.get('/governance/audit-logs', (req, res, next) => extendedController.auditLogs(req, res, next));
router.get('/governance/sessions', (req, res, next) => extendedController.loginSessions(req, res, next));

// M22 Assets
router.get('/assets', (req, res, next) => extendedController.listAssets(req, res, next));
router.post('/assets', rbac('ASSET', 'CREATE'), (req, res, next) => extendedController.createAsset(req, res, next));
router.delete('/assets/:id', rbac('ASSET', 'DELETE'), (req, res, next) => extendedController.deleteAsset(req, res, next));
router.get('/assets/my', (req, res, next) => extendedController.myAssets(req, res, next));
router.get('/assets/allocations', (req, res, next) => extendedController.listAllocations(req, res, next));
router.post('/assets/allocations', rbac('ASSET', 'EDIT'), (req, res, next) => extendedController.allocateAsset(req, res, next));
router.patch('/assets/allocations/:id/return', rbac('ASSET', 'EDIT'), (req, res, next) => extendedController.returnAsset(req, res, next));
router.get('/assets/maintenance', (req, res, next) => extendedController.listMaintenance(req, res, next));
router.post('/assets/maintenance', rbac('ASSET', 'EDIT'), (req, res, next) => extendedController.createMaintenance(req, res, next));
router.patch('/assets/maintenance/:id/complete', rbac('ASSET', 'EDIT'), (req, res, next) => extendedController.completeMaintenance(req, res, next));

// M24 Exit
router.get('/exit/requests', (req, res, next) => extendedController.listExitRequests(req, res, next));
router.post('/exit/requests', (req, res, next) => extendedController.createExitRequest(req, res, next));
router.patch('/exit/requests/:id/approve', rbac('EXIT', 'EDIT'), (req, res, next) => extendedController.approveExitRequest(req, res, next));
router.patch('/exit/requests/:id/reject', rbac('EXIT', 'EDIT'), (req, res, next) => extendedController.rejectExitRequest(req, res, next));
router.get('/exit/clearances', (req, res, next) => extendedController.listClearances(req, res, next));
router.patch('/exit/clearances/:id/clear', (req, res, next) => extendedController.clearDepartment(req, res, next));
router.get('/exit/fnf', (req, res, next) => extendedController.listFnF(req, res, next));
router.patch('/exit/fnf/:id/process', rbac('EXIT', 'EDIT'), (req, res, next) => extendedController.processFnF(req, res, next));
router.get('/exit/interviews', (req, res, next) => extendedController.listExitInterviews(req, res, next));
router.post('/exit/interviews', (req, res, next) => extendedController.createExitInterview(req, res, next));

// M26 Grievance
router.get('/grievances', (req, res, next) => extendedController.listGrievances(req, res, next));
router.post('/grievances', (req, res, next) => extendedController.createGrievance(req, res, next));
router.get('/grievances/sla', rbac('GRV', 'VIEW'), (req, res, next) => extendedController.grievanceSLA(req, res, next));
router.get('/grievances/:id', (req, res, next) => extendedController.getGrievance(req, res, next));
router.patch('/grievances/:id', rbac('GRV', 'EDIT'), (req, res, next) => extendedController.updateGrievance(req, res, next));

// M27 Disciplinary
router.get('/disciplinary', rbac('DISC', 'VIEW'), (req, res, next) => extendedController.listDisciplinaryCases(req, res, next));
router.post('/disciplinary', rbac('DISC', 'CREATE'), (req, res, next) => extendedController.createDisciplinaryCase(req, res, next));
router.get('/disciplinary/summary', rbac('DISC', 'VIEW'), (req, res, next) => extendedController.disciplinarySummary(req, res, next));
router.get('/disciplinary/:id', rbac('DISC', 'VIEW'), (req, res, next) => extendedController.getDisciplinaryCase(req, res, next));
router.patch('/disciplinary/:id', rbac('DISC', 'EDIT'), (req, res, next) => extendedController.updateDisciplinaryCase(req, res, next));
router.post('/disciplinary/:id/show-cause', rbac('DISC', 'EDIT'), (req, res, next) => extendedController.issueShowCause(req, res, next));
router.post('/disciplinary/:id/hearing', rbac('DISC', 'EDIT'), (req, res, next) => extendedController.scheduleHearing(req, res, next));
router.post('/disciplinary/:id/action', rbac('DISC', 'EDIT'), (req, res, next) => extendedController.recordDisciplinaryAction(req, res, next));

// M25 Analytics
router.get('/analytics/headcount', (req, res, next) => extendedController.analyticsHeadcount(req, res, next));
router.get('/analytics/attrition', (req, res, next) => extendedController.analyticsAttrition(req, res, next));
router.get('/analytics/payroll', (req, res, next) => extendedController.analyticsPayroll(req, res, next));
router.get('/analytics/attendance', (req, res, next) => extendedController.analyticsAttendance(req, res, next));
router.get('/analytics/reports/:type', (req, res, next) => extendedController.generateReport(req, res, next));
router.get('/statutory/pf/summary', (req, res, next) => extendedController.statutoryPFSummary(req, res, next));
router.get('/statutory/esi/summary', (req, res, next) => extendedController.statutoryESISummary(req, res, next));
router.get('/statutory/tds/summary', (req, res, next) => extendedController.statutoryTDSSummary(req, res, next));

// M03 Contractors
router.get('/contractors', (req, res, next) => extendedController.listContractors(req, res, next));
router.post('/contractors', rbac('CONTR', 'CREATE'), (req, res, next) => extendedController.createContractor(req, res, next));
router.put('/contractors/:id', rbac('CONTR', 'EDIT'), (req, res, next) => extendedController.updateContractor(req, res, next));
router.delete('/contractors/:id', rbac('CONTR', 'DELETE'), (req, res, next) => extendedController.deleteContractor(req, res, next));
router.get('/contractors/workers', (req, res, next) => extendedController.listContractorWorkers(req, res, next));
router.post('/contractors/workers', rbac('CONTR', 'CREATE'), (req, res, next) => extendedController.createContractorWorker(req, res, next));
router.get('/contractors/attendance', (req, res, next) => extendedController.contractorAttendance(req, res, next));
router.get('/contractors/invoices', (req, res, next) => extendedController.listContractorInvoices(req, res, next));
router.post('/contractors/invoices', rbac('CONTR', 'CREATE'), (req, res, next) => extendedController.createContractorInvoice(req, res, next));
router.patch('/contractors/invoices/:id/approve', rbac('CONTR', 'EDIT'), (req, res, next) => extendedController.approveContractorInvoice(req, res, next));
router.get('/contractors/compliance', (req, res, next) => extendedController.listContractorCompliance(req, res, next));

// M08 Onboarding
router.get('/onboarding', (req, res, next) => extendedController.listOnboarding(req, res, next));
router.patch('/onboarding/:id/complete', rbac('ONBOARD', 'EDIT'), (req, res, next) => extendedController.completeOnboarding(req, res, next));
router.get('/onboarding/templates', (req, res, next) => extendedController.listOnboardingTemplates(req, res, next));
router.post('/onboarding/templates', rbac('ONBOARD', 'CREATE'), (req, res, next) => extendedController.createOnboardingTemplate(req, res, next));
router.get('/onboarding/templates/:id/tasks', (req, res, next) => extendedController.listTemplateTasks(req, res, next));
router.post('/onboarding/templates/:id/tasks', rbac('ONBOARD', 'CREATE'), (req, res, next) => extendedController.addTemplateTask(req, res, next));
router.delete('/onboarding/tasks/:id', rbac('ONBOARD', 'DELETE'), (req, res, next) => extendedController.deleteTemplateTask(req, res, next));
router.get('/onboarding/my-tasks', (req, res, next) => extendedController.listMyOnboardingTasks(req, res, next));
router.patch('/onboarding/tasks/:id/complete', (req, res, next) => extendedController.completeOnboardingTask(req, res, next));
router.get('/onboarding/bgv', (req, res, next) => extendedController.listBGV(req, res, next));

export default router;
