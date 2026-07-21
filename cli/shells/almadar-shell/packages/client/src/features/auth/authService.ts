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
import { auth, requireAuth } from '../../config/firebase';

const googleProvider = new GoogleAuthProvider();

export const authService = {
  // Google Sign In
  signInWithGoogle: async () => {
    try {
      const result = await signInWithPopup(requireAuth(), googleProvider);
      return result.user;
    } catch (error) {
      throw error;
    }
  },

  // Email/Password Sign In
  signInWithEmail: async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(requireAuth(), email, password);
      return result.user;
    } catch (error) {
      throw error;
    }
  },

  // Email/Password Sign Up
  signUpWithEmail: async (email: string, password: string, displayName?: string) => {
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
};
