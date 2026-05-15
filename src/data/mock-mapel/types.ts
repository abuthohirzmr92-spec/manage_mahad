export type AcademicTab = 'formal' | 'diniyah' | 'quran';

export interface Subject {
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

export interface ClassData {
  tingkat: number;
  name: string;
}

export interface ClassCluster {
  tingkat: number;
  jenjang: string;
  classNames: string;
  subjects: Subject[];
}
