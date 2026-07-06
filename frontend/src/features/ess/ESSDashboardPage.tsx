import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User, Clock, Calendar, FileText, Banknote, BookOpen,
  HelpCircle, Bell, ChevronRight, Users, Download, Upload,
  CheckCircle, AlertCircle, LayoutDashboard,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@components/ui/Button';
import { Input, Select, Badge, Spinner } from '@components/ui/Input';
import { formatDate } from '@lib/utils';
import api from '@lib/axios';
import { PageHeader } from '@components/ui/PageHeader';

// ── Helpers ───────────────────────────────────────────────────────────────────

function safeDate(v?: string | null) {
  if (!v) return '—';
  try { return formatDate(v); } catch { return v; }
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'dashboard',  label: 'Dashboard',      icon: LayoutDashboard },
  { key: 'profile',    label: 'My Profile',      icon: User },
  { key: 'payslips',   label: 'Payslips',        icon: Banknote },
  { key: 'documents',  label: 'Documents',       icon: FileText },
  { key: 'team',       label: 'Team Directory',  icon: Users },
  { key: 'notifs',     label: 'Notifications',   icon: Bell },
];

// ── Dashboard tab ─────────────────────────────────────────────────────────────

const QUICK_LINKS = [
  { label: 'My Attendance',  icon: Clock,     path: '/attendance',  color: 'bg-purple-500' },
  { label: 'Apply Leave',    icon: Calendar,  path: '/leave',       color: 'bg-green-500' },
  { label: 'My Payslips',    icon: Banknote,  path: '#payslips',    color: 'bg-orange-500' },
  { label: 'My Documents',   icon: FileText,  path: '#documents',   color: 'bg-pink-500' },
  { label: 'Policies',       icon: BookOpen,  path: '/policies',    color: 'bg-teal-500' },
  { label: 'Helpdesk',       icon: HelpCircle, path: '/operations', color: 'bg-red-500' },
];

function DashboardTab({ onTab }: { onTab: (t: string) => void }) {
  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: async () => { const { data } = await api.get('/auth/me'); return data.data; },
  });

  const { data: myLeaves } = useQuery({
    queryKey: ['my-leaves-ess'],
    queryFn: async () => { const { data } = await api.get('/leaves/my/all?status=Pending&limit=5'); return data.data ?? []; },
  });

  const { data: payslips } = useQuery({
    queryKey: ['my-payslips-ess'],
    queryFn: async () => { const { data } = await api.get('/payroll/my-payslips?limit=1'); return data.data ?? []; },
  });

  const firstName = profile?.fullName?.split(' ')[0] ?? profile?.email?.split('@')[0] ?? 'Employee';
  const pendingLeaves: any[] = myLeaves?.filter((l: any) => l.status === 'Pending') ?? [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary to-primary-light rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold">Welcome back, {firstName}!</h2>
        <p className="opacity-80 mt-1 text-sm">{safeDate(new Date().toISOString())} · Employee Self Service</p>
        {profile && (
          <div className="mt-3 flex flex-wrap gap-4 text-sm opacity-90">
            <span>{profile.employeeCode ?? profile.email}</span>
            {profile.designation && <span>· {profile.designation}</span>}
            {profile.department && <span>· {profile.department}</span>}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {QUICK_LINKS.map(link => {
            const I = link.icon;
            const isTab = link.path.startsWith('#');
            return isTab ? (
              <button
                key={link.label}
                onClick={() => onTab(link.path.slice(1))}
                className="bg-white rounded-xl border border-gray-200 p-3 hover:shadow-md transition-shadow text-center"
              >
                <div className={`${link.color} w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-2`}>
                  <I size={18} className="text-white" />
                </div>
                <p className="text-xs font-medium text-gray-700">{link.label}</p>
              </button>
            ) : (
              <Link
                key={link.label}
                to={link.path}
                className="bg-white rounded-xl border border-gray-200 p-3 hover:shadow-md transition-shadow text-center"
              >
                <div className={`${link.color} w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-2`}>
                  <I size={18} className="text-white" />
                </div>
                <p className="text-xs font-medium text-gray-700">{link.label}</p>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pending Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold mb-3">Pending Actions</h3>
          <div className="space-y-2">
            {pendingLeaves.length > 0 && (
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <AlertCircle size={16} className="text-yellow-600 shrink-0" />
                <span className="text-sm">{pendingLeaves.length} leave request(s) pending approval</span>
                <ChevronRight size={14} className="ml-auto text-gray-400" />
              </div>
            )}
            {pendingLeaves.length === 0 && (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle size={16} className="text-green-600" />
                <span className="text-sm">No pending actions — you're all caught up!</span>
              </div>
            )}
          </div>
        </div>

        {/* Latest Payslip */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold mb-3">Latest Payslip</h3>
          {payslips?.[0] ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{payslips[0].payPeriod ?? payslips[0].pay_period ?? 'Recent'}</p>
                <p className="text-sm text-gray-500">Net: ₹{Number(payslips[0].netPay ?? payslips[0].net_pay ?? 0).toLocaleString()}</p>
              </div>
              <Button size="sm" variant="ghost"><Download size={14} /> Download</Button>
            </div>
          ) : (
            <p className="text-sm text-gray-400">No payslips yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── My Profile tab ────────────────────────────────────────────────────────────

const profileSchema = z.object({
  phone: z.string().optional(),
  personalEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
});

function ProfileTab() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = React.useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: async () => { const { data } = await api.get('/auth/me'); return data.data; },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(profileSchema) });

  React.useEffect(() => {
    if (profile && editing) {
      reset({
        phone: profile.phone ?? '',
        personalEmail: profile.personalEmail ?? profile.personal_email ?? '',
        address: profile.address ?? '',
        emergencyContactName: profile.emergencyContactName ?? profile.emergency_contact_name ?? '',
        emergencyContactPhone: profile.emergencyContactPhone ?? profile.emergency_contact_phone ?? '',
      });
    }
  }, [profile, editing]);

  const saveMutation = useMutation({
    mutationFn: (d: any) => api.put(`/employees/${profile?.employeeId ?? profile?.id}`, d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['my-profile'] }); setEditing(false); },
  });

  if (isLoading) return <Spinner />;

  const p = profile ?? {};

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {!editing
          ? <Button size="sm" onClick={() => setEditing(true)}><User size={14} /> Edit Profile</Button>
          : <div className="flex gap-2">
              <Button size="sm" onClick={handleSubmit(d => saveMutation.mutate(d))} loading={saveMutation.isPending}>Save</Button>
              <Button size="sm" variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
        }
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        {/* Avatar + name */}
        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
            {(p.fullName ?? p.email ?? '?')[0].toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">{p.fullName ?? '—'}</p>
            <p className="text-sm text-gray-500">{p.designation ?? '—'} · {p.department ?? '—'}</p>
            <p className="text-xs text-gray-400">{p.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Employee Code" value={p.employeeCode ?? p.employee_code} />
          <Field label="Company" value={p.companyName ?? p.company_name} />
          <Field label="Branch" value={p.branchName ?? p.branch_name} />
          <Field label="Department" value={p.department} />
          <Field label="Designation" value={p.designation} />
          <Field label="Date of Joining" value={safeDate(p.dateOfJoining ?? p.date_of_joining)} />
          <Field label="Employment Type" value={p.employmentType ?? p.employment_type} />
          <Field label="Work Email" value={p.email} />

          {editing ? (
            <>
              <Input label="Phone" {...register('phone')} error={errors.phone?.message as string} />
              <Input label="Personal Email" {...register('personalEmail')} error={errors.personalEmail?.message as string} />
              <div className="sm:col-span-2">
                <Input label="Address" {...register('address')} error={errors.address?.message as string} />
              </div>
              <Input label="Emergency Contact Name" {...register('emergencyContactName')} />
              <Input label="Emergency Contact Phone" {...register('emergencyContactPhone')} />
            </>
          ) : (
            <>
              <Field label="Phone" value={p.phone} />
              <Field label="Personal Email" value={p.personalEmail ?? p.personal_email} />
              <Field label="Address" value={p.address} className="sm:col-span-2" />
              <Field label="Emergency Contact" value={p.emergencyContactName ?? p.emergency_contact_name} />
              <Field label="Emergency Phone" value={p.emergencyContactPhone ?? p.emergency_contact_phone} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, className = '' }: { label: string; value?: any; className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value ?? '—'}</p>
    </div>
  );
}

// ── Payslips tab ──────────────────────────────────────────────────────────────

function PayslipsTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-payslips'],
    queryFn: async () => { const { data } = await api.get('/payroll/my-payslips?limit=24'); return data.data ?? []; },
  });

  const payslips: any[] = data ?? [];

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-3">
      {payslips.map((ps: any) => (
        <div key={ps.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
          <div>
            <p className="font-semibold text-gray-900">{ps.payPeriod ?? ps.pay_period}</p>
            <div className="flex gap-4 mt-1 text-xs text-gray-500">
              <span>Gross: ₹{Number(ps.grossPay ?? ps.gross_pay ?? 0).toLocaleString()}</span>
              <span>Deductions: ₹{Number(ps.totalDeductions ?? ps.total_deductions ?? 0).toLocaleString()}</span>
              <span className="font-semibold text-gray-700">Net: ₹{Number(ps.netPay ?? ps.net_pay ?? 0).toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={ps.status === 'Paid' ? 'success' : 'warning'}>{ps.status ?? 'Processed'}</Badge>
            <Button size="sm" variant="ghost"><Download size={14} /> PDF</Button>
          </div>
        </div>
      ))}
      {payslips.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
          <Banknote size={36} className="mx-auto mb-3 text-gray-300" />
          <p>No payslips available yet</p>
        </div>
      )}
    </div>
  );
}

// ── Documents tab ─────────────────────────────────────────────────────────────

const DOC_TYPES = [
  { value: 'PAN', label: 'PAN Card' },
  { value: 'Aadhaar', label: 'Aadhaar Card' },
  { value: 'Passport', label: 'Passport' },
  { value: 'DrivingLicense', label: 'Driving License' },
  { value: 'EducationCertificate', label: 'Education Certificate' },
  { value: 'ExperienceLetter', label: 'Experience Letter' },
  { value: 'Other', label: 'Other' },
];

function DocumentsTab() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = React.useState(false);

  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: async () => { const { data } = await api.get('/auth/me'); return data.data; },
  });

  const empId = profile?.employeeId ?? profile?.id;

  const { data, isLoading } = useQuery({
    queryKey: ['my-docs', empId],
    enabled: !!empId,
    queryFn: async () => { const { data } = await api.get(`/employees/${empId}/documents`); return data.data ?? []; },
  });

  const { register, handleSubmit, reset } = useForm();

  const uploadMutation = useMutation({
    mutationFn: (d: any) => api.post(`/employees/${empId}/documents`, d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['my-docs'] }); reset(); setShowForm(false); },
  });

  const docs: any[] = data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowForm(v => !v)}>
          <Upload size={14} /> Upload Document
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <form onSubmit={handleSubmit(d => uploadMutation.mutate(d))} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select label="Document Type" options={DOC_TYPES} {...register('documentType')} />
            <Input label="Document Number" {...register('documentNumber')} />
            <Input label="Expiry Date" type="date" {...register('expiryDate')} />
            <div className="sm:col-span-3 flex gap-3">
              <Button type="submit" size="sm" loading={uploadMutation.isPending}>Save</Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => { reset(); setShowForm(false); }}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? <Spinner /> : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Number</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Expiry</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {docs.map((d: any) => (
                <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium">{d.documentType ?? d.document_type}</td>
                  <td className="px-4 py-3 font-mono text-xs">{d.documentNumber ?? d.document_number ?? '—'}</td>
                  <td className="px-4 py-3">{safeDate(d.expiryDate ?? d.expiry_date)}</td>
                  <td className="px-4 py-3"><Badge variant={d.status === 'Verified' ? 'success' : 'warning'}>{d.status ?? 'Uploaded'}</Badge></td>
                </tr>
              ))}
              {docs.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-12 text-center text-sm text-gray-400">No records found.</td></tr>
              )}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Team Directory tab ────────────────────────────────────────────────────────

function TeamTab() {
  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: async () => { const { data } = await api.get('/auth/me'); return data.data; },
  });

  const dept = profile?.department;

  const { data, isLoading } = useQuery({
    queryKey: ['team-dir', dept],
    queryFn: async () => {
      const params = dept ? `?department=${encodeURIComponent(dept)}&limit=50` : '?limit=50';
      const { data } = await api.get(`/employees${params}`);
      return data.data ?? [];
    },
  });

  const team: any[] = data ?? [];

  if (isLoading) return <Spinner />;

  return (
    <div>
      {dept && <p className="text-sm text-gray-500 mb-4">Showing your department: <span className="font-medium text-gray-700">{dept}</span></p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {team.map((emp: any) => (
          <div key={emp.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 hover:shadow-sm transition-shadow">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
              {(emp.fullName ?? emp.full_name ?? '?')[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-gray-900 truncate">{emp.fullName ?? emp.full_name}</p>
              <p className="text-xs text-gray-500 truncate">{emp.designation ?? '—'}</p>
              <p className="text-xs text-gray-400 truncate">{emp.email}</p>
            </div>
          </div>
        ))}
        {team.length === 0 && (
          <div className="col-span-3 bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
            <Users size={36} className="mx-auto mb-3 text-gray-300" />
            <p>No team members found</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Notifications tab ─────────────────────────────────────────────────────────

function NotificationsTab() {
  const { data: myLeaves } = useQuery({
    queryKey: ['my-leaves-notifs'],
    queryFn: async () => { const { data } = await api.get('/leaves/my/all?limit=10'); return data.data ?? []; },
  });

  const leaves: any[] = myLeaves ?? [];

  // Build notification items from recent leave activity
  const notifications = leaves.map((l: any) => ({
    id: l.id,
    type: l.status === 'Approved' ? 'success' : l.status === 'Rejected' ? 'danger' : 'info',
    message: `Leave request (${l.leaveType ?? l.leave_type}) ${l.status === 'Pending' ? 'submitted and pending approval' : l.status.toLowerCase()}`,
    date: l.updatedAt ?? l.created_at ?? l.fromDate ?? l.from_date,
  }));

  return (
    <div className="space-y-3">
      {notifications.map((n: any) => (
        <div key={n.id} className={`flex items-start gap-3 p-4 rounded-xl border ${
          n.type === 'success' ? 'bg-green-50 border-green-200' :
          n.type === 'danger'  ? 'bg-red-50 border-red-200' :
                                 'bg-blue-50 border-blue-200'
        }`}>
          {n.type === 'success' ? <CheckCircle size={16} className="text-green-600 mt-0.5 shrink-0" /> :
           n.type === 'danger'  ? <AlertCircle size={16} className="text-red-600 mt-0.5 shrink-0" /> :
                                  <Bell size={16} className="text-blue-600 mt-0.5 shrink-0" />}
          <div>
            <p className="text-sm font-medium text-gray-900">{n.message}</p>
            <p className="text-xs text-gray-500 mt-0.5">{safeDate(n.date)}</p>
          </div>
        </div>
      ))}
      {notifications.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
          <Bell size={36} className="mx-auto mb-3 text-gray-300" />
          <p>No notifications</p>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ESSDashboardPage() {
  const [tab, setTab] = React.useState('dashboard');

  return (
    <div>
      <PageHeader title="Employee Self Service" subtitle="Your personal HR portal" />

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg flex-wrap">
        {TABS.map(t => {
          const I = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${
                tab === t.key ? 'bg-white shadow text-primary' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <I size={14} />{t.label}
            </button>
          );
        })}
      </div>

      {tab === 'dashboard' && <DashboardTab onTab={setTab} />}
      {tab === 'profile'   && <ProfileTab />}
      {tab === 'payslips'  && <PayslipsTab />}
      {tab === 'documents' && <DocumentsTab />}
      {tab === 'team'      && <TeamTab />}
      {tab === 'notifs'    && <NotificationsTab />}
    </div>
  );
}
