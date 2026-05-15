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
  orderBy,
  onSnapshot,
  Timestamp,
  type QueryConstraint,
} from 'firebase/firestore';
import { docToData, docsToArray } from '@/lib/firebase/utils';
import { isDemoMode, demoDb } from '@/lib/firebase/demo-data';
import type { FirestoreNotification } from '@/types/firestore';
import type { Notification } from '@/types';

const COLLECTION = 'notifications';

function toApp(fs: FirestoreNotification, id: string): Notification {
  return {
    id,
    title: fs.title,
    message: fs.message,
    type: fs.type,
    read: fs.read,
    createdAt:
      fs.createdAt?.toDate?.()?.toISOString?.() ??
      (fs.createdAt as unknown as string),
    targetRole: fs.targetRole,
    targetSantriId: fs.targetSantriId,
    targetAsramaId: fs.targetAsramaId,
    targetKelas: fs.targetKelas,
    targetAngkatan: fs.targetAngkatan,
  };
}

export const notificationsService = {
  async get(id: string): Promise<Notification | null> {
    if (isDemoMode()) return demoDb.get<Notification>(COLLECTION, id);
    const snap = await getDoc(doc(db, COLLECTION, id));
    const data = docToData<FirestoreNotification>(snap);
    return data ? toApp(data, snap.id) : null;
  },

  async create(
    data: Omit<FirestoreNotification, 'createdAt'>
  ): Promise<string> {
    if (isDemoMode()) return demoDb.create(COLLECTION, data as Record<string, unknown>);
    const now = Timestamp.now();
    const ref = await addDoc(collection(db, COLLECTION), {
      ...data,
      createdAt: now,
    });
    return ref.id;
  },

  async update(
    id: string,
    data: Partial<FirestoreNotification>
  ): Promise<void> {
    if (isDemoMode()) { demoDb.update(COLLECTION, id, data as Record<string, unknown>); return; }
    await updateDoc(doc(db, COLLECTION, id), data);
  },

  async markAsRead(id: string): Promise<void> {
    if (isDemoMode()) { demoDb.update(COLLECTION, id, { read: true }); return; }
    await updateDoc(doc(db, COLLECTION, id), { read: true });
  },

  async list(field?: string, value?: unknown): Promise<Notification[]> {
    if (isDemoMode()) return demoDb.list<Notification>(COLLECTION, field, value);
    const constraints: QueryConstraint[] = [];
    if (field !== undefined && value !== undefined) {
      constraints.push(where(field, '==', value));
    }
    constraints.push(orderBy('createdAt', 'desc'));
    const snap = await getDocs(query(collection(db, COLLECTION), ...constraints));
    const items = docsToArray<FirestoreNotification>(snap);
    return items.map((item) =>
      toApp(item as FirestoreNotification, (item as unknown as { id: string }).id)
    );
  },

  subscribe(
    id: string,
    cb: (data: Notification | null) => void
  ): () => void {
    if (isDemoMode()) {
      cb(demoDb.get<Notification>(COLLECTION, id));
      return () => {};
    }
    return onSnapshot(doc(db, COLLECTION, id), (snap) => {
      const data = docToData<FirestoreNotification>(snap);
      cb(data ? toApp(data, snap.id) : null);
    });
  },

  async delete(id: string): Promise<void> {
    if (isDemoMode()) { demoDb.delete(COLLECTION, id); return; }
    await deleteDoc(doc(db, COLLECTION, id));
  },
};
