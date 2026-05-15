'use client';

import { PageHeader, PageCard } from '@/components/shared/page-header';
import { LoadingState } from '@/components/shared/loading-state';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { useCollection } from '@/hooks';
import { StatsCard } from '@/components/shared/stats-card';
import { Gavel, CheckCircle, XCircle, Clock, Scale } from 'lucide-react';
import type { Hukuman } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  aktif: 'bg-blue-100 text-blue-700',
  selesai: 'bg-emerald-100 text-emerald-700',
  dibatalkan: 'bg-slate-100 text-slate-600',
};

export default function HukumanPage() {
  const { data: hukumanList, loading, error } = useCollection<Hukuman>('hukuman', [], { realtime: true });

  const aktif = hukumanList.filter((h) => h.status === 'aktif').length;
  const selesai = hukumanList.filter((h) => h.status === 'selesai').length;
  const dibatalkan = hukumanList.filter((h) => h.status === 'dibatalkan').length;

  if (loading) return <LoadingState type="table" count={4} />;
  if (error) return <ErrorState message="Gagal memuat data hukuman." onRetry={() => window.location.reload()} />;

  return (
    <div className="space-y-6">
      <PageHeader title="Hukuman" description="Pantau dan kelola hukuman santri yang sedang berjalan" />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard title="Hukuman Aktif" value={aktif} icon={Clock} iconClassName="bg-blue-500/10" />
        <StatsCard title="Selesai" value={selesai} icon={CheckCircle} iconClassName="bg-emerald-500/10" />
        <StatsCard title="Dibatalkan" value={dibatalkan} icon={XCircle} iconClassName="bg-slate-500/10" />
      </div>

      {hukumanList.length === 0 ? (
        <EmptyState icon={Scale} title="Belum ada hukuman" description="Belum ada data hukuman yang tercatat." />
      ) : (
        <PageCard title="Daftar Hukuman">
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-muted-foreground">
                  <th className="text-left px-4 py-3 font-medium">Santri</th>
                  <th className="text-left px-4 py-3 font-medium">Jenis Hukuman</th>
                  <th className="text-left px-4 py-3 font-medium">Deskripsi</th>
                  <th className="text-left px-4 py-3 font-medium">Mulai</th>
                  <th className="text-left px-4 py-3 font-medium">Selesai</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {hukumanList.map((h) => (
                  <tr key={h.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {h.santriName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                        </div>
                        <span className="font-medium">{h.santriName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      <div className="flex items-center gap-2">
                        <Gavel className="w-3.5 h-3.5 text-muted-foreground" />
                        {h.type}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{h.description}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{h.startDate}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{h.endDate}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[h.status]}`}>
                        {h.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PageCard>
      )}
    </div>
  );
}
