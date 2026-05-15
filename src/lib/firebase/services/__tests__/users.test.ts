// ========================================
// Users Service — Unit Tests
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
import { usersService } from '../users';

// ----------------------------------------------------------------
// Test data
// ----------------------------------------------------------------

const mockTimestamp = { seconds: 1_234_567_890, nanoseconds: 0, toDate: () => new Date('2024-01-01') };

const mockFirestoreUser = {
  name: 'Ahmad Fauzi',
  email: 'admin@mahad.sch.id',
  role: 'admin' as const,
  createdAt: mockTimestamp,
  updatedAt: mockTimestamp,
};

const mockFirestoreWali = {
  name: 'Bapak Ridwan',
  email: 'wali@mahad.sch.id',
  role: 'wali' as const,
  childSantriId: '1',
  createdAt: mockTimestamp,
  updatedAt: mockTimestamp,
};

// ----------------------------------------------------------------
// Tests
// ----------------------------------------------------------------

describe('usersService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --------------- create ---------------

  describe('create', () => {
    it('adds a document and returns the auto-generated ID', async () => {
      const mockAddDoc = vi.mocked(addDoc);
      mockAddDoc.mockResolvedValue({ id: 'new-user-id' } as any);

      const { createdAt, updatedAt, ...input } = mockFirestoreUser;
      const id = await usersService.create(input);

      expect(id).toBe('new-user-id');
      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'collection' }),
        expect.objectContaining({
          name: 'Ahmad Fauzi',
          email: 'admin@mahad.sch.id',
          role: 'admin',
          createdAt: expect.objectContaining({ seconds: 1_234_567_890 }),
          updatedAt: expect.objectContaining({ seconds: 1_234_567_890 }),
        }),
      );
    });
  });

  // --------------- get ---------------

  describe('get', () => {
    it('returns a user by document ID', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => mockFirestoreUser,
        id: '1',
      } as any);

      const result = await usersService.get('1');

      expect(result).not.toBeNull();
      expect(result!.id).toBe('1');
      expect(result!.name).toBe('Ahmad Fauzi');
      expect(result!.email).toBe('admin@mahad.sch.id');
      expect(result!.role).toBe('admin');
    });

    it('returns null when the document does not exist', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as any);

      const result = await usersService.get('nonexistent');
      expect(result).toBeNull();
    });
  });

  // --------------- getByEmail ---------------

  describe('getByEmail', () => {
    it('returns a user when email matches', async () => {
      vi.mocked(getDocs).mockResolvedValue({
        docs: [
          { id: '3', data: () => mockFirestoreWali },
        ],
      } as any);

      const result = await usersService.getByEmail('wali@mahad.sch.id');

      expect(result).not.toBeNull();
      expect(result!.name).toBe('Bapak Ridwan');
      expect(result!.email).toBe('wali@mahad.sch.id');
      expect(result!.role).toBe('wali');
      expect(result!.childSantriId).toBe('1');

      expect(vi.mocked(where)).toHaveBeenCalledWith('email', '==', 'wali@mahad.sch.id');
    });

    it('returns null when no user matches the email', async () => {
      vi.mocked(getDocs).mockResolvedValue({
        docs: [],
      } as any);

      const result = await usersService.getByEmail('unknown@mahad.sch.id');
      expect(result).toBeNull();
    });
  });

  // --------------- update ---------------

  describe('update', () => {
    it('modifies specified fields and sets updatedAt', async () => {
      const mockUpdateDoc = vi.mocked(updateDoc);

      await usersService.update('1', { name: 'Updated Name' });

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.objectContaining({ id: '1' }),
        expect.objectContaining({
          name: 'Updated Name',
          updatedAt: expect.objectContaining({ seconds: 1_234_567_890 }),
        }),
      );
    });
  });

  // --------------- list ---------------

  describe('list', () => {
    it('returns all users when no filter is provided', async () => {
      vi.mocked(getDocs).mockResolvedValue({
        docs: [
          { id: '1', data: () => mockFirestoreUser },
          { id: '3', data: () => mockFirestoreWali },
        ],
      } as any);

      const results = await usersService.list();

      expect(results).toHaveLength(2);
      expect(results[0].name).toBe('Ahmad Fauzi');
      expect(results[1].name).toBe('Bapak Ridwan');
    });
  });

  // --------------- delete ---------------

  describe('delete', () => {
    it('removes a document by ID', async () => {
      const mockDeleteDoc = vi.mocked(deleteDoc);

      await usersService.delete('1');

      expect(mockDeleteDoc).toHaveBeenCalledWith(
        expect.objectContaining({ id: '1' }),
      );
    });
  });
});
