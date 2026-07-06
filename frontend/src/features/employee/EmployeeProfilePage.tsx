import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  User, Briefcase, Shield, Landmark, FileText, Users,
  Edit, ArrowLeft, ChevronDown, Calendar, Phone, Mail, MapPin, AlertCircle,
} from 'lucide-react';
import { Badge, Spinner } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { Modal } from '@components/ui/Modal';
import { Select } from '@components/ui/Input';
import { formatDate } from '@lib/utils';
import { getEmployee, changeEmployeeStatus } from './employee.api';
import type { EmployeeDetail } from './employee.api';

// ── normalizeEmployee ────────────────────────────────────────────────────────
// The API may return snake_case or camelCase depending on the serializer.
// This helper coerces everything to camelCase so the rest of the file is clean.

function n(snake: string | null | undefined, camel: string | null | undefined): string | null | undefined {
  return camel ?? snake ?? undefined;
}

function normalizeEmployee(emp: EmployeeDetail) {
  const r = emp as any;
  return {
    // identity
    fullName: emp.fullName,
    employeeCode: emp.employeeCode,
    mobile: emp.mobile,
    email: emp.email,
    // personal
    firstName: n(r.first_name, emp.firstName),
    middleName: n(r.middle_name, emp.middleName),
    lastName: n(r.last_name, emp.lastName),
    gender: r.gender,
    dateOfBirth: n(r.date_of_birth, emp.dateOfBirth),
    maritalStatus: n(r.marital_status, emp.maritalStatus),
    bloodGroup: n(r.blood_group, emp.bloodGroup),
    nationality: r.nationality,
    fatherName: n(r.father_name, emp.fatherName),
    spouseName: n(r.spouse_name, emp.spouseName),
    // contact
    alternateMobile: n(r.alternate_mobile, emp.alternateMobile),
    presentAddress: n(r.present_address, emp.presentAddress),
    permanentAddress: n(r.permanent_address, emp.permanentAddress),
    emergencyContactName: n(r.emergency_contact_name, emp.emergencyContactName),
    emergencyContactNumber: n(r.emergency_contact_number, emp.emergencyContactNumber),
    emergencyRelationship: n(r.emergency_relationship, emp.emergencyRelationship),
    // employment
    dateOfJoining: n(r.date_of_joining, emp.dateOfJoining),
    employeeType: n(r.employment_type, emp.employeeType) ?? (r as any).employmentType,
    employmentStatus: n(r.employment_status, emp.employmentStatus) ?? '',
    confirmationDate: n(r.confirmation_date, emp.confirmationDate),
    probationMonths: r.probation_months ?? emp.probationMonths,
    noticePeriodDays: r.notice_period_days ?? emp.noticePeriodDays,
    // relations
    branch: emp.branch,
    department: emp.department,
    designation: emp.designation,
    grade: emp.grade,
    reportingManager: emp.reportingManager,
    // nested
    statutoryDetails: emp.statutoryDetails,
    bankDetails: emp.bankDetails,
    documents: emp.documents,
    familyMembers: emp.familyMembers,
  };
}

type NormalizedEmployee = ReturnType<typeof normalizeEmployee>;

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = ['Active', 'Probation', 'Confirmed', 'Resigned', 'Terminated', 'Suspended', 'Exited'];

function safeDate(v?: string | null): string {
  if (!v) return '—';
  try { return formatDate(v); } catch { return v; }
}

function statusVariant(s: string): 'success' | 'warning' | 'danger' | 'info' | 'default' {
  switch (s) {
    case 'Active':
    case 'Confirmed': return 'success';
    case 'Probation': return 'info';
    case 'Resigned':
    case 'Terminated':
    case 'Exited': return 'danger';
    case 'Suspended': return 'warning';
    default: return 'default';
  }
}

function DetailRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="py-3 grid grid-cols-2 gap-4 border-b border-gray-50 last:border-0">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-sm font-medium text-gray-900 break-words">
        {value ?? <span className="text-gray-400 font-normal">—</span>}
      </dd>
    </div>
  );
}

function SectionCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {title && <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">{title}</h3>}
      <dl>{children}</dl>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 p-8 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500">
      <AlertCircle size={18} />
      <span>{message}</span>
    </div>
  );
}

// ── Tab definitions ───────────────────────────────────────────────────────────

type TabId = 'personal' | 'employment' | 'statutory' | 'bank' | 'documents' | 'family';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'personal',   label: 'Personal',   icon: <User size={15} /> },
  { id: 'employment', label: 'Employment', icon: <Briefcase size={15} /> },
  { id: 'statutory',  label: 'Statutory',  icon: <Shield size={15} /> },
  { id: 'bank',       label: 'Bank',       icon: <Landmark size={15} /> },
  { id: 'documents',  label: 'Documents',  icon: <FileText size={15} /> },
  { id: 'family',     label: 'Family',     icon: <Users size={15} /> },
];

// ── Tab content ───────────────────────────────────────────────────────────────

function PersonalTab({ emp }: { emp: NormalizedEmployee }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <SectionCard title="Basic Info">
        <DetailRow label="Full Name"       value={emp.fullName} />
        <DetailRow label="First Name"      value={emp.firstName} />
        <DetailRow label="Middle Name"     value={emp.middleName} />
        <DetailRow label="Last Name"       value={emp.lastName} />
        <DetailRow label="Gender"          value={emp.gender} />
        <DetailRow label="Date of Birth"   value={safeDate(emp.dateOfBirth)} />
        <DetailRow label="Marital Status"  value={emp.maritalStatus} />
        <DetailRow label="Blood Group"     value={emp.bloodGroup} />
        <DetailRow label="Nationality"     value={emp.nationality} />
        <DetailRow label="Father's Name"   value={emp.fatherName} />
        <DetailRow label="Spouse Name"     value={emp.spouseName} />
      </SectionCard>

      <SectionCard title="Contact">
        <DetailRow label="Mobile"              value={emp.mobile} />
        <DetailRow label="Email"               value={emp.email} />
        <DetailRow label="Alternate Mobile"    value={emp.alternateMobile} />
        <DetailRow label="Present Address"     value={emp.presentAddress} />
        <DetailRow label="Permanent Address"   value={emp.permanentAddress} />
        <DetailRow label="Emergency Contact"   value={emp.emergencyContactName} />
        <DetailRow label="Emergency Number"    value={emp.emergencyContactNumber} />
        <DetailRow label="Emergency Relation"  value={emp.emergencyRelationship} />
      </SectionCard>
    </div>
  );
}

function EmploymentTab({ emp }: { emp: NormalizedEmployee }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <SectionCard title="Employment">
        <DetailRow label="Employee Code"       value={emp.employeeCode} />
        <DetailRow label="Date of Joining"     value={safeDate(emp.dateOfJoining)} />
        <DetailRow label="Employee Type"       value={emp.employeeType} />
        <DetailRow label="Status"              value={
          <Badge variant={statusVariant(emp.employmentStatus)}>{emp.employmentStatus}</Badge>
        } />
        <DetailRow label="Confirmation Date"   value={safeDate(emp.confirmationDate)} />
        <DetailRow label="Probation (months)"  value={emp.probationMonths} />
        <DetailRow label="Notice Period (days)" value={emp.noticePeriodDays} />
      </SectionCard>

      <SectionCard title="Organisation">
        <DetailRow label="Branch"             value={emp.branch?.branchName} />
        <DetailRow label="Department"         value={emp.department?.departmentName} />
        <DetailRow label="Designation"        value={emp.designation?.designationName} />
        <DetailRow label="Grade"              value={emp.grade?.gradeName} />
        <DetailRow label="Reporting Manager"  value={emp.reportingManager?.fullName} />
      </SectionCard>
    </div>
  );
}

function StatutoryTab({ emp }: { emp: NormalizedEmployee }) {
  const s = emp.statutoryDetails as any;
  if (!s) return <EmptyState message="No statutory details recorded yet." />;
  return (
    <SectionCard title="Statutory Details">
      <DetailRow label="Aadhaar"              value={s.aadhaarMasked ?? s.aadhaar_masked ?? '—'} />
      <DetailRow label="PAN"                  value={s.panMasked ?? s.pan_masked ?? '—'} />
      <DetailRow label="UAN"                  value={s.uan ?? '—'} />
      <DetailRow label="PF Number"            value={s.pfNumber ?? s.pf_number ?? '—'} />
      <DetailRow label="ESI IP Number"        value={s.esiIpNumber ?? s.esi_ip_number ?? '—'} />
      <DetailRow label="PT Applicable"        value={(s.ptApplicable ?? s.pt_applicable) ? 'Yes' : 'No'} />
      <DetailRow label="LWF Applicable"       value={(s.lwfApplicable ?? s.lwf_applicable) ? 'Yes' : 'No'} />
      <DetailRow label="Gratuity Applicable"  value={(s.gratuityApplicable ?? s.gratuity_applicable) ? 'Yes' : 'No'} />
    </SectionCard>
  );
}

function BankTab({ emp }: { emp: NormalizedEmployee }) {
  const banks = emp.bankDetails ?? [];
  if (banks.length === 0) return <EmptyState message="No bank details recorded yet." />;
  return (
    <div className="space-y-4">
      {banks.map((b: any, i: number) => (
        <SectionCard key={b.id ?? i} title={`Bank Account${(b.isPrimary ?? b.is_primary) ? ' (Primary)' : ''}`}>
          <DetailRow label="Bank Name"        value={b.bankName ?? b.bank_name} />
          <DetailRow label="Account Number"   value={b.accountNumberMasked ?? b.account_number_masked} />
          <DetailRow label="IFSC Code"        value={b.ifsc} />
          <DetailRow label="Account Holder"   value={b.accountHolderName ?? b.account_holder_name} />
          <DetailRow label="Payment Mode"     value={b.paymentMode ?? b.payment_mode} />
        </SectionCard>
      ))}
    </div>
  );
}

function DocumentsTab({ emp }: { emp: NormalizedEmployee }) {
  const docs = emp.documents ?? [];
  if (docs.length === 0) return <EmptyState message="No documents uploaded yet." />;
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Document Type</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">File Name</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Uploaded</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {docs.map((d: any, i: number) => (
            <tr key={d.id ?? i} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium">{d.documentType ?? d.document_type}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{d.fileName ?? d.file_name}</td>
              <td className="px-4 py-3 text-sm text-gray-500">{safeDate(d.uploadedAt ?? d.uploaded_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

function FamilyTab({ emp }: { emp: NormalizedEmployee }) {
  const members = emp.familyMembers ?? [];
  if (members.length === 0) return <EmptyState message="No family/nominee details recorded yet." />;
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Relation</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">DOB</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Nominee</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Share %</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {members.map((m: any, i: number) => {
            const isNominee = m.nomineeFlag ?? m.nominee_flag;
            const share = m.nomineePercentage ?? m.nominee_percentage;
            return (
              <tr key={m.id ?? i} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium">{m.familyMemberName ?? m.family_member_name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{m.relation}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{safeDate(m.dateOfBirth ?? m.date_of_birth)}</td>
                <td className="px-4 py-3">
                  {isNominee ? <Badge variant="success">Yes</Badge> : <span className="text-sm text-gray-400">No</span>}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{share != null ? `${share}%` : '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function EmployeeProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<TabId>('personal');
  const [statusModal, setStatusModal] = React.useState(false);
  const [newStatus, setNewStatus] = React.useState('');
  const [statusReason, setStatusReason] = React.useState('');

  const { data: rawEmp, isLoading, isError } = useQuery({
    queryKey: ['employees', id],
    queryFn: () => getEmployee(id!),
    enabled: !!id,
  });

  const emp = rawEmp ? normalizeEmployee(rawEmp) : null;

  const statusMutation = useMutation({
    mutationFn: ({ status, reason }: { status: string; reason: string }) =>
      changeEmployeeStatus(id!, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees', id] as const });
      queryClient.invalidateQueries({ queryKey: ['employees'] as const });
      setStatusModal(false);
      setNewStatus('');
      setStatusReason('');
    },
  });

  if (isLoading) return <Spinner />;
  if (isError || !emp) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <AlertCircle size={40} className="text-danger" />
        <p className="text-gray-600">Failed to load employee profile.</p>
        <Button variant="secondary" onClick={() => navigate('/employees')}>
          <ArrowLeft size={15} /> Back to Employees
        </Button>
      </div>
    );
  }

  const tabContent: Record<TabId, React.ReactNode> = {
    personal:   <PersonalTab emp={emp} />,
    employment: <EmploymentTab emp={emp} />,
    statutory:  <StatutoryTab emp={emp} />,
    bank:       <BankTab emp={emp} />,
    documents:  <DocumentsTab emp={emp} />,
    family:     <FamilyTab emp={emp} />,
  };

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/employees')}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg flex-shrink-0">
              {emp.fullName?.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{emp.fullName}</h1>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="text-sm text-gray-500 font-mono">{emp.employeeCode}</span>
                <span className="text-gray-300">•</span>
                <span className="text-sm text-gray-500">{emp.designation?.designationName ?? '—'}</span>
                <span className="text-gray-300">•</span>
                <span className="text-sm text-gray-500">{emp.department?.departmentName ?? '—'}</span>
                <Badge variant={statusVariant(emp.employmentStatus)}>{emp.employmentStatus}</Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => { setNewStatus(emp.employmentStatus); setStatusModal(true); }}
          >
            <ChevronDown size={14} /> Change Status
          </Button>
          <Link to={`/employees/${id}/edit`}>
            <Button size="sm">
              <Edit size={14} /> Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Quick info bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { icon: <Calendar size={14} />, label: 'Joined', value: safeDate(emp.dateOfJoining) },
          { icon: <Phone size={14} />,    label: 'Mobile', value: emp.mobile },
          { icon: <Mail size={14} />,     label: 'Email',  value: emp.email },
          { icon: <MapPin size={14} />,   label: 'Branch', value: emp.branch?.branchName ?? '—' },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-xl border border-gray-200 px-4 py-3">
            <div className="flex items-center gap-1.5 text-gray-400 mb-1">
              {item.icon}
              <span className="text-xs">{item.label}</span>
            </div>
            <p className="text-sm font-medium text-gray-900 truncate">{item.value ?? '—'}</p>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        <div className="p-6">{tabContent[activeTab]}</div>
      </div>

      {/* ── Status change modal ── */}
      <Modal
        open={statusModal}
        onClose={() => setStatusModal(false)}
        title="Change Employment Status"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setStatusModal(false)}>Cancel</Button>
            <Button
              loading={statusMutation.isPending}
              disabled={!newStatus || newStatus === emp.employmentStatus}
              onClick={() => statusMutation.mutate({ status: newStatus, reason: statusReason })}
            >
              Update Status
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="New Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            options={[
              { value: '', label: 'Select status...' },
              ...STATUS_OPTIONS.map((s) => ({ value: s, label: s })),
            ]}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
            <textarea
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              rows={3}
              placeholder="Enter reason for status change..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          {statusMutation.isError && (
            <p className="text-sm text-danger">Failed to update status. Please try again.</p>
          )}
        </div>
      </Modal>
    </div>
  );
}
