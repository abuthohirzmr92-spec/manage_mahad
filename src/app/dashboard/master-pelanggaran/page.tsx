'use client';

import { useState, useCallback } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { StatsCard } from '@/components/shared/stats-card';
import { LoadingState } from '@/components/shared/loading-state';
import { ErrorState } from '@/components/shared/error-state';
import { useCollection } from '@/hooks';
import { masterPelanggaranService, tolerancePolicyService, masterHukumanService } from '@/lib/firebase/services';
import { BookOpen, AlertTriangle, Calculator, FileText, Plus, ShieldCheck, Gavel } from 'lucide-react';
import type { MasterPelanggaran, PelanggaranSeverity, GlobalTolerancePolicy, JenjangToleranceOverride, SeverityLimits, MasterHukuman } from '@/types';

// Components
import { PelanggaranTable } from '@/components/master-pelanggaran/PelanggaranTable';
import { AturanPoinTab } from '@/components/master-pelanggaran/AturanPoinTab';
import { MasterHukumanTab } from '@/components/master-pelanggaran/MasterHukumanTab';
import {
  AddPelanggaranModal,
  EditPelanggaranModal,
  DeletePelanggaranDialog,
} from '@/components/master-pelanggaran/PelanggaranModals';

type TabId = 'master' | 'aturan' | 'hukuman';

export default function MasterPelanggaranPage() {
  const [activeTab, setActiveTab] = useState<TabId>('master');

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: masterData, loading, error } = useCollection<MasterPelanggaran>('masterPelanggaran', [], { realtime: true });
  const { data: masterHukumanList = [] } = useCollection<MasterHukuman>('masterHukuman');

  // Policy state — loaded from service
  const [globalPolicy, setGlobalPolicy] = useState<GlobalTolerancePolicy>({
    id: 'global',
    type: 'global',
    isActive: true,
    limits: { ringan: 3, sedang: 2, berat: 1, sangat_berat: 0 },
  });
  const [overrides, setOverrides] = useState<JenjangToleranceOverride[]>([]);
  const [policyReady, setPolicyReady] = useState(false);

  // Load policies on mount
  useState(() => {
    tolerancePolicyService.getGlobal().then((gp) => {
      if (gp) setGlobalPolicy(gp);
      setPolicyReady(true);
    });
    tolerancePolicyService.listOverrides().then((ovs) => {
      setOverrides(ovs);
    });
  });

  // ── Modals state ──────────────────────────────────────────────────────────
  const [showAdd, setShowAdd] = useState(false);
  const [editData, setEditData] = useState<MasterPelanggaran | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalPoints = masterData.reduce((acc, p) => acc + p.points, 0);
  const HEAVY_SEVERITIES: PelanggaranSeverity[] = ['berat', 'sangat_berat'];
  const totalBerat = masterData.filter((p) => HEAVY_SEVERITIES.includes(p.severity)).length;

  // ── Handlers: Master Pelanggaran CRUD ─────────────────────────────────────
  const handleSave = async (newData: Partial<MasterPelanggaran>) => {
    if (editData) {
      await masterPelanggaranService.update(editData.id, newData);
      setEditData(null);
    } else {
      await masterPelanggaranService.create(newData as any);
      setShowAdd(false);
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      await masterPelanggaranService.delete(deleteId);
      setDeleteId(null);
    }
  };

  // ── Handlers: Tolerance Policy ────────────────────────────────────────────
  const handleUpdateGlobal = useCallback(async (data: { isActive: boolean; limits: SeverityLimits }) => {
    setGlobalPolicy((prev) => ({ ...prev, ...data }));
    await tolerancePolicyService.saveGlobal(data);
  }, []);

  const handleCreateOverride = useCallback(async (data: { jenjang: string; isActive: boolean; limits: SeverityLimits }) => {
    const id = await tolerancePolicyService.createOverride(data);
    setOverrides((prev) => [...prev, { id, type: 'jenjang', ...data }]);
  }, []);

  const handleUpdateOverride = useCallback(async (id: string, data: Partial<JenjangToleranceOverride>) => {
    setOverrides((prev) => prev.map((o) => (o.id === id ? { ...o, ...data } : o)));
    await tolerancePolicyService.updateOverride(id, data);
  }, []);

  const handleDeleteOverride = useCallback(async (id: string) => {
    setOverrides((prev) => prev.filter((o) => o.id !== id));
    await tolerancePolicyService.deleteOverride(id);
  }, []);

  // ── Handlers: Master Hukuman CRUD ─────────────────────────────────────────
  const handleCreateHukuman = useCallback(async (data: Partial<MasterHukuman>) => {
    await masterHukumanService.create(data as any);
  }, []);

  const handleUpdateHukuman = useCallback(async (id: string, data: Partial<MasterHukuman>) => {
    await masterHukumanService.update(id, data);
  }, []);

  const handleDeleteHukuman = useCallback(async (id: string) => {
    await masterHukumanService.delete(id);
  }, []);

  if (loading || !policyReady) return <LoadingState type="table" count={5} />;
  if (error) return <ErrorState message="Gagal memuat data master pelanggaran." onRetry={() => window.location.reload()} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Master Pelanggaran"
        description="Kelola daftar referensi, aturan poin, dan kebijakan toleransi pelanggaran santri"
        action={
          activeTab === 'master' ? (
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm active:scale-95"
            >
              <Plus aria-hidden="true" className="w-4 h-4" />
              Tambah Pelanggaran
            </button>
          ) : null
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Referensi" value={masterData.length} icon={BookOpen} />
        <StatsCard title="Aturan Aktif" value={masterData.length} icon={FileText} iconClassName="bg-emerald-500/10" />
        <StatsCard title="Pelanggaran Berat" value={totalBerat} icon={AlertTriangle} iconClassName="bg-rose-500/10" />
        <StatsCard title="Total Nilai Referensi" value={totalPoints} icon={Calculator} iconClassName="bg-blue-500/10" description="Akumulasi bobot seluruh pelanggaran" />
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-6">
          <button
            type="button"
            onClick={() => setActiveTab('master')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'master'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            <div className="flex items-center gap-2">
              <BookOpen aria-hidden="true" className="w-4 h-4" />
              Master Pelanggaran
            </div>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('aturan')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'aturan'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck aria-hidden="true" className="w-4 h-4" />
              Aturan Poin & Toleransi
            </div>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('hukuman')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'hukuman'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            <div className="flex items-center gap-2">
              <Gavel aria-hidden="true" className="w-4 h-4" />
              Master Hukuman
            </div>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'hukuman' ? (
        <MasterHukumanTab
          data={masterHukumanList}
          onCreate={handleCreateHukuman}
          onUpdate={handleUpdateHukuman}
          onDelete={handleDeleteHukuman}
        />
      ) : (
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          {activeTab === 'master' ? (
            masterData.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <AlertTriangle aria-hidden="true" className="w-8 h-8 opacity-20" />
                  <p className="text-sm">Belum ada data referensi pelanggaran.</p>
                  <p className="text-xs text-muted-foreground/70">Tambahkan pelanggaran baru menggunakan tombol di atas.</p>
                </div>
              </div>
            ) : (
              <PelanggaranTable data={masterData} onEdit={setEditData} onDelete={setDeleteId} />
            )
          ) : (
            <AturanPoinTab
              masterData={masterData}
              globalPolicy={globalPolicy}
              overrides={overrides}
              onUpdateGlobal={handleUpdateGlobal}
              onCreateOverride={handleCreateOverride}
              onUpdateOverride={handleUpdateOverride}
              onDeleteOverride={handleDeleteOverride}
            />
          )}
        </div>
      )}

      {/* Modals */}
      {showAdd && <AddPelanggaranModal onClose={() => setShowAdd(false)} onSave={handleSave} />}
      {editData && <EditPelanggaranModal initialData={editData} onClose={() => setEditData(null)} onSave={handleSave} />}
      {deleteId && <DeletePelanggaranDialog onClose={() => setDeleteId(null)} onConfirm={handleDelete} />}
    </div>
  );
}
