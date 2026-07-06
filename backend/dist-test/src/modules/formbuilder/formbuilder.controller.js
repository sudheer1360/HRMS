"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extendedController = exports.ExtendedController = void 0;
const formbuilder_service_js_1 = require("./formbuilder.service.js");
const formbuilder_schema_js_1 = require("./formbuilder.schema.js");
class ExtendedController {
    // M09 Form Builder
    async createForm(req, res, next) { try {
        const i = formbuilder_schema_js_1.createFormSchema.parse(req.body);
        const r = await formbuilder_service_js_1.formBuilderService.createForm(req.tenantId, i);
        res.status(201).json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async listForms(req, res, next) { try {
        const r = await formbuilder_service_js_1.formBuilderService.listForms(req.tenantId, req.query);
        res.json({ success: true, ...r });
    }
    catch (e) {
        next(e);
    } }
    async getForm(req, res, next) { try {
        const r = await formbuilder_service_js_1.formBuilderService.getForm(req.params.id, req.tenantId);
        res.json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async updateForm(req, res, next) { try {
        const r = await formbuilder_service_js_1.formBuilderService.updateForm(req.params.id, req.tenantId, req.body);
        res.json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async deleteForm(req, res, next) { try {
        const r = await formbuilder_service_js_1.formBuilderService.deleteForm(req.params.id, req.tenantId);
        res.json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async submitFormResponse(req, res, next) { try {
        const r = await formbuilder_service_js_1.formBuilderService.submitResponse(req.tenantId, req.params.id, { ...req.body, submittedBy: req.user.userId });
        res.status(201).json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async listSubmissions(req, res, next) { try {
        const r = await formbuilder_service_js_1.formBuilderService.listSubmissions(req.tenantId, req.params.id);
        res.json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    // M10 Templates
    async createTemplate(req, res, next) { try {
        const r = await formbuilder_service_js_1.templateService.createTemplate(req.tenantId, req.body);
        res.status(201).json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async listTemplates(req, res, next) { try {
        const r = await formbuilder_service_js_1.templateService.listTemplates(req.tenantId, req.query.type);
        res.json({ success: true, ...r });
    }
    catch (e) {
        next(e);
    } }
    async getTemplate(req, res, next) { try {
        const r = await formbuilder_service_js_1.formBuilderService.getForm(req.params.id, req.tenantId);
        res.json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async updateTemplate(req, res, next) { try {
        const r = await formbuilder_service_js_1.formBuilderService.updateForm(req.params.id, req.tenantId, req.body);
        res.json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    // M12 Biometric
    async registerDevice(req, res, next) { try {
        const r = await formbuilder_service_js_1.biometricService.registerDevice(req.tenantId, req.body);
        res.status(201).json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async listDevices(req, res, next) { try {
        const r = await formbuilder_service_js_1.biometricService.listDevices(req.tenantId);
        res.json({ success: true, ...r });
    }
    catch (e) {
        next(e);
    } }
    async updateDevice(req, res, next) { try {
        const r = await formbuilder_service_js_1.biometricService.updateDevice(req.params.id, req.tenantId, req.body);
        res.json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async deleteDevice(req, res, next) { try {
        const r = await formbuilder_service_js_1.biometricService.deleteDevice(req.params.id, req.tenantId);
        res.json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async syncDevice(req, res, next) { try {
        const r = await formbuilder_service_js_1.biometricService.syncDevice(req.params.id, req.tenantId);
        res.json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async listBioLogs(req, res, next) { try {
        const r = await formbuilder_service_js_1.biometricService.listLogs(req.tenantId, { from: req.query.from, to: req.query.to, deviceId: req.query.deviceId, limit: Number(req.query.limit ?? 50), page: Number(req.query.page ?? 1) });
        res.json({ success: true, ...r });
    }
    catch (e) {
        next(e);
    } }
    async listBioExceptions(req, res, next) { try {
        const resolved = req.query.resolved === 'true' ? true : req.query.resolved === 'false' ? false : undefined;
        const r = await formbuilder_service_js_1.biometricService.listExceptions(req.tenantId, { resolved, limit: Number(req.query.limit ?? 50) });
        res.json({ success: true, ...r });
    }
    catch (e) {
        next(e);
    } }
    async resolveBioException(req, res, next) { try {
        const r = await formbuilder_service_js_1.biometricService.resolveException(req.params.id, req.tenantId, req.body.resolution ?? 'Resolved');
        res.json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async bioSyncStatus(req, res, next) { try {
        const r = await formbuilder_service_js_1.biometricService.getSyncStatus(req.tenantId);
        res.json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    // M17 Statutory
    async calculatePF(req, res, next) { try {
        const r = await formbuilder_service_js_1.statutoryService.calculatePF(req.tenantId, req.params.employeeId);
        res.json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async calculateESI(req, res, next) { try {
        const r = await formbuilder_service_js_1.statutoryService.calculateESI(req.tenantId, req.params.employeeId);
        res.json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async calculateTDS(req, res, next) { try {
        const r = await formbuilder_service_js_1.statutoryService.calculateTDS(req.tenantId, req.params.employeeId);
        res.json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    // M18 Benefits
    async createPolicy(req, res, next) { try {
        const r = await formbuilder_service_js_1.benefitsService.createPolicy(req.tenantId, req.body);
        res.status(201).json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async listPolicies(req, res, next) { try {
        const r = await formbuilder_service_js_1.benefitsService.listPolicies(req.tenantId);
        res.json({ success: true, ...r });
    }
    catch (e) {
        next(e);
    } }
    async listClaims(req, res, next) { try {
        const r = await formbuilder_service_js_1.benefitsService.listClaims(req.tenantId, req.query);
        res.json({ success: true, ...r });
    }
    catch (e) {
        next(e);
    } }
    async submitClaim(req, res, next) { try {
        const r = await formbuilder_service_js_1.benefitsService.submitClaim(req.tenantId, req.user.userId, req.body);
        res.status(201).json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    // M35-M37 Governance
    async featureFlags(req, res, next) { try {
        const r = await formbuilder_service_js_1.governanceService.getFeatureFlags(req.tenantId);
        res.json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async systemHealth(req, res, next) { try {
        const r = await formbuilder_service_js_1.governanceService.getSystemHealth(req.tenantId);
        res.json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async scopeStatus(req, res, next) { try {
        const r = await formbuilder_service_js_1.governanceService.getScopeStatus(req.tenantId);
        res.json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    // M35 NFR
    async nfrPerformance(req, res, next) { try {
        const r = await formbuilder_service_js_1.governanceService.getNFRPerformance(req.tenantId);
        res.json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async nfrScalability(req, res, next) { try {
        const r = await formbuilder_service_js_1.governanceService.getNFRScalability(req.tenantId);
        res.json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async nfrDRStatus(req, res, next) { try {
        const r = await formbuilder_service_js_1.governanceService.getNFRDRStatus(req.tenantId);
        res.json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async nfrCompliance(req, res, next) { try {
        const r = await formbuilder_service_js_1.governanceService.getNFRCompliance(req.tenantId);
        res.json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async nfrAlerts(req, res, next) { try {
        const r = await formbuilder_service_js_1.governanceService.getNFRAlerts(req.tenantId);
        res.json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    // M34 Audit + Sessions
    async auditLogs(req, res, next) { try {
        const r = await formbuilder_service_js_1.governanceService.getAuditLogs(req.tenantId, { page: Number(req.query.page ?? 1), limit: Number(req.query.limit ?? 25), entity: req.query.entity });
        res.json({ success: true, ...r });
    }
    catch (e) {
        next(e);
    } }
    async loginSessions(req, res, next) { try {
        const r = await formbuilder_service_js_1.governanceService.getLoginSessions(req.tenantId);
        res.json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    // M03 Contractors
    async listContractors(req, res, next) { try {
        const r = await formbuilder_service_js_1.contractorService.list(req.tenantId, { limit: Number(req.query.limit ?? 50) });
        res.json({ success: true, ...r });
    }
    catch (e) {
        next(e);
    } }
    async createContractor(req, res, next) { try {
        const r = await formbuilder_service_js_1.contractorService.create(req.tenantId, req.body);
        res.status(201).json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async updateContractor(req, res, next) { try {
        const r = await formbuilder_service_js_1.contractorService.update(req.params.id, req.tenantId, req.body);
        res.json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async deleteContractor(req, res, next) { try {
        const r = await formbuilder_service_js_1.contractorService.delete(req.params.id, req.tenantId);
        res.json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async listContractorWorkers(req, res, next) { try {
        const r = await formbuilder_service_js_1.contractorService.listWorkers(req.tenantId, { limit: Number(req.query.limit ?? 100) });
        res.json({ success: true, ...r });
    }
    catch (e) {
        next(e);
    } }
    async createContractorWorker(req, res, next) { try {
        const r = await formbuilder_service_js_1.contractorService.createWorker(req.tenantId, req.body);
        res.status(201).json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async contractorAttendance(req, res, next) { try {
        const r = await formbuilder_service_js_1.contractorService.listAttendance(req.tenantId, { date: req.query.date, limit: Number(req.query.limit ?? 100) });
        res.json({ success: true, ...r });
    }
    catch (e) {
        next(e);
    } }
    async listContractorInvoices(req, res, next) { try {
        const r = await formbuilder_service_js_1.contractorService.listInvoices(req.tenantId, { limit: Number(req.query.limit ?? 50) });
        res.json({ success: true, ...r });
    }
    catch (e) {
        next(e);
    } }
    async createContractorInvoice(req, res, next) { try {
        const r = await formbuilder_service_js_1.contractorService.createInvoice(req.tenantId, req.body);
        res.status(201).json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async approveContractorInvoice(req, res, next) { try {
        const r = await formbuilder_service_js_1.contractorService.approveInvoice(req.params.id, req.tenantId);
        res.json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async listContractorCompliance(req, res, next) { try {
        const r = await formbuilder_service_js_1.contractorService.listCompliance(req.tenantId, { limit: Number(req.query.limit ?? 100) });
        res.json({ success: true, ...r });
    }
    catch (e) {
        next(e);
    } }
    // M08 Onboarding
    async listOnboarding(req, res, next) { try {
        const r = await formbuilder_service_js_1.onboardingService.listOnboarding(req.tenantId, { status: req.query.status, limit: Number(req.query.limit ?? 30) });
        res.json({ success: true, ...r });
    }
    catch (e) {
        next(e);
    } }
    async completeOnboarding(req, res, next) { try {
        const r = await formbuilder_service_js_1.onboardingService.completeOnboarding(req.params.id, req.tenantId);
        res.json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async listOnboardingTemplates(req, res, next) { try {
        const r = await formbuilder_service_js_1.onboardingService.listTemplates(req.tenantId, { limit: Number(req.query.limit ?? 30) });
        res.json({ success: true, ...r });
    }
    catch (e) {
        next(e);
    } }
    async createOnboardingTemplate(req, res, next) { try {
        const r = await formbuilder_service_js_1.onboardingService.createTemplate(req.tenantId, req.body);
        res.status(201).json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async listTemplateTasks(req, res, next) { try {
        const r = await formbuilder_service_js_1.onboardingService.listTemplateTasks(req.params.id, req.tenantId);
        res.json({ success: true, ...r });
    }
    catch (e) {
        next(e);
    } }
    async addTemplateTask(req, res, next) { try {
        const r = await formbuilder_service_js_1.onboardingService.addTemplateTask(req.params.id, req.tenantId, req.body);
        res.status(201).json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async deleteTemplateTask(req, res, next) { try {
        const r = await formbuilder_service_js_1.onboardingService.deleteTemplateTask(req.params.id, req.tenantId);
        res.json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async listMyOnboardingTasks(req, res, next) { try {
        const r = await formbuilder_service_js_1.onboardingService.listMyTasks(req.tenantId, req.user.userId);
        res.json({ success: true, ...r });
    }
    catch (e) {
        next(e);
    } }
    async completeOnboardingTask(req, res, next) { try {
        const r = await formbuilder_service_js_1.onboardingService.completeTask(req.params.id, req.tenantId);
        res.json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async listBGV(req, res, next) { try {
        const r = await formbuilder_service_js_1.onboardingService.listBGV(req.tenantId, { limit: Number(req.query.limit ?? 30) });
        res.json({ success: true, ...r });
    }
    catch (e) {
        next(e);
    } }
    // M22 Assets
    async listAssets(req, res, next) { try {
        const r = await formbuilder_service_js_1.assetService.listAssets(req.tenantId, req.query);
        res.json({ success: true, ...r });
    }
    catch (e) {
        next(e);
    } }
    async createAsset(req, res, next) { try {
        const r = await formbuilder_service_js_1.assetService.createAsset(req.tenantId, req.body);
        res.status(201).json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async deleteAsset(req, res, next) { try {
        const r = await formbuilder_service_js_1.assetService.deleteAsset(req.params.id, req.tenantId);
        res.json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async myAssets(req, res, next) { try {
        const r = await formbuilder_service_js_1.assetService.myAssets(req.tenantId, req.user.userId);
        res.json({ success: true, ...r });
    }
    catch (e) {
        next(e);
    } }
    async listAllocations(req, res, next) { try {
        const r = await formbuilder_service_js_1.assetService.listAllocations(req.tenantId, req.query);
        res.json({ success: true, ...r });
    }
    catch (e) {
        next(e);
    } }
    async allocateAsset(req, res, next) { try {
        const r = await formbuilder_service_js_1.assetService.allocateAsset(req.tenantId, req.body);
        res.status(201).json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async returnAsset(req, res, next) { try {
        const r = await formbuilder_service_js_1.assetService.returnAsset(req.params.id, req.tenantId);
        res.json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async listMaintenance(req, res, next) { try {
        const r = await formbuilder_service_js_1.assetService.listMaintenance(req.tenantId, req.query);
        res.json({ success: true, ...r });
    }
    catch (e) {
        next(e);
    } }
    async createMaintenance(req, res, next) { try {
        const r = await formbuilder_service_js_1.assetService.createMaintenance(req.tenantId, req.body);
        res.status(201).json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async completeMaintenance(req, res, next) { try {
        const r = await formbuilder_service_js_1.assetService.completeMaintenance(req.params.id, req.tenantId);
        res.json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    // M24 Exit
    async listExitRequests(req, res, next) { try {
        const r = await formbuilder_service_js_1.exitService.listExitRequests(req.tenantId, req.query);
        res.json({ success: true, ...r });
    }
    catch (e) {
        next(e);
    } }
    async createExitRequest(req, res, next) { try {
        const r = await formbuilder_service_js_1.exitService.createExitRequest(req.tenantId, req.body);
        res.status(201).json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async approveExitRequest(req, res, next) { try {
        const r = await formbuilder_service_js_1.exitService.approveExitRequest(req.params.id, req.tenantId);
        res.json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async rejectExitRequest(req, res, next) { try {
        const r = await formbuilder_service_js_1.exitService.rejectExitRequest(req.params.id, req.tenantId, req.body);
        res.json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async listClearances(req, res, next) { try {
        const r = await formbuilder_service_js_1.exitService.listClearances(req.tenantId, req.query);
        res.json({ success: true, ...r });
    }
    catch (e) {
        next(e);
    } }
    async clearDepartment(req, res, next) { try {
        const r = await formbuilder_service_js_1.exitService.clearDepartment(req.params.id, req.tenantId);
        res.json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async listFnF(req, res, next) { try {
        const r = await formbuilder_service_js_1.exitService.listFnF(req.tenantId, req.query);
        res.json({ success: true, ...r });
    }
    catch (e) {
        next(e);
    } }
    async processFnF(req, res, next) { try {
        const r = await formbuilder_service_js_1.exitService.processFnF(req.params.id, req.tenantId);
        res.json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async listExitInterviews(req, res, next) { try {
        const r = await formbuilder_service_js_1.exitService.listExitInterviews(req.tenantId, req.query);
        res.json({ success: true, ...r });
    }
    catch (e) {
        next(e);
    } }
    async createExitInterview(req, res, next) { try {
        const r = await formbuilder_service_js_1.exitService.createExitInterview(req.tenantId, req.body);
        res.status(201).json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    // M26 Grievance
    async listGrievances(req, res, next) { try {
        const r = await formbuilder_service_js_1.grievanceService.listGrievances(req.tenantId, req.query);
        res.json({ success: true, ...r });
    }
    catch (e) {
        next(e);
    } }
    async getGrievance(req, res, next) { try {
        const r = await formbuilder_service_js_1.grievanceService.getGrievance(req.params.id, req.tenantId);
        res.json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async createGrievance(req, res, next) { try {
        const r = await formbuilder_service_js_1.grievanceService.createGrievance(req.tenantId, req.user.userId, req.body);
        res.status(201).json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async updateGrievance(req, res, next) { try {
        const r = await formbuilder_service_js_1.grievanceService.updateGrievance(req.params.id, req.tenantId, req.body);
        res.json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async grievanceSLA(req, res, next) { try {
        const r = await formbuilder_service_js_1.grievanceService.slaStatus(req.tenantId);
        res.json({ success: true, ...r });
    }
    catch (e) {
        next(e);
    } }
    // M27 Disciplinary
    async listDisciplinaryCases(req, res, next) { try {
        const r = await formbuilder_service_js_1.disciplinaryService.listCases(req.tenantId, req.query);
        res.json({ success: true, ...r });
    }
    catch (e) {
        next(e);
    } }
    async getDisciplinaryCase(req, res, next) { try {
        const r = await formbuilder_service_js_1.disciplinaryService.getCase(req.params.id, req.tenantId);
        res.json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async createDisciplinaryCase(req, res, next) { try {
        const r = await formbuilder_service_js_1.disciplinaryService.createCase(req.tenantId, req.user.userId, req.body);
        res.status(201).json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async updateDisciplinaryCase(req, res, next) { try {
        const r = await formbuilder_service_js_1.disciplinaryService.updateCase(req.params.id, req.tenantId, req.body);
        res.json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async issueShowCause(req, res, next) { try {
        const r = await formbuilder_service_js_1.disciplinaryService.issuShowCause(req.params.id, req.tenantId, req.body);
        res.json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async scheduleHearing(req, res, next) { try {
        const r = await formbuilder_service_js_1.disciplinaryService.scheduleHearing(req.params.id, req.tenantId, req.body);
        res.json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async recordDisciplinaryAction(req, res, next) { try {
        const r = await formbuilder_service_js_1.disciplinaryService.recordAction(req.params.id, req.tenantId, req.body);
        res.json({ success: true, data: r });
    }
    catch (e) {
        next(e);
    } }
    async disciplinarySummary(req, res, next) { try {
        const r = await formbuilder_service_js_1.disciplinaryService.summary(req.tenantId);
        res.json({ success: true, ...r });
    }
    catch (e) {
        next(e);
    } }
    // M25 Analytics
    async analyticsHeadcount(req, res, next) { try {
        const r = await formbuilder_service_js_1.analyticsService.headcount(req.tenantId, req.query);
        res.json({ success: true, ...r });
    }
    catch (e) {
        next(e);
    } }
    async analyticsAttrition(req, res, next) { try {
        const r = await formbuilder_service_js_1.analyticsService.attrition(req.tenantId, req.query);
        res.json({ success: true, ...r });
    }
    catch (e) {
        next(e);
    } }
    async analyticsPayroll(req, res, next) { try {
        const r = await formbuilder_service_js_1.analyticsService.payrollSummary(req.tenantId, req.query);
        res.json({ success: true, ...r });
    }
    catch (e) {
        next(e);
    } }
    async analyticsAttendance(req, res, next) { try {
        const r = await formbuilder_service_js_1.analyticsService.attendanceSummary(req.tenantId, req.query);
        res.json({ success: true, ...r });
    }
    catch (e) {
        next(e);
    } }
    async generateReport(req, res, next) { try {
        const r = await formbuilder_service_js_1.analyticsService.generateReport(req.tenantId, req.params.type, req.query);
        res.json({ success: true, ...r });
    }
    catch (e) {
        next(e);
    } }
    async statutoryPFSummary(req, res, next) { try {
        const r = await formbuilder_service_js_1.analyticsService.statutoryPFSummary(req.tenantId);
        res.json({ success: true, ...r });
    }
    catch (e) {
        next(e);
    } }
    async statutoryESISummary(req, res, next) { try {
        const r = await formbuilder_service_js_1.analyticsService.statutoryESISummary(req.tenantId);
        res.json({ success: true, ...r });
    }
    catch (e) {
        next(e);
    } }
    async statutoryTDSSummary(req, res, next) { try {
        const r = await formbuilder_service_js_1.analyticsService.statutoryTDSSummary(req.tenantId);
        res.json({ success: true, ...r });
    }
    catch (e) {
        next(e);
    } }
}
exports.ExtendedController = ExtendedController;
exports.extendedController = new ExtendedController();
//# sourceMappingURL=formbuilder.controller.js.map