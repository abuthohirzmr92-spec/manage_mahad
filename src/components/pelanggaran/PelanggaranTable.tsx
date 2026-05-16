'use client';

import { Search, CheckCircle, XCircle, Eye } from 'lucide-react';
import {
  SEVERITY_COLORS,
  STATUS_COLORS,
  STATUS_LABEL,
  HUKUMAN_COLORS,
} from './constants';
import type { Pelanggaran, PelanggaranSeverity } from '@/types';

export type StatusFilter = 'all' | Pelanggaran['status'];
export type SeverityFilter = 'all' | PelanggaranSeverity;

interface PelanggaranTableProps {
  data: Pelanggaran[];
  search: string;
  filterStatus: StatusFilter;
  filterSeverity: SeverityFilter;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: StatusFilter) => void;
  onSeverityChange: (value: SeverityFilter) => void;
  onConfirm?: (id: string) => void;
  onReject?: (id: string) => void;
  onDetail?: (item: Pelanggaran) => void;
}

export function PelanggaranTable({
  data,
  search,
  filterStatus,
  filterSeverity,
  onSearchChange,
  onStatusChange,
  onSeverityChange,
  onConfirm,
  onReject,
  onDetail,
}: PelanggaranTableProps) {
  return (
    <>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
          />
          <label htmlFor="search-pelanggaran" className="sr-only">
            Cari pelanggaran
          </label>
          <input
            id="search-pelanggaran"
            type="text"
            placeholder="Cari nama santri atau jenis pelanggaran..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>
        <label htmlFor="filter-status" className="sr-only">
          Filter status pelanggaran
        </label>
        <select
          id="filter-status"
          value={filterStatus}
          onChange={(e) => onStatusChange(e.target.value as StatusFilter)}
          className="text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none"
        >
          <option value="all">Semua Status</option>
          <option value="pending">Menunggu</option>
          <option value="confirmed">Dikonfirmasi</option>
          <option value="rejected">Ditolak</option>
        </select>
        <label htmlFor="filter-severity" className="sr-only">
          Filter tingkat pelanggaran
        </label>
        <select
          id="filter-severity"
          value={filterSeverity}
          onChange={(e) => onSeverityChange(e.target.value as SeverityFilter)}
          className="text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none"
        >
          <option value="all">Semua Tingkat</option>
          <option value="ringan">Ringan</option>
          <option value="sedang">Sedang</option>
          <option value="berat">Berat</option>
          <option value="sangat_berat">Sangat Berat</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 text-muted-foreground">
              <th className="text-left px-4 py-3 font-medium">Santri</th>
              <th className="text-left px-4 py-3 font-medium">Pelanggaran</th>
              <th className="text-left px-4 py-3 font-medium">Tingkat</th>
              <th className="text-left px-4 py-3 font-medium">Poin</th>
              <th className="text-left px-4 py-3 font-medium">Tanggal</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Hukuman</th>
              {(onConfirm || onReject || onDetail) && (
                <th className="text-left px-4 py-3 font-medium">Aksi</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((p) => (
              <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div
                      aria-hidden="true"
                      className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0"
                    >
                      {p.santriName
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div>
                      <p className="font-medium">{p.santriName}</p>
                      <p className="text-xs text-muted-foreground">oleh {p.reportedBy}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{p.pelanggaranName}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${SEVERITY_COLORS[p.severity]}`}
                  >
                    {p.severity.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 font-bold text-red-600 dark:text-red-400">-{p.points}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{p.date}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[p.status]}`}
                  >
                    {STATUS_LABEL[p.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${HUKUMAN_COLORS[p.statusHukuman]}`}
                  >
                    {p.statusHukuman}
                  </span>
                </td>
                {(onConfirm || onReject || onDetail) && (
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {onDetail && (
                        <button
                          type="button"
                          onClick={() => onDetail(p)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          title="Lihat detail"
                        >
                          <Eye className="w-4 h-4" aria-hidden="true" />
                        </button>
                      )}
                      {p.status === 'pending' && onConfirm && (
                        <button
                          type="button"
                          onClick={() => onConfirm(p.id)}
                          className="p-1.5 rounded-md text-emerald-600 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                          title="Konfirmasi"
                        >
                          <CheckCircle className="w-4 h-4" aria-hidden="true" />
                        </button>
                      )}
                      {p.status === 'pending' && onReject && (
                        <button
                          type="button"
                          onClick={() => onReject(p.id)}
                          className="p-1.5 rounded-md text-red-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          title="Tolak"
                        >
                          <XCircle className="w-4 h-4" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={(onConfirm || onReject || onDetail) ? 8 : 7} className="px-4 py-10 text-center text-muted-foreground text-sm">
                  Tidak ada pelanggaran ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
