'use client';

import { useState, useMemo } from 'react';
import { PageHeader, PageCard } from '@/components/shared/page-header';
import { LoadingState } from '@/components/shared/loading-state';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { useCollection } from '@/hooks';
import { StatsCard } from '@/components/shared/stats-card';
import { hukumanService } from '@/lib/firebase/services';
import { createGovernanceEvent } from '@/lib/governance-events';
import { Gavel, CheckCircle, XCircle, Clock, Scale, Search, Ban } from 'lucide-react';
import type { Hukuman, Santri } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  aktif: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  selesai: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  dibatalkan: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

export default function HukumanPage() {
  const { data: hukumanList, loading, error } = useCollection<Hukuman>('hukuman', [], { realtime: true });
  const { data: santriList = [] } = useCollection<Santri>('santri');
  const [santriFilter, setSantriFilter] = useState('');

  // ── Computed stats ─────────────────────────────────────────────────────
  const aktif = hukumanList.filter((h) => h.status === 'aktif').length;
  const selesai = hukumanList.filter((h) => h.status === 'selesai').length;
  const dibatalkan = hukumanList.filter((h) => h.status === 'dibatalkan').length;

  // ── Filter by santri ───────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!santriFilter.trim()) return hukumanList;
    const q = santriFilter.toLowerCase();
    return hukumanList.filter(
      (h) =>
        h.santriName.toLowerCase().includes(q) ||
        h.santriId.toLowerCase().includes(q)
    );
  }, [hukumanList, santriFilter]);

  // ── Action handlers ────────────────────────────────────────────────────
  const handleMarkComplete = async (h: Hukuman) => {
    await hukumanService.markComplete(h.id);

    // Emit hukuman:completed event
    const event = createGovernanceEvent('hukuman:completed', h.santriId, h.santriName, {
      hukumanId: h.id,
      hukumanName: h.type,
    });
    // Event emitted — consumed by notification engine
  };

  const handleCancel = async (h: Hukuman) => {
    await hukumanService.cancel(h.id);

    // Emit hukuman:cancelled event
    const event = createGovernanceEvent('hukuman:cancelled', h.santriId, h.santriName, {
      hukumanId: h.id,
      hukumanName: h.type,
    });
    // Event emitted — consumed by notification engine
  };

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

      {/* Santri filter */}
      <div className="relative max-w-xs">
        <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Cari berdasarkan nama santri..."
          value={santriFilter}
          onChange={(e) => setSantriFilter(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        />
      </div>

      {hukumanList.length === 0 ? (
        <EmptyState icon={Scale} title="Belum ada hukuman" description="Belum ada data hukuman yang tercatat." />
      ) : filtered.length === 0 ? (
        <PageCard title="Daftar Hukuman">
          <EmptyState icon={Search} title="Tidak Ditemukan" description="Tidak ada hukuman yang cocok dengan pencarian." />
        </PageCard>
      ) : (
        <PageCard title="Daftar Hukuman" description={`${filtered.length} hukuman ditemukan`}>
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
                  <th className="text-left px-4 py-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((h) => (
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
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {h.status === 'aktif' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleMarkComplete(h)}
                              className="p-1.5 rounded-md text-emerald-600 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                              title="Tandai Selesai"
                            >
                              <CheckCircle className="w-4 h-4" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCancel(h)}
                              className="p-1.5 rounded-md text-slate-500 hover:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Batalkan"
                            >
                              <Ban className="w-4 h-4" aria-hidden="true" />
                            </button>
                          </>
                        )}
                      </div>
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
