'use client';

import { useState } from 'react';
import { PageHeader, PageCard } from '@/components/shared/page-header';
import { StatsCard } from '@/components/shared/stats-card';
import { mockPelanggaran } from '@/data/mock';
import { AlertTriangle, Clock, CheckCircle, XCircle, Search } from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  ringan: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  sedang: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  berat: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  confirmed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  rejected: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

const STATUS_LABEL: Record<string, string> = {
  pending: 'Menunggu',
  confirmed: 'Dikonfirmasi',
  rejected: 'Ditolak',
};

const HUKUMAN_COLORS: Record<string, string> = {
  belum: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  aktif: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  selesai: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

export default function PelanggaranPage() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const filtered = mockPelanggaran.filter((p) => {
    const matchSearch =
      p.santriName.toLowerCase().includes(search.toLowerCase()) ||
      p.pelanggaranName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    const matchCategory = filterCategory === 'all' || p.category === filterCategory;
    return matchSearch && matchStatus && matchCategory;
  });

  const pending = mockPelanggaran.filter((p) => p.status === 'pending').length;
  const confirmed = mockPelanggaran.filter((p) => p.status === 'confirmed').length;
  const rejected = mockPelanggaran.filter((p) => p.status === 'rejected').length;
  const berat = mockPelanggaran.filter((p) => p.category === 'berat').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pelanggaran"
        description="Catat dan kelola pelanggaran santri pesantren"
        action={
          <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            + Catat Pelanggaran
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Menunggu Konfirmasi" value={pending} icon={Clock} iconClassName="bg-amber-500/10" />
        <StatsCard title="Dikonfirmasi" value={confirmed} icon={CheckCircle} iconClassName="bg-emerald-500/10" />
        <StatsCard title="Ditolak" value={rejected} icon={XCircle} iconClassName="bg-slate-500/10" />
        <StatsCard title="Kategori Berat" value={berat} icon={AlertTriangle} iconClassName="bg-red-500/10" />
      </div>

      <PageCard title="Daftar Pelanggaran" description={`${filtered.length} pelanggaran ditemukan`}>
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari nama santri atau jenis pelanggaran..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none"
          >
            <option value="all">Semua Status</option>
            <option value="pending">Menunggu</option>
            <option value="confirmed">Dikonfirmasi</option>
            <option value="rejected">Ditolak</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none"
          >
            <option value="all">Semua Kategori</option>
            <option value="ringan">Ringan</option>
            <option value="sedang">Sedang</option>
            <option value="berat">Berat</option>
          </select>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground">
                <th className="text-left px-4 py-3 font-medium">Santri</th>
                <th className="text-left px-4 py-3 font-medium">Pelanggaran</th>
                <th className="text-left px-4 py-3 font-medium">Kategori</th>
                <th className="text-left px-4 py-3 font-medium">Poin</th>
                <th className="text-left px-4 py-3 font-medium">Tanggal</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Hukuman</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors cursor-pointer">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        {p.santriName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <p className="font-medium">{p.santriName}</p>
                        <p className="text-xs text-muted-foreground">oleh {p.reportedBy}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.pelanggaranName}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${CATEGORY_COLORS[p.category]}`}>
                      {p.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-red-600 dark:text-red-400">-{p.points}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{p.date}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[p.status]}`}>
                      {STATUS_LABEL[p.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${HUKUMAN_COLORS[p.statusHukuman]}`}>
                      {p.statusHukuman}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground text-sm">
                    Tidak ada pelanggaran ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </PageCard>
    </div>
  );
}
