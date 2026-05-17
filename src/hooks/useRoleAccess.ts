'use client';

import { useMemo } from 'react';
import type { UserRole } from '@/types';
import { useAuth } from './useAuth';
import { type PermissionType, hasPermission, hasAnyPermission, hasAllPermissions, isRole } from '@/config/permissions';

export function useRoleAccess(allowedRoles: UserRole[]): boolean {
  const { user } = useAuth();
  if (!user) return false;
  return allowedRoles.includes(user.role);
}

export function useHasPermission(permission: PermissionType): boolean {
  const { user } = useAuth();
  return useMemo(() => hasPermission(user?.role, permission), [user?.role, permission]);
}

export function useHasAnyPermission(permissions: PermissionType[]): boolean {
  const { user } = useAuth();
  return useMemo(() => hasAnyPermission(user?.role, permissions), [user?.role, permissions]);
}

export function useHasAllPermissions(permissions: PermissionType[]): boolean {
  const { user } = useAuth();
  return useMemo(() => hasAllPermissions(user?.role, permissions), [user?.role, permissions]);
}

export function useIsRole(target: UserRole | UserRole[]): boolean {
  const { user } = useAuth();
  return useMemo(() => isRole(user?.role, target), [user?.role, target]);
}

export function useViewAsRole(): UserRole | undefined {
  const { user } = useAuth();
  return user?.role;
}
