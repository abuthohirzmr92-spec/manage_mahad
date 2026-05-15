'use client';

import { BedDouble, Users } from 'lucide-react';
import type { Kamar, Santri } from '@/types';

interface Props {
  kamar: Kamar;
  penghuni: Santri[];
  onClick: () => void;
}

function roomStatus(filled: number, capacity: number): { label: string; cls: string } {
  if (filled === 0) return { label: 'Kosong', cls: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' };
  if (filled >= capacity) return { label: 'Penuh', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
  if (filled / capacity >= 0.7) return { label: 'Hampir Penuh', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' };
  return { label: 'Tersedia', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' };
}

export function KamarCard({ kamar, penghuni, onClick }: Props) {
  const filled = penghuni.length;
  const pct = Math.round((filled / kamar.capacity) * 100);
  const barColor = filled >= kamar.capacity ? 'bg-red-500' : filled / kamar.capacity >= 0.7 ? 'bg-amber-500' : 'bg-emerald-500';
  const status = roomStatus(filled, kamar.capacity);

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-xl border border-border bg-card p-4 hover:shadow-md hover:border-primary/40 transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <BedDouble aria-hidden="true" className="w-4 h-4 text-primary" />
          </div>
          <span className="font-semibold text-sm text-foreground">{kamar.name}</span>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${status.cls}`}>
          {status.label}
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground flex items-center gap-1">
            <Users aria-hidden="true" className="w-3 h-3" /> Penghuni
          </span>
          <span className="font-medium text-foreground">{filled} / {kamar.capacity}</span>
        </div>
        <div className="w-full bg-muted rounded-full h-1.5">
          <div className={`h-1.5 rounded-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    </button>
  );
}
