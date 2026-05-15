import { useState } from 'react';
import { Search, AlertTriangle, Edit2, Trash2 } from 'lucide-react';
import type { MasterPelanggaran, PelanggaranSeverity, RanahInstansi } from '@/types';
import { SEVERITY_COLORS, RANAH_COLORS, RANAH_LABEL } from '@/components/pelanggaran/constants';

type SeverityFilter = 'all' | PelanggaranSeverity;
type RanahFilter = 'all' | RanahInstansi;

interface Props {
  data: MasterPelanggaran[];
  onEdit: (p: MasterPelanggaran) => void;
  onDelete: (id: string) => void;
}

export function PelanggaranTable({ data, onEdit, onDelete }: Props) {
  const [search, setSearch] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<SeverityFilter>('all');
  const [filterRanah, setFilterRanah] = useState<RanahFilter>('all');

  const filtered = data.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.kategori.toLowerCase().includes(search.toLowerCase());
    const matchSeverity = filterSeverity === 'all' || p.severity === filterSeverity;
    const matchRanah = filterRanah === 'all' || p.ranahInstansi === filterRanah;
    return matchSearch && matchSeverity && matchRanah;
  });

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari kode, nama, atau kategori pelanggaran…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>
        <label htmlFor="filter-ranah" className="sr-only">Filter ranah instansi</label>
        <select
          id="filter-ranah"
          value={filterRanah}
          onChange={(e) => setFilterRanah(e.target.value as RanahFilter)}
          className="text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all min-w-[140px]"
        >
          <option value="all">Semua Ranah</option>
          <option value="pesantren">Pesantren</option>
          <option value="madin">Madin</option>
          <option value="depag">Depag</option>
          <option value="madqurur">Madqurur</option>
        </select>
        <label htmlFor="filter-severity" className="sr-only">Filter tingkat pelanggaran</label>
        <select
          id="filter-severity"
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value as SeverityFilter)}
          className="text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all min-w-[140px]"
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
              <th className="text-left px-4 py-3 font-medium">Kode</th>
              <th className="text-left px-4 py-3 font-medium">Ranah</th>
              <th className="text-left px-4 py-3 font-medium">Kategori</th>
              <th className="text-left px-4 py-3 font-medium">Nama Pelanggaran</th>
              <th className="text-left px-4 py-3 font-medium">Tingkat</th>
              <th className="text-left px-4 py-3 font-medium">Poin</th>
              <th className="text-right px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-muted/30 transition-colors group">
                <td className="px-4 py-3 font-mono text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
                  {p.code}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${RANAH_COLORS[p.ranahInstansi]}`}>
                    {RANAH_LABEL[p.ranahInstansi]}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{p.kategori}</td>
                <td className="px-4 py-3 font-medium text-foreground" title={p.description}>
                  {p.name}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${SEVERITY_COLORS[p.severity]}`}>
                    {p.severity.replaceAll('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-bold text-red-600 dark:text-red-400">-{p.points}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(p)}
                      aria-label="Edit"
                      className="p-1.5 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                    >
                      <Edit2 aria-hidden="true" className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(p.id)}
                      aria-label="Hapus"
                      className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    >
                      <Trash2 aria-hidden="true" className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertTriangle aria-hidden="true" className="w-8 h-8 opacity-20" />
                    <p className="text-sm">Tidak ada referensi pelanggaran yang sesuai.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
