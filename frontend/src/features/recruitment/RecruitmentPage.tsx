import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Briefcase, Users, Calendar, FileCheck, UserPlus,
  Plus, Edit, Trash2, Check, X, Star, ChevronRight,
  ArrowRight, ClipboardList,
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

// ── Constants ─────────────────────────────────────────────────────────────────

const PIPELINE_STAGES = ['Applied', 'Screening', 'Phone Screen', 'Technical', 'HR Round', 'Final', 'Offer'];

const JOB_TYPES = [
  { value: 'FullTime', label: 'Full Time' },
  { value: 'PartTime', label: 'Part Time' },
  { value: 'Contract', label: 'Contract' },
  { value: 'Internship', label: 'Internship' },
];

const INTERVIEW_TYPES = [
  { value: 'PhoneScreen', label: 'Phone Screen' },
  { value: 'Technical', label: 'Technical' },
  { value: 'HRRound', label: 'HR Round' },
  { value: 'ManagerRound', label: 'Manager Round' },
  { value: 'FinalRound', label: 'Final Round' },
  { value: 'CultureFit', label: 'Culture Fit' },
];

const TABS = [
  { key: 'jobs',        label: 'Job Postings',  icon: Briefcase },
  { key: 'candidates',  label: 'Candidates',    icon: Users },
  { key: 'interviews',  label: 'Interviews',    icon: Calendar },
  { key: 'offers',      label: 'Offers',        icon: FileCheck },
  { key: 'requisitions',label: 'Requisitions',  icon: ClipboardList },
];

// ── Job Postings tab ──────────────────────────────────────────────────────────

const jobSchema = z.object({
  title: z.string().min(1, 'Required'),
  jobType: z.string().min(1, 'Required'),
  location: z.string().optional(),
  experienceMin: z.coerce.number().min(0).optional(),
  experienceMax: z.coerce.number().min(0).optional(),
  salaryMin: z.coerce.number().min(0).optional(),
  salaryMax: z.coerce.number().min(0).optional(),
  description: z.string().optional(),
  openings: z.coerce.number().min(1).optional(),
});

function JobsTab({ onSelectJob }: { onSelectJob: (job: any) => void }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = React.useState(false);
  const [deleteJobId, setDeleteJobId] = React.useState<string | null>(null);
  const [editItem, setEditItem] = React.useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => { const { data } = await api.get('/recruitment/jobs?limit=50'); return data.data ?? []; },
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(jobSchema),
    defaultValues: { jobType: 'FullTime', openings: 1 },
  });

  const saveMutation = useMutation({
    mutationFn: (d: any) => editItem
      ? api.put(`/recruitment/jobs/${editItem.id}`, d)
      : api.post('/recruitment/jobs', d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['jobs'] }); reset(); setShowForm(false); setEditItem(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/recruitment/jobs/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jobs'] }),
  });

  function openEdit(j: any) {
    setEditItem(j);
    setValue('title', j.title);
    setValue('jobType', j.jobType ?? j.job_type ?? 'FullTime');
    setValue('location', j.location ?? '');
    setValue('experienceMin', j.experienceMin ?? j.experience_min ?? 0);
    setValue('experienceMax', j.experienceMax ?? j.experience_max ?? 5);
    setValue('salaryMin', j.salaryMin ?? j.salary_min ?? 0);
    setValue('salaryMax', j.salaryMax ?? j.salary_max ?? 0);
    setValue('openings', j.openings ?? 1);
    setValue('description', j.description ?? '');
    setShowForm(true);
  }

  const jobs: any[] = data ?? [];

  // Summary stats
  const published = jobs.filter(j => j.status === 'Published').length;
  const draft = jobs.filter(j => j.status === 'Draft').length;
  const closed = jobs.filter(j => j.status === 'Closed').length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Published', value: published, color: 'text-green-600 bg-green-50' },
          { label: 'Draft', value: draft, color: 'text-yellow-600 bg-yellow-50' },
          { label: 'Closed', value: closed, color: 'text-gray-600 bg-gray-100' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className={`text-2xl font-bold ${s.color.split(' ')[0]}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button size="sm" onClick={() => { setEditItem(null); reset(); setShowForm(v => !v); }}>
          <Plus size={14} /> New Job
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold mb-4">{editItem ? 'Edit Job Posting' : 'New Job Posting'}</h3>
          <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <Input label="Job Title *" error={errors.title?.message as string} {...register('title')} />
              </div>
              <Select label="Type *" options={JOB_TYPES} {...register('jobType')} />
              <Input label="Location" {...register('location')} />
              <Input label="Min Experience (yrs)" type="number" {...register('experienceMin')} />
              <Input label="Max Experience (yrs)" type="number" {...register('experienceMax')} />
              <Input label="Salary Min (₹)" type="number" {...register('salaryMin')} />
              <Input label="Salary Max (₹)" type="number" {...register('salaryMax')} />
              <Input label="Openings" type="number" {...register('openings')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
              <textarea className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" rows={4} {...register('description')} />
            </div>
            <div className="flex gap-3">
              <Button type="submit" size="sm" loading={saveMutation.isPending}>{editItem ? 'Update' : 'Post Job'}</Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => { reset(); setShowForm(false); setEditItem(null); }}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? <Spinner /> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Title</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Location</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Exp</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Openings</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Posted</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {jobs.map((j: any) => (
                <tr key={j.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => onSelectJob(j)}>
                  <td className="px-4 py-3 font-medium text-primary">{j.title}</td>
                  <td className="px-4 py-3"><Badge variant="info">{j.jobType ?? j.job_type}</Badge></td>
                  <td className="px-4 py-3 text-gray-600">{j.location ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{j.experienceMin ?? j.experience_min ?? 0}–{j.experienceMax ?? j.experience_max ?? '?'} yrs</td>
                  <td className="px-4 py-3">{j.openings ?? 1}</td>
                  <td className="px-4 py-3">
                    <Badge variant={j.status === 'Published' ? 'success' : j.status === 'Closed' ? 'default' : 'warning'}>
                      {j.status ?? 'Draft'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{safeDate(j.publishedAt ?? j.published_at)}</td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(j)} className="p-1.5 rounded hover:bg-gray-100"><Edit size={13} /></button>
                      <button onClick={() => setDeleteJobId(j.id)} className="p-1.5 rounded hover:bg-red-50 hover:text-danger" aria-label="Delete job" title="Delete job"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-400">No records found.</td></tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={!!deleteJobId}
        onClose={() => setDeleteJobId(null)}
        onConfirm={() => { deleteMutation.mutate(deleteJobId!); setDeleteJobId(null); }}
        title="Delete Job Posting"
        message="Delete this job posting? All associated candidates and interviews will be affected."
        confirmLabel="Delete Job"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

// ── Candidates tab ─────────────────────────────────────────────────────────────

const candidateSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
  mobile: z.string().optional(),
  jobPostingId: z.string().optional(),
  totalExperienceYears: z.coerce.number().min(0).optional(),
  currentCTC: z.coerce.number().min(0).optional(),
  expectedCTC: z.coerce.number().min(0).optional(),
  noticePeriodDays: z.coerce.number().min(0).optional(),
  source: z.string().optional(),
});

const SOURCE_OPTIONS = [
  { value: 'LinkedIn', label: 'LinkedIn' },
  { value: 'JobPortal', label: 'Job Portal' },
  { value: 'Referral', label: 'Referral' },
  { value: 'Direct', label: 'Direct' },
  { value: 'Agency', label: 'Agency' },
  { value: 'Campus', label: 'Campus' },
  { value: 'Other', label: 'Other' },
];

function CandidatesTab({ selectedJob }: { selectedJob: any }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = React.useState(false);
  const [stageFilter, setStageFilter] = React.useState('All');
  const [rejectCandidateId, setRejectCandidateId] = React.useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['candidates', selectedJob?.id],
    queryFn: async () => {
      const q = selectedJob ? `?jobPostingId=${selectedJob.id}&limit=100` : '?limit=100';
      const { data } = await api.get(`/recruitment/candidates${q}`);
      return data.data ?? [];
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(candidateSchema),
    defaultValues: { source: 'LinkedIn' },
  });

  const addMutation = useMutation({
    mutationFn: (d: any) => api.post('/recruitment/candidates', { ...d, jobPostingId: selectedJob?.id }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['candidates'] }); reset(); setShowForm(false); },
  });

  const stageMutation = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) => api.patch(`/recruitment/candidates/${id}/stage`, { stage }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['candidates'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/recruitment/candidates/${id}/reject`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['candidates'] }),
  });

  const candidates: any[] = data ?? [];
  const filtered = stageFilter === 'All' ? candidates : candidates.filter(c => (c.stage ?? c.currentStage) === stageFilter);

  // Stage counts
  const stageCounts: Record<string, number> = {};
  PIPELINE_STAGES.forEach(s => { stageCounts[s] = candidates.filter(c => (c.stage ?? c.currentStage) === s).length; });

  return (
    <div className="space-y-4">
      {/* Pipeline funnel */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        <button onClick={() => setStageFilter('All')} className={`shrink-0 px-3 py-2 rounded-lg border text-center min-w-[90px] transition-colors ${stageFilter === 'All' ? 'border-primary bg-primary/5' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
          <p className="text-xs text-gray-500">All</p>
          <p className="text-lg font-bold text-gray-900">{candidates.length}</p>
        </button>
        {PIPELINE_STAGES.map(s => (
          <button key={s} onClick={() => setStageFilter(s)} className={`shrink-0 px-3 py-2 rounded-lg border text-center min-w-[90px] transition-colors ${stageFilter === s ? 'border-primary bg-primary/5' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
            <p className="text-xs text-gray-400 truncate">{s}</p>
            <p className="text-lg font-bold text-gray-900">{stageCounts[s] ?? 0}</p>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        {selectedJob && <p className="text-sm text-gray-500">Showing candidates for: <span className="font-medium text-gray-700">{selectedJob.title}</span></p>}
        <Button size="sm" onClick={() => setShowForm(v => !v)}><Plus size={14} /> Add Candidate</Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <form onSubmit={handleSubmit(d => addMutation.mutate(d))} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="First Name *" error={errors.firstName?.message as string} {...register('firstName')} />
            <Input label="Last Name *" error={errors.lastName?.message as string} {...register('lastName')} />
            <Input label="Email *" type="email" error={errors.email?.message as string} {...register('email')} />
            <Input label="Mobile" {...register('mobile')} />
            <Input label="Experience (yrs)" type="number" {...register('totalExperienceYears')} />
            <Select label="Source" options={SOURCE_OPTIONS} {...register('source')} />
            <Input label="Current CTC (₹)" type="number" {...register('currentCTC')} />
            <Input label="Expected CTC (₹)" type="number" {...register('expectedCTC')} />
            <Input label="Notice Period (days)" type="number" {...register('noticePeriodDays')} />
            <div className="sm:col-span-3 flex gap-3">
              <Button type="submit" size="sm" loading={addMutation.isPending}>Add Candidate</Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => { reset(); setShowForm(false); }}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? <Spinner /> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Email</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Exp</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Source</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Stage</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((c: any) => {
                const currentIdx = PIPELINE_STAGES.indexOf(c.stage ?? c.currentStage ?? 'Applied');
                const nextStage = PIPELINE_STAGES[currentIdx + 1];
                return (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium">{c.firstName} {c.lastName}</td>
                    <td className="px-4 py-3 text-gray-500">{c.email}</td>
                    <td className="px-4 py-3 text-gray-500">{c.totalExperienceYears ?? c.total_experience_years ?? '—'} yrs</td>
                    <td className="px-4 py-3 text-gray-500">{c.source ?? '—'}</td>
                    <td className="px-4 py-3"><Badge variant="info">{c.stage ?? c.currentStage ?? 'Applied'}</Badge></td>
                    <td className="px-4 py-3">
                      <Badge variant={c.status === 'Active' ? 'success' : c.status === 'Rejected' ? 'danger' : 'default'}>
                        {c.status ?? 'Active'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {nextStage && (
                          <button onClick={() => stageMutation.mutate({ id: c.id, stage: nextStage })} className="p-1.5 rounded hover:bg-blue-50 hover:text-blue-700 text-gray-400" title={`Move to ${nextStage}`}>
                            <ArrowRight size={13} />
                          </button>
                        )}
                        {c.status !== 'Rejected' && (
                          <button onClick={() => setRejectCandidateId(c.id)} className="p-1.5 rounded hover:bg-red-50 hover:text-danger text-gray-400" title="Reject" aria-label="Reject candidate">
                            <X size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">No records found.</td></tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={!!rejectCandidateId}
        onClose={() => setRejectCandidateId(null)}
        onConfirm={() => { rejectMutation.mutate(rejectCandidateId!); setRejectCandidateId(null); }}
        title="Reject Candidate"
        message="Mark this candidate as rejected? This action will update their application status."
        confirmLabel="Reject Candidate"
        loading={rejectMutation.isPending}
      />
    </div>
  );
}

// ── Interviews tab ─────────────────────────────────────────────────────────────

const interviewSchema = z.object({
  candidateId: z.string().min(1, 'Required'),
  interviewType: z.string().min(1, 'Required'),
  scheduledAt: z.string().min(1, 'Required'),
  durationMinutes: z.coerce.number().min(15).optional(),
  mode: z.string().optional(),
  location: z.string().optional(),
});

const feedbackSchema = z.object({
  technicalRating: z.coerce.number().min(1).max(5),
  communicationRating: z.coerce.number().min(1).max(5),
  overallRating: z.coerce.number().min(1).max(5),
  recommendation: z.string().min(1),
  comments: z.string().optional(),
});

function InterviewsTab() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = React.useState(false);
  const [feedbackFor, setFeedbackFor] = React.useState<any>(null);

  const { data: interviews, isLoading } = useQuery({
    queryKey: ['interviews'],
    queryFn: async () => { const { data } = await api.get('/recruitment/interviews?limit=50'); return data.data ?? []; },
  });

  const { data: candidates } = useQuery({
    queryKey: ['candidates-list'],
    queryFn: async () => { const { data } = await api.get('/recruitment/candidates?limit=100'); return data.data ?? []; },
  });

  const { register: regI, handleSubmit: hsI, reset: resetI, formState: { errors: errI } } = useForm({
    resolver: zodResolver(interviewSchema),
    defaultValues: { interviewType: 'Technical', durationMinutes: 60, mode: 'Video' },
  });

  const { register: regF, handleSubmit: hsF, reset: resetF, formState: { errors: errF } } = useForm({
    resolver: zodResolver(feedbackSchema),
    defaultValues: { recommendation: 'Proceed' },
  });

  const scheduleMutation = useMutation({
    mutationFn: (d: any) => api.post('/recruitment/interviews', d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['interviews'] }); resetI(); setShowForm(false); },
  });

  const feedbackMutation = useMutation({
    mutationFn: ({ id, d }: { id: string; d: any }) => api.patch(`/recruitment/interviews/${id}/feedback`, d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['interviews'] }); resetF(); setFeedbackFor(null); },
  });

  const candidateOptions = (candidates ?? []).map((c: any) => ({ value: c.id, label: `${c.firstName} ${c.lastName}` }));
  const modeOptions = [
    { value: 'Video', label: 'Video Call' },
    { value: 'InPerson', label: 'In Person' },
    { value: 'Phone', label: 'Phone' },
  ];
  const recoOptions = [
    { value: 'Proceed', label: 'Proceed' },
    { value: 'Hold', label: 'Hold' },
    { value: 'Reject', label: 'Reject' },
    { value: 'StrongHire', label: 'Strong Hire' },
  ];

  const ivList: any[] = interviews ?? [];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowForm(v => !v)}><Plus size={14} /> Schedule Interview</Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold mb-4">Schedule Interview</h3>
          <form onSubmit={hsI(d => scheduleMutation.mutate(d))} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select label="Candidate *" options={candidateOptions} error={errI.candidateId?.message as string} {...regI('candidateId')} />
            <Select label="Interview Type *" options={INTERVIEW_TYPES} error={errI.interviewType?.message as string} {...regI('interviewType')} />
            <Input label="Scheduled At *" type="datetime-local" error={errI.scheduledAt?.message as string} {...regI('scheduledAt')} />
            <Input label="Duration (min)" type="number" {...regI('durationMinutes')} />
            <Select label="Mode" options={modeOptions} {...regI('mode')} />
            <Input label="Location / Link" {...regI('location')} />
            <div className="sm:col-span-3 flex gap-3">
              <Button type="submit" size="sm" loading={scheduleMutation.isPending}>Schedule</Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => { resetI(); setShowForm(false); }}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {/* Feedback modal */}
      {feedbackFor && (
        <div className="bg-white rounded-xl border border-primary/30 p-5">
          <h3 className="font-semibold mb-4">Submit Feedback — {feedbackFor.candidate?.firstName ?? 'Candidate'}</h3>
          <form onSubmit={hsF(d => feedbackMutation.mutate({ id: feedbackFor.id, d }))} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Technical (1–5)" type="number" min={1} max={5} error={errF.technicalRating?.message as string} {...regF('technicalRating')} />
            <Input label="Communication (1–5)" type="number" min={1} max={5} error={errF.communicationRating?.message as string} {...regF('communicationRating')} />
            <Input label="Overall (1–5)" type="number" min={1} max={5} error={errF.overallRating?.message as string} {...regF('overallRating')} />
            <Select label="Recommendation *" options={recoOptions} {...regF('recommendation')} />
            <div className="sm:col-span-2">
              <Input label="Comments" {...regF('comments')} />
            </div>
            <div className="sm:col-span-3 flex gap-3">
              <Button type="submit" size="sm" loading={feedbackMutation.isPending}>Submit Feedback</Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => { resetF(); setFeedbackFor(null); }}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? <Spinner /> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Candidate</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Scheduled</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Mode</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Rating</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Reco</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ivList.map((iv: any) => (
                <tr key={iv.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium">
                    {iv.candidate ? `${iv.candidate.firstName} ${iv.candidate.lastName}` : iv.candidateId?.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3"><Badge variant="info">{iv.interviewType ?? iv.interview_type}</Badge></td>
                  <td className="px-4 py-3 text-xs">
                    <p>{safeDate(iv.scheduledAt ?? iv.scheduled_at)}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{iv.mode ?? '—'}</td>
                  <td className="px-4 py-3">
                    <Badge variant={iv.status === 'Completed' ? 'success' : iv.status === 'Cancelled' ? 'danger' : 'warning'}>
                      {iv.status ?? 'Scheduled'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {iv.rating ? (
                      <div className="flex items-center gap-1">
                        <Star size={12} className="text-yellow-500 fill-yellow-500" />
                        <span>{iv.rating}/5</span>
                      </div>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={iv.outcome === 'StrongHire' || iv.outcome === 'Proceed' ? 'success' : iv.outcome === 'Reject' ? 'danger' : 'warning'}>
                      {iv.outcome ?? '—'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {iv.status !== 'Completed' && (
                      <button onClick={() => setFeedbackFor(iv)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-primary" title="Add Feedback">
                        <Star size={13} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {ivList.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-400">No records found.</td></tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Offers tab ────────────────────────────────────────────────────────────────

const offerSchema = z.object({
  candidateId: z.string().min(1, 'Required'),
  ctcOffered: z.coerce.number().min(1, 'Required'),
  joiningDate: z.string().min(1, 'Required'),
  designation: z.string().optional(),
  offerExpiryDate: z.string().optional(),
});

function OffersTab() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = React.useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['offers'],
    queryFn: async () => { const { data } = await api.get('/recruitment/offers?limit=50'); return data.data ?? []; },
  });

  const { data: candidates } = useQuery({
    queryKey: ['candidates-list'],
    queryFn: async () => { const { data } = await api.get('/recruitment/candidates?status=Active&limit=100'); return data.data ?? []; },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof offerSchema>>({ resolver: zodResolver(offerSchema) });

  const createMutation = useMutation({
    mutationFn: (d: any) => api.post('/recruitment/offers', d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['offers'] }); reset(); setShowForm(false); },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.patch(`/recruitment/offers/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['offers'] }),
  });

  const candidateOptions = (candidates ?? []).map((c: any) => ({ value: c.id, label: `${c.firstName} ${c.lastName}` }));
  const offers: any[] = data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowForm(v => !v)}><Plus size={14} /> Create Offer</Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold mb-4">Create Offer Letter</h3>
          <form onSubmit={handleSubmit(d => createMutation.mutate(d))} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select label="Candidate *" options={candidateOptions} error={errors.candidateId?.message as string} {...register('candidateId')} />
            <Input label="Designation" {...register('designation')} />
            <Input label="CTC Offered (₹) *" type="number" error={errors.ctcOffered?.message as string} {...register('ctcOffered')} />
            <Input label="Joining Date *" type="date" error={errors.joiningDate?.message as string} {...register('joiningDate')} />
            <Input label="Offer Expiry Date" type="date" {...register('offerExpiryDate')} />
            <div className="sm:col-span-3 flex gap-3">
              <Button type="submit" size="sm" loading={createMutation.isPending}>Generate Offer</Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => { reset(); setShowForm(false); }}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? <Spinner /> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Candidate</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Designation</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">CTC</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Joining</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Expiry</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {offers.map((o: any) => (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium">
                    {o.candidate ? `${o.candidate.firstName} ${o.candidate.lastName}` : o.candidateId?.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{o.designation ?? '—'}</td>
                  <td className="px-4 py-3 font-medium">₹{Number(o.ctcOffered ?? o.ctc_offered ?? 0).toLocaleString()}</td>
                  <td className="px-4 py-3">{safeDate(o.joiningDate ?? o.joining_date)}</td>
                  <td className="px-4 py-3">{safeDate(o.valid_until ?? o.validUntil)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={o.status === 'Accepted' ? 'success' : o.status === 'Rejected' ? 'danger' : o.status === 'Expired' ? 'default' : 'warning'}>
                      {o.status ?? 'Pending'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {(!o.status || o.status === 'Sent' || o.status === 'Pending') && (
                      <div className="flex gap-1">
                        <button onClick={() => statusMutation.mutate({ id: o.id, status: 'Accepted' })} className="p-1.5 rounded bg-green-50 hover:bg-green-100 text-green-700" title="Mark Accepted"><Check size={13} /></button>
                        <button onClick={() => statusMutation.mutate({ id: o.id, status: 'Rejected' })} className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-danger" title="Mark Rejected"><X size={13} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {offers.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">No records found.</td></tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Requisitions tab ──────────────────────────────────────────────────────────

const reqSchema = z.object({
  title: z.string().min(1, 'Required'),
  departmentId: z.string().optional(),
  positionsRequired: z.coerce.number().min(1),
  priority: z.string().optional(),
  requiredBy: z.string().optional(),
  justification: z.string().optional(),
});

const PRIORITY_OPTIONS = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
  { value: 'Critical', label: 'Critical' },
];

function RequisitionsTab() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = React.useState(false);
  const [deleteReqId, setDeleteReqId] = React.useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['requisitions'],
    queryFn: async () => { const { data } = await api.get('/recruitment/requisitions?limit=50'); return data.data ?? []; },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(reqSchema),
    defaultValues: { positionsRequired: 1, priority: 'Medium' },
  });

  const saveMutation = useMutation({
    mutationFn: (d: any) => api.post('/recruitment/requisitions', d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['requisitions'] }); reset(); setShowForm(false); },
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/recruitment/requisitions/${id}/approve`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['requisitions'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/recruitment/requisitions/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['requisitions'] }),
  });

  const reqs: any[] = data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowForm(v => !v)}><Plus size={14} /> New Requisition</Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Input label="Position Title *" error={errors.title?.message as string} {...register('title')} />
            </div>
            <Input label="Positions Required *" type="number" error={errors.positionsRequired?.message as string} {...register('positionsRequired')} />
            <Select label="Priority" options={PRIORITY_OPTIONS} {...register('priority')} />
            <Input label="Required By" type="date" {...register('requiredBy')} />
            <Input label="Justification" {...register('justification')} />
            <div className="sm:col-span-3 flex gap-3">
              <Button type="submit" size="sm" loading={saveMutation.isPending}>Submit Requisition</Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => { reset(); setShowForm(false); }}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? <Spinner /> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Position</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Positions</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Priority</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Required By</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reqs.map((r: any) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium">{r.title}</td>
                  <td className="px-4 py-3">{r.positionsRequired ?? r.positions_required}</td>
                  <td className="px-4 py-3">
                    <Badge variant={r.priority === 'Critical' ? 'danger' : r.priority === 'High' ? 'warning' : 'info'}>
                      {r.priority ?? 'Medium'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">{safeDate(r.requiredBy ?? r.required_by)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={r.status === 'Approved' ? 'success' : r.status === 'Rejected' ? 'danger' : 'warning'}>
                      {r.status ?? 'Pending'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {(!r.status || r.status === 'Pending') && (
                        <button onClick={() => approveMutation.mutate(r.id)} className="p-1.5 rounded bg-green-50 hover:bg-green-100 text-green-700" aria-label="Approve" title="Approve"><Check size={13} /></button>
                      )}
                      <button onClick={() => setDeleteReqId(r.id)} className="p-1.5 rounded hover:bg-red-50 hover:text-danger" aria-label="Delete requisition" aria-label="Delete" title="Delete"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {reqs.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">No records found.</td></tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={!!deleteReqId}
        onClose={() => setDeleteReqId(null)}
        onConfirm={() => { deleteMutation.mutate(deleteReqId!); setDeleteReqId(null); }}
        title="Delete Requisition"
        message="Delete this recruitment requisition?"
        confirmLabel="Delete Requisition"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RecruitmentPage() {
  const [tab, setTab] = React.useState('jobs');
  const [selectedJob, setSelectedJob] = React.useState<any>(null);

  function handleSelectJob(job: any) {
    setSelectedJob(job);
    setTab('candidates');
  }

  return (
    <div>
      <PageHeader title="Recruitment" subtitle="Job postings, candidates, interviews, offers and requisitions" />

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit flex-wrap">
        {TABS.map(t => {
          const I = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 whitespace-nowrap ${tab === t.key ? 'bg-white shadow text-primary' : 'text-gray-600'}`}
            >
              <I size={14} />{t.label}
            </button>
          );
        })}
      </div>

      {tab === 'jobs'         && <JobsTab onSelectJob={handleSelectJob} />}
      {tab === 'candidates'   && <CandidatesTab selectedJobId={selectedJob?.id} />}
      {tab === 'interviews'   && <InterviewsTab />}
      {tab === 'offers'       && <OffersTab />}
      {tab === 'requisitions' && <RequisitionsTab />}
    </div>
  );
}
