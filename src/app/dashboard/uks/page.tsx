'use client';

import { useState, useMemo, useCallback } from 'react';
import { PageHeader, PageCard } from '@/components/shared/page-header';
import { StatsCard } from '@/components/shared/stats-card';
import { LoadingState } from '@/components/shared/loading-state';
import { ErrorState } from '@/components/shared/error-state';
import { EmptyState } from '@/components/shared/empty-state';
import { StatusBadge } from '@/components/shared/status-badge';
import { useCollection } from '@/hooks';
import { useAuthStore } from '@/store/auth-store';
import { healthVisitService } from '@/lib/firebase/services';
import { createGovernanceEvent } from '@/lib/governance-events';
import { validNextStatuses, HEALTH_STATUS_LABELS, HEALTH_SEVERITY_LABELS } from '@/lib/health-engine';
import { CatatUKSModal } from '@/components/uks/CatatUKSModal';
import { UKSTimeline } from '@/components/uks/UKSTimeline';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Stethoscope,
  Heart,
  Activity,
  Clock,
  AlertCircle,
  Plus,
  Search,
  Eye,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HealthVisit, HealthVisitStatus } from '@/types/health';

// ── Severity Badge Colors ──────────────────────────────────────────────────────

const SEVERITY_BADGE: Record<string, string> = {
  ringan:
    'bg-purple-500/10 text-purple-700 border-purple-500/20 dark:text-purple-400 dark:border-purple-500/30',
  sedang:
    'bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-400 dark:border-blue-500/30',
  darurat:
    'bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400 dark:border-red-500/30',
};

const STATUS_BADGE: Record<string, string> = {
  observasi:
    'bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-400 dark:border-blue-500/30',
  istirahat:
    'bg-purple-500/10 text-purple-700 border-purple-500/20 dark:text-purple-400 dark:border-purple-500/30',
  rawat_sementara:
    'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400 dark:border-amber-500/30',
  perlu_berobat_luar:
    'bg-orange-500/10 text-orange-700 border-orange-500/20 dark:text-orange-400 dark:border-orange-500/30',
  selesai:
    'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30',
  dirujuk:
    'bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400 dark:border-red-500/30',
};

const CATEGORY_LABEL: Record<string, string> = {
  pemeriksaan: 'Pemeriksaan',
  observasi: 'Observasi',
  tindakan: 'Tindakan',
  rujukan: 'Rujukan',
  izin_berobat: 'Izin Berobat',
};

function getTodayRange(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start.getTime() + 86400000);
  return { start: start.toISOString(), end: end.toISOString() };
}

function getMonthStart(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ── Page Component ────────────────────────────────────────────────────────────

export default function UKSPage() {
  const user = useAuthStore((s) => s.user);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<HealthVisitStatus | 'all'>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [showCatat, setShowCatat] = useState(false);
  const [detailVisit, setDetailVisit] = useState<HealthVisit | null>(null);
  const [statusLoading, setStatusLoading] = useState<string | null>(null);

  // ── Data ──────────────────────────────────────────────────────────────────
  const {
    data: healthVisits,
    loading,
    error,
  } = useCollection<HealthVisit>('healthVisits');

  // ── Filtered data ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return healthVisits.filter((v) => {
      const matchSearch =
        v.santriName.toLowerCase().includes(search.toLowerCase()) ||
        v.keluhan.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        filterStatus === 'all' || v.status === filterStatus;
      const matchSeverity =
        filterSeverity === 'all' || v.severity === filterSeverity;
      return matchSearch && matchStatus && matchSeverity;
    });
  }, [healthVisits, search, filterStatus, filterSeverity]);

  // ── Stats ────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const today = getTodayRange();
    const monthStart = getMonthStart();

    const kunjunganHariIni = healthVisits.filter(
      (v) => v.masukAt >= today.start && v.masukAt < today.end,
    ).length;

    const dalamObservasi = healthVisits.filter(
      (v) => v.status === 'observasi' || v.status === 'rawat_sementara',
    ).length;

    const perluBerobatLuar = healthVisits.filter(
      (v) => v.status === 'perlu_berobat_luar',
    ).length;

    const daruratBulanIni = healthVisits.filter(
      (v) => v.severity === 'darurat' && v.masukAt >= monthStart,
    ).length;

    return {
      kunjunganHariIni,
      dalamObservasi,
      perluBerobatLuar,
      daruratBulanIni,
    };
  }, [healthVisits]);

  // ── Status change handler ────────────────────────────────────────────────
  const handleStatusChange = useCallback(
    async (visit: HealthVisit, newStatus: HealthVisitStatus) => {
      if (statusLoading) return;
      setStatusLoading(visit.id);

      try {
        const previousStatus = visit.status;

        if (newStatus === 'selesai') {
          await healthVisitService.complete(visit.id);
        } else {
          await healthVisitService.update(visit.id, {
            status: newStatus,
          });
        }

        // Emit health:visit_updated event
        createGovernanceEvent(
          'health:visit_updated',
          visit.santriId,
          visit.santriName,
          {
            visitId: visit.id,
            newStatus,
            previousStatus,
          },
        );

        // Close detail if the visit being updated is the one open
        if (detailVisit?.id === visit.id) {
          setDetailVisit(null);
        }
      } catch {
        // Error handling is silent for now
      } finally {
        setStatusLoading(null);
      }
    },
    [statusLoading, detailVisit],
  );

  // ── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="UKS"
          description="Manajemen kunjungan dan kesehatan santri"
        />
        <LoadingState type="stats" count={4} />
        <LoadingState type="table" count={5} />
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="UKS"
          description="Manajemen kunjungan dan kesehatan santri"
        />
        <ErrorState message={error.message} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <PageHeader
        title="UKS"
        description="Manajemen kunjungan dan kesehatan santri"
        action={
          <button
            type="button"
            onClick={() => setShowCatat(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm active:scale-95"
          >
            <Plus aria-hidden="true" className="w-4 h-4" />
            Catat Kunjungan UKS
          </button>
        }
      />

      {/* ── Stats Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Kunjungan Hari Ini"
          value={stats.kunjunganHariIni}
          icon={Activity}
          iconClassName="bg-blue-500/10"
        />
        <StatsCard
          title="Dalam Observasi"
          value={stats.dalamObservasi}
          icon={Heart}
          iconClassName="bg-amber-500/10"
        />
        <StatsCard
          title="Perlu Berobat Luar"
          value={stats.perluBerobatLuar}
          icon={Clock}
          iconClassName="bg-orange-500/10"
        />
        <StatsCard
          title="Darurat Bulan Ini"
          value={stats.daruratBulanIni}
          icon={AlertCircle}
          iconClassName="bg-red-500/10"
        />
      </div>

      {/* ── Visit Table ──────────────────────────────────────────────────── */}
      {healthVisits.length === 0 ? (
        <PageCard
          title="Daftar Kunjungan UKS"
          description="Riwayat kunjungan santri ke UKS"
        >
          <EmptyState
            icon={Stethoscope}
            title="Belum Ada Kunjungan"
            description="Belum ada data kunjungan UKS yang tercatat di sistem."
            action={{
              label: 'Catat Kunjungan UKS',
              onClick: () => setShowCatat(true),
            }}
          />
        </PageCard>
      ) : (
        <PageCard
          title="Daftar Kunjungan UKS"
          description={`${filtered.length} kunjungan ditemukan`}
        >
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
              />
              <label htmlFor="search-uks" className="sr-only">
                Cari kunjungan UKS
              </label>
              <input
                id="search-uks"
                type="text"
                placeholder="Cari nama santri atau keluhan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>
            <label htmlFor="filter-status-uks" className="sr-only">
              Filter status kunjungan
            </label>
            <select
              id="filter-status-uks"
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as HealthVisitStatus | 'all')
              }
              className="text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none"
            >
              <option value="all">Semua Status</option>
              <option value="observasi">Observasi</option>
              <option value="istirahat">Istirahat</option>
              <option value="rawat_sementara">Rawat Sementara</option>
              <option value="perlu_berobat_luar">Perlu Berobat Luar</option>
              <option value="selesai">Selesai</option>
              <option value="dirujuk">Dirujuk</option>
            </select>
            <label htmlFor="filter-severity-uks" className="sr-only">
              Filter tingkat keparahan
            </label>
            <select
              id="filter-severity-uks"
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none"
            >
              <option value="all">Semua Tingkat</option>
              <option value="ringan">Ringan</option>
              <option value="sedang">Sedang</option>
              <option value="darurat">Darurat</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-muted-foreground">
                  <th className="text-left px-4 py-3 font-medium">Santri</th>
                  <th className="text-left px-4 py-3 font-medium">Keluhan</th>
                  <th className="text-left px-4 py-3 font-medium">
                    Kategori
                  </th>
                  <th className="text-left px-4 py-3 font-medium">
                    Severity
                  </th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">
                    Petugas
                  </th>
                  <th className="text-left px-4 py-3 font-medium">Masuk</th>
                  <th className="text-left px-4 py-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((v) => (
                  <tr
                    key={v.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    {/* Santri */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          aria-hidden="true"
                          className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0"
                        >
                          {v.santriName
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')}
                        </div>
                        <span className="font-medium">{v.santriName}</span>
                      </div>
                    </td>

                    {/* Keluhan */}
                    <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">
                      {v.keluhan}
                    </td>

                    {/* Kategori */}
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground">
                        {CATEGORY_LABEL[v.category] ?? v.category}
                      </span>
                    </td>

                    {/* Severity */}
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                          SEVERITY_BADGE[v.severity] ??
                            SEVERITY_BADGE.ringan,
                        )}
                      >
                        {HEALTH_SEVERITY_LABELS[v.severity]}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                          STATUS_BADGE[v.status] ?? STATUS_BADGE.observasi,
                        )}
                      >
                        {HEALTH_STATUS_LABELS[v.status]}
                      </span>
                    </td>

                    {/* Petugas */}
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {v.petugasName ?? '-'}
                    </td>

                    {/* Masuk */}
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDateTime(v.masukAt)}
                    </td>

                    {/* Aksi */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setDetailVisit(v)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          title="Lihat detail"
                        >
                          <Eye className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-10 text-center text-muted-foreground text-sm"
                    >
                      Tidak ada kunjungan ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </PageCard>
      )}

      {/* ── Catat Kunjungan Modal ─────────────────────────────────────────── */}
      {showCatat && (
        <CatatUKSModal
          open={showCatat}
          onClose={() => setShowCatat(false)}
        />
      )}

      {/* ── Detail & Timeline Modal ──────────────────────────────────────── */}
      {detailVisit && (
        <Dialog
          open={!!detailVisit}
          onOpenChange={() => setDetailVisit(null)}
        >
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold">
                Detail Kunjungan UKS
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground/80">
                Informasi lengkap dan riwayat kunjungan santri
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Santri info */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                  {detailVisit.santriName
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    {detailVisit.santriName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Petugas: {detailVisit.petugasName ?? '-'}
                  </p>
                </div>
              </div>

              {/* Detail grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 p-3 rounded-lg bg-muted/20 border border-border/40">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Keluhan
                  </p>
                  <p className="text-sm font-medium">
                    {detailVisit.keluhan}
                  </p>
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-muted/20 border border-border/40">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Kategori
                  </p>
                  <p className="text-sm font-medium">
                    {CATEGORY_LABEL[detailVisit.category] ??
                      detailVisit.category}
                  </p>
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-muted/20 border border-border/40">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Severity
                  </p>
                  <span
                    className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                      SEVERITY_BADGE[detailVisit.severity] ??
                        SEVERITY_BADGE.ringan,
                    )}
                  >
                    {HEALTH_SEVERITY_LABELS[detailVisit.severity]}
                  </span>
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-muted/20 border border-border/40">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </p>
                  <span
                    className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                      STATUS_BADGE[detailVisit.status] ??
                        STATUS_BADGE.observasi,
                    )}
                  >
                    {HEALTH_STATUS_LABELS[detailVisit.status]}
                  </span>
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-muted/20 border border-border/40">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Masuk
                  </p>
                  <p className="text-sm font-medium">
                    {formatDateTime(detailVisit.masukAt)}
                  </p>
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-muted/20 border border-border/40">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Durasi
                  </p>
                  <p className="text-sm font-medium">
                    {detailVisit.durasiMenit != null
                      ? `${detailVisit.durasiMenit} menit`
                      : '-'}
                  </p>
                </div>
              </div>

              {/* Tindakan */}
              {detailVisit.tindakan && (
                <div className="space-y-1 p-3 rounded-lg bg-muted/20 border border-border/40">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Tindakan
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {detailVisit.tindakan}
                  </p>
                </div>
              )}

              {/* Catatan */}
              {detailVisit.catatan && (
                <div className="space-y-1 p-3 rounded-lg bg-muted/20 border border-border/40">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Catatan
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {detailVisit.catatan}
                  </p>
                </div>
              )}

              {/* Timeline */}
              <div className="space-y-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Timeline
                </p>
                <div className="p-3 rounded-lg bg-muted/20 border border-border/40">
                  <UKSTimeline visit={detailVisit} />
                </div>
              </div>

              {/* Status Transition Buttons */}
              {validNextStatuses(detailVisit.status).length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Ubah Status
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {validNextStatuses(detailVisit.status).map(
                      (nextStatus) => (
                        <button
                          key={nextStatus}
                          type="button"
                          onClick={() =>
                            handleStatusChange(detailVisit, nextStatus)
                          }
                          disabled={statusLoading === detailVisit.id}
                          className={cn(
                            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border active:scale-95',
                            'hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed',
                            STATUS_BADGE[nextStatus] ??
                              STATUS_BADGE.observasi,
                            'bg-opacity-100',
                          )}
                        >
                          <ChevronRight className="w-3 h-3" aria-hidden="true" />
                          {HEALTH_STATUS_LABELS[nextStatus]}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDetailVisit(null)}
              >
                Tutup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
