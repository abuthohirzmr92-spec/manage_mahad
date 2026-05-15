'use client';

import { useState, useMemo } from 'react';
import { PageHeader, PageCard } from '@/components/shared/page-header';
import { StatsCard } from '@/components/shared/stats-card';
import { StatusBadge } from '@/components/shared/status-badge';
import { LoadingState } from '@/components/shared/loading-state';
import { ErrorState } from '@/components/shared/error-state';
import { EmptyState } from '@/components/shared/empty-state';
import { useCollection } from '@/hooks';
import { useAuthStore } from '@/store/auth-store';
import type { Quest } from '@/types';
import {
  Trophy, Clock, CheckCircle, Shield, Search,
  Plus, X, Info, Check, Eye, AlertCircle
} from 'lucide-react';

// Mock data histori pemutihan existing
const mockHistoriPemutihan = [
  { id: '1', date: '2025-05-10', santriName: 'Muhammad Rizki Aditya', pointsDeducted: 30, approvedBy: 'Ustadz Hasan', reason: 'Penyelesaian Quest: Imam Sholat 5 Waktu', status: 'approved' },
  { id: '2', date: '2025-05-08', santriName: 'Zaid Ahmad Hidayat', pointsDeducted: 20, approvedBy: 'Ustadz Mahmud', reason: 'Hafalan Surah Yasin', status: 'pending' },
];

// Mock data Approval Queue untuk Kesiswaan
const mockApprovalQueue = [
  { id: 'q1', title: 'Hafalan Juz 30', createdBy: 'Ustadz Hasan', creatorRole: 'Musyrif', target: 'Asrama A', points: 50, submittedAt: '2025-05-11 14:00' },
  { id: 'q2', title: 'Piket Ekstra Ramadhan', createdBy: 'Bapak Ahmad', creatorRole: 'Wali Kelas', target: 'Kelas 10A', points: 20, submittedAt: '2025-05-11 09:30' },
];

// Mock data Histori Approval (Quest Creation)
const mockHistoriApproval = [
  { id: 'h1', title: 'Lomba Kaligrafi', approvedBy: 'Admin Utama', approvedAt: '2025-05-09 10:00', status: 'approved', target: 'Global' },
  { id: 'h2', title: 'Bantu Bersih Masjid', approvedBy: 'Ustadz Salim (Kesiswaan)', approvedAt: '2025-05-08 15:20', status: 'rejected', rejectionReason: 'Poin reward terlalu tinggi untuk tingkat kesulitan tugas.', target: 'Santri Tertentu' },
];

export default function QuestPage() {
  const { user } = useAuthStore();
  const [searchQuest, setSearchQuest] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);

  const { data: questData, loading, error } = useCollection<Quest>('quest');

  // RBAC Checks
  const canCreateQuest = ['admin', 'kepala_kesiswaan', 'musyrif', 'wali_kelas'].includes(user?.role || '');
  const isGlobalManager = ['admin', 'kepala_kesiswaan'].includes(user?.role || '');

  const filteredQuests = useMemo(() => {
    return questData.filter((q) => {
      const matchSearch = q.title.toLowerCase().includes(searchQuest.toLowerCase()) || q.santriName.toLowerCase().includes(searchQuest.toLowerCase());
      const matchStatus = filterStatus === 'all' || q.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [questData, searchQuest, filterStatus]);

  const questStats = useMemo(() => ({
    questAktif: questData.filter((q) => q.status === 'inProgress').length,
    questSelesai: questData.filter((q) => q.status === 'completed').length,
  }), [questData]);

  const pendingApproval = mockApprovalQueue.length;
  const totalPemutihanPoin = mockHistoriPemutihan.filter((h) => h.status === 'approved').reduce((acc, curr) => acc + curr.pointsDeducted, 0);

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
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Buat Quest
            </button>
          )
        }
      />

      {/* 1. Statistik Quest */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Quest Aktif" value={questStats.questAktif} icon={Trophy} iconClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400" />
        <StatsCard title="Pending Approval" value={pendingApproval} icon={Clock} iconClassName="bg-orange-500/10 text-orange-600 dark:text-orange-400" />
        <StatsCard title="Quest Selesai" value={questStats.questSelesai} icon={CheckCircle} iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" />
        <StatsCard title="Total Pemutihan" value={totalPemutihanPoin} icon={Shield} iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400" description="poin diputihkan" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {questData.length === 0 ? (
            <PageCard title="Daftar Quest Santri" description="Belum ada quest tercatat">
              <EmptyState
                icon={AlertCircle}
                title="Belum Ada Quest"
                description="Belum ada quest yang dibuat untuk santri."
              />
            </PageCard>
          ) : (
            <PageCard title="Daftar Quest Santri" description="Daftar quest yang tersedia dan sedang berjalan">
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

              {/* Tabel Quest */}
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 text-muted-foreground">
                      <th className="text-left px-4 py-3 font-medium">Judul Quest</th>
                      <th className="text-left px-4 py-3 font-medium">Santri/Target</th>
                      <th className="text-left px-4 py-3 font-medium min-w-[150px]">Progress</th>
                      <th className="text-center px-4 py-3 font-medium">Reward</th>
                      <th className="text-left px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredQuests.map((q) => (
                      <tr key={q.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-foreground">{q.title}</p>
                          <p className="text-xs text-muted-foreground max-w-[200px] truncate" title={q.description}>{q.description}</p>
                        </td>
                        <td className="px-4 py-3 font-medium">{q.santriName}</td>
                        <td className="px-4 py-3">
                          <div className="space-y-1.5 w-full">
                            <div className="flex justify-between text-[10px]">
                              <span className="text-muted-foreground">Penyelesaian</span>
                              <span className="font-bold">{q.progress || 0}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${q.progress === 100 ? 'bg-emerald-500' : 'bg-primary'}`}
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
                          <StatusBadge status={q.status === 'available' ? 'active' : q.status} variant={q.status === 'available' ? 'success' : undefined} />
                        </td>
                      </tr>
                    ))}
                    {filteredQuests.length === 0 && questData.length > 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-sm">
                          Tidak ada quest yang sesuai pencarian.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex items-center justify-center gap-4 text-xs font-medium text-muted-foreground bg-muted/30 p-2 rounded-lg border border-border/50">
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-500" /> Pending</span>
                <span className="text-muted-foreground/50">→</span>
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /> Approved</span>
                <span className="text-muted-foreground/50">→</span>
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Active/In Progress</span>
              </div>
            </PageCard>
          )}
        </div>

        <div className="xl:col-span-1 space-y-6">

          {/* Approval Queue Section (Khusus Manager) */}
          {isGlobalManager && (
            <PageCard title="Antrean Persetujuan Quest" description="Quest baru yang menunggu validasi Anda">
              <div className="space-y-4">
                {mockApprovalQueue.map((q) => (
                  <div key={q.id} className="p-3.5 rounded-xl border border-orange-500/30 bg-orange-500/5 shadow-sm space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-sm text-foreground">{q.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Disubmit: {q.submittedAt}</p>
                      </div>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/10 text-[10px]">
                        +{q.points} Poin
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs border-y border-border/50 py-2">
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Pembuat</span>
                        <span className="font-medium text-foreground">{q.createdBy}</span>
                        <span className="text-muted-foreground block text-[10px]">{q.creatorRole}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Target</span>
                        <span className="font-medium text-foreground">{q.target}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button className="flex-1 bg-primary text-primary-foreground text-xs font-medium py-2 rounded-lg hover:bg-primary/90 transition-colors shadow-sm flex justify-center items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button className="px-3 bg-muted text-muted-foreground text-xs font-medium py-2 rounded-lg hover:bg-muted/80 transition-colors">
                        Review
                      </button>
                      <button className="px-3 bg-destructive/10 text-destructive text-xs font-medium py-2 rounded-lg hover:bg-destructive/20 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {mockApprovalQueue.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-4">Tidak ada antrean persetujuan.</p>
                )}
              </div>
            </PageCard>
          )}

          {/* Histori Approval Quest */}
          <PageCard title="Histori Keputusan Quest" description="Riwayat persetujuan atau penolakan quest">
            <div className="space-y-4">
              {mockHistoriApproval.map((h) => (
                <div key={h.id} className="p-3.5 rounded-xl border border-border bg-card shadow-sm space-y-2 hover:border-primary/30 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-sm text-foreground">{h.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Target: {h.target}</p>
                    </div>
                    <StatusBadge status={h.status} variant={h.status === 'approved' ? 'success' : 'error'} />
                  </div>

                  {h.status === 'rejected' && h.rejectionReason && (
                    <div className="bg-destructive/10 p-2.5 rounded-lg border border-destructive/20">
                      <p className="text-[11px] text-destructive font-medium">Alasan: {h.rejectionReason}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                    <span>Oleh: {h.approvedBy}</span>
                    <span>{h.approvedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </PageCard>

        </div>
      </div>

      {/* Modal Buat Quest */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-lg rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
              <h3 className="font-bold text-lg">Buat Quest Baru</h3>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground transition-colors bg-background p-1 rounded-md border border-border">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto max-h-[75vh]">
              {!isGlobalManager && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-400 text-xs rounded-lg flex items-start gap-2.5">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">Quest yang Anda buat akan masuk ke status <strong>Pending Approval</strong> dan menunggu persetujuan dari Kepala Kesiswaan sebelum otomatis aktif.</p>
                </div>
              )}
              {isGlobalManager && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs rounded-lg flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">Sebagai pengelola, Quest yang Anda buat akan langsung berstatus <strong>Active</strong> dan dapat dikerjakan oleh santri.</p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Judul Quest</label>
                <input type="text" className="w-full text-sm border border-border rounded-lg px-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Contoh: Menjadi Imam Sholat Subuh" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Deskripsi Tugas</label>
                <textarea rows={3} className="w-full text-sm border border-border rounded-lg px-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Jelaskan detail tugas yang harus dilakukan..."></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Reward Poin</label>
                  <input type="number" className="w-full text-sm border border-border rounded-lg px-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="+10" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Deadline</label>
                  <input type="date" className="w-full text-sm border border-border rounded-lg px-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Target Distribusi</label>
                <select className="w-full text-sm border border-border rounded-lg px-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="global">Global (Semua Santri)</option>
                  <option value="asrama">Asrama Tertentu</option>
                  <option value="kelas">Kelas Tertentu</option>
                  <option value="santri">Santri Tertentu (Individual)</option>
                </select>
              </div>
            </div>

            <div className="p-4 border-t border-border bg-muted/30 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-background border border-border rounded-lg transition-colors">
                Batal
              </button>
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-bold text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-sm">
                Submit Quest
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
