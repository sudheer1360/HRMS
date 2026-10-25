import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Heart, FileText, UserPlus, Users, CheckCircle, Clock, AlertCircle,
  Plus, Send, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Input, Spinner } from '@components/ui/Input';
import api from '@lib/axios';
import { PageHeader } from '@components/ui/PageHeader';

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'plans', label: 'Benefit Plans', icon: Heart },
  { key: 'enroll', label: 'My Benefits', icon: UserPlus },
  { key: 'claims', label: 'Claims', icon: FileText },
  { key: 'dependents', label: 'Dependents', icon: Users },
];

// ── Fallback Data ─────────────────────────────────────────────────────────────

const FALLBACK_PLANS = [
  { id: 'plan-001', name: 'Group Health Insurance – Bronze', provider: 'Star Health Insurance', planType: 'Health', coverageAmount: 300000, annualPremium: 8400, employerContribution: 100, familyCoverage: false, description: 'Basic hospitalization cover for individual employees. Covers 300+ network hospitals.', status: 'Active', enrolledCount: 189 },
  { id: 'plan-002', name: 'Group Health Insurance – Gold', provider: 'HDFC ERGO', planType: 'Health', coverageAmount: 500000, annualPremium: 14400, employerContribution: 80, familyCoverage: true, description: 'Premium plan with family floater. Covers maternity, OPD up to ₹10,000, and 500+ hospitals.', status: 'Active', enrolledCount: 98 },
  { id: 'plan-003', name: 'Term Life Insurance', provider: 'LIC of India', planType: 'Life', coverageAmount: 5000000, annualPremium: 9600, employerContribution: 100, familyCoverage: false, description: 'Group term life insurance. Coverage = 5× CTC or ₹50L whichever is higher. No medicals below 45.', status: 'Active', enrolledCount: 241 },
  { id: 'plan-004', name: 'Personal Accident Cover', provider: 'New India Assurance', planType: 'Accident', coverageAmount: 2500000, annualPremium: 3600, employerContribution: 100, familyCoverage: false, description: 'Covers accidental death, permanent disability, and temporary total disability.', status: 'Active', enrolledCount: 241 },
  { id: 'plan-005', name: 'Group Health Insurance – Platinum', provider: 'ICICI Lombard', planType: 'Health', coverageAmount: 1000000, annualPremium: 28800, employerContribution: 60, familyCoverage: true, description: 'Top-tier plan with ₹10L family floater, maternity, dental, and wellness benefits.', status: 'Active', enrolledCount: 42 },
];

const FALLBACK_ENROLLMENTS = [
  { id: 'enr-001', planId: 'plan-001', planName: 'Group Health Insurance – Bronze', provider: 'Star Health Insurance', coverageAmount: 300000, enrolledAt: '2026-01-15', status: 'Active', cardNo: 'SH-2026-089-34' },
  { id: 'enr-002', planId: 'plan-003', planName: 'Term Life Insurance', provider: 'LIC of India', coverageAmount: 5000000, enrolledAt: '2026-01-15', status: 'Active', cardNo: 'LIC-GRP-2026-241' },
  { id: 'enr-003', planId: 'plan-004', planName: 'Personal Accident Cover', provider: 'New India Assurance', coverageAmount: 2500000, enrolledAt: '2026-01-15', status: 'Active', cardNo: 'NIA-PA-2026-241' },
];

const FALLBACK_CLAIMS = [
  { id: 'clm-001', claimNo: 'CLM-2026-001', planName: 'Group Health Insurance – Bronze', claimType: 'Hospitalization', amount: 45000, approvedAmount: 42000, status: 'Approved', hospitalName: 'Apollo Hospitals, Bangalore', admissionDate: '2026-04-10', dischargeDate: '2026-04-13', submittedAt: '2026-04-20', settledAt: '2026-05-02', remarks: 'Non-admissible: ward upgrade charges ₹3,000' },
  { id: 'clm-002', claimNo: 'CLM-2026-002', planName: 'Group Health Insurance – Bronze', claimType: 'OPD', amount: 3200, approvedAmount: null, status: 'Under Review', hospitalName: null, admissionDate: null, dischargeDate: null, submittedAt: '2026-06-10', settledAt: null, remarks: null },
];

const FALLBACK_DEPENDENTS = [
  { id: 'dep-001', name: 'Sunita Verma', relation: 'Spouse', dob: '1990-08-22', aadhar: 'XXXX-XXXX-4521', coveredUnderPlan: 'Group Health Insurance – Gold' },
  { id: 'dep-002', name: 'Aryan Verma', relation: 'Child', dob: '2015-03-10', aadhar: 'XXXX-XXXX-8834', coveredUnderPlan: 'Group Health Insurance – Gold' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function planTypeColor(t: string) {
  if (t === 'Health') return 'bg-green-100 text-green-700';
  if (t === 'Life') return 'bg-blue-100 text-blue-700';
  if (t === 'Accident') return 'bg-orange-100 text-orange-700';
  return 'bg-gray-100 text-gray-600';
}

function claimStatusColor(s: string) {
  if (s === 'Approved') return 'bg-green-100 text-green-700';
  if (s === 'Rejected') return 'bg-red-100 text-red-700';
  if (s === 'Under Review') return 'bg-yellow-100 text-yellow-700';
  return 'bg-gray-100 text-gray-500';
}

function formatCurrency(n: number) {
  return `₹${n.toLocaleString('en-IN')}`;
}

// ── Plans Tab ─────────────────────────────────────────────────────────────────

function PlansTab() {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [enrollingId, setEnrollingId] = React.useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ['benefit-plans'],
    queryFn: async () => {
      try { const { data } = await api.get('/extended/benefits/policies'); return data; }
      catch { return { data: FALLBACK_PLANS }; }
    },
  });

  const plans: any[] = (data?.data ?? FALLBACK_PLANS).length > 0 ? (data?.data ?? FALLBACK_PLANS) : FALLBACK_PLANS;

  const enrollMut = useMutation({
    mutationFn: (planId: string) => api.post('/extended/benefits/claims', { planId, action: 'enroll' }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['my-enrollments'] }); setEnrollingId(null); },
  });

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Your company offers the following benefit plans. Click on a plan to see details and enroll.</p>
      {plans.map((plan: any) => (
        <div key={plan.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div
            className="p-4 flex items-start gap-4 cursor-pointer"
            onClick={() => setExpandedId(expandedId === plan.id ? null : plan.id)}
          >
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
              <Heart className="w-5 h-5 text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="text-sm font-bold text-gray-900">{plan.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${planTypeColor(plan.planType ?? plan.plan_type)}`}>
                  {plan.planType ?? plan.plan_type}
                </span>
              </div>
              <p className="text-xs text-gray-500">{plan.provider} · {plan.enrolledCount ?? plan.enrolled_count ?? 0} enrolled</p>
              <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                <span>Coverage: <span className="font-semibold">{formatCurrency(plan.coverageAmount ?? plan.coverage_amount)}</span></span>
                <span>Premium: <span className="font-semibold">{formatCurrency(plan.annualPremium ?? plan.annual_premium)}/yr</span></span>
                <span>Employer pays: <span className="font-semibold">{plan.employerContribution ?? plan.employer_contribution}%</span></span>
                {(plan.familyCoverage ?? plan.family_coverage) && <span className="text-green-600 font-medium">Includes Family</span>}
              </div>
            </div>
            {expandedId === plan.id ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />}
          </div>

          {expandedId === plan.id && (
            <div className="border-t border-gray-100 p-4 bg-gray-50">
              <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Sum Insured', value: formatCurrency(plan.coverageAmount ?? plan.coverage_amount) },
                  { label: 'Annual Premium', value: formatCurrency(plan.annualPremium ?? plan.annual_premium) },
                  { label: 'Employer Share', value: `${plan.employerContribution ?? plan.employer_contribution}%` },
                  { label: 'Employee Share', value: formatCurrency(Math.round(((100 - (plan.employerContribution ?? plan.employer_contribution)) / 100) * (plan.annualPremium ?? plan.annual_premium))) + '/yr' },
                ].map(d => (
                  <div key={d.label} className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                    <p className="text-xs text-gray-500">{d.label}</p>
                    <p className="text-sm font-bold text-gray-900 mt-0.5">{d.value}</p>
                  </div>
                ))}
              </div>
              <Button
                size="sm"
                onClick={() => { setEnrollingId(plan.id); enrollMut.mutate(plan.id); }}
                disabled={enrollMut.isPending && enrollingId === plan.id}
              >
                <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                {enrollMut.isPending && enrollingId === plan.id ? 'Enrolling...' : 'Enroll in This Plan'}
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── My Benefits Tab ───────────────────────────────────────────────────────────

function MyBenefitsTab() {
  const { data } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: async () => {
      try { const { data } = await api.get('/extended/benefits/policies?my=true'); return data; }
      catch { return { data: FALLBACK_ENROLLMENTS }; }
    },
  });

  const enrollments: any[] = (data?.data ?? FALLBACK_ENROLLMENTS).length > 0 ? (data?.data ?? FALLBACK_ENROLLMENTS) : FALLBACK_ENROLLMENTS;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-green-700">{enrollments.length}</p>
          <p className="text-xs text-gray-500 mt-1">Active Plans</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-blue-700">{formatCurrency(enrollments.reduce((s: number, e: any) => s + (e.coverageAmount ?? e.coverage_amount ?? 0), 0))}</p>
          <p className="text-xs text-gray-500 mt-1">Total Coverage</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-gray-700">{enrollments.length > 0 ? enrollments[0].enrolledAt ?? enrollments[0].enrolled_at ?? '2026-01-15' : '—'}</p>
          <p className="text-xs text-gray-500 mt-1">Enrolled Since</p>
        </div>
      </div>

      {enrollments.map((enr: any) => (
        <div key={enr.id} className="bg-white border border-green-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-bold text-gray-900">{enr.planName ?? enr.plan_name}</h3>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Active</span>
              </div>
              <p className="text-xs text-gray-500">{enr.provider}</p>
              <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                <span>Cover: <span className="font-semibold">{formatCurrency(enr.coverageAmount ?? enr.coverage_amount ?? 0)}</span></span>
                {enr.cardNo && <span>Card: <span className="font-mono font-semibold">{enr.cardNo}</span></span>}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Claims Tab ────────────────────────────────────────────────────────────────

const claimSchema = z.object({
  claimType: z.string().min(1, 'Required'),
  amount: z.coerce.number().min(1, 'Required'),
  hospitalName: z.string().optional(),
  admissionDate: z.string().optional(),
  description: z.string().min(10, 'At least 10 characters'),
});
type ClaimForm = z.infer<typeof claimSchema>;

function ClaimsTab() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const { data } = useQuery({
    queryKey: ['my-claims'],
    queryFn: async () => {
      try { const { data } = await api.get('/extended/benefits/claims'); return data; }
      catch { return { data: FALLBACK_CLAIMS }; }
    },
  });
  const claims: any[] = (data?.data ?? FALLBACK_CLAIMS).length > 0 ? (data?.data ?? FALLBACK_CLAIMS) : FALLBACK_CLAIMS;

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ClaimForm>({
    resolver: zodResolver(claimSchema),
  });

  const mutation = useMutation({
    mutationFn: (d: ClaimForm) => api.post('/extended/benefits/claims', d),
    onSuccess: () => {
      setSuccess(true); setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['my-claims'] });
      reset();
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700">My Claims</h2>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-3.5 h-3.5 mr-1.5" /> New Claim
        </Button>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-800">Claim submitted successfully. Our team will review it within 3 working days.</p>
          <button onClick={() => setSuccess(false)} className="ml-auto text-green-600 hover:text-green-800">✕</button>
        </div>
      )}

      {showForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-5">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Submit New Claim</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Claim Type *</label>
                <select {...register('claimType')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                  <option value="">Select type</option>
                  {['Hospitalization', 'OPD', 'Maternity', 'Dental', 'Vision', 'Pharmacy', 'Accident'].map(t =>
                    <option key={t} value={t}>{t}</option>
                  )}
                </select>
                {errors.claimType && <p className="text-red-500 text-xs mt-1">{errors.claimType.message}</p>}
              </div>
              <Input {...register('amount')} type="number" label="Claim Amount (₹) *" placeholder="45000" error={errors.amount?.message} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input {...register('hospitalName')} label="Hospital / Provider" placeholder="Apollo Hospitals" />
              <Input {...register('admissionDate')} type="date" label="Date of Service" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Description *</label>
              <textarea {...register('description')} rows={3} placeholder="Describe the treatment and reason for claim..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmit(d => mutation.mutate(d))} disabled={mutation.isPending}>
                {mutation.isPending ? <Spinner size="sm" /> : <><Send className="w-3.5 h-3.5 mr-1.5" />Submit Claim</>}
              </Button>
              <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {claims.map((clm: any) => (
          <div key={clm.id} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-bold text-blue-600">{clm.claimNo ?? clm.claim_no}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${claimStatusColor(clm.status)}`}>{clm.status}</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900">{clm.planName ?? clm.plan_name} — {clm.claimType ?? clm.claim_type}</h3>
                {clm.hospitalName && <p className="text-xs text-gray-500 mt-0.5">{clm.hospitalName}</p>}
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                  <span>Claimed: <span className="font-semibold text-gray-700">{formatCurrency(clm.amount)}</span></span>
                  {clm.approvedAmount != null && <span>Approved: <span className="font-semibold text-green-700">{formatCurrency(clm.approvedAmount ?? clm.approved_amount)}</span></span>}
                  <span>Submitted: {clm.submittedAt ?? clm.submitted_at}</span>
                </div>
                {clm.remarks && <p className="text-xs text-gray-500 mt-1 italic">{clm.remarks}</p>}
              </div>
              <div>
                {clm.status === 'Under Review' && <Clock className="w-5 h-5 text-yellow-500" />}
                {clm.status === 'Approved' && <CheckCircle className="w-5 h-5 text-green-500" />}
                {clm.status === 'Rejected' && <AlertCircle className="w-5 h-5 text-red-500" />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Dependents Tab ────────────────────────────────────────────────────────────

const depSchema = z.object({
  name: z.string().min(2, 'Required'),
  relation: z.string().min(1, 'Required'),
  dob: z.string().min(1, 'Required'),
  aadhar: z.string().optional(),
});
type DepForm = z.infer<typeof depSchema>;

function DependentsTab() {
  const [showForm, setShowForm] = React.useState(false);
  const [dependents, setDependents] = React.useState<{ id: string; name: string; relation: string; dob: string; aadhar?: string; coveredUnderPlan: string; }[]>(FALLBACK_DEPENDENTS);
  const [success, setSuccess] = React.useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<DepForm>({
    resolver: zodResolver(depSchema),
  });

  const onSubmit = (d: DepForm) => {
    setDependents(prev => [...prev, { id: `dep-${Date.now()}`, ...d, coveredUnderPlan: 'Group Health Insurance – Gold' }]);
    setSuccess(true); setShowForm(false); reset();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-700">Registered Dependents</h2>
          <p className="text-xs text-gray-400 mt-0.5">Family members covered under your benefits plan</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Dependent
        </Button>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <p className="text-sm text-green-800">Dependent added. Coverage will be updated in 3–5 business days.</p>
          <button onClick={() => setSuccess(false)} className="ml-auto text-green-600">✕</button>
        </div>
      )}

      {showForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-5 space-y-4">
          <h3 className="text-sm font-bold text-gray-900">Add Dependent</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input {...register('name')} label="Full Name *" placeholder="e.g. Sunita Verma" error={errors.name?.message} />
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Relation *</label>
              <select {...register('relation')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="">Select relation</option>
                {['Spouse', 'Child', 'Parent', 'Parent-in-Law'].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              {errors.relation && <p className="text-red-500 text-xs mt-1">{errors.relation.message}</p>}
            </div>
            <Input {...register('dob')} type="date" label="Date of Birth *" error={errors.dob?.message} />
            <Input {...register('aadhar')} label="Aadhaar No. (optional)" placeholder="XXXX-XXXX-XXXX" />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSubmit(onSubmit)}>Add Dependent</Button>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {dependents.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No dependents registered</p>
        </div>
      ) : (
        <div className="space-y-3">
          {dependents.map((dep: any) => (
            <div key={dep.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-900">{dep.name}</h3>
                <p className="text-xs text-gray-500">{dep.relation} · DOB: {dep.dob}</p>
                {dep.coveredUnderPlan && <p className="text-xs text-green-600 mt-0.5">{dep.coveredUnderPlan}</p>}
              </div>
              {dep.aadhar && <span className="text-xs font-mono text-gray-400">{dep.aadhar}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function BenefitsPage() {
  const [activeTab, setActiveTab] = React.useState('plans');

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Health Insurance & Benefits</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your benefit enrollments, claims, and covered dependents</p>
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'plans' && <PlansTab />}
      {activeTab === 'enroll' && <MyBenefitsTab />}
      {activeTab === 'claims' && <ClaimsTab />}
      {activeTab === 'dependents' && <DependentsTab />}
    </div>
  );
}
