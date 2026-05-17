'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getStatusVariant, getStatusLabel } from '@/config/status-labels';

type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'purple' | 'fatal';

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  className?: string;
}

const variantStyles: Record<StatusVariant, string> = {
  success: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30',
  warning: 'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400 dark:border-amber-500/30',
  error: 'bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400 dark:border-red-500/30',
  info: 'bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-400 dark:border-blue-500/30',
  neutral: 'bg-zinc-500/10 text-zinc-700 border-zinc-500/20 dark:text-zinc-400 dark:border-zinc-500/30',
  purple: 'bg-purple-500/10 text-purple-700 border-purple-500/20 dark:text-purple-400 dark:border-purple-500/30',
  fatal: 'bg-rose-500/15 text-rose-800 border-rose-500/30 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40 font-bold',
};

const dotStyles: Record<StatusVariant, string> = {
  success: 'bg-emerald-500', warning: 'bg-amber-500', error: 'bg-red-500',
  info: 'bg-blue-500', neutral: 'bg-zinc-500', purple: 'bg-purple-500', fatal: 'bg-rose-600',
};

export function StatusBadge({ status, variant, className }: StatusBadgeProps) {
  const resolvedVariant = variant || getStatusVariant(status);
  const label = getStatusLabel(status);
  return (
    <Badge variant="outline" className={cn('text-[11px] font-medium px-2 py-0.5 gap-1.5 rounded-md border', variantStyles[resolvedVariant], className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotStyles[resolvedVariant])} />
      {label}
    </Badge>
  );
}
