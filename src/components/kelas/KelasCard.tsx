import { StatusBadge } from '@/components/shared/status-badge';
import { MoreVertical, Users, UserCircle, Edit2, Trash2 } from 'lucide-react';
import { Kelas } from '@/data/mock-kelas';
import { cn } from '@/lib/utils';

interface KelasCardProps {
  kelas: Kelas;
}

const baseActionBtn = "p-1.5 rounded-md text-muted-foreground transition-[color,background-color,opacity] duration-200";

export function KelasCard({ kelas }: KelasCardProps) {
  return (
    <div className="group relative bg-card border border-border rounded-xl p-4 hover:border-primary/30 hover:shadow-md transition-[border-color,box-shadow] duration-300 flex flex-col justify-between gap-4">
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none"></div>

      <div className="relative z-10 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge status={kelas.status} variant="success" />
          </div>
          <h4 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-200">
            {kelas.name}
          </h4>
        </div>

        <button type="button" aria-label="Menu kelas" className={cn(baseActionBtn, "hover:text-foreground hover:bg-muted opacity-100 md:opacity-0 md:group-hover:opacity-100")}>
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      <div className="relative z-10 flex items-center justify-between mt-2 pt-3 border-t border-border/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground" title="Jumlah Santri">
            <Users className="w-3.5 h-3.5" />
            <span>{kelas.studentCount}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground" title="Wali Kelas">
            <UserCircle className="w-3.5 h-3.5" />
            <span>{kelas.waliKelas}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button type="button" aria-label="Edit kelas" className={cn(baseActionBtn, "hover:bg-primary/10 hover:text-primary")} title="Edit">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button type="button" aria-label="Hapus kelas" className={cn(baseActionBtn, "hover:bg-destructive/10 hover:text-destructive")} title="Hapus">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
