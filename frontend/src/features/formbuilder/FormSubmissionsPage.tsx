import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, FileText } from 'lucide-react';
import { Badge, Spinner } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { formatDate } from '@lib/utils';
import api from '@lib/axios';
import { PageHeader } from '@components/ui/PageHeader';

interface Submission {
  id: string;
  submitted_by: string;
  status: string;
  created_at: string;
  data_json: string;
}

interface FormMeta {
  id: string;
  form_name: string;
  form_code: string;
  status: string;
}

async function getForm(id: string): Promise<FormMeta> {
  const { data } = await api.get<{ data: FormMeta }>(`/extended/forms/${id}`);
  return data.data;
}

async function getSubmissions(id: string): Promise<Submission[]> {
  const { data } = await api.get<{ data: Submission[] }>(`/extended/forms/${id}/submissions`);
  return data.data ?? [];
}

function safeDate(v?: string) {
  if (!v) return '—';
  try { return formatDate(v); } catch { return v; }
}

export default function FormSubmissionsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [expanded, setExpanded] = React.useState<string | null>(null);

  const { data: form } = useQuery({ queryKey: ['form', id], queryFn: () => getForm(id!) });
  const { data: submissions, isLoading } = useQuery({
    queryKey: ['form-submissions', id],
    queryFn: () => getSubmissions(id!),
    enabled: !!id,
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(`/forms/${id}`)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Submissions</h1>
          <p className="text-gray-500 mt-0.5">{form?.form_name ?? '...'} · {form?.form_code}</p>
        </div>
      </div>

      {isLoading ? (
        <Spinner />
      ) : !submissions || submissions.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-16 text-center">
          <FileText size={40} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 font-medium">No submissions yet</p>
          <p className="text-sm text-gray-400 mt-1">Submissions will appear here once the form is published and filled out</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-600">{submissions.length} submission{submissions.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="divide-y divide-gray-100">
            {submissions.map((sub) => {
              const isOpen = expanded === sub.id;
              let parsedData: Record<string, unknown> = {};
              try { parsedData = JSON.parse(sub.data_json ?? '{}'); } catch {}
              return (
                <div key={sub.id}>
                  <div
                    className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setExpanded(isOpen ? null : sub.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">Submission #{sub.id.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-gray-400">{safeDate(sub.created_at)}</p>
                    </div>
                    <Badge variant={sub.status === 'Submitted' ? 'success' : 'default'}>{sub.status}</Badge>
                  </div>
                  {isOpen && (
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                      {Object.keys(parsedData).length === 0 ? (
                        <p className="text-sm text-gray-400">No response data recorded.</p>
                      ) : (
                        <dl className="grid grid-cols-2 gap-x-6 gap-y-2">
                          {Object.entries(parsedData).map(([k, v]) => (
                            <div key={k}>
                              <dt className="text-xs text-gray-500 capitalize">{k.replace(/_/g, ' ')}</dt>
                              <dd className="text-sm font-medium text-gray-900">{String(v)}</dd>
                            </div>
                          ))}
                        </dl>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
