import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Plus, Search, Eye, Edit, Building2, MapPin, Phone, Globe, CreditCard } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Badge, Spinner, Input, Select } from '@components/ui/Input';
import { PageHeader } from '@components/ui/PageHeader';
import { Modal } from '@components/ui/Modal';
import { cn } from '@lib/utils';
import { getCompanies, createCompany, updateCompany } from './organization.api';
import type { Company } from '@types';

const statusVariant = (status: string): 'success' | 'danger' | 'info' | 'default' => {
  if (status === 'Active') return 'success';
  if (status === 'Inactive') return 'danger';
  return 'info';
};

// ── Schemas ─────────────────────────────────────────────────────────────────

const companySchema = z.object({
  companyName: z.string().min(2, 'Enter company name'),
  legalName: z.string().min(2, 'Enter legal name'),
  companyCode: z
    .string()
    .min(2, 'Enter company code')
    .regex(/^[A-Z0-9_-]+$/, 'Uppercase letters, numbers, hyphens and underscores only'),
  registeredAddress: z.string().min(5, 'Enter registered address'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number')
    .optional()
    .or(z.literal('')),
  website: z.string().url('Invalid URL — include https://').optional().or(z.literal('')),
  pan: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'PAN format: ABCDE1234F (5 letters · 4 digits · 1 letter)')
    .optional()
    .or(z.literal('')),
  gstin: z
    .string()
    .regex(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      'GSTIN format: 22ABCDE1234F1Z5'
    )
    .optional()
    .or(z.literal('')),
  tan: z
    .string()
    .regex(/^[A-Z]{4}[0-9]{5}[A-Z]{1}$/, 'TAN format: ABCD12345E (4 letters · 5 digits · 1 letter)')
    .optional()
    .or(z.literal('')),
  cin: z.string().optional().or(z.literal('')),
  corporateAddress: z.string().optional().or(z.literal('')),
  financialYearStartMonth: z.string().optional(),
  payrollCycle: z.string().optional(),
});

const editSchema = companySchema.extend({ status: z.string().optional() });

type CompanyFormValues = z.infer<typeof companySchema>;
type EditFormValues = z.infer<typeof editSchema>;

// ── Helpers ─────────────────────────────────────────────────────────────────

const FY_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const PAYROLL_CYCLES = ['Monthly','Bi-weekly','Weekly'];

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="grid grid-cols-3 gap-2 py-2 border-b border-gray-50 last:border-0">
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
      <dd className="col-span-2 text-sm text-gray-800">{value || <span className="text-gray-400 italic">—</span>}</dd>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function OrganizationCompaniesPage() {
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [viewCompany, setViewCompany] = React.useState<Company | null>(null);
  const [editCompany, setEditCompany] = React.useState<Company | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['organization', 'companies', search, status],
    queryFn: () => getCompanies({ search, status, page: 1, limit: 50 }),
  });

  // ── Create ──
  const createMutation = useMutation({
    mutationFn: createCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] as const });
      setShowCreateForm(false);
      createForm.reset();
    },
  });

  const createForm = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: { companyName: '', legalName: '', companyCode: '', registeredAddress: '', email: '', phone: '', website: '', pan: '', gstin: '', tan: '', cin: '', corporateAddress: '', financialYearStartMonth: 'April', payrollCycle: 'Monthly' },
  });

  const onCreateSubmit = async (values: CompanyFormValues) => {
    await createMutation.mutateAsync({
      ...values,
      email: values.email || undefined,
      phone: values.phone || undefined,
      website: values.website || undefined,
      pan: values.pan || undefined,
      gstin: values.gstin || undefined,
      tan: values.tan || undefined,
      cin: values.cin || undefined,
      corporateAddress: values.corporateAddress || undefined,
    } as Partial<Company>);
  };

  // ── Edit ──
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Company> }) => updateCompany(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] as const });
      setEditCompany(null);
    },
  });

  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { companyName: '', legalName: '', companyCode: '', registeredAddress: '', email: '', phone: '', website: '', pan: '', gstin: '', tan: '', cin: '', corporateAddress: '', financialYearStartMonth: 'April', payrollCycle: 'Monthly', status: 'Active' },
  });

  React.useEffect(() => {
    if (editCompany) {
      editForm.reset({
        companyName: editCompany.companyName ?? '',
        legalName: editCompany.legalName ?? '',
        companyCode: editCompany.companyCode ?? '',
        registeredAddress: (editCompany as any).registeredAddress ?? '',
        email: (editCompany as any).email ?? '',
        phone: (editCompany as any).phone ?? '',
        website: (editCompany as any).website ?? '',
        pan: editCompany.pan ?? '',
        gstin: editCompany.gstin ?? '',
        tan: (editCompany as any).tan ?? '',
        cin: (editCompany as any).cin ?? '',
        corporateAddress: (editCompany as any).corporateAddress ?? '',
        financialYearStartMonth: (editCompany as any).financialYearStartMonth ?? 'April',
        payrollCycle: (editCompany as any).payrollCycle ?? 'Monthly',
        status: editCompany.status ?? 'Active',
      });
    }
  }, [editCompany, editForm]);

  const onEditSubmit = async (values: EditFormValues) => {
    if (!editCompany) return;
    await updateMutation.mutateAsync({
      id: editCompany.id,
      payload: {
        ...values,
        email: values.email || undefined,
        phone: values.phone || undefined,
        website: values.website || undefined,
        pan: values.pan || undefined,
        gstin: values.gstin || undefined,
        tan: values.tan || undefined,
        cin: values.cin || undefined,
        corporateAddress: values.corporateAddress || undefined,
      } as Partial<Company>,
    });
  };

  return (
    <div>
      <PageHeader
        title="Companies"
        subtitle="Manage companies for your HRMS tenant."
        actions={
          <Button onClick={() => setShowCreateForm((v) => !v)}>
            <Plus size={16} />
            {showCreateForm ? 'Hide Form' : 'Add Company'}
          </Button>
        }
      />

      {/* ── Create Form ── */}
      {showCreateForm && (
        <form
          onSubmit={createForm.handleSubmit(onCreateSubmit)}
          className="mb-6 bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
        >
          <h2 className="text-base font-semibold text-gray-800 mb-4">New Company</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Input label="Company Name *" {...createForm.register('companyName')} error={createForm.formState.errors.companyName?.message} />
            <Input label="Legal Name *" {...createForm.register('legalName')} error={createForm.formState.errors.legalName?.message} />
            <Input label="Company Code *" {...createForm.register('companyCode')} placeholder="e.g. ACME" error={createForm.formState.errors.companyCode?.message} />
            <Input label="Registered Address *" {...createForm.register('registeredAddress')} error={createForm.formState.errors.registeredAddress?.message} />
            <Input label="Email" type="email" {...createForm.register('email')} error={createForm.formState.errors.email?.message} />
            <Input label="Phone" {...createForm.register('phone')} placeholder="10-digit mobile" />
            <Input label="Website" type="url" {...createForm.register('website')} placeholder="https://" />
            <Input label="PAN" {...createForm.register('pan')} placeholder="ABCDE1234F" error={createForm.formState.errors.pan?.message} />
            <Input label="GSTIN" {...createForm.register('gstin')} placeholder="22ABCDE1234F1Z5" error={createForm.formState.errors.gstin?.message} />
            <Input label="TAN" {...createForm.register('tan')} placeholder="ABCD12345E" error={createForm.formState.errors.tan?.message} />
            <Input label="CIN" {...createForm.register('cin')} placeholder="L12345MH1999PLC123456" />
            <Input label="Corporate Address" {...createForm.register('corporateAddress')} />
            <Select
              label="Financial Year Start"
              options={FY_MONTHS.map((m) => ({ value: m, label: m }))}
              {...createForm.register('financialYearStartMonth')}
            />
            <Select
              label="Payroll Cycle"
              options={PAYROLL_CYCLES.map((c) => ({ value: c, label: c }))}
              {...createForm.register('payrollCycle')}
            />
          </div>
          <div className="mt-5 flex items-center gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => { createForm.reset(); setShowCreateForm(false); }}>Cancel</Button>
            <Button type="submit" loading={createMutation.isPending}>Save Company</Button>
          </div>
          {createMutation.error && (
            <p className="mt-3 text-sm text-danger">
              {(createMutation.error as any)?.response?.data?.error?.message ||
               (createMutation.error as any)?.message ||
               'Failed to create company. Please try again.'}
            </p>
          )}
        </form>
      )}

      {/* ── Table (filter bar integrated — Pattern B) ── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 sm:w-40"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        {isLoading ? (
          <Spinner />
        ) : error ? (
          <div className="p-8 text-center text-danger">Failed to load companies.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Code</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Company Name</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Legal Name</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">PAN</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data?.data.map((company: Company) => (
                  <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono font-medium text-primary">{company.companyCode}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{company.companyName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{company.legalName}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{company.pan || <span className="text-gray-300">—</span>}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant(company.status ?? '')}>{company.status ?? 'Unknown'}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          title="View details"
                          onClick={() => setViewCompany(company)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          title="Edit company"
                          onClick={() => setEditCompany(company)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                        >
                          <Edit size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {data?.data.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center">
                      <Building2 size={32} className="mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-500">No companies found.</p>
                      <button
                        onClick={() => setShowCreateForm(true)}
                        className="mt-2 text-sm text-primary hover:underline"
                      >
                        Create your first company
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── View Modal ── */}
      <Modal open={!!viewCompany} onClose={() => setViewCompany(null)} title={viewCompany?.companyName ?? ''} size="lg">
        {viewCompany && (
          <dl className="space-y-1">
            <DetailRow label="Company Code" value={viewCompany.companyCode} />
            <DetailRow label="Legal Name" value={viewCompany.legalName} />
            <DetailRow label="Status" value={viewCompany.status} />
            <DetailRow label="PAN" value={viewCompany.pan} />
            <DetailRow label="GSTIN" value={viewCompany.gstin} />
            <DetailRow label="Registered Address" value={(viewCompany as any).registeredAddress} />
            <DetailRow label="Corporate Address" value={(viewCompany as any).corporateAddress} />
            <DetailRow label="Email" value={(viewCompany as any).email} />
            <DetailRow label="Phone" value={(viewCompany as any).phone} />
            <DetailRow label="Website" value={(viewCompany as any).website} />
            <DetailRow label="TAN" value={(viewCompany as any).tan} />
            <DetailRow label="CIN" value={(viewCompany as any).cin} />
            <DetailRow label="FY Start Month" value={(viewCompany as any).financialYearStartMonth} />
            <DetailRow label="Payroll Cycle" value={(viewCompany as any).payrollCycle} />
            <DetailRow label="PF Reg. No." value={(viewCompany as any).pfRegistrationNumber} />
            <DetailRow label="ESI Reg. No." value={(viewCompany as any).esiRegistrationNumber} />
          </dl>
        )}
      </Modal>

      {/* ── Edit Modal ── */}
      <Modal
        open={!!editCompany}
        onClose={() => setEditCompany(null)}
        title={`Edit — ${editCompany?.companyName ?? ''}`}
        size="lg"
        footer={
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setEditCompany(null)}>Cancel</Button>
            <Button
              type="submit"
              form="edit-company-form"
              loading={updateMutation.isPending}
            >
              Save Changes
            </Button>
          </div>
        }
      >
        <form
          id="edit-company-form"
          onSubmit={editForm.handleSubmit(onEditSubmit)}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <Input label="Company Name *" {...editForm.register('companyName')} error={editForm.formState.errors.companyName?.message} />
          <Input label="Legal Name *" {...editForm.register('legalName')} error={editForm.formState.errors.legalName?.message} />
          <Input label="Company Code *" {...editForm.register('companyCode')} error={editForm.formState.errors.companyCode?.message} />
          <Input label="Registered Address *" {...editForm.register('registeredAddress')} error={editForm.formState.errors.registeredAddress?.message} />
          <Input label="Corporate Address" {...editForm.register('corporateAddress')} />
          <Input label="Email" type="email" {...editForm.register('email')} error={editForm.formState.errors.email?.message} />
          <Input label="Phone" {...editForm.register('phone')} />
          <Input label="Website" {...editForm.register('website')} error={editForm.formState.errors.website?.message} />
          <Input label="PAN" {...editForm.register('pan')} placeholder="ABCDE1234F" error={editForm.formState.errors.pan?.message} />
          <Input label="GSTIN" {...editForm.register('gstin')} placeholder="22ABCDE1234F1Z5" error={editForm.formState.errors.gstin?.message} />
          <Input label="TAN" {...editForm.register('tan')} placeholder="ABCD12345E" error={editForm.formState.errors.tan?.message} />
          <Input label="CIN" {...editForm.register('cin')} placeholder="L12345MH1999PLC123456" />
          <Select
            label="Financial Year Start"
            options={FY_MONTHS.map((m) => ({ value: m, label: m }))}
            {...editForm.register('financialYearStartMonth')}
          />
          <Select
            label="Payroll Cycle"
            options={PAYROLL_CYCLES.map((c) => ({ value: c, label: c }))}
            {...editForm.register('payrollCycle')}
          />
          <Select
            label="Status"
            options={[{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }]}
            {...editForm.register('status')}
          />
          {updateMutation.error && (
            <p className="col-span-2 text-sm text-danger">
              {(updateMutation.error as any)?.response?.data?.error?.message ||
               (updateMutation.error as any)?.message ||
               'Failed to update company. Please try again.'}
            </p>
          )}
        </form>
      </Modal>
    </div>
  );
}
