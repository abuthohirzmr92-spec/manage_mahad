// ========================================
// Pelanggaran Service — Unit Tests
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
} from 'firebase/firestore';
import { pelanggaranService } from '../pelanggaran';

// ----------------------------------------------------------------
// Test data
// ----------------------------------------------------------------

const mockTimestamp = { seconds: 1_234_567_890, nanoseconds: 0, toDate: () => new Date('2024-01-01') };

const mockFirestorePelanggaran = {
  santriId: '1',
  santriName: 'Muhammad Rizki Aditya',
  pelanggaranId: '1',
  pelanggaranName: 'Terlambat Sholat Berjamaah',
  severity: 'ringan' as const,
  points: 5,
  date: '2025-05-10',
  reportedBy: 'Ustadz Hasan',
  status: 'confirmed' as const,
  statusHukuman: 'selesai' as const,
  createdAt: mockTimestamp,
  updatedAt: mockTimestamp,
};

// ----------------------------------------------------------------
// Tests
// ----------------------------------------------------------------

describe('pelanggaranService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --------------- create ---------------

  describe('create', () => {
    it('adds a document and returns the auto-generated ID', async () => {
      const mockAddDoc = vi.mocked(addDoc);
      mockAddDoc.mockResolvedValue({ id: 'new-pelanggaran-id' } as any);

      const { createdAt, updatedAt, ...input } = mockFirestorePelanggaran;
      const id = await pelanggaranService.create(input);

      expect(id).toBe('new-pelanggaran-id');
      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'collection' }),
        expect.objectContaining({
          santriId: '1',
          pelanggaranName: 'Terlambat Sholat Berjamaah',
          points: 5,
          status: 'confirmed',
          createdAt: expect.objectContaining({ seconds: 1_234_567_890 }),
          updatedAt: expect.objectContaining({ seconds: 1_234_567_890 }),
        }),
      );
    });
  });

  // --------------- get ---------------

  describe('get', () => {
    it('returns a pelanggaran by document ID', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => mockFirestorePelanggaran,
        id: '1',
      } as any);

      const result = await pelanggaranService.get('1');

      expect(result).not.toBeNull();
      expect(result!.id).toBe('1');
      expect(result!.santriName).toBe('Muhammad Rizki Aditya');
      expect(result!.pelanggaranName).toBe('Terlambat Sholat Berjamaah');
      expect(result!.points).toBe(5);
    });

    it('returns null when the document does not exist', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as any);

      const result = await pelanggaranService.get('nonexistent');
      expect(result).toBeNull();
    });
  });

  // --------------- update ---------------

  describe('update', () => {
    it('modifies specified fields and sets updatedAt', async () => {
      const mockUpdateDoc = vi.mocked(updateDoc);

      await pelanggaranService.update('1', { status: 'confirmed', notes: 'Verified by admin' });

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.objectContaining({ id: '1' }),
        expect.objectContaining({
          status: 'confirmed',
          notes: 'Verified by admin',
          updatedAt: expect.objectContaining({ seconds: 1_234_567_890 }),
        }),
      );
    });
  });

  // --------------- list ---------------

  describe('list', () => {
    it('returns all pelanggaran when no filter is provided', async () => {
      vi.mocked(getDocs).mockResolvedValue({
        docs: [
          { id: '1', data: () => mockFirestorePelanggaran },
          {
            id: '2',
            data: () => ({
              ...mockFirestorePelanggaran,
              santriId: '2',
              santriName: 'Abdullah Firdaus',
              pelanggaranName: 'Keluar Asrama Tanpa Izin',
              points: 15,
            }),
          },
        ],
      } as any);

      const results = await pelanggaranService.list();

      expect(results).toHaveLength(2);
      expect(results[0].santriName).toBe('Muhammad Rizki Aditya');
      expect(results[1].santriName).toBe('Abdullah Firdaus');
    });

    it('filters by field when field and value are provided', async () => {
      vi.mocked(getDocs).mockResolvedValue({
        docs: [
          { id: '1', data: () => mockFirestorePelanggaran },
        ],
      } as any);

      const results = await pelanggaranService.list('santriId', '1');

      expect(results).toHaveLength(1);
      expect(vi.mocked(where)).toHaveBeenCalledWith('santriId', '==', '1');
    });
  });

  // --------------- delete ---------------

  describe('delete', () => {
    it('removes a document by ID', async () => {
      const mockDeleteDoc = vi.mocked(deleteDoc);

      await pelanggaranService.delete('1');

      expect(mockDeleteDoc).toHaveBeenCalledWith(
        expect.objectContaining({ id: '1' }),
      );
    });
  });
});
