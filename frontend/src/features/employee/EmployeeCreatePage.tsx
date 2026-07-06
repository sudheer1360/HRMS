import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@components/ui/Button';
import { Input, Select } from '@components/ui/Input';
import { PageHeader } from '@components/ui/PageHeader';
import api from '@lib/axios';
import { getCompanies, getBranches, getDepartments, getDesignations, getGrades } from '@features/organization/organization.api';

// ── Schema ────────────────────────────────────────────────────────────────────

const EMPLOYEE_TYPES = ['Permanent', 'Probation', 'Contract', 'Consultant', 'Intern', 'Apprentice', 'Daily wage', 'Temporary', 'Third-party labor', 'Retainer'] as const;
const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'] as const;
const MARITAL_STATUSES = ['Single', 'Married', 'Divorced', 'Widowed'] as const;
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
const PAYMENT_MODES = ['Bank Transfer', 'Cheque', 'Cash'] as const;

const employeeSchema = z.object({
  companyId: z.string().min(1, 'Company is required'),
  // Personal
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  gender: z.enum(GENDERS),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  maritalStatus: z.enum(MARITAL_STATUSES).optional(),
  bloodGroup: z.string().optional(),
  nationality: z.string().optional(),
  fatherName: z.string().optional(),
  spouseName: z.string().optional(),
  // Contact
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit mobile'),
  email: z.string().email('Invalid email'),
  alternateMobile: z.string().regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit mobile').optional().or(z.literal('')),
  presentAddress: z.string().min(5, 'Address is required'),
  permanentAddress: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactNumber: z.string().optional(),
  emergencyRelationship: z.string().optional(),
  // Employment
  dateOfJoining: z.string().min(1, 'Date of joining is required'),
  employeeType: z.enum(EMPLOYEE_TYPES),
  branchId: z.string().min(1, 'Branch is required'),
  departmentId: z.string().min(1, 'Department is required'),
  designationId: z.string().min(1, 'Designation is required'),
  gradeId: z.string().optional(),
  probationMonths: z.coerce.number().optional(),
  noticePeriodDays: z.coerce.number().optional(),
  // Statutory
  aadhaar: z.string().regex(/^\d{12}$/, 'Must be 12 digits').optional().or(z.literal('')),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format').optional().or(z.literal('')),
  uan: z.string().optional(),
  pfNumber: z.string().optional(),
  esiIpNumber: z.string().optional(),
  // Bank
  bankName: z.string().optional(),
  accountNumber: z.string().min(9, 'Must be 9–18 digits').optional().or(z.literal('')),
  ifsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC').optional().or(z.literal('')),
  accountHolderName: z.string().optional(),
  paymentMode: z.enum(PAYMENT_MODES).optional(),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

// ── Section wrapper ────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">{title}</h2>
      {children}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function EmployeeCreatePage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = React.useState('');

  const { register, handleSubmit, watch, formState: { errors } } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      employeeType: 'Probation',
      gender: 'Male',
      maritalStatus: 'Single',
      probationMonths: 6,
      noticePeriodDays: 30,
      nationality: 'India',
      paymentMode: 'Bank Transfer',
    },
  });

  const companyId = watch('companyId');

  // Org data
  const { data: companies } = useQuery({
    queryKey: ['organization', 'companies', 'list'],
    queryFn: () => getCompanies({ page: 1, limit: 100 }),
  });

  const { data: branches } = useQuery({
    queryKey: ['organization', 'branches', companyId],
    queryFn: () => getBranches(companyId),
    enabled: !!companyId,
  });

  const { data: departments } = useQuery({
    queryKey: ['organization', 'departments', companyId],
    queryFn: () => getDepartments(companyId),
    enabled: !!companyId,
  });

  const { data: designations } = useQuery({
    queryKey: ['organization', 'designations', companyId],
    queryFn: () => getDesignations(companyId),
    enabled: !!companyId,
  });

  const { data: grades } = useQuery({
    queryKey: ['organization', 'grades', companyId],
    queryFn: () => getGrades(companyId),
    enabled: !!companyId,
  });

  const mutation = useMutation({
    mutationFn: async (data: EmployeeFormValues) => {
      const cleaned = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== '' && v !== undefined));
      const { data: result } = await api.post('/employees', cleaned);
      return result;
    },
    onSuccess: () => navigate('/employees'),
    onError: (err: any) => {
      setServerError(err.response?.data?.error?.message || 'Failed to create employee');
    },
  });

  const branchOpts = (branches ?? []).map((b) => ({ value: b.id, label: b.branchName }));
  const deptOpts = (departments ?? []).map((d) => ({ value: d.id, label: d.departmentName }));
  const desigOpts = (designations ?? []).map((d) => ({ value: d.id, label: d.designationName }));
  const gradeOpts = (grades ?? []).map((g) => ({ value: g.id, label: g.gradeName }));
  const companyOpts = (companies?.data ?? []).map((c) => ({ value: c.id, label: c.companyName }));

  return (
    <div>
      <PageHeader title="Add New Employee" subtitle="Create a new employee record" />

      <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
        {serverError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-danger">{serverError}</div>
        )}

        <div className="space-y-6">
          {/* Company */}
          <Section title="Company">
            <Select
              label="Company *"
              options={companyOpts}
              error={errors.companyId?.message}
              {...register('companyId')}
            />
          </Section>

          {/* Personal */}
          <Section title="Personal Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input label="First Name *" error={errors.firstName?.message} {...register('firstName')} />
              <Input label="Middle Name" {...register('middleName')} />
              <Input label="Last Name *" error={errors.lastName?.message} {...register('lastName')} />
              <Select label="Gender *" options={GENDERS.map((g) => ({ value: g, label: g }))} error={errors.gender?.message} {...register('gender')} />
              <Input label="Date of Birth *" type="date" error={errors.dateOfBirth?.message} {...register('dateOfBirth')} />
              <Select label="Marital Status" options={MARITAL_STATUSES.map((m) => ({ value: m, label: m }))} {...register('maritalStatus')} />
              <Select label="Blood Group" options={BLOOD_GROUPS.map((b) => ({ value: b, label: b }))} {...register('bloodGroup')} />
              <Input label="Nationality" defaultValue="India" {...register('nationality')} />
              <Input label="Father's Name" {...register('fatherName')} />
              <Input label="Spouse Name" {...register('spouseName')} />
            </div>
          </Section>

          {/* Contact */}
          <Section title="Contact Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Mobile *" type="tel" placeholder="+91, 10-digit starting with 6–9" error={errors.mobile?.message} {...register('mobile')} />
              <Input label="Email *" type="email" error={errors.email?.message} {...register('email')} />
              <Input label="Alternate Mobile" type="tel" placeholder="+91, 10-digit starting with 6–9" error={errors.alternateMobile?.message} {...register('alternateMobile')} />
              <div className="sm:col-span-2">
                <Input label="Present Address *" error={errors.presentAddress?.message} {...register('presentAddress')} />
              </div>
              <div className="sm:col-span-2">
                <Input label="Permanent Address" {...register('permanentAddress')} />
              </div>
              <Input label="Emergency Contact Name" {...register('emergencyContactName')} />
              <Input label="Emergency Contact Number" type="tel" {...register('emergencyContactNumber')} />
              <Input label="Emergency Relationship" {...register('emergencyRelationship')} />
            </div>
          </Section>

          {/* Employment */}
          <Section title="Employment Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input label="Date of Joining *" type="date" error={errors.dateOfJoining?.message} {...register('dateOfJoining')} />
              <Select
                label="Employee Type *"
                options={EMPLOYEE_TYPES.map((t) => ({ value: t, label: t }))}
                error={errors.employeeType?.message}
                {...register('employeeType')}
              />
              <Select
                label="Branch *"
                options={branchOpts}
                error={errors.branchId?.message}
                {...register('branchId')}
              />
              <Select
                label="Department *"
                options={deptOpts}
                error={errors.departmentId?.message}
                {...register('departmentId')}
              />
              <Select
                label="Designation *"
                options={desigOpts}
                error={errors.designationId?.message}
                {...register('designationId')}
              />
              <Select
                label="Grade"
                options={gradeOpts}
                {...register('gradeId')}
              />
              <Input label="Probation Period (months)" type="number" {...register('probationMonths')} />
              <Input label="Notice Period (days)" type="number" {...register('noticePeriodDays')} />
            </div>
          </Section>

          {/* Statutory */}
          <Section title="Statutory Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input label="Aadhaar" placeholder="12 digits" error={errors.aadhaar?.message} {...register('aadhaar')} />
              <Input label="PAN" placeholder="AAAAA9999A" error={errors.pan?.message} {...register('pan')} />
              <Input label="UAN" {...register('uan')} />
              <Input label="PF Number" {...register('pfNumber')} />
              <Input label="ESI IP Number" {...register('esiIpNumber')} />
            </div>
          </Section>

          {/* Bank */}
          <Section title="Bank Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input label="Bank Name" {...register('bankName')} />
              <Input label="Account Number" error={errors.accountNumber?.message} {...register('accountNumber')} />
              <Input label="IFSC Code" placeholder="ABCD0123456" error={errors.ifsc?.message} {...register('ifsc')} />
              <Input label="Account Holder Name" {...register('accountHolderName')} />
              <Select
                label="Payment Mode"
                options={PAYMENT_MODES.map((p) => ({ value: p, label: p }))}
                {...register('paymentMode')}
              />
            </div>
          </Section>
        </div>

        <div className="flex gap-3 mt-6 justify-end">
          <Button type="button" variant="secondary" size="lg" onClick={() => navigate('/employees')}>Cancel</Button>
          <Button type="submit" loading={mutation.isPending} size="lg">Create Employee</Button>
        </div>
      </form>
    </div>
  );
}
