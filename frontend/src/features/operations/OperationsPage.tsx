import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Target, Monitor, AlertTriangle, Shield, LogOut } from 'lucide-react';
import { Badge, Spinner } from '@components/ui/Input';
import { formatDate, formatCurrency } from '@lib/utils';
import api from '@lib/axios';
import { PageHeader } from '@components/ui/PageHeader';

export default function OperationsPage() {
  const [tab, setTab] = React.useState('performance');

  const { data: reviews } = useQuery({ queryKey: ['my-reviews'], queryFn: async () => { const { data } = await api.get('/operations/performance/reviews?my=true'); return data; }, enabled: tab === 'performance' });
  const { data: assets } = useQuery({ queryKey: ['my-assets'], queryFn: async () => { const { data } = await api.get('/operations/assets?my=true'); return data; }, enabled: tab === 'assets' });
  const { data: grievances } = useQuery({ queryKey: ['grievances'], queryFn: async () => { const { data } = await api.get('/operations/grievances?limit=20'); return data; }, enabled: tab === 'grievance' });
  const { data: disciplinary } = useQuery({ queryKey: ['disciplinary'], queryFn: async () => { const { data } = await api.get('/operations/disciplinary?limit=20'); return data; }, enabled: tab === 'disciplinary' });
  const { data: exits } = useQuery({ queryKey: ['exits'], queryFn: async () => { const { data } = await api.get('/operations/exits?limit=20'); return data; }, enabled: tab === 'exit' });

  const tabs = [
    { key: 'performance', label: 'Performance', icon: Target },
    { key: 'assets', label: 'Assets', icon: Monitor },
    { key: 'grievance', label: 'Grievances', icon: AlertTriangle },
    { key: 'disciplinary', label: 'Disciplinary', icon: Shield },
    { key: 'exit', label: 'Exit', icon: LogOut },
  ];

  return (
    <div>
      <PageHeader title="Operations" subtitle="Performance, Assets, Grievances & Exit Management" />

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit overflow-x-auto">
        {tabs.map((t) => { const Icon = t.icon; return (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 whitespace-nowrap ${tab === t.key ? 'bg-white shadow text-primary' : 'text-gray-600'}`}><Icon size={14} />{t.label}</button>
        );})}
      </div>

      {/* Performance */}
      {tab === 'performance' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
          <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-sm"><thead><tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Cycle</th><th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Self Rating</th><th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Manager Rating</th><th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Final</th><th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
          </tr></thead><tbody className="divide-y divide-gray-100">
            {reviews?.data?.map((r: any) => (
              <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium">{r.cycleId?.slice(0,8)}</td><td className="px-4 py-3 text-sm">{r.selfRating || '-'}</td><td className="px-4 py-3 text-sm">{r.managerRating || '-'}</td><td className="px-4 py-3 text-sm font-bold">{r.finalRating || '-'}</td>
                <td className="px-4 py-3"><Badge variant={r.status === 'Manager Reviewed' ? 'success' : 'warning'}>{r.status}</Badge></td>
              </tr>
            ))}
            {(!reviews?.data?.length) && <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-400">No records found.</td></tr>}
          </tbody></table></div>
        </div>
          </div>
      )}

      {/* Assets */}
      {tab === 'assets' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
          <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-sm"><thead><tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Asset</th><th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Category</th><th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Serial</th><th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Value</th><th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
          </tr></thead><tbody className="divide-y divide-gray-100">
            {assets?.data?.map((a: any) => (
              <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium">{a.assetName}</td><td className="px-4 py-3 text-sm"><Badge>{a.category}</Badge></td>
                <td className="px-4 py-3 text-sm text-gray-500">{a.serialNumber || '-'}</td><td className="px-4 py-3 text-sm">{a.purchaseValue ? formatCurrency(Number(a.purchaseValue)) : '-'}</td>
                <td className="px-4 py-3"><Badge variant={a.status === 'Available' ? 'success' : a.status === 'Assigned' ? 'info' : 'warning'}>{a.status}</Badge></td>
              </tr>
            ))}
            {(!assets?.data?.length) && <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-400">No records found.</td></tr>}
          </tbody></table></div>
        </div>
          </div>
      )}

      {/* Grievance */}
      {tab === 'grievance' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
          <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-sm"><thead><tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Type</th><th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th><th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Date</th>
          </tr></thead><tbody className="divide-y divide-gray-100">
            {grievances?.data?.map((g: any) => (
              <tr key={g.id} className="hover:bg-gray-50 transition-colors"><td className="px-4 py-3 text-sm"><Badge variant="danger">{g.complaintType}</Badge>{g.isAnonymous && <span className="text-xs text-gray-400 ml-1">(Anonymous)</span>}</td>
                <td className="px-4 py-3"><Badge variant={g.status === 'Resolved' ? 'success' : 'warning'}>{g.status}</Badge></td><td className="px-4 py-3 text-sm text-gray-500">{formatDate(g.createdAt)}</td></tr>
            ))}
            {(!grievances?.data?.length) && <tr><td colSpan={3} className="px-4 py-12 text-center text-sm text-gray-400">No records found.</td></tr>}
          </tbody></table></div>
        </div>
          </div>
      )}

      {/* Disciplinary */}
      {tab === 'disciplinary' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
          <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-sm"><thead><tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Case Code</th><th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Incident</th><th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Action</th><th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
          </tr></thead><tbody className="divide-y divide-gray-100">
            {disciplinary?.data?.map((d: any) => (
              <tr key={d.id} className="hover:bg-gray-50 transition-colors"><td className="px-4 py-3 text-sm font-medium text-primary">{d.caseCode}</td><td className="px-4 py-3 text-sm">{formatDate(d.incidentDate)}</td>
                <td className="px-4 py-3 text-sm"><Badge variant="danger">{d.actionType || 'Pending'}</Badge></td><td className="px-4 py-3"><Badge variant={d.status === 'Closed' ? 'success' : 'warning'}>{d.status}</Badge></td></tr>
            ))}
            {(!disciplinary?.data?.length) && <tr><td colSpan={4} className="px-4 py-12 text-center text-sm text-gray-400">No records found.</td></tr>}
          </tbody></table></div>
        </div>
          </div>
      )}

      {/* Exit */}
      {tab === 'exit' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
          <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-sm"><thead><tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Type</th><th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">LWD</th><th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">FNF</th><th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Clearance</th><th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
          </tr></thead><tbody className="divide-y divide-gray-100">
            {exits?.data?.map((e: any) => (
              <tr key={e.id} className="hover:bg-gray-50 transition-colors"><td className="px-4 py-3 text-sm"><Badge variant="danger">{e.exitType}</Badge></td><td className="px-4 py-3 text-sm">{formatDate(e.lastWorkingDay)}</td>
                <td className="px-4 py-3 text-sm">{e.fnfAmount ? formatCurrency(Number(e.fnfAmount)) : <Badge variant="warning">{e.fnfStatus}</Badge>}</td>
                <td className="px-4 py-3"><Badge variant={e.clearanceStatus === 'Cleared' ? 'success' : 'warning'}>{e.clearanceStatus}</Badge></td>
                <td className="px-4 py-3"><Badge variant={e.status === 'Completed' ? 'success' : 'info'}>{e.status}</Badge></td></tr>
            ))}
            {(!exits?.data?.length) && <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-400">No records found.</td></tr>}
          </tbody></table></div>
        </div>
        </div>
      )}
    </div>
  );
}
