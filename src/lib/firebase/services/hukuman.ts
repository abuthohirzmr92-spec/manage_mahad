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
  type Unsubscribe,
} from 'firebase/firestore';
import { docToData, docsToArray } from '@/lib/firebase/utils';
import { isDemoMode, demoDb } from '@/lib/firebase/demo-data';
import type { FirestoreHukuman } from '@/types/firestore';
import type { Hukuman, MasterHukuman } from '@/types';

const COLLECTION = 'hukuman';

function toApp(fs: FirestoreHukuman, id: string): Hukuman {
  return {
    id,
    santriId: fs.santriId,
    santriName: fs.santriName,
    pelanggaranId: fs.pelanggaranId,
    masterHukumanId: fs.masterHukumanId,
    type: fs.type,
    description: fs.description,
    startDate: fs.startDate,
    endDate: fs.endDate,
    status: fs.status,
    executorId: fs.executorId,
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

  /**
   * Create a Hukuman document from a MasterHukuman template.
   * Called automatically when a Pelanggaran is confirmed.
   */
  async createFromMaster(
    params: {
      santriId: string;
      santriName: string;
      pelanggaranId: string;
      masterHukumanId: string;
      masterHukuman: MasterHukuman;
      startDate: string;
      endDate: string;
      executorId?: string;
    }
  ): Promise<string> {
    const now = new Date();
    const data: Omit<FirestoreHukuman, 'createdAt' | 'updatedAt'> = {
      santriId: params.santriId,
      santriName: params.santriName,
      pelanggaranId: params.pelanggaranId,
      masterHukumanId: params.masterHukumanId,
      type: params.masterHukuman.name,
      description: params.masterHukuman.description ?? '',
      startDate: params.startDate,
      endDate: params.endDate,
      status: 'aktif',
      executorId: params.executorId,
    };
    return hukumanService.create(data);
  },

  /**
   * Mark a Hukuman as completed (selesai).
   */
  async markComplete(id: string): Promise<void> {
    await hukumanService.update(id, { status: 'selesai' });
  },

  /**
   * Cancel a Hukuman (dibatalkan).
   */
  async cancel(id: string): Promise<void> {
    await hukumanService.update(id, { status: 'dibatalkan' });
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

  /** Subscribe to a filtered list of hukuman documents in realtime. */
  subscribeList(
    field?: string,
    value?: unknown,
    cb?: (items: Hukuman[]) => void
  ): Unsubscribe {
    if (isDemoMode()) {
      if (cb) cb(demoDb.list<Hukuman>(COLLECTION, field, value));
      return () => {};
    }
    const constraints: QueryConstraint[] = [];
    if (field !== undefined && value !== undefined) {
      constraints.push(where(field, '==', value));
    }
    const q = query(collection(db, COLLECTION), ...constraints);
    return onSnapshot(q, (snap) => {
      if (cb) {
        const items = docsToArray<FirestoreHukuman>(snap);
        cb(items.map((item) =>
          toApp(item as FirestoreHukuman, (item as unknown as { id: string }).id)
        ));
      }
    });
  },

  async delete(id: string): Promise<void> {
    if (isDemoMode()) { demoDb.delete(COLLECTION, id); return; }
    await deleteDoc(doc(db, COLLECTION, id));
  },
};
