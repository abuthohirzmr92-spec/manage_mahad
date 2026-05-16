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
  governanceCaseService,
  pelanggaranService,
  santriService,
  hukumanService,
  masterHukumanService,
} from '@/lib/firebase/services';
import {
  Clock, ShieldAlert, AlertTriangle, Plus, Search, Eye,
  FileText, UserCheck, Gavel, MessageSquare,
} from 'lucide-react';
import { CatatPelanggaranModal } from '@/components/pelanggaran/CatatPelanggaranModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  REVIEW_STATUS_COLORS,
  REVIEW_STATUS_LABEL,
  SOURCE_TYPE_LABEL,
  SEVERITY_COLORS,
} from '@/components/pelanggaran/constants';
import { createGovernanceEvent } from '@/lib/governance-events';
import { computeAfterViolation } from '@/lib/point-engine';
import type {
  GovernanceCase, GovernanceReviewStatus,
  Santri, MasterPelanggaran, MasterHukuman, PelanggaranSeverity,
} from '@/types';
import type { FirestoreSantri } from '@/types/firestore';
import type { Kelas } from '@/types/academic';

export default function GovernanceReviewPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<GovernanceReviewStatus | 'all'>('pending_review');
  const [showLapor, setShowLapor] = useState(false);
  const [reviewItem, setReviewItem] = useState<GovernanceCase | null>(null);
  const [detailItem, setDetailItem] = useState<GovernanceCase | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Review form state
  const [reviewOutcome, setReviewOutcome] = useState<GovernanceReviewStatus>('warning');
  const [reviewNotes, setReviewNotes] = useState('');

  const { data: cases, loading, error } = useCollection<GovernanceCase>('governanceCases');
  const { data: santriList } = useCollection<Santri>('santri');
  const { data: masterPelanggaranList } = useCollection<MasterPelanggaran>('masterPelanggaran');
  const { data: masterHukumanList = [] } = useCollection<MasterHukuman>('masterHukuman');
  const user = useAuthStore((s) => s.user);

  const filtered = useMemo(() => {
    return cases.filter((c) => {
      const matchSearch =
        c.santriName.toLowerCase().includes(search.toLowerCase()) ||
        c.reason.toLowerCase().includes(search.toLowerCase()) ||
        (c.submittedBy && c.submittedBy.toLowerCase().includes(search.toLowerCase()));
      const matchTab = activeTab === 'all' || c.reviewStatus === activeTab;
      return matchSearch && matchTab;
    });
  }, [cases, search, activeTab]);

  const stats = useMemo(() => {
    const pending = cases.filter((c) => c.reviewStatus === 'pending_review').length;
    const warnings = cases.filter((c) => c.reviewStatus === 'warning').length;
    const violations = cases.filter((c) => c.reviewStatus === 'official_violation').length;
    const manual = cases.filter((c) => c.sourceType === 'manual_report').length;
    const system = cases.filter((c) => c.sourceType === 'system_detection').length;
    return { pending, warnings, violations, manual, system };
  }, [cases]);

  // ── Submit laporan → creates GovernanceCase ──────────────────────────────
  const handleSubmitLaporan = useCallback(async (records: Array<{
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
    for (const r of records) {
      const caseId = await governanceCaseService.create({
        sourceType: 'manual_report',
        submittedBy: r.reportedBy,
        submittedByRole: r.reportedByRole as GovernanceCase['submittedByRole'],
        santriId: r.santriId,
        santriName: r.santriName,
        reason: r.pelanggaranName,
        severity: r.severity,
        points: r.points,
        date: r.date,
        notes: r.notes,
        masterPelanggaranId: r.pelanggaranId,
        masterPelanggaranName: r.pelanggaranName,
        reviewStatus: 'pending_review',
      });

      // Emit event
      const event = createGovernanceEvent('governance:case_created', r.santriId, r.santriName, {
        caseId,
        reason: r.pelanggaranName,
        sourceType: 'manual_report',
        severity: r.severity,
        submittedBy: r.reportedBy,
      });
    }
    setShowLapor(false);
  }, []);

  // ── Review handler ──────────────────────────────────────────────────────
  const handleReview = useCallback(async () => {
    if (!reviewItem || !user) return;
    setSubmitting(true);

    try {
      const outcome = reviewOutcome;

      if (outcome === 'official_violation') {
        // 1. Create Pelanggaran record (always confirmed)
        const pelanggaranId = await pelanggaranService.createFromReview({
          santriId: reviewItem.santriId,
          santriName: reviewItem.santriName,
          pelanggaranId: reviewItem.masterPelanggaranId ?? '',
          pelanggaranName: reviewItem.masterPelanggaranName || reviewItem.reason,
          severity: reviewItem.severity ?? 'ringan',
          points: reviewItem.points ?? 0,
          date: reviewItem.date,
          reportedBy: reviewItem.submittedBy,
          reportedByUserId: user.id,
          reportedByRole: user.role,
          status: 'confirmed',
          statusHukuman: 'belum',
          notes: reviewItem.notes,
          governanceCaseId: reviewItem.id,
        });

        // 2. Update GovernanceCase with review outcome
        await governanceCaseService.review(
          reviewItem.id,
          'official_violation',
          user.id,
          user.name,
          user.role,
          reviewNotes,
          pelanggaranId,
        );

        // 3. Update Santri points
        const santri = await santriService.get(reviewItem.santriId);
        if (santri) {
          const pointUpdate = computeAfterViolation(santri, reviewItem.points ?? 0);
          await santriService.update(reviewItem.santriId, pointUpdate as unknown as Partial<FirestoreSantri>);
        }

        // 4. Emit events
        createGovernanceEvent('governance:violation_created', reviewItem.santriId, reviewItem.santriName, {
          caseId: reviewItem.id,
          pelanggaranId,
          pelanggaranName: reviewItem.masterPelanggaranName || reviewItem.reason,
          severity: reviewItem.severity ?? 'ringan',
          points: reviewItem.points ?? 0,
          reviewedBy: user.name,
        });
      } else {
        // Warning outcome
        const warningCount = (reviewItem.warningCount ?? 0) + 1;
        await governanceCaseService.review(
          reviewItem.id,
          'warning',
          user.id,
          user.name,
          user.role,
          reviewNotes,
        );

        // Increment warning count
        await governanceCaseService.update(reviewItem.id, {
          warningCount,
        } as Partial<import('@/types/firestore').FirestoreGovernanceCase>);

        createGovernanceEvent('governance:warning_issued', reviewItem.santriId, reviewItem.santriName, {
          caseId: reviewItem.id,
          reason: reviewItem.reason,
          warningCount,
          reviewedBy: user.name,
        });
      }

      // Emit general review event
      createGovernanceEvent('governance:case_reviewed', reviewItem.santriId, reviewItem.santriName, {
        caseId: reviewItem.id,
        reason: reviewItem.reason,
        outcome,
        reviewedBy: user.name,
        reviewNotes,
      });
    } catch (err) {
      console.error('Gagal mereview kasus:', err);
    }

    setSubmitting(false);
    setReviewItem(null);
    setReviewNotes('');
  }, [reviewItem, reviewOutcome, reviewNotes, user]);

  const openReview = (c: GovernanceCase) => {
    setReviewItem(c);
    setReviewOutcome('warning');
    setReviewNotes('');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Governance Review" description="Unified Behavioral Review & Governance Case System" />
        <LoadingState type="stats" count={5} />
        <LoadingState type="table" count={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Governance Review" description="Unified Behavioral Review & Governance Case System" />
        <ErrorState message={error.message} />
      </div>
    );
  }

  const tabs: Array<{ value: GovernanceReviewStatus | 'all'; label: string; count: number; icon: React.ComponentType<{ className?: string }> }> = [
    { value: 'pending_review', label: 'Queue Review', count: stats.pending, icon: Clock },
    { value: 'warning', label: 'Peringatan', count: stats.warnings, icon: ShieldAlert },
    { value: 'official_violation', label: 'Pelanggaran Resmi', count: stats.violations, icon: AlertTriangle },
    { value: 'all', label: 'Semua Kasus', count: cases.length, icon: FileText },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Governance Review"
        description="Sistem review perilaku terpusat — seluruh laporan & deteksi sistem masuk ke sini untuk ditinjau pengawas"
        action={
          <button
            type="button"
            onClick={() => setShowLapor(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm active:scale-95"
          >
            <Plus aria-hidden="true" className="w-4 h-4" />
            Ajukan Laporan
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard title="Menunggu Review" value={stats.pending} icon={Clock} iconClassName="bg-amber-500/10 text-amber-600" />
        <StatsCard title="Peringatan" value={stats.warnings} icon={ShieldAlert} iconClassName="bg-blue-500/10 text-blue-600" />
        <StatsCard title="Pelanggaran Resmi" value={stats.violations} icon={AlertTriangle} iconClassName="bg-red-500/10 text-red-600" />
        <StatsCard title="Laporan Manual" value={stats.manual} icon={UserCheck} iconClassName="bg-emerald-500/10 text-emerald-600" />
        <StatsCard title="Deteksi Sistem" value={stats.system} icon={Gavel} iconClassName="bg-violet-500/10 text-violet-600" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(tab.value)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.value
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-stone-500 hover:text-stone-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            <span className={`ml-1 text-xs rounded-full px-1.5 py-0.5 ${
              activeTab === tab.value ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Cari santri, alasan, atau pelapor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Case List */}
      {filtered.length === 0 ? (
        <PageCard title={activeTab === 'all' ? 'Semua Kasus' : REVIEW_STATUS_LABEL[activeTab]} description="0 kasus ditemukan">
          <EmptyState
            icon={activeTab === 'pending_review' ? Clock : activeTab === 'warning' ? ShieldAlert : FileText}
            title="Tidak Ada Kasus"
            description={activeTab === 'pending_review'
              ? 'Semua kasus sudah direview. Gunakan "Ajukan Laporan" untuk menambah kasus baru.'
              : 'Belum ada kasus dengan status ini.'}
          />
        </PageCard>
      ) : (
        <PageCard
          title={activeTab === 'all' ? 'Semua Kasus' : REVIEW_STATUS_LABEL[activeTab]}
          description={`${filtered.length} kasus ditemukan`}
        >
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-muted-foreground">
                  <th className="text-left px-4 py-3 font-medium">Santri</th>
                  <th className="text-left px-4 py-3 font-medium">Alasan</th>
                  <th className="text-left px-4 py-3 font-medium">Sumber</th>
                  <th className="text-left px-4 py-3 font-medium">Tingkat</th>
                  <th className="text-left px-4 py-3 font-medium">Tanggal</th>
                  <th className="text-left px-4 py-3 font-medium">Status Review</th>
                  <th className="text-left px-4 py-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                          {c.santriName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <p className="font-medium">{c.santriName}</p>
                          <p className="text-xs text-muted-foreground">{c.submittedBy}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="max-w-[200px] truncate">{c.reason}</p>
                      {c.warningCount && c.warningCount > 1 && (
                        <span className="text-[10px] text-amber-600 font-medium">
                          ⚠ {c.warningCount}x warning
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        c.sourceType === 'manual_report'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-violet-100 text-violet-700'
                      }`}>
                        {SOURCE_TYPE_LABEL[c.sourceType] || c.sourceType}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {c.severity ? (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${SEVERITY_COLORS[c.severity]}`}>
                          {c.severity.replace('_', ' ')}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{c.date}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${REVIEW_STATUS_COLORS[c.reviewStatus]}`}>
                        {REVIEW_STATUS_LABEL[c.reviewStatus]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {c.reviewStatus === 'pending_review' && (
                          <button
                            type="button"
                            onClick={() => openReview(c)}
                            className="p-1.5 rounded-md text-primary hover:text-primary hover:bg-primary/10 transition-colors"
                            title="Review kasus ini"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setDetailItem(c)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          title="Lihat detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PageCard>
      )}

      {/* ── Review Dialog ────────────────────────────────────────────── */}
      {reviewItem && (
        <Dialog open={!!reviewItem} onOpenChange={() => setReviewItem(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold">Review Kasus</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground/80">
                Tentukan hasil review — peringatan atau pelanggaran resmi
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Case summary */}
              <div className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Santri:</span>
                  <span className="text-sm font-semibold">{reviewItem.santriName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Kejadian:</span>
                  <span className="text-sm">{reviewItem.reason}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Sumber:</span>
                  <span className="text-sm">{SOURCE_TYPE_LABEL[reviewItem.sourceType]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pelapor:</span>
                  <span className="text-sm">{reviewItem.submittedBy}</span>
                </div>
                {reviewItem.severity && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tingkat:</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${SEVERITY_COLORS[reviewItem.severity]}`}>
                      {reviewItem.severity.replace('_', ' ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Outcome selector */}
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                  Hasil Review
                </label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setReviewOutcome('warning')}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      reviewOutcome === 'warning'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                        : 'border-border hover:border-blue-300'
                    }`}
                  >
                    <ShieldAlert className={`w-5 h-5 mb-1 ${reviewOutcome === 'warning' ? 'text-blue-600' : 'text-muted-foreground'}`} />
                    <p className="text-sm font-bold">Peringatan</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Kejadian valid, cukup peringatan. Tidak mengurangi poin.</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewOutcome('official_violation')}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      reviewOutcome === 'official_violation'
                        ? 'border-red-500 bg-red-50 dark:bg-red-950/30'
                        : 'border-border hover:border-red-300'
                    }`}
                  >
                    <AlertTriangle className={`w-5 h-5 mb-1 ${reviewOutcome === 'official_violation' ? 'text-red-600' : 'text-muted-foreground'}`} />
                    <p className="text-sm font-bold">Pelanggaran Resmi</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Masuk rekap pelanggaran, kurangi poin, proses hukuman.</p>
                  </button>
                </div>
              </div>

              {/* Review notes */}
              <div>
                <label htmlFor="review-notes" className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                  Catatan Review
                </label>
                <textarea
                  id="review-notes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Alasan keputusan, arahan pembinaan, dll..."
                  rows={3}
                  className="w-full mt-1.5 text-sm border border-border rounded-lg px-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setReviewItem(null)} className="text-muted-foreground">
                Batal
              </Button>
              <Button
                type="button"
                onClick={handleReview}
                disabled={submitting}
                className={reviewOutcome === 'warning'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
                }
              >
                {submitting ? 'Menyimpan...' : reviewOutcome === 'warning' ? 'Tetapkan Peringatan' : 'Tetapkan Pelanggaran'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Detail Dialog ──────────────────────────────────────────────── */}
      {detailItem && (
        <Dialog open={!!detailItem} onOpenChange={() => setDetailItem(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold">Detail Kasus</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground/80">
                Informasi lengkap governance case
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                  {detailItem.santriName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <p className="text-sm font-semibold">{detailItem.santriName}</p>
                  <p className="text-xs text-muted-foreground">{detailItem.submittedBy}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 p-3 rounded-lg bg-muted/20 border border-border/40">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Sumber</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    detailItem.sourceType === 'manual_report'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-violet-100 text-violet-700'
                  }`}>
                    {SOURCE_TYPE_LABEL[detailItem.sourceType]}
                  </span>
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-muted/20 border border-border/40">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Status Review</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${REVIEW_STATUS_COLORS[detailItem.reviewStatus]}`}>
                    {REVIEW_STATUS_LABEL[detailItem.reviewStatus]}
                  </span>
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-muted/20 border border-border/40">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tanggal</p>
                  <p className="text-sm font-medium">{detailItem.date}</p>
                </div>
                {detailItem.severity && (
                  <div className="space-y-1 p-3 rounded-lg bg-muted/20 border border-border/40">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tingkat</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${SEVERITY_COLORS[detailItem.severity]}`}>
                      {detailItem.severity.replace('_', ' ')}
                    </span>
                  </div>
                )}
                {detailItem.reviewedBy && (
                  <div className="space-y-1 p-3 rounded-lg bg-muted/20 border border-border/40">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Direview Oleh</p>
                    <p className="text-sm font-medium">{detailItem.reviewedBy}</p>
                  </div>
                )}
                {detailItem.reviewedAt && (
                  <div className="space-y-1 p-3 rounded-lg bg-muted/20 border border-border/40">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Direview Pada</p>
                    <p className="text-sm font-medium">{new Date(detailItem.reviewedAt).toLocaleDateString('id-ID')}</p>
                  </div>
                )}
                {detailItem.warningCount && detailItem.warningCount > 0 && (
                  <div className="space-y-1 p-3 rounded-lg bg-amber-50 border border-amber-200">
                    <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider">Jumlah Warning</p>
                    <p className="text-sm font-bold text-amber-700">{detailItem.warningCount}x</p>
                  </div>
                )}
              </div>

              <div className="space-y-1 p-3 rounded-lg bg-muted/20 border border-border/40">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Alasan / Kejadian</p>
                <p className="text-sm">{detailItem.reason}</p>
              </div>

              {detailItem.notes && (
                <div className="space-y-1 p-3 rounded-lg bg-muted/20 border border-border/40">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Catatan Laporan</p>
                  <p className="text-sm text-muted-foreground">{detailItem.notes}</p>
                </div>
              )}

              {detailItem.reviewNotes && (
                <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-[10px] font-semibold text-blue-700 uppercase tracking-wider">Catatan Review</p>
                  <p className="text-sm text-blue-800">{detailItem.reviewNotes}</p>
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

      {/* ── Ajukan Laporan Modal (reuses CatatPelanggaranModal) ──────── */}
      {showLapor && (
        <CatatPelanggaranModal
          open={showLapor}
          santriList={santriList}
          masterPelanggaranList={masterPelanggaranList}
          masterHukumanList={masterHukumanList}
          santriTingkatMap={{}}
          reporterName={user?.name ?? 'Unknown'}
          reporterUserId={user?.id ?? ''}
          reporterRole={user?.role ?? ''}
          santriViolationCounts={{}}
          santriJenjangMap={{}}
          globalTolerancePolicy={null}
          toleranceOverrides={[]}
          onClose={() => setShowLapor(false)}
          onSave={handleSubmitLaporan}
        />
      )}
    </div>
  );
}
