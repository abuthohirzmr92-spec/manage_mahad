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
import type { FirestoreHukuman } from '@/types/firestore';
import type { Hukuman } from '@/types';

const COLLECTION = 'hukuman';

function toApp(fs: FirestoreHukuman, id: string): Hukuman {
  return {
    id,
    santriId: fs.santriId,
    santriName: fs.santriName,
    pelanggaranId: fs.pelanggaranId,
    type: fs.type,
    description: fs.description,
    startDate: fs.startDate,
    endDate: fs.endDate,
    status: fs.status,
  };
}

export const hukumanService = {
  async get(id: string): Promise<Hukuman | null> {
    if (isDemoMode()) return demoDb.get<Hukuman>(COLLECTION, id);
    const snap = await getDoc(doc(db, COLLECTION, id));
    const data = docToData<FirestoreHukuman>(snap);
    return data ? toApp(data, snap.id) : null;
  },

  async create(
    data: Omit<FirestoreHukuman, 'createdAt' | 'updatedAt'>
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
    data: Partial<FirestoreHukuman>
  ): Promise<void> {
    if (isDemoMode()) { demoDb.update(COLLECTION, id, data as Record<string, unknown>); return; }
    await updateDoc(doc(db, COLLECTION, id), {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  async list(field?: string, value?: unknown): Promise<Hukuman[]> {
    if (isDemoMode()) return demoDb.list<Hukuman>(COLLECTION, field, value);
    const constraints: QueryConstraint[] = [];
    if (field !== undefined && value !== undefined) {
      constraints.push(where(field, '==', value));
    }
    const snap = await getDocs(query(collection(db, COLLECTION), ...constraints));
    const items = docsToArray<FirestoreHukuman>(snap);
    return items.map((item) =>
      toApp(item as FirestoreHukuman, (item as unknown as { id: string }).id)
    );
  },

  subscribe(
    id: string,
    cb: (data: Hukuman | null) => void
  ): () => void {
    if (isDemoMode()) {
      cb(demoDb.get<Hukuman>(COLLECTION, id));
      return () => {};
    }
    return onSnapshot(doc(db, COLLECTION, id), (snap) => {
      const data = docToData<FirestoreHukuman>(snap);
      cb(data ? toApp(data, snap.id) : null);
    });
  },

  async delete(id: string): Promise<void> {
    if (isDemoMode()) { demoDb.delete(COLLECTION, id); return; }
    await deleteDoc(doc(db, COLLECTION, id));
  },
};
