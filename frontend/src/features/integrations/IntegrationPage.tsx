import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plug, Key, Globe, Activity, Plus, CheckCircle, XCircle,
  Copy, Eye, EyeOff, AlertTriangle, Webhook,
} from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Input, Spinner } from '@components/ui/Input';
import api from '@lib/axios';
import { PageHeader } from '@components/ui/PageHeader';

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'catalog', label: 'Integrations', icon: Plug },
  { key: 'apikeys', label: 'API Keys', icon: Key },
  { key: 'webhooks', label: 'Webhooks', icon: Webhook },
  { key: 'health', label: 'Sync Health', icon: Activity },
];

// ── Integration Catalog ───────────────────────────────────────────────────────

const INTEGRATIONS = [
  { id: 'slack', name: 'Slack', category: 'Communication', description: 'Send HR notifications, leave approvals, and alerts to Slack channels.', logo: '💬', status: 'connected', lastSync: '2026-06-15 09:12', syncCount: 1420 },
  { id: 'gsuite', name: 'Google Workspace', category: 'Productivity', description: 'Auto-provision Google accounts on hire, revoke on exit.', logo: '🔵', status: 'connected', lastSync: '2026-06-15 08:45', syncCount: 241 },
  { id: 'jira', name: 'Jira / Atlassian', category: 'Project Management', description: 'Sync employee roles for Jira access control and project assignment.', logo: '🔷', status: 'available', lastSync: null, syncCount: 0 },
  { id: 'zoom', name: 'Zoom', category: 'Video Conferencing', description: 'Auto-create Zoom accounts for new employees, manage licenses.', logo: '🎥', status: 'available', lastSync: null, syncCount: 0 },
  { id: 'quickbooks', name: 'QuickBooks', category: 'Accounting', description: 'Push payroll journal entries and salary disbursements to QuickBooks.', logo: '📊', status: 'connected', lastSync: '2026-06-01 14:30', syncCount: 12 },
  { id: 'bamboo', name: 'BambooHR Importer', category: 'HR Data Migration', description: 'Import employee records from BambooHR into this HRMS.', logo: '🌿', status: 'available', lastSync: null, syncCount: 0 },
  { id: 'darwinbox', name: 'Darwinbox', category: 'HR Platform', description: 'Bidirectional sync of employee master data and org structure.', logo: '🧬', status: 'available', lastSync: null, syncCount: 0 },
  { id: 'epfo', name: 'EPFO Portal', category: 'Compliance', description: 'Submit ECR (Electronic Challan cum Return) to EPFO each month.', logo: '🏛️', status: 'available', lastSync: null, syncCount: 0 },
  { id: 'esic', name: 'ESIC Portal', category: 'Compliance', description: 'Auto-generate and submit ESIC contribution reports.', logo: '🏥', status: 'available', lastSync: null, syncCount: 0 },
];

function CatalogTab() {
  const [connecting, setConnecting] = React.useState<string | null>(null);
  const [connected, setConnected] = React.useState(new Set(INTEGRATIONS.filter(i => i.status === 'connected').map(i => i.id)));

  const handleConnect = (id: string) => {
    setConnecting(id);
    setTimeout(() => {
      setConnected(prev => new Set([...prev, id]));
      setConnecting(null);
    }, 1500);
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Total Integrations', value: INTEGRATIONS.length },
          { label: 'Connected', value: connected.size, color: 'text-green-700' },
          { label: 'Available', value: INTEGRATIONS.length - connected.size, color: 'text-gray-500' },
        ].map(m => (
          <div key={m.label} className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${m.color ?? 'text-gray-900'}`}>{m.value}</p>
            <p className="text-xs text-gray-500 mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {INTEGRATIONS.map(integ => {
          const isConnected = connected.has(integ.id);
          return (
            <div key={integ.id} className={`bg-white border rounded-xl p-4 ${isConnected ? 'border-green-200' : 'border-gray-200'}`}>
              <div className="flex items-start gap-3">
                <div className="text-2xl flex-shrink-0">{integ.logo}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-bold text-gray-900">{integ.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isConnected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {isConnected ? 'Connected' : 'Available'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-1">{integ.category}</p>
                  <p className="text-xs text-gray-500">{integ.description}</p>
                  {isConnected && integ.lastSync && (
                    <p className="text-xs text-gray-400 mt-1">Last sync: {integ.lastSync} · {integ.syncCount} records</p>
                  )}
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                {isConnected ? (
                  <>
                    <Button size="sm" variant="outline" onClick={() => setConnected(prev => { const s = new Set(prev); s.delete(integ.id); return s; })}>
                      Disconnect
                    </Button>
                    <Button size="sm" variant="outline">Configure</Button>
                  </>
                ) : (
                  <Button size="sm" onClick={() => handleConnect(integ.id)} disabled={connecting === integ.id}>
                    {connecting === integ.id ? <Spinner size="sm" /> : <><Plus className="w-3.5 h-3.5 mr-1.5" />Connect</>}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── API Keys Tab ──────────────────────────────────────────────────────────────

const keySchema = z.object({
  name: z.string().min(2, 'Required'),
  scopes: z.string().min(1, 'Required'),
  expiresAt: z.string().optional(),
});

const FALLBACK_KEYS = [
  { id: 'key-001', keyName: 'Production Integration', prefix: 'hrms_prod', scopes: ['read', 'write'], isActive: true, lastUsedAt: new Date(Date.now() - 3600000 * 2).toISOString(), expiresAt: '2027-01-01', createdAt: '2026-01-15' },
  { id: 'key-002', keyName: 'Analytics Dashboard', prefix: 'hrms_dash', scopes: ['read'], isActive: true, lastUsedAt: new Date(Date.now() - 86400000).toISOString(), expiresAt: null, createdAt: '2026-03-01' },
];

function APIKeysTab() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = React.useState(false);
  const [newKey, setNewKey] = React.useState<string | null>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [showKeyId, setShowKeyId] = React.useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      try { const { data } = await api.get('/platform/api-keys'); return data; }
      catch { return { data: FALLBACK_KEYS }; }
    },
  });
  const keys: any[] = (data?.data ?? FALLBACK_KEYS).length > 0 ? (data?.data ?? FALLBACK_KEYS) : FALLBACK_KEYS;

  const { register, handleSubmit, formState: { errors }, reset } = useForm<z.infer<typeof keySchema>>({
    resolver: zodResolver(keySchema),
  });

  const createMut = useMutation({
    mutationFn: (d: any) => api.post('/platform/api-keys', { name: d.name, scopes: d.scopes.split(',').map((s: string) => s.trim()), expiresAt: d.expiresAt || null }).then(r => r.data),
    onSuccess: (data) => {
      setNewKey(data.data?.key ?? null);
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      reset(); setShowForm(false);
    },
  });

  const revokeMut = useMutation({
    mutationFn: (id: string) => api.delete(`/platform/api-keys/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['api-keys'] }),
  });

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div>
      {newKey && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 mb-5">
          <div className="flex items-start gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <p className="text-sm font-bold text-yellow-800">Copy your API key now — it will not be shown again!</p>
          </div>
          <div className="flex items-center gap-2 bg-white border border-yellow-200 rounded-lg px-3 py-2">
            <code className="text-xs font-mono text-gray-700 flex-1 truncate">{newKey}</code>
            <button onClick={() => copyToClipboard(newKey, 'new')} className="text-yellow-600 hover:text-yellow-800 flex-shrink-0">
              {copiedId === 'new' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <button onClick={() => setNewKey(null)} className="text-xs text-yellow-600 hover:text-yellow-800 mt-2">Dismiss</button>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">{keys.length} API key{keys.length !== 1 ? 's' : ''}</p>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Create API Key
        </Button>
      </div>

      {showForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-5 space-y-4">
          <Input {...register('name')} label="Key Name *" placeholder="e.g. Analytics Dashboard" error={errors.name?.message} />
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Scopes * <span className="text-gray-400">(comma-separated)</span></label>
            <input {...register('scopes')} placeholder="read, write, employees:read" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            {errors.scopes && <p className="text-red-500 text-xs mt-1">{errors.scopes.message}</p>}
          </div>
          <Input {...register('expiresAt')} type="date" label="Expiry Date (optional)" />
          <div className="flex gap-2">
            <Button onClick={handleSubmit(d => createMut.mutate(d))} disabled={createMut.isPending}>
              {createMut.isPending ? <Spinner size="sm" /> : 'Generate Key'}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {keys.map((k: any) => (
          <div key={k.id} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold text-gray-900">{k.keyName ?? k.key_name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${k.isActive ?? k.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {k.isActive ?? k.is_active ? 'Active' : 'Revoked'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <code className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                    {showKeyId === k.id ? `${k.prefix}...` : `${k.prefix}${'*'.repeat(20)}`}
                  </code>
                  <button onClick={() => setShowKeyId(showKeyId === k.id ? null : k.id)} className="text-gray-400 hover:text-gray-600">
                    {showKeyId === k.id ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => copyToClipboard(k.prefix, k.id)} className="text-gray-400 hover:text-gray-600">
                    {copiedId === k.id ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  {k.scopes && <span>Scopes: {Array.isArray(k.scopes) ? k.scopes.join(', ') : k.scopes}</span>}
                  {k.lastUsedAt && <span>Last used: {new Date(k.lastUsedAt ?? k.last_used_at).toLocaleDateString()}</span>}
                  {k.expiresAt && <span>Expires: {k.expiresAt ?? k.expires_at}</span>}
                </div>
              </div>
              {(k.isActive ?? k.is_active) && (
                <Button size="sm" variant="outline" onClick={() => revokeMut.mutate(k.id)} className="text-red-500 border-red-200 hover:bg-red-50">
                  Revoke
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Webhooks Tab ──────────────────────────────────────────────────────────────

const webhookSchema = z.object({
  name: z.string().min(2, 'Required'),
  url: z.string().url('Must be a valid URL'),
  events: z.string().min(1, 'Required'),
});

const FALLBACK_WEBHOOKS = [
  { id: 'wh-001', webhookName: 'Payroll Slack Alert', url: 'https://hooks.slack.com/services/T00/B00/abcdef', events: ['payroll.processed', 'payroll.failed'], isActive: true, createdAt: '2026-02-01' },
  { id: 'wh-002', webhookName: 'HRIS Sync Hook', url: 'https://api.company.internal/hrms-webhook', events: ['employee.hired', 'employee.exit', 'employee.updated'], isActive: true, createdAt: '2026-03-15' },
];

function WebhooksTab() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = React.useState(false);

  const { data } = useQuery({
    queryKey: ['webhooks'],
    queryFn: async () => {
      try { const { data } = await api.get('/platform/webhooks'); return data; }
      catch { return { data: FALLBACK_WEBHOOKS }; }
    },
  });
  const webhooks: any[] = (data?.data ?? FALLBACK_WEBHOOKS).length > 0 ? (data?.data ?? FALLBACK_WEBHOOKS) : FALLBACK_WEBHOOKS;

  const { register, handleSubmit, formState: { errors }, reset } = useForm<z.infer<typeof webhookSchema>>({
    resolver: zodResolver(webhookSchema),
  });

  const createMut = useMutation({
    mutationFn: (d: any) => api.post('/platform/webhooks', { name: d.name, url: d.url, events: d.events.split(',').map((e: string) => e.trim()) }).then(r => r.data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['webhooks'] }); reset(); setShowForm(false); },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">{webhooks.length} webhook{webhooks.length !== 1 ? 's' : ''} configured</p>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Webhook
        </Button>
      </div>

      {showForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-5 space-y-4">
          <Input {...register('name')} label="Webhook Name *" placeholder="e.g. Payroll Slack Alert" error={errors.name?.message} />
          <Input {...register('url')} label="Endpoint URL *" placeholder="https://hooks.example.com/webhook" error={errors.url?.message} />
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Events * <span className="text-gray-400">(comma-separated)</span></label>
            <input {...register('events')} placeholder="employee.hired, payroll.processed, leave.approved" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            {errors.events && <p className="text-red-500 text-xs mt-1">{errors.events.message}</p>}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSubmit(d => createMut.mutate(d))} disabled={createMut.isPending}>
              {createMut.isPending ? <Spinner size="sm" /> : 'Create Webhook'}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {webhooks.map((wh: any) => (
          <div key={wh.id} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold text-gray-900">{wh.webhookName ?? wh.webhook_name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${(wh.isActive ?? wh.is_active) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {(wh.isActive ?? wh.is_active) ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <p className="text-xs font-mono text-gray-500 truncate">{wh.url}</p>
                <div className="flex gap-1 mt-2 flex-wrap">
                  {(Array.isArray(wh.events) ? wh.events : JSON.parse(wh.events ?? '[]')).map((e: string) => (
                    <span key={e} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">{e}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Sync Health Tab ───────────────────────────────────────────────────────────

const SYNC_METRICS = [
  { integration: 'Slack', status: 'healthy', lastSync: '2026-06-15 09:12', recordsSynced: 1420, errorRate: '0.0%', latency: '142ms' },
  { integration: 'Google Workspace', status: 'healthy', lastSync: '2026-06-15 08:45', recordsSynced: 241, errorRate: '0.0%', latency: '89ms' },
  { integration: 'QuickBooks', status: 'warning', lastSync: '2026-06-01 14:30', recordsSynced: 12, errorRate: '2.1%', latency: '1.2s' },
];

function SyncHealthTab() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Connected', value: 3, color: 'text-green-700', bg: 'bg-green-50' },
          { label: 'Warnings', value: 1, color: 'text-yellow-700', bg: 'bg-yellow-50' },
          { label: 'Errors', value: 0, color: 'text-red-600', bg: 'bg-red-50' },
        ].map(m => (
          <div key={m.label} className={`${m.bg} border border-gray-200 rounded-xl p-4 text-center`}>
            <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
            <p className="text-xs text-gray-500 mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Integration', 'Status', 'Last Sync', 'Records', 'Error Rate', 'Latency'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {SYNC_METRICS.map(row => (
              <tr key={row.integration} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{row.integration}</td>
                <td className="px-4 py-3">
                  <span className={`flex items-center gap-1.5 text-xs font-medium w-fit px-2 py-0.5 rounded-full ${row.status === 'healthy' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {row.status === 'healthy' ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{row.lastSync}</td>
                <td className="px-4 py-3 text-xs text-gray-700 font-medium">{row.recordsSynced.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium ${parseFloat(row.errorRate) > 0 ? 'text-yellow-600' : 'text-green-600'}`}>{row.errorRate}</span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{row.latency}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-blue-800 mb-2">QuickBooks Sync Warning</h3>
        <p className="text-xs text-blue-700">2 payroll journal entries from May 2026 failed to sync due to a chart of accounts mismatch. <span className="font-semibold underline cursor-pointer">View errors →</span></p>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function IntegrationPage() {
  const [activeTab, setActiveTab] = React.useState('catalog');

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">API Integration Layer</h1>
        <p className="text-sm text-gray-500 mt-1">Connect your HRMS to external systems, manage API keys, and monitor sync health</p>
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'catalog' && <CatalogTab />}
      {activeTab === 'apikeys' && <APIKeysTab />}
      {activeTab === 'webhooks' && <WebhooksTab />}
      {activeTab === 'health' && <SyncHealthTab />}
    </div>
  );
}
