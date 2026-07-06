import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Clock, CalendarDays, Users, TrendingUp,
  Plus, Edit, Trash2, Check, X,
} from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Input, Select, Badge, Spinner } from '@components/ui/Input';
import { formatDate } from '@lib/utils';
import api from '@lib/axios';
import { PageHeader } from '@components/ui/PageHeader';
import { ConfirmDialog } from '@components/ui/ConfirmDialog';

// ── Helpers ───────────────────────────────────────────────────────────────────

function safeDate(v?: string | null): string {
  if (!v) return '—';
  try { return formatDate(v); } catch { return v; }
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'my',      label: 'My Shift',         icon: Clock },
  { key: 'shifts',  label: 'Shift Definitions', icon: CalendarDays },
  { key: 'rosters', label: 'Rosters',           icon: Users },
  { key: 'ot',      label: 'Overtime',          icon: TrendingUp },
];

const SHIFT_TYPES = [
  { value: 'General', label: 'General' },
  { value: 'Morning', label: 'Morning' },
  { value: 'Evening', label: 'Evening' },
  { value: 'Night', label: 'Night' },
  { value: 'Rotational', label: 'Rotational' },
  { value: 'Flexible', label: 'Flexible' },
];

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ── My Shift tab ──────────────────────────────────────────────────────────────

function MyShiftTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-shift'],
    queryFn: async () => { const { data } = await api.get('/shifts/my-shift'); return data.data; },
  });

  if (isLoading) return <Spinner />;

  const shift = data;

  if (!shift) {
    return (
      <div className="bg-white rounded-xl border border-dashed border-gray-300 p-16 text-center text-gray-400">
        <Clock size={40} className="mx-auto mb-4 text-gray-300" />
        <p>No shift assigned. Contact your HR manager.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-primary to-primary-light rounded-xl p-6 text-white">
        <p className="text-sm opacity-80 mb-1">Your Current Shift</p>
        <p className="text-3xl font-bold">{shift.shiftName ?? shift.shift_name}</p>
        <p className="text-sm opacity-80 mt-1">{shift.shiftType ?? shift.shift_type}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          {[
            { label: 'Start Time', value: shift.startTime ?? shift.start_time ?? '—' },
            { label: 'End Time', value: shift.endTime ?? shift.end_time ?? '—' },
            { label: 'Total Hours', value: shift.totalHours ?? shift.total_hours ? `${shift.totalHours ?? shift.total_hours}h` : '—' },
            { label: 'Grace Period', value: shift.graceMinutes ?? shift.grace_minutes ? `${shift.graceMinutes ?? shift.grace_minutes} min` : '—' },
            { label: 'Break Duration', value: shift.breakMinutes ?? shift.break_minutes ? `${shift.breakMinutes ?? shift.break_minutes} min` : '—' },
            { label: 'Night Shift', value: (shift.isNightShift ?? shift.is_night_shift) ? 'Yes' : 'No' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className="text-sm font-semibold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Working days */}
        {(shift.workingDays ?? shift.working_days) && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">Working Days</p>
            <div className="flex gap-1 flex-wrap">
              {DAYS_OF_WEEK.map((d, i) => {
                const working = (shift.workingDays ?? shift.working_days ?? []).includes(i) ||
                                (shift.workingDays ?? shift.working_days ?? []).includes(d);
                return (
                  <span
                    key={d}
                    className={`text-xs px-2 py-1 rounded-full font-medium ${working ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'}`}
                  >
                    {d.slice(0, 3)}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Shift Definitions tab ─────────────────────────────────────────────────────

const shiftSchema = z.object({
  shiftName: z.string().min(1, 'Required'),
  shiftCode: z.string().min(1, 'Required'),
  shiftType: z.string().min(1, 'Required'),
  startTime: z.string().min(1, 'Required'),
  endTime: z.string().min(1, 'Required'),
  graceMinutes: z.coerce.number().min(0).optional(),
  breakMinutes: z.coerce.number().min(0).optional(),
});

function ShiftsTab() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = React.useState(false);
  const [confirmId, setConfirmId] = React.useState<string | null>(null);
  const [editItem, setEditItem] = React.useState<any>(null);

  const companyId = '00000000-0000-0000-0000-000000000001';

  const { data, isLoading } = useQuery({
    queryKey: ['shifts', companyId],
    queryFn: async () => { const { data } = await api.get(`/shifts/shifts/${companyId}`); return data.data ?? []; },
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(shiftSchema),
    defaultValues: { shiftType: 'General', graceMinutes: 15, breakMinutes: 30 },
  });

  const saveMutation = useMutation({
    mutationFn: (d: any) => editItem
      ? api.put(`/shifts/shifts/${editItem.id}`, d)
      : api.post('/shifts/shifts', { ...d, companyId }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['shifts'] }); reset(); setShowForm(false); setEditItem(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/shifts/shifts/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shifts'] }),
  });

  function openEdit(s: any) {
    setEditItem(s);
    setValue('shiftName', s.shiftName ?? s.shift_name);
    setValue('shiftCode', s.shiftCode ?? s.shift_code);
    setValue('shiftType', s.shiftType ?? s.shift_type);
    setValue('startTime', s.startTime ?? s.start_time);
    setValue('endTime', s.endTime ?? s.end_time);
    setValue('graceMinutes', s.graceMinutes ?? s.grace_minutes ?? 15);
    setValue('breakMinutes', s.breakMinutes ?? s.break_minutes ?? 30);
    setShowForm(true);
  }

  const shifts: any[] = data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => { setEditItem(null); reset(); setShowForm(v => !v); }}>
          <Plus size={14} /> New Shift
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold mb-4">{editItem ? 'Edit Shift' : 'New Shift'}</h3>
          <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Shift Name *" error={errors.shiftName?.message as string} {...register('shiftName')} />
            <Input label="Shift Code *" error={errors.shiftCode?.message as string} {...register('shiftCode')} />
            <Select label="Type *" options={SHIFT_TYPES} error={errors.shiftType?.message as string} {...register('shiftType')} />
            <Input label="Start Time *" type="time" error={errors.startTime?.message as string} {...register('startTime')} />
            <Input label="End Time *" type="time" error={errors.endTime?.message as string} {...register('endTime')} />
            <Input label="Grace Period (min)" type="number" {...register('graceMinutes')} />
            <Input label="Break Duration (min)" type="number" {...register('breakMinutes')} />
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
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Shift</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Code</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Start</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">End</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Grace</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Break</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {shifts.map((s: any) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium">{s.shiftName ?? s.shift_name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{s.shiftCode ?? s.shift_code}</td>
                  <td className="px-4 py-3"><Badge variant="info">{s.shiftType ?? s.shift_type}</Badge></td>
                  <td className="px-4 py-3">{s.startTime ?? s.start_time}</td>
                  <td className="px-4 py-3">{s.endTime ?? s.end_time}</td>
                  <td className="px-4 py-3 text-gray-500">{s.graceMinutes ?? s.grace_minutes ?? 0} min</td>
                  <td className="px-4 py-3 text-gray-500">{s.breakMinutes ?? s.break_minutes ?? 0} min</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(s)} className="p-1.5 rounded hover:bg-gray-100"><Edit size={13} /></button>
                      <button onClick={() => setConfirmId(s.id)} className="p-1.5 rounded hover:bg-red-50 hover:text-danger"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {shifts.length === 0 && (
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

// ── Rosters tab ───────────────────────────────────────────────────────────────

const rosterSchema = z.object({
  rosterName: z.string().min(1, 'Required'),
  effectiveFrom: z.string().min(1, 'Required'),
  effectiveTo: z.string().min(1, 'Required'),
  shiftId: z.string().min(1, 'Select a shift'),
});

function RostersTab() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = React.useState(false);

  const { data: shiftsData } = useQuery({
    queryKey: ['shifts', '00000000-0000-0000-0000-000000000001'],
    queryFn: async () => { const { data } = await api.get('/shifts/shifts/00000000-0000-0000-0000-000000000001'); return data.data ?? []; },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['rosters'],
    queryFn: async () => { const { data } = await api.get('/shifts/rosters?limit=50'); return data.data ?? []; },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(rosterSchema) });

  const saveMutation = useMutation({
    mutationFn: (d: any) => api.post('/shifts/rosters', d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['rosters'] }); reset(); setShowForm(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/shifts/rosters/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rosters'] }),
  });

  const shiftOptions = (shiftsData ?? []).map((s: any) => ({ value: s.id, label: s.shiftName ?? s.shift_name }));
  const rosters: any[] = data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowForm(v => !v)}>
          <Plus size={14} /> New Roster
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input label="Roster Name *" error={errors.rosterName?.message as string} {...register('rosterName')} />
            <Select label="Shift *" options={shiftOptions} error={errors.shiftId?.message as string} {...register('shiftId')} />
            <Input label="Effective From *" type="date" error={errors.effectiveFrom?.message as string} {...register('effectiveFrom')} />
            <Input label="Effective To *" type="date" error={errors.effectiveTo?.message as string} {...register('effectiveTo')} />
            <div className="sm:col-span-2 lg:col-span-4 flex gap-3">
              <Button type="submit" size="sm" loading={saveMutation.isPending}>Save Roster</Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => { reset(); setShowForm(false); }}>Cancel</Button>
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
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Roster</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Shift</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Effective From</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Effective To</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rosters.map((r: any) => {
                const now = new Date();
                const from = new Date(r.effectiveFrom ?? r.effective_from);
                const to = new Date(r.effectiveTo ?? r.effective_to);
                const active = now >= from && now <= to;
                return (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium">{r.rosterName ?? r.roster_name}</td>
                    <td className="px-4 py-3 text-gray-600">{r.shiftName ?? r.shift?.shiftName ?? r.shiftId?.slice(0, 8)}</td>
                    <td className="px-4 py-3">{safeDate(r.effectiveFrom ?? r.effective_from)}</td>
                    <td className="px-4 py-3">{safeDate(r.effectiveTo ?? r.effective_to)}</td>
                    <td className="px-4 py-3"><Badge variant={active ? 'success' : 'default'}>{active ? 'Active' : 'Inactive'}</Badge></td>
                    <td className="px-4 py-3">
                      <button onClick={() => setConfirmId(s.id)} className="p-1.5 rounded hover:bg-red-50 hover:text-danger"><Trash2 size={13} /></button>
                    </td>
                  </tr>
                );
              })}
              {rosters.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">No records found.</td></tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Overtime tab ──────────────────────────────────────────────────────────────

const otSchema = z.object({
  otDate: z.string().min(1, 'Required'),
  hoursRequested: z.coerce.number().min(0.5).max(12),
  reason: z.string().min(5, 'Provide a reason'),
});

function OvertimeTab() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = React.useState(false);

  const { data: myOT, isLoading: loadingMy } = useQuery({
    queryKey: ['my-ot'],
    queryFn: async () => { const { data } = await api.get('/shifts/overtime/my?limit=30'); return data.data ?? []; },
  });

  const { data: pendingOT, isLoading: loadingPending } = useQuery({
    queryKey: ['pending-ot'],
    queryFn: async () => { const { data } = await api.get('/shifts/overtime?status=Pending&limit=50'); return data.data ?? []; },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(otSchema) });

  const submitMutation = useMutation({
    mutationFn: (d: any) => api.post('/shifts/overtime', d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['my-ot'] }); reset(); setShowForm(false); },
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.patch(`/shifts/overtime/${id}/approve`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pending-ot'] }),
  });

  const myOTs: any[] = myOT ?? [];
  const pending: any[] = pendingOT ?? [];

  return (
    <div className="space-y-6">
      {/* My OT */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">My Overtime Requests</h3>
          <Button size="sm" onClick={() => setShowForm(v => !v)}>
            <Plus size={14} /> Request OT
          </Button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
            <form onSubmit={handleSubmit(d => submitMutation.mutate(d))} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input label="OT Date *" type="date" error={errors.otDate?.message as string} {...register('otDate')} />
              <Input label="Hours Requested *" type="number" step="0.5" error={errors.hoursRequested?.message as string} {...register('hoursRequested')} />
              <Input label="Reason *" error={errors.reason?.message as string} {...register('reason')} />
              <div className="sm:col-span-3 flex gap-3">
                <Button type="submit" size="sm" loading={submitMutation.isPending}>Submit</Button>
                <Button type="button" size="sm" variant="secondary" onClick={() => { reset(); setShowForm(false); }}>Cancel</Button>
              </div>
            </form>
          </div>
        )}

        {loadingMy ? <Spinner /> : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Hours</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Reason</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Approved Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {myOTs.map((ot: any) => (
                  <tr key={ot.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">{safeDate(ot.otDate ?? ot.ot_date)}</td>
                    <td className="px-4 py-3">{ot.hoursRequested ?? ot.hours_requested}h</td>
                    <td className="px-4 py-3 max-w-xs truncate text-gray-500">{ot.reason}</td>
                    <td className="px-4 py-3"><Badge variant={ot.status === 'Approved' ? 'success' : ot.status === 'Rejected' ? 'danger' : 'warning'}>{ot.status ?? 'Pending'}</Badge></td>
                    <td className="px-4 py-3">{ot.hoursApproved ?? ot.hours_approved ? `${ot.hoursApproved ?? ot.hours_approved}h` : '—'}</td>
                  </tr>
                ))}
                {myOTs.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-400">No records found.</td></tr>
                )}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>

      {/* Pending OT approval */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Pending OT Approvals <Badge variant="warning">{pending.length}</Badge></h3>
        {loadingPending ? <Spinner /> : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Employee</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Hours Req.</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Reason</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pending.map((ot: any) => (
                  <tr key={ot.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium">{ot.employeeName ?? ot.employeeId?.slice(0, 8)}</td>
                    <td className="px-4 py-3">{safeDate(ot.otDate ?? ot.ot_date)}</td>
                    <td className="px-4 py-3">{ot.hoursRequested ?? ot.hours_requested}h</td>
                    <td className="px-4 py-3 max-w-xs truncate text-gray-500">{ot.reason}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => approveMutation.mutate({ id: ot.id, status: 'Approved' })} className="p-1.5 rounded bg-green-50 hover:bg-green-100 text-green-700" aria-label="Approve" title="Approve"><Check size={14} /></button>
                        <button onClick={() => approveMutation.mutate({ id: ot.id, status: 'Rejected' })} className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-danger" aria-label="Reject" title="Reject"><X size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {pending.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-400">No records found.</td></tr>
                )}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ShiftRosterPage() {
  const [tab, setTab] = React.useState('my');

  return (
    <div>
      <PageHeader title="Shifts & Rosters" subtitle="Manage shift definitions, employee rosters, and overtime" />

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

      {tab === 'my'      && <MyShiftTab />}
      {tab === 'shifts'  && <ShiftsTab />}
      {tab === 'rosters' && <RostersTab />}
      {tab === 'ot'      && <OvertimeTab />}
      <ConfirmDialog
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={() => { deleteMutation.mutate(confirmId!); setConfirmId(null); }}
        message="Delete this item?"
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
