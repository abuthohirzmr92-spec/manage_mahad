'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Santri, MasterPelanggaran, MasterHukuman, PelanggaranSeverity, RanahInstansi } from '@/types';
import { SEVERITY_COLORS, RANAH_LABEL } from './constants';
import { AlertTriangle, Plus, X, Search, Gavel } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Shared input tokens ────────────────────────────────────────────────────────
const inputCls = cn(
  'w-full rounded-lg border px-3 py-2 text-sm text-foreground',
  'bg-muted/40 border-border/60',
  'placeholder:text-muted-foreground/40',
  'focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40',
  'dark:bg-white/[0.03] dark:border-white/[0.07]',
  'transition-[border-color,box-shadow] duration-200',
);

const dialogCls = cn(
  'bg-background/95',
  'dark:bg-background/90 dark:backdrop-blur-md',
  'dark:border dark:border-white/[0.08]',
);

// ── Label component ────────────────────────────────────────────────────────────
function FieldLabel({ htmlFor, label, required }: { htmlFor: string; label: string; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest select-none">
      {label}
      {required && <span className="ml-1 text-primary/60 font-bold" aria-hidden="true">*</span>}
    </label>
  );
}

// ── Props ──────────────────────────────────────────────────────────────────────
interface Props {
  open: boolean;
  santriList: Santri[];
  masterPelanggaranList: MasterPelanggaran[];
  masterHukumanList: MasterHukuman[];
  santriTingkatMap: Record<string, number>;
  reporterName: string;
  reporterUserId: string;
  reporterRole: string;
  onClose: () => void;
  onSave: (records: Array<{
    santriId: string;
    santriName: string;
    pelanggaranId: string;
    pelanggaranName: string;
    severity: MasterPelanggaran['severity'];
    points: number;
    date: string;
    reportedBy: string;
    reportedByUserId: string;
    reportedByRole: string;
    punishmentId?: string;
    punishmentName?: string;
    notes?: string;
  }>) => void;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const ALL_RANAH: RanahInstansi[] = ['pesantren', 'madin', 'depag', 'madqurur'];

export function CatatPelanggaranModal({
  open,
  santriList,
  masterPelanggaranList,
  masterHukumanList,
  santriTingkatMap,
  reporterName,
  reporterUserId,
  reporterRole,
  onClose,
  onSave,
}: Props) {
  // ── Form state ────────────────────────────────────────────────────────────
  const [ranah, setRanah] = useState<RanahInstansi | ''>('');
  const [kategori, setKategori] = useState('');
  const [pelanggaranId, setPelanggaranId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');

  // ── Santri multi-select state ─────────────────────────────────────────────
  const [santriSearch, setSantriSearch] = useState('');
  const [selectedSantriIds, setSelectedSantriIds] = useState<string[]>([]);

  // ── Per-tingkat punishment state: { [tingkat]: hukumanId } ────────────────
  const [punishmentByTingkat, setPunishmentByTingkat] = useState<Record<number, string>>({});

  // ── Reset form on open ────────────────────────────────────────────────────
  useEffect(() => {
    if (open) {
      setRanah('');
      setKategori('');
      setPelanggaranId('');
      setDate(new Date().toISOString().slice(0, 10));
      setNotes('');
      setSantriSearch('');
      setSelectedSantriIds([]);
      setPunishmentByTingkat({});
    }
  }, [open]);

  // ── Derived: ranah → kategori ─────────────────────────────────────────────
  const kategoriOptions = useMemo(() => {
    const katSet = new Set<string>();
    for (const mp of masterPelanggaranList) {
      if (ranah && mp.ranahInstansi === ranah) katSet.add(mp.kategori);
    }
    return [...katSet].sort();
  }, [masterPelanggaranList, ranah]);

  // Reset kategori & pelanggaran when ranah changes
  useEffect(() => { setKategori(''); setPelanggaranId(''); }, [ranah]);
  useEffect(() => { setPelanggaranId(''); }, [kategori]);

  // ── Derived: ranah + kategori → pelanggaran ───────────────────────────────
  const pelanggaranOptions = useMemo(() => {
    return masterPelanggaranList.filter((mp) => {
      if (ranah && mp.ranahInstansi !== ranah) return false;
      if (kategori && mp.kategori !== kategori) return false;
      return true;
    });
  }, [masterPelanggaranList, ranah, kategori]);

  const selectedPelanggaran = masterPelanggaranList.find((mp) => mp.id === pelanggaranId);

  // ── Derived: santri search ────────────────────────────────────────────────
  const searchResults = useMemo(() => {
    if (!santriSearch.trim()) return [];
    const q = santriSearch.toLowerCase();
    return santriList.filter((s) => {
      if (selectedSantriIds.includes(s.id)) return false;
      return (
        s.name.toLowerCase().includes(q) ||
        s.nis.toLowerCase().includes(q) ||
        s.kelas.toLowerCase().includes(q)
      );
    }).slice(0, 8);
  }, [santriList, santriSearch, selectedSantriIds]);

  const selectedSantri = useMemo(
    () => selectedSantriIds.map((id) => santriList.find((s) => s.id === id)!).filter(Boolean),
    [santriList, selectedSantriIds],
  );

  const addSantri = (id: string) => {
    if (!selectedSantriIds.includes(id)) {
      setSelectedSantriIds((prev) => [...prev, id]);
    }
    setSantriSearch('');
  };

  const removeSantri = (id: string) => {
    setSelectedSantriIds((prev) => prev.filter((sid) => sid !== id));
    // Remove from punishment map — the tingkat group may shrink
    // We'll let the useEffect handle cleanup via the selected santri set
  };

  // ── Group selected santri by unique tingkat ───────────────────────────────
  const tingkatGroups = useMemo(() => {
    const groups = new Map<number, Santri[]>();
    for (const sid of selectedSantriIds) {
      const s = santriList.find((st) => st.id === sid);
      if (!s) continue;
      const t = santriTingkatMap[s.id] ?? 0;
      if (!groups.has(t)) groups.set(t, []);
      groups.get(t)!.push(s);
    }
    return [...groups.entries()].sort(([a], [b]) => a - b);
  }, [selectedSantriIds, santriList, santriTingkatMap]);

  // ── Filter available punishments per tingkat ──────────────────────────────
  function getPunishmentOptions(tingkat: number): MasterHukuman[] {
    if (!selectedPelanggaran) return [];
    const severity = selectedPelanggaran.severity;
    return masterHukumanList.filter((h) => {
      if (h.status !== 'active') return false;
      if (!h.severityScope.includes(severity)) return false;
      if (h.minimumTingkat > tingkat) return false;
      return true;
    });
  }

  // Auto-clear punishment selections when severity or santri changes
  useEffect(() => {
    setPunishmentByTingkat({});
  }, [pelanggaranId, selectedSantriIds]);

  // ── Submit ────────────────────────────────────────────────────────────────
  const canSubmit =
    ranah !== '' &&
    pelanggaranId !== '' &&
    selectedSantriIds.length > 0 &&
    selectedPelanggaran !== undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !selectedPelanggaran) return;

    const records = selectedSantriIds.map((sid) => {
      const s = santriList.find((st) => st.id === sid)!;
      const t = santriTingkatMap[s.id] ?? 0;
      const punishmentId = punishmentByTingkat[t] || undefined;
      const punishmentName = punishmentId
        ? masterHukumanList.find((h) => h.id === punishmentId)?.name
        : undefined;

      return {
        santriId: s.id,
        santriName: s.name,
        pelanggaranId: selectedPelanggaran.id,
        pelanggaranName: selectedPelanggaran.name,
        severity: selectedPelanggaran.severity,
        points: selectedPelanggaran.points,
        date,
        reportedBy: reporterName,
        reportedByUserId: reporterUserId,
        reportedByRole: reporterRole,
        punishmentId,
        punishmentName,
        notes: notes.trim() || undefined,
      };
    });

    onSave(records);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className={cn('sm:max-w-lg', dialogCls)}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-0.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 bg-primary/10 ring-1 ring-primary/20">
              <Plus className="w-4 h-4 text-primary" aria-hidden="true" />
            </div>
            <DialogTitle className="text-base font-semibold">Catat Pelanggaran</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground/80 leading-relaxed">
            Pilih santri (bisa lebih dari satu), jenis pelanggaran, dan tetapkan hukuman per tingkat. Setiap santri akan mendapat record pelanggaran terpisah.
            {reporterName && (
              <span className="block mt-1 text-primary/70">
                Pelapor: {reporterName} — tercatat otomatis dari sesi login
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form id="catat-pelanggaran-form" onSubmit={handleSubmit} className="space-y-4 py-1">
          {/* Row 1: Ranah + Kategori */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <FieldLabel htmlFor="catat-ranah" label="Ranah Instansi" required />
              <select
                id="catat-ranah"
                className={inputCls}
                value={ranah}
                onChange={(e) => setRanah(e.target.value as RanahInstansi)}
                required
              >
                <option value="" disabled>Pilih ranah...</option>
                {ALL_RANAH.map((r) => (
                  <option key={r} value={r}>{RANAH_LABEL[r]}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <FieldLabel htmlFor="catat-kategori" label="Kategori" required />
              <select
                id="catat-kategori"
                className={inputCls}
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                disabled={!ranah}
                required
              >
                <option value="">{ranah ? 'Semua kategori' : 'Pilih ranah dulu'}</option>
                {kategoriOptions.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Jenis Pelanggaran */}
          <div className="space-y-1.5">
            <FieldLabel htmlFor="catat-pelanggaran" label="Jenis Pelanggaran" required />
            <select
              id="catat-pelanggaran"
              className={inputCls}
              value={pelanggaranId}
              onChange={(e) => setPelanggaranId(e.target.value)}
              disabled={!ranah}
              required
            >
              <option value="" disabled>{ranah ? 'Pilih jenis pelanggaran...' : 'Pilih ranah dulu'}</option>
              {pelanggaranOptions.map((mp) => (
                <option key={mp.id} value={mp.id}>
                  {mp.code} — {mp.name} ({mp.points} poin)
                </option>
              ))}
            </select>
          </div>

          {/* Severity + Poin preview */}
          {selectedPelanggaran && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" aria-hidden="true" />
              <span className="text-xs text-muted-foreground">Tingkat:</span>
              <span className={cn('text-xs font-medium capitalize px-2 py-0.5 rounded-full', SEVERITY_COLORS[selectedPelanggaran.severity])}>
                {selectedPelanggaran.severity.replaceAll('_', ' ')}
              </span>
              <span className="text-xs text-muted-foreground">|</span>
              <span className="text-sm font-bold text-red-600 dark:text-red-400">-{selectedPelanggaran.points} poin</span>
              <span className="text-xs text-muted-foreground">|</span>
              <span className="text-xs text-muted-foreground">{selectedPelanggaran.kategori}</span>
            </div>
          )}

          {/* Santri multi-select */}
          <div className="space-y-2">
            <FieldLabel htmlFor="catat-santri-search" label="Santri" required />
            <div className="relative">
              <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                id="catat-santri-search"
                className={cn(inputCls, 'pl-9')}
                value={santriSearch}
                onChange={(e) => setSantriSearch(e.target.value)}
                placeholder="Cari nama, NIS, atau kelas santri..."
                autoComplete="off"
              />
              {/* Dropdown results */}
              {searchResults.length > 0 && (
                <div className="absolute z-20 left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                  {searchResults.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => addSantri(s.id)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center justify-between group"
                    >
                      <div>
                        <span className="font-medium text-foreground">{s.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">{s.nis}</span>
                      </div>
                      <span className="text-xs text-muted-foreground group-hover:hidden">{s.kelas}</span>
                      <Plus className="w-3.5 h-3.5 text-primary hidden group-hover:block" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected santri chips */}
            {selectedSantri.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedSantri.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20"
                  >
                    {s.name}
                    <button
                      type="button"
                      onClick={() => removeSantri(s.id)}
                      className="p-0.5 rounded-full hover:bg-primary/20 transition-colors"
                      aria-label={`Hapus ${s.name}`}
                    >
                      <X className="w-3 h-3" aria-hidden="true" />
                    </button>
                  </span>
                ))}
                <span className="inline-flex items-center px-2.5 py-1 text-xs text-muted-foreground">
                  {selectedSantri.length} santri dipilih
                </span>
              </div>
            )}

            {selectedSantri.length === 0 && !santriSearch && (
              <p className="text-xs text-muted-foreground/60">
                Ketik nama santri untuk mencari dan menambahkannya ke daftar.
              </p>
            )}
          </div>

          {/* ── Per-Tingkat Punishment Dropdowns ─────────────────────────── */}
          {selectedPelanggaran && tingkatGroups.length > 0 && (
            <div className="space-y-3 p-3 rounded-lg bg-amber-50/30 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-800/20">
              <div className="flex items-center gap-2">
                <Gavel className="w-4 h-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wide">
                  Hukuman per Tingkat
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Santri dikelompokkan otomatis berdasarkan tingkat. Pilih hukuman untuk setiap kelompok tingkat.
              </p>

              <div className="space-y-2.5">
                {tingkatGroups.map(([tingkat, santris]) => {
                  const options = getPunishmentOptions(tingkat);
                  return (
                    <div key={tingkat} className="bg-background/70 rounded-lg border border-border/60 p-3">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-bold text-foreground bg-muted/50 px-2 py-0.5 rounded">
                          Tingkat {tingkat}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {santris.length} santri: {santris.map((s) => s.name).join(', ')}
                        </span>
                      </div>
                      <select
                        value={punishmentByTingkat[tingkat] ?? ''}
                        onChange={(e) =>
                          setPunishmentByTingkat((prev) => ({
                            ...prev,
                            [tingkat]: e.target.value,
                          }))
                        }
                        className={cn(inputCls, 'text-xs')}
                      >
                        <option value="">Tanpa hukuman (opsional)</option>
                        {options.map((h) => (
                          <option key={h.id} value={h.id}>
                            {h.name}
                            {h.description ? ` — ${h.description}` : ''}
                          </option>
                        ))}
                      </select>
                      {options.length === 0 && (
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">
                          Tidak ada hukuman yang kompatibel (severity: {selectedPelanggaran.severity.replaceAll('_', ' ')}, min. tingkat tidak terpenuhi).
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Date + Notes */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <FieldLabel htmlFor="catat-date" label="Tanggal" required />
              <input
                id="catat-date"
                type="date"
                className={inputCls}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <FieldLabel htmlFor="catat-notes" label="Catatan" />
              <textarea
                id="catat-notes"
                className={cn(inputCls, 'h-[38px]')}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={1}
                placeholder="Opsional"
              />
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose} className="text-muted-foreground">
            Batal
          </Button>
          <Button type="submit" form="catat-pelanggaran-form" disabled={!canSubmit}>
            {selectedSantriIds.length > 1
              ? `Catat ${selectedSantriIds.length} Pelanggaran`
              : 'Catat Pelanggaran'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
