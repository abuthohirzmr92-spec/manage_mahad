// ========================================
// Firestore & Auth Seeder
// ========================================
// Populates the Firestore emulator with all mock data and creates
// Firebase Auth users with custom claims (role).
//
// Prerequisites:
//   - Emulator running:  npm run emulator
//   - firebase-admin in devDependencies (already present)
//
// Usage:
//   npx tsx scripts/seed-firebase.ts
// ========================================

import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// ----------------------------------------------------------------
// Connect to the local emulator suite
// ----------------------------------------------------------------
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';

const app = initializeApp({ projectId: 'mahad-manager' });
const auth = getAuth(app);
const db = getFirestore(app);

// ================================================================
// Mock data (aligned with src/data/mock.ts + src/data/mock-kelas/)
// ================================================================

interface SeedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  childSantriId?: string;
  avatar?: string;
}

interface SeedSantri {
  id: string;
  nis: string;
  name: string;
  asrama: string;
  kamar: string;
  asramaId?: string;
  kamarId?: string;
  kelas: string;
  status: string;
  gender: string;
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
  statusKarakter: string;
  statusSP: string;
}

interface SeedAsrama {
  id: string;
  name: string;
  musyrif: string;
  capacity: number;
  filled: number;
  gender: string;
  status: string;
}

interface SeedKamar {
  id: string;
  asramaId: string;
  name: string;
  capacity: number;
}

interface SeedKelas {
  id: string;
  name: string;
  jenjang: string;
  tingkat: number;
  waliKelas: string;
  studentCount: number;
  status: string;
  academicTab: 'formal' | 'diniyah' | 'quran';
}

interface SeedMapel {
  id: string;
  name: string;
  code: string;
  academicTab: 'formal' | 'diniyah' | 'quran';
  level: string;
  teacherCount: number;
  status: string;
}

interface SeedMasterPelanggaran {
  id: string;
  code: string;
  ranahInstansi: string;
  kategori: string;
  name: string;
  severity: string;
  points: number;
  description?: string;
  toleranceMode?: string;
  toleranceLimit?: number;
}

interface SeedPelanggaran {
  id: string;
  santriId: string;
  santriName: string;
  pelanggaranId: string;
  pelanggaranName: string;
  severity: string;
  points: number;
  date: string;
  reportedBy: string;
  status: string;
  statusHukuman: string;
  notes?: string;
}

interface SeedHukuman {
  id: string;
  santriId: string;
  santriName: string;
  pelanggaranId: string;
  type: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface SeedQuest {
  id: string;
  santriId: string;
  santriName: string;
  title: string;
  description: string;
  pointsReward: number;
  status: string;
  deadline: string;
  progress?: number;
  createdBy?: string;
  approvalStatus?: string;
  approvedBy?: string;
}

interface SeedAlumni {
  id: string;
  nis: string;
  name: string;
  tahunAlumni: number;
  statusKeluar: string;
  kelasTerakhir: string;
  asramaTerakhir: string;
  asalKota: string;
  asalProvinsi: string;
  angkatanMasuk: number;
  userId?: string;
  catatan?: string;
  masihMemilikiAkun: boolean;
}

interface SeedNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
  targetRole?: string;
  targetSantriId?: string;
  targetAsramaId?: string;
  targetKelas?: string;
  targetAngkatan?: number;
}

// ================================================================
// Data
// ================================================================

const seedUsers: SeedUser[] = [
  { id: '1', name: 'Ahmad Fauzi', email: 'admin@mahad.sch.id', role: 'admin' },
  { id: '2', name: 'Ustadz Hasan', email: 'musyrif@mahad.sch.id', role: 'musyrif' },
  { id: '3', name: 'Bapak Ridwan', email: 'wali@mahad.sch.id', role: 'wali', childSantriId: '1' },
  { id: 'w2', name: 'Bapak Surya', email: 'wali2@mahad.sch.id', role: 'wali', childSantriId: '2' },
  { id: 'w3', name: 'Bapak Hadi', email: 'wali3@mahad.sch.id', role: 'wali', childSantriId: '3' },
  { id: 'w4', name: 'Bapak Ahmad', email: 'wali4@mahad.sch.id', role: 'wali', childSantriId: '4' },
  { id: 'w5', name: 'Bapak Dani', email: 'wali5@mahad.sch.id', role: 'wali', childSantriId: '5' },
  { id: 'w6', name: 'Bapak Eko', email: 'wali6@mahad.sch.id', role: 'wali', childSantriId: '6' },
  { id: 'w7', name: 'Bapak Fajar', email: 'wali7@mahad.sch.id', role: 'wali', childSantriId: '7' },
  { id: 'w8', name: 'Bapak Gunawan', email: 'wali8@mahad.sch.id', role: 'wali', childSantriId: '8' },
  { id: 'w9', name: 'Bapak Irfan', email: 'wali9@mahad.sch.id', role: 'wali', childSantriId: '9' },
  { id: 'w10', name: 'Bapak Joko', email: 'wali10@mahad.sch.id', role: 'wali', childSantriId: '10' },
  { id: '4', name: 'Muhammad Rizki', email: 'santri@mahad.sch.id', role: 'santri' },
  { id: '5', name: 'Ustadz Fatih', email: 'guru@mahad.sch.id', role: 'guru' },
  { id: '6', name: 'Pak Budi', email: 'staff@mahad.sch.id', role: 'staff' },
  { id: '7', name: 'Ustadz Ibrahim', email: 'walikelas@mahad.sch.id', role: 'wali_kelas' },
  { id: '8', name: 'Ustadz Sulaiman', email: 'kesiswaan@mahad.sch.id', role: 'kepala_kesiswaan' },
  { id: 'u1', name: 'Tariq Hidayatullah', email: 'alumni1@mahad.sch.id', role: 'alumni' },
  { id: 'u2', name: 'Ibnu Sina Al-Hafiz', email: 'alumni2@mahad.sch.id', role: 'alumni' },
];

const seedSantri: SeedSantri[] = [
  { id: '1', nis: '2024001', name: 'Muhammad Rizki Aditya', asrama: 'Al-Fatih', kamar: 'A-101', asramaId: '1', kamarId: 'k1', kelas: '10A', status: 'aktif', gender: 'L', waliId: '3', waliName: 'Bapak Ridwan', waliPhone: '081234567890', joinDate: '2024-07-15', asalKota: 'Bandung', asalProvinsi: 'Jawa Barat', angkatanMasuk: 2024, totalPoinPelanggaran: 15, totalPrestasi: 80, statusKarakter: 'Baik', statusSP: 'Tidak Ada' },
  { id: '2', nis: '2024002', name: 'Abdullah Firdaus', asrama: 'Al-Fatih', kamar: 'A-102', asramaId: '1', kamarId: 'k2', kelas: '10A', status: 'aktif', gender: 'L', waliId: 'w2', waliName: 'Bapak Surya', waliPhone: '081234567891', joinDate: '2024-07-15', asalKota: 'Surabaya', asalProvinsi: 'Jawa Timur', angkatanMasuk: 2024, totalPoinPelanggaran: 30, totalPrestasi: 45, statusKarakter: 'Perlu Perhatian', statusSP: 'SP1' },
  { id: '3', nis: '2024003', name: 'Umar Hadi Pratama', asrama: 'Al-Farabi', kamar: 'B-201', asramaId: '2', kamarId: 'k6', kelas: '11B', status: 'aktif', gender: 'L', waliId: 'w3', waliName: 'Bapak Hadi', waliPhone: '081234567892', joinDate: '2023-07-10', asalKota: 'Semarang', asalProvinsi: 'Jawa Tengah', angkatanMasuk: 2023, totalPoinPelanggaran: 20, totalPrestasi: 60, statusKarakter: 'Baik', statusSP: 'Tidak Ada' },
  { id: '4', nis: '2024004', name: 'Zaid Ahmad Hidayat', asrama: 'Al-Farabi', kamar: 'B-202', asramaId: '2', kamarId: 'k7', kelas: '11A', status: 'aktif', gender: 'L', waliId: 'w4', waliName: 'Bapak Ahmad', waliPhone: '081234567893', joinDate: '2023-07-10', asalKota: 'Malang', asalProvinsi: 'Jawa Timur', angkatanMasuk: 2023, totalPoinPelanggaran: 55, totalPrestasi: 20, statusKarakter: 'Peringatan', statusSP: 'SP2' },
  { id: '5', nis: '2024005', name: 'Bilal Ramadhan', asrama: 'Al-Ghazali', kamar: 'C-301', asramaId: '3', kamarId: 'k10', kelas: '12A', status: 'aktif', gender: 'L', waliId: 'w5', waliName: 'Bapak Dani', waliPhone: '081234567894', joinDate: '2022-07-12', asalKota: 'Jakarta Selatan', asalProvinsi: 'DKI Jakarta', angkatanMasuk: 2022, totalPoinPelanggaran: 10, totalPrestasi: 90, statusKarakter: 'Baik', statusSP: 'Tidak Ada' },
  { id: '6', nis: '2024006', name: 'Hamza Syafiq', asrama: 'Al-Ghazali', kamar: 'C-302', asramaId: '3', kamarId: 'k11', kelas: '12B', status: 'cuti', gender: 'L', waliId: 'w6', waliName: 'Bapak Eko', waliPhone: '081234567895', joinDate: '2022-07-12', asalKota: 'Bogor', asalProvinsi: 'Jawa Barat', angkatanMasuk: 2022, totalPoinPelanggaran: 5, totalPrestasi: 70, statusKarakter: 'Baik', statusSP: 'Tidak Ada' },
  { id: '7', nis: '2024007', name: 'Yusuf Hakim', asrama: 'Al-Fatih', kamar: 'A-103', asramaId: '1', kamarId: 'k3', kelas: '10B', status: 'aktif', gender: 'L', waliId: 'w7', waliName: 'Bapak Fajar', waliPhone: '081234567896', joinDate: '2024-07-15', asalKota: 'Cirebon', asalProvinsi: 'Jawa Barat', angkatanMasuk: 2024, totalPoinPelanggaran: 0, totalPrestasi: 50, statusKarakter: 'Baik', statusSP: 'Tidak Ada' },
  { id: '8', nis: '2024008', name: 'Khalid Maulana', asrama: 'Al-Farabi', kamar: 'B-203', asramaId: '2', kamarId: 'k8', kelas: '11A', status: 'skors', gender: 'L', waliId: 'w8', waliName: 'Bapak Gunawan', waliPhone: '081234567897', joinDate: '2023-07-10', asalKota: 'Yogyakarta', asalProvinsi: 'DI Yogyakarta', angkatanMasuk: 2023, totalPoinPelanggaran: 40, totalPrestasi: 30, statusKarakter: 'Peringatan', statusSP: 'SP1' },
  { id: '9', nis: '2024009', name: 'Ibrahim Salman', asrama: 'Al-Ghazali', kamar: 'C-303', asramaId: '3', kamarId: 'k12', kelas: '12A', status: 'aktif', gender: 'L', waliId: 'w9', waliName: 'Bapak Irfan', waliPhone: '081234567898', joinDate: '2021-07-14', asalKota: 'Surakarta', asalProvinsi: 'Jawa Tengah', angkatanMasuk: 2021, totalPoinPelanggaran: 0, totalPrestasi: 100, statusKarakter: 'Baik', statusSP: 'Tidak Ada' },
  { id: '10', nis: '2024010', name: 'Anas Fathurrahman', asrama: 'Al-Fatih', kamar: 'A-104', asramaId: '1', kamarId: 'k4', kelas: '10A', status: 'aktif', gender: 'L', waliId: 'w10', waliName: 'Bapak Joko', waliPhone: '081234567899', joinDate: '2024-07-15', asalKota: 'Tangerang', asalProvinsi: 'Banten', angkatanMasuk: 2024, totalPoinPelanggaran: 25, totalPrestasi: 55, statusKarakter: 'Perlu Perhatian', statusSP: 'Tidak Ada' },
  { id: '11', nis: '2024011', name: 'Faris Abdurrahim', asrama: '', kamar: '', kelas: '10B', status: 'aktif', gender: 'L', waliId: 'w10', waliName: 'Bapak Syamsul', waliPhone: '082100000001', joinDate: '2024-08-01', asalKota: 'Bekasi', asalProvinsi: 'Jawa Barat', angkatanMasuk: 2024, totalPoinPelanggaran: 5, totalPrestasi: 40, statusKarakter: 'Baik', statusSP: 'Tidak Ada' },
  { id: '12', nis: '2024012', name: 'Nabil Hamdani', asrama: '', kamar: '', kelas: '11A', status: 'aktif', gender: 'L', waliId: 'w10', waliName: 'Bapak Rudi', waliPhone: '082100000002', joinDate: '2024-08-01', asalKota: 'Jakarta Timur', asalProvinsi: 'DKI Jakarta', angkatanMasuk: 2024, totalPoinPelanggaran: 0, totalPrestasi: 60, statusKarakter: 'Baik', statusSP: 'Tidak Ada' },
  { id: '13', nis: '2024013', name: 'Rafif Musyafa', asrama: '', kamar: '', kelas: '12A', status: 'aktif', gender: 'L', waliId: 'w10', waliName: 'Bapak Didi', waliPhone: '082100000003', joinDate: '2024-08-01', asalKota: 'Bandung', asalProvinsi: 'Jawa Barat', angkatanMasuk: 2024, totalPoinPelanggaran: 10, totalPrestasi: 75, statusKarakter: 'Baik', statusSP: 'Tidak Ada' },
];

const seedAsrama: SeedAsrama[] = [
  { id: '1', name: 'Al-Fatih', musyrif: 'Ustadz Hasan', capacity: 40, filled: 32, gender: 'L', status: 'aktif' },
  { id: '2', name: 'Al-Farabi', musyrif: 'Ustadz Mahmud', capacity: 40, filled: 28, gender: 'L', status: 'aktif' },
  { id: '3', name: 'Al-Ghazali', musyrif: 'Ustadz Salim', capacity: 35, filled: 30, gender: 'L', status: 'aktif' },
  { id: '4', name: 'An-Nisa', musyrif: 'Ustadzah Fatimah', capacity: 40, filled: 35, gender: 'P', status: 'aktif' },
  { id: '5', name: 'Ar-Raudah', musyrif: 'Ustadzah Khadijah', capacity: 35, filled: 20, gender: 'P', status: 'aktif' },
  { id: '6', name: 'Al-Hikmah', musyrif: '-', capacity: 30, filled: 0, gender: 'L', status: 'nonaktif' },
];

const seedKamar: SeedKamar[] = [
  { id: 'k1', asramaId: '1', name: 'A-101', capacity: 6 },
  { id: 'k2', asramaId: '1', name: 'A-102', capacity: 6 },
  { id: 'k3', asramaId: '1', name: 'A-103', capacity: 6 },
  { id: 'k4', asramaId: '1', name: 'A-104', capacity: 6 },
  { id: 'k5', asramaId: '1', name: 'A-105', capacity: 8 },
  { id: 'k6', asramaId: '2', name: 'B-201', capacity: 6 },
  { id: 'k7', asramaId: '2', name: 'B-202', capacity: 6 },
  { id: 'k8', asramaId: '2', name: 'B-203', capacity: 6 },
  { id: 'k9', asramaId: '2', name: 'B-204', capacity: 8 },
  { id: 'k10', asramaId: '3', name: 'C-301', capacity: 8 },
  { id: 'k11', asramaId: '3', name: 'C-302', capacity: 8 },
  { id: 'k12', asramaId: '3', name: 'C-303', capacity: 8 },
  { id: 'k13', asramaId: '4', name: 'D-401', capacity: 8 },
  { id: 'k14', asramaId: '4', name: 'D-402', capacity: 8 },
  { id: 'k15', asramaId: '4', name: 'D-403', capacity: 8 },
  { id: 'k16', asramaId: '5', name: 'E-501', capacity: 6 },
  { id: 'k17', asramaId: '5', name: 'E-502', capacity: 6 },
  { id: 'k18', asramaId: '5', name: 'E-503', capacity: 8 },
];

const seedKelas: SeedKelas[] = [
  { id: 'c1', name: '7A Abu Bakar', jenjang: 'MTs', tingkat: 1, waliKelas: 'Ust. Ahmad Zain', studentCount: 32, status: 'aktif', academicTab: 'formal' },
  { id: 'c2', name: '7B Umar', jenjang: 'MTs', tingkat: 1, waliKelas: 'Ust. Budi Santoso', studentCount: 30, status: 'aktif', academicTab: 'formal' },
  { id: 'c3', name: '8A Utsman', jenjang: 'MTs', tingkat: 2, waliKelas: 'Ust. Ali Riza', studentCount: 28, status: 'aktif', academicTab: 'formal' },
  { id: 'c4', name: '9A Ali', jenjang: 'MTs', tingkat: 3, waliKelas: 'Ust. Hamzah', studentCount: 31, status: 'aktif', academicTab: 'formal' },
  { id: 'c5', name: '10A IPA', jenjang: 'MA', tingkat: 1, waliKelas: 'Ust. Fikri', studentCount: 35, status: 'aktif', academicTab: 'formal' },
  { id: 'c6', name: '11A Agama', jenjang: 'MA', tingkat: 2, waliKelas: 'Ust. Rahman', studentCount: 25, status: 'aktif', academicTab: 'formal' },
  { id: 'c7', name: '12A IPA', jenjang: 'MA', tingkat: 3, waliKelas: 'Ust. Zaid', studentCount: 30, status: 'aktif', academicTab: 'formal' },
  { id: 'd0', name: 'Tamhidi A', jenjang: 'Tamhidi', tingkat: 1, waliKelas: 'Ust. Karim', studentCount: 35, status: 'aktif', academicTab: 'diniyah' },
  { id: 'd1', name: '1A', jenjang: "Ibtida'i", tingkat: 1, waliKelas: 'Ust. Abdul', studentCount: 40, status: 'aktif', academicTab: 'diniyah' },
  { id: 'd2', name: '1B', jenjang: "Ibtida'i", tingkat: 1, waliKelas: 'Ust. Hakim', studentCount: 38, status: 'aktif', academicTab: 'diniyah' },
  { id: 'd3', name: '2A', jenjang: "Ibtida'i", tingkat: 2, waliKelas: 'Ust. Malik', studentCount: 45, status: 'aktif', academicTab: 'diniyah' },
  { id: 'd4', name: '3A', jenjang: "Ibtida'i", tingkat: 3, waliKelas: 'Ust. Hasan', studentCount: 42, status: 'aktif', academicTab: 'diniyah' },
  { id: 'd5', name: '1A', jenjang: 'Tsanawiyah', tingkat: 1, waliKelas: 'Ust. Yahya', studentCount: 20, status: 'aktif', academicTab: 'diniyah' },
  { id: 'd6', name: '2A', jenjang: 'Tsanawiyah', tingkat: 2, waliKelas: 'Ust. Faiz', studentCount: 18, status: 'aktif', academicTab: 'diniyah' },
  { id: 'q1', name: 'Halaqah Utsman', jenjang: 'Tahsin', tingkat: 1, waliKelas: 'Ust. Furqon', studentCount: 15, status: 'aktif', academicTab: 'quran' },
  { id: 'q2', name: 'Halaqah Ali', jenjang: 'Tahsin', tingkat: 1, waliKelas: 'Ust. Yusuf', studentCount: 12, status: 'aktif', academicTab: 'quran' },
  { id: 'q3', name: 'Halaqah Zaid', jenjang: 'Tahsin', tingkat: 2, waliKelas: 'Ust. Ibrahim', studentCount: 10, status: 'aktif', academicTab: 'quran' },
  { id: 'q4', name: 'Tahfidz Juz 30', jenjang: 'Tahfidz', tingkat: 1, waliKelas: 'Ust. Naufal', studentCount: 8, status: 'aktif', academicTab: 'quran' },
  { id: 'q5', name: 'Takhassus 30 Juz', jenjang: 'Tahfidz', tingkat: 2, waliKelas: 'Ust. Syekh', studentCount: 5, status: 'aktif', academicTab: 'quran' },
];

const seedMapel: SeedMapel[] = [
  { id: 'm1', name: 'Bahasa Arab', code: 'ARB-101', academicTab: 'diniyah', level: "Ibtida'i", teacherCount: 4, status: 'aktif' },
  { id: 'm2', name: 'Tauhid', code: 'TDH-101', academicTab: 'diniyah', level: 'Tsanawiyah', teacherCount: 3, status: 'aktif' },
  { id: 'm3', name: 'Fiqih', code: 'FIQ-101', academicTab: 'diniyah', level: "Ibtida'i", teacherCount: 3, status: 'aktif' },
  { id: 'm4', name: 'Matematika', code: 'MTK-101', academicTab: 'formal', level: 'MTs', teacherCount: 5, status: 'aktif' },
  { id: 'm5', name: 'IPA', code: 'IPA-101', academicTab: 'formal', level: 'MTs', teacherCount: 4, status: 'aktif' },
  { id: 'm6', name: 'IPS', code: 'IPS-101', academicTab: 'formal', level: 'MA', teacherCount: 3, status: 'aktif' },
  { id: 'm7', name: 'Tahsin', code: 'THS-101', academicTab: 'quran', level: 'Tahsin', teacherCount: 6, status: 'aktif' },
  { id: 'm8', name: 'Tahfidz', code: 'THF-101', academicTab: 'quran', level: 'Tahfidz', teacherCount: 4, status: 'aktif' },
  { id: 'm9', name: 'Bahasa Inggris', code: 'BIG-101', academicTab: 'formal', level: 'MA', teacherCount: 3, status: 'aktif' },
  { id: 'm10', name: 'Nahwu', code: 'NAH-101', academicTab: 'diniyah', level: 'Tsanawiyah', teacherCount: 3, status: 'aktif' },
];

const seedMasterPelanggaran: SeedMasterPelanggaran[] = [
  { id: '1', code: 'PL-001', ranahInstansi: 'pesantren', kategori: 'Ibadah', name: 'Terlambat Sholat Berjamaah', severity: 'ringan', points: 5, description: 'Tidak hadir tepat waktu sholat berjamaah', toleranceMode: 'custom', toleranceLimit: 5 },
  { id: '2', code: 'PL-002', ranahInstansi: 'pesantren', kategori: 'Kebersihan', name: 'Tidak Piket Kebersihan', severity: 'ringan', points: 5, description: 'Tidak melaksanakan piket kebersihan', toleranceMode: 'global' },
  { id: '3', code: 'PL-003', ranahInstansi: 'pesantren', kategori: 'Asrama', name: 'Keluar Asrama Tanpa Izin', severity: 'sedang', points: 15, description: 'Meninggalkan asrama tanpa izin musyrif' },
  { id: '4', code: 'PL-004', ranahInstansi: 'pesantren', kategori: 'Kedisiplinan', name: 'Membawa HP', severity: 'sedang', points: 20, description: 'Kedapatan membawa/menggunakan handphone' },
  { id: '5', code: 'PL-005', ranahInstansi: 'pesantren', kategori: 'Akhlak', name: 'Berkelahi', severity: 'sangat_berat', points: 50, description: 'Terlibat perkelahian fisik' },
  { id: '6', code: 'PL-006', ranahInstansi: 'pesantren', kategori: 'Kedisiplinan', name: 'Merokok', severity: 'berat', points: 40, description: 'Kedapatan merokok di area pesantren' },
  { id: '7', code: 'PL-007', ranahInstansi: 'madin', kategori: 'Kelas', name: 'Tidur di Waktu Belajar', severity: 'ringan', points: 10, description: 'Tidur saat jam belajar malam', toleranceMode: 'custom', toleranceLimit: 2 },
  { id: '8', code: 'PL-008', ranahInstansi: 'madin', kategori: 'Kelas', name: 'Tidak Mengikuti Pelajaran', severity: 'sedang', points: 15, description: 'Bolos kelas tanpa keterangan' },
  { id: '9', code: 'PL-009', ranahInstansi: 'depag', kategori: 'Ibadah', name: 'Tidak Ikut Jamaah Subuh', severity: 'sedang', points: 15, description: 'Tidak mengikuti sholat subuh berjamaah' },
  { id: '10', code: 'PL-010', ranahInstansi: 'madqurur', kategori: 'Hafalan', name: 'Tidak Setoran Hafalan', severity: 'ringan', points: 8, description: 'Tidak menyetorkan hafalan sesuai jadwal', toleranceMode: 'global' },
];

const seedPelanggaran: SeedPelanggaran[] = [
  { id: '1', santriId: '1', santriName: 'Muhammad Rizki Aditya', pelanggaranId: '1', pelanggaranName: 'Terlambat Sholat Berjamaah', severity: 'ringan', points: 5, date: '2025-05-10', reportedBy: 'Ustadz Hasan', status: 'confirmed', statusHukuman: 'selesai' },
  { id: '2', santriId: '2', santriName: 'Abdullah Firdaus', pelanggaranId: '3', pelanggaranName: 'Keluar Asrama Tanpa Izin', severity: 'sedang', points: 15, date: '2025-05-09', reportedBy: 'Ustadz Hasan', status: 'pending', statusHukuman: 'belum' },
  { id: '3', santriId: '3', santriName: 'Umar Hadi Pratama', pelanggaranId: '4', pelanggaranName: 'Membawa HP', severity: 'sedang', points: 20, date: '2025-05-08', reportedBy: 'Ustadz Mahmud', status: 'confirmed', statusHukuman: 'aktif' },
  { id: '4', santriId: '1', santriName: 'Muhammad Rizki Aditya', pelanggaranId: '7', pelanggaranName: 'Tidur di Waktu Belajar', severity: 'ringan', points: 10, date: '2025-05-07', reportedBy: 'Ustadz Hasan', status: 'confirmed', statusHukuman: 'aktif' },
  { id: '5', santriId: '4', santriName: 'Zaid Ahmad Hidayat', pelanggaranId: '5', pelanggaranName: 'Berkelahi', severity: 'sangat_berat', points: 50, date: '2025-05-06', reportedBy: 'Ustadz Mahmud', status: 'confirmed', statusHukuman: 'selesai' },
  { id: '6', santriId: '7', santriName: 'Yusuf Hakim', pelanggaranId: '2', pelanggaranName: 'Tidak Piket Kebersihan', severity: 'ringan', points: 5, date: '2025-05-05', reportedBy: 'Ustadz Hasan', status: 'rejected', statusHukuman: 'belum' },
];

const seedHukuman: SeedHukuman[] = [
  { id: '1', santriId: '1', santriName: 'Muhammad Rizki Aditya', pelanggaranId: '1', type: 'Hafalan Tambahan', description: 'Menghafal Surah Al-Mulk', startDate: '2025-05-10', endDate: '2025-05-17', status: 'aktif' },
  { id: '2', santriId: '3', santriName: 'Umar Hadi Pratama', pelanggaranId: '3', type: 'Piket Tambahan', description: 'Piket kebersihan selama 1 minggu', startDate: '2025-05-08', endDate: '2025-05-15', status: 'aktif' },
  { id: '3', santriId: '4', santriName: 'Zaid Ahmad Hidayat', pelanggaranId: '5', type: 'Skorsing', description: 'Dipulangkan selama 3 hari', startDate: '2025-05-06', endDate: '2025-05-09', status: 'selesai' },
];

const seedQuest: SeedQuest[] = [
  { id: '1', santriId: '1', santriName: 'Muhammad Rizki Aditya', title: 'Hafal Juz 30', description: 'Menghafal seluruh surah di Juz 30', pointsReward: 50, status: 'inProgress', deadline: '2025-06-01', progress: 65 },
  { id: '2', santriId: '3', santriName: 'Umar Hadi Pratama', title: 'Kebersihan Asrama', description: 'Menjaga kebersihan asrama selama 2 minggu', pointsReward: 20, status: 'available', deadline: '2025-05-25', progress: 0 },
  { id: '3', santriId: '1', santriName: 'Muhammad Rizki Aditya', title: 'Imam Sholat', description: 'Menjadi imam sholat berjamaah 5 kali', pointsReward: 30, status: 'completed', deadline: '2025-05-20', progress: 100 },
  { id: '4', santriId: '2', santriName: 'Abdullah Firdaus', title: 'Mengajar Iqra', description: 'Mengajar adik kelas baca Iqra selama 1 bulan', pointsReward: 40, status: 'inProgress', deadline: '2025-06-15', progress: 30 },
];

const seedAlumni: SeedAlumni[] = [
  { id: 'a1', nis: '2021001', name: 'Tariq Hidayatullah', tahunAlumni: 2024, statusKeluar: 'Lulus', kelasTerakhir: '12 IPA', asramaTerakhir: 'Al-Farabi', asalKota: 'Jakarta Pusat', asalProvinsi: 'DKI Jakarta', angkatanMasuk: 2021, catatan: 'Melanjutkan studi ke Al-Azhar Kairo', masihMemilikiAkun: true, userId: 'u1' },
  { id: 'a2', nis: '2021002', name: 'Ibnu Sina Al-Hafiz', tahunAlumni: 2024, statusKeluar: 'Lulus', kelasTerakhir: '12 Agama', asramaTerakhir: 'Al-Ghazali', asalKota: 'Depok', asalProvinsi: 'Jawa Barat', angkatanMasuk: 2021, catatan: 'Beasiswa Universitas Madinah', masihMemilikiAkun: true, userId: 'u2' },
  { id: 'a3', nis: '2022099', name: 'Fulan bin Fulan', tahunAlumni: 2023, statusKeluar: 'Keluar', kelasTerakhir: '10A', asramaTerakhir: 'Al-Fatih', asalKota: 'Serang', asalProvinsi: 'Banten', angkatanMasuk: 2022, catatan: 'Pindah mengikuti orang tua bertugas ke luar kota', masihMemilikiAkun: false },
  { id: 'a4', nis: '2020045', name: 'Ahmad Syafii', tahunAlumni: 2023, statusKeluar: 'Keluar', kelasTerakhir: '11B', asramaTerakhir: 'Al-Farabi', asalKota: 'Bekasi', asalProvinsi: 'Jawa Barat', angkatanMasuk: 2020, catatan: 'Berhenti atas permintaan orang tua (kesehatan)', masihMemilikiAkun: false },
];

const seedNotifications: SeedNotification[] = [
  { id: '1', title: 'Pelanggaran Baru', message: 'Zaid Ahmad Hidayat melakukan pelanggaran berat: Berkelahi', type: 'warning', read: false, createdAt: '2025-05-10T14:30:00', targetSantriId: '4' },
  { id: '2', title: 'Quest Selesai', message: 'Muhammad Rizki Aditya telah menyelesaikan quest: Imam Sholat', type: 'success', read: false, createdAt: '2025-05-10T10:00:00', targetSantriId: '1' },
  { id: '3', title: 'Pelanggaran Dicatat', message: 'Muhammad Rizki Aditya: Terlambat Sholat Berjamaah (5 poin)', type: 'warning', read: false, createdAt: '2025-05-10T08:00:00', targetSantriId: '1' },
  { id: '4', title: 'Hukuman Aktif', message: 'Muhammad Rizki Aditya mendapat hukuman: Hafalan Surah Al-Mulk', type: 'info', read: true, createdAt: '2025-05-10T07:00:00', targetSantriId: '1' },
  { id: '5', title: 'Laporan Pelanggaran Ditolak', message: 'Laporan pelanggaran Yusuf Hakim telah ditolak', type: 'info', read: true, createdAt: '2025-05-09T16:00:00', targetSantriId: '7' },
  { id: '6', title: 'Hukuman Selesai', message: 'Masa hukuman Zaid Ahmad Hidayat telah berakhir', type: 'success', read: true, createdAt: '2025-05-09T08:00:00', targetSantriId: '4' },
  { id: '7', title: 'Peringatan Kapasitas Asrama', message: 'Asrama An-Nisa mendekati kapasitas penuh (35/40)', type: 'warning', read: false, createdAt: '2025-05-08T09:00:00' },
  { id: '8', title: 'Pengumuman Ujian Kelas 10A', message: 'Ujian semester untuk kelas 10A akan dilaksanakan minggu depan.', type: 'info', read: false, createdAt: '2025-05-11T09:00:00', targetKelas: '10A' },
  { id: '9', title: 'Pemberitahuan Angkatan 2024', message: 'Harap mengumpulkan berkas pendaftaran ulang di tata usaha.', type: 'warning', read: false, createdAt: '2025-05-11T10:00:00', targetAngkatan: 2024 },
  { id: '10', title: 'Kerja Bakti Asrama', message: 'Akan diadakan kerja bakti untuk asrama Al-Fatih besok pagi.', type: 'info', read: false, createdAt: '2025-05-11T11:00:00', targetAsramaId: '1' },
];

// ================================================================
// Helpers
// ================================================================

const now = Timestamp.now();

function firestoreUser(u: SeedUser) {
  return {
    name: u.name,
    email: u.email,
    role: u.role,
    ...(u.childSantriId ? { childSantriId: u.childSantriId } : {}),
    ...(u.avatar ? { avatar: u.avatar } : {}),
    createdAt: now,
    updatedAt: now,
  };
}

function firestoreSantri(s: SeedSantri) {
  return {
    nis: s.nis,
    name: s.name,
    asrama: s.asrama,
    kamar: s.kamar,
    ...(s.asramaId ? { asramaId: s.asramaId } : {}),
    ...(s.kamarId ? { kamarId: s.kamarId } : {}),
    ...(s.photoUrl ? { photoUrl: s.photoUrl } : {}),
    kelas: s.kelas,
    status: s.status,
    gender: s.gender,
    waliId: s.waliId,
    waliName: s.waliName,
    waliPhone: s.waliPhone,
    joinDate: s.joinDate,
    asalKota: s.asalKota,
    asalProvinsi: s.asalProvinsi,
    angkatanMasuk: s.angkatanMasuk,
    totalPoinPelanggaran: s.totalPoinPelanggaran,
    totalPrestasi: s.totalPrestasi,
    statusKarakter: s.statusKarakter,
    statusSP: s.statusSP,
    createdAt: now,
    updatedAt: now,
  };
}

function firestoreAsrama(a: SeedAsrama) {
  return {
    name: a.name,
    musyrif: a.musyrif,
    capacity: a.capacity,
    filled: a.filled,
    gender: a.gender,
    status: a.status,
    createdAt: now,
    updatedAt: now,
  };
}

function firestoreKamar(k: SeedKamar) {
  return {
    asramaId: k.asramaId,
    name: k.name,
    capacity: k.capacity,
    createdAt: now,
    updatedAt: now,
  };
}

function firestoreKelas(k: SeedKelas) {
  return {
    name: k.name,
    jenjang: k.jenjang,
    tingkat: k.tingkat,
    waliKelas: k.waliKelas,
    studentCount: k.studentCount,
    status: k.status,
    academicTab: k.academicTab,
    createdAt: now,
    updatedAt: now,
  };
}

function firestoreMapel(m: SeedMapel) {
  return {
    name: m.name,
    code: m.code,
    academicTab: m.academicTab,
    level: m.level,
    teacherCount: m.teacherCount,
    status: m.status,
    createdAt: now,
    updatedAt: now,
  };
}

function firestoreMasterPelanggaran(m: SeedMasterPelanggaran) {
  return {
    code: m.code,
    ranahInstansi: m.ranahInstansi,
    kategori: m.kategori,
    name: m.name,
    severity: m.severity,
    points: m.points,
    ...(m.description ? { description: m.description } : {}),
    ...(m.toleranceMode ? { toleranceMode: m.toleranceMode } : {}),
    ...(m.toleranceLimit !== undefined ? { toleranceLimit: m.toleranceLimit } : {}),
    createdAt: now,
    updatedAt: now,
  };
}

function firestorePelanggaran(p: SeedPelanggaran) {
  return {
    santriId: p.santriId,
    santriName: p.santriName,
    pelanggaranId: p.pelanggaranId,
    pelanggaranName: p.pelanggaranName,
    severity: p.severity,
    points: p.points,
    date: p.date,
    reportedBy: p.reportedBy,
    status: p.status,
    statusHukuman: p.statusHukuman,
    ...(p.notes ? { notes: p.notes } : {}),
    createdAt: now,
    updatedAt: now,
  };
}

function firestoreHukuman(h: SeedHukuman) {
  return {
    santriId: h.santriId,
    santriName: h.santriName,
    pelanggaranId: h.pelanggaranId,
    type: h.type,
    description: h.description,
    startDate: h.startDate,
    endDate: h.endDate,
    status: h.status,
    createdAt: now,
    updatedAt: now,
  };
}

function firestoreQuest(q: SeedQuest) {
  return {
    santriId: q.santriId,
    santriName: q.santriName,
    title: q.title,
    description: q.description,
    pointsReward: q.pointsReward,
    status: q.status,
    deadline: q.deadline,
    ...(q.progress !== undefined ? { progress: q.progress } : {}),
    ...(q.createdBy ? { createdBy: q.createdBy } : {}),
    ...(q.approvalStatus ? { approvalStatus: q.approvalStatus } : {}),
    ...(q.approvedBy ? { approvedBy: q.approvedBy } : {}),
    createdAt: now,
    updatedAt: now,
  };
}

function firestoreAlumni(a: SeedAlumni) {
  return {
    nis: a.nis,
    name: a.name,
    tahunAlumni: a.tahunAlumni,
    statusKeluar: a.statusKeluar,
    kelasTerakhir: a.kelasTerakhir,
    asramaTerakhir: a.asramaTerakhir,
    asalKota: a.asalKota,
    asalProvinsi: a.asalProvinsi,
    angkatanMasuk: a.angkatanMasuk,
    ...(a.userId ? { userId: a.userId } : {}),
    ...(a.catatan ? { catatan: a.catatan } : {}),
    masihMemilikiAkun: a.masihMemilikiAkun,
    createdAt: now,
    updatedAt: now,
  };
}

function firestoreNotification(n: SeedNotification) {
  return {
    title: n.title,
    message: n.message,
    type: n.type,
    read: n.read,
    createdAt: now,
    ...(n.targetRole ? { targetRole: n.targetRole } : {}),
    ...(n.targetSantriId ? { targetSantriId: n.targetSantriId } : {}),
    ...(n.targetAsramaId ? { targetAsramaId: n.targetAsramaId } : {}),
    ...(n.targetKelas ? { targetKelas: n.targetKelas } : {}),
    ...(n.targetAngkatan !== undefined ? { targetAngkatan: n.targetAngkatan } : {}),
  };
}

async function upsertDoc(collection: string, id: string, data: Record<string, unknown>) {
  await db.collection(collection).doc(id).set(data, { merge: false });
}

async function seedCollection<T>(
  label: string,
  items: T[],
  getId: (item: T) => string,
  toDoc: (item: T) => Record<string, unknown>,
) {
  process.stdout.write(`  ${label}...`);
  let count = 0;
  for (const item of items) {
    await upsertDoc(label, getId(item), toDoc(item));
    count++;
  }
  console.log(` ${count} docs`);
}

// ================================================================
// Seed
// ================================================================

async function seedAuth() {
  console.log('\n--- Auth Users ---');
  let created = 0;
  let skipped = 0;

  for (const u of seedUsers) {
    try {
      await auth.createUser({
        uid: u.id,
        email: u.email,
        password: 'password123',
        displayName: u.name,
      });
      await auth.setCustomUserClaims(u.id, { role: u.role });
      console.log(`  [OK]   ${u.email.padEnd(35)} ${u.role}`);
      created++;
    } catch (err: any) {
      if (err.code === 'auth/uid-already-exists') {
        // Re-set claims in case they changed
        await auth.setCustomUserClaims(u.id, { role: u.role });
        console.log(`  [SKIP] ${u.email.padEnd(35)} ${u.role} (already exists)`);
        skipped++;
      } else {
        console.error(`  [FAIL] ${u.email}:`, err.message);
      }
    }
  }

  console.log(`  Result: ${created} created, ${skipped} skipped`);
}

async function seedFirestore() {
  console.log('\n--- Firestore Documents ---');

  await seedCollection('users', seedUsers, (u) => u.id, firestoreUser);
  await seedCollection('santri', seedSantri, (s) => s.id, firestoreSantri);
  await seedCollection('asrama', seedAsrama, (a) => a.id, firestoreAsrama);
  await seedCollection('kamar', seedKamar, (k) => k.id, firestoreKamar);
  await seedCollection('kelas', seedKelas, (k) => k.id, firestoreKelas);
  await seedCollection('mapel', seedMapel, (m) => m.id, firestoreMapel);
  await seedCollection('masterPelanggaran', seedMasterPelanggaran, (m) => m.id, firestoreMasterPelanggaran);
  await seedCollection('pelanggaran', seedPelanggaran, (p) => p.id, firestorePelanggaran);
  await seedCollection('hukuman', seedHukuman, (h) => h.id, firestoreHukuman);
  await seedCollection('quest', seedQuest, (q) => q.id, firestoreQuest);
  await seedCollection('alumni', seedAlumni, (a) => a.id, firestoreAlumni);
  await seedCollection('notifications', seedNotifications, (n) => n.id, firestoreNotification);
}

async function seed() {
  console.log('========================================');
  console.log('  Firestore & Auth Seeder');
  console.log('  Project: mahad-manager (emulator)');
  console.log('========================================\n');

  await seedAuth();
  await seedFirestore();

  console.log('\n========================================');
  console.log('  Seed complete!');
  console.log('========================================\n');
  process.exit(0);
}

seed().catch((err) => {
  console.error('\nSeed failed:', err);
  process.exit(1);
});
