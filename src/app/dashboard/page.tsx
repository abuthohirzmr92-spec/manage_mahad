'use client';

import { useMemo } from 'react';
import { useAuth } from '@/hooks';
import { useCollection } from '@/hooks';
import { StatsCard } from '@/components/shared/stats-card';
import { PageHeader, PageCard } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { AnalyticsCard } from '@/components/shared/analytics-card';
import { LoadingState } from '@/components/shared/loading-state';
import { ErrorState } from '@/components/shared/error-state';
import type { Santri, Pelanggaran, Quest, Hukuman, Asrama } from '@/types';
import {
  Users, Building2, AlertTriangle, Trophy, Shield,
  Activity, GraduationCap, Star, Clock, CheckCircle,
  ClipboardCheck, School, Briefcase
} from 'lucide-react';

// ─── ADMIN VIEW ────────────────────────────────────────────────
function AdminDashboard() {
  const { data: santri, loading: loadingSantri, error: errorSantri } = useCollection<Santri>('santri');
  const { data: pelanggaran, loading: loadingPelanggaran, error: errorPelanggaran } = useCollection<Pelanggaran>('pelanggaran');
  const { data: quest, loading: loadingQuest, error: errorQuest } = useCollection<Quest>('quest');
  const { data: asrama, loading: loadingAsrama, error: errorAsrama } = useCollection<Asrama>('asrama');
  const { data: hukuman, loading: loadingHukuman } = useCollection<Hukuman>('hukuman');

  const loading = loadingSantri || loadingPelanggaran || loadingQuest || loadingAsrama || loadingHukuman;
  const error = errorSantri || errorPelanggaran || errorQuest || errorAsrama;

  const stats = useMemo(() => ({
    totalSantri: santri.length,
    santriAktif: santri.filter(s => s.status === 'aktif').length,
    pelanggaranBulanIni: pelanggaran.length,
    questAktif: quest.filter(q => q.status === 'inProgress').length,
    asramaAktif: asrama.filter(a => a.status === 'aktif').length,
    hukumanAktif: hukuman.filter(h => h.status === 'aktif').length,
    pelanggaranMingguIni: pelanggaran.filter(p => p.status === 'pending').length,
    questSelesai: quest.filter(q => q.status === 'completed').length,
  }), [santri, pelanggaran, quest, asrama, hukuman]);

  const recentActivity = [
    { text: 'Ahmad Fauzi mendapat quest baru', type: 'success' as const },
    { text: 'Bilal Ramadhan menyelesaikan hafalan', type: 'success' as const },
    { text: 'Zaid Ahmad terkena pelanggaran keterlambatan', type: 'warning' as const },
    { text: 'Abdullah Firdaus: Keluar Asrama Tanpa Izin', type: 'error' as const },
  ];

  const adminChartPelanggaran = [
    { label: 'Senin', value: 12, color: 'bg-red-500' },
    { label: 'Selasa', value: 8, color: 'bg-red-500' },
    { label: 'Rabu', value: 15, color: 'bg-red-500' },
    { label: 'Kamis', value: 5, color: 'bg-red-500' },
    { label: 'Jumat', value: 3, color: 'bg-red-500' },
  ];

  const adminChartQuest = [
    { label: 'Tahfidz', value: 45, color: 'bg-emerald-500' },
    { label: 'Kebersihan', value: 30, color: 'bg-emerald-500' },
    { label: 'Disiplin', value: 20, color: 'bg-emerald-500' },
    { label: 'Prestasi', value: 15, color: 'bg-emerald-500' },
  ];

  const adminChartKategori = [
    { label: 'Ringan', value: 60, color: 'bg-amber-500' },
    { label: 'Sedang', value: 30, color: 'bg-orange-500' },
    { label: 'Berat', value: 10, color: 'bg-red-600' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard MA'HAD" description="Statistik global pesantren" />
        <LoadingState type="stats" count={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard MA'HAD" description="Statistik global pesantren" />
        <ErrorState message={error.message} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard MA'HAD" description="Statistik global pesantren" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Santri" value={stats.totalSantri} icon={Users} trend={{ value: 3, label: 'bulan ini' }} />
        <StatsCard title="Santri Aktif" value={stats.santriAktif} icon={GraduationCap} iconClassName="bg-emerald-500/10" />
        <StatsCard title="Pelanggaran Bln Ini" value={stats.pelanggaranBulanIni} icon={AlertTriangle} iconClassName="bg-red-500/10" />
        <StatsCard title="Quest Aktif" value={stats.questAktif} icon={Trophy} iconClassName="bg-amber-500/10" />
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnalyticsCard title="Pelanggaran Mingguan" data={adminChartPelanggaran} type="bar" />
        <AnalyticsCard title="Statistik Quest Selesai" data={adminChartQuest} type="progress" />
        <AnalyticsCard title="Kategori Pelanggaran" data={adminChartKategori} type="bar" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PageCard title="Aktivitas Terbaru">
          <div className="space-y-3">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <p className="text-sm text-foreground">{a.text}</p>
                <StatusBadge status={a.type} />
              </div>
            ))}
          </div>
        </PageCard>
        <div className="grid grid-cols-2 gap-4">
          <StatsCard title="Asrama Aktif" value={stats.asramaAktif} icon={Building2} iconClassName="bg-blue-500/10" />
          <StatsCard title="Hukuman Aktif" value={stats.hukumanAktif} icon={Shield} iconClassName="bg-orange-500/10" />
          <StatsCard title="Pelanggaran Minggu Ini" value={stats.pelanggaranMingguIni} icon={Activity} iconClassName="bg-purple-500/10" />
          <StatsCard title="Quest Selesai" value={stats.questSelesai} icon={CheckCircle} iconClassName="bg-emerald-500/10" />
        </div>
      </div>
    </div>
  );
}

// ─── MUSYRIF VIEW ───────────────────────────────────────────────
function MusyrifDashboard({ name }: { name: string }) {
  const { data: asramaList, loading: loadingAsrama } = useCollection<Asrama>('asrama');
  const { data: santriList, loading: loadingSantri } = useCollection<Santri>('santri');
  const { data: pelanggaranList, loading: loadingPelanggaran } = useCollection<Pelanggaran>('pelanggaran');

  const loading = loadingAsrama || loadingSantri || loadingPelanggaran;

  const asrama = asramaList.find((a) => a.musyrif === name);
  const santriAsrama = asrama ? santriList.filter((s) => s.asrama === asrama.name) : [];
  const pelanggaranAsrama = pelanggaranList.filter((p) =>
    santriAsrama.some((s) => s.id === p.santriId)
  );

  const musyrifChartPoin = santriAsrama.slice(0, 5).map(s => ({
    label: s.name.split(' ')[0],
    value: s.totalPoinPelanggaran,
    color: s.totalPoinPelanggaran > 40 ? 'bg-red-500' : 'bg-primary'
  }));

  const musyrifChartQuest = [
    { label: 'Aktif', value: 12, color: 'bg-amber-500' },
    { label: 'Selesai', value: 25, color: 'bg-emerald-500' },
    { label: 'Kadaluarsa', value: 3, color: 'bg-slate-500' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title={`Asrama ${asrama?.name ?? 'Anda'}`} description="Monitoring santri asrama yang kamu pegang" />
        <LoadingState type="stats" count={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Asrama ${asrama?.name ?? 'Anda'}`}
        description={`Monitoring santri asrama yang kamu pegang`}
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Santri" value={santriAsrama.length} icon={Users} />
        <StatsCard title="Santri Aktif" value={santriAsrama.filter(s => s.status === 'aktif').length} icon={GraduationCap} iconClassName="bg-emerald-500/10" />
        <StatsCard title="Pelanggaran" value={pelanggaranAsrama.length} icon={AlertTriangle} iconClassName="bg-red-500/10" />
        <StatsCard title="Hukuman Aktif" value={5} icon={Shield} iconClassName="bg-orange-500/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsCard title="Top Poin Pelanggaran Asrama" data={musyrifChartPoin} type="bar" />
        <AnalyticsCard title="Statistik Quest Asrama" data={musyrifChartQuest} type="progress" />
      </div>

      <PageCard title="Santri di Asrama" description={asrama?.name}>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground">
                <th className="text-left px-4 py-2 font-medium">Nama</th>
                <th className="text-left px-4 py-2 font-medium">Kamar</th>
                <th className="text-left px-4 py-2 font-medium">Status</th>
                <th className="text-left px-4 py-2 font-medium">Poin Pelanggaran</th>
                <th className="text-left px-4 py-2 font-medium">Karakter</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {santriAsrama.map((s) => (
                <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.kamar}</td>
                  <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                  <td className="px-4 py-3 font-bold text-red-600 dark:text-red-400">{s.totalPoinPelanggaran}</td>
                  <td className="px-4 py-3"><StatusBadge status={s.statusKarakter} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageCard>
    </div>
  );
}

// ─── WALI VIEW ──────────────────────────────────────────────────
function WaliDashboard({ userId }: { userId: string }) {
  const fbUser = useAuth().user;
  const { data: santriList, loading: loadingSantri } = useCollection<Santri>('santri');
  const { data: questList, loading: loadingQuest } = useCollection<Quest>('quest');

  const childSantriId = fbUser?.childSantriId;
  const anak = santriList.find(s => s.id === childSantriId);
  const quests = questList.filter(q => q.santriId === anak?.id);

  if (loadingSantri || loadingQuest) {
    return <LoadingState type="spinner" text="Memuat data anak..." />;
  }

  if (!anak) return <div className="p-8 text-center text-muted-foreground">Data anak tidak ditemukan.</div>;

  const waliChartKarakter = [
    { label: 'Kedisiplinan', value: 85, color: 'bg-emerald-500' },
    { label: 'Ibadah', value: 90, color: 'bg-blue-500' },
    { label: 'Sosial', value: 75, color: 'bg-amber-500' },
    { label: 'Akademik', value: 88, color: 'bg-purple-500' },
  ];

  const waliChartPelanggaran = [
    { label: 'Bulan 1', value: 10, color: 'bg-red-400' },
    { label: 'Bulan 2', value: 15, color: 'bg-red-500' },
    { label: 'Bulan 3', value: 5, color: 'bg-red-400' },
    { label: 'Bulan Ini', value: anak.totalPoinPelanggaran, color: 'bg-red-600' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={`Assalamu'alaikum \u{1F44B}`} description={`Pantau perkembangan ${anak.name}`} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Poin Pelanggaran" value={anak.totalPoinPelanggaran} icon={AlertTriangle} iconClassName="bg-red-500/10" />
        <StatsCard title="Hukuman Aktif" value={1} icon={Shield} iconClassName="bg-orange-500/10" />
        <StatsCard title="Quest Aktif" value={quests.filter(q=>q.status==='inProgress').length} icon={Trophy} iconClassName="bg-amber-500/10" />
        <StatsCard title="Quest Selesai" value={quests.filter(q=>q.status==='completed').length} icon={CheckCircle} iconClassName="bg-emerald-500/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsCard title="Progress Karakter Anak" data={waliChartKarakter} type="progress" />
        <AnalyticsCard title="Tren Poin Pelanggaran" data={waliChartPelanggaran} type="bar" />
      </div>
    </div>
  );
}

// ─── SANTRI VIEW ────────────────────────────────────────────────
function SantriDashboard({ name }: { name: string }) {
  const { data: santriList, loading } = useCollection<Santri>('santri');

  if (loading) return <LoadingState type="spinner" text="Memuat data santri..." />;

  const santri = santriList.find((s) => s.name.toLowerCase().includes(name.split(' ')[0].toLowerCase()));
  if (!santri) return <div className="p-8 text-center text-muted-foreground">Data tidak ditemukan.</div>;

  const santriChartProgress = [
    { label: 'Minggu 1', value: 20, color: 'bg-emerald-500' },
    { label: 'Minggu 2', value: 45, color: 'bg-emerald-500' },
    { label: 'Minggu 3', value: 60, color: 'bg-emerald-500' },
    { label: 'Minggu 4', value: 90, color: 'bg-emerald-500' },
  ];

  const santriChartPelanggaran = [
    { label: 'Telat', value: 10, color: 'bg-red-500' },
    { label: 'Asrama', value: 5, color: 'bg-red-500' },
    { label: 'Seragam', value: 0, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={`Halo, ${santri.name.split(' ')[0]} \u{1F44B}`} description="Dashboard pribadi santri" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Poin Pelanggaran" value={santri.totalPoinPelanggaran} icon={AlertTriangle} iconClassName="bg-red-500/10" />
        <StatsCard title="Hukuman Aktif" value={0} icon={Clock} iconClassName="bg-orange-500/10" />
        <StatsCard title="Quest Aktif" value={2} icon={Trophy} iconClassName="bg-amber-500/10" />
        <StatsCard title="Poin Prestasi" value={santri.totalPrestasi} icon={Star} iconClassName="bg-emerald-500/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsCard title="Progress Mingguan (Poin Prestasi)" data={santriChartProgress} type="bar" />
        <AnalyticsCard title="Statistik Pelanggaran Pribadi" data={santriChartPelanggaran} type="progress" />
      </div>
    </div>
  );
}

// ─── WALI KELAS VIEW ────────────────────────────────────────────────
function WaliKelasDashboard() {
  const chartDisiplinKelas = [
    { label: '10A', value: 85, color: 'bg-emerald-500' },
    { label: '10B', value: 65, color: 'bg-amber-500' },
    { label: '10C', value: 92, color: 'bg-emerald-500' },
  ];
  const chartQuestKelas = [
    { label: 'Selesai', value: 40, color: 'bg-blue-500' },
    { label: 'Berjalan', value: 25, color: 'bg-amber-500' },
    { label: 'Telat', value: 5, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard Wali Kelas" description="Monitoring kedisiplinan dan akademik kelas" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Murid" value={32} icon={Users} />
        <StatsCard title="Kehadiran" value={98} icon={CheckCircle} iconClassName="bg-emerald-500/10" />
        <StatsCard title="Pelanggaran Kelas" value={12} icon={AlertTriangle} iconClassName="bg-red-500/10" />
        <StatsCard title="Quest Kelas" value={5} icon={Trophy} iconClassName="bg-amber-500/10" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsCard title="Grafik Disiplin Kelas" data={chartDisiplinKelas} type="bar" />
        <AnalyticsCard title="Quest Kelas Aktif" data={chartQuestKelas} type="progress" />
      </div>
    </div>
  );
}

// ─── KESISWAAN VIEW ────────────────────────────────────────────────
function KesiswaanDashboard() {
  const chartApproval = [
    { label: 'Disetujui', value: 120, color: 'bg-emerald-500' },
    { label: 'Ditolak', value: 15, color: 'bg-red-500' },
    { label: 'Menunggu', value: 34, color: 'bg-amber-500' },
  ];
  const chartGlobal = [
    { label: 'Asrama', value: 45, color: 'bg-blue-500' },
    { label: 'Sekolah', value: 30, color: 'bg-indigo-500' },
    { label: 'Masjid', value: 15, color: 'bg-violet-500' },
    { label: 'Luar', value: 5, color: 'bg-slate-500' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Kepala Kesiswaan" description="Pusat kontrol dan approval global" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Pending Approval" value={34} icon={ClipboardCheck} iconClassName="bg-amber-500/10" />
        <StatsCard title="Total Pembinaan" value={156} icon={Shield} iconClassName="bg-blue-500/10" />
        <StatsCard title="Pelanggaran Berat" value={3} icon={AlertTriangle} iconClassName="bg-red-500/10" />
        <StatsCard title="Prestasi Global" value={89} icon={Star} iconClassName="bg-emerald-500/10" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsCard title="Approval Analytics" data={chartApproval} type="progress" />
        <AnalyticsCard title="Pelanggaran Global Berdasarkan Lokasi" data={chartGlobal} type="bar" />
      </div>
    </div>
  );
}

// ─── GURU VIEW ────────────────────────────────────────────────
function GuruDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard Guru" description="Akses data pengajaran dan presensi santri" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Kelas Aktif" value={4} icon={School} />
        <StatsCard title="Total Jam" value={24} icon={Clock} iconClassName="bg-blue-500/10" />
        <StatsCard title="Laporan Telat" value={2} icon={AlertTriangle} iconClassName="bg-red-500/10" />
      </div>
    </div>
  );
}

// ─── STAFF VIEW ────────────────────────────────────────────────
function StaffDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard Staff" description="Operasional dan administrasi harian" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Tugas Aktif" value={12} icon={Briefcase} />
        <StatsCard title="Pesan Masuk" value={5} icon={Clock} iconClassName="bg-blue-500/10" />
      </div>
    </div>
  );
}

// ─── MAIN EXPORT ────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'admin': return <AdminDashboard />;
    case 'musyrif': return <MusyrifDashboard name={user.name} />;
    case 'wali': return <WaliDashboard userId={user.id} />;
    case 'santri': return <SantriDashboard name={user.name} />;
    case 'wali_kelas': return <WaliKelasDashboard />;
    case 'kepala_kesiswaan': return <KesiswaanDashboard />;
    case 'guru': return <GuruDashboard />;
    case 'staff': return <StaffDashboard />;
    default: return <div className="p-8 text-center text-muted-foreground">Dashboard belum tersedia untuk role ini.</div>;
  }
}
