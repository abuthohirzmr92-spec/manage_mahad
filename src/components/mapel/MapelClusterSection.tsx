import { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getTingkatLabel } from '@/lib/progression-label';

interface Props {
  tingkat: number;
  jenjang: string;
  classNames?: string;
  distribusiHref?: string;
  children: ReactNode;
}

export function MapelClusterSection({ tingkat, jenjang, classNames, distribusiHref, children }: Props) {
  const tingkatLabel = getTingkatLabel(jenjang, tingkat);
  const pill = (
    <div className={distribusiHref
      ? 'px-3 sm:px-5 py-1.5 rounded-full border border-primary/20 bg-primary/5 shadow-sm backdrop-blur-sm shrink-0 max-w-[80%] text-center group cursor-pointer hover:bg-primary/10 hover:border-primary/30 transition-all duration-200'
      : 'px-3 sm:px-5 py-1.5 rounded-full border border-border bg-muted/30 shadow-sm backdrop-blur-sm shrink-0 max-w-[80%] text-center'
    }>
      <h3 className="text-[10px] sm:text-xs font-bold text-muted-foreground tracking-widest flex flex-col sm:flex-row items-center sm:gap-2">
        <span className="flex items-center gap-1 sm:gap-2">
          <span className="text-foreground font-semibold">{jenjang}</span>
          <span className="text-muted-foreground/60">/</span>
          <span className="text-foreground">{tingkatLabel}</span>
        </span>
        {classNames && !distribusiHref && (
          <span className="text-[9px] sm:text-[10px] font-medium text-muted-foreground/70 normal-case tracking-normal sm:border-l sm:border-border sm:pl-2 sm:ml-1 mt-0.5 sm:mt-0 line-clamp-1 break-all">
            ({classNames})
          </span>
        )}
        {distribusiHref && (
          <span className="text-[9px] sm:text-[10px] font-medium text-primary/60 normal-case tracking-normal sm:border-l sm:border-primary/20 sm:pl-2 sm:ml-1 mt-0.5 sm:mt-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Distribusi Guru
            <ArrowRight className="w-3 h-3" aria-hidden="true" />
          </span>
        )}
      </h3>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-border"></div>
        {distribusiHref ? (
          <Link href={distribusiHref} className="shrink-0">
            {pill}
          </Link>
        ) : (
          pill
        )}
        <div className="flex-1 h-px bg-gradient-to-l from-transparent via-border to-border"></div>
      </div>
      {children}
    </div>
  );
}
