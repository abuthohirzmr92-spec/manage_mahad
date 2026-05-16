'use client';

import { useMemo } from 'react';
import { PageHeader, PageCard } from '@/components/shared/page-header';
import { StatsCard } from '@/components/shared/stats-card';
import { StatusBadge } from '@/components/shared/status-badge';
import { LoadingState } from '@/components/shared/loading-state';
import { ErrorState } from '@/components/shared/error-state';
import { EmptyState } from '@/components/shared/empty-state';
import { DashboardShell, StatsGrid, ChartRow, ChartContainer } from '@/components/shared/dashboard-shell';
import { useCollection } from '@/hooks';
import { Activity, Users, AlertTriangle, Building2, AlertCircle } from 'lucide-react';
import type { Santri, Pelanggaran, Asrama, Notification } from '@/types';

export default function MonitoringPage() {
  const { data: santriList, loading: loadingSantri, error: errorSantri } = useCollection<Santri>('santri');
  const { data: pelanggaranList, loading: loadingPelanggaran, error: errorPelanggaran } = useCollection<Pelanggaran>('pelanggaran');
  const { data: asramaList, loading: loadingAsrama, error: errorAsrama } = useCollection<Asrama>('asrama');
  const { data: notificationList, loading: loadingNotif } = useCollection<Notification>('notifications');

  const loading = loadingSantri || loadingPelanggaran || loadingAsrama || loadingNotif;
  const error = errorSantri || errorPelanggaran || errorAsrama;

  const stats = useMemo(() => ({
    santriAktif: santriList.filter(s => s.status === 'aktif').length,
    pelanggaranPending: 0, // Pending now tracked via GovernanceCase collection
    asramaAktifCount: asramaList.filter(a => a.status === 'aktif').length,
  }), [santriList, pelanggaranList, asramaList]);

  // Last 5 notifications as activity log
  const recentNotifications = useMemo(() => {
    return [...notificationList]
      .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
      .slice(0, 5);
  }, [notificationList]);

  // Fallback activity log when no notifications
  const fallbackActivityLog = [
    { time: '14:30', action: 'Pelanggaran baru dilaporkan', detail: 'Muhammad Rizki - Terlambat Sholat', type: 'warning' as const },
    { time: '13:15', action: 'Quest selesai', detail: 'Bilal Ramadhan - Imam Sholat', type: 'success' as const },
    { time: '12:00', action: 'Data santri diperbarui', detail: 'Abdullah Firdaus - Update kamar', type: 'info' as const },
    { time: '10:30', action: 'Hukuman berakhir', detail: 'Zaid Ahmad - Skorsing selesai', type: 'success' as const },
    { time: '09:00', action: 'Login admin', detail: 'Ahmad Fauzi masuk ke sistem', type: 'info' as const },
  ];

  const activityLog = recentNotifications.length > 0
    ? recentNotifications.map(n => ({
        time: n.createdAt ? new Date(n.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--',
        action: n.title,
        detail: n.message,
        type: n.type,
      }))
    : fallbackActivityLog;

  if (loading) {
    return (
      <DashboardShell>
        <PageHeader
          title="Monitoring"
          description="Pantau aktivitas dan statistik pesantren secara real-time"
        />
        <LoadingState type="stats" count={4} />
        <LoadingState type="card" count={2} />
      </DashboardShell>
    );
  }

  if (error) {
    return (
      <DashboardShell>
        <PageHeader
          title="Monitoring"
          description="Pantau aktivitas dan statistik pesantren secara real-time"
        />
        <ErrorState message={error.message} />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <PageHeader
        title="Monitoring"
        description="Pantau aktivitas dan statistik pesantren secara real-time"
      />

      <StatsGrid>
        <StatsCard title="Santri Aktif" value={stats.santriAktif} icon={Users} trend={{ value: 2.4, label: 'bulan ini' }} />
        <StatsCard title="Pelanggaran Baru" value={stats.pelanggaranPending} icon={AlertTriangle} iconClassName="bg-amber-500/10" description="Menunggu konfirmasi" />
        <StatsCard title="Asrama Terisi" value={`${stats.asramaAktifCount} aktif`} icon={Building2} iconClassName="bg-blue-500/10" />
        <StatsCard title="Aktivitas Hari Ini" value={notificationList.length > 0 ? notificationList.length : 18} icon={Activity} iconClassName="bg-purple-500/10" trend={{ value: 12, label: 'dari kemarin' }} />
      </StatsGrid>

      <ChartRow>
        <PageCard title="Tren Pelanggaran" description="30 hari terakhir">
          <ChartContainer />
        </PageCard>

        <PageCard title="Distribusi Pelanggaran per Asrama" description="Bulan ini">
          <ChartContainer />
        </PageCard>
      </ChartRow>

      {/* Recent Activity Log */}
      <PageCard title="Log Aktivitas Terbaru" description="Aktivitas terbaru di sistem">
        {santriList.length === 0 && pelanggaranList.length === 0 ? (
          <EmptyState
            icon={AlertCircle}
            title="Belum Ada Aktivitas"
            description="Belum ada data aktivitas yang tercatat di sistem."
          />
        ) : (
          <div className="space-y-3">
            {activityLog.map((log, i) => (
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
        )}
      </PageCard>
    </DashboardShell>
  );
}
