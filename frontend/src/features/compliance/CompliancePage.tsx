import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Shield, Calendar, FileText, ClipboardCheck, Users,
  Plus, Check, X, AlertTriangle, CheckCircle, Clock, Download,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Input, Select, Badge, Spinner } from '@components/ui/Input';
import { formatDate } from '@lib/utils';
import { complianceService } from '@features/../services/compliance.service';
import { PageHeader } from '@components/ui/PageHeader';

// ── Helpers ───────────────────────────────────────────────────────────────────

function safeDate(v?: string | null) {
  if (!v) return '—';
  try { return formatDate(v); } catch { return v; }
}

function daysUntil(dateStr: string): number {
  const now = new Date();
  const due = new Date(dateStr);
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function urgencyVariant(days: number): 'danger' | 'warning' | 'success' | 'info' {
  if (days < 0) return 'danger';
  if (days <= 7) return 'warning';
  if (days <= 30) return 'info';
  return 'success';
}

function urgencyLabel(days: number): string {
  if (days < 0) return `Overdue by ${Math.abs(days)} days`;
  if (days === 0) return 'Due Today';
  if (days === 1) return 'Due Tomorrow';
  return `Due in ${days} days`;
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'calendar',  label: 'Compliance Calendar', icon: Calendar },
  { key: 'filings',   label: 'Statutory Filings',   icon: FileText },
  { key: 'reports',   label: 'Statutory Reports',   icon: Shield },
  { key: 'checklist', label: 'Audit Checklist',     icon: ClipboardCheck },
  { key: 'documents', label: 'Document Compliance', icon: Users },
];

// ── Fallback Data ─────────────────────────────────────────────────────────────

const FB_CALENDAR = [
  { id: 'cal-001', compliance: 'PF Challan Payment', act: 'Employees Provident Funds Act', frequency: 'Monthly', dueDate: '2026-07-15', category: 'PF', status: 'Upcoming', penalty: '₹5,000 + 12% p.a.' },
  { id: 'cal-002', compliance: 'ESI Challan Payment', act: 'Employees State Insurance Act', frequency: 'Monthly', dueDate: '2026-07-15', category: 'ESI', status: 'Upcoming', penalty: '₹5,000 + 12% p.a.' },
  { id: 'cal-003', compliance: 'TDS Payment (Form 26Q)', act: 'Income Tax Act', frequency: 'Monthly', dueDate: '2026-07-07', category: 'TDS', status: 'Upcoming', penalty: '₹200/day + 1.5% p.m.' },
  { id: 'cal-004', compliance: 'Professional Tax (PT)', act: 'State Professional Tax Act', frequency: 'Monthly', dueDate: '2026-07-10', category: 'PT', status: 'Upcoming', penalty: 'State-specific' },
  { id: 'cal-005', compliance: 'PF Monthly Return (ECR)', act: 'Employees Provident Funds Act', frequency: 'Monthly', dueDate: '2026-07-25', category: 'PF', status: 'Upcoming', penalty: '₹5,000' },
  { id: 'cal-006', compliance: 'ESI Half-Yearly Return', act: 'Employees State Insurance Act', frequency: 'Half-Yearly', dueDate: '2026-11-11', category: 'ESI', status: 'Upcoming', penalty: '₹5,000' },
  { id: 'cal-007', compliance: 'TDS Quarterly Return (24Q)', act: 'Income Tax Act', frequency: 'Quarterly', dueDate: '2026-07-31', category: 'TDS', status: 'Upcoming', penalty: '₹200/day' },
  { id: 'cal-008', compliance: 'Form 16 Issue to Employees', act: 'Income Tax Act', frequency: 'Annual', dueDate: '2026-06-15', category: 'TDS', status: 'Overdue', penalty: '₹100/day per certificate' },
  { id: 'cal-009', compliance: 'Labour Welfare Fund (LWF)', act: 'Labour Welfare Fund Act', frequency: 'Half-Yearly', dueDate: '2026-07-15', category: 'LWF', status: 'Upcoming', penalty: '₹5,000' },
  { id: 'cal-010', compliance: 'Annual PF Return (Form 3A/6A)', act: 'Employees Provident Funds Act', frequency: 'Annual', dueDate: '2026-09-30', category: 'PF', status: 'Upcoming', penalty: '₹5,000' },
];

const FB_FILINGS = [
  { id: 'fil-001', filingType: 'PF Challan', period: 'May 2026', dueDate: '2026-06-15', filedDate: '2026-06-13', amount: 184320, challanNo: 'PF/MH/2026/06/001', status: 'Filed', category: 'PF' },
  { id: 'fil-002', filingType: 'ESI Challan', period: 'May 2026', dueDate: '2026-06-15', filedDate: '2026-06-14', amount: 43200, challanNo: 'ESI/2026/06/021', status: 'Filed', category: 'ESI' },
  { id: 'fil-003', filingType: 'TDS Payment (26Q)', period: 'May 2026', dueDate: '2026-06-07', filedDate: '2026-06-06', amount: 95600, challanNo: 'OLTAS/2026/06/TDS', status: 'Filed', category: 'TDS' },
  { id: 'fil-004', filingType: 'Professional Tax', period: 'May 2026', dueDate: '2026-06-10', filedDate: '2026-06-09', amount: 12050, challanNo: 'PT/MH/2026/06/009', status: 'Filed', category: 'PT' },
  { id: 'fil-005', filingType: 'PF Challan', period: 'Apr 2026', dueDate: '2026-05-15', filedDate: '2026-05-14', amount: 181440, challanNo: 'PF/MH/2026/05/001', status: 'Filed', category: 'PF' },
  { id: 'fil-006', filingType: 'TDS Quarterly Return (24Q)', period: 'Q4 FY 2025-26', dueDate: '2026-05-31', filedDate: '2026-05-28', amount: 0, challanNo: 'TRACES/24Q/2026/Q4', status: 'Filed', category: 'TDS' },
  { id: 'fil-007', filingType: 'PF Challan', period: 'Jun 2026', dueDate: '2026-07-15', filedDate: null, amount: 186240, challanNo: null, status: 'Pending', category: 'PF' },
  { id: 'fil-008', filingType: 'ESI Challan', period: 'Jun 2026', dueDate: '2026-07-15', filedDate: null, amount: 44100, challanNo: null, status: 'Pending', category: 'ESI' },
];

const FB_REPORTS = [
  { id: 'rep-001', reportName: 'Form 16 (Part A + B)', description: 'TDS certificate issued to employees for FY 2025-26', period: 'FY 2025-26', generatedDate: null, status: 'Pending Generation', category: 'TDS' },
  { id: 'rep-002', reportName: 'Form 24Q (Q4)', description: 'TDS return on salary for Q4 FY 2025-26', period: 'Q4 FY 2025-26', generatedDate: '2026-05-28', status: 'Filed', category: 'TDS' },
  { id: 'rep-003', reportName: 'PF ECR (May 2026)', description: 'Electronic Challan-cum-Return for PF contributions', period: 'May 2026', generatedDate: '2026-06-12', status: 'Filed', category: 'PF' },
  { id: 'rep-004', reportName: 'PF ECR (Jun 2026)', description: 'Electronic Challan-cum-Return for PF contributions', period: 'Jun 2026', generatedDate: null, status: 'Ready to Generate', category: 'PF' },
  { id: 'rep-005', reportName: 'ESI Monthly Statement', description: 'ESI contributions for May 2026', period: 'May 2026', generatedDate: '2026-06-13', status: 'Filed', category: 'ESI' },
  { id: 'rep-006', reportName: 'PT Challan Report', description: 'Professional Tax challan details for May 2026', period: 'May 2026', generatedDate: '2026-06-08', status: 'Filed', category: 'PT' },
  { id: 'rep-007', reportName: 'Annual PF Return (Form 3A)', description: 'Annual member-wise PF contribution statement', period: 'FY 2025-26', generatedDate: null, status: 'Pending Generation', category: 'PF' },
];

const FB_CHECKLIST = [
  { id: 'chk-001', item: 'PF registration number obtained', category: 'PF', completed: true, completedDate: '2021-04-01', remarks: 'PF Code: MH/BGN/0012345' },
  { id: 'chk-002', item: 'ESI registration certificate renewed', category: 'ESI', completed: true, completedDate: '2026-01-15', remarks: 'ESI Code: 53001234500' },
  { id: 'chk-003', item: 'Professional Tax registration active', category: 'PT', completed: true, completedDate: '2021-04-01', remarks: 'PT Reg No: MH12345678' },
  { id: 'chk-004', item: 'TAN registration with TRACES portal', category: 'TDS', completed: true, completedDate: '2021-06-01', remarks: 'TAN: PNEB12345A' },
  { id: 'chk-005', item: 'Form 16 issued to all employees', category: 'TDS', completed: false, completedDate: null, remarks: 'Due by 15-Jun-2026 — Overdue' },
  { id: 'chk-006', item: 'Labour Contract Compliance certificate', category: 'Labour', completed: true, completedDate: '2026-01-10', remarks: 'Valid till Mar 2027' },
  { id: 'chk-007', item: 'Annual POSH committee report filed', category: 'Labour', completed: true, completedDate: '2026-01-31', remarks: 'Filed with District Officer' },
  { id: 'chk-008', item: 'Minimum Wages compliance verified', category: 'Labour', completed: true, completedDate: '2026-04-01', remarks: 'All employees above minimum wage' },
  { id: 'chk-009', item: 'Gratuity trust registration', category: 'PF', completed: false, completedDate: null, remarks: 'In progress — legal team reviewing' },
  { id: 'chk-010', item: 'PF nomination forms collected (Form 2)', category: 'PF', completed: false, completedDate: null, remarks: '18 employees pending' },
];

const FB_DOCUMENTS = [
  { id: 'doc-001', employeeName: 'Ravi Kumar', employeeId: 'EMP-001', aadhar: 'Verified', pan: 'Verified', bankAccount: 'Verified', educationCerts: 'Verified', experienceCerts: 'Verified', overallStatus: 'Complete' },
  { id: 'doc-002', employeeName: 'Priya Sharma', employeeId: 'EMP-002', aadhar: 'Verified', pan: 'Verified', bankAccount: 'Verified', educationCerts: 'Pending', experienceCerts: 'Verified', overallStatus: 'Incomplete' },
  { id: 'doc-003', employeeName: 'Anil Mehta', employeeId: 'EMP-003', aadhar: 'Verified', pan: 'Pending', bankAccount: 'Verified', educationCerts: 'Verified', experienceCerts: 'Missing', overallStatus: 'Incomplete' },
  { id: 'doc-004', employeeName: 'Sunita Reddy', employeeId: 'EMP-004', aadhar: 'Verified', pan: 'Verified', bankAccount: 'Pending', educationCerts: 'Verified', experienceCerts: 'Verified', overallStatus: 'Incomplete' },
  { id: 'doc-005', employeeName: 'Kiran Joshi', employeeId: 'EMP-005', aadhar: 'Verified', pan: 'Verified', bankAccount: 'Verified', educationCerts: 'Verified', experienceCerts: 'Verified', overallStatus: 'Complete' },
];

// ── Compliance Calendar Tab ───────────────────────────────────────────────────

function ComplianceCalendarTab() {
  const [catFilter, setCatFilter] = React.useState('All');
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ['compliance-calendar'],
    queryFn: async () => {
      try { const { data } = await complianceService.listCalendar({ limit: 50 }); return data; }
      catch { return { data: FB_CALENDAR }; }
    },
  });
  const items: any[] = (data?.data?.length ? data.data : FB_CALENDAR);

  const cats = ['All', ...Array.from(new Set(items.map(i => i.category)))];
  const filtered = catFilter === 'All' ? items : items.filter(i => i.category === catFilter);

  const overdueCount = items.filter(i => daysUntil(i.dueDate) < 0).length;
  const dueSoonCount = items.filter(i => { const d = daysUntil(i.dueDate); return d >= 0 && d <= 7; }).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className={`rounded-xl border p-4 ${overdueCount > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
          <p className={`text-2xl font-bold ${overdueCount > 0 ? 'text-red-700' : 'text-gray-900'}`}>{overdueCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Overdue Compliances</p>
        </div>
        <div className={`rounded-xl border p-4 ${dueSoonCount > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-200'}`}>
          <p className={`text-2xl font-bold ${dueSoonCount > 0 ? 'text-yellow-700' : 'text-gray-900'}`}>{dueSoonCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Due This Week</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{items.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Tracked</p>
        </div>
      </div>

      {overdueCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle size={18} className="text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-800">{overdueCount} compliance obligation{overdueCount > 1 ? 's are' : ' is'} overdue. Immediate action required to avoid penalties.</p>
        </div>
      )}

      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {cats.map(c => (
          <button key={c} onClick={() => setCatFilter(c)}
            className={`px-3 py-1 rounded text-xs font-medium ${catFilter === c ? 'bg-white shadow text-primary' : 'text-gray-600'}`}>{c}</button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((item: any) => {
          const days = daysUntil(item.dueDate);
          const variant = urgencyVariant(days);
          const expanded = expandedId === item.id;
          return (
            <div key={item.id} className={`bg-white rounded-xl border overflow-hidden ${days < 0 ? 'border-red-200' : days <= 7 ? 'border-yellow-200' : 'border-gray-200'}`}>
              <div
                className="flex items-center gap-4 px-5 py-3.5 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedId(expanded ? null : item.id)}
              >
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-900">{item.compliance}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.act}</p>
                </div>
                <Badge variant={catFilter === 'All' ? 'info' : 'default'}>{item.category}</Badge>
                <div className="text-right">
                  <p className="text-sm font-medium">{safeDate(item.dueDate)}</p>
                  <p className="text-xs text-gray-400">{item.frequency}</p>
                </div>
                <Badge variant={variant}>{urgencyLabel(days)}</Badge>
                {expanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
              </div>
              {expanded && (
                <div className="border-t border-gray-100 px-5 py-3 bg-gray-50 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-400">Applicable Act</p>
                    <p className="font-medium mt-0.5">{item.act}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Frequency</p>
                    <p className="font-medium mt-0.5">{item.frequency}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Non-Compliance Penalty</p>
                    <p className="font-medium mt-0.5 text-red-600">{item.penalty}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Statutory Filings Tab ─────────────────────────────────────────────────────

const filingSchema = z.object({
  filingType: z.string().min(1, 'Required'),
  period: z.string().min(1, 'Required'),
  dueDate: z.string().min(1, 'Required'),
  amount: z.coerce.number().min(0),
  challanNo: z.string().optional(),
  remarks: z.string().optional(),
});

function FilingsTab() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = React.useState(false);
  const [catFilter, setCatFilter] = React.useState('All');

  const { data, isLoading } = useQuery({
    queryKey: ['statutory-filings'],
    queryFn: async () => {
      try { const { data } = await complianceService.listFilings({ limit: 50 }); return data; }
      catch { return { data: FB_FILINGS }; }
    },
  });
  const filings: any[] = (data?.data?.length ? data.data : FB_FILINGS);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof filingSchema>>({ resolver: zodResolver(filingSchema) });

  const createMut = useMutation({
    mutationFn: (d: any) => complianceService.createFiling(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['statutory-filings'] }); reset(); setShowForm(false); },
    onError: () => { reset(); setShowForm(false); },
  });

  const markFiledMut = useMutation({
    mutationFn: ({ id, challanNo }: { id: string; challanNo: string }) =>
      complianceService.markFiled(id, challanNo),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['statutory-filings'] }),
  });

  const cats = ['All', ...Array.from(new Set(filings.map(f => f.category)))];
  const filtered = catFilter === 'All' ? filings : filings.filter(f => f.category === catFilter);
  const pendingCount = filings.filter(f => f.status === 'Pending').length;
  const totalFiled = filings.filter(f => f.status === 'Filed').length;

  function formatAmount(n: number) {
    if (!n) return '—';
    return `₹${n.toLocaleString('en-IN')}`;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{totalFiled}</p>
          <p className="text-xs text-gray-500 mt-0.5">Filings Completed</p>
        </div>
        <div className={`rounded-xl border p-4 ${pendingCount > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-200'}`}>
          <p className={`text-2xl font-bold ${pendingCount > 0 ? 'text-yellow-700' : 'text-gray-900'}`}>{pendingCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Pending Filings</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{filings.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Records</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
          {cats.map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={`px-3 py-1 rounded text-xs font-medium ${catFilter === c ? 'bg-white shadow text-primary' : 'text-gray-600'}`}>{c}</button>
          ))}
        </div>
        <Button size="sm" onClick={() => setShowForm(v => !v)}><Plus size={14} /> Add Filing</Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <form onSubmit={handleSubmit(d => createMut.mutate(d))} className="grid grid-cols-2 gap-3">
            <Select label="Filing Type *" options={[
              { value: 'PF Challan', label: 'PF Challan' },
              { value: 'ESI Challan', label: 'ESI Challan' },
              { value: 'TDS Payment (26Q)', label: 'TDS Payment (26Q)' },
              { value: 'TDS Quarterly Return (24Q)', label: 'TDS Quarterly Return (24Q)' },
              { value: 'Professional Tax', label: 'Professional Tax' },
              { value: 'Labour Welfare Fund', label: 'Labour Welfare Fund' },
              { value: 'PF ECR', label: 'PF ECR' },
            ]} {...register('filingType')} />
            <Input label="Period *" placeholder="e.g. Jun 2026" error={errors.period?.message as string} {...register('period')} />
            <Input label="Due Date *" type="date" error={errors.dueDate?.message as string} {...register('dueDate')} />
            <Input label="Amount (₹)" type="number" {...register('amount')} />
            <Input label="Challan / Reference No." {...register('challanNo')} />
            <Input label="Remarks" {...register('remarks')} />
            <div className="col-span-2 flex gap-2">
              <Button type="submit" size="sm" loading={createMut.isPending}>Save Record</Button>
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
              {['Filing Type', 'Period', 'Due Date', 'Filed Date', 'Amount', 'Challan No.', 'Status', 'Action'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((f: any) => (
                <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium">{f.filingType}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{f.period}</td>
                  <td className="px-4 py-3 text-sm">{safeDate(f.dueDate)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{f.filedDate ? safeDate(f.filedDate) : '—'}</td>
                  <td className="px-4 py-3 text-sm font-medium">{formatAmount(f.amount)}</td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-500">{f.challanNo || '—'}</td>
                  <td className="px-4 py-3">
                    <Badge variant={f.status === 'Filed' ? 'success' : f.status === 'Pending' ? 'warning' : 'danger'}>{f.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {f.status === 'Pending' ? (
                      <Button size="sm" onClick={() => {
                        const challanNo = prompt('Enter Challan/Reference Number:');
                        if (challanNo) markFiledMut.mutate({ id: f.id, challanNo });
                      }}>
                        <Check size={12} /> Mark Filed
                      </Button>
                    ) : (
                      <button className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-primary" title="Download">
                        <Download size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-400">No records found.</td></tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Statutory Reports Tab ─────────────────────────────────────────────────────

function StatutoryReportsTab() {
  const [catFilter, setCatFilter] = React.useState('All');
  const [generating, setGenerating] = React.useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['statutory-reports'],
    queryFn: async () => {
      try { const { data } = await complianceService.listReports({ limit: 30 }); return data; }
      catch { return { data: FB_REPORTS }; }
    },
  });
  const reports: any[] = (data?.data?.length ? data.data : FB_REPORTS);

  const cats = ['All', ...Array.from(new Set(reports.map(r => r.category)))];
  const filtered = catFilter === 'All' ? reports : reports.filter(r => r.category === catFilter);

  async function handleGenerate(id: string) {
    setGenerating(id);
    try {
      await complianceService.generateReport(id);
      refetch();
    } catch { /* fallback */ }
    finally { setTimeout(() => setGenerating(null), 1500); }
  }

  const statusVariant = (s: string) =>
    s === 'Filed' ? 'success' : s === 'Ready to Generate' ? 'info' : s === 'Pending Generation' ? 'warning' : 'default';

  if (isLoading) return <div className="p-6 text-center"><Spinner /></div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-50 rounded-xl border border-green-200 p-4">
          <p className="text-2xl font-bold text-green-700">{reports.filter(r => r.status === 'Filed').length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Reports Filed</p>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <p className="text-2xl font-bold text-blue-700">{reports.filter(r => r.status === 'Ready to Generate').length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Ready to Generate</p>
        </div>
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4">
          <p className="text-2xl font-bold text-yellow-700">{reports.filter(r => r.status === 'Pending Generation').length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Pending Generation</p>
        </div>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {cats.map(c => (
          <button key={c} onClick={() => setCatFilter(c)}
            className={`px-3 py-1 rounded text-xs font-medium ${catFilter === c ? 'bg-white shadow text-primary' : 'text-gray-600'}`}>{c}</button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((report: any) => (
          <div key={report.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <FileText size={18} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-sm text-gray-900">{report.reportName}</h3>
                  <Badge variant={statusVariant(report.status)}>{report.status}</Badge>
                  <Badge variant="info">{report.category}</Badge>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{report.description}</p>
                <p className="text-xs text-gray-400 mt-1">Period: {report.period} {report.generatedDate ? `· Generated: ${safeDate(report.generatedDate)}` : ''}</p>
              </div>
              <div className="flex gap-2 items-center flex-shrink-0">
                {(report.status === 'Ready to Generate' || report.status === 'Pending Generation') && (
                  <Button
                    size="sm"
                    loading={generating === report.id}
                    onClick={() => handleGenerate(report.id)}
                  >
                    Generate
                  </Button>
                )}
                {report.status === 'Filed' && (
                  <button className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-primary" title="Download Report">
                    <Download size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-400">
            <Shield size={36} className="mx-auto mb-2 text-gray-300" />
            <p>No reports found</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Audit Checklist Tab ───────────────────────────────────────────────────────

function AuditChecklistTab() {
  const [catFilter, setCatFilter] = React.useState('All');
  const [localItems, setLocalItems] = React.useState<any[]>([]);
  const [showForm, setShowForm] = React.useState(false);
  const [newItem, setNewItem] = React.useState({ item: '', category: 'PF', remarks: '' });

  const { data } = useQuery({
    queryKey: ['compliance-checklist'],
    queryFn: async () => {
      try { const { data } = await complianceService.listChecklist({ limit: 50 }); return data; }
      catch { return { data: FB_CHECKLIST }; }
    },
  });

  React.useEffect(() => {
    if (localItems.length === 0 && data?.data) {
      setLocalItems(data.data.length > 0 ? data.data : FB_CHECKLIST);
    }
  }, [data]);

  React.useEffect(() => {
    if (localItems.length === 0) setLocalItems(FB_CHECKLIST);
  }, []);

  const toggleItem = async (id: string) => {
    setLocalItems(prev => prev.map(i => i.id === id ? { ...i, completed: !i.completed, completedDate: !i.completed ? new Date().toISOString().split('T')[0] : null } : i));
    try { await complianceService.toggleChecklistItem(id); } catch { /* optimistic */ }
  };

  const addItem = () => {
    if (!newItem.item.trim()) return;
    const item = { id: `chk-${Date.now()}`, ...newItem, completed: false, completedDate: null };
    setLocalItems(prev => [...prev, item]);
    setNewItem({ item: '', category: 'PF', remarks: '' });
    setShowForm(false);
  };

  const cats = ['All', ...Array.from(new Set(localItems.map((i: any) => i.category)))];
  const filtered = catFilter === 'All' ? localItems : localItems.filter((i: any) => i.category === catFilter);
  const completedCount = localItems.filter((i: any) => i.completed).length;
  const totalCount = localItems.length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-50 rounded-xl border border-green-200 p-4">
          <p className="text-2xl font-bold text-green-700">{completedCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Completed</p>
        </div>
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4">
          <p className="text-2xl font-bold text-yellow-700">{totalCount - completedCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Pending Action</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%</p>
          <p className="text-xs text-gray-500 mt-0.5">Compliance Score</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>Overall Audit Compliance</span>
          <span>{completedCount}/{totalCount} items complete</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all ${completedCount / totalCount >= 0.8 ? 'bg-green-500' : completedCount / totalCount >= 0.5 ? 'bg-yellow-500' : 'bg-red-400'}`}
            style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
          {cats.map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={`px-3 py-1 rounded text-xs font-medium ${catFilter === c ? 'bg-white shadow text-primary' : 'text-gray-600'}`}>{c}</button>
          ))}
        </div>
        <Button size="sm" onClick={() => setShowForm(v => !v)}><Plus size={14} /> Add Item</Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Input label="Checklist Item *" value={newItem.item} onChange={(e: any) => setNewItem(p => ({ ...p, item: e.target.value }))} placeholder="e.g. Form F nomination collected" />
            </div>
            <Select label="Category" options={[
              { value: 'PF', label: 'PF' }, { value: 'ESI', label: 'ESI' }, { value: 'TDS', label: 'TDS' },
              { value: 'PT', label: 'PT' }, { value: 'Labour', label: 'Labour' }, { value: 'Other', label: 'Other' },
            ]} value={newItem.category} onChange={(e: any) => setNewItem(p => ({ ...p, category: e.target.value }))} />
            <div className="col-span-3">
              <Input label="Remarks" value={newItem.remarks} onChange={(e: any) => setNewItem(p => ({ ...p, remarks: e.target.value }))} />
            </div>
            <div className="col-span-3 flex gap-2">
              <Button size="sm" onClick={addItem}>Add</Button>
              <Button size="sm" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="divide-y">
          {filtered.map((item: any) => (
            <div key={item.id} className={`flex items-center gap-4 px-5 py-3.5 ${item.completed ? '' : 'bg-white'}`}>
              <button
                onClick={() => toggleItem(item.id)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${item.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-green-400'}`}
              >
                {item.completed && <Check size={12} className="text-white" />}
              </button>
              <div className="flex-1">
                <p className={`text-sm font-medium ${item.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{item.item}</p>
                {item.remarks && <p className="text-xs text-gray-400 mt-0.5">{item.remarks}</p>}
              </div>
              <Badge variant="info">{item.category}</Badge>
              {item.completed && item.completedDate ? (
                <div className="text-right">
                  <p className="text-xs text-gray-400">Completed</p>
                  <p className="text-xs text-green-600 font-medium">{safeDate(item.completedDate)}</p>
                </div>
              ) : (
                <div className="text-right">
                  <Badge variant="warning">Pending</Badge>
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-gray-400">No items found</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Document Compliance Tab ───────────────────────────────────────────────────

function DocumentComplianceTab() {
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('All');

  const { data, isLoading } = useQuery({
    queryKey: ['document-compliance'],
    queryFn: async () => {
      try { const { data } = await complianceService.listDocuments({ limit: 50 }); return data; }
      catch { return { data: FB_DOCUMENTS }; }
    },
  });
  const items: any[] = (data?.data?.length ? data.data : FB_DOCUMENTS);

  const filtered = items.filter(i => {
    const matchesSearch = !search || i.employeeName.toLowerCase().includes(search.toLowerCase()) || i.employeeId.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || i.overallStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const completeCount = items.filter(i => i.overallStatus === 'Complete').length;
  const incompleteCount = items.filter(i => i.overallStatus === 'Incomplete').length;

  function docStatusBadge(s: string) {
    if (s === 'Verified') return <span className="inline-flex items-center gap-1 text-xs text-green-700 font-medium"><CheckCircle size={12} />Verified</span>;
    if (s === 'Pending') return <span className="inline-flex items-center gap-1 text-xs text-yellow-700 font-medium"><Clock size={12} />Pending</span>;
    if (s === 'Missing') return <span className="inline-flex items-center gap-1 text-xs text-red-700 font-medium"><X size={12} />Missing</span>;
    return <span className="text-xs text-gray-400">{s}</span>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{items.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Employees Tracked</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 p-4">
          <p className="text-2xl font-bold text-green-700">{completeCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Fully Compliant</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 p-4">
          <p className="text-2xl font-bold text-red-700">{incompleteCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Documents Missing / Pending</p>
        </div>
      </div>

      <div className="flex gap-3 items-center">
        <Input
          placeholder="Search by name or ID..."
          value={search}
          onChange={(e: any) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {['All', 'Complete', 'Incomplete'].map(f => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className={`px-3 py-1 rounded text-xs font-medium ${statusFilter === f ? 'bg-white shadow text-primary' : 'text-gray-600'}`}>{f}</button>
          ))}
        </div>
      </div>

      {isLoading ? <div className="p-6 text-center"><Spinner /></div> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead><tr className="bg-gray-50 border-b border-gray-200">
              {['Employee', 'Aadhaar', 'PAN', 'Bank Account', 'Education Certs', 'Experience Certs', 'Status'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((item: any) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-gray-900">{item.employeeName}</p>
                    <p className="text-xs text-gray-400">{item.employeeId}</p>
                  </td>
                  <td className="px-4 py-3">{docStatusBadge(item.aadhar)}</td>
                  <td className="px-4 py-3">{docStatusBadge(item.pan)}</td>
                  <td className="px-4 py-3">{docStatusBadge(item.bankAccount)}</td>
                  <td className="px-4 py-3">{docStatusBadge(item.educationCerts)}</td>
                  <td className="px-4 py-3">{docStatusBadge(item.experienceCerts)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={item.overallStatus === 'Complete' ? 'success' : 'danger'}>{item.overallStatus}</Badge>
                  </td>
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

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CompliancePage() {
  const [tab, setTab] = React.useState('calendar');

  return (
    <div>
      <PageHeader title="Compliance Management" subtitle="Statutory filings, compliance calendar, audit checklist & document verification" />

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

      {tab === 'calendar'  && <ComplianceCalendarTab />}
      {tab === 'filings'   && <FilingsTab />}
      {tab === 'reports'   && <StatutoryReportsTab />}
      {tab === 'checklist' && <AuditChecklistTab />}
      {tab === 'documents' && <DocumentComplianceTab />}
    </div>
  );
}
