'use client';

import { X, BedDouble, UserMinus, Trash2, UserCheck, UserPlus } from 'lucide-react';
import type { Kamar, Santri, Asrama } from '@/types';

const getInitials = (name: string) =>
  name.split(' ').map((n) => n[0]).slice(0, 2).join('');

function pointBadge(pts: number) {
  if (pts > 40) return { label: 'Berat', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
  if (pts > 20) return { label: 'Perhatian', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' };
  return { label: 'Aman', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' };
}

interface Props {
  kamar: Kamar;
  asrama: Asrama;
  penghuni: Santri[];
  onClose: () => void;
  onKeluarkan: (santriId: string) => void;
  onKosongkan: () => void;
  onTarikClick: () => void;
}

export function KamarDetailPanel({ kamar, asrama, penghuni, onClose, onKeluarkan, onKosongkan, onTarikClick }: Props) {
  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="kamar-panel-title"
        className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-background border-l border-border shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <BedDouble aria-hidden="true" className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 id="kamar-panel-title" className="font-bold text-foreground text-base">
                Kamar {kamar.name}
              </h2>
              <p className="text-xs text-muted-foreground">{asrama.name} · kapasitas {kamar.capacity}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup panel"
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X aria-hidden="true" className="w-5 h-5" />
          </button>
        </div>

        {/* Stats bar & Aksi Kamar */}
        <div className="px-5 py-3 border-b border-border bg-muted/20 shrink-0 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              <span className="font-bold text-foreground text-lg">{penghuni.length}</span> / {kamar.capacity} penghuni
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onTarikClick}
              disabled={penghuni.length >= kamar.capacity}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 rounded-lg transition-colors border border-primary/20"
            >
              <UserPlus aria-hidden="true" className="w-3.5 h-3.5" />
              Tarik Santri
            </button>
            {penghuni.length > 0 && (
              <button
                type="button"
                onClick={onKosongkan}
                className="flex items-center justify-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800 transition-colors"
              >
                <Trash2 aria-hidden="true" className="w-3.5 h-3.5" />
                Kosongkan
              </button>
            )}
          </div>
        </div>

        {/* Resident list */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 py-3 flex items-center gap-2 sticky top-0 bg-background border-b border-border">
            <UserCheck aria-hidden="true" className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Daftar Penghuni</span>
          </div>

          {penghuni.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
              <BedDouble aria-hidden="true" className="w-12 h-12 opacity-20" />
              <p className="text-sm">Kamar ini kosong</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {penghuni.map((s) => {
                const badge = pointBadge(s.totalPoinPelanggaran);
                return (
                  <li key={s.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {getInitials(s.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.kelas} · {s.totalPoinPelanggaran} poin</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge.cls}`}>
                        {badge.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => onKeluarkan(s.id)}
                        aria-label={`Keluarkan ${s.name} dari kamar`}
                        className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded-md transition-colors border border-border hover:border-red-200"
                      >
                        <UserMinus aria-hidden="true" className="w-3.5 h-3.5" />
                        Keluarkan
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}
