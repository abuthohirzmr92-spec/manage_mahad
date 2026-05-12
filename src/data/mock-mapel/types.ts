export type AcademicTab = 'formal' | 'diniyah' | 'quran';

export interface Subject {
  id: string;
  name: string;
  level: string | number;
  code: string;
  teacherCount: number;
  status: 'active' | 'inactive' | string;
}

export interface ClassData {
  level: string | number;
  name: string;
}

export interface ClassCluster {
  level: string | number;
  classNames: string;
  subjects: Subject[];
}
