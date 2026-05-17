// ========================================
// Core Types for Ma'had Management System
// ========================================

export type UserRole = 'admin' | 'musyrif' | 'wali' | 'santri' | 'staff' | 'kepala_kesiswaan' | 'guru' | 'wali_kelas' | 'alumni';

export type SantriStatus = 'aktif' | 'cuti' | 'skors';
export type AlumniStatus = 'Lulus' | 'Keluar';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  childSantriId?: string; // For wali role - links to their child
}

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  roles: UserRole[];
  /** Centralized permission key from @/config/permissions — preferred over roles array for new pages */
  requiredPermission?: string;
  badge?: string;
  children?: NavItem[];
  disabled?: boolean;
}

export interface NavGroup {
  title: string;
  icon: string;
  items: NavItem[];
}

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  label: string;
}

export interface Santri {
  id: string;
  nis: string;
  name: string;
  /** @deprecated prefer asramaId — kept for display compatibility */
  asrama: string;
  /** @deprecated prefer kamarId — kept for display compatibility */
  kamar: string;
  /** Relational ID referencing Asrama.id */
  asramaId?: string;
  /** Relational ID referencing Kamar.id */
  kamarId?: string;
  kelas: string;
  status: SantriStatus;
  gender: 'L' | 'P';
  photoUrl?: string;
  waliId: string;
  waliName: string;
  waliPhone: string;
  joinDate: string;
  asalKota: string;
  asalProvinsi: string;
  angkatanMasuk: number;
  totalPoinPelanggaran: number;
  totalPrestasi: number;
  statusKarakter: 'Baik' | 'Perlu Perhatian' | 'Peringatan';
  statusSP: 'Tidak Ada' | 'SP1' | 'SP2' | 'SP3';
}

export interface Asrama {
  id: string;
  name: string;
  musyrif: string;
  capacity: number;
  filled: number;
  gender: 'L' | 'P';
  status: 'aktif' | 'nonaktif';
}

export interface Kamar {
  id: string;
  asramaId: string;
  name: string;
  capacity: number;
}

export interface Alumni {
  id: string;
  nis: string;
  name: string;
  tahunAlumni: number;
  statusKeluar: AlumniStatus;
  kelasTerakhir: string;
  asramaTerakhir: string;
  asalKota: string;
  asalProvinsi: string;
  angkatanMasuk: number;
  userId?: string;
  catatan?: string;
  masihMemilikiAkun: boolean;
}

export type RanahInstansi = 'madin' | 'depag' | 'madqurur' | 'pesantren';
export type PelanggaranSeverity = 'ringan' | 'sedang' | 'berat' | 'sangat_berat';

export const ALL_SEVERITIES: PelanggaranSeverity[] = ['ringan', 'sedang', 'berat', 'sangat_berat'];

export interface SeverityLimits {
  ringan: number;
  sedang: number;
  berat: number;
  sangat_berat: number;
}

export const DEFAULT_SEVERITY_LIMITS: SeverityLimits = {
  ringan: 3,
  sedang: 2,
  berat: 1,
  sangat_berat: 0,
};

export interface GlobalTolerancePolicy {
  id: 'global';
  type: 'global';
  isActive: boolean;
  limits: SeverityLimits;
}

export interface JenjangToleranceOverride {
  id: string;
  type: 'jenjang';
  jenjang: string;
  isActive: boolean;
  limits: SeverityLimits;
}

export type TolerancePolicy = GlobalTolerancePolicy | JenjangToleranceOverride;

export interface TeacherAssignment {
  id: string;
  mapelId: string;
  kelasId: string;
  kelasName: string;
  guruName: string;
  status: 'active' | 'inactive';
}

export interface MasterHukuman {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  severityScope: PelanggaranSeverity[];
  minimumTingkat: number;
  description?: string;
}

export interface MasterPelanggaran {
  id: string;
  code: string;
  /** Instansi pembuat aturan: Madin, Depag, Madqurur, Pesantren */
  ranahInstansi: RanahInstansi;
  /** Ruang lingkup pelanggaran, free-text: Kelas, Asrama, Ibadah, dst. */
  kategori: string;
  name: string;
  /** Tingkat keseriusan pelanggaran */
  severity: PelanggaranSeverity;
  points: number;
  description?: string;
}

export interface Pelanggaran {
  id: string;
  santriId: string;
  santriName: string;
  pelanggaranId: string;
  pelanggaranName: string;
  severity: PelanggaranSeverity;
  points: number;
  date: string;
  reportedBy: string;
  reportedByUserId?: string;
  reportedByRole?: UserRole;
  status: 'confirmed';
  statusHukuman: 'belum' | 'aktif' | 'selesai';
  punishmentId?: string;
  punishmentName?: string;
  notes?: string;
  /** FK to GovernanceCase that spawned this violation */
  governanceCaseId?: string;
}

// ── Unified Governance Review ──────────────────────────────────────────────

export type GovernanceSourceType = 'manual_report' | 'system_detection';

export type GovernanceReviewStatus = 'pending_review' | 'warning' | 'official_violation';

export interface GovernanceCase {
  id: string;

  /** Who/what submitted this case */
  sourceType: GovernanceSourceType;
  submittedBy: string;
  submittedByRole?: UserRole;

  /** The santri involved */
  santriId: string;
  santriName: string;

  /** What happened */
  reason: string;
  severity?: PelanggaranSeverity;
  points?: number;
  date: string;
  notes?: string;

  /** Optional reference to a specific rule (for manual reports) */
  masterPelanggaranId?: string;
  masterPelanggaranName?: string;

  /** Optional reference to related entity (izin kesehatan, movement, etc.) */
  relatedEntityType?: string;
  relatedEntityId?: string;

  /** Review outcome */
  reviewStatus: GovernanceReviewStatus;
  reviewedBy?: string;
  reviewedByRole?: UserRole;
  reviewedAt?: string;
  reviewNotes?: string;

  /** If reviewStatus = 'official_violation', FK to the created Pelanggaran */
  violationId?: string;

  /** Warning counter for future escalation */
  warningCount?: number;

  createdAt: string;
}

export interface Hukuman {
  id: string;
  santriId: string;
  santriName: string;
  pelanggaranId: string;
  masterHukumanId: string;    // FK ke MasterHukuman
  type: string;                // display name dari MasterHukuman
  description: string;
  startDate: string;
  endDate: string;
  status: 'aktif' | 'selesai' | 'dibatalkan';
  executorId?: string;        // yang mengeksekusi hukuman
}

export interface Quest {
  id: string;
  santriId: string;
  santriName: string;
  title: string;
  description: string;
  pointsReward: number;
  status: 'available' | 'inProgress' | 'completed' | 'expired';
  deadline: string;
  progress?: number; // 0-100
  createdBy?: string;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: string;
  targetRole?: UserRole;
  targetSantriId?: string; // For wali-specific notifications
  targetAsramaId?: string;
  targetKelas?: string;
  targetAngkatan?: number;
}

export type Instansi = 'madin' | 'madqur' | 'depag';

/** Canonical instansi order — Madin first (core pesantren curriculum flow). */
export const INSTANSI_ORDER: Instansi[] = ['madin', 'madqur', 'depag'];

export const INSTANSI_LABEL: Record<Instansi, string> = {
  madin: 'Madin',
  madqur: 'Madqur',
  depag: 'Depag',
};

// ── Master Struktur Akademik ──────────────────────────────────────────────

/** A single progression step in the academic hierarchy. System key = progressionIndex. */
export interface MasterTingkat {
  id: string;
  instansi: Instansi;
  progressionIndex: number;
  tingkatLabel: string;
  jenjangId: string;
  status: 'active' | 'inactive';
}

/** A jenjang groups multiple progression steps under one instansi. */
export interface MasterJenjang {
  id: string;
  namaJenjang: string;
  instansi: Instansi;
  progressionIndexes: number[];
  status: 'active' | 'inactive';
}

// ── Guru ──────────────────────────────────────────────────────

export interface Guru {
  id: string;
  name: string;
  nip: string;
  ranahInstansi: RanahInstansi;
  status: 'aktif' | 'nonaktif';
  /** Data opsional — dilengkapi guru sendiri via profil */
  email?: string;
  noWA?: string;
  alamat?: string;
  userId?: string;
}

export interface DataTableColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  className?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}
