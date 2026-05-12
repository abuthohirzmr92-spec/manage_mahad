import { Subject } from './types';

export const quranLevels: string[] = ['Tahsin Dasar', 'Tahsin Lanjutan', 'Tahfidz Pemula', 'Tahfidz Menengah', 'Khotmil Quran'];

export const mockMapelQuran: Subject[] = [
  // Tahsin Dasar
  { id: 'q1', name: 'Tahsin Qiroati Jilid 1-2', level: 'Tahsin Dasar', code: 'QRT-D1', teacherCount: 5, status: 'active' },
  { id: 'q2', name: 'Tahsin Qiroati Jilid 3-4', level: 'Tahsin Dasar', code: 'QRT-D2', teacherCount: 5, status: 'active' },
  { id: 'q3', name: 'Makharijul Huruf Dasar', level: 'Tahsin Dasar', code: 'MKH-D1', teacherCount: 3, status: 'active' },
  // Tahsin Lanjutan
  { id: 'q4', name: 'Tahsin Qiroati Jilid 5-6', level: 'Tahsin Lanjutan', code: 'QRT-LNJ', teacherCount: 3, status: 'active' },
  { id: 'q5', name: 'Ghorib Musykilat', level: 'Tahsin Lanjutan', code: 'GRB-LNJ', teacherCount: 2, status: 'active' },
  { id: 'q6', name: 'Tajwid Praktek', level: 'Tahsin Lanjutan', code: 'TJW-LNJ', teacherCount: 3, status: 'active' },
  // Tahfidz Pemula
  { id: 'q7', name: 'Tahfidz Juz 30', level: 'Tahfidz Pemula', code: 'THZ-30', teacherCount: 4, status: 'active' },
  { id: 'q8', name: 'Setoran Ziyadah Harian', level: 'Tahfidz Pemula', code: 'ZYD-PML', teacherCount: 4, status: 'active' },
  { id: 'q9', name: 'Murojaah Binnadhar', level: 'Tahfidz Pemula', code: 'MRJ-BND', teacherCount: 2, status: 'active' },
  // Tahfidz Menengah
  { id: 'q10', name: 'Tahfidz Juz 1-5', level: 'Tahfidz Menengah', code: 'THZ-15', teacherCount: 3, status: 'active' },
  { id: 'q11', name: 'Setoran Ziyadah Mingguan', level: 'Tahfidz Menengah', code: 'ZYD-MNG', teacherCount: 3, status: 'active' },
  { id: 'q12', name: 'Murojaah Bil Ghoib', level: 'Tahfidz Menengah', code: 'MRJ-BGB', teacherCount: 2, status: 'active' },
  // Khotmil Quran
  { id: 'q13', name: 'Murajaah Kubro', level: 'Khotmil Quran', code: 'MRJ-KBR', teacherCount: 2, status: 'active' },
  { id: 'q14', name: 'Persiapan Ujian Khotmil', level: 'Khotmil Quran', code: 'UJN-KTM', teacherCount: 2, status: 'active' },
  { id: 'q15', name: 'Talaqqi Bersanad', level: 'Khotmil Quran', code: 'TLQ-SND', teacherCount: 1, status: 'active' },
];
