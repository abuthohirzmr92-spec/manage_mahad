import { db } from '@/lib/firebase/config';
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  Timestamp,
} from 'firebase/firestore';
import { docToData, docsToArray } from '@/lib/firebase/utils';
import { isDemoMode, demoDb } from '@/lib/firebase/demo-data';
import type { FirestoreMasterJenjang } from '@/types/firestore';
import type { MasterJenjang } from '@/types';

const COLLECTION = 'masterJenjang';

function toApp(fs: FirestoreMasterJenjang, id: string): MasterJenjang {
  return {
    id,
    namaJenjang: fs.namaJenjang,
    instansi: fs.instansi,
    progressionIndexes: fs.progressionIndexes,
    status: fs.status,
  };
}

export const masterJenjangService = {
  async get(id: string): Promise<MasterJenjang | null> {
    if (isDemoMode()) return demoDb.get<MasterJenjang>(COLLECTION, id);
    const snap = await getDoc(doc(db, COLLECTION, id));
    const data = docToData<FirestoreMasterJenjang>(snap);
    return data ? toApp(data, snap.id) : null;
  },

  async create(data: Omit<FirestoreMasterJenjang, 'createdAt' | 'updatedAt'>): Promise<string> {
    console.log('[masterJenjangService.create] called with data:', JSON.stringify(data, null, 2));
    if (isDemoMode()) {
      const id = demoDb.create(COLLECTION, data as Record<string, unknown>);
      console.log('[masterJenjangService.create] demo mode — created id:', id);
      return id;
    }
    const now = Timestamp.now();
    const ref = await addDoc(collection(db, COLLECTION), { ...data, createdAt: now, updatedAt: now });
    console.log('[masterJenjangService.create] firestore — created ref:', ref.id);
    return ref.id;
  },

  async update(id: string, data: Partial<FirestoreMasterJenjang>): Promise<void> {
    if (isDemoMode()) { demoDb.update(COLLECTION, id, data as Record<string, unknown>); return; }
    await updateDoc(doc(db, COLLECTION, id), { ...data, updatedAt: Timestamp.now() });
  },

  async list(): Promise<MasterJenjang[]> {
    if (isDemoMode()) return demoDb.list<MasterJenjang>(COLLECTION);
    const snap = await getDocs(collection(db, COLLECTION));
    return docsToArray<FirestoreMasterJenjang>(snap).map((item) => {
      const fs = item as FirestoreMasterJenjang & { id: string };
      return toApp(fs, fs.id);
    });
  },

  async delete(id: string): Promise<void> {
    if (isDemoMode()) { demoDb.delete(COLLECTION, id); return; }
    await deleteDoc(doc(db, COLLECTION, id));
  },
};
