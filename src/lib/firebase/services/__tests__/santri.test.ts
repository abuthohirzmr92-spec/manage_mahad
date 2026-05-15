// ========================================
// Santri Service — Unit Tests
// ========================================

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ----------------------------------------------------------------
// Firebase mocks — hoisted by vi.mock so they apply before imports
// ----------------------------------------------------------------

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({ type: 'collection' })),
  doc: vi.fn((_db: unknown, _collection: string, ...args: string[]) => ({
    id: args[0],
    path: `${_collection}/${args.join('/')}`,
    converter: null as any,
    type: 'document' as const,
    firestore: null as any,
    parent: null as any,
  } as any)),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn((...args: unknown[]) => ({ type: 'query', args })),
  where: vi.fn((field: string, op: string, value: unknown) => ({ field, op, value })),
  onSnapshot: vi.fn(() => vi.fn()),
  Timestamp: {
    now: vi.fn(() => ({ seconds: 1_234_567_890, nanoseconds: 0, toDate: () => new Date('2024-01-01') })),
    fromDate: vi.fn((d: Date) => ({ seconds: Math.floor(d.getTime() / 1000), nanoseconds: 0, toDate: () => d })),
  },
}));

vi.mock('@/lib/firebase/config', () => ({
  db: {},
}));

// ----------------------------------------------------------------
// Imports after mocks are registered
// ----------------------------------------------------------------

import {
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  where,
  Timestamp,
} from 'firebase/firestore';
import { santriService } from '../santri';

// ----------------------------------------------------------------
// Test data
// ----------------------------------------------------------------

const mockTimestamp = { seconds: 1_234_567_890, nanoseconds: 0, toDate: () => new Date('2024-01-01') };

const mockFirestoreSantri = {
  nis: '2024001',
  name: 'Muhammad Rizki Aditya',
  asrama: 'Al-Fatih',
  kamar: 'A-101',
  asramaId: '1',
  kamarId: 'k1',
  kelas: '10A',
  status: 'aktif' as const,
  gender: 'L' as const,
  waliId: '3',
  waliName: 'Bapak Ridwan',
  waliPhone: '081234567890',
  joinDate: '2024-07-15',
  asalKota: 'Bandung',
  asalProvinsi: 'Jawa Barat',
  angkatanMasuk: 2024,
  totalPoinPelanggaran: 15,
  totalPrestasi: 80,
  statusKarakter: 'Baik' as const,
  statusSP: 'Tidak Ada' as const,
  createdAt: mockTimestamp,
  updatedAt: mockTimestamp,
};

// ----------------------------------------------------------------
// Tests
// ----------------------------------------------------------------

describe('santriService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --------------- create ---------------

  describe('create', () => {
    it('adds a document and returns the auto-generated ID', async () => {
      const mockAddDoc = vi.mocked(addDoc);
      mockAddDoc.mockResolvedValue({ id: 'new-santri-id' } as any);

      const { createdAt, updatedAt, ...input } = mockFirestoreSantri;
      const id = await santriService.create(input);

      expect(id).toBe('new-santri-id');
      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'collection' }),
        expect.objectContaining({
          nis: '2024001',
          name: 'Muhammad Rizki Aditya',
          status: 'aktif',
          createdAt: expect.objectContaining({ seconds: 1_234_567_890 }),
          updatedAt: expect.objectContaining({ seconds: 1_234_567_890 }),
        }),
      );
    });
  });

  // --------------- get ---------------

  describe('get', () => {
    it('returns a santri by document ID', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => mockFirestoreSantri,
        id: '1',
      } as any);

      const result = await santriService.get('1');

      expect(result).not.toBeNull();
      expect(result!.id).toBe('1');
      expect(result!.name).toBe('Muhammad Rizki Aditya');
      expect(result!.nis).toBe('2024001');
      expect(result!.status).toBe('aktif');
    });

    it('returns null when the document does not exist', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as any);

      const result = await santriService.get('nonexistent');
      expect(result).toBeNull();
    });
  });

  // --------------- update ---------------

  describe('update', () => {
    it('modifies specified fields and sets updatedAt', async () => {
      const mockUpdateDoc = vi.mocked(updateDoc);

      await santriService.update('1', { name: 'Updated Name', status: 'cuti' });

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.objectContaining({ id: '1' }),
        expect.objectContaining({
          name: 'Updated Name',
          status: 'cuti',
          updatedAt: expect.objectContaining({ seconds: 1_234_567_890 }),
        }),
      );
    });
  });

  // --------------- list ---------------

  describe('list', () => {
    it('returns all santri when no filter is provided', async () => {
      vi.mocked(getDocs).mockResolvedValue({
        docs: [
          { id: '1', data: () => mockFirestoreSantri },
          {
            id: '2',
            data: () => ({
              ...mockFirestoreSantri,
              name: 'Abdullah Firdaus',
              nis: '2024002',
            }),
          },
        ],
      } as any);

      const results = await santriService.list();

      expect(results).toHaveLength(2);
      expect(results[0].name).toBe('Muhammad Rizki Aditya');
      expect(results[1].name).toBe('Abdullah Firdaus');
    });

    it('filters by field when field and value are provided', async () => {
      vi.mocked(getDocs).mockResolvedValue({
        docs: [
          { id: '3', data: () => mockFirestoreSantri },
        ],
      } as any);

      const results = await santriService.list('status', 'aktif');

      expect(results).toHaveLength(1);
      expect(vi.mocked(where)).toHaveBeenCalledWith('status', '==', 'aktif');
    });
  });

  // --------------- delete ---------------

  describe('delete', () => {
    it('removes a document by ID', async () => {
      const mockDeleteDoc = vi.mocked(deleteDoc);

      await santriService.delete('1');

      expect(mockDeleteDoc).toHaveBeenCalledWith(
        expect.objectContaining({ id: '1' }),
      );
    });
  });
});
