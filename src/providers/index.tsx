'use client';

import { type ReactNode } from 'react';
import { FirebaseProvider } from './firebase-provider';
import { AuthProvider } from './auth-provider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <FirebaseProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </FirebaseProvider>
  );
}
