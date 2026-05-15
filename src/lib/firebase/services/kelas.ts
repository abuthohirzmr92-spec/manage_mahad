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
import type { FirestoreKelas } from '@/types/firestore';
import type { Kelas } from '@/data/mock-kelas/types';

const COLLECTION = 'kelas';

function toApp(fs: FirestoreKelas, id: string): Kelas {
  return {
    id,
    name: fs.name,
    jenjang: fs.jenjang,
    tingkat: fs.tingkat,
    waliKelas: fs.waliKelas,
    studentCount: fs.studentCount,
    status: fs.status,
  };
}

export const kelasService = {
  async get(id: string): Promise<Kelas | null> {
    if (isDemoMode()) return demoDb.get<Kelas>(COLLECTION, id);
    const snap = await getDoc(doc(db, COLLECTION, id));
    const data = docToData<FirestoreKelas>(snap);
    return data ? toApp(data, snap.id) : null;
  },

  async create(
    data: Omit<FirestoreKelas, 'createdAt' | 'updatedAt'>
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
    data: Partial<FirestoreKelas>
  ): Promise<void> {
    if (isDemoMode()) { demoDb.update(COLLECTION, id, data as Record<string, unknown>); return; }
    await updateDoc(doc(db, COLLECTION, id), {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  async list(
    field?: string,
    value?: unknown
  ): Promise<Kelas[]> {
    if (isDemoMode()) return demoDb.list<Kelas>(COLLECTION, field, value);
    const constraints: QueryConstraint[] = [];
    if (field !== undefined && value !== undefined) {
      constraints.push(where(field, '==', value));
    }
    const snap = await getDocs(query(collection(db, COLLECTION), ...constraints));
    const items = docsToArray<FirestoreKelas>(snap);
    return items.map((item) =>
      toApp(item as FirestoreKelas, (item as unknown as { id: string }).id)
    );
  },

  subscribe(
    id: string,
    cb: (data: Kelas | null) => void
  ): () => void {
    if (isDemoMode()) {
      cb(demoDb.get<Kelas>(COLLECTION, id));
      return () => {};
    }
    return onSnapshot(doc(db, COLLECTION, id), (snap) => {
      const data = docToData<FirestoreKelas>(snap);
      cb(data ? toApp(data, snap.id) : null);
    });
  },

  async delete(id: string): Promise<void> {
    if (isDemoMode()) { demoDb.delete(COLLECTION, id); return; }
    await deleteDoc(doc(db, COLLECTION, id));
  },
};
