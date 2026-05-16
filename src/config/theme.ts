import type { UserRole } from '@/types';

export const roleLabels: Record<UserRole, string> = {
  admin: 'Administrator',
  musyrif: 'Musyrif',
  wali: 'Wali Santri',
  santri: 'Santri',
  guru: 'Guru',
  staff: 'Staff',
  wali_kelas: 'Wali Kelas',
  kepala_kesiswaan: 'Kepala Kesiswaan',
  alumni: 'Alumni',
};

export const roleColors: Record<UserRole, string> = {
  admin: 'bg-red-500/10 text-red-700 dark:text-red-400',
  musyrif: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  wali: 'bg-green-500/10 text-green-700 dark:text-green-400',
  santri: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  guru: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',
  staff: 'bg-slate-500/10 text-slate-700 dark:text-slate-400',
  wali_kelas: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400',
  kepala_kesiswaan: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
  alumni: 'bg-zinc-500/10 text-zinc-700 dark:text-zinc-400',
};
