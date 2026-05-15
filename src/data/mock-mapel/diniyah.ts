import { Subject, ClassData } from './types';

export const mockMapelDiniyah: Subject[] = [
  // ── Tamhidi: tingkat 1 ──────────────────────────────────────────────────
  { id: 'd0', name: 'Pengenalan Huruf Hijaiyah', tingkat: 1, jenjang: 'Tamhidi', code: 'HJR-01', status: 'active' },
  { id: 'd0b', name: 'Aqidah Dasar', tingkat: 1, jenjang: 'Tamhidi', code: 'AQD-01', status: 'active' },
  { id: 'd0c', name: 'Akhlak Sehari-hari', tingkat: 1, jenjang: 'Tamhidi', code: 'AKH-01', status: 'active' },

  // ── Ibtida'i: tingkat 2, 3, 4 ───────────────────────────────────────────
  // Tingkat 2 (Ibtida'i tahun 1, ex-"Kelas 4 Ibtida'i")
  { id: 'd1', name: 'Nahwu Jurumiyyah', tingkat: 2, jenjang: "Ibtida'i", code: 'NHW-04', status: 'active' },
  { id: 'd2', name: 'Fiqih Safinah', tingkat: 2, jenjang: "Ibtida'i", code: 'FQH-04', status: 'active' },
  { id: 'd3', name: 'Tauhid Aqidatul Awam', tingkat: 2, jenjang: "Ibtida'i", code: 'THD-04', status: 'active' },
  { id: 'd4', name: 'Akhlaq Taisirul Khollaq', tingkat: 2, jenjang: "Ibtida'i", code: 'AKH-04', status: 'active' },
  { id: 'd5', name: 'Hadits Arbain', tingkat: 2, jenjang: "Ibtida'i", code: 'HDS-04', status: 'active' },
  { id: 'd6', name: 'Tajwid Hidayatussibyan', tingkat: 2, jenjang: "Ibtida'i", code: 'TJW-04', status: 'active' },
  // Tingkat 3 (Ibtida'i tahun 2, ex-"Kelas 5 Ibtida'i")
  { id: 'd7', name: 'Akhlaq Lil Banin', tingkat: 3, jenjang: "Ibtida'i", code: 'AKH-05', status: 'active' },
  { id: 'd8', name: 'Shorof Amtsilah', tingkat: 3, jenjang: "Ibtida'i", code: 'SRF-05', status: 'active' },
  { id: 'd9', name: 'Fiqih Mabadi', tingkat: 3, jenjang: "Ibtida'i", code: 'FQH-05', status: 'active' },
  { id: 'd10', name: 'Tarikh Khulafaur Rasyidin', tingkat: 3, jenjang: "Ibtida'i", code: 'TRK-05', status: 'active' },
  { id: 'd11', name: 'Nahwu Imriti', tingkat: 3, jenjang: "Ibtida'i", code: 'NHW-05', status: 'active' },
  // Tingkat 4 (Ibtida'i tahun 3, ex-"Kelas 6 Ibtida'i")
  { id: 'd12', name: 'Fiqih Taqrib', tingkat: 4, jenjang: "Ibtida'i", code: 'FQH-06', status: 'active' },
  { id: 'd13', name: 'Shorof Kailani', tingkat: 4, jenjang: "Ibtida'i", code: 'SRF-06', status: 'active' },
  { id: 'd14', name: 'Ilmu Hadits Minhatul Mughits', tingkat: 4, jenjang: "Ibtida'i", code: 'IHD-06', status: 'active' },
  { id: 'd15', name: 'Tarikh Nurul Yaqin', tingkat: 4, jenjang: "Ibtida'i", code: 'TRK-06', status: 'active' },

  // ── Tsanawiyah: tingkat 5, 6, 7 ─────────────────────────────────────────
  // Tingkat 5 (Tsanawiyah tahun 1, ex-"Kelas 7 Tsanawiyah")
  { id: 'd16', name: 'Tafsir Jalalain', tingkat: 5, jenjang: 'Tsanawiyah', code: 'TFS-07', status: 'active' },
  { id: 'd17', name: 'Balaghoh', tingkat: 5, jenjang: 'Tsanawiyah', code: 'BLG-07', status: 'active' },
  { id: 'd18', name: 'Nahwu Alfiyah Ibnu Malik', tingkat: 5, jenjang: 'Tsanawiyah', code: 'NHW-07', status: 'active' },
  { id: 'd19', name: 'Ushul Fiqh Al-Waraqat', tingkat: 5, jenjang: 'Tsanawiyah', code: 'UQF-07', status: 'active' },
  // Tingkat 6 (Tsanawiyah tahun 2)
  { id: 'd20', name: 'Hadits Bulughul Maram', tingkat: 6, jenjang: 'Tsanawiyah', code: 'HDT-08', status: 'active' },
  { id: 'd21', name: 'Mantiq Dasar', tingkat: 6, jenjang: 'Tsanawiyah', code: 'MTQ-08', status: 'active' },
  // Tingkat 7 (Tsanawiyah tahun 3)
  { id: 'd22', name: 'Tafsir Ayat Ahkam', tingkat: 7, jenjang: 'Tsanawiyah', code: 'TAF-09', status: 'active' },
  { id: 'd23', name: 'Faroidh', tingkat: 7, jenjang: 'Tsanawiyah', code: 'FRD-09', status: 'active' },
];
