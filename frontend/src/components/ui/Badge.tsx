import React from 'react';
import { cn } from '@lib/utils';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-800',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  danger:  'bg-red-100 text-red-700',
  info:    'bg-blue-100 text-blue-700',
};

// Auto-map common status strings to a variant when no variant prop is given
const STATUS_MAP: Record<string, BadgeVariant> = {
  Active: 'success', Confirmed: 'success', Approved: 'success', Present: 'success', Published: 'success',
  Probation: 'info', 'Work From Home': 'info', Screening: 'info', Processing: 'info',
  Pending: 'warning', 'Half Day': 'warning', Late: 'warning', Draft: 'warning',
  Inactive: 'danger', Resigned: 'danger', Terminated: 'danger', Suspended: 'danger',
  Rejected: 'danger', Cancelled: 'danger', Absent: 'danger', Exited: 'danger',
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant, className }: BadgeProps) {
  const autoVariant =
    variant ??
    (typeof children === 'string' ? STATUS_MAP[children] : undefined) ??
    'default';
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap',
        variantClasses[autoVariant],
        className,
      )}
    >
      {children}
    </span>
  );
}
