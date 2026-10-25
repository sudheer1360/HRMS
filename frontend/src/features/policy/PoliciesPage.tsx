import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  BookOpen, CheckCircle, FileText, Plus, Edit, Trash2,
  Send, Users, BarChart2,
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

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'my',    label: 'My Policies',   icon: BookOpen },
  { key: 'admin', label: 'Admin / CRUD',  icon: Edit },
  { key: 'stats', label: 'Ack. Stats',    icon: BarChart2 },
];

const CATEGORY_OPTIONS = [
  { value: 'General', label: 'General' },
  { value: 'Leave', label: 'Leave' },
  { value: 'Attendance', label: 'Attendance' },
  { value: 'Payroll', label: 'Payroll' },
  { value: 'Code of Conduct', label: 'Code of Conduct' },
  { value: 'IT', label: 'IT' },
  { value: 'Safety', label: 'Safety' },
  { value: 'Benefits', label: 'Benefits' },
  { value: 'Travel', label: 'Travel' },
  { value: 'HR', label: 'HR' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Legal', label: 'Legal' },
  { value: 'Operations', label: 'Operations' },
  { value: 'Other', label: 'Other' },
];

// ── My Policies tab ───────────────────────────────────────────────────────────

function MyPoliciesTab() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['my-policies'],
    queryFn: async () => { const { data } = await api.get('/policies/my/all'); return data.data ?? []; },
  });

  const ackMutation = useMutation({
    mutationFn: (policyId: string) => api.post('/policies/acknowledge', { policyId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-policies'] }),
  });

  const policies: any[] = data ?? [];

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-4">
      {policies.map((p: any) => (
        <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-semibold text-gray-900">{p.title}</h3>
                <Badge variant={p.acknowledged ? 'success' : 'warning'}>
                  {p.acknowledged ? 'Acknowledged' : 'Pending'}
                </Badge>
                {p.category && <Badge variant="info">{p.category}</Badge>}
              </div>
              <p className="text-xs text-gray-500">
                Version {p.version ?? '1.0'} · Effective {safeDate(p.effectiveDate ?? p.effective_date)}
              </p>
              <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600 line-clamp-3">
                {(p.content ?? '').slice(0, 300)}{p.content?.length > 300 ? '...' : ''}
              </div>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="ghost"><FileText size={14} /> Read Full Policy</Button>
            {!p.acknowledged && (
              <Button
                size="sm"
                onClick={() => ackMutation.mutate(p.id)}
                loading={ackMutation.isPending}
              >
                <CheckCircle size={14} /> Acknowledge
              </Button>
            )}
          </div>
        </div>
      ))}

      {policies.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
          <BookOpen size={36} className="mx-auto mb-3 text-gray-300" />
          <p>No policies assigned to you</p>
        </div>
      )}
    </div>
  );
}

// ── Admin tab ─────────────────────────────────────────────────────────────────

const policySchema = z.object({
  title: z.string().min(2, 'Required'),
  category: z.string().min(1, 'Required'),
  version: z.string().min(1, 'Required'),
  effectiveDate: z.string().min(1, 'Required'),
  content: z.string().min(10, 'Content is too short'),
  requiresAcknowledgement: z.string().optional(),
});

function AdminTab() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = React.useState(false);
  const [editItem, setEditItem] = React.useState<any>(null);
  const [deletePolicyId, setDeletePolicyId] = React.useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['all-policies'],
    queryFn: async () => { const { data } = await api.get('/policies?limit=100'); return data.data ?? []; },
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(policySchema),
    defaultValues: { version: '1.0', requiresAcknowledgement: 'true' },
  });

  const saveMutation = useMutation({
    mutationFn: (d: any) => editItem
      ? api.put(`/policies/${editItem.id}`, { ...d, requiresAcknowledgement: d.requiresAcknowledgement === 'true' })
      : api.post('/policies', { ...d, requiresAcknowledgement: d.requiresAcknowledgement === 'true' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-policies'] });
      reset();
      setShowForm(false);
      setEditItem(null);
    },
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => api.post(`/policies/${id}/publish`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['all-policies'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/policies/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['all-policies'] }),
  });

  function openEdit(p: any) {
    setEditItem(p);
    setValue('title', p.title);
    setValue('category', p.category ?? '');
    setValue('version', p.version ?? '1.0');
    setValue('effectiveDate', (p.effectiveDate ?? p.effective_date ?? '').slice(0, 10));
    setValue('content', p.content ?? '');
    setValue('requiresAcknowledgement', (p.requiresAcknowledgement ?? p.requires_acknowledgement) ? 'true' : 'false');
    setShowForm(true);
  }

  const policies: any[] = data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => { setEditItem(null); reset(); setShowForm(v => !v); }}>
          <Plus size={14} /> New Policy
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold mb-4">{editItem ? 'Edit Policy' : 'New Policy'}</h3>
          <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="sm:col-span-2">
                <Input label="Title *" error={errors.title?.message as string} {...register('title')} />
              </div>
              <Select label="Category *" options={CATEGORY_OPTIONS} error={errors.category?.message as string} {...register('category')} />
              <Input label="Version *" error={errors.version?.message as string} {...register('version')} />
              <Input label="Effective Date *" type="date" error={errors.effectiveDate?.message as string} {...register('effectiveDate')} />
              <Select
                label="Requires Acknowledgement"
                options={[{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }]}
                {...register('requiresAcknowledgement')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                rows={6}
                placeholder="Policy content..."
                {...register('content')}
              />
              {errors.content && <p className="mt-1 text-xs text-danger">{errors.content.message as string}</p>}
            </div>
            <div className="flex gap-3">
              <Button type="submit" size="sm" loading={saveMutation.isPending}>{editItem ? 'Update' : 'Save Draft'}</Button>
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
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Title</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Category</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Version</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Effective</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {policies.map((p: any) => {
                const status: string = p.status ?? 'Draft';
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium max-w-xs truncate">{p.title}</td>
                    <td className="px-4 py-3"><Badge variant="info">{p.category ?? '—'}</Badge></td>
                    <td className="px-4 py-3 text-gray-500">v{p.version ?? '1.0'}</td>
                    <td className="px-4 py-3">{safeDate(p.effectiveDate ?? p.effective_date)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={status === 'Active' ? 'success' : status === 'Archived' ? 'default' : 'warning'}>
                        {status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {status !== 'Active' && (
                          <button
                            onClick={() => publishMutation.mutate(p.id)}
                            className="p-1.5 rounded hover:bg-green-50 hover:text-green-700 text-gray-400"
                            title="Publish"
                          >
                            <Send size={13} />
                          </button>
                        )}
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-gray-100"><Edit size={13} /></button>
                        <button
                          onClick={() => setDeletePolicyId(p.id)}
                          className="p-1.5 rounded hover:bg-red-50 hover:text-danger"
                          aria-label="Delete policy" title="Delete policy"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {policies.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">No records found.</td></tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={!!deletePolicyId}
        onClose={() => setDeletePolicyId(null)}
        onConfirm={() => { deleteMutation.mutate(deletePolicyId!); setDeletePolicyId(null); }}
        title="Delete Policy"
        message="Delete this policy? Employees who have acknowledged it will lose access."
        confirmLabel="Delete Policy"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

// ── Stats tab ─────────────────────────────────────────────────────────────────

function AckStatsTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['all-policies'],
    queryFn: async () => { const { data } = await api.get('/policies?limit=100'); return data.data ?? []; },
  });

  const policies: any[] = data ?? [];

  // Fetch stats for each policy
  const statsQueries = policies.map(p => ({
    id: p.id,
    title: p.title,
  }));

  const { data: statsData, isLoading: loadingStats } = useQuery({
    queryKey: ['policy-stats'],
    enabled: policies.length > 0,
    queryFn: async () => {
      const results = await Promise.allSettled(
        statsQueries.slice(0, 20).map(async (p) => {
          try {
            const { data } = await api.get(`/policies/${p.id}/stats`);
            return { id: p.id, title: p.title, ...(data.data ?? {}) };
          } catch {
            return { id: p.id, title: p.title, total: 0, acknowledged: 0, pending: 0, acknowledgementRate: 0 };
          }
        })
      );
      return results
        .filter(r => r.status === 'fulfilled')
        .map(r => (r as any).value);
    },
  });

  if (isLoading || loadingStats) return <Spinner />;

  const stats: any[] = statsData ?? [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Total Policies"
          value={policies.length}
          sub="All published"
          icon={<BookOpen size={20} className="text-primary" />}
        />
        <StatCard
          label="Avg. Ack Rate"
          value={`${stats.length ? Math.round(stats.reduce((a, s) => a + (s.acknowledgementRate ?? 0), 0) / stats.length) : 0}%`}
          sub="Across all policies"
          icon={<CheckCircle size={20} className="text-success" />}
        />
        <StatCard
          label="Pending Total"
          value={stats.reduce((a, s) => a + (s.pending ?? 0), 0)}
          sub="Employees to ack"
          icon={<Users size={20} className="text-warning" />}
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Policy</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Total</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Acknowledged</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Pending</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {stats.map((s: any) => {
              const rate = s.acknowledgementRate ?? (s.total ? Math.round((s.acknowledged / s.total) * 100) : 0);
              return (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium max-w-xs truncate">{s.title}</td>
                  <td className="px-4 py-3 text-gray-600">{s.total ?? 0}</td>
                  <td className="px-4 py-3 text-green-600 font-medium">{s.acknowledged ?? 0}</td>
                  <td className="px-4 py-3 text-orange-600">{s.pending ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5 w-24">
                        <div
                          className={`h-1.5 rounded-full ${rate >= 80 ? 'bg-green-500' : rate >= 50 ? 'bg-yellow-500' : 'bg-red-400'}`}
                          style={{ width: `${Math.min(rate, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 font-medium w-8">{rate}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
            {stats.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-400">No records found.</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, icon }: { label: string; value: any; sub: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
      <div className="p-2 rounded-lg bg-gray-50">{icon}</div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <p className="text-xs text-gray-400">{sub}</p>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PoliciesPage() {
  const [tab, setTab] = React.useState('my');

  return (
    <div>
      <PageHeader title="HR Policies" subtitle="Manage and acknowledge company policies" />

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

      {tab === 'my'    && <MyPoliciesTab />}
      {tab === 'admin' && <AdminTab />}
      {tab === 'stats' && <AckStatsTab />}
    </div>
  );
}
