'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Kelas } from '@/data/mock-kelas';
import type { Instansi } from '@/types';
import { AlertTriangle, School } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTingkatLabel } from '@/lib/progression-label';

const CLOSE_ANIMATION_MS = 200;

const inputCls = cn(
  'w-full rounded-lg border px-3 py-2 text-sm text-foreground',
  'bg-muted/40 border-border/60',
  'placeholder:text-muted-foreground/40',
  'focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40',
  'dark:bg-white/[0.03] dark:border-white/[0.07]',
  'dark:focus:ring-primary/30 dark:focus:border-primary/30',
  'transition-[border-color,box-shadow,background-color] duration-200',
);

const dialogCls = cn(
  'bg-background/95',
  'dark:bg-background/90 dark:backdrop-blur-md',
  'dark:border dark:border-white/[0.08]',
  'dark:shadow-[0_16px_40px_oklch(0_0_0/35%)]',
);

interface FieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
}

function Field({ label, htmlFor, required, fullWidth, className, children }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', fullWidth && 'sm:col-span-2', className)}>
      <label
        htmlFor={htmlFor}
        className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest select-none"
      >
        {label}
        {required && (
          <span className="ml-1 text-primary/60 font-bold" aria-hidden="true">*</span>
        )}
      </label>
      {children}
    </div>
  );
}

// ── Edit Kelas Modal ──────────────────────────────────────────────────────────

interface EditKelasModalProps {
  open: boolean;
  kelas: Kelas | null;
  activeInstansi: Instansi;
  jenjangOptions: string[];
  onClose: () => void;
  onSave: (updated: Kelas) => void;
}

export function EditKelasModal({ open, kelas, activeInstansi, jenjangOptions, onClose, onSave }: EditKelasModalProps) {
  const [form, setForm] = useState<Kelas | null>(null);

  useEffect(() => {
    if (open && kelas) {
      setForm({ ...kelas });
    } else if (!open) {
      const t = setTimeout(() => setForm(null), CLOSE_ANIMATION_MS);
      return () => clearTimeout(t);
    }
  }, [open, kelas]);

  const handleChange = (field: keyof Kelas, value: string | number) => {
    setForm(prev => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form) onSave(form);
  };

  if (!form) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className={cn('sm:max-w-md', dialogCls)}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-0.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 bg-primary/10 ring-1 ring-primary/20">
              <School className="w-4 h-4 text-primary" aria-hidden="true" />
            </div>
            <DialogTitle className="text-base font-semibold">Edit Kelas</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground/80 leading-relaxed">
            Perubahan akan langsung diterapkan ke daftar kelas.
          </DialogDescription>
        </DialogHeader>

        <form
          id="edit-kelas-form"
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3.5 py-1"
        >
          <Field label="Nama Kelas / Rombel" htmlFor="kelas-edit-name" required fullWidth>
            <input
              id="kelas-edit-name"
              className={inputCls}
              value={form.name}
              onChange={e => handleChange('name', e.target.value)}
              placeholder="Contoh: 5A, Halaqah Ali"
              required
              autoFocus
            />
          </Field>

          <Field label="Jenjang" htmlFor="kelas-edit-jenjang" required>
            <select
              id="kelas-edit-jenjang"
              className={inputCls}
              value={form.jenjang}
              onChange={e => handleChange('jenjang', e.target.value)}
              required
            >
              {jenjangOptions.map(j => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>
          </Field>

          <Field label="Tingkat" htmlFor="kelas-edit-tingkat" required>
            <input
              id="kelas-edit-tingkat"
              type="number"
              min={1}
              max={99}
              className={inputCls}
              value={form.tingkat}
              onChange={e => handleChange('tingkat', Number(e.target.value))}
              placeholder="1"
              required
            />
          </Field>

          <Field label="Wali Kelas" htmlFor="kelas-edit-wali" fullWidth>
            <input
              id="kelas-edit-wali"
              className={inputCls}
              value={form.waliKelas}
              onChange={e => handleChange('waliKelas', e.target.value)}
              placeholder="Nama wali kelas"
            />
          </Field>

          <Field label="Status" htmlFor="kelas-edit-status" fullWidth>
            <select
              id="kelas-edit-status"
              className={inputCls}
              value={form.status}
              onChange={e => handleChange('status', e.target.value as Kelas['status'])}
            >
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Non-Aktif</option>
            </select>
          </Field>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            id="edit-kelas-cancel"
            className="text-muted-foreground"
          >
            Batal
          </Button>
          <Button type="submit" form="edit-kelas-form" id="edit-kelas-save">
            Simpan Perubahan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Delete Kelas Confirmation Modal ───────────────────────────────────────────

interface DeleteKelasModalProps {
  open: boolean;
  kelas: Kelas | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteKelasModal({ open, kelas, onClose, onConfirm }: DeleteKelasModalProps) {
  if (!kelas) return null;

  const label = kelas.jenjang ? getTingkatLabel(kelas.jenjang, kelas.tingkat) : `TKT ${kelas.tingkat}`;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className={cn('sm:max-w-sm', dialogCls)} showCloseButton={false}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0 bg-destructive/8 ring-1 ring-destructive/15">
              <AlertTriangle className="w-4 h-4 text-destructive" aria-hidden="true" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">Hapus Kelas</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Tindakan ini tidak dapat dibatalkan.</p>
            </div>
          </div>

          <DialogDescription className="space-y-3 pt-1">
            <span className="block text-sm text-muted-foreground">
              Yakin ingin menghapus kelas berikut?
            </span>

            <span className={cn(
              'flex items-center gap-2.5 px-3 py-2.5 rounded-lg',
              'bg-muted/50 border border-border/50',
              'dark:bg-white/[0.03] dark:border-white/[0.06]',
            )}>
              <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-md shrink-0 bg-muted text-muted-foreground">
                {kelas.jenjang}
              </span>
              <span className="font-semibold text-sm text-foreground line-clamp-1">{kelas.name}</span>
              <span className="ml-auto text-xs text-muted-foreground/80 shrink-0">{label}</span>
            </span>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} id="delete-kelas-cancel" className="text-muted-foreground">
            Batal
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm} id="delete-kelas-confirm">
            Hapus Kelas
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
