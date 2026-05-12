'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard', santri: 'Data Santri', asrama: 'Asrama',
  'master-pelanggaran': 'Master Pelanggaran', pelanggaran: 'Pelanggaran',
  hukuman: 'Hukuman', quest: 'Quest & Pemutihan', monitoring: 'Monitoring',
  notifikasi: 'Notifikasi', pengaturan: 'Pengaturan',
};

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname?.split('/').filter(Boolean) || [];
  const items = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    return { label, href: index === segments.length - 1 ? undefined : href };
  });
  if (items.length <= 1) return null;
  return (
    <nav className="flex items-center text-sm text-muted-foreground mb-4" aria-label="Breadcrumb">
      <Link href="/dashboard" className="hover:text-foreground transition-colors"><Home className="w-3.5 h-3.5" /></Link>
      {items.slice(1).map((item, index) => (
        <div key={index} className="flex items-center">
          <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-muted-foreground/50" />
          {item.href ? (
            <Link href={item.href} className="hover:text-foreground transition-colors">{item.label}</Link>
          ) : (
            <span className={cn('text-foreground font-medium')}>{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
