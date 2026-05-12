// ========================================
// Core Types for Ma'had Management System
// ========================================

export type UserRole = 'admin' | 'musyrif' | 'wali' | 'santri' | 'staff' | 'kepala_kesiswaan' | 'guru' | 'wali_kelas';

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
  badge?: string;
  children?: NavItem[];
  disabled?: boolean;
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
  asrama: string;
  kamar: string;
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

export interface MasterPelanggaran {
  id: string;
  code: string;
  name: string;
  category: 'ringan' | 'sedang' | 'berat';
  points: number;
  description: string;
}

export interface Pelanggaran {
  id: string;
  santriId: string;
  santriName: string;
  pelanggaranId: string;
  pelanggaranName: string;
  category: 'ringan' | 'sedang' | 'berat';
  points: number;
  date: string;
  reportedBy: string;
  status: 'pending' | 'confirmed' | 'rejected';
  statusHukuman: 'belum' | 'aktif' | 'selesai';
  notes?: string;
}

export interface Hukuman {
  id: string;
  santriId: string;
  santriName: string;
  pelanggaranId: string;
  type: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'aktif' | 'selesai' | 'dibatalkan';
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
