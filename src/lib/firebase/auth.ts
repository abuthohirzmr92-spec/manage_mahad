// ========================================
// Firebase Auth Service
// ========================================

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updatePassword,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from './config';
import type { User } from '@/types';
import type { FirestoreUser } from '@/types/firestore';

export const authService = {
  /**
   * Login with email & password.
   * Returns the application-level User if Firebase auth succeeds
   * AND the Firestore user profile exists.
   */
  async login(email: string, password: string): Promise<User> {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', credential.user.uid));
    if (!userDoc.exists()) {
      throw new Error('User profile not found');
    }
    const data = userDoc.data() as FirestoreUser;
    return {
      id: credential.user.uid,
      name: data.name,
      email: data.email,
      role: data.role,
      avatar: data.avatar,
      childSantriId: data.childSantriId,
    };
  },

  /** Log out the current Firebase user. */
  async logout(): Promise<void> {
    await signOut(auth);
  },

  /**
   * Subscribe to auth state changes.
   * Every time the auth state changes the callback receives:
   *  - the application-level User (or null)
   *  - the raw FirebaseUser (or null)
   *
   * Returns an unsubscribe function.
   */
  onAuthChanged(
    callback: (user: User | null, fbUser: FirebaseUser | null) => void,
  ): () => void {
    return onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        callback(null, null);
        return;
      }

      // Force token refresh to pick up latest custom claims
      await fbUser.getIdToken(true);

      const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
      if (!userDoc.exists()) {
        callback(null, fbUser);
        return;
      }

      const data = userDoc.data() as FirestoreUser;
      callback(
        {
          id: fbUser.uid,
          name: data.name,
          email: data.email,
          role: data.role,
          avatar: data.avatar,
          childSantriId: data.childSantriId,
        },
        fbUser,
      );
    });
  },

  /** Get the currently authenticated Firebase user (synchronous). */
  getCurrentFirebaseUser(): FirebaseUser | null {
    return auth.currentUser;
  },
};
