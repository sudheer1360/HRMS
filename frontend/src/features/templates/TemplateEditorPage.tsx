import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, Send, Variable, Eye, EyeOff } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Input, Select, Spinner } from '@components/ui/Input';
import { Badge } from '@components/ui/Input';
import { templatesService } from '@features/../services/templates.service';

// ── Constants ─────────────────────────────────────────────────────────────────

const TEMPLATE_TYPES = [
  { value: 'offer_letter', label: 'Offer Letter', category: 'document' },
  { value: 'appointment_letter', label: 'Appointment Letter', category: 'document' },
  { value: 'confirmation_letter', label: 'Confirmation Letter', category: 'document' },
  { value: 'increment_letter', label: 'Increment Letter', category: 'document' },
  { value: 'promotion_letter', label: 'Promotion Letter', category: 'document' },
  { value: 'transfer_letter', label: 'Transfer Letter', category: 'document' },
  { value: 'warning_letter', label: 'Warning Letter', category: 'document' },
  { value: 'showcause_notice', label: 'Show-Cause Notice', category: 'document' },
  { value: 'noc', label: 'NOC', category: 'document' },
  { value: 'salary_certificate', label: 'Salary Certificate', category: 'document' },
  { value: 'experience_letter', label: 'Experience Letter', category: 'document' },
  { value: 'relieving_letter', label: 'Relieving Letter', category: 'document' },
  { value: 'termination_letter', label: 'Termination Letter', category: 'document' },
  { value: 'fnf_letter', label: 'FNF Settlement Letter', category: 'document' },
  { value: 'policy_acknowledgement', label: 'Policy Acknowledgement', category: 'document' },
  { value: 'email_template', label: 'Email Template', category: 'email' },
  { value: 'whatsapp_template', label: 'WhatsApp Template', category: 'whatsapp' },
  { value: 'sms_template', label: 'SMS Template', category: 'sms' },
  { value: 'General', label: 'General', category: 'document' },
];

// Standard HRMS template variables grouped by entity
const VARIABLE_GROUPS = [
  {
    label: 'Employee',
    vars: [
      { key: 'employee_name', desc: "Employee's full name" },
      { key: 'employee_code', desc: 'Employee code' },
      { key: 'employee_email', desc: 'Work email' },
      { key: 'employee_mobile', desc: 'Mobile number' },
      { key: 'date_of_joining', desc: 'Date of joining' },
      { key: 'designation', desc: 'Job title / designation' },
      { key: 'department', desc: 'Department name' },
      { key: 'grade', desc: 'Pay grade' },
      { key: 'branch', desc: 'Branch / office location' },
    ],
  },
  {
    label: 'Compensation',
    vars: [
      { key: 'ctc_annual', desc: 'Annual CTC' },
      { key: 'ctc_monthly', desc: 'Monthly CTC' },
      { key: 'basic_salary', desc: 'Basic salary' },
      { key: 'hra', desc: 'HRA amount' },
      { key: 'increment_amount', desc: 'Increment amount' },
      { key: 'increment_percentage', desc: 'Increment %' },
    ],
  },
  {
    label: 'Company',
    vars: [
      { key: 'company_name', desc: 'Company legal name' },
      { key: 'company_address', desc: 'Registered address' },
      { key: 'signatory_name', desc: 'Authorised signatory' },
      { key: 'signatory_title', desc: "Signatory's designation" },
      { key: 'issue_date', desc: 'Document issue date' },
    ],
  },
  {
    label: 'Dates',
    vars: [
      { key: 'today', desc: "Today's date" },
      { key: 'effective_date', desc: 'Effective date' },
      { key: 'last_working_day', desc: 'Last working day' },
      { key: 'confirmation_date', desc: 'Confirmation date' },
      { key: 'notice_period_end', desc: 'Notice period end date' },
    ],
  },
];

// ── Types ─────────────────────────────────────────────────────────────────────

interface TemplateData {
  id?: string;
  form_name: string;
  category: string;
  description: string;
  fields_json: string; // repurposed to store body content
  status?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function getTemplate(id: string): Promise<TemplateData> {
  const { data } = await templatesService.getById(id);
  return data.data;
}

async function saveTemplate(payload: {
  id?: string; name: string; category: string; description: string; body: string; status?: string;
}) {
  const body = {
    name: payload.name,
    category: payload.category,
    description: payload.description,
    fields: [{ type: 'body', content: payload.body }],
    status: payload.status,
  };
  if (payload.id) {
    const { data } = await templatesService.update(payload.id, body);
    return data.data;
  }
  const { data } = await templatesService.create(body);
  return data.data;
}

function extractBody(fieldsJson: string): string {
  try {
    const parsed = JSON.parse(fieldsJson ?? '[]');
    if (Array.isArray(parsed)) {
      const bodyField = parsed.find((f: any) => f.type === 'body');
      return bodyField?.content ?? '';
    }
  } catch {}
  return '';
}

function renderPreview(body: string): string {
  // Replace {{variable}} with sample highlighted spans
  return body.replace(/\{\{(\w+)\}\}/g, (_, v) =>
    `<mark class="bg-yellow-100 text-yellow-800 px-0.5 rounded">[${v}]</mark>`
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TemplateEditorPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [meta, setMeta] = React.useState({ name: '', category: 'General', description: '' });
  const [body, setBody] = React.useState('');
  const [savedId, setSavedId] = React.useState<string | undefined>(id);
  const [showPreview, setShowPreview] = React.useState(false);
  const [showVarPanel, setShowVarPanel] = React.useState(true);
  const [varSearch, setVarSearch] = React.useState('');
  const [saved, setSaved] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const { data: tplData, isLoading } = useQuery({
    queryKey: ['template', id],
    queryFn: () => getTemplate(id!),
    enabled: !isNew,
  });

  React.useEffect(() => {
    if (!tplData) return;
    setMeta({
      name: tplData.form_name ?? '',
      category: tplData.category ?? 'General',
      description: tplData.description ?? '',
    });
    setBody(extractBody(tplData.fields_json));
    setSavedId(tplData.id);
  }, [tplData]);

  const saveMutation = useMutation({
    mutationFn: (status?: string) =>
      saveTemplate({ id: savedId, name: meta.name, category: meta.category, description: meta.description, body, status }),
    onSuccess: (data) => {
      setSaved(true);
      setSavedId(data?.id);
      queryClient.invalidateQueries({ queryKey: ['templates'] as const });
      setTimeout(() => setSaved(false), 2000);
      if (isNew && data?.id) navigate(`/templates/${data.id}`, { replace: true });
    },
  });

  const insertVariable = (varKey: string) => {
    const ta = textareaRef.current;
    if (!ta) { setBody((b) => b + `{{${varKey}}}`); return; }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const token = `{{${varKey}}}`;
    const newBody = body.slice(0, start) + token + body.slice(end);
    setBody(newBody);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + token.length, start + token.length);
    }, 0);
  };

  const filteredGroups = VARIABLE_GROUPS.map((g) => ({
    ...g,
    vars: g.vars.filter(
      (v) => !varSearch || v.key.includes(varSearch.toLowerCase()) || v.desc.toLowerCase().includes(varSearch.toLowerCase())
    ),
  })).filter((g) => g.vars.length > 0);

  if (!isNew && isLoading) return <Spinner />;

  const typeOptions = TEMPLATE_TYPES.map((t) => ({ value: t.value, label: t.label }));

  return (
    <div className="flex flex-col h-full">
      {/* ── Top bar ── */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <button onClick={() => navigate('/templates')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          <ArrowLeft size={18} />
        </button>
        <input
          type="text"
          placeholder="Template name..."
          value={meta.name}
          onChange={(e) => setMeta((m) => ({ ...m, name: e.target.value }))}
          className="flex-1 text-xl font-bold text-gray-900 border-0 outline-none bg-transparent placeholder:text-gray-300 min-w-0"
        />
        <div className="flex items-center gap-2">
          {tplData?.status && (
            <Badge variant={tplData.status === 'Active' || tplData.status === 'Published' ? 'success' : 'warning'}>
              {tplData.status}
            </Badge>
          )}
          <button
            onClick={() => setShowPreview((v) => !v)}
            className={`p-2 rounded-lg border transition-colors ${showPreview ? 'bg-primary/10 border-primary/30 text-primary' : 'border-gray-200 hover:bg-gray-50'}`}
            title="Toggle Preview"
          >
            {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          <button
            onClick={() => setShowVarPanel((v) => !v)}
            className={`p-2 rounded-lg border transition-colors ${showVarPanel ? 'bg-primary/10 border-primary/30 text-primary' : 'border-gray-200 hover:bg-gray-50'}`}
            title="Toggle Variable Panel"
          >
            <Variable size={16} />
          </button>
          <Button
            variant="secondary"
            size="sm"
            loading={saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            <Save size={14} /> {saved ? 'Saved!' : 'Save Draft'}
          </Button>
          <Button
            size="sm"
            loading={saveMutation.isPending}
            disabled={!meta.name || !body}
            onClick={() => saveMutation.mutate('Active')}
          >
            <Send size={14} /> Approve & Activate
          </Button>
        </div>
      </div>

      {/* Meta strip */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Template Type"
            value={meta.category}
            onChange={(e) => setMeta((m) => ({ ...m, category: e.target.value }))}
            options={typeOptions}
          />
          <div className="sm:col-span-2">
            <Input
              label="Description"
              value={meta.description}
              onChange={(e) => setMeta((m) => ({ ...m, description: e.target.value }))}
              placeholder="Brief description of this template..."
            />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Editor / Preview */}
        <div className="flex-1 min-w-0 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 bg-gray-50">
            <p className="text-xs font-medium text-gray-600">{showPreview ? 'Preview' : 'Editor'}</p>
            {!showPreview && (
              <p className="text-xs text-gray-400 ml-auto">
                Use <code className="bg-gray-200 px-1 rounded">{'{{variable_name}}'}</code> to insert dynamic values
              </p>
            )}
          </div>

          {showPreview ? (
            <div
              className="flex-1 overflow-auto p-8 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: renderPreview(body) || '<p class="text-gray-400">Nothing to preview yet.</p>' }}
            />
          ) : (
            <textarea
              ref={textareaRef}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={`Start writing your template here...\n\nExample:\nDear {{employee_name}},\n\nWe are pleased to confirm your employment at {{company_name}}...\n\nWith regards,\n{{signatory_name}}\n{{signatory_title}}`}
              className="flex-1 resize-none px-6 py-4 text-sm font-mono text-gray-800 focus:outline-none leading-relaxed"
              style={{ fontFamily: "'Georgia', serif", lineHeight: 1.8 }}
            />
          )}
        </div>

        {/* Variable panel */}
        {showVarPanel && (
          <div className="w-64 flex-shrink-0 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Variables</p>
              <input
                type="text"
                placeholder="Search variables..."
                value={varSearch}
                onChange={(e) => setVarSearch(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {filteredGroups.map((group) => (
                <div key={group.label}>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">{group.label}</p>
                  <div className="space-y-1">
                    {group.vars.map((v) => (
                      <button
                        key={v.key}
                        onClick={() => insertVariable(v.key)}
                        title={v.desc}
                        className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-primary/5 group transition-colors"
                      >
                        <p className="text-xs font-mono text-primary">{'{{' + v.key + '}}'}</p>
                        <p className="text-[10px] text-gray-400 truncate">{v.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {filteredGroups.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">No variables match "{varSearch}"</p>
              )}
            </div>
          </div>
        )}
      </div>

      {saveMutation.isError && (
        <p className="mt-3 text-sm text-danger">Failed to save. Please try again.</p>
      )}
    </div>
  );
}
