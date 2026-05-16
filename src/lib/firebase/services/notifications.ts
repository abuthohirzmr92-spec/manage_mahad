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
  writeBatch,
  type QueryConstraint,
} from 'firebase/firestore';
import { docToData, docsToArray } from '@/lib/firebase/utils';
import { isDemoMode, demoDb } from '@/lib/firebase/demo-data';
import type { FirestoreNotification } from '@/types/firestore';
import type { Notification } from '@/types';
import { notificationEngine } from '@/lib/notification-engine';
import type { GovernanceEvent } from '@/lib/governance-events';

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

  /**
   * Convert a governance event into a notification doc and write it to Firestore.
   * Returns the new document ID, or null if the event type has no template.
   */
  async createFromEvent(event: GovernanceEvent): Promise<string | null> {
    const payload = notificationEngine.dispatchFromEvent(event);
    if (!payload) return null;
    const id = await this.create(payload);
    return id;
  },

  /**
   * Mark all unread notifications as read, optionally scoped to a user filter.
   */
  async markAllAsRead(
    userFilter?: { targetRole?: string; targetSantriId?: string },
  ): Promise<void> {
    if (isDemoMode()) {
      const all = demoDb.list<Notification>(COLLECTION);
      const unread = userFilter
        ? all.filter(
            (n) =>
              !n.read &&
              (userFilter.targetRole ? n.targetRole === userFilter.targetRole : true) &&
              (userFilter.targetSantriId
                ? n.targetSantriId === userFilter.targetSantriId
                : true),
          )
        : all.filter((n) => !n.read);
      await Promise.all(unread.map((n) => this.markAsRead(n.id)));
      return;
    }

    const constraints: QueryConstraint[] = [where('read', '==', false)];
    if (userFilter?.targetRole) constraints.push(where('targetRole', '==', userFilter.targetRole));
    if (userFilter?.targetSantriId)
      constraints.push(where('targetSantriId', '==', userFilter.targetSantriId));

    const snap = await getDocs(query(collection(db, COLLECTION), ...constraints));
    if (snap.empty) return;

    const batch = writeBatch(db);
    snap.docs.forEach((docSnap) => {
      batch.update(docSnap.ref, { read: true });
    });
    await batch.commit();
  },

  /**
   * Delete notifications older than the specified number of days.
   * Defaults to 30 days.
   */
  async deleteOldNotifications(daysOld: number = 30): Promise<void> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysOld);

    if (isDemoMode()) {
      const all = demoDb.list<Notification>(COLLECTION);
      const old = all.filter((n) => {
        try {
          return new Date(n.createdAt).getTime() < cutoff.getTime();
        } catch {
          return false;
        }
      });
      await Promise.all(old.map((n) => this.delete(n.id)));
      return;
    }

    const constraints: QueryConstraint[] = [
      where('createdAt', '<', Timestamp.fromDate(cutoff)),
    ];

    const snap = await getDocs(query(collection(db, COLLECTION), ...constraints));
    if (snap.empty) return;

    const batch = writeBatch(db);
    snap.docs.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();
  },
};
