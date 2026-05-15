'use client';

import { useState, useMemo } from 'react';
import type { Santri, SantriStatus, AlumniStatus, Alumni } from '@/types';
import { PageHeader, PageCard } from '@/components/shared/page-header';
import { LoadingState } from '@/components/shared/loading-state';
import { ErrorState } from '@/components/shared/error-state';
import { StatsCard } from '@/components/shared/stats-card';
import { Button } from '@/components/ui/button';
import { useCollection } from '@/hooks';
import { santriService } from '@/lib/firebase/services';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { AddSantriModal } from '@/components/santri/AddSantriModal';
import { EditStatusModal } from '@/components/santri/EditStatusModal';
import { SantriTable } from '@/components/santri/SantriTable';
import { AlumniTable } from '@/components/santri/AlumniTable';
import {
  Users, UserCheck, UserX, GraduationCap,
  Plus, AlertTriangle,
} from 'lucide-react';

export default function SantriPage() {
  const [mainTab, setMainTab] = useState<'aktif' | 'alumni'>('aktif');

  // --- FIREBASE DATA ---
  const { data: santriData, loading: santriLoading, error: santriError } = useCollection<Santri>('santri', [], { realtime: true });
  const { data: alumniData, loading: alumniLoading, error: alumniError } = useCollection<Alumni>('alumni', [], { realtime: true });

  const localSantri = santriData;
  const localAlumni = alumniData;
  const loading = santriLoading || alumniLoading;
  const error = santriError || alumniError;

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

  const filteredSantri = useMemo(() => localSantri.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.nis.includes(search) ||
      s.asrama.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || s.status === filterStatus;
    const matchProv = filterProvinsi === 'all' || s.asalProvinsi === filterProvinsi;
    const matchKota = filterKota === 'all' || s.asalKota === filterKota;
    const matchAngkatan = filterAngkatan === 'all' || s.angkatanMasuk.toString() === filterAngkatan;
    return matchSearch && matchStatus && matchProv && matchKota && matchAngkatan;
  }), [localSantri, search, filterStatus, filterProvinsi, filterKota, filterAngkatan]);

  const filteredAlumni = useMemo(() => localAlumni.filter((a) => {
    const matchSearch = a.name.toLowerCase().includes(searchAlumni.toLowerCase()) || a.nis.includes(searchAlumni);
    const matchTahun = filterTahun === 'all' || a.tahunAlumni.toString() === filterTahun;
    const matchStatus = filterStatusKeluar === 'all' || a.statusKeluar.toLowerCase() === filterStatusKeluar.toLowerCase();
    return matchSearch && matchTahun && matchStatus;
  }), [localAlumni, searchAlumni, filterTahun, filterStatusKeluar]);

  const aktif = localSantri.filter((s) => s.status === 'aktif').length;
  const cuti = localSantri.filter((s) => s.status === 'cuti').length;
  const skors = localSantri.filter((s) => s.status === 'skors').length;
  const alumniTotal = localAlumni.length;
  const alumniLulus = localAlumni.filter((a) => a.statusKeluar === 'Lulus').length;

  const uniqueProvinsi = useMemo(() => Array.from(new Set(localSantri.map(s => s.asalProvinsi))).sort(), [localSantri]);
  const uniqueAngkatan = useMemo(() => Array.from(new Set(localSantri.map(s => s.angkatanMasuk))).sort((a, b) => b - a), [localSantri]);
  const uniqueTahunAlumni = useMemo(() => Array.from(new Set(localAlumni.map(a => a.tahunAlumni))).sort((a, b) => b - a), [localAlumni]);

  const handleSaveStatus = async () => {
    if (!editingSantri) return;
    setEditError('');
    if (editStatus === 'Keluar' && !editCatatan) {
      setEditError('Catatan wajib diisi untuk santri keluar.');
      return;
    }

    if (editStatus === 'aktif' || editStatus === 'cuti' || editStatus === 'skors') {
      await santriService.update(editingSantri.id, { status: editStatus as SantriStatus });
    } else if (editStatus === 'Lulus' || editStatus === 'Keluar') {
      // Create alumni record
      const now = Timestamp.now();
      await addDoc(collection(db, 'alumni'), {
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
        createdAt: now,
        updatedAt: now,
      });
      // Remove from santri collection
      await santriService.delete(editingSantri.id);
    }
    setEditingSantri(null);
  };

  if (loading) return <LoadingState type="table" count={6} />;
  if (error) return <ErrorState message="Gagal memuat data santri." onRetry={() => window.location.reload()} />;

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
          {filteredSantri.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border border-border rounded-xl">
              <div className="flex flex-col items-center gap-2">
                <Users className="w-8 h-8 opacity-20" />
                <p className="text-sm">Tidak ada data santri yang sesuai.</p>
              </div>
            </div>
          ) : (
            <SantriTable
              rows={filteredSantri}
              search={search}
              filterStatus={filterStatus}
              filterProvinsi={filterProvinsi}
              filterAngkatan={filterAngkatan}
              uniqueProvinsi={uniqueProvinsi}
              uniqueAngkatan={uniqueAngkatan}
              onSearchChange={setSearch}
              onFilterStatusChange={setFilterStatus}
              onFilterProvinsiChange={setFilterProvinsi}
              onFilterAngkatanChange={setFilterAngkatan}
              onEdit={(s) => {
                setEditingSantri(s);
                setEditStatus(s.status);
                setEditCatatan('');
              }}
            />
          )}

          {/* EDIT STATUS MODAL */}
          <EditStatusModal
            santri={editingSantri}
            editStatus={editStatus}
            editTahun={editTahun}
            editCatatan={editCatatan}
            editError={editError}
            onClose={() => setEditingSantri(null)}
            onStatusChange={(val) => { setEditStatus(val); setEditError(''); }}
            onTahunChange={setEditTahun}
            onCatatanChange={(val) => { setEditCatatan(val); setEditError(''); }}
            onSave={handleSaveStatus}
          />

          {/* ADD SANTRI MODAL */}
          <AddSantriModal
            isOpen={isAddModalOpen}
            addMode={addMode}
            onClose={() => setIsAddModalOpen(false)}
            onSetAddMode={setAddMode}
            onSaveSingle={() => setIsAddModalOpen(false)}
          />
        </>
      ) : (
        <>
          {/* Alumni Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard title="Total Riwayat Keluar" value={alumniTotal} icon={Users} />
            <StatsCard title="Lulusan Resmi" value={alumniLulus} icon={Users} iconClassName="bg-emerald-500/10 text-emerald-600" />
            <StatsCard title="Keluar / Pindah" value={alumniTotal - alumniLulus} icon={Users} iconClassName="bg-orange-500/10 text-orange-600" />

            {/* Future Ready Action Card */}
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-col justify-center cursor-pointer hover:bg-primary/10 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Portal Alumni</p>
                  <p className="text-[10px] text-muted-foreground">Sistem Jaringan Komunitas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Alumni Table */}
          {filteredAlumni.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border border-border rounded-xl">
              <div className="flex flex-col items-center gap-2">
                <GraduationCap className="w-8 h-8 opacity-20" />
                <p className="text-sm">Belum ada data alumni.</p>
              </div>
            </div>
          ) : (
            <AlumniTable
              rows={filteredAlumni}
              search={searchAlumni}
              filterTahun={filterTahun}
              filterStatusKeluar={filterStatusKeluar}
              uniqueTahunAlumni={uniqueTahunAlumni}
              onSearchChange={setSearchAlumni}
              onFilterTahunChange={setFilterTahun}
              onFilterStatusKeluarChange={setFilterStatusKeluar}
            />
          )}
        </>
      )}
    </div>
  );
}
