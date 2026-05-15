'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { authService } from '@/lib/firebase/auth';
import { useAuthStore } from '@/store/auth-store';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsubscribe = authService.onAuthChanged((user, fbUser) => {
      if (user) {
        useAuthStore.setState({
          user,
          firebaseUser: fbUser,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        useAuthStore.setState({
          user: null,
          firebaseUser: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
      setReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Block rendering until auth state is determined.
  // Prevents dashboard from seeing the initial isLoading=false + isAuthenticated=false
  // and redirecting to / before Firebase's onAuthStateChanged fires.
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
