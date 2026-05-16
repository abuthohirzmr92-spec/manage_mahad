// Pelanggaran module constants
// Reusable across module Pelanggaran, Master Pelanggaran, and future modules.

import type { PelanggaranSeverity, RanahInstansi, Pelanggaran } from '@/types';

// ── Severity (Tingkat Pelanggaran) ───────────────────────────────────────────
export const SEVERITY_COLORS: Record<PelanggaranSeverity, string> = {
  ringan:      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  sedang:      'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  berat:       'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  sangat_berat:'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-400 font-bold',
};

// ── Ranah Instansi ───────────────────────────────────────────────────────────
export const RANAH_COLORS: Record<RanahInstansi, string> = {
  madin:    'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  depag:    'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  madqurur: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  pesantren:'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

export const RANAH_LABEL: Record<RanahInstansi, string> = {
  madin:    'Madin',
  depag:    'Depag',
  madqurur: 'Madqurur',
  pesantren:'Pesantren',
};

// ── Pelanggaran status ───────────────────────────────────────────────────────
export const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  confirmed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  rejected:  'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

export const STATUS_LABEL: Record<string, string> = {
  pending:   'Menunggu',
  confirmed: 'Dikonfirmasi',
  rejected:  'Ditolak (Legacy)',
};

// ── Governance Review status ──────────────────────────────────────────────────
export const REVIEW_STATUS_COLORS: Record<string, string> = {
  pending_review:    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  warning:           'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  official_violation:'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export const REVIEW_STATUS_LABEL: Record<string, string> = {
  pending_review:    'Menunggu Review',
  warning:           'Peringatan',
  official_violation:'Pelanggaran Resmi',
};

export const SOURCE_TYPE_LABEL: Record<string, string> = {
  manual_report:    'Laporan Manual',
  system_detection: 'Deteksi Sistem',
};

// ── Hukuman status ───────────────────────────────────────────────────────────
export const HUKUMAN_COLORS: Record<Pelanggaran['statusHukuman'], string> = {
  belum:   'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  aktif:   'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  selesai: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};
