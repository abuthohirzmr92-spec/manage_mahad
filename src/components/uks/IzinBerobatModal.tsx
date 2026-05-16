'use client';

import { useState, useMemo, useCallback } from 'react';
import { useCollection } from '@/hooks';
import { useAuthStore } from '@/store/auth-store';
import { healthPermissionService, healthVisitService } from '@/lib/firebase/services';
import { requiresSupervisor, HEALTH_SEVERITY_LABELS } from '@/lib/health-engine';
import { createGovernanceEvent } from '@/lib/governance-events';
import { where } from 'firebase/firestore';
import type { HealthVisit } from '@/types/health';
import { X, Search, Loader2, AlertCircle } from 'lucide-react';

interface IzinBerobatModalProps {
  open: boolean;
  onClose: () => void;
}

export function IzinBerobatModal({ open, onClose }: IzinBerobatModalProps) {
  const user = useAuthStore((s) => s.user);

  // ── Visit selector ──────────────────────────────────────────────────────────
  const { data: healthVisits, loading: loadingVisits } = useCollection<HealthVisit>(
    'healthVisits',
    [where('status', '==', 'perlu_berobat_luar')],
  );

  const [visitSearch, setVisitSearch] = useState('');
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);

  const filteredVisits = useMemo(() => {
    if (!visitSearch.trim()) return healthVisits;
    const q = visitSearch.toLowerCase();
    return healthVisits.filter(
      (v) =>
        v.santriName.toLowerCase().includes(q) ||
        v.keluhan.toLowerCase().includes(q),
    );
  }, [healthVisits, visitSearch]);

  const selectedVisit = useMemo(
    () => healthVisits.find((v) => v.id === selectedVisitId) ?? null,
    [healthVisits, selectedVisitId],
  );

  // ── Form fields ─────────────────────────────────────────────────────────────
  const [tujuanBerobat, setTujuanBerobat] = useState('');
  const [alasan, setAlasan] = useState('');
  const [requiresSupervisorToggle, setRequiresSupervisorToggle] = useState(true);
  const [supervisorName, setSupervisorName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // When visit changes, auto-fill fields
  const handleSelectVisit = useCallback(
    (visitId: string) => {
      setSelectedVisitId(visitId);
      setSubmitError(null);

      const visit = healthVisits.find((v) => v.id === visitId);
      if (visit) {
        const needsSupervisor = requiresSupervisor(visit.severity);
        setRequiresSupervisorToggle(needsSupervisor);
      }
    },
    [healthVisits],
  );

  // ── Reset ───────────────────────────────────────────────────────────────────
  const resetForm = useCallback(() => {
    setVisitSearch('');
    setSelectedVisitId(null);
    setTujuanBerobat('');
    setAlasan('');
    setRequiresSupervisorToggle(true);
    setSupervisorName('');
    setSubmitError(null);
  }, []);

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!selectedVisit || !user) {
      setSubmitError('Pilih kunjungan UKS terlebih dahulu');
      return;
    }
    if (!tujuanBerobat.trim()) {
      setSubmitError('Tujuan berobat harus diisi');
      return;
    }
    if (!alasan.trim()) {
      setSubmitError('Alasan harus diisi');
      return;
    }
    if (requiresSupervisorToggle && !supervisorName.trim()) {
      setSubmitError('Nama pengawas harus diisi');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      // 1. Create health permission
      const permissionId = await healthPermissionService.create({
        santriId: selectedVisit.santriId,
        santriName: selectedVisit.santriName,
        healthVisitId: selectedVisit.id,
        keluhan: selectedVisit.keluhan,
        severity: selectedVisit.severity,
        status: 'diajukan',
        tujuanBerobat: tujuanBerobat.trim(),
        alasan: alasan.trim(),
        requiresSupervisor: requiresSupervisorToggle,
        supervisorName: requiresSupervisorToggle ? supervisorName.trim() : undefined,
        supervisorId: undefined,
        requestedById: user.id,
        requestedByName: user.name,
        approvedById: undefined,
        approvedByName: undefined,
        keluarAt: undefined,
        kembaliAt: undefined,
        catatan: undefined,
      });

      // 2. Update HealthVisit with permissionId
      await healthVisitService.update(selectedVisit.id, {
        permissionId,
      });

      // 3. Emit governance event
      const event = createGovernanceEvent(
        'health:permission_requested',
        selectedVisit.santriId,
        selectedVisit.santriName,
        {
          permissionId,
          healthVisitId: selectedVisit.id,
          tujuanBerobat: tujuanBerobat.trim(),
          severity: selectedVisit.severity,
          requiresSupervisor: requiresSupervisorToggle,
        },
      );
      console.info('[IzinBerobat] Permission requested:', event);

      resetForm();
      onClose();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Gagal membuat izin berobat',
      );
    } finally {
      setSubmitting(false);
    }
  }, [selectedVisit, user, tujuanBerobat, alasan, requiresSupervisorToggle, supervisorName, resetForm, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-lg rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh]">
        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30 shrink-0">
          <h3 className="font-bold text-lg">Buat Izin Berobat</h3>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="text-muted-foreground hover:text-foreground transition-colors bg-background p-1 rounded-md border border-border"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Body ───────────────────────────────────────────────────────────── */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Error */}
          {submitError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{submitError}</p>
            </div>
          )}

          {/* ── HealthVisit Selector ──────────────────────────────────────────── */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Kunjungan UKS <span className="text-destructive">*</span>
            </label>

            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari santri atau keluhan..."
                value={visitSearch}
                onChange={(e) => setVisitSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>

            {/* Visit list */}
            <div className="max-h-40 overflow-y-auto border border-border rounded-lg divide-y divide-border">
              {loadingVisits ? (
                <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Memuat kunjungan...
                </div>
              ) : filteredVisits.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-6">
                  {visitSearch
                    ? 'Tidak ada kunjungan yang sesuai'
                    : 'Tidak ada kunjungan yang perlu berobat luar'}
                </p>
              ) : (
                filteredVisits.map((visit) => {
                  const isSelected = visit.id === selectedVisitId;
                  return (
                    <button
                      key={visit.id}
                      type="button"
                      onClick={() => handleSelectVisit(visit.id)}
                      className={`w-full text-left px-3 py-2.5 text-sm transition-colors hover:bg-muted/50 ${
                        isSelected
                          ? 'bg-primary/10 border-l-2 border-primary'
                          : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {visit.santriName}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          {HEALTH_SEVERITY_LABELS[visit.severity]}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {visit.keluhan}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* ── Auto-filled fields (read-only) ────────────────────────────────── */}
          {selectedVisit && (
            <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/20 border border-border/40">
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Santri</p>
                <p className="text-sm font-medium mt-0.5">{selectedVisit.santriName}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Severity</p>
                <p className="text-sm font-medium mt-0.5 capitalize">{HEALTH_SEVERITY_LABELS[selectedVisit.severity]}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Keluhan</p>
                <p className="text-sm text-muted-foreground mt-0.5">{selectedVisit.keluhan}</p>
              </div>
            </div>
          )}

          {/* ── Tujuan Berobat ────────────────────────────────────────────────── */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Tujuan Berobat <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={tujuanBerobat}
              onChange={(e) => {
                setTujuanBerobat(e.target.value);
                setSubmitError(null);
              }}
              className="w-full text-sm border border-border rounded-lg px-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Contoh: Puskesmas, Klinik, Rumah Sakit..."
            />
          </div>

          {/* ── Alasan ────────────────────────────────────────────────────────── */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Alasan <span className="text-destructive">*</span>
            </label>
            <textarea
              rows={2}
              value={alasan}
              onChange={(e) => {
                setAlasan(e.target.value);
                setSubmitError(null);
              }}
              className="w-full text-sm border border-border rounded-lg px-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              placeholder="Jelaskan alasan perlunya berobat luar..."
            />
          </div>

          {/* ── Requires Supervisor Toggle ────────────────────────────────────── */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/40">
            <div>
              <p className="text-sm font-medium">Butuh Pengawas</p>
              <p className="text-xs text-muted-foreground">
                {selectedVisit && requiresSupervisor(selectedVisit.severity)
                  ? 'Wajib pengawas untuk severity sedang/darurat'
                  : 'Opsional — centang jika perlu pendampingan'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={requiresSupervisorToggle}
                onChange={(e) => {
                  setRequiresSupervisorToggle(e.target.checked);
                  setSubmitError(null);
                }}
                disabled={selectedVisit ? requiresSupervisor(selectedVisit.severity) : false}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary peer-disabled:opacity-50 peer-focus:ring-2 peer-focus:ring-primary/30 after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
            </label>
          </div>

          {/* ── Supervisor Name (conditional) ─────────────────────────────────── */}
          {requiresSupervisorToggle && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Nama Pengawas <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={supervisorName}
                onChange={(e) => {
                  setSupervisorName(e.target.value);
                  setSubmitError(null);
                }}
                className="w-full text-sm border border-border rounded-lg px-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Nama pengawas yang mendampingi..."
              />
            </div>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────────── */}
        <div className="p-4 border-t border-border bg-muted/30 flex justify-end gap-3 shrink-0">
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-background border border-border rounded-lg transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 text-sm font-bold text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {submitting && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            {submitting ? 'Menyimpan...' : 'Ajukan Izin'}
          </button>
        </div>
      </div>
    </div>
  );
}
