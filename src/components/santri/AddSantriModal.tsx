'use client';

import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  FileSpreadsheet,
  UploadCloud,
  UserPlus,
  X,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AddMode = 'selection' | 'single' | 'multi';

interface AddSantriModalProps {
  isOpen: boolean;
  addMode: AddMode;
  onClose: () => void;
  onSetAddMode: (mode: AddMode) => void;
  onSaveSingle: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MODAL_TITLE: Record<AddMode, string> = {
  selection: 'Pilih Metode Input Santri',
  single: 'Input Santri Tunggal',
  multi: 'Input Santri Massal (Import)',
};

const MODAL_DESCRIPTION: Record<AddMode, string> = {
  selection: 'Pilih cara memasukkan data santri.',
  single: 'Cocok untuk santri pindahan.',
  multi: 'Upload file Excel untuk awal TA.',
};

/** Shared class string for basic text inputs in the single-entry form. */
const INPUT_CLS =
  'w-full px-3 py-2 border border-border rounded-lg bg-background text-sm ' +
  'focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AddSantriModal({
  isOpen,
  addMode,
  onClose,
  onSetAddMode,
  onSaveSingle,
}: AddSantriModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-santri-modal-title"
        className="bg-card border border-border shadow-2xl rounded-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* ---- Header ---- */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            {addMode !== 'selection' && (
              <button
                type="button"
                onClick={() => onSetAddMode('selection')}
                aria-label="Kembali ke pilihan metode"
                className="p-1.5 hover:bg-muted rounded-md transition-colors"
              >
                <ArrowLeft aria-hidden="true" className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
            <div>
              <h2
                id="add-santri-modal-title"
                className="text-lg font-bold text-foreground"
              >
                {MODAL_TITLE[addMode]}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                {MODAL_DESCRIPTION[addMode]}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X aria-hidden="true" className="w-5 h-5" />
          </button>
        </div>

        {/* ---- Body ---- */}
        <div className="p-6">
          {/* Selection */}
          {addMode === 'selection' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => onSetAddMode('single')}
                className="flex flex-col items-center text-center gap-4 p-8 border-2 border-border border-dashed rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-colors group"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <UserPlus aria-hidden="true" className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Input Tunggal</h3>
                  <p className="text-sm text-muted-foreground mt-2">Satu per satu.</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onSetAddMode('multi')}
                className="flex flex-col items-center text-center gap-4 p-8 border-2 border-border border-dashed rounded-xl hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-colors group"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                  <FileSpreadsheet aria-hidden="true" className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Input Massal</h3>
                  <p className="text-sm text-muted-foreground mt-2">Upload file Excel/CSV.</p>
                </div>
              </button>
            </div>
          )}

          {/* Single entry form */}
          {addMode === 'single' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Form ini digunakan untuk memasukkan data tunggal.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="santri-nama" className="sr-only">
                    Nama Santri
                  </label>
                  <input
                    id="santri-nama"
                    type="text"
                    className={INPUT_CLS}
                    placeholder="Nama Santri"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="santri-nis" className="sr-only">
                    NIS
                  </label>
                  <input
                    id="santri-nis"
                    type="text"
                    className={INPUT_CLS}
                    placeholder="NIS"
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <Button onClick={onSaveSingle}>Simpan Santri</Button>
              </div>
            </div>
          )}

          {/* Bulk import */}
          {addMode === 'multi' && (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-xl">
              <UploadCloud aria-hidden="true" className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-sm font-medium">Tarik &amp; Lepas file Excel</p>
              <Button type="button" variant="secondary" className="mt-4">
                Pilih File
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
