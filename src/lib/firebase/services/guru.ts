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
import type { FirestoreGuru } from '@/types/firestore';
import type { Guru } from '@/types';

const COLLECTION = 'guru';

function toApp(fs: FirestoreGuru, id: string): Guru {
  return {
    id,
    name: fs.name,
    nip: fs.nip,
    ranahInstansi: fs.ranahInstansi,
    status: fs.status,
    email: fs.email,
    noWA: fs.noWA,
    alamat: fs.alamat,
    userId: fs.userId,
  };
}

export const guruService = {
  async get(id: string): Promise<Guru | null> {
    if (isDemoMode()) return demoDb.get<Guru>(COLLECTION, id);
    const snap = await getDoc(doc(db, COLLECTION, id));
    const data = docToData<FirestoreGuru>(snap);
    return data ? toApp(data, snap.id) : null;
  },

  async create(data: Omit<FirestoreGuru, 'createdAt' | 'updatedAt'>): Promise<string> {
    if (isDemoMode()) return demoDb.create(COLLECTION, data as Record<string, unknown>);
    const now = Timestamp.now();
    const ref = await addDoc(collection(db, COLLECTION), {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return ref.id;
  },

  async update(id: string, data: Partial<FirestoreGuru>): Promise<void> {
    if (isDemoMode()) { demoDb.update(COLLECTION, id, data as Record<string, unknown>); return; }
    await updateDoc(doc(db, COLLECTION, id), {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  async list(field?: string, value?: unknown): Promise<Guru[]> {
    if (isDemoMode()) return demoDb.list<Guru>(COLLECTION, field, value);
    const constraints: QueryConstraint[] = [];
    if (field !== undefined && value !== undefined) {
      constraints.push(where(field, '==', value));
    }
    const snap = await getDocs(query(collection(db, COLLECTION), ...constraints));
    const items = docsToArray<FirestoreGuru>(snap);
    return items.map((item) =>
      toApp(item as FirestoreGuru, (item as unknown as { id: string }).id)
    );
  },

  subscribe(id: string, cb: (data: Guru | null) => void): () => void {
    if (isDemoMode()) {
      cb(demoDb.get<Guru>(COLLECTION, id));
      return () => {};
    }
    return onSnapshot(doc(db, COLLECTION, id), (snap) => {
      const data = docToData<FirestoreGuru>(snap);
      cb(data ? toApp(data, snap.id) : null);
    });
  },

  async delete(id: string): Promise<void> {
    if (isDemoMode()) { demoDb.delete(COLLECTION, id); return; }
    await deleteDoc(doc(db, COLLECTION, id));
  },
};
