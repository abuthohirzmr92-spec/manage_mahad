'use client';

import { useMemo } from 'react';
import { buildTimeline } from '@/lib/health-engine';
import type { HealthVisit, HealthTimelineEntry } from '@/types/health';
import { cn } from '@/lib/utils';
import {
  LogIn,
  Stethoscope,
  Eye,
  Ambulance,
  CheckCircle,
  FileText,
} from 'lucide-react';

// ── Styling constants ─────────────────────────────────────────────────────────

const TYPE_STYLES: Record<
  HealthTimelineEntry['type'],
  { dot: string; line: string; bg: string; icon: typeof LogIn; label: string }
> = {
  masuk: {
    dot: 'bg-blue-500',
    line: 'bg-blue-300 dark:bg-blue-700',
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    icon: LogIn,
    label: 'Masuk',
  },
  tindakan: {
    dot: 'bg-emerald-500',
    line: 'bg-emerald-300 dark:bg-emerald-700',
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    icon: Stethoscope,
    label: 'Tindakan',
  },
  observasi: {
    dot: 'bg-amber-500',
    line: 'bg-amber-300 dark:bg-amber-700',
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    icon: Eye,
    label: 'Observasi',
  },
  rujukan: {
    dot: 'bg-red-500',
    line: 'bg-red-300 dark:bg-red-700',
    bg: 'bg-red-50 dark:bg-red-950/20',
    icon: Ambulance,
    label: 'Rujukan',
  },
  selesai: {
    dot: 'bg-emerald-500',
    line: 'bg-emerald-300 dark:bg-emerald-700',
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    icon: CheckCircle,
    label: 'Selesai',
  },
  izin: {
    dot: 'bg-purple-500',
    line: 'bg-purple-300 dark:bg-purple-700',
    bg: 'bg-purple-50 dark:bg-purple-950/20',
    icon: FileText,
    label: 'Izin',
  },
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ── Timeline Entry ────────────────────────────────────────────────────────────

function TimelineEntry({
  entry,
  isLast,
}: {
  entry: HealthTimelineEntry;
  isLast: boolean;
}) {
  const styles = TYPE_STYLES[entry.type];
  const Icon = styles.icon;

  return (
    <div className="relative flex gap-4 pb-2">
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'relative z-10 flex items-center justify-center w-8 h-8 rounded-full ring-2 ring-background shrink-0',
            styles.bg,
            styles.dot.replace('bg-', 'border-') + '/30',
          )}
        >
          <Icon className="w-4 h-4 text-foreground/80" aria-hidden="true" />
        </div>
        {!isLast && (
          <div
            className={cn(
              'w-0.5 flex-1 min-h-[24px] -mt-0.5',
              styles.line,
            )}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-4 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-foreground">
            {entry.label}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {formatTime(entry.time)}
          </span>
        </div>
        {entry.detail && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {entry.detail}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface UKSTimelineProps {
  visit: HealthVisit;
}

export function UKSTimeline({ visit }: UKSTimelineProps) {
  const entries = useMemo(() => buildTimeline(visit), [visit]);

  if (entries.length === 0) {
    return (
      <p className="text-xs text-muted-foreground text-center py-4">
        Belum ada riwayat untuk kunjungan ini.
      </p>
    );
  }

  return (
    <div className="py-2">
      {entries.map((entry, idx) => (
        <TimelineEntry
          key={`${entry.type}-${idx}`}
          entry={entry}
          isLast={idx === entries.length - 1}
        />
      ))}
    </div>
  );
}
