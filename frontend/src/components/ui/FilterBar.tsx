import React from 'react';
import { Search } from 'lucide-react';
import { cn } from '@lib/utils';

interface FilterBarProps {
  /** Fired on every keystroke. Use with debounce if needed. */
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  searchValue?: string;
  /** Additional filter controls (selects, date pickers, etc.) */
  filters?: React.ReactNode;
  /** Primary action button — pushed to the right */
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Standard Pattern-B filter bar — renders inside a table card, separated by `border-b`.
 *
 * ```tsx
 * <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
 *   <FilterBar
 *     onSearch={v => { setSearch(v); setPage(1); }}
 *     searchPlaceholder="Search employees..."
 *     filters={
 *       <select value={status} onChange={e => setStatus(e.target.value)} className="h-10 rounded-lg border border-gray-300 px-3 text-sm">
 *         <option value="">All Status</option>
 *         <option value="Active">Active</option>
 *       </select>
 *     }
 *     actions={<Button onClick={handleAdd}><Plus size={16}/> Add</Button>}
 *   />
 *   <div className="overflow-x-auto"><table>...</table></div>
 * </div>
 * ```
 */
export function FilterBar({ onSearch, searchPlaceholder = 'Search...', searchValue, filters, actions, className }: FilterBarProps) {
  return (
    <div className={cn('px-4 py-3 border-b border-gray-200 flex flex-wrap items-center gap-3', className)}>
      {onSearch && (
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={e => onSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            aria-label={searchPlaceholder}
          />
        </div>
      )}
      {filters && (
        <div className="flex items-center gap-2 flex-wrap">
          {filters}
        </div>
      )}
      {actions && (
        <div className="ml-auto flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
