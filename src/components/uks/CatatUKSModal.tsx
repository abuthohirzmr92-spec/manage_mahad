'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCollection } from '@/hooks';
import { useAuthStore } from '@/store/auth-store';
import { healthVisitService } from '@/lib/firebase/services';
import { createGovernanceEvent } from '@/lib/governance-events';
import { cn } from '@/lib/utils';
import { Search, X, Plus, AlertCircle } from 'lucide-react';
import type { Santri } from '@/types';
import type { HealthVisitCategory, HealthSeverity } from '@/types/health';

// ── Shared input styling ────────────────────────────────────────────────────────

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

// ── Field Label ────────────────────────────────────────────────────────────────

function FieldLabel({
  htmlFor,
  label,
  required,
}: {
  htmlFor: string;
  label: string;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest select-none"
    >
      {label}
      {required && (
        <span className="ml-1 text-primary/60 font-bold" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}

// ── Props ──────────────────────────────────────────────────────────────────────

interface CatatUKSModalProps {
  open: boolean;
  onClose: () => void;
}

// ── Component ──────────────────────────────────────────────────────────────────

export function CatatUKSModal({ open, onClose }: CatatUKSModalProps) {
  const user = useAuthStore((s) => s.user);
  const { data: santriList } = useCollection<Santri>('santri');

  // ── Form state ──────────────────────────────────────────────────────────────
  const [santriSearch, setSantriSearch] = useState('');
  const [selectedSantri, setSelectedSantri] = useState<Santri | null>(null);
  const [keluhan, setKeluhan] = useState('');
  const [category, setCategory] = useState<HealthVisitCategory | ''>('');
  const [severity, setSeverity] = useState<HealthSeverity | ''>('');
  const [tindakan, setTindakan] = useState('');
  const [catatan, setCatatan] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Reset form on open ──────────────────────────────────────────────────────
  useEffect(() => {
    if (open) {
      setSantriSearch('');
      setSelectedSantri(null);
      setKeluhan('');
      setCategory('');
      setSeverity('');
      setTindakan('');
      setCatatan('');
      setError(null);
      setSubmitting(false);
    }
  }, [open]);

  // ── Santri search results ───────────────────────────────────────────────────
  const searchResults = useMemo(() => {
    if (!santriSearch.trim()) return [];
    const q = santriSearch.toLowerCase();
    return santriList
      .filter((s) => {
        if (selectedSantri && s.id === selectedSantri.id) return false;
        return (
          s.name.toLowerCase().includes(q) ||
          s.nis.toLowerCase().includes(q)
        );
      })
      .slice(0, 8);
  }, [santriList, santriSearch, selectedSantri]);

  // ── Validation ──────────────────────────────────────────────────────────────
  const canSubmit =
    selectedSantri !== null &&
    keluhan.trim().length > 0 &&
    severity !== '' &&
    category !== '';

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSubmit || !selectedSantri || !user) return;

      setSubmitting(true);
      setError(null);

      try {
        const now = new Date().toISOString();
        const visitId = await healthVisitService.create({
          santriId: selectedSantri.id,
          santriName: selectedSantri.name,
          keluhan: keluhan.trim(),
          category: category as HealthVisitCategory,
          severity: severity as HealthSeverity,
          status: 'observasi',
          petugasId: user.id,
          petugasName: user.name,
          tindakan: tindakan.trim() || undefined,
          catatan: catatan.trim() || undefined,
          masukAt: now,
        });

        // Emit health:visit_created event
        createGovernanceEvent(
          'health:visit_created',
          selectedSantri.id,
          selectedSantri.name,
          {
            visitId,
            keluhan: keluhan.trim(),
            severity,
            category,
            petugasName: user.name,
          },
        );

        // If severity is 'darurat', also emit health:emergency
        if (severity === 'darurat') {
          createGovernanceEvent(
            'health:emergency',
            selectedSantri.id,
            selectedSantri.name,
            {
              visitId,
              keluhan: keluhan.trim(),
              severity: 'darurat',
              petugasName: user.name,
            },
          );
        }

        onClose();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Gagal menyimpan kunjungan',
        );
      } finally {
        setSubmitting(false);
      }
    },
    [
      canSubmit,
      selectedSantri,
      user,
      keluhan,
      category,
      severity,
      tindakan,
      catatan,
      onClose,
    ],
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className={cn('sm:max-w-lg', dialogCls)}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-0.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 bg-primary/10 ring-1 ring-primary/20">
              <Plus className="w-4 h-4 text-primary" aria-hidden="true" />
            </div>
            <DialogTitle className="text-base font-semibold">
              Catat Kunjungan UKS
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground/80 leading-relaxed">
            Catat kunjungan santri ke UKS untuk pemeriksaan atau penanganan
            medis.
            {user && (
              <span className="block mt-1 text-primary/70">
                Petugas: {user.name}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form
          id="catat-uks-form"
          onSubmit={handleSubmit}
          className="space-y-4 py-1"
        >
          {/* Santri Search */}
          <div className="space-y-1.5">
            <FieldLabel htmlFor="uks-santri-search" label="Santri" required />
            <div className="relative">
              <Search
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
              />
              <input
                id="uks-santri-search"
                className={cn(inputCls, 'pl-9')}
                value={santriSearch}
                onChange={(e) => setSantriSearch(e.target.value)}
                placeholder="Cari nama santri..."
                autoComplete="off"
              />
              {searchResults.length > 0 && (
                <div className="absolute z-20 left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                  {searchResults.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setSelectedSantri(s);
                        setSantriSearch('');
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center justify-between group"
                    >
                      <div>
                        <span className="font-medium text-foreground">
                          {s.name}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {s.nis}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {s.kelas}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedSantri && (
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20">
                  {selectedSantri.name}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSantri(null);
                      setSantriSearch('');
                    }}
                    className="p-0.5 rounded-full hover:bg-primary/20 transition-colors"
                    aria-label={`Hapus ${selectedSantri.name}`}
                  >
                    <X className="w-3 h-3" aria-hidden="true" />
                  </button>
                </span>
              </div>
            )}
            {!selectedSantri && !santriSearch && (
              <p className="text-xs text-muted-foreground/60">
                Ketik nama santri untuk mencari.
              </p>
            )}
          </div>

          {/* Keluhan */}
          <div className="space-y-1.5">
            <FieldLabel htmlFor="uks-keluhan" label="Keluhan" required />
            <textarea
              id="uks-keluhan"
              className={cn(inputCls, 'min-h-[60px]')}
              value={keluhan}
              onChange={(e) => setKeluhan(e.target.value)}
              placeholder="Deskripsi keluhan santri..."
              required
            />
          </div>

          {/* Category + Severity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <FieldLabel htmlFor="uks-category" label="Kategori" required />
              <select
                id="uks-category"
                className={inputCls}
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as HealthVisitCategory)
                }
                required
              >
                <option value="" disabled>
                  Pilih kategori...
                </option>
                <option value="pemeriksaan">Pemeriksaan</option>
                <option value="observasi">Observasi</option>
                <option value="tindakan">Tindakan</option>
                <option value="rujukan">Rujukan</option>
                <option value="izin_berobat">Izin Berobat</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <FieldLabel htmlFor="uks-severity" label="Severity" required />
              <select
                id="uks-severity"
                className={inputCls}
                value={severity}
                onChange={(e) =>
                  setSeverity(e.target.value as HealthSeverity)
                }
                required
              >
                <option value="" disabled>
                  Pilih tingkat...
                </option>
                <option value="ringan">Ringan</option>
                <option value="sedang">Sedang</option>
                <option value="darurat">Darurat</option>
              </select>
            </div>
          </div>

          {/* Tindakan */}
          <div className="space-y-1.5">
            <FieldLabel htmlFor="uks-tindakan" label="Tindakan" />
            <textarea
              id="uks-tindakan"
              className={cn(inputCls, 'min-h-[60px]')}
              value={tindakan}
              onChange={(e) => setTindakan(e.target.value)}
              placeholder="Tindakan yang diberikan (opsional)"
            />
          </div>

          {/* Catatan */}
          <div className="space-y-1.5">
            <FieldLabel htmlFor="uks-catatan" label="Catatan" />
            <textarea
              id="uks-catatan"
              className={cn(inputCls, 'min-h-[60px]')}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Catatan tambahan (opsional)"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30">
              <AlertCircle
                className="w-4 h-4 text-red-500 shrink-0"
                aria-hidden="true"
              />
              <p className="text-xs text-red-600 dark:text-red-400">
                {error}
              </p>
            </div>
          )}
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={submitting}
          >
            Batal
          </Button>
          <Button
            type="submit"
            form="catat-uks-form"
            disabled={!canSubmit || submitting}
          >
            {submitting ? 'Menyimpan...' : 'Catat Kunjungan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
