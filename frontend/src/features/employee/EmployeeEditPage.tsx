import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Input, Select, Spinner } from '@components/ui/Input';
import { getCompanies, getBranches, getDepartments, getDesignations, getGrades } from '@features/organization/organization.api';
import { getEmployee, updateEmployee } from './employee.api';
import { PageHeader } from '@components/ui/PageHeader';

// ── Schema ────────────────────────────────────────────────────────────────────

const EMPLOYEE_TYPES = ['Permanent', 'Probation', 'Contract', 'Consultant', 'Intern', 'Apprentice', 'Daily wage', 'Temporary', 'Third-party labor', 'Retainer'] as const;
const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'] as const;
const MARITAL_STATUSES = ['Single', 'Married', 'Divorced', 'Widowed'] as const;
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
const EMPLOYMENT_STATUSES = ['Active', 'Probation', 'Confirmed', 'Resigned', 'Terminated', 'Suspended', 'Exited'] as const;

const editSchema = z.object({
  // Personal
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  gender: z.enum(GENDERS).optional(),
  dateOfBirth: z.string().optional(),
  maritalStatus: z.enum(MARITAL_STATUSES).optional(),
  bloodGroup: z.string().optional(),
  nationality: z.string().optional(),
  fatherName: z.string().optional(),
  spouseName: z.string().optional(),
  // Contact
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit mobile'),
  email: z.string().email('Invalid email'),
  alternateMobile: z.string().optional(),
  presentAddress: z.string().optional(),
  permanentAddress: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactNumber: z.string().optional(),
  emergencyRelationship: z.string().optional(),
  // Employment
  employeeType: z.enum(EMPLOYEE_TYPES).optional(),
  employmentStatus: z.enum(EMPLOYMENT_STATUSES).optional(),
  branchId: z.string().optional(),
  departmentId: z.string().optional(),
  designationId: z.string().optional(),
  gradeId: z.string().optional(),
  probationMonths: z.coerce.number().optional(),
  noticePeriodDays: z.coerce.number().optional(),
  dateOfJoining: z.string().optional(),
  confirmationDate: z.string().optional(),
});

type EditFormValues = z.infer<typeof editSchema>;

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

export default function EmployeeEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = React.useState('');

  const { data: emp, isLoading } = useQuery({
    queryKey: ['employees', id],
    queryFn: () => getEmployee(id!),
    enabled: !!id,
  });

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
  });

  // Derive companyId from employee data (snake_case or camelCase)
  const empCompanyId = (emp as any)?.company_id ?? emp?.companyId ?? '';
  const companyId = empCompanyId;

  // Pre-fill form when employee loads
  React.useEffect(() => {
    if (!emp) return;
    const e = emp as any;
    reset({
      firstName: e.first_name ?? emp.firstName ?? '',
      middleName: e.middle_name ?? emp.middleName ?? '',
      lastName: e.last_name ?? emp.lastName ?? '',
      gender: e.gender ?? '',
      dateOfBirth: (e.date_of_birth ?? emp.dateOfBirth ?? '').slice(0, 10),
      maritalStatus: e.marital_status ?? emp.maritalStatus ?? '',
      bloodGroup: e.blood_group ?? emp.bloodGroup ?? '',
      nationality: e.nationality ?? '',
      fatherName: e.father_name ?? emp.fatherName ?? '',
      spouseName: e.spouse_name ?? emp.spouseName ?? '',
      mobile: emp.mobile ?? '',
      email: emp.email ?? '',
      alternateMobile: e.alternate_mobile ?? emp.alternateMobile ?? '',
      presentAddress: e.present_address ?? emp.presentAddress ?? '',
      permanentAddress: e.permanent_address ?? emp.permanentAddress ?? '',
      emergencyContactName: e.emergency_contact_name ?? emp.emergencyContactName ?? '',
      emergencyContactNumber: e.emergency_contact_number ?? emp.emergencyContactNumber ?? '',
      emergencyRelationship: e.emergency_relationship ?? emp.emergencyRelationship ?? '',
      dateOfJoining: (e.date_of_joining ?? emp.dateOfJoining ?? '').slice(0, 10),
      employeeType: (e.employment_type ?? emp.employeeType ?? '') as any,
      employmentStatus: (e.employment_status ?? emp.employmentStatus ?? '') as any,
      branchId: e.branch_id ?? emp.branchId ?? '',
      departmentId: e.department_id ?? emp.departmentId ?? '',
      designationId: e.designation_id ?? emp.designationId ?? '',
      gradeId: e.grade_id ?? emp.gradeId ?? '',
      probationMonths: e.probation_months ?? emp.probationMonths ?? 6,
      noticePeriodDays: e.notice_period_days ?? emp.noticePeriodDays ?? 30,
      confirmationDate: (e.confirmation_date ?? emp.confirmationDate ?? '').slice(0, 10),
    });
  }, [emp, reset]);

  // Org selectors
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
    mutationFn: (data: EditFormValues) => updateEmployee(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees', id] as const });
      queryClient.invalidateQueries({ queryKey: ['employees'] as const });
      navigate(`/employees/${id}`);
    },
    onError: (err: any) => {
      setServerError(err.response?.data?.error?.message || 'Failed to update employee');
    },
  });

  if (isLoading) return <Spinner />;
  if (!emp) return (
    <div className="p-8 text-center text-danger">Employee not found.</div>
  );

  const branchOpts = (branches ?? []).map((b) => ({ value: b.id, label: b.branchName }));
  const deptOpts = (departments ?? []).map((d) => ({ value: d.id, label: d.departmentName }));
  const desigOpts = (designations ?? []).map((d) => ({ value: d.id, label: d.designationName }));
  const gradeOpts = (grades ?? []).map((g) => ({ value: g.id, label: g.gradeName }));

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(`/employees/${id}`)}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Employee</h1>
          <p className="text-gray-500 mt-0.5">{emp.fullName} · {emp.employeeCode}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
        {serverError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-danger">{serverError}</div>
        )}

        <div className="space-y-6">
          {/* Personal */}
          <Section title="Personal Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input label="First Name *" error={errors.firstName?.message} {...register('firstName')} />
              <Input label="Middle Name" {...register('middleName')} />
              <Input label="Last Name *" error={errors.lastName?.message} {...register('lastName')} />
              <Select label="Gender" options={GENDERS.map((g) => ({ value: g, label: g }))} {...register('gender')} />
              <Input label="Date of Birth" type="date" {...register('dateOfBirth')} />
              <Select label="Marital Status" options={MARITAL_STATUSES.map((m) => ({ value: m, label: m }))} {...register('maritalStatus')} />
              <Select label="Blood Group" options={BLOOD_GROUPS.map((b) => ({ value: b, label: b }))} {...register('bloodGroup')} />
              <Input label="Nationality" {...register('nationality')} />
              <Input label="Father's Name" {...register('fatherName')} />
              <Input label="Spouse Name" {...register('spouseName')} />
            </div>
          </Section>

          {/* Contact */}
          <Section title="Contact Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Mobile *" type="tel" placeholder="+91, 10-digit starting with 6–9" error={errors.mobile?.message} {...register('mobile')} />
              <Input label="Email *" type="email" error={errors.email?.message} {...register('email')} />
              <Input label="Alternate Mobile" type="tel" placeholder="+91, 10-digit starting with 6–9" {...register('alternateMobile')} />
              <div className="sm:col-span-2">
                <Input label="Present Address" {...register('presentAddress')} />
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
              <Input label="Date of Joining" type="date" {...register('dateOfJoining')} />
              <Select
                label="Employee Type"
                options={EMPLOYEE_TYPES.map((t) => ({ value: t, label: t }))}
                {...register('employeeType')}
              />
              <Select
                label="Employment Status"
                options={EMPLOYMENT_STATUSES.map((s) => ({ value: s, label: s }))}
                {...register('employmentStatus')}
              />
              <Select label="Branch" options={branchOpts} {...register('branchId')} />
              <Select label="Department" options={deptOpts} {...register('departmentId')} />
              <Select label="Designation" options={desigOpts} {...register('designationId')} />
              <Select label="Grade" options={gradeOpts} {...register('gradeId')} />
              <Input label="Probation Period (months)" type="number" {...register('probationMonths')} />
              <Input label="Notice Period (days)" type="number" {...register('noticePeriodDays')} />
              <Input label="Confirmation Date" type="date" {...register('confirmationDate')} />
            </div>
          </Section>
        </div>

        <div className="flex gap-3 mt-6">
          <Button type="submit" loading={mutation.isPending} size="lg">Save Changes</Button>
          <Button type="button" variant="secondary" size="lg" onClick={() => navigate(`/employees/${id}`)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
