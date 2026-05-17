'use client';

import { useState, useMemo, useCallback } from 'react';
import { PageHeader, PageCard } from '@/components/shared/page-header';
import { StatsCard } from '@/components/shared/stats-card';
import { StatusBadge } from '@/components/shared/status-badge';
import { LoadingState } from '@/components/shared/loading-state';
import { ErrorState } from '@/components/shared/error-state';
import { EmptyState } from '@/components/shared/empty-state';
import { useCollection, useIsRole } from '@/hooks';
import { useAuthStore } from '@/store/auth-store';
import { healthPermissionService } from '@/lib/firebase/services';
import { createGovernanceEvent } from '@/lib/governance-events';
import {
  PERMISSION_STATUS_LABELS,
  HEALTH_SEVERITY_LABELS,
} from '@/lib/health-engine';
import { IzinBerobatModal } from '@/components/uks/IzinBerobatModal';
import type { HealthPermission } from '@/types/health';
import {
  FileText,
  Shield,
  MapPin,
  UserCheck,
  Check,
  X,
  ArrowRight,
  ArrowLeft,
  Plus,
  Search,
  AlertCircle,
  Clock,
} from 'lucide-react';

// ── Severity color mapping ──────────────────────────────────────────────────
const SEVERITY_BADGE: Record<string, string> = {
  ringan:
    'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30',
  sedang:
    'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400 dark:border-amber-500/30',
  darurat:
    'bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400 dark:border-red-500/30',
};

// ── Status variant mapping for StatusBadge ──────────────────────────────────
const STATUS_VARIANT: Record<string, 'warning' | 'success' | 'error' | 'info' | 'neutral' | 'purple'> = {
  diajukan: 'warning',
  disetujui: 'success',
  ditolak: 'error',
  dalam_perjalanan: 'info',
  kembali: 'purple',
  selesai: 'neutral',
};

// ── Date formatting helper ──────────────────────────────────────────────────
function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export default function IzinBerobatPage() {
  const user = useAuthStore((s) => s.user);

  // ── State ──────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [detailItem, setDetailItem] = useState<HealthPermission | null>(null);

  // ── Data ───────────────────────────────────────────────────────────────────
  const {
    data: permissions,
    loading,
    error,
  } = useCollection<HealthPermission>('healthPermissions');

  // ── RBAC ───────────────────────────────────────────────────────────────────
  const canCreate = useIsRole(['admin', 'staff']);
  const canApprove = useIsRole(['admin', 'kepala_kesiswaan']);

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return permissions.filter((p) => {
      const matchSearch =
        p.santriName.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        filterStatus === 'all' || p.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [permissions, search, filterStatus]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const menunggu = permissions.filter((p) => p.status === 'diajukan').length;
    const dalamPerjalanan = permissions.filter(
      (p) => p.status === 'dalam_perjalanan',
    ).length;
    const selesai = permissions.filter((p) => p.status === 'selesai').length;
    const total = permissions.length;
    return { menunggu, dalamPerjalanan, selesai, total };
  }, [permissions]);

  // ── Action Handlers ────────────────────────────────────────────────────────

  /** Approve a permission request */
  const handleApprove = useCallback(
    async (perm: HealthPermission) => {
      try {
        await healthPermissionService.approve(
          perm.id,
          user?.id ?? '',
          user?.name ?? '',
        );

        const event = createGovernanceEvent(
          'health:permission_approved',
          perm.santriId,
          perm.santriName,
          {
            permissionId: perm.id,
            healthVisitId: perm.healthVisitId,
            supervisorName: perm.supervisorName,
          },
        );
        console.info('[IzinBerobat] Approved:', event);
      } catch (err) {
        console.error('Failed to approve permission:', err);
      }
    },
    [user],
  );

  /** Reject a permission request */
  const handleReject = useCallback(
    async (perm: HealthPermission) => {
      try {
        await healthPermissionService.reject(perm.id, user?.id ?? '');

        const event = createGovernanceEvent(
          'health:permission_rejected',
          perm.santriId,
          perm.santriName,
          {
            permissionId: perm.id,
            healthVisitId: perm.healthVisitId,
          },
        );
        console.info('[IzinBerobat] Rejected:', event);
      } catch (err) {
        console.error('Failed to reject permission:', err);
      }
    },
    [user],
  );

  /** Mark as departed (berangkat) */
  const handleDepart = useCallback(
    async (perm: HealthPermission) => {
      try {
        await healthPermissionService.depart(perm.id);

        const event = createGovernanceEvent(
          'health:permission_departed',
          perm.santriId,
          perm.santriName,
          {
            permissionId: perm.id,
            keluarAt: new Date().toISOString(),
            supervisorName: perm.supervisorName,
          },
        );
        console.info('[IzinBerobat] Departed:', event);
      } catch (err) {
        console.error('Failed to depart:', err);
      }
    },
    [],
  );

  /** Mark as returned (kembali) */
  const handleReturn = useCallback(
    async (perm: HealthPermission) => {
      try {
        await healthPermissionService.return(perm.id);

        const event = createGovernanceEvent(
          'health:permission_returned',
          perm.santriId,
          perm.santriName,
          {
            permissionId: perm.id,
            kembaliAt: new Date().toISOString(),
          },
        );
        console.info('[IzinBerobat] Returned:', event);
      } catch (err) {
        console.error('Failed to return:', err);
      }
    },
    [],
  );

  /** Mark as complete (selesai) */
  const handleComplete = useCallback(async (perm: HealthPermission) => {
    try {
      await healthPermissionService.complete(perm.id);
    } catch (err) {
      console.error('Failed to complete:', err);
    }
  }, []);

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Izin Berobat"
          description="Kelola izin berobat luar untuk santri"
        />
        <LoadingState type="stats" count={4} />
        <LoadingState type="table" count={5} />
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Izin Berobat"
          description="Kelola izin berobat luar untuk santri"
        />
        <ErrorState message={error.message} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Izin Berobat"
        description="Kelola izin berobat luar untuk santri"
        action={
          canCreate && (
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm active:scale-95"
            >
              <Plus aria-hidden="true" className="w-4 h-4" />
              Buat Izin Berobat
            </button>
          )
        }
      />

      {/* ── Stats Cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Menunggu Approval"
          value={stats.menunggu}
          icon={Clock}
          iconClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
        <StatsCard
          title="Dalam Perjalanan"
          value={stats.dalamPerjalanan}
          icon={MapPin}
          iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        />
        <StatsCard
          title="Selesai"
          value={stats.selesai}
          icon={Shield}
          iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <StatsCard
          title="Total Izin"
          value={stats.total}
          icon={FileText}
          iconClassName="bg-purple-500/10 text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* ── Permission Table ───────────────────────────────────────────────── */}
      {permissions.length === 0 ? (
        <PageCard
          title="Daftar Izin Berobat"
          description="Belum ada izin berobat tercatat"
        >
          <EmptyState
            icon={AlertCircle}
            title="Belum Ada Izin Berobat"
            description="Belum ada data izin berobat yang tercatat di sistem."
            action={
              canCreate
                ? {
                    label: 'Buat Izin Berobat',
                    onClick: () => setShowModal(true),
                  }
                : undefined
            }
          />
        </PageCard>
      ) : (
        <PageCard
          title="Daftar Izin Berobat"
          description={`${filtered.length} izin ditemukan`}
        >
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari nama santri..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all min-w-[160px]"
            >
              <option value="all">Semua Status</option>
              <option value="diajukan">Diajukan</option>
              <option value="disetujui">Disetujui</option>
              <option value="ditolak">Ditolak</option>
              <option value="dalam_perjalanan">Dalam Perjalanan</option>
              <option value="kembali">Kembali</option>
              <option value="selesai">Selesai</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-muted-foreground">
                  <th className="text-left px-4 py-3 font-medium whitespace-nowrap">
                    Santri
                  </th>
                  <th className="text-left px-4 py-3 font-medium whitespace-nowrap min-w-[160px]">
                    Keluhan
                  </th>
                  <th className="text-left px-4 py-3 font-medium whitespace-nowrap">
                    Tujuan Berobat
                  </th>
                  <th className="text-center px-4 py-3 font-medium whitespace-nowrap">
                    Severity
                  </th>
                  <th className="text-left px-4 py-3 font-medium whitespace-nowrap">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 font-medium whitespace-nowrap">
                    Pengawas
                  </th>
                  <th className="text-left px-4 py-3 font-medium whitespace-nowrap">
                    Tanggal
                  </th>
                  <th className="text-center px-4 py-3 font-medium whitespace-nowrap w-[140px]">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((perm) => (
                  <tr
                    key={perm.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    {/* Santri */}
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setDetailItem(perm)}
                        className="flex items-center gap-2.5 group"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                          {perm.santriName
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')}
                        </div>
                        <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {perm.santriName}
                        </span>
                      </button>
                    </td>

                    {/* Keluhan */}
                    <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">
                      {perm.keluhan}
                    </td>

                    {/* Tujuan Berobat */}
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-sm">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        {perm.tujuanBerobat}
                      </span>
                    </td>

                    {/* Severity */}
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                          SEVERITY_BADGE[perm.severity] ?? ''
                        }`}
                      >
                        {HEALTH_SEVERITY_LABELS[perm.severity]}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={PERMISSION_STATUS_LABELS[perm.status]}
                        variant={STATUS_VARIANT[perm.status]}
                      />
                    </td>

                    {/* Pengawas */}
                    <td className="px-4 py-3 text-muted-foreground">
                      {perm.requiresSupervisor ? (
                        <span className="inline-flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 shrink-0" />
                          {perm.supervisorName || '-'}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/60">-</span>
                      )}
                    </td>

                    {/* Tanggal */}
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(perm.createdAt)}
                    </td>

                    {/* Aksi */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* ── Approve / Reject (diajukan) ──────────────────── */}
                        {perm.status === 'diajukan' && canApprove && (
                          <>
                            <button
                              onClick={() => handleApprove(perm)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors"
                              title="Setujui"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleReject(perm)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
                              title="Tolak"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </>
                        )}

                        {/* ── Berangkat (disetujui) ─────────────────────────── */}
                        {perm.status === 'disetujui' && (
                          <button
                            onClick={() => handleDepart(perm)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                            title="Berangkat"
                          >
                            <ArrowRight className="w-3 h-3" />
                            Berangkat
                          </button>
                        )}

                        {/* ── Kembali (dalam_perjalanan) ────────────────────── */}
                        {perm.status === 'dalam_perjalanan' && (
                          <button
                            onClick={() => handleReturn(perm)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition-colors"
                            title="Kembali"
                          >
                            <ArrowLeft className="w-3 h-3" />
                            Kembali
                          </button>
                        )}

                        {/* ── Selesai (kembali) ─────────────────────────────── */}
                        {perm.status === 'kembali' && (
                          <button
                            onClick={() => handleComplete(perm)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors"
                            title="Selesai"
                          >
                            <Check className="w-3 h-3" />
                            Selesai
                          </button>
                        )}

                        {/* ── Terminal states ───────────────────────────────── */}
                        {['selesai', 'ditolak'].includes(perm.status) && (
                          <span className="text-xs text-muted-foreground">
                            -
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && permissions.length > 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-8 text-center text-muted-foreground text-sm"
                    >
                      Tidak ada izin yang sesuai pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </PageCard>
      )}

      {/* ── Create Modal ──────────────────────────────────────────────────── */}
      {showModal && (
        <IzinBerobatModal
          open={showModal}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* ── Detail Modal ──────────────────────────────────────────────────── */}
      {detailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30 shrink-0">
              <h3 className="font-bold text-lg">Detail Izin Berobat</h3>
              <button
                onClick={() => setDetailItem(null)}
                className="text-muted-foreground hover:text-foreground transition-colors bg-background p-1 rounded-md border border-border"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-3 overflow-y-auto">
              {/* Santri info */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                  {detailItem.santriName
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    {detailItem.santriName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Diajukan oleh: {detailItem.requestedByName}
                  </p>
                </div>
              </div>

              {/* Detail grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 p-3 rounded-lg bg-muted/20 border border-border/40">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Tujuan Berobat
                  </p>
                  <p className="text-sm font-medium">
                    {detailItem.tujuanBerobat}
                  </p>
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-muted/20 border border-border/40">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Tanggal
                  </p>
                  <p className="text-sm font-medium">
                    {formatDate(detailItem.createdAt)}
                  </p>
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-muted/20 border border-border/40">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Severity
                  </p>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                      SEVERITY_BADGE[detailItem.severity] ?? ''
                    }`}
                  >
                    {HEALTH_SEVERITY_LABELS[detailItem.severity]}
                  </span>
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-muted/20 border border-border/40">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </p>
                  <StatusBadge
                    status={PERMISSION_STATUS_LABELS[detailItem.status]}
                    variant={STATUS_VARIANT[detailItem.status]}
                  />
                </div>
              </div>

              {/* Keluhan */}
              <div className="space-y-1 p-3 rounded-lg bg-muted/20 border border-border/40">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Keluhan
                </p>
                <p className="text-sm text-muted-foreground">
                  {detailItem.keluhan}
                </p>
              </div>

              {/* Alasan */}
              <div className="space-y-1 p-3 rounded-lg bg-muted/20 border border-border/40">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Alasan
                </p>
                <p className="text-sm text-muted-foreground">
                  {detailItem.alasan}
                </p>
              </div>

              {/* Pengawas */}
              {detailItem.requiresSupervisor && (
                <div className="space-y-1 p-3 rounded-lg bg-muted/20 border border-border/40">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Pengawas
                  </p>
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {detailItem.supervisorName || '-'}
                    </span>
                  </div>
                </div>
              )}

              {/* Timeline info */}
              <div className="space-y-2 p-3 rounded-lg bg-muted/20 border border-border/40">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Timeline
                </p>
                <div className="space-y-1.5 text-xs">
                  {detailItem.keluarAt && (
                    <div className="flex items-center gap-2">
                      <ArrowRight className="w-3 h-3 text-blue-500 shrink-0" />
                      <span className="text-muted-foreground">
                        Berangkat: {formatDate(detailItem.keluarAt)}
                      </span>
                    </div>
                  )}
                  {detailItem.kembaliAt && (
                    <div className="flex items-center gap-2">
                      <ArrowLeft className="w-3 h-3 text-amber-500 shrink-0" />
                      <span className="text-muted-foreground">
                        Kembali: {formatDate(detailItem.kembaliAt)}
                      </span>
                    </div>
                  )}
                  {detailItem.approvedByName && (
                    <div className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span className="text-muted-foreground">
                        Disetujui oleh: {detailItem.approvedByName}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-muted/30 flex justify-end shrink-0">
              <button
                onClick={() => setDetailItem(null)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-background border border-border rounded-lg transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
