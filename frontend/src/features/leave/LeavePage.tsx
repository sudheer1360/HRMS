import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus, X, Check, Calendar, CalendarDays, Users, BookOpen,
  ChevronLeft, ChevronRight, Edit, Trash2,
} from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Input, Select, Badge, Spinner } from '@components/ui/Input';
import { formatDate, cn } from '@lib/utils';
import api from '@lib/axios';
import { PageHeader } from '@components/ui/PageHeader';
import { ConfirmDialog } from '@components/ui/ConfirmDialog';

// ── Helpers ───────────────────────────────────────────────────────────────────

function safeDate(v?: string | null): string {
  if (!v) return '—';
  try { return formatDate(v); } catch { return v; }
}

function statusVariant(s: string): 'success' | 'warning' | 'danger' | 'info' | 'default' {
  switch (s) {
    case 'Approved': return 'success';
    case 'Pending': return 'warning';
    case 'Rejected': case 'Cancelled': return 'danger';
    default: return 'default';
  }
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'my',      label: 'My Leaves',    icon: Calendar },
  { key: 'balance', label: 'Balance',       icon: CalendarDays },
  { key: 'team',    label: 'Team Leaves',  icon: Users },
  { key: 'holidays',label: 'Holidays',     icon: CalendarDays },
  { key: 'types',   label: 'Leave Types',  icon: BookOpen },
];

// ── My Leaves tab ─────────────────────────────────────────────────────────────

const applySchema = z.object({
  leaveTypeId: z.string().min(1, 'Select leave type'),
  fromDate: z.string().min(1, 'Required'),
  toDate: z.string().min(1, 'Required'),
  reason: z.string().optional(),
  halfDay: z.string().optional(),
});

function MyLeavesTab() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = React.useState(false);

  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: async () => { const { data } = await api.get('/auth/me'); return data.data; },
  });
  const companyId = profile?.companyId ?? profile?.company_id;

  const { data: types } = useQuery({
    queryKey: ['leave-types', companyId],
    enabled: !!companyId,
    queryFn: async () => {
      const { data } = await api.get(`/leaves/types/${companyId}`);
      return data.data ?? [];
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['my-leaves'],
    queryFn: async () => {
      const { data } = await api.get('/leaves/my-leaves?limit=50');
      return data;
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(applySchema),
  });

  const applyMutation = useMutation({
    mutationFn: (d: any) => api.post('/leaves/apply', d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-leaves'] });
      queryClient.invalidateQueries({ queryKey: ['leave-balance'] });
      reset(); setShowForm(false);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/leaves/${id}/cancel`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-leaves'] }),
  });

  const [cancelConfirmId, setCancelConfirmId] = React.useState<string | null>(null);
  const typeOptions = (types ?? []).map((t: any) => ({ value: t.id, label: t.leaveName }));
  const leaves: any[] = data?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowForm(v => !v)}>
          <Plus size={14} /> Apply Leave
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Apply for Leave</h3>
            <button onClick={() => { reset(); setShowForm(false); }} className="p-1 rounded hover:bg-gray-100"><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit(d => applyMutation.mutate(d))} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select label="Leave Type *" options={typeOptions} error={errors.leaveTypeId?.message as string} {...register('leaveTypeId')} />
            <Input label="From Date *" type="date" error={errors.fromDate?.message as string} {...register('fromDate')} />
            <Input label="To Date *" type="date" error={errors.toDate?.message as string} {...register('toDate')} />
            <Input label="Reason" {...register('reason')} />
            <div className="sm:col-span-2 lg:col-span-4 flex gap-3">
              <Button type="submit" size="sm" loading={applyMutation.isPending}>Submit Application</Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => { reset(); setShowForm(false); }}>Cancel</Button>
            </div>
          </form>
          {applyMutation.isError && (
            <p className="mt-3 text-sm text-danger">{(applyMutation.error as any)?.response?.data?.error?.message ?? 'Failed to submit'}</p>
          )}
        </div>
      )}

      {isLoading ? <Spinner /> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Leave Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">From</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">To</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Days</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Reason</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Applied</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leaves.map((app: any) => (
                <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium">{(types as any[])?.find((t: any) => t.id === app.leaveTypeId)?.leaveName ?? app.leaveTypeId?.slice(0, 8)}</td>
                  <td className="px-4 py-3">{safeDate(app.fromDate)}</td>
                  <td className="px-4 py-3">{safeDate(app.toDate)}</td>
                  <td className="px-4 py-3">{Number(app.totalDays)}</td>
                  <td className="px-4 py-3 max-w-xs truncate text-gray-500">{app.reason ?? '—'}</td>
                  <td className="px-4 py-3"><Badge variant={statusVariant(app.status)}>{app.status}</Badge></td>
                  <td className="px-4 py-3 text-gray-500">{safeDate(app.createdAt ?? app.created_at)}</td>
                  <td className="px-4 py-3">
                    {app.status === 'Pending' && (
                      <button
                        onClick={() => setCancelConfirmId(app.id)}
                        className="p-1.5 rounded hover:bg-red-50 hover:text-danger text-gray-400" title="Cancel leave" aria-label="Cancel leave"
                      ><X size={14} /></button>
                    )}
                  </td>
                </tr>
              ))}
              {leaves.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-400">No records found.</td></tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={!!cancelConfirmId}
        onClose={() => setCancelConfirmId(null)}
        onConfirm={() => { cancelMutation.mutate(cancelConfirmId!); setCancelConfirmId(null); }}
        title="Cancel Leave Application"
        message="Are you sure you want to cancel this leave application?"
        confirmLabel="Yes, Cancel"
        variant="warning"
        loading={cancelMutation.isPending}
      />
    </div>
  );
}

// ── Balance tab ───────────────────────────────────────────────────────────────

function BalanceTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['leave-balance'],
    queryFn: async () => { const { data } = await api.get('/leaves/my-balance'); return data.data ?? []; },
  });

  const balances: any[] = data ?? [];

  if (isLoading) return <Spinner />;

  return (
    <div>
      {balances.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-16 text-center text-gray-400">
          No leave balances found. Contact HR to initialise your leave balance.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {balances.map((b: any) => {
            const total = Number(b.allocatedBalance ?? b.allocated_balance ?? 0);
            const used = Number(b.usedBalance ?? b.used_balance ?? 0);
            const remaining = Number(b.currentBalance ?? b.current_balance ?? total - used);
            const pct = total > 0 ? Math.round((remaining / total) * 100) : 0;
            return (
              <div key={b.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-sm font-semibold text-gray-900 mb-1">{b.leaveType?.leaveName ?? b.leaveTypeName ?? 'Leave'}</p>
                <div className="flex items-end gap-1 mb-3">
                  <p className="text-3xl font-bold text-primary">{remaining}</p>
                  <p className="text-sm text-gray-400 mb-1">/ {total} days</p>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                  <div className={`h-full rounded-full ${pct > 50 ? 'bg-green-500' : pct > 20 ? 'bg-warning' : 'bg-danger'}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{used} used</span>
                  <span>{remaining} remaining</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Team Leaves tab ───────────────────────────────────────────────────────────

function TeamLeavesTab() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['team-leaves'],
    queryFn: async () => { const { data } = await api.get('/leaves?status=Pending&limit=50'); return data; },
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, status, remarks }: { id: string; status: string; remarks?: string }) =>
      api.patch(`/leaves/${id}/approve`, { status, remarks }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team-leaves'] }),
  });

  const leaves: any[] = data?.data ?? [];

  return (
    <div className="space-y-4">
      {isLoading ? <Spinner /> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">Pending Approvals</p>
            <Badge variant="warning">{leaves.length}</Badge>
          </div>
          <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Employee</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Leave Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">From</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">To</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Days</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Reason</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leaves.map((l: any) => (
                <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium">{l.employeeName ?? l.employeeId?.slice(0, 8)}</td>
                  <td className="px-4 py-3">{l.leaveTypeName ?? l.leaveTypeId?.slice(0, 8)}</td>
                  <td className="px-4 py-3">{safeDate(l.fromDate)}</td>
                  <td className="px-4 py-3">{safeDate(l.toDate)}</td>
                  <td className="px-4 py-3">{Number(l.totalDays)}</td>
                  <td className="px-4 py-3 max-w-xs truncate text-gray-500">{l.reason ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => approveMutation.mutate({ id: l.id, status: 'Approved' })}
                        className="p-1.5 rounded bg-green-50 hover:bg-green-100 text-green-700" aria-label="Approve" title="Approve"
                      ><Check size={14} /></button>
                      <button
                        onClick={() => approveMutation.mutate({ id: l.id, status: 'Rejected' })}
                        className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-danger" aria-label="Reject" title="Reject"
                      ><X size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {leaves.length === 0 && (
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

// ── Holidays tab ──────────────────────────────────────────────────────────────

const holidaySchema = z.object({
  holidayDate: z.string().min(1, 'Required'),
  holidayName: z.string().min(1, 'Required'),
  holidayType: z.string().min(1, 'Required'),
  description: z.string().optional(),
});

function HolidaysTab() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = React.useState(false);
  const [year, setYear] = React.useState(new Date().getFullYear());
  const [deleteHolidayId, setDeleteHolidayId] = React.useState<string | null>(null);

  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: async () => { const { data } = await api.get('/auth/me'); return data.data; },
  });
  const companyId = profile?.companyId ?? profile?.company_id;

  const { data, isLoading } = useQuery({
    queryKey: ['holidays', companyId, year],
    enabled: !!companyId,
    queryFn: async () => {
      const { data } = await api.get(`/leaves/holidays/${companyId}?year=${year}`);
      return data.data ?? [];
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(holidaySchema),
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => api.post('/leaves/holidays', { ...d, companyId }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['holidays'] }); reset(); setShowForm(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/leaves/holidays/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['holidays'] }),
  });

  const holidays: any[] = data ?? [];

  // Group by month
  const byMonth: Record<number, any[]> = {};
  holidays.forEach((h: any) => {
    const m = new Date(h.holidayDate ?? h.holiday_date).getMonth();
    (byMonth[m] = byMonth[m] ?? []).push(h);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <button onClick={() => setYear(y => y - 1)} className="p-2 rounded-lg border hover:bg-gray-50"><ChevronLeft size={16} /></button>
        <p className="text-lg font-semibold text-gray-900 w-20 text-center">{year}</p>
        <button onClick={() => setYear(y => y + 1)} className="p-2 rounded-lg border hover:bg-gray-50"><ChevronRight size={16} /></button>
        <Button size="sm" className="ml-auto" onClick={() => setShowForm(v => !v)}>
          <Plus size={14} /> Add Holiday
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <form onSubmit={handleSubmit(d => createMutation.mutate(d))} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input label="Date *" type="date" error={errors.holidayDate?.message as string} {...register('holidayDate')} />
            <Input label="Holiday Name *" error={errors.holidayName?.message as string} {...register('holidayName')} />
            <Select label="Type *" options={[
              { value: 'National', label: 'National Holiday' },
              { value: 'Optional', label: 'Optional Holiday' },
              { value: 'Regional', label: 'Regional Holiday' },
            ]} error={errors.holidayType?.message as string} {...register('holidayType')} />
            <Input label="Description" {...register('description')} />
            <div className="sm:col-span-2 lg:col-span-4 flex gap-3">
              <Button type="submit" size="sm" loading={createMutation.isPending}>Save Holiday</Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => { reset(); setShowForm(false); }}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? <Spinner /> : (
        <div className="space-y-3">
          {holidays.length === 0 && (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-16 text-center text-gray-400">
              No holidays for {year}
            </div>
          )}
          {Object.entries(byMonth).sort(([a], [b]) => Number(a) - Number(b)).map(([m, hs]) => (
            <div key={m} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  {new Date(year, Number(m), 1).toLocaleString('en-IN', { month: 'long' })}
                </p>
              </div>
              <div className="divide-y divide-gray-100">
                {hs.map((h: any) => (
                  <div key={h.id} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50">
                    <div className="w-10 text-center">
                      <p className="text-xl font-bold text-primary">{new Date(h.holidayDate ?? h.holiday_date).getDate()}</p>
                      <p className="text-[10px] text-gray-400">{new Date(h.holidayDate ?? h.holiday_date).toLocaleString('en-IN', { weekday: 'short' })}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{h.holidayName ?? h.holiday_name}</p>
                      {h.description && <p className="text-xs text-gray-400">{h.description}</p>}
                    </div>
                    <Badge variant="info">{h.holidayType ?? h.holiday_type}</Badge>
                    <button
                      onClick={() => setDeleteHolidayId(h.id)}
                      className="p-1.5 rounded hover:bg-red-50 hover:text-danger text-gray-300"
                      aria-label="Delete holiday" title="Delete holiday"
                    ><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <ConfirmDialog
        open={!!deleteHolidayId}
        onClose={() => setDeleteHolidayId(null)}
        onConfirm={() => { deleteMutation.mutate(deleteHolidayId!); setDeleteHolidayId(null); }}
        title="Delete Holiday"
        message="Delete this holiday from the calendar?"
        confirmLabel="Delete Holiday"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

// ── Leave Types tab ───────────────────────────────────────────────────────────

const typeSchema = z.object({
  leaveName: z.string().min(1, 'Required'),
  leaveCode: z.string().min(1, 'Required'),
  maxDaysPerYear: z.coerce.number().min(0),
  isPaid: z.string(),
  carryForwardAllowed: z.string(),
  encashmentAllowed: z.string(),
  maxCarryForwardDays: z.coerce.number().min(0).optional(),
});

function LeaveTypesTab() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = React.useState(false);
  const [editItem, setEditItem] = React.useState<any>(null);
  const [deleteTypeId, setDeleteTypeId] = React.useState<string | null>(null);

  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: async () => { const { data } = await api.get('/auth/me'); return data.data; },
  });
  const companyId = profile?.companyId ?? profile?.company_id;

  const { data, isLoading } = useQuery({
    queryKey: ['leave-types', companyId],
    enabled: !!companyId,
    queryFn: async () => { const { data } = await api.get(`/leaves/types/${companyId}`); return data.data ?? []; },
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(typeSchema),
    defaultValues: { isPaid: 'true', carryForwardAllowed: 'false', encashmentAllowed: 'false', maxCarryForwardDays: 0 },
  });

  const saveMutation = useMutation({
    mutationFn: (d: any) => editItem
      ? api.put(`/leaves/types/${editItem.id}`, d)
      : api.post('/leaves/types', { ...d, companyId }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['leave-types'] }); reset(); setShowForm(false); setEditItem(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/leaves/types/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leave-types'] }),
  });

  function openEdit(t: any) {
    setEditItem(t);
    setValue('leaveName', t.leaveName);
    setValue('leaveCode', t.leaveCode);
    setValue('maxDaysPerYear', t.maxDaysPerYear);
    setValue('isPaid', String(t.isPaid));
    setValue('carryForwardAllowed', String(t.carryForwardAllowed));
    setValue('encashmentAllowed', String(t.encashmentAllowed));
    setValue('maxCarryForwardDays', t.maxCarryForwardDays ?? 0);
    setShowForm(true);
  }

  const types: any[] = data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => { setEditItem(null); reset(); setShowForm(v => !v); }}>
          <Plus size={14} /> New Leave Type
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold mb-4">{editItem ? 'Edit Leave Type' : 'New Leave Type'}</h3>
          <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Leave Name *" error={errors.leaveName?.message as string} {...register('leaveName')} />
            <Input label="Leave Code *" error={errors.leaveCode?.message as string} {...register('leaveCode')} />
            <Input label="Max Days / Year *" type="number" {...register('maxDaysPerYear')} />
            <Select label="Paid Leave?" options={[{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }]} {...register('isPaid')} />
            <Select label="Carry Forward?" options={[{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }]} {...register('carryForwardAllowed')} />
            <Select label="Encashable?" options={[{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }]} {...register('encashmentAllowed')} />
            <Input label="Max Carry Forward Days" type="number" {...register('maxCarryForwardDays')} />
            <div className="sm:col-span-3 flex gap-3">
              <Button type="submit" size="sm" loading={saveMutation.isPending}>{editItem ? 'Update' : 'Create'}</Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => { reset(); setShowForm(false); setEditItem(null); }}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? <Spinner /> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Leave Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Code</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Max Days</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Paid</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Carry Fwd</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Encashable</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {types.map((t: any) => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium">{t.leaveName}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{t.leaveCode}</td>
                  <td className="px-4 py-3">{t.maxDaysPerYear}</td>
                  <td className="px-4 py-3"><Badge variant={t.isPaid ? 'success' : 'default'}>{t.isPaid ? 'Paid' : 'Unpaid'}</Badge></td>
                  <td className="px-4 py-3"><Badge variant={t.carryForwardAllowed ? 'info' : 'default'}>{t.carryForwardAllowed ? `Yes (${t.maxCarryForwardDays ?? 0}d)` : 'No'}</Badge></td>
                  <td className="px-4 py-3"><Badge variant={t.encashmentAllowed ? 'success' : 'default'}>{t.encashmentAllowed ? 'Yes' : 'No'}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(t)} className="p-1.5 rounded hover:bg-gray-100"><Edit size={14} /></button>
                      <button onClick={() => setDeleteTypeId(t.id)} className="p-1.5 rounded hover:bg-red-50 hover:text-danger" aria-label="Delete leave type" title="Delete leave type"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {types.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">No records found.</td></tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={!!deleteTypeId}
        onClose={() => setDeleteTypeId(null)}
        onConfirm={() => { deleteMutation.mutate(deleteTypeId!); setDeleteTypeId(null); }}
        title="Delete Leave Type"
        message="This will remove the leave type and any associated policies."
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function LeavePage() {
  const [activeTab, setActiveTab] = React.useState('my');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Management"
        subtitle="Apply for leaves, view balances, manage team approvals and holidays"
      />

      {/* Tab navigation */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-full overflow-x-auto">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
              activeTab === key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'my'      && <MyLeavesTab />}
        {activeTab === 'balance' && <BalanceTab />}
        {activeTab === 'team'    && <TeamLeavesTab />}
        {activeTab === 'holidays'&& <HolidaysTab />}
        {activeTab === 'types'   && <LeaveTypesTab />}
      </div>
    </div>
  );
}
