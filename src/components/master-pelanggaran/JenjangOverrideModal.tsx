'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { JenjangToleranceOverride, SeverityLimits } from '@/types';
import { ALL_SEVERITIES, DEFAULT_SEVERITY_LIMITS } from '@/types';
import { SEVERITY_COLORS } from '@/components/pelanggaran/constants';
import { Shield, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const inputCls = cn(
  'w-full rounded-lg border px-3 py-2 text-sm text-foreground',
  'bg-muted/40 border-border/60',
  'focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40',
  'dark:bg-white/[0.03] dark:border-white/[0.07]',
  'transition-[border-color,box-shadow] duration-200',
);

const dialogCls = cn(
  'bg-background/95',
  'dark:bg-background/90 dark:backdrop-blur-md',
  'dark:border dark:border-white/[0.08]',
);

const ALL_JENJANG = ['Tamhidi', "Ibtida'i", 'Tsanawiyah', 'MTs', 'MA', 'Tahsin', 'Tahfidz'];

interface Props {
  open: boolean;
  /** If provided, editing existing override; otherwise creating new one */
  override: JenjangToleranceOverride | null;
  /** Jenjang yang sudah punya override (tidak bisa dipilih lagi saat create) */
  existingJenjang: string[];
  onClose: () => void;
  onSave: (data: { jenjang: string; isActive: boolean; limits: SeverityLimits }) => void;
}

export function JenjangOverrideModal({ open, override, existingJenjang, onClose, onSave }: Props) {
  const [jenjang, setJenjang] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [limits, setLimits] = useState<SeverityLimits>({ ...DEFAULT_SEVERITY_LIMITS });

  const isEdit = override !== null;

  useEffect(() => {
    if (open) {
      if (override) {
        setJenjang(override.jenjang);
        setIsActive(override.isActive);
        setLimits({ ...override.limits });
      } else {
        const available = ALL_JENJANG.filter((j) => !existingJenjang.includes(j));
        setJenjang(available[0] ?? '');
        setIsActive(true);
        setLimits({ ...DEFAULT_SEVERITY_LIMITS });
      }
    }
  }, [open, override, existingJenjang]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jenjang.trim()) return;
    onSave({ jenjang: jenjang.trim(), isActive, limits });
  };

  const setLimit = (sev: keyof SeverityLimits, value: number) => {
    setLimits((prev) => ({ ...prev, [sev]: Math.max(0, Math.round(value)) }));
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className={cn('sm:max-w-md', dialogCls)}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-0.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 bg-primary/10 ring-1 ring-primary/20">
              {isEdit ? <Shield className="w-4 h-4 text-primary" /> : <Plus className="w-4 h-4 text-primary" />}
            </div>
            <DialogTitle className="text-base font-semibold">
              {isEdit ? 'Edit Override Jenjang' : 'Tambah Override Jenjang'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground/80 leading-relaxed">
            Override jenjang akan diprioritaskan di atas global default. Seluruh tingkat dalam jenjang ini otomatis mengikuti aturan ini.
          </DialogDescription>
        </DialogHeader>

        <form id="jenjang-override-form" onSubmit={handleSubmit} className="space-y-4 py-1">
          {/* Jenjang selector (disabled in edit mode) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Jenjang</label>
            {isEdit ? (
              <div className={cn(inputCls, 'bg-muted/20 text-muted-foreground')}>{jenjang}</div>
            ) : (
              <select
                value={jenjang}
                onChange={(e) => setJenjang(e.target.value)}
                className={inputCls}
                required
              >
                {ALL_JENJANG.map((j) => (
                  <option key={j} value={j} disabled={existingJenjang.includes(j)}>
                    {j}{existingJenjang.includes(j) ? ' (sudah ada override)' : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-muted/30 border border-border/50">
            <span className="text-sm font-medium text-foreground">Override Aktif</span>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              role="switch"
              aria-checked={isActive}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full shrink-0 transition-colors',
                isActive ? 'bg-primary' : 'bg-muted-foreground/30',
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  isActive ? 'translate-x-6' : 'translate-x-1',
                )}
              />
            </button>
          </div>

          {/* Per-severity limits */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
              Batas Toleransi per Tingkat
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {ALL_SEVERITIES.map((sev) => (
                <div key={sev} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 border border-border/50">
                  <span className={cn('text-xs font-medium capitalize flex-1', SEVERITY_COLORS[sev])}>
                    {sev.replaceAll('_', ' ')}
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={99}
                    value={limits[sev]}
                    onChange={(e) => setLimit(sev, Number(e.target.value))}
                    className="w-14 px-2 py-1 text-sm text-center border border-border/60 rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary/40"
                  />
                  <span className="text-xs text-muted-foreground">x</span>
                </div>
              ))}
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose} className="text-muted-foreground">
            Batal
          </Button>
          <Button type="submit" form="jenjang-override-form">
            {isEdit ? 'Simpan Perubahan' : 'Tambah Override'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
