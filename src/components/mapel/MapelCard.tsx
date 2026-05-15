import { MoreVertical, Edit2, Trash2, Users } from 'lucide-react';
import { StatusBadge } from '@/components/shared/status-badge';
import { Subject } from '@/data/mock-mapel';
import { getTingkatLabel } from '@/lib/progression-label';
import { cn } from '@/lib/utils';

interface MapelCardProps {
  subject: Subject;
  teacherSummary?: string;
  onAssign?: (subject: Subject) => void;
  onEdit?: (subject: Subject) => void;
  onDelete?: (subject: Subject) => void;
}

const actionBtn = cn(
  'p-1.5 rounded-md text-muted-foreground/70',
  'transition-[color,background-color] duration-200',
  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40',
);

export function MapelCard({ subject, teacherSummary, onAssign, onEdit, onDelete }: MapelCardProps) {
  return (
    <div className={cn(
      'group relative flex flex-col justify-between gap-4',
      'bg-card border border-border/80 rounded-xl p-4',
      'hover:border-primary/25 hover:shadow-md',
      'transition-[border-color,box-shadow,background-color] duration-300',
    )}>
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-xl bg-primary/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
      />

      <div className="relative z-10 flex justify-between items-start gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {subject.code && (
              <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase bg-muted px-2 py-0.5 rounded-sm">
                {subject.code}
              </span>
            )}
            <span className="text-[10px] font-medium text-muted-foreground/80 bg-muted/60 px-2 py-0.5 rounded-sm">
              {subject.jenjang} / {getTingkatLabel(subject.jenjang, subject.tingkat)}
            </span>
            <StatusBadge status={subject.status} variant="success" />
          </div>
          <h4 className={cn(
            'text-base font-semibold leading-snug text-foreground',
            'group-hover:text-primary transition-colors duration-200',
            'line-clamp-2',
          )}>
            {subject.name}
          </h4>
        </div>

        <button
          type="button"
          aria-label={`Opsi lainnya untuk ${subject.name}`}
          className={cn(
            actionBtn,
            'shrink-0 hover:text-foreground hover:bg-muted/80',
            'opacity-100 md:opacity-30 md:group-hover:opacity-100',
            'transition-[color,background-color,opacity] duration-200',
          )}
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      <div className="relative z-10 flex items-center justify-between pt-3 border-t border-border/40">
        <button
          type="button"
          onClick={() => onAssign?.(subject)}
          disabled={!onAssign}
          className={cn(
            'flex items-center gap-1.5 text-xs font-medium text-muted-foreground',
            onAssign && 'hover:text-primary transition-colors',
          )}
          title={onAssign ? 'Atur distribusi guru' : undefined}
        >
          <Users className="w-3.5 h-3.5 shrink-0" />
          <span>{teacherSummary ?? 'Belum ada guru'}</span>
        </button>

        <div className={cn(
          'flex items-center gap-0.5 shrink-0',
          'opacity-100 md:opacity-40 md:group-hover:opacity-100',
          'transition-opacity duration-200',
        )}>
          <button
            type="button"
            aria-label={`Edit mata pelajaran ${subject.name}`}
            title="Edit mata pelajaran"
            onClick={() => onEdit?.(subject)}
            disabled={!onEdit}
            className={cn(actionBtn, 'hover:bg-primary/10 hover:text-primary')}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            aria-label={`Hapus mata pelajaran ${subject.name}`}
            title="Hapus mata pelajaran"
            onClick={() => onDelete?.(subject)}
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
