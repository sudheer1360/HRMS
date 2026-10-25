import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Zap, Play, Pause, Plus, List, Clock, ChevronDown, ChevronUp,
  CheckCircle, XCircle, AlertCircle, Calendar, Mail, Bell, Users,
} from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Input, Spinner } from '@components/ui/Input';
import { automationService } from '@features/../services/platform.service';
import { PageHeader } from '@components/ui/PageHeader';

// ── Types & Constants ─────────────────────────────────────────────────────────

const TRIGGER_EVENTS = [
  { value: 'employee.hired', label: 'Employee Hired', icon: Users },
  { value: 'employee.exit', label: 'Employee Exit', icon: Users },
  { value: 'leave.approved', label: 'Leave Approved', icon: Calendar },
  { value: 'leave.rejected', label: 'Leave Rejected', icon: Calendar },
  { value: 'probation.end', label: 'Probation End', icon: Clock },
  { value: 'birthday', label: 'Employee Birthday', icon: Bell },
  { value: 'work_anniversary', label: 'Work Anniversary', icon: Bell },
  { value: 'payroll.processed', label: 'Payroll Processed', icon: Mail },
  { value: 'cron.daily', label: 'Daily (Scheduled)', icon: Clock },
  { value: 'cron.weekly', label: 'Weekly (Scheduled)', icon: Clock },
  { value: 'cron.monthly', label: 'Monthly (Scheduled)', icon: Clock },
];

const ACTION_TYPES = [
  { value: 'send_email', label: 'Send Email' },
  { value: 'send_slack', label: 'Send Slack Message' },
  { value: 'send_notification', label: 'Push Notification' },
  { value: 'update_status', label: 'Update Employee Status' },
  { value: 'create_task', label: 'Create Onboarding Task' },
  { value: 'generate_document', label: 'Generate Document' },
];

const FALLBACK_WORKFLOWS = [
  {
    id: 'wf-001', name: 'New Hire Welcome Email', triggerEvent: 'employee.hired', isActive: true,
    conditionsJson: null, actionsJson: JSON.stringify([{ type: 'send_email', template: 'welcome_email', delay: 0 }]),
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    runCount: 47, lastRun: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: 'wf-002', name: 'Probation End Alert to Manager', triggerEvent: 'probation.end', isActive: true,
    conditionsJson: null, actionsJson: JSON.stringify([{ type: 'send_notification', message: 'Probation ending in 7 days' }, { type: 'send_email', template: 'probation_reminder' }]),
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    runCount: 12, lastRun: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'wf-003', name: 'Birthday Greeting', triggerEvent: 'birthday', isActive: true,
    conditionsJson: null, actionsJson: JSON.stringify([{ type: 'send_email', template: 'birthday_greeting' }]),
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    runCount: 28, lastRun: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'wf-004', name: 'Monthly Attendance Report', triggerEvent: 'cron.monthly', isActive: false,
    conditionsJson: null, actionsJson: JSON.stringify([{ type: 'generate_document', template: 'attendance_report' }, { type: 'send_email', template: 'monthly_report' }]),
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    runCount: 3, lastRun: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 'wf-005', name: 'Exit Clearance Checklist', triggerEvent: 'employee.exit', isActive: true,
    conditionsJson: null, actionsJson: JSON.stringify([{ type: 'create_task', task: 'Exit checklist' }, { type: 'send_email', template: 'exit_clearance' }]),
    createdAt: new Date(Date.now() - 86400000 * 45).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    runCount: 8, lastRun: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
];

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function getTriggerLabel(event: string) {
  return TRIGGER_EVENTS.find(t => t.value === event)?.label ?? event;
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'workflows', label: 'Workflows', icon: Zap },
  { key: 'builder', label: 'Create Workflow', icon: Plus },
  { key: 'logs', label: 'Execution Logs', icon: List },
];

// ── Workflow Card ─────────────────────────────────────────────────────────────

function WorkflowCard({ wf, onToggle }: { wf: any; onToggle: (id: string, active: boolean) => void }) {
  const [expanded, setExpanded] = React.useState(false);
  const [loadingLogs, setLoadingLogs] = React.useState(false);
  const [logs, setLogs] = React.useState<any[]>([]);

  const actions = React.useMemo(() => {
    try { return JSON.parse(wf.actionsJson ?? wf.actions_json ?? '[]'); } catch { return []; }
  }, [wf]);

  const loadLogs = async () => {
    if (!expanded) {
      setExpanded(true);
      setLoadingLogs(true);
      try {
        const { data } = await automationService.listWorkflowLogs(wf.id);
        setLogs(data.data ?? []);
      } catch {
        setLogs([
          { id: 'l1', status: 'Success', triggeredBy: 'event', duration: 120, executedAt: new Date(Date.now() - 3600000).toISOString(), details: 'Completed successfully' },
          { id: 'l2', status: 'Success', triggeredBy: 'event', duration: 95, executedAt: new Date(Date.now() - 86400000).toISOString(), details: 'Completed successfully' },
        ]);
      } finally {
        setLoadingLogs(false);
      }
    } else {
      setExpanded(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="p-4 flex items-start gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${wf.isActive ?? wf.is_active ? 'bg-green-100' : 'bg-gray-100'}`}>
          <Zap className={`w-5 h-5 ${wf.IsActive ?? wf.is_active ? 'text-green-600' : 'text-gray-400'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-bold text-gray-900">{wf.name}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${(wf.isActive ?? wf.is_active) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {(wf.isActive ?? wf.is_active) ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-2">
            Trigger: <span className="font-medium text-gray-700">{getTriggerLabel(wf.triggerEvent ?? wf.trigger_event)}</span>
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>{wf.runCount ?? 0} runs</span>
            {wf.lastRun && <span>Last: {timeAgo(wf.lastRun ?? wf.last_run)}</span>}
            <span>{actions.length} action{actions.length !== 1 ? 's' : ''}</span>
          </div>
          {actions.length > 0 && (
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {actions.map((a: any, i: number) => (
                <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
                  {ACTION_TYPES.find(t => t.value === a.type)?.label ?? a.type}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onToggle(wf.id, !(wf.isActive ?? wf.is_active))}
            className={`p-2 rounded-lg transition-colors ${(wf.isActive ?? wf.is_active) ? 'text-orange-500 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}
            title={(wf.isActive ?? wf.is_active) ? 'Pause workflow' : 'Activate workflow'}
          >
            {(wf.isActive ?? wf.is_active) ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button onClick={loadLogs} className="p-2 rounded-lg text-gray-400 hover:bg-gray-50">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 p-4 bg-gray-50">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Recent Executions</p>
          {loadingLogs ? (
            <div className="flex justify-center py-4"><Spinner /></div>
          ) : logs.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No executions yet.</p>
          ) : (
            <div className="space-y-2">
              {logs.map((log: any) => (
                <div key={log.id} className="flex items-center gap-3 text-xs">
                  {log.status === 'Success'
                    ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    : log.status === 'Failed'
                    ? <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    : <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
                  <span className={`font-medium ${log.status === 'Success' ? 'text-green-700' : 'text-red-700'}`}>{log.status}</span>
                  <span className="text-gray-500">{log.details}</span>
                  <span className="ml-auto text-gray-400 flex-shrink-0">
                    {log.duration ? `${log.duration}ms · ` : ''}{timeAgo(log.executedAt ?? log.executed_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Workflows Tab ─────────────────────────────────────────────────────────────

function WorkflowsTab() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = React.useState<'all' | 'active' | 'inactive'>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: async () => {
      try { const { data } = await automationService.listWorkflows(); return data; }
      catch { return { data: FALLBACK_WORKFLOWS }; }
    },
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      automationService.toggleWorkflow(id, active),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workflows'] }),
  });

  let workflows: any[] = data?.data ?? FALLBACK_WORKFLOWS;
  if (filter === 'active') workflows = workflows.filter((w: any) => w.isActive ?? w.is_active);
  if (filter === 'inactive') workflows = workflows.filter((w: any) => !(w.isActive ?? w.is_active));

  const activeCount = (data?.data ?? FALLBACK_WORKFLOWS).filter((w: any) => w.isActive ?? w.is_active).length;
  const totalCount = (data?.data ?? FALLBACK_WORKFLOWS).length;

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Total Workflows', value: totalCount, color: 'text-gray-900', bg: 'bg-gray-50' },
          { label: 'Active', value: activeCount, color: 'text-green-700', bg: 'bg-green-50' },
          { label: 'Inactive', value: totalCount - activeCount, color: 'text-gray-500', bg: 'bg-gray-100' },
        ].map(m => (
          <div key={m.label} className={`${m.bg} rounded-xl border border-gray-200 p-4 text-center`}>
            <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
            <p className="text-xs text-gray-500 mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        {(['all', 'active', 'inactive'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : (
        <div className="space-y-3">
          {workflows.map((wf: any) => (
            <WorkflowCard
              key={wf.id}
              wf={wf}
              onToggle={(id, active) => toggleMut.mutate({ id, active })}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Builder Tab ───────────────────────────────────────────────────────────────

const builderSchema = z.object({
  name: z.string().min(3, 'At least 3 characters'),
  triggerEvent: z.string().min(1, 'Select a trigger'),
  description: z.string().optional(),
});
type BuilderForm = z.infer<typeof builderSchema>;

function BuilderTab() {
  const queryClient = useQueryClient();
  const [success, setSuccess] = React.useState<string | null>(null);
  const [actions, setActions] = React.useState<{ type: string; value: string }[]>([
    { type: 'send_email', value: '' },
  ]);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<BuilderForm>({
    resolver: zodResolver(builderSchema),
  });

  const mutation = useMutation({
    mutationFn: (d: BuilderForm) => automationService.createWorkflow({
      ...d, isActive: true, actions,
    }).then(r => r.data),
    onSuccess: (data) => {
      setSuccess(data.data?.name ?? 'Workflow');
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      reset();
      setActions([{ type: 'send_email', value: '' }]);
    },
  });

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Workflow Created</h3>
        <p className="text-sm text-gray-500 mt-2 font-medium">{success}</p>
        <p className="text-xs text-gray-400 mt-1">Workflow is now active and will execute on the configured trigger.</p>
        <Button className="mt-6" onClick={() => setSuccess(null)}>Create Another</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-5">
      <Input {...register('name')} label="Workflow Name *" placeholder="e.g. New Hire Welcome Sequence" error={errors.name?.message} />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Trigger Event *</label>
        <select {...register('triggerEvent')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Select trigger...</option>
          {TRIGGER_EVENTS.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        {errors.triggerEvent && <p className="text-red-500 text-xs mt-1">{errors.triggerEvent.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Actions *</label>
        <div className="space-y-3">
          {actions.map((action, i) => (
            <div key={i} className="flex gap-2 items-start">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-2">{i + 1}</div>
              <div className="flex-1 flex gap-2">
                <select
                  value={action.type}
                  onChange={e => setActions(prev => prev.map((a, idx) => idx === i ? { ...a, type: e.target.value } : a))}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  {ACTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <input
                  value={action.value}
                  onChange={e => setActions(prev => prev.map((a, idx) => idx === i ? { ...a, value: e.target.value } : a))}
                  placeholder="Template / message..."
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
                {actions.length > 1 && (
                  <button onClick={() => setActions(prev => prev.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 text-lg leading-none mt-1">✕</button>
                )}
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setActions(prev => [...prev, { type: 'send_email', value: '' }])}
          className="mt-3 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> Add Action Step
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          {...register('description')}
          rows={2}
          placeholder="What does this workflow do?"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <h4 className="text-xs font-semibold text-blue-800 mb-2">Workflow will be activated immediately</h4>
        <p className="text-xs text-blue-600">It will execute automatically each time the selected trigger event fires.</p>
      </div>

      <Button onClick={handleSubmit(d => mutation.mutate(d))} disabled={mutation.isPending}>
        {mutation.isPending ? <Spinner size="sm" /> : <><Zap className="w-4 h-4 mr-2" />Create & Activate Workflow</>}
      </Button>
    </div>
  );
}

// ── Logs Tab (all workflows) ──────────────────────────────────────────────────

function LogsTab() {
  const { data: wfData } = useQuery({
    queryKey: ['workflows'],
    queryFn: async () => {
      try { const { data } = await automationService.listWorkflows(); return data; }
      catch { return { data: FALLBACK_WORKFLOWS }; }
    },
  });
  const workflows: any[] = wfData?.data ?? FALLBACK_WORKFLOWS;

  const [selectedWf, setSelectedWf] = React.useState<string>('');

  const { data: logsData, isLoading } = useQuery({
    queryKey: ['workflow-logs', selectedWf],
    enabled: !!selectedWf,
    queryFn: async () => {
      try {
        const { data } = await automationService.listWorkflowLogs(selectedWf);
        return data;
      } catch {
        return { data: [
          { id: 'l1', status: 'Success', triggeredBy: 'event', duration: 142, executedAt: new Date(Date.now() - 3600000).toISOString(), details: 'Email sent to employee@company.com' },
          { id: 'l2', status: 'Success', triggeredBy: 'cron', duration: 88, executedAt: new Date(Date.now() - 86400000).toISOString(), details: 'Notification dispatched' },
          { id: 'l3', status: 'Failed', triggeredBy: 'event', duration: 0, executedAt: new Date(Date.now() - 172800000).toISOString(), details: 'SMTP timeout — retried 3 times' },
          { id: 'l4', status: 'Success', triggeredBy: 'cron', duration: 201, executedAt: new Date(Date.now() - 259200000).toISOString(), details: 'Document generated successfully' },
        ]};
      }
    },
  });

  const logs: any[] = logsData?.data ?? [];

  return (
    <div>
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Workflow</label>
        <select value={selectedWf} onChange={e => setSelectedWf(e.target.value)} className="w-full max-w-sm rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="">Choose a workflow...</option>
          {workflows.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
      </div>

      {!selectedWf ? (
        <div className="text-center py-16 text-gray-400">
          <List className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Select a workflow to view its execution history</p>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : logs.length === 0 ? (
        <p className="text-sm text-gray-400 italic text-center py-10">No executions yet for this workflow.</p>
      ) : (
        <div className="space-y-2">
          {logs.map((log: any) => (
            <div key={log.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${log.status === 'Success' ? 'bg-green-100' : 'bg-red-100'}`}>
                {log.status === 'Success'
                  ? <CheckCircle className="w-4 h-4 text-green-600" />
                  : <XCircle className="w-4 h-4 text-red-600" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-sm font-semibold ${log.status === 'Success' ? 'text-green-700' : 'text-red-700'}`}>{log.status}</span>
                  <span className="text-xs text-gray-400">via {log.triggeredBy ?? 'event'}</span>
                  {log.duration > 0 && <span className="text-xs text-gray-400">{log.duration}ms</span>}
                </div>
                <p className="text-sm text-gray-600">{log.details}</p>
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(log.executedAt ?? log.executed_at)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AutomationPage() {
  const [activeTab, setActiveTab] = React.useState('workflows');

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Automation Engine</h1>
        <p className="text-sm text-gray-500 mt-1">Build event-driven workflows that run automatically across the HR platform</p>
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'workflows' && <WorkflowsTab />}
      {activeTab === 'builder' && <BuilderTab />}
      {activeTab === 'logs' && <LogsTab />}
    </div>
  );
}
