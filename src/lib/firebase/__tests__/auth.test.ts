// ========================================
// Auth Service — Unit Tests
// ========================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../auth';

// ----------------------------------------------------------------
// Firebase mocks — hoisted by vi.mock so they apply before imports
// ----------------------------------------------------------------

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  getAuth: vi.fn(() => ({ currentUser: null })),
  connectAuthEmulator: vi.fn(),
  updatePassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  getDoc: vi.fn(),
  doc: vi.fn((_db: unknown, _collection: string, id: string) => ({
    id,
    path: `${_collection}/${id}`,
  })),
  setDoc: vi.fn(),
  getFirestore: vi.fn(),
  connectFirestoreEmulator: vi.fn(),
  Timestamp: {
    now: vi.fn(() => ({ seconds: 1234567890, nanoseconds: 0 })),
    fromDate: vi.fn((d: Date) => ({
      seconds: Math.floor(d.getTime() / 1000),
      nanoseconds: 0,
    })),
  },
}));

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(),
  connectStorageEmulator: vi.fn(),
}));

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
  getApps: vi.fn(() => []),
}));

// Mock config so Firebase module-level init code is never executed
vi.mock('../config', () => ({
  auth: {},
  db: {},
}));

// ----------------------------------------------------------------
// Import after mocks are registered
// ----------------------------------------------------------------

import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getDoc } from 'firebase/firestore';

// ----------------------------------------------------------------
// Test data
// ----------------------------------------------------------------

const mockFirebaseUser = {
  uid: 'test-uid-1',
  email: 'admin@mahad.sch.id',
  getIdToken: vi.fn().mockResolvedValue('fresh-token'),
};

const mockUserData = {
  name: 'Ahmad Fauzi',
  email: 'admin@mahad.sch.id',
  role: 'admin' as const,
  createdAt: { seconds: 1234567890, nanoseconds: 0 },
  updatedAt: { seconds: 1234567890, nanoseconds: 0 },
};

// ----------------------------------------------------------------
// Tests
// ----------------------------------------------------------------

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --------------- login ---------------

  describe('login', () => {
    it('returns User with correct role when login succeeds', async () => {
      const mockSignIn = vi.mocked(signInWithEmailAndPassword);
      mockSignIn.mockResolvedValue({ user: mockFirebaseUser } as any);

      const mockGetDoc = vi.mocked(getDoc);
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockUserData,
      } as any);

      const user = await authService.login('admin@mahad.sch.id', 'password123');

      expect(user).toEqual({
        id: 'test-uid-1',
        name: 'Ahmad Fauzi',
        email: 'admin@mahad.sch.id',
        role: 'admin',
      });

      expect(mockSignIn).toHaveBeenCalledWith(
        expect.anything(),
        'admin@mahad.sch.id',
        'password123',
      );
    });

    it('throws error when password is wrong', async () => {
      const mockSignIn = vi.mocked(signInWithEmailAndPassword);
      mockSignIn.mockRejectedValue(new Error('auth/wrong-password'));

      await expect(
        authService.login('admin@mahad.sch.id', 'wrong-password'),
      ).rejects.toThrow('auth/wrong-password');
    });

    it('throws "User profile not found" when Firestore user doc does not exist', async () => {
      const mockSignIn = vi.mocked(signInWithEmailAndPassword);
      mockSignIn.mockResolvedValue({ user: mockFirebaseUser } as any);

      const mockGetDoc = vi.mocked(getDoc);
      mockGetDoc.mockResolvedValue({
        exists: () => false,
      } as any);

      await expect(
        authService.login('admin@mahad.sch.id', 'password123'),
      ).rejects.toThrow('User profile not found');
    });
  });

  // --------------- logout ---------------

  describe('logout', () => {
    it('calls Firebase signOut', async () => {
      const mockSignOut = vi.mocked(signOut);
      await authService.logout();
      expect(mockSignOut).toHaveBeenCalledOnce();
    });
  });

  // --------------- onAuthChanged ---------------

  describe('onAuthChanged', () => {
    it('calls callback with (null, null) when user is logged out', () => {
      const mockOnAuthStateChanged = vi.mocked(onAuthStateChanged);
      mockOnAuthStateChanged.mockImplementation((_auth: any, cb: any) => {
        cb(null);
        return () => {};
      });

      const callback = vi.fn();
      authService.onAuthChanged(callback);

      expect(callback).toHaveBeenCalledWith(null, null);
    });

    it('calls callback with User when authenticated and user doc exists', async () => {
      const mockOnAuthStateChanged = vi.mocked(onAuthStateChanged);
      mockOnAuthStateChanged.mockImplementation((_auth: any, cb: any) => {
        // Invoke synchronously — the handler is async and uses await internally
        cb(mockFirebaseUser);
        return () => {};
      });

      const mockGetDoc = vi.mocked(getDoc);
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockUserData,
      } as any);

      const callback = vi.fn();
      authService.onAuthChanged(callback);

      // Wait for the async handler (getIdToken + getDoc + callback) to settle
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-uid-1',
          name: 'Ahmad Fauzi',
          email: 'admin@mahad.sch.id',
          role: 'admin',
        }),
        mockFirebaseUser,
      );
    });
  });
});
