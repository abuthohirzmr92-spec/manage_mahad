import type { LifecycleStatus } from '@/lib/status-engine';

// ─── Lifecycle Status Labels (Indonesian) ─────────────────────────

export const LIFECYCLE_LABELS: Record<LifecycleStatus, string> = {
  pending: 'Menunggu',
  approved: 'Disetujui',
  warning_only: 'Peringatan',
  executed: 'Dijalankan',
  rejected: 'Ditolak',
  expired: 'Kedaluwarsa',
  cancelled: 'Dibatalkan',
  ongoing: 'Berjalan',
  completed: 'Selesai',
};

export const LIFECYCLE_COLORS: Record<LifecycleStatus, string> = {
  pending: 'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400 dark:border-amber-500/30',
  approved: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30',
  warning_only: 'bg-orange-500/10 text-orange-700 border-orange-500/20 dark:text-orange-400 dark:border-orange-500/30',
  executed: 'bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-400 dark:border-blue-500/30',
  rejected: 'bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400 dark:border-red-500/30',
  expired: 'bg-zinc-500/10 text-zinc-700 border-zinc-500/20 dark:text-zinc-400 dark:border-zinc-500/30',
  cancelled: 'bg-zinc-500/10 text-zinc-700 border-zinc-500/20 dark:text-zinc-400 dark:border-zinc-500/30',
  ongoing: 'bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-400 dark:border-blue-500/30',
  completed: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30',
};

// ─── Generic Status Labels ────────────────────────────────────────

export const STATUS_LABELS: Record<string, string> = {
  // Lifecycle
  ...LIFECYCLE_LABELS,

  // Entity
  active: 'Aktif',
  inactive: 'Nonaktif',

  // Santri
  leave: 'Cuti',
  suspension: 'Skorsing',

  // Pelanggaran severity
  ringan: 'Ringan',
  sedang: 'Sedang',
  berat: 'Berat',
  sangat_berat: 'Sangat Berat',

  // Character
  baik: 'Baik',
  perlu_perhatian: 'Perlu Perhatian',
  peringatan: 'Peringatan',

  // SP
  tidak_ada: 'Tidak Ada',
  sp1: 'SP1',
  sp2: 'SP2',
  sp3: 'SP3',

  // Health
  observasi: 'Observasi',
  istirahat: 'Istirahat',
  rawat_sementara: 'Rawat Sementara',
  perlu_berobat_luar: 'Perlu Berobat Luar',
  dirujuk: 'Dirujuk',
  dalam_perjalanan: 'Dalam Perjalanan',
  kembali: 'Kembali',

  // Quest
  available: 'Tersedia',
  inprogress: 'Dalam Proses',

  // Notification types
  info: 'Info',
  success: 'Berhasil',

  // Alumni
  lulus: 'Lulus',
  keluar: 'Keluar',

  // Governance
  manual_report: 'Laporan Manual',
  system_detection: 'Deteksi Sistem',
  pending_review: 'Review Pending',
  official_violation: 'Pelanggaran Resmi',

  // Legacy (Indonesian) — for backward compat
  aktif: 'Aktif',
  nonaktif: 'Nonaktif',
  cuti: 'Cuti',
  skors: 'Skorsing',
  selesai: 'Selesai',
  dibatalkan: 'Dibatalkan',
  diajukan: 'Diajukan',
  disetujui: 'Disetujui',
  ditolak: 'Ditolak',
  berjalan: 'Berjalan',
  kedaluwarsa: 'Kedaluwarsa',
  dieksekusi: 'Dijalankan',
  belum: 'Belum',
  error: 'Error',
};

export function getStatusLabel(status: string): string {
  const key = status.toLowerCase().replace(/\s+/g, '_');
  return STATUS_LABELS[key] ?? status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Status → Variant mapping (for StatusBadge) ───────────────────

export function getStatusVariant(status: string): 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'purple' | 'fatal' {
  const lower = status.toLowerCase();
  if (['sangat_berat'].includes(lower)) return 'fatal';
  if (['active', 'selesai', 'completed', 'confirmed', 'available', 'baik', 'success', 'lulus', 'disetujui', 'approved'].includes(lower)) return 'success';
  if (['pending', 'cuti', 'inprogress', 'in_progress', 'warning', 'perlu_perhatian', 'belum', 'diajukan', 'warning_only'].includes(lower)) return 'warning';
  if (['inactive', 'berat', 'rejected', 'dibatalkan', 'expired', 'error', 'peringatan', 'ditolak', 'cancelled', 'keluar', 'skors'].includes(lower)) return 'error';
  if (['info', 'sedang', 'sp1', 'sp2', 'sp3', 'ongoing', 'executed', 'dieksekusi', 'berjalan'].includes(lower)) return 'info';
  if (['ringan'].includes(lower)) return 'purple';
  return 'neutral';
}
