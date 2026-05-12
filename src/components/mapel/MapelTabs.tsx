import { Library, BookOpen, BookMarked } from 'lucide-react';
import { AcademicTab } from '@/data/mock-mapel';

interface Props {
  activeTab: AcademicTab;
  onTabChange: (tab: AcademicTab) => void;
}

export function MapelTabs({ activeTab, onTabChange }: Props) {
  return (
    <div className="flex p-1 bg-muted/50 border border-border rounded-xl w-full sm:w-fit overflow-x-auto hide-scrollbar">
      <div className="flex min-w-max gap-1">
        <button
        onClick={() => onTabChange('formal')}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
          activeTab === 'formal'
            ? 'bg-background shadow-sm text-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
        }`}
      >
        <Library className="w-4 h-4" />
        Formal (Depag)
      </button>
      <button
        onClick={() => onTabChange('diniyah')}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
          activeTab === 'diniyah'
            ? 'bg-background shadow-sm text-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
        }`}
      >
        <BookOpen className="w-4 h-4" />
        Diniyah (Madin)
      </button>
      <button
        onClick={() => onTabChange('quran')}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
          activeTab === 'quran'
            ? 'bg-background shadow-sm text-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
        }`}
      >
        <BookMarked className="w-4 h-4" />
        Qur&apos;an (Madqur)
      </button>
      </div>
    </div>
  );
}
