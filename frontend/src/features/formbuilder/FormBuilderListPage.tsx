import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, FileText, Eye, Edit, Trash2, LayoutList } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Badge, Spinner } from '@components/ui/Input';
import { formatDate } from '@lib/utils';
import { formbuilderService } from '@features/../services/formbuilder.service';
import { PageHeader } from '@components/ui/PageHeader';
import { ConfirmDialog } from '@components/ui/ConfirmDialog';

// ── Types ─────────────────────────────────────────────────────────────────────

interface DynamicForm {
  id: string;
  formCode: string;
  form_code?: string;
  formName: string;
  form_name?: string;
  category: string;
  description?: string;
  status: 'Draft' | 'Published' | 'Archived';
  createdAt: string;
  created_at?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const FORM_CATEGORIES = [
  'All', 'Onboarding', 'Interview', 'Exit', 'Expense', 'Travel',
  'Performance', 'Complaint', 'Incident', 'Policy', 'General',
];

function statusVariant(s: string): 'success' | 'warning' | 'default' {
  if (s === 'Published') return 'success';
  if (s === 'Draft') return 'warning';
  return 'default';
}

async function listForms(params: { category?: string; search?: string; page?: number }) {
  const p = new URLSearchParams({ page: String(params.page ?? 1), limit: '20' });
  if (params.category && params.category !== 'All') p.set('category', params.category);
  if (params.search) p.set('search', params.search);
  const { data } = await formbuilderService.list(Object.fromEntries(new URLSearchParams(p)));
  return data;
}

async function deleteForm(id: string) {
  await formbuilderService.delete(id);
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FormBuilderListPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState('');
  const [category, setCategory] = React.useState('All');
  const [page, setPage] = React.useState(1);
  const [deleteFormId, setDeleteFormId] = React.useState<string | null>(null);
  const [deleteFormName, setDeleteFormName] = React.useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['forms', category, search, page],
    queryFn: () => listForms({ category, search, page }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteForm,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['forms'] as const }),
  });

  const forms = data?.data ?? [];

  return (
    <div>
      <PageHeader
        title="Form Builder"
        subtitle="Create and manage custom HR forms"
        actions={
          <Link to="/forms/new">
            <Button><Plus size={16} /> New Form</Button>
          </Link>
        }
      />

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search forms..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          {FORM_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setPage(1); }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                category === cat
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <Spinner />
      ) : forms.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-16 text-center">
          <FileText size={40} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 font-medium">No forms yet</p>
          <p className="text-sm text-gray-400 mt-1">Create your first form to get started</p>
          <Link to="/forms/new" className="inline-block mt-4">
            <Button size="sm"><Plus size={14} /> New Form</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {forms.map((form) => (
            <div key={form.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <LayoutList size={16} className="text-primary" />
                  </div>
                  <Badge variant={statusVariant(form.status)}>{form.status}</Badge>
                </div>
                <span className="text-xs text-gray-400 font-mono">{form.formCode ?? form.form_code}</span>
              </div>

              <h3 className="font-semibold text-gray-900 mb-1 truncate">{form.formName ?? form.form_name}</h3>
              {form.description && (
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{form.description}</p>
              )}

              <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                <span className="bg-gray-100 px-2 py-0.5 rounded-full">{form.category}</span>
                <span>·</span>
                <span>{formatDate(form.createdAt ?? form.created_at ?? '')}</span>
              </div>

              <div className="flex items-center gap-1 pt-3 border-t border-gray-100">
                <Link to={`/forms/${form.id}`} className="flex-1">
                  <Button variant="secondary" size="sm" className="w-full">
                    <Edit size={13} /> Edit
                  </Button>
                </Link>
                <Link to={`/forms/${form.id}/submissions`}>
                  <Button variant="secondary" size="sm" title="View Submissions">
                    <Eye size={13} />
                  </Button>
                </Link>
                <button
                  onClick={() => { setDeleteFormId(form.id); setDeleteFormName(form.form_name); }}
                  className="p-2 rounded-lg hover:bg-red-50 hover:text-danger transition-colors"
                  title="Delete form" aria-label="Delete form"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data?.meta && data.meta.total > 20 && (
        <div className="flex items-center justify-between mt-4 pt-4">
          <p className="text-sm text-gray-500">Total: {data.meta.total} forms</p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
            <Button variant="secondary" size="sm" disabled={(page * 20) >= data.meta.total} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={!!deleteFormId}
        onClose={() => setDeleteFormId(null)}
        onConfirm={() => { deleteMutation.mutate(deleteFormId!); setDeleteFormId(null); }}
        title="Delete Form"
        message={`Delete "${deleteFormName}"? All submissions will also be removed.`}
        confirmLabel="Delete Form"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
