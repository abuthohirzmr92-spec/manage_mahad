import { Subject } from './types';

export const formalLevels: number[] = [7, 8, 9, 10, 11, 12];

export const mockMapelFormal: Subject[] = [
  // Tingkat 7
  { id: 'f1', name: 'Matematika Dasar', level: 7, code: 'MAT-07', teacherCount: 2, status: 'active' },
  { id: 'f2', name: 'Bahasa Indonesia', level: 7, code: 'BIN-07', teacherCount: 3, status: 'active' },
  { id: 'f3', name: 'Pendidikan Agama Islam', level: 7, code: 'PAI-07', teacherCount: 2, status: 'active' },
  { id: 'f4', name: 'Bahasa Inggris', level: 7, code: 'ENG-07', teacherCount: 2, status: 'active' },
  { id: 'f5', name: 'Ilmu Pengetahuan Alam', level: 7, code: 'IPA-07', teacherCount: 2, status: 'active' },
  { id: 'f6', name: 'Ilmu Pengetahuan Sosial', level: 7, code: 'IPS-07', teacherCount: 2, status: 'active' },
  { id: 'f7', name: 'Pendidikan Kewarganegaraan', level: 7, code: 'PKN-07', teacherCount: 1, status: 'active' },
  { id: 'f8', name: 'Seni Budaya', level: 7, code: 'SBD-07', teacherCount: 1, status: 'active' },
  // Tingkat 8
  { id: 'f9', name: 'Matematika Terapan', level: 8, code: 'MAT-08', teacherCount: 2, status: 'active' },
  { id: 'f10', name: 'Fisika Dasar', level: 8, code: 'FIS-08', teacherCount: 2, status: 'active' },
  { id: 'f11', name: 'Biologi Dasar', level: 8, code: 'BIO-08', teacherCount: 2, status: 'active' },
  { id: 'f12', name: 'Bahasa Arab', level: 8, code: 'ARB-08', teacherCount: 3, status: 'active' },
  { id: 'f13', name: 'Sejarah Kebudayaan Islam', level: 8, code: 'SKI-08', teacherCount: 1, status: 'active' },
  { id: 'f14', name: 'Akidah Akhlak', level: 8, code: 'AKD-08', teacherCount: 2, status: 'active' },
  { id: 'f15', name: 'Fiqih Ibadah', level: 8, code: 'FQH-08', teacherCount: 2, status: 'active' },
  // Tingkat 9
  { id: 'f16', name: 'Matematika Lanjut', level: 9, code: 'MAT-09', teacherCount: 2, status: 'active' },
  { id: 'f17', name: 'Bahasa Inggris Lanjut', level: 9, code: 'ENG-09', teacherCount: 2, status: 'active' },
  { id: 'f18', name: 'Prakarya & Kewirausahaan', level: 9, code: 'PRK-09', teacherCount: 1, status: 'active' },
  { id: 'f19', name: 'Pendidikan Jasmani', level: 9, code: 'PJK-09', teacherCount: 2, status: 'active' },
  { id: 'f20', name: 'Teknologi Informasi', level: 9, code: 'TIK-09', teacherCount: 1, status: 'active' },
  // Tingkat 10
  { id: 'f21', name: 'Fisika Lanjutan', level: 10, code: 'FIS-10', teacherCount: 1, status: 'active' },
  { id: 'f22', name: 'Kimia Dasar', level: 10, code: 'KIM-10', teacherCount: 1, status: 'active' },
  { id: 'f23', name: 'Biologi Anatomi', level: 10, code: 'BIO-10', teacherCount: 1, status: 'active' },
  { id: 'f24', name: 'Geografi', level: 10, code: 'GEO-10', teacherCount: 1, status: 'active' },
  { id: 'f25', name: 'Sosiologi', level: 10, code: 'SOS-10', teacherCount: 1, status: 'active' },
  // Tingkat 11
  { id: 'f26', name: 'Sejarah Indonesia', level: 11, code: 'SEJ-11', teacherCount: 1, status: 'active' },
  { id: 'f27', name: 'Ekonomi Mikro', level: 11, code: 'EKO-11', teacherCount: 1, status: 'active' },
  { id: 'f28', name: 'Bahasa Jerman', level: 11, code: 'JER-11', teacherCount: 1, status: 'active' },
  // Tingkat 12
  { id: 'f29', name: 'Kimia Lanjutan', level: 12, code: 'KIM-12', teacherCount: 1, status: 'active' },
  { id: 'f30', name: 'Persiapan UTBK Mat', level: 12, code: 'UTB-12', teacherCount: 2, status: 'active' },
];
