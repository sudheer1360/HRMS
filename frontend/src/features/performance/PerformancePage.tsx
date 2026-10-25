import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Target, Star, Users, ClipboardCheck, UserCheck,
  Plus, Trash2, Check, TrendingUp,
} from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Input, Select, Badge, Spinner } from '@components/ui/Input';
import { formatDate } from '@lib/utils';
import { performanceService } from '@features/../services/performance.service';
import { employeeService } from '@features/../services/employee.service';
import { PageHeader } from '@components/ui/PageHeader';
import { ConfirmDialog } from '@components/ui/ConfirmDialog';

// ── Helpers ───────────────────────────────────────────────────────────────────

function safeDate(v?: string | null) {
  if (!v) return '—';
  try { return formatDate(v); } catch { return v; }
}

function StarRating({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star key={i} size={13} className={i < Math.round(value) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
      ))}
    </div>
  );
}

function ProgressBar({ value, max = 100, color = 'bg-primary' }: { value: number; max?: number; color?: string }) {
  const pct = Math.min(Math.round((value / max) * 100), 100);
  return (
    <div className="h-2 bg-gray-100 rounded-full flex-1">
      <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'goals',      label: 'My Goals',          icon: Target },
  { key: 'appraisals', label: 'Appraisals',         icon: ClipboardCheck },
  { key: 'feedback',   label: '360° Feedback',      icon: Users },
  { key: 'reviews',    label: 'Performance Reviews', icon: TrendingUp },
  { key: 'probation',  label: 'Probation',          icon: UserCheck },
];

const GOAL_CATEGORIES = [
  { value: 'Performance', label: 'Performance' },
  { value: 'Development', label: 'Development' },
  { value: 'Learning', label: 'Learning' },
  { value: 'Leadership', label: 'Leadership' },
  { value: 'Technical', label: 'Technical' },
];

const PRIORITIES = [
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' },
];

// ── My Goals tab ──────────────────────────────────────────────────────────────

const goalSchema = z.object({
  title: z.string().min(1, 'Required'),
  category: z.string().min(1, 'Required'),
  description: z.string().optional(),
  targetDate: z.string().min(1, 'Required'),
  priority: z.string().min(1, 'Required'),
  targetValue: z.coerce.number().min(0).optional(),
  metricUnit: z.string().optional(),
});

function MyGoalsTab() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = React.useState(false);
  const [confirmId, setConfirmId] = React.useState<string | null>(null);
  const [progressId, setProgressId] = React.useState<string | null>(null);
  const [progress, setProgress] = React.useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['my-goals'],
    queryFn: async () => { const { data } = await performanceService.listMyGoals({ limit: 50 }); return data; },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(goalSchema),
    defaultValues: { category: 'Performance', priority: 'Medium' },
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => performanceService.createGoal(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['my-goals'] }); reset(); setShowForm(false); },
  });

  const updateProgressMutation = useMutation({
    mutationFn: ({ id, progress }: { id: string; progress: number }) => performanceService.updateGoalProgress(id, progress),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['my-goals'] }); setProgressId(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => performanceService.deleteGoal(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-goals'] }),
  });

  const goals: any[] = data?.data ?? [];
  const onTrack = goals.filter(g => (g.progress ?? 0) >= 50).length;
  const atRisk = goals.filter(g => (g.progress ?? 0) < 50 && g.status !== 'Completed').length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Goals', value: goals.length, color: 'bg-blue-50 text-blue-700 border-blue-200' },
          { label: 'On Track', value: onTrack, color: 'bg-green-50 text-green-700 border-green-200' },
          { label: 'At Risk', value: atRisk, color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
          { label: 'Completed', value: goals.filter(g => g.status === 'Completed').length, color: 'bg-purple-50 text-purple-700 border-purple-200' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-4 ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs mt-0.5 opacity-70">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">My Goals & OKRs</h3>
        <Button size="sm" onClick={() => setShowForm(v => !v)}><Plus size={14} /> Add Goal</Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <form onSubmit={handleSubmit(d => createMutation.mutate(d))} className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Input label="Goal Title *" error={errors.title?.message as string} {...register('title')} /></div>
            <Select label="Category *" options={GOAL_CATEGORIES} {...register('category')} />
            <Select label="Priority *" options={PRIORITIES} {...register('priority')} />
            <Input label="Target Date *" type="date" error={errors.targetDate?.message as string} {...register('targetDate')} />
            <div className="flex gap-2">
              <div className="flex-1"><Input label="Target Value" type="number" {...register('targetValue')} /></div>
              <div className="flex-1"><Input label="Unit" placeholder="e.g. %" {...register('metricUnit')} /></div>
            </div>
            <div className="col-span-2"><Input label="Description" {...register('description')} /></div>
            <div className="col-span-2 flex gap-2">
              <Button type="submit" size="sm" loading={createMutation.isPending}>Create Goal</Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => { reset(); setShowForm(false); }}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? <Spinner /> : (
        <div className="space-y-3">
          {goals.map((g: any) => {
            const prog = Number(g.progress ?? 0);
            return (
              <div key={g.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900">{g.title}</p>
                      <Badge variant={g.priority === 'High' ? 'danger' : g.priority === 'Medium' ? 'warning' : 'default'} className="text-xs">{g.priority}</Badge>
                    </div>
                    <p className="text-xs text-gray-400">{g.category} · Due: {safeDate(g.targetDate ?? g.target_date)}</p>
                    {g.description && <p className="text-sm text-gray-500 mt-1">{g.description}</p>}
                  </div>
                  <div className="flex gap-1">
                    <Badge variant={g.status === 'Completed' ? 'success' : prog >= 70 ? 'info' : prog >= 40 ? 'warning' : 'danger'}>
                      {g.status === 'Completed' ? 'Done' : `${prog}%`}
                    </Badge>
                    <button onClick={() => setConfirmId(g.id)} className="p-1.5 rounded hover:bg-red-50 hover:text-danger text-gray-300"><Trash2 size={13} /></button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-3">
                  <ProgressBar value={prog} color={prog >= 70 ? 'bg-green-500' : prog >= 40 ? 'bg-yellow-400' : 'bg-red-400'} />
                  <span className="text-xs text-gray-500 w-8">{prog}%</span>
                </div>

                {/* Update progress */}
                {progressId === g.id ? (
                  <div className="flex items-center gap-2 mt-3">
                    <input type="range" min="0" max="100" value={progress} onChange={e => setProgress(Number(e.target.value))} className="flex-1" />
                    <span className="text-sm w-8">{progress}%</span>
                    <Button size="sm" onClick={() => updateProgressMutation.mutate({ id: g.id, progress })} loading={updateProgressMutation.isPending}><Check size={12} /></Button>
                    <Button size="sm" variant="secondary" onClick={() => setProgressId(null)}>Cancel</Button>
                  </div>
                ) : (
                  <button className="text-xs text-primary mt-2 hover:underline" onClick={() => { setProgressId(g.id); setProgress(prog); }}>Update Progress</button>
                )}
              </div>
            );
          })}
          {goals.length === 0 && (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-400">
              <Target size={36} className="mx-auto mb-2 text-gray-300" />
              <p>No goals set yet</p>
            </div>
          )}
        </div>
      )}
      <ConfirmDialog
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={() => { deleteMutation.mutate(confirmId!); setConfirmId(null); }}
        message="Delete this goal? This action cannot be undone."
        confirmLabel="Delete Goal"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

// ── Appraisals tab ────────────────────────────────────────────────────────────

const selfAssessSchema = z.object({
  selfRating: z.coerce.number().min(1).max(5),
  achievements: z.string().min(1, 'Required'),
  areasOfImprovement: z.string().optional(),
  trainingNeeds: z.string().optional(),
  comments: z.string().optional(),
});

function AppraisalsTab() {
  const queryClient = useQueryClient();
  const [selectedAppraisal, setSelectedAppraisal] = React.useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['appraisals'],
    queryFn: async () => { const { data } = await performanceService.listMyAppraisals({ limit: 20 }); return data; },
  });

  const { data: teamAppraisals } = useQuery({
    queryKey: ['team-appraisals'],
    queryFn: async () => { const { data } = await performanceService.listTeamAppraisals({ limit: 30 }); return data; },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof selfAssessSchema>>({ resolver: zodResolver(selfAssessSchema) });

  const selfAssessMutation = useMutation({
    mutationFn: ({ id, d }: { id: string; d: any }) => performanceService.submitSelfAssessment(id, d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['appraisals'] }); reset(); setSelectedAppraisal(null); },
  });

  const managerRateMutation = useMutation({
    mutationFn: ({ id, rating, comments }: { id: string; rating: number; comments: string }) =>
      performanceService.submitManagerRating(id, rating, comments),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team-appraisals'] }),
  });

  const appraisals: any[] = data?.data ?? [];
  const teamList: any[] = teamAppraisals?.data ?? [];

  const RATING_LABELS: Record<number, string> = { 1: 'Needs Improvement', 2: 'Below Expectations', 3: 'Meets Expectations', 4: 'Exceeds Expectations', 5: 'Outstanding' };

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-6">
      {/* My appraisals */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">My Appraisals</h3>
        <div className="space-y-3">
          {appraisals.map((a: any) => (
            <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-semibold text-gray-900">{a.cycleTitle ?? a.cycle_title ?? 'Annual Review'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{safeDate(a.startDate ?? a.start_date)} → {safeDate(a.endDate ?? a.end_date)}</p>
                </div>
                <Badge variant={
                  a.status === 'Completed' ? 'success' :
                  a.status === 'ManagerReview' ? 'info' :
                  a.status === 'SelfAssessment' ? 'warning' : 'default'
                }>{a.status ?? 'Pending'}</Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-400 mb-1">Self Rating</p>
                  {a.selfRating ?? a.self_rating ? (
                    <>
                      <StarRating value={a.selfRating ?? a.self_rating ?? 0} />
                      <p className="text-xs text-gray-500 mt-1">{RATING_LABELS[a.selfRating ?? a.self_rating] ?? '—'}</p>
                    </>
                  ) : <span className="text-gray-300 text-sm">Not submitted</span>}
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-400 mb-1">Manager Rating</p>
                  {a.managerRating ?? a.manager_rating ? (
                    <>
                      <StarRating value={a.managerRating ?? a.manager_rating ?? 0} />
                      <p className="text-xs text-gray-500 mt-1">{RATING_LABELS[a.managerRating ?? a.manager_rating] ?? '—'}</p>
                    </>
                  ) : <span className="text-gray-300 text-sm">Pending</span>}
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-400 mb-1">Final Rating</p>
                  {a.finalRating ?? a.final_rating ? (
                    <>
                      <StarRating value={a.finalRating ?? a.final_rating ?? 0} />
                      <p className="text-xs text-gray-500 mt-1">{RATING_LABELS[a.finalRating ?? a.final_rating] ?? '—'}</p>
                    </>
                  ) : <span className="text-gray-300 text-sm">Pending</span>}
                </div>
              </div>

              {(a.status === 'SelfAssessment' || a.status === 'Pending') && !(a.selfRating ?? a.self_rating) && (
                selectedAppraisal?.id === a.id ? (
                  <form onSubmit={handleSubmit(d => selfAssessMutation.mutate({ id: a.id, d }))} className="border-t pt-4 space-y-3">
                    <p className="text-sm font-medium text-gray-700">Self Assessment</p>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Self Rating (1-5)</p>
                      <Select label="" options={[1,2,3,4,5].map(n => ({ value: String(n), label: `${n} — ${RATING_LABELS[n]}` }))} error={errors.selfRating?.message as string} {...register('selfRating')} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="Achievements *" error={errors.achievements?.message as string} {...register('achievements')} />
                      <Input label="Areas of Improvement" {...register('areasOfImprovement')} />
                      <Input label="Training Needs" {...register('trainingNeeds')} />
                      <Input label="Comments" {...register('comments')} />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" loading={selfAssessMutation.isPending}>Submit Assessment</Button>
                      <Button type="button" size="sm" variant="secondary" onClick={() => { reset(); setSelectedAppraisal(null); }}>Cancel</Button>
                    </div>
                  </form>
                ) : (
                  <Button size="sm" className="mt-2" onClick={() => setSelectedAppraisal(a)}>Submit Self Assessment</Button>
                )
              )}
            </div>
          ))}
          {appraisals.length === 0 && (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-400">
              <ClipboardCheck size={36} className="mx-auto mb-2 text-gray-300" />
              <p>No appraisals found</p>
            </div>
          )}
        </div>
      </div>

      {/* Team appraisals (manager view) */}
      {teamList.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Team Appraisals (Pending Manager Review)</h3>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 border-b border-gray-200">
                {['Employee', 'Cycle', 'Self Rating', 'Your Rating', 'Status', 'Action'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {teamList.map((a: any) => {
                  return (
                    <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium">{a.employeeName ?? a.employee?.fullName ?? '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{a.cycleTitle ?? a.cycle_title ?? '—'}</td>
                      <td className="px-4 py-3"><StarRating value={a.selfRating ?? a.self_rating ?? 0} /></td>
                      <td className="px-4 py-3"><StarRating value={a.managerRating ?? a.manager_rating ?? 0} /></td>
                      <td className="px-4 py-3"><Badge variant={a.status === 'ManagerReview' ? 'warning' : 'default'}>{a.status}</Badge></td>
                      <td className="px-4 py-3">
                        {(a.status === 'ManagerReview' || a.status === 'SelfAssessment') && (
                          <Button size="sm" onClick={() => managerRateMutation.mutate({ id: a.id, rating: 4, comments: 'Good performance' })}>
                            Rate
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── 360° Feedback tab ─────────────────────────────────────────────────────────

const feedbackSchema = z.object({
  revieweeId: z.string().min(1, 'Required'),
  relationship: z.string().min(1, 'Required'),
  technicalRating: z.coerce.number().min(1).max(5),
  communicationRating: z.coerce.number().min(1).max(5),
  teamworkRating: z.coerce.number().min(1).max(5),
  leadershipRating: z.coerce.number().min(1).max(5),
  strengths: z.string().min(1, 'Required'),
  improvements: z.string().optional(),
});

const RELATIONSHIPS = [
  { value: 'Peer', label: 'Peer' },
  { value: 'Subordinate', label: 'Subordinate' },
  { value: 'CrossFunctional', label: 'Cross-Functional' },
];

function FeedbackTab() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = React.useState(false);

  const { data: employees } = useQuery({
    queryKey: ['employees-short'],
    queryFn: async () => { const { data } = await employeeService.list({ limit: 100 }); return data; },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['my-feedback'],
    queryFn: async () => { const { data } = await performanceService.listMyFeedback({ limit: 30 }); return data; },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(feedbackSchema),
    defaultValues: { relationship: 'Peer' },
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => performanceService.submitFeedback(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['my-feedback'] }); reset(); setShowForm(false); },
  });

  const empOptions = (employees?.data ?? []).map((e: any) => ({ value: e.id, label: `${e.firstName ?? e.first_name} ${e.lastName ?? e.last_name}` }));
  const feedbackList: any[] = data?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">360° Feedback</h3>
        <Button size="sm" onClick={() => setShowForm(v => !v)}><Plus size={14} /> Give Feedback</Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <form onSubmit={handleSubmit(d => createMutation.mutate(d))} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Select label="Reviewee *" options={empOptions} error={errors.revieweeId?.message as string} {...register('revieweeId')} />
              <Select label="Relationship *" options={RELATIONSHIPS} {...register('relationship')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Technical', key: 'technicalRating' },
                { label: 'Communication', key: 'communicationRating' },
                { label: 'Teamwork', key: 'teamworkRating' },
                { label: 'Leadership', key: 'leadershipRating' },
              ].map(item => (
                <Select key={item.key} label={`${item.label} Rating *`}
                  options={[1,2,3,4,5].map(n => ({ value: String(n), label: `${n} Stars` }))}
                  {...register(item.key as any)} />
              ))}
            </div>
            <Input label="Strengths *" error={errors.strengths?.message as string} {...register('strengths')} />
            <Input label="Areas for Improvement" {...register('improvements')} />
            <div className="flex gap-2">
              <Button type="submit" size="sm" loading={createMutation.isPending}>Submit Feedback</Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => { reset(); setShowForm(false); }}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? <Spinner /> : (
        <div className="space-y-3">
          {feedbackList.map((f: any) => {
            const avg = ((Number(f.technicalRating ?? 0) + Number(f.communicationRating ?? 0) + Number(f.teamworkRating ?? 0) + Number(f.leadershipRating ?? 0)) / 4);
            return (
              <div key={f.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{f.revieweeName ?? f.reviewee?.fullName ?? 'Employee'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{f.relationship} · {safeDate(f.createdAt ?? f.created_at)}</p>
                  </div>
                  <div className="text-center">
                    <StarRating value={Math.round(avg)} />
                    <p className="text-xs text-gray-400 mt-0.5">Avg: {avg.toFixed(1)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[
                    { label: 'Technical', value: f.technicalRating ?? f.technical_rating ?? 0 },
                    { label: 'Communication', value: f.communicationRating ?? f.communication_rating ?? 0 },
                    { label: 'Teamwork', value: f.teamworkRating ?? f.teamwork_rating ?? 0 },
                    { label: 'Leadership', value: f.leadershipRating ?? f.leadership_rating ?? 0 },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-24">{item.label}</span>
                      <ProgressBar value={item.value} max={5} />
                      <span className="text-xs text-gray-400 w-4">{item.value}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600"><span className="font-medium">Strengths: </span>{f.strengths}</p>
                {f.improvements && <p className="text-sm text-gray-500 mt-1"><span className="font-medium">Improve: </span>{f.improvements}</p>}
              </div>
            );
          })}
          {feedbackList.length === 0 && (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-400">
              <Users size={36} className="mx-auto mb-2 text-gray-300" />
              <p>No feedback given yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Performance Reviews tab ───────────────────────────────────────────────────

function ReviewsTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['perf-reviews'],
    queryFn: async () => { const { data } = await performanceService.listReviews({ limit: 30 }); return data; },
  });

  const reviews: any[] = data?.data ?? [];

  if (isLoading) return <Spinner />;

  const RATING_COLORS: Record<number, string> = { 1: 'text-red-600', 2: 'text-orange-500', 3: 'text-yellow-600', 4: 'text-green-600', 5: 'text-emerald-700' };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">Performance Review History</h3>
      {reviews.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-400">
          <TrendingUp size={36} className="mx-auto mb-2 text-gray-300" />
          <p>No performance reviews on record</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b border-gray-200">
              {['Employee', 'Review Period', 'Overall Rating', 'Percentile', 'Increment', 'Status'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {reviews.map((r: any) => {
                const rating = r.overallRating ?? r.overall_rating ?? 0;
                return (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium">{r.employeeName ?? r.employee?.fullName ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{safeDate(r.periodStart ?? r.period_start)} → {safeDate(r.periodEnd ?? r.period_end)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <StarRating value={rating} />
                        <span className={`text-sm font-medium ${RATING_COLORS[Math.round(rating)] ?? ''}`}>{rating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{r.percentile ?? r.performancePercentile ?? '—'}{r.percentile ? '%' : ''}</td>
                    <td className="px-4 py-3 text-sm text-green-700 font-medium">{r.incrementPercent ?? r.increment_percent ? `${r.incrementPercent ?? r.increment_percent}%` : '—'}</td>
                    <td className="px-4 py-3"><Badge variant={r.status === 'Completed' ? 'success' : 'default'}>{r.status ?? 'Completed'}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Probation tab ─────────────────────────────────────────────────────────────

function ProbationTab() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['probation'],
    queryFn: async () => { const { data } = await performanceService.listProbation({ limit: 50 }); return data; },
  });

  const confirmMutation = useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: string }) => performanceService.submitProbationDecision(id, decision),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['probation'] }),
  });

  const list: any[] = data?.data ?? [];

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">Probation Tracking ({list.length})</h3>

      {list.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-400">
          <UserCheck size={36} className="mx-auto mb-2 text-gray-300" />
          <p>No employees on probation</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((p: any) => {
            const endDate = p.probationEndDate ?? p.probation_end_date ?? '';
            const daysLeft = endDate ? Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000) : null;
            return (
              <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{p.employeeName ?? p.employee?.fullName ?? '—'}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{p.designation ?? '—'} · {p.department ?? '—'}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Joining: {safeDate(p.joiningDate ?? p.joining_date)} · Probation ends: {safeDate(endDate)}
                  </p>
                </div>
                {daysLeft !== null && (
                  <div className={`text-center px-3 py-2 rounded-lg ${daysLeft <= 7 ? 'bg-red-50' : daysLeft <= 30 ? 'bg-yellow-50' : 'bg-green-50'}`}>
                    <p className={`text-lg font-bold ${daysLeft <= 7 ? 'text-red-600' : daysLeft <= 30 ? 'text-yellow-600' : 'text-green-600'}`}>{daysLeft}</p>
                    <p className="text-xs text-gray-400">days left</p>
                  </div>
                )}
                <Badge variant={p.status === 'Confirmed' ? 'success' : p.status === 'Extended' ? 'warning' : p.status === 'Terminated' ? 'danger' : 'default'}>
                  {p.status ?? 'OnProbation'}
                </Badge>
                {(!p.status || p.status === 'OnProbation' || p.status === 'Extended') && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => confirmMutation.mutate({ id: p.id, decision: 'Confirmed' })} loading={confirmMutation.isPending}>
                      <Check size={12} /> Confirm
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => confirmMutation.mutate({ id: p.id, decision: 'Extended' })}>
                      Extend
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PerformancePage() {
  const [tab, setTab] = React.useState('goals');

  return (
    <div>
      <PageHeader title="Performance" subtitle="Goals, appraisals, 360° feedback and performance reviews" />

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit flex-wrap">
        {TABS.map(t => {
          const I = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${tab === t.key ? 'bg-white shadow text-primary' : 'text-gray-600 hover:text-gray-900'}`}>
              <I size={14} />{t.label}
            </button>
          );
        })}
      </div>

      {tab === 'goals'      && <MyGoalsTab />}
      {tab === 'appraisals' && <AppraisalsTab />}
      {tab === 'feedback'   && <FeedbackTab />}
      {tab === 'reviews'    && <ReviewsTab />}
      {tab === 'probation'  && <ProbationTab />}
    </div>
  );
}
