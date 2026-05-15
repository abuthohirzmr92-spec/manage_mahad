// ========================================
// Asrama Service — Unit Tests
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
  Timestamp,
} from 'firebase/firestore';
import { asramaService } from '../asrama';

// ----------------------------------------------------------------
// Test data
// ----------------------------------------------------------------

const mockFirestoreAsrama = {
  name: 'Al-Fatih',
  musyrif: 'Ustadz Hasan',
  capacity: 40,
  filled: 32,
  gender: 'L' as const,
  status: 'aktif' as const,
};

// ----------------------------------------------------------------
// Tests
// ----------------------------------------------------------------

describe('asramaService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --------------- create ---------------

  describe('create', () => {
    it('adds a document and returns the auto-generated ID', async () => {
      const mockAddDoc = vi.mocked(addDoc);
      mockAddDoc.mockResolvedValue({ id: 'new-asrama-id' } as any);

      const id = await asramaService.create(mockFirestoreAsrama);

      expect(id).toBe('new-asrama-id');
      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'collection' }),
        expect.objectContaining({
          name: 'Al-Fatih',
          musyrif: 'Ustadz Hasan',
          capacity: 40,
          status: 'aktif',
          createdAt: expect.objectContaining({ seconds: 1_234_567_890 }),
          updatedAt: expect.objectContaining({ seconds: 1_234_567_890 }),
        }),
      );
    });
  });

  // --------------- get ---------------

  describe('get', () => {
    it('returns an asrama by document ID', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => mockFirestoreAsrama,
        id: '1',
      } as any);

      const result = await asramaService.get('1');

      expect(result).not.toBeNull();
      expect(result!.id).toBe('1');
      expect(result!.name).toBe('Al-Fatih');
      expect(result!.capacity).toBe(40);
      expect(result!.status).toBe('aktif');
    });

    it('returns null when the document does not exist', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as any);

      const result = await asramaService.get('nonexistent');
      expect(result).toBeNull();
    });
  });

  // --------------- update ---------------

  describe('update', () => {
    it('modifies specified fields and sets updatedAt', async () => {
      const mockUpdateDoc = vi.mocked(updateDoc);

      await asramaService.update('1', { status: 'nonaktif', capacity: 35 });

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.objectContaining({ id: '1' }),
        expect.objectContaining({
          status: 'nonaktif',
          capacity: 35,
          updatedAt: expect.objectContaining({ seconds: 1_234_567_890 }),
        }),
      );
    });
  });

  // --------------- list ---------------

  describe('list', () => {
    it('returns all asrama when no filter is provided', async () => {
      vi.mocked(getDocs).mockResolvedValue({
        docs: [
          { id: '1', data: () => mockFirestoreAsrama },
          {
            id: '2',
            data: () => ({
              name: 'Al-Farabi',
              musyrif: 'Ustadz Mahmud',
              capacity: 40,
              filled: 28,
              gender: 'L' as const,
              status: 'aktif' as const,
            }),
          },
        ],
      } as any);

      const results = await asramaService.list();

      expect(results).toHaveLength(2);
      expect(results[0].name).toBe('Al-Fatih');
      expect(results[1].name).toBe('Al-Farabi');
    });
  });

  // --------------- delete ---------------

  describe('delete', () => {
    it('removes a document by ID', async () => {
      const mockDeleteDoc = vi.mocked(deleteDoc);

      await asramaService.delete('1');

      expect(mockDeleteDoc).toHaveBeenCalledWith(
        expect.objectContaining({ id: '1' }),
      );
    });
  });
});
