'use client';

import { useState } from 'react';
import { PageHeader, PageCard } from '@/components/shared/page-header';
import { StatsCard } from '@/components/shared/stats-card';
import { StatusBadge } from '@/components/shared/status-badge';
import { LoadingState } from '@/components/shared/loading-state';
import { ErrorState } from '@/components/shared/error-state';
import { EmptyState } from '@/components/shared/empty-state';
import { useCollection } from '@/hooks';
import { guruService } from '@/lib/firebase/services';
import type { Guru, RanahInstansi } from '@/types';
import { Users, Search, Plus, Pencil, Trash2, X, Briefcase } from 'lucide-react';

const RANAH_INSTANSI: RanahInstansi[] = ['madin', 'depag', 'madqurur', 'pesantren'];
const RANAH_LABEL: Record<RanahInstansi, string> = {
  madin: 'Madin',
  depag: 'Depag',
  madqurur: 'Madqurur',
  pesantren: 'Pesantren',
};

export default function GuruPage() {
  const { data: guruList, loading, error } = useCollection<Guru>('guru');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRanah, setFilterRanah] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editGuru, setEditGuru] = useState<Guru | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formNip, setFormNip] = useState('');
  const [formRanah, setFormRanah] = useState<RanahInstansi>('madin');

  const filtered = guruList.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.nip.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || g.status === filterStatus;
    const matchRanah = filterRanah === 'all' || g.ranahInstansi === filterRanah;
    return matchSearch && matchStatus && matchRanah;
  });

  const stats = {
    total: guruList.length,
    aktif: guruList.filter(g => g.status === 'aktif').length,
    nonaktif: guruList.filter(g => g.status === 'nonaktif').length,
  };

  const openAdd = () => {
    setEditGuru(null);
    setFormName('');
    setFormNip('');
    setFormRanah('madin');
    setShowModal(true);
  };

  const openEdit = (g: Guru) => {
    setEditGuru(g);
    setFormName(g.name);
    setFormNip(g.nip);
    setFormRanah(g.ranahInstansi);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formNip.trim()) return;
    setSubmitting(true);
    try {
      if (editGuru) {
        await guruService.update(editGuru.id, {
          name: formName.trim(),
          nip: formNip.trim(),
          ranahInstansi: formRanah,
        } as Record<string, unknown> as any);
      } else {
        await guruService.create({
          name: formName.trim(),
          nip: formNip.trim(),
          ranahInstansi: formRanah,
          status: 'aktif',
        } as any);
      }
      setShowModal(false);
    } catch (err: any) {
      console.error('Gagal menyimpan guru:', err);
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus data guru ini?')) return;
    try { await guruService.delete(id); } catch (err) { console.error(err); }
  };

  const handleToggleStatus = async (g: Guru) => {
    const newStatus = g.status === 'aktif' ? 'nonaktif' : 'aktif';
    try {
      await guruService.update(g.id, { status: newStatus } as Record<string, unknown> as any);
    } catch (err) { console.error(err); }
  };

  if (loading) return <LoadingState type="table" count={5} />;
  if (error) return <ErrorState message={error.message} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Guru"
        description="Master data guru — pondasi untuk distribusi pengajar dan wali kelas"
        action={
          <button onClick={openAdd} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            Tambah Guru
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Guru" value={stats.total} icon={Users} />
        <StatsCard title="Aktif" value={stats.aktif} icon={Briefcase} iconClassName="bg-emerald-500/10 text-emerald-600" />
        <StatsCard title="Nonaktif" value={stats.nonaktif} icon={Briefcase} iconClassName="bg-slate-500/10 text-slate-600" />
      </div>

      <PageCard title="Daftar Guru" description={`${filtered.length} guru`}>
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text" placeholder="Cari nama atau NIP..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
          <select value={filterRanah} onChange={(e) => setFilterRanah(e.target.value)}
            className="text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
            <option value="all">Semua Ranah</option>
            {RANAH_INSTANSI.map(r => <option key={r} value={r}>{RANAH_LABEL[r]}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
            <option value="all">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Nonaktif</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={Users} title="Belum ada data guru" description="Tambahkan data guru terlebih dahulu." />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-muted-foreground">
                  <th className="text-left px-4 py-3 font-medium">Nama</th>
                  <th className="text-left px-4 py-3 font-medium">NIP</th>
                  <th className="text-left px-4 py-3 font-medium">Ranah Instansi</th>
                  <th className="text-center px-4 py-3 font-medium">Status</th>
                  <th className="text-right px-4 py-3 font-medium w-[120px]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(g => (
                  <tr key={g.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{g.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{g.nip}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700">{RANAH_LABEL[g.ranahInstansi] || g.ranahInstansi}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleToggleStatus(g)} className="cursor-pointer">
                        <StatusBadge status={g.status} variant={g.status === 'aktif' ? 'success' : 'neutral'} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(g)} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(g.id)} className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PageCard>

      {/* Modal Tambah/Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-border overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border bg-stone-50">
              <h3 className="font-bold text-lg">{editGuru ? 'Edit Guru' : 'Tambah Guru'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nama Guru</label>
                <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)}
                  placeholder="Nama lengkap guru" required
                  className="w-full mt-1.5 text-sm border border-border rounded-lg px-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">NIP (No Unik + Absen)</label>
                <input type="text" value={formNip} onChange={(e) => setFormNip(e.target.value)}
                  placeholder="Misal: 19850115-023" required
                  className="w-full mt-1.5 text-sm border border-border rounded-lg px-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Ranah Instansi</label>
                <select value={formRanah} onChange={(e) => setFormRanah(e.target.value as RanahInstansi)}
                  className="w-full mt-1.5 text-sm border border-border rounded-lg px-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
                  {RANAH_INSTANSI.map(r => <option key={r} value={r}>{RANAH_LABEL[r]}</option>)}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-stone-100 border border-border rounded-lg transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={submitting || !formName.trim() || !formNip.trim()}
                  className="px-4 py-2 text-sm font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50">
                  {submitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
