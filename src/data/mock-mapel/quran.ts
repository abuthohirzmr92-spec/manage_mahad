import { Subject, ClassData } from './types';

export const mockMapelQuran: Subject[] = [
  // ── Tahsin: tingkat 14, 15 ──────────────────────────────────────────────
  // Tingkat 14 (Tahsin tahun 1)
  { id: 'q1', name: 'Tahsin Qiroati Jilid 1-2', tingkat: 14, jenjang: 'Tahsin', code: 'QRT-D1', status: 'active' },
  { id: 'q2', name: 'Tahsin Qiroati Jilid 3-4', tingkat: 14, jenjang: 'Tahsin', code: 'QRT-D2', status: 'active' },
  { id: 'q3', name: 'Makharijul Huruf Dasar', tingkat: 14, jenjang: 'Tahsin', code: 'MKH-D1', status: 'active' },
  // Tingkat 15 (Tahsin tahun 2)
  { id: 'q4', name: 'Tahsin Qiroati Jilid 5-6', tingkat: 15, jenjang: 'Tahsin', code: 'QRT-LNJ', status: 'active' },
  { id: 'q5', name: 'Ghorib Musykilat', tingkat: 15, jenjang: 'Tahsin', code: 'GRB-LNJ', status: 'active' },
  { id: 'q6', name: 'Tajwid Praktek', tingkat: 15, jenjang: 'Tahsin', code: 'TJW-LNJ', status: 'active' },

  // ── Tahfidz: tingkat 16, 17 ─────────────────────────────────────────────
  // Tingkat 16 (Tahfidz tahun 1)
  { id: 'q7', name: 'Tahfidz Juz 30', tingkat: 16, jenjang: 'Tahfidz', code: 'THZ-30', status: 'active' },
  { id: 'q8', name: 'Setoran Ziyadah Harian', tingkat: 16, jenjang: 'Tahfidz', code: 'ZYD-PML', status: 'active' },
  { id: 'q9', name: 'Murojaah Binnadhar', tingkat: 16, jenjang: 'Tahfidz', code: 'MRJ-BND', status: 'active' },
  { id: 'q10', name: 'Tahfidz Juz 1-5', tingkat: 16, jenjang: 'Tahfidz', code: 'THZ-15', status: 'active' },
  { id: 'q11', name: 'Setoran Ziyadah Mingguan', tingkat: 16, jenjang: 'Tahfidz', code: 'ZYD-MNG', status: 'active' },
  { id: 'q12', name: 'Murojaah Bil Ghoib', tingkat: 16, jenjang: 'Tahfidz', code: 'MRJ-BGB', status: 'active' },
  // Tingkat 17 (Tahfidz tahun 2 — Khotmil)
  { id: 'q13', name: 'Murajaah Kubro', tingkat: 17, jenjang: 'Tahfidz', code: 'MRJ-KBR', status: 'active' },
  { id: 'q14', name: 'Persiapan Ujian Khotmil', tingkat: 17, jenjang: 'Tahfidz', code: 'UJN-KTM', status: 'active' },
  { id: 'q15', name: 'Talaqqi Bersanad', tingkat: 17, jenjang: 'Tahfidz', code: 'TLQ-SND', status: 'active' },
];
