export * from './types';
export * from './formal';
export * from './diniyah';
export * from './quran';
export * from './kelas';

import type { AcademicTab } from './types';

/** Map a jenjang to its parent academic tab. */
export function jenjangToTab(jenjang: string): AcademicTab | null {
  switch (jenjang) {
    case 'MTs':
    case 'MA':
      return 'formal';
    case 'Tamhidi':
    case "Ibtida'i":
    case 'Tsanawiyah':
      return 'diniyah';
    case 'Tahsin':
    case 'Tahfidz':
      return 'quran';
    default:
      return null;
  }
}

/** Ordered jenjang list per academic tab (for grouping display). */
export const JENJANG_BY_TAB: Record<AcademicTab, readonly string[]> = {
  formal: ['MTs', 'MA'],
  diniyah: ['Tamhidi', "Ibtida'i", 'Tsanawiyah'],
  quran: ['Tahsin', 'Tahfidz'],
} as const;
