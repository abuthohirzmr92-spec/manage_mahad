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
import { type Subject } from '@/data/mock-mapel';
import type { Instansi } from '@/types';
import { getTingkatLabel } from '@/lib/progression-label';
import { AlertTriangle, BookOpen, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const CLOSE_ANIMATION_MS = 200;

// ── Shared input token ────────────────────────────────────────────────────────
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

// ── Field wrapper ─────────────────────────────────────────────────────────────

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

// ── Add Mapel Modal ───────────────────────────────────────────────────────────

interface AddMapelModalProps {
  open: boolean;
  activeInstansi: Instansi;
  jenjangOptions: string[];
  onClose: () => void;
  onSave: (data: Omit<Subject, 'id'>) => void;
}

const EMPTY_FORM = {
  name: '',
  code: '',
  jenjang: '',
  tingkat: 1,
  status: 'active' as const,
};

export function AddMapelModal({ open, activeInstansi, jenjangOptions, onClose, onSave }: AddMapelModalProps) {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (open) {
      setForm({ ...EMPTY_FORM, jenjang: jenjangOptions[0] ?? '' });
    }
  }, [open, jenjangOptions[0]]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.jenjang) return;
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className={cn('sm:max-w-md', dialogCls)}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-0.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 bg-primary/10 ring-1 ring-primary/20">
              <Plus className="w-4 h-4 text-primary" aria-hidden="true" />
            </div>
            <DialogTitle className="text-base font-semibold">Tambah Mata Pelajaran</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground/80 leading-relaxed">
            Mata pelajaran akan terikat ke tingkat (Global Progression Index) dan diwariskan ke seluruh kelas pada tingkat tersebut.
          </DialogDescription>
        </DialogHeader>

        <form
          id="add-mapel-form"
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3.5 py-1"
        >
          <Field label="Nama Mata Pelajaran" htmlFor="add-mapel-name" required fullWidth>
            <input
              id="add-mapel-name"
              className={inputCls}
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Nama mata pelajaran"
              required
              autoFocus
            />
          </Field>

          <Field label="Jenjang" htmlFor="add-mapel-jenjang" required>
            <select
              id="add-mapel-jenjang"
              className={inputCls}
              value={form.jenjang}
              onChange={(e) => handleChange('jenjang', e.target.value)}
              required
            >
              {jenjangOptions.map((j) => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>
          </Field>

          <Field label="Tingkat (GPI)" htmlFor="add-mapel-tingkat" required>
            <input
              id="add-mapel-tingkat"
              type="number"
              min={1}
              max={99}
              className={inputCls}
              value={form.tingkat}
              onChange={(e) => handleChange('tingkat', Number(e.target.value))}
              required
            />
          </Field>

          <Field label="Kode (Opsional)" htmlFor="add-mapel-code">
            <input
              id="add-mapel-code"
              className={inputCls}
              value={form.code}
              onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
              placeholder="XXX-00"
            />
          </Field>

          <Field label="Status" htmlFor="add-mapel-status">
            <select
              id="add-mapel-status"
              className={inputCls}
              value={form.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              <option value="active">Aktif</option>
              <option value="inactive">Non-Aktif</option>
            </select>
          </Field>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="text-muted-foreground"
          >
            Batal
          </Button>
          <Button type="submit" form="add-mapel-form">
            Tambah Mapel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Edit Mapel Modal ──────────────────────────────────────────────────────────

interface EditMapelModalProps {
  open: boolean;
  subject: Subject | null;
  jenjangOptions: string[];
  onClose: () => void;
  onSave: (updated: Subject) => void;
}

export function EditMapelModal({ open, subject, jenjangOptions, onClose, onSave }: EditMapelModalProps) {
  const [form, setForm] = useState<Subject | null>(null);

  useEffect(() => {
    if (open && subject) {
      setForm({ ...subject });
    } else if (!open) {
      const t = setTimeout(() => setForm(null), CLOSE_ANIMATION_MS);
      return () => clearTimeout(t);
    }
  }, [open, subject]);

  const handleChange = (field: keyof Subject, value: string | number) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
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
              <BookOpen className="w-4 h-4 text-primary" aria-hidden="true" />
            </div>
            <DialogTitle className="text-base font-semibold">Edit Mata Pelajaran</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground/80 leading-relaxed">
            Perubahan akan langsung diterapkan ke daftar mata pelajaran.
          </DialogDescription>
        </DialogHeader>

        <form
          id="edit-mapel-form"
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3.5 py-1"
        >
          <Field label="Nama Mata Pelajaran" htmlFor="mapel-name" required fullWidth>
            <input
              id="mapel-name"
              className={inputCls}
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Nama mata pelajaran"
              required
              autoFocus
            />
          </Field>

          <Field label="Jenjang" htmlFor="mapel-jenjang" required>
            <select
              id="mapel-jenjang"
              className={inputCls}
              value={form.jenjang}
              onChange={(e) => handleChange('jenjang', e.target.value)}
              required
            >
              {jenjangOptions.map((j) => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>
          </Field>

          <Field label="Tingkat (GPI)" htmlFor="mapel-tingkat" required>
            <input
              id="mapel-tingkat"
              type="number"
              min={1}
              max={99}
              className={inputCls}
              value={form.tingkat}
              onChange={(e) => handleChange('tingkat', Number(e.target.value))}
              required
            />
          </Field>

          <Field label="Kode" htmlFor="mapel-code">
            <input
              id="mapel-code"
              className={inputCls}
              value={form.code ?? ''}
              onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
              placeholder="XXX-00"
            />
          </Field>

          <Field label="Status" htmlFor="mapel-status">
            <select
              id="mapel-status"
              className={inputCls}
              value={form.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              <option value="active">Aktif</option>
              <option value="inactive">Non-Aktif</option>
            </select>
          </Field>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="text-muted-foreground"
          >
            Batal
          </Button>
          <Button type="submit" form="edit-mapel-form">
            Simpan Perubahan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Delete Mapel Confirmation Modal ───────────────────────────────────────────

interface DeleteMapelModalProps {
  open: boolean;
  subject: Subject | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteMapelModal({ open, subject, onClose, onConfirm }: DeleteMapelModalProps) {
  if (!subject) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className={cn('sm:max-w-sm', dialogCls)} showCloseButton={false}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0 bg-destructive/8 ring-1 ring-destructive/15">
              <AlertTriangle className="w-4 h-4 text-destructive" aria-hidden="true" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                Hapus Mata Pelajaran
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
          </div>

          <DialogDescription className="space-y-3 pt-1">
            <span className="block text-sm text-muted-foreground">
              Yakin ingin menghapus mata pelajaran berikut?
            </span>

            <span className={cn(
              'flex items-center gap-2.5 px-3 py-2.5 rounded-lg',
              'bg-muted/50 border border-border/50',
              'dark:bg-white/[0.03] dark:border-white/[0.06]',
            )}>
              {subject.code && (
                <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-md shrink-0 bg-muted text-muted-foreground">
                  {subject.code}
                </span>
              )}
              <span className="text-[10px] text-muted-foreground/70">
                {subject.jenjang} / {getTingkatLabel(subject.jenjang, subject.tingkat)}
              </span>
              <span className="font-semibold text-sm text-foreground line-clamp-1">
                {subject.name}
              </span>
            </span>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="text-muted-foreground"
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
          >
            Hapus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
