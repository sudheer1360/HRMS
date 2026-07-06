import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Cpu, List, AlertTriangle, Activity,
  Plus, Edit, Trash2, RefreshCw, Check, Wifi, WifiOff,
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

function safeTime(isoString?: string | null): string {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch { return isoString; }
}

function timeAgo(isoString?: string | null): string {
  if (!isoString) return '—';
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'devices',    label: 'Devices',     icon: Cpu },
  { key: 'logs',       label: 'Raw Logs',    icon: List },
  { key: 'exceptions', label: 'Exceptions',  icon: AlertTriangle },
  { key: 'sync',       label: 'Sync Status', icon: Activity },
];

const DEVICE_TYPES = [
  { value: 'Fingerprint', label: 'Fingerprint' },
  { value: 'FaceRecognition', label: 'Face Recognition' },
  { value: 'IRFace', label: 'IR Face' },
  { value: 'PalmVein', label: 'Palm Vein' },
  { value: 'Proximity', label: 'Proximity Card' },
  { value: 'PIN', label: 'PIN Only' },
  { value: 'Multi', label: 'Multi-modal' },
];

// ── Devices tab ───────────────────────────────────────────────────────────────

const deviceSchema = z.object({
  deviceName: z.string().min(1, 'Required'),
  deviceCode: z.string().min(1, 'Required'),
  deviceType: z.string().min(1, 'Required'),
  ipAddress: z.string().optional(),
  port: z.coerce.number().optional(),
  location: z.string().optional(),
  serialNumber: z.string().optional(),
});

function DevicesTab() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = React.useState(false);
  const [confirmId, setConfirmId] = React.useState<string | null>(null);
  const [editItem, setEditItem] = React.useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['bio-devices'],
    queryFn: async () => { const { data } = await api.get('/extended/biometric/devices'); return data.data ?? []; },
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(deviceSchema),
    defaultValues: { deviceType: 'Fingerprint', port: 4370 },
  });

  const saveMutation = useMutation({
    mutationFn: (d: any) => editItem
      ? api.put(`/extended/biometric/devices/${editItem.id}`, d)
      : api.post('/extended/biometric/devices', d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['bio-devices'] }); reset(); setShowForm(false); setEditItem(null); },
  });

  const syncMutation = useMutation({
    mutationFn: (id: string) => api.post(`/extended/biometric/devices/${id}/sync`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bio-sync'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/extended/biometric/devices/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bio-devices'] }),
  });

  function openEdit(d: any) {
    setEditItem(d);
    setValue('deviceName', d.deviceName ?? d.device_name);
    setValue('deviceCode', d.deviceCode ?? d.device_code);
    setValue('deviceType', d.deviceType ?? d.device_type ?? 'Fingerprint');
    setValue('ipAddress', d.ipAddress ?? d.ip_address ?? '');
    setValue('port', d.port ?? 4370);
    setValue('location', d.location ?? '');
    setValue('serialNumber', d.serialNumber ?? d.serial_number ?? '');
    setShowForm(true);
  }

  const devices: any[] = data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => { setEditItem(null); reset(); setShowForm(v => !v); }}>
          <Plus size={14} /> Add Device
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold mb-4">{editItem ? 'Edit Device' : 'Register Device'}</h3>
          <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Device Name *" error={errors.deviceName?.message as string} {...register('deviceName')} />
            <Input label="Device Code *" error={errors.deviceCode?.message as string} {...register('deviceCode')} />
            <Select label="Type *" options={DEVICE_TYPES} error={errors.deviceType?.message as string} {...register('deviceType')} />
            <Input label="IP Address" placeholder="192.168.1.100" {...register('ipAddress')} />
            <Input label="Port" type="number" {...register('port')} />
            <Input label="Location" placeholder="Main Gate, 3rd Floor..." {...register('location')} />
            <Input label="Serial Number" {...register('serialNumber')} />
            <div className="sm:col-span-3 flex gap-3">
              <Button type="submit" size="sm" loading={saveMutation.isPending}>{editItem ? 'Update' : 'Register'}</Button>
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
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Device</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">IP:Port</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Location</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {devices.map((d: any) => (
                <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium">{d.deviceName ?? d.device_name}</p>
                    <p className="text-xs text-gray-400 font-mono">{d.deviceCode ?? d.device_code}</p>
                  </td>
                  <td className="px-4 py-3"><Badge variant="info">{d.deviceType ?? d.device_type}</Badge></td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{d.ipAddress ?? d.ip_address ?? '—'}{d.port ? `:${d.port}` : ''}</td>
                  <td className="px-4 py-3 text-gray-600">{d.location ?? '—'}</td>
                  <td className="px-4 py-3">
                    <Badge variant={d.status === 'Online' ? 'success' : d.status === 'Offline' ? 'danger' : 'warning'}>
                      {d.status ?? 'Pending'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => syncMutation.mutate(d.id)} className="p-1.5 rounded hover:bg-blue-50 hover:text-blue-700 text-gray-400" title="Sync"><RefreshCw size={13} /></button>
                      <button onClick={() => openEdit(d)} className="p-1.5 rounded hover:bg-gray-100"><Edit size={13} /></button>
                      <button onClick={() => setConfirmId(d.id)} className="p-1.5 rounded hover:bg-red-50 hover:text-danger"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {devices.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">
                    <Cpu size={32} className="mx-auto mb-2 text-gray-300" />
                    <p>No devices registered. Add a biometric device to get started.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Raw Logs tab ──────────────────────────────────────────────────────────────

function LogsTab() {
  const [from, setFrom] = React.useState(() => new Date(Date.now() - 86400000).toISOString().slice(0, 10));
  const [to, setTo] = React.useState(() => new Date().toISOString().slice(0, 10));

  const { data, isLoading } = useQuery({
    queryKey: ['bio-logs', from, to],
    queryFn: async () => { const { data } = await api.get(`/extended/biometric/logs?from=${from}&to=${to}&limit=100`); return data.data ?? []; },
  });

  const logs: any[] = data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">From</span>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">To</span>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <span className="text-sm text-gray-400">{logs.length} records</span>
      </div>

      {isLoading ? <Spinner /> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Device</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Employee</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Log Time</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Direction</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Raw Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((l: any) => (
                <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">{l.deviceId ?? l.device_id}</td>
                  <td className="px-4 py-3 font-medium">{l.employeeCode ?? l.employee_code ?? '—'}</td>
                  <td className="px-4 py-3 text-xs">
                    <p>{safeDate(l.logTime ?? l.log_time)}</p>
                    <p className="text-gray-400">{safeTime(l.logTime ?? l.log_time)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={l.direction === 'In' ? 'success' : 'info'}>{l.direction ?? '—'}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={l.status === 'Processed' ? 'success' : l.status === 'Error' ? 'danger' : 'warning'}>
                      {l.status ?? 'Raw'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 max-w-xs truncate">{l.rawData ?? l.raw_data ?? '—'}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">No logs in selected range</td></tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Exceptions tab ────────────────────────────────────────────────────────────

function ExceptionsTab() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = React.useState<'open' | 'resolved'>('open');

  const { data, isLoading } = useQuery({
    queryKey: ['bio-exceptions', filter],
    queryFn: async () => {
      const resolved = filter === 'resolved' ? 'true' : 'false';
      const { data } = await api.get(`/extended/biometric/exceptions?resolved=${resolved}&limit=50`);
      return data.data ?? [];
    },
  });

  const resolveMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/extended/biometric/exceptions/${id}/resolve`, { resolution: 'Manually resolved by HR' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bio-exceptions'] }),
  });

  const exceptions: any[] = data ?? [];

  const EXCEPTION_VARIANT: Record<string, any> = {
    DeviceOffline: 'danger',
    UnknownTemplate: 'warning',
    DuplicateLog: 'info',
    MissingCheckout: 'warning',
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-1">
        {(['open', 'resolved'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
              filter === f ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'open' ? 'Open' : 'Resolved'}
          </button>
        ))}
      </div>

      {isLoading ? <Spinner /> : (
        <div className="space-y-3">
          {exceptions.map((e: any) => (
            <div key={e.id} className={`bg-white rounded-xl border p-4 ${e.resolved ? 'border-gray-200 opacity-75' : 'border-orange-200'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <AlertTriangle size={16} className={e.resolved ? 'text-gray-400 mt-0.5 shrink-0' : 'text-orange-500 mt-0.5 shrink-0'} />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={EXCEPTION_VARIANT[e.type] ?? 'warning'}>{e.type ?? 'Unknown'}</Badge>
                      <span className="text-xs text-gray-400">{timeAgo(e.occurredAt ?? e.occurred_at)}</span>
                    </div>
                    <p className="text-sm text-gray-700">{e.description}</p>
                    <div className="flex gap-3 mt-1 text-xs text-gray-400">
                      {e.deviceId && <span>Device: {e.deviceId}</span>}
                      {(e.employeeCode ?? e.employee_code) && <span>Employee: {e.employeeCode ?? e.employee_code}</span>}
                    </div>
                  </div>
                </div>
                {!e.resolved && (
                  <Button size="sm" variant="secondary" onClick={() => resolveMutation.mutate(e.id)}>
                    <Check size={13} /> Resolve
                  </Button>
                )}
                {e.resolved && <Badge variant="success">Resolved</Badge>}
              </div>
            </div>
          ))}
          {exceptions.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
              <AlertTriangle size={36} className="mx-auto mb-3 text-gray-300" />
              <p>{filter === 'open' ? 'No open exceptions' : 'No resolved exceptions'}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Sync Status tab ───────────────────────────────────────────────────────────

function SyncStatusTab() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['bio-sync'],
    queryFn: async () => { const { data } = await api.get('/extended/biometric/sync-status'); return data.data ?? []; },
    refetchInterval: 30000, // auto-refresh every 30s
  });

  const syncMutation = useMutation({
    mutationFn: (id: string) => api.post(`/extended/biometric/devices/${id}/sync`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bio-sync'] }),
  });

  const statuses: any[] = data ?? [];
  const online = statuses.filter(s => s.status === 'Online').length;
  const offline = statuses.filter(s => s.status === 'Offline').length;
  const pending = statuses.reduce((a, s) => a + (s.pendingLogs ?? s.pending_logs ?? 0), 0);

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-50"><Wifi size={18} className="text-green-600" /></div>
          <div><p className="text-xl font-bold text-green-700">{online}</p><p className="text-xs text-gray-500">Online</p></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-50"><WifiOff size={18} className="text-danger" /></div>
          <div><p className="text-xl font-bold text-danger">{offline}</p><p className="text-xs text-gray-500">Offline</p></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-yellow-50"><Activity size={18} className="text-yellow-600" /></div>
          <div><p className="text-xl font-bold text-yellow-600">{pending}</p><p className="text-xs text-gray-500">Pending Logs</p></div>
        </div>
      </div>

      {isLoading ? <Spinner /> : (
        <div className="space-y-3">
          {statuses.map((s: any) => {
            const isOnline = s.status === 'Online';
            return (
              <div key={s.id} className={`bg-white rounded-xl border p-4 flex items-center justify-between gap-4 ${isOnline ? 'border-gray-200' : 'border-red-200'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                  <div>
                    <p className="font-semibold text-gray-900">{s.deviceName ?? s.device_name}</p>
                    <p className="text-xs text-gray-500">{s.location ?? '—'} · Last sync: {timeAgo(s.lastSyncAt ?? s.last_sync_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-bold text-gray-900">{(s.pendingLogs ?? s.pending_logs ?? 0)}</p>
                    <p className="text-xs text-gray-400">Pending</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-900">{(s.totalLogs ?? s.total_logs ?? 0).toLocaleString()}</p>
                    <p className="text-xs text-gray-400">Total</p>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => syncMutation.mutate(s.id)}>
                    <RefreshCw size={13} /> Sync
                  </Button>
                </div>
              </div>
            );
          })}
          {statuses.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
              <Activity size={36} className="mx-auto mb-3 text-gray-300" />
              <p>No sync status available. Register devices first.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BiometricPage() {
  const [tab, setTab] = React.useState('sync');

  return (
    <div>
      <PageHeader title="Biometric Integration" subtitle="Manage devices, raw logs, exceptions, and sync health" />

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

      {tab === 'devices'    && <DevicesTab />}
      {tab === 'logs'       && <LogsTab />}
      {tab === 'exceptions' && <ExceptionsTab />}
      {tab === 'sync'       && <SyncStatusTab />}
      <ConfirmDialog
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={() => { deleteMutation.mutate(confirmId!); setConfirmId(null); }}
        message="Remove this biometric device?"
        confirmLabel="Remove Device"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
