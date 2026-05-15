'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { app } from '@/lib/firebase/config';

const FirebaseContext = createContext<{ ready: boolean }>({ ready: false });
export const useFirebase = () => useContext(FirebaseContext);

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    // Firebase initializes synchronously on import; emulator connection happens in config.ts
    // Just ensure the app is available
    if (app) setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <FirebaseContext.Provider value={{ ready }}>{children}</FirebaseContext.Provider>;
}
