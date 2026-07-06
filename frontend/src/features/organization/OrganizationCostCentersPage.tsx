import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Plus, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Badge, Spinner, Input, Select } from '@components/ui/Input';
import { Modal } from '@components/ui/Modal';
import { ConfirmDialog } from '@components/ui/ConfirmDialog';
import { useToast } from '@components/ui/Toast';
import { getCostCenters, getCompanies, getBranches, getDepartments, createCostCenter, updateCostCenter, deleteCostCenter } from './organization.api';
import type { Company, Branch, Department, CostCenter } from '@types';
import { PageHeader } from '@components/ui/PageHeader';

function apiErrorMsg(err: unknown, fallback: string): string {
  const e = err as any;
  return e?.response?.data?.error?.message || e?.response?.data?.message || e?.message || fallback;
}

const createSchema = z.object({
  companyId: z.string().min(1, 'Select company'),
  costCenterName: z.string().min(2, 'Enter cost center name'),
  costCenterCode: z.string().min(2, 'Enter cost center code'),
  branchId: z.string().optional(),
  departmentId: z.string().optional(),
});

const editSchema = z.object({
  costCenterName: z.string().min(2, 'Enter cost center name'),
  status: z.string().optional(),
});

type CreateValues = z.infer<typeof createSchema>;
type EditValues = z.infer<typeof editSchema>;

const statusVariant = (s?: string): 'success' | 'danger' | 'default' =>
  s === 'Active' ? 'success' : s === 'Inactive' ? 'danger' : 'default';

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="grid grid-cols-3 gap-2 py-2 border-b border-gray-50 last:border-0">
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
      <dd className="col-span-2 text-sm text-gray-800">{value ?? <span className="text-gray-400 italic">—</span>}</dd>
    </div>
  );
}

export default function OrganizationCostCentersPage() {
  const [search, setSearch] = React.useState('');
  const [showCreate, setShowCreate] = React.useState(false);
  const [viewCC, setViewCC] = React.useState<CostCenter | null>(null);
  const [editCC, setEditCC] = React.useState<CostCenter | null>(null);
  const [deletingCC, setDeletingCC] = React.useState<CostCenter | null>(null);
  const queryClient = useQueryClient();
  const { toast, toastError } = useToast();

  const { data: companies } = useQuery({
    queryKey: ['organization', 'companies', 'list'],
    queryFn: () => getCompanies({ page: 1, limit: 100 }),
  });

  const [companyId, setCompanyId] = React.useState('');
  const defaultCompanyId = companies?.data?.[0]?.id ?? '';

  React.useEffect(() => {
    if (!companyId && defaultCompanyId) setCompanyId(defaultCompanyId);
  }, [companyId, defaultCompanyId]);

  const { data: branches } = useQuery({
    queryKey: ['organization', 'branches', companyId],
    enabled: !!companyId,
    queryFn: () => getBranches(companyId),
  });

  const { data: departments } = useQuery({
    queryKey: ['organization', 'departments', companyId],
    enabled: !!companyId,
    queryFn: () => getDepartments(companyId),
  });

  const { data: costCenters, isLoading, error } = useQuery({
    queryKey: ['organization', 'cost-centers', companyId],
    enabled: !!companyId,
    queryFn: () => getCostCenters(companyId),
  });

  // ── Create ──
  const createMutation = useMutation({
    mutationFn: createCostCenter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] as const });
      setShowCreate(false);
      createForm.reset({ companyId, costCenterName: '', costCenterCode: '', branchId: undefined, departmentId: undefined });
      toast('Cost center created successfully.');
    },
    onError: (err) => toastError(apiErrorMsg(err, 'Failed to create cost center.')),
  });

  const createForm = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { companyId: '', costCenterName: '', costCenterCode: '', branchId: undefined, departmentId: undefined },
  });

  React.useEffect(() => {
    if (companyId) createForm.reset((prev) => ({ ...prev, companyId }));
  }, [companyId, createForm]);

  const onCreateSubmit = async (values: CreateValues) => {
    await createMutation.mutateAsync({ ...values, branchId: values.branchId || undefined, departmentId: values.departmentId || undefined });
  };

  // ── Edit ──
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EditValues }) => updateCostCenter(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] as const });
      setEditCC(null);
      toast('Cost center updated successfully.');
    },
    onError: (err) => toastError(apiErrorMsg(err, 'Failed to update cost center.')),
  });

  const editForm = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { costCenterName: '', status: 'Active' },
  });

  React.useEffect(() => {
    if (editCC) {
      editForm.reset({ costCenterName: editCC.costCenterName, status: editCC.status ?? 'Active' });
    }
  }, [editCC, editForm]);

  const onEditSubmit = async (values: EditValues) => {
    if (!editCC) return;
    await updateMutation.mutateAsync({ id: editCC.id, payload: values });
  };

  // ── Delete ──
  const deleteMutation = useMutation({
    mutationFn: deleteCostCenter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] as const });
      setDeletingCC(null);
      toast('Cost center deleted successfully.');
    },
    onError: (err) => {
      setDeletingCC(null);
      toastError(apiErrorMsg(err, 'Failed to delete cost center.'));
    },
  });

  const filtered = React.useMemo(() => {
    if (!costCenters) return [];
    return costCenters.filter(
      (cc: CostCenter) =>
        cc.costCenterName.toLowerCase().includes(search.toLowerCase()) ||
        cc.costCenterCode.toLowerCase().includes(search.toLowerCase())
    );
  }, [costCenters, search]);

  return (
    <div>
      <PageHeader
        title="Cost Centers"
        subtitle="Manage cost center assignments for branches and departments."
        actions={
          <Button onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Add Cost Center
          </Button>
        }
      />

      {/* ── Table — full width ── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search cost centers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <select
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 sm:w-52"
          >
            {companies?.data.map((c: Company) => <option key={c.id} value={c.id}>{c.companyName}</option>)}
          </select>
        </div>

        {isLoading ? <Spinner /> : error ? (
          <div className="p-8 text-center text-danger">Unable to load cost centers.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Code</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Branch</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Department</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((cc: CostCenter) => (
                  <tr key={cc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{cc.costCenterName}</td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">{cc.costCenterCode}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{branches?.find((b: Branch) => b.id === cc.branchId)?.branchName ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{departments?.find((d: Department) => d.id === cc.departmentId)?.departmentName ?? '—'}</td>
                    <td className="px-4 py-3"><Badge variant={statusVariant(cc.status)}>{cc.status ?? 'Active'}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button aria-label="View" title="View" onClick={() => setViewCC(cc)} className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600">
                          <Eye size={14} />
                        </button>
                        <button aria-label="Edit" title="Edit" onClick={() => setEditCC(cc)} className="rounded-lg p-1.5 text-gray-400 hover:bg-amber-50 hover:text-amber-600">
                          <Edit size={14} />
                        </button>
                        <button aria-label="Delete" title="Delete" onClick={() => setDeletingCC(cc)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">No cost centers found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Delete Confirm ── */}
      <ConfirmDialog
        open={!!deletingCC}
        onClose={() => setDeletingCC(null)}
        onConfirm={() => deletingCC && deleteMutation.mutate(deletingCC.id)}
        title={`Delete "${deletingCC?.costCenterName}"?`}
        message="This cost center will be removed. Any budget allocations linked to it should be reassigned."
        confirmLabel="Delete Cost Center"
        loading={deleteMutation.isPending}
      />

      {/* ── Create Modal ── */}
      <Modal
        open={showCreate}
        onClose={() => { setShowCreate(false); createForm.reset({ companyId, costCenterName: '', costCenterCode: '', branchId: undefined, departmentId: undefined }); }}
        title="Add Cost Center"
        size="md"
        footer={
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" form="create-cc-form" loading={createMutation.isPending}>Save Cost Center</Button>
          </div>
        }
      >
        {!companyId ? (
          <div className="rounded-xl bg-yellow-50 p-4 text-sm text-yellow-800">Select a company in the filter above before adding cost centers.</div>
        ) : (
          <form id="create-cc-form" onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Cost Center Name *" {...createForm.register('costCenterName')} error={createForm.formState.errors.costCenterName?.message} />
              <Input label="Cost Center Code *" {...createForm.register('costCenterCode')} error={createForm.formState.errors.costCenterCode?.message} />
            </div>
            <Select
              label="Branch"
              options={[{ value: '', label: 'None' }, ...(branches ?? []).map((b: Branch) => ({ value: b.id, label: b.branchName }))]}
              {...createForm.register('branchId')}
            />
            <Select
              label="Department"
              options={[{ value: '', label: 'None' }, ...(departments ?? []).map((d: Department) => ({ value: d.id, label: d.departmentName }))]}
              {...createForm.register('departmentId')}
            />
            {createMutation.error && <p className="text-sm text-danger">Unable to create cost center.</p>}
          </form>
        )}
      </Modal>

      {/* ── View Modal ── */}
      <Modal open={!!viewCC} onClose={() => setViewCC(null)} title={viewCC?.costCenterName ?? ''}>
        {viewCC && (
          <dl className="space-y-1">
            <DetailRow label="Code" value={viewCC.costCenterCode} />
            <DetailRow label="Branch" value={branches?.find((b: Branch) => b.id === viewCC.branchId)?.branchName} />
            <DetailRow label="Department" value={departments?.find((d: Department) => d.id === viewCC.departmentId)?.departmentName} />
            <DetailRow label="Status" value={viewCC.status} />
          </dl>
        )}
      </Modal>

      {/* ── Edit Modal ── */}
      <Modal
        open={!!editCC}
        onClose={() => setEditCC(null)}
        title={`Edit — ${editCC?.costCenterName ?? ''}`}
        footer={
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setEditCC(null)}>Cancel</Button>
            <Button type="submit" form="edit-cc-form" loading={updateMutation.isPending}>Save Changes</Button>
          </div>
        }
      >
        <form id="edit-cc-form" onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
          <Input label="Cost Center Name *" {...editForm.register('costCenterName')} error={editForm.formState.errors.costCenterName?.message} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select {...editForm.register('status')} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          {updateMutation.error && <p className="text-sm text-danger">Failed to update cost center.</p>}
        </form>
      </Modal>
    </div>
  );
}
