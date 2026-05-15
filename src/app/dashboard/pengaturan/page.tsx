'use client';

import { useState } from 'react';
import { PageHeader, PageCard } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { useAuth } from '@/hooks';
import { 
  User, Lock, Bell, Palette, Info, LogOut, 
  Save, RotateCcw, Mail, Smartphone, Globe, 
  Shield, HardDrive, RefreshCw, Key, Laptop, Smartphone as PhoneIcon,
  PieChart, Activity
} from 'lucide-react';

export default function PengaturanPage() {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [notifSettings, setNotifSettings] = useState({
    email: true,
    whatsapp: true,
    push: false,
  });
  const [appSettings, setAppSettings] = useState({
    darkMode: true,
    compactMode: false,
    language: 'id',
  });
  const [chartSettings, setChartSettings] = useState({
    theme: 'modern',
    animation: true,
    gradient: true,
    smoothLines: true,
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

  const handleReset = () => {
    setNotifSettings({ email: true, whatsapp: true, push: false });
    setAppSettings({ darkMode: true, compactMode: false, language: 'id' });
    setChartSettings({ theme: 'modern', animation: true, gradient: true, smoothLines: true });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <PageHeader 
        title="Pengaturan Sistem" 
        description="Konfigurasi akun pribadi dan preferensi aplikasi Anda"
        action={
          <div className="flex items-center gap-3">
            <button 
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-background border border-border rounded-lg transition-all active:scale-95 shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-primary-foreground bg-primary rounded-lg transition-all hover:bg-primary/90 active:scale-95 shadow-sm disabled:opacity-70"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span className="hidden sm:inline">{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Profile Settings */}
        <PageCard title="Profil Pengguna" description="Informasi dasar akun Anda">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="flex flex-col items-center gap-3">
              <div className="w-24 h-24 rounded-full bg-primary/10 border-4 border-background shadow-md flex items-center justify-center text-3xl font-bold text-primary">
                {user?.name || '-'.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
              <button className="text-xs font-semibold text-primary hover:underline">Ubah Foto</button>
            </div>
            
            <div className="flex-1 space-y-4 w-full">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nama Lengkap</label>
                <div className="flex items-center gap-3 px-3 py-2 bg-muted/50 rounded-lg border border-border/50">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{user?.name || '-'}</span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Address</label>
                <div className="flex items-center gap-3 px-3 py-2 bg-muted/50 rounded-lg border border-border/50">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{user?.email || '-'}</span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role / Hak Akses</label>
                <div className="flex items-center gap-3 px-3 py-2 bg-muted/50 rounded-lg border border-border/50">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold text-primary capitalize">{user?.role || ''}</span>
                </div>
              </div>
              <button className="w-full py-2.5 mt-2 bg-background border border-border rounded-lg text-sm font-semibold hover:bg-muted transition-colors shadow-sm">
                Edit Data Profil
              </button>
            </div>
          </div>
        </PageCard>

        {/* 2. Security Settings */}
        <PageCard title="Keamanan & Akses" description="Kelola kata sandi dan sesi login Anda">
          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Key className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Ubah Password</h4>
                  <p className="text-xs text-muted-foreground">Terakhir diubah 3 bulan lalu</p>
                </div>
              </div>
              <button className="px-3 py-1.5 text-xs font-semibold border border-border rounded-md hover:bg-muted transition-colors">
                Update
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Sesi Aktif Saat Ini</h4>
              
              <div className="flex items-center justify-between p-3 rounded-lg border border-primary/20 bg-primary/5">
                <div className="flex items-center gap-3">
                  <Laptop className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Windows 11 · Chrome</p>
                    <p className="text-[10px] text-muted-foreground">IP: 192.168.1.10 · Saat ini aktif</p>
                  </div>
                </div>
                <StatusBadge status="aktif" variant="success" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                <div className="flex items-center gap-3">
                  <PhoneIcon className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">iPhone 13 Pro · Safari</p>
                    <p className="text-[10px] text-muted-foreground">Login terakhir: Kemarin, 14:30 WIB</p>
                  </div>
                </div>
              </div>
            </div>

            <button className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors">
              <LogOut className="w-4 h-4" />
              Logout dari Semua Perangkat
            </button>
          </div>
        </PageCard>

        {/* 3. Notification Settings */}
        <PageCard title="Notifikasi" description="Atur bagaimana Anda menerima pemberitahuan">
          <div className="space-y-2">
            <label className="flex items-center justify-between p-4 rounded-xl border border-border bg-card cursor-pointer hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Email Notifications</h4>
                  <p className="text-xs text-muted-foreground">Laporan mingguan & alert penting</p>
                </div>
              </div>
              <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifSettings.email ? 'bg-primary' : 'bg-muted-foreground/30'}`} onClick={() => setNotifSettings({...notifSettings, email: !notifSettings.email})}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifSettings.email ? 'translate-x-6' : 'translate-x-1'}`} />
              </div>
            </label>

            <label className="flex items-center justify-between p-4 rounded-xl border border-border bg-card cursor-pointer hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <Smartphone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">WhatsApp Bot</h4>
                  <p className="text-xs text-muted-foreground">Notifikasi instan via WhatsApp</p>
                </div>
              </div>
              <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifSettings.whatsapp ? 'bg-primary' : 'bg-muted-foreground/30'}`} onClick={() => setNotifSettings({...notifSettings, whatsapp: !notifSettings.whatsapp})}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifSettings.whatsapp ? 'translate-x-6' : 'translate-x-1'}`} />
              </div>
            </label>

            <label className="flex items-center justify-between p-4 rounded-xl border border-border bg-card cursor-pointer hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Push Notifications</h4>
                  <p className="text-xs text-muted-foreground">Notifikasi langsung di browser</p>
                </div>
              </div>
              <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifSettings.push ? 'bg-primary' : 'bg-muted-foreground/30'}`} onClick={() => setNotifSettings({...notifSettings, push: !notifSettings.push})}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifSettings.push ? 'translate-x-6' : 'translate-x-1'}`} />
              </div>
            </label>
          </div>
        </PageCard>

        {/* 4. Appearance */}
        <PageCard title="Tampilan Sistem" description="Sesuaikan tema dan bahasa aplikasi">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Tema Gelap (Dark Mode)</span>
              </div>
              <div className={`relative inline-flex h-5 w-9 items-center rounded-full cursor-pointer transition-colors ${appSettings.darkMode ? 'bg-primary' : 'bg-muted-foreground/30'}`} onClick={() => setAppSettings({...appSettings, darkMode: !appSettings.darkMode})}>
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${appSettings.darkMode ? 'translate-x-5' : 'translate-x-1'}`} />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border-t border-border">
              <div className="flex items-center gap-3">
                <Laptop className="w-5 h-5 text-muted-foreground" />
                <div>
                  <span className="text-sm font-medium text-foreground block">Compact Mode</span>
                  <span className="text-[10px] text-muted-foreground">Tampilan UI yang lebih padat</span>
                </div>
              </div>
              <div className={`relative inline-flex h-5 w-9 items-center rounded-full cursor-pointer transition-colors ${appSettings.compactMode ? 'bg-primary' : 'bg-muted-foreground/30'}`} onClick={() => setAppSettings({...appSettings, compactMode: !appSettings.compactMode})}>
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${appSettings.compactMode ? 'translate-x-5' : 'translate-x-1'}`} />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border-t border-border">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Bahasa Sistem</span>
              </div>
              <select 
                value={appSettings.language}
                onChange={(e) => setAppSettings({...appSettings, language: e.target.value})}
                className="text-sm border border-border rounded-md px-2 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="id">Bahasa Indonesia</option>
                <option value="en">English (US)</option>
                <option value="ar">العربية (Arabic)</option>
              </select>
            </div>
          </div>
        </PageCard>

        {/* 5. Chart Appearance Preferences */}
        <PageCard title="Preferensi Tampilan Grafik" description="Sesuaikan gaya visual chart analytics dashboard">
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <PieChart className="w-3.5 h-3.5" /> Tema Grafik
              </label>
              <select 
                value={chartSettings.theme}
                onChange={(e) => setChartSettings({...chartSettings, theme: e.target.value})}
                className="w-full text-sm border border-border rounded-lg px-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              >
                <option value="modern">Modern SaaS (Default)</option>
                <option value="minimal">Minimal Clean</option>
                <option value="rounded">Rounded Playful</option>
                <option value="glassmorphism">Glassmorphism</option>
                <option value="dark-analytics">Dark Analytics</option>
                <option value="soft-color">Soft Pastel Colors</option>
              </select>
            </div>

            <div className="space-y-2 pt-2 border-t border-border">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-2">
                <Activity className="w-3.5 h-3.5" /> Efek Visual
              </label>
              
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors">
                <span className="text-sm font-medium text-foreground">Animasi Chart (Smooth Transition)</span>
                <div className={`relative inline-flex h-5 w-9 items-center rounded-full cursor-pointer transition-colors ${chartSettings.animation ? 'bg-primary' : 'bg-muted-foreground/30'}`} onClick={() => setChartSettings({...chartSettings, animation: !chartSettings.animation})}>
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${chartSettings.animation ? 'translate-x-5' : 'translate-x-1'}`} />
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors">
                <span className="text-sm font-medium text-foreground">Fill Gradient Style</span>
                <div className={`relative inline-flex h-5 w-9 items-center rounded-full cursor-pointer transition-colors ${chartSettings.gradient ? 'bg-primary' : 'bg-muted-foreground/30'}`} onClick={() => setChartSettings({...chartSettings, gradient: !chartSettings.gradient})}>
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${chartSettings.gradient ? 'translate-x-5' : 'translate-x-1'}`} />
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors">
                <span className="text-sm font-medium text-foreground">Smooth Curves (Line Chart)</span>
                <div className={`relative inline-flex h-5 w-9 items-center rounded-full cursor-pointer transition-colors ${chartSettings.smoothLines ? 'bg-primary' : 'bg-muted-foreground/30'}`} onClick={() => setChartSettings({...chartSettings, smoothLines: !chartSettings.smoothLines})}>
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${chartSettings.smoothLines ? 'translate-x-5' : 'translate-x-1'}`} />
                </div>
              </div>
            </div>
          </div>
        </PageCard>

        {/* 6. System Information */}
        <div className="lg:col-span-2">
          <PageCard title="Informasi Sistem" description="Status dan spesifikasi server saat ini">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col gap-1">
                <span className="text-xs text-muted-foreground font-medium uppercase">Versi Aplikasi</span>
                <span className="text-sm font-bold text-foreground flex items-center gap-2">
                  v2.4.1 (Stable) <StatusBadge status="aktif" variant="success" className="text-[9px] px-1.5 py-0" />
                </span>
              </div>
              
              <div className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col gap-1">
                <span className="text-xs text-muted-foreground font-medium uppercase">Status Server</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  Online (99.9% Uptime)
                </span>
              </div>

              <div className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col gap-1">
                <span className="text-xs text-muted-foreground font-medium uppercase">Koneksi Database</span>
                <span className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-blue-500" /> Connected (32ms)
                </span>
              </div>

              <div className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col gap-1">
                <span className="text-xs text-muted-foreground font-medium uppercase">Backup Terakhir</span>
                <span className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-muted-foreground" /> Hari ini, 03:00 WIB
                </span>
              </div>
            </div>
            
            <div className="mt-4 flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-700 dark:text-blue-400 text-xs">
              <Info className="w-4 h-4 shrink-0" />
              <p>Sistem pencadangan (backup) berjalan otomatis setiap hari pukul 03:00 dini hari. Tidak diperlukan tindakan manual.</p>
            </div>
          </PageCard>
        </div>

      </div>
    </div>
  );
}
