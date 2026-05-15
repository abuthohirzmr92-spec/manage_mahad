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
import type { FirestoreMasterHukuman } from '@/types/firestore';
import type { MasterHukuman } from '@/types';

const COLLECTION = 'masterHukuman';

function toApp(fs: FirestoreMasterHukuman, id: string): MasterHukuman {
  return {
    id,
    name: fs.name,
    status: fs.status,
    severityScope: fs.severityScope,
    minimumTingkat: fs.minimumTingkat,
    description: fs.description,
  };
}

export const masterHukumanService = {
  async get(id: string): Promise<MasterHukuman | null> {
    if (isDemoMode()) return demoDb.get<MasterHukuman>(COLLECTION, id);
    const snap = await getDoc(doc(db, COLLECTION, id));
    const data = docToData<FirestoreMasterHukuman>(snap);
    return data ? toApp(data, snap.id) : null;
  },

  async create(
    data: Omit<FirestoreMasterHukuman, 'createdAt' | 'updatedAt'>
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
    data: Partial<FirestoreMasterHukuman>
  ): Promise<void> {
    if (isDemoMode()) { demoDb.update(COLLECTION, id, data as Record<string, unknown>); return; }
    await updateDoc(doc(db, COLLECTION, id), {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  async list(): Promise<MasterHukuman[]> {
    if (isDemoMode()) return demoDb.list<MasterHukuman>(COLLECTION);
    const snap = await getDocs(collection(db, COLLECTION));
    const items = docsToArray<FirestoreMasterHukuman>(snap);
    return items.map((item) =>
      toApp(item as FirestoreMasterHukuman, (item as unknown as { id: string }).id)
    );
  },

  async delete(id: string): Promise<void> {
    if (isDemoMode()) { demoDb.delete(COLLECTION, id); return; }
    await deleteDoc(doc(db, COLLECTION, id));
  },
};
