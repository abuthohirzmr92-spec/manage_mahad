'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Layers, Edit2, Trash2, Plus } from 'lucide-react';
import type { MasterTingkat, MasterJenjang, Instansi } from '@/types';
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
  data: MasterTingkat[];
  jenjangList: MasterJenjang[];
  onCreate: (d: Partial<MasterTingkat>) => void;
  onUpdate: (id: string, d: Partial<MasterTingkat>) => void;
  onDelete: (id: string) => void;
}

export function MasterTingkatTab({ data, jenjangList, onCreate, onUpdate, onDelete }: Props) {
  const [search, setSearch] = useState('');
  const [filterInstansi, setFilterInstansi] = useState<'all' | Instansi>('all');
  const [filterJenjangId, setFilterJenjangId] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const [showAdd, setShowAdd] = useState(false);
  const [editData, setEditData] = useState<MasterTingkat | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  /** Jenjang list filtered by instansi (used for jenjang filter dropdown). */
  const jenjangForFilter = useMemo(() => {
    if (filterInstansi === 'all') return jenjangList.filter((j) => j.status === 'active');
    return jenjangList.filter((j) => j.instansi === filterInstansi && j.status === 'active');
  }, [jenjangList, filterInstansi]);

  const filtered = data.filter((t) => {
    const matchSearch =
      t.tingkatLabel.toLowerCase().includes(search.toLowerCase()) ||
      String(t.progressionIndex).includes(search);
    const matchInstansi = filterInstansi === 'all' || t.instansi === filterInstansi;
    const matchJenjang = filterJenjangId === 'all' || t.jenjangId === filterJenjangId;
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchSearch && matchInstansi && matchJenjang && matchStatus;
  });

  const activeCount = data.filter((t) => t.status === 'active').length;
  const inactiveCount = data.filter((t) => t.status === 'inactive').length;

  /** Resolve jenjang name from jenjangId for display. */
  const jenjangNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const j of jenjangList) map[j.id] = j.namaJenjang;
    return map;
  }, [jenjangList]);

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-muted/30 border border-border rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-foreground">{data.length}</div>
          <div className="text-xs text-muted-foreground">Total Tingkat</div>
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
              placeholder="Cari tingkat atau label…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>
          <select
            value={filterInstansi}
            onChange={(e) => {
              setFilterInstansi(e.target.value as typeof filterInstansi);
              setFilterJenjangId('all');
            }}
            className="text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="all">Semua Instansi</option>
            {INSTANSI_ORDER.map((i) => (
              <option key={i} value={i}>{INSTANSI_LABEL[i]}</option>
            ))}
          </select>
          <select
            value={filterJenjangId}
            onChange={(e) => setFilterJenjangId(e.target.value)}
            className="text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="all">Semua Jenjang</option>
            {jenjangForFilter.map((j) => (
              <option key={j.id} value={j.id}>{j.namaJenjang}</option>
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
          Tambah Tingkat
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 text-muted-foreground">
              <th className="text-center px-4 py-3 font-medium w-20">Prog. Index</th>
              <th className="text-left px-4 py-3 font-medium">Label Tingkat</th>
              <th className="text-left px-4 py-3 font-medium">Instansi</th>
              <th className="text-left px-4 py-3 font-medium">Jenjang</th>
              <th className="text-center px-4 py-3 font-medium">Status</th>
              <th className="text-right px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((t) => (
              <tr key={t.id} className="hover:bg-muted/30 transition-colors group">
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-6 rounded bg-muted/60 font-mono text-xs font-bold text-foreground">
                    {t.progressionIndex}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-foreground">{t.tingkatLabel}</td>
                <td className="px-4 py-3">
                  <span className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                    t.instansi === 'madin'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      : t.instansi === 'madqur'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                  )}>
                    {INSTANSI_LABEL[t.instansi]}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {jenjangNameMap[t.jenjangId] ?? t.jenjangId}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                    t.status === 'active'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
                  )}>
                    {t.status === 'active' ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditData(t)}
                      aria-label="Edit"
                      className="p-1.5 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                    >
                      <Edit2 aria-hidden="true" className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteId(t.id)}
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
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Layers aria-hidden="true" className="w-8 h-8 opacity-20" />
                    <p className="text-sm">Tidak ada tingkat yang sesuai filter.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {showAdd && (
        <TingkatFormModal
          title="Tambah Tingkat"
          jenjangList={jenjangList}
          onClose={() => setShowAdd(false)}
          onSave={(d) => { onCreate(d); setShowAdd(false); }}
        />
      )}
      {editData && (
        <TingkatFormModal
          title="Edit Tingkat"
          initialData={editData}
          jenjangList={jenjangList}
          onClose={() => setEditData(null)}
          onSave={(d) => { onUpdate(editData.id, d); setEditData(null); }}
        />
      )}
      {deleteId && (
        <DeleteTingkatDialog
          onClose={() => setDeleteId(null)}
          onConfirm={() => { onDelete(deleteId); setDeleteId(null); }}
        />
      )}
    </div>
  );
}

// ── Form Modal ─────────────────────────────────────────────────────────────

function TingkatFormModal({
  title,
  initialData,
  jenjangList,
  onClose,
  onSave,
}: {
  title: string;
  initialData?: MasterTingkat;
  jenjangList: MasterJenjang[];
  onClose: () => void;
  onSave: (data: Partial<MasterTingkat>) => void;
}) {
  const [selectedInstansi, setSelectedInstansi] = useState<Instansi>(
    initialData?.instansi ?? 'madin',
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  // Filter jenjang by selected instansi
  const filteredJenjang = useMemo(
    () => jenjangList.filter((j) => j.instansi === selectedInstansi && j.status === 'active'),
    [jenjangList, selectedInstansi],
  );

  // Auto-reset jenjangId when instansi changes (only on add, not edit)
  useEffect(() => {
    if (!initialData && filteredJenjang.length > 0) {
      const select = document.getElementById('tk-jenjang') as HTMLSelectElement | null;
      if (select) select.value = '';
    }
  }, [selectedInstansi, filteredJenjang, initialData]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationError(null);
    const fd = new FormData(e.currentTarget);
    const idx = parseInt(fd.get('progressionIndex') as string, 10);
    if (isNaN(idx) || idx < 1) {
      setValidationError('Progression Index harus berupa angka positif (minimal 1).');
      console.warn('[TingkatFormModal] progressionIndex invalid:', fd.get('progressionIndex'));
      return;
    }
    const jenjangId = fd.get('jenjangId') as string;
    if (!jenjangId) {
      setValidationError('Jenjang wajib dipilih.');
      return;
    }
    // Validate jenjang belongs to selected instansi
    const jenjang = filteredJenjang.find((j) => j.id === jenjangId);
    if (!jenjang) {
      setValidationError('Jenjang yang dipilih tidak sesuai dengan instansi.');
      return;
    }
    const payload = {
      instansi: selectedInstansi,
      progressionIndex: idx,
      tingkatLabel: fd.get('tingkatLabel') as string,
      jenjangId,
      status: fd.get('status') as 'active' | 'inactive',
    };
    console.log('[TingkatFormModal] Submitting payload:', JSON.stringify(payload, null, 2));
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
            {/* Instansi */}
            <div className="space-y-1.5">
              <label htmlFor="tk-instansi" className="text-sm font-medium">Instansi</label>
              <select
                id="tk-instansi"
                name="instansi"
                required
                value={selectedInstansi}
                onChange={(e) => setSelectedInstansi(e.target.value as Instansi)}
                className={inputCls}
              >
                {INSTANSI_ORDER.map((i) => (
                  <option key={i} value={i}>{INSTANSI_LABEL[i]}</option>
                ))}
              </select>
              <p className="text-[10px] text-muted-foreground">
                Pilih instansi terlebih dahulu — jenjang akan otomatis terfilter.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Jenjang (filtered by instansi) */}
              <div className="space-y-1.5">
                <label htmlFor="tk-jenjang" className="text-sm font-medium">Jenjang</label>
                <select
                  id="tk-jenjang"
                  name="jenjangId"
                  required
                  defaultValue={initialData?.jenjangId ?? ''}
                  className={inputCls}
                >
                  <option value="" disabled>Pilih Jenjang</option>
                  {filteredJenjang.map((j) => (
                    <option key={j.id} value={j.id}>{j.namaJenjang}</option>
                  ))}
                </select>
                {filteredJenjang.length === 0 && (
                  <p className="text-[10px] text-red-500">
                    Tidak ada jenjang aktif untuk instansi {INSTANSI_LABEL[selectedInstansi]}. Buat jenjang dulu di tab Master Jenjang.
                  </p>
                )}
              </div>

              {/* Progression Index */}
              <div className="space-y-1.5">
                <label htmlFor="tk-idx" className="text-sm font-medium">Progression Index</label>
                <input
                  id="tk-idx"
                  required
                  name="progressionIndex"
                  type="number"
                  min="1"
                  max="99"
                  defaultValue={initialData?.progressionIndex ?? ''}
                  className={inputCls}
                  placeholder="Contoh: 5"
                />
                <p className="text-[10px] text-muted-foreground">
                  Angka global unik untuk urutan akademik.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Label Tingkat */}
              <div className="space-y-1.5">
                <label htmlFor="tk-label" className="text-sm font-medium">Label Tingkat</label>
                <input
                  id="tk-label"
                  required
                  name="tingkatLabel"
                  defaultValue={initialData?.tingkatLabel}
                  className={inputCls}
                  placeholder="Contoh: Kelas 1, Tahsin Dasar"
                />
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label htmlFor="tk-status" className="text-sm font-medium">Status</label>
                <select
                  id="tk-status"
                  name="status"
                  defaultValue={initialData?.status ?? 'active'}
                  className={inputCls}
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </div>
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

function DeleteTingkatDialog({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-background border border-border rounded-xl shadow-xl w-full max-w-sm pointer-events-auto p-5 text-center">
          <h2 className="font-bold text-lg mb-2">Hapus Tingkat?</h2>
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
