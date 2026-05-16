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
  onSnapshot,
  Timestamp,
  type QueryConstraint,
} from 'firebase/firestore';
import { docToData, docsToArray } from '@/lib/firebase/utils';
import { isDemoMode, demoDb } from '@/lib/firebase/demo-data';
import type { HealthPermission, FirestoreHealthPermission } from '@/types/health';

const COLLECTION = 'healthPermissions';

function toApp(fs: FirestoreHealthPermission, id: string): HealthPermission {
  return {
    id,
    santriId: fs.santriId,
    santriName: fs.santriName,
    healthVisitId: fs.healthVisitId,
    keluhan: fs.keluhan,
    severity: fs.severity,
    status: fs.status,
    tujuanBerobat: fs.tujuanBerobat,
    alasan: fs.alasan,
    requiresSupervisor: fs.requiresSupervisor,
    supervisorId: fs.supervisorId,
    supervisorName: fs.supervisorName,
    requestedById: fs.requestedById,
    requestedByName: fs.requestedByName,
    approvedById: fs.approvedById,
    approvedByName: fs.approvedByName,
    keluarAt: fs.keluarAt,
    kembaliAt: fs.kembaliAt,
    catatan: fs.catatan,
    createdAt:
      fs.createdAt?.toDate?.()?.toISOString?.() ??
      (fs.createdAt as unknown as string),
    updatedAt:
      fs.updatedAt?.toDate?.()?.toISOString?.() ??
      (fs.updatedAt as unknown as string),
  };
}

export const healthPermissionService = {
  async get(id: string): Promise<HealthPermission | null> {
    if (isDemoMode()) return demoDb.get<HealthPermission>(COLLECTION, id);
    const snap = await getDoc(doc(db, COLLECTION, id));
    const data = docToData<FirestoreHealthPermission>(snap);
    return data ? toApp(data, snap.id) : null;
  },

  async create(
    data: Omit<FirestoreHealthPermission, 'createdAt' | 'updatedAt'>,
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
    data: Partial<FirestoreHealthPermission>,
  ): Promise<void> {
    if (isDemoMode()) { demoDb.update(COLLECTION, id, data as Record<string, unknown>); return; }
    await updateDoc(doc(db, COLLECTION, id), {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  async list(field?: string, value?: unknown): Promise<HealthPermission[]> {
    if (isDemoMode()) return demoDb.list<HealthPermission>(COLLECTION, field, value);
    const constraints: QueryConstraint[] = [];
    if (field !== undefined && value !== undefined) {
      constraints.push(where(field, '==', value));
    }
    const snap = await getDocs(query(collection(db, COLLECTION), ...constraints));
    const items = docsToArray<FirestoreHealthPermission>(snap);
    return items.map((item) =>
      toApp(item as FirestoreHealthPermission, (item as unknown as { id: string }).id),
    );
  },

  subscribe(
    id: string,
    cb: (data: HealthPermission | null) => void,
  ): () => void {
    if (isDemoMode()) {
      cb(demoDb.get<HealthPermission>(COLLECTION, id));
      return () => {};
    }
    return onSnapshot(doc(db, COLLECTION, id), (snap) => {
      const data = docToData<FirestoreHealthPermission>(snap);
      cb(data ? toApp(data, snap.id) : null);
    });
  },

  async approve(id: string, approvedById: string, approvedByName: string): Promise<void> {
    await healthPermissionService.update(id, {
      status: 'disetujui',
      approvedById,
      approvedByName,
    });
  },

  async reject(id: string, _rejectedBy: string): Promise<void> {
    await healthPermissionService.update(id, { status: 'ditolak' });
  },

  async depart(id: string): Promise<void> {
    const now = new Date().toISOString();
    await healthPermissionService.update(id, {
      status: 'dalam_perjalanan',
      keluarAt: now,
    });
  },

  async return(id: string): Promise<void> {
    const now = new Date().toISOString();
    await healthPermissionService.update(id, {
      status: 'kembali',
      kembaliAt: now,
    });
  },

  async complete(id: string): Promise<void> {
    await healthPermissionService.update(id, { status: 'selesai' });
  },
};
