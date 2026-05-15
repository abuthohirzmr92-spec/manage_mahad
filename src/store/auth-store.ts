// ========================================
// Auth Store (Zustand)
// Supports both Firebase Auth and demo mode
// ========================================

import { create } from 'zustand';
import { User, UserRole } from '@/types';
import { mockUsers } from '@/data/mock';
import type { User as FirebaseUser } from 'firebase/auth';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuthState {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  switchRole: (role: UserRole) => void;
  setUser: (user: User | null) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const isDemoMode = (): boolean =>
  process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useAuthStore = create<AuthState>((set) => ({
  // ── initial state ──────────────────────────────────────────────────────
  user: null,
  firebaseUser: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // ── login ──────────────────────────────────────────────────────────────
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      if (isDemoMode()) {
        // Demo mode — use mock data (no Firebase dependency)
        await new Promise((resolve) => setTimeout(resolve, 500));
        const user = mockUsers.find((u) => u.email === email);
        if (user) {
          set({ user, isAuthenticated: true, isLoading: false });
          return true;
        }
        set({ isLoading: false, error: 'Email tidak terdaftar' });
        return false;
      }

      // Firebase mode — dynamic import avoids circular deps
      const { authService } = await import('@/lib/firebase/auth');
      const user = await authService.login(email, password);
      set({ user, isAuthenticated: true, isLoading: false });
      return true;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Login gagal';
      set({ isLoading: false, error: message });
      return false;
    }
  },

  // ── logout ─────────────────────────────────────────────────────────────
  logout: async () => {
    try {
      if (!isDemoMode()) {
        const { authService } = await import('@/lib/firebase/auth');
        await authService.logout();
      }
    } catch {
      // signOut rarely fails; swallow so state is still cleared
    }
    set({
      user: null,
      firebaseUser: null,
      isAuthenticated: false,
      error: null,
    });
  },

  // ── clearError ─────────────────────────────────────────────────────────
  clearError: () => set({ error: null }),

  // ── switchRole (demo-mode only) ────────────────────────────────────────
  switchRole: (role: UserRole) => {
    if (!isDemoMode()) return;

    const user = mockUsers.find((u) => u.role === role);
    if (user) set({ user });
  },

  // ── setUser ────────────────────────────────────────────────────────────
  setUser: (user: User | null) => set({ user }),
}));
