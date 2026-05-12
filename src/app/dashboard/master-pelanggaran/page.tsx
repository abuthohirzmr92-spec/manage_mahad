'use client';

import { useState } from 'react';
import { PageHeader, PageCard } from '@/components/shared/page-header';
import { StatsCard } from '@/components/shared/stats-card';
import { StatusBadge } from '@/components/shared/status-badge';
import { mockMasterPelanggaran } from '@/data/mock';
import { BookOpen, AlertTriangle, Calculator, FileText, Search, Plus } from 'lucide-react';

export default function MasterPelanggaranPage() {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const filtered = mockMasterPelanggaran.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === 'all' || p.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const totalPoints = mockMasterPelanggaran.reduce((acc, p) => acc + p.points, 0);
  const totalBerat = mockMasterPelanggaran.filter((p) => p.category === 'berat').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Master Pelanggaran"
        description="Kelola daftar referensi dan bobot poin pelanggaran santri"
        action={
          <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm active:scale-95">
            <Plus className="w-4 h-4" />
            Tambah Pelanggaran
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Referensi" value={mockMasterPelanggaran.length} icon={BookOpen} />
        <StatsCard title="Aturan Aktif" value={mockMasterPelanggaran.length} icon={FileText} iconClassName="bg-emerald-500/10" />
        <StatsCard title="Pelanggaran Berat" value={totalBerat} icon={AlertTriangle} iconClassName="bg-red-500/10" />
        <StatsCard title="Akumulasi Poin" value={totalPoints} icon={Calculator} iconClassName="bg-blue-500/10" description="Jumlah maksimal poin" />
      </div>

      {/* Table Card */}
      <PageCard title="Daftar Referensi Pelanggaran" description={`Menampilkan ${filtered.length} aturan tata tertib pesantren`}>
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari kode atau nama pelanggaran..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all min-w-[150px]"
          >
            <option value="all">Semua Level</option>
            <option value="ringan">Ringan</option>
            <option value="sedang">Sedang</option>
            <option value="berat">Berat</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground">
                <th className="text-left px-4 py-3 font-medium">Kode</th>
                <th className="text-left px-4 py-3 font-medium">Nama Pelanggaran</th>
                <th className="text-left px-4 py-3 font-medium">Deskripsi</th>
                <th className="text-left px-4 py-3 font-medium">Level</th>
                <th className="text-left px-4 py-3 font-medium">Poin</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-4 py-3 font-mono text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
                    {p.code}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-xs truncate" title={p.description}>
                    {p.description}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={p.category} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-red-600 dark:text-red-400">-{p.points}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status="aktif" variant="success" />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertTriangle className="w-8 h-8 opacity-20" />
                      <p className="text-sm">Tidak ada referensi pelanggaran yang sesuai.</p>
                    </div>
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
