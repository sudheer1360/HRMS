import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Briefcase, Users, Clock, DollarSign, ShieldCheck,
  Plus, Trash2, Check, X, Building2,
} from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Input, Select, Badge, Spinner } from '@components/ui/Input';
import { formatDate } from '@lib/utils';
import api from '@lib/axios';
import { PageHeader } from '@components/ui/PageHeader';
import { ConfirmDialog } from '@components/ui/ConfirmDialog';

// ── Helpers ───────────────────────────────────────────────────────────────────

function safeDate(v?: string | null) {
  if (!v) return '—';
  try { return formatDate(v); } catch { return v; }
}

function fmtCurrency(v?: number | null) {
  if (v == null) return '—';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'contractors', label: 'Contractors',     icon: Building2 },
  { key: 'workers',     label: 'Workers',          icon: Users },
  { key: 'attendance',  label: 'Attendance',       icon: Clock },
  { key: 'billing',     label: 'Billing',          icon: DollarSign },
  { key: 'compliance',  label: 'Compliance',       icon: ShieldCheck },
];

const CONTRACT_TYPES = [
  { value: 'StaffingAgency', label: 'Staffing Agency' },
  { value: 'Vendor', label: 'Vendor' },
  { value: 'Consultant', label: 'Consultant' },
  { value: 'SubContractor', label: 'Sub-Contractor' },
];

const BILLING_RATES = [
  { value: 'Hourly', label: 'Hourly' },
  { value: 'Daily', label: 'Daily' },
  { value: 'Monthly', label: 'Monthly' },
  { value: 'FixedPrice', label: 'Fixed Price' },
];

// ── Contractors tab ───────────────────────────────────────────────────────────

const contractorSchema = z.object({
  companyName: z.string().min(1, 'Required'),
  contactPerson: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(6, 'Required'),
  contractType: z.string().min(1, 'Required'),
  contractStartDate: z.string().min(1, 'Required'),
  contractEndDate: z.string().min(1, 'Required'),
  licenseNumber: z.string().optional(),
  address: z.string().optional(),
});

function ContractorsTab() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = React.useState(false);
  const [confirmId, setConfirmId] = React.useState<string | null>(null);
  const [editId, setEditId] = React.useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['contractors'],
    queryFn: async () => { const { data } = await api.get('/extended/contractors?limit=50'); return data; },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(contractorSchema),
    defaultValues: { contractType: 'Vendor' },
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => editId ? api.put(`/extended/contractors/${editId}`, d) : api.post('/extended/contractors', d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['contractors'] }); reset(); setShowForm(false); setEditId(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/extended/contractors/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contractors'] }),
  });

  const list: any[] = data?.data ?? [];

  const stats = [
    { label: 'Total Contractors', value: list.length, color: 'bg-blue-500', icon: Building2 },
    { label: 'Active', value: list.filter(c => c.status === 'Active').length, color: 'bg-green-500', icon: Check },
    { label: 'Expiring Soon', value: list.filter(c => { const d = new Date(c.contractEndDate ?? c.contract_end_date ?? ''); return d > new Date() && d < new Date(Date.now() + 30 * 86400000); }).length, color: 'bg-yellow-500', icon: Clock },
    { label: 'Expired', value: list.filter(c => new Date(c.contractEndDate ?? c.contract_end_date ?? '') < new Date()).length, color: 'bg-red-500', icon: X },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${s.color}`}><Icon size={18} className="text-white" /></div>
              <div><p className="text-xl font-bold">{s.value}</p><p className="text-xs text-gray-500">{s.label}</p></div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">All Contractors ({list.length})</h3>
        <Button size="sm" onClick={() => { reset(); setEditId(null); setShowForm(v => !v); }}><Plus size={14} /> Add Contractor</Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <form onSubmit={handleSubmit(d => createMutation.mutate(d))} className="grid grid-cols-2 gap-3">
            <Input label="Company Name *" error={errors.companyName?.message as string} {...register('companyName')} />
            <Input label="Contact Person *" error={errors.contactPerson?.message as string} {...register('contactPerson')} />
            <Input label="Email *" type="email" error={errors.email?.message as string} {...register('email')} />
            <Input label="Phone *" error={errors.phone?.message as string} {...register('phone')} />
            <Select label="Contract Type *" options={CONTRACT_TYPES} {...register('contractType')} />
            <Input label="License Number" {...register('licenseNumber')} />
            <Input label="Contract Start *" type="date" error={errors.contractStartDate?.message as string} {...register('contractStartDate')} />
            <Input label="Contract End *" type="date" error={errors.contractEndDate?.message as string} {...register('contractEndDate')} />
            <div className="col-span-2"><Input label="Address" {...register('address')} /></div>
            <div className="col-span-2 flex gap-2">
              <Button type="submit" size="sm" loading={createMutation.isPending}>{editId ? 'Update' : 'Create'}</Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => { reset(); setShowForm(false); setEditId(null); }}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? <div className="p-8 text-center"><Spinner /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 border-b border-gray-200">
                {['Company', 'Type', 'Contact', 'Contract Period', 'Workers', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y">
                {list.map((c: any) => {
                  const endDate = c.contractEndDate ?? c.contract_end_date ?? '';
                  const isExpired = endDate && new Date(endDate) < new Date();
                  return (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{c.companyName ?? c.company_name}</p>
                        <p className="text-xs text-gray-400">{c.licenseNumber ?? c.license_number ?? '—'}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{c.contractType ?? c.contract_type}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm">{c.contactPerson ?? c.contact_person}</p>
                        <p className="text-xs text-gray-400">{c.email}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {safeDate(c.contractStartDate ?? c.contract_start_date)} →<br />{safeDate(endDate)}
                      </td>
                      <td className="px-4 py-3 text-sm text-center">{c.workerCount ?? c.worker_count ?? 0}</td>
                      <td className="px-4 py-3">
                        <Badge variant={isExpired ? 'danger' : c.status === 'Active' ? 'success' : 'default'}>
                          {isExpired ? 'Expired' : c.status ?? 'Active'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => setConfirmId(c.id)} className="p-1.5 rounded hover:bg-red-50 hover:text-danger text-gray-300">
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {list.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">No contractors added yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Workers tab ───────────────────────────────────────────────────────────────

const workerSchema = z.object({
  fullName: z.string().min(1, 'Required'),
  contractorId: z.string().min(1, 'Required'),
  designation: z.string().min(1, 'Required'),
  department: z.string().optional(),
  startDate: z.string().min(1, 'Required'),
  endDate: z.string().optional(),
  billingRate: z.coerce.number().min(0),
  billingType: z.string().min(1, 'Required'),
});

function WorkersTab() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = React.useState(false);

  const { data: contractors } = useQuery({
    queryKey: ['contractors'],
    queryFn: async () => { const { data } = await api.get('/extended/contractors?limit=50'); return data; },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['contractor-workers'],
    queryFn: async () => { const { data } = await api.get('/extended/contractors/workers?limit=100'); return data; },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(workerSchema),
    defaultValues: { billingType: 'Monthly' },
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => api.post('/extended/contractors/workers', d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['contractor-workers'] }); reset(); setShowForm(false); },
  });

  const contractorOptions = (contractors?.data ?? []).map((c: any) => ({ value: c.id, label: c.companyName ?? c.company_name }));
  const list: any[] = data?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">Contract Workers ({list.length})</h3>
        <Button size="sm" onClick={() => setShowForm(v => !v)}><Plus size={14} /> Add Worker</Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <form onSubmit={handleSubmit(d => createMutation.mutate(d))} className="grid grid-cols-2 gap-3">
            <Input label="Full Name *" error={errors.fullName?.message as string} {...register('fullName')} />
            <Select label="Contractor *" options={contractorOptions} error={errors.contractorId?.message as string} {...register('contractorId')} />
            <Input label="Designation *" error={errors.designation?.message as string} {...register('designation')} />
            <Input label="Department" {...register('department')} />
            <Input label="Start Date *" type="date" error={errors.startDate?.message as string} {...register('startDate')} />
            <Input label="End Date" type="date" {...register('endDate')} />
            <Input label="Billing Rate (₹) *" type="number" error={errors.billingRate?.message as string} {...register('billingRate')} />
            <Select label="Billing Type *" options={BILLING_RATES} {...register('billingType')} />
            <div className="col-span-2 flex gap-2">
              <Button type="submit" size="sm" loading={createMutation.isPending}>Add Worker</Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => { reset(); setShowForm(false); }}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? <div className="p-8 text-center"><Spinner /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 border-b border-gray-200">
                {['Worker', 'Contractor', 'Role', 'Period', 'Billing', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y">
                {list.map((w: any) => (
                  <tr key={w.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium">{w.fullName ?? w.full_name}</p>
                      <p className="text-xs text-gray-400">{w.department ?? '—'}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{w.contractorName ?? w.contractor?.companyName ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{w.designation}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{safeDate(w.startDate ?? w.start_date)} → {safeDate(w.endDate ?? w.end_date)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{fmtCurrency(w.billingRate ?? w.billing_rate)}/{w.billingType ?? w.billing_type ?? 'Mo'}</td>
                    <td className="px-4 py-3"><Badge variant={w.status === 'Active' ? 'success' : 'default'}>{w.status ?? 'Active'}</Badge></td>
                  </tr>
                ))}
                {list.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">No workers added yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Attendance tab ────────────────────────────────────────────────────────────

function ContractorAttendanceTab() {
  const [date, setDate] = React.useState(new Date().toISOString().split('T')[0]);

  const { data, isLoading } = useQuery({
    queryKey: ['contractor-attendance', date],
    queryFn: async () => { const { data } = await api.get(`/extended/contractors/attendance?date=${date}&limit=100`); return data; },
  });

  const list: any[] = data?.data ?? [];
  const present = list.filter(r => r.status === 'Present').length;
  const absent = list.filter(r => r.status === 'Absent').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Input label="" type="date" value={date} onChange={e => setDate(e.target.value)} className="w-48" />
        <div className="flex gap-4 text-sm">
          <span className="text-green-600 font-medium">✓ Present: {present}</span>
          <span className="text-red-500 font-medium">✗ Absent: {absent}</span>
          <span className="text-gray-500">Total: {list.length}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? <div className="p-8 text-center"><Spinner /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 border-b border-gray-200">
                {['Worker', 'Contractor', 'Check In', 'Check Out', 'Hours', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y">
                {list.map((r: any) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium">{r.workerName ?? r.worker?.fullName ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{r.contractorName ?? '—'}</td>
                    <td className="px-4 py-3 text-sm">{r.checkIn ?? r.check_in ?? '—'}</td>
                    <td className="px-4 py-3 text-sm">{r.checkOut ?? r.check_out ?? '—'}</td>
                    <td className="px-4 py-3 text-sm">{r.hoursWorked ?? r.hours_worked ?? '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={r.status === 'Present' ? 'success' : r.status === 'Absent' ? 'danger' : 'default'}>{r.status ?? 'Present'}</Badge>
                    </td>
                  </tr>
                ))}
                {list.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">No attendance records for {date}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Billing tab ───────────────────────────────────────────────────────────────

const invoiceSchema = z.object({
  contractorId: z.string().min(1, 'Required'),
  invoiceNumber: z.string().min(1, 'Required'),
  invoiceDate: z.string().min(1, 'Required'),
  dueDate: z.string().min(1, 'Required'),
  amount: z.coerce.number().min(1, 'Required'),
  description: z.string().optional(),
});

function BillingTab() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = React.useState(false);

  const { data: contractors } = useQuery({
    queryKey: ['contractors'],
    queryFn: async () => { const { data } = await api.get('/extended/contractors?limit=50'); return data; },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['contractor-invoices'],
    queryFn: async () => { const { data } = await api.get('/extended/contractors/invoices?limit=50'); return data; },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(invoiceSchema) });

  const createMutation = useMutation({
    mutationFn: (d: any) => api.post('/extended/contractors/invoices', d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['contractor-invoices'] }); reset(); setShowForm(false); },
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/extended/contractors/invoices/${id}/approve`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contractor-invoices'] }),
  });

  const contractorOptions = (contractors?.data ?? []).map((c: any) => ({ value: c.id, label: c.companyName ?? c.company_name }));
  const list: any[] = data?.data ?? [];
  const totalPending = list.filter(i => i.status === 'Pending').reduce((s, i) => s + (i.amount ?? 0), 0);
  const totalPaid = list.filter(i => i.status === 'Paid').reduce((s, i) => s + (i.amount ?? 0), 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Pending Amount', value: fmtCurrency(totalPending), color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Paid This Month', value: fmtCurrency(totalPaid), color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Total Invoices', value: list.length, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border border-gray-200 ${s.bg} p-4`}>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">Invoices</h3>
        <Button size="sm" onClick={() => setShowForm(v => !v)}><Plus size={14} /> New Invoice</Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <form onSubmit={handleSubmit(d => createMutation.mutate(d))} className="grid grid-cols-2 gap-3">
            <Select label="Contractor *" options={contractorOptions} error={errors.contractorId?.message as string} {...register('contractorId')} />
            <Input label="Invoice Number *" error={errors.invoiceNumber?.message as string} {...register('invoiceNumber')} />
            <Input label="Invoice Date *" type="date" error={errors.invoiceDate?.message as string} {...register('invoiceDate')} />
            <Input label="Due Date *" type="date" error={errors.dueDate?.message as string} {...register('dueDate')} />
            <Input label="Amount (₹) *" type="number" error={errors.amount?.message as string} {...register('amount')} />
            <Input label="Description" {...register('description')} />
            <div className="col-span-2 flex gap-2">
              <Button type="submit" size="sm" loading={createMutation.isPending}>Create Invoice</Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => { reset(); setShowForm(false); }}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? <div className="p-8 text-center"><Spinner /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 border-b border-gray-200">
                {['Invoice #', 'Contractor', 'Date', 'Due Date', 'Amount', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y">
                {list.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{inv.invoiceNumber ?? inv.invoice_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{inv.contractorName ?? inv.contractor?.companyName ?? '—'}</td>
                    <td className="px-4 py-3 text-sm">{safeDate(inv.invoiceDate ?? inv.invoice_date)}</td>
                    <td className="px-4 py-3 text-sm">{safeDate(inv.dueDate ?? inv.due_date)}</td>
                    <td className="px-4 py-3 text-sm font-medium">{fmtCurrency(inv.amount)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={inv.status === 'Paid' ? 'success' : inv.status === 'Overdue' ? 'danger' : 'warning'}>{inv.status ?? 'Pending'}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      {(inv.status === 'Pending' || inv.status === 'Submitted') && (
                        <Button size="sm" onClick={() => approveMutation.mutate(inv.id)} loading={approveMutation.isPending}>
                          <Check size={12} /> Approve
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {list.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">No invoices yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Compliance tab ────────────────────────────────────────────────────────────

const COMPLIANCE_TYPES = ['PF Registration', 'ESI Registration', 'Labour License', 'Safety Certificate', 'ISO Certification', 'Other'];

function ComplianceTab() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['contractor-compliance'],
    queryFn: async () => { const { data } = await api.get('/extended/contractors/compliance?limit=100'); return data; },
  });

  const list: any[] = data?.data ?? [];
  const compliant = list.filter(c => c.status === 'Valid' || c.status === 'Compliant').length;

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <ShieldCheck size={20} className="text-green-600" />
          <div><p className="text-lg font-bold text-green-700">{compliant}</p><p className="text-xs text-gray-500">Compliant</p></div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <X size={20} className="text-red-500" />
          <div><p className="text-lg font-bold text-red-600">{list.length - compliant}</p><p className="text-xs text-gray-500">Non-Compliant / Expired</p></div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? <div className="p-8 text-center"><Spinner /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 border-b border-gray-200">
                {['Contractor', 'Compliance Type', 'Document #', 'Valid Until', 'Status', 'Notes'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y">
                {list.map((c: any) => {
                  const validUntil = c.validUntil ?? c.valid_until ?? '';
                  const isExpired = validUntil && new Date(validUntil) < new Date();
                  return (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium">{c.contractorName ?? c.contractor?.companyName ?? '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{c.complianceType ?? c.compliance_type}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{c.documentNumber ?? c.document_number ?? '—'}</td>
                      <td className="px-4 py-3 text-sm">{safeDate(validUntil)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={isExpired ? 'danger' : c.status === 'Valid' ? 'success' : 'warning'}>
                          {isExpired ? 'Expired' : c.status ?? 'Valid'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">{c.notes ?? '—'}</td>
                    </tr>
                  );
                })}
                {list.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">No compliance records</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ContractorPage() {
  const [tab, setTab] = React.useState('contractors');

  return (
    <div>
      <PageHeader title="Contractors & Labor" subtitle="Manage contractors, workers, billing and compliance" />

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit flex-wrap">
        {TABS.map(t => {
          const I = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${
                tab === t.key ? 'bg-white shadow text-primary' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <I size={14} />{t.label}
            </button>
          );
        })}
      </div>

      {tab === 'contractors' && <ContractorsTab />}
      {tab === 'workers'     && <WorkersTab />}
      {tab === 'attendance'  && <ContractorAttendanceTab />}
      {tab === 'billing'     && <BillingTab />}
      {tab === 'compliance'  && <ComplianceTab />}
      <ConfirmDialog
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={() => { deleteMutation.mutate(confirmId!); setConfirmId(null); }}
        message="Delete this contractor? This action cannot be undone."
        confirmLabel="Delete Contractor"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
