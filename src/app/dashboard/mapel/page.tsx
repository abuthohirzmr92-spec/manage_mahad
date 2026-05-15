'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, PageCard } from '@/components/shared/page-header';
import { LoadingState } from '@/components/shared/loading-state';
import { ErrorState } from '@/components/shared/error-state';
import { MapelTabs } from '@/components/mapel/MapelTabs';
import { MapelToolbar } from '@/components/mapel/MapelToolbar';
import { MapelClusterSection } from '@/components/mapel/MapelClusterSection';
import { MapelGridView } from '@/components/mapel/MapelGridView';
import { MapelListView } from '@/components/mapel/MapelListView';
import { AddMapelModal, EditMapelModal, DeleteMapelModal } from '@/components/mapel/MapelModal';
import { useCollection } from '@/hooks';
import { mapelService } from '@/lib/firebase/services';
import { getJenjangByInstansi, jenjangToInstansi } from '@/lib/academic-structure';
import type { Instansi, MasterJenjang, MasterTingkat } from '@/types';
import { INSTANSI_ORDER } from '@/types';
import type { Subject } from '@/data/mock-mapel';
import type { TeacherAssignment } from '@/types';

// ── Kelas lookup by tingkat ──────────────────────────────────────────────
import { mockKelasFormal, mockKelasDiniyah, mockKelasQuran } from '@/data/mock-kelas';
const allClassData = [...mockKelasFormal, ...mockKelasDiniyah, ...mockKelasQuran];
const kelasByTingkat: Record<string, { tingkat: number; name: string }[]> = {};
for (const k of allClassData) {
  const key = String(k.tingkat);
  (kelasByTingkat[key] ??= []).push(k);
}

export default function MataPelajaranPage() {
  const router = useRouter();

  // ── Data ──────────────────────────────────────────────────────────────
  const { data: allMapel, loading: mapelLoading, error: mapelError } = useCollection<Subject>('mapel', [], { realtime: true });
  const { data: assignments } = useCollection<TeacherAssignment>('teacherAssignments');
  const { data: jenjangList, loading: jenjangLoading, error: jenjangError } = useCollection<MasterJenjang>('masterJenjang');
  const { data: tingkatList } = useCollection<MasterTingkat>('masterTingkat');

  const loading = mapelLoading || jenjangLoading;
  const error = mapelError || jenjangError;

  // ── Instansi tab ──────────────────────────────────────────────────────
  const [activeInstansi, setActiveInstansi] = useState<Instansi>('madin');

  // ── View state ────────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // ── Data-driven jenjang order ─────────────────────────────────────────
  const instansiJenjang = useMemo(
    () => getJenjangByInstansi(jenjangList, activeInstansi),
    [jenjangList, activeInstansi],
  );

  // ── Client-side instansi filter ───────────────────────────────────────
  const mapelByInstansi = useMemo(
    () => allMapel.filter((s) => {
      const inst = jenjangToInstansi(jenjangList, s.jenjang);
      return inst === activeInstansi;
    }),
    [allMapel, activeInstansi, jenjangList],
  );

  // ── Derived: teacher summary per mapel ─────────────────────────────────
  const teacherSummaryMap = useMemo(() => {
    const map: Record<string, string> = {};
    const activeByMapel: Record<string, string[]> = {};
    for (const a of assignments) {
      if (a.status !== 'active') continue;
      (activeByMapel[a.mapelId] ??= []).push(a.guruName);
    }
    for (const [mapelId, names] of Object.entries(activeByMapel)) {
      const unique = [...new Set(names)];
      if (unique.length === 1) {
        map[mapelId] = unique[0];
      } else {
        map[mapelId] = `${unique.length} Guru Pengampu`;
      }
    }
    return map;
  }, [assignments]);

  // ── Drag & Drop ───────────────────────────────────────────────────────
  const [draggedSubject, setDraggedSubject] = useState<string | null>(null);
  const [localOrder, setLocalOrder] = useState<Record<string, number>>({});

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedSubject(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedSubject || draggedSubject === targetId) return;
    const ids = mapelByInstansi.map((s) => s.id);
    const draggedIndex = ids.indexOf(draggedSubject);
    const targetIndex = ids.indexOf(targetId);
    if (draggedIndex === -1 || targetIndex === -1) return;
    const newIds = [...ids];
    const [removed] = newIds.splice(draggedIndex, 1);
    newIds.splice(targetIndex, 0, removed);
    const newOrder: Record<string, number> = {};
    newIds.forEach((id, idx) => { newOrder[id] = idx; });
    setLocalOrder(newOrder);
    setDraggedSubject(null);
  };

  // ── Create modal ──────────────────────────────────────────────────────
  const [showCreate, setShowCreate] = useState(false);

  const handleCreate = useCallback(async (data: Omit<Subject, 'id'>) => {
    await mapelService.create({
      name: data.name,
      code: data.code,
      jenjang: data.jenjang,
      tingkat: data.tingkat,
      status: data.status,
    });
    setShowCreate(false);
  }, []);

  // ── Edit modal ────────────────────────────────────────────────────────
  const [editTarget, setEditTarget] = useState<Subject | null>(null);

  const handleEditRequest = useCallback((subject: Subject) => {
    setEditTarget(subject);
  }, []);

  const handleEditSave = useCallback(async (updated: Subject) => {
    await mapelService.update(updated.id, {
      name: updated.name,
      code: updated.code,
      jenjang: updated.jenjang,
      tingkat: updated.tingkat,
      status: updated.status,
    });
    setEditTarget(null);
  }, []);

  // ── Delete modal ──────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null);

  const handleDeleteRequest = useCallback((subject: Subject) => {
    setDeleteTarget(subject);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    await mapelService.delete(deleteTarget.id);
    setDeleteTarget(null);
  }, [deleteTarget]);

  // ── Navigate to distribusi guru ───────────────────────────────────────
  const handleAssignNavigate = useCallback((subject: Subject) => {
    const inst = jenjangToInstansi(jenjangList, subject.jenjang);
    router.push(`/dashboard/distribusi-guru?instansi=${inst ?? activeInstansi}&jenjang=${encodeURIComponent(subject.jenjang)}&tingkat=${subject.tingkat}`);
  }, [router, activeInstansi, jenjangList]);

  // ── Grouped data: jenjang → tingkat → subjects ─────────────────────────
  const groupedData = useMemo(() => {
    let data = [...mapelByInstansi];
    if (Object.keys(localOrder).length > 0) {
      data.sort((a, b) => (localOrder[a.id] ?? 0) - (localOrder[b.id] ?? 0));
    }

    const result: { tingkat: number; jenjang: string; classNames: string; subjects: Subject[] }[] = [];

    for (const jenjang of instansiJenjang) {
      const byJenjang = data.filter((s) => s.jenjang === jenjang);
      const tingkatSet = [...new Set(byJenjang.map((s) => s.tingkat))].sort((a, b) => a - b);
      for (const tingkat of tingkatSet) {
        const subjects = byJenjang.filter((s) => s.tingkat === tingkat);
        const classNames = (kelasByTingkat[String(tingkat)] ?? [])
          .map((c) => c.name)
          .join('; ');
        result.push({ tingkat, jenjang, classNames, subjects });
      }
    }
    return result.filter((g) => g.subjects.length > 0);
  }, [mapelByInstansi, instansiJenjang, localOrder]);

  if (loading) return <LoadingState type="card" count={6} />;
  if (error) return <ErrorState message="Gagal memuat data mata pelajaran." onRetry={() => window.location.reload()} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Mata Pelajaran"
        description="Pusat kurikulum dan distribusi mata pelajaran lintas instansi"
        action={<MapelToolbar viewMode={viewMode} onViewModeChange={setViewMode} onCreate={() => setShowCreate(true)} />}
      />

      <MapelTabs activeInstansi={activeInstansi} onTabChange={setActiveInstansi} />

      <PageCard title="Daftar Mata Pelajaran">
        <div className="space-y-12 py-2">
          {groupedData.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Belum ada data mata pelajaran untuk instansi ini.
            </div>
          )}

          {groupedData.map((group, index) => (
            <div
              key={`${group.jenjang}-${group.tingkat}`}
              className="animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
            >
              <MapelClusterSection
                tingkat={group.tingkat}
                jenjang={group.jenjang}
                classNames={group.classNames}
                distribusiHref={`/dashboard/distribusi-guru?instansi=${activeInstansi}&jenjang=${encodeURIComponent(group.jenjang)}&tingkat=${group.tingkat}`}
              >
                {viewMode === 'grid' ? (
                  <MapelGridView
                    subjects={group.subjects}
                    teacherSummaryMap={teacherSummaryMap}
                    onAssign={handleAssignNavigate}
                    onEdit={handleEditRequest}
                    onDelete={handleDeleteRequest}
                  />
                ) : (
                  <MapelListView
                    subjects={group.subjects}
                    teacherSummaryMap={teacherSummaryMap}
                    draggedSubject={draggedSubject}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onAssign={handleAssignNavigate}
                    onEdit={handleEditRequest}
                    onDelete={handleDeleteRequest}
                  />
                )}
              </MapelClusterSection>
            </div>
          ))}
        </div>
      </PageCard>

      {/* Modals */}
      <AddMapelModal
        open={showCreate}
        activeInstansi={activeInstansi}
        jenjangOptions={instansiJenjang}
        onClose={() => setShowCreate(false)}
        onSave={handleCreate}
      />
      <EditMapelModal
        open={editTarget !== null}
        subject={editTarget}
        jenjangOptions={instansiJenjang}
        onClose={() => setEditTarget(null)}
        onSave={handleEditSave}
      />
      <DeleteMapelModal
        open={deleteTarget !== null}
        subject={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
