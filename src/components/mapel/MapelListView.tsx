import { GripVertical, Users, Edit2, Trash2 } from 'lucide-react';
import { StatusBadge } from '@/components/shared/status-badge';
import { Subject } from '@/data/mock-mapel';

interface Props {
  subjects: Subject[];
  draggedSubject: string | null;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetId: string) => void;
}

export function MapelListView({ subjects, draggedSubject, onDragStart, onDragOver, onDrop }: Props) {
  return (
    <div className="space-y-2">
      {subjects.map((subject) => (
        <div 
          key={subject.id}
          draggable
          onDragStart={(e) => onDragStart(e, subject.id)}
          onDragOver={onDragOver}
          onDrop={(e) => onDrop(e, subject.id)}
          className={`group flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-card border rounded-lg hover:border-primary/30 transition-all ${
            draggedSubject === subject.id ? 'opacity-50 border-primary border-dashed bg-primary/5' : 'border-border'
          }`}
        >
          {/* Left side */}
          <div className="flex items-center gap-3">
            <div 
              className="cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing p-1 -ml-1 rounded hover:bg-muted shrink-0"
              title="Drag untuk mengubah urutan"
            >
              <GripVertical className="w-5 h-5" />
            </div>
            <StatusBadge status={subject.status} variant="success" />
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
              <h4 className="font-bold text-sm text-foreground line-clamp-1">{subject.name}</h4>
              <span className="text-[10px] sm:text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded w-fit">{subject.code}</span>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-3 sm:mt-0 pl-10 sm:pl-0 border-t sm:border-0 pt-3 sm:pt-0 border-border/50">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Users className="w-3.5 h-3.5" />
              <span>{subject.teacherCount} Guru</span>
            </div>
            <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
              <button className="p-1.5 hover:bg-primary/10 hover:text-primary rounded text-muted-foreground transition-colors">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded text-muted-foreground transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
