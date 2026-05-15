'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Users, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Subject } from '@/data/mock-mapel';
import type { Kelas } from '@/data/mock-kelas/types';
import type { TeacherAssignment } from '@/types';

const inputCls = cn(
  'w-full rounded-lg border px-2.5 py-1.5 text-xs text-foreground',
  'bg-muted/40 border-border/60',
  'placeholder:text-muted-foreground/40',
  'focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40',
  'transition-[border-color,box-shadow] duration-200',
);

// ── Cell key encoding ─────────────────────────────────────────────────────
function cellKey(mapelId: string, kelasName: string) {
  return `${mapelId}::${kelasName}`;
}

// ── Props ──────────────────────────────────────────────────────────────────

interface Props {
  mapelList: Subject[];
  kelasList: Kelas[];
  existingAssignments: TeacherAssignment[];
  guruNameList: string[];
  onSave: (ops: Array<{ mapelId: string; kelasId: string; kelasName: string; guruName: string }>) => void;
}

export function DistribusiMatrix({
  mapelList,
  kelasList,
  existingAssignments,
  guruNameList,
  onSave,
}: Props) {
  // ── Cell state: key → guru name ─────────────────────────────────────────
  const [cells, setCells] = useState<Record<string, string>>({});
  const [initialCells, setInitialCells] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Pre-fill from existing assignments
  useEffect(() => {
    const init: Record<string, string> = {};
    for (const a of existingAssignments) {
      if (a.status !== 'active') continue;
      // Match: mapelId + kelasName
      const k = cellKey(a.mapelId, a.kelasName);
      init[k] = a.guruName;
    }
    setCells({ ...init });
    setInitialCells({ ...init });
  }, [existingAssignments]);

  // ── Dirty detection ──────────────────────────────────────────────────────
  const dirty = useMemo(() => {
    for (const mapel of mapelList) {
      for (const kelas of kelasList) {
        const k = cellKey(mapel.id, kelas.name);
        if ((cells[k] ?? '') !== (initialCells[k] ?? '')) return true;
      }
    }
    return false;
  }, [mapelList, kelasList, cells, initialCells]);

  // ── Set guru for a cell ──────────────────────────────────────────────────
  const setGuru = useCallback((mapelId: string, kelasName: string, name: string) => {
    setCells((prev) => ({
      ...prev,
      [cellKey(mapelId, kelasName)]: name,
    }));
  }, []);

  const removeGuru = useCallback((mapelId: string, kelasName: string) => {
    setCells((prev) => {
      const next = { ...prev };
      delete next[cellKey(mapelId, kelasName)];
      return next;
    });
  }, []);

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    const records: Array<{ mapelId: string; kelasId: string; kelasName: string; guruName: string }> = [];
    for (const mapel of mapelList) {
      for (const kelas of kelasList) {
        const k = cellKey(mapel.id, kelas.name);
        const name = cells[k]?.trim();
        if (name && name !== initialCells[k]) {
          records.push({
            mapelId: mapel.id,
            kelasId: kelas.id,
            kelasName: kelas.name,
            guruName: name,
          });
        }
      }
    }
    // Also include deletions
    for (const [k, oldName] of Object.entries(initialCells)) {
      if (oldName && !cells[k]?.trim()) {
        const [mapelId, kelasName] = k.split('::');
        const kelas = kelasList.find((kl) => kl.name === kelasName);
        if (kelas && mapelList.some((m) => m.id === mapelId)) {
          records.push({
            mapelId,
            kelasId: kelas.id,
            kelasName,
            guruName: '', // signal removal
          });
        }
      }
    }
    if (records.length > 0) {
      onSave(records);
    }
    setSaving(false);
  };

  // ── Summary stats ────────────────────────────────────────────────────────
  const totalCells = mapelList.length * kelasList.length;
  const filledCells = Object.values(cells).filter((v) => v?.trim()).length;

  if (mapelList.length === 0 || kelasList.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-xl">
        <AlertCircle className="w-8 h-8 mx-auto mb-3 opacity-30" aria-hidden="true" />
        <p className="text-sm font-medium">Data tidak lengkap</p>
        <p className="text-xs mt-1">
          {mapelList.length === 0 && 'Belum ada mata pelajaran '}
          {mapelList.length === 0 && kelasList.length === 0 && 'dan '}
          {kelasList.length === 0 && 'Belum ada kelas/rombel '}
          pada jenjang dan tingkat ini.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Users className="w-3.5 h-3.5" aria-hidden="true" />
          <span>
            {filledCells} dari {totalCells} sel terisi
            {filledCells > 0 && (
              <span className="ml-1 text-primary/70">
                ({Math.round((filledCells / totalCells) * 100)}%)
              </span>
            )}
          </span>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || saving}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm active:scale-95',
            dirty
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'bg-muted text-muted-foreground cursor-not-allowed',
          )}
        >
          {saving ? 'Menyimpan...' : dirty ? 'Simpan Perubahan' : 'Tersimpan'}
        </button>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto rounded-xl border border-border shadow-sm">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-muted/50">
              <th className="sticky left-0 z-10 bg-muted/50 text-left px-4 py-3 font-medium text-muted-foreground min-w-[160px] border-r border-border">
                Mata Pelajaran
              </th>
              {kelasList.map((kelas) => (
                <th
                  key={kelas.id}
                  className="text-center px-3 py-3 font-medium text-muted-foreground min-w-[180px] border-r border-border last:border-r-0"
                >
                  {kelas.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {mapelList.map((mapel) => (
              <tr key={mapel.id} className="hover:bg-muted/10 transition-colors group">
                <td className="sticky left-0 z-10 bg-background group-hover:bg-muted/10 px-4 py-2.5 border-r border-border">
                  <div className="font-medium text-foreground">{mapel.name}</div>
                  {mapel.code && (
                    <div className="text-[10px] font-mono text-muted-foreground mt-0.5">{mapel.code}</div>
                  )}
                </td>
                {kelasList.map((kelas) => (
                  <td key={kelas.id} className="px-2 py-2 border-r border-border last:border-r-0">
                    <GuruCell
                      value={cells[cellKey(mapel.id, kelas.name)] ?? ''}
                      guruNameList={guruNameList}
                      onChange={(name) => setGuru(mapel.id, kelas.name, name)}
                      onRemove={() => removeGuru(mapel.id, kelas.name)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Per-cell guru selector ─────────────────────────────────────────────────

function GuruCell({
  value,
  guruNameList,
  onChange,
  onRemove,
}: {
  value: string;
  guruNameList: string[];
  onChange: (name: string) => void;
  onRemove: () => void;
}) {
  const [search, setSearch] = useState(value);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setSearch(value);
  }, [value]);

  const filtered = useMemo(() => {
    if (!search.trim()) return guruNameList.slice(0, 6);
    const q = search.toLowerCase();
    return guruNameList.filter((n) => n.toLowerCase().includes(q)).slice(0, 6);
  }, [guruNameList, search]);

  return (
    <div className="relative">
      <Search
        aria-hidden="true"
        className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground/60"
      />
      <input
        className={cn(inputCls, 'pl-6')}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        placeholder={value || 'Belum ada guru'}
        autoComplete="off"
      />
      {value && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
            setSearch('');
          }}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-red-500 rounded transition-colors"
          aria-label="Hapus guru"
        >
          <X className="w-3 h-3" aria-hidden="true" />
        </button>
      )}
      {open && filtered.length > 0 && (
        <div className="absolute z-30 left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg max-h-32 overflow-y-auto">
          {filtered.map((name) => (
            <button
              key={name}
              type="button"
              onMouseDown={() => {
                onChange(name);
                setSearch(name);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted transition-colors"
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
