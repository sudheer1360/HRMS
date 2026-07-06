import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Gavel, FileWarning, Calendar, BarChart2,
  Plus, ChevronDown, ChevronUp, AlertTriangle,
  CheckCircle, Scale,
} from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Input, Spinner } from '@components/ui/Input';
import { formatDate } from '@lib/utils';
import api from '@lib/axios';
import { PageHeader } from '@components/ui/PageHeader';

// ── Helpers ───────────────────────────────────────────────────────────────────

function safeDate(v?: string | null) {
  if (!v) return '—';
  try { return formatDate(v); } catch { return v; }
}

function severityColor(s: string) {
  if (s === 'Gross Misconduct') return 'bg-red-100 text-red-700 border-red-200';
  if (s === 'Major') return 'bg-orange-100 text-orange-700 border-orange-200';
  return 'bg-yellow-100 text-yellow-700 border-yellow-200';
}

function statusColor(s: string) {
  if (s === 'Closed') return 'bg-green-100 text-green-700';
  if (s === 'Action Taken') return 'bg-blue-100 text-blue-700';
  if (s === 'Show Cause Issued' || s === 'Hearing Scheduled') return 'bg-purple-100 text-purple-700';
  if (s === 'Pending Show Cause') return 'bg-yellow-100 text-yellow-700';
  return 'bg-gray-100 text-gray-600';
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'cases',    label: 'All Cases',       icon: Gavel },
  { key: 'initiate', label: 'Initiate Case',   icon: Plus },
  { key: 'summary',  label: 'Summary',         icon: BarChart2 },
];

const OFFENSE_TYPES = [
  'Insubordination', 'Attendance Violation', 'Code of Conduct Violation',
  'Data Security Breach', 'Theft/Fraud', 'Substance Abuse', 'Misconduct',
  'Performance Issue', 'Harassment', 'Policy Violation', 'Other',
];

const ACTIONS = [
  'Verbal Warning', 'Written Warning', 'Final Warning',
  'Suspension (Paid)', 'Suspension (Unpaid)', 'Demotion',
  'Termination', 'Resignation Accepted',
];

// ── Initiate Case Form ────────────────────────────────────────────────────────

const caseSchema = z.object({
  employeeId: z.string().min(1, 'Required'),
  offenseType: z.string().min(1, 'Required'),
  offenseDate: z.string().min(1, 'Required'),
  severity: z.enum(['Minor', 'Major', 'Gross Misconduct']),
  description: z.string().min(20, 'At least 20 characters'),
});
type CaseForm = z.infer<typeof caseSchema>;

function InitiateTab() {
  const queryClient = useQueryClient();
  const [success, setSuccess] = React.useState<string | null>(null);

  const { data: empData } = useQuery({
    queryKey: ['employees-list'],
    queryFn: async () => { const { data } = await api.get('/employees?limit=200'); return data; },
  });
  const employees: any[] = empData?.data ?? [];

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CaseForm>({
    resolver: zodResolver(caseSchema),
    defaultValues: { severity: 'Minor' },
  });

  const mutation = useMutation({
    mutationFn: (d: CaseForm) => api.post('/extended/disciplinary', d).then(r => r.data),
    onSuccess: (data) => {
      setSuccess(data.data?.caseNumber ?? 'DIS-NEW');
      queryClient.invalidateQueries({ queryKey: ['disciplinary-cases'] });
      reset();
    },
  });

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center">
        <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
          <FileWarning className="w-8 h-8 text-orange-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Case Initiated</h3>
        <p className="text-sm text-gray-500 mt-2">Case number</p>
        <p className="text-2xl font-bold text-orange-600 mt-1">{success}</p>
        <p className="text-sm text-gray-500 mt-3">A show-cause notice can now be issued from the case details.</p>
        <Button className="mt-6" onClick={() => setSuccess(null)}>Initiate Another</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-orange-800">Due Process Reminder</p>
            <p className="text-xs text-orange-700 mt-1">Ensure all disciplinary actions follow the company's Code of Conduct policy. The employee must be given opportunity to respond before any action is taken.</p>
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Employee *</label>
          <select {...register('employeeId')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Select employee</option>
            {employees.map((e: any) => (
              <option key={e.id} value={e.id}>{e.first_name} {e.last_name} — {e.department ?? ''}</option>
            ))}
          </select>
          {errors.employeeId && <p className="text-red-500 text-xs mt-1">{errors.employeeId.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Offense Type *</label>
            <select {...register('offenseType')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select type</option>
              {OFFENSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {errors.offenseType && <p className="text-red-500 text-xs mt-1">{errors.offenseType.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Severity *</label>
            <select {...register('severity')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="Minor">Minor</option>
              <option value="Major">Major</option>
              <option value="Gross Misconduct">Gross Misconduct</option>
            </select>
          </div>
        </div>

        <Input {...register('offenseDate')} type="date" label="Date of Offense *" error={errors.offenseDate?.message} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea
            {...register('description')}
            rows={5}
            placeholder="Describe the incident, observed behavior, evidence, and any prior warnings..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
        </div>

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? <Spinner size="sm" /> : 'Initiate Case'}
        </Button>
      </form>
    </div>
  );
}

// ── Case Card ─────────────────────────────────────────────────────────────────

function CaseCard({ c }: { c: any }) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = React.useState(false);
  const [hearingDate, setHearingDate] = React.useState('');
  const [action, setAction] = React.useState('');
  const [hearingNotes, setHearingNotes] = React.useState(c.hearingNotes ?? '');

  const mutation = useMutation({
    mutationFn: ({ endpoint, data }: { endpoint: string; data: any }) =>
      api.post(`/extended/disciplinary/${c.id}/${endpoint}`, data).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['disciplinary-cases'] }),
  });

  const FLOW_STEPS = [
    { label: 'Case Initiated', done: true },
    { label: 'Show Cause Issued', done: !!c.showCauseDate },
    { label: 'Response Received', done: !!c.showCauseResponse },
    { label: 'Hearing', done: !!c.hearingDate },
    { label: 'Action Taken', done: !!c.action },
    { label: 'Closed', done: c.status === 'Closed' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="p-4 flex items-start gap-3 cursor-pointer hover:bg-gray-50" onClick={() => setExpanded(e => !e)}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">{c.caseNumber}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded border ${severityColor(c.severity)}`}>{c.severity}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${statusColor(c.status)}`}>{c.status}</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 mt-1.5">{c.employeeName} — {c.department}</p>
          <p className="text-xs text-gray-500 mt-0.5">{c.offenseType} · Offense date: {safeDate(c.offenseDate)}</p>
          <p className="text-xs text-gray-400 line-clamp-1 mt-1">{c.description}</p>
          {c.initiatedBy && <p className="text-xs text-gray-400 mt-1">Initiated by: {c.initiatedBy}</p>}
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />}
      </div>

      {expanded && (
        <div className="border-t border-gray-100 p-4 space-y-5 bg-gray-50">
          {/* Progress */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Case Progress</p>
            <div className="flex items-center gap-0">
              {FLOW_STEPS.map((step, i) => (
                <React.Fragment key={step.label}>
                  <div className="flex flex-col items-center" style={{ minWidth: 80 }}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step.done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                      {step.done ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
                    </div>
                    <p className="text-center text-xs mt-1 text-gray-500 leading-tight">{step.label}</p>
                  </div>
                  {i < FLOW_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mb-4 ${step.done && FLOW_STEPS[i + 1].done ? 'bg-green-400' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Description</p>
            <p className="text-sm text-gray-700">{c.description}</p>
          </div>

          {/* Show Cause */}
          {c.showCauseResponse && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Employee Response to Show Cause</p>
              <p className="text-sm text-gray-700">{c.showCauseResponse}</p>
            </div>
          )}

          {/* Hearing Notes */}
          {c.hearingNotes && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Hearing Notes</p>
              <p className="text-sm text-gray-700">{c.hearingNotes}</p>
            </div>
          )}

          {/* Actions */}
          {c.action && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Action Taken</p>
              <p className="text-sm font-semibold text-red-700">{c.action} — {safeDate(c.actionDate)}</p>
            </div>
          )}

          {c.appealStatus && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Appeal Status</p>
              <p className="text-sm text-gray-700">{c.appealStatus}</p>
            </div>
          )}

          {/* Workflow Actions */}
          {c.status === 'Pending Show Cause' && (
            <div className="border border-orange-200 bg-orange-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-orange-800 mb-2">Issue Show-Cause Notice</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => mutation.mutate({ endpoint: 'show-cause', data: {} })}
                disabled={mutation.isPending}
              >
                <FileWarning className="w-3.5 h-3.5 mr-1.5" /> Issue Show Cause Notice
              </Button>
            </div>
          )}

          {(c.status === 'Show Cause Issued') && (
            <div className="border border-purple-200 bg-purple-50 rounded-lg p-3 space-y-2">
              <p className="text-xs font-semibold text-purple-800 mb-2">Schedule Hearing</p>
              <input
                type="date"
                value={hearingDate}
                onChange={e => setHearingDate(e.target.value)}
                className="text-sm rounded border border-gray-300 px-2 py-1"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => mutation.mutate({ endpoint: 'hearing', data: { hearingDate } })}
                disabled={!hearingDate || mutation.isPending}
              >
                <Calendar className="w-3.5 h-3.5 mr-1.5" /> Schedule Hearing
              </Button>
            </div>
          )}

          {(c.status === 'Hearing Scheduled') && (
            <div className="border border-blue-200 bg-blue-50 rounded-lg p-3 space-y-3">
              <p className="text-xs font-semibold text-blue-800">Record Decision</p>
              <select
                value={action}
                onChange={e => setAction(e.target.value)}
                className="w-full text-sm rounded border border-gray-300 px-2 py-1"
              >
                <option value="">Select action</option>
                {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              <textarea
                value={hearingNotes}
                onChange={e => setHearingNotes(e.target.value)}
                rows={3}
                placeholder="Hearing notes / committee findings..."
                className="w-full text-sm rounded border border-gray-300 px-2 py-1 resize-none"
              />
              <Button
                size="sm"
                onClick={() => mutation.mutate({ endpoint: 'action', data: { action, hearingNotes } })}
                disabled={!action || mutation.isPending}
              >
                <Scale className="w-3.5 h-3.5 mr-1.5" /> Record Action
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Cases Tab ─────────────────────────────────────────────────────────────────

function CasesTab() {
  const [statusFilter, setStatusFilter] = React.useState('');
  const [severityFilter, setSeverityFilter] = React.useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['disciplinary-cases', statusFilter, severityFilter],
    queryFn: async () => {
      const p = new URLSearchParams();
      if (statusFilter) p.set('status', statusFilter);
      if (severityFilter) p.set('severity', severityFilter);
      const { data } = await api.get(`/extended/disciplinary?${p}`);
      return data;
    },
  });

  const cases: any[] = data?.data ?? [];

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="text-sm rounded-lg border border-gray-300 px-3 py-2">
          <option value="">All Statuses</option>
          {['Pending Show Cause', 'Show Cause Issued', 'Hearing Scheduled', 'Action Taken', 'Closed'].map(s =>
            <option key={s} value={s}>{s}</option>
          )}
        </select>
        <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} className="text-sm rounded-lg border border-gray-300 px-3 py-2">
          <option value="">All Severities</option>
          {['Minor', 'Major', 'Gross Misconduct'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="ml-auto text-xs text-gray-500">{cases.length} case{cases.length !== 1 ? 's' : ''}</span>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : cases.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Gavel className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No disciplinary cases found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cases.map((c: any) => <CaseCard key={c.id} c={c} />)}
        </div>
      )}
    </div>
  );
}

// ── Summary Tab ───────────────────────────────────────────────────────────────

function SummaryTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['disciplinary-summary'],
    queryFn: async () => { const { data } = await api.get('/extended/disciplinary/summary'); return data?.data ?? data; },
  });

  if (isLoading) return <div className="flex justify-center py-16"><Spinner /></div>;
  const s = data ?? {};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Cases', value: s.total ?? 0, color: 'text-gray-900', bg: 'bg-gray-50' },
          { label: 'Open Cases', value: s.open ?? 0, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Pending Show Cause', value: s.pendingShowCause ?? 0, color: 'text-yellow-700', bg: 'bg-yellow-50' },
          { label: 'Closed', value: s.closed ?? 0, color: 'text-green-700', bg: 'bg-green-50' },
        ].map(m => (
          <div key={m.label} className={`${m.bg} rounded-xl border border-gray-200 p-4`}>
            <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
            <p className="text-xs text-gray-500 mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      {s.bySeverity && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Cases by Severity</h3>
          <div className="space-y-3">
            {(s.bySeverity as any[]).map((sv: any) => {
              const count = sv.count ?? sv.cnt ?? 0;
              const colors = { Minor: 'bg-yellow-400', Major: 'bg-orange-500', 'Gross Misconduct': 'bg-red-500' };
              return (
                <div key={sv.severity} className="flex items-center gap-3">
                  <span className="text-xs w-28 text-gray-600 shrink-0">{sv.severity}</span>
                  <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${colors[sv.severity as keyof typeof colors] ?? 'bg-blue-500'}`}
                      style={{ width: `${Math.round((count / (s.total || 1)) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 w-4">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Progressive Discipline Framework</h3>
        <div className="space-y-2">
          {[
            { level: '1st Offense', action: 'Verbal Warning + Counselling', icon: '⚠️' },
            { level: '2nd Offense', action: 'Written Warning', icon: '📄' },
            { level: '3rd Offense', action: 'Final Warning / Suspension', icon: '🔴' },
            { level: 'Gross Misconduct', action: 'Immediate Termination after enquiry', icon: '⛔' },
          ].map(f => (
            <div key={f.level} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
              <span className="text-base">{f.icon}</span>
              <div>
                <p className="text-xs font-semibold text-gray-800">{f.level}</p>
                <p className="text-xs text-gray-500">{f.action}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function DisciplinaryPage() {
  const [activeTab, setActiveTab] = React.useState('cases');

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Disciplinary Action Management"
        subtitle="Manage show-cause notices, hearings, progressive discipline, and appeals"
      />

      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === t.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'cases' && <CasesTab />}
      {activeTab === 'initiate' && <InitiateTab />}
      {activeTab === 'summary' && <SummaryTab />}
    </div>
  );
}
