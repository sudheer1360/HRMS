import { Response, NextFunction } from 'express';
import { formBuilderService, templateService, biometricService, statutoryService, benefitsService, governanceService, onboardingService, contractorService, assetService, exitService, analyticsService, grievanceService, disciplinaryService } from './formbuilder.service.js';
import { createFormSchema, submitResponseSchema } from './formbuilder.schema.js';
import { AuthenticatedRequest } from '../../common/types/index.js';

export class ExtendedController {
  // M09 Form Builder
  async createForm(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const i = createFormSchema.parse(req.body); const r = await formBuilderService.createForm(req.tenantId!, i); res.status(201).json({ success: true, data: r }); } catch (e) { next(e); } }
  async listForms(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await formBuilderService.listForms(req.tenantId!, req.query); res.json({ success: true, ...r }); } catch (e) { next(e); } }
  async getForm(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await formBuilderService.getForm(req.params.id, req.tenantId!); res.json({ success: true, data: r }); } catch (e) { next(e); } }
  async updateForm(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await formBuilderService.updateForm(req.params.id, req.tenantId!, req.body); res.json({ success: true, data: r }); } catch (e) { next(e); } }
  async deleteForm(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await formBuilderService.deleteForm(req.params.id, req.tenantId!); res.json({ success: true, data: r }); } catch (e) { next(e); } }
  async submitFormResponse(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await formBuilderService.submitResponse(req.tenantId!, req.params.id, { ...req.body, submittedBy: req.user!.userId }); res.status(201).json({ success: true, data: r }); } catch (e) { next(e); } }
  async listSubmissions(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await formBuilderService.listSubmissions(req.tenantId!, req.params.id); res.json({ success: true, data: r }); } catch (e) { next(e); } }

  // M10 Templates
  async createTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await templateService.createTemplate(req.tenantId!, req.body); res.status(201).json({ success: true, data: r }); } catch (e) { next(e); } }
  async listTemplates(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await templateService.listTemplates(req.tenantId!, req.query.type as string); res.json({ success: true, ...r }); } catch (e) { next(e); } }
  async getTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await formBuilderService.getForm(req.params.id, req.tenantId!); res.json({ success: true, data: r }); } catch (e) { next(e); } }
  async updateTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await formBuilderService.updateForm(req.params.id, req.tenantId!, req.body); res.json({ success: true, data: r }); } catch (e) { next(e); } }

  // M12 Biometric
  async registerDevice(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await biometricService.registerDevice(req.tenantId!, req.body); res.status(201).json({ success: true, data: r }); } catch (e) { next(e); } }
  async listDevices(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await biometricService.listDevices(req.tenantId!); res.json({ success: true, ...r }); } catch (e) { next(e); } }
  async updateDevice(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await biometricService.updateDevice(req.params.id, req.tenantId!, req.body); res.json({ success: true, data: r }); } catch (e) { next(e); } }
  async deleteDevice(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await biometricService.deleteDevice(req.params.id, req.tenantId!); res.json({ success: true, data: r }); } catch (e) { next(e); } }
  async syncDevice(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await biometricService.syncDevice(req.params.id, req.tenantId!); res.json({ success: true, data: r }); } catch (e) { next(e); } }
  async listBioLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await biometricService.listLogs(req.tenantId!, { from: req.query.from as string, to: req.query.to as string, deviceId: req.query.deviceId as string, limit: Number(req.query.limit ?? 50), page: Number(req.query.page ?? 1) }); res.json({ success: true, ...r }); } catch (e) { next(e); } }
  async listBioExceptions(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const resolved = req.query.resolved === 'true' ? true : req.query.resolved === 'false' ? false : undefined; const r = await biometricService.listExceptions(req.tenantId!, { resolved, limit: Number(req.query.limit ?? 50) }); res.json({ success: true, ...r }); } catch (e) { next(e); } }
  async resolveBioException(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await biometricService.resolveException(req.params.id, req.tenantId!, req.body.resolution ?? 'Resolved'); res.json({ success: true, data: r }); } catch (e) { next(e); } }
  async bioSyncStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await biometricService.getSyncStatus(req.tenantId!); res.json({ success: true, data: r }); } catch (e) { next(e); } }

  // M17 Statutory
  async calculatePF(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await statutoryService.calculatePF(req.tenantId!, req.params.employeeId); res.json({ success: true, data: r }); } catch (e) { next(e); } }
  async calculateESI(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await statutoryService.calculateESI(req.tenantId!, req.params.employeeId); res.json({ success: true, data: r }); } catch (e) { next(e); } }
  async calculateTDS(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await statutoryService.calculateTDS(req.tenantId!, req.params.employeeId); res.json({ success: true, data: r }); } catch (e) { next(e); } }

  // M18 Benefits
  async createPolicy(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await benefitsService.createPolicy(req.tenantId!, req.body); res.status(201).json({ success: true, data: r }); } catch (e) { next(e); } }
  async listPolicies(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await benefitsService.listPolicies(req.tenantId!); res.json({ success: true, ...r }); } catch (e) { next(e); } }
  async listClaims(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await benefitsService.listClaims(req.tenantId!, req.query); res.json({ success: true, ...r }); } catch (e) { next(e); } }
  async submitClaim(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await benefitsService.submitClaim(req.tenantId!, req.user!.userId, req.body); res.status(201).json({ success: true, data: r }); } catch (e) { next(e); } }

  // M35-M37 Governance
  async featureFlags(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await governanceService.getFeatureFlags(req.tenantId!); res.json({ success: true, data: r }); } catch (e) { next(e); } }
  async systemHealth(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await governanceService.getSystemHealth(req.tenantId!); res.json({ success: true, data: r }); } catch (e) { next(e); } }
  async scopeStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await governanceService.getScopeStatus(req.tenantId!); res.json({ success: true, data: r }); } catch (e) { next(e); } }

  // M35 NFR
  async nfrPerformance(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await governanceService.getNFRPerformance(req.tenantId!); res.json({ success: true, data: r }); } catch (e) { next(e); } }
  async nfrScalability(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await governanceService.getNFRScalability(req.tenantId!); res.json({ success: true, data: r }); } catch (e) { next(e); } }
  async nfrDRStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await governanceService.getNFRDRStatus(req.tenantId!); res.json({ success: true, data: r }); } catch (e) { next(e); } }
  async nfrCompliance(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await governanceService.getNFRCompliance(req.tenantId!); res.json({ success: true, data: r }); } catch (e) { next(e); } }
  async nfrAlerts(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await governanceService.getNFRAlerts(req.tenantId!); res.json({ success: true, data: r }); } catch (e) { next(e); } }

  // M34 Audit + Sessions
  async auditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await governanceService.getAuditLogs(req.tenantId!, { page: Number(req.query.page ?? 1), limit: Number(req.query.limit ?? 25), entity: req.query.entity as string }); res.json({ success: true, ...r }); } catch (e) { next(e); } }
  async loginSessions(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await governanceService.getLoginSessions(req.tenantId!); res.json({ success: true, data: r }); } catch (e) { next(e); } }

  // M03 Contractors
  async listContractors(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await contractorService.list(req.tenantId!, { limit: Number(req.query.limit ?? 50) }); res.json({ success: true, ...r }); } catch (e) { next(e); } }
  async createContractor(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await contractorService.create(req.tenantId!, req.body); res.status(201).json({ success: true, data: r }); } catch (e) { next(e); } }
  async updateContractor(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await contractorService.update(req.params.id, req.tenantId!, req.body); res.json({ success: true, data: r }); } catch (e) { next(e); } }
  async deleteContractor(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await contractorService.delete(req.params.id, req.tenantId!); res.json({ success: true, data: r }); } catch (e) { next(e); } }
  async listContractorWorkers(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await contractorService.listWorkers(req.tenantId!, { limit: Number(req.query.limit ?? 100) }); res.json({ success: true, ...r }); } catch (e) { next(e); } }
  async createContractorWorker(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await contractorService.createWorker(req.tenantId!, req.body); res.status(201).json({ success: true, data: r }); } catch (e) { next(e); } }
  async contractorAttendance(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await contractorService.listAttendance(req.tenantId!, { date: req.query.date as string, limit: Number(req.query.limit ?? 100) }); res.json({ success: true, ...r }); } catch (e) { next(e); } }
  async listContractorInvoices(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await contractorService.listInvoices(req.tenantId!, { limit: Number(req.query.limit ?? 50) }); res.json({ success: true, ...r }); } catch (e) { next(e); } }
  async createContractorInvoice(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await contractorService.createInvoice(req.tenantId!, req.body); res.status(201).json({ success: true, data: r }); } catch (e) { next(e); } }
  async approveContractorInvoice(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await contractorService.approveInvoice(req.params.id, req.tenantId!); res.json({ success: true, data: r }); } catch (e) { next(e); } }
  async listContractorCompliance(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await contractorService.listCompliance(req.tenantId!, { limit: Number(req.query.limit ?? 100) }); res.json({ success: true, ...r }); } catch (e) { next(e); } }

  // M08 Onboarding
  async listOnboarding(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await onboardingService.listOnboarding(req.tenantId!, { status: req.query.status as string, limit: Number(req.query.limit ?? 30) }); res.json({ success: true, ...r }); } catch (e) { next(e); } }
  async completeOnboarding(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await onboardingService.completeOnboarding(req.params.id, req.tenantId!); res.json({ success: true, data: r }); } catch (e) { next(e); } }
  async listOnboardingTemplates(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await onboardingService.listTemplates(req.tenantId!, { limit: Number(req.query.limit ?? 30) }); res.json({ success: true, ...r }); } catch (e) { next(e); } }
  async createOnboardingTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await onboardingService.createTemplate(req.tenantId!, req.body); res.status(201).json({ success: true, data: r }); } catch (e) { next(e); } }
  async listTemplateTasks(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await onboardingService.listTemplateTasks(req.params.id, req.tenantId!); res.json({ success: true, ...r }); } catch (e) { next(e); } }
  async addTemplateTask(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await onboardingService.addTemplateTask(req.params.id, req.tenantId!, req.body); res.status(201).json({ success: true, data: r }); } catch (e) { next(e); } }
  async deleteTemplateTask(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await onboardingService.deleteTemplateTask(req.params.id, req.tenantId!); res.json({ success: true, data: r }); } catch (e) { next(e); } }
  async listMyOnboardingTasks(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await onboardingService.listMyTasks(req.tenantId!, req.user!.userId); res.json({ success: true, ...r }); } catch (e) { next(e); } }
  async completeOnboardingTask(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await onboardingService.completeTask(req.params.id, req.tenantId!); res.json({ success: true, data: r }); } catch (e) { next(e); } }
  async listBGV(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await onboardingService.listBGV(req.tenantId!, { limit: Number(req.query.limit ?? 30) }); res.json({ success: true, ...r }); } catch (e) { next(e); } }

  // M22 Assets
  async listAssets(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await assetService.listAssets(req.tenantId!, req.query); res.json({ success: true, ...r }); } catch (e) { next(e); } }
  async createAsset(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await assetService.createAsset(req.tenantId!, req.body); res.status(201).json({ success: true, data: r }); } catch (e) { next(e); } }
  async deleteAsset(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await assetService.deleteAsset(req.params.id, req.tenantId!); res.json({ success: true, data: r }); } catch (e) { next(e); } }
  async myAssets(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await assetService.myAssets(req.tenantId!, req.user!.userId); res.json({ success: true, ...r }); } catch (e) { next(e); } }
  async listAllocations(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await assetService.listAllocations(req.tenantId!, req.query); res.json({ success: true, ...r }); } catch (e) { next(e); } }
  async allocateAsset(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await assetService.allocateAsset(req.tenantId!, req.body); res.status(201).json({ success: true, data: r }); } catch (e) { next(e); } }
  async returnAsset(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await assetService.returnAsset(req.params.id, req.tenantId!); res.json({ success: true, data: r }); } catch (e) { next(e); } }
  async listMaintenance(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await assetService.listMaintenance(req.tenantId!, req.query); res.json({ success: true, ...r }); } catch (e) { next(e); } }
  async createMaintenance(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await assetService.createMaintenance(req.tenantId!, req.body); res.status(201).json({ success: true, data: r }); } catch (e) { next(e); } }
  async completeMaintenance(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await assetService.completeMaintenance(req.params.id, req.tenantId!); res.json({ success: true, data: r }); } catch (e) { next(e); } }

  // M24 Exit
  async listExitRequests(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await exitService.listExitRequests(req.tenantId!, req.query); res.json({ success: true, ...r }); } catch (e) { next(e); } }
  async createExitRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await exitService.createExitRequest(req.tenantId!, req.body); res.status(201).json({ success: true, data: r }); } catch (e) { next(e); } }
  async approveExitRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await exitService.approveExitRequest(req.params.id, req.tenantId!); res.json({ success: true, data: r }); } catch (e) { next(e); } }
  async rejectExitRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await exitService.rejectExitRequest(req.params.id, req.tenantId!, req.body); res.json({ success: true, data: r }); } catch (e) { next(e); } }
  async listClearances(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await exitService.listClearances(req.tenantId!, req.query); res.json({ success: true, ...r }); } catch (e) { next(e); } }
  async clearDepartment(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await exitService.clearDepartment(req.params.id, req.tenantId!); res.json({ success: true, data: r }); } catch (e) { next(e); } }
  async listFnF(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await exitService.listFnF(req.tenantId!, req.query); res.json({ success: true, ...r }); } catch (e) { next(e); } }
  async processFnF(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await exitService.processFnF(req.params.id, req.tenantId!); res.json({ success: true, data: r }); } catch (e) { next(e); } }
  async listExitInterviews(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await exitService.listExitInterviews(req.tenantId!, req.query); res.json({ success: true, ...r }); } catch (e) { next(e); } }
  async createExitInterview(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await exitService.createExitInterview(req.tenantId!, req.body); res.status(201).json({ success: true, data: r }); } catch (e) { next(e); } }

  // M26 Grievance
  async listGrievances(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await grievanceService.listGrievances(req.tenantId!, req.query); res.json({ success: true, ...r }); } catch (e) { next(e); } }
  async getGrievance(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await grievanceService.getGrievance(req.params.id, req.tenantId!); res.json({ success: true, data: r }); } catch (e) { next(e); } }
  async createGrievance(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await grievanceService.createGrievance(req.tenantId!, req.user!.userId, req.body); res.status(201).json({ success: true, data: r }); } catch (e) { next(e); } }
  async updateGrievance(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await grievanceService.updateGrievance(req.params.id, req.tenantId!, req.body); res.json({ success: true, data: r }); } catch (e) { next(e); } }
  async grievanceSLA(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await grievanceService.slaStatus(req.tenantId!); res.json({ success: true, ...r }); } catch (e) { next(e); } }

  // M27 Disciplinary
  async listDisciplinaryCases(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await disciplinaryService.listCases(req.tenantId!, req.query); res.json({ success: true, ...r }); } catch (e) { next(e); } }
  async getDisciplinaryCase(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await disciplinaryService.getCase(req.params.id, req.tenantId!); res.json({ success: true, data: r }); } catch (e) { next(e); } }
  async createDisciplinaryCase(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await disciplinaryService.createCase(req.tenantId!, req.user!.userId, req.body); res.status(201).json({ success: true, data: r }); } catch (e) { next(e); } }
  async updateDisciplinaryCase(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await disciplinaryService.updateCase(req.params.id, req.tenantId!, req.body); res.json({ success: true, data: r }); } catch (e) { next(e); } }
  async issueShowCause(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await disciplinaryService.issuShowCause(req.params.id, req.tenantId!, req.body); res.json({ success: true, data: r }); } catch (e) { next(e); } }
  async scheduleHearing(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await disciplinaryService.scheduleHearing(req.params.id, req.tenantId!, req.body); res.json({ success: true, data: r }); } catch (e) { next(e); } }
  async recordDisciplinaryAction(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await disciplinaryService.recordAction(req.params.id, req.tenantId!, req.body); res.json({ success: true, data: r }); } catch (e) { next(e); } }
  async disciplinarySummary(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await disciplinaryService.summary(req.tenantId!); res.json({ success: true, ...r }); } catch (e) { next(e); } }

  // M25 Analytics
  async analyticsHeadcount(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await analyticsService.headcount(req.tenantId!, req.query); res.json({ success: true, ...r }); } catch (e) { next(e); } }
  async analyticsAttrition(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await analyticsService.attrition(req.tenantId!, req.query); res.json({ success: true, ...r }); } catch (e) { next(e); } }
  async analyticsPayroll(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await analyticsService.payrollSummary(req.tenantId!, req.query); res.json({ success: true, ...r }); } catch (e) { next(e); } }
  async analyticsAttendance(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await analyticsService.attendanceSummary(req.tenantId!, req.query); res.json({ success: true, ...r }); } catch (e) { next(e); } }
  async generateReport(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await analyticsService.generateReport(req.tenantId!, req.params.type, req.query); res.json({ success: true, ...r }); } catch (e) { next(e); } }
  async statutoryPFSummary(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await analyticsService.statutoryPFSummary(req.tenantId!); res.json({ success: true, ...r }); } catch (e) { next(e); } }
  async statutoryESISummary(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await analyticsService.statutoryESISummary(req.tenantId!); res.json({ success: true, ...r }); } catch (e) { next(e); } }
  async statutoryTDSSummary(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const r = await analyticsService.statutoryTDSSummary(req.tenantId!); res.json({ success: true, ...r }); } catch (e) { next(e); } }
}

export const extendedController = new ExtendedController();
