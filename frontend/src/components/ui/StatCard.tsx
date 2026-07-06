import React from 'react';
import { cn } from '@lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ElementType;
  /** Tailwind bg class, e.g. 'bg-blue-500' */
  iconColor?: string;
  trend?: { value: number; label: string };
  onClick?: () => void;
  className?: string;
}

/**
 * Unified stat card — replaces the three ad-hoc stat card styles.
 *
 * ```tsx
 * <StatCard
 *   label="Total Employees"
 *   value={412}
 *   icon={Users}
 *   iconColor="bg-blue-500"
 *   trend={{ value: 4.2, label: 'vs last month' }}
 * />
 * ```
 */
export function StatCard({ label, value, icon: Icon, iconColor = 'bg-gray-400', trend, onClick, className }: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-xl border border-gray-200 p-5',
        onClick && 'cursor-pointer hover:shadow-md transition-shadow',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide truncate">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1 tabular-nums">{value}</p>
          {trend && (
            <p className={cn('text-xs mt-1', trend.value >= 0 ? 'text-green-600' : 'text-red-600')}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%{' '}
              <span className="text-gray-400">{trend.label}</span>
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn('p-2.5 rounded-lg shrink-0', iconColor)}>
            <Icon size={18} className="text-white" />
          </div>
        )}
      </div>
    </div>
  );
}
