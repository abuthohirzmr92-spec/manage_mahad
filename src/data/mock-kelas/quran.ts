import { Kelas } from './types';

export const mockKelasQuran: Kelas[] = [
  { id: 'q1', name: 'Halaqah Utsman', level: 'Tahsin Dasar', waliKelas: 'Ust. Furqon', studentCount: 15, status: 'aktif' },
  { id: 'q2', name: 'Halaqah Ali', level: 'Tahsin Dasar', waliKelas: 'Ust. Yusuf', studentCount: 12, status: 'aktif' },
  { id: 'q3', name: 'Halaqah Zaid', level: 'Tahsin Lanjutan', waliKelas: 'Ust. Ibrahim', studentCount: 10, status: 'aktif' },
  { id: 'q4', name: 'Tahfidz Khusus (Juz 30)', level: 'Tahfidz Pemula', waliKelas: 'Ust. Naufal', studentCount: 8, status: 'aktif' },
  { id: 'q5', name: 'Takhassus 30 Juz', level: 'Khotmil Quran', waliKelas: 'Ust. Syekh', studentCount: 5, status: 'aktif' },
];

export const quranLevelsInitial: string[] = Array.from(
  new Set(mockKelasQuran.map(c => c.level as string))
).sort((a, b) => a.localeCompare(b, 'id', { numeric: true }));
