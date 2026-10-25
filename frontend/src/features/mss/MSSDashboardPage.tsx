import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users, CheckCircle, XCircle, Clock, Calendar,
  TrendingUp, User, BarChart2,
} from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Badge, Spinner } from '@components/ui/Input';
import { formatDate } from '@lib/utils';
import { leaveService } from '@features/../services/leave.service';
import { attendanceService } from '@features/../services/attendance.service';
import { employeeService } from '@features/../services/employee.service';
import { shiftService } from '@features/../services/shift.service';
import { PageHeader } from '@components/ui/PageHeader';

// ── Helpers ───────────────────────────────────────────────────────────────────

function safeDate(v?: string | null) {
  if (!v) return '—';
  try { return formatDate(v); } catch { return v; }
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'approvals',  label: 'Pending Approvals', icon: CheckCircle },
  { key: 'team',       label: 'My Team',           icon: Users },
  { key: 'attendance', label: 'Team Attendance',   icon: Clock },
  { key: 'leaves',     label: 'Team Leaves',       icon: Calendar },
  { key: 'ot',         label: 'OT Approvals',      icon: TrendingUp },
];

// ── Approvals tab ─────────────────────────────────────────────────────────────

function ApprovalsTab() {
  const queryClient = useQueryClient();

  const { data: leaveData, isLoading: loadingLeaves } = useQuery({
    queryKey: ['mss-leave-pending'],
    queryFn: async () => { const { data } = await leaveService.list({ status: 'Pending', limit: 30 }); return data.data ?? []; },
  });

  const { data: corrData, isLoading: loadingCorr } = useQuery({
    queryKey: ['mss-corr-pending'],
    queryFn: async () => { const { data } = await attendanceService.listCorrections({ status: 'Pending Approval', limit: 20 }); return data.data ?? []; },
  });

  const approveLeaveMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => leaveService.approve(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mss-leave-pending'] }),
  });

  const approveCorrMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) => action === 'approve' ? attendanceService.approveCorrection(id) : attendanceService.rejectCorrection(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mss-corr-pending'] }),
  });

  const leaves: any[] = leaveData ?? [];
  const corrections: any[] = corrData ?? [];

  return (
    <div className="space-y-5">
      {/* Leave Approvals */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Leave Requests</h3>
          <Badge variant="warning">{leaves.length} pending</Badge>
        </div>
        {loadingLeaves ? <Spinner /> : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Employee</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">From</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">To</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Days</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Reason</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leaves.map((l: any) => (
                <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium">{l.employeeName ?? l.employeeId?.slice(0, 8)}</td>
                  <td className="px-4 py-3"><Badge variant="info">{l.leaveName ?? l.leaveType ?? l.leave_type}</Badge></td>
                  <td className="px-4 py-3">{safeDate(l.fromDate ?? l.from_date)}</td>
                  <td className="px-4 py-3">{safeDate(l.toDate ?? l.to_date)}</td>
                  <td className="px-4 py-3">{l.totalDays ?? l.total_days ?? '—'}</td>
                  <td className="px-4 py-3 max-w-xs truncate text-gray-500">{l.reason ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => approveLeaveMutation.mutate({ id: l.id, status: 'Approved' })} className="p-1.5 rounded bg-green-50 hover:bg-green-100 text-green-700" aria-label="Approve" title="Approve"><CheckCircle size={14} /></button>
                      <button onClick={() => approveLeaveMutation.mutate({ id: l.id, status: 'Rejected' })} className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-600" aria-label="Reject" title="Reject"><XCircle size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {leaves.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">No pending leave requests</td></tr>
              )}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* Attendance Corrections */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Attendance Corrections</h3>
          <Badge variant="warning">{corrections.length} pending</Badge>
        </div>
        {loadingCorr ? <Spinner /> : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Employee</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Current → Requested</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Reason</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {corrections.map((c: any) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium">{c.fullName ?? c.employeeName ?? c.employeeId?.slice(0, 8)}</td>
                  <td className="px-4 py-3">{safeDate(c.attendanceDate ?? c.attendance_date)}</td>
                  <td className="px-4 py-3">
                    <span className="text-gray-500">{c.currentStatus ?? c.current_status}</span>
                    <span className="mx-1 text-gray-400">→</span>
                    <span className="font-medium">{c.requestedStatus ?? c.requested_status}</span>
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate text-gray-500">{c.reason}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => approveCorrMutation.mutate({ id: c.id, action: 'approve' })} className="p-1.5 rounded bg-green-50 hover:bg-green-100 text-green-700" aria-label="Approve" title="Approve"><CheckCircle size={14} /></button>
                      <button onClick={() => approveCorrMutation.mutate({ id: c.id, action: 'reject' })} className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-600" aria-label="Reject" title="Reject"><XCircle size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {corrections.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-400">No pending corrections</td></tr>
              )}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── My Team tab ───────────────────────────────────────────────────────────────

function MyTeamTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['mss-team'],
    queryFn: async () => { const { data } = await employeeService.list({ limit: 100 }); return data.data ?? []; },
  });

  const team: any[] = data ?? [];

  if (isLoading) return <Spinner />;

  const stats = [
    { label: 'Team Size', value: team.length, icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: 'Active', value: team.filter((e: any) => (e.status ?? e.employmentStatus) === 'Active').length, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
    { label: 'On Probation', value: team.filter((e: any) => (e.employmentType ?? e.employment_type) === 'Probation').length, icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {stats.map(s => {
          const I = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${s.color}`}><I size={18} /></div>
              <div><p className="text-xl font-bold">{s.value}</p><p className="text-xs text-gray-500">{s.label}</p></div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {team.map((emp: any) => (
          <div key={emp.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 hover:shadow-sm transition-shadow">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
              {(emp.fullName ?? emp.full_name ?? '?')[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900 truncate">{emp.fullName ?? emp.full_name}</p>
              <p className="text-xs text-gray-500 truncate">{emp.designation ?? '—'}</p>
              <div className="flex items-center gap-1 mt-1">
                <Badge variant={(emp.status ?? emp.employmentStatus) === 'Active' ? 'success' : 'default'}>
                  {emp.status ?? emp.employmentStatus ?? 'Active'}
                </Badge>
              </div>
            </div>
          </div>
        ))}
        {team.length === 0 && (
          <div className="col-span-3 bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
            <Users size={36} className="mx-auto mb-3 text-gray-300" />
            <p>No team members found</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Team Attendance tab ───────────────────────────────────────────────────────

function TeamAttendanceTab() {
  const [date, setDate] = React.useState(() => new Date().toISOString().slice(0, 10));

  const { data, isLoading } = useQuery({
    queryKey: ['team-attendance', date],
    queryFn: async () => { const { data } = await attendanceService.list({ date, limit: 100 }); return data.data ?? []; },
  });

  const records: any[] = data ?? [];

  const STATUS_VARIANT: Record<string, 'success' | 'danger' | 'warning' | 'info' | 'default'> = {
    Present: 'success', Absent: 'danger', Late: 'warning', 'Half Day': 'info',
    WFH: 'info', Holiday: 'default', Weekend: 'default',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <span className="text-sm text-gray-500">{records.length} records</span>
      </div>

      {isLoading ? <Spinner /> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Employee</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Clock In</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Clock Out</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Hours</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map((r: any) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium">{r.fullName ?? r.employeeName ?? r.employeeId?.slice(0, 8)}</td>
                  <td className="px-4 py-3 font-mono text-xs">{r.inTime ?? r.clockIn ?? r.clock_in ?? '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs">{r.outTime ?? r.clockOut ?? r.clock_out ?? '—'}</td>
                  <td className="px-4 py-3">{r.totalHours ?? r.total_hours ? `${r.totalHours ?? r.total_hours}h` : '—'}</td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[r.status] ?? 'default'}>{r.status ?? 'Unknown'}</Badge>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-400">No attendance records for this date</td></tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Team Leaves tab ───────────────────────────────────────────────────────────

function TeamLeavesTab() {
  const [status, setStatus] = React.useState('All');

  const { data, isLoading } = useQuery({
    queryKey: ['team-leaves', status],
    queryFn: async () => {
      const q = status !== 'All' ? `?status=${status}&limit=50` : '?limit=50';
      const { data } = await leaveService.list(Object.fromEntries(new URLSearchParams(q.replace('?',''))));
      return data.data ?? [];
    },
  });

  const leaves: any[] = data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex gap-1">
        {['All', 'Pending', 'Approved', 'Rejected'].map(s => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              status === s ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading ? <Spinner /> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Employee</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">From</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">To</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Days</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leaves.map((l: any) => (
                <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium">{l.employeeName ?? l.employeeId?.slice(0, 8)}</td>
                  <td className="px-4 py-3"><Badge variant="info">{l.leaveName ?? l.leaveType ?? l.leave_type}</Badge></td>
                  <td className="px-4 py-3">{safeDate(l.fromDate ?? l.from_date)}</td>
                  <td className="px-4 py-3">{safeDate(l.toDate ?? l.to_date)}</td>
                  <td className="px-4 py-3">{l.totalDays ?? l.total_days ?? '—'}</td>
                  <td className="px-4 py-3">
                    <Badge variant={l.status === 'Approved' ? 'success' : l.status === 'Rejected' ? 'danger' : 'warning'}>
                      {l.status ?? 'Pending'}
                    </Badge>
                  </td>
                </tr>
              ))}
              {leaves.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">No leave records</td></tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── OT Approvals tab ──────────────────────────────────────────────────────────

function OTApprovalsTab() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['mss-ot'],
    queryFn: async () => { const { data } = await shiftService.listOvertime({ status: 'Pending', limit: 50 }); return data.data ?? []; },
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => shiftService.approveOvertime(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mss-ot'] }),
  });

  const ots: any[] = data ?? [];

  if (isLoading) return <Spinner />;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Employee</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">OT Date</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Hours Req.</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Reason</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {ots.map((ot: any) => (
            <tr key={ot.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium">{ot.employeeName ?? ot.employeeId?.slice(0, 8)}</td>
              <td className="px-4 py-3">{safeDate(ot.otDate ?? ot.ot_date)}</td>
              <td className="px-4 py-3">{ot.hoursRequested ?? ot.hours_requested}h</td>
              <td className="px-4 py-3 max-w-xs truncate text-gray-500">{ot.reason}</td>
              <td className="px-4 py-3">
                <div className="flex gap-1">
                  <button onClick={() => approveMutation.mutate({ id: ot.id, status: 'Approved' })} className="p-1.5 rounded bg-green-50 hover:bg-green-100 text-green-700" aria-label="Approve" title="Approve"><CheckCircle size={14} /></button>
                  <button onClick={() => approveMutation.mutate({ id: ot.id, status: 'Rejected' })} className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-600" aria-label="Reject" title="Reject"><XCircle size={14} /></button>
                </div>
              </td>
            </tr>
          ))}
          {ots.length === 0 && (
            <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-400">No pending OT approvals</td></tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MSSDashboardPage() {
  const [tab, setTab] = React.useState('approvals');

  // Badge counts
  const { data: leaveCount } = useQuery({
    queryKey: ['mss-leave-count'],
    queryFn: async () => { const { data } = await leaveService.list({ status: 'Pending', limit: 1 }); return data.meta?.total ?? 0; },
  });
  const { data: otCount } = useQuery({
    queryKey: ['mss-ot-count'],
    queryFn: async () => { const { data } = await shiftService.listOvertime({ status: 'Pending', limit: 1 }); return data.meta?.total ?? 0; },
  });

  const BADGE: Record<string, number | undefined> = {
    approvals: (leaveCount ?? 0) + (otCount ?? 0) || undefined,
    ot: otCount || undefined,
  };

  return (
    <div>
      <PageHeader title="Manager Self Service" subtitle="Manage your team efficiently" />

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg flex-wrap">
        {TABS.map(t => {
          const I = t.icon;
          const count = BADGE[t.key];
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${
                tab === t.key ? 'bg-white shadow text-primary' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <I size={14} />{t.label}
              {count ? (
                <span className="bg-danger text-white text-xs px-1.5 py-0.5 rounded-full leading-none">{count}</span>
              ) : null}
            </button>
          );
        })}
      </div>

      {tab === 'approvals'  && <ApprovalsTab />}
      {tab === 'team'       && <MyTeamTab />}
      {tab === 'attendance' && <TeamAttendanceTab />}
      {tab === 'leaves'     && <TeamLeavesTab />}
      {tab === 'ot'         && <OTApprovalsTab />}
    </div>
  );
}
