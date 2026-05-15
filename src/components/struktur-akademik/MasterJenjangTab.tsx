'use client';

import { useState } from 'react';
import { Search, BookOpen, Edit2, Trash2, Plus } from 'lucide-react';
import type { MasterJenjang, Instansi } from '@/types';
import { INSTANSI_ORDER, INSTANSI_LABEL } from '@/types';
import { cn } from '@/lib/utils';

const inputCls = cn(
  'w-full rounded-lg border px-3 py-2 text-sm text-foreground',
  'bg-muted/40 border-border/60',
  'placeholder:text-muted-foreground/40',
  'focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40',
  'transition-[border-color,box-shadow] duration-200',
);

interface Props {
  data: MasterJenjang[];
  onCreate: (d: Partial<MasterJenjang>) => void;
  onUpdate: (id: string, d: Partial<MasterJenjang>) => void;
  onDelete: (id: string) => void;
}

export function MasterJenjangTab({ data, onCreate, onUpdate, onDelete }: Props) {
  const [search, setSearch] = useState('');
  const [filterInstansi, setFilterInstansi] = useState<'all' | Instansi>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const [showAdd, setShowAdd] = useState(false);
  const [editData, setEditData] = useState<MasterJenjang | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = data.filter((j) => {
    const matchSearch = j.namaJenjang.toLowerCase().includes(search.toLowerCase());
    const matchInstansi = filterInstansi === 'all' || j.instansi === filterInstansi;
    const matchStatus = filterStatus === 'all' || j.status === filterStatus;
    return matchSearch && matchInstansi && matchStatus;
  });

  const activeCount = data.filter((j) => j.status === 'active').length;
  const inactiveCount = data.filter((j) => j.status === 'inactive').length;

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-muted/30 border border-border rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-foreground">{data.length}</div>
          <div className="text-xs text-muted-foreground">Total Jenjang</div>
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
              placeholder="Cari nama jenjang…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>
          <select
            value={filterInstansi}
            onChange={(e) => setFilterInstansi(e.target.value as typeof filterInstansi)}
            className="text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="all">Semua Instansi</option>
            {INSTANSI_ORDER.map((i) => (
              <option key={i} value={i}>{INSTANSI_LABEL[i]}</option>
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
          Tambah Jenjang
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 text-muted-foreground">
              <th className="text-left px-4 py-3 font-medium">Nama Jenjang</th>
              <th className="text-left px-4 py-3 font-medium">Instansi</th>
              <th className="text-left px-4 py-3 font-medium">Progression Indexes</th>
              <th className="text-center px-4 py-3 font-medium">Status</th>
              <th className="text-right px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((j) => (
              <tr key={j.id} className="hover:bg-muted/30 transition-colors group">
                <td className="px-4 py-3 font-medium text-foreground">{j.namaJenjang}</td>
                <td className="px-4 py-3">
                  <span className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                    j.instansi === 'madin'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      : j.instansi === 'madqur'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                  )}>
                    {INSTANSI_LABEL[j.instansi]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {j.progressionIndexes.map((idx) => (
                      <span key={idx} className="inline-flex items-center px-1.5 py-0.5 rounded bg-muted/60 text-[10px] font-mono font-medium">
                        {idx}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                    j.status === 'active'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
                  )}>
                    {j.status === 'active' ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditData(j)}
                      aria-label="Edit"
                      className="p-1.5 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                    >
                      <Edit2 aria-hidden="true" className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteId(j.id)}
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
                    <BookOpen aria-hidden="true" className="w-8 h-8 opacity-20" />
                    <p className="text-sm">Tidak ada jenjang yang sesuai filter.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {showAdd && (
        <JenjangFormModal
          title="Tambah Jenjang"
          onClose={() => setShowAdd(false)}
          onSave={(d) => {
            console.log('[MasterJenjangTab] onSave called, calling onCreate...');
            onCreate(d);
            setShowAdd(false);
          }}
        />
      )}
      {editData && (
        <JenjangFormModal
          title="Edit Jenjang"
          initialData={editData}
          onClose={() => setEditData(null)}
          onSave={(d) => { onUpdate(editData.id, d); setEditData(null); }}
        />
      )}
      {deleteId && (
        <DeleteJenjangDialog
          onClose={() => setDeleteId(null)}
          onConfirm={() => { onDelete(deleteId); setDeleteId(null); }}
        />
      )}
    </div>
  );
}

// ── Form Modal ─────────────────────────────────────────────────────────────

function JenjangFormModal({
  title,
  initialData,
  onClose,
  onSave,
}: {
  title: string;
  initialData?: MasterJenjang;
  onClose: () => void;
  onSave: (data: Partial<MasterJenjang>) => void;
}) {
  const [progressionStr, setProgressionStr] = useState(
    (initialData?.progressionIndexes ?? []).join(', '),
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationError(null);

    const indexes = progressionStr
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n) && n > 0);

    if (indexes.length === 0) {
      setValidationError('Progression Indexes tidak valid. Masukkan angka yang dipisahkan koma, contoh: 2, 3, 4');
      console.warn('[JenjangFormModal] progressionIndexes parsing menghasilkan array kosong. Input:', progressionStr);
      return;
    }

    const fd = new FormData(e.currentTarget);
    const payload = {
      namaJenjang: fd.get('namaJenjang') as string,
      instansi: fd.get('instansi') as Instansi,
      progressionIndexes: indexes,
      status: fd.get('status') as 'active' | 'inactive',
    };

    console.log('[JenjangFormModal] Submitting payload:', JSON.stringify(payload, null, 2));
    onSave(payload);
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
            <div className="space-y-1.5">
              <label htmlFor="jj-name" className="text-sm font-medium">Nama Jenjang</label>
              <input
                id="jj-name"
                required
                name="namaJenjang"
                defaultValue={initialData?.namaJenjang}
                className={inputCls}
                placeholder="Contoh: Ibtida'i, MTs, Tahsin"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="jj-instansi" className="text-sm font-medium">Instansi</label>
                <select
                  id="jj-instansi"
                  name="instansi"
                  required
                  defaultValue={initialData?.instansi ?? 'madin'}
                  className={inputCls}
                >
                  {INSTANSI_ORDER.map((i) => (
                    <option key={i} value={i}>{INSTANSI_LABEL[i]}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="jj-status" className="text-sm font-medium">Status</label>
                <select
                  id="jj-status"
                  name="status"
                  defaultValue={initialData?.status ?? 'active'}
                  className={inputCls}
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="jj-idx" className="text-sm font-medium">
                Progression Indexes
              </label>
              <input
                id="jj-idx"
                required
                name="progressionIndexes"
                value={progressionStr}
                onChange={(e) => setProgressionStr(e.target.value)}
                className={inputCls}
                placeholder="Contoh: 2, 3, 4"
              />
              <p className="text-[10px] text-muted-foreground">
                Pisahkan dengan koma. Angka ini adalah progression index global yang dicakup jenjang ini.
              </p>
            </div>

            {validationError && (
              <div className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 text-sm text-red-700 dark:text-red-400">
                {validationError}
              </div>
            )}

            <div className="pt-2 flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors">
                Batal
              </button>
              <button type="submit" className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
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

function DeleteJenjangDialog({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-background border border-border rounded-xl shadow-xl w-full max-w-sm pointer-events-auto p-5 text-center">
          <h2 className="font-bold text-lg mb-2">Hapus Jenjang?</h2>
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
