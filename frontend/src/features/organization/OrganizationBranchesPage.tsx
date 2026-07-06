import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { Plus, Search, Edit, Eye, Trash2 } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Badge, Spinner, Input, Select } from '@components/ui/Input';
import { PageHeader } from '@components/ui/PageHeader';
import { Modal } from '@components/ui/Modal';
import { ConfirmDialog } from '@components/ui/ConfirmDialog';
import { useToast } from '@components/ui/Toast';
import { getBranches, getCompanies, createBranch, updateBranch, deleteBranch } from './organization.api';
import type { Branch, Company } from '@types';

const BRANCH_TYPES = [
  { value: 'Head Office',     label: 'Head Office' },
  { value: 'Regional Office', label: 'Regional Office' },
  { value: 'Sales Office',    label: 'Sales Office' },
  { value: 'Plant',           label: 'Plant' },
  { value: 'Factory',         label: 'Factory' },
  { value: 'Warehouse',       label: 'Warehouse' },
  { value: 'Site',            label: 'Site' },
];

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh','Puducherry','Chandigarh',
];

const branchSchema = z.object({
  companyId:         z.string().min(1, 'Select a company'),
  branchName:        z.string().min(2, 'Enter branch name'),
  branchCode:        z.string().min(2, 'Enter branch code').max(50),
  branchType:        z.enum(['Head Office', 'Regional Office', 'Sales Office', 'Plant', 'Factory', 'Warehouse', 'Site']),
  address:           z.string().min(5, 'Enter full address'),
  city:              z.string().min(2, 'Enter city'),
  state:             z.string().min(2, 'Select state'),
  country:           z.string().optional(),
  pinCode:           z.string().optional(),
  isPayrollLocation: z.boolean().optional(),
});

const editSchema = z.object({
  branchName:        z.string().min(2, 'Enter branch name'),
  branchType:        z.enum(['Head Office', 'Regional Office', 'Sales Office', 'Plant', 'Factory', 'Warehouse', 'Site']),
  address:           z.string().min(5, 'Enter full address'),
  city:              z.string().min(2, 'Enter city'),
  state:             z.string().min(2, 'Select state'),
  pinCode:           z.string().optional(),
  isPayrollLocation: z.boolean().optional(),
  status:            z.enum(['Active', 'Inactive']).optional(),
});

type BranchFormValues = z.infer<typeof branchSchema>;
type EditFormValues   = z.infer<typeof editSchema>;

function DetailRow({ label, value }: { label: string; value?: string | boolean | null }) {
  const display = value === true ? 'Yes' : value === false ? 'No' : (value as string) || null;
  return (
    <div className="grid grid-cols-3 gap-2 py-2 border-b border-gray-50 last:border-0">
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
      <dd className="col-span-2 text-sm text-gray-800">
        {display ?? <span className="text-gray-400 italic">—</span>}
      </dd>
    </div>
  );
}

const statusVariant = (s?: string): 'success' | 'danger' | 'default' =>
  s === 'Active' ? 'success' : s === 'Inactive' ? 'danger' : 'default';

function apiErrorMsg(err: unknown, fallback: string): string {
  const e = err as any;
  return (
    e?.response?.data?.error?.message ||
    e?.response?.data?.message ||
    e?.message ||
    fallback
  );
}

export default function OrganizationBranchesPage() {
  const [search,         setSearch]         = React.useState('');
  const [showForm,       setShowForm]       = React.useState(false);
  const [viewBranch,     setViewBranch]     = React.useState<Branch | null>(null);
  const [editBranch,     setEditBranch]     = React.useState<Branch | null>(null);
  const [deletingBranch, setDeletingBranch] = React.useState<Branch | null>(null);
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

  const { data: branches, isLoading: loadingBranches, error } = useQuery({
    queryKey: ['organization', 'branches', companyId, search],
    enabled:  !!companyId,
    queryFn:  () => getBranches(companyId),
  });

  // ── Create ──
  const createMutation = useMutation({
    mutationFn: createBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] as const });
      setShowForm(false);
      toast('Branch created successfully.');
    },
    onError: (err) => toastError(apiErrorMsg(err, 'Failed to create branch.')),
  });

  const createForm = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      companyId: '', branchName: '', branchCode: '', branchType: 'Head Office',
      address: '', city: '', state: '', country: 'India', pinCode: '', isPayrollLocation: false,
    },
  });

  React.useEffect(() => {
    if (companyId) createForm.reset((prev) => ({ ...prev, companyId }));
  }, [companyId, createForm]);

  const onCreateSubmit = async (values: BranchFormValues) => {
    await createMutation.mutateAsync({
      ...values,
      pinCode: values.pinCode || undefined,
      country: values.country || undefined,
    });
    createForm.reset({
      companyId, branchName: '', branchCode: '', branchType: 'Head Office',
      address: '', city: '', state: '', country: 'India', pinCode: '', isPayrollLocation: false,
    });
  };

  // ── Edit ──
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Branch> }) => updateBranch(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] as const });
      setEditBranch(null);
      toast('Branch updated successfully.');
    },
    onError: (err) => toastError(apiErrorMsg(err, 'Failed to update branch.')),
  });

  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      branchName: '', branchType: 'Head Office', address: '', city: '',
      state: '', pinCode: '', isPayrollLocation: false, status: 'Active',
    },
  });

  React.useEffect(() => {
    if (editBranch) {
      editForm.reset({
        branchName:        editBranch.branchName,
        branchType:        (editBranch.branchType as EditFormValues['branchType']) || 'office',
        address:           editBranch.address ?? '',
        city:              editBranch.city,
        state:             editBranch.state,
        pinCode:           editBranch.pinCode ?? '',
        isPayrollLocation: editBranch.isPayrollLocation ?? false,
        status:            (editBranch.status as 'Active' | 'Inactive') ?? 'Active',
      });
    }
  }, [editBranch, editForm]);

  const onEditSubmit = async (values: EditFormValues) => {
    if (!editBranch) return;
    await updateMutation.mutateAsync({ id: editBranch.id, payload: values as Partial<Branch> });
  };

  // ── Delete ──
  const deleteMutation = useMutation({
    mutationFn: deleteBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] as const });
      setDeletingBranch(null);
      toast('Branch deleted successfully.');
    },
    onError: (err) => {
      setDeletingBranch(null);
      toastError(apiErrorMsg(err, 'Failed to delete branch.'));
    },
  });

  const filteredBranches = (branches ?? []).filter((b: Branch) =>
    b.branchName?.toLowerCase().includes(search.toLowerCase()) ||
    b.branchCode?.toLowerCase().includes(search.toLowerCase()) ||
    b.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Branches"
        subtitle="Manage branch / plant locations for your companies."
        actions={
          <Button onClick={() => setShowForm(true)}>
            <Plus size={16} /> Add Branch
          </Button>
        }
      />

      {/* ── Table ── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, code or city…"
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
            {companies?.data.map((c: Company) => (
              <option key={c.id} value={c.id}>{c.companyName}</option>
            ))}
          </select>
        </div>

        {loadingBranches ? <Spinner /> : error ? (
          <div className="p-8 text-center text-danger">Unable to load branches.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {['Branch Name', 'Code', 'Type', 'City, State', 'Payroll', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBranches.map((branch: Branch) => (
                  <tr key={branch.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">{branch.branchName}</td>
                    <td className="px-4 py-3 font-mono text-gray-600">{branch.branchCode}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {BRANCH_TYPES.find((t) => t.value === branch.branchType)?.label ?? branch.branchType ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{[branch.city, branch.state].filter(Boolean).join(', ')}</td>
                    <td className="px-4 py-3">
                      {branch.isPayrollLocation ? <Badge variant="success">Yes</Badge> : <Badge>No</Badge>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant(branch.status)}>{branch.status ?? 'Active'}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button aria-label="View"   onClick={() => setViewBranch(branch)}     className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50  hover:text-blue-600"><Eye    size={14} /></button>
                        <button aria-label="Edit"   onClick={() => setEditBranch(branch)}     className="rounded-lg p-1.5 text-gray-400 hover:bg-amber-50 hover:text-amber-600"><Edit   size={14} /></button>
                        <button aria-label="Delete" onClick={() => setDeletingBranch(branch)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50   hover:text-red-600"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredBranches.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">No branches found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Delete Confirm ── */}
      <ConfirmDialog
        open={!!deletingBranch}
        onClose={() => setDeletingBranch(null)}
        onConfirm={() => deletingBranch && deleteMutation.mutate(deletingBranch.id)}
        title={`Delete "${deletingBranch?.branchName}"?`}
        message="This will permanently remove the branch. Employees and departments linked to it may be affected."
        confirmLabel="Delete Branch"
        loading={deleteMutation.isPending}
      />

      {/* ── Create Modal ── */}
      <Modal
        open={showForm}
        onClose={() => { setShowForm(false); createForm.reset({ companyId, branchName: '', branchCode: '', branchType: 'Head Office', address: '', city: '', state: '', country: 'India', pinCode: '', isPayrollLocation: false }); }}
        title="Add Branch"
        size="lg"
        footer={
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" form="create-branch-form" loading={createMutation.isPending}>Save Branch</Button>
          </div>
        }
      >
        {!companyId ? (
          <div className="rounded-xl bg-yellow-50 p-4 text-sm text-yellow-800">Create a company before adding branches.</div>
        ) : (
          <form id="create-branch-form" onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Branch Name *" placeholder="e.g. Hyderabad Head Office" {...createForm.register('branchName')} error={createForm.formState.errors.branchName?.message} />
              <Input label="Branch Code *" placeholder="e.g. HYD001" {...createForm.register('branchCode')} error={createForm.formState.errors.branchCode?.message} />
            </div>
            <Controller
              control={createForm.control}
              name="branchType"
              render={({ field }) => (
                <Select label="Branch Type *" options={BRANCH_TYPES} value={field.value} onChange={field.onChange} onBlur={field.onBlur} name={field.name} />
              )}
            />
            <Input label="Address *" placeholder="Door no, street name, area" {...createForm.register('address')} error={createForm.formState.errors.address?.message} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="City *" placeholder="e.g. Hyderabad" {...createForm.register('city')} error={createForm.formState.errors.city?.message} />
              <Select
                label="State *"
                options={[{ value: '', label: 'Select state…' }, ...INDIAN_STATES.map((s) => ({ value: s, label: s }))]}
                error={createForm.formState.errors.state?.message}
                {...createForm.register('state')}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Country" placeholder="India" {...createForm.register('country')} />
              <Input label="PIN Code" placeholder="e.g. 500032" {...createForm.register('pinCode')} />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" {...createForm.register('isPayrollLocation')} className="rounded border-gray-300 text-primary focus:ring-primary" />
              Mark as Payroll Location
            </label>
          </form>
        )}
      </Modal>

      {/* ── View Modal ── */}
      <Modal open={!!viewBranch} onClose={() => setViewBranch(null)} title={viewBranch?.branchName ?? ''}>
        {viewBranch && (
          <dl className="space-y-1">
            <DetailRow label="Branch Code"      value={viewBranch.branchCode} />
            <DetailRow label="Type"             value={BRANCH_TYPES.find((t) => t.value === viewBranch.branchType)?.label ?? viewBranch.branchType} />
            <DetailRow label="Address"          value={viewBranch.address} />
            <DetailRow label="City"             value={viewBranch.city} />
            <DetailRow label="State"            value={viewBranch.state} />
            <DetailRow label="Country"          value={viewBranch.country} />
            <DetailRow label="PIN Code"         value={viewBranch.pinCode} />
            <DetailRow label="Payroll Location" value={viewBranch.isPayrollLocation} />
            <DetailRow label="Status"           value={viewBranch.status ?? 'Active'} />
          </dl>
        )}
      </Modal>

      {/* ── Edit Modal ── */}
      <Modal
        open={!!editBranch}
        onClose={() => setEditBranch(null)}
        title={`Edit — ${editBranch?.branchName ?? ''}`}
        footer={
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setEditBranch(null)}>Cancel</Button>
            <Button type="submit" form="edit-branch-form" loading={updateMutation.isPending}>Save Changes</Button>
          </div>
        }
      >
        <form id="edit-branch-form" onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
          <Input
            label="Branch Name *"
            placeholder="e.g. Hyderabad Head Office"
            {...editForm.register('branchName')}
            error={editForm.formState.errors.branchName?.message}
          />
          {/* Controller ensures value is controlled — select always reflects current state */}
          <Controller
            control={editForm.control}
            name="branchType"
            render={({ field }) => (
              <Select
                label="Branch Type *"
                options={BRANCH_TYPES}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                error={editForm.formState.errors.branchType?.message}
              />
            )}
          />
          <Input label="Address *" placeholder="Door no, street name, area" {...editForm.register('address')} error={editForm.formState.errors.address?.message} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="City *" placeholder="e.g. Hyderabad" {...editForm.register('city')} error={editForm.formState.errors.city?.message} />
            <Select
              label="State"
              options={[{ value: '', label: 'Select state…' }, ...INDIAN_STATES.map((s) => ({ value: s, label: s }))] }
              {...editForm.register('state')}
            />
          </div>
          <Input label="PIN Code" placeholder="e.g. 500032" {...editForm.register('pinCode')} />
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" {...editForm.register('isPayrollLocation')} className="rounded border-gray-300 text-primary focus:ring-primary" />
            Payroll Location
          </label>
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
