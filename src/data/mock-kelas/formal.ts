import { Kelas } from './types';

export const mockKelasFormal: Kelas[] = [
  { id: 'c1', name: '7 Abu Bakar', level: 7, waliKelas: 'Ust. Ahmad Zain', studentCount: 32, status: 'aktif' },
  { id: 'c2', name: '7 Umar', level: 7, waliKelas: 'Ust. Budi Santoso', studentCount: 30, status: 'aktif' },
  { id: 'c3', name: '8 Utsman', level: 8, waliKelas: 'Ust. Ali Riza', studentCount: 28, status: 'aktif' },
  { id: 'c4', name: '9 Ali', level: 9, waliKelas: 'Ust. Hamzah', studentCount: 31, status: 'aktif' },
  { id: 'c5', name: '10 IPA 1', level: 10, waliKelas: 'Ust. Fikri', studentCount: 35, status: 'aktif' },
  { id: 'c6', name: '11 Agama', level: 11, waliKelas: 'Ust. Rahman', studentCount: 25, status: 'aktif' },
  { id: 'c7', name: '12 IPA', level: 12, waliKelas: 'Ust. Zaid', studentCount: 30, status: 'aktif' },
];

export const formalLevelsInitial: number[] = Array.from(
  new Set(mockKelasFormal.map(c => c.level as number))
).sort((a, b) => a - b);
