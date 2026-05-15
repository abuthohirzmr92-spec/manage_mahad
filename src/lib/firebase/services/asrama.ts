import { db } from '@/lib/firebase/config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
  type QueryConstraint,
} from 'firebase/firestore';
import { docToData, docsToArray } from '@/lib/firebase/utils';
import { isDemoMode, demoDb } from '@/lib/firebase/demo-data';
import type { FirestoreAsrama } from '@/types/firestore';
import type { Asrama } from '@/types';

const COLLECTION = 'asrama';

function toApp(fs: FirestoreAsrama, id: string): Asrama {
  return {
    id,
    name: fs.name,
    musyrif: fs.musyrif,
    capacity: fs.capacity,
    filled: fs.filled,
    gender: fs.gender,
    status: fs.status,
  };
}

export const asramaService = {
  async get(id: string): Promise<Asrama | null> {
    if (isDemoMode()) return demoDb.get<Asrama>(COLLECTION, id);
    const snap = await getDoc(doc(db, COLLECTION, id));
    const data = docToData<FirestoreAsrama>(snap);
    return data ? toApp(data, snap.id) : null;
  },

  async create(
    data: Omit<FirestoreAsrama, 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    if (isDemoMode()) return demoDb.create(COLLECTION, data as Record<string, unknown>);
    const now = Timestamp.now();
    const ref = await addDoc(collection(db, COLLECTION), {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return ref.id;
  },

  async update(
    id: string,
    data: Partial<FirestoreAsrama>
  ): Promise<void> {
    if (isDemoMode()) { demoDb.update(COLLECTION, id, data as Record<string, unknown>); return; }
    await updateDoc(doc(db, COLLECTION, id), {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  async list(field?: string, value?: unknown): Promise<Asrama[]> {
    if (isDemoMode()) return demoDb.list<Asrama>(COLLECTION, field, value);
    const constraints: QueryConstraint[] = [];
    if (field !== undefined && value !== undefined) {
      constraints.push(where(field, '==', value));
    }
    const snap = await getDocs(query(collection(db, COLLECTION), ...constraints));
    const items = docsToArray<FirestoreAsrama>(snap);
    return items.map((item) =>
      toApp(item as FirestoreAsrama, (item as unknown as { id: string }).id)
    );
  },

  subscribe(
    id: string,
    cb: (data: Asrama | null) => void
  ): () => void {
    if (isDemoMode()) {
      cb(demoDb.get<Asrama>(COLLECTION, id));
      return () => {};
    }
    return onSnapshot(doc(db, COLLECTION, id), (snap) => {
      const data = docToData<FirestoreAsrama>(snap);
      cb(data ? toApp(data, snap.id) : null);
    });
  },

  async delete(id: string): Promise<void> {
    if (isDemoMode()) { demoDb.delete(COLLECTION, id); return; }
    await deleteDoc(doc(db, COLLECTION, id));
  },
};
