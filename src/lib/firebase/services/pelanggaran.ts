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
import type { FirestorePelanggaran } from '@/types/firestore';
import type { Pelanggaran } from '@/types';

const COLLECTION = 'pelanggaran';

function toApp(fs: FirestorePelanggaran, id: string): Pelanggaran {
  return {
    id,
    santriId: fs.santriId,
    santriName: fs.santriName,
    pelanggaranId: fs.pelanggaranId,
    pelanggaranName: fs.pelanggaranName,
    severity: fs.severity,
    points: fs.points,
    date: fs.date,
    reportedBy: fs.reportedBy,
    reportedByUserId: fs.reportedByUserId,
    reportedByRole: fs.reportedByRole as Pelanggaran['reportedByRole'],
    status: fs.status,
    statusHukuman: fs.statusHukuman,
    punishmentId: fs.punishmentId,
    punishmentName: fs.punishmentName,
    notes: fs.notes,
  };
}

export const pelanggaranService = {
  async get(id: string): Promise<Pelanggaran | null> {
    if (isDemoMode()) return demoDb.get<Pelanggaran>(COLLECTION, id);
    const snap = await getDoc(doc(db, COLLECTION, id));
    const data = docToData<FirestorePelanggaran>(snap);
    return data ? toApp(data, snap.id) : null;
  },

  async create(
    data: Omit<FirestorePelanggaran, 'createdAt' | 'updatedAt'>
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
    data: Partial<FirestorePelanggaran>
  ): Promise<void> {
    if (isDemoMode()) { demoDb.update(COLLECTION, id, data as Record<string, unknown>); return; }
    await updateDoc(doc(db, COLLECTION, id), {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  async list(field?: string, value?: unknown): Promise<Pelanggaran[]> {
    if (isDemoMode()) return demoDb.list<Pelanggaran>(COLLECTION, field, value);
    const constraints: QueryConstraint[] = [];
    if (field !== undefined && value !== undefined) {
      constraints.push(where(field, '==', value));
    }
    const snap = await getDocs(query(collection(db, COLLECTION), ...constraints));
    const items = docsToArray<FirestorePelanggaran>(snap);
    return items.map((item) =>
      toApp(item as FirestorePelanggaran, (item as unknown as { id: string }).id)
    );
  },

  subscribe(
    id: string,
    cb: (data: Pelanggaran | null) => void
  ): () => void {
    if (isDemoMode()) {
      cb(demoDb.get<Pelanggaran>(COLLECTION, id));
      return () => {};
    }
    return onSnapshot(doc(db, COLLECTION, id), (snap) => {
      const data = docToData<FirestorePelanggaran>(snap);
      cb(data ? toApp(data, snap.id) : null);
    });
  },

  async delete(id: string): Promise<void> {
    if (isDemoMode()) { demoDb.delete(COLLECTION, id); return; }
    await deleteDoc(doc(db, COLLECTION, id));
  },
};
