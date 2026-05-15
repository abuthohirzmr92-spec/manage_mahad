import { Subject, ClassData } from './types';

export const mockMapelFormal: Subject[] = [
  // ── MTs: tingkat 8, 9, 10 ──────────────────────────────────────────────
  // Tingkat 8 (MTs tahun 1, ex-"kelas 7")
  { id: 'f1', name: 'Matematika Dasar', tingkat: 8, jenjang: 'MTs', code: 'MAT-07', status: 'active' },
  { id: 'f2', name: 'Bahasa Indonesia', tingkat: 8, jenjang: 'MTs', code: 'BIN-07', status: 'active' },
  { id: 'f3', name: 'Pendidikan Agama Islam', tingkat: 8, jenjang: 'MTs', code: 'PAI-07', status: 'active' },
  { id: 'f4', name: 'Bahasa Inggris', tingkat: 8, jenjang: 'MTs', code: 'ENG-07', status: 'active' },
  { id: 'f5', name: 'Ilmu Pengetahuan Alam', tingkat: 8, jenjang: 'MTs', code: 'IPA-07', status: 'active' },
  { id: 'f6', name: 'Ilmu Pengetahuan Sosial', tingkat: 8, jenjang: 'MTs', code: 'IPS-07', status: 'active' },
  { id: 'f7', name: 'Pendidikan Kewarganegaraan', tingkat: 8, jenjang: 'MTs', code: 'PKN-07', status: 'active' },
  { id: 'f8', name: 'Seni Budaya', tingkat: 8, jenjang: 'MTs', code: 'SBD-07', status: 'active' },
  // Tingkat 9 (MTs tahun 2, ex-"kelas 8")
  { id: 'f9', name: 'Matematika Terapan', tingkat: 9, jenjang: 'MTs', code: 'MAT-08', status: 'active' },
  { id: 'f10', name: 'Fisika Dasar', tingkat: 9, jenjang: 'MTs', code: 'FIS-08', status: 'active' },
  { id: 'f11', name: 'Biologi Dasar', tingkat: 9, jenjang: 'MTs', code: 'BIO-08', status: 'active' },
  { id: 'f12', name: 'Bahasa Arab', tingkat: 9, jenjang: 'MTs', code: 'ARB-08', status: 'active' },
  { id: 'f13', name: 'Sejarah Kebudayaan Islam', tingkat: 9, jenjang: 'MTs', code: 'SKI-08', status: 'active' },
  { id: 'f14', name: 'Akidah Akhlak', tingkat: 9, jenjang: 'MTs', code: 'AKD-08', status: 'active' },
  { id: 'f15', name: 'Fiqih Ibadah', tingkat: 9, jenjang: 'MTs', code: 'FQH-08', status: 'active' },
  // Tingkat 10 (MTs tahun 3, ex-"kelas 9")
  { id: 'f16', name: 'Matematika Lanjut', tingkat: 10, jenjang: 'MTs', code: 'MAT-09', status: 'active' },
  { id: 'f17', name: 'Bahasa Inggris Lanjut', tingkat: 10, jenjang: 'MTs', code: 'ENG-09', status: 'active' },
  { id: 'f18', name: 'Prakarya & Kewirausahaan', tingkat: 10, jenjang: 'MTs', code: 'PRK-09', status: 'active' },
  { id: 'f19', name: 'Pendidikan Jasmani', tingkat: 10, jenjang: 'MTs', code: 'PJK-09', status: 'active' },
  { id: 'f20', name: 'Teknologi Informasi', tingkat: 10, jenjang: 'MTs', code: 'TIK-09', status: 'active' },

  // ── MA: tingkat 11, 12, 13 ─────────────────────────────────────────────
  // Tingkat 11 (MA tahun 1, ex-"kelas 10")
  { id: 'f21', name: 'Fisika Lanjutan', tingkat: 11, jenjang: 'MA', code: 'FIS-10', status: 'active' },
  { id: 'f22', name: 'Kimia Dasar', tingkat: 11, jenjang: 'MA', code: 'KIM-10', status: 'active' },
  { id: 'f23', name: 'Biologi Anatomi', tingkat: 11, jenjang: 'MA', code: 'BIO-10', status: 'active' },
  { id: 'f24', name: 'Geografi', tingkat: 11, jenjang: 'MA', code: 'GEO-10', status: 'active' },
  { id: 'f25', name: 'Sosiologi', tingkat: 11, jenjang: 'MA', code: 'SOS-10', status: 'active' },
  // Tingkat 12 (MA tahun 2, ex-"kelas 11")
  { id: 'f26', name: 'Sejarah Indonesia', tingkat: 12, jenjang: 'MA', code: 'SEJ-11', status: 'active' },
  { id: 'f27', name: 'Ekonomi Mikro', tingkat: 12, jenjang: 'MA', code: 'EKO-11', status: 'active' },
  { id: 'f28', name: 'Bahasa Jerman', tingkat: 12, jenjang: 'MA', code: 'JER-11', status: 'active' },
  // Tingkat 13 (MA tahun 3, ex-"kelas 12")
  { id: 'f29', name: 'Kimia Lanjutan', tingkat: 13, jenjang: 'MA', code: 'KIM-12', status: 'active' },
  { id: 'f30', name: 'Persiapan UTBK Mat', tingkat: 13, jenjang: 'MA', code: 'UTB-12', status: 'active' },
];
