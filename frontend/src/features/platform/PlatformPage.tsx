import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Bot, Zap, BarChart3, Webhook, Send, Plus } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Input, Badge } from '@components/ui/Input';
import { formatDate } from '@lib/utils';
import { helpdeskService, aiService, automationService, reportsService, integrationService } from '@features/../services/platform.service';
import { PageHeader } from '@components/ui/PageHeader';

export default function PlatformPage() {
  const [tab, setTab] = React.useState('helpdesk');
  const [aiQuery, setAiQuery] = React.useState('');
  const [aiResponse, setAiResponse] = React.useState<any>(null);
  const queryClient = useQueryClient();

  const { data: tickets } = useQuery({ queryKey: ['my-tickets'], queryFn: async () => { const { data } = await helpdeskService.listMyTickets({ limit: 30 }); return data; }, enabled: tab === 'helpdesk' });
  const { data: conversations } = useQuery({ queryKey: ['ai-conversations'], queryFn: async () => { const { data } = await aiService.listConversations(); return data; }, enabled: tab === 'ai' });
  const { data: workflows } = useQuery({ queryKey: ['workflows'], queryFn: async () => { const { data } = await automationService.listWorkflows(); return data; }, enabled: tab === 'automation' });
  const { data: reports } = useQuery({ queryKey: ['reports'], queryFn: async () => { const { data } = await reportsService.list(); return data; }, enabled: tab === 'reports' });
  const { data: apiKeys } = useQuery({ queryKey: ['api-keys'], queryFn: async () => { const { data } = await integrationService.listApiKeys(); return data; }, enabled: tab === 'api' });
  const { data: webhooks } = useQuery({ queryKey: ['webhooks'], queryFn: async () => { const { data } = await integrationService.listWebhooks(); return data; }, enabled: tab === 'api' });

  const askAiMut = useMutation({
    mutationFn: async (query: string) => { const { data } = await aiService.ask(query); return data; },
    onSuccess: (d) => { setAiResponse(d.data); queryClient.invalidateQueries({ queryKey: ['ai-conversations'] }); },
  });

  const tabs = [
    { key: 'helpdesk', label: 'Helpdesk', icon: MessageCircle },
    { key: 'ai', label: 'AI Assistant', icon: Bot },
    { key: 'automation', label: 'Automation', icon: Zap },
    { key: 'reports', label: 'Reports', icon: BarChart3 },
    { key: 'api', label: 'API & Integrations', icon: Webhook },
  ];

  return (
    <div>
      <PageHeader title="Platform Hub" subtitle="Helpdesk, AI Assistant, Automation, Reports & API Integration" />

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit overflow-x-auto">
        {tabs.map((t) => { const Icon = t.icon; return (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 whitespace-nowrap ${tab === t.key ? 'bg-white shadow text-primary' : 'text-gray-600'}`}><Icon size={14} />{t.label}</button>
        );})}
      </div>

      {/* Helpdesk */}
      {tab === 'helpdesk' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Ticket</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Priority</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Subject</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tickets?.data?.map((t: any) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-primary">{t.ticketCode}</td>
                    <td className="px-4 py-3 text-sm"><Badge>{t.category}</Badge></td>
                    <td className="px-4 py-3"><Badge variant={t.priority === 'Critical' ? 'danger' : t.priority === 'High' ? 'warning' : 'info'}>{t.priority}</Badge></td>
                    <td className="px-4 py-3 text-sm">{t.subject}</td>
                    <td className="px-4 py-3"><Badge variant={t.status === 'Resolved' ? 'success' : t.status === 'Closed' ? 'default' : 'warning'}>{t.status}</Badge></td>
                  </tr>
                ))}
                {(!tickets?.data?.length) && <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-400">No records found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AI Assistant */}
      {tab === 'ai' && (
        <div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex gap-3">
            <Input placeholder="Ask HR Assistant anything..." value={aiQuery} onChange={(e: any) => setAiQuery(e.target.value)} className="flex-1" onKeyDown={(e: any) => e.key === 'Enter' && askAiMut.mutate(aiQuery)} />
            <Button onClick={() => askAiMut.mutate(aiQuery)} loading={askAiMut.isPending}><Send size={14} /> Ask</Button>
          </div>
          {aiResponse && (
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 mb-4">
              <div className="flex gap-2 mb-2"><Bot size={18} className="text-blue-600" /><span className="text-sm font-medium text-blue-800">AI Assistant</span><Badge variant="info">{(aiResponse.confidence * 100).toFixed(0)}% confidence</Badge></div>
              <p className="text-sm text-blue-900">{aiResponse.response}</p>
            </div>
          )}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b"><h3 className="font-semibold">Recent Conversations</h3></div>
            <div className="divide-y">
              {conversations?.data?.slice(0, 10).map((c: any) => (
                <div key={c.id} className="p-3 hover:bg-gray-50"><p className="text-sm font-medium">Q: {c.query.slice(0, 100)}</p><p className="text-xs text-gray-500 mt-1">A: {c.response?.slice(0, 150)}...</p></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Automation */}
      {tab === 'automation' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Workflow</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Trigger</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Active</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Success</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Last Run</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {workflows?.data?.map((w: any) => (
                  <tr key={w.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium">{w.workflowName}</td>
                    <td className="px-4 py-3 text-sm"><Badge>{w.triggerType}</Badge></td>
                    <td className="px-4 py-3"><Badge variant={w.isActive ? 'success' : 'default'}>{w.isActive ? 'Active' : 'Inactive'}</Badge></td>
                    <td className="px-4 py-3 text-sm text-green-600">{w.successCount}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{w.lastRunAt ? formatDate(w.lastRunAt) : 'Never'}</td>
                  </tr>
                ))}
                {(!workflows?.data?.length) && <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-400">No records found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reports */}
      {tab === 'reports' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Report</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Module</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Scheduled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reports?.data?.map((r: any) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium">{r.reportName}</td>
                    <td className="px-4 py-3 text-sm"><Badge variant="info">{r.module}</Badge></td>
                    <td className="px-4 py-3 text-sm">{r.reportType}</td>
                    <td className="px-4 py-3"><Badge variant={r.isScheduled ? 'success' : 'default'}>{r.isScheduled ? 'Scheduled' : 'On Demand'}</Badge></td>
                  </tr>
                ))}
                {(!reports?.data?.length) && <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No reports defined</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* API & Integrations */}
      {tab === 'api' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b flex justify-between"><h3 className="font-semibold">API Keys</h3><Button size="sm"><Plus size={14} /> Generate Key</Button></div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Prefix</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Scopes</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {apiKeys?.data?.map((k: any) => (
                    <tr key={k.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium">{k.keyName}</td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-500">{k.prefix}...</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{k.scopes}</td>
                      <td className="px-4 py-3"><Badge variant={k.isActive ? 'success' : 'danger'}>{k.isActive ? 'Active' : 'Revoked'}</Badge></td>
                    </tr>
                  ))}
                  {(!apiKeys?.data?.length) && <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No API keys created</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b"><h3 className="font-semibold">Webhooks</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Event</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {webhooks?.data?.map((w: any) => (
                    <tr key={w.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium">{w.webhookName}</td>
                      <td className="px-4 py-3 text-sm"><Badge variant="info">{w.eventType}</Badge></td>
                      <td className="px-4 py-3"><Badge variant={w.isActive ? 'success' : 'default'}>{w.isActive ? 'Active' : 'Inactive'}</Badge></td>
                    </tr>
                  ))}
                  {(!webhooks?.data?.length) && <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-500">No webhooks configured</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
