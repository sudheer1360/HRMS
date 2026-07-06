import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Monitor, Package, Wrench, User,
  Plus, Trash2, Check, ArrowLeftRight,
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
  { key: 'assets',      label: 'Assets',         icon: Monitor },
  { key: 'allocations', label: 'Allocations',     icon: ArrowLeftRight },
  { key: 'maintenance', label: 'Maintenance',     icon: Wrench },
  { key: 'my',          label: 'My Assets',       icon: User },
];

const ASSET_TYPES = [
  { value: 'Laptop', label: 'Laptop' },
  { value: 'Desktop', label: 'Desktop' },
  { value: 'Mobile', label: 'Mobile Phone' },
  { value: 'Monitor', label: 'Monitor' },
  { value: 'Keyboard', label: 'Keyboard' },
  { value: 'Mouse', label: 'Mouse' },
  { value: 'Headset', label: 'Headset' },
  { value: 'Chair', label: 'Chair' },
  { value: 'Desk', label: 'Desk' },
  { value: 'Vehicle', label: 'Vehicle' },
  { value: 'Other', label: 'Other' },
];

const ASSET_CONDITIONS = [
  { value: 'New', label: 'New' },
  { value: 'Good', label: 'Good' },
  { value: 'Fair', label: 'Fair' },
  { value: 'Poor', label: 'Poor' },
  { value: 'Damaged', label: 'Damaged' },
];

// ── Assets tab ────────────────────────────────────────────────────────────────

const assetSchema = z.object({
  assetName: z.string().min(1, 'Required'),
  assetCode: z.string().min(1, 'Required'),
  assetType: z.string().min(1, 'Required'),
  brand: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchaseValue: z.coerce.number().min(0).optional(),
  condition: z.string().min(1, 'Required'),
  location: z.string().optional(),
  warrantyExpiry: z.string().optional(),
});

function AssetsTab() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = React.useState(false);
  const [confirmId, setConfirmId] = React.useState<string | null>(null);
  const [typeFilter, setTypeFilter] = React.useState('All');

  const { data, isLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: async () => { const { data } = await api.get('/extended/assets?limit=100'); return data; },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(assetSchema),
    defaultValues: { assetType: 'Laptop', condition: 'New' },
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => api.post('/extended/assets', d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['assets'] }); reset(); setShowForm(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/extended/assets/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assets'] }),
  });

  const allAssets: any[] = data?.data ?? [];
  const assets = typeFilter === 'All' ? allAssets : allAssets.filter(a => a.assetType === typeFilter || a.asset_type === typeFilter);

  const stats = {
    total: allAssets.length,
    available: allAssets.filter(a => (a.status ?? 'Available') === 'Available').length,
    allocated: allAssets.filter(a => a.status === 'Allocated').length,
    maintenance: allAssets.filter(a => a.status === 'Maintenance').length,
  };

  const types = ['All', ...Array.from(new Set(allAssets.map((a: any) => a.assetType ?? a.asset_type ?? 'Other')))];

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Assets', value: stats.total, color: 'bg-blue-50 border-blue-200 text-blue-700' },
          { label: 'Available', value: stats.available, color: 'bg-green-50 border-green-200 text-green-700' },
          { label: 'Allocated', value: stats.allocated, color: 'bg-purple-50 border-purple-200 text-purple-700' },
          { label: 'In Maintenance', value: stats.maintenance, color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-4 ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs opacity-70 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-1 flex-wrap">
          {types.map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-2 py-1 rounded text-xs font-medium border ${typeFilter === t ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200'}`}>{t}</button>
          ))}
        </div>
        <Button size="sm" onClick={() => setShowForm(v => !v)}><Plus size={14} /> Add Asset</Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <form onSubmit={handleSubmit(d => createMutation.mutate(d))} className="grid grid-cols-3 gap-3">
            <Input label="Asset Name *" error={errors.assetName?.message as string} {...register('assetName')} />
            <Input label="Asset Code *" error={errors.assetCode?.message as string} {...register('assetCode')} />
            <Select label="Type *" options={ASSET_TYPES} {...register('assetType')} />
            <Input label="Brand" {...register('brand')} />
            <Input label="Model" {...register('model')} />
            <Input label="Serial Number" {...register('serialNumber')} />
            <Input label="Purchase Date" type="date" {...register('purchaseDate')} />
            <Input label="Purchase Value (₹)" type="number" {...register('purchaseValue')} />
            <Select label="Condition *" options={ASSET_CONDITIONS} {...register('condition')} />
            <Input label="Location" {...register('location')} />
            <Input label="Warranty Expiry" type="date" {...register('warrantyExpiry')} />
            <div className="col-span-3 flex gap-2">
              <Button type="submit" size="sm" loading={createMutation.isPending}>Add Asset</Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => { reset(); setShowForm(false); }}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? <div className="p-8 text-center"><Spinner /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 border-b border-gray-200">
                {['Asset', 'Type', 'Brand/Model', 'Serial No.', 'Location', 'Condition', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {assets.map((a: any) => (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{a.assetName ?? a.asset_name}</p>
                      <p className="text-xs text-gray-400">{a.assetCode ?? a.asset_code}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{a.assetType ?? a.asset_type}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{a.brand ?? '—'} {a.model ?? ''}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{a.serialNumber ?? a.serial_number ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{a.location ?? '—'}</td>
                    <td className="px-4 py-3"><Badge variant={a.condition === 'New' ? 'success' : a.condition === 'Damaged' ? 'danger' : 'default'}>{a.condition ?? 'Good'}</Badge></td>
                    <td className="px-4 py-3"><Badge variant={a.status === 'Available' ? 'success' : a.status === 'Allocated' ? 'info' : 'warning'}>{a.status ?? 'Available'}</Badge></td>
                    <td className="px-4 py-3">
                      <button onClick={() => setConfirmId(a.id)} className="p-1.5 rounded hover:bg-red-50 hover:text-danger text-gray-300">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
                {assets.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-400">No records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Allocations tab ───────────────────────────────────────────────────────────

const allocationSchema = z.object({
  assetId: z.string().min(1, 'Required'),
  employeeId: z.string().min(1, 'Required'),
  allocationDate: z.string().min(1, 'Required'),
  expectedReturnDate: z.string().optional(),
  notes: z.string().optional(),
});

function AllocationsTab() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = React.useState(false);

  const { data: assets } = useQuery({
    queryKey: ['assets'],
    queryFn: async () => { const { data } = await api.get('/extended/assets?status=Available&limit=100'); return data; },
  });

  const { data: employees } = useQuery({
    queryKey: ['employees-short'],
    queryFn: async () => { const { data } = await api.get('/employees?limit=200'); return data; },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['asset-allocations'],
    queryFn: async () => { const { data } = await api.get('/extended/assets/allocations?limit=100'); return data; },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(allocationSchema) });

  const allocateMutation = useMutation({
    mutationFn: (d: any) => api.post('/extended/assets/allocations', d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['asset-allocations'] }); queryClient.invalidateQueries({ queryKey: ['assets'] }); reset(); setShowForm(false); },
  });

  const returnMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/extended/assets/allocations/${id}/return`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['asset-allocations'] }); queryClient.invalidateQueries({ queryKey: ['assets'] }); },
  });

  const assetOptions = (assets?.data ?? []).map((a: any) => ({ value: a.id, label: `${a.assetName ?? a.asset_name} (${a.assetCode ?? a.asset_code})` }));
  const empOptions = (employees?.data ?? []).map((e: any) => ({ value: e.id, label: `${e.firstName ?? e.first_name} ${e.lastName ?? e.last_name}` }));
  const allocations: any[] = data?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">Asset Allocations ({allocations.length})</h3>
        <Button size="sm" onClick={() => setShowForm(v => !v)}><Plus size={14} /> Allocate Asset</Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <form onSubmit={handleSubmit(d => allocateMutation.mutate(d))} className="grid grid-cols-2 gap-3">
            <Select label="Asset *" options={assetOptions} error={errors.assetId?.message as string} {...register('assetId')} />
            <Select label="Employee *" options={empOptions} error={errors.employeeId?.message as string} {...register('employeeId')} />
            <Input label="Allocation Date *" type="date" error={errors.allocationDate?.message as string} {...register('allocationDate')} />
            <Input label="Expected Return Date" type="date" {...register('expectedReturnDate')} />
            <div className="col-span-2"><Input label="Notes" {...register('notes')} /></div>
            <div className="col-span-2 flex gap-2">
              <Button type="submit" size="sm" loading={allocateMutation.isPending}>Allocate</Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => { reset(); setShowForm(false); }}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? <div className="p-8 text-center"><Spinner /></div> : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b border-gray-200">
              {['Asset', 'Employee', 'Allocated On', 'Expected Return', 'Status', 'Action'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {allocations.map((a: any) => (
                <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium">{a.assetName ?? a.asset?.assetName ?? '—'}</p>
                    <p className="text-xs text-gray-400">{a.assetCode ?? a.asset?.assetCode ?? '—'}</p>
                  </td>
                  <td className="px-4 py-3 text-sm">{a.employeeName ?? a.employee?.fullName ?? '—'}</td>
                  <td className="px-4 py-3 text-sm">{safeDate(a.allocationDate ?? a.allocation_date)}</td>
                  <td className="px-4 py-3 text-sm">{safeDate(a.expectedReturnDate ?? a.expected_return_date)}</td>
                  <td className="px-4 py-3"><Badge variant={a.status === 'Returned' ? 'success' : 'info'}>{a.status ?? 'Active'}</Badge></td>
                  <td className="px-4 py-3">
                    {(a.status !== 'Returned') && (
                      <Button size="sm" variant="secondary" onClick={() => returnMutation.mutate(a.id)} loading={returnMutation.isPending}>
                        <Check size={12} /> Return
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {allocations.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">No records found.</td></tr>
              )}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Maintenance tab ───────────────────────────────────────────────────────────

const maintenanceSchema = z.object({
  assetId: z.string().min(1, 'Required'),
  maintenanceType: z.string().min(1, 'Required'),
  scheduledDate: z.string().min(1, 'Required'),
  description: z.string().optional(),
  cost: z.coerce.number().min(0).optional(),
  vendor: z.string().optional(),
});

const MAINTENANCE_TYPES = [
  { value: 'Repair', label: 'Repair' },
  { value: 'Service', label: 'Service' },
  { value: 'AMC', label: 'AMC' },
  { value: 'Upgrade', label: 'Upgrade' },
  { value: 'Inspection', label: 'Inspection' },
];

function MaintenanceTab() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = React.useState(false);

  const { data: assets } = useQuery({
    queryKey: ['assets-all'],
    queryFn: async () => { const { data } = await api.get('/extended/assets?limit=100'); return data; },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['asset-maintenance'],
    queryFn: async () => { const { data } = await api.get('/extended/assets/maintenance?limit=50'); return data; },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: { maintenanceType: 'Service' },
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => api.post('/extended/assets/maintenance', d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['asset-maintenance'] }); reset(); setShowForm(false); },
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/extended/assets/maintenance/${id}/complete`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['asset-maintenance'] }),
  });

  const assetOptions = (assets?.data ?? []).map((a: any) => ({ value: a.id, label: `${a.assetName ?? a.asset_name} (${a.assetCode ?? a.asset_code})` }));
  const list: any[] = data?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">Maintenance Records</h3>
        <Button size="sm" onClick={() => setShowForm(v => !v)}><Plus size={14} /> Log Maintenance</Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <form onSubmit={handleSubmit(d => createMutation.mutate(d))} className="grid grid-cols-2 gap-3">
            <Select label="Asset *" options={assetOptions} error={errors.assetId?.message as string} {...register('assetId')} />
            <Select label="Type *" options={MAINTENANCE_TYPES} {...register('maintenanceType')} />
            <Input label="Scheduled Date *" type="date" error={errors.scheduledDate?.message as string} {...register('scheduledDate')} />
            <Input label="Vendor" {...register('vendor')} />
            <Input label="Cost (₹)" type="number" {...register('cost')} />
            <Input label="Description" {...register('description')} />
            <div className="col-span-2 flex gap-2">
              <Button type="submit" size="sm" loading={createMutation.isPending}>Log</Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => { reset(); setShowForm(false); }}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? <div className="p-8 text-center"><Spinner /></div> : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b border-gray-200">
              {['Asset', 'Type', 'Scheduled', 'Vendor', 'Cost', 'Status', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {list.map((m: any) => (
                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium">{m.assetName ?? m.asset?.assetName ?? '—'}</td>
                  <td className="px-4 py-3"><Badge>{m.maintenanceType ?? m.maintenance_type}</Badge></td>
                  <td className="px-4 py-3 text-sm">{safeDate(m.scheduledDate ?? m.scheduled_date)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{m.vendor ?? '—'}</td>
                  <td className="px-4 py-3 text-sm">{m.cost ? `₹${Number(m.cost).toLocaleString('en-IN')}` : '—'}</td>
                  <td className="px-4 py-3"><Badge variant={m.status === 'Completed' ? 'success' : m.status === 'InProgress' ? 'info' : 'warning'}>{m.status ?? 'Scheduled'}</Badge></td>
                  <td className="px-4 py-3">
                    {(!m.status || m.status === 'Scheduled' || m.status === 'InProgress') && (
                      <Button size="sm" onClick={() => completeMutation.mutate(m.id)} loading={completeMutation.isPending}>
                        <Check size={12} /> Done
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">No records found.</td></tr>
              )}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── My Assets tab ─────────────────────────────────────────────────────────────

function MyAssetsTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-assets'],
    queryFn: async () => { const { data } = await api.get('/extended/assets/my?limit=50'); return data; },
  });

  const list: any[] = data?.data ?? [];

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-3">
      {list.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-400">
          <Package size={36} className="mx-auto mb-2 text-gray-300" />
          <p>No assets allocated to you</p>
        </div>
      ) : (
        list.map((a: any) => (
          <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Monitor size={20} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{a.assetName ?? a.asset?.assetName ?? '—'}</p>
              <p className="text-sm text-gray-500">{a.assetType ?? a.asset?.assetType ?? '—'} · {a.brand ?? a.asset?.brand ?? ''} {a.model ?? a.asset?.model ?? ''}</p>
              <p className="text-xs text-gray-400 mt-0.5">Code: {a.assetCode ?? a.asset?.assetCode ?? '—'} · S/N: {a.serialNumber ?? a.asset?.serialNumber ?? '—'}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Allocated on</p>
              <p className="text-sm font-medium">{safeDate(a.allocationDate ?? a.allocation_date)}</p>
            </div>
            <Badge variant="info">Allocated</Badge>
          </div>
        ))
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AssetManagementPage() {
  const [tab, setTab] = React.useState('assets');

  return (
    <div>
      <PageHeader title="Asset Management" subtitle="Track assets, allocations, maintenance and employee assets" />

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

      {tab === 'assets'      && <AssetsTab />}
      {tab === 'allocations' && <AllocationsTab />}
      {tab === 'maintenance' && <MaintenanceTab />}
      {tab === 'my'          && <MyAssetsTab />}
      <ConfirmDialog
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={() => { deleteMutation.mutate(confirmId!); setConfirmId(null); }}
        message="Delete this asset? This action cannot be undone."
        confirmLabel="Delete Asset"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
