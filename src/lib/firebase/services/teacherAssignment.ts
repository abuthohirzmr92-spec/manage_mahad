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
import type { FirestoreTeacherAssignment } from '@/types/firestore';
import type { TeacherAssignment } from '@/types';

const COLLECTION = 'teacherAssignments';

function toApp(fs: FirestoreTeacherAssignment, id: string): TeacherAssignment {
  return {
    id,
    mapelId: fs.mapelId,
    kelasId: fs.kelasId,
    kelasName: fs.kelasName,
    guruName: fs.guruName,
    status: fs.status,
  };
}

export const teacherAssignmentService = {
  async get(id: string): Promise<TeacherAssignment | null> {
    if (isDemoMode()) return demoDb.get<TeacherAssignment>(COLLECTION, id);
    const snap = await getDoc(doc(db, COLLECTION, id));
    const data = docToData<FirestoreTeacherAssignment>(snap);
    return data ? toApp(data, snap.id) : null;
  },

  async create(
    data: Omit<FirestoreTeacherAssignment, 'createdAt' | 'updatedAt'>
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
    data: Partial<FirestoreTeacherAssignment>
  ): Promise<void> {
    if (isDemoMode()) { demoDb.update(COLLECTION, id, data as Record<string, unknown>); return; }
    await updateDoc(doc(db, COLLECTION, id), {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  async listAll(): Promise<TeacherAssignment[]> {
    if (isDemoMode()) return demoDb.list<TeacherAssignment>(COLLECTION);
    const snap = await getDocs(collection(db, COLLECTION));
    const items = docsToArray<FirestoreTeacherAssignment>(snap);
    return items.map((item) =>
      toApp(item as FirestoreTeacherAssignment, (item as unknown as { id: string }).id)
    );
  },

  async listByMapel(mapelId: string): Promise<TeacherAssignment[]> {
    if (isDemoMode()) return demoDb.list<TeacherAssignment>(COLLECTION, 'mapelId', mapelId);
    const snap = await getDocs(query(collection(db, COLLECTION), where('mapelId', '==', mapelId)));
    const items = docsToArray<FirestoreTeacherAssignment>(snap);
    return items.map((item) =>
      toApp(item as FirestoreTeacherAssignment, (item as unknown as { id: string }).id)
    );
  },

  async delete(id: string): Promise<void> {
    if (isDemoMode()) { demoDb.delete(COLLECTION, id); return; }
    await deleteDoc(doc(db, COLLECTION, id));
  },
};
