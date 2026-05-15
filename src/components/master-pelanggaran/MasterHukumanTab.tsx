'use client';

import { useState } from 'react';
import { Search, Shield, Edit2, Trash2, Plus } from 'lucide-react';
import type { MasterHukuman, PelanggaranSeverity } from '@/types';
import { SEVERITY_COLORS } from '@/components/pelanggaran/constants';
import { cn } from '@/lib/utils';

const ALL_SEVERITIES: PelanggaranSeverity[] = ['ringan', 'sedang', 'berat', 'sangat_berat'];

const inputCls = cn(
  'w-full rounded-lg border px-3 py-2 text-sm text-foreground',
  'bg-muted/40 border-border/60',
  'placeholder:text-muted-foreground/40',
  'focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40',
  'transition-[border-color,box-shadow] duration-200',
);

// ── Props ──────────────────────────────────────────────────────────────────

interface Props {
  data: MasterHukuman[];
  onCreate: (d: Partial<MasterHukuman>) => void;
  onUpdate: (id: string, d: Partial<MasterHukuman>) => void;
  onDelete: (id: string) => void;
}

// ── Main Component ─────────────────────────────────────────────────────────

export function MasterHukumanTab({ data, onCreate, onUpdate, onDelete }: Props) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterSeverity, setFilterSeverity] = useState<'all' | PelanggaranSeverity>('all');

  const [showAdd, setShowAdd] = useState(false);
  const [editData, setEditData] = useState<MasterHukuman | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = data.filter((h) => {
    const matchSearch = h.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || h.status === filterStatus;
    const matchSeverity = filterSeverity === 'all' || h.severityScope.includes(filterSeverity);
    return matchSearch && matchStatus && matchSeverity;
  });

  const activeCount = data.filter((h) => h.status === 'active').length;
  const inactiveCount = data.filter((h) => h.status === 'inactive').length;

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-muted/30 border border-border rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-foreground">{data.length}</div>
          <div className="text-xs text-muted-foreground">Total Hukuman</div>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{activeCount}</div>
          <div className="text-xs text-muted-foreground">Aktif</div>
        </div>
        <div className="bg-slate-100 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-700/40 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-slate-500">{inactiveCount}</div>
          <div className="text-xs text-muted-foreground">Nonaktif</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1">
            <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari nama hukuman…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value as typeof filterSeverity)}
            className="text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="all">Semua Cakupan</option>
            {ALL_SEVERITIES.map((s) => (
              <option key={s} value={s}>{s === 'sangat_berat' ? 'Sangat Berat' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
            className="text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 shrink-0 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm active:scale-95"
        >
          <Plus aria-hidden="true" className="w-4 h-4" />
          Tambah Hukuman
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 text-muted-foreground">
              <th className="text-left px-4 py-3 font-medium">Nama Hukuman</th>
              <th className="text-left px-4 py-3 font-medium">Cakupan Tingkat</th>
              <th className="text-center px-4 py-3 font-medium">Min. Tingkat</th>
              <th className="text-center px-4 py-3 font-medium">Status</th>
              <th className="text-right px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((h) => (
              <tr key={h.id} className="hover:bg-muted/30 transition-colors group">
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">{h.name}</div>
                  {h.description && (
                    <div className="text-xs text-muted-foreground truncate max-w-[260px]">{h.description}</div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {h.severityScope.map((s) => (
                      <span
                        key={s}
                        className={cn('inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium capitalize', SEVERITY_COLORS[s])}
                      >
                        {s.replaceAll('_', ' ')}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-sm font-semibold text-foreground">{h.minimumTingkat}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                    h.status === 'active'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
                  )}>
                    {h.status === 'active' ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditData(h)}
                      aria-label="Edit"
                      className="p-1.5 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                    >
                      <Edit2 aria-hidden="true" className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteId(h.id)}
                      aria-label="Hapus"
                      className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    >
                      <Trash2 aria-hidden="true" className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Shield aria-hidden="true" className="w-8 h-8 opacity-20" />
                    <p className="text-sm">Tidak ada hukuman yang sesuai filter.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {showAdd && (
        <HukumanFormModal
          title="Tambah Hukuman"
          onClose={() => setShowAdd(false)}
          onSave={(d) => { onCreate(d); setShowAdd(false); }}
        />
      )}
      {editData && (
        <HukumanFormModal
          title="Edit Hukuman"
          initialData={editData}
          onClose={() => setEditData(null)}
          onSave={(d) => { onUpdate(editData.id, d); setEditData(null); }}
        />
      )}
      {deleteId && (
        <DeleteHukumanDialog
          onClose={() => setDeleteId(null)}
          onConfirm={() => { onDelete(deleteId); setDeleteId(null); }}
        />
      )}
    </div>
  );
}

// ── Form Modal ─────────────────────────────────────────────────────────────

function HukumanFormModal({
  title,
  initialData,
  onClose,
  onSave,
}: {
  title: string;
  initialData?: MasterHukuman;
  onClose: () => void;
  onSave: (data: Partial<MasterHukuman>) => void;
}) {
  const [severityScope, setSeverityScope] = useState<PelanggaranSeverity[]>(
    initialData?.severityScope ?? ['ringan'],
  );

  const toggleSeverity = (s: PelanggaranSeverity) => {
    setSeverityScope((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (severityScope.length === 0) return;
    const fd = new FormData(e.currentTarget);
    const rawTingkat = Number(fd.get('minimumTingkat'));
    onSave({
      name: fd.get('name') as string,
      status: fd.get('status') as 'active' | 'inactive',
      severityScope,
      minimumTingkat: Math.max(1, isNaN(rawTingkat) ? 1 : rawTingkat),
      description: (fd.get('description') as string) || undefined,
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-background border border-border rounded-xl shadow-xl w-full max-w-lg pointer-events-auto max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-background z-10">
            <h2 className="font-semibold text-foreground">{title}</h2>
            <button type="button" onClick={onClose} aria-label="Tutup" className="p-1.5 text-muted-foreground hover:bg-muted rounded-md">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Nama */}
            <div className="space-y-1.5">
              <label htmlFor="hkm-name" className="text-sm font-medium">Nama Hukuman</label>
              <input
                id="hkm-name"
                required
                name="name"
                defaultValue={initialData?.name}
                className={inputCls}
                placeholder="Contoh: Bersih-bersih lingkungan"
              />
            </div>

            {/* Cakupan Tingkat (severityScope) */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Cakupan Tingkat Pelanggaran</label>
              <div className="flex flex-wrap gap-2">
                {ALL_SEVERITIES.map((s) => (
                  <label
                    key={s}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer transition-colors select-none',
                      severityScope.includes(s)
                        ? 'bg-primary/10 border-primary/30 text-primary'
                        : 'bg-muted/30 border-border text-muted-foreground hover:border-muted-foreground/30',
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={severityScope.includes(s)}
                      onChange={() => toggleSeverity(s)}
                      className="sr-only"
                    />
                    {s.replaceAll('_', ' ')}
                  </label>
                ))}
              </div>
              {severityScope.length === 0 && (
                <p className="text-xs text-red-500">Minimal pilih satu tingkat.</p>
              )}
            </div>

            {/* Min Tingkat + Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="hkm-tingkat" className="text-sm font-medium">Minimum Tingkat</label>
                <input
                  id="hkm-tingkat"
                  required
                  type="number"
                  name="minimumTingkat"
                  min="1"
                  max="12"
                  defaultValue={initialData?.minimumTingkat ?? 1}
                  className={inputCls}
                />
                <p className="text-[10px] text-muted-foreground">Santri di bawah tingkat ini tidak bisa diberi hukuman ini.</p>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="hkm-status" className="text-sm font-medium">Status</label>
                <select
                  id="hkm-status"
                  name="status"
                  defaultValue={initialData?.status ?? 'active'}
                  className={inputCls}
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </div>
            </div>

            {/* Deskripsi */}
            <div className="space-y-1.5">
              <label htmlFor="hkm-desc" className="text-sm font-medium">
                Deskripsi <span className="text-muted-foreground font-normal">(opsional)</span>
              </label>
              <textarea
                id="hkm-desc"
                name="description"
                defaultValue={initialData?.description}
                className={inputCls}
                rows={2}
                placeholder="Penjelasan detail tentang hukuman…"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors">
                Batal
              </button>
              <button type="submit" className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors" disabled={severityScope.length === 0}>
                Simpan
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

// ── Delete Dialog ──────────────────────────────────────────────────────────

function DeleteHukumanDialog({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-background border border-border rounded-xl shadow-xl w-full max-w-sm pointer-events-auto p-5 text-center">
          <h2 className="font-bold text-lg mb-2">Hapus Hukuman?</h2>
          <p className="text-sm text-muted-foreground mb-6">Tindakan ini tidak dapat dibatalkan. Apakah Anda yakin?</p>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors">Batal</button>
            <button type="button" onClick={onConfirm} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">Hapus</button>
          </div>
        </div>
      </div>
    </>
  );
}
