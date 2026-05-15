'use client';

import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  type?: 'table' | 'card' | 'detail' | 'stats' | 'spinner';
  count?: number;
  text?: string;
}

export function LoadingState({ type = 'spinner', count = 3, text = 'Memuat data...' }: LoadingStateProps) {
  if (type === 'table') {
    return (
      <div className="rounded-lg border bg-card">
        <div className="p-4 border-b">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        </div>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="px-4 py-3 border-b last:border-b-0 flex gap-4">
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            <div className="h-4 w-48 bg-muted rounded animate-pulse" />
            <div className="h-4 w-24 bg-muted rounded animate-pulse ml-auto" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
            <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
            <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
            <div className="h-8 w-1/3 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'stats') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-4 space-y-2">
            <div className="h-3 w-16 bg-muted rounded animate-pulse" />
            <div className="h-7 w-12 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  // Default: spinner
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
