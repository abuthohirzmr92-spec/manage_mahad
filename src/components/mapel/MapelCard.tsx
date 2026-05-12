import { MoreVertical, Edit2, Trash2, Users } from 'lucide-react';
import { StatusBadge } from '@/components/shared/status-badge';
import { Subject } from '@/data/mock-mapel';

interface Props {
  subject: Subject;
}

export function MapelCard({ subject }: Props) {
  return (
    <div className="group relative bg-card border border-border rounded-xl p-4 hover:border-primary/30 hover:shadow-md transition-all duration-300 flex flex-col justify-between gap-4">
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none"></div>

      <div className="relative z-10 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase bg-muted px-2 py-0.5 rounded-sm">
              {subject.code}
            </span>
            <StatusBadge status={subject.status} variant="success" />
          </div>
          <h4 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
            {subject.name}
          </h4>
        </div>

        <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      <div className="relative z-10 flex items-center justify-between mt-2 pt-3 border-t border-border/50">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Users className="w-3.5 h-3.5" />
          <span>{subject.teacherCount} Guru Pengampu</span>
        </div>
        
        <div className="flex items-center gap-1">
          <button className="p-1.5 hover:bg-primary/10 hover:text-primary rounded text-muted-foreground transition-colors">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded text-muted-foreground transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
