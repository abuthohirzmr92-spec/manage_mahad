'use client';

import { useState } from 'react';
import { PageHeader, PageCard } from '@/components/shared/page-header';
import { StatsCard } from '@/components/shared/stats-card';
import { StatusBadge } from '@/components/shared/status-badge';
import {
  Bell, BellRing, AlertTriangle, CheckCircle2,
  Settings, Clock, Trophy, ShieldAlert, CheckCheck, Inbox
} from 'lucide-react';

const initialMockNotifications = [
  {
    id: 1,
    title: 'Pelanggaran Baru Dicatat',
    description: 'Ahmad Syafiq (10A) tercatat melakukan pelanggaran: Keluar Asrama Tanpa Izin (-15 Poin).',
    time: '10 menit yang lalu',
    category: 'urgent',
    isRead: false,
    iconType: 'pelanggaran'
  },
  {
    id: 2,
    title: 'Quest Disetujui',
    description: 'Quest "Hafalan Surah Al-Mulk" untuk Budi Santoso telah disetujui. Poin pelanggaran diputihkan (+10 Poin).',
    time: '1 jam yang lalu',
    category: 'info',
    isRead: false,
    iconType: 'quest'
  },
  {
    id: 3,
    title: 'Hukuman Selesai',
    description: 'Masa hukuman "Piket Kebersihan Ekstra" untuk Zaid Ahmad telah berakhir hari ini.',
    time: 'Hari ini, 08:00',
    category: 'info',
    isRead: true,
    iconType: 'hukuman'
  },
  {
    id: 4,
    title: 'Approval Pending',
    description: 'Terdapat 3 pengajuan pemutihan poin dari wali santri yang menunggu persetujuan Anda.',
    time: 'Kemarin, 15:30',
    category: 'urgent',
    isRead: true,
    iconType: 'approval'
  },
  {
    id: 5,
    title: 'Sistem Maintenance',
    description: 'Pemeliharaan server aplikasi akan dilakukan pada 15 Mei 2026 pukul 00:00 - 02:00 WIB.',
    time: '2 hari yang lalu',
    category: 'system',
    isRead: true,
    iconType: 'system'
  }
];

export default function NotifikasiPage() {
  const [notifications, setNotifications] = useState(initialMockNotifications);
  const [activeTab, setActiveTab] = useState('Semua');

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const todayCount = notifications.filter(n => n.time.includes('menit') || n.time.includes('jam') || n.time.includes('Hari ini')).length;
  const urgentCount = notifications.filter(n => n.category === 'urgent').length;
  const totalCount = notifications.length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'Belum Dibaca') return !n.isRead;
    if (activeTab === 'Prioritas') return n.category === 'urgent';
    if (activeTab === 'Sistem') return n.category === 'system';
    return true; // 'Semua'
  });

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'pelanggaran': return <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case 'quest': return <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'hukuman': return <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'approval': return <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />;
      case 'system': return <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      default: return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getIconBackground = (iconType: string) => {
    switch (iconType) {
      case 'pelanggaran': return 'bg-red-500/10 border-red-500/20';
      case 'quest': return 'bg-amber-500/10 border-amber-500/20';
      case 'hukuman': return 'bg-emerald-500/10 border-emerald-500/20';
      case 'approval': return 'bg-orange-500/10 border-orange-500/20';
      case 'system': return 'bg-blue-500/10 border-blue-500/20';
      default: return 'bg-muted border-border';
    }
  };

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
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors whitespace-nowrap ${activeTab === tab
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
            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border rounded-xl bg-muted/10">
              <div className="bg-muted p-4 rounded-full mb-3">
                <Bell className="w-8 h-8 text-muted-foreground opacity-50" />
              </div>
              <p className="text-sm font-medium text-foreground">Tidak ada notifikasi</p>
              <p className="text-xs text-muted-foreground mt-1">Anda sudah membaca semua pemberitahuan di kategori ini.</p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`relative flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 hover:shadow-sm ${notif.isRead
                  ? 'bg-card border-border hover:border-primary/30'
                  : 'bg-primary/5 border-primary/20 hover:border-primary/40'
                  }`}
              >
                {/* Unread dot indicator */}
                {!notif.isRead && (
                  <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.5)]"></div>
                )}

                {/* Icon */}
                <div className={`p-3 rounded-xl border shrink-0 ${getIconBackground(notif.iconType)}`}>
                  {getIcon(notif.iconType)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 mb-1">
                    <h4 className={`text-sm font-bold truncate ${notif.isRead ? 'text-foreground' : 'text-foreground'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap shrink-0 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {notif.time}
                    </span>
                  </div>

                  <p className={`text-xs leading-relaxed mb-3 ${notif.isRead ? 'text-muted-foreground' : 'text-foreground/90'}`}>
                    {notif.description}
                  </p>

                  {/* Tags / Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* 5. StatusBadge for different states */}
                    <StatusBadge
                      status={notif.isRead ? 'read' : 'unread'}
                      variant={notif.isRead ? 'neutral' : 'success'}
                    />

                    {notif.category === 'urgent' && (
                      <StatusBadge status="urgent" variant="error" />
                    )}

                    {notif.category === 'system' && (
                      <StatusBadge status="system" variant="info" />
                    )}

                    {!notif.isRead && (
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
