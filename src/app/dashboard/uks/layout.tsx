'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const tabs = [
  { label: 'Kunjungan UKS', href: '/dashboard/uks' },
  { label: 'Izin Berobat', href: '/dashboard/uks/izin-berobat' },
];

export default function UksLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-border pb-2">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors',
              pathname === tab.href
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50'
                : 'border-transparent text-stone-500 hover:text-stone-700'
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>
      {children}
    </div>
  );
}
