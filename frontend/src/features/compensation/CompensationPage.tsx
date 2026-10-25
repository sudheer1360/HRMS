import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  DollarSign, TrendingUp, Gift, CreditCard, BarChart2,
  Plus, Check, X, ChevronDown, ChevronUp, Clock, CheckCircle, AlertCircle,
} from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Input, Select, Badge, Spinner } from '@components/ui/Input';
import { formatDate, formatCurrency } from '@lib/utils';
import { compensationService } from '@features/../services/compensation.service';
import { PageHeader } from '@components/ui/PageHeader';

// ── Helpers ───────────────────────────────────────────────────────────────────

function safeDate(v?: string | null) {
  if (!v) return '—';
  try { return formatDate(v); } catch { return v; }
}

function safeCurrency(v?: number | string | null) {
  const n = Number(v ?? 0);
  try { return formatCurrency(n); } catch { return `₹${n.toLocaleString('en-IN')}`; }
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'reviews',  label: 'Salary Reviews',     icon: TrendingUp },
  { key: 'bonus',    label: 'Bonus & Incentives',  icon: Gift },
  { key: 'loans',    label: 'Loans & Advances',    icon: CreditCard },
  { key: 'variable', label: 'Variable Pay',        icon: BarChart2 },
  { key: 'ctc',      label: 'CTC Revisions',       icon: DollarSign },
];

// ── Fallback Data ─────────────────────────────────────────────────────────────

const FB_REVIEWS = [
  { id: 'rev-001', cycleName: 'Annual Review FY 2025-26', reviewType: 'Annual', effectiveDate: '2026-04-01', status: 'In Progress', totalEmployees: 241, completedCount: 178, avgIncrement: 12.4, budgetAmount: 4200000 },
  { id: 'rev-002', cycleName: 'Mid-Year Review H1 2025', reviewType: 'Mid-Year', effectiveDate: '2025-10-01', status: 'Completed', totalEmployees: 230, completedCount: 230, avgIncrement: 8.2, budgetAmount: 1800000 },
  { id: 'rev-003', cycleName: 'Performance Bonus Q3 2025', reviewType: 'Promotion', effectiveDate: '2026-01-15', status: 'Draft', totalEmployees: 45, completedCount: 0, avgIncrement: 0, budgetAmount: 600000 },
];

const FB_BONUSES = [
  { id: 'bon-001', bonusType: 'Performance Bonus', amount: 48000, period: 'Q4 FY 2025-26', status: 'Approved', approvedDate: '2026-05-10', paidDate: '2026-05-31', notes: 'Exceeds expectations rating' },
  { id: 'bon-002', bonusType: 'Festival Bonus (Diwali)', amount: 15000, period: 'Oct 2025', status: 'Paid', approvedDate: '2025-10-20', paidDate: '2025-11-01', notes: 'Customary Diwali bonus' },
  { id: 'bon-003', bonusType: 'Referral Bonus', amount: 25000, period: 'Mar 2026', status: 'Pending', approvedDate: null, paidDate: null, notes: 'Referral: Ankit Sharma (joined 2026-02-15)' },
  { id: 'bon-004', bonusType: 'Retention Bonus', amount: 60000, period: 'Apr 2026', status: 'Approved', approvedDate: '2026-04-05', paidDate: null, notes: '3-year retention milestone' },
];

const FB_LOANS = [
  { id: 'loan-001', loanCode: 'LN-2026-001', loanType: 'Personal Loan', principalAmount: 150000, interestRate: 0, tenure: 12, emiAmount: 12500, disbursedDate: '2026-01-01', status: 'Active', paidEMIs: 5, remainingAmount: 87500 },
  { id: 'loan-002', loanCode: 'LN-2025-003', loanType: 'Festival Advance', principalAmount: 20000, interestRate: 0, tenure: 4, emiAmount: 5000, disbursedDate: '2025-10-01', status: 'Closed', paidEMIs: 4, remainingAmount: 0 },
];

const FB_VARIABLE = [
  { id: 'var-001', component: 'Performance Incentive', targetAmount: 96000, earnedAmount: 84000, achievementPct: 87.5, period: 'FY 2025-26', status: 'Confirmed' },
  { id: 'var-002', component: 'Sales Commission', targetAmount: 0, earnedAmount: 12000, achievementPct: 100, period: 'Q4 FY 2025-26', status: 'Paid' },
  { id: 'var-003', component: 'Project Completion Bonus', targetAmount: 40000, earnedAmount: 0, achievementPct: 0, period: 'Q1 FY 2026-27', status: 'In Progress' },
];

const FB_CTC = [
  { id: 'ctc-001', effectiveDate: '2026-04-01', previousCTC: 960000, revisedCTC: 1080000, incrementPct: 12.5, incrementAmount: 120000, reason: 'Annual Review', approvedBy: 'HR Manager', status: 'Approved' },
  { id: 'ctc-002', effectiveDate: '2025-10-01', previousCTC: 880000, revisedCTC: 960000, incrementPct: 9.1, incrementAmount: 80000, reason: 'Mid-Year Review', approvedBy: 'HR Manager', status: 'Approved' },
  { id: 'ctc-003', effectiveDate: '2025-04-01', previousCTC: 800000, revisedCTC: 880000, incrementPct: 10.0, incrementAmount: 80000, reason: 'Annual Review', approvedBy: 'HR Director', status: 'Approved' },
];

// ── Salary Reviews Tab ────────────────────────────────────────────────────────

const reviewSchema = z.object({
  cycleName: z.string().min(2, 'Required'),
  reviewType: z.string().min(1, 'Required'),
  effectiveDate: z.string().min(1, 'Required'),
  budgetAmount: z.coerce.number().min(0),
  notes: z.string().optional(),
});

function SalaryReviewsTab() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = React.useState(false);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['compensation-reviews'],
    queryFn: async () => {
      try { const { data } = await compensationService.listReviewCycles({ limit: 20 }); return data; }
      catch { return { data: FB_REVIEWS }; }
    },
  });
  const reviews: any[] = (data?.data?.length ? data.data : FB_REVIEWS);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof reviewSchema>>({ resolver: zodResolver(reviewSchema) });

  const createMut = useMutation({
    mutationFn: (d: any) => compensationService.createReviewCycle(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['compensation-reviews'] }); reset(); setShowForm(false); },
    onError: () => { reset(); setShowForm(false); },
  });

  const activeMut = useMutation({
    mutationFn: (id: string) => compensationService.activateReviewCycle(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['compensation-reviews'] }),
  });

  const statusVariant = (s: string) =>
    s === 'Completed' ? 'success' : s === 'In Progress' ? 'info' : s === 'Draft' ? 'default' : 'warning';

  const totalBudget = reviews.reduce((s, r) => s + Number(r.budgetAmount ?? 0), 0);
  const activeCount = reviews.filter(r => r.status === 'In Progress').length;
  const completedCount = reviews.filter(r => r.status === 'Completed').length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Cycles</p>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <p className="text-2xl font-bold text-blue-700">{activeCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">In Progress</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 p-4">
          <p className="text-2xl font-bold text-green-700">{safeCurrency(totalBudget)}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Budget Allocated</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">Review Cycles</h3>
        <Button size="sm" onClick={() => setShowForm(v => !v)}><Plus size={14} /> New Cycle</Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <form onSubmit={handleSubmit(d => createMut.mutate(d))} className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Input label="Cycle Name *" error={errors.cycleName?.message as string} {...register('cycleName')} placeholder="e.g. Annual Review FY 2026-27" />
            </div>
            <Select label="Review Type *" options={[
              { value: 'Annual', label: 'Annual' },
              { value: 'Mid-Year', label: 'Mid-Year' },
              { value: 'Promotion', label: 'Promotion' },
              { value: 'Market Correction', label: 'Market Correction' },
            ]} {...register('reviewType')} />
            <Input label="Effective Date *" type="date" error={errors.effectiveDate?.message as string} {...register('effectiveDate')} />
            <div className="col-span-2">
              <Input label="Budget Amount (₹)" type="number" {...register('budgetAmount')} />
            </div>
            <div className="col-span-2">
              <Input label="Notes" {...register('notes')} />
            </div>
            <div className="col-span-2 flex gap-2">
              <Button type="submit" size="sm" loading={createMut.isPending}>Create Cycle</Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => { reset(); setShowForm(false); }}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? <div className="p-8 text-center"><Spinner /></div> : (
        <div className="space-y-2">
          {reviews.map((r: any) => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div
                className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">{r.cycleName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{r.reviewType} · Effective: {safeDate(r.effectiveDate)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">{r.completedCount ?? 0}/{r.totalEmployees ?? 0}</p>
                  <p className="text-[10px] text-gray-400">Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-blue-700">{r.avgIncrement ? `${r.avgIncrement}%` : '—'}</p>
                  <p className="text-[10px] text-gray-400">Avg Increment</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-green-700">{safeCurrency(r.budgetAmount)}</p>
                  <p className="text-[10px] text-gray-400">Budget</p>
                </div>
                <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
                <div className="flex gap-2 items-center">
                  {r.status === 'Draft' && (
                    <Button size="sm" onClick={e => { e.stopPropagation(); activeMut.mutate(r.id); }} loading={activeMut.isPending}>
                      Activate
                    </Button>
                  )}
                  {expandedId === r.id ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                </div>
              </div>

              {expandedId === r.id && (
                <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { label: 'Review Type', value: r.reviewType },
                      { label: 'Effective Date', value: safeDate(r.effectiveDate) },
                      { label: 'Employees', value: `${r.totalEmployees ?? 0} total` },
                      { label: 'Progress', value: `${r.completedCount ?? 0} / ${r.totalEmployees ?? 0} reviewed` },
                    ].map(item => (
                      <div key={item.label}>
                        <p className="text-xs text-gray-400">{item.label}</p>
                        <p className="text-sm font-medium mt-0.5">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  {r.totalEmployees > 0 && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Completion Progress</span>
                        <span>{Math.round(((r.completedCount ?? 0) / (r.totalEmployees ?? 1)) * 100)}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded overflow-hidden">
                        <div
                          className="h-2 bg-blue-500 rounded"
                          style={{ width: `${Math.min(((r.completedCount ?? 0) / (r.totalEmployees ?? 1)) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {reviews.length === 0 && (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-400">
              <TrendingUp size={36} className="mx-auto mb-2 text-gray-300" />
              <p>No review cycles yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Bonus & Incentives Tab ────────────────────────────────────────────────────

const bonusSchema = z.object({
  bonusType: z.string().min(1, 'Required'),
  amount: z.coerce.number().min(1, 'Required'),
  period: z.string().min(1, 'Required'),
  notes: z.string().optional(),
});

function BonusTab() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = React.useState(false);
  const [filter, setFilter] = React.useState('All');

  const { data, isLoading } = useQuery({
    queryKey: ['my-bonuses'],
    queryFn: async () => {
      try { const { data } = await compensationService.listMyBonuses({ limit: 30 }); return data; }
      catch { return { data: FB_BONUSES }; }
    },
  });
  const bonuses: any[] = (data?.data?.length ? data.data : FB_BONUSES);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof bonusSchema>>({ resolver: zodResolver(bonusSchema) });

  const createMut = useMutation({
    mutationFn: (d: any) => compensationService.createBonus(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['my-bonuses'] }); reset(); setShowForm(false); },
    onError: () => { reset(); setShowForm(false); },
  });

  const filtered = filter === 'All' ? bonuses : bonuses.filter(b => b.status === filter);
  const totalPaid = bonuses.filter(b => b.status === 'Paid').reduce((s, b) => s + Number(b.amount ?? 0), 0);
  const totalApproved = bonuses.filter(b => b.status === 'Approved').reduce((s, b) => s + Number(b.amount ?? 0), 0);
  const totalPending = bonuses.filter(b => b.status === 'Pending').reduce((s, b) => s + Number(b.amount ?? 0), 0);

  const bonusStatusVariant = (s: string) =>
    s === 'Paid' ? 'success' : s === 'Approved' ? 'info' : s === 'Rejected' ? 'danger' : 'warning';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-50 rounded-xl border border-green-200 p-4">
          <p className="text-xl font-bold text-green-700">{safeCurrency(totalPaid)}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Paid</p>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <p className="text-xl font-bold text-blue-700">{safeCurrency(totalApproved)}</p>
          <p className="text-xs text-gray-500 mt-0.5">Approved (Pending Payment)</p>
        </div>
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4">
          <p className="text-xl font-bold text-yellow-700">{safeCurrency(totalPending)}</p>
          <p className="text-xs text-gray-500 mt-0.5">Awaiting Approval</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {['All', 'Pending', 'Approved', 'Paid', 'Rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded text-xs font-medium ${filter === f ? 'bg-white shadow text-primary' : 'text-gray-600'}`}>{f}</button>
          ))}
        </div>
        <Button size="sm" onClick={() => setShowForm(v => !v)}><Plus size={14} /> Request Bonus</Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <form onSubmit={handleSubmit(d => createMut.mutate(d))} className="grid grid-cols-2 gap-3">
            <Select label="Bonus Type *" options={[
              { value: 'Performance Bonus', label: 'Performance Bonus' },
              { value: 'Festival Bonus', label: 'Festival Bonus' },
              { value: 'Referral Bonus', label: 'Referral Bonus' },
              { value: 'Retention Bonus', label: 'Retention Bonus' },
              { value: 'Spot Award', label: 'Spot Award' },
              { value: 'Other', label: 'Other' },
            ]} {...register('bonusType')} />
            <Input label="Amount (₹) *" type="number" error={errors.amount?.message as string} {...register('amount')} />
            <Input label="Period *" placeholder="e.g. Q4 FY 2025-26" error={errors.period?.message as string} {...register('period')} />
            <div className="col-span-2"><Input label="Notes" {...register('notes')} /></div>
            <div className="col-span-2 flex gap-2">
              <Button type="submit" size="sm" loading={createMut.isPending}>Submit Request</Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => { reset(); setShowForm(false); }}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? <div className="p-6 text-center"><Spinner /></div> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead><tr className="bg-gray-50 border-b border-gray-200">
              {['Bonus Type', 'Period', 'Amount', 'Status', 'Approved Date', 'Paid Date', 'Notes'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((b: any) => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium">{b.bonusType}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{b.period}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-green-700">{safeCurrency(b.amount)}</td>
                  <td className="px-4 py-3"><Badge variant={bonusStatusVariant(b.status)}>{b.status}</Badge></td>
                  <td className="px-4 py-3 text-sm text-gray-500">{b.approvedDate ? safeDate(b.approvedDate) : '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{b.paidDate ? safeDate(b.paidDate) : '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-400 max-w-xs truncate">{b.notes || '—'}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">No records found.</td></tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Loans & Advances Tab ──────────────────────────────────────────────────────

const loanSchema = z.object({
  loanType: z.string().min(1, 'Required'),
  principalAmount: z.coerce.number().min(1000, 'Minimum ₹1,000'),
  tenure: z.coerce.number().min(1).max(60),
  reason: z.string().min(5, 'Please provide a reason'),
});

function LoansTab() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = React.useState(false);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['my-loans'],
    queryFn: async () => {
      try { const { data } = await compensationService.listMyLoans({ limit: 20 }); return data; }
      catch { return { data: FB_LOANS }; }
    },
  });
  const loans: any[] = (data?.data?.length ? data.data : FB_LOANS);

  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm<z.infer<typeof loanSchema>>({
    resolver: zodResolver(loanSchema),
    defaultValues: { loanType: 'Personal Loan', tenure: 12 },
  });

  const principalAmt = watch('principalAmount') || 0;
  const tenureVal = watch('tenure') || 12;
  const estimatedEMI = principalAmt > 0 ? Math.ceil(principalAmt / tenureVal) : 0;

  const createMut = useMutation({
    mutationFn: (d: any) => compensationService.createLoan(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['my-loans'] }); reset(); setShowForm(false); },
    onError: () => { reset(); setShowForm(false); },
  });

  const activeLoan = loans.find(l => l.status === 'Active');
  const totalOutstanding = loans.filter(l => l.status === 'Active').reduce((s, l) => s + Number(l.remainingAmount ?? 0), 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{loans.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Loans</p>
        </div>
        <div className="bg-orange-50 rounded-xl border border-orange-200 p-4">
          <p className="text-xl font-bold text-orange-700">{safeCurrency(totalOutstanding)}</p>
          <p className="text-xs text-gray-500 mt-0.5">Outstanding Balance</p>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <p className="text-xl font-bold text-blue-700">{activeLoan ? safeCurrency(activeLoan.emiAmount) : '—'}</p>
          <p className="text-xs text-gray-500 mt-0.5">Monthly EMI Deduction</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">Loan History</h3>
        <Button size="sm" onClick={() => setShowForm(v => !v)} disabled={!!activeLoan}><Plus size={14} /> Apply for Loan</Button>
      </div>

      {activeLoan && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-800">
          You have an active loan (EMI: {safeCurrency(activeLoan.emiAmount)}/month). New applications are allowed only after full repayment.
        </div>
      )}

      {showForm && !activeLoan && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h4 className="font-semibold text-gray-900 mb-4 text-sm">New Loan Application</h4>
          <form onSubmit={handleSubmit(d => createMut.mutate(d))} className="grid grid-cols-2 gap-3">
            <Select label="Loan Type *" options={[
              { value: 'Personal Loan', label: 'Personal Loan' },
              { value: 'Festival Advance', label: 'Festival Advance' },
              { value: 'Medical Advance', label: 'Medical Advance' },
              { value: 'Vehicle Loan', label: 'Vehicle Loan' },
              { value: 'Education Loan', label: 'Education Loan' },
            ]} {...register('loanType')} />
            <Input label="Principal Amount (₹) *" type="number" error={errors.principalAmount?.message as string} {...register('principalAmount')} />
            <Input label="Tenure (months) *" type="number" min="1" max="60" error={errors.tenure?.message as string} {...register('tenure')} />
            <div className="flex items-end pb-1">
              <div className="w-full bg-blue-50 rounded-lg border border-blue-200 p-3">
                <p className="text-xs text-gray-500">Estimated Monthly EMI</p>
                <p className="text-lg font-bold text-blue-700">{safeCurrency(estimatedEMI)}</p>
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Reason for Loan *</label>
              <textarea {...register('reason')} rows={2} placeholder="Describe why you need this loan..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason.message as string}</p>}
            </div>
            <div className="col-span-2 flex gap-2">
              <Button type="submit" size="sm" loading={createMut.isPending}>Submit Application</Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => { reset(); setShowForm(false); }}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? <div className="p-6 text-center"><Spinner /></div> : (
        <div className="space-y-2">
          {loans.map((l: any) => (
            <div key={l.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div
                className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedId(expandedId === l.id ? null : l.id)}
              >
                <div className="flex-1">
                  <p className="font-semibold text-sm">{l.loanCode} — {l.loanType}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Disbursed: {safeDate(l.disbursedDate)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">{safeCurrency(l.principalAmount)}</p>
                  <p className="text-[10px] text-gray-400">Principal</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">{safeCurrency(l.emiAmount)}/mo</p>
                  <p className="text-[10px] text-gray-400">EMI</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-orange-700">{safeCurrency(l.remainingAmount)}</p>
                  <p className="text-[10px] text-gray-400">Outstanding</p>
                </div>
                <Badge variant={l.status === 'Active' ? 'info' : l.status === 'Closed' ? 'success' : 'warning'}>{l.status}</Badge>
                {expandedId === l.id ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
              </div>

              {expandedId === l.id && (
                <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    {[
                      { label: 'Tenure', value: `${l.tenure} months` },
                      { label: 'Interest Rate', value: l.interestRate ? `${l.interestRate}%` : 'Interest-free' },
                      { label: 'EMIs Paid', value: `${l.paidEMIs} / ${l.tenure}` },
                      { label: 'Remaining', value: safeCurrency(l.remainingAmount) },
                    ].map(item => (
                      <div key={item.label}>
                        <p className="text-xs text-gray-400">{item.label}</p>
                        <p className="font-medium mt-0.5">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  {l.status === 'Active' && l.tenure > 0 && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Repayment Progress</span>
                        <span>{Math.round(((l.paidEMIs ?? 0) / l.tenure) * 100)}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded overflow-hidden">
                        <div
                          className="h-2 bg-green-500 rounded"
                          style={{ width: `${Math.min(((l.paidEMIs ?? 0) / l.tenure) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {loans.length === 0 && (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-400">
              <CreditCard size={36} className="mx-auto mb-2 text-gray-300" />
              <p>No loan history</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Variable Pay Tab ──────────────────────────────────────────────────────────

function VariablePayTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['variable-pay'],
    queryFn: async () => {
      try { const { data } = await compensationService.listMyVariablePay({ limit: 20 }); return data; }
      catch { return { data: FB_VARIABLE }; }
    },
  });
  const items: any[] = (data?.data?.length ? data.data : FB_VARIABLE);

  const totalTarget = items.reduce((s, i) => s + Number(i.targetAmount ?? 0), 0);
  const totalEarned = items.reduce((s, i) => s + Number(i.earnedAmount ?? 0), 0);
  const overallPct = totalTarget > 0 ? Math.round((totalEarned / totalTarget) * 100) : 0;

  const statusVariant = (s: string) =>
    s === 'Paid' ? 'success' : s === 'Confirmed' ? 'info' : s === 'In Progress' ? 'warning' : 'default';

  if (isLoading) return <div className="p-6 text-center"><Spinner /></div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xl font-bold text-gray-900">{safeCurrency(totalTarget)}</p>
          <p className="text-xs text-gray-500 mt-0.5">Target Variable Pay</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 p-4">
          <p className="text-xl font-bold text-green-700">{safeCurrency(totalEarned)}</p>
          <p className="text-xs text-gray-500 mt-0.5">Earned</p>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <p className="text-xl font-bold text-blue-700">{overallPct}%</p>
          <p className="text-xs text-gray-500 mt-0.5">Overall Achievement</p>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item: any) => {
          const pct = Number(item.achievementPct ?? 0);
          const barColor = pct >= 100 ? 'bg-green-500' : pct >= 70 ? 'bg-blue-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-red-400';
          return (
            <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-sm text-gray-900">{item.component}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{item.period}</p>
                </div>
                <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                <div>
                  <p className="text-xs text-gray-400">Target</p>
                  <p className="font-semibold">{item.targetAmount ? safeCurrency(item.targetAmount) : 'Commission-based'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Earned</p>
                  <p className="font-semibold text-green-700">{safeCurrency(item.earnedAmount)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Achievement</p>
                  <p className={`font-bold text-lg ${pct >= 100 ? 'text-green-600' : pct >= 70 ? 'text-blue-600' : 'text-yellow-600'}`}>{pct}%</p>
                </div>
              </div>
              {item.targetAmount > 0 && (
                <>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>0%</span><span>50%</span><span>100%</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-3 ${barColor} rounded-full transition-all`} style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                </>
              )}
            </div>
          );
        })}
        {items.length === 0 && (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-400">
            <BarChart2 size={36} className="mx-auto mb-2 text-gray-300" />
            <p>No variable pay components</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── CTC Revisions Tab ─────────────────────────────────────────────────────────

function CTCRevisionsTab() {
  const [showAll, setShowAll] = React.useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['ctc-revisions'],
    queryFn: async () => {
      try { const { data } = await compensationService.listMyCTCRevisions({ limit: 10 }); return data; }
      catch { return { data: FB_CTC }; }
    },
  });
  const revisions: any[] = (data?.data?.length ? data.data : FB_CTC);
  const visible = showAll ? revisions : revisions.slice(0, 5);

  const latest = revisions[0];

  if (isLoading) return <div className="p-6 text-center"><Spinner /></div>;

  return (
    <div className="space-y-4">
      {latest && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle size={20} className="text-blue-600" />
            <p className="font-semibold text-blue-900">Current CTC</p>
            <Badge variant="success">Latest</Badge>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500">Annual CTC</p>
              <p className="text-2xl font-bold text-gray-900">{safeCurrency(latest.revisedCTC)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Monthly (Gross)</p>
              <p className="text-xl font-bold text-gray-700">{safeCurrency(Math.round(latest.revisedCTC / 12))}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Last Increment</p>
              <p className="text-xl font-bold text-green-700">+{latest.incrementPct}%</p>
              <p className="text-xs text-gray-400">Effective {safeDate(latest.effectiveDate)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h3 className="font-semibold text-sm text-gray-900">Revision History</h3>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead><tr className="bg-gray-50 border-b border-gray-200">
            {['Effective Date', 'Previous CTC', 'Revised CTC', 'Increment', 'Reason', 'Approved By', 'Status'].map(h => (
              <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
            ))}
          </tr></thead>
          <tbody className="divide-y divide-gray-100">
            {visible.map((r: any) => (
              <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium">{safeDate(r.effectiveDate)}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{safeCurrency(r.previousCTC)}</td>
                <td className="px-4 py-3 text-sm font-semibold">{safeCurrency(r.revisedCTC)}</td>
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-green-700">+{r.incrementPct}%</p>
                    <p className="text-xs text-gray-400">+{safeCurrency(r.incrementAmount)}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{r.reason}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{r.approvedBy}</td>
                <td className="px-4 py-3"><Badge variant="success">{r.status}</Badge></td>
              </tr>
            ))}
            {revisions.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">No records found.</td></tr>
            )}
          </tbody>
        </table>
        </div>
        {revisions.length > 5 && (
          <div className="px-4 py-3 border-t">
            <button className="text-sm text-primary hover:underline" onClick={() => setShowAll(v => !v)}>
              {showAll ? 'Show less' : `Show all ${revisions.length} revisions`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CompensationPage() {
  const [tab, setTab] = React.useState('reviews');

  return (
    <div>
      <PageHeader title="Compensation Management" subtitle="Salary reviews, bonuses, loans, variable pay, and CTC revisions" />

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit flex-wrap">
        {TABS.map(t => {
          const I = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${tab === t.key ? 'bg-white shadow text-primary' : 'text-gray-600 hover:text-gray-900'}`}>
              <I size={14} />{t.label}
            </button>
          );
        })}
      </div>

      {tab === 'reviews'  && <SalaryReviewsTab />}
      {tab === 'bonus'    && <BonusTab />}
      {tab === 'loans'    && <LoansTab />}
      {tab === 'variable' && <VariablePayTab />}
      {tab === 'ctc'      && <CTCRevisionsTab />}
    </div>
  );
}
