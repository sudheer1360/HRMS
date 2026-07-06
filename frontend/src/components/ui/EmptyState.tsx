import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  /** Icon component from lucide-react */
  icon?: React.ElementType;
  title?: string;
  description?: string;
  /** Show when there's an active filter — changes description text */
  hasFilter?: boolean;
  /** If provided, renders an "Add" button (only shown when no filter is active) */
  onAdd?: () => void;
  addLabel?: string;
  /** colSpan for use inside a <td> */
  colSpan?: number;
}

/**
 * Renders a centered empty state with icon, title, description, and optional CTA.
 *
 * Usage inside a table:
 * ```tsx
 * <tr>
 *   <EmptyState colSpan={6} icon={Users} title="No employees found" onAdd={handleAdd} addLabel="Add Employee" />
 * </tr>
 * ```
 *
 * Usage standalone:
 * ```tsx
 * <EmptyState icon={FileText} title="No documents" description="Upload a file to get started." />
 * ```
 */
export function EmptyState({
  icon: Icon,
  title = 'No records found',
  description,
  hasFilter = false,
  onAdd,
  addLabel = 'Add',
  colSpan,
}: EmptyStateProps) {
  const defaultDescription = hasFilter
    ? 'Try adjusting your filters or search query.'
    : `Click "${addLabel}" to get started.`;

  const content = (
    <div className="flex flex-col items-center gap-3 py-16 px-4 text-center">
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
          <Icon size={20} className="text-gray-400" />
        </div>
      )}
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{description ?? defaultDescription}</p>
      </div>
      {!hasFilter && onAdd && (
        <Button size="sm" onClick={onAdd}>
          <Plus size={14} /> {addLabel}
        </Button>
      )}
    </div>
  );

  if (colSpan !== undefined) {
    return (
      <td colSpan={colSpan} className="px-4">
        {content}
      </td>
    );
  }

  return content;
}
