'use client';

import { useState, useMemo } from 'react';
import { PageHeader, PageCard } from '@/components/shared/page-header';
import { LoadingState } from '@/components/shared/loading-state';
import { ErrorState } from '@/components/shared/error-state';
import { StatsCard } from '@/components/shared/stats-card';
import { KamarCard } from '@/components/asrama/KamarCard';
import { KamarDetailPanel } from '@/components/asrama/KamarDetailPanel';
import { TempatkanModal } from '@/components/asrama/TempatkanModal';
import { TarikSantriModal } from '@/components/asrama/TarikSantriModal';
import { useCollection } from '@/hooks';
import { santriService } from '@/lib/firebase/services';
import type { Asrama, Kamar, Santri } from '@/types';
import {
  Building2, Users, CheckCircle2, XCircle,
  ChevronRight, ChevronLeft, BedDouble, UserX,
} from 'lucide-react';

const getInitials = (name: string) =>
  name.split(' ').map((n) => n[0]).slice(0, 2).join('');

function pointBadge(pts: number) {
  if (pts > 40) return { label: 'Berat', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
  if (pts > 20) return { label: 'Perhatian', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' };
  return { label: 'Aman', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' };
}

// ---------------------------------------------------------------------------
// Asrama Card — step 1
// ---------------------------------------------------------------------------
interface AsramaCardProps {
  asrama: Asrama;
  totalKamar: number;
  totalPenghuni: number;
  isActive: boolean;
  onClick: () => void;
}

function AsramaCard({ asrama, totalKamar, totalPenghuni, isActive, onClick }: AsramaCardProps) {
  const pct = Math.round((asrama.filled / asrama.capacity) * 100);
  const barColor = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-xl border p-5 transition-all hover:shadow-md hover:border-primary/40 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50
        ${asrama.status === 'nonaktif' ? 'opacity-60' : ''}
        ${isActive ? 'border-primary/60 shadow-md ring-1 ring-primary/30' : 'border-border'}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Building2 aria-hidden="true" className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{asrama.name}</h3>
            <p className="text-xs text-muted-foreground">{asrama.musyrif}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${asrama.status === 'aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
            {asrama.status}
          </span>
          <span className="text-xs text-muted-foreground">{asrama.gender === 'L' ? '♂ Putra' : '♀ Putri'}</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{totalKamar} kamar · {totalPenghuni} penghuni</span>
          <span className="font-medium text-foreground">{asrama.filled}/{asrama.capacity}</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div className={`h-2 rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{pct}% terisi</p>
          <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 font-medium">
            Lihat kamar <ChevronRight aria-hidden="true" className="w-3 h-3" />
          </span>
        </div>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export default function AsramaPage() {
  // ── Firebase data ─────────────────────────────────────────────────────────
  const { data: asramaList, loading: asramaLoading, error: asramaError } = useCollection<Asrama>('asrama', [], { realtime: true });
  const { data: kamarList, loading: kamarLoading, error: kamarError } = useCollection<Kamar>('kamar', [], { realtime: true });
  const { data: santriList, loading: santriLoading, error: santriError } = useCollection<Santri>('santri', [], { realtime: true });

  const loading = asramaLoading || kamarLoading || santriLoading;
  const error = asramaError || kamarError || santriError;

  // ── UI state ──────────────────────────────────────────────────────────────
  const [selectedAsrama, setSelectedAsrama] = useState<Asrama | null>(null);
  const [selectedKamar, setSelectedKamar] = useState<Kamar | null>(null);
  const [tempatkanSantri, setTempatkanSantri] = useState<Santri | null>(null);
  const [showTarikModal, setShowTarikModal] = useState(false);

  // ── Derived data ─────────────────────────────────────────────────────────
  const penghuniMap = useMemo<Record<string, Santri[]>>(() => {
    const map: Record<string, Santri[]> = {};
    kamarList.forEach((k) => { map[k.id] = []; });
    santriList.forEach((s) => {
      if (s.kamarId && map[s.kamarId]) {
        map[s.kamarId].push(s);
      }
    });
    return map;
  }, [santriList, kamarList]);

  const belumTerplotting = santriList.filter((s) => !s.kamarId || !s.asramaId);

  const kamarPerAsrama = (asramaId: string) => kamarList.filter((k) => k.asramaId === asramaId);

  // ── Actions ───────────────────────────────────────────────────────────────
  async function handleKeluarkan(santriId: string) {
    await santriService.update(santriId, {
      kamar: '',
      asrama: '',
      kamarId: undefined as any,
      asramaId: undefined as any,
    });
  }

  async function handleKosongkan() {
    if (!selectedKamar) return;
    const kamarId = selectedKamar.id;
    const penghuni = penghuniMap[kamarId] ?? [];
    // Update all santri in this kamar concurrently
    await Promise.all(
      penghuni.map((s) =>
        santriService.update(s.id, {
          kamar: '',
          asrama: '',
          kamarId: undefined as any,
          asramaId: undefined as any,
        })
      )
    );
  }

  async function handleTempatkan(santriId: string, kamarId: string) {
    const targetKamar = kamarList.find((k) => k.id === kamarId);
    const targetAsrama = targetKamar ? asramaList.find((a) => a.id === targetKamar.asramaId) : undefined;
    if (!targetKamar || !targetAsrama) return;
    await santriService.update(santriId, {
      kamar: targetKamar.name,
      asrama: targetAsrama.name,
      kamarId: targetKamar.id,
      asramaId: targetAsrama.id,
    });
    setTempatkanSantri(null);
  }

  // ── Stats ─────────────────────────────────────────────────────────────────
  const aktif = asramaList.filter((a) => a.status === 'aktif');
  const nonaktif = asramaList.filter((a) => a.status === 'nonaktif');
  const totalKapasitas = asramaList.reduce((acc, a) => acc + a.capacity, 0);
  const totalTerisi = santriList.filter((s) => !!s.kamarId).length;

  const activeAsramaKamar = selectedAsrama ? kamarPerAsrama(selectedAsrama.id) : kamarList;

  if (loading) return <LoadingState type="card" count={6} />;
  if (error) return <ErrorState message="Gagal memuat data asrama." onRetry={() => window.location.reload()} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Asrama"
        description="Kelola data asrama, kamar, dan penempatan hunian pesantren"
        action={
          <button
            type="button"
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            + Tambah Asrama
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Asrama" value={asramaList.length} icon={Building2} />
        <StatsCard title="Asrama Aktif" value={aktif.length} icon={CheckCircle2} iconClassName="bg-emerald-500/10" />
        <StatsCard title="Non-Aktif" value={nonaktif.length} icon={XCircle} iconClassName="bg-red-500/10" />
        <StatsCard title="Total Hunian" value={`${totalTerisi}/${totalKapasitas}`} icon={Users} iconClassName="bg-blue-500/10" description="santri terisi" />
      </div>

      {/* ── STEP 1: Daftar Asrama ── */}
      {!selectedAsrama && (
        <PageCard title="Daftar Asrama" description="Klik asrama untuk melihat daftar kamar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {asramaList.map((asrama) => {
              const kamars = kamarPerAsrama(asrama.id);
              const penghuni = kamars.reduce((acc, k) => acc + (penghuniMap[k.id]?.length ?? 0), 0);
              return (
                <AsramaCard
                  key={asrama.id}
                  asrama={asrama}
                  totalKamar={kamars.length}
                  totalPenghuni={penghuni}
                  isActive={false}
                  onClick={() => setSelectedAsrama(asrama)}
                />
              );
            })}
          </div>
        </PageCard>
      )}

      {/* ── STEP 2: Daftar Kamar dalam Asrama ── */}
      {selectedAsrama && (
        <PageCard
          title={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { setSelectedAsrama(null); setSelectedKamar(null); }}
                className="p-1 rounded-md hover:bg-muted transition-colors"
                aria-label="Kembali ke daftar asrama"
              >
                <ChevronLeft aria-hidden="true" className="w-4 h-4 text-muted-foreground" />
              </button>
              <Building2 aria-hidden="true" className="w-4 h-4 text-primary" />
              <span>{selectedAsrama.name}</span>
              <span className="text-muted-foreground font-normal text-sm">— Daftar Kamar</span>
            </div>
          }
          description="Klik kamar untuk melihat dan mengelola penghuni"
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {kamarPerAsrama(selectedAsrama.id).map((kamar) => (
              <KamarCard
                key={kamar.id}
                kamar={kamar}
                penghuni={penghuniMap[kamar.id] ?? []}
                onClick={() => setSelectedKamar(kamar)}
              />
            ))}
          </div>
        </PageCard>
      )}

      {/* ── Section: Santri Belum Terplotting ── */}
      {belumTerplotting.length > 0 && (
        <PageCard
          title={
            <div className="flex items-center gap-2">
              <UserX aria-hidden="true" className="w-4 h-4 text-amber-500" />
              <span>Santri Belum Terplotting</span>
              <span className="text-xs font-normal bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full">
                {belumTerplotting.length} santri
              </span>
            </div>
          }
          description="Santri yang belum ditempatkan di kamar manapun"
        >
          <ul className="divide-y divide-border">
            {belumTerplotting.map((s) => {
              const badge = pointBadge(s.totalPoinPelanggaran);
              return (
                <li key={s.id} className="flex items-center gap-3 py-3 hover:bg-muted/30 rounded-lg px-2 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                    {getInitials(s.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.kelas} · {s.totalPoinPelanggaran} poin</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`hidden sm:inline text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge.cls}`}>
                      {badge.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => setTempatkanSantri(s)}
                      className="flex items-center gap-1.5 text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <BedDouble aria-hidden="true" className="w-3.5 h-3.5" />
                      Tempatkan ke Kamar
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </PageCard>
      )}

      {/* ── Panel Detail Kamar ── */}
      {selectedKamar && selectedAsrama && (
        <KamarDetailPanel
          kamar={selectedKamar}
          asrama={selectedAsrama}
          penghuni={penghuniMap[selectedKamar.id] ?? []}
          onClose={() => setSelectedKamar(null)}
          onKeluarkan={handleKeluarkan}
          onKosongkan={handleKosongkan}
          onTarikClick={() => setShowTarikModal(true)}
        />
      )}

      {/* ── Modal Tempatkan ── */}
      {tempatkanSantri && (
        <TempatkanModal
          santri={tempatkanSantri}
          kamarList={activeAsramaKamar}
          penghuniMap={penghuniMap}
          onClose={() => setTempatkanSantri(null)}
          onTempatkan={handleTempatkan}
        />
      )}

      {/* ── Modal Tarik Santri ── */}
      {showTarikModal && selectedKamar && (
        <TarikSantriModal
          santriList={santriList}
          currentKamar={selectedKamar}
          onClose={() => setShowTarikModal(false)}
          onTarik={handleTempatkan}
        />
      )}
    </div>
  );
}
