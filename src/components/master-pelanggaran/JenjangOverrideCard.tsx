import { Edit2, Trash2, Shield } from 'lucide-react';
import type { JenjangToleranceOverride, SeverityLimits } from '@/types';
import { ALL_SEVERITIES } from '@/types';
import { SEVERITY_COLORS } from '@/components/pelanggaran/constants';
import { cn } from '@/lib/utils';

interface Props {
  override: JenjangToleranceOverride;
  onEdit: (data: JenjangToleranceOverride) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, isActive: boolean) => void;
}

export function JenjangOverrideCard({ override: ov, onEdit, onDelete, onToggle }: Props) {
  const hasLimits = Object.values(ov.limits).some((v) => v > 0);

  return (
    <div
      className={cn(
        'border rounded-xl p-4 transition-colors duration-200',
        ov.isActive
          ? 'border-primary/30 bg-primary/[0.02]'
          : 'border-border bg-card opacity-60',
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className={cn('w-4 h-4', ov.isActive ? 'text-primary' : 'text-muted-foreground')} />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-foreground">{ov.jenjang}</h4>
            <p className="text-[10px] text-muted-foreground">
              {ov.isActive ? 'Override aktif — prioritaskan di atas global' : 'Override nonaktif'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onToggle(ov.id, !ov.isActive)}
            role="switch"
            aria-checked={ov.isActive}
            className={cn(
              'relative inline-flex h-5 w-9 items-center rounded-full shrink-0 transition-colors',
              ov.isActive ? 'bg-primary' : 'bg-muted-foreground/30',
            )}
          >
            <span
              className={cn(
                'inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform',
                ov.isActive ? 'translate-x-4' : 'translate-x-0.5',
              )}
            />
          </button>

          <button
            type="button"
            onClick={() => onEdit(ov)}
            className="p-1.5 rounded-md text-muted-foreground/70 hover:bg-primary/10 hover:text-primary transition-colors"
            aria-label={`Edit override ${ov.jenjang}`}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(ov.id)}
            className="p-1.5 rounded-md text-muted-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-colors"
            aria-label={`Hapus override ${ov.jenjang}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Limits display */}
      <div className={cn('grid grid-cols-4 gap-2', !ov.isActive && 'opacity-50')}>
        {ALL_SEVERITIES.map((sev) => {
          const limit = ov.limits[sev];
          return (
            <div key={sev} className="text-center px-2 py-1.5 rounded-lg bg-muted/40 border border-border/60">
              <span className={cn('text-[10px] font-medium capitalize block mb-0.5', limit > 0 ? 'text-foreground' : 'text-muted-foreground/60')}>
                {sev.replaceAll('_', ' ')}
              </span>
              <span className={cn('text-sm font-bold', limit > 0 ? 'text-foreground' : 'text-muted-foreground/50')}>
                {limit}x
              </span>
            </div>
          );
        })}
      </div>

      {!hasLimits && ov.isActive && (
        <p className="text-[10px] text-muted-foreground mt-2 italic">
          Semua tingkat keparahan di-set ke 0 — setiap pelanggaran akan langsung mendapat poin.
        </p>
      )}
    </div>
  );
}
