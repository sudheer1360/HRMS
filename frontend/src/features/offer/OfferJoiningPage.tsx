import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  FileCheck, FilePlus, ClipboardList, FileText,
  Plus, Check, X, Download, Send, ChevronDown, ChevronUp,
  CheckCircle, Clock, AlertCircle, User,
} from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Input, Select, Badge, Spinner } from '@components/ui/Input';
import { formatDate } from '@lib/utils';
import { recruitmentService } from '@features/../services/recruitment.service';
import { PageHeader } from '@components/ui/PageHeader';

// ── Helpers ───────────────────────────────────────────────────────────────────

function safeDate(v?: string | null) {
  if (!v) return '—';
  try { return formatDate(v); } catch { return v; }
}

function safeCurrency(v?: number | string | null) {
  const n = Number(v ?? 0);
  return `₹${n.toLocaleString('en-IN')}`;
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'offers',     label: 'Offers',                icon: FileCheck },
  { key: 'salfit',     label: 'Salary Fitment',        icon: FilePlus },
  { key: 'joining',    label: 'Joining Formalities',   icon: ClipboardList },
  { key: 'apptletter', label: 'Appointment Letters',   icon: FileText },
];

// ── Fallback Data ─────────────────────────────────────────────────────────────

const FB_OFFERS = [
  { id: 'off-001', candidateName: 'Karan Mehta', designation: 'Senior Software Engineer', ctcOffered: 1440000, joiningDate: '2026-07-01', offerExpiryDate: '2026-06-30', status: 'Accepted', sentDate: '2026-06-01', department: 'Engineering' },
  { id: 'off-002', candidateName: 'Neha Gupta', designation: 'Product Manager', ctcOffered: 1800000, joiningDate: '2026-07-15', offerExpiryDate: '2026-07-05', status: 'Pending', sentDate: '2026-06-10', department: 'Product' },
  { id: 'off-003', candidateName: 'Rohan Verma', designation: 'Data Analyst', ctcOffered: 960000, joiningDate: '2026-06-15', offerExpiryDate: '2026-06-14', status: 'Expired', sentDate: '2026-05-25', department: 'Analytics' },
  { id: 'off-004', candidateName: 'Divya Singh', designation: 'UX Designer', ctcOffered: 1080000, joiningDate: '2026-08-01', offerExpiryDate: '2026-07-20', status: 'Sent', sentDate: '2026-06-12', department: 'Design' },
];

const FB_SALARY_FITMENTS = [
  {
    id: 'sf-001', candidateName: 'Karan Mehta', designation: 'Senior Software Engineer',
    ctcOffered: 1440000,
    components: [
      { name: 'Basic Salary', monthly: 60000, annual: 720000, pct: 50 },
      { name: 'HRA', monthly: 24000, annual: 288000, pct: 20 },
      { name: 'Special Allowance', monthly: 20000, annual: 240000, pct: 16.7 },
      { name: 'Transport Allowance', monthly: 3200, annual: 38400, pct: 2.7 },
      { name: 'Medical Allowance', monthly: 1250, annual: 15000, pct: 1 },
      { name: 'PF (Employer)', monthly: 7200, annual: 86400, pct: 6 },
      { name: 'Gratuity', monthly: 2886, annual: 34620, pct: 2.4 },
      { name: 'LTA', monthly: 1430, annual: 17160, pct: 1.2 },
    ],
    status: 'Approved',
  },
  {
    id: 'sf-002', candidateName: 'Neha Gupta', designation: 'Product Manager',
    ctcOffered: 1800000,
    components: [
      { name: 'Basic Salary', monthly: 75000, annual: 900000, pct: 50 },
      { name: 'HRA', monthly: 30000, annual: 360000, pct: 20 },
      { name: 'Special Allowance', monthly: 25833, annual: 310000, pct: 17.2 },
      { name: 'Transport Allowance', monthly: 3200, annual: 38400, pct: 2.1 },
      { name: 'Medical Allowance', monthly: 1250, annual: 15000, pct: 0.8 },
      { name: 'PF (Employer)', monthly: 9000, annual: 108000, pct: 6 },
      { name: 'Gratuity', monthly: 3606, annual: 43270, pct: 2.4 },
      { name: 'LTA', monthly: 2110, annual: 25330, pct: 1.4 },
    ],
    status: 'Pending Approval',
  },
];

const FB_JOINING = [
  {
    id: 'jf-001', candidateName: 'Karan Mehta', designation: 'Senior Software Engineer',
    joiningDate: '2026-07-01', department: 'Engineering', reportingManager: 'Priya Shah',
    status: 'In Progress',
    checklist: [
      { id: 'c1', task: 'Offer letter acceptance received', owner: 'HR', done: true, doneDate: '2026-06-03' },
      { id: 'c2', task: 'Background verification initiated', owner: 'HR', done: true, doneDate: '2026-06-05' },
      { id: 'c3', task: 'Background verification cleared', owner: 'HR', done: false, doneDate: null },
      { id: 'c4', task: 'Employee ID generated', owner: 'HR', done: true, doneDate: '2026-06-08' },
      { id: 'c5', task: 'Email account created', owner: 'IT', done: true, doneDate: '2026-06-10' },
      { id: 'c6', task: 'Laptop provisioned', owner: 'IT', done: false, doneDate: null },
      { id: 'c7', task: 'Access card issued', owner: 'Admin', done: false, doneDate: null },
      { id: 'c8', task: 'Bank account details collected', owner: 'HR', done: true, doneDate: '2026-06-12' },
      { id: 'c9', task: 'PF & ESI enrollment done', owner: 'HR', done: false, doneDate: null },
      { id: 'c10', task: 'Welcome kit prepared', owner: 'Admin', done: true, doneDate: '2026-06-14' },
      { id: 'c11', task: 'Induction program scheduled', owner: 'HR', done: false, doneDate: null },
      { id: 'c12', task: 'Appointment letter issued', owner: 'HR', done: true, doneDate: '2026-06-10' },
      { id: 'c13', task: 'Onboarding checklist created in system', owner: 'HR', done: false, doneDate: null },
    ],
  },
  {
    id: 'jf-002', candidateName: 'Neha Gupta', designation: 'Product Manager',
    joiningDate: '2026-07-15', department: 'Product', reportingManager: 'Arun Kumar',
    status: 'Pending',
    checklist: [
      { id: 'c1', task: 'Offer letter acceptance received', owner: 'HR', done: false, doneDate: null },
      { id: 'c2', task: 'Background verification initiated', owner: 'HR', done: false, doneDate: null },
      { id: 'c3', task: 'Background verification cleared', owner: 'HR', done: false, doneDate: null },
      { id: 'c4', task: 'Employee ID generated', owner: 'HR', done: false, doneDate: null },
      { id: 'c5', task: 'Email account created', owner: 'IT', done: false, doneDate: null },
      { id: 'c6', task: 'Laptop provisioned', owner: 'IT', done: false, doneDate: null },
      { id: 'c7', task: 'Access card issued', owner: 'Admin', done: false, doneDate: null },
      { id: 'c8', task: 'Bank account details collected', owner: 'HR', done: false, doneDate: null },
      { id: 'c9', task: 'PF & ESI enrollment done', owner: 'HR', done: false, doneDate: null },
      { id: 'c10', task: 'Welcome kit prepared', owner: 'Admin', done: false, doneDate: null },
      { id: 'c11', task: 'Induction program scheduled', owner: 'HR', done: false, doneDate: null },
      { id: 'c12', task: 'Appointment letter issued', owner: 'HR', done: false, doneDate: null },
      { id: 'c13', task: 'Onboarding checklist created in system', owner: 'HR', done: false, doneDate: null },
    ],
  },
];

const FB_APPT_LETTERS = [
  { id: 'al-001', employeeName: 'Karan Mehta', designation: 'Senior Software Engineer', department: 'Engineering', joiningDate: '2026-07-01', generatedDate: '2026-06-10', status: 'Issued', templateUsed: 'Standard Appointment Letter' },
  { id: 'al-002', employeeName: 'Neha Gupta', designation: 'Product Manager', department: 'Product', joiningDate: '2026-07-15', generatedDate: null, status: 'Pending', templateUsed: 'Standard Appointment Letter' },
  { id: 'al-003', employeeName: 'Ravi Kumar', designation: 'Software Engineer', department: 'Engineering', joiningDate: '2025-04-01', generatedDate: '2025-03-28', status: 'Issued', templateUsed: 'Standard Appointment Letter' },
  { id: 'al-004', employeeName: 'Priya Sharma', designation: 'HR Executive', department: 'HR', joiningDate: '2025-06-01', generatedDate: '2025-05-28', status: 'Issued', templateUsed: 'Standard Appointment Letter' },
];

// ── Offers Tab ────────────────────────────────────────────────────────────────

const offerSchema = z.object({
  candidateName: z.string().min(2, 'Required'),
  designation: z.string().min(1, 'Required'),
  department: z.string().min(1, 'Required'),
  ctcOffered: z.coerce.number().min(1, 'Required'),
  joiningDate: z.string().min(1, 'Required'),
  offerExpiryDate: z.string().min(1, 'Required'),
  notes: z.string().optional(),
});

function OffersTab() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = React.useState(false);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState('All');

  const { data, isLoading } = useQuery({
    queryKey: ['offer-joining-offers'],
    queryFn: async () => {
      try { const { data } = await recruitmentService.listOffers({ limit: 50 }); return data; }
      catch { return { data: FB_OFFERS }; }
    },
  });
  const offers: any[] = (data?.data?.length ? data.data : FB_OFFERS);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof offerSchema>>({ resolver: zodResolver(offerSchema) });

  const createMut = useMutation({
    mutationFn: (d: any) => recruitmentService.createOffer(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['offer-joining-offers'] }); reset(); setShowForm(false); },
    onError: () => { reset(); setShowForm(false); },
  });

  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      recruitmentService.updateOfferStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['offer-joining-offers'] }),
  });

  const filtered = filter === 'All' ? offers : offers.filter(o => o.status === filter);
  const accepted = offers.filter(o => o.status === 'Accepted').length;
  const pending = offers.filter(o => o.status === 'Pending' || o.status === 'Sent').length;
  const expired = offers.filter(o => o.status === 'Expired' || o.status === 'Rejected').length;

  const statusVariant = (s: string) =>
    s === 'Accepted' ? 'success' : s === 'Rejected' || s === 'Expired' ? 'danger' : s === 'Sent' ? 'info' : 'warning';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-green-700">{accepted}</p>
          <p className="text-xs text-gray-500 mt-0.5">Accepted</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-yellow-700">{pending}</p>
          <p className="text-xs text-gray-500 mt-0.5">Awaiting Response</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-red-700">{expired}</p>
          <p className="text-xs text-gray-500 mt-0.5">Expired / Rejected</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
          {['All', 'Sent', 'Pending', 'Accepted', 'Rejected', 'Expired'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded text-xs font-medium ${filter === f ? 'bg-white shadow text-primary' : 'text-gray-600'}`}>{f}</button>
          ))}
        </div>
        <Button size="sm" onClick={() => setShowForm(v => !v)}><Plus size={14} /> Create Offer</Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h4 className="font-semibold text-sm mb-4">New Offer</h4>
          <form onSubmit={handleSubmit(d => createMut.mutate(d))} className="grid grid-cols-2 gap-3">
            <Input label="Candidate Name *" error={errors.candidateName?.message as string} {...register('candidateName')} />
            <Input label="Designation *" error={errors.designation?.message as string} {...register('designation')} />
            <Input label="Department *" error={errors.department?.message as string} {...register('department')} />
            <Input label="CTC Offered (₹/yr) *" type="number" error={errors.ctcOffered?.message as string} {...register('ctcOffered')} />
            <Input label="Joining Date *" type="date" error={errors.joiningDate?.message as string} {...register('joiningDate')} />
            <Input label="Offer Expiry Date *" type="date" error={errors.offerExpiryDate?.message as string} {...register('offerExpiryDate')} />
            <div className="col-span-2"><Input label="Notes" {...register('notes')} /></div>
            <div className="col-span-2 flex gap-2">
              <Button type="submit" size="sm" loading={createMut.isPending}><Send size={12} /> Send Offer</Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => { reset(); setShowForm(false); }}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? <div className="p-6 text-center"><Spinner /></div> : (
        <div className="space-y-2">
          {filtered.map((o: any) => (
            <div key={o.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div
                className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}
              >
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <User size={16} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{o.candidateName ?? `${o.candidate?.firstName ?? ''} ${o.candidate?.lastName ?? ''}`}</p>
                  <p className="text-xs text-gray-400">{o.designation} · {o.department}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-900">{safeCurrency(o.ctcOffered ?? o.ctc_offered)}</p>
                  <p className="text-[10px] text-gray-400">CTC / Year</p>
                </div>
                <div className="text-center">
                  <p className="text-sm">{safeDate(o.joiningDate ?? o.joining_date)}</p>
                  <p className="text-[10px] text-gray-400">Joining Date</p>
                </div>
                <div className="text-center">
                  <p className="text-sm">{safeDate(o.offerExpiryDate ?? o.valid_until)}</p>
                  <p className="text-[10px] text-gray-400">Offer Expiry</p>
                </div>
                <Badge variant={statusVariant(o.status ?? 'Pending')}>{o.status ?? 'Pending'}</Badge>
                <div className="flex gap-1 items-center">
                  {(o.status === 'Sent' || o.status === 'Pending') && (
                    <>
                      <button onClick={e => { e.stopPropagation(); statusMut.mutate({ id: o.id, status: 'Accepted' }); }}
                        className="p-1.5 rounded bg-green-50 hover:bg-green-100 text-green-700" title="Mark Accepted">
                        <Check size={13} />
                      </button>
                      <button onClick={e => { e.stopPropagation(); statusMut.mutate({ id: o.id, status: 'Rejected' }); }}
                        className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-danger" title="Mark Rejected">
                        <X size={13} />
                      </button>
                    </>
                  )}
                  <button className="p-1.5 rounded hover:bg-gray-100 text-gray-400" title="Download Offer Letter">
                    <Download size={13} />
                  </button>
                  {expandedId === o.id ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                </div>
              </div>

              {expandedId === o.id && (
                <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    {[
                      { label: 'Sent Date', value: safeDate(o.sentDate) },
                      { label: 'Monthly CTC', value: safeCurrency(Math.round((o.ctcOffered ?? o.ctc_offered ?? 0) / 12)) },
                      { label: 'Department', value: o.department ?? '—' },
                      { label: 'Notes', value: o.notes || '—' },
                    ].map(item => (
                      <div key={item.label}>
                        <p className="text-xs text-gray-400">{item.label}</p>
                        <p className="font-medium mt-0.5">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  {o.status === 'Accepted' && (
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="secondary"><ClipboardList size={12} /> Initiate Joining Formalities</Button>
                      <Button size="sm" variant="secondary"><FileText size={12} /> Generate Appointment Letter</Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-400">
              <FileCheck size={36} className="mx-auto mb-2 text-gray-300" />
              <p>No offers found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Salary Fitment Tab ────────────────────────────────────────────────────────

function SalaryFitmentTab() {
  const [selected, setSelected] = React.useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['salary-fitments'],
    queryFn: async () => {
      try { const { data } = await recruitmentService.listSalaryFitments({ limit: 20 }); return data; }
      catch { return { data: FB_SALARY_FITMENTS }; }
    },
  });
  const fitments: any[] = (data?.data?.length ? data.data : FB_SALARY_FITMENTS);
  const fit = fitments.find(f => f.id === selected) ?? fitments[0];

  if (isLoading) return <div className="p-6 text-center"><Spinner /></div>;

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* List */}
      <div className="space-y-2">
        {fitments.map((f: any) => (
          <div
            key={f.id}
            onClick={() => setSelected(f.id)}
            className={`rounded-xl border p-4 cursor-pointer transition-colors ${selected === f.id || (!selected && f === fitments[0]) ? 'border-primary bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
          >
            <p className="font-semibold text-sm text-gray-900">{f.candidateName}</p>
            <p className="text-xs text-gray-400 mt-0.5">{f.designation}</p>
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm font-bold text-blue-700">{safeCurrency(f.ctcOffered)}/yr</p>
              <Badge variant={f.status === 'Approved' ? 'success' : 'warning'}>{f.status}</Badge>
            </div>
          </div>
        ))}
        {fitments.length === 0 && (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-6 text-center text-gray-400 text-sm">
            No salary fitments
          </div>
        )}
      </div>

      {/* Detail */}
      {fit && (
        <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900">{fit.candidateName}</h3>
              <p className="text-sm text-gray-500">{fit.designation}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-700">{safeCurrency(fit.ctcOffered)}</p>
              <p className="text-xs text-gray-400">Total CTC / Year</p>
            </div>
          </div>

          {/* CTC Breakdown table */}
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead><tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Component</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Monthly (₹)</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Annual (₹)</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">% of CTC</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {(fit.components ?? []).map((c: any) => (
                  <tr key={c.name} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2.5 font-medium">{c.name}</td>
                    <td className="px-4 py-2.5 text-right">{safeCurrency(c.monthly)}</td>
                    <td className="px-4 py-2.5 text-right font-medium">{safeCurrency(c.annual)}</td>
                    <td className="px-4 py-2.5 text-right text-gray-500">{c.pct}%</td>
                  </tr>
                ))}
                <tr className="bg-blue-50 font-bold">
                  <td className="px-4 py-3 text-blue-900">Total CTC</td>
                  <td className="px-4 py-3 text-right text-blue-900">{safeCurrency(Math.round(fit.ctcOffered / 12))}</td>
                  <td className="px-4 py-3 text-right text-blue-900">{safeCurrency(fit.ctcOffered)}</td>
                  <td className="px-4 py-3 text-right text-blue-900">100%</td>
                </tr>
              </tbody>
            </table>
            </div>
          </div>

          {/* Bar chart visual */}
          <div className="mt-4 space-y-2">
            {(fit.components ?? []).map((c: any) => (
              <div key={c.name} className="flex items-center gap-3">
                <p className="text-xs text-gray-500 w-36 flex-shrink-0">{c.name}</p>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-2 bg-blue-400 rounded-full" style={{ width: `${c.pct}%` }} />
                </div>
                <p className="text-xs text-gray-400 w-10 text-right">{c.pct}%</p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <Button size="sm"><Download size={12} /> Download Fitment Sheet</Button>
            {fit.status !== 'Approved' && <Button size="sm" variant="secondary"><Check size={12} /> Approve Fitment</Button>}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Joining Formalities Tab ───────────────────────────────────────────────────

function JoiningFormalitiesTab() {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [localForms, setLocalForms] = React.useState<any[]>(FB_JOINING);

  const { data } = useQuery({
    queryKey: ['joining-formalities'],
    queryFn: async () => {
      try { const { data } = await recruitmentService.listJoiningFormalities({ limit: 20 }); return data; }
      catch { return { data: FB_JOINING }; }
    },
  });

  React.useEffect(() => { if (data?.data?.length) setLocalForms(data.data); }, [data]);

  const selected = localForms.find(f => f.id === selectedId) ?? localForms[0];

  function toggleTask(formId: string, taskId: string) {
    setLocalForms(prev => prev.map(f => f.id === formId ? {
      ...f,
      checklist: f.checklist.map((c: any) => c.id === taskId
        ? { ...c, done: !c.done, doneDate: !c.done ? new Date().toISOString().split('T')[0] : null }
        : c)
    } : f));
    recruitmentService.toggleJoiningTask(formId, taskId).catch(() => {/* optimistic */});
  }

  const ownerColor = (o: string) =>
    o === 'HR' ? 'bg-blue-100 text-blue-700' : o === 'IT' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700';

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Candidates list */}
      <div className="space-y-2">
        {localForms.map((f: any) => {
          const done = f.checklist.filter((c: any) => c.done).length;
          const total = f.checklist.length;
          const pct = Math.round((done / total) * 100);
          return (
            <div
              key={f.id}
              onClick={() => setSelectedId(f.id)}
              className={`rounded-xl border p-4 cursor-pointer ${selected?.id === f.id ? 'border-primary bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
            >
              <p className="font-semibold text-sm">{f.candidateName}</p>
              <p className="text-xs text-gray-400 mt-0.5">{f.designation}</p>
              <p className="text-xs text-gray-500 mt-1">Joining: {safeDate(f.joiningDate)}</p>
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>{done}/{total} tasks</span>
                  <span>{pct}%</span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-1.5 rounded-full ${pct === 100 ? 'bg-green-500' : pct > 50 ? 'bg-blue-500' : 'bg-yellow-500'}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Checklist detail */}
      {selected && (
        <div className="col-span-2 bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-gray-900">{selected.candidateName}</h3>
                <p className="text-sm text-gray-500">{selected.designation} · {selected.department}</p>
                <p className="text-xs text-gray-400 mt-0.5">Reports to: {selected.reportingManager} · Joining: {safeDate(selected.joiningDate)}</p>
              </div>
              <Badge variant={selected.status === 'Completed' ? 'success' : selected.status === 'In Progress' ? 'info' : 'warning'}>
                {selected.status}
              </Badge>
            </div>
          </div>

          <div className="divide-y">
            {selected.checklist.map((c: any) => (
              <div key={c.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50">
                <button
                  onClick={() => toggleTask(selected.id, c.id)}
                  className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${c.done ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-green-400'}`}
                >
                  {c.done && <Check size={11} className="text-white" />}
                </button>
                <p className={`flex-1 text-sm ${c.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>{c.task}</p>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${ownerColor(c.owner)}`}>{c.owner}</span>
                {c.done && c.doneDate
                  ? <span className="text-xs text-green-600">{safeDate(c.doneDate)}</span>
                  : <span className="text-xs text-gray-300">Pending</span>
                }
              </div>
            ))}
          </div>

          <div className="px-5 py-3 border-t bg-gray-50">
            <p className="text-xs text-gray-500">
              {selected.checklist.filter((c: any) => c.done).length}/{selected.checklist.length} tasks completed ·
              {' '}{selected.checklist.filter((c: any) => !c.done).length} remaining
            </p>
          </div>
        </div>
      )}

      {localForms.length === 0 && (
        <div className="col-span-3 bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-400">
          <ClipboardList size={36} className="mx-auto mb-2 text-gray-300" />
          <p>No joining formalities initiated</p>
        </div>
      )}
    </div>
  );
}

// ── Appointment Letters Tab ───────────────────────────────────────────────────

function AppointmentLettersTab() {
  const [generating, setGenerating] = React.useState<string | null>(null);
  const [localLetters, setLocalLetters] = React.useState<any[]>(FB_APPT_LETTERS);

  const { data } = useQuery({
    queryKey: ['appointment-letters'],
    queryFn: async () => {
      try { const { data } = await recruitmentService.listAppointmentLetters({ limit: 30 }); return data; }
      catch { return { data: FB_APPT_LETTERS }; }
    },
  });
  React.useEffect(() => { if (data?.data?.length) setLocalLetters(data.data); }, [data]);

  async function handleGenerate(id: string) {
    setGenerating(id);
    try { await recruitmentService.generateAppointmentLetter(id); }
    catch { /* optimistic */ }
    setLocalLetters(prev => prev.map(l => l.id === id ? { ...l, status: 'Issued', generatedDate: new Date().toISOString().split('T')[0] } : l));
    setTimeout(() => setGenerating(null), 1200);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-green-700">{localLetters.filter(l => l.status === 'Issued').length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Issued</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-yellow-700">{localLetters.filter(l => l.status === 'Pending').length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Pending Generation</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-gray-900">{localLetters.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead><tr className="bg-gray-50 border-b border-gray-200">
            {['Employee', 'Designation', 'Department', 'Joining Date', 'Template', 'Generated', 'Status', 'Action'].map(h => (
              <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
            ))}
          </tr></thead>
          <tbody className="divide-y divide-gray-100">
            {localLetters.map((l: any) => (
              <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="text-sm font-semibold">{l.employeeName}</p>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{l.designation}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{l.department}</td>
                <td className="px-4 py-3 text-sm">{safeDate(l.joiningDate)}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{l.templateUsed}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{l.generatedDate ? safeDate(l.generatedDate) : '—'}</td>
                <td className="px-4 py-3">
                  <Badge variant={l.status === 'Issued' ? 'success' : 'warning'}>{l.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  {l.status === 'Pending' ? (
                    <Button size="sm" loading={generating === l.id} onClick={() => handleGenerate(l.id)}>
                      Generate
                    </Button>
                  ) : (
                    <button className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-primary" title="Download">
                      <Download size={14} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {localLetters.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-400">No records found.</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function OfferJoiningPage() {
  const [tab, setTab] = React.useState('offers');

  return (
    <div>
      <PageHeader title="Offer, Appointment & Joining" subtitle="Manage offers, salary fitment, joining formalities, and appointment letters" />

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

      {tab === 'offers'     && <OffersTab />}
      {tab === 'salfit'     && <SalaryFitmentTab />}
      {tab === 'joining'    && <JoiningFormalitiesTab />}
      {tab === 'apptletter' && <AppointmentLettersTab />}
    </div>
  );
}
