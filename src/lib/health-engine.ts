// ========================================
// HEALTH ENGINE — Core Health Governance Logic
// Mandor-defined. Shared by all Health agents.
// ========================================

import type {
  HealthVisit,
  HealthVisitStatus,
  HealthSeverity,
  HealthPermissionStatus,
  HealthTimelineEntry,
} from '@/types/health';

// ── Constants ──────────────────────────────────────────────────

export const HEALTH_SEVERITY_LABELS: Record<HealthSeverity, string> = {
  ringan: 'Ringan',
  sedang: 'Sedang',
  darurat: 'Darurat',
};

export const HEALTH_STATUS_LABELS: Record<HealthVisitStatus, string> = {
  observasi: 'Observasi',
  istirahat: 'Istirahat',
  rawat_sementara: 'Rawat Sementara',
  perlu_berobat_luar: 'Perlu Berobat Luar',
  selesai: 'Selesai',
  dirujuk: 'Dirujuk',
};

export const PERMISSION_STATUS_LABELS: Record<HealthPermissionStatus, string> = {
  diajukan: 'Diajukan',
  disetujui: 'Disetujui',
  ditolak: 'Ditolak',
  dalam_perjalanan: 'Dalam Perjalanan',
  kembali: 'Kembali',
  selesai: 'Selesai',
};

// ── Severity Rules ──────────────────────────────────────────────

/**
 * Determine if severity requires supervisor for health permission.
 * "darurat" always requires supervisor.
 * "sedang" requires supervisor.
 * "ringan" may or may not — returned as optional.
 */
export function requiresSupervisor(severity: HealthSeverity): boolean {
  return severity === 'darurat' || severity === 'sedang';
}

/**
 * Determine if severity requires parent notification.
 * "darurat" always requires. "sedang" requires.
 */
export function requiresParentNotification(severity: HealthSeverity): boolean {
  return severity === 'darurat' || severity === 'sedang';
}

/**
 * Determine if permission should escalate to emergency handling.
 */
export function isEmergency(severity: HealthSeverity): boolean {
  return severity === 'darurat';
}

// ── Status Lifecycle ───────────────────────────────────────────

/** Valid next statuses from a given current status. */
export function validNextStatuses(
  current: HealthVisitStatus,
): HealthVisitStatus[] {
  switch (current) {
    case 'observasi':
      return ['istirahat', 'rawat_sementara', 'perlu_berobat_luar', 'selesai'];
    case 'istirahat':
      return ['observasi', 'selesai', 'perlu_berobat_luar'];
    case 'rawat_sementara':
      return ['observasi', 'selesai', 'perlu_berobat_luar', 'dirujuk'];
    case 'perlu_berobat_luar':
      return ['selesai', 'dirujuk'];
    case 'selesai':
      return [];
    case 'dirujuk':
      return ['selesai'];
    default:
      return [];
  }
}

/** Check if a status transition is valid. */
export function isValidStatusTransition(
  current: HealthVisitStatus,
  next: HealthVisitStatus,
): boolean {
  return validNextStatuses(current).includes(next);
}

// ── Duration Calculation ───────────────────────────────────────

export function calculateDuration(masukAt: string, selesaiAt?: string): number {
  if (!selesaiAt) return 0;
  const start = new Date(masukAt).getTime();
  const end = new Date(selesaiAt).getTime();
  return Math.round((end - start) / 60000); // minutes
}

// ── Timeline Builder ────────────────────────────────────────────

export function buildTimeline(visit: HealthVisit): HealthTimelineEntry[] {
  const timeline: HealthTimelineEntry[] = [];

  // Entry
  timeline.push({
    time: visit.masukAt,
    label: 'Masuk UKS',
    type: 'masuk',
    detail: visit.keluhan,
  });

  // Observation
  if (visit.status !== 'selesai' && visit.tindakan) {
    timeline.push({
      time: visit.masukAt,
      label: 'Tindakan',
      type: 'tindakan',
      detail: visit.tindakan,
    });
  }

  // If in observation
  if (visit.status === 'observasi') {
    timeline.push({
      time: visit.masukAt,
      label: 'Mulai Observasi',
      type: 'observasi',
      detail: `Status: ${HEALTH_STATUS_LABELS[visit.status]}`,
    });
  }

  // If needs referral
  if (visit.status === 'perlu_berobat_luar' || visit.status === 'dirujuk') {
    timeline.push({
      time: visit.masukAt,
      label: 'Rujukan',
      type: 'rujukan',
      detail: visit.catatan ?? 'Perlu penanganan luar',
    });
  }

  // If permission exists
  if (visit.permissionId) {
    timeline.push({
      time: visit.updatedAt,
      label: 'Izin Berobat Dibuat',
      type: 'izin',
      detail: `ID: ${visit.permissionId}`,
    });
  }

  // If completed
  if (visit.status === 'selesai' && visit.selesaiAt) {
    timeline.push({
      time: visit.selesaiAt,
      label: 'Selesai',
      type: 'selesai',
      detail: `Durasi: ${visit.durasiMenit ?? calculateDuration(visit.masukAt, visit.selesaiAt)} menit`,
    });
  }

  return timeline;
}

// ── Health Visit Summary ────────────────────────────────────────

export interface HealthSummary {
  totalKunjungan: number;
  observasiBerjalan: number;
  daruratBulanIni: number;
  izinBerobatAktif: number;
}

export function computeHealthSummary(
  visits: HealthVisit[],
  activePermissions: number,
): HealthSummary {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  return {
    totalKunjungan: visits.length,
    observasiBerjalan: visits.filter(
      v => v.status === 'observasi' || v.status === 'rawat_sementara',
    ).length,
    daruratBulanIni: visits.filter(
      v => v.severity === 'darurat' && v.masukAt >= startOfMonth,
    ).length,
    izinBerobatAktif: activePermissions,
  };
}
