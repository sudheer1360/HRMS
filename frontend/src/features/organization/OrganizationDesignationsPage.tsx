import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { Plus, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Badge, Spinner, Input, Select } from '@components/ui/Input';
import { Modal } from '@components/ui/Modal';
import { ConfirmDialog } from '@components/ui/ConfirmDialog';
import { useToast } from '@components/ui/Toast';
import { getDesignations, getCompanies, getGrades, createDesignation, updateDesignation, deleteDesignation } from './organization.api';
import type { Company, Grade, Designation } from '@types';
import { PageHeader } from '@components/ui/PageHeader';

const createSchema = z.object({
  companyId:       z.string().min(1, 'Select company'),
  designationName: z.string().min(2, 'Enter designation name'),
  designationCode: z.string().min(2, 'Enter designation code').max(50),
  gradeId:         z.string().optional(),
  level:           z.number().int().min(0).optional(),
});

const editSchema = z.object({
  designationName: z.string().min(2, 'Enter designation name'),
  gradeId:         z.string().optional().nullable(),
  level:           z.number().int().min(0).optional(),
  status:          z.enum(['Active', 'Inactive']).optional(),
});

type CreateValues = z.infer<typeof createSchema>;
type EditValues   = z.infer<typeof editSchema>;

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="grid grid-cols-3 gap-2 py-2 border-b border-gray-50 last:border-0">
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
      <dd className="col-span-2 text-sm text-gray-800">
        {value != null && value !== '' ? value : <span className="text-gray-400 italic">—</span>}
      </dd>
    </div>
  );
}

const statusVariant = (s?: string): 'success' | 'danger' | 'default' =>
  s === 'Active' ? 'success' : s === 'Inactive' ? 'danger' : 'default';

function apiErrorMsg(err: unknown, fallback: string): string {
  const e = err as any;
  return e?.response?.data?.error?.message || e?.response?.data?.message || e?.message || fallback;
}

export default function OrganizationDesignationsPage() {
  const [search,            setSearch]            = React.useState('');
  const [showCreate,        setShowCreate]        = React.useState(false);
  const [viewDes,           setViewDes]           = React.useState<Designation | null>(null);
  const [editDes,           setEditDes]           = React.useState<Designation | null>(null);
  const [deletingDes,       setDeletingDes]       = React.useState<Designation | null>(null);
  const queryClient = useQueryClient();
  const { toast, toastError } = useToast();

  const { data: companies } = useQuery({
    queryKey: ['organization', 'companies', 'list'],
    queryFn:  () => getCompanies({ page: 1, limit: 100 }),
  });

  const [companyId, setCompanyId] = React.useState('');
  const defaultCompanyId = companies?.data?.[0]?.id ?? '';
  React.useEffect(() => {
    if (!companyId && defaultCompanyId) setCompanyId(defaultCompanyId);
  }, [defaultCompanyId, companyId]);

  const { data: designations, isLoading, error } = useQuery({
    queryKey: ['organization', 'designations', companyId],
    enabled:  !!companyId,
    queryFn:  () => getDesignations(companyId),
  });

  const { data: grades } = useQuery({
    queryKey: ['organization', 'grades', companyId],
    enabled:  !!companyId,
    queryFn:  () => getGrades(companyId),
  });

  const gradeMap = React.useMemo(
    () => new Map((grades ?? []).map((g: Grade) => [g.id, g.gradeName])),
    [grades]
  );

  // ── Create ──
  const createMutation = useMutation({
    mutationFn: createDesignation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] as const });
      setShowCreate(false);
      createForm.reset({ companyId, designationName: '', designationCode: '', gradeId: undefined, level: undefined });
      toast('Designation created successfully.');
    },
    onError: (err) => toastError(apiErrorMsg(err, 'Failed to create designation.')),
  });

  const createForm = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { companyId: '', designationName: '', designationCode: '', gradeId: undefined, level: undefined },
  });

  React.useEffect(() => {
    if (companyId) createForm.reset((prev) => ({ ...prev, companyId }));
  }, [companyId, createForm]);

  const onCreateSubmit = async (values: CreateValues) => {
    await createMutation.mutateAsync({
      ...values,
      gradeId: values.gradeId || undefined,
      level:   values.level === undefined ? undefined : Number(values.level),
    });
  };

  // ── Edit ──
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EditValues }) =>
      updateDesignation(id, { ...payload, gradeId: payload.gradeId || undefined, level: payload.level }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] as const });
      setEditDes(null);
      toast('Designation updated successfully.');
    },
    onError: (err) => toastError(apiErrorMsg(err, 'Failed to update designation.')),
  });

  const editForm = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { designationName: '', gradeId: null, level: undefined, status: 'Active' },
  });

  React.useEffect(() => {
    if (editDes) {
      editForm.reset({
        designationName: editDes.designationName,
        gradeId:         editDes.gradeId ?? null,
        level:           editDes.level ?? undefined,
        status:          (editDes.status as 'Active' | 'Inactive') ?? 'Active',
      });
    }
  }, [editDes, editForm]);

  const onEditSubmit = async (values: EditValues) => {
    if (!editDes) return;
    await updateMutation.mutateAsync({ id: editDes.id, payload: values });
  };

  // ── Delete ──
  const deleteMutation = useMutation({
    mutationFn: deleteDesignation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] as const });
      setDeletingDes(null);
      toast('Designation deleted successfully.');
    },
    onError: (err) => {
      setDeletingDes(null);
      toastError(apiErrorMsg(err, 'Failed to delete designation.'));
    },
  });

  const filtered = (designations ?? []).filter(
    (d: Designation) =>
      d.designationName?.toLowerCase().includes(search.toLowerCase()) ||
      d.designationCode?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Designations"
        subtitle="Manage role titles and seniority levels."
        actions={
          <Button onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Add Designation
          </Button>
        }
      />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or code…"
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
          <div className="p-8 text-center text-danger">Unable to load designations.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {['Name', 'Code', 'Grade', 'Level', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((des: Designation) => (
                  <tr key={des.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">{des.designationName}</td>
                    <td className="px-4 py-3 font-mono text-gray-600">{des.designationCode}</td>
                    <td className="px-4 py-3 text-gray-600">{des.grade?.gradeName ?? (des.gradeId ? gradeMap.get(des.gradeId) : '—') ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{des.level ?? '—'}</td>
                    <td className="px-4 py-3"><Badge variant={statusVariant(des.status)}>{des.status ?? 'Active'}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button aria-label="View"   onClick={() => setViewDes(des)}     className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50  hover:text-blue-600"><Eye    size={14} /></button>
                        <button aria-label="Edit"   onClick={() => setEditDes(des)}     className="rounded-lg p-1.5 text-gray-400 hover:bg-amber-50 hover:text-amber-600"><Edit   size={14} /></button>
                        <button aria-label="Delete" onClick={() => setDeletingDes(des)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50   hover:text-red-600"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">No designations found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Delete Confirm ── */}
      <ConfirmDialog
        open={!!deletingDes}
        onClose={() => setDeletingDes(null)}
        onConfirm={() => deletingDes && deleteMutation.mutate(deletingDes.id)}
        title={`Delete "${deletingDes?.designationName}"?`}
        message="Employees assigned to this designation will lose their designation reference."
        confirmLabel="Delete Designation"
        loading={deleteMutation.isPending}
      />

      {/* ── Create Modal ── */}
      <Modal
        open={showCreate}
        onClose={() => { setShowCreate(false); createForm.reset({ companyId, designationName: '', designationCode: '', gradeId: undefined, level: undefined }); }}
        title="Add Designation"
        size="md"
        footer={
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" form="create-des-form" loading={createMutation.isPending}>Save Designation</Button>
          </div>
        }
      >
        {!companyId ? (
          <div className="rounded-xl bg-yellow-50 p-4 text-sm text-yellow-800">Select a company before adding designations.</div>
        ) : (
          <form id="create-des-form" onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
            <Input
              label="Designation Name *"
              placeholder="e.g. Senior Software Engineer"
              {...createForm.register('designationName')}
              error={createForm.formState.errors.designationName?.message}
            />
            <Input
              label="Designation Code *"
              placeholder="e.g. SENG"
              {...createForm.register('designationCode')}
              error={createForm.formState.errors.designationCode?.message}
            />
            <Select
              label="Grade"
              options={[
                { value: '', label: 'No grade assigned' },
                ...(grades ?? []).map((g: Grade) => ({ value: g.id, label: g.gradeName })),
              ]}
              {...createForm.register('gradeId')}
            />
            <Input
              label="Seniority Level"
              type="number"
              placeholder="e.g. 3 (higher = more senior)"
              {...createForm.register('level', { valueAsNumber: true })}
            />
          </form>
        )}
      </Modal>

      {/* ── View Modal ── */}
      <Modal open={!!viewDes} onClose={() => setViewDes(null)} title={viewDes?.designationName ?? ''}>
        {viewDes && (
          <dl className="space-y-1">
            <DetailRow label="Code"   value={viewDes.designationCode} />
            <DetailRow label="Grade"  value={viewDes.grade?.gradeName ?? (viewDes.gradeId ? gradeMap.get(viewDes.gradeId) : undefined)} />
            <DetailRow label="Level"  value={viewDes.level} />
            <DetailRow label="Status" value={viewDes.status ?? 'Active'} />
          </dl>
        )}
      </Modal>

      {/* ── Edit Modal ── */}
      <Modal
        open={!!editDes}
        onClose={() => setEditDes(null)}
        title={`Edit — ${editDes?.designationName ?? ''}`}
        footer={
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setEditDes(null)}>Cancel</Button>
            <Button type="submit" form="edit-des-form" loading={updateMutation.isPending}>Save Changes</Button>
          </div>
        }
      >
        <form id="edit-des-form" onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
          <Input
            label="Designation Name *"
            placeholder="e.g. Senior Software Engineer"
            {...editForm.register('designationName')}
            error={editForm.formState.errors.designationName?.message}
          />
          <Controller
            control={editForm.control}
            name="gradeId"
            render={({ field }) => (
              <Select
                label="Grade"
                options={[
                  { value: '', label: 'No grade assigned' },
                  ...(grades ?? []).map((g: Grade) => ({ value: g.id, label: g.gradeName })),
                ]}
                value={field.value ?? ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
              />
            )}
          />
          <Input
            label="Seniority Level"
            type="number"
            placeholder="e.g. 3 (higher = more senior)"
            {...editForm.register('level', { valueAsNumber: true })}
          />
          <Controller
            control={editForm.control}
            name="status"
            render={({ field }) => (
              <Select
                label="Status"
                options={[
                  { value: 'Active',   label: 'Active' },
                  { value: 'Inactive', label: 'Inactive' },
                ]}
                value={field.value ?? 'Active'}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
              />
            )}
          />
        </form>
      </Modal>
    </div>
  );
}
