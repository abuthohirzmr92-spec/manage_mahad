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
import type { FirestoreMasterPelanggaran } from '@/types/firestore';
import type { MasterPelanggaran } from '@/types';

const COLLECTION = 'masterPelanggaran';

function toApp(fs: FirestoreMasterPelanggaran, id: string): MasterPelanggaran {
  return {
    id,
    code: fs.code,
    ranahInstansi: fs.ranahInstansi,
    kategori: fs.kategori,
    name: fs.name,
    severity: fs.severity,
    points: fs.points,
    description: fs.description,
  };
}

export const masterPelanggaranService = {
  async get(id: string): Promise<MasterPelanggaran | null> {
    if (isDemoMode()) return demoDb.get<MasterPelanggaran>(COLLECTION, id);
    const snap = await getDoc(doc(db, COLLECTION, id));
    const data = docToData<FirestoreMasterPelanggaran>(snap);
    return data ? toApp(data, snap.id) : null;
  },

  async create(
    data: Omit<FirestoreMasterPelanggaran, 'createdAt' | 'updatedAt'>
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
    data: Partial<FirestoreMasterPelanggaran>
  ): Promise<void> {
    if (isDemoMode()) { demoDb.update(COLLECTION, id, data as Record<string, unknown>); return; }
    await updateDoc(doc(db, COLLECTION, id), {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  async list(field?: string, value?: unknown): Promise<MasterPelanggaran[]> {
    if (isDemoMode()) return demoDb.list<MasterPelanggaran>(COLLECTION, field, value);
    const constraints: QueryConstraint[] = [];
    if (field !== undefined && value !== undefined) {
      constraints.push(where(field, '==', value));
    }
    const snap = await getDocs(query(collection(db, COLLECTION), ...constraints));
    const items = docsToArray<FirestoreMasterPelanggaran>(snap);
    return items.map((item) =>
      toApp(item as FirestoreMasterPelanggaran, (item as unknown as { id: string }).id)
    );
  },

  subscribe(
    id: string,
    cb: (data: MasterPelanggaran | null) => void
  ): () => void {
    if (isDemoMode()) {
      cb(demoDb.get<MasterPelanggaran>(COLLECTION, id));
      return () => {};
    }
    return onSnapshot(doc(db, COLLECTION, id), (snap) => {
      const data = docToData<FirestoreMasterPelanggaran>(snap);
      cb(data ? toApp(data, snap.id) : null);
    });
  },

  async delete(id: string): Promise<void> {
    if (isDemoMode()) { demoDb.delete(COLLECTION, id); return; }
    await deleteDoc(doc(db, COLLECTION, id));
  },
};
