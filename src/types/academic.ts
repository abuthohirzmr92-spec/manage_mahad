// ========================================
// Academic Types (decoupled from mock data)
// ========================================

export interface Mapel {
  id: string;
  name: string;
  /** System progression index — internal key for matching, filtering, governance logic */
  tingkat: number;
  /** User-facing academic label: "Kelas 4", "1 Tsanawiyah" */
  tingkatLabel?: string;
  /** Academic phase: MTs, MA, Ibtida'i, Tsanawiyah, Tahsin, Tahfidz, Tamhidi */
  jenjang: string;
  code?: string;
  status: 'active' | 'inactive';
}

export interface Kelas {
  id: string;
  name: string;
  jenjang: string;
  tingkat: number;
  tingkatLabel?: string;
  waliKelas: string;
  studentCount: number;
  status: 'aktif' | 'nonaktif';
}

export interface TingkatGroup {
  tingkat: number;
  classes: Kelas[];
}

export interface JenjangGroup {
  jenjang: string;
  tingkatGroups: TingkatGroup[];
}
