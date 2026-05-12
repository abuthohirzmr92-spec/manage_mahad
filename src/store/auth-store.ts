import { create } from 'zustand';
import { User, UserRole } from '@/types';
import { mockUsers } from '@/data/mock';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: async (email: string, _password: string) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const user = mockUsers.find((u) => u.email === email);
    if (user) {
      set({ user, isAuthenticated: true, isLoading: false });
      return true;
    }
    set({ isLoading: false });
    return false;
  },
  logout: () => set({ user: null, isAuthenticated: false }),
  switchRole: (role: UserRole) => {
    const user = mockUsers.find((u) => u.role === role);
    if (user) set({ user });
  },
}));
