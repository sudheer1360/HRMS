import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  BookOpen, Calendar, Users, Award, Plus, Trash2,
  Check, Star, BarChart2, FileText,
} from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Input, Select, Badge, Spinner } from '@components/ui/Input';
import { formatDate } from '@lib/utils';
import api from '@lib/axios';
import { PageHeader } from '@components/ui/PageHeader';
import { ConfirmDialog } from '@components/ui/ConfirmDialog';

// ── Helpers ───────────────────────────────────────────────────────────────────

function safeDate(v?: string | null) {
  if (!v) return '—';
  try { return formatDate(v); } catch { return v; }
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'programs',  label: 'Programs',      icon: BookOpen },
  { key: 'sessions',  label: 'Sessions',      icon: Calendar },
  { key: 'my',        label: 'My Training',   icon: Users },
  { key: 'skills',    label: 'Skill Matrix',  icon: BarChart2 },
  { key: 'certs',     label: 'Certifications', icon: Award },
];

const CATEGORIES = [
  { value: 'Technical', label: 'Technical' },
  { value: 'Soft Skills', label: 'Soft Skills' },
  { value: 'Compliance', label: 'Compliance' },
  { value: 'Leadership', label: 'Leadership' },
  { value: 'Product', label: 'Product' },
  { value: 'Safety', label: 'Safety' },
  { value: 'Other', label: 'Other' },
];

const DELIVERY_MODES = [
  { value: 'Classroom', label: 'Classroom' },
  { value: 'Online', label: 'Online' },
  { value: 'Blended', label: 'Blended' },
  { value: 'OJT', label: 'On-the-Job' },
];

// ── Programs tab ──────────────────────────────────────────────────────────────

const programSchema = z.object({
  programName: z.string().min(1, 'Required'),
  category: z.string().min(1, 'Required'),
  durationHours: z.coerce.number().min(0.5),
  deliveryMode: z.string().min(1, 'Required'),
  description: z.string().optional(),
  isMandatory: z.string().optional(),
  isCertification: z.string().optional(),
});

function ProgramsTab() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = React.useState(false);
  const [confirmId, setConfirmId] = React.useState<string | null>(null);

  const { data: programs, isLoading } = useQuery({
    queryKey: ['training-programs'],
    queryFn: async () => { const { data } = await api.get('/recruitment/training/programs?limit=50'); return data; },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(programSchema),
    defaultValues: { category: 'Technical', deliveryMode: 'Online', durationHours: 8, isMandatory: 'false', isCertification: 'false' },
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => api.post('/recruitment/training/programs', { ...d, isMandatory: d.isMandatory === 'true', isCertification: d.isCertification === 'true' }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['training-programs'] }); reset(); setShowForm(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/recruitment/training/programs/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['training-programs'] }),
  });

  const list: any[] = programs?.data ?? [];
  const total: number = programs?.meta?.total ?? list.length;

  const stats = [
    { label: 'Total Programs', value: total, icon: BookOpen, color: 'bg-blue-500' },
    { label: 'Active', value: list.filter(p => (p.status ?? p.Status) === 'Active').length, icon: Check, color: 'bg-green-500' },
    { label: 'Mandatory', value: list.filter(p => p.isMandatory ?? p.is_mandatory).length, icon: Award, color: 'bg-red-500' },
    { label: 'Certifications', value: list.filter(p => p.isCertification ?? p.is_certification).length, icon: Award, color: 'bg-yellow-500' },
  ];

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${s.color}`}><Icon size={18} className="text-white" /></div>
              <div><p className="text-xl font-bold">{s.value}</p><p className="text-xs text-gray-500">{s.label}</p></div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">All Programs ({list.length})</h3>
        <Button size="sm" onClick={() => setShowForm(v => !v)}><Plus size={14} /> New Program</Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <form onSubmit={handleSubmit(d => createMutation.mutate(d))} className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Input label="Program Name *" error={errors.programName?.message as string} {...register('programName')} /></div>
            <Select label="Category *" options={CATEGORIES} {...register('category')} />
            <Select label="Delivery Mode *" options={DELIVERY_MODES} {...register('deliveryMode')} />
            <Input label="Duration (hrs) *" type="number" step="0.5" error={errors.durationHours?.message as string} {...register('durationHours')} />
            <Select label="Mandatory" options={[{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }]} {...register('isMandatory')} />
            <Select label="Certification" options={[{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }]} {...register('isCertification')} />
            <div className="col-span-2"><Input label="Description" {...register('description')} /></div>
            <div className="col-span-2 flex gap-2">
              <Button type="submit" size="sm" loading={createMutation.isPending}>Create</Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => { reset(); setShowForm(false); }}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? <div className="p-8 text-center"><Spinner /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 border-b border-gray-200">
                {['Program', 'Category', 'Mode', 'Duration', 'Type', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {list.map((p: any) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{p.programName ?? p.program_name}</p>
                      <p className="text-xs text-gray-400">{p.programCode ?? p.program_code ?? '—'}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{p.category}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{p.deliveryMode ?? p.delivery_mode ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{p.durationHours ?? p.duration_hours ?? '—'}h</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(p.isMandatory ?? p.is_mandatory) && <Badge variant="danger">Mandatory</Badge>}
                        {(p.isCertification ?? p.is_certification) && <Badge variant="info">Cert</Badge>}
                        {!p.isMandatory && !p.is_mandatory && !p.isCertification && !p.is_certification && <span className="text-xs text-gray-400">Optional</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge variant={(p.status ?? p.Status) === 'Active' ? 'success' : 'default'}>{p.status ?? p.Status ?? 'Draft'}</Badge></td>
                    <td className="px-4 py-3">
                      <button onClick={() => setConfirmId(p.id)} className="p-1.5 rounded hover:bg-red-50 hover:text-danger text-gray-300">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
                {list.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">No records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <ConfirmDialog
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={() => { deleteMutation.mutate(confirmId!); setConfirmId(null); }}
        message="Delete this training program? This action cannot be undone."
        confirmLabel="Delete Program"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

// ── Sessions tab ──────────────────────────────────────────────────────────────

const sessionSchema = z.object({
  programId: z.string().min(1, 'Required'),
  trainerName: z.string().min(1, 'Required'),
  startDate: z.string().min(1, 'Required'),
  endDate: z.string().min(1, 'Required'),
  location: z.string().optional(),
  maxParticipants: z.coerce.number().min(1).optional(),
});

function SessionsTab() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = React.useState(false);

  const { data: programs } = useQuery({
    queryKey: ['training-programs'],
    queryFn: async () => { const { data } = await api.get('/recruitment/training/programs?limit=50'); return data; },
  });

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['training-sessions'],
    queryFn: async () => { const { data } = await api.get('/recruitment/training/sessions?limit=50'); return data; },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof sessionSchema>>({ resolver: zodResolver(sessionSchema) });

  const createMutation = useMutation({
    mutationFn: (d: any) => api.post('/recruitment/training/sessions', d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['training-sessions'] }); reset(); setShowForm(false); },
  });

  const enrollMutation = useMutation({
    mutationFn: (id: string) => api.post(`/recruitment/training/sessions/${id}/enroll`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['training-sessions'] }),
  });

  const list: any[] = sessions?.data ?? [];
  const programOptions = (programs?.data ?? []).map((p: any) => ({ value: p.id, label: p.programName ?? p.program_name }));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">Training Sessions ({list.length})</h3>
        <Button size="sm" onClick={() => setShowForm(v => !v)}><Plus size={14} /> Schedule Session</Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <form onSubmit={handleSubmit(d => createMutation.mutate(d))} className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Select label="Program *" options={programOptions} error={errors.programId?.message as string} {...register('programId')} />
            </div>
            <Input label="Trainer Name *" error={errors.trainerName?.message as string} {...register('trainerName')} />
            <Input label="Location" {...register('location')} />
            <Input label="Start Date *" type="date" error={errors.startDate?.message as string} {...register('startDate')} />
            <Input label="End Date *" type="date" error={errors.endDate?.message as string} {...register('endDate')} />
            <Input label="Max Participants" type="number" {...register('maxParticipants')} />
            <div className="col-span-2 flex gap-2">
              <Button type="submit" size="sm" loading={createMutation.isPending}>Schedule</Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => { reset(); setShowForm(false); }}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {isLoading && <div className="p-8 text-center"><Spinner /></div>}
        {!isLoading && list.map((s: any) => {
          const enrolled = s.enrolledCount ?? s.enrolled_count ?? 0;
          const max = s.maxParticipants ?? s.max_participants ?? '∞';
          return (
            <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-gray-900">{s.programName ?? s.program?.programName ?? 'Program'}</p>
                <p className="text-sm text-gray-500 mt-0.5">Trainer: {s.trainerName ?? s.trainer_name ?? '—'} · {s.location ?? 'Online'}</p>
                <p className="text-xs text-gray-400 mt-1">{safeDate(s.startDate ?? s.start_date)} → {safeDate(s.endDate ?? s.end_date)}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm text-gray-500">{enrolled}/{max} enrolled</span>
                <Badge variant={s.status === 'Completed' ? 'success' : s.status === 'InProgress' ? 'info' : 'default'}>{s.status ?? 'Upcoming'}</Badge>
                <Button size="sm" onClick={() => enrollMutation.mutate(s.id)} loading={enrollMutation.isPending}>Enroll</Button>
              </div>
            </div>
          );
        })}
        {!isLoading && list.length === 0 && (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-400">
            <Calendar size={36} className="mx-auto mb-2 text-gray-300" />
            <p>No sessions scheduled yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── My Training tab ───────────────────────────────────────────────────────────

const feedbackSchema = z.object({
  rating: z.coerce.number().min(1).max(5),
  comments: z.string().optional(),
});

function MyTrainingTab() {
  const queryClient = useQueryClient();
  const [feedbackId, setFeedbackId] = React.useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['my-training'],
    queryFn: async () => { const { data } = await api.get('/recruitment/training/my-training?limit=50'); return data; },
  });

  const { register, handleSubmit, reset } = useForm<z.infer<typeof feedbackSchema>>({ resolver: zodResolver(feedbackSchema) });

  const feedbackMutation = useMutation({
    mutationFn: ({ id, feedback }: { id: string; feedback: any }) => api.post(`/recruitment/training/sessions/${id}/feedback`, feedback),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['my-training'] }); setFeedbackId(null); reset(); },
  });

  const list: any[] = data?.data ?? [];

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-3">
      {list.map((e: any) => (
        <div key={e.id} className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-gray-900">{e.programName ?? e.program?.programName ?? 'Program'}</p>
              <p className="text-sm text-gray-500 mt-0.5">{e.category ?? '—'} · {safeDate(e.startDate ?? e.start_date)} → {safeDate(e.endDate ?? e.end_date)}</p>
            </div>
            <Badge variant={e.completionStatus === 'Completed' ? 'success' : e.completionStatus === 'InProgress' ? 'info' : 'default'}>
              {e.completionStatus ?? e.completion_status ?? 'Enrolled'}
            </Badge>
          </div>

          {/* Feedback section */}
          {(e.completionStatus === 'Completed' || e.completion_status === 'Completed') && !e.feedbackGiven && !e.feedback_given && (
            feedbackId === e.id ? (
              <form className="mt-4 border-t pt-4 space-y-3" onSubmit={handleSubmit(fb => feedbackMutation.mutate({ id: e.sessionId ?? e.session_id ?? e.id, feedback: fb }))}>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Rating:</span>
                  {[1,2,3,4,5].map(n => (
                    <label key={n} className="cursor-pointer">
                      <input type="radio" value={n} className="sr-only" {...register('rating')} />
                      <Star size={18} className="text-yellow-400 hover:fill-yellow-400" />
                    </label>
                  ))}
                </div>
                <Input label="Comments" {...register('comments')} />
                <div className="flex gap-2">
                  <Button type="submit" size="sm" loading={feedbackMutation.isPending}>Submit Feedback</Button>
                  <Button type="button" size="sm" variant="secondary" onClick={() => { setFeedbackId(null); reset(); }}>Cancel</Button>
                </div>
              </form>
            ) : (
              <Button size="sm" className="mt-3" variant="secondary" onClick={() => setFeedbackId(e.id)}>
                <Star size={12} /> Give Feedback
              </Button>
            )
          )}

          {(e.feedbackGiven ?? e.feedback_given) && e.rating && (
            <div className="mt-3 border-t pt-3 flex items-center gap-1">
              {Array.from({ length: e.rating }).map((_, i) => (
                <Star key={i} size={13} className="text-yellow-400 fill-yellow-400" />
              ))}
              <span className="text-xs text-gray-400 ml-2">{e.comments ?? ''}</span>
            </div>
          )}
        </div>
      ))}

      {list.length === 0 && (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-400">
          <BookOpen size={36} className="mx-auto mb-2 text-gray-300" />
          <p>No training enrollments yet</p>
        </div>
      )}
    </div>
  );
}

// ── Skill Matrix tab ──────────────────────────────────────────────────────────

const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const LEVEL_COLOR: Record<string, string> = {
  Beginner: 'bg-gray-200 text-gray-700',
  Intermediate: 'bg-blue-100 text-blue-700',
  Advanced: 'bg-green-100 text-green-700',
  Expert: 'bg-purple-100 text-purple-700',
};

function SkillMatrixTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['skill-matrix'],
    queryFn: async () => { const { data } = await api.get('/recruitment/training/skill-matrix?limit=100'); return data; },
  });

  const matrix: any[] = data?.data ?? [];

  // Group by department
  const byDept: Record<string, any[]> = {};
  for (const row of matrix) {
    const dept = row.department ?? row.departmentName ?? 'General';
    if (!byDept[dept]) byDept[dept] = [];
    byDept[dept].push(row);
  }

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-6">
      {Object.entries(byDept).map(([dept, rows]) => {
        // Gather all skills
        const skills = Array.from(new Set(rows.flatMap((r: any) => (r.skills ?? []).map((s: any) => s.skillName ?? s.skill_name))));

        return (
          <div key={dept} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-900">{dept}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wide min-w-[140px]">Employee</th>
                  {skills.map(skill => (
                    <th key={skill} className="text-center px-3 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wide whitespace-nowrap">{skill}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((r: any) => (
                    <tr key={r.employeeId ?? r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2">
                        <p className="text-sm font-medium">{r.employeeName ?? r.employee_name}</p>
                        <p className="text-xs text-gray-400">{r.designation ?? ''}</p>
                      </td>
                      {skills.map(skill => {
                        const entry = (r.skills ?? []).find((s: any) => (s.skillName ?? s.skill_name) === skill);
                        const level = entry?.level ?? null;
                        return (
                          <td key={skill} className="px-3 py-2 text-center">
                            {level ? (
                              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${LEVEL_COLOR[level] ?? 'bg-gray-100 text-gray-600'}`}>{level}</span>
                            ) : (
                              <span className="text-gray-200">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {matrix.length === 0 && (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-400">
          <BarChart2 size={36} className="mx-auto mb-2 text-gray-300" />
          <p>No skill data available</p>
        </div>
      )}
    </div>
  );
}

// ── Certifications tab ────────────────────────────────────────────────────────

const certSchema = z.object({
  certificationName: z.string().min(1, 'Required'),
  issuingBody: z.string().min(1, 'Required'),
  issueDate: z.string().min(1, 'Required'),
  expiryDate: z.string().optional(),
  certificationNumber: z.string().optional(),
});

function CertificationsTab() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = React.useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['certifications'],
    queryFn: async () => { const { data } = await api.get('/recruitment/training/certifications?limit=50'); return data; },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof certSchema>>({ resolver: zodResolver(certSchema) });

  const createMutation = useMutation({
    mutationFn: (d: any) => api.post('/recruitment/training/certifications', d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['certifications'] }); reset(); setShowForm(false); },
  });

  const list: any[] = data?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">My Certifications ({list.length})</h3>
        <Button size="sm" onClick={() => setShowForm(v => !v)}><Plus size={14} /> Add Cert</Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <form onSubmit={handleSubmit(d => createMutation.mutate(d))} className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Input label="Certification Name *" error={errors.certificationName?.message as string} {...register('certificationName')} /></div>
            <Input label="Issuing Body *" error={errors.issuingBody?.message as string} {...register('issuingBody')} />
            <Input label="Cert Number" {...register('certificationNumber')} />
            <Input label="Issue Date *" type="date" error={errors.issueDate?.message as string} {...register('issueDate')} />
            <Input label="Expiry Date" type="date" {...register('expiryDate')} />
            <div className="col-span-2 flex gap-2">
              <Button type="submit" size="sm" loading={createMutation.isPending}>Save</Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => { reset(); setShowForm(false); }}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {isLoading && <Spinner />}
        {!isLoading && list.map((c: any) => {
          const expiry = c.expiryDate ?? c.expiry_date;
          const isExpired = expiry && new Date(expiry) < new Date();
          return (
            <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-5 flex gap-3">
              <div className={`p-3 rounded-xl ${isExpired ? 'bg-red-50' : 'bg-yellow-50'}`}>
                <Award size={22} className={isExpired ? 'text-red-400' : 'text-yellow-500'} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{c.certificationName ?? c.certification_name}</p>
                <p className="text-sm text-gray-500">{c.issuingBody ?? c.issuing_body}</p>
                <p className="text-xs text-gray-400 mt-1">Issued: {safeDate(c.issueDate ?? c.issue_date)} · {expiry ? `Expires: ${safeDate(expiry)}` : 'No expiry'}</p>
                {c.certificationNumber ?? c.certification_number
                  ? <p className="text-xs text-gray-400">#{c.certificationNumber ?? c.certification_number}</p>
                  : null}
              </div>
              {isExpired && <Badge variant="danger" className="self-start">Expired</Badge>}
              {!isExpired && expiry && <Badge variant="success" className="self-start">Valid</Badge>}
            </div>
          );
        })}
        {!isLoading && list.length === 0 && (
          <div className="col-span-2 bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-400">
            <FileText size={36} className="mx-auto mb-2 text-gray-300" />
            <p>No certifications added yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TrainingPage() {
  const [tab, setTab] = React.useState('programs');

  return (
    <div>
      <PageHeader title="Training & Skills" subtitle="Training programs, sessions, skill matrix and certifications" />

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit flex-wrap">
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

      {tab === 'programs' && <ProgramsTab />}
      {tab === 'sessions' && <SessionsTab />}
      {tab === 'my'       && <MyTrainingTab />}
      {tab === 'skills'   && <SkillMatrixTab />}
      {tab === 'certs'    && <CertificationsTab />}
    </div>
  );
}
