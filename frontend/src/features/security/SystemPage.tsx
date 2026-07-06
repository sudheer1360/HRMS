import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FileText, Cpu, Shield, PieChart, Activity, Target, CheckCircle,
  Clock, User, AlertTriangle, LogIn, Lock, Key,
} from 'lucide-react';
import { Badge, Spinner } from '@components/ui/Input';
import { formatDate } from '@lib/utils';
import api from '@lib/axios';
import { PageHeader } from '@components/ui/PageHeader';

// ── Helpers ───────────────────────────────────────────────────────────────────

function safeDate(v?: string) {
  if (!v) return '—';
  try { return formatDate(v); } catch { return v; }
}

function safeDateTime(v?: string) {
  if (!v) return '—';
  try {
    return new Date(v).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  } catch { return v; }
}

// ── Tabs config ───────────────────────────────────────────────────────────────

const TABS = [
  { key: 'health',    label: 'System Health',   icon: Activity },
  { key: 'audit',     label: 'Audit Logs',       icon: FileText },
  { key: 'sessions',  label: 'Login Sessions',   icon: LogIn },
  { key: 'scope',     label: 'Scope Status',     icon: Target },
  { key: 'flags',     label: 'Feature Flags',    icon: Shield },
];

// ── Action severity colours ───────────────────────────────────────────────────

const ACTION_VARIANT: Record<string, 'success' | 'danger' | 'warning' | 'info' | 'default'> = {
  CREATE: 'success',
  UPDATE: 'info',
  DELETE: 'danger',
  LOGIN:  'success',
  LOGOUT: 'default',
  FAILED_LOGIN: 'danger',
  EXPORT: 'warning',
};

// ── Sub-components ────────────────────────────────────────────────────────────

function AuditLogsTab() {
  const [page, setPage] = React.useState(1);
  const [entityFilter, setEntityFilter] = React.useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page, entityFilter],
    queryFn: async () => {
      const p = new URLSearchParams({ page: String(page), limit: '25' });
      if (entityFilter) p.set('entity', entityFilter);
      const { data } = await api.get<{ data: any[]; meta: any }>(`/extended/governance/audit-logs?${p}`);
      return data;
    },
  });

  const logs: any[] = data?.data ?? [];
  const meta = data?.meta ?? {};

  const ENTITIES = ['All', 'Employee', 'Organization', 'User', 'Form', 'Template', 'Payroll', 'Leave'];

  return (
    <div className="space-y-4">
      {/* Entity filter */}
      <div className="flex flex-wrap gap-2">
        {ENTITIES.map((e) => (
          <button
            key={e}
            onClick={() => { setEntityFilter(e === 'All' ? '' : e); setPage(1); }}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              (e === 'All' && !entityFilter) || entityFilter === e
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {e}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Spinner />
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-16 text-center">
          <FileText size={40} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">No audit logs yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Entity</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Record ID</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Performed By</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">IP Address</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log: any) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Badge variant={ACTION_VARIANT[log.action] ?? 'default'}>{log.action}</Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{log.entity_type ?? log.entityType ?? '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{(log.entity_id ?? log.entityId ?? '—').toString().slice(-8)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <User size={12} className="text-gray-400" />
                      <span className="text-gray-700">{log.performed_by ?? log.performedBy ?? '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{log.ip_address ?? log.ipAddress ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{safeDateTime(log.created_at ?? log.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          {/* Pagination */}
          {meta.total > 25 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">{meta.total} total · page {page}</p>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1 rounded border text-xs disabled:opacity-40">Prev</button>
                <button disabled={(page * 25) >= meta.total} onClick={() => setPage(page + 1)} className="px-3 py-1 rounded border text-xs disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LoginSessionsTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['login-sessions'],
    queryFn: async () => {
      const { data } = await api.get<{ data: any[] }>('/extended/governance/sessions');
      return data.data ?? [];
    },
  });

  const sessions: any[] = data ?? [];

  if (isLoading) return <Spinner />;

  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-dashed border-gray-300 p-16 text-center">
        <LogIn size={40} className="mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500">No active sessions found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">User</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">IP Address</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Device / Browser</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Logged In</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sessions.map((s: any) => (
            <tr key={s.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <User size={13} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{s.full_name ?? s.fullName ?? s.email ?? '—'}</p>
                    <p className="text-xs text-gray-400">{s.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 font-mono text-xs text-gray-500">{s.ip_address ?? s.ipAddress ?? '—'}</td>
              <td className="px-4 py-3 text-xs text-gray-500">{s.user_agent ?? s.userAgent ?? '—'}</td>
              <td className="px-4 py-3 text-gray-500">{safeDateTime(s.created_at ?? s.createdAt)}</td>
              <td className="px-4 py-3">
                <Badge variant={s.is_active ?? s.isActive ? 'success' : 'default'}>
                  {s.is_active ?? s.isActive ? 'Active' : 'Expired'}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function SystemPage() {
  const [tab, setTab] = React.useState('health');

  const { data: health } = useQuery({
    queryKey: ['system-health'],
    queryFn: async () => { const { data } = await api.get('/extended/governance/health'); return data.data; },
    enabled: tab === 'health',
  });
  const { data: scope } = useQuery({
    queryKey: ['scope-status'],
    queryFn: async () => { const { data } = await api.get('/extended/governance/scope'); return data.data; },
    enabled: tab === 'scope',
  });
  const { data: flags } = useQuery({
    queryKey: ['feature-flags'],
    queryFn: async () => { const { data } = await api.get('/extended/governance/feature-flags'); return data.data; },
    enabled: tab === 'flags',
  });

  return (
    <div>
      <PageHeader title="System & Security" subtitle="Platform health, audit logs, active sessions, and feature flags" />

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

      {/* ── Health ── */}
      {tab === 'health' && health && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: 'Uptime', value: `${Math.floor(health.uptime / 60)}m`, icon: Activity, color: 'bg-green-500' },
            { label: 'DB Status', value: health.dbStatus, icon: FileText, color: 'bg-blue-500' },
            { label: 'Redis', value: health.redisStatus, icon: Cpu, color: 'bg-purple-500' },
            { label: 'Memory', value: `${(health.memory?.heapUsed / 1024 / 1024).toFixed(1)}MB`, icon: PieChart, color: 'bg-orange-500' },
            { label: 'Status', value: health.status, icon: CheckCircle, color: 'bg-green-500' },
          ].map((s) => {
            const I = s.icon;
            return (
              <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
                <div className={`p-3 rounded-lg ${s.color}`}><I size={20} className="text-white" /></div>
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Audit Logs ── */}
      {tab === 'audit' && <AuditLogsTab />}

      {/* ── Login Sessions ── */}
      {tab === 'sessions' && <LoginSessionsTab />}

      {/* ── Scope ── */}
      {tab === 'scope' && scope && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Implementation Phases</h3>
            <p className="text-sm text-gray-500">{scope.totalModules} modules · {scope.overallCompletion}% complete</p>
          </div>
          <div className="divide-y">
            {scope.phases?.map((p: any) => (
              <div key={p.name} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.status}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${p.completion}%` }} />
                  </div>
                  <span className="text-sm font-medium">{p.completion}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Feature Flags ── */}
      {tab === 'flags' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Flag</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Rollout</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {flags?.flags?.map((f: any) => (
                  <tr key={f.name} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{f.name}</td>
                    <td className="px-4 py-3">
                      <Badge variant={f.enabled ? 'success' : 'default'}>{f.enabled ? 'Enabled' : 'Disabled'}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">{f.rolloutPercent}%</td>
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
