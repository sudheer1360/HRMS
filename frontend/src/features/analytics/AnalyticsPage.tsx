import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users, TrendingDown, Banknote, Clock, FileText,
  TrendingUp, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import { Badge, Spinner } from '@components/ui/Input';
import { formatCurrency } from '@lib/utils';
import { analyticsService } from '@features/../services/analytics.service';
import { PageHeader } from '@components/ui/PageHeader';

// ── Helpers ───────────────────────────────────────────────────────────────────

function safeCurrency(v?: number | null) {
  const n = Number(v ?? 0);
  try { return formatCurrency(n); } catch { return `₹${n.toLocaleString('en-IN')}`; }
}

function MetricCard({ label, value, change, changeType, sub }: {
  label: string; value: string | number; change?: string; changeType?: 'up' | 'down' | 'neutral'; sub?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      {change && (
        <div className={`flex items-center gap-1 mt-1 text-xs ${changeType === 'up' ? 'text-green-600' : changeType === 'down' ? 'text-red-500' : 'text-gray-400'}`}>
          {changeType === 'up' ? <ArrowUpRight size={12} /> : changeType === 'down' ? <ArrowDownRight size={12} /> : null}
          <span>{change}</span>
        </div>
      )}
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function BarChart({ data, labelKey, valueKey, color = 'bg-primary' }: {
  data: any[]; labelKey: string; valueKey: string; color?: string;
}) {
  const max = Math.max(...data.map(d => Number(d[valueKey] ?? 0)), 1);
  return (
    <div className="space-y-2">
      {data.map(d => {
        const val = Number(d[valueKey] ?? 0);
        const pct = Math.round((val / max) * 100);
        return (
          <div key={d[labelKey]} className="flex items-center gap-3">
            <div className="w-28 text-xs text-gray-600 text-right truncate">{d[labelKey]}</div>
            <div className="flex-1 h-5 bg-gray-100 rounded-sm overflow-hidden">
              <div className={`h-5 ${color} rounded-sm transition-all`} style={{ width: `${pct}%` }} />
            </div>
            <div className="w-12 text-xs text-gray-500 text-right">{val}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'headcount',   label: 'Headcount',         icon: Users },
  { key: 'attrition',   label: 'Attrition',         icon: TrendingDown },
  { key: 'payroll',     label: 'Payroll Summary',   icon: Banknote },
  { key: 'attendance',  label: 'Attendance',        icon: Clock },
  { key: 'reports',     label: 'Reports',            icon: FileText },
];

// ── Headcount tab ─────────────────────────────────────────────────────────────

function HeadcountTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics-headcount'],
    queryFn: async () => { const { data } = await analyticsService.getHeadcount(); return data; },
  });

  const d = data?.data ?? {};
  const deptBreakdown: any[] = d.byDepartment ?? [];
  const gradeBreakdown: any[] = d.byGrade ?? [];
  const empTypeBreakdown: any[] = d.byEmploymentType ?? [];

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="Total Headcount" value={d.totalHeadcount ?? 0} change={`+${d.joinedThisMonth ?? 0} this month`} changeType="up" />
        <MetricCard label="Active Employees" value={d.activeEmployees ?? 0} sub={`${d.onLeaveToday ?? 0} on leave today`} />
        <MetricCard label="New Joiners (MTD)" value={d.joinedThisMonth ?? 0} changeType="up" />
        <MetricCard label="Open Positions" value={d.openPositions ?? 0} sub="From requisitions" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* By department */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Headcount by Department</h3>
          <BarChart data={deptBreakdown} labelKey="department" valueKey="count" color="bg-blue-500" />
          {deptBreakdown.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No data</p>}
        </div>

        {/* By type */}
        <div className="space-y-3">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">By Employment Type</h3>
            <div className="space-y-2">
              {empTypeBreakdown.map((t: any) => (
                <div key={t.employmentType} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t.employmentType}</span>
                  <span className="text-sm font-semibold">{t.count}</span>
                </div>
              ))}
              {empTypeBreakdown.length === 0 && <p className="text-sm text-gray-400">No data</p>}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">By Grade</h3>
            <div className="space-y-2">
              {gradeBreakdown.map((g: any) => (
                <div key={g.grade} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{g.grade}</span>
                  <span className="text-sm font-semibold">{g.count}</span>
                </div>
              ))}
              {gradeBreakdown.length === 0 && <p className="text-sm text-gray-400">No data</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Attrition tab ─────────────────────────────────────────────────────────────

function AttritionTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics-attrition'],
    queryFn: async () => { const { data } = await analyticsService.getAttrition(); return data; },
  });

  const d = data?.data ?? {};
  const monthly: any[] = d.monthlyTrend ?? [];
  const byReason: any[] = d.byReason ?? [];
  const byDept: any[] = d.byDepartment ?? [];

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="Attrition Rate (YTD)" value={`${d.attritionRateYTD ?? 0}%`}
          change={d.attritionRateYTD > 15 ? 'Above industry avg' : 'Within healthy range'}
          changeType={d.attritionRateYTD > 15 ? 'down' : 'up'} />
        <MetricCard label="Exits (MTD)" value={d.exitsThisMonth ?? 0} />
        <MetricCard label="Exits (YTD)" value={d.exitsYTD ?? 0} />
        <MetricCard label="Avg Tenure (Exited)" value={`${d.avgTenureMonths ?? 0} mo`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Monthly Attrition Trend</h3>
          <BarChart data={monthly} labelKey="month" valueKey="exits" color="bg-red-400" />
          {monthly.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No trend data available</p>}
        </div>

        <div className="space-y-3">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">By Reason</h3>
            <div className="space-y-2">
              {byReason.map((r: any) => (
                <div key={r.reason} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{r.reason}</span>
                  <span className="text-sm font-semibold">{r.count}</span>
                </div>
              ))}
              {byReason.length === 0 && <p className="text-sm text-gray-400">No data</p>}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">By Department</h3>
            <BarChart data={byDept} labelKey="department" valueKey="count" color="bg-orange-400" />
            {byDept.length === 0 && <p className="text-sm text-gray-400">No data</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Payroll Summary tab ───────────────────────────────────────────────────────

function PayrollSummaryTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics-payroll'],
    queryFn: async () => { const { data } = await analyticsService.getPayrollAnalytics(); return data; },
  });

  const d = data?.data ?? {};
  const monthly: any[] = d.monthlyTrend ?? [];
  const byDept: any[] = d.byDepartment ?? [];

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="Total Payroll (MTD)" value={safeCurrency(d.totalPayrollMTD)} change={d.mtdChange ? `${d.mtdChange > 0 ? '+' : ''}${d.mtdChange}% vs last month` : undefined} changeType={d.mtdChange > 0 ? 'up' : 'down'} />
        <MetricCard label="Avg Salary" value={safeCurrency(d.avgSalary)} />
        <MetricCard label="Total PF (MTD)" value={safeCurrency(d.totalPF)} sub="Employer + Employee" />
        <MetricCard label="Total TDS (MTD)" value={safeCurrency(d.totalTDS)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Monthly Payroll Trend</h3>
          <BarChart data={monthly} labelKey="month" valueKey="netPay" color="bg-green-500" />
          {monthly.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No trend data available</p>}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-3">Payroll by Department</h3>
          <div className="space-y-2">
            {byDept.map((d: any) => (
              <div key={d.department} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{d.department}</span>
                <span className="text-sm font-semibold">{safeCurrency(d.netPay)}</span>
              </div>
            ))}
            {byDept.length === 0 && <p className="text-sm text-gray-400">No data</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Attendance Analytics tab ──────────────────────────────────────────────────

function AttendanceAnalyticsTab() {
  const [month, setMonth] = React.useState(new Date().toISOString().slice(0, 7));

  const { data, isLoading } = useQuery({
    queryKey: ['analytics-attendance', month],
    queryFn: async () => { const { data } = await analyticsService.getAttendanceAnalytics({ month }); return data; },
  });

  const d = data?.data ?? {};
  const byDept: any[] = d.byDepartment ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <input type="month" value={month} onChange={e => setMonth(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
      </div>

      {isLoading ? <Spinner /> : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricCard label="Avg Attendance Rate" value={`${d.avgAttendanceRate ?? 0}%`} changeType={d.avgAttendanceRate >= 90 ? 'up' : 'down'} />
            <MetricCard label="Total Working Days" value={d.workingDays ?? 0} />
            <MetricCard label="Avg Late Arrivals/Day" value={d.avgLateArrivals ?? 0} />
            <MetricCard label="Avg Overtime Hrs" value={`${d.avgOvertimeHours ?? 0}h`} />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Attendance by Department</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 border-b border-gray-200">
                  {['Department', 'Present Days', 'Absent Days', 'Late Arrivals', 'Attendance %'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {byDept.map((d: any) => (
                    <tr key={d.department} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium">{d.department}</td>
                      <td className="px-4 py-3 text-sm">{d.presentDays ?? 0}</td>
                      <td className="px-4 py-3 text-sm text-danger">{d.absentDays ?? 0}</td>
                      <td className="px-4 py-3 text-sm">{d.lateArrivals ?? 0}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-gray-100 rounded-full">
                            <div className={`h-1.5 rounded-full ${(d.attendanceRate ?? 0) >= 90 ? 'bg-green-500' : 'bg-yellow-400'}`}
                              style={{ width: `${d.attendanceRate ?? 0}%` }} />
                          </div>
                          <span className="text-sm font-medium">{d.attendanceRate ?? 0}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {byDept.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-400">No attendance data for {month}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Reports tab ───────────────────────────────────────────────────────────────

const REPORT_TYPES = [
  { id: 'headcount', label: 'Headcount Report', desc: 'Employee count by department, grade and type', endpoint: '/extended/analytics/reports/headcount' },
  { id: 'attrition', label: 'Attrition Report', desc: 'Monthly/yearly attrition with reasons', endpoint: '/extended/analytics/reports/attrition' },
  { id: 'payroll', label: 'Payroll Register', desc: 'Employee-wise salary breakdown', endpoint: '/extended/analytics/reports/payroll' },
  { id: 'leave', label: 'Leave Utilization Report', desc: 'Leave balances and utilization by employee', endpoint: '/extended/analytics/reports/leave' },
  { id: 'attendance', label: 'Attendance Summary', desc: 'Monthly attendance summary with OT', endpoint: '/extended/analytics/reports/attendance' },
  { id: 'training', label: 'Training Completion Report', desc: 'Program-wise completion and hours logged', endpoint: '/extended/analytics/reports/training' },
];

function ReportsTab() {
  const [generating, setGenerating] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<any>(null);

  const generate = async (r: typeof REPORT_TYPES[0]) => {
    setGenerating(r.id);
    try {
      const { data } = await analyticsService.generateReport(r.type);
      setResult({ id: r.id, label: r.label, data: data.data ?? [] });
    } catch {
      setResult({ id: r.id, label: r.label, data: [] });
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">Available Reports</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {REPORT_TYPES.map(r => (
          <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-blue-50 rounded-lg"><FileText size={16} className="text-blue-600" /></div>
              <div>
                <p className="font-semibold text-sm text-gray-900">{r.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{r.desc}</p>
              </div>
            </div>
            <button
              className="mt-auto text-sm font-medium text-primary hover:underline flex items-center gap-1"
              onClick={() => generate(r)}
              disabled={generating === r.id}
            >
              {generating === r.id ? 'Generating…' : 'Generate Report'} <TrendingUp size={12} />
            </button>
          </div>
        ))}
      </div>

      {result && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="font-semibold text-sm text-gray-900">{result.label}</h3>
            <button onClick={() => setResult(null)} className="text-xs text-gray-400 hover:text-gray-700">Close</button>
          </div>
          {result.data.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-gray-400">No data available for this report</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 border-b border-gray-200">
                  {Object.keys(result.data[0]).map(k => (
                    <th key={k} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{k.replace(/_/g, ' ')}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {result.data.slice(0, 50).map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      {Object.values(row).map((v: any, j: number) => (
                        <td key={j} className="px-4 py-2 text-sm text-gray-600">{typeof v === 'boolean' ? (v ? 'Yes' : 'No') : String(v ?? '—')}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {result.data.length > 50 && <p className="px-4 py-2 text-xs text-gray-400">Showing 50 of {result.data.length} rows</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [tab, setTab] = React.useState('headcount');

  return (
    <div>
      <PageHeader title="HR Analytics" subtitle="Headcount, attrition, payroll, attendance analytics and reports" />

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

      {tab === 'headcount'  && <HeadcountTab />}
      {tab === 'attrition'  && <AttritionTab />}
      {tab === 'payroll'    && <PayrollSummaryTab />}
      {tab === 'attendance' && <AttendanceAnalyticsTab />}
      {tab === 'reports'    && <ReportsTab />}
    </div>
  );
}
