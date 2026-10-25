import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  AlertTriangle, Shield, BarChart2, FileText,
  Plus, ChevronDown, ChevronUp, Clock, CheckCircle,
  AlertCircle, Eye, RefreshCw,
} from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Input, Select, Badge, Spinner } from '@components/ui/Input';
import { formatDate } from '@lib/utils';
import { grievanceService } from '@features/../services/grievance.service';
import { PageHeader } from '@components/ui/PageHeader';

// ── Helpers ───────────────────────────────────────────────────────────────────

function safeDate(v?: string | null) {
  if (!v) return '—';
  try { return formatDate(v); } catch { return v; }
}

function priorityColor(p: string) {
  if (p === 'Critical') return 'bg-red-100 text-red-700 border-red-200';
  if (p === 'High') return 'bg-orange-100 text-orange-700 border-orange-200';
  if (p === 'Medium') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  return 'bg-gray-100 text-gray-600 border-gray-200';
}

function statusColor(s: string) {
  if (s === 'Resolved' || s === 'Closed') return 'bg-green-100 text-green-700';
  if (s === 'Under Investigation' || s === 'Committee Formed') return 'bg-blue-100 text-blue-700';
  if (s === 'Pending') return 'bg-yellow-100 text-yellow-700';
  return 'bg-gray-100 text-gray-600';
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'complaints', label: 'Complaints', icon: AlertTriangle },
  { key: 'posh',       label: 'POSH Cases',  icon: Shield },
  { key: 'submit',     label: 'Submit Complaint', icon: Plus },
  { key: 'sla',        label: 'SLA Dashboard', icon: BarChart2 },
];

const CATEGORIES = [
  'Workplace Harassment', 'POSH', 'Salary Discrepancy', 'Work Environment',
  'Policy Violation', 'Discrimination', 'Bullying', 'Data Privacy', 'Other',
];

const SUBCATEGORIES: Record<string, string[]> = {
  'Workplace Harassment': ['Verbal', 'Physical', 'Online', 'Other'],
  'POSH': ['Sexual Harassment', 'Gender Discrimination', 'Hostile Work Environment'],
  'Salary Discrepancy': ['Incorrect Deduction', 'Missed Component', 'Wrong CTC', 'Other'],
  'Work Environment': ['Unsafe Conditions', 'Overcrowding', 'Inadequate Facilities', 'Other'],
  'Policy Violation': ['Favoritism', 'Leave Denial', 'Retaliation', 'Other'],
  'Discrimination': ['Age', 'Gender', 'Religion', 'Disability', 'Other'],
  'Bullying': ['Peer', 'Manager', 'Subordinate', 'Other'],
  'Data Privacy': ['Unauthorized Access', 'Data Leak', 'Other'],
  'Other': ['Other'],
};

// ── Submit Complaint Form ─────────────────────────────────────────────────────

const submitSchema = z.object({
  category: z.string().min(1, 'Required'),
  subcategory: z.string().optional(),
  description: z.string().min(30, 'Please describe the issue in at least 30 characters'),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
  anonymous: z.boolean(),
  respondentName: z.string().optional(),
});
type SubmitForm = z.infer<typeof submitSchema>;

function SubmitTab() {
  const queryClient = useQueryClient();
  const [submitted, setSubmitted] = React.useState<{ ticketNumber: string } | null>(null);
  const [selectedCategory, setSelectedCategory] = React.useState('');

  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<SubmitForm>({
    resolver: zodResolver(submitSchema),
    defaultValues: { priority: 'Medium', anonymous: false },
  });

  const category = watch('category');
  React.useEffect(() => {
    setSelectedCategory(category || '');
    setValue('subcategory', '');
  }, [category, setValue]);

  const mutation = useMutation({
    mutationFn: (data: SubmitForm) => grievanceService.submit(data),
    onSuccess: (data) => {
      setSubmitted({ ticketNumber: data.data?.ticketNumber ?? 'GRV-NEW' });
      queryClient.invalidateQueries({ queryKey: ['grievances'] });
      reset();
    },
  });

  if (submitted) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Complaint Submitted</h3>
        <p className="text-sm text-gray-500 mt-2">Your ticket number is</p>
        <p className="text-2xl font-bold text-blue-600 mt-1">{submitted.ticketNumber}</p>
        <p className="text-sm text-gray-500 mt-3">The HR team will review and respond within the SLA period.</p>
        <Button className="mt-6" onClick={() => setSubmitted(null)}>Submit Another</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-800">Confidentiality Notice</p>
            <p className="text-xs text-yellow-700 mt-1">All complaints are treated with strict confidentiality. You may choose to submit anonymously. POSH complaints are handled exclusively by the Internal Complaints Committee (ICC).</p>
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <input type="checkbox" id="anonymous" {...register('anonymous')} className="w-4 h-4 rounded border-gray-300" />
          <div>
            <label htmlFor="anonymous" className="text-sm font-medium text-gray-900 cursor-pointer">Submit Anonymously</label>
            <p className="text-xs text-gray-500">Your identity will not be revealed to the respondent or investigation team.</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
          <select {...register('category')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Select category</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
        </div>

        {selectedCategory && SUBCATEGORIES[selectedCategory] && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sub-category</label>
            <select {...register('subcategory')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select sub-category</option>
              {SUBCATEGORIES[selectedCategory].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
          <select {...register('priority')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="Low">Low — Non-urgent issue</option>
            <option value="Medium">Medium — Affecting work</option>
            <option value="High">High — Serious concern</option>
            <option value="Critical">Critical — Safety / POSH / Immediate action needed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Respondent Name (optional)</label>
          <Input {...register('respondentName')} placeholder="Name of the person the complaint is against" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea
            {...register('description')}
            rows={6}
            placeholder="Describe the incident in detail — what happened, when, where, who was involved, any witnesses..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
        </div>

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? <Spinner size="sm" /> : 'Submit Complaint'}
        </Button>
        {mutation.isError && <p className="text-red-500 text-sm">Failed to submit. Please try again.</p>}
      </form>
    </div>
  );
}

// ── Complaint Card ────────────────────────────────────────────────────────────

function ComplaintCard({ c, onUpdate }: { c: any; onUpdate: (id: string, data: any) => void }) {
  const [expanded, setExpanded] = React.useState(false);
  const [noteVal, setNoteVal] = React.useState(c.investigationNotes ?? '');
  const [status, setStatus] = React.useState(c.status);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div
        className="p-4 flex items-start gap-3 cursor-pointer hover:bg-gray-50"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{c.ticketNumber}</span>
            {c.poshCase && <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">POSH</span>}
            <span className={`text-xs font-medium px-2 py-0.5 rounded border ${priorityColor(c.priority)}`}>{c.priority}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${statusColor(c.status)}`}>{c.status}</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 mt-1.5">{c.category}{c.subcategory ? ` — ${c.subcategory}` : ''}</p>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{c.description}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
            <span>By: {c.complainantName}</span>
            {c.respondentName && <span>Against: {c.respondentName}</span>}
            <span>Filed: {safeDate(c.createdAt)}</span>
            <span>SLA: {safeDate(c.slaDeadline)}</span>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />}
      </div>

      {expanded && (
        <div className="border-t border-gray-100 p-4 space-y-4 bg-gray-50">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Full Description</p>
            <p className="text-sm text-gray-700">{c.description}</p>
          </div>
          {c.assignedTo && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Assigned To</p>
              <p className="text-sm text-gray-700">{c.assignedTo}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Investigation Notes</p>
            <textarea
              value={noteVal}
              onChange={e => setNoteVal(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Add investigation notes..."
            />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div>
              <label className="text-xs font-medium text-gray-600 mr-2">Status:</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="text-sm rounded border border-gray-300 px-2 py-1"
              >
                {['Pending', 'Under Investigation', 'Committee Formed', 'Resolved', 'Closed'].map(s =>
                  <option key={s} value={s}>{s}</option>
                )}
              </select>
            </div>
            <Button size="sm" onClick={() => onUpdate(c.id, { status, investigationNotes: noteVal })}>
              Save
            </Button>
            {c.resolvedAt && (
              <span className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Resolved {safeDate(c.resolvedAt)}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Complaints Tab ────────────────────────────────────────────────────────────

function ComplaintsTab({ poshOnly = false }: { poshOnly?: boolean }) {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = React.useState('');
  const [catFilter, setCatFilter] = React.useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['grievances', statusFilter, catFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (catFilter) params.set('category', catFilter);
      const { data } = await grievanceService.list(Object.fromEntries(new URLSearchParams(params)));
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => grievanceService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['grievances'] }),
  });

  const complaints: any[] = (data?.data ?? []).filter((c: any) => poshOnly ? c.poshCase : !c.poshCase);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="text-sm rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          {['Pending', 'Under Investigation', 'Committee Formed', 'Resolved', 'Closed'].map(s =>
            <option key={s} value={s}>{s}</option>
          )}
        </select>
        {!poshOnly && (
          <select
            value={catFilter}
            onChange={e => setCatFilter(e.target.value)}
            className="text-sm rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
        <span className="ml-auto text-xs text-gray-500">{complaints.length} complaint{complaints.length !== 1 ? 's' : ''}</span>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No complaints found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {complaints.map((c: any) => (
            <ComplaintCard
              key={c.id}
              c={c}
              onUpdate={(id, d) => updateMutation.mutate({ id, data: d })}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── SLA Dashboard ─────────────────────────────────────────────────────────────

function SLATab() {
  const { data, isLoading } = useQuery({
    queryKey: ['grievance-sla'],
    queryFn: async () => {
      const { data } = await grievanceService.getSLAStatus('all');
      return data?.data ?? data;
    },
  });

  if (isLoading) return <div className="flex justify-center py-16"><Spinner /></div>;

  const sla = data ?? {};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Complaints', value: sla.total ?? 0, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'SLA Breached', value: sla.breached ?? 0, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'POSH Cases', value: sla.poshCases ?? 0, icon: Shield, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Avg Resolution', value: sla.avgResolutionDays ? `${sla.avgResolutionDays}d` : '—', icon: Clock, color: 'text-green-600', bg: 'bg-green-50' },
        ].map(m => (
          <div key={m.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className={`w-9 h-9 rounded-lg ${m.bg} flex items-center justify-center mb-3`}>
              <m.icon className={`w-5 h-5 ${m.color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{m.value}</p>
            <p className="text-xs text-gray-500 mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      {sla.byStatus && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Complaints by Status</h3>
          <div className="space-y-3">
            {(sla.byStatus as any[]).map((s: any) => {
              const count = s.count ?? s.cnt ?? 0;
              const total = sla.total ?? 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={s.status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">{s.status}</span>
                    <span className="text-xs font-semibold text-gray-900">{count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4" /> POSH SLA Requirements
        </h3>
        <div className="space-y-2 text-xs text-blue-800">
          <div className="flex justify-between"><span>ICC Constitution</span><span className="font-semibold">Within 7 days of complaint</span></div>
          <div className="flex justify-between"><span>Investigation Completion</span><span className="font-semibold">Within 90 days</span></div>
          <div className="flex justify-between"><span>Report Submission</span><span className="font-semibold">Within 10 days of completion</span></div>
          <div className="flex justify-between"><span>Action Implementation</span><span className="font-semibold">Within 60 days of report</span></div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function GrievancePage() {
  const [activeTab, setActiveTab] = React.useState('complaints');

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Complaints & Grievance Management"
        subtitle="Submit and track workplace complaints, POSH cases, and grievance resolutions"
      />

      {/* Tabs */}
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

      {activeTab === 'complaints' && <ComplaintsTab />}
      {activeTab === 'posh' && <ComplaintsTab poshOnly />}
      {activeTab === 'submit' && <SubmitTab />}
      {activeTab === 'sla' && <SLATab />}
    </div>
  );
}
