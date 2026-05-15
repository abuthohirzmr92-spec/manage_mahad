'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { docToData } from '@/lib/firebase/utils';
import { isDemoMode, getDemoCollection } from '@/lib/firebase/demo-data';

export function useDocument<T>(
  collectionName: string,
  id: string | null,
): { data: T | null; loading: boolean; error: Error | null } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }

    // Demo mode — find by id in mock data
    if (isDemoMode()) {
      const items = getDemoCollection(collectionName) as Array<{ id: string } & T>;
      const found = items.find((item) => item.id === id) || null;
      setData(found as T | null);
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(
      doc(db, collectionName, id),
      (snap) => {
        setData(docToData<T>(snap));
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );

    return () => unsub();
  }, [collectionName, id]);

  return { data, loading, error };
}
