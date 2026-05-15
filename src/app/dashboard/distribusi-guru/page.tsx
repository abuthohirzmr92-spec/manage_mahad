'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingState } from '@/components/shared/loading-state';
import { DistribusiMatrix } from '@/components/distribusi/DistribusiMatrix';
import { useCollection } from '@/hooks';
import { teacherAssignmentService } from '@/lib/firebase/services';
import { getJenjangByInstansi } from '@/lib/academic-structure';
import type { Instansi, MasterJenjang, MasterTingkat } from '@/types';
import { INSTANSI_ORDER, INSTANSI_LABEL } from '@/types';
import type { Subject } from '@/data/mock-mapel';
import type { Kelas } from '@/data/mock-kelas/types';
import type { TeacherAssignment } from '@/types';
import { getTingkatLabel, buildTingkatLabelMap } from '@/lib/progression-label';
import { cn } from '@/lib/utils';

// ── Guru name bank ─────────────────────────────────────────────────────────
const GURU_NAMES = [
  'Ust. Ahmad Zain', 'Ust. Budi Santoso', 'Ust. Ali Riza', 'Ust. Hamzah',
  'Ust. Fikri', 'Ust. Rahman', 'Ust. Zaid', 'Ust. Karim', 'Ust. Abdul',
  'Ust. Hakim', 'Ust. Malik', 'Ust. Hasan', 'Ust. Yahya', 'Ust. Faiz',
  'Ust. Furqon', 'Ust. Yusuf', 'Ust. Ibrahim', 'Ust. Naufal', 'Ust. Syekh',
  'Ustdz. Aisyah', 'Ustdz. Fatimah', 'Ustdz. Maryam', 'Ustdz. Khadijah',
];

export default function DistribusiGuruPage() {
  const searchParams = useSearchParams();

  // ── Data ────────────────────────────────────────────────────────────────
  const { data: allMapel, loading: mapelLoading } = useCollection<Subject>('mapel', [], { realtime: true });
  const { data: allKelas, loading: kelasLoading } = useCollection<Kelas>('kelas');
  const { data: allAssignments } = useCollection<TeacherAssignment>('teacherAssignments');
  const { data: jenjangList, loading: jenjangLoading } = useCollection<MasterJenjang>('masterJenjang');
  const { data: tingkatList } = useCollection<MasterTingkat>('masterTingkat');

  const loading = mapelLoading || kelasLoading || jenjangLoading;

  const tingkatLabelMap = useMemo(() => buildTingkatLabelMap(tingkatList), [tingkatList]);

  // ── Progression selector state (init from URL params) ───────────────────
  const urlInstansi = (searchParams.get('instansi') as Instansi | null);
  const [activeInstansi, setActiveInstansi] = useState<Instansi>(
    urlInstansi && INSTANSI_ORDER.includes(urlInstansi) ? urlInstansi : 'madin',
  );
  const [selectedJenjang, setSelectedJenjang] = useState<string>(searchParams.get('jenjang') ?? '');
  const [selectedTingkat, setSelectedTingkat] = useState<number | null>(
    (() => { const t = searchParams.get('tingkat'); return t ? Number(t) : null; })(),
  );

  // ── Data-driven jenjang for current instansi ────────────────────────────
  const availableJenjang = useMemo(() => {
    const instansiJenjang = getJenjangByInstansi(jenjangList, activeInstansi);
    const mapelJenjang = new Set(allMapel.map((m) => m.jenjang));
    const kelasJenjang = new Set(allKelas.map((k) => k.jenjang));
    return instansiJenjang.filter((j) => mapelJenjang.has(j) && kelasJenjang.has(j));
  }, [activeInstansi, jenjangList, allMapel, allKelas]);

  // Auto-select first jenjang when instansi changes or current jenjang becomes invalid
  useEffect(() => {
    if (!availableJenjang.includes(selectedJenjang)) {
      setSelectedJenjang(availableJenjang[0] ?? '');
      setSelectedTingkat(null);
    }
  }, [availableJenjang, selectedJenjang]);

  // ── Derived: available tingkat for selected jenjang ─────────────────────
  const availableTingkat = useMemo(() => {
    if (!selectedJenjang) return [];
    const mapelTingkat = new Set(
      allMapel.filter((m) => m.jenjang === selectedJenjang).map((m) => m.tingkat),
    );
    const kelasTingkat = new Set(
      allKelas.filter((k) => k.jenjang === selectedJenjang).map((k) => k.tingkat),
    );
    return [...mapelTingkat]
      .filter((t) => kelasTingkat.has(t))
      .sort((a, b) => a - b);
  }, [selectedJenjang, allMapel, allKelas]);

  useEffect(() => {
    if (selectedTingkat !== null && !availableTingkat.includes(selectedTingkat)) {
      setSelectedTingkat(null);
    }
  }, [availableTingkat, selectedTingkat]);

  // ── Filtered data for the selected progression ──────────────────────────
  const filteredMapel = useMemo(() => {
    if (!selectedJenjang || selectedTingkat === null) return [];
    return allMapel.filter(
      (m) => m.jenjang === selectedJenjang && m.tingkat === selectedTingkat,
    );
  }, [allMapel, selectedJenjang, selectedTingkat]);

  const filteredKelas = useMemo(() => {
    if (!selectedJenjang || selectedTingkat === null) return [];
    return allKelas.filter(
      (k) => k.jenjang === selectedJenjang && k.tingkat === selectedTingkat,
    );
  }, [allKelas, selectedJenjang, selectedTingkat]);

  // ── Filtered assignments for the current selection ──────────────────────
  const relevantAssignments = useMemo(() => {
    if (!selectedJenjang || selectedTingkat === null) return [];
    const mapelIds = new Set(filteredMapel.map((m) => m.id));
    const kelasNames = new Set(filteredKelas.map((k) => k.name));
    return allAssignments.filter(
      (a) => mapelIds.has(a.mapelId) && kelasNames.has(a.kelasName),
    );
  }, [allAssignments, filteredMapel, filteredKelas]);

  // ── Save handler ───────────────────────────────────────────────────────
  const handleSave = useCallback(
    async (ops: Array<{ mapelId: string; kelasId: string; kelasName: string; guruName: string }>) => {
      const existingMap = new Map(
        relevantAssignments.map((a) => [`${a.mapelId}::${a.kelasName}`, a]),
      );

      for (const op of ops) {
        const key = `${op.mapelId}::${op.kelasName}`;
        const existing = existingMap.get(key);

        if (op.guruName === '') {
          if (existing) await teacherAssignmentService.delete(existing.id);
        } else if (existing) {
          if (existing.guruName !== op.guruName) {
            await teacherAssignmentService.update(existing.id, { guruName: op.guruName });
          }
        } else {
          await teacherAssignmentService.create({
            mapelId: op.mapelId,
            kelasId: op.kelasId,
            kelasName: op.kelasName,
            guruName: op.guruName,
            status: 'active',
          });
        }
      }
    },
    [relevantAssignments],
  );

  if (loading) return <LoadingState type="table" count={6} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Distribusi Guru"
        description="Atur pengampu setiap rombel untuk seluruh mapel berdasarkan progression context"
      />

      {/* Progression Selector */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
        {/* Instansi */}
        <div>
          <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
            Instansi
          </h4>
          <div className="flex gap-2 flex-wrap">
            {INSTANSI_ORDER.map((instansi) => (
              <button
                key={instansi}
                type="button"
                onClick={() => setActiveInstansi(instansi)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all border',
                  activeInstansi === instansi
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-background text-muted-foreground border-border hover:border-muted-foreground/30 hover:text-foreground',
                )}
              >
                {INSTANSI_LABEL[instansi]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Jenjang */}
          <div>
            <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
              Jenjang
            </h4>
            <div className="flex gap-2 flex-wrap">
              {availableJenjang.map((j) => (
                <button
                  key={j}
                  type="button"
                  onClick={() => { setSelectedJenjang(j); setSelectedTingkat(null); }}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all border',
                    selectedJenjang === j
                      ? 'bg-foreground text-background border-foreground shadow-sm'
                      : 'bg-background text-muted-foreground border-border hover:border-muted-foreground/30 hover:text-foreground',
                  )}
                >
                  {j}
                </button>
              ))}
              {availableJenjang.length === 0 && (
                <span className="text-xs text-muted-foreground py-2">Tidak ada jenjang tersedia.</span>
              )}
            </div>
          </div>

          {/* Tingkat */}
          <div>
            <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
              Tingkat
            </h4>
            <div className="flex gap-2 flex-wrap">
              {availableTingkat.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedTingkat(t)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all border',
                    selectedTingkat === t
                      ? 'bg-foreground text-background border-foreground shadow-sm'
                      : 'bg-background text-muted-foreground border-border hover:border-muted-foreground/30 hover:text-foreground',
                  )}
                >
                  {tingkatLabelMap.get(t) ?? getTingkatLabel(selectedJenjang, t)}
                </button>
              ))}
              {selectedJenjang && availableTingkat.length === 0 && (
                <span className="text-xs text-muted-foreground py-2">
                  Tidak ada tingkat dengan mapel dan kelas lengkap.
                </span>
              )}
              {!selectedJenjang && (
                <span className="text-xs text-muted-foreground py-2">Pilih jenjang terlebih dahulu.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Matrix */}
      {selectedJenjang && selectedTingkat !== null && (
        <div className="bg-card border border-border rounded-xl shadow-sm">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">
              Distribusi Guru — {selectedJenjang} / {tingkatLabelMap.get(selectedTingkat) ?? getTingkatLabel(selectedJenjang, selectedTingkat)}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Atur pengampu setiap rombel untuk seluruh mapel pada tingkat ini.
            </p>
          </div>
          <div className="p-5">
            <DistribusiMatrix
              mapelList={filteredMapel}
              kelasList={filteredKelas}
              existingAssignments={relevantAssignments}
              guruNameList={GURU_NAMES}
              onSave={handleSave}
            />
          </div>
        </div>
      )}

      {/* Empty prompt */}
      {(!selectedJenjang || selectedTingkat === null) && (
        <div className="text-center py-16 border border-dashed border-border rounded-xl bg-card/50">
          <div className="text-4xl mb-3 opacity-20 select-none">—</div>
          <p className="text-sm text-muted-foreground">
            Pilih jenjang dan tingkat untuk memulai distribusi guru.
          </p>
        </div>
      )}
    </div>
  );
}
