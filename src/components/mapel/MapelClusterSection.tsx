import { ReactNode } from 'react';
import { AcademicTab } from '@/data/mock-mapel';

interface Props {
  level: string | number;
  classNames?: string;
  activeTab: AcademicTab;
  children: ReactNode;
}

export function MapelClusterSection({ level, classNames, activeTab, children }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-border"></div>
        <div className="px-3 sm:px-5 py-1.5 rounded-full border border-border bg-muted/30 shadow-sm backdrop-blur-sm shrink-0 max-w-[80%] text-center">
          <h3 className="text-[10px] sm:text-xs font-bold text-muted-foreground tracking-widest flex flex-col sm:flex-row items-center sm:gap-2">
            <span className="flex items-center gap-1 sm:gap-2">
              {activeTab === 'formal' ? 'TINGKAT' : ''}
              <span className="text-foreground uppercase">{level}</span>
            </span>
            {classNames && (
              <span className="text-[9px] sm:text-[10px] font-medium text-muted-foreground/70 normal-case tracking-normal sm:border-l sm:border-border sm:pl-2 sm:ml-1 mt-0.5 sm:mt-0 line-clamp-1 break-all">
                ({classNames})
              </span>
            )}
          </h3>
        </div>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent via-border to-border"></div>
      </div>
      {children}
    </div>
  );
}
