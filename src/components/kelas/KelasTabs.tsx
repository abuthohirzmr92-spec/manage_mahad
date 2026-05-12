import { School, BookOpen, BookMarked, LucideIcon } from 'lucide-react';
import { AcademicTab } from '@/data/mock-kelas';

interface KelasTabsProps {
  activeTab: AcademicTab;
  setActiveTab: (tab: AcademicTab) => void;
}

const TABS: { id: AcademicTab; label: string; icon: LucideIcon }[] = [
  { id: 'formal', label: 'Formal (Depag)', icon: School },
  { id: 'diniyah', label: 'Diniyah (Madin)', icon: BookOpen },
  { id: 'quran', label: "Qur'an (Madqur)", icon: BookMarked },
];

export function KelasTabs({ activeTab, setActiveTab }: KelasTabsProps) {
  return (
    <div className="w-full sm:w-fit overflow-x-auto hide-scrollbar" role="tablist">
      <div className="flex min-w-max p-1 gap-1 bg-muted/50 border border-border rounded-xl">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={tab.label}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-[color,background-color,box-shadow] duration-200 ${
                isActive 
                  ? 'bg-background shadow-sm text-foreground' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
