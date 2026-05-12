'use client';

import { PageHeader, PageCard } from '@/components/shared/page-header';
import { StatsCard } from '@/components/shared/stats-card';
import { mockAsrama } from '@/data/mock';
import { Building2, Users, CheckCircle2, XCircle } from 'lucide-react';

export default function AsramaPage() {
  const aktif = mockAsrama.filter((a) => a.status === 'aktif');
  const nonaktif = mockAsrama.filter((a) => a.status === 'nonaktif');
  const totalKapasitas = mockAsrama.reduce((acc, a) => acc + a.capacity, 0);
  const totalTerisi = mockAsrama.reduce((acc, a) => acc + a.filled, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Asrama"
        description="Kelola data asrama dan kapasitas hunian pesantren"
        action={
          <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            + Tambah Asrama
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Asrama" value={mockAsrama.length} icon={Building2} />
        <StatsCard title="Asrama Aktif" value={aktif.length} icon={CheckCircle2} iconClassName="bg-emerald-500/10" />
        <StatsCard title="Non-Aktif" value={nonaktif.length} icon={XCircle} iconClassName="bg-red-500/10" />
        <StatsCard title="Total Hunian" value={`${totalTerisi}/${totalKapasitas}`} icon={Users} iconClassName="bg-blue-500/10" description="santri terisi" />
      </div>

      <PageCard title="Daftar Asrama">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockAsrama.map((asrama) => {
            const pct = Math.round((asrama.filled / asrama.capacity) * 100);
            const barColor = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500';
            return (
              <div key={asrama.id} className={`rounded-xl border p-5 transition-all hover:shadow-md ${asrama.status === 'nonaktif' ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{asrama.name}</h3>
                      <p className="text-xs text-muted-foreground">{asrama.musyrif}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${asrama.status === 'aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {asrama.status}
                    </span>
                    <span className="text-xs text-muted-foreground">{asrama.gender === 'L' ? '♂ Putra' : '♀ Putri'}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Hunian</span>
                    <span className="font-medium">{asrama.filled} / {asrama.capacity}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className={`h-2 rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-right text-muted-foreground">{pct}% terisi</p>
                </div>
              </div>
            );
          })}
        </div>
      </PageCard>
    </div>
  );
}
