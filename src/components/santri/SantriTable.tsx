'use client';

import type { Santri } from '@/types';
import { PageCard } from '@/components/shared/page-header';
import { Edit2, Search, SlidersHorizontal } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SantriTableProps {
  /** Filtered list to render. */
  rows: Santri[];
  /** Filter controls */
  search: string;
  filterStatus: string;
  filterProvinsi: string;
  filterAngkatan: string;
  uniqueProvinsi: string[];
  uniqueAngkatan: number[];
  /** Filter setters */
  onSearchChange: (v: string) => void;
  onFilterStatusChange: (v: string) => void;
  onFilterProvinsiChange: (v: string) => void;
  onFilterAngkatanChange: (v: string) => void;
  /** Row action */
  onEdit: (santri: Santri) => void;
}

// ---------------------------------------------------------------------------
// Color maps — co-located, no global leak
// ---------------------------------------------------------------------------

const STATUS_COLORS: Record<string, string> = {
  aktif: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  cuti:  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  skors: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const SP_COLORS: Record<string, string> = {
  'Tidak Ada': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  SP1: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  SP2: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  SP3: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

// ---------------------------------------------------------------------------
// Shared class helpers
// ---------------------------------------------------------------------------

const SELECT_CLS =
  'text-sm border border-border rounded-lg px-3 py-2 bg-background ' +
  'focus:outline-none focus:ring-2 focus:ring-primary/30 shrink-0';

const TH_CLS = 'text-left px-4 py-3 font-medium';

/** Initials from full name — max 2 chars. */
const getInitials = (name: string) =>
  name.split(' ').map((n) => n[0]).slice(0, 2).join('');

/** Bar color based on violation points. */
const pointBarColor = (pts: number) =>
  pts > 40 ? 'bg-red-500' : pts > 20 ? 'bg-amber-500' : 'bg-emerald-500';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SantriTable({
  rows,
  search,
  filterStatus,
  filterProvinsi,
  filterAngkatan,
  uniqueProvinsi,
  uniqueAngkatan,
  onSearchChange,
  onFilterStatusChange,
  onFilterProvinsiChange,
  onFilterAngkatanChange,
  onEdit,
}: SantriTableProps) {
  return (
    <PageCard
      title="Daftar Santri"
      description={`Menampilkan ${rows.length} santri`}
    >
      {/* ---- Toolbar ---- */}
      <div className="flex flex-col gap-3 mb-5">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              aria-hidden="true"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Cari nama, NIS, atau asrama..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1 sm:pb-0">
            <SlidersHorizontal
              aria-hidden="true"
              className="w-4 h-4 text-muted-foreground shrink-0"
            />

            <label htmlFor="filter-status" className="sr-only">Filter Status</label>
            <select
              id="filter-status"
              value={filterStatus}
              onChange={(e) => onFilterStatusChange(e.target.value)}
              className={SELECT_CLS}
            >
              <option value="all">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="cuti">Cuti</option>
              <option value="skors">Skors</option>
            </select>

            <label htmlFor="filter-provinsi" className="sr-only">Filter Provinsi</label>
            <select
              id="filter-provinsi"
              value={filterProvinsi}
              onChange={(e) => onFilterProvinsiChange(e.target.value)}
              className={SELECT_CLS}
            >
              <option value="all">Semua Provinsi</option>
              {uniqueProvinsi.map((prov) => (
                <option key={prov} value={prov}>{prov}</option>
              ))}
            </select>

            <label htmlFor="filter-angkatan" className="sr-only">Filter Angkatan</label>
            <select
              id="filter-angkatan"
              value={filterAngkatan}
              onChange={(e) => onFilterAngkatanChange(e.target.value)}
              className={SELECT_CLS}
            >
              <option value="all">Semua Angkatan</option>
              {uniqueAngkatan.map((angkatan) => (
                <option key={angkatan} value={angkatan.toString()}>
                  Angkatan {angkatan}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ---- Table ---- */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 text-muted-foreground">
              <th className={TH_CLS}>Santri</th>
              <th className={TH_CLS}>NIS</th>
              <th className={TH_CLS}>Asrama / Kamar</th>
              <th className={TH_CLS}>Kelas</th>
              <th className={TH_CLS}>Status</th>
              <th className={TH_CLS}>SP</th>
              <th className={TH_CLS}>Poin Pelanggaran</th>
              <th className="text-right px-4 py-3 font-medium w-[80px]">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((s) => (
              <tr key={s.id} className="hover:bg-muted/30 transition-colors group">
                {/* Santri identity */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {getInitials(s.name)}
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{s.name}</p>
                      <div className="flex flex-col mt-0.5 gap-0.5">
                        <p className="text-[10px] text-muted-foreground">
                          {s.asalKota}, {s.asalProvinsi}
                        </p>
                        <span className="w-fit font-semibold px-1.5 py-0.5 rounded bg-muted text-[9px] uppercase tracking-wider text-muted-foreground">
                          ANGKATAN {s.angkatanMasuk}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>

                {/* NIS */}
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {s.nis}
                </td>

                {/* Asrama / Kamar */}
                <td className="px-4 py-3">
                  <span className="font-medium">{s.asrama}</span>
                  <span className="text-muted-foreground"> · {s.kamar}</span>
                </td>

                {/* Kelas */}
                <td className="px-4 py-3 text-muted-foreground">{s.kelas}</td>

                {/* Status badge */}
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[s.status]}`}
                  >
                    {s.status}
                  </span>
                </td>

                {/* SP badge */}
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${SP_COLORS[s.statusSP]}`}
                  >
                    {s.statusSP}
                  </span>
                </td>

                {/* Violation points progress */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-1.5 w-16">
                      <div
                        className={`h-1.5 rounded-full ${pointBarColor(s.totalPoinPelanggaran)}`}
                        style={{
                          width: `${Math.min((s.totalPoinPelanggaran / 60) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium">{s.totalPoinPelanggaran}</span>
                  </div>
                </td>

                {/* Action */}
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    aria-label={`Edit status ${s.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(s);
                    }}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
                  >
                    <Edit2 aria-hidden="true" className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}

            {/* Empty state */}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-10 text-center text-muted-foreground text-sm"
                >
                  Tidak ada data santri aktif.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </PageCard>
  );
}
