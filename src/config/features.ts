import { FeatureFlag } from '@/types';

export const featureFlags: FeatureFlag[] = [
  { key: 'akademik', enabled: false, label: 'Modul Akademik' },
  { key: 'keuangan', enabled: false, label: 'Modul Keuangan' },
  { key: 'absensi', enabled: false, label: 'Modul Absensi' },
  { key: 'rapor', enabled: false, label: 'Modul Rapor' },
  { key: 'tahfidz', enabled: false, label: 'Modul Tahfidz' },
  { key: 'kesehatan', enabled: false, label: 'Modul Kesehatan' },
  { key: 'perpustakaan', enabled: false, label: 'Modul Perpustakaan' },
  { key: 'quest', enabled: true, label: 'Modul Quest & Pemutihan' },
  { key: 'monitoring', enabled: true, label: 'Modul Monitoring' },
  { key: 'notifikasi', enabled: true, label: 'Modul Notifikasi' },
];

export function isFeatureEnabled(key: string): boolean {
  const feature = featureFlags.find((f) => f.key === key);
  return feature?.enabled ?? false;
}
