'use client';

import { useState, useMemo } from 'react';
import { PageHeader, PageCard } from '@/components/shared/page-header';
import { StatsCard } from '@/components/shared/stats-card';
import { LoadingState } from '@/components/shared/loading-state';
import { ErrorState } from '@/components/shared/error-state';
import { EmptyState } from '@/components/shared/empty-state';
import { useCollection } from '@/hooks';
import { useAuthStore } from '@/store/auth-store';
import { AlertTriangle, Gavel } from 'lucide-react';
import { PelanggaranTable } from '@/components/pelanggaran/PelanggaranTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SEVERITY_COLORS, STATUS_COLORS, STATUS_LABEL, HUKUMAN_COLORS } from '@/components/pelanggaran/constants';
import type { StatusFilter, SeverityFilter } from '@/components/pelanggaran/PelanggaranTable';
import type { PelanggaranSeverity, Pelanggaran } from '@/types';

export default function PelanggaranPage() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('all');
  const [filterSeverity, setFilterSeverity] = useState<SeverityFilter>('all');
  const [detailItem, setDetailItem] = useState<Pelanggaran | null>(null);

  const { data: pelanggaranData, loading, error } = useCollection<Pelanggaran>('pelanggaran');
  const user = useAuthStore((s) => s.user);

  const filtered = useMemo(() => {
    return pelanggaranData.filter((p) => {
      const matchSearch =
        p.santriName.toLowerCase().includes(search.toLowerCase()) ||
        p.pelanggaranName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === 'all' || p.status === filterStatus;
      const matchSeverity = filterSeverity === 'all' || p.severity === filterSeverity;
      return matchSearch && matchStatus && matchSeverity;
    });
  }, [pelanggaranData, search, filterStatus, filterSeverity]);

  const stats = useMemo(() => {
    const confirmed = pelanggaranData.filter((p) => p.status === 'confirmed').length;
    const HEAVY_SEVERITIES: PelanggaranSeverity[] = ['berat', 'sangat_berat'];
    const berat = pelanggaranData.filter((p) => HEAVY_SEVERITIES.includes(p.severity)).length;
    const withPunishment = pelanggaranData.filter((p) => p.statusHukuman === 'aktif').length;
    const completedPunishment = pelanggaranData.filter((p) => p.statusHukuman === 'selesai').length;
    return { confirmed, berat, withPunishment, completedPunishment };
  }, [pelanggaranData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Pelanggaran" description="Rekap pelanggaran resmi santri — hasil review governance" />
        <LoadingState type="stats" count={4} />
        <LoadingState type="table" count={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Pelanggaran" description="Rekap pelanggaran resmi santri — hasil review governance" />
        <ErrorState message={error.message} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pelanggaran"
        description="Rekap pelanggaran resmi santri — seluruh pelanggaran di sini sudah melalui review pengawas kesiswaan"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Pelanggaran" value={stats.confirmed} icon={AlertTriangle} iconClassName="bg-red-500/10 text-red-600" />
        <StatsCard title="Berat & Sangat Berat" value={stats.berat} icon={AlertTriangle} iconClassName="bg-rose-500/10 text-rose-600" />
        <StatsCard title="Hukuman Aktif" value={stats.withPunishment} icon={Gavel} iconClassName="bg-blue-500/10 text-blue-600" />
        <StatsCard title="Hukuman Selesai" value={stats.completedPunishment} icon={Gavel} iconClassName="bg-emerald-500/10 text-emerald-600" />
      </div>

      {pelanggaranData.length === 0 ? (
        <PageCard title="Daftar Pelanggaran" description="Belum ada pelanggaran tercatat">
          <EmptyState
            icon={AlertTriangle}
            title="Belum Ada Pelanggaran"
            description="Pelanggaran resmi akan muncul di sini setelah pengawas kesiswaan mereview kasus di Governance Review."
          />
        </PageCard>
      ) : (
        <PageCard title="Daftar Pelanggaran" description={`${filtered.length} pelanggaran ditemukan`}>
          <PelanggaranTable
            data={filtered}
            search={search}
            filterStatus={filterStatus}
            filterSeverity={filterSeverity}
            onSearchChange={setSearch}
            onStatusChange={setFilterStatus}
            onSeverityChange={setFilterSeverity}
            onDetail={setDetailItem}
          />
        </PageCard>
      )}

      {/* Detail Pelanggaran Modal */}
      {detailItem && (
        <Dialog open={!!detailItem} onOpenChange={() => setDetailItem(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold">Detail Pelanggaran</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground/80">
                Informasi lengkap pelanggaran santri
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                  {detailItem.santriName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <p className="text-sm font-semibold">{detailItem.santriName}</p>
                  <p className="text-xs text-muted-foreground">Pelapor: {detailItem.reportedBy}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 p-3 rounded-lg bg-muted/20 border border-border/40">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Pelanggaran</p>
                  <p className="text-sm font-medium">{detailItem.pelanggaranName}</p>
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-muted/20 border border-border/40">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tanggal</p>
                  <p className="text-sm font-medium">{detailItem.date}</p>
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-muted/20 border border-border/40">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tingkat</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${SEVERITY_COLORS[detailItem.severity]}`}>
                    {detailItem.severity.replace('_', ' ')}
                  </span>
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-muted/20 border border-border/40">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Poin</p>
                  <p className="text-sm font-bold text-red-600 dark:text-red-400">-{detailItem.points}</p>
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-muted/20 border border-border/40">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Status</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[detailItem.status] || STATUS_COLORS.confirmed}`}>
                    {STATUS_LABEL[detailItem.status] || 'Dikonfirmasi'}
                  </span>
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-muted/20 border border-border/40">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Hukuman</p>
                  <div className="flex items-center gap-1">
                    {detailItem.punishmentName ? (
                      <>
                        <Gavel className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-sm font-medium">{detailItem.punishmentName}</span>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">Tidak ada</span>
                    )}
                  </div>
                </div>
              </div>
              {detailItem.notes && (
                <div className="space-y-1 p-3 rounded-lg bg-muted/20 border border-border/40">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Catatan</p>
                  <p className="text-sm text-muted-foreground">{detailItem.notes}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end pt-2">
              <Button type="button" variant="ghost" onClick={() => setDetailItem(null)} className="text-muted-foreground">
                Tutup
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
