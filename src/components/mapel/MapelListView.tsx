import { GripVertical, Users, Edit2, Trash2 } from 'lucide-react';
import { StatusBadge } from '@/components/shared/status-badge';
import { Subject } from '@/data/mock-mapel';
import { cn } from '@/lib/utils';

interface Props {
  subjects: Subject[];
  teacherSummaryMap?: Record<string, string>;
  draggedSubject: string | null;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetId: string) => void;
  onAssign?: (subject: Subject) => void;
  onEdit: (subject: Subject) => void;
  onDelete: (subject: Subject) => void;
}

// ── Action button token — mirrors MapelCard / KelasCard system ────────────────
const actionBtn = cn(
  'p-1.5 rounded-md text-muted-foreground/70',
  'transition-[color,background-color] duration-200',
  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40',
);

export function MapelListView({
  subjects, teacherSummaryMap, draggedSubject,
  onDragStart, onDragOver, onDrop,
  onAssign, onEdit, onDelete,
}: Props) {
  return (
    <div className="space-y-1.5">
      {subjects.map((subject) => {
        const isDragged = draggedSubject === subject.id;

        return (
          <div
            key={subject.id}
            draggable
            onDragStart={(e) => onDragStart(e, subject.id)}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, subject.id)}
            className={cn(
              'group flex flex-col sm:flex-row sm:items-center justify-between p-3',
              'bg-card border rounded-lg',
              // Explicit transitions — no transition-all
              'transition-[border-color,background-color,opacity] duration-200',
              isDragged
                // Refined drag state: warm tint, dashed amber border, gentle fade
                ? 'opacity-50 border-primary/50 border-dashed bg-primary/[0.03]'
                : 'border-border/80 hover:border-primary/25 hover:bg-primary/[0.02]',
            )}
          >
            {/* Left: drag handle + badge + name + code */}
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={cn(
                  'cursor-grab active:cursor-grabbing shrink-0',
                  'p-1 -ml-1 rounded text-muted-foreground/50',
                  'hover:text-muted-foreground hover:bg-muted/60',
                  'transition-[color,background-color] duration-200',
                )}
                title="Drag untuk mengubah urutan"
                role="img"
                aria-label="Handle drag reorder"
              >
                <GripVertical className="w-4 h-4" />
              </div>

              <StatusBadge status={subject.status} variant="success" />

              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-w-0">
                {/* Title: semibold — consistent with MapelCard / KelasCard */}
                <h4 className="font-semibold text-sm text-foreground line-clamp-1">
                  {subject.name}
                </h4>
                <span className="text-[10px] sm:text-xs text-muted-foreground font-mono bg-muted/80 px-2 py-0.5 rounded-sm w-fit shrink-0">
                  {subject.code}
                </span>
              </div>
            </div>

            {/* Right: teacher count + action buttons */}
            <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto mt-3 sm:mt-0 pl-9 sm:pl-0 border-t sm:border-0 pt-3 sm:pt-0 border-border/40">
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
                <span>{teacherSummaryMap?.[subject.id] ?? 'Belum ada guru'}</span>
              </button>

              {/* Action buttons — soft reveal: 40% → 100% on hover; full on mobile */}
              <div className={cn(
                'flex items-center gap-0.5 shrink-0',
                'opacity-100 md:opacity-40 md:group-hover:opacity-100',
                'transition-opacity duration-200',
              )}>
                <button
                  type="button"
                  aria-label={`Edit mata pelajaran ${subject.name}`}
                  title="Edit mata pelajaran"
                  onClick={() => onEdit(subject)}
                  className={cn(actionBtn, 'hover:bg-primary/10 hover:text-primary')}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  aria-label={`Hapus mata pelajaran ${subject.name}`}
                  title="Hapus mata pelajaran"
                  onClick={() => onDelete(subject)}
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
      })}
    </div>
  );
}
