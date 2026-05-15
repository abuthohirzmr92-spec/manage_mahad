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
} from 'firebase/firestore';
import { docToData, docsToArray } from '@/lib/firebase/utils';
import { isDemoMode, demoDb } from '@/lib/firebase/demo-data';
import type { FirestoreTolerancePolicy } from '@/types/firestore';
import type { TolerancePolicy, GlobalTolerancePolicy, JenjangToleranceOverride } from '@/types';

const COLLECTION = 'tolerancePolicies';

function toApp(fs: FirestoreTolerancePolicy, id: string): TolerancePolicy {
  if (fs.type === 'global') {
    return { id: 'global' as const, type: 'global' as const, isActive: fs.isActive, limits: { ...fs.limits } };
  }
  return {
    id,
    type: 'jenjang' as const,
    jenjang: fs.jenjang ?? '',
    isActive: fs.isActive,
    limits: { ...fs.limits },
  };
}

export const tolerancePolicyService = {
  async getGlobal(): Promise<GlobalTolerancePolicy | null> {
    if (isDemoMode()) return demoDb.get<GlobalTolerancePolicy>(COLLECTION, 'global');
    const snap = await getDoc(doc(db, COLLECTION, 'global'));
    const data = docToData<FirestoreTolerancePolicy>(snap);
    return data ? (toApp(data, 'global') as GlobalTolerancePolicy) : null;
  },

  async saveGlobal(data: { isActive: boolean; limits: GlobalTolerancePolicy['limits'] }): Promise<void> {
    if (isDemoMode()) {
      demoDb.update(COLLECTION, 'global', { isActive: data.isActive, limits: data.limits } as Record<string, unknown>);
      return;
    }
    await updateDoc(doc(db, COLLECTION, 'global'), {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  async listOverrides(): Promise<JenjangToleranceOverride[]> {
    if (isDemoMode()) {
      const all = demoDb.list<TolerancePolicy>(COLLECTION) as TolerancePolicy[];
      return all.filter((p) => p.type === 'jenjang') as JenjangToleranceOverride[];
    }
    const q = query(collection(db, COLLECTION), where('type', '==', 'jenjang'));
    const snap = await getDocs(q);
    const items = docsToArray<FirestoreTolerancePolicy>(snap);
    return items.map((item) =>
      toApp(item as FirestoreTolerancePolicy, (item as unknown as { id: string }).id) as JenjangToleranceOverride
    );
  },

  async createOverride(data: { jenjang: string; isActive: boolean; limits: JenjangToleranceOverride['limits'] }): Promise<string> {
    if (isDemoMode()) return demoDb.create(COLLECTION, { type: 'jenjang', ...data } as Record<string, unknown>);
    const now = Timestamp.now();
    const ref = await addDoc(collection(db, COLLECTION), {
      type: 'jenjang',
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return ref.id;
  },

  async updateOverride(id: string, data: Partial<JenjangToleranceOverride>): Promise<void> {
    if (isDemoMode()) { demoDb.update(COLLECTION, id, data as Record<string, unknown>); return; }
    await updateDoc(doc(db, COLLECTION, id), {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  async deleteOverride(id: string): Promise<void> {
    if (isDemoMode()) { demoDb.delete(COLLECTION, id); return; }
    await deleteDoc(doc(db, COLLECTION, id));
  },

  subscribeGlobal(cb: (data: GlobalTolerancePolicy | null) => void): () => void {
    if (isDemoMode()) {
      cb(demoDb.get<GlobalTolerancePolicy>(COLLECTION, 'global'));
      return () => {};
    }
    return onSnapshot(doc(db, COLLECTION, 'global'), (snap) => {
      const data = docToData<FirestoreTolerancePolicy>(snap);
      cb(data ? (toApp(data, 'global') as GlobalTolerancePolicy) : null);
    });
  },
};
