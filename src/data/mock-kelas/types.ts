export type AcademicTab = 'formal' | 'diniyah' | 'quran';

export interface Kelas {
  id: string;
  name: string;
  level: string | number;
  waliKelas: string;
  studentCount: number;
  status: 'aktif' | 'nonaktif';
}

export interface GroupedKelas {
  level: string | number;
  classes: Kelas[];
}
