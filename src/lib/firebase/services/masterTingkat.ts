import { db } from '@/lib/firebase/config';
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  Timestamp,
} from 'firebase/firestore';
import { docToData, docsToArray } from '@/lib/firebase/utils';
import { isDemoMode, demoDb } from '@/lib/firebase/demo-data';
import type { FirestoreMasterTingkat } from '@/types/firestore';
import type { MasterTingkat } from '@/types';

const COLLECTION = 'masterTingkat';

function toApp(fs: FirestoreMasterTingkat, id: string): MasterTingkat {
  return {
    id,
    instansi: fs.instansi,
    progressionIndex: fs.progressionIndex,
    tingkatLabel: fs.tingkatLabel,
    jenjangId: fs.jenjangId,
    status: fs.status,
  };
}

export const masterTingkatService = {
  async get(id: string): Promise<MasterTingkat | null> {
    if (isDemoMode()) return demoDb.get<MasterTingkat>(COLLECTION, id);
    const snap = await getDoc(doc(db, COLLECTION, id));
    const data = docToData<FirestoreMasterTingkat>(snap);
    return data ? toApp(data, snap.id) : null;
  },

  async create(data: Omit<FirestoreMasterTingkat, 'createdAt' | 'updatedAt'>): Promise<string> {
    if (isDemoMode()) return demoDb.create(COLLECTION, data as Record<string, unknown>);
    const now = Timestamp.now();
    const ref = await addDoc(collection(db, COLLECTION), { ...data, createdAt: now, updatedAt: now });
    return ref.id;
  },

  async update(id: string, data: Partial<FirestoreMasterTingkat>): Promise<void> {
    if (isDemoMode()) { demoDb.update(COLLECTION, id, data as Record<string, unknown>); return; }
    await updateDoc(doc(db, COLLECTION, id), { ...data, updatedAt: Timestamp.now() });
  },

  async list(): Promise<MasterTingkat[]> {
    if (isDemoMode()) return demoDb.list<MasterTingkat>(COLLECTION);
    const snap = await getDocs(collection(db, COLLECTION));
    return docsToArray<FirestoreMasterTingkat>(snap).map((item) => {
      const fs = item as FirestoreMasterTingkat & { id: string };
      return toApp(fs, fs.id);
    });
  },

  async delete(id: string): Promise<void> {
    if (isDemoMode()) { demoDb.delete(COLLECTION, id); return; }
    await deleteDoc(doc(db, COLLECTION, id));
  },
};
