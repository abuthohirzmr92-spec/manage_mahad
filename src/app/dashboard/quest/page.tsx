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
import { questService, santriService } from '@/lib/firebase/services';
import { createGovernanceEvent } from '@/lib/governance-events';
import { computeAfterRedemption, computePrestasiUpdate } from '@/lib/point-engine';
import { shouldAutoApprove, validateQuestCreation } from '@/lib/character-engine';
import type { Quest } from '@/types';
import {
  Trophy, Clock, CheckCircle, Shield, Search,
  Plus, X, Info, Check, AlertCircle, Loader2,
  Play, Flag, ThumbsUp, ThumbsDown, Star,
} from 'lucide-react';

// ── Local helper to access raw Firestore timestamps for sorting ─────────────
interface QuestWithMeta extends Quest {
  createdAt?: { toMillis: () => number; toDate: () => Date };
  updatedAt?: { toMillis: () => number; toDate: () => Date };
}

export default function QuestPage() {
  const { user } = useAuthStore();
  const [searchQuest, setSearchQuest] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Form state ──────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pointsReward: 10,
    deadline: '',
    targetType: 'santri' as 'global' | 'asrama' | 'kelas' | 'santri',
    targetId: '',
    santriName: '',
  });

  const updateForm = useCallback(
    <K extends keyof typeof formData>(key: K, value: (typeof formData)[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
      setSubmitError(null);
    },
    [],
  );

  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      description: '',
      pointsReward: 10,
      deadline: '',
      targetType: 'santri',
      targetId: '',
      santriName: '',
    });
    setSubmitError(null);
  }, []);

  // ── Firebase data ──────────────────────────────────────────────────────────
  const { data: allQuests, loading, error } = useCollection<Quest>('quest');

  // ── RBAC ───────────────────────────────────────────────────────────────────
  const canCreateQuest = useIsRole(['admin', 'kepala_kesiswaan', 'musyrif', 'wali_kelas']);
  const isGlobalManager = useIsRole(['admin', 'kepala_kesiswaan']);
  const isSantri = useIsRole('santri');

  // ── Derived data ───────────────────────────────────────────────────────────
  const filteredQuests = useMemo(() => {
    return allQuests.filter((q) => {
      const matchSearch =
        q.title.toLowerCase().includes(searchQuest.toLowerCase()) ||
        (q.santriName || '').toLowerCase().includes(searchQuest.toLowerCase());
      let matchStatus = true;
      if (filterStatus !== 'all') {
        if (filterStatus === 'pending_approval') {
          matchStatus = q.approvalStatus === 'pending';
        } else if (filterStatus === 'active') {
          matchStatus = q.status === 'available';
        } else if (filterStatus === 'in_progress') {
          matchStatus = q.status === 'inProgress';
        } else if (filterStatus === 'rejected') {
          matchStatus = q.approvalStatus === 'rejected';
        } else {
          matchStatus = q.status === filterStatus;
        }
      }
      return matchSearch && matchStatus;
    });
  }, [allQuests, searchQuest, filterStatus]);

  const questStats = useMemo(
    () => ({
      questAktif: allQuests.filter(
        (q) => q.status === 'inProgress' || q.status === 'available',
      ).length,
      questSelesai: allQuests.filter((q) => q.status === 'completed').length,
      pendingApproval: allQuests.filter(
        (q) => q.approvalStatus === 'pending',
      ).length,
      totalPemutihan: allQuests
        .filter((q) => q.status === 'completed')
        .reduce((acc, q) => acc + q.pointsReward, 0),
    }),
    [allQuests],
  );

  const pendingQuests = useMemo(
    () => allQuests.filter((q) => q.approvalStatus === 'pending'),
    [allQuests],
  );

  const approvalHistory = useMemo(() => {
    return allQuests
      .filter(
        (q) =>
          q.approvalStatus === 'approved' || q.approvalStatus === 'rejected',
      )
      .sort((a, b) => {
        const aTime =
          (a as unknown as QuestWithMeta).updatedAt?.toMillis?.() ?? 0;
        const bTime =
          (b as unknown as QuestWithMeta).updatedAt?.toMillis?.() ?? 0;
        return bTime - aTime;
      });
  }, [allQuests]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSubmitQuest = useCallback(async () => {
    const validationError = validateQuestCreation({
      title: formData.title,
      pointsReward: formData.pointsReward,
      deadline: formData.deadline,
    });
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const autoApprove = shouldAutoApprove(user?.role || '');

      // Build target info
      let santriId: string;
      let santriName: string;
      if (formData.targetType === 'santri') {
        santriId = formData.targetId || '';
        santriName = formData.santriName || 'Santri';
      } else if (formData.targetType === 'global') {
        santriId = '';
        santriName = 'Semua Santri';
      } else {
        santriId = formData.targetId || formData.targetType;
        santriName = formData.targetId || formData.targetType;
      }

      const questId = await questService.create({
        santriId,
        santriName,
        title: formData.title,
        description: formData.description,
        pointsReward: formData.pointsReward,
        status: autoApprove ? 'available' : 'available',
        deadline: formData.deadline,
        progress: 0,
        createdBy: user?.name || user?.id || '',
        approvalStatus: autoApprove ? 'approved' : 'pending',
        approvedBy: autoApprove ? user?.name || '' : undefined,
      });

      // Emit governance event
      const event = createGovernanceEvent(
        autoApprove ? 'quest:approved' : 'quest:completed',
        santriId,
        santriName,
        {
          questId,
          questTitle: formData.title,
          pointsReward: formData.pointsReward,
        },
      );
      console.info('[Quest] Created:', event);

      setShowModal(false);
      resetForm();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Gagal membuat quest',
      );
    } finally {
      setSubmitting(false);
    }
  }, [formData, user, resetForm]);

  const handleApprove = useCallback(
    async (quest: Quest) => {
      try {
        await questService.approve(quest.id, user?.name || user?.id || '');
        const event = createGovernanceEvent(
          'quest:approved',
          quest.santriId,
          quest.santriName,
          {
            questId: quest.id,
            questTitle: quest.title,
            pointsReward: quest.pointsReward,
          },
        );
        console.info('[Quest] Approved:', event);
      } catch (err) {
        console.error('Failed to approve quest:', err);
      }
    },
    [user],
  );

  const handleReject = useCallback(
    async (quest: Quest) => {
      try {
        await questService.reject(quest.id, user?.name || user?.id || '');
        const event = createGovernanceEvent(
          'quest:rejected',
          quest.santriId,
          quest.santriName,
          {
            questId: quest.id,
            questTitle: quest.title,
            pointsReward: quest.pointsReward,
          },
        );
        console.info('[Quest] Rejected:', event);
      } catch (err) {
        console.error('Failed to reject quest:', err);
      }
    },
    [user],
  );

  const handleStartQuest = useCallback(async (quest: Quest) => {
    try {
      await questService.startQuest(quest.id);
    } catch (err) {
      console.error('Failed to start quest:', err);
    }
  }, []);

  const handleCompleteQuest = useCallback(
    async (quest: Quest) => {
      try {
        // 1. Mark quest as completed
        await questService.complete(quest.id);

        // 2. Update santri prestasi and apply pemutihan (redemption)
        if (quest.santriId) {
          const santri = await santriService.get(quest.santriId);
          if (santri) {
            // Add prestasi points
            const newPrestasi = computePrestasiUpdate(
              santri.totalPrestasi,
              quest.pointsReward,
            );
            // Apply pemutihan (reduce violation points if any)
            const redemption = computeAfterRedemption(
              {
                totalPoinPelanggaran: santri.totalPoinPelanggaran,
                statusSP: santri.statusSP,
              },
              quest.pointsReward,
            );

            await santriService.update(quest.santriId, {
              totalPrestasi: newPrestasi,
              totalPoinPelanggaran: redemption.totalPoinPelanggaran,
              statusKarakter: redemption.statusKarakter as 'Baik' | 'Perlu Perhatian' | 'Peringatan',
              statusSP: redemption.statusSP as 'Tidak Ada' | 'SP1' | 'SP2' | 'SP3',
            });
          }
        }

        // 3. Emit governance event
        const event = createGovernanceEvent(
          'quest:completed',
          quest.santriId,
          quest.santriName,
          {
            questId: quest.id,
            questTitle: quest.title,
            pointsReward: quest.pointsReward,
          },
        );
        console.info('[Quest] Completed:', event);
      } catch (err) {
        console.error('Failed to complete quest:', err);
      }
    },
    [],
  );

  // ── Helper: format deadline for display ──────────────────────────────────
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // ── Helpers: action availability ─────────────────────────────────────────
  const canStart = (q: Quest) =>
    q.status === 'available' && !isSantri;
  const canComplete = (q: Quest) =>
    q.status === 'inProgress' && !isSantri;
  const isOwnQuest = (q: Quest) =>
    isSantri && q.santriId === user?.id;

  // ==========================================================================
  // RENDER
  // ==========================================================================

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Quest & Pemutihan"
          description="Manajemen penugasan positif untuk pemutihan poin pelanggaran santri"
        />
        <LoadingState type="stats" count={4} />
        <LoadingState type="card" count={3} />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Quest & Pemutihan"
          description="Manajemen penugasan positif untuk pemutihan poin pelanggaran santri"
        />
        <ErrorState message={error.message} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quest & Pemutihan"
        description="Manajemen penugasan positif untuk pemutihan poin pelanggaran santri"
        action={
          canCreateQuest && (
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Buat Quest
            </button>
          )
        }
      />

      {/* ── 1. Statistik Quest ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Quest Aktif"
          value={questStats.questAktif}
          icon={Trophy}
          iconClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
        <StatsCard
          title="Pending Approval"
          value={questStats.pendingApproval}
          icon={Clock}
          iconClassName="bg-orange-500/10 text-orange-600 dark:text-orange-400"
        />
        <StatsCard
          title="Quest Selesai"
          value={questStats.questSelesai}
          icon={CheckCircle}
          iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <StatsCard
          title="Total Pemutihan"
          value={questStats.totalPemutihan}
          icon={Shield}
          iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400"
          description="poin diputihkan"
        />
      </div>

      {/* ── 2. Main content ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ── LEFT ─ Quest Table ──────────────────────────────────────────── */}
        <div className="xl:col-span-2 space-y-6">
          {allQuests.length === 0 ? (
            <PageCard
              title="Daftar Quest Santri"
              description="Belum ada quest tercatat"
            >
              <EmptyState
                icon={AlertCircle}
                title="Belum Ada Quest"
                description="Belum ada quest yang dibuat untuk santri."
                action={
                  canCreateQuest
                    ? {
                        label: 'Buat Quest Baru',
                        onClick: () => {
                          resetForm();
                          setShowModal(true);
                        },
                      }
                    : undefined
                }
              />
            </PageCard>
          ) : (
            <PageCard
              title="Daftar Quest Santri"
              description="Daftar quest yang tersedia dan sedang berjalan"
            >
              {/* Search & Filter */}
              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Cari quest atau nama santri..."
                    value={searchQuest}
                    onChange={(e) => setSearchQuest(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all min-w-[160px]"
                >
                  <option value="all">Semua Status</option>
                  <option value="pending_approval">Menunggu Approval</option>
                  <option value="active">Aktif (Tersedia)</option>
                  <option value="in_progress">Berjalan</option>
                  <option value="completed">Selesai</option>
                  <option value="rejected">Ditolak</option>
                </select>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 text-muted-foreground">
                      <th className="text-left px-4 py-3 font-medium">
                        Judul Quest
                      </th>
                      <th className="text-left px-4 py-3 font-medium">
                        Santri/Target
                      </th>
                      <th className="text-left px-4 py-3 font-medium min-w-[150px]">
                        Progress
                      </th>
                      <th className="text-center px-4 py-3 font-medium">
                        Reward
                      </th>
                      <th className="text-left px-4 py-3 font-medium">
                        Status
                      </th>
                      <th className="text-right px-4 py-3 font-medium w-[120px]">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredQuests.map((q) => (
                      <tr
                        key={q.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium text-foreground">
                            {q.title}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {q.approvalStatus === 'pending' && (
                              <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-600 dark:text-orange-400">
                                <Clock className="w-2.5 h-2.5" />
                                Menunggu Approval
                              </span>
                            )}
                            {q.approvalStatus === 'approved' && (
                              <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <Check className="w-2.5 h-2.5" />
                                Disetujui
                              </span>
                            )}
                            {q.approvalStatus === 'rejected' && (
                              <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400">
                                <X className="w-2.5 h-2.5" />
                                Ditolak
                              </span>
                            )}
                            {q.deadline && (
                              <span className="text-[10px] text-muted-foreground">
                                Deadline: {formatDate(q.deadline)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {q.santriName}
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1.5 w-full">
                            <div className="flex justify-between text-[10px]">
                              <span className="text-muted-foreground">
                                Penyelesaian
                              </span>
                              <span className="font-bold">
                                {q.progress || 0}%
                              </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  q.progress === 100
                                    ? 'bg-emerald-500'
                                    : 'bg-primary'
                                }`}
                                style={{ width: `${q.progress || 0}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                            +{q.pointsReward}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge
                            status={
                              q.approvalStatus === 'pending'
                                ? 'pending'
                                : q.status === 'available'
                                  ? 'active'
                                  : q.status
                            }
                            variant={
                              q.status === 'completed'
                                ? 'success'
                                : q.status === 'expired' ||
                                    q.approvalStatus === 'rejected'
                                  ? 'error'
                                  : q.approvalStatus === 'pending'
                                    ? 'warning'
                                    : undefined
                            }
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Santri actions: Mulai / Selesai */}
                            {isSantri && isOwnQuest(q) && q.status === 'available' && (
                              <button
                                onClick={() => handleStartQuest(q)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                              >
                                <Play className="w-3 h-3" />
                                Mulai
                              </button>
                            )}
                            {isSantri && isOwnQuest(q) && q.status === 'inProgress' && (
                              <button
                                onClick={() => handleCompleteQuest(q)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors"
                              >
                                <Flag className="w-3 h-3" />
                                Selesai
                              </button>
                            )}

                            {/* Admin actions: Mulai / Selesai */}
                            {!isSantri && canStart(q) && (
                              <button
                                onClick={() => handleStartQuest(q)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                                title="Mulai Quest"
                              >
                                <Play className="w-3 h-3" />
                              </button>
                            )}
                            {!isSantri && canComplete(q) && (
                              <button
                                onClick={() => handleCompleteQuest(q)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors"
                                title="Selesaikan Quest"
                              >
                                <Flag className="w-3 h-3" />
                              </button>
                            )}

                            {/* Manager actions: Approve / Reject in table */}
                            {isGlobalManager &&
                              q.approvalStatus === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleApprove(q)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors"
                                    title="Setujui"
                                  >
                                    <ThumbsUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleReject(q)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
                                    title="Tolak"
                                  >
                                    <ThumbsDown className="w-3 h-3" />
                                  </button>
                                </>
                              )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredQuests.length === 0 && allQuests.length > 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-8 text-center text-muted-foreground text-sm"
                        >
                          Tidak ada quest yang sesuai pencarian.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex items-center justify-center gap-4 text-xs font-medium text-muted-foreground bg-muted/30 p-2 rounded-lg border border-border/50">
                <span className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />{' '}
                  Pending
                </span>
                <span className="text-muted-foreground/50">&rarr;</span>
                <span className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />{' '}
                  Approved
                </span>
                <span className="text-muted-foreground/50">&rarr;</span>
                <span className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />{' '}
                  Active/In Progress
                </span>
              </div>
            </PageCard>
          )}
        </div>

        {/* ── RIGHT ─ Approval Queue & History ──────────────────────────────── */}
        <div className="xl:col-span-1 space-y-6">
          {/* ── Approval Queue (Khusus Manager) ──────────────────────────── */}
          {isGlobalManager && (
            <PageCard
              title="Antrean Persetujuan Quest"
              description="Quest baru yang menunggu validasi Anda"
            >
              <div className="space-y-4">
                {pendingQuests.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    Tidak ada antrean persetujuan.
                  </p>
                ) : (
                  pendingQuests.map((q) => (
                    <div
                      key={q.id}
                      className="p-3.5 rounded-xl border border-orange-500/30 bg-orange-500/5 shadow-sm space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-sm text-foreground">
                            {q.title}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            Pembuat: {q.createdBy || '-'}
                          </p>
                        </div>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/10 text-[10px]">
                          +{q.pointsReward} Poin
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs border-y border-border/50 py-2">
                        <div>
                          <span className="text-muted-foreground block text-[10px]">
                            Target
                          </span>
                          <span className="font-medium text-foreground">
                            {q.santriName || '-'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px]">
                            Deadline
                          </span>
                          <span className="font-medium text-foreground">
                            {q.deadline
                              ? formatDate(q.deadline)
                              : '-'}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => handleApprove(q)}
                          className="flex-1 bg-primary text-primary-foreground text-xs font-medium py-2 rounded-lg hover:bg-primary/90 transition-colors shadow-sm flex justify-center items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => handleReject(q)}
                          className="px-3 bg-destructive/10 text-destructive text-xs font-medium py-2 rounded-lg hover:bg-destructive/20 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </PageCard>
          )}

          {/* ── Histori Approval Quest ───────────────────────────────────────── */}
          <PageCard
            title="Histori Keputusan Quest"
            description="Riwayat persetujuan atau penolakan quest"
          >
            <div className="space-y-4">
              {approvalHistory.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-4">
                  Belum ada riwayat keputusan.
                </p>
              ) : (
                approvalHistory.map((h) => (
                  <div
                    key={h.id}
                    className="p-3.5 rounded-xl border border-border bg-card shadow-sm space-y-2 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-sm text-foreground">
                          {h.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Target: {h.santriName || '-'}
                        </p>
                      </div>
                      <StatusBadge
                        status={h.approvalStatus || 'approved'}
                        variant={
                          h.approvalStatus === 'approved'
                            ? 'success'
                            : 'error'
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/50">
                      <span>
                        Oleh: {h.approvedBy || '-'}
                      </span>
                      <span>
                        Reward: +{h.pointsReward} poin
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </PageCard>
        </div>
      </div>

      {/* ── 3. Modal Buat Quest ──────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-lg rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30 shrink-0">
              <h3 className="font-bold text-lg">Buat Quest Baru</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-muted-foreground hover:text-foreground transition-colors bg-background p-1 rounded-md border border-border"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto">
              {/* Role info banner */}
              {!isGlobalManager && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-400 text-xs rounded-lg flex items-start gap-2.5">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Quest yang Anda buat akan masuk ke status{' '}
                    <strong>Pending Approval</strong> dan menunggu persetujuan
                    dari Kepala Kesiswaan sebelum aktif.
                  </p>
                </div>
              )}
              {isGlobalManager && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs rounded-lg flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Sebagai pengelola, Quest yang Anda buat akan langsung
                    berstatus <strong>Active</strong> dan dapat dikerjakan oleh
                    santri.
                  </p>
                </div>
              )}

              {/* Error message */}
              {submitError && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{submitError}</p>
                </div>
              )}

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Judul Quest <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateForm('title', e.target.value)}
                  className="w-full text-sm border border-border rounded-lg px-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Contoh: Menjadi Imam Sholat Subuh"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Deskripsi Tugas
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => updateForm('description', e.target.value)}
                  className="w-full text-sm border border-border rounded-lg px-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  placeholder="Jelaskan detail tugas yang harus dilakukan..."
                />
              </div>

              {/* Points & Deadline */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Reward Poin <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.pointsReward}
                    onChange={(e) =>
                      updateForm(
                        'pointsReward',
                        Math.max(1, parseInt(e.target.value) || 1),
                      )
                    }
                    className="w-full text-sm border border-border rounded-lg px-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="+10"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Deadline <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => updateForm('deadline', e.target.value)}
                    className="w-full text-sm border border-border rounded-lg px-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              {/* Target Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Target Distribusi
                </label>
                <select
                  value={formData.targetType}
                  onChange={(e) =>
                    updateForm(
                      'targetType',
                      e.target.value as 'global' | 'asrama' | 'kelas' | 'santri',
                    )
                  }
                  className="w-full text-sm border border-border rounded-lg px-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="santri">Santri Tertentu (Individual)</option>
                  <option value="global">Global (Semua Santri)</option>
                  <option value="asrama">Asrama Tertentu</option>
                  <option value="kelas">Kelas Tertentu</option>
                </select>
              </div>

              {/* Target ID / Santri Name (conditional on target type) */}
              {formData.targetType === 'santri' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Nama Santri <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.santriName}
                      onChange={(e) =>
                        updateForm('santriName', e.target.value)
                      }
                      className="w-full text-sm border border-border rounded-lg px-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Masukkan nama santri"
                    />
                  </div>
                </>
              )}
              {formData.targetType === 'asrama' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Nama Asrama <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.targetId}
                    onChange={(e) => updateForm('targetId', e.target.value)}
                    className="w-full text-sm border border-border rounded-lg px-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Contoh: Asrama A"
                  />
                </div>
              )}
              {formData.targetType === 'kelas' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Nama Kelas <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.targetId}
                    onChange={(e) => updateForm('targetId', e.target.value)}
                    className="w-full text-sm border border-border rounded-lg px-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Contoh: Kelas 10A"
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border bg-muted/30 flex justify-end gap-3 shrink-0">
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-background border border-border rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSubmitQuest}
                disabled={submitting}
                className="px-4 py-2 text-sm font-bold text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {submitting && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {submitting ? 'Menyimpan...' : 'Submit Quest'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
