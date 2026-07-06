"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const formbuilder_controller_js_1 = require("./formbuilder.controller.js");
const auth_js_1 = require("../../middleware/auth.js");
const rbac_js_1 = require("../../middleware/rbac.js");
const router = (0, express_1.Router)();
router.use(auth_js_1.authenticate);
// M09 Form Builder
router.get('/forms', (req, res, next) => formbuilder_controller_js_1.extendedController.listForms(req, res, next));
router.post('/forms', (0, rbac_js_1.rbac)('FORM', 'CREATE'), (req, res, next) => formbuilder_controller_js_1.extendedController.createForm(req, res, next));
router.get('/forms/:id', (req, res, next) => formbuilder_controller_js_1.extendedController.getForm(req, res, next));
router.put('/forms/:id', (0, rbac_js_1.rbac)('FORM', 'EDIT'), (req, res, next) => formbuilder_controller_js_1.extendedController.updateForm(req, res, next));
router.delete('/forms/:id', (0, rbac_js_1.rbac)('FORM', 'DELETE'), (req, res, next) => formbuilder_controller_js_1.extendedController.deleteForm(req, res, next));
router.post('/forms/:id/submit', (req, res, next) => formbuilder_controller_js_1.extendedController.submitFormResponse(req, res, next));
router.get('/forms/:id/submissions', (0, rbac_js_1.rbac)('FORM', 'VIEW'), (req, res, next) => formbuilder_controller_js_1.extendedController.listSubmissions(req, res, next));
// M10 Templates
router.get('/templates', (req, res, next) => formbuilder_controller_js_1.extendedController.listTemplates(req, res, next));
router.post('/templates', (0, rbac_js_1.rbac)('TEMPLATE', 'CREATE'), (req, res, next) => formbuilder_controller_js_1.extendedController.createTemplate(req, res, next));
router.get('/templates/:id', (req, res, next) => formbuilder_controller_js_1.extendedController.getTemplate(req, res, next));
router.put('/templates/:id', (0, rbac_js_1.rbac)('TEMPLATE', 'EDIT'), (req, res, next) => formbuilder_controller_js_1.extendedController.updateTemplate(req, res, next));
// M12 Biometric
router.get('/biometric/devices', (0, rbac_js_1.rbac)('BIO', 'VIEW'), (req, res, next) => formbuilder_controller_js_1.extendedController.listDevices(req, res, next));
router.post('/biometric/devices', (0, rbac_js_1.rbac)('BIO', 'CREATE'), (req, res, next) => formbuilder_controller_js_1.extendedController.registerDevice(req, res, next));
router.put('/biometric/devices/:id', (0, rbac_js_1.rbac)('BIO', 'EDIT'), (req, res, next) => formbuilder_controller_js_1.extendedController.updateDevice(req, res, next));
router.delete('/biometric/devices/:id', (0, rbac_js_1.rbac)('BIO', 'DELETE'), (req, res, next) => formbuilder_controller_js_1.extendedController.deleteDevice(req, res, next));
router.post('/biometric/devices/:id/sync', (0, rbac_js_1.rbac)('BIO', 'EDIT'), (req, res, next) => formbuilder_controller_js_1.extendedController.syncDevice(req, res, next));
router.get('/biometric/logs', (0, rbac_js_1.rbac)('BIO', 'VIEW'), (req, res, next) => formbuilder_controller_js_1.extendedController.listBioLogs(req, res, next));
router.get('/biometric/exceptions', (0, rbac_js_1.rbac)('BIO', 'VIEW'), (req, res, next) => formbuilder_controller_js_1.extendedController.listBioExceptions(req, res, next));
router.patch('/biometric/exceptions/:id/resolve', (0, rbac_js_1.rbac)('BIO', 'EDIT'), (req, res, next) => formbuilder_controller_js_1.extendedController.resolveBioException(req, res, next));
router.get('/biometric/sync-status', (0, rbac_js_1.rbac)('BIO', 'VIEW'), (req, res, next) => formbuilder_controller_js_1.extendedController.bioSyncStatus(req, res, next));
// M17 Statutory
router.get('/statutory/pf/:employeeId', (0, rbac_js_1.rbac)('STAT', 'VIEW'), (req, res, next) => formbuilder_controller_js_1.extendedController.calculatePF(req, res, next));
router.get('/statutory/esi/:employeeId', (0, rbac_js_1.rbac)('STAT', 'VIEW'), (req, res, next) => formbuilder_controller_js_1.extendedController.calculateESI(req, res, next));
router.get('/statutory/tds/:employeeId', (0, rbac_js_1.rbac)('STAT', 'VIEW'), (req, res, next) => formbuilder_controller_js_1.extendedController.calculateTDS(req, res, next));
// M18 Benefits
router.get('/benefits/policies', (req, res, next) => formbuilder_controller_js_1.extendedController.listPolicies(req, res, next));
router.post('/benefits/policies', (0, rbac_js_1.rbac)('BENEFITS', 'CREATE'), (req, res, next) => formbuilder_controller_js_1.extendedController.createPolicy(req, res, next));
router.get('/benefits/claims', (req, res, next) => formbuilder_controller_js_1.extendedController.listClaims(req, res, next));
router.post('/benefits/claims', (req, res, next) => formbuilder_controller_js_1.extendedController.submitClaim(req, res, next));
// M35-M37 Governance
router.get('/governance/feature-flags', (req, res, next) => formbuilder_controller_js_1.extendedController.featureFlags(req, res, next));
router.get('/governance/health', (req, res, next) => formbuilder_controller_js_1.extendedController.systemHealth(req, res, next));
router.get('/governance/scope', (req, res, next) => formbuilder_controller_js_1.extendedController.scopeStatus(req, res, next));
// M35 NFR
router.get('/governance/nfr/performance', (req, res, next) => formbuilder_controller_js_1.extendedController.nfrPerformance(req, res, next));
router.get('/governance/nfr/scalability', (req, res, next) => formbuilder_controller_js_1.extendedController.nfrScalability(req, res, next));
router.get('/governance/nfr/dr-status', (req, res, next) => formbuilder_controller_js_1.extendedController.nfrDRStatus(req, res, next));
router.get('/governance/nfr/compliance', (req, res, next) => formbuilder_controller_js_1.extendedController.nfrCompliance(req, res, next));
router.get('/governance/nfr/alerts', (req, res, next) => formbuilder_controller_js_1.extendedController.nfrAlerts(req, res, next));
// M34 Audit + Sessions
router.get('/governance/audit-logs', (req, res, next) => formbuilder_controller_js_1.extendedController.auditLogs(req, res, next));
router.get('/governance/sessions', (req, res, next) => formbuilder_controller_js_1.extendedController.loginSessions(req, res, next));
// M22 Assets
router.get('/assets', (req, res, next) => formbuilder_controller_js_1.extendedController.listAssets(req, res, next));
router.post('/assets', (0, rbac_js_1.rbac)('ASSET', 'CREATE'), (req, res, next) => formbuilder_controller_js_1.extendedController.createAsset(req, res, next));
router.delete('/assets/:id', (0, rbac_js_1.rbac)('ASSET', 'DELETE'), (req, res, next) => formbuilder_controller_js_1.extendedController.deleteAsset(req, res, next));
router.get('/assets/my', (req, res, next) => formbuilder_controller_js_1.extendedController.myAssets(req, res, next));
router.get('/assets/allocations', (req, res, next) => formbuilder_controller_js_1.extendedController.listAllocations(req, res, next));
router.post('/assets/allocations', (0, rbac_js_1.rbac)('ASSET', 'EDIT'), (req, res, next) => formbuilder_controller_js_1.extendedController.allocateAsset(req, res, next));
router.patch('/assets/allocations/:id/return', (0, rbac_js_1.rbac)('ASSET', 'EDIT'), (req, res, next) => formbuilder_controller_js_1.extendedController.returnAsset(req, res, next));
router.get('/assets/maintenance', (req, res, next) => formbuilder_controller_js_1.extendedController.listMaintenance(req, res, next));
router.post('/assets/maintenance', (0, rbac_js_1.rbac)('ASSET', 'EDIT'), (req, res, next) => formbuilder_controller_js_1.extendedController.createMaintenance(req, res, next));
router.patch('/assets/maintenance/:id/complete', (0, rbac_js_1.rbac)('ASSET', 'EDIT'), (req, res, next) => formbuilder_controller_js_1.extendedController.completeMaintenance(req, res, next));
// M24 Exit
router.get('/exit/requests', (req, res, next) => formbuilder_controller_js_1.extendedController.listExitRequests(req, res, next));
router.post('/exit/requests', (req, res, next) => formbuilder_controller_js_1.extendedController.createExitRequest(req, res, next));
router.patch('/exit/requests/:id/approve', (0, rbac_js_1.rbac)('EXIT', 'EDIT'), (req, res, next) => formbuilder_controller_js_1.extendedController.approveExitRequest(req, res, next));
router.patch('/exit/requests/:id/reject', (0, rbac_js_1.rbac)('EXIT', 'EDIT'), (req, res, next) => formbuilder_controller_js_1.extendedController.rejectExitRequest(req, res, next));
router.get('/exit/clearances', (req, res, next) => formbuilder_controller_js_1.extendedController.listClearances(req, res, next));
router.patch('/exit/clearances/:id/clear', (req, res, next) => formbuilder_controller_js_1.extendedController.clearDepartment(req, res, next));
router.get('/exit/fnf', (req, res, next) => formbuilder_controller_js_1.extendedController.listFnF(req, res, next));
router.patch('/exit/fnf/:id/process', (0, rbac_js_1.rbac)('EXIT', 'EDIT'), (req, res, next) => formbuilder_controller_js_1.extendedController.processFnF(req, res, next));
router.get('/exit/interviews', (req, res, next) => formbuilder_controller_js_1.extendedController.listExitInterviews(req, res, next));
router.post('/exit/interviews', (req, res, next) => formbuilder_controller_js_1.extendedController.createExitInterview(req, res, next));
// M26 Grievance
router.get('/grievances', (req, res, next) => formbuilder_controller_js_1.extendedController.listGrievances(req, res, next));
router.post('/grievances', (req, res, next) => formbuilder_controller_js_1.extendedController.createGrievance(req, res, next));
router.get('/grievances/sla', (0, rbac_js_1.rbac)('GRV', 'VIEW'), (req, res, next) => formbuilder_controller_js_1.extendedController.grievanceSLA(req, res, next));
router.get('/grievances/:id', (req, res, next) => formbuilder_controller_js_1.extendedController.getGrievance(req, res, next));
router.patch('/grievances/:id', (0, rbac_js_1.rbac)('GRV', 'EDIT'), (req, res, next) => formbuilder_controller_js_1.extendedController.updateGrievance(req, res, next));
// M27 Disciplinary
router.get('/disciplinary', (0, rbac_js_1.rbac)('DISC', 'VIEW'), (req, res, next) => formbuilder_controller_js_1.extendedController.listDisciplinaryCases(req, res, next));
router.post('/disciplinary', (0, rbac_js_1.rbac)('DISC', 'CREATE'), (req, res, next) => formbuilder_controller_js_1.extendedController.createDisciplinaryCase(req, res, next));
router.get('/disciplinary/summary', (0, rbac_js_1.rbac)('DISC', 'VIEW'), (req, res, next) => formbuilder_controller_js_1.extendedController.disciplinarySummary(req, res, next));
router.get('/disciplinary/:id', (0, rbac_js_1.rbac)('DISC', 'VIEW'), (req, res, next) => formbuilder_controller_js_1.extendedController.getDisciplinaryCase(req, res, next));
router.patch('/disciplinary/:id', (0, rbac_js_1.rbac)('DISC', 'EDIT'), (req, res, next) => formbuilder_controller_js_1.extendedController.updateDisciplinaryCase(req, res, next));
router.post('/disciplinary/:id/show-cause', (0, rbac_js_1.rbac)('DISC', 'EDIT'), (req, res, next) => formbuilder_controller_js_1.extendedController.issueShowCause(req, res, next));
router.post('/disciplinary/:id/hearing', (0, rbac_js_1.rbac)('DISC', 'EDIT'), (req, res, next) => formbuilder_controller_js_1.extendedController.scheduleHearing(req, res, next));
router.post('/disciplinary/:id/action', (0, rbac_js_1.rbac)('DISC', 'EDIT'), (req, res, next) => formbuilder_controller_js_1.extendedController.recordDisciplinaryAction(req, res, next));
// M25 Analytics
router.get('/analytics/headcount', (req, res, next) => formbuilder_controller_js_1.extendedController.analyticsHeadcount(req, res, next));
router.get('/analytics/attrition', (req, res, next) => formbuilder_controller_js_1.extendedController.analyticsAttrition(req, res, next));
router.get('/analytics/payroll', (req, res, next) => formbuilder_controller_js_1.extendedController.analyticsPayroll(req, res, next));
router.get('/analytics/attendance', (req, res, next) => formbuilder_controller_js_1.extendedController.analyticsAttendance(req, res, next));
router.get('/analytics/reports/:type', (req, res, next) => formbuilder_controller_js_1.extendedController.generateReport(req, res, next));
router.get('/statutory/pf/summary', (req, res, next) => formbuilder_controller_js_1.extendedController.statutoryPFSummary(req, res, next));
router.get('/statutory/esi/summary', (req, res, next) => formbuilder_controller_js_1.extendedController.statutoryESISummary(req, res, next));
router.get('/statutory/tds/summary', (req, res, next) => formbuilder_controller_js_1.extendedController.statutoryTDSSummary(req, res, next));
// M03 Contractors
router.get('/contractors', (req, res, next) => formbuilder_controller_js_1.extendedController.listContractors(req, res, next));
router.post('/contractors', (0, rbac_js_1.rbac)('CONTR', 'CREATE'), (req, res, next) => formbuilder_controller_js_1.extendedController.createContractor(req, res, next));
router.put('/contractors/:id', (0, rbac_js_1.rbac)('CONTR', 'EDIT'), (req, res, next) => formbuilder_controller_js_1.extendedController.updateContractor(req, res, next));
router.delete('/contractors/:id', (0, rbac_js_1.rbac)('CONTR', 'DELETE'), (req, res, next) => formbuilder_controller_js_1.extendedController.deleteContractor(req, res, next));
router.get('/contractors/workers', (req, res, next) => formbuilder_controller_js_1.extendedController.listContractorWorkers(req, res, next));
router.post('/contractors/workers', (0, rbac_js_1.rbac)('CONTR', 'CREATE'), (req, res, next) => formbuilder_controller_js_1.extendedController.createContractorWorker(req, res, next));
router.get('/contractors/attendance', (req, res, next) => formbuilder_controller_js_1.extendedController.contractorAttendance(req, res, next));
router.get('/contractors/invoices', (req, res, next) => formbuilder_controller_js_1.extendedController.listContractorInvoices(req, res, next));
router.post('/contractors/invoices', (0, rbac_js_1.rbac)('CONTR', 'CREATE'), (req, res, next) => formbuilder_controller_js_1.extendedController.createContractorInvoice(req, res, next));
router.patch('/contractors/invoices/:id/approve', (0, rbac_js_1.rbac)('CONTR', 'EDIT'), (req, res, next) => formbuilder_controller_js_1.extendedController.approveContractorInvoice(req, res, next));
router.get('/contractors/compliance', (req, res, next) => formbuilder_controller_js_1.extendedController.listContractorCompliance(req, res, next));
// M08 Onboarding
router.get('/onboarding', (req, res, next) => formbuilder_controller_js_1.extendedController.listOnboarding(req, res, next));
router.patch('/onboarding/:id/complete', (0, rbac_js_1.rbac)('ONBOARD', 'EDIT'), (req, res, next) => formbuilder_controller_js_1.extendedController.completeOnboarding(req, res, next));
router.get('/onboarding/templates', (req, res, next) => formbuilder_controller_js_1.extendedController.listOnboardingTemplates(req, res, next));
router.post('/onboarding/templates', (0, rbac_js_1.rbac)('ONBOARD', 'CREATE'), (req, res, next) => formbuilder_controller_js_1.extendedController.createOnboardingTemplate(req, res, next));
router.get('/onboarding/templates/:id/tasks', (req, res, next) => formbuilder_controller_js_1.extendedController.listTemplateTasks(req, res, next));
router.post('/onboarding/templates/:id/tasks', (0, rbac_js_1.rbac)('ONBOARD', 'CREATE'), (req, res, next) => formbuilder_controller_js_1.extendedController.addTemplateTask(req, res, next));
router.delete('/onboarding/tasks/:id', (0, rbac_js_1.rbac)('ONBOARD', 'DELETE'), (req, res, next) => formbuilder_controller_js_1.extendedController.deleteTemplateTask(req, res, next));
router.get('/onboarding/my-tasks', (req, res, next) => formbuilder_controller_js_1.extendedController.listMyOnboardingTasks(req, res, next));
router.patch('/onboarding/tasks/:id/complete', (req, res, next) => formbuilder_controller_js_1.extendedController.completeOnboardingTask(req, res, next));
router.get('/onboarding/bgv', (req, res, next) => formbuilder_controller_js_1.extendedController.listBGV(req, res, next));
exports.default = router;
//# sourceMappingURL=formbuilder.routes.js.map