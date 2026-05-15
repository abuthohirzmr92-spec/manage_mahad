import type { FormEvent } from 'react';
import { X, School } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Instansi } from '@/types';
import { INSTANSI_LABEL } from '@/types';
import { cn } from '@/lib/utils';

export type NewClassData = {
  name: string;
  jenjang: string;
  tingkat: string;
  waliKelas: string;
};

interface AddKelasModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeInstansi: Instansi;
  jenjangOptions: string[];
  newClassData: NewClassData;
  setNewClassData: (data: NewClassData) => void;
  onSubmit: (e: FormEvent) => void;
}

const inputCls = cn(
  'w-full rounded-lg border px-3 py-2 text-sm text-foreground',
  'bg-muted/40 border-border/60',
  'placeholder:text-muted-foreground/40',
  'focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40',
  'dark:bg-white/[0.03] dark:border-white/[0.07]',
  'transition-[border-color,box-shadow,background-color] duration-200',
);

function Field({ label, htmlFor, required, children }: {
  label: string; htmlFor?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest select-none">
        {label}
        {required && <span className="ml-1 text-primary/60 font-bold" aria-hidden="true">*</span>}
      </label>
      {children}
    </div>
  );
}

export function AddKelasModal({ isOpen, onClose, activeInstansi, jenjangOptions, newClassData, setNewClassData, onSubmit }: AddKelasModalProps) {
  if (!isOpen) return null;

  const tabLabel = INSTANSI_LABEL[activeInstansi];

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-kelas-modal-title"
        className={cn(
          'w-full max-w-md overflow-hidden rounded-2xl',
          'bg-background/95 border border-border shadow-xl',
          'dark:bg-background/90 dark:border-white/[0.08]',
          'dark:shadow-[0_16px_40px_oklch(0_0_0/35%)]',
          'animate-in fade-in zoom-in-95 duration-200',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 ring-1 ring-primary/20">
              <School className="w-4 h-4 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h2 id="add-kelas-modal-title" className="text-base font-semibold text-foreground">
                Tambah Kelas {tabLabel}
              </h2>
              <p className="text-xs text-muted-foreground/80 mt-0.5">Isi formulir untuk membuat entitas kelas baru.</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Tutup modal"
            onClick={onClose}
            className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground/70 hover:text-foreground transition-[color,background-color] duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="p-5 space-y-4">
          <Field label="Nama Kelas / Rombel" htmlFor="kelas-nama" required>
            <input
              id="kelas-nama"
              required
              type="text"
              placeholder="Contoh: 5A, Halaqah Ali, Tamhidi B"
              className={inputCls}
              value={newClassData.name}
              onChange={e => setNewClassData({ ...newClassData, name: e.target.value })}
              autoFocus
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Jenjang" htmlFor="kelas-jenjang" required>
              <select
                id="kelas-jenjang"
                required
                className={inputCls}
                value={newClassData.jenjang}
                onChange={e => setNewClassData({ ...newClassData, jenjang: e.target.value })}
              >
                <option value="" disabled>Pilih Jenjang</option>
                {jenjangOptions.map(j => (
                  <option key={j} value={j}>{j}</option>
                ))}
              </select>
            </Field>

            <Field label="Tingkat" htmlFor="kelas-tingkat" required>
              <input
                id="kelas-tingkat"
                required
                type="number"
                min="1"
                max="99"
                placeholder="1"
                className={inputCls}
                value={newClassData.tingkat}
                onChange={e => setNewClassData({ ...newClassData, tingkat: e.target.value })}
              />
            </Field>
          </div>

          <Field label="Wali Kelas (Opsional)" htmlFor="kelas-wali">
            <input
              id="kelas-wali"
              type="text"
              placeholder="Ketik nama ustadz..."
              className={inputCls}
              value={newClassData.waliKelas}
              onChange={e => setNewClassData({ ...newClassData, waliKelas: e.target.value })}
            />
          </Field>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-border/60 mt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="text-muted-foreground">
              Batal
            </Button>
            <Button type="submit">
              Simpan Kelas
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
