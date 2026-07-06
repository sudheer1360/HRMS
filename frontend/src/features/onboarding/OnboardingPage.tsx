import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  UserPlus, CheckSquare, ClipboardList, ShieldCheck,
  Plus, Trash2, Check, X, Circle,
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
  { key: 'active',    label: 'Active Onboarding', icon: UserPlus },
  { key: 'templates', label: 'Checklist Templates', icon: ClipboardList },
  { key: 'tasks',     label: 'My Tasks',           icon: CheckSquare },
  { key: 'bgv',       label: 'BGV Status',         icon: ShieldCheck },
];

const TASK_CATEGORIES = [
  { value: 'IT Setup', label: 'IT Setup' },
  { value: 'HR Documentation', label: 'HR Documentation' },
  { value: 'Asset Allocation', label: 'Asset Allocation' },
  { value: 'Access Provisioning', label: 'Access Provisioning' },
  { value: 'Training', label: 'Training' },
  { value: 'Buddy Assignment', label: 'Buddy Assignment' },
  { value: 'Bank Setup', label: 'Bank Setup' },
  { value: 'Policy Acknowledgement', label: 'Policy Acknowledgement' },
  { value: 'Other', label: 'Other' },
];

const OWNER_OPTIONS = [
  { value: 'HR', label: 'HR' },
  { value: 'IT', label: 'IT' },
  { value: 'Manager', label: 'Manager' },
  { value: 'Employee', label: 'New Employee' },
  { value: 'Finance', label: 'Finance' },
];

// ── Active Onboarding tab ─────────────────────────────────────────────────────

function ActiveOnboardingTab() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['onboarding-active'],
    queryFn: async () => { const { data } = await api.get('/extended/onboarding?status=InProgress&limit=50'); return data.data ?? []; },
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/extended/onboarding/${id}/complete`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['onboarding-active'] }),
  });

  const onboardings: any[] = data ?? [];

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-4">
      {onboardings.length === 0 && (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-400">
          <UserPlus size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No active onboarding in progress</p>
          <p className="text-sm mt-1">New hires will appear here after accepting their offer</p>
        </div>
      )}

      {onboardings.map((ob: any) => {
        const tasks: any[] = ob.tasks ?? [];
        const done = tasks.filter(t => t.status === 'Completed').length;
        const total = tasks.length;
        const pct = total ? Math.round((done / total) * 100) : 0;

        return (
          <div key={ob.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="font-semibold text-gray-900 text-lg">{ob.employeeName ?? ob.employee?.fullName ?? 'New Employee'}</p>
                <p className="text-sm text-gray-500">{ob.designation ?? '—'} · Joining: {safeDate(ob.joiningDate ?? ob.joining_date)}</p>
              </div>
              <Badge variant={pct === 100 ? 'success' : pct > 50 ? 'info' : 'warning'}>{pct}% Complete</Badge>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{done} of {total} tasks done</span>
                <span>{pct}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full">
                <div className={`h-2 rounded-full ${pct === 100 ? 'bg-green-500' : 'bg-primary'}`} style={{ width: `${pct}%` }} />
              </div>
            </div>

            {/* Task list */}
            <div className="space-y-1.5">
              {tasks.map((t: any) => (
                <div key={t.id} className="flex items-center gap-3 text-sm">
                  {t.status === 'Completed'
                    ? <Check size={14} className="text-green-600 shrink-0" />
                    : <Circle size={14} className="text-gray-300 shrink-0" />
                  }
                  <span className={t.status === 'Completed' ? 'line-through text-gray-400' : 'text-gray-700'}>{t.taskName ?? t.task_name}</span>
                  <Badge variant="default" className="ml-auto text-xs">{t.owner ?? t.assignedTo ?? 'HR'}</Badge>
                </div>
              ))}
            </div>

            {pct === 100 && (
              <div className="mt-4">
                <Button size="sm" onClick={() => completeMutation.mutate(ob.id)} loading={completeMutation.isPending}>
                  <CheckSquare size={14} /> Mark Onboarding Complete
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Checklist Templates tab ───────────────────────────────────────────────────

const templateSchema = z.object({
  name: z.string().min(1, 'Required'),
  description: z.string().optional(),
  employmentType: z.string().optional(),
});

const taskItemSchema = z.object({
  taskName: z.string().min(1, 'Required'),
  category: z.string().min(1, 'Required'),
  owner: z.string().min(1, 'Required'),
  dueDays: z.coerce.number().min(0).optional(),
  mandatory: z.string().optional(),
});

function ChecklistTemplatesTab() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = React.useState<any>(null);
  const [confirmId, setConfirmId] = React.useState<string | null>(null);
  const [showTemplateForm, setShowTemplateForm] = React.useState(false);
  const [showTaskForm, setShowTaskForm] = React.useState(false);

  const { data: templates, isLoading } = useQuery({
    queryKey: ['ob-templates'],
    queryFn: async () => { const { data } = await api.get('/extended/onboarding/templates?limit=30'); return data.data ?? []; },
  });

  const { data: templateTasks } = useQuery({
    queryKey: ['ob-template-tasks', selected?.id],
    enabled: !!selected,
    queryFn: async () => { const { data } = await api.get(`/extended/onboarding/templates/${selected.id}/tasks`); return data.data ?? []; },
  });

  const { register: regT, handleSubmit: hsT, reset: resetT, formState: { errors: errT } } = useForm({
    resolver: zodResolver(templateSchema),
    defaultValues: { employmentType: 'FullTime' },
  });

  const { register: regTask, handleSubmit: hsTask, reset: resetTask, formState: { errors: errTask } } = useForm({
    resolver: zodResolver(taskItemSchema),
    defaultValues: { owner: 'HR', category: 'HR Documentation', dueDays: 1, mandatory: 'true' },
  });

  const saveTplMutation = useMutation({
    mutationFn: (d: any) => api.post('/extended/onboarding/templates', d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['ob-templates'] }); resetT(); setShowTemplateForm(false); },
  });

  const saveTaskMutation = useMutation({
    mutationFn: (d: any) => api.post(`/extended/onboarding/templates/${selected.id}/tasks`, { ...d, mandatory: d.mandatory === 'true' }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['ob-template-tasks'] }); resetTask(); setShowTaskForm(false); },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => api.delete(`/extended/onboarding/tasks/${taskId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ob-template-tasks'] }),
  });

  const empTypeOptions = [
    { value: 'FullTime', label: 'Full Time' },
    { value: 'Contract', label: 'Contract' },
    { value: 'Intern', label: 'Intern' },
  ];

  const templates_: any[] = templates ?? [];
  const tasks_: any[] = templateTasks ?? [];

  if (isLoading) return <Spinner />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Template list */}
      <div className="lg:col-span-1 space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-900 text-sm">Templates</h3>
          <Button size="sm" onClick={() => setShowTemplateForm(v => !v)}><Plus size={12} /></Button>
        </div>

        {showTemplateForm && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <form onSubmit={hsT(d => saveTplMutation.mutate(d))} className="space-y-3">
              <Input label="Name *" error={errT.name?.message as string} {...regT('name')} />
              <Select label="Employment Type" options={empTypeOptions} {...regT('employmentType')} />
              <Input label="Description" {...regT('description')} />
              <div className="flex gap-2">
                <Button type="submit" size="sm" loading={saveTplMutation.isPending}>Save</Button>
                <Button type="button" size="sm" variant="secondary" onClick={() => { resetT(); setShowTemplateForm(false); }}>Cancel</Button>
              </div>
            </form>
          </div>
        )}

        {templates_.map(tpl => (
          <button
            key={tpl.id}
            onClick={() => setSelected(tpl)}
            className={`w-full text-left bg-white rounded-xl border p-4 hover:shadow-sm transition-shadow ${selected?.id === tpl.id ? 'border-primary' : 'border-gray-200'}`}
          >
            <p className="font-medium text-gray-900">{tpl.name}</p>
            <p className="text-xs text-gray-400 mt-1">{tpl.employmentType ?? 'All'} · {tpl.taskCount ?? 0} tasks</p>
          </button>
        ))}

        {templates_.length === 0 && !showTemplateForm && (
          <p className="text-sm text-gray-400 text-center py-4">No templates yet</p>
        )}
      </div>

      {/* Task items */}
      <div className="lg:col-span-2">
        {!selected ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 h-full p-10 text-center text-gray-400 flex items-center justify-center">
            <p>Select a template to view and edit tasks</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{selected.name} — Tasks</h3>
              <Button size="sm" onClick={() => setShowTaskForm(v => !v)}><Plus size={14} /> Add Task</Button>
            </div>

            {showTaskForm && (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <form onSubmit={hsTask(d => saveTaskMutation.mutate(d))} className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <Input label="Task Name *" error={errTask.taskName?.message as string} {...regTask('taskName')} />
                  </div>
                  <Select label="Category *" options={TASK_CATEGORIES} {...regTask('category')} />
                  <Select label="Owner *" options={OWNER_OPTIONS} {...regTask('owner')} />
                  <Input label="Due (days from joining)" type="number" {...regTask('dueDays')} />
                  <Select label="Mandatory" options={[{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }]} {...regTask('mandatory')} />
                  <div className="col-span-2 flex gap-2">
                    <Button type="submit" size="sm" loading={saveTaskMutation.isPending}>Add</Button>
                    <Button type="button" size="sm" variant="secondary" onClick={() => { resetTask(); setShowTaskForm(false); }}>Cancel</Button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
              {tasks_.map((t: any) => (
                <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${t.mandatory ? 'bg-red-400' : 'bg-gray-300'}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{t.taskName ?? t.task_name}</p>
                    <p className="text-xs text-gray-400">{t.category} · {t.owner} · Day {t.dueDays ?? t.due_days ?? 1}</p>
                  </div>
                  <button onClick={() => setConfirmId(t.id)} className="p-1.5 rounded hover:bg-red-50 hover:text-danger text-gray-300">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              {tasks_.length === 0 && (
                <p className="px-4 py-8 text-center text-sm text-gray-400">No tasks in this template yet</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── My Tasks tab ──────────────────────────────────────────────────────────────

function MyTasksTab() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['my-ob-tasks'],
    queryFn: async () => { const { data } = await api.get('/extended/onboarding/my-tasks?limit=50'); return data.data ?? []; },
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/extended/onboarding/tasks/${id}/complete`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-ob-tasks'] }),
  });

  const tasks: any[] = data ?? [];
  const pending = tasks.filter(t => t.status !== 'Completed');
  const done = tasks.filter(t => t.status === 'Completed');

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Pending ({pending.length})</h3>
        <div className="space-y-2">
          {pending.map((t: any) => (
            <div key={t.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full shrink-0 ${t.mandatory ? 'bg-red-400' : 'bg-gray-300'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{t.taskName ?? t.task_name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t.category} · Due: {t.dueDays ?? t.due_days ? `Day ${t.dueDays ?? t.due_days}` : '—'} · For: {t.employeeName ?? 'New Employee'}</p>
              </div>
              <Button size="sm" onClick={() => completeMutation.mutate(t.id)} loading={completeMutation.isPending}>
                <Check size={14} /> Done
              </Button>
            </div>
          ))}
          {pending.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
              <CheckSquare size={32} className="mx-auto mb-2 text-gray-300" />
              <p>All tasks completed!</p>
            </div>
          )}
        </div>
      </div>

      {done.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-700 mb-3">Completed ({done.length})</h3>
          <div className="space-y-2 opacity-60">
            {done.map((t: any) => (
              <div key={t.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
                <Check size={14} className="text-green-600 shrink-0" />
                <p className="text-sm text-gray-500 line-through">{t.taskName ?? t.task_name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── BGV Status tab ────────────────────────────────────────────────────────────

const BGV_CHECKS = ['Identity', 'Address', 'Employment', 'Education', 'Criminal', 'Reference', 'Credit'];

function BGVTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['bgv-status'],
    queryFn: async () => { const { data } = await api.get('/extended/onboarding/bgv?limit=50'); return data.data ?? []; },
  });

  const bgvList: any[] = data ?? [];

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-4">
      {bgvList.length === 0 && (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-400">
          <ShieldCheck size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No BGV records</p>
          <p className="text-sm mt-1">Background verification records appear here once initiated</p>
        </div>
      )}

      {bgvList.map((b: any) => {
        const checks: Record<string, string> = b.checks ?? {};
        const allClear = BGV_CHECKS.every(c => checks[c] === 'Clear');
        const hasFailed = BGV_CHECKS.some(c => checks[c] === 'Failed');

        return (
          <div key={b.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-semibold text-gray-900">{b.employeeName ?? 'Employee'}</p>
                <p className="text-xs text-gray-400">{b.agencyName ?? 'Internal'} · Initiated: {safeDate(b.initiatedAt ?? b.initiated_at)}</p>
              </div>
              <Badge variant={allClear ? 'success' : hasFailed ? 'danger' : 'warning'}>
                {allClear ? 'All Clear' : hasFailed ? 'Issues Found' : 'In Progress'}
              </Badge>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
              {BGV_CHECKS.map(check => {
                const status = checks[check] ?? 'Pending';
                return (
                  <div key={check} className={`p-2 rounded-lg text-center text-xs ${
                    status === 'Clear' ? 'bg-green-50 text-green-700' :
                    status === 'Failed' ? 'bg-red-50 text-red-700' :
                    status === 'InProgress' ? 'bg-blue-50 text-blue-700' :
                    'bg-gray-50 text-gray-400'
                  }`}>
                    {status === 'Clear' ? <Check size={12} className="mx-auto mb-0.5 text-green-600" /> :
                     status === 'Failed' ? <X size={12} className="mx-auto mb-0.5 text-red-600" /> :
                     <Circle size={12} className="mx-auto mb-0.5" />}
                    <p className="font-medium">{check}</p>
                    <p className="text-[10px] opacity-70">{status}</p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const [tab, setTab] = React.useState('active');

  return (
    <div>
      <PageHeader title="Onboarding" subtitle="Manage checklists, tasks, and background verification" />

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

      {tab === 'active'    && <ActiveOnboardingTab />}
      {tab === 'templates' && <ChecklistTemplatesTab />}
      {tab === 'tasks'     && <MyTasksTab />}
      {tab === 'bgv'       && <BGVTab />}
      <ConfirmDialog
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={() => { deleteTaskMutation.mutate(confirmId!); setConfirmId(null); }}
        message="Delete this onboarding task?"
        confirmLabel="Delete Task"
        loading={deleteTaskMutation.isPending}
      />
    </div>
  );
}
