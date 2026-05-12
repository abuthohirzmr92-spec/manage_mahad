'use client';

import { PageHeader, PageCard } from '@/components/shared/page-header';
import { StatsCard } from '@/components/shared/stats-card';
import { StatusBadge } from '@/components/shared/status-badge';
import { mockSantri, mockPelanggaran, mockAsrama } from '@/data/mock';
import { Activity, TrendingDown, TrendingUp, Users, AlertTriangle, Building2 } from 'lucide-react';

export default function MonitoringPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Monitoring"
        description="Pantau aktivitas dan statistik pesantren secara real-time"
      />

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Santri Aktif" value={mockSantri.filter(s => s.status === 'aktif').length} icon={Users} trend={{ value: 2.4, label: 'bulan ini' }} />
        <StatsCard title="Pelanggaran Baru" value={mockPelanggaran.filter(p => p.status === 'pending').length} icon={AlertTriangle} iconClassName="bg-amber-500/10" description="Menunggu konfirmasi" />
        <StatsCard title="Asrama Terisi" value={`${mockAsrama.filter(a => a.status === 'aktif').length} aktif`} icon={Building2} iconClassName="bg-blue-500/10" />
        <StatsCard title="Aktivitas Hari Ini" value={18} icon={Activity} iconClassName="bg-purple-500/10" trend={{ value: 12, label: 'dari kemarin' }} />
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PageCard title="Tren Pelanggaran" description="30 hari terakhir">
          <div className="h-64 flex items-center justify-center text-muted-foreground border border-dashed border-border rounded-lg">
            <div className="text-center">
              <TrendingDown className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Chart akan ditampilkan di sini</p>
              <p className="text-xs text-muted-foreground/70">Integrasi chart library coming soon</p>
            </div>
          </div>
        </PageCard>

        <PageCard title="Distribusi Pelanggaran per Asrama" description="Bulan ini">
          <div className="h-64 flex items-center justify-center text-muted-foreground border border-dashed border-border rounded-lg">
            <div className="text-center">
              <TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Chart akan ditampilkan di sini</p>
              <p className="text-xs text-muted-foreground/70">Integrasi chart library coming soon</p>
            </div>
          </div>
        </PageCard>
      </div>

      {/* Recent Activity Log */}
      <PageCard title="Log Aktivitas Terbaru" description="Aktivitas terbaru di sistem">
        <div className="space-y-3">
          {[
            { time: '14:30', action: 'Pelanggaran baru dilaporkan', detail: 'Muhammad Rizki - Terlambat Sholat', type: 'warning' as const },
            { time: '13:15', action: 'Quest selesai', detail: 'Bilal Ramadhan - Imam Sholat', type: 'success' as const },
            { time: '12:00', action: 'Data santri diperbarui', detail: 'Abdullah Firdaus - Update kamar', type: 'info' as const },
            { time: '10:30', action: 'Hukuman berakhir', detail: 'Zaid Ahmad - Skorsing selesai', type: 'success' as const },
            { time: '09:00', action: 'Login admin', detail: 'Ahmad Fauzi masuk ke sistem', type: 'info' as const },
          ].map((log, i) => (
            <div key={i} className="flex items-center gap-4 py-2 border-b border-border last:border-0">
              <span className="text-xs text-muted-foreground font-mono w-12 shrink-0">{log.time}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{log.action}</p>
                <p className="text-xs text-muted-foreground truncate">{log.detail}</p>
              </div>
              <StatusBadge status={log.type} />
            </div>
          ))}
        </div>
      </PageCard>
    </div>
  );
}
