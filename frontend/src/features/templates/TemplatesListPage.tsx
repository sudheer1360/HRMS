import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, FileText, Edit, Trash2 } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Badge, Spinner } from '@components/ui/Input';
import { formatDate } from '@lib/utils';
import { templatesService } from '@features/../services/templates.service';
import { PageHeader } from '@components/ui/PageHeader';
import { ConfirmDialog } from '@components/ui/ConfirmDialog';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Template {
  id: string;
  form_code: string;
  form_name: string;
  category: string;
  description?: string;
  status: string;
  created_at: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const TEMPLATE_CATEGORIES = [
  { value: 'All', label: 'All' },
  { value: 'offer_letter', label: 'Offer Letter' },
  { value: 'appointment_letter', label: 'Appointment Letter' },
  { value: 'confirmation_letter', label: 'Confirmation Letter' },
  { value: 'increment_letter', label: 'Increment Letter' },
  { value: 'promotion_letter', label: 'Promotion Letter' },
  { value: 'warning_letter', label: 'Warning Letter' },
  { value: 'relieving_letter', label: 'Relieving Letter' },
  { value: 'salary_certificate', label: 'Salary Certificate' },
  { value: 'experience_letter', label: 'Experience Letter' },
  { value: 'termination_letter', label: 'Termination Letter' },
  { value: 'email_template', label: 'Email' },
  { value: 'whatsapp_template', label: 'WhatsApp' },
  { value: 'sms_template', label: 'SMS' },
  { value: 'General', label: 'General' },
];

const CATEGORY_ICONS: Record<string, string> = {
  email_template: '📧',
  whatsapp_template: '💬',
  sms_template: '📱',
};

function statusVariant(s: string): 'success' | 'warning' | 'info' | 'default' {
  if (s === 'Active' || s === 'Published') return 'success';
  if (s === 'Draft') return 'warning';
  if (s === 'Approved') return 'info';
  return 'default';
}

async function listTemplates(params: { type?: string; search?: string }) {
  const p = new URLSearchParams();
  if (params.type && params.type !== 'All') p.set('type', params.type);
  const { data } = await templatesService.list(Object.fromEntries(new URLSearchParams(p)));
  return data;
}

async function deleteTemplate(id: string) {
  // No delete endpoint; update status to Archived
  await templatesService.archive(id);
}

function safeDate(v?: string) {
  if (!v) return '—';
  try { return formatDate(v); } catch { return v; }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TemplatesListPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('All');
  const [archiveId, setArchiveId] = React.useState<string | null>(null);
  const [archiveName, setArchiveName] = React.useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['templates', categoryFilter],
    queryFn: () => listTemplates({ type: categoryFilter }),
  });

  const archiveMutation = useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['templates'] as const }),
  });

  const templates = (data?.data ?? []).filter((t) =>
    !search || t.form_name.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Templates"
        subtitle="Manage document and communication templates"
        actions={
          <Link to="/templates/new">
            <Button><Plus size={16} /> New Template</Button>
          </Link>
        }
      />

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {TEMPLATE_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategoryFilter(cat.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                categoryFilter === cat.value
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {CATEGORY_ICONS[cat.value] ? `${CATEGORY_ICONS[cat.value]} ` : ''}{cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <Spinner />
      ) : templates.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-16 text-center">
          <FileText size={40} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 font-medium">No templates yet</p>
          <p className="text-sm text-gray-400 mt-1">Create your first template to generate documents automatically</p>
          <Link to="/templates/new" className="inline-block mt-4">
            <Button size="sm"><Plus size={14} /> New Template</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Template</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Created</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {templates.map((tpl) => (
                  <tr key={tpl.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{CATEGORY_ICONS[tpl.category] ?? '📄'}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{tpl.form_name}</p>
                          {tpl.description && (
                            <p className="text-xs text-gray-400 truncate max-w-xs">{tpl.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                        {TEMPLATE_CATEGORIES.find((c) => c.value === tpl.category)?.label ?? tpl.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant(tpl.status)}>{tpl.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{safeDate(tpl.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link to={`/templates/${tpl.id}`} className="p-1.5 rounded hover:bg-gray-100" aria-label="Edit" title="Edit">
                          <Edit size={14} />
                        </Link>
                        <button
                          onClick={() => { setArchiveId(tpl.id); setArchiveName(tpl.form_name); }}
                          className="p-1.5 rounded hover:bg-red-50 hover:text-danger"
                          title="Archive template" aria-label="Archive template"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {templates.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-400">No form templates found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!archiveId}
        onClose={() => { setArchiveId(null); setArchiveName(''); }}
        onConfirm={() => archiveId && archiveMutation.mutate(archiveId)}
        title={`Archive "${archiveName}"?`}
        message="Archived templates are hidden from the list but not deleted."
        confirmLabel="Archive"
        loading={archiveMutation.isPending}
      />
    </div>
  );
}
