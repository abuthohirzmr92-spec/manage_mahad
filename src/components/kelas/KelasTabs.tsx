import { School, BookOpen, Landmark } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Instansi } from '@/types';
import { INSTANSI_ORDER, INSTANSI_LABEL } from '@/types';
import { cn } from '@/lib/utils';

const INSTANSI_ICONS: Record<Instansi, LucideIcon> = {
  madin: BookOpen,
  madqur: Landmark,
  depag: School,
};

interface KelasTabsProps {
  activeInstansi: Instansi;
  setActiveInstansi: (instansi: Instansi) => void;
}

export function KelasTabs({ activeInstansi, setActiveInstansi }: KelasTabsProps) {
  return (
    <div className="w-full sm:w-fit overflow-x-auto hide-scrollbar" role="tablist">
      <div className="flex min-w-max p-1 gap-1 bg-muted/50 border border-border rounded-xl">
        {INSTANSI_ORDER.map((instansi) => {
          const Icon = INSTANSI_ICONS[instansi];
          const isActive = activeInstansi === instansi;

          return (
            <button
              key={instansi}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={INSTANSI_LABEL[instansi]}
              onClick={() => setActiveInstansi(instansi)}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-[color,background-color,box-shadow] duration-200',
                isActive
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
              )}
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
