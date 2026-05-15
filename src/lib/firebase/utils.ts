// ========================================
// Firestore Utility Helpers
// ========================================

import type { DocumentSnapshot, QuerySnapshot } from 'firebase/firestore';

/** Extract and convert a single document snapshot to typed data with id. */
export function docToData<T>(snap: DocumentSnapshot): T | null {
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as unknown as T;
}

/** Extract and convert a query snapshot to an array of typed data with ids. */
export function docsToArray<T>(snap: QuerySnapshot): T[] {
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as unknown as T);
}
