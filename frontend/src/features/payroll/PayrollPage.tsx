import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Banknote, FileText, Receipt, BarChart2, Layers,
  Plus, Play, Check, X, Download, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Input, Select, Badge, Spinner } from '@components/ui/Input';
import { formatDate, formatCurrency } from '@lib/utils';
import api from '@lib/axios';
import { PageHeader } from '@components/ui/PageHeader';
import { ConfirmDialog } from '@components/ui/ConfirmDialog';

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
  { key: 'runs',      label: 'Payroll Runs',      icon: Banknote },
  { key: 'salary',    label: 'Salary Structures',  icon: Layers },
  { key: 'payslips',  label: 'My Payslips',        icon: FileText },
  { key: 'expenses',  label: 'Expenses',            icon: Receipt },
  { key: 'statutory', label: 'Statutory',           icon: BarChart2 },
];

const EXPENSE_CATEGORIES = [
  { value: 'Travel', label: 'Travel' },
  { value: 'Meals', label: 'Meals' },
  { value: 'Accommodation', label: 'Accommodation' },
  { value: 'Communication', label: 'Communication' },
  { value: 'Medical', label: 'Medical' },
  { value: 'Training', label: 'Training' },
  { value: 'Other', label: 'Other' },
];

// ── Payroll Runs tab ──────────────────────────────────────────────────────────

const runSchema = z.object({
  periodStart: z.string().min(1, 'Required'),
  periodEnd: z.string().min(1, 'Required'),
  paymentDate: z.string().min(1, 'Required'),
  notes: z.string().optional(),
});

function PayrollRunsTab() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = React.useState(false);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['payroll-runs'],
    queryFn: async () => { const { data } = await api.get('/payroll/runs?limit=30'); return data; },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof runSchema>>({ resolver: zodResolver(runSchema) });

  const createMutation = useMutation({
    mutationFn: (d: any) => api.post('/payroll/runs', d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['payroll-runs'] }); reset(); setShowForm(false); },
  });

  const processMutation = useMutation({
    mutationFn: (id: string) => api.post(`/payroll/runs/${id}/process`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payroll-runs'] }),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.post(`/payroll/runs/${id}/approve`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payroll-runs'] }),
  });

  const runs: any[] = data?.data ?? [];
  const total = runs.reduce((s, r) => s + Number(r.totalNetPay ?? r.total_net_pay ?? 0), 0);
  const processed = runs.filter(r => r.status === 'Approved' || r.status === 'Processed').length;

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{runs.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Runs</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 p-4">
          <p className="text-2xl font-bold text-green-700">{processed}</p>
          <p className="text-xs text-gray-500 mt-0.5">Processed / Approved</p>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <p className="text-2xl font-bold text-blue-700">{safeCurrency(total)}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Net Pay (All Runs)</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">Payroll Runs</h3>
        <Button size="sm" onClick={() => setShowForm(v => !v)}><Plus size={14} /> New Run</Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <form onSubmit={handleSubmit(d => createMutation.mutate(d))} className="grid grid-cols-3 gap-3">
            <Input label="Period Start *" type="date" error={errors.periodStart?.message as string} {...register('periodStart')} />
            <Input label="Period End *" type="date" error={errors.periodEnd?.message as string} {...register('periodEnd')} />
            <Input label="Payment Date *" type="date" error={errors.paymentDate?.message as string} {...register('paymentDate')} />
            <div className="col-span-3">
              <Input label="Notes" {...register('notes')} />
            </div>
            <div className="col-span-3 flex gap-2">
              <Button type="submit" size="sm" loading={createMutation.isPending}>Create Run</Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => { reset(); setShowForm(false); }}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? <div className="p-8 text-center"><Spinner /></div> : (
        <div className="space-y-2">
          {runs.map((r: any) => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div
                className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">{r.runCode ?? r.run_code ?? 'PR-' + r.id?.slice(0,8)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{safeDate(r.periodStart ?? r.period_start)} → {safeDate(r.periodEnd ?? r.period_end)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">{r.totalEmployees ?? r.total_employees ?? 0}</p>
                  <p className="text-[10px] text-gray-400">Employees</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-green-700">{safeCurrency(r.totalNetPay ?? r.total_net_pay)}</p>
                  <p className="text-[10px] text-gray-400">Net Pay</p>
                </div>
                <Badge variant={r.status === 'Approved' ? 'success' : r.status === 'Processed' ? 'info' : r.status === 'Draft' ? 'default' : 'warning'}>{r.status ?? 'Draft'}</Badge>
                <div className="flex gap-2 items-center">
                  {(r.status === 'Draft') && (
                    <Button size="sm" onClick={e => { e.stopPropagation(); processMutation.mutate(r.id); }} loading={processMutation.isPending}>
                      <Play size={12} /> Process
                    </Button>
                  )}
                  {(r.status === 'Processed') && (
                    <Button size="sm" onClick={e => { e.stopPropagation(); approveMutation.mutate(r.id); }} loading={approveMutation.isPending}>
                      <Check size={12} /> Approve
                    </Button>
                  )}
                  {expandedId === r.id ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                </div>
              </div>

              {expandedId === r.id && (
                <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    {[
                      { label: 'Gross Earnings', value: safeCurrency(r.totalGrossEarnings ?? r.total_gross_earnings) },
                      { label: 'Total Deductions', value: safeCurrency(r.totalDeductions ?? r.total_deductions) },
                      { label: 'PF Contribution', value: safeCurrency(r.totalPfContribution ?? r.total_pf_contribution) },
                      { label: 'Payment Date', value: safeDate(r.paymentDate ?? r.payment_date) },
                    ].map(item => (
                      <div key={item.label}>
                        <p className="text-xs text-gray-400">{item.label}</p>
                        <p className="font-medium mt-0.5">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  {r.notes && <p className="text-xs text-gray-500 mt-3">Note: {r.notes}</p>}
                </div>
              )}
            </div>
          ))}
          {runs.length === 0 && (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-400">
              <Banknote size={36} className="mx-auto mb-2 text-gray-300" />
              <p>No payroll runs yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Salary Structures tab ─────────────────────────────────────────────────────

const salaryStructSchema = z.object({
  structureName: z.string().min(1, 'Required'),
  basicPercent: z.coerce.number().min(0).max(100),
  hraPercent: z.coerce.number().min(0).max(100),
  daPercent: z.coerce.number().min(0).max(100),
  taAmount: z.coerce.number().min(0),
  medicalAllowance: z.coerce.number().min(0),
  pfApplicable: z.string(),
  esiApplicable: z.string(),
});

function SalaryStructuresTab() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = React.useState(false);
  const [selectedStruct, setSelectedStruct] = React.useState<any>(null);
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['salary-structures'],
    queryFn: async () => { const { data } = await api.get('/payroll/salary-structures?limit=30'); return data; },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(salaryStructSchema),
    defaultValues: { basicPercent: 40, hraPercent: 20, daPercent: 10, taAmount: 1600, medicalAllowance: 1250, pfApplicable: 'true', esiApplicable: 'true' },
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => api.post('/payroll/salary-structures', { ...d, pfApplicable: d.pfApplicable === 'true', esiApplicable: d.esiApplicable === 'true' }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['salary-structures'] }); reset(); setShowForm(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/payroll/salary-structures/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['salary-structures'] }); if (selectedStruct?.id === 'TBD') setSelectedStruct(null); },
  });

  const structs: any[] = data?.data ?? [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Left: list */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-900 text-sm">Structures</h3>
          <Button size="sm" onClick={() => setShowForm(v => !v)}><Plus size={12} /></Button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <form onSubmit={handleSubmit(d => createMutation.mutate(d))} className="space-y-2">
              <Input label="Structure Name *" error={errors.structureName?.message as string} {...register('structureName')} />
              <div className="grid grid-cols-2 gap-2">
                <Input label="Basic %" type="number" {...register('basicPercent')} />
                <Input label="HRA %" type="number" {...register('hraPercent')} />
                <Input label="DA %" type="number" {...register('daPercent')} />
                <Input label="TA (₹)" type="number" {...register('taAmount')} />
                <Input label="Medical (₹)" type="number" {...register('medicalAllowance')} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Select label="PF" options={[{value:'true',label:'Yes'},{value:'false',label:'No'}]} {...register('pfApplicable')} />
                <Select label="ESI" options={[{value:'true',label:'Yes'},{value:'false',label:'No'}]} {...register('esiApplicable')} />
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" loading={createMutation.isPending}>Save</Button>
                <Button type="button" size="sm" variant="secondary" onClick={() => { reset(); setShowForm(false); }}>Cancel</Button>
              </div>
            </form>
          </div>
        )}

        {isLoading ? <Spinner /> : structs.map(s => (
          <button
            key={s.id}
            onClick={() => setSelectedStruct(s)}
            className={`w-full text-left bg-white rounded-xl border p-3 hover:shadow-sm transition-shadow ${selectedStruct?.id === s.id ? 'border-primary' : 'border-gray-200'}`}
          >
            <p className="font-medium text-sm text-gray-900">{s.structureName ?? s.structure_name}</p>
            <p className="text-xs text-gray-400 mt-0.5">Basic: {s.basicPercent ?? s.basic_percent}% · HRA: {s.hraPercent ?? s.hra_percent}%</p>
          </button>
        ))}
        {!isLoading && structs.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No structures yet</p>}
      </div>

      {/* Right: detail */}
      <div className="lg:col-span-2">
        {!selectedStruct ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 h-full p-10 flex items-center justify-center text-gray-400">
            <p className="text-sm">Select a structure to view details</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-gray-900 text-lg">{selectedStruct.structureName ?? selectedStruct.structure_name}</h3>
              <button onClick={() => setConfirmDelete(true)} className="p-1.5 text-gray-300 hover:text-danger hover:bg-red-50 rounded" aria-label="Delete salary structure" aria-label="Delete" title="Delete">
                <X size={14} />
              </button>
            </div>

            {/* Visual component breakdown */}
            <div className="space-y-2 mb-6">
              {[
                { label: 'Basic Salary', value: `${selectedStruct.basicPercent ?? selectedStruct.basic_percent ?? 40}% of CTC`, color: 'bg-blue-500', width: Number(selectedStruct.basicPercent ?? selectedStruct.basic_percent ?? 40) },
                { label: 'HRA', value: `${selectedStruct.hraPercent ?? selectedStruct.hra_percent ?? 20}% of CTC`, color: 'bg-purple-500', width: Number(selectedStruct.hraPercent ?? selectedStruct.hra_percent ?? 20) },
                { label: 'DA', value: `${selectedStruct.daPercent ?? selectedStruct.da_percent ?? 10}% of CTC`, color: 'bg-indigo-400', width: Number(selectedStruct.daPercent ?? selectedStruct.da_percent ?? 10) },
                { label: 'Transport Allowance', value: `₹${(selectedStruct.taAmount ?? selectedStruct.ta_amount ?? 1600).toLocaleString('en-IN')}/mo`, color: 'bg-teal-400', width: 5 },
                { label: 'Medical Allowance', value: `₹${(selectedStruct.medicalAllowance ?? selectedStruct.medical_allowance ?? 1250).toLocaleString('en-IN')}/mo`, color: 'bg-green-400', width: 5 },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-36 text-xs text-gray-600 text-right shrink-0">{item.label}</div>
                  <div className="flex-1 h-5 bg-gray-100 rounded overflow-hidden">
                    <div className={`h-5 ${item.color} rounded`} style={{ width: `${Math.min(item.width, 100)}%` }} />
                  </div>
                  <div className="w-36 text-xs text-gray-500 shrink-0">{item.value}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: 'PF Applicable', value: (selectedStruct.pfApplicable ?? selectedStruct.pf_applicable) ? '✓ Yes' : '✗ No' },
                { label: 'ESI Applicable', value: (selectedStruct.esiApplicable ?? selectedStruct.esi_applicable) ? '✓ Yes' : '✗ No' },
                { label: 'Gratuity', value: (selectedStruct.gratuityApplicable ?? selectedStruct.gratuity_applicable) ? '✓ Yes' : '✗ No' },
                { label: 'Professional Tax', value: (selectedStruct.ptApplicable ?? selectedStruct.pt_applicable) !== false ? '✓ Yes' : '✗ No' },
              ].map(item => (
                <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400">{item.label}</p>
                  <p className="font-medium mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => { deleteMutation.mutate(selectedStruct!.id); setSelectedStruct(null); setConfirmDelete(false); }}
        title="Delete Salary Structure"
        message={`Delete "${selectedStruct?.structureName ?? selectedStruct?.structure_name}"? This cannot be undone.`}
        confirmLabel="Delete Structure"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

// ── My Payslips tab ───────────────────────────────────────────────────────────

function MyPayslipsTab() {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['my-payslips'],
    queryFn: async () => { const { data } = await api.get('/payroll/my-payslips'); return data; },
  });

  const payslips: any[] = data?.data ?? [];

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-3">
      {payslips.map((p: any) => {
        const gross = Number(p.grossEarnings ?? p.gross_earnings ?? 0);
        const deductions = Number(p.totalDeductions ?? p.total_deductions ?? 0);
        const net = Number(p.netPay ?? p.net_pay ?? 0);
        const expanded = expandedId === p.id;

        return (
          <div key={p.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div
              className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50"
              onClick={() => setExpandedId(expanded ? null : p.id)}
            >
              <div className="flex-1">
                <p className="font-semibold text-sm">{p.payrollRun?.runCode ?? p.run_code ?? safeDate(p.payrollRun?.periodStart ?? p.period_start)}</p>
                <p className="text-xs text-gray-400 mt-0.5">{safeDate(p.payrollRun?.periodStart ?? p.period_start)} → {safeDate(p.payrollRun?.periodEnd ?? p.period_end)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Gross</p>
                <p className="text-sm font-medium">{safeCurrency(gross)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Deductions</p>
                <p className="text-sm text-danger">{safeCurrency(deductions)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Net Pay</p>
                <p className="text-base font-bold text-green-700">{safeCurrency(net)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success">{p.status ?? 'Generated'}</Badge>
                <button className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-primary" title="Download" onClick={e => e.stopPropagation()}>
                  <Download size={14} />
                </button>
                {expanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
              </div>
            </div>

            {expanded && (
              <div className="border-t border-gray-100 px-5 py-4 bg-gray-50 grid grid-cols-2 gap-6">
                {/* Earnings */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Earnings</p>
                  <div className="space-y-1.5">
                    {[
                      { label: 'Basic Salary', key: 'basicSalary' },
                      { label: 'HRA', key: 'hraAmount' },
                      { label: 'DA', key: 'daAmount' },
                      { label: 'Transport Allowance', key: 'taAmount' },
                      { label: 'Medical Allowance', key: 'medicalAllowance' },
                      { label: 'Bonus', key: 'bonusAmount' },
                    ].map(item => {
                      const val = Number(p[item.key] ?? p[item.key.replace(/([A-Z])/g, '_$1').toLowerCase()] ?? 0);
                      return val > 0 ? (
                        <div key={item.key} className="flex justify-between text-sm">
                          <span className="text-gray-600">{item.label}</span>
                          <span className="font-medium">{safeCurrency(val)}</span>
                        </div>
                      ) : null;
                    })}
                    <div className="flex justify-between text-sm font-semibold border-t pt-1">
                      <span>Gross Earnings</span><span className="text-blue-700">{safeCurrency(gross)}</span>
                    </div>
                  </div>
                </div>
                {/* Deductions */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Deductions</p>
                  <div className="space-y-1.5">
                    {[
                      { label: 'PF (Employee)', key: 'pfEmployee' },
                      { label: 'ESI (Employee)', key: 'esiEmployee' },
                      { label: 'Professional Tax', key: 'professionalTax' },
                      { label: 'TDS', key: 'tdsAmount' },
                      { label: 'Loan Deduction', key: 'loanDeduction' },
                    ].map(item => {
                      const val = Number(p[item.key] ?? p[item.key.replace(/([A-Z])/g, '_$1').toLowerCase()] ?? 0);
                      return val > 0 ? (
                        <div key={item.key} className="flex justify-between text-sm">
                          <span className="text-gray-600">{item.label}</span>
                          <span className="font-medium text-danger">{safeCurrency(val)}</span>
                        </div>
                      ) : null;
                    })}
                    <div className="flex justify-between text-sm font-semibold border-t pt-1">
                      <span>Total Deductions</span><span className="text-danger">{safeCurrency(deductions)}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold border-t pt-1 text-green-700">
                      <span>Net Pay</span><span>{safeCurrency(net)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {payslips.length === 0 && (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-400">
          <FileText size={36} className="mx-auto mb-2 text-gray-300" />
          <p>No payslips available</p>
        </div>
      )}
    </div>
  );
}

// ── Expenses tab ──────────────────────────────────────────────────────────────

const expenseSchema = z.object({
  expenseDate: z.string().min(1, 'Required'),
  category: z.string().min(1, 'Required'),
  amount: z.coerce.number().min(1, 'Required'),
  description: z.string().min(1, 'Required'),
  receiptNumber: z.string().optional(),
});

function ExpensesTab() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState('All');

  const { data: myExpenses, isLoading } = useQuery({
    queryKey: ['my-expenses'],
    queryFn: async () => { const { data } = await api.get('/payroll/expenses/my?limit=50'); return data; },
  });

  const { data: pendingExpenses } = useQuery({
    queryKey: ['pending-expenses'],
    queryFn: async () => { const { data } = await api.get('/payroll/expenses?status=Pending&limit=50'); return data; },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: { category: 'Travel' },
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => api.post('/payroll/expenses', d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['my-expenses'] }); reset(); setShowForm(false); },
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'approve' | 'reject' }) =>
      api.patch(`/payroll/expenses/${id}/${action}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['pending-expenses'] }); queryClient.invalidateQueries({ queryKey: ['my-expenses'] }); },
  });

  const allExpenses: any[] = myExpenses?.data ?? [];
  const filteredExpenses = statusFilter === 'All' ? allExpenses : allExpenses.filter(e => e.status === statusFilter);
  const pendingList: any[] = pendingExpenses?.data ?? [];
  const totalPending = allExpenses.filter(e => e.status === 'Pending').reduce((s, e) => s + Number(e.amount ?? 0), 0);
  const totalApproved = allExpenses.filter(e => e.status === 'Approved').reduce((s, e) => s + Number(e.amount ?? 0), 0);

  const STATUS_FILTERS = ['All', 'Pending', 'Approved', 'Rejected'];

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-xl font-bold text-yellow-700">{safeCurrency(totalPending)}</p>
          <p className="text-xs text-gray-500 mt-0.5">Pending Reimbursement</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-xl font-bold text-green-700">{safeCurrency(totalApproved)}</p>
          <p className="text-xs text-gray-500 mt-0.5">Approved (All Time)</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-xl font-bold text-blue-700">{allExpenses.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Claims</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {STATUS_FILTERS.map(f => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className={`px-3 py-1 rounded text-xs font-medium ${statusFilter === f ? 'bg-white shadow text-primary' : 'text-gray-600'}`}>{f}</button>
          ))}
        </div>
        <Button size="sm" onClick={() => setShowForm(v => !v)}><Plus size={14} /> Submit Expense</Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <form onSubmit={handleSubmit(d => createMutation.mutate(d))} className="grid grid-cols-2 gap-3">
            <Input label="Date *" type="date" error={errors.expenseDate?.message as string} {...register('expenseDate')} />
            <Select label="Category *" options={EXPENSE_CATEGORIES} {...register('category')} />
            <Input label="Amount (₹) *" type="number" step="0.01" error={errors.amount?.message as string} {...register('amount')} />
            <Input label="Receipt #" {...register('receiptNumber')} />
            <div className="col-span-2"><Input label="Description *" error={errors.description?.message as string} {...register('description')} /></div>
            <div className="col-span-2 flex gap-2">
              <Button type="submit" size="sm" loading={createMutation.isPending}>Submit</Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => { reset(); setShowForm(false); }}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {/* My Expenses */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50"><h3 className="font-semibold text-sm text-gray-900">My Expenses</h3></div>
        {isLoading ? <div className="p-6 text-center"><Spinner /></div> : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b border-gray-200">
              {['Date', 'Category', 'Description', 'Amount', 'Status', 'Reimbursement'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {filteredExpenses.map((e: any) => (
                <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm">{safeDate(e.expenseDate ?? e.expense_date)}</td>
                  <td className="px-4 py-3"><Badge>{e.category}</Badge></td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{e.description}</td>
                  <td className="px-4 py-3 text-sm font-medium">{safeCurrency(e.amount)}</td>
                  <td className="px-4 py-3"><Badge variant={e.status === 'Approved' ? 'success' : e.status === 'Rejected' ? 'danger' : 'warning'}>{e.status ?? 'Pending'}</Badge></td>
                  <td className="px-4 py-3"><Badge variant={e.reimbursementStatus === 'Paid' || e.reimbursement_status === 'Paid' ? 'success' : 'default'}>{e.reimbursementStatus ?? e.reimbursement_status ?? 'Pending'}</Badge></td>
                </tr>
              ))}
              {filteredExpenses.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">No records found.</td></tr>
              )}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* Pending Approvals (manager view) */}
      {pendingList.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50"><h3 className="font-semibold text-sm text-gray-900">Pending Approvals ({pendingList.length})</h3></div>
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b border-gray-200">
              {['Employee', 'Date', 'Category', 'Amount', 'Description', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {pendingList.map((e: any) => (
                <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium">{e.employeeName ?? e.employee?.fullName ?? '—'}</td>
                  <td className="px-4 py-3 text-sm">{safeDate(e.expenseDate ?? e.expense_date)}</td>
                  <td className="px-4 py-3"><Badge>{e.category}</Badge></td>
                  <td className="px-4 py-3 text-sm font-medium">{safeCurrency(e.amount)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{e.description}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => approveMutation.mutate({ id: e.id, action: 'approve' })} className="p-1.5 rounded hover:bg-green-50 text-gray-400 hover:text-green-600" aria-label="Approve" title="Approve"><Check size={14} /></button>
                      <button onClick={() => approveMutation.mutate({ id: e.id, action: 'reject' })} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-danger" aria-label="Reject" title="Reject"><X size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Statutory tab ─────────────────────────────────────────────────────────────

function StatutoryTab() {
  const { data: pf } = useQuery({
    queryKey: ['statutory-pf-summary'],
    queryFn: async () => { const { data } = await api.get('/extended/statutory/pf/summary'); return data; },
  });

  const { data: esi } = useQuery({
    queryKey: ['statutory-esi-summary'],
    queryFn: async () => { const { data } = await api.get('/extended/statutory/esi/summary'); return data; },
  });

  const { data: tds } = useQuery({
    queryKey: ['statutory-tds-summary'],
    queryFn: async () => { const { data } = await api.get('/extended/statutory/tds/summary'); return data; },
  });

  const statCards = [
    { label: 'PF Employer Contribution (MTD)', value: safeCurrency(pf?.data?.employerContribution ?? pf?.data?.employer_contribution ?? 0), color: 'bg-blue-50 border-blue-200 text-blue-700' },
    { label: 'PF Employee Contribution (MTD)', value: safeCurrency(pf?.data?.employeeContribution ?? pf?.data?.employee_contribution ?? 0), color: 'bg-blue-50 border-blue-200 text-blue-700' },
    { label: 'ESI Employer (MTD)', value: safeCurrency(esi?.data?.employerContribution ?? esi?.data?.employer_contribution ?? 0), color: 'bg-green-50 border-green-200 text-green-700' },
    { label: 'ESI Employee (MTD)', value: safeCurrency(esi?.data?.employeeContribution ?? esi?.data?.employee_contribution ?? 0), color: 'bg-green-50 border-green-200 text-green-700' },
    { label: 'TDS Deducted (MTD)', value: safeCurrency(tds?.data?.totalTDS ?? tds?.data?.total_tds ?? 0), color: 'bg-red-50 border-red-200 text-red-700' },
    { label: 'Professional Tax (MTD)', value: safeCurrency(tds?.data?.professionalTax ?? tds?.data?.professional_tax ?? 0), color: 'bg-red-50 border-red-200 text-red-700' },
  ];

  const dueDates = [
    { label: 'PF Challan Due', date: 'Every 15th', status: 'upcoming' },
    { label: 'ESI Challan Due', date: 'Every 15th', status: 'upcoming' },
    { label: 'TDS (Form 24Q)', date: 'Quarterly', status: 'upcoming' },
    { label: 'PT (Professional Tax)', date: 'Monthly', status: 'upcoming' },
  ];

  return (
    <div className="space-y-6">
      {/* Contribution summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {statCards.map(s => (
          <div key={s.label} className={`rounded-xl border p-4 ${s.color}`}>
            <p className="text-xl font-bold">{s.value}</p>
            <p className="text-xs mt-0.5 opacity-70">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Compliance calendar */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50"><h3 className="font-semibold text-sm text-gray-900">Statutory Due Dates</h3></div>
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 border-b border-gray-200">
            {['Compliance', 'Frequency', 'Status'].map(h => (
              <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
            ))}
          </tr></thead>
          <tbody className="divide-y divide-gray-100">
            {dueDates.map(d => (
              <tr key={d.label} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium">{d.label}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{d.date}</td>
                <td className="px-4 py-3"><Badge variant="info">Upcoming</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PayrollPage() {
  const [tab, setTab] = React.useState('runs');

  return (
    <div>
      <PageHeader title="Payroll & Compensation" subtitle="Payroll runs, salary structures, payslips, expenses and statutory" />

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit flex-wrap">
        {TABS.map(t => {
          const I = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
                    className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 whitespace-nowrap ${tab === t.key ? 'bg-white shadow text-primary' : 'text-gray-600'}`}
            >
              <I size={14} />{t.label}
            </button>
          );
        })}
      </div>

      {tab === 'runs'      && <PayrollRunsTab />}
      {tab === 'salary'    && <SalaryStructuresTab />}
      {tab === 'payslips'  && <MyPayslipsTab />}
      {tab === 'expenses'  && <ExpensesTab />}
      {tab === 'statutory' && <StatutoryTab />}
    </div>
  );
}
