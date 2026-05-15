'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  collection,
  query,
  getDocs,
  onSnapshot,
  type QueryConstraint,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { docsToArray } from '@/lib/firebase/utils';
import { isDemoMode, getDemoCollection, demoDb } from '@/lib/firebase/demo-data';

interface UseCollectionOptions {
  realtime?: boolean;
}

export function useCollection<T>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
  options: UseCollectionOptions = {},
): { data: T[]; loading: boolean; error: Error | null } {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // stable ref for the fetch function so realtime demo re-fetch always sees latest collectionName
  const collectionNameRef = useRef(collectionName);
  collectionNameRef.current = collectionName;

  const fetchDemo = useCallback(() => {
    const mock = getDemoCollection(collectionNameRef.current) as T[];
    // Spread to force new reference — demo store mutates in place so
    // React may skip re-render if the array reference is unchanged.
    setData([...mock]);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Demo mode — return mock data
    if (isDemoMode()) {
      fetchDemo();

      if (options.realtime) {
        // Subscribe to demo store mutations so table reflects CRUD immediately
        const unsub = demoDb.subscribe((changed) => {
          if (changed === collectionNameRef.current) {
            console.log(`[useCollection] demo notify received for "${changed}" — re-fetching`);
            fetchDemo();
          }
        });
        return () => { unsub(); };
      }

      return;
    }

    let unsub: Unsubscribe | undefined;
    const q = query(collection(db, collectionName), ...constraints);

    if (options.realtime) {
      unsub = onSnapshot(
        q,
        (snap) => {
          setData(docsToArray<T>(snap));
          setLoading(false);
          setError(null);
        },
        (err) => {
          setError(err);
          setLoading(false);
        },
      );
    } else {
      getDocs(q)
        .then((snap) => {
          setData(docsToArray<T>(snap));
          setLoading(false);
        })
        .catch((err) => {
          setError(err);
          setLoading(false);
        });
    }

    return () => {
      if (unsub) unsub();
    };
  }, [collectionName, JSON.stringify(constraints), options.realtime]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error };
}
