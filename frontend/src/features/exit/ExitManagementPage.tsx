import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  LogOut, ClipboardCheck, DollarSign, MessageSquare,
  Plus, Check, X, Circle,
} from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Input, Select, Badge, Spinner } from '@components/ui/Input';
import { formatDate } from '@lib/utils';
import api from '@lib/axios';
import { PageHeader } from '@components/ui/PageHeader';

// ── Helpers ───────────────────────────────────────────────────────────────────

function safeDate(v?: string | null) {
  if (!v) return '—';
  try { return formatDate(v); } catch { return v; }
}

function safeCurrency(v?: number | null) {
  if (v == null) return '—';
  return `₹${Number(v).toLocaleString('en-IN')}`;
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'requests',   label: 'Exit Requests',    icon: LogOut },
  { key: 'clearance',  label: 'Clearance',         icon: ClipboardCheck },
  { key: 'fnf',        label: 'Full & Final',      icon: DollarSign },
  { key: 'interviews', label: 'Exit Interviews',   icon: MessageSquare },
];

const SEPARATION_TYPES = [
  { value: 'Resignation', label: 'Resignation' },
  { value: 'Termination', label: 'Termination' },
  { value: 'Retirement', label: 'Retirement' },
  { value: 'Redundancy', label: 'Redundancy' },
  { value: 'EndOfContract', label: 'End of Contract' },
];

// ── Exit Requests tab ─────────────────────────────────────────────────────────

const exitRequestSchema = z.object({
  separationType: z.string().min(1, 'Required'),
  lastWorkingDate: z.string().min(1, 'Required'),
  reason: z.string().min(10, 'Please provide at least 10 characters'),
  noticePeriodDays: z.coerce.number().min(0),
});

function ExitRequestsTab() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = React.useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['exit-requests'],
    queryFn: async () => { const { data } = await api.get('/extended/exit/requests?limit=50'); return data; },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof exitRequestSchema>>({
    resolver: zodResolver(exitRequestSchema),
    defaultValues: { separationType: 'Resignation', noticePeriodDays: 30 },
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => api.post('/extended/exit/requests', d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['exit-requests'] }); reset(); setShowForm(false); },
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'approve' | 'reject' }) =>
      api.patch(`/extended/exit/requests/${id}/${action}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['exit-requests'] }),
  });

  const requests: any[] = data?.data ?? [];
  const pending = requests.filter(r => r.status === 'Pending').length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Exits', value: requests.length, color: 'bg-gray-50 border-gray-200 text-gray-700' },
          { label: 'Pending Approval', value: pending, color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
          { label: 'Approved', value: requests.filter(r => r.status === 'Approved').length, color: 'bg-green-50 border-green-200 text-green-700' },
          { label: 'Rejected', value: requests.filter(r => r.status === 'Rejected').length, color: 'bg-red-50 border-red-200 text-red-700' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-4 ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs mt-0.5 opacity-70">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">Exit Requests</h3>
        <Button size="sm" onClick={() => setShowForm(v => !v)}><Plus size={14} /> Initiate Exit</Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <form onSubmit={handleSubmit(d => createMutation.mutate(d))} className="grid grid-cols-2 gap-3">
            <Select label="Separation Type *" options={SEPARATION_TYPES} {...register('separationType')} />
            <Input label="Last Working Date *" type="date" error={errors.lastWorkingDate?.message as string} {...register('lastWorkingDate')} />
            <Input label="Notice Period (days) *" type="number" {...register('noticePeriodDays')} />
            <div />
            <div className="col-span-2">
              <Input label="Reason for Leaving *" error={errors.reason?.message as string} {...register('reason')} />
            </div>
            <div className="col-span-2 flex gap-2">
              <Button type="submit" size="sm" loading={createMutation.isPending}>Submit Request</Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => { reset(); setShowForm(false); }}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? <div className="p-8 text-center"><Spinner /></div> : (
        <div className="space-y-3">
          {requests.map((r: any) => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">{r.employeeName ?? r.employee?.fullName ?? 'Employee'}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{r.designation ?? '—'} · {r.department ?? '—'}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Type: {r.separationType ?? r.separation_type} ·
                    Last Day: {safeDate(r.lastWorkingDate ?? r.last_working_date)} ·
                    Notice: {r.noticePeriodDays ?? r.notice_period_days ?? 30} days
                  </p>
                  {r.reason && <p className="text-sm text-gray-600 mt-2 italic">"{r.reason}"</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={r.status === 'Approved' ? 'success' : r.status === 'Rejected' ? 'danger' : 'warning'}>{r.status ?? 'Pending'}</Badge>
                  {(r.status === 'Pending' || !r.status) && (
                    <>
                      <button onClick={() => approveMutation.mutate({ id: r.id, action: 'approve' })} className="p-1.5 rounded hover:bg-green-50 text-gray-400 hover:text-green-600" aria-label="Approve" title="Approve"><Check size={15} /></button>
                      <button onClick={() => approveMutation.mutate({ id: r.id, action: 'reject' })} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-danger" aria-label="Reject" title="Reject"><X size={15} /></button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
          {requests.length === 0 && (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-400">
              <LogOut size={36} className="mx-auto mb-2 text-gray-300" />
              <p>No exit requests</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Clearance tab ─────────────────────────────────────────────────────────────

const CLEARANCE_DEPTS = ['IT', 'HR', 'Finance', 'Admin', 'Library', 'Security', 'Projects'];

function ClearanceTab() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['exit-clearances'],
    queryFn: async () => { const { data } = await api.get('/extended/exit/clearances?limit=50'); return data; },
  });

  const clearDeptMutation = useMutation({
    mutationFn: ({ exitId, dept }: { exitId: string; dept: string }) =>
      api.patch(`/extended/exit/clearances/${exitId}/clear`, { department: dept }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['exit-clearances'] }),
  });

  const list: any[] = data?.data ?? [];

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">Clearance Status ({list.length})</h3>

      {list.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-400">
          <ClipboardCheck size={36} className="mx-auto mb-2 text-gray-300" />
          <p>No clearances in progress</p>
        </div>
      ) : (
        list.map((c: any) => {
          const cleared: string[] = c.clearedDepartments ?? c.cleared_departments ?? [];
          const allDone = CLEARANCE_DEPTS.every(d => cleared.includes(d));

          return (
            <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-semibold text-gray-900">{c.employeeName ?? c.employee?.fullName ?? '—'}</p>
                  <p className="text-xs text-gray-400">Last Day: {safeDate(c.lastWorkingDate ?? c.last_working_date)}</p>
                </div>
                <Badge variant={allDone ? 'success' : 'warning'}>{allDone ? 'All Cleared' : `${cleared.length}/${CLEARANCE_DEPTS.length} Cleared`}</Badge>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {CLEARANCE_DEPTS.map(dept => {
                  const done = cleared.includes(dept);
                  return (
                    <div key={dept} className={`rounded-lg p-2 text-center text-xs ${done ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'}`}>
                      {done
                        ? <Check size={12} className="mx-auto mb-0.5 text-green-600" />
                        : <Circle size={12} className="mx-auto mb-0.5" />
                      }
                      <p className="font-medium">{dept}</p>
                      {!done && (
                        <button
                          onClick={() => clearDeptMutation.mutate({ exitId: c.id, dept })}
                          className="text-[10px] text-primary hover:underline mt-0.5"
                        >Clear</button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// ── Full & Final tab ──────────────────────────────────────────────────────────

function FnFTab() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['fnf-settlements'],
    queryFn: async () => { const { data } = await api.get('/extended/exit/fnf?limit=50'); return data; },
  });

  const processMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/extended/exit/fnf/${id}/process`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fnf-settlements'] }),
  });

  const list: any[] = data?.data ?? [];

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">Full & Final Settlements</h3>

      {list.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-400">
          <DollarSign size={36} className="mx-auto mb-2 text-gray-300" />
          <p>No F&F settlements pending</p>
        </div>
      ) : (
        list.map((s: any) => {
          const components = [
            { label: 'Salary Due', amount: s.salaryDue ?? s.salary_due ?? 0 },
            { label: 'Leave Encashment', amount: s.leaveEncashment ?? s.leave_encashment ?? 0 },
            { label: 'Gratuity', amount: s.gratuity ?? 0 },
            { label: 'Bonus', amount: s.bonusAmount ?? s.bonus_amount ?? 0 },
            { label: 'Notice Pay', amount: s.noticePay ?? s.notice_pay ?? 0 },
          ].filter(c => c.amount > 0);

          const deductions = [
            { label: 'Notice Period Shortfall', amount: s.noticePeriodDeduction ?? s.notice_period_deduction ?? 0 },
            { label: 'Loan Recovery', amount: s.loanRecovery ?? s.loan_recovery ?? 0 },
            { label: 'Asset Recovery', amount: s.assetRecovery ?? s.asset_recovery ?? 0 },
          ].filter(d => d.amount > 0);

          const netPayable = Number(s.netPayable ?? s.net_payable ?? 0);

          return (
            <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-semibold text-gray-900">{s.employeeName ?? s.employee?.fullName ?? '—'}</p>
                  <p className="text-xs text-gray-400">Last Day: {safeDate(s.lastWorkingDate ?? s.last_working_date)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Net Payable</p>
                    <p className="text-xl font-bold text-green-700">{safeCurrency(netPayable)}</p>
                  </div>
                  <Badge variant={s.status === 'Paid' ? 'success' : s.status === 'Processed' ? 'info' : 'warning'}>{s.status ?? 'Pending'}</Badge>
                  {(!s.status || s.status === 'Pending') && (
                    <Button size="sm" onClick={() => processMutation.mutate(s.id)} loading={processMutation.isPending}>Process</Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Components</p>
                  {components.map(c => (
                    <div key={c.label} className="flex justify-between text-sm py-1">
                      <span className="text-gray-600">{c.label}</span>
                      <span className="font-medium text-green-700">{safeCurrency(c.amount)}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Deductions</p>
                  {deductions.length > 0 ? deductions.map(d => (
                    <div key={d.label} className="flex justify-between text-sm py-1">
                      <span className="text-gray-600">{d.label}</span>
                      <span className="font-medium text-danger">{safeCurrency(d.amount)}</span>
                    </div>
                  )) : <p className="text-sm text-gray-300">No deductions</p>}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// ── Exit Interviews tab ───────────────────────────────────────────────────────

const interviewSchema = z.object({
  exitId: z.string().min(1, 'Required'),
  overallSatisfaction: z.coerce.number().min(1).max(5),
  reasonForLeaving: z.string().min(1, 'Required'),
  highlights: z.string().optional(),
  improvements: z.string().optional(),
  wouldRejoin: z.string(),
  recommendToOthers: z.string(),
});

function ExitInterviewsTab() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = React.useState(false);

  const { data: exits } = useQuery({
    queryKey: ['exit-requests'],
    queryFn: async () => { const { data } = await api.get('/extended/exit/requests?limit=50'); return data; },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['exit-interviews'],
    queryFn: async () => { const { data } = await api.get('/extended/exit/interviews?limit=50'); return data; },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof interviewSchema>>({
    resolver: zodResolver(interviewSchema),
    defaultValues: { wouldRejoin: 'Yes', recommendToOthers: 'Yes', overallSatisfaction: 3 },
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => api.post('/extended/exit/interviews', { ...d, wouldRejoin: d.wouldRejoin === 'Yes', recommendToOthers: d.recommendToOthers === 'Yes' }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['exit-interviews'] }); reset(); setShowForm(false); },
  });

  const exitOptions = (exits?.data ?? []).filter((e: any) => e.status === 'Approved')
    .map((e: any) => ({ value: e.id, label: e.employeeName ?? e.employee?.fullName ?? e.id }));

  const interviews: any[] = data?.data ?? [];
  const SATISFACTION_LABELS: Record<number, string> = { 1: 'Very Dissatisfied', 2: 'Dissatisfied', 3: 'Neutral', 4: 'Satisfied', 5: 'Very Satisfied' };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">Exit Interviews ({interviews.length})</h3>
        <Button size="sm" onClick={() => setShowForm(v => !v)}><Plus size={14} /> Record Interview</Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <form onSubmit={handleSubmit(d => createMutation.mutate(d))} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Select label="Employee *" options={exitOptions} error={errors.exitId?.message as string} {...register('exitId')} />
              <Select label="Overall Satisfaction (1-5) *"
                options={[1,2,3,4,5].map(n => ({ value: String(n), label: `${n} — ${SATISFACTION_LABELS[n]}` }))}
                {...register('overallSatisfaction')} />
              <Select label="Would Rejoin?" options={[{value:'Yes',label:'Yes'},{value:'No',label:'No'},{value:'Maybe',label:'Maybe'}]} {...register('wouldRejoin')} />
              <Select label="Would Recommend?" options={[{value:'Yes',label:'Yes'},{value:'No',label:'No'}]} {...register('recommendToOthers')} />
            </div>
            <Input label="Primary Reason for Leaving *" error={errors.reasonForLeaving?.message as string} {...register('reasonForLeaving')} />
            <Input label="Highlights (What did you enjoy?)" {...register('highlights')} />
            <Input label="Areas for Improvement" {...register('improvements')} />
            <div className="flex gap-2">
              <Button type="submit" size="sm" loading={createMutation.isPending}>Save Interview</Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => { reset(); setShowForm(false); }}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? <Spinner /> : (
        <div className="space-y-3">
          {interviews.map((i: any) => {
            const sat = Number(i.overallSatisfaction ?? i.overall_satisfaction ?? 0);
            return (
              <div key={i.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{i.employeeName ?? i.employee?.fullName ?? '—'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{safeDate(i.createdAt ?? i.created_at)}</p>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${sat >= 4 ? 'text-green-600' : sat >= 3 ? 'text-yellow-600' : 'text-red-500'}`}>{sat}/5</div>
                    <p className="text-xs text-gray-400">{SATISFACTION_LABELS[sat] ?? '—'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <p className="text-xs text-gray-400">Reason for leaving</p>
                    <p className="text-gray-700 mt-0.5">{i.reasonForLeaving ?? i.reason_for_leaving}</p>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <p className="text-xs text-gray-400">Would Rejoin</p>
                      <Badge variant={(i.wouldRejoin ?? i.would_rejoin) === true || (i.wouldRejoin ?? i.would_rejoin) === 'Yes' ? 'success' : 'default'}>
                        {(i.wouldRejoin ?? i.would_rejoin) === true ? 'Yes' : (i.wouldRejoin ?? i.would_rejoin) === false ? 'No' : (i.wouldRejoin ?? i.would_rejoin) ?? '—'}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Recommend</p>
                      <Badge variant={(i.recommendToOthers ?? i.recommend_to_others) === true || (i.recommendToOthers ?? i.recommend_to_others) === 'Yes' ? 'success' : 'default'}>
                        {(i.recommendToOthers ?? i.recommend_to_others) === true ? 'Yes' : (i.recommendToOthers ?? i.recommend_to_others) === false ? 'No' : (i.recommendToOthers ?? i.recommend_to_others) ?? '—'}
                      </Badge>
                    </div>
                  </div>
                </div>
                {i.highlights && <p className="text-sm text-gray-600"><span className="font-medium">Highlights: </span>{i.highlights}</p>}
                {i.improvements && <p className="text-sm text-gray-500 mt-1"><span className="font-medium">Improve: </span>{i.improvements}</p>}
              </div>
            );
          })}
          {interviews.length === 0 && (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-400">
              <MessageSquare size={36} className="mx-auto mb-2 text-gray-300" />
              <p>No exit interviews recorded</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ExitManagementPage() {
  const [tab, setTab] = React.useState('requests');

  return (
    <div>
      <PageHeader title="Exit Management" subtitle="Separation requests, clearance, full & final settlement and exit interviews" />

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

      {tab === 'requests'   && <ExitRequestsTab />}
      {tab === 'clearance'  && <ClearanceTab />}
      {tab === 'fnf'        && <FnFTab />}
      {tab === 'interviews' && <ExitInterviewsTab />}
    </div>
  );
}
