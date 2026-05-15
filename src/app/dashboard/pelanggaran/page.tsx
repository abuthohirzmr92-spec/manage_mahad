'use client';

import { useState, useMemo, useCallback } from 'react';
import { PageHeader, PageCard } from '@/components/shared/page-header';
import { StatsCard } from '@/components/shared/stats-card';
import { LoadingState } from '@/components/shared/loading-state';
import { ErrorState } from '@/components/shared/error-state';
import { EmptyState } from '@/components/shared/empty-state';
import { useCollection } from '@/hooks';
import { useAuthStore } from '@/store/auth-store';
import { pelanggaranService } from '@/lib/firebase/services';
import { AlertTriangle, Clock, CheckCircle, XCircle, Plus, AlertCircle } from 'lucide-react';
import { PelanggaranTable } from '@/components/pelanggaran/PelanggaranTable';
import { CatatPelanggaranModal } from '@/components/pelanggaran/CatatPelanggaranModal';
import type { StatusFilter, SeverityFilter } from '@/components/pelanggaran/PelanggaranTable';
import type { PelanggaranSeverity, Pelanggaran, Santri, MasterPelanggaran, MasterHukuman } from '@/types';
import type { Kelas } from '@/data/mock-kelas/types';

export default function PelanggaranPage() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('all');
  const [filterSeverity, setFilterSeverity] = useState<SeverityFilter>('all');
  const [showCatat, setShowCatat] = useState(false);

  const { data: pelanggaranData, loading, error } = useCollection<Pelanggaran>('pelanggaran');
  const { data: santriList } = useCollection<Santri>('santri');
  const { data: masterPelanggaranList } = useCollection<MasterPelanggaran>('masterPelanggaran');
  const { data: masterHukumanList = [] } = useCollection<MasterHukuman>('masterHukuman');
  const { data: kelasList = [] } = useCollection<Kelas>('kelas');
  const user = useAuthStore((s) => s.user);

  // Build santriTingkatMap: santriId → tingkat (derived from kelas name matching)
  const santriTingkatMap = useMemo(() => {
    const kelasTingkatMap = new Map<string, number>();
    for (const k of kelasList) {
      kelasTingkatMap.set(k.name, k.tingkat);
    }
    const map: Record<string, number> = {};
    for (const s of santriList) {
      // Try exact match first
      const tingkat = kelasTingkatMap.get(s.kelas);
      if (tingkat !== undefined) {
        map[s.id] = tingkat;
      } else {
        // Fallback: parse first number from kelas string (e.g. "10A" → 10)
        const parsed = parseInt(s.kelas, 10);
        map[s.id] = isNaN(parsed) ? 0 : parsed;
      }
    }
    return map;
  }, [santriList, kelasList]);

  // Filtering logic — client-side
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

  // Stats derivations
  const stats = useMemo(() => {
    const pending = pelanggaranData.filter((p) => p.status === 'pending').length;
    const confirmed = pelanggaranData.filter((p) => p.status === 'confirmed').length;
    const rejected = pelanggaranData.filter((p) => p.status === 'rejected').length;
    const HEAVY_SEVERITIES: PelanggaranSeverity[] = ['berat', 'sangat_berat'];
    const berat = pelanggaranData.filter((p) => HEAVY_SEVERITIES.includes(p.severity)).length;
    return { pending, confirmed, rejected, berat };
  }, [pelanggaranData]);

  const handleCatat = useCallback(async (records: Array<{
    santriId: string;
    santriName: string;
    pelanggaranId: string;
    pelanggaranName: string;
    severity: MasterPelanggaran['severity'];
    points: number;
    date: string;
    reportedBy: string;
    reportedByUserId: string;
    reportedByRole: string;
    punishmentId?: string;
    punishmentName?: string;
    notes?: string;
  }>) => {
    // Create one violation record per santri
    for (const r of records) {
      await pelanggaranService.create({
        santriId: r.santriId,
        santriName: r.santriName,
        pelanggaranId: r.pelanggaranId,
        pelanggaranName: r.pelanggaranName,
        severity: r.severity,
        points: r.points,
        date: r.date,
        reportedBy: r.reportedBy,
        reportedByUserId: r.reportedByUserId,
        reportedByRole: r.reportedByRole,
        status: 'pending',
        statusHukuman: 'belum',
        punishmentId: r.punishmentId,
        punishmentName: r.punishmentName,
        notes: r.notes,
      });
    }
    setShowCatat(false);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Pelanggaran"
          description="Catat dan kelola pelanggaran santri pesantren"
        />
        <LoadingState type="stats" count={4} />
        <LoadingState type="table" count={5} />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Pelanggaran"
          description="Catat dan kelola pelanggaran santri pesantren"
        />
        <ErrorState message={error.message} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pelanggaran"
        description="Catat dan kelola pelanggaran santri pesantren"
        action={
          <button
            type="button"
            onClick={() => setShowCatat(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm active:scale-95"
          >
            <Plus aria-hidden="true" className="w-4 h-4" />
            Catat Pelanggaran
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Menunggu Konfirmasi" value={stats.pending} icon={Clock} iconClassName="bg-amber-500/10" />
        <StatsCard title="Dikonfirmasi" value={stats.confirmed} icon={CheckCircle} iconClassName="bg-emerald-500/10" />
        <StatsCard title="Ditolak" value={stats.rejected} icon={XCircle} iconClassName="bg-slate-500/10" />
        <StatsCard title="Berat & Sangat Berat" value={stats.berat} icon={AlertTriangle} iconClassName="bg-red-500/10" />
      </div>

      {pelanggaranData.length === 0 ? (
        <PageCard title="Daftar Pelanggaran" description="Belum ada pelanggaran tercatat">
          <EmptyState
            icon={AlertCircle}
            title="Belum Ada Pelanggaran"
            description="Belum ada data pelanggaran yang tercatat di sistem."
          />
        </PageCard>
      ) : (
        <PageCard
          title="Daftar Pelanggaran"
          description={`${filtered.length} pelanggaran ditemukan`}
        >
          <PelanggaranTable
            data={filtered}
            search={search}
            filterStatus={filterStatus}
            filterSeverity={filterSeverity}
            onSearchChange={setSearch}
            onStatusChange={setFilterStatus}
            onSeverityChange={setFilterSeverity}
          />
        </PageCard>
      )}

      {showCatat && (
        <CatatPelanggaranModal
          open={showCatat}
          santriList={santriList}
          masterPelanggaranList={masterPelanggaranList}
          masterHukumanList={masterHukumanList}
          santriTingkatMap={santriTingkatMap}
          reporterName={user?.name ?? 'Unknown'}
          reporterUserId={user?.id ?? ''}
          reporterRole={user?.role ?? ''}
          onClose={() => setShowCatat(false)}
          onSave={handleCatat}
        />
      )}
    </div>
  );
}
