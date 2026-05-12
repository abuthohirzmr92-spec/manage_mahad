'use client';

import { useState } from 'react';
import { PageHeader, PageCard } from '@/components/shared/page-header';
import { StatsCard } from '@/components/shared/stats-card';
import { StatusBadge } from '@/components/shared/status-badge';
import { 
  UploadCloud, FileSpreadsheet, Download, CheckCircle2, 
  XCircle, Clock, Database, Users, GraduationCap, 
  Building2, ShieldAlert, FileText, MousePointerSquareDashed,
  AlertTriangle, History, FileCheck, Info
} from 'lucide-react';

const importTypes = [
  { id: 'santri', label: 'Santri', icon: GraduationCap },
  { id: 'guru', label: 'Guru', icon: Users },
  { id: 'wali', label: 'Wali Santri', icon: Users },
  { id: 'pelanggaran', label: 'Pelanggaran', icon: ShieldAlert },
  { id: 'asrama', label: 'Asrama', icon: Building2 },
  { id: 'staff', label: 'Staff', icon: FileText },
];

const mockPreviewData = [
  { id: 1, nama: 'Ahmad Syafiq', nis: '2024001', role: '10A', status: 'valid' },
  { id: 2, nama: 'Budi Santoso', nis: '2024002', role: '10A', status: 'duplicate' },
  { id: 3, nama: 'Citra Kirana', nis: '-', role: '10B', status: 'missing' },
  { id: 4, nama: 'Deni Ramadhan', nis: '2024004', role: 'Unregistered', status: 'warning' },
  { id: 5, nama: 'Eko Prasetyo', nis: '2024005', role: '11A', status: 'valid' },
];

const mockImportHistory = [
  { id: '1', fileName: 'Santri_Batch_2.csv', date: '2025-05-10', importedBy: 'Admin Utama', totalData: 120, status: 'success' },
  { id: '2', fileName: 'Data_Guru_Q1.xlsx', date: '2025-05-09', importedBy: 'Ustadz Hasan', totalData: 45, status: 'success' },
  { id: '3', fileName: 'Pelanggaran_Update.csv', date: '2025-05-08', importedBy: 'Admin Utama', totalData: 12, status: 'error', reason: 'Format kolom tidak sesuai standard' },
];

export default function ImportPage() {
  const [selectedType, setSelectedType] = useState('santri');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // Mock UI state

  return (
    <div className="space-y-6">
      {/* 1. Header Halaman */}
      <PageHeader 
        title="Import Data CSV" 
        description="Fasilitas migrasi dan import data masal terpusat (Enterprise Data Loader)"
        action={
          <div className="flex items-center gap-3 bg-card border border-border px-4 py-2 rounded-lg shadow-sm">
            <span className="text-sm text-muted-foreground font-medium">Status Layanan:</span>
            <StatusBadge status="aktif" variant="success" />
          </div>
        }
      />

      {/* 2. Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Total Import" 
          value="1,245" 
          icon={Database} 
          iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400" 
          description="Baris diproses bulan ini" 
        />
        <StatsCard 
          title="Berhasil" 
          value="1,230" 
          icon={CheckCircle2} 
          iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
          description="Lolos validasi sistem" 
        />
        <StatsCard 
          title="Gagal" 
          value="15" 
          icon={XCircle} 
          iconClassName="bg-red-500/10 text-red-600 dark:text-red-400" 
          description="Ditolak / Error baris" 
        />
        <StatsCard 
          title="Last Import" 
          value="Hari Ini" 
          icon={Clock} 
          iconClassName="bg-purple-500/10 text-purple-600 dark:text-purple-400" 
          description="Santri_Batch_2.csv" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri Utama */}
        <div className="lg:col-span-2 space-y-6">
          <PageCard title="Konfigurasi Import" description="Langkah 1: Pilih jenis data yang ingin Anda masukkan ke dalam sistem">
            
            {/* 4. Import Type Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {importTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                      isSelected 
                        ? 'border-primary bg-primary/5 shadow-sm scale-[1.02]' 
                        : 'border-border bg-background hover:border-primary/40 hover:bg-muted/30'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={`text-sm font-bold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                      {type.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </PageCard>

          <PageCard title="Upload Area" description={`Langkah 2: Unggah file data ${importTypes.find(t => t.id === selectedType)?.label}`}>
            {/* Download Template Action */}
            <div className="flex justify-end mb-4">
              <button className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors font-semibold bg-primary/10 px-3 py-1.5 rounded-md hover:bg-primary/20">
                <Download className="w-4 h-4" />
                Download Template {importTypes.find(t => t.id === selectedType)?.label} (.csv)
              </button>
            </div>
            
            {/* 3. Upload Zone (Drag & Drop) */}
            <div 
              className={`relative flex flex-col items-center justify-center w-full min-h-[280px] border-2 border-dashed rounded-xl transition-all duration-300 ${
                isDragging 
                  ? 'border-primary bg-primary/5 scale-[0.99]' 
                  : 'border-border bg-muted/10 hover:bg-muted/30 hover:border-primary/50'
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
            >
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <div className="p-5 bg-background rounded-full shadow-sm mb-5 border border-border ring-4 ring-muted/50">
                  <FileSpreadsheet className={`w-10 h-10 ${isDragging ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
                </div>
                
                <h3 className="text-base font-bold text-foreground mb-1">
                  Drag & drop file Anda di sini
                </h3>
                <p className="mb-6 text-sm text-muted-foreground">
                  Atau klik <span className="font-bold text-primary cursor-pointer hover:underline">Pilih File</span> dari komputer Anda
                </p>
                
                <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-muted-foreground bg-background px-3 py-1.5 rounded-md border border-border shadow-sm">
                  <span>Mendukung: .CSV, .XLSX</span>
                  <span className="w-1 h-1 rounded-full bg-border"></span>
                  <span>Maksimal: 5MB</span>
                </div>
                
                {/* 3. Progress Placeholder (Mock) */}
                {isUploading && (
                  <div className="w-full max-w-sm space-y-2 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-primary flex items-center gap-1.5">
                        <MousePointerSquareDashed className="w-3.5 h-3.5 animate-spin" /> 
                        Membaca data CSV...
                      </span>
                      <span className="text-foreground">45%</span>
                    </div>
                    <div className="w-full bg-border rounded-full h-2 overflow-hidden shadow-inner">
                      <div className="bg-primary h-2 rounded-full relative overflow-hidden" style={{ width: '45%' }}>
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 5. Tombol Action Upload */}
            <div className="flex justify-end mt-6 gap-3 pt-6 border-t border-border">
              <button 
                className="px-5 py-2.5 rounded-lg border border-border bg-background text-sm font-bold text-foreground hover:bg-muted transition-colors active:scale-95 shadow-sm"
                onClick={() => setIsUploading(false)}
              >
                Reset
              </button>
              <button 
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg active:scale-95"
                onClick={() => setIsUploading(true)}
              >
                <UploadCloud className="w-4 h-4" />
                Upload File
              </button>
            </div>
          </PageCard>
        </div>

        {/* Kolom Kanan: Bantuan & Instruksi */}
        <div className="lg:col-span-1 space-y-6">
          <PageCard title="Panduan Integrasi" description="Ikuti langkah berikut agar sukses">
            <div className="space-y-4">
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                  <Download className="w-16 h-16" />
                </div>
                <h4 className="text-sm font-bold text-primary mb-1 relative z-10">1. Gunakan Template</h4>
                <p className="text-xs text-muted-foreground leading-relaxed relative z-10">
                  Selalu gunakan tombol <strong>Download Template</strong> untuk memastikan nama kolom sesuai dengan skema database terbaru.
                </p>
              </div>
              
              <div className="p-4 bg-muted/40 rounded-xl border border-border/60">
                <h4 className="text-sm font-bold text-foreground mb-1">2. Perhatikan Tipe Data</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Kolom bertanda wajib <span className="text-red-500 font-bold">(*)</span> tidak boleh kosong. Format tanggal yang diterima adalah <code className="bg-muted px-1 py-0.5 rounded text-primary">YYYY-MM-DD</code>.
                </p>
              </div>
              
              <div className="p-4 bg-muted/40 rounded-xl border border-border/60">
                <h4 className="text-sm font-bold text-foreground mb-1">3. Validasi Keamanan</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Sistem akan secara otomatis memblokir file yang dicurigai mengandung skrip berbahaya atau injeksi data (SQLi/XSS).
                </p>
              </div>
            </div>
          </PageCard>
        </div>
      </div>

      {/* --- PREVIEW & VALIDATION SECTION --- */}
      <div className="space-y-6 pt-6 border-t border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Hasil Validasi & Preview</h2>
            <p className="text-sm text-muted-foreground">Tinjau data Anda sebelum di-import secara permanen</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          
          {/* 3. Validation Summary Panel & 4. Import Result Card */}
          <div className="xl:col-span-1 space-y-6">
            <PageCard title="Ringkasan Validasi" description="Status baris data pada file">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                  <span className="text-sm text-muted-foreground">Total Rows</span>
                  <span className="font-bold text-foreground">5 Baris</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">Valid Rows</span>
                  </div>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">2</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-amber-500/5 rounded-lg border border-amber-500/20">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span className="text-sm text-amber-700 dark:text-amber-400 font-medium">Warning Data</span>
                  </div>
                  <span className="font-bold text-amber-700 dark:text-amber-400">1</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-500/5 rounded-lg border border-purple-500/20">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-purple-700 dark:text-purple-400 font-medium">Duplicate Rows</span>
                  </div>
                  <span className="font-bold text-purple-700 dark:text-purple-400">1</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-500/5 rounded-lg border border-red-500/20">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-700 dark:text-red-400 font-medium">Missing Data</span>
                  </div>
                  <span className="font-bold text-red-700 dark:text-red-400">1</span>
                </div>
              </div>

              <div className="mt-5 pt-5 border-t border-border">
                <button className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-bold shadow-sm hover:bg-primary/90 transition-colors active:scale-95 disabled:opacity-50" disabled>
                  Lanjutkan Import
                </button>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Tombol aktif jika tidak ada Missing/Duplicate data.
                </p>
              </div>
            </PageCard>

            {/* Simulasi Import Result Card (Error) */}
            <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5 space-y-2">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <XCircle className="w-5 h-5" />
                <h4 className="font-bold text-sm">Gagal Import (Simulasi)</h4>
              </div>
              <p className="text-xs text-red-600/80 dark:text-red-400/80">
                Terdapat 1 baris dengan data missing (NIS/NIP kosong). Silakan perbaiki file CSV Anda.
              </p>
            </div>
            
            {/* Simulasi Import Result Card (Success) */}
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-2">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <h4 className="font-bold text-sm">Berhasil Import (Simulasi)</h4>
              </div>
              <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80">
                120 baris data Santri_Batch_2.csv telah masuk ke sistem.
              </p>
            </div>
          </div>

          {/* 1. Preview Table Import & 2. Validation Status */}
          <div className="xl:col-span-3 space-y-6">
            <PageCard title="Tabel Preview Data" description="Menampilkan 5 baris pertama dari file CSV">
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 text-muted-foreground">
                      <th className="text-left px-4 py-3 font-medium">Baris</th>
                      <th className="text-left px-4 py-3 font-medium">Nama</th>
                      <th className="text-left px-4 py-3 font-medium">NIS / NIP</th>
                      <th className="text-left px-4 py-3 font-medium">Role / Kelas</th>
                      <th className="text-left px-4 py-3 font-medium">Status Validasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {mockPreviewData.map((row, idx) => (
                      <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{idx + 1}</td>
                        <td className="px-4 py-3 font-medium text-foreground">{row.nama}</td>
                        <td className="px-4 py-3">
                          <span className={row.nis === '-' ? 'text-red-500 font-bold' : ''}>{row.nis}</span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{row.role}</td>
                        <td className="px-4 py-3">
                          <StatusBadge 
                            status={row.status} 
                            variant={row.status === 'valid' ? 'success' : row.status === 'duplicate' ? 'purple' : row.status === 'missing' ? 'error' : 'warning'} 
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </PageCard>

            {/* 5. Import History */}
            <PageCard title="Histori Import" description="Riwayat pemrosesan data masal">
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 text-muted-foreground">
                      <th className="text-left px-4 py-3 font-medium">Nama File</th>
                      <th className="text-left px-4 py-3 font-medium">Tanggal</th>
                      <th className="text-left px-4 py-3 font-medium">Imported By</th>
                      <th className="text-center px-4 py-3 font-medium">Jumlah Data</th>
                      <th className="text-left px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {mockImportHistory.map((h) => (
                      <tr key={h.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <FileSpreadsheet className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium text-foreground">{h.fileName}</span>
                          </div>
                          {h.reason && <p className="text-[10px] text-red-500 mt-1 font-medium">{h.reason}</p>}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{h.date}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{h.importedBy}</td>
                        <td className="px-4 py-3 text-center font-mono text-xs">{h.totalData} baris</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={h.status} variant={h.status === 'success' ? 'success' : 'error'} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </PageCard>
          </div>
        </div>
      </div>
    </div>
  );
}
