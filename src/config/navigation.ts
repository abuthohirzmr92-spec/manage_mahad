import { NavItem, UserRole } from '@/types';

export const navigationItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard', roles: ['admin', 'musyrif', 'wali', 'santri', 'staff', 'kepala_kesiswaan', 'guru', 'wali_kelas'] },
  { title: 'Data Santri', href: '/dashboard/santri', icon: 'Users', roles: ['admin', 'musyrif', 'staff', 'guru', 'wali_kelas', 'kepala_kesiswaan'] },
  { title: 'Struktur Akademik', href: '/dashboard/struktur-akademik', icon: 'GraduationCap', roles: ['admin', 'kepala_kesiswaan'] },
  { title: 'Data Kelas', href: '/dashboard/kelas', icon: 'School', roles: ['admin', 'kepala_kesiswaan', 'staff'] },
  { title: 'Mata Pelajaran', href: '/dashboard/mapel', icon: 'Library', roles: ['admin', 'kepala_kesiswaan', 'staff'] },
  { title: 'Distribusi Guru', href: '/dashboard/distribusi-guru', icon: 'UsersRound', roles: ['admin', 'kepala_kesiswaan', 'staff'] },
  { title: 'Asrama', href: '/dashboard/asrama', icon: 'Building2', roles: ['admin', 'musyrif', 'kepala_kesiswaan'] },
  { title: 'Master Pelanggaran', href: '/dashboard/master-pelanggaran', icon: 'BookOpen', roles: ['admin', 'kepala_kesiswaan'] },
  { title: 'Pelanggaran', href: '/dashboard/pelanggaran', icon: 'AlertTriangle', roles: ['admin', 'musyrif', 'staff', 'kepala_kesiswaan', 'guru', 'wali_kelas'] },
  { title: 'Hukuman', href: '/dashboard/hukuman', icon: 'Gavel', roles: ['admin', 'musyrif', 'kepala_kesiswaan'] },
  { title: 'Quest & Pemutihan', href: '/dashboard/quest', icon: 'Trophy', roles: ['admin', 'musyrif', 'santri', 'wali', 'kepala_kesiswaan', 'wali_kelas'] },
  { title: 'Monitoring', href: '/dashboard/monitoring', icon: 'Activity', roles: ['admin', 'kepala_kesiswaan'] },
  { title: 'Notifikasi', href: '/dashboard/notifikasi', icon: 'Bell', roles: ['admin', 'musyrif', 'wali', 'santri', 'staff', 'kepala_kesiswaan', 'guru', 'wali_kelas'] },
  { title: 'Pengaturan', href: '/dashboard/pengaturan', icon: 'Settings', roles: ['admin', 'musyrif', 'wali', 'santri', 'staff', 'kepala_kesiswaan', 'guru', 'wali_kelas'] },
];

export function getMenuForRole(role: UserRole): NavItem[] {
  return navigationItems
    .filter((item) => item.roles.includes(role))
    .map((item) => {
      let dynamicTitle = item.title;
      
      // Dynamic titles for Santri
      if (role === 'santri') {
        if (item.title === 'Quest & Pemutihan') dynamicTitle = 'Quest Saya';
        if (item.title === 'Pelanggaran') dynamicTitle = 'Pelanggaran Saya';
      }
      
      // Dynamic titles for Wali
      if (role === 'wali') {
        if (item.title === 'Data Santri') dynamicTitle = 'Anak Saya / Progress Anak';
      }
      
      // Dynamic titles for Wali Kelas
      if (role === 'wali_kelas') {
        if (item.title === 'Data Santri') dynamicTitle = 'Santri Kelas';
      }

      return { ...item, title: dynamicTitle };
    });
}
