import type { CSSProperties } from 'react';
import { GroupedKelas, AcademicTab } from '@/data/mock-kelas';
import { KelasCard } from './KelasCard';

interface KelasClusterSectionProps {
  groupedData: GroupedKelas[];
  activeTab: AcademicTab;
}

export function KelasClusterSection({ groupedData, activeTab }: KelasClusterSectionProps) {
  if (groupedData.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground" role="status" aria-live="polite">
        Belum ada data kelas untuk instansi ini.
      </div>
    );
  }

  const isFormalTab = activeTab === 'formal';

  return groupedData.map((group, index) => {
    const animationStyle: CSSProperties = { 
      animationDelay: `${index * 100}ms`, 
      animationFillMode: 'both'
    };

    // Requires tailwindcss-animate plugin
    return (
      <div 
        key={`${activeTab}-${group.level}`} 
        className="space-y-6 animate-in fade-in slide-in-from-bottom-4" 
        style={animationStyle}
      >
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-border"></div>
          <div className="px-5 py-1.5 rounded-full border border-border bg-muted/30 shadow-sm backdrop-blur-sm">
            <h3 
              className="text-xs font-bold text-muted-foreground tracking-widest flex items-center gap-2"
              aria-label={`${isFormalTab ? 'Tingkat' : 'Level'} ${group.level}`}
            >
              {isFormalTab ? 'TINGKAT' : ''} 
              <span className="text-foreground uppercase">{group.level}</span>
            </h3>
          </div>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-border to-border"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {group.classes.map((kelas) => (
            <KelasCard key={kelas.id} kelas={kelas} />
          ))}
        </div>
      </div>
    );
  });
}
