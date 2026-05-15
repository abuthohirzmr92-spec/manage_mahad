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
import type { Subject, ClassData } from '@/data/mock-mapel';
import type { TeacherAssignment } from '@/types';
import { Search, Users, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const inputCls = cn(
  'w-full rounded-lg border px-3 py-2 text-sm text-foreground',
  'bg-muted/40 border-border/60',
  'focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40',
  'dark:bg-white/[0.03] dark:border-white/[0.07]',
  'transition-[border-color,box-shadow] duration-200',
);

const dialogCls = cn(
  'bg-background/95',
  'dark:bg-background/90 dark:backdrop-blur-md',
  'dark:border dark:border-white/[0.08]',
);

interface Props {
  open: boolean;
  subject: Subject | null;
  classDataList: ClassData[];
  guruNameList: string[];
  existingAssignments: TeacherAssignment[];
  onClose: () => void;
  onSave: (assignments: Array<{ kelasId: string; kelasName: string; guruName: string; status: 'active' | 'inactive' }>) => void;
}

export function AssignTeacherModal({
  open,
  subject,
  classDataList,
  guruNameList,
  existingAssignments,
  onClose,
  onSave,
}: Props) {
  // Per-class guru selections — keyed by kelasName (stable display identity)
  const [guruMap, setGuruMap] = useState<Record<string, string>>({});

  // Auto-matched classes: same jenjang + tingkat
  const matchedClasses = useMemo(() => {
    if (!subject) return [];
    return classDataList.filter(
      (c) => c.tingkat === subject.tingkat
    );
  }, [subject, classDataList]);

  // Pre-fill from existing assignments on open
  useEffect(() => {
    if (open && subject) {
      const prefill: Record<string, string> = {};
      for (const a of existingAssignments) {
        if (a.mapelId === subject.id && a.status === 'active') {
          prefill[a.kelasName] = a.guruName;
        }
      }
      setGuruMap(prefill);
    }
  }, [open, subject, existingAssignments]);

  if (!subject) return null;

  const setGuru = (kelasName: string, guruName: string) => {
    setGuruMap((prev) => ({ ...prev, [kelasName]: guruName }));
  };

  const removeGuru = (kelasName: string) => {
    setGuruMap((prev) => {
      const next = { ...prev };
      delete next[kelasName];
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const records = matchedClasses
      .filter((c) => guruMap[c.name]?.trim())
      .map((c) => ({
        kelasId: `cls-${c.tingkat}-${c.name.replace(/\s+/g, '-').toLowerCase()}`,
        kelasName: c.name,
        guruName: guruMap[c.name].trim(),
        status: 'active' as const,
      }));
    onSave(records);
  };

  const assignedCount = matchedClasses.filter((c) => guruMap[c.name]?.trim()).length;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className={cn('sm:max-w-lg', dialogCls)}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-0.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 bg-primary/10 ring-1 ring-primary/20">
              <Users className="w-4 h-4 text-primary" aria-hidden="true" />
            </div>
            <DialogTitle className="text-base font-semibold">Distribusi Guru Pengampu</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground/80 leading-relaxed">
            Atur guru pengampu per kelas yang terhubung ke mata pelajaran ini melalui progression context.
          </DialogDescription>
        </DialogHeader>

        {/* Section 1: Readonly info */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 px-4 py-3 rounded-lg bg-muted/30 border border-border/50 text-sm">
          <span className="text-muted-foreground text-xs uppercase tracking-wider">Mapel</span>
          <span className="font-semibold text-foreground">{subject.name}</span>
          <span className="text-border/60 select-none">|</span>
          <span className="text-xs text-muted-foreground">{subject.jenjang}</span>
          <span className="text-xs text-muted-foreground">Tk.{subject.tingkat}</span>
          {subject.code && (
            <>
              <span className="text-border/60 select-none">|</span>
              <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{subject.code}</span>
            </>
          )}
        </div>

        <form id="assign-teacher-form" onSubmit={handleSubmit} className="space-y-3 py-1">
          {/* Section 2: Distribution table */}
          <div>
            <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
              Kelas yang Terhubung ({matchedClasses.length})
            </h4>

            {matchedClasses.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center border border-dashed border-border rounded-lg">
                Tidak ada kelas dengan jenjang &amp; tingkat yang sama.
              </p>
            ) : (
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="text-left px-4 py-2.5 font-medium text-xs">Kelas</th>
                      <th className="text-left px-4 py-2.5 font-medium text-xs">Guru Pengampu</th>
                      <th className="w-10 px-2 py-2.5" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {matchedClasses.map((c) => (
                      <GuruRow
                        key={c.name}
                        kelasName={c.name}
                        guruName={guruMap[c.name] ?? ''}
                        guruNameList={guruNameList}
                        onChange={(name) => setGuru(c.name, name)}
                        onRemove={() => removeGuru(c.name)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Summary footer */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
            <Users className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{assignedCount} dari {matchedClasses.length} kelas memiliki guru pengampu</span>
          </div>
        </form>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose} className="text-muted-foreground">
            Batal
          </Button>
          <Button type="submit" form="assign-teacher-form" disabled={assignedCount === 0}>
            Simpan Distribusi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Per-row guru selector ──────────────────────────────────────────────────────
function GuruRow({
  kelasName,
  guruName,
  guruNameList,
  onChange,
  onRemove,
}: {
  kelasName: string;
  guruName: string;
  guruNameList: string[];
  onChange: (name: string) => void;
  onRemove: () => void;
}) {
  const [search, setSearch] = useState(guruName);
  const [showDropdown, setShowDropdown] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return guruNameList.slice(0, 6);
    const q = search.toLowerCase();
    return guruNameList.filter((n) => n.toLowerCase().includes(q)).slice(0, 6);
  }, [guruNameList, search]);

  // Sync external value in
  useEffect(() => { setSearch(guruName); }, [guruName]);

  return (
    <tr className="hover:bg-muted/20 transition-colors">
      <td className="px-4 py-2.5">
        <span className="font-medium text-foreground text-xs">{kelasName}</span>
      </td>
      <td className="px-4 py-2.5 relative">
        <div className="relative">
          <Search aria-hidden="true" className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            className={cn(inputCls, 'pl-8 py-1.5 text-xs')}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            placeholder="Cari atau ketik nama guru..."
            autoComplete="off"
          />
          {showDropdown && filtered.length > 0 && (
            <div className="absolute z-20 left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg max-h-36 overflow-y-auto">
              {filtered.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    onChange(name);
                    setSearch(name);
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted transition-colors"
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>
      </td>
      <td className="px-2 py-2.5">
        {guruName && (
          <button
            type="button"
            onClick={onRemove}
            className="p-1 text-muted-foreground hover:text-red-500 rounded transition-colors"
            aria-label={`Hapus guru ${guruName} dari ${kelasName}`}
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        )}
      </td>
    </tr>
  );
}
