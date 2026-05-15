import { StatusBadge } from '@/components/shared/status-badge';
import { UserCircle, Edit2, Trash2 } from 'lucide-react';
import { Kelas } from '@/data/mock-kelas';
import { getTingkatLabel } from '@/lib/progression-label';
import { cn } from '@/lib/utils';

interface KelasCardProps {
  kelas: Kelas;
  /** Emit edit intent to parent — card does NOT open modal itself */
  onEdit?: (kelas: Kelas) => void;
  /** Emit delete intent to parent — card does NOT manage confirmation */
  onDelete?: (kelas: Kelas) => void;
}

// ── Action button token ────────────────────────────────────────────────────────
const actionBtn = cn(
  'p-1.5 rounded-md text-muted-foreground/70',
  'transition-[color,background-color] duration-200',
  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40',
);

export function KelasCard({ kelas, onEdit, onDelete }: KelasCardProps) {
  return (
    <div className={cn(
      'group relative flex flex-col justify-between gap-4',
      'bg-card border border-border/80 rounded-xl p-4',
      'hover:border-primary/25 hover:shadow-md',
      'transition-[border-color,box-shadow,background-color] duration-300',
    )}>
      {/* Warm hover tint */}
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-xl bg-primary/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
      />

      {/* Top row: identity */}
      <div className="relative z-10 flex justify-between items-start gap-2">
        <div className="min-w-0">
          {/* Jenjang chip + status badge */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase bg-muted px-2 py-0.5 rounded-sm shrink-0">
              {kelas.jenjang}
            </span>
            <StatusBadge status={kelas.status} variant="success" />
          </div>
          {/* Nama rombel */}
          <h4 className={cn(
            'text-base font-semibold leading-snug text-foreground',
            'group-hover:text-primary transition-colors duration-200',
            'line-clamp-2',
          )}>
            {kelas.name}
          </h4>
        </div>

        {/* Tingkat label — user-facing academic identity */}
        <span className={cn(
          'shrink-0 text-[10px] font-medium text-muted-foreground/80',
          'bg-muted/60 px-2 py-0.5 rounded-sm',
        )}>
          {getTingkatLabel(kelas.jenjang, kelas.tingkat)}
        </span>
      </div>

      {/* Bottom row: meta + actions */}
      <div className="relative z-10 flex items-center justify-between pt-3 border-t border-border/40">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground min-w-0" title="Wali Kelas">
          <UserCircle className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate max-w-[130px]">{kelas.waliKelas}</span>
        </div>

        {/* Action buttons — soft reveal: 40% → 100% on hover */}
        <div className={cn(
          'flex items-center gap-0.5 shrink-0',
          'opacity-100 md:opacity-40 md:group-hover:opacity-100',
          'transition-opacity duration-200',
        )}>
          <button
            type="button"
            aria-label={`Edit kelas ${kelas.name}`}
            title="Edit kelas"
            onClick={() => onEdit?.(kelas)}
            disabled={!onEdit}
            className={cn(actionBtn, 'hover:bg-primary/10 hover:text-primary')}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            aria-label={`Hapus kelas ${kelas.name}`}
            title="Hapus kelas"
            onClick={() => onDelete?.(kelas)}
            disabled={!onDelete}
            className={cn(
              actionBtn,
              'hover:bg-destructive/10 hover:text-destructive',
              'focus-visible:ring-destructive/40',
            )}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
