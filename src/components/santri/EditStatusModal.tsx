'use client';

import type { Santri } from '@/types';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EditStatusModalProps {
  /** The santri being edited. Pass null to hide the modal. */
  santri: Santri | null;
  editStatus: string;
  editTahun: string;
  editCatatan: string;
  editError: string;
  onClose: () => void;
  onStatusChange: (value: string) => void;
  onTahunChange: (value: string) => void;
  onCatatanChange: (value: string) => void;
  onSave: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Whether the selected status moves the santri out of the active list. */
const isAlumniStatus = (status: string) =>
  status === 'Lulus' || status === 'Keluar';

/** Initials from a full name — max 2 characters. */
const getInitials = (name: string) =>
  name.split(' ').map((n) => n[0]).slice(0, 2).join('');

/** Shared field class for text/number inputs and textarea. */
const FIELD_CLS =
  'w-full text-sm border border-border rounded-lg px-3 py-2 bg-background ' +
  'focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EditStatusModal({
  santri,
  editStatus,
  editTahun,
  editCatatan,
  editError,
  onClose,
  onStatusChange,
  onTahunChange,
  onCatatanChange,
  onSave,
}: EditStatusModalProps) {
  if (!santri) return null;

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
        aria-labelledby="edit-status-modal-title"
        className="bg-card border border-border shadow-2xl rounded-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* ---- Header ---- */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-muted/30">
          <h2
            id="edit-status-modal-title"
            className="text-lg font-bold text-foreground"
          >
            Edit Status Santri
          </h2>
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
        <div className="p-6 space-y-4">
          {/* Santri summary card */}
          <div className="bg-muted/50 p-3 rounded-lg flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">
              {getInitials(santri.name)}
            </div>
            <div>
              <p className="font-bold text-foreground">{santri.name}</p>
              <p className="text-xs text-muted-foreground font-mono">{santri.nis}</p>
            </div>
          </div>

          {/* Status select */}
          <div className="space-y-1.5">
            <label htmlFor="edit-status-select" className="text-sm font-semibold">
              Status Baru
            </label>
            <select
              id="edit-status-select"
              value={editStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className={FIELD_CLS}
            >
              <optgroup label="Santri Aktif">
                <option value="aktif">Aktif</option>
                <option value="cuti">Cuti</option>
                <option value="skors">Skors</option>
              </optgroup>
              <optgroup label="Alumni & Keluar">
                <option value="Lulus">Lulus</option>
                <option value="Keluar">Keluar</option>
              </optgroup>
            </select>
          </div>

          {/* Conditional alumni fields */}
          {isAlumniStatus(editStatus) && (
            <>
              <div className="space-y-1.5 animate-in slide-in-from-top-2">
                <label htmlFor="edit-tahun" className="text-sm font-semibold">
                  Tahun Keluar/Lulus
                </label>
                <input
                  id="edit-tahun"
                  type="number"
                  value={editTahun}
                  onChange={(e) => onTahunChange(e.target.value)}
                  className={FIELD_CLS}
                />
              </div>

              <div className="space-y-1.5 animate-in slide-in-from-top-2">
                <label htmlFor="edit-catatan" className="text-sm font-semibold">
                  Catatan{' '}
                  {editStatus === 'Keluar' && (
                    <span className="text-red-500" aria-hidden="true">*</span>
                  )}
                  {editStatus === 'Keluar' && (
                    <span className="sr-only">(wajib)</span>
                  )}
                </label>
                <textarea
                  id="edit-catatan"
                  value={editCatatan}
                  onChange={(e) => onCatatanChange(e.target.value)}
                  placeholder={
                    editStatus === 'Keluar'
                      ? 'Alasan keluar (wajib diisi)...'
                      : 'Catatan kelulusan (opsional)...'
                  }
                  className={`${FIELD_CLS} min-h-[80px]`}
                />
              </div>
            </>
          )}

          {/* Validation error */}
          {editError && (
            <div
              role="alert"
              className="text-xs text-red-500 font-medium bg-red-50 dark:bg-red-900/20 p-2 rounded-md border border-red-200 dark:border-red-900/50"
            >
              {editError}
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="button" onClick={onSave}>
              Simpan Perubahan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
