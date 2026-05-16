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
import type { Santri, Pelanggaran, Quest, Hukuman, Asrama, Notification } from '@/types';
import type { HealthVisit } from '@/types/health';
import {
  Users, Building2, AlertTriangle, Trophy, Shield,
  Activity, GraduationCap, Star, Clock, CheckCircle,
  ClipboardCheck, School, Briefcase, BookOpen, Stethoscope
} from 'lucide-react';

// ─── ADMIN VIEW ────────────────────────────────────────────────
function AdminDashboard() {
  const { data: santri, loading: loadingSantri, error: errorSantri } = useCollection<Santri>('santri');
  const { data: pelanggaran, loading: loadingPelanggaran, error: errorPelanggaran } = useCollection<Pelanggaran>('pelanggaran');
  const { data: quest, loading: loadingQuest, error: errorQuest } = useCollection<Quest>('quest');
  const { data: asrama, loading: loadingAsrama, error: errorAsrama } = useCollection<Asrama>('asrama');
  const { data: hukuman, loading: loadingHukuman } = useCollection<Hukuman>('hukuman');
  const { data: notifications } = useCollection<Notification>('notifications');
  const { data: healthVisits, loading: loadingHealth } = useCollection<HealthVisit>('healthVisits');

  const loading = loadingSantri || loadingPelanggaran || loadingQuest || loadingAsrama || loadingHukuman || loadingHealth;
  const error = errorSantri || errorPelanggaran || errorQuest || errorAsrama;

  const stats = useMemo(() => ({
    totalSantri: santri.length,
    santriAktif: santri.filter(s => s.status === 'aktif').length,
    totalPelanggaran: pelanggaran.length,
    pelanggaranPending: pelanggaran.filter(p => p.status === 'pending').length,
    pelanggaranConfirmed: pelanggaran.filter(p => p.status === 'confirmed').length,
    questAktif: quest.filter(q => q.status === 'inProgress' || q.status === 'available').length,
    questSelesai: quest.filter(q => q.status === 'completed').length,
    asramaAktif: asrama.filter(a => a.status === 'aktif').length,
    hukumanAktif: hukuman.filter(h => h.status === 'aktif').length,
    notifUnread: notifications.filter(n => !n.read).length,
    uksHariIni: healthVisits.filter(v => v.masukAt && v.masukAt.startsWith(new Date().toISOString().split('T')[0])).length,
    dalamObservasi: healthVisits.filter(v => v.status === 'observasi' || v.status === 'rawat_sementara').length,
  }), [santri, pelanggaran, quest, asrama, hukuman, notifications, healthVisits]);

  // Compute analytics from real data
  const { severityChart, questChart, santriTopViolations } = useMemo(() => {
    // Severity breakdown from real pelanggaran
    const severities: Record<string, number> = { ringan: 0, sedang: 0, berat: 0, sangat_berat: 0 };
    pelanggaran.forEach(p => { if (p.severity) severities[p.severity] = (severities[p.severity] || 0) + 1; });
    const severityChart = [
      { label: 'Ringan', value: severities.ringan || 0, color: 'bg-amber-500' },
      { label: 'Sedang', value: severities.sedang || 0, color: 'bg-orange-500' },
      { label: 'Berat', value: severities.berat || 0, color: 'bg-red-500' },
      { label: 'Sgt Berat', value: severities.sangat_berat || 0, color: 'bg-red-700' },
    ];

    // Quest status breakdown
    const questCompleted = quest.filter(q => q.status === 'completed').length;
    const questInProgress = quest.filter(q => q.status === 'inProgress').length;
    const questAvailable = quest.filter(q => q.status === 'available').length;
    const questChart = [
      { label: 'Tersedia', value: questAvailable, color: 'bg-blue-500' },
      { label: 'Berjalan', value: questInProgress, color: 'bg-amber-500' },
      { label: 'Selesai', value: questCompleted, color: 'bg-emerald-500' },
    ];

    // Top santri by violation points
    const santriTopViolations = [...santri]
      .sort((a, b) => b.totalPoinPelanggaran - a.totalPoinPelanggaran)
      .slice(0, 5)
      .map(s => ({
        label: s.name.split(' ')[0],
        value: s.totalPoinPelanggaran,
        color: s.totalPoinPelanggaran > 40 ? 'bg-red-500' : s.totalPoinPelanggaran > 20 ? 'bg-amber-500' : 'bg-emerald-500'
      }));

    return { severityChart, questChart, santriTopViolations };
  }, [pelanggaran, quest, santri]);

  // Recent actual activity
  const recentActivity = useMemo(() => {
    const items: { text: string; type: 'success' | 'warning' | 'error' | 'info' }[] = [];
    const recentPelanggaran = [...pelanggaran].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
    const recentQuest = [...quest].filter(q => q.status === 'completed').slice(0, 2);

    recentPelanggaran.forEach(p => {
      items.push({ text: `${p.santriName} — ${p.pelanggaranName} (${p.severity})`, type: 'warning' });
    });
    recentQuest.forEach(q => {
      items.push({ text: `${q.santriName} menyelesaikan "${q.title}"`, type: 'success' });
    });

    const recentUks = [...healthVisits]
      .sort((a, b) => b.masukAt.localeCompare(a.masukAt))
      .slice(0, 3)
      .map(v => ({ text: `${v.santriName} — ${v.keluhan}`, type: 'info' as const }));
    items.push(...recentUks);

    return items.slice(0, 5);
  }, [pelanggaran, quest, healthVisits]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Statistik global pesantren" />
        <LoadingState type="stats" count={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Statistik global pesantren" />
        <ErrorState message={error.message} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Statistik global pesantren — data realtime" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Santri" value={stats.totalSantri} icon={Users} trend={{ value: stats.santriAktif, label: 'aktif' }} />
        <StatsCard title="Pelanggaran" value={stats.totalPelanggaran} icon={AlertTriangle} iconClassName="bg-red-500/10" trend={{ value: stats.pelanggaranPending, label: 'pending' }} />
        <StatsCard title="UKS Hari Ini" value={stats.uksHariIni} icon={Stethoscope} iconClassName="bg-emerald-500/10" />
        <StatsCard title="Hukuman Aktif" value={stats.hukumanAktif} icon={Shield} iconClassName="bg-orange-500/10" />
      </div>

      {/* Analytics from real data */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnalyticsCard title="Kategori Pelanggaran" data={severityChart} type="bar" />
        <AnalyticsCard title="Status Quest" data={questChart} type="progress" />
        <AnalyticsCard title="Top 5 Poin Pelanggaran" data={santriTopViolations} type="bar" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PageCard title="Aktivitas Terbaru">
          {recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Belum ada aktivitas tercatat.</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <p className="text-sm text-foreground">{a.text}</p>
                  <StatusBadge status={a.type} />
                </div>
              ))}
            </div>
          )}
        </PageCard>
        <div className="grid grid-cols-2 gap-4">
          <StatsCard title="Asrama Aktif" value={stats.asramaAktif} icon={Building2} iconClassName="bg-blue-500/10" />
          <StatsCard title="Santri Aktif" value={stats.santriAktif} icon={GraduationCap} iconClassName="bg-emerald-500/10" />
          <StatsCard title="Quest Selesai" value={stats.questSelesai} icon={CheckCircle} iconClassName="bg-emerald-500/10" />
          <StatsCard title="Dalam Observasi" value={stats.dalamObservasi} icon={Activity} iconClassName="bg-teal-500/10" />
        </div>
      </div>
    </div>
  );
}

// ─── MUSYRIF VIEW ───────────────────────────────────────────────
function MusyrifDashboard({ name }: { name: string }) {
  const { data: asramaList } = useCollection<Asrama>('asrama');
  const { data: santriList, loading: loadingSantri } = useCollection<Santri>('santri');
  const { data: pelanggaranList } = useCollection<Pelanggaran>('pelanggaran');
  const { data: hukumanList } = useCollection<Hukuman>('hukuman');

  const asrama = asramaList.find((a) => a.musyrif === name);
  const santriAsrama = asrama ? santriList.filter((s) => s.asramaId === asrama.id || s.asrama === asrama.name) : [];
  const pelanggaranAsrama = pelanggaranList.filter((p) =>
    santriAsrama.some((s) => s.id === p.santriId)
  );
  const hukumanAsrama = hukumanList.filter((h) =>
    santriAsrama.some((s) => s.id === h.santriId) && h.status === 'aktif'
  );

  const topPoinChart = [...santriAsrama]
    .sort((a, b) => b.totalPoinPelanggaran - a.totalPoinPelanggaran)
    .slice(0, 5)
    .map(s => ({
      label: s.name.split(' ')[0],
      value: s.totalPoinPelanggaran,
      color: s.totalPoinPelanggaran > 40 ? 'bg-red-500' : s.totalPoinPelanggaran > 20 ? 'bg-amber-500' : 'bg-emerald-500'
    }));

  const karakterCount: Record<string, number> = { 'Baik': 0, 'Perlu Perhatian': 0, 'Peringatan': 0 };
  santriAsrama.forEach(s => { if (s.statusKarakter) karakterCount[s.statusKarakter] = (karakterCount[s.statusKarakter] || 0) + 1; });
  const karakterChart = [
    { label: 'Baik', value: karakterCount['Baik'] || 0, color: 'bg-emerald-500' },
    { label: 'Perlu Perhatian', value: karakterCount['Perlu Perhatian'] || 0, color: 'bg-amber-500' },
    { label: 'Peringatan', value: karakterCount['Peringatan'] || 0, color: 'bg-red-500' },
  ];

  if (loadingSantri) {
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
        description="Monitoring santri asrama yang kamu pegang"
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Santri" value={santriAsrama.length} icon={Users} />
        <StatsCard title="Santri Aktif" value={santriAsrama.filter(s => s.status === 'aktif').length} icon={GraduationCap} iconClassName="bg-emerald-500/10" />
        <StatsCard title="Pelanggaran" value={pelanggaranAsrama.length} icon={AlertTriangle} iconClassName="bg-red-500/10" />
        <StatsCard title="Hukuman Aktif" value={hukumanAsrama.length} icon={Shield} iconClassName="bg-orange-500/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsCard title="Top Poin Pelanggaran" data={topPoinChart} type="bar" />
        <AnalyticsCard title="Status Karakter Santri" data={karakterChart} type="progress" />
      </div>

      <PageCard title="Santri di Asrama" description={asrama?.name ?? 'Daftar santri'}>
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
function WaliDashboard() {
  const fbUser = useAuth().user;
  const { data: santriList, loading: loadingSantri } = useCollection<Santri>('santri');
  const { data: questList } = useCollection<Quest>('quest');
  const { data: pelanggaranList } = useCollection<Pelanggaran>('pelanggaran');
  const { data: hukumanList } = useCollection<Hukuman>('hukuman');

  const childSantriId = fbUser?.childSantriId;
  const anak = santriList.find(s => s.id === childSantriId);
  const quests = questList.filter(q => q.santriId === anak?.id);
  const pelanggaranAnak = pelanggaranList.filter(p => p.santriId === anak?.id);
  const hukumanAnak = hukumanList.filter(h => h.santriId === anak?.id && h.status === 'aktif');

  if (loadingSantri) {
    return <LoadingState type="spinner" text="Memuat data anak..." />;
  }

  if (!anak) return <div className="p-8 text-center text-muted-foreground">Data anak tidak ditemukan.</div>;

  const questAktif = quests.filter(q => q.status === 'inProgress' || q.status === 'available').length;
  const questSelesai = quests.filter(q => q.status === 'completed').length;

  return (
    <div className="space-y-6">
      <PageHeader title={`Assalamu'alaikum`} description={`Pantau perkembangan ${anak.name}`} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Poin Pelanggaran" value={anak.totalPoinPelanggaran} icon={AlertTriangle} iconClassName="bg-red-500/10" />
        <StatsCard title="Poin Prestasi" value={anak.totalPrestasi} icon={Star} iconClassName="bg-emerald-500/10" />
        <StatsCard title="Hukuman Aktif" value={hukumanAnak.length} icon={Shield} iconClassName="bg-orange-500/10" />
        <StatsCard title="Status Karakter" value={anak.statusKarakter} icon={GraduationCap} iconClassName="bg-blue-500/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StatsCard title="Quest Aktif" value={questAktif} icon={Trophy} iconClassName="bg-amber-500/10" />
        <StatsCard title="Quest Selesai" value={questSelesai} icon={CheckCircle} iconClassName="bg-emerald-500/10" />
        <StatsCard title="Total Pelanggaran" value={pelanggaranAnak.length} icon={Activity} iconClassName="bg-purple-500/10" />
      </div>

      {/* Pelanggaran detail */}
      {pelanggaranAnak.length > 0 && (
        <PageCard title="Riwayat Pelanggaran" description={`${pelanggaranAnak.length} pelanggaran tercatat`}>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-muted-foreground">
                  <th className="text-left px-4 py-2 font-medium">Tanggal</th>
                  <th className="text-left px-4 py-2 font-medium">Pelanggaran</th>
                  <th className="text-left px-4 py-2 font-medium">Poin</th>
                  <th className="text-left px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pelanggaranAnak.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2 text-muted-foreground text-xs">{p.date}</td>
                    <td className="px-4 py-2 font-medium">{p.pelanggaranName}</td>
                    <td className="px-4 py-2 font-bold text-red-600">{p.points}</td>
                    <td className="px-4 py-2"><StatusBadge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PageCard>
      )}
    </div>
  );
}

// ─── SANTRI VIEW ────────────────────────────────────────────────
function SantriDashboard({ name }: { name: string }) {
  const { data: santriList, loading } = useCollection<Santri>('santri');
  const { data: questList } = useCollection<Quest>('quest');

  if (loading) return <LoadingState type="spinner" text="Memuat data santri..." />;

  const santri = santriList.find((s) => s.name.toLowerCase().includes(name.split(' ')[0].toLowerCase()));
  if (!santri) return <div className="p-8 text-center text-muted-foreground">Data tidak ditemukan.</div>;

  const quests = questList.filter(q => q.santriId === santri.id);
  const questAktif = quests.filter(q => q.status === 'inProgress' || q.status === 'available').length;
  const questSelesai = quests.filter(q => q.status === 'completed').length;

  return (
    <div className="space-y-6">
      <PageHeader title={`Halo, ${santri.name.split(' ')[0]}`} description="Dashboard pribadi santri" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Poin Pelanggaran" value={santri.totalPoinPelanggaran} icon={AlertTriangle} iconClassName="bg-red-500/10" />
        <StatsCard title="Poin Prestasi" value={santri.totalPrestasi} icon={Star} iconClassName="bg-emerald-500/10" />
        <StatsCard title="Status SP" value={santri.statusSP} icon={Shield} iconClassName="bg-orange-500/10" />
        <StatsCard title="Status Karakter" value={santri.statusKarakter} icon={GraduationCap} iconClassName="bg-blue-500/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatsCard title="Quest Aktif" value={questAktif} icon={Trophy} iconClassName="bg-amber-500/10" />
        <StatsCard title="Quest Selesai" value={questSelesai} icon={CheckCircle} iconClassName="bg-emerald-500/10" />
      </div>
    </div>
  );
}

// ─── WALI KELAS VIEW ────────────────────────────────────────────
function WaliKelasDashboard() {
  const { user } = useAuth();
  const { data: santriList, loading } = useCollection<Santri>('santri');
  const { data: pelanggaranList } = useCollection<Pelanggaran>('pelanggaran');
  const { data: questList } = useCollection<Quest>('quest');

  if (loading) return <LoadingState type="spinner" text="Memuat data kelas..." />;

  // Filter santri by wali kelas name matching their kelas field
  const santriKelas = santriList.filter(s => s.kelas && user?.name && s.kelas.toLowerCase().includes(user.name.toLowerCase().split(' ')[0]));

  const pelanggaranKelas = pelanggaranList.filter(p =>
    santriKelas.some(s => s.id === p.santriId)
  );
  const questKelas = questList.filter(q =>
    santriKelas.some(s => s.id === q.santriId)
  );
  const questSelesai = questKelas.filter(q => q.status === 'completed').length;
  const questBerjalan = questKelas.filter(q => q.status === 'inProgress').length;
  const pelanggaranPending = pelanggaranKelas.filter(p => p.status === 'pending').length;

  const topPelanggaranChart = [...santriKelas]
    .sort((a, b) => b.totalPoinPelanggaran - a.totalPoinPelanggaran)
    .slice(0, 5)
    .map(s => ({
      label: s.name.split(' ')[0],
      value: s.totalPoinPelanggaran,
      color: s.totalPoinPelanggaran > 40 ? 'bg-red-500' : s.totalPoinPelanggaran > 20 ? 'bg-amber-500' : 'bg-emerald-500'
    }));

  const questKelasChart = [
    { label: 'Selesai', value: questSelesai, color: 'bg-emerald-500' },
    { label: 'Berjalan', value: questBerjalan, color: 'bg-amber-500' },
    { label: 'Pending', value: pelanggaranPending, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard Wali Kelas" description="Monitoring kedisiplinan dan akademik kelas" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Murid" value={santriKelas.length} icon={Users} />
        <StatsCard title="Santri Aktif" value={santriKelas.filter(s => s.status === 'aktif').length} icon={CheckCircle} iconClassName="bg-emerald-500/10" />
        <StatsCard title="Pelanggaran" value={pelanggaranKelas.length} icon={AlertTriangle} iconClassName="bg-red-500/10" />
        <StatsCard title="Quest Aktif" value={questBerjalan} icon={Trophy} iconClassName="bg-amber-500/10" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsCard title="Top Poin Pelanggaran" data={topPelanggaranChart} type="bar" />
        <AnalyticsCard title="Aktivitas Kelas" data={questKelasChart} type="progress" />
      </div>
    </div>
  );
}

// ─── KESISWAAN VIEW ────────────────────────────────────────────
function KesiswaanDashboard() {
  const { data: questList, loading: loadingQuest } = useCollection<Quest>('quest');
  const { data: pelanggaranList, loading: loadingPelanggaran } = useCollection<Pelanggaran>('pelanggaran');
  const { data: santriList, loading: loadingSantri } = useCollection<Santri>('santri');

  const loading = loadingQuest || loadingPelanggaran || loadingSantri;

  if (loading) return <LoadingState type="spinner" text="Memuat data kesiswaan..." />;

  const pendingApproval = questList.filter(q => q.approvalStatus === 'pending').length;
  const totalPembinaan = pelanggaranList.filter(p => p.status === 'confirmed').length;
  const pelanggaranBerat = pelanggaranList.filter(p => p.severity === 'berat' || p.severity === 'sangat_berat').length;
  const totalPrestasi = santriList.reduce((sum, s) => sum + (s.totalPrestasi || 0), 0);

  const approvalChart = [
    { label: 'Disetujui', value: questList.filter(q => q.approvalStatus === 'approved').length, color: 'bg-emerald-500' },
    { label: 'Ditolak', value: questList.filter(q => q.approvalStatus === 'rejected').length, color: 'bg-red-500' },
    { label: 'Menunggu', value: pendingApproval, color: 'bg-amber-500' },
  ];

  const severityChart = [
    { label: 'Ringan', value: pelanggaranList.filter(p => p.severity === 'ringan').length, color: 'bg-amber-500' },
    { label: 'Sedang', value: pelanggaranList.filter(p => p.severity === 'sedang').length, color: 'bg-orange-500' },
    { label: 'Berat', value: pelanggaranList.filter(p => p.severity === 'berat' || p.severity === 'sangat_berat').length, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Kepala Kesiswaan" description="Pusat kontrol dan approval global" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Pending Approval" value={pendingApproval} icon={ClipboardCheck} iconClassName="bg-amber-500/10" />
        <StatsCard title="Total Pembinaan" value={totalPembinaan} icon={Shield} iconClassName="bg-blue-500/10" />
        <StatsCard title="Pelanggaran Berat" value={pelanggaranBerat} icon={AlertTriangle} iconClassName="bg-red-500/10" />
        <StatsCard title="Total Prestasi" value={totalPrestasi} icon={Star} iconClassName="bg-emerald-500/10" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsCard title="Approval Quest" data={approvalChart} type="progress" />
        <AnalyticsCard title="Severitas Pelanggaran" data={severityChart} type="bar" />
      </div>
    </div>
  );
}

// ─── GURU VIEW ────────────────────────────────────────────────
function GuruDashboard() {
  const { user } = useAuth();
  const { data: mapelList, loading } = useCollection<{ id: string; name: string; status: string }>('mapel');
  const { data: santriList } = useCollection<Santri>('santri');

  if (loading) return <LoadingState type="spinner" text="Memuat data mengajar..." />;

  const mapelAktif = mapelList.filter(m => m.status === 'active').length;

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard Guru" description="Akses data pengajaran dan presensi santri" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Mapel Aktif" value={mapelAktif} icon={BookOpen} />
        <StatsCard title="Total Santri" value={santriList.length} icon={Users} iconClassName="bg-blue-500/10" />
        <StatsCard title="Santri Aktif" value={santriList.filter(s => s.status === 'aktif').length} icon={GraduationCap} iconClassName="bg-emerald-500/10" />
      </div>
    </div>
  );
}

// ─── STAFF VIEW ────────────────────────────────────────────────
function StaffDashboard() {
  const { data: asramaList } = useCollection<Asrama>('asrama');
  const { data: santriList } = useCollection<Santri>('santri');

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard Staff" description="Operasional dan administrasi harian" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Santri" value={santriList.length} icon={Users} />
        <StatsCard title="Santri Aktif" value={santriList.filter(s => s.status === 'aktif').length} icon={GraduationCap} iconClassName="bg-emerald-500/10" />
        <StatsCard title="Asrama Aktif" value={asramaList.filter(a => a.status === 'aktif').length} icon={Building2} iconClassName="bg-blue-500/10" />
        <StatsCard title="Total Asrama" value={asramaList.length} icon={School} iconClassName="bg-purple-500/10" />
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
    case 'wali': return <WaliDashboard />;
    case 'santri': return <SantriDashboard name={user.name} />;
    case 'wali_kelas': return <WaliKelasDashboard />;
    case 'kepala_kesiswaan': return <KesiswaanDashboard />;
    case 'guru': return <GuruDashboard />;
    case 'staff': return <StaffDashboard />;
    default: return <div className="p-8 text-center text-muted-foreground">Dashboard belum tersedia untuk role ini.</div>;
  }
}
