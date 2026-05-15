import { JenjangGroup, Kelas } from '@/data/mock-kelas';
import type { Instansi } from '@/types';
import { KelasCard } from './KelasCard';
import { getTingkatLabel } from '@/lib/progression-label';
import { cn } from '@/lib/utils';

interface KelasClusterSectionProps {
  jenjangGroups: JenjangGroup[];
  activeInstansi: Instansi;
  onEdit: (kelas: Kelas) => void;
  onDelete: (kelas: Kelas) => void;
}

export function KelasClusterSection({ jenjangGroups, activeInstansi, onEdit, onDelete }: KelasClusterSectionProps) {
  if (jenjangGroups.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm" role="status" aria-live="polite">
        Belum ada data kelas untuk program ini.
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {jenjangGroups.map((jenjangGroup) => (
        <div key={`${activeInstansi}-${jenjangGroup.jenjang}`} className="space-y-8 animate-in fade-in duration-300">

          {/* ── Jenjang header ── */}
          <div className="flex items-center gap-3">
            <div className={cn(
              'px-4 py-1.5 rounded-full border border-border bg-muted/30 shadow-sm',
            )}>
              <h2 className="text-xs font-bold text-muted-foreground tracking-widest">
                {jenjangGroup.jenjang}
              </h2>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
          </div>

          {/* ── Tingkat groups ── */}
          <div className="space-y-10">
            {jenjangGroup.tingkatGroups.map((tingkatGroup) => {
              const label = getTingkatLabel(jenjangGroup.jenjang, tingkatGroup.tingkat);
              return (
                <div key={tingkatGroup.tingkat} className="space-y-6">
                  {/* Tingkat divider — matching MapelClusterSection style */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-border" />
                    <div className="px-3 sm:px-5 py-1.5 rounded-full border border-border bg-muted/30 shadow-sm backdrop-blur-sm shrink-0 max-w-[80%] text-center">
                      <h3 className="text-[10px] sm:text-xs font-bold text-muted-foreground tracking-widest">
                        <span className="text-foreground font-semibold">{label}</span>
                      </h3>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-l from-transparent via-border to-border" />
                  </div>

                  {/* Card grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {tingkatGroup.classes.map((kelas) => (
                      <KelasCard
                        key={kelas.id}
                        kelas={kelas}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
