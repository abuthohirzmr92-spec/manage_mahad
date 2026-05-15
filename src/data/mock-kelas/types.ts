export type AcademicTab = 'formal' | 'diniyah' | 'quran';

export interface Kelas {
  id: string;
  name: string;         // Display identity: "5A", "Halaqah Utsman"
  jenjang: string;      // Academic phase: "Ibtida'i", "MTs", "Tahsin"
  tingkat: number;      // Progression index — system key for promotion & policy logic
  tingkatLabel?: string; // User-facing academic label: "Kelas 4", "1 Tsanawiyah"
  waliKelas: string;
  studentCount: number; // Informational; derived from santri assignments
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

// Canonical jenjang order per academic program — drives grouping and form selectors
export const JENJANG_CONFIG: Record<AcademicTab, readonly string[]> = {
  formal:  ['MTs', 'MA'],
  diniyah: ['Tamhidi', "Ibtida'i", 'Tsanawiyah'],
  quran:   ['Tahsin', 'Tahfidz'],
} as const;
