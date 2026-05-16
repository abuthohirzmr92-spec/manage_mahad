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
import type { FirestoreGovernanceCase } from '@/types/firestore';
import type { GovernanceCase, GovernanceReviewStatus } from '@/types';

const COLLECTION = 'governanceCases';

function toApp(fs: FirestoreGovernanceCase, id: string): GovernanceCase {
  return {
    id,
    sourceType: fs.sourceType,
    submittedBy: fs.submittedBy,
    submittedByRole: fs.submittedByRole,
    santriId: fs.santriId,
    santriName: fs.santriName,
    reason: fs.reason,
    severity: fs.severity,
    points: fs.points,
    date: fs.date,
    notes: fs.notes,
    masterPelanggaranId: fs.masterPelanggaranId,
    masterPelanggaranName: fs.masterPelanggaranName,
    relatedEntityType: fs.relatedEntityType,
    relatedEntityId: fs.relatedEntityId,
    reviewStatus: fs.reviewStatus,
    reviewedBy: fs.reviewedBy,
    reviewedByRole: fs.reviewedByRole,
    reviewedAt: fs.reviewedAt?.toDate?.() ? fs.reviewedAt.toDate().toISOString() : undefined,
    reviewNotes: fs.reviewNotes,
    violationId: fs.violationId,
    warningCount: fs.warningCount,
    createdAt: fs.createdAt?.toDate?.() ? fs.createdAt.toDate().toISOString() : new Date().toISOString(),
  };
}

export const governanceCaseService = {
  async get(id: string): Promise<GovernanceCase | null> {
    if (isDemoMode()) return demoDb.get<GovernanceCase>(COLLECTION, id);
    const snap = await getDoc(doc(db, COLLECTION, id));
    const data = docToData<FirestoreGovernanceCase>(snap);
    return data ? toApp(data, snap.id) : null;
  },

  async create(data: Omit<FirestoreGovernanceCase, 'createdAt' | 'updatedAt'>): Promise<string> {
    if (isDemoMode()) return demoDb.create(COLLECTION, data as Record<string, unknown>);
    const now = Timestamp.now();
    const ref = await addDoc(collection(db, COLLECTION), {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return ref.id;
  },

  async update(id: string, data: Partial<FirestoreGovernanceCase>): Promise<void> {
    if (isDemoMode()) { demoDb.update(COLLECTION, id, data as Record<string, unknown>); return; }
    await updateDoc(doc(db, COLLECTION, id), {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  /** Review a case — set outcome + reviewer info */
  async review(
    id: string,
    outcome: GovernanceReviewStatus,
    reviewerId: string,
    reviewerName: string,
    reviewerRole: string,
    reviewNotes?: string,
    violationId?: string,
  ): Promise<void> {
    const now = Timestamp.now();
    await updateDoc(doc(db, COLLECTION, id), {
      reviewStatus: outcome,
      reviewedBy: reviewerName,
      reviewedByRole: reviewerRole,
      reviewedAt: now,
      reviewNotes: reviewNotes ?? '',
      violationId: violationId ?? null,
      updatedAt: now,
    });
  },

  async list(field?: string, value?: unknown): Promise<GovernanceCase[]> {
    if (isDemoMode()) return demoDb.list<GovernanceCase>(COLLECTION, field, value);
    const constraints: QueryConstraint[] = [];
    if (field !== undefined && value !== undefined) {
      constraints.push(where(field, '==', value));
    }
    const snap = await getDocs(query(collection(db, COLLECTION), ...constraints));
    const items = docsToArray<FirestoreGovernanceCase>(snap);
    return items.map((item) =>
      toApp(item as FirestoreGovernanceCase, (item as unknown as { id: string }).id)
    );
  },

  subscribe(id: string, cb: (data: GovernanceCase | null) => void): () => void {
    if (isDemoMode()) {
      cb(demoDb.get<GovernanceCase>(COLLECTION, id));
      return () => {};
    }
    return onSnapshot(doc(db, COLLECTION, id), (snap) => {
      const data = docToData<FirestoreGovernanceCase>(snap);
      cb(data ? toApp(data, snap.id) : null);
    });
  },

  async delete(id: string): Promise<void> {
    if (isDemoMode()) { demoDb.delete(COLLECTION, id); return; }
    await deleteDoc(doc(db, COLLECTION, id));
  },
};
