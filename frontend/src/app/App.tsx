import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RootState, persistor } from '@store/index';
import { logout } from '@store/slices/authSlice';
import { DashboardLayout } from '@components/layout/DashboardLayout';
import { Spinner } from '@components/ui/Input';
import { ToastProvider } from '@components/ui/Toast';
import api from '@lib/axios';

// Lazy-loaded pages
const LoginPage = lazy(() => import('@features/auth/LoginPage'));
const DashboardPage = lazy(() => import('@features/dashboard/DashboardPage'));
const EmployeeListPage = lazy(() => import('@features/employee/EmployeeListPage'));
const EmployeeCreatePage = lazy(() => import('@features/employee/EmployeeCreatePage'));
const EmployeeProfilePage = lazy(() => import('@features/employee/EmployeeProfilePage'));
const EmployeeEditPage = lazy(() => import('@features/employee/EmployeeEditPage'));
const AttendancePage = lazy(() => import('@features/attendance/AttendancePage'));
const LeavePage = lazy(() => import('@features/leave/LeavePage'));
const ESSDashboardPage = lazy(() => import('@features/ess/ESSDashboardPage'));
const MSSDashboardPage = lazy(() => import('@features/mss/MSSDashboardPage'));
const PoliciesPage = lazy(() => import('@features/policy/PoliciesPage'));
const RecruitmentPage = lazy(() => import('@features/recruitment/RecruitmentPage'));
const TrainingPage = lazy(() => import('@features/training/TrainingPage'));
const PayrollPage = lazy(() => import('@features/payroll/PayrollPage'));
const OperationsPage = lazy(() => import('@features/operations/OperationsPage'));
const PlatformPage = lazy(() => import('@features/platform/PlatformPage'));
const SystemPage = lazy(() => import('@features/security/SystemPage'));
const OrganizationCompaniesPage = lazy(() => import('@features/organization/OrganizationCompaniesPage'));
const OrganizationBranchesPage = lazy(() => import('@features/organization/OrganizationBranchesPage'));
const OrganizationDepartmentsPage = lazy(() => import('@features/organization/OrganizationDepartmentsPage'));
const OrganizationDesignationsPage = lazy(() => import('@features/organization/OrganizationDesignationsPage'));
const OrganizationGradesPage = lazy(() => import('@features/organization/OrganizationGradesPage'));
const OrganizationCostCentersPage = lazy(() => import('@features/organization/OrganizationCostCentersPage'));
const OrganizationOrgChartPage = lazy(() => import('@features/organization/OrganizationOrgChartPage'));
const FormBuilderListPage = lazy(() => import('@features/formbuilder/FormBuilderListPage'));
const FormBuilderDesignerPage = lazy(() => import('@features/formbuilder/FormBuilderDesignerPage'));
const FormSubmissionsPage = lazy(() => import('@features/formbuilder/FormSubmissionsPage'));
const TemplatesListPage = lazy(() => import('@features/templates/TemplatesListPage'));
const TemplateEditorPage = lazy(() => import('@features/templates/TemplateEditorPage'));
const NFRDashboardPage = lazy(() => import('@features/nfr/NFRDashboardPage'));
const ShiftRosterPage = lazy(() => import('@features/shift/ShiftRosterPage'));
const BiometricPage = lazy(() => import('@features/biometric/BiometricPage'));
const OnboardingPage = lazy(() => import('@features/onboarding/OnboardingPage'));
const ContractorPage = lazy(() => import('@features/contractor/ContractorPage'));
const PerformancePage = lazy(() => import('@features/performance/PerformancePage'));
const AssetManagementPage = lazy(() => import('@features/assets/AssetManagementPage'));
const ExitManagementPage = lazy(() => import('@features/exit/ExitManagementPage'));
const AnalyticsPage = lazy(() => import('@features/analytics/AnalyticsPage'));
const GrievancePage = lazy(() => import('@features/grievance/GrievancePage'));
const DisciplinaryPage = lazy(() => import('@features/disciplinary/DisciplinaryPage'));
const HelpdeskPage = lazy(() => import('@features/helpdesk/HelpdeskPage'));
const AutomationPage = lazy(() => import('@features/automation/AutomationPage'));
const BenefitsPage = lazy(() => import('@features/benefits/BenefitsPage'));
const AIAssistantPage = lazy(() => import('@features/ai/AIAssistantPage'));
const IntegrationPage = lazy(() => import('@features/integrations/IntegrationPage'));
const CompensationPage = lazy(() => import('@features/compensation/CompensationPage'));
const CompliancePage = lazy(() => import('@features/compliance/CompliancePage'));
const OfferJoiningPage = lazy(() => import('@features/offer/OfferJoiningPage'));
const TravelExpensePage = lazy(() => import('@features/travel/TravelExpensePage'));
const ForgotPasswordPage = lazy(() => import('@features/auth/ForgotPasswordPage'));
const MFAPage = lazy(() => import('@features/auth/MFAPage'));
const SettingsPage = lazy(() => import('@features/settings/SettingsPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * On first mount, if redux-persist says we're authenticated, hit /auth/me to
 * confirm the stored access token is still valid against the live backend.
 * If it fails (401 → interceptor tries refresh → refresh fails → logout+purge),
 * we end up unauthenticated and redirect to /login automatically.
 * This prevents stale localStorage sessions from showing broken dashboard pages.
 */
function useStartupAuthCheck() {
  const dispatch = useDispatch();
  const { isAuthenticated, accessToken } = useSelector((s: RootState) => s.auth);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      setChecked(true);
      return;
    }
    api.get('/auth/me')
      .catch(() => {
        // /auth/me failed — interceptor already tried refresh and gave up.
        // Purge here as a safety net so stale tokens are wiped.
        dispatch(logout());
        persistor.purge();
      })
      .finally(() => setChecked(true));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return checked;
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useSelector((s: RootState) => s.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  );
}

function LazyLoad({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Spinner />}>{children}</Suspense>;
}

function AppRoutes() {
  const checked = useStartupAuthCheck();
  if (!checked) return <Spinner />;

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LazyLoad><LoginPage /></LazyLoad>} />
      <Route path="/forgot-password" element={<LazyLoad><ForgotPasswordPage /></LazyLoad>} />
      <Route path="/mfa" element={<LazyLoad><MFAPage /></LazyLoad>} />

      {/* Protected */}
      <Route path="/" element={<ProtectedLayout><LazyLoad><DashboardPage /></LazyLoad></ProtectedLayout>} />
      <Route path="/dashboard" element={<ProtectedLayout><LazyLoad><DashboardPage /></LazyLoad></ProtectedLayout>} />
      <Route path="/employees" element={<ProtectedLayout><LazyLoad><EmployeeListPage /></LazyLoad></ProtectedLayout>} />
      <Route path="/employees/new" element={<ProtectedLayout><LazyLoad><EmployeeCreatePage /></LazyLoad></ProtectedLayout>} />
      <Route path="/employees/:id" element={<ProtectedLayout><LazyLoad><EmployeeProfilePage /></LazyLoad></ProtectedLayout>} />
      <Route path="/employees/:id/edit" element={<ProtectedLayout><LazyLoad><EmployeeEditPage /></LazyLoad></ProtectedLayout>} />
      <Route path="/attendance" element={<ProtectedLayout><LazyLoad><AttendancePage /></LazyLoad></ProtectedLayout>} />
      <Route path="/leave" element={<ProtectedLayout><LazyLoad><LeavePage /></LazyLoad></ProtectedLayout>} />
      <Route path="/ess" element={<ProtectedLayout><LazyLoad><ESSDashboardPage /></LazyLoad></ProtectedLayout>} />
      <Route path="/mss" element={<ProtectedLayout><LazyLoad><MSSDashboardPage /></LazyLoad></ProtectedLayout>} />
      <Route path="/policies" element={<ProtectedLayout><LazyLoad><PoliciesPage /></LazyLoad></ProtectedLayout>} />
      <Route path="/recruitment" element={<ProtectedLayout><LazyLoad><RecruitmentPage /></LazyLoad></ProtectedLayout>} />
      <Route path="/training" element={<ProtectedLayout><LazyLoad><TrainingPage /></LazyLoad></ProtectedLayout>} />
      <Route path="/performance" element={<ProtectedLayout><LazyLoad><PerformancePage /></LazyLoad></ProtectedLayout>} />
      <Route path="/payroll" element={<ProtectedLayout><LazyLoad><PayrollPage /></LazyLoad></ProtectedLayout>} />
      <Route path="/operations" element={<ProtectedLayout><LazyLoad><OperationsPage /></LazyLoad></ProtectedLayout>} />
      <Route path="/platform" element={<ProtectedLayout><LazyLoad><PlatformPage /></LazyLoad></ProtectedLayout>} />
      <Route path="/system" element={<ProtectedLayout><LazyLoad><SystemPage /></LazyLoad></ProtectedLayout>} />

      <Route path="/organization/companies" element={<ProtectedLayout><LazyLoad><OrganizationCompaniesPage /></LazyLoad></ProtectedLayout>} />
      <Route path="/organization/branches" element={<ProtectedLayout><LazyLoad><OrganizationBranchesPage /></LazyLoad></ProtectedLayout>} />
      <Route path="/organization/departments" element={<ProtectedLayout><LazyLoad><OrganizationDepartmentsPage /></LazyLoad></ProtectedLayout>} />
      <Route path="/organization/designations" element={<ProtectedLayout><LazyLoad><OrganizationDesignationsPage /></LazyLoad></ProtectedLayout>} />
      <Route path="/organization/grades" element={<ProtectedLayout><LazyLoad><OrganizationGradesPage /></LazyLoad></ProtectedLayout>} />
      <Route path="/organization/cost-centers" element={<ProtectedLayout><LazyLoad><OrganizationCostCentersPage /></LazyLoad></ProtectedLayout>} />
      <Route path="/organization/org-chart" element={<ProtectedLayout><LazyLoad><OrganizationOrgChartPage /></LazyLoad></ProtectedLayout>} />

      <Route path="/forms" element={<ProtectedLayout><LazyLoad><FormBuilderListPage /></LazyLoad></ProtectedLayout>} />
      <Route path="/forms/new" element={<ProtectedLayout><LazyLoad><FormBuilderDesignerPage /></LazyLoad></ProtectedLayout>} />
      <Route path="/forms/:id/submissions" element={<ProtectedLayout><LazyLoad><FormSubmissionsPage /></LazyLoad></ProtectedLayout>} />
      <Route path="/forms/:id" element={<ProtectedLayout><LazyLoad><FormBuilderDesignerPage /></LazyLoad></ProtectedLayout>} />

      <Route path="/templates" element={<ProtectedLayout><LazyLoad><TemplatesListPage /></LazyLoad></ProtectedLayout>} />
      <Route path="/templates/new" element={<ProtectedLayout><LazyLoad><TemplateEditorPage /></LazyLoad></ProtectedLayout>} />
      <Route path="/templates/:id" element={<ProtectedLayout><LazyLoad><TemplateEditorPage /></LazyLoad></ProtectedLayout>} />

      <Route path="/biometric" element={<ProtectedLayout><LazyLoad><BiometricPage /></LazyLoad></ProtectedLayout>} />
      <Route path="/shifts" element={<ProtectedLayout><LazyLoad><ShiftRosterPage /></LazyLoad></ProtectedLayout>} />
      <Route path="/onboarding" element={<ProtectedLayout><LazyLoad><OnboardingPage /></LazyLoad></ProtectedLayout>} />
      <Route path="/contractors" element={<ProtectedLayout><LazyLoad><ContractorPage /></LazyLoad></ProtectedLayout>} />
      <Route path="/assets" element={<ProtectedLayout><LazyLoad><AssetManagementPage /></LazyLoad></ProtectedLayout>} />
      <Route path="/exit" element={<ProtectedLayout><LazyLoad><ExitManagementPage /></LazyLoad></ProtectedLayout>} />
      <Route path="/analytics" element={<ProtectedLayout><LazyLoad><AnalyticsPage /></LazyLoad></ProtectedLayout>} />
      <Route path="/grievance" element={<ProtectedLayout><LazyLoad><GrievancePage /></LazyLoad></ProtectedLayout>} />
      <Route path="/disciplinary" element={<ProtectedLayout><LazyLoad><DisciplinaryPage /></LazyLoad></ProtectedLayout>} />
      <Route path="/helpdesk" element={<ProtectedLayout><LazyLoad><HelpdeskPage /></LazyLoad></ProtectedLayout>} />
      <Route path="/automation" element={<ProtectedLayout><LazyLoad><AutomationPage /></LazyLoad></ProtectedLayout>} />
      <Route path="/benefits" element={<ProtectedLayout><LazyLoad><BenefitsPage /></LazyLoad></ProtectedLayout>} />
      <Route path="/ai-assistant" element={<ProtectedLayout><LazyLoad><AIAssistantPage /></LazyLoad></ProtectedLayout>} />
      <Route path="/integrations" element={<ProtectedLayout><LazyLoad><IntegrationPage /></LazyLoad></ProtectedLayout>} />
      <Route path="/system/nfr" element={<ProtectedLayout><LazyLoad><NFRDashboardPage /></LazyLoad></ProtectedLayout>} />
      <Route path="/compensation" element={<ProtectedLayout><LazyLoad><CompensationPage /></LazyLoad></ProtectedLayout>} />
      <Route path="/compliance" element={<ProtectedLayout><LazyLoad><CompliancePage /></LazyLoad></ProtectedLayout>} />
      <Route path="/offer-joining" element={<ProtectedLayout><LazyLoad><OfferJoiningPage /></LazyLoad></ProtectedLayout>} />
      <Route path="/settings" element={<ProtectedLayout><LazyLoad><SettingsPage /></LazyLoad></ProtectedLayout>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}
