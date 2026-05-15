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
import type { FirestoreUser } from '@/types/firestore';
import type { User } from '@/types';

const COLLECTION = 'users';

function toApp(fs: FirestoreUser, id: string): User {
  return {
    id,
    name: fs.name,
    email: fs.email,
    role: fs.role,
    avatar: fs.avatar,
    childSantriId: fs.childSantriId,
    createdAt:
      fs.createdAt?.toDate?.()?.toISOString?.() ??
      (fs.createdAt as unknown as string),
    updatedAt:
      fs.updatedAt?.toDate?.()?.toISOString?.() ??
      (fs.updatedAt as unknown as string),
  } as User;
}

export const usersService = {
  async get(id: string): Promise<User | null> {
    if (isDemoMode()) return demoDb.get<User>(COLLECTION, id);
    const snap = await getDoc(doc(db, COLLECTION, id));
    const data = docToData<FirestoreUser>(snap);
    return data ? toApp(data, snap.id) : null;
  },

  async getByEmail(email: string): Promise<User | null> {
    if (isDemoMode()) {
      const users = demoDb.list<User>(COLLECTION, 'email', email);
      return users[0] ?? null;
    }
    const q = query(collection(db, COLLECTION), where('email', '==', email));
    const snap = await getDocs(q);
    const arr = docsToArray<FirestoreUser>(snap);
    return arr.length > 0 ? toApp(arr[0] as FirestoreUser, (arr[0] as unknown as { id: string }).id) : null;
  },

  async create(
    data: Omit<FirestoreUser, 'createdAt' | 'updatedAt'>
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
    data: Partial<FirestoreUser>
  ): Promise<void> {
    if (isDemoMode()) { demoDb.update(COLLECTION, id, data as Record<string, unknown>); return; }
    await updateDoc(doc(db, COLLECTION, id), {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  async list(field?: string, value?: unknown): Promise<User[]> {
    if (isDemoMode()) return demoDb.list<User>(COLLECTION, field, value);
    const constraints: QueryConstraint[] = [];
    if (field !== undefined && value !== undefined) {
      constraints.push(where(field, '==', value));
    }
    const snap = await getDocs(query(collection(db, COLLECTION), ...constraints));
    const items = docsToArray<FirestoreUser>(snap);
    return items.map((item) =>
      toApp(item as FirestoreUser, (item as unknown as { id: string }).id)
    );
  },

  subscribe(
    id: string,
    cb: (data: User | null) => void
  ): () => void {
    if (isDemoMode()) {
      cb(demoDb.get<User>(COLLECTION, id));
      return () => {};
    }
    return onSnapshot(doc(db, COLLECTION, id), (snap) => {
      const data = docToData<FirestoreUser>(snap);
      cb(data ? toApp(data, snap.id) : null);
    });
  },

  async delete(id: string): Promise<void> {
    if (isDemoMode()) { demoDb.delete(COLLECTION, id); return; }
    await deleteDoc(doc(db, COLLECTION, id));
  },
};
