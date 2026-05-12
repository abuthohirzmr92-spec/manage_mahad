import { Kelas } from './types';

export const mockKelasDiniyah: Kelas[] = [
  { id: 'd1', name: "4A Ibtida'i", level: "Kelas 4 Ibtida'i", waliKelas: 'Ust. Abdul', studentCount: 40, status: 'aktif' },
  { id: 'd2', name: "4B Ibtida'i", level: "Kelas 4 Ibtida'i", waliKelas: 'Ust. Hakim', studentCount: 38, status: 'aktif' },
  { id: 'd3', name: "5A Ibtida'i", level: "Kelas 5 Ibtida'i", waliKelas: 'Ust. Malik', studentCount: 45, status: 'aktif' },
  { id: 'd4', name: "6A Ibtida'i", level: "Kelas 6 Ibtida'i", waliKelas: 'Ust. Hasan', studentCount: 42, status: 'aktif' },
  { id: 'd5', name: "7A Tsanawiyah", level: "Kelas 7 Tsanawiyah", waliKelas: 'Ust. Yahya', studentCount: 20, status: 'aktif' },
];

export const diniyahLevelsInitial: string[] = Array.from(
  new Set(mockKelasDiniyah.map(c => c.level as string))
).sort((a, b) => a.localeCompare(b, 'id', { numeric: true }));
