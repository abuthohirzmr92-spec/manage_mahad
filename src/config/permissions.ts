import type { UserRole } from '@/types';

// ─── Permission Constants ───────────────────────────────────────────
export const Permission = {
  // Dashboard
  VIEW_DASHBOARD: 'view_dashboard',

  // Santri
  VIEW_SANTRI: 'view_santri',
  MANAGE_SANTRI: 'manage_santri',
  VIEW_OWN_DATA: 'view_own_data',

  // Guru
  VIEW_GURU: 'view_guru',
  MANAGE_GURU: 'manage_guru',

  // Kelas
  VIEW_KELAS: 'view_kelas',
  MANAGE_KELAS: 'manage_kelas',

  // Akademik
  VIEW_STRUKTUR_AKADEMIK: 'view_struktur_akademik',
  MANAGE_STRUKTUR_AKADEMIK: 'manage_struktur_akademik',
  VIEW_MAPEL: 'view_mapel',
  MANAGE_MAPEL: 'manage_mapel',
  VIEW_DISTRIBUSI_GURU: 'view_distribusi_guru',
  MANAGE_DISTRIBUSI_GURU: 'manage_distribusi_guru',

  // Pelanggaran
  VIEW_PELANGGARAN: 'view_pelanggaran',
  REPORT_PELANGGARAN: 'report_pelanggaran',
  MANAGE_PELANGGARAN: 'manage_pelanggaran',
  VIEW_OWN_PELANGGARAN: 'view_own_pelanggaran',

  // Governance
  VIEW_GOVERNANCE: 'view_governance',
  MANAGE_GOVERNANCE: 'manage_governance',

  // Master Pelanggaran
  VIEW_MASTER_PELANGGARAN: 'view_master_pelanggaran',
  MANAGE_MASTER_PELANGGARAN: 'manage_master_pelanggaran',

  // Hukuman
  VIEW_HUKUMAN: 'view_hukuman',
  MANAGE_HUKUMAN: 'manage_hukuman',

  // Quest
  VIEW_QUEST: 'view_quest',
  MANAGE_QUEST: 'manage_quest',
  APPROVE_QUEST: 'approve_quest',
  CLAIM_QUEST: 'claim_quest',

  // Asrama
  VIEW_ASRAMA: 'view_asrama',
  MANAGE_ASRAMA: 'manage_asrama',

  // Monitoring
  VIEW_MONITORING: 'view_monitoring',

  // Kesehatan
  VIEW_UKS: 'view_uks',
  MANAGE_UKS: 'manage_uks',
  VIEW_IZIN_BEROBAT: 'view_izin_berobat',
  MANAGE_IZIN_BEROBAT: 'manage_izin_berobat',

  // Notifikasi
  VIEW_NOTIFIKASI: 'view_notifikasi',
  MANAGE_NOTIFIKASI: 'manage_notifikasi',

  // Import
  VIEW_IMPORT: 'view_import',
  MANAGE_IMPORT: 'manage_import',

  // Pengaturan
  VIEW_PENGATURAN: 'view_pengaturan',
  MANAGE_PENGATURAN: 'manage_pengaturan',
} as const;

export type PermissionType = (typeof Permission)[keyof typeof Permission];

// ─── Role → Permission Mapping ─────────────────────────────────────
export const ROLE_PERMISSIONS: Record<UserRole, Set<PermissionType>> = {
  admin: new Set(Object.values(Permission)),

  kepala_kesiswaan: new Set([
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_SANTRI,
    Permission.VIEW_GURU,
    Permission.MANAGE_GURU,
    Permission.VIEW_KELAS,
    Permission.MANAGE_KELAS,
    Permission.VIEW_STRUKTUR_AKADEMIK,
    Permission.MANAGE_STRUKTUR_AKADEMIK,
    Permission.VIEW_MAPEL,
    Permission.MANAGE_MAPEL,
    Permission.VIEW_DISTRIBUSI_GURU,
    Permission.MANAGE_DISTRIBUSI_GURU,
    Permission.VIEW_PELANGGARAN,
    Permission.REPORT_PELANGGARAN,
    Permission.MANAGE_PELANGGARAN,
    Permission.VIEW_GOVERNANCE,
    Permission.MANAGE_GOVERNANCE,
    Permission.VIEW_MASTER_PELANGGARAN,
    Permission.MANAGE_MASTER_PELANGGARAN,
    Permission.VIEW_HUKUMAN,
    Permission.MANAGE_HUKUMAN,
    Permission.VIEW_QUEST,
    Permission.MANAGE_QUEST,
    Permission.APPROVE_QUEST,
    Permission.VIEW_ASRAMA,
    Permission.MANAGE_ASRAMA,
    Permission.VIEW_MONITORING,
    Permission.VIEW_UKS,
    Permission.MANAGE_UKS,
    Permission.VIEW_IZIN_BEROBAT,
    Permission.MANAGE_IZIN_BEROBAT,
    Permission.VIEW_NOTIFIKASI,
    Permission.VIEW_IMPORT,
    Permission.MANAGE_IMPORT,
    Permission.VIEW_PENGATURAN,
  ]),

  musyrif: new Set([
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_SANTRI,
    Permission.VIEW_PELANGGARAN,
    Permission.REPORT_PELANGGARAN,
    Permission.VIEW_GOVERNANCE,
    Permission.VIEW_HUKUMAN,
    Permission.VIEW_QUEST,
    Permission.MANAGE_QUEST,
    Permission.APPROVE_QUEST,
    Permission.VIEW_ASRAMA,
    Permission.VIEW_UKS,
    Permission.VIEW_IZIN_BEROBAT,
    Permission.VIEW_NOTIFIKASI,
    Permission.VIEW_PENGATURAN,
  ]),

  staff: new Set([
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_SANTRI,
    Permission.VIEW_KELAS,
    Permission.VIEW_MAPEL,
    Permission.VIEW_DISTRIBUSI_GURU,
    Permission.VIEW_PELANGGARAN,
    Permission.REPORT_PELANGGARAN,
    Permission.VIEW_GOVERNANCE,
    Permission.VIEW_QUEST,
    Permission.VIEW_UKS,
    Permission.VIEW_IZIN_BEROBAT,
    Permission.VIEW_NOTIFIKASI,
    Permission.VIEW_PENGATURAN,
  ]),

  guru: new Set([
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_SANTRI,
    Permission.VIEW_PELANGGARAN,
    Permission.REPORT_PELANGGARAN,
    Permission.VIEW_GOVERNANCE,
    Permission.VIEW_QUEST,
    Permission.VIEW_NOTIFIKASI,
    Permission.VIEW_PENGATURAN,
  ]),

  wali_kelas: new Set([
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_SANTRI,
    Permission.VIEW_PELANGGARAN,
    Permission.REPORT_PELANGGARAN,
    Permission.VIEW_GOVERNANCE,
    Permission.VIEW_QUEST,
    Permission.VIEW_NOTIFIKASI,
    Permission.VIEW_PENGATURAN,
  ]),

  wali: new Set([
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_OWN_DATA,
    Permission.VIEW_QUEST,
    Permission.VIEW_NOTIFIKASI,
    Permission.VIEW_PENGATURAN,
  ]),

  santri: new Set([
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_OWN_DATA,
    Permission.VIEW_OWN_PELANGGARAN,
    Permission.CLAIM_QUEST,
    Permission.VIEW_NOTIFIKASI,
    Permission.VIEW_PENGATURAN,
  ]),

  alumni: new Set([
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_OWN_DATA,
  ]),
};

// ─── Utility Functions ──────────────────────────────────────────────

export function hasPermission(role: UserRole | undefined, permission: PermissionType): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.has(permission) ?? false;
}

export function hasAnyPermission(role: UserRole | undefined, permissions: PermissionType[]): boolean {
  if (!role) return false;
  const rolePerms = ROLE_PERMISSIONS[role];
  if (!rolePerms) return false;
  return permissions.some((p) => rolePerms.has(p));
}

export function hasAllPermissions(role: UserRole | undefined, permissions: PermissionType[]): boolean {
  if (!role) return false;
  const rolePerms = ROLE_PERMISSIONS[role];
  if (!rolePerms) return false;
  return permissions.every((p) => rolePerms.has(p));
}

export function isRole(role: UserRole | undefined, target: UserRole | UserRole[]): boolean {
  if (!role) return false;
  if (Array.isArray(target)) return target.includes(role);
  return role === target;
}
