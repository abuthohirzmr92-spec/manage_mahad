'use client';

import type { Alumni } from '@/types';
import { PageCard } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { FileBadge, Download, Search } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AlumniTableProps {
  /** Filtered list to render. */
  rows: Alumni[];
  /** Filter controls */
  search: string;
  filterTahun: string;
  filterStatusKeluar: string;
  uniqueTahunAlumni: number[];
  /** Filter setters */
  onSearchChange: (v: string) => void;
  onFilterTahunChange: (v: string) => void;
  onFilterStatusKeluarChange: (v: string) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Initials from a full name — max 2 characters. */
const getInitials = (name: string) =>
  name.split(' ').map((n) => n[0]).slice(0, 2).join('');

/** Badge class for status keluar. */
const statusKeluarBadgeCls = (statusKeluar: string) =>
  statusKeluar === 'Lulus'
    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';

/** Shared class for filter selects. */
const SELECT_CLS =
  'text-sm border border-border rounded-lg px-3 py-2 bg-background ' +
  'focus:outline-none focus:ring-2 focus:ring-primary/30';

const TH_CLS = 'text-left px-4 py-3 font-medium';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AlumniTable({
  rows,
  search,
  filterTahun,
  filterStatusKeluar,
  uniqueTahunAlumni,
  onSearchChange,
  onFilterTahunChange,
  onFilterStatusKeluarChange,
}: AlumniTableProps) {
  return (
    <PageCard
      title="Arsip Data Alumni"
      description="Riwayat data santri yang telah lulus, pindah, atau berhenti"
    >
      {/* ---- Toolbar ---- */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Cari nama alumni atau NIS..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <label htmlFor="alumni-filter-tahun" className="sr-only">
            Filter Tahun Alumni
          </label>
          <select
            id="alumni-filter-tahun"
            value={filterTahun}
            onChange={(e) => onFilterTahunChange(e.target.value)}
            className={SELECT_CLS}
          >
            <option value="all">Semua Tahun</option>
            {uniqueTahunAlumni.map((tahun) => (
              <option key={tahun} value={tahun.toString()}>
                {tahun}
              </option>
            ))}
          </select>

          <label htmlFor="alumni-filter-status" className="sr-only">
            Filter Status Keluar
          </label>
          <select
            id="alumni-filter-status"
            value={filterStatusKeluar}
            onChange={(e) => onFilterStatusKeluarChange(e.target.value)}
            className={SELECT_CLS}
          >
            <option value="all">Semua Status Keluar</option>
            <option value="lulus">Lulus</option>
            <option value="keluar">Keluar</option>
          </select>
        </div>
      </div>

      {/* ---- Table ---- */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 text-muted-foreground">
              <th className={TH_CLS}>Nama Alumni</th>
              <th className={TH_CLS}>Tahun</th>
              <th className={TH_CLS}>Status Keluar</th>
              <th className={TH_CLS}>Pendidikan Terakhir</th>
              <th className={TH_CLS}>Catatan</th>
              <th className={TH_CLS}>Status Akun</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((a) => (
              <tr key={a.id} className="hover:bg-muted/30 transition-colors group">
                {/* Identity */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {getInitials(a.name)}
                    </div>
                    <div>
                      <p className="font-bold text-foreground group-hover:text-primary transition-colors">
                        {a.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        {a.nis} • Angkatan {a.angkatanMasuk}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Tahun */}
                <td className="px-4 py-3 font-medium">{a.tahunAlumni}</td>

                {/* Status Keluar badge */}
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${statusKeluarBadgeCls(a.statusKeluar)}`}
                  >
                    {a.statusKeluar}
                  </span>
                </td>

                {/* Pendidikan Terakhir */}
                <td className="px-4 py-3">
                  <div className="text-xs">
                    <p className="font-medium text-foreground">{a.kelasTerakhir}</p>
                    <p className="text-muted-foreground">Asrama: {a.asramaTerakhir}</p>
                  </div>
                </td>

                {/* Catatan */}
                <td
                  className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate"
                  title={a.catatan}
                >
                  {a.catatan || '-'}
                </td>

                {/* Status Akun */}
                <td className="px-4 py-3">
                  {a.masihMemilikiAkun ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      Akses Aktif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium bg-muted text-muted-foreground border border-border">
                      Akses Dicabut
                    </span>
                  )}
                </td>
              </tr>
            ))}

            {/* Empty state */}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-muted-foreground text-sm"
                >
                  Tidak ada histori alumni yang ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ---- Future-Ready Utilities ---- */}
      <div className="mt-6 flex flex-wrap gap-3 pt-6 border-t border-border">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <FileBadge aria-hidden="true" className="w-4 h-4" /> Cetak Raport Terakhir
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <Download aria-hidden="true" className="w-4 h-4" /> Ekspor Data Lulusan
        </Button>
      </div>
    </PageCard>
  );
}
