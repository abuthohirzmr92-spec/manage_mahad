// ─── Global Lifecycle Status Standard ─────────────────────────────
// Every governance/approval flow in the ecosystem MUST use these statuses.
// Domain-specific statuses (entity state, health, etc.) are separate.

export const LIFECYCLE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  WARNING_ONLY: 'warning_only',
  EXECUTED: 'executed',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
} as const;

export type LifecycleStatus = (typeof LIFECYCLE_STATUS)[keyof typeof LIFECYCLE_STATUS];

export const ENTITY_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

export type EntityStatus = (typeof ENTITY_STATUS)[keyof typeof ENTITY_STATUS];

export const SANTRI_STATUS = {
  AKTIF: 'active',
  CUTI: 'leave',
  SKORS: 'suspension',
} as const;

// ─── Valid Transitions ────────────────────────────────────────────

export const LIFECYCLE_TRANSITIONS: Record<LifecycleStatus, LifecycleStatus[]> = {
  pending: ['approved', 'rejected', 'cancelled'],
  approved: ['executed', 'cancelled'],
  warning_only: ['executed', 'expired'],
  executed: ['completed', 'cancelled'],
  rejected: ['pending'],
  expired: [],
  cancelled: ['pending'],
  ongoing: ['completed', 'cancelled'],
  completed: [],
};

export function canTransition(from: LifecycleStatus, to: LifecycleStatus): boolean {
  return LIFECYCLE_TRANSITIONS[from]?.includes(to) ?? false;
}

export function isValidLifecycleStatus(status: string): status is LifecycleStatus {
  return Object.values(LIFECYCLE_STATUS).includes(status as LifecycleStatus);
}

export function getNextStatuses(current: LifecycleStatus): LifecycleStatus[] {
  return LIFECYCLE_TRANSITIONS[current] ?? [];
}

// ─── Normalizers ──────────────────────────────────────────────────

// MIGRATION MAP (future: when Firestore data is migrated)
// 'aktif' → 'active'
// 'nonaktif' → 'inactive'
// 'cuti' → 'leave'
// 'skors' → 'suspension'
// 'selesai' → 'completed'
// 'dibatalkan' → 'cancelled'
// 'diajukan' → 'pending'
// 'disetujui' → 'approved'
// 'ditolak' → 'rejected'
// 'berjalan' → 'ongoing'
// 'kedaluwarsa' → 'expired'
// 'peringatan' → 'warning_only'
// 'dieksekusi' → 'executed'
// 'available' → 'available' (quest-specific, not lifecycle)
// 'inProgress' → 'ongoing'
// 'confirmed' → 'approved' (pelanggaran confirmed = approved in lifecycle)
// 'belum' → 'pending'
// 'Lulus' → 'graduated' (alumni-specific)
// 'Keluar' → 'withdrawn' (alumni-specific)

const NORMALIZE_MAP: Record<string, string> = {
  aktif: ENTITY_STATUS.ACTIVE,
  active: ENTITY_STATUS.ACTIVE,
  nonaktif: ENTITY_STATUS.INACTIVE,
  inactive: ENTITY_STATUS.INACTIVE,
  cuti: SANTRI_STATUS.CUTI,
  skors: SANTRI_STATUS.SKORS,
  selesai: LIFECYCLE_STATUS.COMPLETED,
  completed: LIFECYCLE_STATUS.COMPLETED,
  dibatalkan: LIFECYCLE_STATUS.CANCELLED,
  cancelled: LIFECYCLE_STATUS.CANCELLED,
  diajukan: LIFECYCLE_STATUS.PENDING,
  disetujui: LIFECYCLE_STATUS.APPROVED,
  approved: LIFECYCLE_STATUS.APPROVED,
  ditolak: LIFECYCLE_STATUS.REJECTED,
  rejected: LIFECYCLE_STATUS.REJECTED,
  expired: LIFECYCLE_STATUS.EXPIRED,
  ongoing: LIFECYCLE_STATUS.ONGOING,
  inprogress: LIFECYCLE_STATUS.ONGOING,
  in_progress: LIFECYCLE_STATUS.ONGOING,
  pending: LIFECYCLE_STATUS.PENDING,
  warning_only: LIFECYCLE_STATUS.WARNING_ONLY,
  executed: LIFECYCLE_STATUS.EXECUTED,
  confirmed: LIFECYCLE_STATUS.APPROVED,
  belum: LIFECYCLE_STATUS.PENDING,
  available: 'available',
  baik: 'baik',
  'perlu perhatian': 'perlu_perhatian',
  peringatan: 'peringatan',
  'tidak ada': 'tidak_ada',
  sp1: 'sp1',
  sp2: 'sp2',
  sp3: 'sp3',
  ringan: 'ringan',
  sedang: 'sedang',
  berat: 'berat',
  sangat_berat: 'sangat_berat',
  observasi: 'observasi',
  istirahat: 'istirahat',
  rawat_sementara: 'rawat_sementara',
  perlu_berobat_luar: 'perlu_berobat_luar',
  dirujuk: 'dirujuk',
  dalam_perjalanan: 'dalam_perjalanan',
  kembali: 'kembali',
  lulus: 'lulus',
  keluar: 'keluar',
  success: 'success',
  error: 'error',
  info: 'info',
  warning: 'warning',
};

export function normalizeStatus(raw: string | undefined | null): string {
  if (!raw) return 'unknown';
  const key = raw.toLowerCase().replace(/\s+/g, '_');
  return NORMALIZE_MAP[key] ?? key;
}
