import { db } from '@/lib/firebase/config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  type QueryConstraint,
} from 'firebase/firestore';
import { docToData, docsToArray } from '@/lib/firebase/utils';
import { isDemoMode, demoDb } from '@/lib/firebase/demo-data';
import type { HealthVisit, FirestoreHealthVisit } from '@/types/health';
import { calculateDuration } from '@/lib/health-engine';

const COLLECTION = 'healthVisits';

function toApp(fs: FirestoreHealthVisit, id: string): HealthVisit {
  return {
    id,
    santriId: fs.santriId,
    santriName: fs.santriName,
    keluhan: fs.keluhan,
    category: fs.category,
    severity: fs.severity,
    status: fs.status,
    petugasId: fs.petugasId,
    petugasName: fs.petugasName,
    tindakan: fs.tindakan,
    catatan: fs.catatan,
    masukAt: fs.masukAt,
    selesaiAt: fs.selesaiAt,
    durasiMenit: fs.durasiMenit,
    permissionId: fs.permissionId,
    createdAt:
      fs.createdAt?.toDate?.()?.toISOString?.() ??
      (fs.createdAt as unknown as string),
    updatedAt:
      fs.updatedAt?.toDate?.()?.toISOString?.() ??
      (fs.updatedAt as unknown as string),
  };
}

export const healthVisitService = {
  async get(id: string): Promise<HealthVisit | null> {
    if (isDemoMode()) return demoDb.get<HealthVisit>(COLLECTION, id);
    const snap = await getDoc(doc(db, COLLECTION, id));
    const data = docToData<FirestoreHealthVisit>(snap);
    return data ? toApp(data, snap.id) : null;
  },

  async create(
    data: Omit<FirestoreHealthVisit, 'createdAt' | 'updatedAt'>,
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
    data: Partial<FirestoreHealthVisit>,
  ): Promise<void> {
    if (isDemoMode()) { demoDb.update(COLLECTION, id, data as Record<string, unknown>); return; }
    await updateDoc(doc(db, COLLECTION, id), {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  async list(field?: string, value?: unknown): Promise<HealthVisit[]> {
    if (isDemoMode()) return demoDb.list<HealthVisit>(COLLECTION, field, value);
    const constraints: QueryConstraint[] = [];
    if (field !== undefined && value !== undefined) {
      constraints.push(where(field, '==', value));
    }
    constraints.push(orderBy('masukAt', 'desc'));
    const snap = await getDocs(query(collection(db, COLLECTION), ...constraints));
    const items = docsToArray<FirestoreHealthVisit>(snap);
    return items.map((item) =>
      toApp(item as FirestoreHealthVisit, (item as unknown as { id: string }).id),
    );
  },

  subscribe(
    id: string,
    cb: (data: HealthVisit | null) => void,
  ): () => void {
    if (isDemoMode()) {
      cb(demoDb.get<HealthVisit>(COLLECTION, id));
      return () => {};
    }
    return onSnapshot(doc(db, COLLECTION, id), (snap) => {
      const data = docToData<FirestoreHealthVisit>(snap);
      cb(data ? toApp(data, snap.id) : null);
    });
  },

  async complete(id: string): Promise<void> {
    if (isDemoMode()) {
      const visit = demoDb.get<HealthVisit>(COLLECTION, id);
      if (!visit) return;
      const now = new Date().toISOString();
      const durasi = calculateDuration(visit.masukAt, now);
      demoDb.update(COLLECTION, id, {
        status: 'selesai',
        selesaiAt: now,
        durasiMenit: durasi,
        updatedAt: now,
      } as Record<string, unknown>);
      return;
    }
    const snap = await getDoc(doc(db, COLLECTION, id));
    const data = docToData<FirestoreHealthVisit>(snap);
    if (!data) return;
    const now = Timestamp.now();
    const nowISO = now.toDate().toISOString();
    const durasi = calculateDuration(data.masukAt, nowISO);
    await updateDoc(doc(db, COLLECTION, id), {
      status: 'selesai',
      selesaiAt: nowISO,
      durasiMenit: durasi,
      updatedAt: now,
    });
  },

  async startObservation(id: string): Promise<void> {
    await healthVisitService.update(id, { status: 'observasi' });
  },

  async needReferral(id: string): Promise<void> {
    await healthVisitService.update(id, { status: 'perlu_berobat_luar' });
  },
};
