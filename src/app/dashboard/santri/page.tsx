'use client';

import { useState } from 'react';
import type { Santri, SantriStatus, AlumniStatus } from '@/types';
import { PageHeader, PageCard } from '@/components/shared/page-header';
import { StatsCard } from '@/components/shared/stats-card';
import { Button } from '@/components/ui/button';
import { mockSantri, mockAlumni } from '@/data/mock';
import { 
  Users, UserCheck, UserX, GraduationCap, 
  Search, SlidersHorizontal, Plus, UserPlus, 
  FileSpreadsheet, UploadCloud, X, ArrowLeft,
  Award, FileBadge, Globe, LogOut, Edit2, AlertTriangle,
  Download
} from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  aktif: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  cuti: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  skors: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const SP_COLORS: Record<string, string> = {
  'Tidak Ada': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  SP1: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  SP2: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  SP3: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function SantriPage() {
  const [mainTab, setMainTab] = useState<'aktif' | 'alumni'>('aktif');

  // --- LOCAL STATE (MOCK MUTATION) ---
  const [localSantri, setLocalSantri] = useState(mockSantri);
  const [localAlumni, setLocalAlumni] = useState(mockAlumni);

  // --- SANTRI FILTER STATE ---
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterProvinsi, setFilterProvinsi] = useState('all');
  const [filterKota, setFilterKota] = useState('all');
  const [filterAngkatan, setFilterAngkatan] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addMode, setAddMode] = useState<'selection' | 'single' | 'multi'>('selection');

  // --- EDIT STATUS STATE ---
  const [editingSantri, setEditingSantri] = useState<Santri | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editTahun, setEditTahun] = useState(new Date().getFullYear().toString());
  const [editCatatan, setEditCatatan] = useState('');
  const [editError, setEditError] = useState('');

  // --- ALUMNI FILTER STATE ---
  const [searchAlumni, setSearchAlumni] = useState('');
  const [filterTahun, setFilterTahun] = useState('all');
  const [filterStatusKeluar, setFilterStatusKeluar] = useState('all');

  const filteredSantri = localSantri.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.nis.includes(search) ||
      s.asrama.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || s.status === filterStatus;
    const matchProv = filterProvinsi === 'all' || s.asalProvinsi === filterProvinsi;
    const matchKota = filterKota === 'all' || s.asalKota === filterKota;
    const matchAngkatan = filterAngkatan === 'all' || s.angkatanMasuk.toString() === filterAngkatan;
    return matchSearch && matchStatus && matchProv && matchKota && matchAngkatan;
  });

  const filteredAlumni = localAlumni.filter((a) => {
    const matchSearch = a.name.toLowerCase().includes(searchAlumni.toLowerCase()) || a.nis.includes(searchAlumni);
    const matchTahun = filterTahun === 'all' || a.tahunAlumni.toString() === filterTahun;
    const matchStatus = filterStatusKeluar === 'all' || a.statusKeluar.toLowerCase() === filterStatusKeluar.toLowerCase();
    return matchSearch && matchTahun && matchStatus;
  });

  const aktif = localSantri.filter((s) => s.status === 'aktif').length;
  const cuti = localSantri.filter((s) => s.status === 'cuti').length;
  const skors = localSantri.filter((s) => s.status === 'skors').length;
  const alumniTotal = localAlumni.length;
  const alumniLulus = localAlumni.filter((a) => a.statusKeluar === 'Lulus').length;

  const uniqueProvinsi = Array.from(new Set(localSantri.map(s => s.asalProvinsi))).sort();
  const uniqueAngkatan = Array.from(new Set(localSantri.map(s => s.angkatanMasuk))).sort((a, b) => b - a);
  const uniqueTahunAlumni = Array.from(new Set(localAlumni.map(a => a.tahunAlumni))).sort((a, b) => b - a);

  const handleSaveStatus = () => {
    if (!editingSantri) return;
    setEditError('');
    if (editStatus === 'Keluar' && !editCatatan) {
      setEditError('Catatan wajib diisi untuk santri keluar.');
      return;
    }

    if (editStatus === 'aktif' || editStatus === 'cuti' || editStatus === 'skors') {
      setLocalSantri(localSantri.map(s => s.id === editingSantri.id ? { ...s, status: editStatus as SantriStatus } : s));
    } else if (editStatus === 'Lulus' || editStatus === 'Keluar') {
      setLocalSantri(localSantri.filter(s => s.id !== editingSantri.id));
      setLocalAlumni([{
        id: `a-${Date.now()}`,
        nis: editingSantri.nis,
        name: editingSantri.name,
        tahunAlumni: parseInt(editTahun),
        statusKeluar: editStatus as AlumniStatus,
        kelasTerakhir: editingSantri.kelas,
        asramaTerakhir: editingSantri.asrama,
        asalKota: editingSantri.asalKota,
        asalProvinsi: editingSantri.asalProvinsi,
        angkatanMasuk: editingSantri.angkatanMasuk,
        catatan: editCatatan,
        masihMemilikiAkun: editStatus === 'Lulus',
      }, ...localAlumni]);
    }
    setEditingSantri(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={mainTab === 'aktif' ? "Data Santri" : "Alumni Management"}
        description={mainTab === 'aktif' ? "Kelola data seluruh santri yang terdaftar di pesantren" : "Arsip historis dan ekosistem jaringan alumni"}
        action={
          mainTab === 'aktif' && (
            <Button 
              className="gap-2"
              onClick={() => {
                setAddMode('selection');
                setIsAddModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4" /> Tambah Santri
            </Button>
          )
        }
      />

      {/* TABS */}
      <div className="flex p-1 bg-muted/50 border border-border rounded-xl w-full sm:w-fit overflow-x-auto hide-scrollbar">
        <div className="flex min-w-max gap-1">
          <button
            onClick={() => setMainTab('aktif')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              mainTab === 'aktif'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Users className="w-4 h-4" />
            Santri Aktif
          </button>
          <button
            onClick={() => setMainTab('alumni')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              mainTab === 'alumni'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Alumni & Keluar
          </button>
        </div>
      </div>

      {mainTab === 'aktif' ? (
        <>
          {/* Stats Aktif */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard title="Total Santri" value={localSantri.length} icon={Users} />
            <StatsCard title="Santri Aktif" value={aktif} icon={UserCheck} iconClassName="bg-emerald-500/10" trend={{ value: 2, label: 'bulan ini' }} />
            <StatsCard title="Sedang Cuti" value={cuti} icon={UserX} iconClassName="bg-amber-500/10" />
            <StatsCard title="Diskor" value={skors} icon={AlertTriangle} iconClassName="bg-red-500/10 text-red-600" />
          </div>

          {/* Table Aktif */}
          <PageCard title="Daftar Santri" description={`Menampilkan ${filteredSantri.length} santri`}>
            {/* Toolbar */}
            <div className="flex flex-col gap-3 mb-5">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Cari nama, NIS, atau asrama..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1 sm:pb-0">
                  <SlidersHorizontal className="w-4 h-4 text-muted-foreground shrink-0" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 shrink-0"
                  >
                    <option value="all">Semua Status</option>
                    <option value="aktif">Aktif</option>
                    <option value="cuti">Cuti</option>
                    <option value="skors">Skors</option>
                  </select>
                  <select
                    value={filterProvinsi}
                    onChange={(e) => setFilterProvinsi(e.target.value)}
                    className="text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 shrink-0"
                  >
                    <option value="all">Semua Provinsi</option>
                    {uniqueProvinsi.map(prov => (
                      <option key={prov} value={prov}>{prov}</option>
                    ))}
                  </select>
                  <select
                    value={filterAngkatan}
                    onChange={(e) => setFilterAngkatan(e.target.value)}
                    className="text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 shrink-0"
                  >
                    <option value="all">Semua Angkatan</option>
                    {uniqueAngkatan.map(angkatan => (
                      <option key={angkatan} value={angkatan.toString()}>Angkatan {angkatan}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 text-muted-foreground">
                    <th className="text-left px-4 py-3 font-medium">Santri</th>
                    <th className="text-left px-4 py-3 font-medium">NIS</th>
                    <th className="text-left px-4 py-3 font-medium">Asrama / Kamar</th>
                    <th className="text-left px-4 py-3 font-medium">Kelas</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">SP</th>
                    <th className="text-left px-4 py-3 font-medium">Poin Pelanggaran</th>
                    <th className="text-right px-4 py-3 font-medium w-[80px]">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredSantri.map((s) => (
                    <tr key={s.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                            {s.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                          </div>
                          <div>
                            <p className="font-bold text-foreground">{s.name}</p>
                            <div className="flex flex-col mt-0.5 gap-0.5">
                              <p className="text-[10px] text-muted-foreground">
                                {s.asalKota}, {s.asalProvinsi}
                              </p>
                              <span className="w-fit font-semibold px-1.5 py-0.5 rounded bg-muted text-[9px] uppercase tracking-wider text-muted-foreground">
                                ANGKATAN {s.angkatanMasuk}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{s.nis}</td>
                      <td className="px-4 py-3">
                        <span className="font-medium">{s.asrama}</span>
                        <span className="text-muted-foreground"> · {s.kamar}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{s.kelas}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[s.status]}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${SP_COLORS[s.statusSP]}`}>
                          {s.statusSP}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted rounded-full h-1.5 w-16">
                            <div
                              className={`h-1.5 rounded-full ${s.totalPoinPelanggaran > 40 ? 'bg-red-500' : s.totalPoinPelanggaran > 20 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${Math.min((s.totalPoinPelanggaran / 60) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium">{s.totalPoinPelanggaran}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSantri(s);
                            setEditStatus(s.status);
                            setEditCatatan('');
                          }} 
                          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredSantri.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground text-sm">
                        Tidak ada data santri aktif.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </PageCard>

          {/* EDIT STATUS MODAL */}
          {editingSantri && (
            <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-card border border-border shadow-2xl rounded-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-5 border-b border-border bg-muted/30">
                  <h2 className="text-lg font-bold text-foreground">Edit Status Santri</h2>
                  <button onClick={() => setEditingSantri(null)} className="p-2 hover:bg-muted rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="bg-muted/50 p-3 rounded-lg flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {editingSantri.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{editingSantri.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{editingSantri.nis}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold">Status Baru</label>
                    <select
                      value={editStatus}
                      onChange={(e) => { setEditStatus(e.target.value); setEditError(''); }}
                      className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <optgroup label="Santri Aktif">
                        <option value="aktif">Aktif</option>
                        <option value="cuti">Cuti</option>
                        <option value="skors">Skors</option>
                      </optgroup>
                      <optgroup label="Alumni & Keluar">
                        <option value="Lulus">Lulus</option>
                        <option value="Keluar">Keluar</option>
                      </optgroup>
                    </select>
                  </div>

                  {(editStatus === 'Lulus' || editStatus === 'Keluar') && (
                    <>
                      <div className="space-y-1.5 animate-in slide-in-from-top-2">
                        <label className="text-sm font-semibold">Tahun Keluar/Lulus</label>
                        <input
                          type="number"
                          value={editTahun}
                          onChange={(e) => setEditTahun(e.target.value)}
                          className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      </div>
                      <div className="space-y-1.5 animate-in slide-in-from-top-2">
                        <label className="text-sm font-semibold">Catatan {editStatus === 'Keluar' && <span className="text-red-500">*</span>}</label>
                        <textarea
                          value={editCatatan}
                          onChange={(e) => { setEditCatatan(e.target.value); setEditError(''); }}
                          placeholder={editStatus === 'Keluar' ? "Alasan keluar (wajib diisi)..." : "Catatan kelulusan (opsional)..."}
                          className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[80px]"
                        />
                      </div>
                    </>
                  )}
                  {editError && (
                    <div className="text-xs text-red-500 font-medium bg-red-50 dark:bg-red-900/20 p-2 rounded-md border border-red-200 dark:border-red-900/50">
                      {editError}
                    </div>
                  )}
                  
                  <div className="pt-4 flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setEditingSantri(null)}>Batal</Button>
                    <Button onClick={handleSaveStatus}>Simpan Perubahan</Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ADD SANTRI MODAL */}
          {isAddModalOpen && (
            <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-card border border-border shadow-2xl rounded-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-5 border-b border-border bg-muted/30">
                  <div className="flex items-center gap-3">
                    {addMode !== 'selection' && (
                      <button onClick={() => setAddMode('selection')} className="p-1.5 hover:bg-muted rounded-md transition-colors">
                        <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                      </button>
                    )}
                    <div>
                      <h2 className="text-lg font-bold text-foreground">
                        {addMode === 'selection' && 'Pilih Metode Input Santri'}
                        {addMode === 'single' && 'Input Santri Tunggal'}
                        {addMode === 'multi' && 'Input Santri Massal (Import)'}
                      </h2>
                      <p className="text-xs text-muted-foreground mt-1">
                        {addMode === 'selection' && 'Pilih cara memasukkan data santri.'}
                        {addMode === 'single' && 'Cocok untuk santri pindahan.'}
                        {addMode === 'multi' && 'Upload file Excel untuk awal TA.'}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-muted rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6">
                  {addMode === 'selection' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button onClick={() => setAddMode('single')} className="flex flex-col items-center text-center gap-4 p-8 border-2 border-border border-dashed rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all group">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <UserPlus className="w-8 h-8" />
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground">Input Tunggal</h3>
                          <p className="text-sm text-muted-foreground mt-2">Satu per satu.</p>
                        </div>
                      </button>
                      <button onClick={() => setAddMode('multi')} className="flex flex-col items-center text-center gap-4 p-8 border-2 border-border border-dashed rounded-xl hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                          <FileSpreadsheet className="w-8 h-8" />
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground">Input Massal</h3>
                          <p className="text-sm text-muted-foreground mt-2">Upload file Excel/CSV.</p>
                        </div>
                      </button>
                    </div>
                  )}

                  {addMode === 'single' && (
                    <div className="space-y-4">
                      {/* Formulir dummy */}
                      <p className="text-sm text-muted-foreground mb-4">Form ini digunakan untuk memasukkan data tunggal.</p>
                      <div className="grid grid-cols-2 gap-4">
                        <input type="text" className="w-full px-3 py-2 border rounded-lg bg-background" placeholder="Nama Santri" />
                        <input type="text" className="w-full px-3 py-2 border rounded-lg bg-background" placeholder="NIS" />
                      </div>
                      <div className="pt-4 flex justify-end">
                        <Button onClick={() => setIsAddModalOpen(false)}>Simpan Santri</Button>
                      </div>
                    </div>
                  )}

                  {addMode === 'multi' && (
                    <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-xl">
                      <UploadCloud className="w-12 h-12 text-muted-foreground mb-4" />
                      <p className="text-sm font-medium">Tarik & Lepas file Excel</p>
                      <Button variant="secondary" className="mt-4">Pilih File</Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Alumni Dashboard */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard title="Total Riwayat Keluar" value={alumniTotal} icon={Users} />
            <StatsCard title="Lulusan Resmi" value={alumniLulus} icon={Award} iconClassName="bg-emerald-500/10 text-emerald-600" />
            <StatsCard title="Keluar / Pindah" value={alumniTotal - alumniLulus} icon={LogOut} iconClassName="bg-orange-500/10 text-orange-600" />
            
            {/* Future Ready Action Card */}
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-col justify-center cursor-pointer hover:bg-primary/10 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:scale-110 transition-transform">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Portal Alumni</p>
                  <p className="text-[10px] text-muted-foreground">Sistem Jaringan Komunitas</p>
                </div>
              </div>
            </div>
          </div>

          <PageCard title="Arsip Data Alumni" description="Riwayat data santri yang telah lulus, pindah, atau berhenti">
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Cari nama alumni atau NIS..."
                  value={searchAlumni}
                  onChange={(e) => setSearchAlumni(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={filterTahun}
                  onChange={(e) => setFilterTahun(e.target.value)}
                  className="text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="all">Semua Tahun</option>
                  {uniqueTahunAlumni.map(tahun => (
                    <option key={tahun} value={tahun.toString()}>{tahun}</option>
                  ))}
                </select>
                <select
                  value={filterStatusKeluar}
                  onChange={(e) => setFilterStatusKeluar(e.target.value)}
                  className="text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="all">Semua Status Keluar</option>
                  <option value="lulus">Lulus</option>
                  <option value="keluar">Keluar</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 text-muted-foreground">
                    <th className="text-left px-4 py-3 font-medium">Nama Alumni</th>
                    <th className="text-left px-4 py-3 font-medium">Tahun</th>
                    <th className="text-left px-4 py-3 font-medium">Status Keluar</th>
                    <th className="text-left px-4 py-3 font-medium">Pendidikan Terakhir</th>
                    <th className="text-left px-4 py-3 font-medium">Catatan</th>
                    <th className="text-left px-4 py-3 font-medium">Status Akun</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredAlumni.map((a) => (
                    <tr key={a.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                            {a.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                          </div>
                          <div>
                            <p className="font-bold text-foreground group-hover:text-primary transition-colors">{a.name}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{a.nis} • Angkatan {a.angkatanMasuk}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">{a.tahunAlumni}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${
                          a.statusKeluar === 'Lulus' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {a.statusKeluar}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs">
                          <p className="font-medium text-foreground">{a.kelasTerakhir}</p>
                          <p className="text-muted-foreground">Asrama: {a.asramaTerakhir}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate" title={a.catatan}>
                        {a.catatan || '-'}
                      </td>
                      <td className="px-4 py-3">
                        {a.masihMemilikiAkun ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            Akses Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium bg-muted text-muted-foreground border border-border">
                            Akses Dicabut
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredAlumni.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground text-sm">
                        Tidak ada histori alumni yang ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Future Ready Utilities */}
            <div className="mt-6 flex flex-wrap gap-3 pt-6 border-t border-border">
              <Button variant="outline" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                <FileBadge className="w-4 h-4" /> Cetak Raport Terakhir
              </Button>
              <Button variant="outline" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                <Download className="w-4 h-4" /> Ekspor Data Lulusan
              </Button>
            </div>
          </PageCard>
        </>
      )}
    </div>
  );
}
