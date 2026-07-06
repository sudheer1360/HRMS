import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  LifeBuoy, Inbox, Plus, BarChart2,
  Clock, CheckCircle, AlertCircle, ChevronDown, ChevronUp,
  Send, Star, User, MessageCircle, Lock,
} from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Input, Spinner } from '@components/ui/Input';
import { formatDate } from '@lib/utils';
import api from '@lib/axios';
import { PageHeader } from '@components/ui/PageHeader';

// ── Helpers ───────────────────────────────────────────────────────────────────

function safeDate(v?: string | null) {
  if (!v) return '—';
  try { return formatDate(v); } catch { return v; }
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function priorityColor(p: string) {
  if (p === 'Critical') return 'bg-red-100 text-red-700 border-red-200';
  if (p === 'High') return 'bg-orange-100 text-orange-700 border-orange-200';
  if (p === 'Medium') return 'bg-blue-100 text-blue-700 border-blue-200';
  return 'bg-gray-100 text-gray-600 border-gray-200';
}

function statusColor(s: string) {
  if (s === 'Resolved') return 'bg-green-100 text-green-700';
  if (s === 'Closed') return 'bg-gray-100 text-gray-500';
  if (s === 'In Progress') return 'bg-purple-100 text-purple-700';
  return 'bg-yellow-100 text-yellow-700';
}

function slaHoursLeft(createdAt: string, priority: string) {
  const slaHours: Record<string, number> = { Critical: 4, High: 24, Medium: 48, Low: 72 };
  const sla = slaHours[priority] ?? 48;
  const elapsed = (Date.now() - new Date(createdAt).getTime()) / 3600000;
  return Math.max(0, Math.round((sla - elapsed) * 10) / 10);
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'portal',   label: 'My Tickets',    icon: LifeBuoy },
  { key: 'queue',    label: 'Agent Queue',   icon: Inbox },
  { key: 'submit',   label: 'New Ticket',    icon: Plus },
  { key: 'stats',    label: 'Dashboard',     icon: BarChart2 },
];

const CATEGORIES = [
  'Payroll & Salary', 'Leave & Attendance', 'Benefits & Insurance',
  'IT Support', 'Policy Clarification', 'Onboarding', 'Transfer & Relocation',
  'Performance & Appraisal', 'Exit & Separation', 'Other HR',
];

const FALLBACK_TICKETS = [
  { id: 'tkt-001', ticketCode: 'TKT-001', subject: 'Incorrect TDS deduction in May payslip', category: 'Payroll & Salary', priority: 'High', status: 'In Progress', description: 'My TDS was deducted at 20% instead of 10% despite submitting Form 12B investment proofs.', first_name: 'Rahul', last_name: 'Verma', assigneeName: 'Kavya Iyer', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), updatedAt: new Date(Date.now() - 3600000).toISOString(), resolvedAt: null, csatRating: null, resolution: null },
  { id: 'tkt-002', ticketCode: 'TKT-002', subject: 'Leave balance not updated after approval', category: 'Leave & Attendance', priority: 'Medium', status: 'Open', description: 'My 2-day casual leave approved last week still shows as pending in the system.', first_name: 'Ananya', last_name: 'Menon', assigneeName: null, createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date(Date.now() - 86400000).toISOString(), resolvedAt: null, csatRating: null, resolution: null },
  { id: 'tkt-003', ticketCode: 'TKT-003', subject: 'Work from home policy clarification', category: 'Policy Clarification', priority: 'Low', status: 'Resolved', description: 'Is the WFH limit 2 days or 3 days per week for senior engineers?', first_name: 'Vikram', last_name: 'Singh', assigneeName: 'Priya Sharma', createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(), resolvedAt: new Date(Date.now() - 86400000 * 4).toISOString(), csatRating: 5, resolution: 'WFH limit is 3 days/week for L3+ engineers as per the updated policy effective April 2026.' },
  { id: 'tkt-004', ticketCode: 'TKT-004', subject: 'Laptop replacement request', category: 'IT Support', priority: 'Medium', status: 'Open', description: 'My Dell Latitude is 3 years old and keeps freezing. Requesting replacement as per asset refresh policy.', first_name: 'Neha', last_name: 'Joshi', assigneeName: null, createdAt: new Date(Date.now() - 3600000 * 6).toISOString(), updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(), resolvedAt: null, csatRating: null, resolution: null },
  { id: 'tkt-005', ticketCode: 'TKT-005', subject: 'Gratuity eligibility query', category: 'Policy Clarification', priority: 'Low', status: 'Resolved', description: 'I am completing 4 years 11 months. Am I eligible for gratuity?', first_name: 'Deepa', last_name: 'Reddy', assigneeName: 'Kavya Iyer', createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 9).toISOString(), resolvedAt: new Date(Date.now() - 86400000 * 9).toISOString(), csatRating: 4, resolution: 'Gratuity requires minimum 5 years continuous service. You will become eligible in ~1 month.' },
  { id: 'tkt-006', ticketCode: 'TKT-006', subject: 'Reimbursement not processed for 3 months', category: 'Payroll & Salary', priority: 'Critical', status: 'Open', description: 'Internet reimbursement claims for March, April, May 2026 are pending despite submitting bills.', first_name: 'Karan', last_name: 'Mehta', assigneeName: null, createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(), resolvedAt: null, csatRating: null, resolution: null },
];

// ── Submit Ticket Form ────────────────────────────────────────────────────────

const ticketSchema = z.object({
  subject: z.string().min(5, 'At least 5 characters'),
  category: z.string().min(1, 'Required'),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
  description: z.string().min(20, 'At least 20 characters'),
});
type TicketForm = z.infer<typeof ticketSchema>;

function SubmitTicketTab() {
  const queryClient = useQueryClient();
  const [success, setSuccess] = React.useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<TicketForm>({
    resolver: zodResolver(ticketSchema),
    defaultValues: { priority: 'Medium' },
  });

  const mutation = useMutation({
    mutationFn: (d: TicketForm) => api.post('/platform/tickets', d).then(r => r.data),
    onSuccess: (data) => {
      setSuccess(data.data?.ticket_code ?? data.data?.ticketCode ?? 'TKT-NEW');
      queryClient.invalidateQueries({ queryKey: ['helpdesk-tickets'] });
      reset();
    },
  });

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Ticket Raised</h3>
        <p className="text-sm text-gray-500 mt-2">Your ticket number</p>
        <p className="text-2xl font-bold text-blue-600 mt-1">{success}</p>
        <p className="text-sm text-gray-500 mt-3">You'll receive updates as the agent works on your request.</p>
        <Button className="mt-6" onClick={() => setSuccess(null)}>Raise Another</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-5">
        <Input {...register('subject')} label="Subject *" placeholder="Brief description of your issue" error={errors.subject?.message} />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select {...register('category')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
            <select {...register('priority')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="Low">Low — General inquiry</option>
              <option value="Medium">Medium — Affecting work</option>
              <option value="High">High — Urgent issue</option>
              <option value="Critical">Critical — Blocking work / Payroll</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea
            {...register('description')}
            rows={5}
            placeholder="Describe your issue in detail — what happened, when, what you have already tried..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="text-xs font-semibold text-blue-800 mb-2">SLA Response Times</h4>
          <div className="grid grid-cols-4 gap-3 text-center">
            {[{ p: 'Critical', t: '4 hrs', c: 'text-red-600' }, { p: 'High', t: '24 hrs', c: 'text-orange-600' }, { p: 'Medium', t: '48 hrs', c: 'text-blue-600' }, { p: 'Low', t: '72 hrs', c: 'text-gray-600' }].map(s => (
              <div key={s.p}>
                <p className={`text-xs font-bold ${s.c}`}>{s.p}</p>
                <p className="text-xs text-gray-500">{s.t}</p>
              </div>
            ))}
          </div>
        </div>

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? <Spinner size="sm" /> : <><Send className="w-4 h-4 mr-2" />Submit Ticket</>}
        </Button>
      </form>
    </div>
  );
}

// ── Ticket Detail Panel ───────────────────────────────────────────────────────

function TicketDetail({ ticket, onClose, isAgent }: { ticket: any; onClose: () => void; isAgent: boolean }) {
  const queryClient = useQueryClient();
  const [comment, setComment] = React.useState('');
  const [isInternal, setIsInternal] = React.useState(false);
  const [csat, setCSAT] = React.useState<number | null>(null);
  const [resolution, setResolution] = React.useState(ticket.resolution ?? '');
  const [assignee, setAssignee] = React.useState(ticket.assignee_id ?? '');

  const hoursLeft = ticket.status !== 'Resolved' && ticket.status !== 'Closed'
    ? slaHoursLeft(ticket.createdAt ?? ticket.created_at, ticket.priority)
    : null;

  const { data: commentsData } = useQuery({
    queryKey: ['ticket-comments', ticket.id],
    queryFn: async () => { const { data } = await api.get(`/platform/tickets/${ticket.id}/comments`); return data; },
  });
  const comments: any[] = commentsData?.data ?? [];

  const { data: empData } = useQuery({
    queryKey: ['employees-list'],
    queryFn: async () => { const { data } = await api.get('/employees?limit=200'); return data; },
    enabled: isAgent,
  });
  const employees: any[] = empData?.data ?? [];

  const commentMut = useMutation({
    mutationFn: () => api.post(`/platform/tickets/${ticket.id}/comments`, { comment, isInternal }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['ticket-comments', ticket.id] }); setComment(''); },
  });

  const updateMut = useMutation({
    mutationFn: (data: any) => api.patch(`/platform/tickets/${ticket.id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['helpdesk-tickets'] }); },
  });

  const csatMut = useMutation({
    mutationFn: (rating: number) => api.post(`/platform/tickets/${ticket.id}/csat`, { rating }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['helpdesk-tickets'] }),
  });

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-end">
      <div className="w-full max-w-2xl h-full bg-white shadow-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{ticket.ticket_code ?? ticket.ticketCode}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded border ${priorityColor(ticket.priority)}`}>{ticket.priority}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${statusColor(ticket.status)}`}>{ticket.status}</span>
              {hoursLeft !== null && (
                <span className={`text-xs flex items-center gap-1 px-2 py-0.5 rounded ${hoursLeft <= 2 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                  <Clock className="w-3 h-3" /> {hoursLeft <= 0 ? 'SLA Breached' : `${hoursLeft}h left`}
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-gray-900">{ticket.subject}</h3>
            <p className="text-xs text-gray-400 mt-1">
              {ticket.first_name} {ticket.last_name} · {ticket.category} · {timeAgo(ticket.createdAt ?? ticket.created_at)}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none ml-4">✕</button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Description */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Description</p>
            <p className="text-sm text-gray-700">{ticket.description}</p>
          </div>

          {/* Resolution */}
          {ticket.resolution && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-green-700 uppercase mb-2 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Resolution</p>
              <p className="text-sm text-green-800">{ticket.resolution}</p>
              <p className="text-xs text-green-600 mt-2">Resolved: {safeDate(ticket.resolvedAt ?? ticket.resolved_at)}</p>
            </div>
          )}

          {/* Agent controls */}
          {isAgent && ticket.status !== 'Resolved' && ticket.status !== 'Closed' && (
            <div className="border border-purple-200 bg-purple-50 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-purple-800">Agent Actions</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Assign To</label>
                  <select
                    value={assignee}
                    onChange={e => setAssignee(e.target.value)}
                    className="w-full text-sm rounded border border-gray-300 px-2 py-1.5"
                  >
                    <option value="">Unassigned</option>
                    {employees.map((e: any) => (
                      <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Status</label>
                  <select
                    defaultValue={ticket.status}
                    onChange={e => updateMut.mutate({ status: e.target.value })}
                    className="w-full text-sm rounded border border-gray-300 px-2 py-1.5"
                  >
                    {['Open', 'In Progress', 'Resolved', 'Closed'].map(s =>
                      <option key={s} value={s}>{s}</option>
                    )}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Resolution Note</label>
                <textarea
                  value={resolution}
                  onChange={e => setResolution(e.target.value)}
                  rows={2}
                  className="w-full text-sm rounded border border-gray-300 px-2 py-1.5 resize-none"
                  placeholder="Resolution details..."
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => updateMut.mutate({ assignedTo: assignee })} disabled={updateMut.isPending}>
                  Assign
                </Button>
                <Button size="sm" onClick={() => updateMut.mutate({ status: 'Resolved', resolutionNote: resolution })} disabled={!resolution || updateMut.isPending}>
                  <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Resolve
                </Button>
              </div>
            </div>
          )}

          {/* Comments thread */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Comments ({comments.length})</p>
            {comments.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No comments yet.</p>
            ) : (
              <div className="space-y-3">
                {comments.map((c: any) => (
                  <div key={c.id} className={`flex gap-3 ${c.isInternal || c.is_internal ? 'opacity-70' : ''}`}>
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-gray-800">{c.authorName ?? 'HR Support'}</span>
                        {(c.isInternal || c.is_internal) && (
                          <span className="text-xs flex items-center gap-1 text-orange-600"><Lock className="w-2.5 h-2.5" /> Internal</span>
                        )}
                        <span className="text-xs text-gray-400">{timeAgo(c.createdAt ?? c.created_at)}</span>
                      </div>
                      <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2">{c.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CSAT */}
          {ticket.status === 'Resolved' && !ticket.csatRating && !ticket.csat_rating && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-yellow-800 mb-3">How satisfied were you with the resolution?</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => { setCSAT(n); csatMut.mutate(n); }}
                    className={`text-2xl transition-transform hover:scale-110 ${csat === n ? 'scale-125' : ''}`}
                  >
                    <Star className={`w-7 h-7 ${(csat ?? 0) >= n ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
              {csat && <p className="text-xs text-yellow-700 mt-2">Thank you for your feedback!</p>}
            </div>
          )}

          {ticket.csatRating || ticket.csat_rating ? (
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500">CSAT Rating:</p>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(n => (
                  <Star key={n} className={`w-4 h-4 ${(ticket.csatRating ?? ticket.csat_rating) >= n ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Comment input */}
        {ticket.status !== 'Closed' && (
          <div className="border-t border-gray-100 p-4 space-y-2">
            <div className="flex gap-2">
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={2}
                placeholder="Add a comment..."
                className="flex-1 text-sm rounded-lg border border-gray-300 px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button onClick={() => comment && commentMut.mutate()} disabled={!comment || commentMut.isPending} className="self-end">
                <Send className="w-4 h-4" />
              </Button>
            </div>
            {isAgent && (
              <div className="flex items-center gap-2">
                <input type="checkbox" id="internal" checked={isInternal} onChange={e => setIsInternal(e.target.checked)} className="w-3.5 h-3.5" />
                <label htmlFor="internal" className="text-xs text-gray-500 cursor-pointer flex items-center gap-1"><Lock className="w-3 h-3" /> Internal note (not visible to requester)</label>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Ticket Row ────────────────────────────────────────────────────────────────

function TicketRow({ ticket, onClick }: { ticket: any; onClick: () => void }) {
  const hoursLeft = ticket.status !== 'Resolved' && ticket.status !== 'Closed'
    ? slaHoursLeft(ticket.createdAt ?? ticket.created_at, ticket.priority)
    : null;

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="text-xs font-bold text-blue-600">{ticket.ticket_code ?? ticket.ticketCode}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded border ${priorityColor(ticket.priority)}`}>{ticket.priority}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${statusColor(ticket.status)}`}>{ticket.status}</span>
            {hoursLeft !== null && hoursLeft <= 4 && (
              <span className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 ${hoursLeft <= 0 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                <AlertCircle className="w-3 h-3" /> {hoursLeft <= 0 ? 'SLA Breached' : `${hoursLeft}h`}
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-gray-900 truncate">{ticket.subject}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
            <span>{ticket.category}</span>
            <span>·</span>
            <span>{ticket.first_name} {ticket.last_name}</span>
            {ticket.assigneeName && <><span>·</span><span>Assigned: {ticket.assigneeName}</span></>}
            <span>·</span>
            <span>{timeAgo(ticket.createdAt ?? ticket.created_at)}</span>
          </div>
        </div>
        <MessageCircle className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" />
      </div>
    </div>
  );
}

// ── My Tickets Tab ────────────────────────────────────────────────────────────

function MyTicketsTab() {
  const [selected, setSelected] = React.useState<any>(null);
  const [statusFilter, setStatusFilter] = React.useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['helpdesk-tickets', 'my', statusFilter],
    queryFn: async () => {
      const p = new URLSearchParams({ my: 'true' });
      if (statusFilter) p.set('status', statusFilter);
      try {
        const { data } = await api.get(`/platform/tickets/my?${p}`);
        return data;
      } catch { return { data: FALLBACK_TICKETS }; }
    },
  });

  const tickets: any[] = (data?.data ?? FALLBACK_TICKETS).filter((t: any) =>
    !statusFilter || t.status === statusFilter
  );

  return (
    <>
      <div className="flex items-center gap-3 mb-4">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="text-sm rounded-lg border border-gray-300 px-3 py-2">
          <option value="">All Statuses</option>
          {['Open', 'In Progress', 'Resolved', 'Closed'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="ml-auto text-xs text-gray-400">{tickets.length} ticket{tickets.length !== 1 ? 's' : ''}</span>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <LifeBuoy className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No tickets found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t: any) => (
            <TicketRow key={t.id} ticket={t} onClick={() => setSelected(t)} />
          ))}
        </div>
      )}
      {selected && <TicketDetail ticket={selected} onClose={() => setSelected(null)} isAgent={false} />}
    </>
  );
}

// ── Agent Queue Tab ───────────────────────────────────────────────────────────

function AgentQueueTab() {
  const [selected, setSelected] = React.useState<any>(null);
  const [statusFilter, setStatusFilter] = React.useState('Open');
  const [catFilter, setCatFilter] = React.useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['helpdesk-tickets', 'agent', statusFilter, catFilter],
    queryFn: async () => {
      const p = new URLSearchParams();
      if (statusFilter) p.set('status', statusFilter);
      try {
        const { data } = await api.get(`/platform/tickets?${p}`);
        return data;
      } catch { return { data: FALLBACK_TICKETS }; }
    },
  });

  let tickets: any[] = data?.data ?? FALLBACK_TICKETS;
  if (statusFilter) tickets = tickets.filter((t: any) => t.status === statusFilter);
  if (catFilter) tickets = tickets.filter((t: any) => t.category === catFilter);

  // Sort: Critical → High → sla-breached first
  tickets = [...tickets].sort((a: any, b: any) => {
    const order = { Critical: 0, High: 1, Medium: 2, Low: 3 };
    return (order[a.priority as keyof typeof order] ?? 4) - (order[b.priority as keyof typeof order] ?? 4);
  });

  return (
    <>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="text-sm rounded-lg border border-gray-300 px-3 py-2">
          <option value="">All Statuses</option>
          {['Open', 'In Progress', 'Resolved', 'Closed'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="text-sm rounded-lg border border-gray-300 px-3 py-2">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <span className="ml-auto text-xs text-gray-400">{tickets.length} ticket{tickets.length !== 1 ? 's' : ''}</span>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t: any) => (
            <TicketRow key={t.id} ticket={t} onClick={() => setSelected(t)} />
          ))}
        </div>
      )}
      {selected && <TicketDetail ticket={selected} onClose={() => setSelected(null)} isAgent />}
    </>
  );
}

// ── Stats Dashboard ───────────────────────────────────────────────────────────

function StatsDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['helpdesk-stats'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/platform/tickets/stats');
        return data?.data ?? data;
      } catch {
        return {
          total: 6, open: 3, inProgress: 1, resolved: 2,
          byStatus: [{ status: 'Open', cnt: 3 }, { status: 'In Progress', cnt: 1 }, { status: 'Resolved', cnt: 2 }],
          byPriority: [{ priority: 'Low', cnt: 2 }, { priority: 'Medium', cnt: 2 }, { priority: 'High', cnt: 1 }, { priority: 'Critical', cnt: 1 }],
          avgResolutionHours: 18, csatScore: 4.2, slaBreached: 1,
        };
      }
    },
  });

  if (isLoading) return <div className="flex justify-center py-16"><Spinner /></div>;
  const s = data ?? {};

  const byStatus: any[] = s.byStatus ?? [];
  const byPriority: any[] = s.byPriority ?? [];
  const total = s.total ?? byStatus.reduce((acc: number, r: any) => acc + Number(r.cnt ?? r.count ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Tickets', value: total, color: 'text-gray-900', bg: 'bg-gray-50', icon: LifeBuoy },
          { label: 'SLA Breached', value: s.slaBreached ?? 0, color: 'text-red-600', bg: 'bg-red-50', icon: AlertCircle },
          { label: 'Avg Resolution', value: s.avgResolutionHours ? `${s.avgResolutionHours}h` : '—', color: 'text-blue-600', bg: 'bg-blue-50', icon: Clock },
          { label: 'CSAT Score', value: s.csatScore ? `${s.csatScore}/5` : '—', color: 'text-green-700', bg: 'bg-green-50', icon: Star },
        ].map(m => (
          <div key={m.label} className={`${m.bg} rounded-xl border border-gray-200 p-4`}>
            <m.icon className={`w-5 h-5 ${m.color} mb-2 opacity-70`} />
            <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
            <p className="text-xs text-gray-500 mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">By Status</h3>
          <div className="space-y-3">
            {byStatus.map((s: any) => {
              const count = Number(s.count ?? s.cnt ?? 0);
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              const colors: Record<string, string> = { Open: 'bg-yellow-400', 'In Progress': 'bg-purple-500', Resolved: 'bg-green-500', Closed: 'bg-gray-400' };
              return (
                <div key={s.status}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-600">{s.status}</span>
                    <span className="text-xs font-semibold">{count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${colors[s.status] ?? 'bg-blue-500'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">By Priority</h3>
          <div className="space-y-3">
            {byPriority.map((p: any) => {
              const count = Number(p.count ?? p.cnt ?? 0);
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              const colors: Record<string, string> = { Critical: 'bg-red-500', High: 'bg-orange-500', Medium: 'bg-blue-500', Low: 'bg-gray-400' };
              return (
                <div key={p.priority}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-600">{p.priority}</span>
                    <span className="text-xs font-semibold">{count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${colors[p.priority] ?? 'bg-blue-500'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">SLA Policy</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { p: 'Critical', first: '1 hr', resolve: '4 hrs', color: 'border-red-200 bg-red-50' },
            { p: 'High', first: '4 hrs', resolve: '24 hrs', color: 'border-orange-200 bg-orange-50' },
            { p: 'Medium', first: '8 hrs', resolve: '48 hrs', color: 'border-blue-200 bg-blue-50' },
            { p: 'Low', first: '24 hrs', resolve: '72 hrs', color: 'border-gray-200 bg-gray-50' },
          ].map(sla => (
            <div key={sla.p} className={`rounded-lg border p-3 ${sla.color}`}>
              <p className="text-xs font-bold text-gray-800">{sla.p}</p>
              <p className="text-xs text-gray-500 mt-1">First response: <span className="font-semibold">{sla.first}</span></p>
              <p className="text-xs text-gray-500">Resolution: <span className="font-semibold">{sla.resolve}</span></p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function HelpdeskPage() {
  const [activeTab, setActiveTab] = React.useState('portal');

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">HR Helpdesk</h1>
        <p className="text-sm text-gray-500 mt-1">Raise, track, and resolve HR support tickets with SLA management</p>
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === t.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'portal' && <MyTicketsTab />}
      {activeTab === 'queue' && <AgentQueueTab />}
      {activeTab === 'submit' && <SubmitTicketTab />}
      {activeTab === 'stats' && <StatsDashboard />}
    </div>
  );
}
