'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks';
import { type PermissionType, hasPermission } from '@/config/permissions';
import type { UserRole } from '@/types';

export function useRouteGuard(requiredPermission?: PermissionType): { user: ReturnType<typeof useAuth>['user']; isLoading: boolean; isAuthorized: boolean } {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const isAuthorized = requiredPermission ? hasPermission(user?.role, requiredPermission) : !!user;

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push('/');
      return;
    }
    if (requiredPermission && !hasPermission(user.role, requiredPermission)) {
      router.push('/dashboard');
    }
  }, [user, isLoading, requiredPermission, router]);

  return { user, isLoading, isAuthorized };
}

export function useRoleGuard(allowedRoles: UserRole[]): { user: ReturnType<typeof useAuth>['user']; isLoading: boolean; isAuthorized: boolean } {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const isAuthorized = user ? allowedRoles.includes(user.role) : false;

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push('/');
      return;
    }
    if (!allowedRoles.includes(user.role)) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router, allowedRoles]);

  return { user, isLoading, isAuthorized };
}
