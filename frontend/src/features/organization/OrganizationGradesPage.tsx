import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Plus, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Badge, Spinner, Input } from '@components/ui/Input';
import { Modal } from '@components/ui/Modal';
import { ConfirmDialog } from '@components/ui/ConfirmDialog';
import { useToast } from '@components/ui/Toast';
import { getGrades, getCompanies, createGrade, updateGrade, deleteGrade } from './organization.api';
import { formatCurrency } from '@lib/utils';
import type { Company, Grade } from '@types';
import { PageHeader } from '@components/ui/PageHeader';

function apiErrorMsg(err: unknown, fallback: string): string {
  const e = err as any;
  return e?.response?.data?.error?.message || e?.response?.data?.message || e?.message || fallback;
}

const createSchema = z.object({
  companyId: z.string().min(1, 'Select company'),
  gradeName: z.string().min(1, 'Enter grade name'),
  gradeCode: z.string().min(1, 'Enter grade code'),
  minSalary: z.number().positive().optional(),
  maxSalary: z.number().positive().optional(),
  sortOrder: z.number().int().optional(),
});

const editSchema = z.object({
  gradeName: z.string().min(1, 'Enter grade name'),
  minSalary: z.number().positive().optional(),
  maxSalary: z.number().positive().optional(),
  sortOrder: z.number().int().optional(),
  status: z.string().optional(),
});

type CreateValues = z.infer<typeof createSchema>;
type EditValues = z.infer<typeof editSchema>;

const statusVariant = (s?: string): 'success' | 'danger' | 'default' =>
  s === 'Active' ? 'success' : s === 'Inactive' ? 'danger' : 'default';

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="grid grid-cols-3 gap-2 py-2 border-b border-gray-50 last:border-0">
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
      <dd className="col-span-2 text-sm text-gray-800">{value ?? <span className="text-gray-400 italic">—</span>}</dd>
    </div>
  );
}

export default function OrganizationGradesPage() {
  const [search, setSearch] = React.useState('');
  const [showCreate, setShowCreate] = React.useState(false);
  const [viewGrade, setViewGrade] = React.useState<Grade | null>(null);
  const [editGradeItem, setEditGradeItem] = React.useState<Grade | null>(null);
  const [deletingGrade, setDeletingGrade] = React.useState<Grade | null>(null);
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
  }, [defaultCompanyId, companyId]);

  const { data: grades, isLoading, error } = useQuery({
    queryKey: ['organization', 'grades', companyId],
    enabled: !!companyId,
    queryFn: () => getGrades(companyId),
  });

  // ── Create ──
  const createMutation = useMutation({
    mutationFn: createGrade,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] as const });
      setShowCreate(false);
      createForm.reset({ companyId, gradeName: '', gradeCode: '', minSalary: undefined, maxSalary: undefined, sortOrder: 0 });
      toast('Grade created successfully.');
    },
    onError: (err) => toastError(apiErrorMsg(err, 'Failed to create grade.')),
  });

  const createForm = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { companyId: '', gradeName: '', gradeCode: '', minSalary: undefined, maxSalary: undefined, sortOrder: 0 },
  });

  React.useEffect(() => {
    if (companyId) createForm.reset((prev) => ({ ...prev, companyId }));
  }, [companyId, createForm]);

  const onCreateSubmit = async (values: CreateValues) => {
    await createMutation.mutateAsync({ ...values, minSalary: values.minSalary || undefined, maxSalary: values.maxSalary || undefined, sortOrder: values.sortOrder || 0 });
  };

  // ── Edit ──
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EditValues }) => updateGrade(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] as const });
      setEditGradeItem(null);
      toast('Grade updated successfully.');
    },
    onError: (err) => toastError(apiErrorMsg(err, 'Failed to update grade.')),
  });

  const editForm = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { gradeName: '', minSalary: undefined, maxSalary: undefined, sortOrder: 0, status: 'Active' },
  });

  React.useEffect(() => {
    if (editGradeItem) {
      editForm.reset({
        gradeName: editGradeItem.gradeName,
        minSalary: editGradeItem.minSalary ?? undefined,
        maxSalary: editGradeItem.maxSalary ?? undefined,
        sortOrder: editGradeItem.sortOrder ?? 0,
        status: editGradeItem.status ?? 'Active',
      });
    }
  }, [editGradeItem, editForm]);

  const onEditSubmit = async (values: EditValues) => {
    if (!editGradeItem) return;
    await updateMutation.mutateAsync({ id: editGradeItem.id, payload: values });
  };

  // ── Delete ──
  const deleteMutation = useMutation({
    mutationFn: deleteGrade,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] as const });
      setDeletingGrade(null);
      toast('Grade deleted successfully.');
    },
    onError: (err) => {
      setDeletingGrade(null);
      toastError(apiErrorMsg(err, 'Failed to delete grade.'));
    },
  });

  const filtered = (grades ?? []).filter(
    (g: Grade) =>
      g.gradeName?.toLowerCase().includes(search.toLowerCase()) ||
      g.gradeCode?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Grades"
        subtitle="Manage grade levels and salary bands used by designations and payroll."
        actions={
          <Button onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Add Grade
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
              placeholder="Search grades..."
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
          <div className="p-8 text-center text-danger">Unable to load grades.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Grade Name</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Code</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Min CTC</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Max CTC</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Sort</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((grade: Grade) => (
                  <tr key={grade.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{grade.gradeName}</td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">{grade.gradeCode}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{grade.minSalary ? formatCurrency(grade.minSalary) : '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{grade.maxSalary ? formatCurrency(grade.maxSalary) : '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{grade.sortOrder ?? '—'}</td>
                    <td className="px-4 py-3"><Badge variant={statusVariant(grade.status)}>{grade.status ?? 'Active'}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button aria-label="View" title="View" onClick={() => setViewGrade(grade)} className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600">
                          <Eye size={14} />
                        </button>
                        <button aria-label="Edit" title="Edit" onClick={() => setEditGradeItem(grade)} className="rounded-lg p-1.5 text-gray-400 hover:bg-amber-50 hover:text-amber-600">
                          <Edit size={14} />
                        </button>
                        <button aria-label="Delete" title="Delete" onClick={() => setDeletingGrade(grade)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">No grades found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Delete Confirm ── */}
      <ConfirmDialog
        open={!!deletingGrade}
        onClose={() => setDeletingGrade(null)}
        onConfirm={() => deletingGrade && deleteMutation.mutate(deletingGrade.id)}
        title={`Delete "${deletingGrade?.gradeName}"?`}
        message="Designations using this grade will lose their grade reference."
        confirmLabel="Delete Grade"
        loading={deleteMutation.isPending}
      />

      {/* ── Create Modal ── */}
      <Modal
        open={showCreate}
        onClose={() => { setShowCreate(false); createForm.reset({ companyId, gradeName: '', gradeCode: '', minSalary: undefined, maxSalary: undefined, sortOrder: 0 }); }}
        title="Add Grade"
        size="md"
        footer={
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" form="create-grade-form" loading={createMutation.isPending}>Save Grade</Button>
          </div>
        }
      >
        {!companyId ? (
          <div className="rounded-xl bg-yellow-50 p-4 text-sm text-yellow-800">Select a company in the filter above before adding grades.</div>
        ) : (
          <form id="create-grade-form" onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
            <Input label="Grade Name *" {...createForm.register('gradeName')} placeholder="e.g. L3 — Mid" error={createForm.formState.errors.gradeName?.message} />
            <Input label="Grade Code *" {...createForm.register('gradeCode')} placeholder="e.g. L3" error={createForm.formState.errors.gradeCode?.message} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Min CTC (₹)" type="number" {...createForm.register('minSalary', { valueAsNumber: true })} />
              <Input label="Max CTC (₹)" type="number" {...createForm.register('maxSalary', { valueAsNumber: true })} />
            </div>
            <Input label="Sort Order" type="number" {...createForm.register('sortOrder', { valueAsNumber: true })} />
            {createMutation.error && <p className="text-sm text-danger">Unable to create grade.</p>}
          </form>
        )}
      </Modal>

      {/* ── View Modal ── */}
      <Modal open={!!viewGrade} onClose={() => setViewGrade(null)} title={viewGrade?.gradeName ?? ''}>
        {viewGrade && (
          <dl className="space-y-1">
            <DetailRow label="Grade Code" value={viewGrade.gradeCode} />
            <DetailRow label="Min CTC" value={viewGrade.minSalary ? formatCurrency(viewGrade.minSalary) : undefined} />
            <DetailRow label="Max CTC" value={viewGrade.maxSalary ? formatCurrency(viewGrade.maxSalary) : undefined} />
            <DetailRow label="Sort Order" value={viewGrade.sortOrder} />
            <DetailRow label="Status" value={viewGrade.status} />
          </dl>
        )}
      </Modal>

      {/* ── Edit Modal ── */}
      <Modal
        open={!!editGradeItem}
        onClose={() => setEditGradeItem(null)}
        title={`Edit — ${editGradeItem?.gradeName ?? ''}`}
        footer={
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setEditGradeItem(null)}>Cancel</Button>
            <Button type="submit" form="edit-grade-form" loading={updateMutation.isPending}>Save Changes</Button>
          </div>
        }
      >
        <form id="edit-grade-form" onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
          <Input label="Grade Name *" {...editForm.register('gradeName')} error={editForm.formState.errors.gradeName?.message} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Min CTC (₹)" type="number" {...editForm.register('minSalary', { valueAsNumber: true })} />
            <Input label="Max CTC (₹)" type="number" {...editForm.register('maxSalary', { valueAsNumber: true })} />
          </div>
          <Input label="Sort Order" type="number" {...editForm.register('sortOrder', { valueAsNumber: true })} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select {...editForm.register('status')} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          {updateMutation.error && <p className="text-sm text-danger">Failed to update grade.</p>}
        </form>
      </Modal>
    </div>
  );
}
