// ========================================
// Auth Store — Unit Tests
// ========================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from '@/store/auth-store';
import { mockUsers } from '@/data/mock';

// ----------------------------------------------------------------
// Mock Firebase auth service so tests never reach real Firebase
// ----------------------------------------------------------------

vi.mock('@/lib/firebase/auth', () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
    onAuthChanged: vi.fn(),
  },
}));

import { authService } from '@/lib/firebase/auth';

// ----------------------------------------------------------------
// Tests
// ----------------------------------------------------------------

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset store back to initial state before each test
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });

    // Default: demo mode ON
    process.env.NEXT_PUBLIC_DEMO_MODE = 'true';
    vi.clearAllMocks();
  });

  // --------------- initial state ---------------

  describe('initial state', () => {
    it('has user null, isAuthenticated false, isLoading false, error null', () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  // --------------- login ---------------

  describe('login', () => {
    it('sets user when credentials match a mock user in demo mode', async () => {
      const { login } = useAuthStore.getState();
      const result = await login('admin@mahad.sch.id', 'irrelevant');

      expect(result).toBe(true);
      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUsers[0]);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('returns false and sets error when email is not found in demo mode', async () => {
      const { login } = useAuthStore.getState();
      const result = await login('unknown@mahad.sch.id', 'irrelevant');

      expect(result).toBe(false);
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Email tidak terdaftar');
    });

    it('delegates to authService when demo mode is off', async () => {
      process.env.NEXT_PUBLIC_DEMO_MODE = 'false';

      const mockLogin = vi.mocked(authService.login);
      mockLogin.mockResolvedValue(mockUsers[0]);

      const { login } = useAuthStore.getState();
      const result = await login('admin@mahad.sch.id', 'password123');

      expect(result).toBe(true);
      expect(mockLogin).toHaveBeenCalledWith('admin@mahad.sch.id', 'password123');
      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUsers[0]);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('catches authService error and sets error state in non-demo mode', async () => {
      process.env.NEXT_PUBLIC_DEMO_MODE = 'false';

      const mockLogin = vi.mocked(authService.login);
      mockLogin.mockRejectedValue(new Error('auth/wrong-password'));

      const { login } = useAuthStore.getState();
      const result = await login('admin@mahad.sch.id', 'wrong');

      expect(result).toBe(false);
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBe('auth/wrong-password');
    });
  });

  // --------------- logout ---------------

  describe('logout', () => {
    it('clears user and isAuthenticated', async () => {
      // Pre-set a logged-in user
      useAuthStore.setState({ user: mockUsers[0], isAuthenticated: true });

      const { logout } = useAuthStore.getState();
      await logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('calls authService.logout when not in demo mode', async () => {
      process.env.NEXT_PUBLIC_DEMO_MODE = 'false';
      useAuthStore.setState({ user: mockUsers[0], isAuthenticated: true });

      const { logout } = useAuthStore.getState();
      await logout();

      expect(authService.logout).toHaveBeenCalledOnce();
    });
  });

  // --------------- clearError ---------------

  describe('clearError', () => {
    it('resets error to null', () => {
      useAuthStore.setState({ error: 'Something went wrong' });

      useAuthStore.getState().clearError();

      expect(useAuthStore.getState().error).toBeNull();
    });
  });

  // --------------- switchRole ---------------

  describe('switchRole', () => {
    it('switches user when a mock user with the requested role exists in demo mode', () => {
      useAuthStore.setState({ user: mockUsers[0] }); // admin

      useAuthStore.getState().switchRole('musyrif');

      const state = useAuthStore.getState();
      expect(state.user?.role).toBe('musyrif');
    });

    it('does nothing when demo mode is off', () => {
      process.env.NEXT_PUBLIC_DEMO_MODE = 'false';
      useAuthStore.setState({ user: mockUsers[0] }); // admin

      useAuthStore.getState().switchRole('musyrif');

      // role must remain unchanged
      const state = useAuthStore.getState();
      expect(state.user?.role).toBe('admin');
    });
  });
});
