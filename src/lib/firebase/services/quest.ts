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
import type { FirestoreQuest } from '@/types/firestore';
import type { Quest } from '@/types';

const COLLECTION = 'quest';

function toApp(fs: FirestoreQuest, id: string): Quest {
  return {
    id,
    santriId: fs.santriId,
    santriName: fs.santriName,
    title: fs.title,
    description: fs.description,
    pointsReward: fs.pointsReward,
    status: fs.status,
    deadline: fs.deadline,
    progress: fs.progress,
    createdBy: fs.createdBy,
    approvalStatus: fs.approvalStatus,
    approvedBy: fs.approvedBy,
  };
}

export const questService = {
  async get(id: string): Promise<Quest | null> {
    if (isDemoMode()) return demoDb.get<Quest>(COLLECTION, id);
    const snap = await getDoc(doc(db, COLLECTION, id));
    const data = docToData<FirestoreQuest>(snap);
    return data ? toApp(data, snap.id) : null;
  },

  async create(
    data: Omit<FirestoreQuest, 'createdAt' | 'updatedAt'>
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
    data: Partial<FirestoreQuest>
  ): Promise<void> {
    if (isDemoMode()) { demoDb.update(COLLECTION, id, data as Record<string, unknown>); return; }
    await updateDoc(doc(db, COLLECTION, id), {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  async list(field?: string, value?: unknown): Promise<Quest[]> {
    if (isDemoMode()) return demoDb.list<Quest>(COLLECTION, field, value);
    const constraints: QueryConstraint[] = [];
    if (field !== undefined && value !== undefined) {
      constraints.push(where(field, '==', value));
    }
    const snap = await getDocs(query(collection(db, COLLECTION), ...constraints));
    const items = docsToArray<FirestoreQuest>(snap);
    return items.map((item) =>
      toApp(item as FirestoreQuest, (item as unknown as { id: string }).id)
    );
  },

  subscribe(
    id: string,
    cb: (data: Quest | null) => void
  ): () => void {
    if (isDemoMode()) {
      cb(demoDb.get<Quest>(COLLECTION, id));
      return () => {};
    }
    return onSnapshot(doc(db, COLLECTION, id), (snap) => {
      const data = docToData<FirestoreQuest>(snap);
      cb(data ? toApp(data, snap.id) : null);
    });
  },

  async delete(id: string): Promise<void> {
    if (isDemoMode()) { demoDb.delete(COLLECTION, id); return; }
    await deleteDoc(doc(db, COLLECTION, id));
  },
};
