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
import type { FirestoreSantri } from '@/types/firestore';
import type { Santri } from '@/types';

const COLLECTION = 'santri';

function toApp(fs: FirestoreSantri, id: string): Santri {
  return {
    id,
    nis: fs.nis,
    name: fs.name,
    asrama: fs.asrama,
    kamar: fs.kamar,
    asramaId: fs.asramaId,
    kamarId: fs.kamarId,
    kelas: fs.kelas,
    status: fs.status,
    gender: fs.gender,
    photoUrl: fs.photoUrl,
    waliId: fs.waliId,
    waliName: fs.waliName,
    waliPhone: fs.waliPhone,
    joinDate: fs.joinDate,
    asalKota: fs.asalKota,
    asalProvinsi: fs.asalProvinsi,
    angkatanMasuk: fs.angkatanMasuk,
    totalPoinPelanggaran: fs.totalPoinPelanggaran,
    totalPrestasi: fs.totalPrestasi,
    statusKarakter: fs.statusKarakter,
    statusSP: fs.statusSP,
  };
}

export const santriService = {
  async get(id: string): Promise<Santri | null> {
    if (isDemoMode()) return demoDb.get<Santri>(COLLECTION, id);
    const snap = await getDoc(doc(db, COLLECTION, id));
    const data = docToData<FirestoreSantri>(snap);
    return data ? toApp(data, snap.id) : null;
  },

  async create(
    data: Omit<FirestoreSantri, 'createdAt' | 'updatedAt'>
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
    data: Partial<FirestoreSantri>
  ): Promise<void> {
    if (isDemoMode()) { demoDb.update(COLLECTION, id, data as Record<string, unknown>); return; }
    await updateDoc(doc(db, COLLECTION, id), {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  async list(field?: string, value?: unknown): Promise<Santri[]> {
    if (isDemoMode()) return demoDb.list<Santri>(COLLECTION, field, value);
    const constraints: QueryConstraint[] = [];
    if (field !== undefined && value !== undefined) {
      constraints.push(where(field, '==', value));
    }
    const snap = await getDocs(query(collection(db, COLLECTION), ...constraints));
    const items = docsToArray<FirestoreSantri>(snap);
    return items.map((item) =>
      toApp(item as FirestoreSantri, (item as unknown as { id: string }).id)
    );
  },

  async listByKelas(kelas: string): Promise<Santri[]> {
    if (isDemoMode()) return demoDb.list<Santri>(COLLECTION, 'kelas', kelas);
    const q = query(collection(db, COLLECTION), where('kelas', '==', kelas));
    const snap = await getDocs(q);
    const items = docsToArray<FirestoreSantri>(snap);
    return items.map((item) =>
      toApp(item as FirestoreSantri, (item as unknown as { id: string }).id)
    );
  },

  subscribe(
    id: string,
    cb: (data: Santri | null) => void
  ): () => void {
    if (isDemoMode()) {
      cb(demoDb.get<Santri>(COLLECTION, id));
      return () => {};
    }
    return onSnapshot(doc(db, COLLECTION, id), (snap) => {
      const data = docToData<FirestoreSantri>(snap);
      cb(data ? toApp(data, snap.id) : null);
    });
  },

  async delete(id: string): Promise<void> {
    if (isDemoMode()) { demoDb.delete(COLLECTION, id); return; }
    await deleteDoc(doc(db, COLLECTION, id));
  },
};
