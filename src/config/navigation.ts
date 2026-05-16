import { NavGroup, NavItem, UserRole } from '@/types';

export const navigationGroups: NavGroup[] = [
  {
    title: 'Beranda',
    icon: 'LayoutDashboard',
    items: [
      { title: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard', roles: ['admin', 'musyrif', 'wali', 'santri', 'staff', 'kepala_kesiswaan', 'guru', 'wali_kelas'] },
    ],
  },
  {
    title: 'Admin Pesantren',
    icon: 'Building2',
    items: [
      { title: 'Data Santri', href: '/dashboard/santri', icon: 'Users', roles: ['admin', 'musyrif', 'staff', 'guru', 'wali_kelas', 'kepala_kesiswaan'] },
      { title: 'Data Guru', href: '/dashboard/guru', icon: 'UsersRound', roles: ['admin', 'kepala_kesiswaan'] },
      { title: 'Data Kelas', href: '/dashboard/kelas', icon: 'School', roles: ['admin', 'kepala_kesiswaan', 'staff'] },
    ],
  },
  {
    title: 'Akademik / Kurikulum',
    icon: 'GraduationCap',
    items: [
      { title: 'Struktur Akademik', href: '/dashboard/struktur-akademik', icon: 'GraduationCap', roles: ['admin', 'kepala_kesiswaan'] },
      { title: 'Mata Pelajaran', href: '/dashboard/mapel', icon: 'Library', roles: ['admin', 'kepala_kesiswaan', 'staff'] },
      { title: 'Distribusi Guru', href: '/dashboard/distribusi-guru', icon: 'UsersRound', roles: ['admin', 'kepala_kesiswaan', 'staff'] },
    ],
  },
  {
    title: 'Kesiswaan',
    icon: 'BookOpen',
    items: [
      { title: 'Governance Review', href: '/dashboard/governance', icon: 'Gavel', roles: ['admin', 'musyrif', 'staff', 'kepala_kesiswaan', 'guru', 'wali_kelas'] },
      { title: 'Master Pelanggaran', href: '/dashboard/master-pelanggaran', icon: 'BookOpen', roles: ['admin', 'kepala_kesiswaan'] },
      { title: 'Pelanggaran', href: '/dashboard/pelanggaran', icon: 'AlertTriangle', roles: ['admin', 'musyrif', 'staff', 'kepala_kesiswaan', 'guru', 'wali_kelas'] },
      { title: 'Hukuman', href: '/dashboard/hukuman', icon: 'Gavel', roles: ['admin', 'musyrif', 'kepala_kesiswaan'] },
      { title: 'Quest & Pemutihan', href: '/dashboard/quest', icon: 'Trophy', roles: ['admin', 'musyrif', 'santri', 'wali', 'kepala_kesiswaan', 'wali_kelas'] },
      { title: 'Monitoring', href: '/dashboard/monitoring', icon: 'Activity', roles: ['admin', 'kepala_kesiswaan'] },
    ],
  },
  {
    title: 'Asrama',
    icon: 'Home',
    items: [
      { title: 'Asrama', href: '/dashboard/asrama', icon: 'Building2', roles: ['admin', 'musyrif', 'kepala_kesiswaan'] },
    ],
  },
  {
    title: 'Kesehatan',
    icon: 'Stethoscope',
    items: [
      { title: 'Kunjungan UKS', href: '/dashboard/uks', icon: 'Stethoscope', roles: ['admin', 'musyrif', 'staff', 'kepala_kesiswaan'] },
      { title: 'Izin Berobat', href: '/dashboard/uks/izin-berobat', icon: 'FileText', roles: ['admin', 'musyrif', 'staff', 'kepala_kesiswaan'] },
    ],
  },
  {
    title: 'Sistem',
    icon: 'Settings',
    items: [
      { title: 'Notifikasi', href: '/dashboard/notifikasi', icon: 'Bell', roles: ['admin', 'musyrif', 'wali', 'santri', 'staff', 'kepala_kesiswaan', 'guru', 'wali_kelas'] },
      { title: 'Import Data', href: '/dashboard/import', icon: 'Upload', roles: ['admin', 'kepala_kesiswaan'] },
      { title: 'Pengaturan', href: '/dashboard/pengaturan', icon: 'Settings', roles: ['admin', 'musyrif', 'wali', 'santri', 'staff', 'kepala_kesiswaan', 'guru', 'wali_kelas'] },
    ],
  },
];

function applyDynamicTitle(item: NavItem, role: UserRole): NavItem {
  let dynamicTitle = item.title;

  if (role === 'santri') {
    if (item.title === 'Quest & Pemutihan') dynamicTitle = 'Quest Saya';
    if (item.title === 'Pelanggaran') dynamicTitle = 'Pelanggaran Saya';
  }

  if (role === 'wali') {
    if (item.title === 'Data Santri') dynamicTitle = 'Anak Saya / Progress Anak';
  }

  if (role === 'wali_kelas') {
    if (item.title === 'Data Santri') dynamicTitle = 'Santri Kelas';
  }

  return { ...item, title: dynamicTitle };
}

export function getGroupedMenuForRole(role: UserRole): NavGroup[] {
  return navigationGroups
    .map((group) => {
      const filteredItems = group.items
        .filter((item) => item.roles.includes(role))
        .map((item) => applyDynamicTitle(item, role));

      if (filteredItems.length === 0) return null;

      return { ...group, items: filteredItems };
    })
    .filter((g): g is NavGroup => g !== null);
}

/** @deprecated use getGroupedMenuForRole for grouped sidebar */
export function getMenuForRole(role: UserRole): NavItem[] {
  return getGroupedMenuForRole(role).flatMap((g) => g.items);
}
