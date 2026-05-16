'use client';

import { useState, useMemo, useCallback } from 'react';
import { PageHeader, PageCard } from '@/components/shared/page-header';
import { StatsCard } from '@/components/shared/stats-card';
import { LoadingState } from '@/components/shared/loading-state';
import { ErrorState } from '@/components/shared/error-state';
import { EmptyState } from '@/components/shared/empty-state';
import { useCollection } from '@/hooks';
import { useAuthStore } from '@/store/auth-store';
import {
  pelanggaranService,
  santriService,
  hukumanService,
  masterHukumanService,
  tolerancePolicyService,
} from '@/lib/firebase/services';
import { AlertTriangle, Clock, CheckCircle, XCircle, Plus, AlertCircle, Gavel } from 'lucide-react';
import { PelanggaranTable } from '@/components/pelanggaran/PelanggaranTable';
import { CatatPelanggaranModal } from '@/components/pelanggaran/CatatPelanggaranModal';
import { createGovernanceEvent } from '@/lib/governance-events';
import { computeAfterViolation } from '@/lib/point-engine';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SEVERITY_COLORS, STATUS_COLORS, STATUS_LABEL, HUKUMAN_COLORS } from '@/components/pelanggaran/constants';
import type { StatusFilter, SeverityFilter } from '@/components/pelanggaran/PelanggaranTable';
import type { PelanggaranSeverity, Pelanggaran, Santri, MasterPelanggaran, MasterHukuman, TolerancePolicy, GlobalTolerancePolicy, JenjangToleranceOverride } from '@/types';
import type { FirestoreSantri } from '@/types/firestore';
import type { Kelas } from '@/types/academic';

export default function PelanggaranPage() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('all');
  const [filterSeverity, setFilterSeverity] = useState<SeverityFilter>('all');
  const [showCatat, setShowCatat] = useState(false);
  const [detailItem, setDetailItem] = useState<Pelanggaran | null>(null);

  const { data: pelanggaranData, loading, error } = useCollection<Pelanggaran>('pelanggaran');
  const { data: santriList } = useCollection<Santri>('santri');
  const { data: masterPelanggaranList } = useCollection<MasterPelanggaran>('masterPelanggaran');
  const { data: masterHukumanList = [] } = useCollection<MasterHukuman>('masterHukuman');
  const { data: kelasList = [] } = useCollection<Kelas>('kelas');
  const { data: tolerancePolicies = [] } = useCollection<TolerancePolicy>('tolerancePolicies');
  const user = useAuthStore((s) => s.user);

  // Separate tolerance policies
  const globalTolerancePolicy = useMemo<GlobalTolerancePolicy | null>(() => {
    const g = tolerancePolicies.find((p) => p.type === 'global');
    return g ? g as GlobalTolerancePolicy : null;
  }, [tolerancePolicies]);

  const toleranceOverrides = useMemo<JenjangToleranceOverride[]>(() => {
    return tolerancePolicies.filter((p) => p.type === 'jenjang') as JenjangToleranceOverride[];
  }, [tolerancePolicies]);

  // Compute violation counts per santri per severity from CURRENT pelanggaranData
  const santriViolationCounts = useMemo(() => {
    const counts: Record<string, Record<string, number>> = {};
    for (const p of pelanggaranData) {
      if (!counts[p.santriId]) {
        counts[p.santriId] = { ringan: 0, sedang: 0, berat: 0, sangat_berat: 0 };
      }
      // Only count confirmed violations for tolerance
      if (p.status === 'confirmed') {
        counts[p.santriId][p.severity]++;
      }
    }
    return counts;
  }, [pelanggaranData]);

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

  // Build santriJenjangMap: santriId → jenjang string
  const santriJenjangMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const s of santriList) {
      map[s.id] = s.kelas; // Use kelas as jenjang proxy
    }
    return map;
  }, [santriList]);

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
      const pelanggaranId = await pelanggaranService.create({
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

      // Emit pelanggaran:created event
      const event = createGovernanceEvent('pelanggaran:created', r.santriId, r.santriName, {
        pelanggaranId,
        pelanggaranName: r.pelanggaranName,
        severity: r.severity,
        points: r.points,
        reportedBy: r.reportedBy,
      });
      // Note: In production these events would be consumed by the notification engine.
      // For now they are emitted via the global event system.
    }
    setShowCatat(false);
  }, []);

  // ── Confirm handler ──────────────────────────────────────────────────────
  const handleConfirm = useCallback(async (pelanggaranId: string) => {
    // Find the pelanggaran record
    const p = pelanggaranData.find((item) => item.id === pelanggaranId);
    if (!p) return;

    // 1. Update pelanggaran status to confirmed
    await pelanggaranService.confirm(pelanggaranId);

    // 2. If punishmentId exists, create Hukuman document
    if (p.punishmentId) {
      const masterHukuman = masterHukumanList.find((h) => h.id === p.punishmentId);
      if (masterHukuman) {
        const startDate = new Date().toISOString().slice(0, 10);
        // Default endDate: 7 days from now (configurable via MasterHukuman in future)
        const endDate = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

        const hukumanId = await hukumanService.createFromMaster({
          santriId: p.santriId,
          santriName: p.santriName,
          pelanggaranId,
          masterHukumanId: masterHukuman.id,
          masterHukuman,
          startDate,
          endDate,
          executorId: user?.id,
        });

        // Update pelanggaran with hukuman info
        await pelanggaranService.update(pelanggaranId, {
          statusHukuman: 'aktif',
          punishmentId: masterHukuman.id,
          punishmentName: masterHukuman.name,
        });

        // Emit hukuman:executed event
        const hukumanEvent = createGovernanceEvent('hukuman:executed', p.santriId, p.santriName, {
          hukumanId,
          hukumanName: masterHukuman.name,
          executorId: user?.id ?? '',
          startDate,
          endDate,
        });
        // Event emitted — consumed by notification engine
      }
    }

    // 3. Update Santri points via point-engine
    const santri = await santriService.get(p.santriId);
    if (santri) {
      const pointUpdate = computeAfterViolation(santri, p.points);
      await santriService.update(p.santriId, pointUpdate as unknown as Partial<FirestoreSantri>);

      // Check if SP escalated
      if (pointUpdate.statusSP !== santri.statusSP && pointUpdate.statusSP !== 'Tidak Ada') {
        const spEvent = createGovernanceEvent('sp:escalated', p.santriId, p.santriName, {
          previousSP: santri.statusSP,
          newSP: pointUpdate.statusSP,
          totalPoints: pointUpdate.totalPoinPelanggaran,
        });
        // Event emitted — consumed by notification engine
      }
    }

    // 4. Emit pelanggaran:confirmed event
    const confirmedEvent = createGovernanceEvent('pelanggaran:confirmed', p.santriId, p.santriName, {
      pelanggaranId,
      pelanggaranName: p.pelanggaranName,
      severity: p.severity,
      points: p.points,
      reportedBy: p.reportedBy,
    });
    // Event emitted — consumed by notification engine
  }, [pelanggaranData, masterHukumanList, user]);

  // ── Reject handler ────────────────────────────────────────────────────────
  const handleReject = useCallback(async (pelanggaranId: string) => {
    const p = pelanggaranData.find((item) => item.id === pelanggaranId);
    if (!p) return;

    // 1. Update pelanggaran status to rejected
    await pelanggaranService.reject(pelanggaranId);

    // 2. Emit pelanggaran:rejected event
    const event = createGovernanceEvent('pelanggaran:rejected', p.santriId, p.santriName, {
      pelanggaranId,
      pelanggaranName: p.pelanggaranName,
      severity: p.severity,
      points: p.points,
      reportedBy: p.reportedBy,
    });
    // Event emitted — consumed by notification engine
  }, [pelanggaranData]);

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
            onConfirm={handleConfirm}
            onReject={handleReject}
            onDetail={setDetailItem}
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
          santriViolationCounts={santriViolationCounts}
          santriJenjangMap={santriJenjangMap}
          globalTolerancePolicy={globalTolerancePolicy}
          toleranceOverrides={toleranceOverrides}
          onClose={() => setShowCatat(false)}
          onSave={handleCatat}
        />
      )}

      {/* ── Detail Pelanggaran Modal ─────────────────────────────────────── */}
      {detailItem && (
        <Dialog open={!!detailItem} onOpenChange={() => setDetailItem(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold">
                Detail Pelanggaran
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground/80">
                Informasi lengkap pelanggaran santri
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              {/* Santri */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                  {detailItem.santriName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <p className="text-sm font-semibold">{detailItem.santriName}</p>
                  <p className="text-xs text-muted-foreground">Pelapor: {detailItem.reportedBy}</p>
                </div>
              </div>

              {/* Detail grid */}
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
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[detailItem.status]}`}>
                    {STATUS_LABEL[detailItem.status]}
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

              {/* Notes */}
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
