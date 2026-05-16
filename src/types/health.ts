// ========================================
// Health Ecosystem Types
// Health Governance & Santri Care System
// ========================================

import type { Timestamp } from 'firebase/firestore';

// ── Enums ──────────────────────────────────────────────────────

export type HealthVisitCategory =
  | 'pemeriksaan'
  | 'observasi'
  | 'tindakan'
  | 'rujukan'
  | 'izin_berobat';

export type HealthSeverity =
  | 'ringan'
  | 'sedang'
  | 'darurat';

export type HealthVisitStatus =
  | 'observasi'
  | 'istirahat'
  | 'rawat_sementara'
  | 'perlu_berobat_luar'
  | 'selesai'
  | 'dirujuk';

export type HealthPermissionStatus =
  | 'diajukan'
  | 'disetujui'
  | 'ditolak'
  | 'dalam_perjalanan'
  | 'kembali'
  | 'selesai';

// ── App Types ──────────────────────────────────────────────────

/** A single UKS visit record. */
export interface HealthVisit {
  id: string;
  santriId: string;
  santriName: string;
  keluhan: string;
  category: HealthVisitCategory;
  severity: HealthSeverity;
  status: HealthVisitStatus;
  /** Petugas yang menangani */
  petugasId?: string;
  petugasName?: string;
  tindakan?: string;
  catatan?: string;
  masukAt: string;          // ISO
  selesaiAt?: string;       // ISO
  durasiMenit?: number;
  /** FK ke HealthPermission jika dirujuk keluar */
  permissionId?: string;
  createdAt: string;
  updatedAt: string;
}

/** Health permission for berobat keluar pondok. */
export interface HealthPermission {
  id: string;
  santriId: string;
  santriName: string;
  healthVisitId: string;    // FK ke HealthVisit
  keluhan: string;
  severity: HealthSeverity;
  status: HealthPermissionStatus;
  /** Tempat berobat */
  tujuanBerobat: string;
  alasan: string;
  /** Pengawas wajib */
  requiresSupervisor: boolean;
  supervisorId?: string;
  supervisorName?: string;
  requestedById: string;
  requestedByName: string;
  approvedById?: string;
  approvedByName?: string;
  keluarAt?: string;
  kembaliAt?: string;
  catatan?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Firestore Types ────────────────────────────────────────────

export interface FirestoreHealthVisit {
  santriId: string;
  santriName: string;
  keluhan: string;
  category: HealthVisitCategory;
  severity: HealthSeverity;
  status: HealthVisitStatus;
  petugasId?: string;
  petugasName?: string;
  tindakan?: string;
  catatan?: string;
  masukAt: string;
  selesaiAt?: string;
  durasiMenit?: number;
  permissionId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestoreHealthPermission {
  santriId: string;
  santriName: string;
  healthVisitId: string;
  keluhan: string;
  severity: HealthSeverity;
  status: HealthPermissionStatus;
  tujuanBerobat: string;
  alasan: string;
  requiresSupervisor: boolean;
  supervisorId?: string;
  supervisorName?: string;
  requestedById: string;
  requestedByName: string;
  approvedById?: string;
  approvedByName?: string;
  keluarAt?: string;
  kembaliAt?: string;
  catatan?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ── Health Timeline Entry (computed, not stored) ───────────────

export interface HealthTimelineEntry {
  time: string;
  label: string;
  type: 'masuk' | 'tindakan' | 'observasi' | 'rujukan' | 'selesai' | 'izin';
  detail?: string;
}
