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
import { auth } from '../../config/firebase';

const googleProvider = new GoogleAuthProvider();

export const authService = {
  // Google Sign In
  signInWithGoogle: async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      throw error;
    }
  },

  // Email/Password Sign In
  signInWithEmail: async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      throw error;
    }
  },

  // Email/Password Sign Up
  signUpWithEmail: async (email: string, password: string, displayName?: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);

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
      await firebaseSignOut(auth);
    } catch (error) {
      throw error;
    }
  },

  // Email Link Authentication
  sendSignInLinkToEmail: async (email: string, actionCodeSettings: ActionCodeSettings) => {
    try {
      await firebaseSendSignInLinkToEmail(auth, email, actionCodeSettings);
    } catch (error) {
      throw error;
    }
  },

  isSignInWithEmailLink: (emailLink: string): boolean => {
    return firebaseIsSignInWithEmailLink(auth, emailLink);
  },

  signInWithEmailLink: async (email: string, emailLink: string) => {
    try {
      const result = await firebaseSignInWithEmailLink(auth, email, emailLink);
      return result.user;
    } catch (error) {
      throw error;
    }
  },
};
