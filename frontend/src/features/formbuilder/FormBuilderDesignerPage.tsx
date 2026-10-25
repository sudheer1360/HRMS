import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown, Settings2,
  Eye, Send, Save, Type, AlignLeft, Hash, Calendar, List, ToggleLeft,
  Upload, Mail, Phone, Users, Building2, MapPin, Calculator, CheckSquare,
} from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Input, Select, Spinner } from '@components/ui/Input';
import { Badge } from '@components/ui/Input';
import api from '@lib/axios';

// ── Field Types ───────────────────────────────────────────────────────────────

interface FieldDef {
  id: string;
  fieldType: string;
  label: string;
  name: string;
  placeholder?: string;
  helpText?: string;
  isMandatory: boolean;
  options?: string[]; // for dropdown/radio/checkbox
}

interface FormData {
  id?: string;
  form_code?: string;
  form_name: string;
  category: string;
  description: string;
  fields_json: string; // JSON array of FieldDef
  status?: string;
}

const FIELD_TYPES = [
  { type: 'text', label: 'Text', icon: Type, category: 'Input' },
  { type: 'longtext', label: 'Long Text', icon: AlignLeft, category: 'Input' },
  { type: 'number', label: 'Number', icon: Hash, category: 'Input' },
  { type: 'currency', label: 'Currency', icon: Hash, category: 'Input' },
  { type: 'email', label: 'Email', icon: Mail, category: 'Input' },
  { type: 'phone', label: 'Phone', icon: Phone, category: 'Input' },
  { type: 'date', label: 'Date', icon: Calendar, category: 'Input' },
  { type: 'dropdown', label: 'Dropdown', icon: List, category: 'Selection' },
  { type: 'radio', label: 'Radio', icon: ToggleLeft, category: 'Selection' },
  { type: 'checkbox', label: 'Checkbox', icon: CheckSquare, category: 'Selection' },
  { type: 'fileupload', label: 'File Upload', icon: Upload, category: 'Upload' },
  { type: 'employeeselector', label: 'Employee', icon: Users, category: 'Reference' },
  { type: 'departmentselector', label: 'Department', icon: Building2, category: 'Reference' },
  { type: 'locationselector', label: 'Location', icon: MapPin, category: 'Reference' },
  { type: 'calculatedfield', label: 'Calculated', icon: Calculator, category: 'Computed' },
];

const FIELD_CATEGORIES = ['Input', 'Selection', 'Upload', 'Reference', 'Computed'];

const FORM_CATEGORIES = [
  'Onboarding', 'Interview', 'Exit', 'Expense', 'Travel',
  'Performance', 'Complaint', 'Incident', 'Policy', 'General',
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeField(type: string): FieldDef {
  const typeDef = FIELD_TYPES.find((f) => f.type === type);
  const label = typeDef?.label ?? type;
  return {
    id: `field_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    fieldType: type,
    label,
    name: label.toLowerCase().replace(/\s+/g, '_'),
    isMandatory: false,
    options: ['dropdown', 'radio', 'checkbox'].includes(type) ? ['Option 1', 'Option 2'] : undefined,
  };
}

async function getForm(id: string) {
  const { data } = await api.get<{ data: FormData }>(`/extended/forms/${id}`);
  return data.data;
}

async function saveForm(payload: { id?: string; name: string; category: string; description: string; fields: FieldDef[]; status?: string }) {
  if (payload.id) {
    const { data } = await api.put<{ data: FormData }>(`/extended/forms/${payload.id}`, {
      name: payload.name, category: payload.category, description: payload.description,
      fields: payload.fields, status: payload.status,
    });
    return data.data;
  }
  const { data } = await api.post<{ data: FormData }>('/extended/forms', {
    name: payload.name, category: payload.category, description: payload.description,
    fields: payload.fields,
  });
  return data.data;
}

// ── Field Card ────────────────────────────────────────────────────────────────

function FieldCard({
  field, index, total,
  onUpdate, onDelete, onMoveUp, onMoveDown,
}: {
  field: FieldDef; index: number; total: number;
  onUpdate: (id: string, updates: Partial<FieldDef>) => void;
  onDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const typeDef = FIELD_TYPES.find((f) => f.type === field.fieldType);
  const Icon = typeDef?.icon ?? Type;
  const hasOptions = ['dropdown', 'radio', 'checkbox'].includes(field.fieldType);

  return (
    <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-medium flex-shrink-0">
          {index + 1}
        </span>
        <Icon size={15} className="text-gray-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{field.label || '(Untitled field)'}</p>
          <p className="text-xs text-gray-400">{typeDef?.label ?? field.fieldType}{field.isMandatory ? ' · Required' : ''}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            disabled={index === 0}
            onClick={() => onMoveUp(field.id)}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"
          >
            <ChevronUp size={14} />
          </button>
          <button
            disabled={index === total - 1}
            onClick={() => onMoveDown(field.id)}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"
          >
            <ChevronDown size={14} />
          </button>
          <button
            onClick={() => setExpanded((v) => !v)}
            className={`p-1 rounded hover:bg-gray-100 ${expanded ? 'text-primary' : ''}`}
          >
            <Settings2 size={14} />
          </button>
          <button
            onClick={() => onDelete(field.id)}
            className="p-1 rounded hover:bg-red-50 hover:text-danger"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Expanded config */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 py-4 bg-gray-50 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Label"
              value={field.label}
              onChange={(e) => onUpdate(field.id, { label: e.target.value })}
            />
            <Input
              label="Field Name (key)"
              value={field.name}
              onChange={(e) => onUpdate(field.id, { name: e.target.value })}
            />
          </div>
          <Input
            label="Placeholder"
            value={field.placeholder ?? ''}
            onChange={(e) => onUpdate(field.id, { placeholder: e.target.value })}
          />
          <Input
            label="Help Text"
            value={field.helpText ?? ''}
            onChange={(e) => onUpdate(field.id, { helpText: e.target.value })}
          />
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={field.isMandatory}
              onChange={(e) => onUpdate(field.id, { isMandatory: e.target.checked })}
              className="rounded"
            />
            <span className="font-medium">Required field</span>
          </label>

          {hasOptions && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Options (one per line)</p>
              <textarea
                value={(field.options ?? []).join('\n')}
                onChange={(e) => onUpdate(field.id, { options: e.target.value.split('\n').filter(Boolean) })}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Preview Modal ─────────────────────────────────────────────────────────────

function FieldPreview({ field }: { field: FieldDef }) {
  const hasOptions = ['dropdown', 'radio', 'checkbox'].includes(field.fieldType);
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {field.label}{field.isMandatory && <span className="text-danger ml-0.5">*</span>}
      </label>
      {field.helpText && <p className="text-xs text-gray-400 mb-1">{field.helpText}</p>}
      {field.fieldType === 'longtext' ? (
        <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder={field.placeholder} rows={3} disabled />
      ) : field.fieldType === 'dropdown' ? (
        <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white" disabled>
          <option value="">{field.placeholder || 'Select...'}</option>
          {field.options?.map((o) => <option key={o}>{o}</option>)}
        </select>
      ) : field.fieldType === 'radio' ? (
        <div className="flex flex-wrap gap-4">
          {field.options?.map((o) => (
            <label key={o} className="flex items-center gap-2 text-sm cursor-not-allowed">
              <input type="radio" disabled /> {o}
            </label>
          ))}
        </div>
      ) : field.fieldType === 'checkbox' ? (
        <div className="flex flex-wrap gap-4">
          {field.options?.map((o) => (
            <label key={o} className="flex items-center gap-2 text-sm cursor-not-allowed">
              <input type="checkbox" disabled /> {o}
            </label>
          ))}
        </div>
      ) : field.fieldType === 'fileupload' ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg px-4 py-6 text-center text-sm text-gray-400">
          Click to upload or drag & drop
        </div>
      ) : (
        <input
          type={field.fieldType === 'number' || field.fieldType === 'currency' ? 'number' : field.fieldType === 'date' ? 'date' : field.fieldType === 'email' ? 'email' : field.fieldType === 'phone' ? 'tel' : 'text'}
          placeholder={field.placeholder}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          disabled
        />
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FormBuilderDesignerPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formMeta, setFormMeta] = React.useState({ name: '', category: 'General', description: '' });
  const [fields, setFields] = React.useState<FieldDef[]>([]);
  const [activePaletteCategory, setActivePaletteCategory] = React.useState('Input');
  const [preview, setPreview] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [savedId, setSavedId] = React.useState<string | undefined>(id);


  const { data: formData } = useQuery({
    queryKey: ['form', id],
    queryFn: () => getForm(id!),
    enabled: !isNew,
  });

  // Pre-fill when loaded
  React.useEffect(() => {
    if (!formData) return;
    setFormMeta({
      name: formData.form_name ?? '',
      category: formData.category ?? 'General',
      description: formData.description ?? '',
    });
    try {
      const parsed = JSON.parse(formData.fields_json ?? '[]');
      setFields(Array.isArray(parsed) ? parsed : []);
    } catch {
      setFields([]);
    }
    setSavedId(formData.id);
  }, [formData]);

  const saveMutation = useMutation({
    mutationFn: (status?: string) => saveForm({
      id: savedId,
      name: formMeta.name,
      category: formMeta.category,
      description: formMeta.description,
      fields,
      status,
    }),
    onSuccess: (data) => {
      setSaved(true);
      setSavedId(data?.id);
      queryClient.invalidateQueries({ queryKey: ['forms'] as const });
      setTimeout(() => setSaved(false), 2000);
      if (isNew && data?.id) {
        navigate(`/forms/${data.id}`, { replace: true });
      }
    },
  });

  const addField = (type: string) => {
    setFields((prev) => [...prev, makeField(type)]);
  };

  const updateField = (fieldId: string, updates: Partial<FieldDef>) => {
    setFields((prev) => prev.map((f) => (f.id === fieldId ? { ...f, ...updates } : f)));
  };

  const deleteField = (fieldId: string) => {
    setFields((prev) => prev.filter((f) => f.id !== fieldId));
  };

  const moveField = (fieldId: string, dir: 'up' | 'down') => {
    setFields((prev) => {
      const idx = prev.findIndex((f) => f.id === fieldId);
      if (idx < 0) return prev;
      const next = [...prev];
      const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= next.length) return prev;
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      return next;
    });
  };

  if (!isNew && isLoading) return <Spinner />;

  const paletteFields = FIELD_TYPES.filter((f) => f.category === activePaletteCategory);

  return (
    <div className="flex flex-col h-full">
      {/* ── Top bar ── */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <button
          onClick={() => navigate('/forms')}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <input
            type="text"
            placeholder="Form name..."
            value={formMeta.name}
            onChange={(e) => setFormMeta((m) => ({ ...m, name: e.target.value }))}
            className="text-xl font-bold text-gray-900 border-0 outline-none bg-transparent w-full placeholder:text-gray-300"
          />
        </div>
        <div className="flex items-center gap-2">
          {formData?.status && (
            <Badge variant={formData.status === 'Published' ? 'success' : 'warning'}>
              {formData.status}
            </Badge>
          )}
          <button
            onClick={() => setPreview((v) => !v)}
            className={`p-2 rounded-lg border transition-colors ${preview ? 'bg-primary/10 border-primary/30 text-primary' : 'border-gray-200 hover:bg-gray-50'}`}
            title="Toggle Preview"
          >
            <Eye size={16} />
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
            disabled={!formMeta.name || fields.length === 0}
            onClick={() => saveMutation.mutate('Published')}
          >
            <Send size={14} /> Publish
          </Button>
        </div>
      </div>

      {/* Form meta strip */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Category"
            value={formMeta.category}
            onChange={(e) => setFormMeta((m) => ({ ...m, category: e.target.value }))}
            options={FORM_CATEGORIES.map((c) => ({ value: c, label: c }))}
          />
          <div className="sm:col-span-2">
            <Input
              label="Description"
              value={formMeta.description}
              onChange={(e) => setFormMeta((m) => ({ ...m, description: e.target.value }))}
              placeholder="Brief description of this form..."
            />
          </div>
        </div>
      </div>

      {preview ? (
        /* ── Preview Mode ── */
        <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-2xl mx-auto w-full">
          <h2 className="text-xl font-bold mb-1">{formMeta.name || 'Untitled Form'}</h2>
          {formMeta.description && <p className="text-sm text-gray-500 mb-6">{formMeta.description}</p>}
          {fields.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No fields added yet.</p>
          ) : (
            fields.map((f) => <FieldPreview key={f.id} field={f} />)
          )}
          {fields.length > 0 && (
            <Button className="mt-4">Submit</Button>
          )}
        </div>
      ) : (
        /* ── Designer Mode ── */
        <div className="flex gap-4 flex-1 min-h-0">
          {/* Left: Field palette */}
          <div className="w-56 flex-shrink-0 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Field Types</p>
            </div>
            {/* Category tabs */}
            <div className="flex flex-wrap gap-1 p-2 border-b border-gray-100">
              {FIELD_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActivePaletteCategory(cat)}
                  className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                    activePaletteCategory === cat ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {/* Field buttons */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {paletteFields.map((ft) => {
                const Icon = ft.icon;
                return (
                  <button
                    key={ft.type}
                    onClick={() => addField(ft.type)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-left hover:bg-primary/5 hover:text-primary transition-colors group"
                  >
                    <Icon size={14} className="text-gray-400 group-hover:text-primary flex-shrink-0" />
                    {ft.label}
                    <Plus size={12} className="ml-auto opacity-0 group-hover:opacity-100" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Center: Field list (canvas) */}
          <div className="flex-1 min-w-0">
            {fields.length === 0 ? (
              <div className="h-full bg-white rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 p-8">
                <Plus size={40} className="mb-3 opacity-30" />
                <p className="font-medium">Click a field type to add it here</p>
                <p className="text-sm mt-1">Build your form by adding and configuring fields</p>
              </div>
            ) : (
              <div className="space-y-2">
                {fields.map((field, idx) => (
                  <FieldCard
                    key={field.id}
                    field={field}
                    index={idx}
                    total={fields.length}
                    onUpdate={updateField}
                    onDelete={deleteField}
                    onMoveUp={(fid) => moveField(fid, 'up')}
                    onMoveDown={(fid) => moveField(fid, 'down')}
                  />
                ))}
                <button
                  onClick={() => addField('text')}
                  className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-gray-300 rounded-xl text-sm text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
                >
                  <Plus size={14} /> Add Field
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {saveMutation.isError && (
        <p className="mt-3 text-sm text-danger">Failed to save. Please try again.</p>
      )}
    </div>
  );
}
