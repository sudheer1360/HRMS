import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plane, Receipt, Wallet, Map,
  Plus, Check, X, Download, Upload, ChevronDown, ChevronUp,
  Clock, CheckCircle, AlertCircle, Eye,
} from 'lucide-react';
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

function safeCurrency(v?: number | string | null) {
  const n = Number(v ?? 0);
  return `₹${n.toLocaleString('en-IN')}`;
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'requests', label: 'Travel Requests', icon: Plane },
  { key: 'expenses', label: 'Expense Claims',  icon: Receipt },
  { key: 'advances', label: 'Advances',         icon: Wallet },
  { key: 'trips',    label: 'My Trips',         icon: Map },
];

// ── Fallback Data ─────────────────────────────────────────────────────────────

const FB_TRAVEL = [
  { id: 'tr-001', travelCode: 'TRV-2026-001', destination: 'Mumbai', purpose: 'Client Meeting — Q2 Review', departureDate: '2026-06-20', returnDate: '2026-06-22', travelMode: 'Air', estimatedCost: 32000, status: 'Approved', approvedBy: 'Priya Shah', submittedDate: '2026-06-10', itinerary: [
    { date: '2026-06-20', activity: 'Fly to Mumbai (BLR→BOM), Check-in at Trident Hotel' },
    { date: '2026-06-21', activity: 'Client meeting at ABC Corp HQ (10AM–5PM)' },
    { date: '2026-06-22', activity: 'Return flight BOM→BLR' },
  ]},
  { id: 'tr-002', travelCode: 'TRV-2026-002', destination: 'Delhi', purpose: 'Annual HR Conference', departureDate: '2026-07-10', returnDate: '2026-07-12', travelMode: 'Air', estimatedCost: 28500, status: 'Pending', approvedBy: null, submittedDate: '2026-06-14', itinerary: [
    { date: '2026-07-10', activity: 'Fly to Delhi, Conference Day 1' },
    { date: '2026-07-11', activity: 'Conference Day 2 + Networking Dinner' },
    { date: '2026-07-12', activity: 'Return flight' },
  ]},
  { id: 'tr-003', travelCode: 'TRV-2026-003', destination: 'Pune', purpose: 'Team Building Event', departureDate: '2026-05-15', returnDate: '2026-05-16', travelMode: 'Road', estimatedCost: 8500, status: 'Completed', approvedBy: 'Priya Shah', submittedDate: '2026-05-05', itinerary: [
    { date: '2026-05-15', activity: 'Drive to Pune — Team Building Workshop' },
    { date: '2026-05-16', activity: 'Return drive' },
  ]},
  { id: 'tr-004', travelCode: 'TRV-2026-004', destination: 'Hyderabad', purpose: 'Product Training — New ERP', departureDate: '2026-07-25', returnDate: '2026-07-27', travelMode: 'Air', estimatedCost: 25000, status: 'Draft', approvedBy: null, submittedDate: null, itinerary: [] },
];

const FB_EXPENSES = [
  { id: 'exp-001', claimCode: 'EXP-2026-001', category: 'Travel', description: 'Flight BLR-MUM (Jun 20)', amount: 8400, receiptDate: '2026-06-20', travelRef: 'TRV-2026-001', status: 'Approved', approvedDate: '2026-06-25' },
  { id: 'exp-002', claimCode: 'EXP-2026-002', category: 'Accommodation', description: 'Trident Hotel (2 nights)', amount: 14000, receiptDate: '2026-06-22', travelRef: 'TRV-2026-001', status: 'Approved', approvedDate: '2026-06-25' },
  { id: 'exp-003', claimCode: 'EXP-2026-003', category: 'Meals', description: 'Client dinner at The Table', amount: 3200, receiptDate: '2026-06-21', travelRef: 'TRV-2026-001', status: 'Approved', approvedDate: '2026-06-25' },
  { id: 'exp-004', claimCode: 'EXP-2026-004', category: 'Travel', description: 'Cab rides BLR airport', amount: 1800, receiptDate: '2026-06-20', travelRef: 'TRV-2026-001', status: 'Pending', approvedDate: null },
  { id: 'exp-005', claimCode: 'EXP-2026-005', category: 'Training', description: 'Udemy course — Advanced React', amount: 4500, receiptDate: '2026-06-01', travelRef: null, status: 'Pending', approvedDate: null },
  { id: 'exp-006', claimCode: 'EXP-2026-006', category: 'Meals', description: 'Team lunch (team offsite)', amount: 6800, receiptDate: '2026-05-15', travelRef: 'TRV-2026-003', status: 'Paid', approvedDate: '2026-05-20' },
];

const FB_ADVANCES = [
  { id: 'adv-001', advanceCode: 'ADV-2026-001', purpose: 'Travel advance for Mumbai trip', amount: 20000, requestedDate: '2026-06-09', disbursedDate: '2026-06-11', settledDate: null, travelRef: 'TRV-2026-001', status: 'Partially Settled', settledAmount: 17600, remainingAmount: 2400 },
  { id: 'adv-002', advanceCode: 'ADV-2026-002', purpose: 'Travel advance for Delhi conference', amount: 15000, requestedDate: '2026-06-13', disbursedDate: null, settledDate: null, travelRef: 'TRV-2026-002', status: 'Requested', settledAmount: 0, remainingAmount: 15000 },
  { id: 'adv-003', advanceCode: 'ADV-2026-003', purpose: 'Travel advance for Pune event', amount: 5000, requestedDate: '2026-05-04', disbursedDate: '2026-05-06', settledDate: '2026-05-20', travelRef: 'TRV-2026-003', status: 'Settled', settledAmount: 5000, remainingAmount: 0 },
];

// ── Travel Requests Tab ───────────────────────────────────────────────────────

const travelSchema = z.object({
  destination: z.string().min(1, 'Required'),
  purpose: z.string().min(5, 'Required'),
  departureDate: z.string().min(1, 'Required'),
  returnDate: z.string().min(1, 'Required'),
  travelMode: z.string().min(1, 'Required'),
  estimatedCost: z.coerce.number().min(0),
  accommodation: z.string().optional(),
  advanceRequired: z.coerce.number().optional(),
  notes: z.string().optional(),
});

function TravelRequestsTab() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = React.useState(false);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState('All');

  const { data, isLoading } = useQuery({
    queryKey: ['travel-requests'],
    queryFn: async () => {
      try { const { data } = await api.get('/travel/requests?limit=30'); return data; }
      catch { return { data: FB_TRAVEL }; }
    },
  });
  const requests: any[] = (data?.data?.length ? data.data : FB_TRAVEL);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(travelSchema),
    defaultValues: { travelMode: 'Air' },
  });

  const createMut = useMutation({
    mutationFn: (d: any) => api.post('/travel/requests', d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['travel-requests'] }); reset(); setShowForm(false); },
    onError: () => { reset(); setShowForm(false); },
  });

  const approveMut = useMutation({
    mutationFn: (id: string) => api.patch(`/travel/requests/${id}/approve`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['travel-requests'] }),
  });

  const rejectMut = useMutation({
    mutationFn: (id: string) => api.patch(`/travel/requests/${id}/reject`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['travel-requests'] }),
  });

  const filtered = filter === 'All' ? requests : requests.filter(r => r.status === filter);
  const approved = requests.filter(r => r.status === 'Approved').length;
  const pending = requests.filter(r => r.status === 'Pending').length;
  const totalCost = requests.filter(r => r.status !== 'Draft').reduce((s, r) => s + Number(r.estimatedCost ?? 0), 0);

  const statusVariant = (s: string) =>
    s === 'Approved' || s === 'Completed' ? 'success' : s === 'Rejected' ? 'danger' : s === 'Pending' ? 'warning' : 'default';

  const modeIcon = (m: string) => m === 'Air' ? '✈️' : m === 'Road' ? '🚗' : m === 'Rail' ? '🚆' : '🚌';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-blue-700">{approved}</p>
          <p className="text-xs text-gray-500 mt-0.5">Approved Trips</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-yellow-700">{pending}</p>
          <p className="text-xs text-gray-500 mt-0.5">Awaiting Approval</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xl font-bold text-gray-900">{safeCurrency(totalCost)}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Estimated Cost</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
          {['All', 'Draft', 'Pending', 'Approved', 'Completed', 'Rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded text-xs font-medium ${filter === f ? 'bg-white shadow text-primary' : 'text-gray-600'}`}>{f}</button>
          ))}
        </div>
        <Button size="sm" onClick={() => setShowForm(v => !v)}><Plus size={14} /> New Request</Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h4 className="font-semibold text-sm mb-4">New Travel Request</h4>
          <form onSubmit={handleSubmit(d => createMut.mutate(d))} className="grid grid-cols-2 gap-3">
            <Input label="Destination *" error={errors.destination?.message as string} {...register('destination')} placeholder="e.g. Mumbai" />
            <Select label="Travel Mode *" options={[
              { value: 'Air', label: '✈️ Air' },
              { value: 'Rail', label: '🚆 Rail' },
              { value: 'Road', label: '🚗 Road' },
              { value: 'Bus', label: '🚌 Bus' },
            ]} {...register('travelMode')} />
            <Input label="Departure Date *" type="date" error={errors.departureDate?.message as string} {...register('departureDate')} />
            <Input label="Return Date *" type="date" error={errors.returnDate?.message as string} {...register('returnDate')} />
            <div className="col-span-2">
              <Input label="Purpose *" error={errors.purpose?.message as string} {...register('purpose')} placeholder="Brief description of trip purpose" />
            </div>
            <Input label="Estimated Cost (₹)" type="number" {...register('estimatedCost')} />
            <Input label="Accommodation Needed" placeholder="e.g. Hotel, Guest House" {...register('accommodation')} />
            <Input label="Advance Required (₹)" type="number" {...register('advanceRequired')} />
            <div className="col-span-2"><Input label="Additional Notes" {...register('notes')} /></div>
            <div className="col-span-2 flex gap-2">
              <Button type="submit" size="sm" loading={createMut.isPending}>Submit Request</Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => { reset(); setShowForm(false); }}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? <div className="p-6 text-center"><Spinner /></div> : (
        <div className="space-y-2">
          {filtered.map((r: any) => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div
                className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
              >
                <div className="text-2xl flex-shrink-0">{modeIcon(r.travelMode)}</div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{r.destination} — <span className="font-normal text-gray-600">{r.purpose}</span></p>
                  <p className="text-xs text-gray-400 mt-0.5">{r.travelCode} · {safeDate(r.departureDate)} → {safeDate(r.returnDate)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-900">{safeCurrency(r.estimatedCost)}</p>
                  <p className="text-[10px] text-gray-400">Estimated</p>
                </div>
                <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
                <div className="flex gap-1 items-center">
                  {r.status === 'Pending' && (
                    <>
                      <button onClick={e => { e.stopPropagation(); approveMut.mutate(r.id); }}
                        className="p-1.5 rounded bg-green-50 hover:bg-green-100 text-green-700" aria-label="Approve" title="Approve">
                        <Check size={13} />
                      </button>
                      <button onClick={e => { e.stopPropagation(); rejectMut.mutate(r.id); }}
                        className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-danger" aria-label="Reject" title="Reject">
                        <X size={13} />
                      </button>
                    </>
                  )}
                  {expandedId === r.id ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                </div>
              </div>

              {expandedId === r.id && (
                <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
                  <div className="grid grid-cols-4 gap-4 text-sm mb-4">
                    {[
                      { label: 'Travel Mode', value: `${modeIcon(r.travelMode)} ${r.travelMode}` },
                      { label: 'Submitted', value: safeDate(r.submittedDate) },
                      { label: 'Approved By', value: r.approvedBy ?? '—' },
                      { label: 'Trip Duration', value: r.departureDate && r.returnDate ? `${Math.ceil((new Date(r.returnDate).getTime() - new Date(r.departureDate).getTime()) / 86400000) + 1} day(s)` : '—' },
                    ].map(item => (
                      <div key={item.label}>
                        <p className="text-xs text-gray-400">{item.label}</p>
                        <p className="font-medium mt-0.5">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  {r.itinerary?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Itinerary</p>
                      <div className="space-y-1.5">
                        {r.itinerary.map((i: any, idx: number) => (
                          <div key={idx} className="flex items-start gap-3">
                            <span className="text-xs bg-blue-100 text-blue-700 font-medium px-2 py-0.5 rounded whitespace-nowrap">{safeDate(i.date)}</span>
                            <p className="text-sm text-gray-700">{i.activity}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-400">
              <Plane size={36} className="mx-auto mb-2 text-gray-300" />
              <p>No travel requests found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Expense Claims Tab ────────────────────────────────────────────────────────

const expenseSchema = z.object({
  category: z.string().min(1, 'Required'),
  description: z.string().min(3, 'Required'),
  amount: z.coerce.number().min(1, 'Required'),
  receiptDate: z.string().min(1, 'Required'),
  travelRef: z.string().optional(),
  notes: z.string().optional(),
});

const EXPENSE_CATEGORIES = [
  { value: 'Travel', label: '✈️ Travel' },
  { value: 'Accommodation', label: '🏨 Accommodation' },
  { value: 'Meals', label: '🍽️ Meals' },
  { value: 'Communication', label: '📱 Communication' },
  { value: 'Medical', label: '💊 Medical' },
  { value: 'Training', label: '📚 Training' },
  { value: 'Other', label: '📋 Other' },
];

function ExpenseClaimsTab() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = React.useState(false);
  const [filter, setFilter] = React.useState('All');

  const { data, isLoading } = useQuery({
    queryKey: ['travel-expenses'],
    queryFn: async () => {
      try { const { data } = await api.get('/travel/expenses?limit=50'); return data; }
      catch { return { data: FB_EXPENSES }; }
    },
  });
  const expenses: any[] = (data?.data?.length ? data.data : FB_EXPENSES);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: { category: 'Travel' },
  });

  const createMut = useMutation({
    mutationFn: (d: any) => api.post('/travel/expenses', d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['travel-expenses'] }); reset(); setShowForm(false); },
    onError: () => { reset(); setShowForm(false); },
  });

  const approveMut = useMutation({
    mutationFn: (id: string) => api.patch(`/travel/expenses/${id}/approve`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['travel-expenses'] }),
  });

  const filtered = filter === 'All' ? expenses : expenses.filter(e => e.status === filter);
  const totalPending = expenses.filter(e => e.status === 'Pending').reduce((s, e) => s + Number(e.amount ?? 0), 0);
  const totalApproved = expenses.filter(e => e.status === 'Approved').reduce((s, e) => s + Number(e.amount ?? 0), 0);
  const totalPaid = expenses.filter(e => e.status === 'Paid').reduce((s, e) => s + Number(e.amount ?? 0), 0);

  const catEmoji = (c: string) =>
    ({ Travel: '✈️', Accommodation: '🏨', Meals: '🍽️', Communication: '📱', Medical: '💊', Training: '📚' }[c] ?? '📋');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-xl font-bold text-yellow-700">{safeCurrency(totalPending)}</p>
          <p className="text-xs text-gray-500 mt-0.5">Awaiting Approval</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-xl font-bold text-blue-700">{safeCurrency(totalApproved)}</p>
          <p className="text-xs text-gray-500 mt-0.5">Approved (Pending Payment)</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-xl font-bold text-green-700">{safeCurrency(totalPaid)}</p>
          <p className="text-xs text-gray-500 mt-0.5">Reimbursed</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
          {['All', 'Pending', 'Approved', 'Paid', 'Rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded text-xs font-medium ${filter === f ? 'bg-white shadow text-primary' : 'text-gray-600'}`}>{f}</button>
          ))}
        </div>
        <Button size="sm" onClick={() => setShowForm(v => !v)}><Plus size={14} /> Submit Claim</Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h4 className="font-semibold text-sm mb-4">New Expense Claim</h4>
          <form onSubmit={handleSubmit(d => createMut.mutate(d))} className="grid grid-cols-2 gap-3">
            <Select label="Category *" options={EXPENSE_CATEGORIES} {...register('category')} />
            <Input label="Amount (₹) *" type="number" error={errors.amount?.message as string} {...register('amount')} />
            <div className="col-span-2">
              <Input label="Description *" error={errors.description?.message as string} {...register('description')} placeholder="Brief description of expense" />
            </div>
            <Input label="Receipt Date *" type="date" error={errors.receiptDate?.message as string} {...register('receiptDate')} />
            <Input label="Travel Request Ref" placeholder="e.g. TRV-2026-001" {...register('travelRef')} />
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Receipt Upload</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg px-4 py-6 text-center text-sm text-gray-400 hover:border-gray-400 cursor-pointer">
                <Upload size={20} className="mx-auto mb-1 text-gray-300" />
                Click to upload receipt (JPG, PNG, PDF)
              </div>
            </div>
            <div className="col-span-2"><Input label="Notes" {...register('notes')} /></div>
            <div className="col-span-2 flex gap-2">
              <Button type="submit" size="sm" loading={createMut.isPending}>Submit Claim</Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => { reset(); setShowForm(false); }}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? <div className="p-6 text-center"><Spinner /></div> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead><tr className="bg-gray-50 border-b border-gray-200">
              {['Category', 'Description', 'Receipt Date', 'Travel Ref', 'Amount', 'Status', 'Approved', 'Action'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((e: any) => (
                <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm">{catEmoji(e.category)} {e.category}</td>
                  <td className="px-4 py-3 text-sm max-w-xs truncate">{e.description}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{safeDate(e.receiptDate)}</td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-400">{e.travelRef ?? '—'}</td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">{safeCurrency(e.amount)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={e.status === 'Paid' ? 'success' : e.status === 'Approved' ? 'info' : e.status === 'Rejected' ? 'danger' : 'warning'}>
                      {e.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{e.approvedDate ? safeDate(e.approvedDate) : '—'}</td>
                  <td className="px-4 py-3">
                    {e.status === 'Pending' && (
                      <button onClick={() => approveMut.mutate(e.id)}
                        className="p-1.5 rounded bg-green-50 hover:bg-green-100 text-green-700" aria-label="Approve" title="Approve">
                        <Check size={13} />
                      </button>
                    )}
                    <button className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-primary ml-1" title="View Receipt">
                      <Eye size={13} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
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

// ── Advances Tab ──────────────────────────────────────────────────────────────

const advanceSchema = z.object({
  purpose: z.string().min(5, 'Required'),
  amount: z.coerce.number().min(500, 'Minimum ₹500'),
  travelRef: z.string().optional(),
  requiredDate: z.string().min(1, 'Required'),
});

function AdvancesTab() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = React.useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['travel-advances'],
    queryFn: async () => {
      try { const { data } = await api.get('/travel/advances?limit=20'); return data; }
      catch { return { data: FB_ADVANCES }; }
    },
  });
  const advances: any[] = (data?.data?.length ? data.data : FB_ADVANCES);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof advanceSchema>>({ resolver: zodResolver(advanceSchema) });

  const createMut = useMutation({
    mutationFn: (d: any) => api.post('/travel/advances', d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['travel-advances'] }); reset(); setShowForm(false); },
    onError: () => { reset(); setShowForm(false); },
  });

  const totalDisbursed = advances.filter(a => a.status !== 'Requested').reduce((s, a) => s + Number(a.amount ?? 0), 0);
  const totalOutstanding = advances.filter(a => a.status !== 'Settled').reduce((s, a) => s + Number(a.remainingAmount ?? 0), 0);
  const pendingDisbursement = advances.filter(a => a.status === 'Requested').length;

  const statusVariant = (s: string) =>
    s === 'Settled' ? 'success' : s === 'Partially Settled' ? 'info' : s === 'Disbursed' ? 'warning' : 'default';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-xl font-bold text-blue-700">{safeCurrency(totalDisbursed)}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Disbursed</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <p className="text-xl font-bold text-orange-700">{safeCurrency(totalOutstanding)}</p>
          <p className="text-xs text-gray-500 mt-0.5">Outstanding Balance</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-yellow-700">{pendingDisbursement}</p>
          <p className="text-xs text-gray-500 mt-0.5">Awaiting Disbursement</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">Advance History</h3>
        <Button size="sm" onClick={() => setShowForm(v => !v)}><Plus size={14} /> Request Advance</Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h4 className="font-semibold text-sm mb-4">New Advance Request</h4>
          <form onSubmit={handleSubmit(d => createMut.mutate(d))} className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Input label="Purpose *" error={errors.purpose?.message as string} {...register('purpose')} placeholder="e.g. Travel advance for Mumbai trip" />
            </div>
            <Input label="Amount Required (₹) *" type="number" error={errors.amount?.message as string} {...register('amount')} />
            <Input label="Required By Date *" type="date" error={errors.requiredDate?.message as string} {...register('requiredDate')} />
            <Input label="Travel Request Ref" placeholder="e.g. TRV-2026-001" {...register('travelRef')} />
            <div className="col-span-2 flex gap-2">
              <Button type="submit" size="sm" loading={createMut.isPending}>Submit Request</Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => { reset(); setShowForm(false); }}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? <div className="p-6 text-center"><Spinner /></div> : (
        <div className="space-y-3">
          {advances.map((a: any) => (
            <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-gray-900">{a.advanceCode}</p>
                    <Badge variant={statusVariant(a.status)}>{a.status}</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{a.purpose}</p>
                  {a.travelRef && <p className="text-xs text-blue-600 mt-0.5">Ref: {a.travelRef}</p>}
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900">{safeCurrency(a.amount)}</p>
                  <p className="text-xs text-gray-400">Advance Amount</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400">Requested</p>
                  <p className="font-medium mt-0.5">{safeDate(a.requestedDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Disbursed</p>
                  <p className="font-medium mt-0.5">{a.disbursedDate ? safeDate(a.disbursedDate) : '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Settled Amount</p>
                  <p className="font-medium mt-0.5 text-green-700">{safeCurrency(a.settledAmount)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Outstanding</p>
                  <p className={`font-bold mt-0.5 ${a.remainingAmount > 0 ? 'text-orange-700' : 'text-gray-900'}`}>{safeCurrency(a.remainingAmount)}</p>
                </div>
              </div>
              {a.amount > 0 && a.settledAmount >= 0 && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Settlement Progress</span>
                    <span>{Math.round((a.settledAmount / a.amount) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${a.status === 'Settled' ? 'bg-green-500' : 'bg-blue-500'}`}
                      style={{ width: `${Math.min((a.settledAmount / a.amount) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
          {advances.length === 0 && (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-400">
              <Wallet size={36} className="mx-auto mb-2 text-gray-300" />
              <p>No advance history</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── My Trips Tab ──────────────────────────────────────────────────────────────

function MyTripsTab() {
  const { data } = useQuery({
    queryKey: ['travel-requests'],
    queryFn: async () => {
      try { const { data } = await api.get('/travel/requests?limit=30'); return data; }
      catch { return { data: FB_TRAVEL }; }
    },
  });
  const trips: any[] = (data?.data?.length ? data.data : FB_TRAVEL);
  const { data: expData } = useQuery({
    queryKey: ['travel-expenses'],
    queryFn: async () => {
      try { const { data } = await api.get('/travel/expenses?limit=50'); return data; }
      catch { return { data: FB_EXPENSES }; }
    },
  });
  const expenses: any[] = (expData?.data?.length ? expData.data : FB_EXPENSES);

  const completedTrips = trips.filter(t => t.status === 'Completed' || t.status === 'Approved');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-gray-900">{trips.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Trip Requests</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-green-700">{completedTrips.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Approved / Completed</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-xl font-bold text-blue-700">
            {safeCurrency(expenses.filter(e => e.status === 'Paid' || e.status === 'Approved').reduce((s, e) => s + Number(e.amount ?? 0), 0))}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Total Reimbursed</p>
        </div>
      </div>

      <div className="space-y-4">
        {trips.map((trip: any) => {
          const tripExpenses = expenses.filter(e => e.travelRef === trip.travelCode);
          const totalSpent = tripExpenses.reduce((s, e) => s + Number(e.amount ?? 0), 0);
          const modeIcon = trip.travelMode === 'Air' ? '✈️' : trip.travelMode === 'Road' ? '🚗' : '🚆';

          return (
            <div key={trip.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start gap-4 mb-4">
                <div className="text-3xl">{modeIcon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-900">{trip.destination}</h3>
                    <Badge variant={trip.status === 'Approved' || trip.status === 'Completed' ? 'success' : trip.status === 'Pending' ? 'warning' : trip.status === 'Rejected' ? 'danger' : 'default'}>
                      {trip.status}
                    </Badge>
                    <span className="text-xs text-gray-400">{trip.travelCode}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">{trip.purpose}</p>
                  <p className="text-xs text-gray-400 mt-1">{safeDate(trip.departureDate)} → {safeDate(trip.returnDate)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Estimated</p>
                  <p className="text-lg font-bold text-gray-900">{safeCurrency(trip.estimatedCost)}</p>
                  {totalSpent > 0 && (
                    <>
                      <p className="text-xs text-gray-400 mt-1">Actual Claimed</p>
                      <p className={`text-sm font-semibold ${totalSpent > trip.estimatedCost ? 'text-red-600' : 'text-green-600'}`}>{safeCurrency(totalSpent)}</p>
                    </>
                  )}
                </div>
              </div>

              {tripExpenses.length > 0 && (
                <div className="border-t border-gray-100 pt-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Expense Claims for this Trip</p>
                  <div className="flex flex-wrap gap-2">
                    {tripExpenses.map((e: any) => (
                      <div key={e.id} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                        <p className="text-xs font-medium text-gray-700">{e.category}: {safeCurrency(e.amount)}</p>
                        <p className="text-[10px] text-gray-400">{e.status}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {trip.itinerary?.length > 0 && (
                <div className="border-t border-gray-100 pt-3 mt-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Itinerary</p>
                  <div className="space-y-1">
                    {trip.itinerary.map((i: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium flex-shrink-0">{safeDate(i.date)}</span>
                        <p className="text-gray-600">{i.activity}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {trips.length === 0 && (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-400">
            <Map size={36} className="mx-auto mb-2 text-gray-300" />
            <p>No trips yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function TravelExpensePage() {
  const [tab, setTab] = React.useState('requests');

  return (
    <div>
      <PageHeader title="Travel & Expense Management" subtitle="Travel requests, expense claims, advances, and trip summaries" />

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
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

      {tab === 'requests' && <TravelRequestsTab />}
      {tab === 'expenses' && <ExpenseClaimsTab />}
      {tab === 'advances' && <AdvancesTab />}
      {tab === 'trips'    && <MyTripsTab />}
    </div>
  );
}
