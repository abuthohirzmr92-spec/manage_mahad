// ========================================
// Firestore Document Types (Phase 1)
// ========================================
// These types mirror the Firestore document schemas with Timestamp fields.
// They are distinct from the application-level types in index.ts which
// use serialized strings. Full types will be expanded in Phase 2.
// ========================================

import { Timestamp } from 'firebase/firestore';
import type {
  UserRole,
  SantriStatus,
  RanahInstansi,
  PelanggaranSeverity,
  AlumniStatus,
} from '@/types';

// --------------- Auth / Users ---------------

export interface FirestoreUser {
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  childSantriId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// --------------- Santri (Phase 2) ---------------

export interface FirestoreSantri {
  nis: string;
  name: string;
  asrama: string;
  kamar: string;
  asramaId?: string;
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
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// --------------- Asrama (Phase 2) ---------------

export interface FirestoreAsrama {
  name: string;
  musyrif: string;
  capacity: number;
  filled: number;
  gender: 'L' | 'P';
  status: 'aktif' | 'nonaktif';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// --------------- Kamar (Phase 2) ---------------

export interface FirestoreKamar {
  asramaId: string;
  name: string;
  capacity: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// --------------- Master Pelanggaran (Phase 2) ---------------

export interface FirestoreMasterPelanggaran {
  code: string;
  ranahInstansi: RanahInstansi;
  kategori: string;
  name: string;
  severity: PelanggaranSeverity;
  points: number;
  description?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// --------------- Pelanggaran (Phase 2) ---------------

export interface FirestorePelanggaran {
  santriId: string;
  santriName: string;
  pelanggaranId: string;
  pelanggaranName: string;
  severity: PelanggaranSeverity;
  points: number;
  date: string;
  reportedBy: string;
  reportedByUserId?: string;
  reportedByRole?: string;
  status: 'pending' | 'confirmed' | 'rejected';
  statusHukuman: 'belum' | 'aktif' | 'selesai';
  punishmentId?: string;
  punishmentName?: string;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// --------------- Master Hukuman ---------------

export interface FirestoreMasterHukuman {
  name: string;
  status: 'active' | 'inactive';
  severityScope: PelanggaranSeverity[];
  minimumTingkat: number;
  description?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// --------------- Alumni (Phase 2) ---------------

export interface FirestoreAlumni {
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
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// --------------- Kelas ---------------

export interface FirestoreKelas {
  name: string;
  jenjang: string;
  tingkat: number;
  waliKelas: string;
  studentCount: number;
  status: 'aktif' | 'nonaktif';
  academicTab: import('@/types').Instansi;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// --------------- Mapel ---------------

export interface FirestoreMapel {
  name: string;
  code?: string;
  jenjang: string;
  tingkat: number;
  status: 'active' | 'inactive';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestoreTeacherAssignment {
  mapelId: string;
  kelasId: string;
  kelasName: string;
  guruName: string;
  status: 'active' | 'inactive';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// --------------- Guru ---------------

export interface FirestoreGuru {
  name: string;
  nip: string;
  ranahInstansi: import('@/types').RanahInstansi;
  status: 'aktif' | 'nonaktif';
  email?: string;
  noWA?: string;
  alamat?: string;
  userId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// --------------- Hukuman ---------------

export interface FirestoreHukuman {
  santriId: string;
  santriName: string;
  pelanggaranId: string;
  masterHukumanId: string;    // FK ke MasterHukuman
  type: string;                // display name
  description: string;
  startDate: string;
  endDate: string;
  status: 'aktif' | 'selesai' | 'dibatalkan';
  executorId?: string;        // yang mengeksekusi
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// --------------- Quest ---------------

export interface FirestoreQuest {
  santriId: string;
  santriName: string;
  title: string;
  description: string;
  pointsReward: number;
  status: 'available' | 'inProgress' | 'completed' | 'expired';
  deadline: string;
  progress?: number;
  createdBy?: string;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// --------------- Notification ---------------

// --------------- Tolerance Policy ---------------

export interface FirestoreTolerancePolicy {
  type: 'global' | 'jenjang';
  jenjang?: string;
  isActive: boolean;
  limits: {
    ringan: number;
    sedang: number;
    berat: number;
    sangat_berat: number;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// --------------- Notification ---------------

export interface FirestoreNotification {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: Timestamp;
  targetRole?: UserRole;
  targetSantriId?: string;
  targetAsramaId?: string;
  targetKelas?: string;
  targetAngkatan?: number;
}

// ── Master Struktur Akademik ──────────────────────────────────────────────

export interface FirestoreMasterTingkat {
  instansi: import('@/types').Instansi;
  progressionIndex: number;
  tingkatLabel: string;
  jenjangId: string;
  status: 'active' | 'inactive';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestoreMasterJenjang {
  namaJenjang: string;
  instansi: import('@/types').Instansi;
  progressionIndexes: number[];
  status: 'active' | 'inactive';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
