// ========================================
// Demo Mode Data Provider
// Fallback mock data when NEXT_PUBLIC_DEMO_MODE=true
// Includes in-memory mutable store for full CRUD support.
// ========================================

import { mockSantri, mockAlumni, mockAsrama, mockKamar, mockMasterPelanggaran, mockPelanggaran, mockHukuman, mockQuest, mockNotifications } from '@/data/mock';
import { mockKelasFormal, mockKelasDiniyah, mockKelasQuran } from '@/data/mock-kelas';
import { mockMapelFormal, mockMapelDiniyah, mockMapelQuran } from '@/data/mock-mapel';
import type { GlobalTolerancePolicy, JenjangToleranceOverride } from '@/types';

const isDemo = () => process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export function isDemoMode(): boolean {
  return isDemo();
}

// ========================================
// In-Memory Demo Store — mutable copies of mock data
// ========================================

let _nextId = 1000;

function nextId(): string {
  return String(++_nextId);
}

function deepClone<T>(arr: readonly T[]): T[] {
  return arr.map((item) => ({ ...item } as unknown as T));
}

const store: Record<string, unknown[]> = {};
let initialized = false;

function initStore() {
  if (initialized) return;
  initialized = true;
  store['santri'] = deepClone(mockSantri);
  store['alumni'] = deepClone(mockAlumni);
  store['asrama'] = deepClone(mockAsrama);
  store['kamar'] = deepClone(mockKamar);
  store['kelas'] = deepClone([...mockKelasFormal, ...mockKelasDiniyah, ...mockKelasQuran]);
  store['mapel'] = deepClone([...mockMapelFormal, ...mockMapelDiniyah, ...mockMapelQuran]);
  store['masterPelanggaran'] = deepClone(mockMasterPelanggaran);
  store['pelanggaran'] = deepClone(mockPelanggaran);
  store['hukuman'] = deepClone(mockHukuman);
  store['quest'] = deepClone(mockQuest);
  store['notifications'] = deepClone(mockNotifications);
  store['tolerancePolicies'] = [
    { id: 'global', type: 'global', isActive: true, limits: { ringan: 3, sedang: 2, berat: 1, sangat_berat: 0 } } as GlobalTolerancePolicy,
    { id: 'jo-1', type: 'jenjang', jenjang: 'Tsanawiyah', isActive: true, limits: { ringan: 1, sedang: 0, berat: 0, sangat_berat: 0 } } as JenjangToleranceOverride,
  ];
  store['teacherAssignments'] = [
    { id: 'ta-1', mapelId: 'f1', kelasId: 'cls-8-7-Abu-Bakar', kelasName: '7 Abu Bakar', guruName: 'Ust. Ahmad Zain',   status: 'active' },
    { id: 'ta-2', mapelId: 'f1', kelasId: 'cls-8-7-Umar',     kelasName: '7 Umar',      guruName: 'Ust. Budi Santoso', status: 'active' },
    { id: 'ta-3', mapelId: 'f2', kelasId: 'cls-8-7-Abu-Bakar', kelasName: '7 Abu Bakar', guruName: 'Ust. Ali Riza',     status: 'active' },
    { id: 'ta-4', mapelId: 'f21', kelasId: 'cls-11-10-IPA-1', kelasName: '10 IPA 1',    guruName: 'Ust. Fikri',        status: 'active' },
  ];
  store['masterHukuman'] = [
    { id: 'h1', name: 'Bersih-bersih lingkungan', severityScope: ['ringan'], minimumTingkat: 1, status: 'active' },
    { id: 'h2', name: 'Hafalan surat pendek', severityScope: ['ringan', 'sedang'], minimumTingkat: 1, status: 'active' },
    { id: 'h3', name: "Ta'zir ringan (berdiri di lapangan)", severityScope: ['ringan', 'sedang'], minimumTingkat: 1, status: 'active' },
    { id: 'h4', name: 'Khidmah masjid 3 hari', severityScope: ['sedang'], minimumTingkat: 2, status: 'active' },
    { id: 'h5', name: 'Panggilan wali', severityScope: ['sedang', 'berat'], minimumTingkat: 1, status: 'active' },
    { id: 'h6', name: 'Skorsing 3 hari', severityScope: ['berat'], minimumTingkat: 3, status: 'active' },
    { id: 'h7', name: 'Skorsing 7 hari', severityScope: ['berat', 'sangat_berat'], minimumTingkat: 3, status: 'active' },
    { id: 'h8', name: 'Skorsing 14 hari', severityScope: ['sangat_berat'], minimumTingkat: 5, status: 'active' },
    { id: 'h9', name: 'Dikeluarkan dari asrama', severityScope: ['sangat_berat'], minimumTingkat: 7, status: 'active' },
    { id: 'h10', name: 'Dikembalikan ke orang tua', severityScope: ['sangat_berat'], minimumTingkat: 7, status: 'active' },
    { id: 'h11', name: 'Membersihkan kamar mandi', severityScope: ['ringan'], minimumTingkat: 1, status: 'active' },
    { id: 'h12', name: 'Menulis istighfar 100x', severityScope: ['ringan'], minimumTingkat: 1, status: 'active' },
  ];
  store['masterJenjang'] = [
    // ── Madin ──────────────────────────────────────────────────────────
    { id: 'mj-1', namaJenjang: 'Tamhidi',    instansi: 'madin', progressionIndexes: [1],       status: 'active' },
    { id: 'mj-2', namaJenjang: "Ibtida'i",   instansi: 'madin', progressionIndexes: [2, 3, 4], status: 'active' },
    { id: 'mj-3', namaJenjang: 'Tsanawiyah', instansi: 'madin', progressionIndexes: [5, 6, 7], status: 'active' },
    // ── Madqur ─────────────────────────────────────────────────────────
    { id: 'mj-4', namaJenjang: 'Tahsin',     instansi: 'madqur', progressionIndexes: [8, 9],      status: 'active' },
    { id: 'mj-5', namaJenjang: 'Tahfidz',    instansi: 'madqur', progressionIndexes: [10, 11, 12], status: 'active' },
    // ── Depag ──────────────────────────────────────────────────────────
    { id: 'mj-6', namaJenjang: 'MTs',        instansi: 'depag', progressionIndexes: [13, 14, 15], status: 'active' },
    { id: 'mj-7', namaJenjang: 'MA',         instansi: 'depag', progressionIndexes: [16, 17, 18], status: 'active' },
  ];
  store['masterTingkat'] = [
    // ── Madin ──────────────────────────────────────────────────────────
    { id: 'mt-1',  instansi: 'madin', progressionIndex: 1,  tingkatLabel: 'Tamhidi',        jenjangId: 'mj-1', status: 'active' },
    { id: 'mt-2',  instansi: 'madin', progressionIndex: 2,  tingkatLabel: 'Kelas 1',        jenjangId: 'mj-2', status: 'active' },
    { id: 'mt-3',  instansi: 'madin', progressionIndex: 3,  tingkatLabel: 'Kelas 2',        jenjangId: 'mj-2', status: 'active' },
    { id: 'mt-4',  instansi: 'madin', progressionIndex: 4,  tingkatLabel: 'Kelas 3',        jenjangId: 'mj-2', status: 'active' },
    { id: 'mt-5',  instansi: 'madin', progressionIndex: 5,  tingkatLabel: '1 Tsanawiyah',   jenjangId: 'mj-3', status: 'active' },
    { id: 'mt-6',  instansi: 'madin', progressionIndex: 6,  tingkatLabel: '2 Tsanawiyah',   jenjangId: 'mj-3', status: 'active' },
    { id: 'mt-7',  instansi: 'madin', progressionIndex: 7,  tingkatLabel: '3 Tsanawiyah',   jenjangId: 'mj-3', status: 'active' },
    // ── Madqur ─────────────────────────────────────────────────────────
    { id: 'mt-8',  instansi: 'madqur', progressionIndex: 8,  tingkatLabel: 'Tahsin Dasar',     jenjangId: 'mj-4', status: 'active' },
    { id: 'mt-9',  instansi: 'madqur', progressionIndex: 9,  tingkatLabel: 'Tahsin Lanjutan',  jenjangId: 'mj-4', status: 'active' },
    { id: 'mt-10', instansi: 'madqur', progressionIndex: 10, tingkatLabel: 'Tahfidz 1',        jenjangId: 'mj-5', status: 'active' },
    { id: 'mt-11', instansi: 'madqur', progressionIndex: 11, tingkatLabel: 'Tahfidz 2',        jenjangId: 'mj-5', status: 'active' },
    { id: 'mt-12', instansi: 'madqur', progressionIndex: 12, tingkatLabel: 'Tahfidz 3',        jenjangId: 'mj-5', status: 'active' },
    // ── Depag ──────────────────────────────────────────────────────────
    { id: 'mt-13', instansi: 'depag', progressionIndex: 13, tingkatLabel: 'Kelas 7',  jenjangId: 'mj-6', status: 'active' },
    { id: 'mt-14', instansi: 'depag', progressionIndex: 14, tingkatLabel: 'Kelas 8',  jenjangId: 'mj-6', status: 'active' },
    { id: 'mt-15', instansi: 'depag', progressionIndex: 15, tingkatLabel: 'Kelas 9',  jenjangId: 'mj-6', status: 'active' },
    { id: 'mt-16', instansi: 'depag', progressionIndex: 16, tingkatLabel: 'Kelas 10', jenjangId: 'mj-7', status: 'active' },
    { id: 'mt-17', instansi: 'depag', progressionIndex: 17, tingkatLabel: 'Kelas 11', jenjangId: 'mj-7', status: 'active' },
    { id: 'mt-18', instansi: 'depag', progressionIndex: 18, tingkatLabel: 'Kelas 12', jenjangId: 'mj-7', status: 'active' },
  ];
}

function ensure(collectionName: string): unknown[] {
  initStore();
  if (!store[collectionName]) store[collectionName] = [];
  return store[collectionName];
}

// ── Reactive subscription system ──────────────────────────────────────────────
type Listener = (collectionName: string) => void;
const _listeners = new Set<Listener>();

function notify(collectionName: string) {
  for (const fn of _listeners) {
    try { fn(collectionName); } catch { /* swallow */ }
  }
}

export const demoDb = {
  get<T>(collectionName: string, id: string): T | null {
    const items = ensure(collectionName) as Array<{ id: string } & T>;
    return (items.find((item) => item.id === id) as T) ?? null;
  },

  create(collectionName: string, data: Record<string, unknown>): string {
    const items = ensure(collectionName);
    const id = nextId();
    items.push({ id, ...data });
    console.log(`[demoDb.create] collection="${collectionName}" id="${id}" total=${items.length} item=`, items[items.length - 1]);
    notify(collectionName);
    return id;
  },

  update(collectionName: string, id: string, data: Record<string, unknown>): void {
    const items = ensure(collectionName) as Array<{ id: string } & Record<string, unknown>>;
    const idx = items.findIndex((item) => item.id === id);
    if (idx !== -1) { Object.assign(items[idx], data); notify(collectionName); }
  },

  delete(collectionName: string, id: string): void {
    const items = ensure(collectionName) as Array<{ id: string }>;
    const idx = items.findIndex((item) => item.id === id);
    if (idx !== -1) { items.splice(idx, 1); notify(collectionName); }
  },

  list<T>(collectionName: string, field?: string, value?: unknown): T[] {
    const items = ensure(collectionName) as T[];
    if (field === undefined || value === undefined) return [...items];
    return items.filter((item) => (item as Record<string, unknown>)[field] === value);
  },

  /** Subscribe to mutations on any collection. Returns unsubscribe function. */
  subscribe(fn: Listener): () => void {
    _listeners.add(fn);
    return () => { _listeners.delete(fn); };
  },
};

/** Get mock data for a given collection name (read-only snapshot for hooks). */
export function getDemoCollection(collectionName: string): unknown[] {
  switch (collectionName) {
    case 'santri':
      return ensure('santri');
    case 'alumni':
      return ensure('alumni');
    case 'asrama':
      return ensure('asrama');
    case 'kamar':
      return ensure('kamar');
    case 'kelas':
      return ensure('kelas');
    case 'mapel':
      return ensure('mapel');
    case 'masterPelanggaran':
      return ensure('masterPelanggaran');
    case 'pelanggaran':
      return ensure('pelanggaran');
    case 'hukuman':
      return ensure('hukuman');
    case 'quest':
      return ensure('quest');
    case 'notifications':
      return ensure('notifications');
    case 'tolerancePolicies':
      return ensure('tolerancePolicies');
    case 'teacherAssignments':
      return ensure('teacherAssignments');
    case 'masterHukuman':
      return ensure('masterHukuman');
    case 'masterJenjang':
      return ensure('masterJenjang');
    case 'masterTingkat':
      return ensure('masterTingkat');
    case 'users':
      return ensure('users');
    default:
      return [];
  }
}
