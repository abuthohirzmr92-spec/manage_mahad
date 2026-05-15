'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingState } from '@/components/shared/loading-state';
import { ErrorState } from '@/components/shared/error-state';
import { MasterJenjangTab, MasterTingkatTab } from '@/components/struktur-akademik';
import { useCollection } from '@/hooks';
import { masterJenjangService, masterTingkatService } from '@/lib/firebase/services';
import type { MasterJenjang, MasterTingkat } from '@/types';
import { cn } from '@/lib/utils';

const TABS = [
  { id: 'jenjang' as const, label: 'Master Jenjang' },
  { id: 'tingkat' as const, label: 'Master Tingkat' },
];

export default function StrukturAkademikPage() {
  const {
    data: jenjangList,
    loading: jenjangLoading,
    error: jenjangError,
  } = useCollection<MasterJenjang>('masterJenjang', [], { realtime: true });

  const {
    data: tingkatList,
    loading: tingkatLoading,
    error: tingkatError,
  } = useCollection<MasterTingkat>('masterTingkat', [], { realtime: true });

  const [activeTab, setActiveTab] = useState<'jenjang' | 'tingkat'>('jenjang');

  const loading = jenjangLoading || tingkatLoading;
  const error = jenjangError || tingkatError;

  // ── CRUD: Jenjang ──────────────────────────────────────────────────────
  const handleCreateJenjang = useCallback(
    async (data: Partial<MasterJenjang>) => {
      console.log('[handleCreateJenjang] Received data:', JSON.stringify(data, null, 2));
      try {
        const newId = await masterJenjangService.create({
          namaJenjang: data.namaJenjang ?? '',
          instansi: data.instansi ?? 'madin',
          progressionIndexes: data.progressionIndexes ?? [],
          status: data.status ?? 'active',
        });
        console.log('[handleCreateJenjang] Created with id:', newId);
        toast.success(`Jenjang "${data.namaJenjang}" berhasil dibuat.`);
      } catch (err) {
        console.error('[handleCreateJenjang] Gagal membuat jenjang:', err);
        toast.error('Gagal membuat jenjang. Silakan coba lagi.');
      }
    },
    [],
  );

  const handleUpdateJenjang = useCallback(
    async (id: string, data: Partial<MasterJenjang>) => {
      try {
        await masterJenjangService.update(id, data);
        toast.success(`Jenjang "${data.namaJenjang}" berhasil diperbarui.`);
      } catch (err) {
        console.error('Gagal memperbarui jenjang:', err);
        toast.error('Gagal memperbarui jenjang. Silakan coba lagi.');
      }
    },
    [],
  );

  const handleDeleteJenjang = useCallback(
    async (id: string) => {
      try {
        await masterJenjangService.delete(id);
        toast.success('Jenjang berhasil dihapus.');
      } catch (err) {
        console.error('Gagal menghapus jenjang:', err);
        toast.error('Gagal menghapus jenjang. Silakan coba lagi.');
      }
    },
    [],
  );

  // ── CRUD: Tingkat ──────────────────────────────────────────────────────
  const handleCreateTingkat = useCallback(
    async (data: Partial<MasterTingkat>) => {
      try {
        await masterTingkatService.create({
          instansi: data.instansi ?? 'madin',
          progressionIndex: data.progressionIndex ?? 0,
          tingkatLabel: data.tingkatLabel ?? '',
          jenjangId: data.jenjangId ?? '',
          status: data.status ?? 'active',
        });
        toast.success(`Tingkat "${data.tingkatLabel}" berhasil dibuat.`);
      } catch (err) {
        console.error('Gagal membuat tingkat:', err);
        toast.error('Gagal membuat tingkat. Silakan coba lagi.');
      }
    },
    [],
  );

  const handleUpdateTingkat = useCallback(
    async (id: string, data: Partial<MasterTingkat>) => {
      try {
        await masterTingkatService.update(id, data);
        toast.success(`Tingkat "${data.tingkatLabel}" berhasil diperbarui.`);
      } catch (err) {
        console.error('Gagal memperbarui tingkat:', err);
        toast.error('Gagal memperbarui tingkat. Silakan coba lagi.');
      }
    },
    [],
  );

  const handleDeleteTingkat = useCallback(
    async (id: string) => {
      try {
        await masterTingkatService.delete(id);
        toast.success('Tingkat berhasil dihapus.');
      } catch (err) {
        console.error('Gagal menghapus tingkat:', err);
        toast.error('Gagal menghapus tingkat. Silakan coba lagi.');
      }
    },
    [],
  );

  if (loading) return <LoadingState type="card" count={6} />;
  if (error) return <ErrorState message="Gagal memuat data struktur akademik." onRetry={() => window.location.reload()} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Master Struktur Akademik"
        description="Pusat konfigurasi jenjang dan tingkat — sumber utama seluruh hirarki akademik"
      />

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 p-1 rounded-xl w-fit border border-border/60">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              activeTab === tab.id
                ? 'bg-background text-foreground shadow-sm border border-border/60'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'jenjang' ? (
        <MasterJenjangTab
          data={jenjangList}
          onCreate={handleCreateJenjang}
          onUpdate={handleUpdateJenjang}
          onDelete={handleDeleteJenjang}
        />
      ) : (
        <MasterTingkatTab
          data={tingkatList}
          jenjangList={jenjangList}
          onCreate={handleCreateTingkat}
          onUpdate={handleUpdateTingkat}
          onDelete={handleDeleteTingkat}
        />
      )}
    </div>
  );
}
