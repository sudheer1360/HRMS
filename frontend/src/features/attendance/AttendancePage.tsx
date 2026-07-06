import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Clock, UserCheck, UserX, AlertCircle, LogIn, LogOut,
  Calendar, ChevronLeft, ChevronRight, Edit, Check, X, Lock, Unlock,
} from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Input, Select, Badge, Spinner } from '@components/ui/Input';
import { formatDate, cn } from '@lib/utils';
import api from '@lib/axios';
import { PageHeader } from '@components/ui/PageHeader';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName?: string;
  attendanceDate: string;
  inTime?: string;
  outTime?: string;
  totalHours?: string | number;
  status: string;
  source: string;
}

interface MonthlySummary {
  present: number;
  absent: number;
  halfDay: number;
  late: number;
  weeklyOff: number;
  holiday: number;
  workFromHome: number;
  totalWorkingDays: number;
  effectiveWorkingDays?: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function safeDate(v?: string | null): string {
  if (!v) return '—';
  try { return formatDate(v); } catch { return v; }
}

function fmtTime(ts?: string | null): string {
  if (!ts) return '—';
  try { return new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }); }
  catch { return ts; }
}

function statusVariant(s: string): 'success' | 'warning' | 'danger' | 'info' | 'default' {
  switch (s) {
    case 'Present': return 'success';
    case 'Work From Home': return 'info';
    case 'Late': case 'Half Day': return 'warning';
    case 'Absent': return 'danger';
    case 'Weekly Off': case 'Holiday': return 'default';
    default: return 'default';
  }
}

const STATUS_SHORT: Record<string, string> = {
  Present: 'P', Absent: 'A', 'Half Day': 'H', Late: 'L',
  'Weekly Off': 'W', Holiday: 'H*', 'Work From Home': 'WFH',
};

const STATUS_COLOR: Record<string, string> = {
  Present: 'bg-green-100 text-green-800',
  Absent: 'bg-red-100 text-red-800',
  'Half Day': 'bg-yellow-100 text-yellow-800',
  Late: 'bg-orange-100 text-orange-800',
  'Weekly Off': 'bg-gray-100 text-gray-500',
  Holiday: 'bg-blue-100 text-blue-700',
  'Work From Home': 'bg-teal-100 text-teal-800',
};

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'daily',       label: 'Daily View',      icon: Calendar },
  { key: 'monthly',     label: 'Monthly Summary', icon: Clock },
  { key: 'my',          label: 'My Attendance',   icon: UserCheck },
  { key: 'corrections', label: 'Corrections',      icon: Edit },
  { key: 'locks',       label: 'Period Locks',    icon: Lock },
];

// ── Clock In/Out card ─────────────────────────────────────────────────────────

function ClockCard() {
  const queryClient = useQueryClient();
  const [msg, setMsg] = React.useState('');

  const clockIn = useMutation({
    mutationFn: () => api.post('/attendance/clock-in'),
    onSuccess: () => { setMsg('Clocked in ✓'); queryClient.invalidateQueries({ queryKey: ['attendance-my'] }); setTimeout(() => setMsg(''), 3000); },
  });
  const clockOut = useMutation({
    mutationFn: () => api.post('/attendance/clock-out'),
    onSuccess: () => { setMsg('Clocked out ✓'); queryClient.invalidateQueries({ queryKey: ['attendance-my'] }); setTimeout(() => setMsg(''), 3000); },
  });

  const now = new Date();

  return (
    <div className="bg-gradient-to-r from-primary to-primary-light rounded-xl p-5 text-white flex items-center gap-6 mb-6">
      <div>
        <p className="text-3xl font-bold">{now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
        <p className="text-sm opacity-80">{formatDate(now.toISOString())}</p>
      </div>
      <div className="flex gap-3 ml-auto flex-wrap">
        <Button
          variant="secondary"
          onClick={() => clockIn.mutate()}
          loading={clockIn.isPending}
          className="bg-white/20 border-white/30 text-white hover:bg-white/30"
        >
          <LogIn size={16} /> Clock In
        </Button>
        <Button
          variant="secondary"
          onClick={() => clockOut.mutate()}
          loading={clockOut.isPending}
          className="bg-white/20 border-white/30 text-white hover:bg-white/30"
        >
          <LogOut size={16} /> Clock Out
        </Button>
      </div>
      {msg && <p className="text-sm font-medium opacity-90">{msg}</p>}
    </div>
  );
}

// ── Daily View tab ────────────────────────────────────────────────────────────

function DailyTab() {
  const today = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = React.useState(today);
  const [toDate, setToDate] = React.useState(today);

  const { data, isLoading } = useQuery({
    queryKey: ['attendance-daily', fromDate, toDate],
    queryFn: async () => {
      const { data } = await api.get(`/attendance?fromDate=${fromDate}&toDate=${toDate}&limit=100`);
      return data;
    },
  });

  const records: AttendanceRecord[] = data?.data ?? [];
  const stats = {
    present: records.filter(r => r.status === 'Present' || r.status === 'Work From Home').length,
    absent: records.filter(r => r.status === 'Absent').length,
    halfDay: records.filter(r => r.status === 'Half Day').length,
    late: records.filter(r => r.status === 'Late').length,
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-end">
        <Input label="From Date" type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="w-40" />
        <Input label="To Date" type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="w-40" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Present', value: stats.present, icon: UserCheck, color: 'text-green-600 bg-green-50' },
          { label: 'Absent', value: stats.absent, icon: UserX, color: 'text-red-600 bg-red-50' },
          { label: 'Half Day', value: stats.halfDay, icon: AlertCircle, color: 'text-yellow-600 bg-yellow-50' },
          { label: 'Late', value: stats.late, icon: Clock, color: 'text-orange-600 bg-orange-50' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div className={cn('p-2 rounded-lg', s.color)}><Icon size={18} /></div>
              <div><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-gray-500">{s.label}</p></div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? <Spinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Employee</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">In</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Out</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Hours</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{r.employeeName ?? r.employeeId?.slice(0, 8)}</td>
                    <td className="px-4 py-3">{safeDate(r.attendanceDate)}</td>
                    <td className="px-4 py-3">{fmtTime(r.inTime)}</td>
                    <td className="px-4 py-3">{fmtTime(r.outTime)}</td>
                    <td className="px-4 py-3">{r.totalHours ? Number(r.totalHours).toFixed(1) + 'h' : '—'}</td>
                    <td className="px-4 py-3"><Badge variant={statusVariant(r.status)}>{r.status}</Badge></td>
                    <td className="px-4 py-3 text-gray-500">{r.source}</td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">No records for selected range</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Monthly Summary tab ───────────────────────────────────────────────────────

function MonthlyTab() {
  const now = new Date();
  const [year, setYear] = React.useState(now.getFullYear());
  const [month, setMonth] = React.useState(now.getMonth() + 1);

  const { data, isLoading } = useQuery({
    queryKey: ['attendance-monthly', year, month],
    queryFn: async () => {
      const { data } = await api.get(`/attendance/my/summary?year=${year}&month=${month}`);
      return data.data.summary as MonthlySummary;
    },
  });

  const prev = () => { if (month === 1) { setYear(y => y - 1); setMonth(12); } else setMonth(m => m - 1); };
  const next = () => { if (month === 12) { setYear(y => y + 1); setMonth(1); } else setMonth(m => m + 1); };
  const monthLabel = new Date(year, month - 1, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });

  const summary: MonthlySummary = data ?? { present: 0, absent: 0, halfDay: 0, late: 0, weeklyOff: 0, holiday: 0, workFromHome: 0, totalWorkingDays: 0 };

  const cards = [
    { label: 'Present', value: summary.present, color: 'bg-green-500' },
    { label: 'Absent', value: summary.absent, color: 'bg-red-500' },
    { label: 'Half Day', value: summary.halfDay, color: 'bg-yellow-500' },
    { label: 'Late', value: summary.late, color: 'bg-orange-500' },
    { label: 'WFH', value: summary.workFromHome, color: 'bg-teal-500' },
    { label: 'Weekly Off', value: summary.weeklyOff, color: 'bg-gray-400' },
    { label: 'Holiday', value: summary.holiday, color: 'bg-blue-500' },
    { label: 'Working Days', value: summary.totalWorkingDays, color: 'bg-primary' },
  ];

  return (
    <div className="space-y-4">
      {/* Month navigator */}
      <div className="flex items-center gap-4">
        <button onClick={prev} className="p-2 rounded-lg border hover:bg-gray-50"><ChevronLeft size={16} /></button>
        <p className="text-lg font-semibold text-gray-900 w-44 text-center">{monthLabel}</p>
        <button onClick={next} className="p-2 rounded-lg border hover:bg-gray-50"><ChevronRight size={16} /></button>
      </div>

      {isLoading ? <Spinner /> : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {cards.map(c => (
            <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg ${c.color} flex items-center justify-center text-white font-bold text-lg`}>{c.value}</div>
              <p className="text-sm font-medium text-gray-700">{c.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── My Attendance tab ─────────────────────────────────────────────────────────

function MyAttendanceTab() {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = today.toISOString().split('T')[0];

  const { data, isLoading } = useQuery({
    queryKey: ['attendance-my'],
    queryFn: async () => {
      const { data } = await api.get(`/attendance/my?fromDate=${firstDay}&toDate=${lastDay}&limit=50`);
      return data;
    },
  });

  const records: AttendanceRecord[] = data?.data ?? [];

  // Build calendar grid
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstWeekday = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  const recordMap = new Map(records.map(r => [r.attendanceDate?.split('T')[0], r]));

  return (
    <div className="space-y-4">
      {/* Calendar */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-sm font-semibold text-gray-700 mb-3">
          {today.toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
        </p>
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <p key={d} className="text-xs font-medium text-gray-400">{d}</p>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstWeekday }, (_, i) => <div key={`e-${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const rec = recordMap.get(dateStr);
            const isToday = day === today.getDate();
            const colorClass = rec ? (STATUS_COLOR[rec.status] ?? 'bg-gray-100') : '';
            return (
              <div
                key={day}
                title={rec?.status ?? ''}
                className={cn(
                  'rounded-lg p-1 text-center text-xs font-medium',
                  colorClass || 'text-gray-400',
                  isToday && 'ring-2 ring-primary ring-offset-1',
                )}
              >
                <p>{day}</p>
                {rec && <p className="text-[9px] leading-none mt-0.5">{STATUS_SHORT[rec.status] ?? ''}</p>}
              </div>
            );
          })}
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
          {Object.entries(STATUS_COLOR).map(([k, v]) => (
            <span key={k} className={cn('text-xs px-2 py-0.5 rounded-full', v)}>{k}</span>
          ))}
        </div>
      </div>

      {/* Detail list */}
      {isLoading ? <Spinner /> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">In</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Out</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Hours</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{safeDate(r.attendanceDate)}</td>
                  <td className="px-4 py-3">{fmtTime(r.inTime)}</td>
                  <td className="px-4 py-3">{fmtTime(r.outTime)}</td>
                  <td className="px-4 py-3">{r.totalHours ? Number(r.totalHours).toFixed(1) + 'h' : '—'}</td>
                  <td className="px-4 py-3"><Badge variant={statusVariant(r.status)}>{r.status}</Badge></td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">No records this month</td></tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Corrections tab ───────────────────────────────────────────────────────────

const correctionSchema = z.object({
  attendanceDate: z.string().min(1, 'Required'),
  requestedInTime: z.string().optional(),
  requestedOutTime: z.string().optional(),
  reason: z.string().min(5, 'Provide a reason'),
});

function CorrectionsTab() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = React.useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['attendance-corrections'],
    queryFn: async () => {
      const { data } = await api.get('/attendance/corrections?limit=50');
      return data;
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(correctionSchema),
  });

  const submitMutation = useMutation({
    mutationFn: (d: any) => api.post('/attendance/corrections', d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-corrections'] });
      reset(); setShowForm(false);
    },
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'approve' | 'reject' }) =>
      api.patch(`/attendance/corrections/${id}/${action}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attendance-corrections'] }),
  });

  const corrections: any[] = data?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowForm(v => !v)}>
          <Edit size={14} /> Request Correction
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold mb-4">New Correction Request</h3>
          <form onSubmit={handleSubmit(d => submitMutation.mutate(d))} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Attendance Date *" type="date" error={errors.attendanceDate?.message as string} {...register('attendanceDate')} />
            <Input label="Requested In Time" type="time" {...register('requestedInTime')} />
            <Input label="Requested Out Time" type="time" {...register('requestedOutTime')} />
            <Input label="Reason *" error={errors.reason?.message as string} {...register('reason')} />
            <div className="sm:col-span-2 flex gap-3">
              <Button type="submit" size="sm" loading={submitMutation.isPending}>Submit</Button>
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
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Requested In</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Requested Out</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Reason</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {corrections.map((c: any) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{safeDate(c.attendanceDate)}</td>
                  <td className="px-4 py-3">{c.requestedInTime ?? '—'}</td>
                  <td className="px-4 py-3">{c.requestedOutTime ?? '—'}</td>
                  <td className="px-4 py-3 max-w-xs truncate text-gray-600">{c.reason}</td>
                  <td className="px-4 py-3">
                    <Badge variant={c.status === 'Approved' ? 'success' : c.status === 'Rejected' ? 'danger' : 'warning'}>
                      {c.status ?? 'Pending'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {(c.status === 'Pending' || !c.status) && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => approveMutation.mutate({ id: c.id, action: 'approve' })}
                          className="p-1.5 rounded hover:bg-green-50 hover:text-green-600" aria-label="Approve" title="Approve"
                        ><Check size={14} /></button>
                        <button
                          onClick={() => approveMutation.mutate({ id: c.id, action: 'reject' })}
                          className="p-1.5 rounded hover:bg-red-50 hover:text-danger" aria-label="Reject" title="Reject"
                        ><X size={14} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {corrections.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">No correction requests</td></tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Locks tab ─────────────────────────────────────────────────────────────────

function LocksTab() {
  const queryClient = useQueryClient();

  // We need a companyId — try to get it from profile
  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: async () => { const { data } = await api.get('/auth/me'); return data.data; },
  });
  const companyId = profile?.companyId ?? profile?.company_id ?? '00000000-0000-0000-0000-000000000001';

  const { data, isLoading } = useQuery({
    queryKey: ['attendance-locks', companyId],
    queryFn: async () => {
      const { data } = await api.get(`/attendance/locks/${companyId}`);
      return data.data ?? [];
    },
    enabled: !!companyId,
  });

  const lockMutation = useMutation({
    mutationFn: (d: any) => api.post('/attendance/lock', d),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attendance-locks'] }),
  });

  const unlockMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/attendance/lock/${id}/unlock`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attendance-locks'] }),
  });

  const [fromDate, setFromDate] = React.useState('');
  const [toDate, setToDate] = React.useState('');

  const locks: any[] = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-end">
        <Input label="From" type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="w-40" />
        <Input label="To" type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="w-40" />
        <Button
          size="sm"
          disabled={!fromDate || !toDate}
          loading={lockMutation.isPending}
          onClick={() => lockMutation.mutate({ companyId, fromDate, toDate })}
        >
          <Lock size={14} /> Lock Period
        </Button>
      </div>

      {isLoading ? <Spinner /> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Period</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Locked By</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Locked At</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {locks.map((l: any) => (
                <tr key={l.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{safeDate(l.periodStart ?? l.fromDate ?? l.from_date)} → {safeDate(l.periodEnd ?? l.toDate ?? l.to_date)}</td>
                  <td className="px-4 py-3 text-gray-500">{l.lockedBy ?? l.locked_by ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{safeDate(l.lockedAt ?? l.createdAt ?? l.created_at)}</td>
                  <td className="px-4 py-3"><Badge variant={!l.unlockedAt ? 'danger' : 'success'}>{!l.unlockedAt ? 'Locked' : 'Unlocked'}</Badge></td>
                  <td className="px-4 py-3">
                    {!l.unlockedAt && (
                      <button
                        onClick={() => unlockMutation.mutate(l.id)}
                        className="flex items-center gap-1 text-xs px-2 py-1 rounded border hover:bg-gray-50"
                      >
                        <Unlock size={12} /> Unlock
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {locks.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">No period locks</td></tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AttendancePage() {
  const [tab, setTab] = React.useState('my');

  return (
    <div>
      <PageHeader title="Attendance" subtitle="Track and manage attendance records" />

      <ClockCard />

      {/* Tabs */}
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

      {tab === 'daily'       && <DailyTab />}
      {tab === 'monthly'     && <MonthlyTab />}
      {tab === 'my'          && <MyAttendanceTab />}
      {tab === 'corrections' && <CorrectionsTab />}
      {tab === 'locks'       && <LocksTab />}
    </div>
  );
}
