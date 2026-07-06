import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { Plus, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Badge, Spinner, Input, Select } from '@components/ui/Input';
import { PageHeader } from '@components/ui/PageHeader';
import { Modal } from '@components/ui/Modal';
import { ConfirmDialog } from '@components/ui/ConfirmDialog';
import { useToast } from '@components/ui/Toast';
import { getDepartments, getBranches, getCompanies, createDepartment, updateDepartment, deleteDepartment } from './organization.api';
import type { Branch, Company, Department } from '@types';

const createSchema = z.object({
  companyId:           z.string().min(1, 'Select a company'),
  branchId:            z.string().optional(),
  parentDepartmentId:  z.string().optional(),
  departmentName:      z.string().min(2, 'Enter department name'),
  departmentCode:      z.string().min(2, 'Enter department code').max(50),
});

const editSchema = z.object({
  departmentName:     z.string().min(2, 'Enter department name'),
  parentDepartmentId: z.string().optional().nullable(),
  branchId:           z.string().optional().nullable(),
  status:             z.enum(['Active', 'Inactive']).optional(),
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

export default function OrganizationDepartmentsPage() {
  const [search,       setSearch]       = React.useState('');
  const [showForm,     setShowForm]     = React.useState(false);
  const [viewDept,     setViewDept]     = React.useState<Department | null>(null);
  const [editDept,     setEditDept]     = React.useState<Department | null>(null);
  const [deletingDept, setDeletingDept] = React.useState<Department | null>(null);
  const queryClient = useQueryClient();
  const { toast, toastError } = useToast();

  const { data: companies } = useQuery({
    queryKey: ['organization', 'companies', 'list'],
    queryFn:  () => getCompanies({ page: 1, limit: 100 }),
  });

  const defaultCompanyId = companies?.data?.[0]?.id ?? '';
  const [companyId, setCompanyId] = React.useState('');
  React.useEffect(() => {
    if (!companyId && defaultCompanyId) setCompanyId(defaultCompanyId);
  }, [defaultCompanyId, companyId]);

  const { data: departments, isLoading: loadingDepartments, error: deptError } = useQuery({
    queryKey: ['organization', 'departments', companyId],
    enabled:  !!companyId,
    queryFn:  () => getDepartments(companyId),
  });

  const { data: branches } = useQuery({
    queryKey: ['organization', 'branches', companyId],
    enabled:  !!companyId,
    queryFn:  () => getBranches(companyId),
  });

  // ── Create ──
  const createMutation = useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] as const });
      setShowForm(false);
      toast('Department created successfully.');
    },
    onError: (err) => toastError(apiErrorMsg(err, 'Failed to create department.')),
  });

  const createForm = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { companyId: '', branchId: undefined, parentDepartmentId: undefined, departmentName: '', departmentCode: '' },
  });

  React.useEffect(() => {
    if (companyId) createForm.reset((prev) => ({ ...prev, companyId }));
  }, [companyId, createForm]);

  const onCreateSubmit = async (values: CreateValues) => {
    await createMutation.mutateAsync({
      ...values,
      branchId:           values.branchId           || undefined,
      parentDepartmentId: values.parentDepartmentId || undefined,
    });
    createForm.reset({ companyId, branchId: undefined, parentDepartmentId: undefined, departmentName: '', departmentCode: '' });
  };

  // ── Edit ──
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EditValues }) => updateDepartment(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] as const });
      setEditDept(null);
      toast('Department updated successfully.');
    },
    onError: (err) => toastError(apiErrorMsg(err, 'Failed to update department.')),
  });

  const editForm = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { departmentName: '', parentDepartmentId: null, branchId: null, status: 'Active' },
  });

  React.useEffect(() => {
    if (editDept) {
      editForm.reset({
        departmentName:     editDept.departmentName,
        parentDepartmentId: editDept.parentDepartmentId ?? null,
        branchId:           editDept.branchId ?? null,
        status:             (editDept.status as 'Active' | 'Inactive') ?? 'Active',
      });
    }
  }, [editDept, editForm]);

  const onEditSubmit = async (values: EditValues) => {
    if (!editDept) return;
    await updateMutation.mutateAsync({
      id: editDept.id,
      payload: {
        ...values,
        parentDepartmentId: values.parentDepartmentId || null,
        branchId:           values.branchId           || null,
      },
    });
  };

  // ── Delete ──
  const deleteMutation = useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] as const });
      setDeletingDept(null);
      toast('Department deleted successfully.');
    },
    onError: (err) => {
      setDeletingDept(null);
      toastError(apiErrorMsg(err, 'Failed to delete department.'));
    },
  });

  const deptMap = React.useMemo(
    () => new Map((departments ?? []).map((d: Department) => [d.id, d.departmentName])),
    [departments]
  );
  const branchMap = React.useMemo(
    () => new Map((branches ?? []).map((b: Branch) => [b.id, b.branchName])),
    [branches]
  );

  const filtered = (departments ?? []).filter(
    (d: Department) =>
      d.departmentName?.toLowerCase().includes(search.toLowerCase()) ||
      d.departmentCode?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Departments"
        subtitle="Organize departments and reporting hierarchies."
        actions={
          <Button onClick={() => setShowForm(true)}>
            <Plus size={16} /> Add Department
          </Button>
        }
      />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search departments…"
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
            {!companies && <option value="">Loading…</option>}
            {companies?.data.map((c: Company) => <option key={c.id} value={c.id}>{c.companyName}</option>)}
          </select>
        </div>

        {loadingDepartments ? <Spinner /> : deptError ? (
          <div className="p-8 text-center text-danger">Unable to load departments.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {['Department', 'Code', 'Branch', 'Parent', 'Level', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((dept: Department) => (
                  <tr key={dept.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {/* Indentation indicator for sub-departments — no special chars */}
                      {dept.level && dept.level > 0 ? (
                        <span
                          className="inline-block border-l-2 border-gray-200 mr-2"
                          style={{ marginLeft: (dept.level - 1) * 12 }}
                        />
                      ) : null}
                      {dept.departmentName}
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-600">{dept.departmentCode}</td>
                    <td className="px-4 py-3 text-gray-600">{branchMap.get(dept.branchId ?? '') ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{dept.parentDepartmentId ? (deptMap.get(dept.parentDepartmentId) ?? '—') : '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{dept.level ?? 0}</td>
                    <td className="px-4 py-3"><Badge variant={statusVariant(dept.status)}>{dept.status ?? 'Active'}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button aria-label="View"   onClick={() => setViewDept(dept)}     className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50  hover:text-blue-600"><Eye    size={14} /></button>
                        <button aria-label="Edit"   onClick={() => setEditDept(dept)}     className="rounded-lg p-1.5 text-gray-400 hover:bg-amber-50 hover:text-amber-600"><Edit   size={14} /></button>
                        <button aria-label="Delete" onClick={() => setDeletingDept(dept)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50   hover:text-red-600"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">No departments found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Delete Confirm ── */}
      <ConfirmDialog
        open={!!deletingDept}
        onClose={() => setDeletingDept(null)}
        onConfirm={() => deletingDept && deleteMutation.mutate(deletingDept.id)}
        title={`Delete "${deletingDept?.departmentName}"?`}
        message="Sub-departments and employees linked to this department may be affected."
        confirmLabel="Delete Department"
        loading={deleteMutation.isPending}
      />

      {/* ── Create Modal ── */}
      <Modal
        open={showForm}
        onClose={() => { setShowForm(false); createForm.reset({ companyId, branchId: undefined, parentDepartmentId: undefined, departmentName: '', departmentCode: '' }); }}
        title="Add Department"
        size="md"
        footer={
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" form="create-dept-form" loading={createMutation.isPending}>Save Department</Button>
          </div>
        }
      >
        {!companyId ? (
          <div className="rounded-xl bg-yellow-50 p-4 text-sm text-yellow-800">Select a company before adding departments.</div>
        ) : (
          <form id="create-dept-form" onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
            <Select
              label="Branch"
              options={[
                { value: '', label: 'No specific branch (company-wide)' },
                ...(branches ?? []).map((b: Branch) => ({ value: b.id, label: b.branchName })),
              ]}
              {...createForm.register('branchId')}
            />
            <Select
              label="Parent Department"
              options={[
                { value: '', label: 'None (top-level department)' },
                ...(departments ?? []).map((d: Department) => ({ value: d.id, label: d.departmentName })),
              ]}
              {...createForm.register('parentDepartmentId')}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Department Name *"
                placeholder="e.g. Engineering"
                {...createForm.register('departmentName')}
                error={createForm.formState.errors.departmentName?.message}
              />
              <Input
                label="Department Code *"
                placeholder="e.g. ENG"
                {...createForm.register('departmentCode')}
                error={createForm.formState.errors.departmentCode?.message}
              />
            </div>
          </form>
        )}
      </Modal>

      {/* ── View Modal ── */}
      <Modal open={!!viewDept} onClose={() => setViewDept(null)} title={viewDept?.departmentName ?? ''}>
        {viewDept && (
          <dl className="space-y-1">
            <DetailRow label="Department Code" value={viewDept.departmentCode} />
            <DetailRow label="Branch"          value={branchMap.get(viewDept.branchId ?? '')} />
            <DetailRow label="Parent"          value={viewDept.parentDepartmentId ? (deptMap.get(viewDept.parentDepartmentId) ?? viewDept.parentDepartmentId) : undefined} />
            <DetailRow label="Level"           value={viewDept.level} />
            <DetailRow label="Status"          value={viewDept.status ?? 'Active'} />
          </dl>
        )}
      </Modal>

      {/* ── Edit Modal ── */}
      <Modal
        open={!!editDept}
        onClose={() => setEditDept(null)}
        title={`Edit — ${editDept?.departmentName ?? ''}`}
        footer={
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setEditDept(null)}>Cancel</Button>
            <Button type="submit" form="edit-dept-form" loading={updateMutation.isPending}>Save Changes</Button>
          </div>
        }
      >
        <form id="edit-dept-form" onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
          <Input
            label="Department Name *"
            placeholder="e.g. Engineering"
            {...editForm.register('departmentName')}
            error={editForm.formState.errors.departmentName?.message}
          />
          <Controller
            control={editForm.control}
            name="parentDepartmentId"
            render={({ field }) => (
              <Select
                label="Parent Department"
                options={[
                  { value: '', label: 'None (top-level)' },
                  ...(departments ?? [])
                    .filter((d: Department) => d.id !== editDept?.id)
                    .map((d: Department) => ({ value: d.id, label: d.departmentName })),
                ]}
                value={field.value ?? ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
              />
            )}
          />
          <Controller
            control={editForm.control}
            name="branchId"
            render={({ field }) => (
              <Select
                label="Branch"
                options={[
                  { value: '', label: 'No specific branch' },
                  ...(branches ?? []).map((b: Branch) => ({ value: b.id, label: b.branchName })),
                ]}
                value={field.value ?? ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
              />
            )}
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
