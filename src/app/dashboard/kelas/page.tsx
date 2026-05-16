'use client';

import { useCallback, useState, useMemo } from 'react';
import type { FormEvent } from 'react';
import { PageHeader, PageCard } from '@/components/shared/page-header';
import { LoadingState } from '@/components/shared/loading-state';
import { ErrorState } from '@/components/shared/error-state';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useCollection } from '@/hooks';
import { kelasService } from '@/lib/firebase/services';
import { getJenjangByInstansi } from '@/lib/academic-structure';
import type { Instansi, MasterJenjang, MasterTingkat } from '@/types';
import { INSTANSI_ORDER, INSTANSI_LABEL } from '@/types';

import type { Kelas, JenjangGroup } from '@/types/academic';

import { KelasTabs } from '@/components/kelas/KelasTabs';
import { KelasClusterSection } from '@/components/kelas/KelasClusterSection';
import { UnassignedAlert } from '@/components/kelas/UnassignedAlert';
import { AddKelasModal, NewClassData } from '@/components/kelas/AddKelasModal';
import { AssignSantriModal } from '@/components/kelas/AssignSantriModal';
import { EditKelasModal, DeleteKelasModal } from '@/components/kelas/KelasModal';

// ── Derive two-level grouping: Jenjang → Tingkat → Classes ───────────────────
function buildJenjangGroups(data: Kelas[], orderedJenjang: string[]): JenjangGroup[] {
  return orderedJenjang
    .map(jenjang => {
      const jenjangData = data.filter(k => k.jenjang === jenjang);
      const tingkatGroups = [...new Set(jenjangData.map(k => k.tingkat))]
        .sort((a, b) => a - b)
        .map(tingkat => ({
          tingkat,
          classes: jenjangData.filter(k => k.tingkat === tingkat),
        }))
        .filter(g => g.classes.length > 0);
      return { jenjang, tingkatGroups };
    })
    .filter(g => g.tingkatGroups.length > 0);
}

export default function MasterKelasPage() {
  // ── Firebase data ─────────────────────────────────────────────────────────
  const { data: allKelas, loading: kelasLoading, error: kelasError } = useCollection<Kelas>('kelas', [], { realtime: true });
  const { data: jenjangList, loading: jenjangLoading, error: jenjangError } = useCollection<MasterJenjang>('masterJenjang');
  const { data: tingkatList } = useCollection<MasterTingkat>('masterTingkat');

  const loading = kelasLoading || jenjangLoading;
  const error = kelasError || jenjangError;

  // ── Instansi tab (replaces AcademicTab) ───────────────────────────────────
  const [activeInstansi, setActiveInstansi] = useState<Instansi>('madin');

  // ── Data-driven jenjang order ─────────────────────────────────────────────
  const instansiJenjang = useMemo(
    () => getJenjangByInstansi(jenjangList, activeInstansi),
    [jenjangList, activeInstansi],
  );

  // ── Filter by instansi using data-driven jenjang list ─────────────────────
  const activeData = allKelas.filter((k) => instansiJenjang.includes(k.jenjang));

  // ── Add modal ─────────────────────────────────────────────────────────────
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newClassData, setNewClassData] = useState<NewClassData>({
    name: '', jenjang: '', tingkat: '', waliKelas: '',
  });

  // ── Assign modal ──────────────────────────────────────────────────────────
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // ── Centralized interaction state ─────────────────────────────────────────
  const [selectedKelas, setSelectedKelas] = useState<Kelas | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleEdit = useCallback((kelas: Kelas) => {
    setSelectedKelas(kelas);
    setIsEditModalOpen(true);
  }, []);

  const handleDelete = useCallback((kelas: Kelas) => {
    setSelectedKelas(kelas);
    setIsDeleteModalOpen(true);
  }, []);

  const handleSaveEdit = useCallback(async (updated: Kelas) => {
    await kelasService.update(updated.id, {
      name: updated.name,
      jenjang: updated.jenjang,
      tingkat: updated.tingkat,
      waliKelas: updated.waliKelas,
      status: updated.status,
    });
    setIsEditModalOpen(false);
    setSelectedKelas(null);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedKelas) return;
    await kelasService.delete(selectedKelas.id);
    setIsDeleteModalOpen(false);
    setSelectedKelas(null);
  }, [selectedKelas]);

  const handleAddClass = async (e: FormEvent) => {
    e.preventDefault();

    await kelasService.create({
      name: newClassData.name,
      jenjang: newClassData.jenjang || instansiJenjang[0],
      tingkat: parseInt(newClassData.tingkat) || 1,
      waliKelas: newClassData.waliKelas || 'Belum Diatur',
      studentCount: 0,
      status: 'aktif',
      academicTab: activeInstansi,
    });

    setIsAddModalOpen(false);
    setNewClassData({ name: '', jenjang: '', tingkat: '', waliKelas: '' });
  };

  // ── Derived data ──────────────────────────────────────────────────────────
  const jenjangGroups: JenjangGroup[] = buildJenjangGroups(activeData, instansiJenjang);

  const assignedCount   = activeData.reduce((sum, cls) => sum + cls.studentCount, 0);
  const totalSantri     = assignedCount;
  const unassignedCount = 0;

  if (loading) return <LoadingState type="card" count={6} />;
  if (error) return <ErrorState message="Gagal memuat data kelas." onRetry={() => window.location.reload()} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Master Kelas"
        description="Kelola pengelompokan kelas, plotting wali kelas, dan kuota santri"
        action={
          <Button className="gap-2" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4" /> Buat Kelas Baru
          </Button>
        }
      />

      <KelasTabs activeInstansi={activeInstansi} setActiveInstansi={setActiveInstansi} />

      <UnassignedAlert
        unassignedCount={unassignedCount}
        assignedCount={assignedCount}
        totalSantri={totalSantri}
        activeInstansi={activeInstansi}
        onAssignClick={() => setIsAssignModalOpen(true)}
      />

      <PageCard title="Daftar Kelas">
        <div className="space-y-2 py-2">
          <KelasClusterSection
            jenjangGroups={jenjangGroups}
            activeInstansi={activeInstansi}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </PageCard>

      {/* ── Modals ── */}
      <AddKelasModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        activeInstansi={activeInstansi}
        jenjangOptions={instansiJenjang}
        newClassData={newClassData}
        setNewClassData={setNewClassData}
        onSubmit={handleAddClass}
      />

      <AssignSantriModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        activeInstansi={activeInstansi}
        unassignedCount={unassignedCount}
        groupedData={jenjangGroups.flatMap(jg => jg.tingkatGroups)}
      />

      <EditKelasModal
        open={isEditModalOpen}
        kelas={selectedKelas}
        activeInstansi={activeInstansi}
        jenjangOptions={instansiJenjang}
        onClose={() => { setIsEditModalOpen(false); setSelectedKelas(null); }}
        onSave={handleSaveEdit}
      />

      <DeleteKelasModal
        open={isDeleteModalOpen}
        kelas={selectedKelas}
        onClose={() => { setIsDeleteModalOpen(false); setSelectedKelas(null); }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
