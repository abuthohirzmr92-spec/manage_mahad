'use client';

import { useState } from 'react';
import { PageHeader, PageCard } from '@/components/shared/page-header';
import { StatsCard } from '@/components/shared/stats-card';
import { StatusBadge } from '@/components/shared/status-badge';
import { LoadingState } from '@/components/shared/loading-state';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { useCollection } from '@/hooks';
import { notificationsService } from '@/lib/firebase/services';
import type { Notification } from '@/types';
import {
  Bell, BellRing, AlertTriangle, CheckCircle2,
  Settings, Clock, Trophy, ShieldAlert, CheckCheck, Inbox
} from 'lucide-react';

function formatTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return `${diffDays} hari yang lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return isoString;
  }
}

function getIcon(notif: Notification) {
  if (notif.title.toLowerCase().includes('pelanggaran')) return <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />;
  if (notif.title.toLowerCase().includes('quest') || notif.title.toLowerCase().includes('prestasi')) return <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
  if (notif.title.toLowerCase().includes('hukuman')) return <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
  if (notif.title.toLowerCase().includes('approv') || notif.title.toLowerCase().includes('pending') || notif.title.toLowerCase().includes('pemutihan')) return <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />;
  if (notif.type === 'warning') return <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />;
  if (notif.type === 'success') return <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
  if (notif.type === 'error') return <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />;
  return <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
}

function getIconBackground(notif: Notification) {
  if (notif.title.toLowerCase().includes('pelanggaran') || notif.type === 'warning' || notif.type === 'error') return 'bg-red-500/10 border-red-500/20';
  if (notif.title.toLowerCase().includes('quest') || notif.title.toLowerCase().includes('prestasi')) return 'bg-amber-500/10 border-amber-500/20';
  if (notif.title.toLowerCase().includes('hukuman') || notif.type === 'success') return 'bg-emerald-500/10 border-emerald-500/20';
  if (notif.title.toLowerCase().includes('approv') || notif.title.toLowerCase().includes('pending')) return 'bg-orange-500/10 border-orange-500/20';
  return 'bg-blue-500/10 border-blue-500/20';
}

export default function NotifikasiPage() {
  const { data: notifications, loading, error } = useCollection<Notification>('notifications', [], { realtime: true });
  const [activeFilterTab, setActiveFilterTab] = useState('Semua');

  const unreadCount = notifications.filter(n => !n.read).length;
  const todayCount = notifications.filter(n => {
    try {
      const d = new Date(n.createdAt);
      const now = new Date();
      return d.toDateString() === now.toDateString();
    } catch { return false; }
  }).length;
  const urgentCount = notifications.filter(n => n.type === 'warning' || n.type === 'error').length;
  const totalCount = notifications.length;

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read);
    await Promise.all(unread.map(n => notificationsService.markAsRead(n.id)));
  };

  const markAsRead = async (id: string) => {
    await notificationsService.markAsRead(id);
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeFilterTab === 'Belum Dibaca') return !n.read;
    if (activeFilterTab === 'Prioritas') return n.type === 'warning' || n.type === 'error';
    if (activeFilterTab === 'Sistem') return n.type === 'info' && !n.title.toLowerCase().includes('pelanggaran') && !n.title.toLowerCase().includes('hukuman');
    return true;
  });

  if (loading) return <LoadingState type="table" count={5} />;
  if (error) return <ErrorState message="Gagal memuat notifikasi." onRetry={() => window.location.reload()} />;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 1. Header */}
      <PageHeader
        title="Notifikasi"
        description="Pusat aktivitas dan pemberitahuan sistem pesantren"
        action={
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCheck className="w-4 h-4" />
            Tandai Semua Dibaca
          </button>
        }
      />

      {/* 2. Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Belum Dibaca"
          value={unreadCount}
          icon={BellRing}
          iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        />
        <StatsCard
          title="Hari Ini"
          value={todayCount}
          icon={Clock}
          iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <StatsCard
          title="Prioritas Tinggi"
          value={urgentCount}
          icon={AlertTriangle}
          iconClassName="bg-red-500/10 text-red-600 dark:text-red-400"
        />
        <StatsCard
          title="Total Notifikasi"
          value={totalCount}
          icon={Inbox}
          iconClassName="bg-purple-500/10 text-purple-600 dark:text-purple-400"
        />
      </div>

      <PageCard title="Daftar Pemberitahuan" description="Riwayat notifikasi terbaru Anda">
        {/* 4. Filter Tabs */}
        <div className="flex overflow-x-auto pb-2 mb-4 gap-2 border-b border-border hide-scrollbar">
          {['Semua', 'Belum Dibaca', 'Prioritas', 'Sistem'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilterTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors whitespace-nowrap ${activeFilterTab === tab
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
            >
              {tab}
              {tab === 'Belum Dibaca' && unreadCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* 3. Notification List */}
        <div className="space-y-3 mt-4">
          {filteredNotifications.length === 0 ? (
            <EmptyState icon={Bell} title="Tidak ada notifikasi" description="Anda sudah membaca semua pemberitahuan di kategori ini." />
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`relative flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 hover:shadow-sm ${notif.read
                  ? 'bg-card border-border hover:border-primary/30'
                  : 'bg-primary/5 border-primary/20 hover:border-primary/40'
                  }`}
              >
                {/* Unread dot indicator */}
                {!notif.read && (
                  <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.5)]"></div>
                )}

                {/* Icon */}
                <div className={`p-3 rounded-xl border shrink-0 ${getIconBackground(notif)}`}>
                  {getIcon(notif)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 mb-1">
                    <h4 className={`text-sm font-bold truncate ${notif.read ? 'text-foreground' : 'text-foreground'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap shrink-0 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {formatTime(notif.createdAt)}
                    </span>
                  </div>

                  <p className={`text-xs leading-relaxed mb-3 ${notif.read ? 'text-muted-foreground' : 'text-foreground/90'}`}>
                    {notif.message}
                  </p>

                  {/* Tags / Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge
                      status={notif.read ? 'read' : 'unread'}
                      variant={notif.read ? 'neutral' : 'success'}
                    />

                    {(notif.type === 'warning' || notif.type === 'error') && (
                      <StatusBadge status="urgent" variant="error" />
                    )}

                    {notif.type === 'info' && (
                      <StatusBadge status="system" variant="info" />
                    )}

                    {!notif.read && (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="ml-auto text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors"
                      >
                        Tandai sudah dibaca
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </PageCard>
    </div>
  );
}
