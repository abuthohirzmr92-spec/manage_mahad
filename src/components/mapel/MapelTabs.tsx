import { Library, BookOpen, Landmark } from 'lucide-react';
import type { Instansi } from '@/types';
import { INSTANSI_ORDER, INSTANSI_LABEL } from '@/types';

const INSTANSI_ICONS: Record<Instansi, typeof Library> = {
  madin: BookOpen,
  madqur: Landmark,
  depag: Library,
};

interface Props {
  activeInstansi: Instansi;
  onTabChange: (instansi: Instansi) => void;
}

export function MapelTabs({ activeInstansi, onTabChange }: Props) {
  return (
    <div className="flex p-1 bg-muted/50 border border-border rounded-xl w-full sm:w-fit overflow-x-auto hide-scrollbar">
      <div className="flex min-w-max gap-1">
        {INSTANSI_ORDER.map((instansi) => {
          const Icon = INSTANSI_ICONS[instansi];
          const isActive = activeInstansi === instansi;
          return (
            <button
              key={instansi}
              type="button"
              onClick={() => onTabChange(instansi)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {INSTANSI_LABEL[instansi]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
