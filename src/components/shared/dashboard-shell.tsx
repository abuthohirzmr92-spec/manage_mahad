import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingDown } from 'lucide-react';

/* ── Wrapper for consistent page-level vertical rhythm ── */
export function DashboardShell({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('space-y-6', className)}>{children}</div>;
}

/* ── Standard stats grid: 2 cols mobile → 4 cols desktop ── */
export function StatsGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('grid grid-cols-2 lg:grid-cols-4 gap-4', className)}>{children}</div>;
}

/* ── Dual-panel chart grid: 1 col mobile → 2 cols desktop ── */
export function ChartRow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('grid grid-cols-1 lg:grid-cols-2 gap-6', className)}>{children}</div>;
}

/* ── Chart placeholder ready for real chart library ── */
export function ChartContainer({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'h-64 flex items-center justify-center text-muted-foreground border border-dashed border-border rounded-lg',
        className,
      )}
    >
      {children || (
        <div className="text-center">
          <TrendingDown className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Chart akan ditampilkan di sini</p>
          <p className="text-xs text-muted-foreground/70">Integrasi chart library coming soon</p>
        </div>
      )}
    </div>
  );
}

/* ── Standard rounded table wrapper ── */
export function DataTableShell({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}
