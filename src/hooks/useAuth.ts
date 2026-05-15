'use client';

import { useAuthStore } from '@/store/auth-store';

export function useAuth() {
  const { user, isAuthenticated, isLoading, error } = useAuthStore();
  return { user, isAuthenticated, isLoading, error };
}
