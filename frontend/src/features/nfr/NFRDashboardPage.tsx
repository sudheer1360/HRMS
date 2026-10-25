import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Gauge, Server, GitBranch, ShieldCheck, Bell,
  CheckCircle2, XCircle, AlertTriangle, Info,
  TrendingUp, TrendingDown, Minus,
} from 'lucide-react';
import { Badge, Spinner } from '@components/ui/Input';
import { governanceService } from '@features/../services/governance.service';
import { PageHeader } from '@components/ui/PageHeader';

// ── Helpers ───────────────────────────────────────────────────────────────────

function pctBar(current: number, max: number, danger = 80, warn = 60) {
  const pct = Math.min(Math.round((current / max) * 100), 100);
  const color = pct >= danger ? 'bg-danger' : pct >= warn ? 'bg-warning' : 'bg-green-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-mono w-10 text-right">{pct}%</span>
    </div>
  );
}

function latencyTrend(current: number, target: number) {
  const ratio = current / target;
  if (ratio <= 0.6) return <TrendingDown size={14} className="text-green-500" />;
  if (ratio <= 0.9) return <Minus size={14} className="text-warning" />;
  return <TrendingUp size={14} className="text-danger" />;
}

function latencyPill(current: number, target: number) {
  const ok = current <= target;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-mono px-1.5 py-0.5 rounded ${ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-danger'}`}>
      {current}ms {!ok && <AlertTriangle size={10} />}
    </span>
  );
}

const SEVERITY_VARIANT: Record<string, 'danger' | 'warning' | 'default'> = {
  Emergency: 'danger',
  Critical: 'danger',
  Warning: 'warning',
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  Implemented: <CheckCircle2 size={14} className="text-green-500" />,
  InProgress:  <AlertTriangle size={14} className="text-warning" />,
  Verified:    <CheckCircle2 size={14} className="text-primary" />,
  Planned:     <Info size={14} className="text-gray-400" />,
};

const STATUS_LABEL: Record<string, string> = {
  Implemented: 'Implemented',
  InProgress:  'In Progress',
  Verified:    'Verified',
  Planned:     'Planned',
};

// ── Tabs config ───────────────────────────────────────────────────────────────

const TABS = [
  { key: 'performance', label: 'Performance',  icon: Gauge },
  { key: 'scalability', label: 'Scalability',  icon: Server },
  { key: 'dr',         label: 'DR & Backup',  icon: GitBranch },
  { key: 'compliance', label: 'Compliance',    icon: ShieldCheck },
  { key: 'alerts',     label: 'Alerts',        icon: Bell },
];

// ── Performance tab ───────────────────────────────────────────────────────────

function PerformanceTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['nfr-performance'],
    queryFn: async () => {
      const { data } = await governanceService.getNFRPerformance();
      return data.data ?? [];
    },
  });

  if (isLoading) return <Spinner />;
  const metrics: any[] = data ?? [];

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 text-sm text-amber-800">
        <Info size={14} className="mt-0.5 flex-shrink-0" />
        <span>Current values are sampled from recent requests. Targets are per the NFR specification (M35).</span>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Metric</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Endpoint / Page</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">p50 target → actual</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">p95 target → actual</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">p99 target → actual</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {metrics.map((m: any) => {
              const breached = m.is_breached ||
                m.current_p99_ms > m.target_p99_ms ||
                m.current_p95_ms > m.target_p95_ms;
              return (
                <tr key={m.id} className={`hover:bg-gray-50 ${breached ? 'bg-red-50' : ''}`}>
                  <td className="px-4 py-3 font-medium text-gray-900">{m.metric_name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{m.endpoint_or_page}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="text-xs text-gray-400">{m.target_p50_ms}ms →</span>
                      {latencyPill(m.current_p50_ms, m.target_p50_ms)}
                      {latencyTrend(m.current_p50_ms, m.target_p50_ms)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="text-xs text-gray-400">{m.target_p95_ms}ms →</span>
                      {latencyPill(m.current_p95_ms, m.target_p95_ms)}
                      {latencyTrend(m.current_p95_ms, m.target_p95_ms)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="text-xs text-gray-400">{m.target_p99_ms}ms →</span>
                      {latencyPill(m.current_p99_ms, m.target_p99_ms)}
                      {latencyTrend(m.current_p99_ms, m.target_p99_ms)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {breached
                      ? <Badge variant="danger">Breached</Badge>
                      : <Badge variant="success">Within SLA</Badge>
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

// ── Scalability tab ───────────────────────────────────────────────────────────

function ScalabilityTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['nfr-scalability'],
    queryFn: async () => {
      const { data } = await governanceService.getNFRScalability();
      return data.data;
    },
  });

  if (isLoading) return <Spinner />;
  const { config, current } = (data as any) ?? {};
  if (!config) return <p className="text-gray-500">No scalability config found.</p>;

  const gauges = [
    { label: 'Employees', current: current.employees, max: config.max_employees_per_tenant, unit: 'employees' },
    { label: 'Active Users', current: current.activeUsers, max: config.max_concurrent_users, unit: 'users' },
    { label: 'DB Connections', current: current.dbConnections, max: config.db_connection_pool_size, unit: 'connections' },
    { label: 'CPU Usage', current: current.cpuPercent, max: 100, unit: '%' },
    { label: 'Memory Usage', current: current.memoryPercent, max: 100, unit: '%' },
  ];

  return (
    <div className="space-y-4">
      {/* Usage gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {gauges.map((g) => (
          <div key={g.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-700">{g.label}</p>
              <span className="text-sm font-bold text-gray-900">{g.current.toLocaleString()} <span className="text-xs text-gray-400">/ {g.max.toLocaleString()}</span></span>
            </div>
            {pctBar(g.current, g.max)}
          </div>
        ))}
        {/* Auto-scale card */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Auto-Scale</p>
          <div className="flex items-center gap-2">
            {config.auto_scale_enabled
              ? <><CheckCircle2 size={16} className="text-green-500" /><span className="text-sm text-green-700 font-medium">Enabled</span></>
              : <><XCircle size={16} className="text-gray-400" /><span className="text-sm text-gray-500">Disabled</span></>
            }
          </div>
          <p className="text-xs text-gray-400 mt-2">Trigger at {config.auto_scale_cpu_threshold}% CPU · max {config.auto_scale_max_instances} instances</p>
        </div>
      </div>

      {/* Config table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <p className="text-sm font-semibold text-gray-700">Capacity Limits</p>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <tbody className="divide-y divide-gray-100">
            {[
              ['Max employees per tenant', config.max_employees_per_tenant?.toLocaleString()],
              ['Max companies per tenant', config.max_companies_per_tenant?.toLocaleString()],
              ['Max concurrent users', config.max_concurrent_users?.toLocaleString()],
              ['Max payroll batch size', config.max_payroll_batch_size?.toLocaleString()],
              ['Max report rows', config.max_report_rows?.toLocaleString()],
              ['Max file upload', `${config.max_file_upload_mb} MB`],
              ['DB connection pool', config.db_connection_pool_size?.toLocaleString()],
              ['Cache TTL', `${config.cache_ttl_seconds}s`],
            ].map(([k, v]) => (
              <tr key={k} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500">{k}</td>
                <td className="px-4 py-3 font-medium text-gray-900 text-right">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

// ── DR & Backup tab ───────────────────────────────────────────────────────────

function DRTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['nfr-dr'],
    queryFn: async () => {
      const { data } = await governanceService.getNFRDRStatus();
      return data.data;
    },
  });

  if (isLoading) return <Spinner />;
  const dr: any = data ?? {};

  const drTestOverdue = !dr.last_dr_test_date ||
    (new Date().getTime() - new Date(dr.last_dr_test_date).getTime()) > (dr.dr_test_frequency_months ?? 6) * 30 * 24 * 60 * 60 * 1000;

  return (
    <div className="space-y-4">
      {/* Region cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <p className="text-sm font-semibold text-gray-900">Primary Region</p>
            <Badge variant="success" className="ml-auto">Active</Badge>
          </div>
          <p className="text-lg font-bold text-gray-900">{dr.primary_region}</p>
          <p className="text-xs text-gray-400 mt-1">Replication: {dr.replication_type}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
            <p className="text-sm font-semibold text-gray-900">DR Region</p>
            <Badge variant="default" className="ml-auto">Standby</Badge>
          </div>
          <p className="text-lg font-bold text-gray-900">{dr.dr_region}</p>
          <p className="text-xs text-gray-400 mt-1">Strategy: {dr.strategy}</p>
        </div>
      </div>

      {/* RPO / RTO */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'RPO', value: `${dr.rpo_minutes} min`, desc: 'Recovery Point Objective', color: 'text-blue-600' },
          { label: 'RTO', value: `${dr.rto_minutes} min`, desc: 'Recovery Time Objective', color: 'text-purple-600' },
          { label: 'Backup Frequency', value: `${dr.backup_frequency_hours}h`, desc: 'Automatic backup cadence', color: 'text-green-600' },
          { label: 'Retention', value: `${dr.backup_retention_days}d`, desc: 'Backup retention period', color: 'text-orange-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs font-semibold text-gray-700 mt-1">{s.label}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Backup status + DR test */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-700">Last Backup</p>
          <div className="flex items-center gap-2">
            {dr.backup_status === 'Success'
              ? <><CheckCircle2 size={14} className="text-green-500" /><span className="text-sm text-green-700">Success</span></>
              : <><XCircle size={14} className="text-danger" /><span className="text-sm text-danger">Failed</span></>
            }
          </div>
        </div>
        <p className="text-xs text-gray-400">
          {dr.last_backup_at ? new Date(dr.last_backup_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Never'}
        </p>
        <hr className="border-gray-100" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-700">DR Test Status</p>
            <p className="text-xs text-gray-400">
              {dr.last_dr_test_date ? `Last tested: ${new Date(dr.last_dr_test_date).toLocaleDateString('en-IN')}` : 'Never tested'}
              {' · '}Required every {dr.dr_test_frequency_months} months
            </p>
          </div>
          {drTestOverdue
            ? <Badge variant="danger">Overdue</Badge>
            : <Badge variant="success">On Schedule</Badge>
          }
        </div>
      </div>
    </div>
  );
}

// ── Compliance tab ─────────────────────────────────────────────────────────────

function ComplianceTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['nfr-compliance'],
    queryFn: async () => {
      const { data } = await governanceService.getNFRCompliance();
      return data.data ?? [];
    },
  });

  if (isLoading) return <Spinner />;
  const reqs: any[] = data ?? [];

  // Group by standard
  const byStandard = reqs.reduce<Record<string, any[]>>((acc, r) => {
    (acc[r.standard_name] = acc[r.standard_name] ?? []).push(r);
    return acc;
  }, {});

  const overallPct = reqs.length
    ? Math.round((reqs.filter((r) => r.implementation_status === 'Implemented' || r.implementation_status === 'Verified').length / reqs.length) * 100)
    : 0;

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-6">
        <div>
          <p className="text-3xl font-bold text-gray-900">{overallPct}%</p>
          <p className="text-sm text-gray-500">Overall Compliance</p>
        </div>
        <div className="flex-1">{pctBar(overallPct, 100)}</div>
        <div className="flex gap-4 text-xs text-gray-500">
          <span><span className="font-bold text-green-600">{reqs.filter(r => r.implementation_status === 'Implemented' || r.implementation_status === 'Verified').length}</span> Implemented</span>
          <span><span className="font-bold text-warning">{reqs.filter(r => r.implementation_status === 'InProgress').length}</span> In Progress</span>
          <span><span className="font-bold text-gray-400">{reqs.filter(r => r.implementation_status === 'Planned').length}</span> Planned</span>
        </div>
      </div>

      {/* Per-standard accordion */}
      {Object.entries(byStandard).map(([standard, items]) => {
        const done = items.filter((i) => i.implementation_status === 'Implemented' || i.implementation_status === 'Verified').length;
        const pct = Math.round((done / items.length) * 100);
        return (
          <div key={standard} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-4">
              <p className="text-sm font-semibold text-gray-900 flex-1">{standard}</p>
              <span className="text-xs text-gray-500">{done}/{items.length}</span>
              <div className="w-24">{pctBar(done, items.length)}</div>
              {items[0]?.next_audit_date && (
                <span className="text-xs text-gray-400">Audit: {new Date(items[0].next_audit_date).toLocaleDateString('en-IN')}</span>
              )}
            </div>
            <div className="divide-y divide-gray-100">
              {items.map((req) => (
                <div key={req.id} className="px-4 py-3 flex items-start gap-3 hover:bg-gray-50">
                  <div className="mt-0.5">{STATUS_ICON[req.implementation_status] ?? <Info size={14} className="text-gray-400" />}</div>
                  <p className="text-sm text-gray-700 flex-1">{req.requirement_text}</p>
                  <span className="text-xs text-gray-500 whitespace-nowrap">{STATUS_LABEL[req.implementation_status] ?? req.implementation_status}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Alerts tab ────────────────────────────────────────────────────────────────

function AlertsTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['nfr-alerts'],
    queryFn: async () => {
      const { data } = await governanceService.getNFRAlerts();
      return data.data ?? [];
    },
  });

  if (isLoading) return <Spinner />;
  const alerts: any[] = data ?? [];

  const channels = (list: string[] | undefined) => {
    if (!list || !list.length) return null;
    const icons: Record<string, string> = { email: '📧', slack: '💬', sms: '📱', pagerduty: '🔔' };
    return list.map((c) => (
      <span key={c} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
        {icons[c] ?? '•'} {c}
      </span>
    ));
  };

  return (
    <div className="space-y-3">
      {alerts.map((alert: any) => (
        <div key={alert.id} className={`bg-white rounded-xl border overflow-hidden ${!alert.is_active ? 'opacity-60' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3 px-4 py-3">
            <Bell size={16} className={alert.is_active ? 'text-primary' : 'text-gray-300'} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-gray-900">{alert.alert_name}</p>
                <Badge variant={SEVERITY_VARIANT[alert.severity] ?? 'default'}>{alert.severity}</Badge>
                {!alert.is_active && <Badge variant="default">Disabled</Badge>}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                <span className="font-mono">{alert.metric_name}</span>
                {' '}{alert.condition_operator} {Number(alert.threshold_value).toLocaleString()}
                {alert.duration_minutes > 1 ? ` for ${alert.duration_minutes} min` : ''}
              </p>
            </div>
            <div className="flex flex-wrap gap-1 justify-end">
              {channels(
                Array.isArray(alert.notification_channels)
                  ? alert.notification_channels
                  : (typeof alert.notification_channels === 'string' ? JSON.parse(alert.notification_channels || '[]') : [])
              )}
            </div>
          </div>
          {alert.last_triggered_at && (
            <div className="px-4 py-2 bg-red-50 border-t border-red-100 text-xs text-danger">
              Last triggered: {new Date(alert.last_triggered_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
            </div>
          )}
        </div>
      ))}
      {alerts.length === 0 && (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-16 text-center">
          <Bell size={40} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">No monitoring alerts configured</p>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function NFRDashboardPage() {
  const [tab, setTab] = React.useState('performance');

  return (
    <div>
      <PageHeader title="Non-Functional Requirements" subtitle="Performance targets, scalability limits, DR config, compliance, and monitoring alerts (M35)" />

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit flex-wrap">
        {TABS.map((t) => {
          const I = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${
                tab === t.key ? 'bg-white shadow text-primary' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <I size={14} />{t.label}
            </button>
          );
        })}
      </div>

      {tab === 'performance' && <PerformanceTab />}
      {tab === 'scalability' && <ScalabilityTab />}
      {tab === 'dr'          && <DRTab />}
      {tab === 'compliance'  && <ComplianceTab />}
      {tab === 'alerts'      && <AlertsTab />}
    </div>
  );
}
