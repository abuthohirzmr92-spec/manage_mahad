'use client';

import { X } from 'lucide-react';
import type { Kamar, Santri } from '@/types';

interface Props {
  santri: Santri;
  kamarList: Kamar[];
  penghuniMap: Record<string, Santri[]>;
  onClose: () => void;
  onTempatkan: (santriId: string, kamarId: string) => void;
}

export function TempatkanModal({ santri, kamarList, penghuniMap, onClose, onTempatkan }: Props) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const kamarId = fd.get('kamarId') as string;
    if (!kamarId) return;
    onTempatkan(santri.id, kamarId);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-sm pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
            <h2 id="modal-title" className="font-bold text-foreground text-base">
              Tempatkan ke Kamar
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup modal"
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X aria-hidden="true" className="w-4 h-4" />
            </button>
          </div>

          {/* Santri info */}
          <div className="px-5 py-4 bg-muted/30 border-b border-border">
            <p className="font-semibold text-foreground text-sm">{santri.name}</p>
            <p className="text-xs text-muted-foreground">{santri.kelas} · {santri.totalPoinPelanggaran} poin pelanggaran</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="kamarId" className="text-sm font-medium text-foreground">
                Pilih Kamar
              </label>
              <select
                id="kamarId"
                name="kamarId"
                required
                defaultValue=""
                className="w-full rounded-lg border border-border bg-background text-foreground text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="" disabled>-- Pilih kamar --</option>
                {kamarList.map((k) => {
                  const filled = (penghuniMap[k.id] ?? []).length;
                  const sisa = k.capacity - filled;
                  const penuh = sisa <= 0;
                  return (
                    <option key={k.id} value={k.id} disabled={penuh}>
                      {k.name} — {filled}/{k.capacity} penghuni{penuh ? ' (Penuh)' : ` · sisa ${sisa} slot`}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Tempatkan
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
