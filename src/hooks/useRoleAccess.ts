'use client';

import { UserRole } from '@/types';
import { useAuth } from './useAuth';

export function useRoleAccess(allowedRoles: UserRole[]): boolean {
  const { user } = useAuth();
  if (!user) return false;
  return allowedRoles.includes(user.role);
}
