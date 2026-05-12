'use client';

import { PageCard } from '@/components/shared/page-header';

export interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface AnalyticsCardProps {
  title: string;
  description?: string;
  data: DataPoint[];
  type?: 'bar' | 'progress';
  className?: string;
}

export function AnalyticsCard({ title, description, data, type = 'bar', className = '' }: AnalyticsCardProps) {
  // Prevent div by zero, calculate max value with 10% padding
  const maxValue = Math.max(...data.map(d => d.value), 1) * 1.1; 

  return (
    <PageCard title={title} description={description} className={className}>
      <div className="h-48 flex items-end justify-around gap-2 mt-4 pt-4 border-t border-border">
        {type === 'bar' ? (
          data.map((item, i) => {
            const heightPct = (item.value / maxValue) * 100;
            return (
              <div key={i} className="flex flex-col items-center gap-2 group flex-1">
                <div className="w-full flex justify-center h-32 items-end relative">
                  <div 
                    className={`w-full max-w-[40px] rounded-t-md transition-all duration-1000 ease-out group-hover:opacity-80 relative ${item.color || 'bg-primary'}`}
                    style={{ height: `${heightPct}%` }}
                  >
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-[10px] font-bold px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap z-10">
                      {item.value}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-medium text-muted-foreground text-center truncate w-full px-1">
                  {item.label}
                </span>
              </div>
            );
          })
        ) : (
          <div className="w-full space-y-4 h-full flex flex-col justify-center">
            {data.map((item, i) => {
              const widthPct = (item.value / maxValue) * 100;
              return (
                <div key={i} className="space-y-1 group">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-muted-foreground group-hover:text-foreground transition-colors">{item.label}</span>
                    <span className="font-bold">{item.value}</span>
                  </div>
                  <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${item.color || 'bg-primary'}`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageCard>
  );
}
