import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as firebaseSignOut,
  sendSignInLinkToEmail as firebaseSendSignInLinkToEmail,
  isSignInWithEmailLink as firebaseIsSignInWithEmailLink,
  signInWithEmailLink as firebaseSignInWithEmailLink,
  ActionCodeSettings,
} from 'firebase/auth';
import { auth, isAuthEnabled, requireAuth } from '../../config/firebase';
import { mockAuth } from '../../config/mockAuth';

// With no Firebase credentials the real calls throw "not configured", which
// leaves a generated app impossible to sign into — and therefore impossible to
// view as anyone, since @user.id/@user.role drive ownership and role gates.
// Route to the persona-backed mock in exactly that case.
const useMock = (): boolean => !isAuthEnabled();

const googleProvider = new GoogleAuthProvider();

export const authService = {
  // Google Sign In
  signInWithGoogle: async () => {
    // No popup to show without Firebase — sign in as the seeded end-user.
    if (useMock()) return mockAuth.signInAsPersona('member');
    try {
      const result = await signInWithPopup(requireAuth(), googleProvider);
      return result.user;
    } catch (error) {
      throw error;
    }
  },

  // Email/Password Sign In
  signInWithEmail: async (email: string, password: string) => {
    if (useMock()) return mockAuth.signInWithEmail(email, password);
    try {
      const result = await signInWithEmailAndPassword(requireAuth(), email, password);
      return result.user;
    } catch (error) {
      throw error;
    }
  },

  // Email/Password Sign Up
  signUpWithEmail: async (email: string, password: string, displayName?: string) => {
    if (useMock()) return mockAuth.signUpWithEmail(email, password, displayName);
    try {
      const result = await createUserWithEmailAndPassword(requireAuth(), email, password);

      if (displayName) {
        await updateProfile(result.user, { displayName });
      }

      return result.user;
    } catch (error) {
      throw error;
    }
  },

  // Sign Out
  signOut: async () => {
    if (useMock()) return mockAuth.signOut();
    try {
      await firebaseSignOut(requireAuth());
    } catch (error) {
      throw error;
    }
  },

  // Email Link Authentication
  sendSignInLinkToEmail: async (email: string, actionCodeSettings: ActionCodeSettings) => {
    try {
      await firebaseSendSignInLinkToEmail(requireAuth(), email, actionCodeSettings);
    } catch (error) {
      throw error;
    }
  },

  isSignInWithEmailLink: (emailLink: string): boolean => {
    // Predicate evaluated during Login render — degrade, don't throw,
    // when auth is unconfigured: it simply isn't an email-link sign-in.
    if (!auth) return false;
    return firebaseIsSignInWithEmailLink(auth, emailLink);
  },

  signInWithEmailLink: async (email: string, emailLink: string) => {
    try {
      const result = await firebaseSignInWithEmailLink(requireAuth(), email, emailLink);
      return result.user;
    } catch (error) {
      throw error;
    }
  },

  /** Sign in as a named seeded persona (dev only; no-op with real Firebase). */
  signInAsPersona: async (idOrRole: string) => {
    if (useMock()) return mockAuth.signInAsPersona(idOrRole);
    throw new Error('Persona sign-in is a dev-only affordance; real auth is configured');
  },
};
