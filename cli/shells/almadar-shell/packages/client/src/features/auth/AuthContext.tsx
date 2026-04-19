import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth, initializeFirebase } from '../../config/firebase';
import { authService } from './authService';
import { AuthContextType } from './types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    initializeFirebase().then(() => {
      unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
        setUser(firebaseUser);
        setLoading(false);
      });
    });

    return () => unsubscribe?.();
  }, []);

  const clearError = () => setError(null);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      clearError();
      await authService.signInWithGoogle();
    } catch (err: unknown) {
      setLoading(false);
      const firebaseErr = err as { code?: string; message?: string };
      const isCancel =
        firebaseErr.code === 'auth/popup-closed-by-user' ||
        firebaseErr.code === 'auth/cancelled-popup-request' ||
        firebaseErr.code === 'auth/popup-blocked';
      if (!isCancel) {
        setError(firebaseErr.message ?? 'Google sign-in failed');
      }
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      clearError();
      await authService.signInWithEmail(email, password);
    } catch (err: unknown) {
      setLoading(false);
      setError((err as { message?: string }).message ?? 'Sign-in failed');
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
    try {
      setLoading(true);
      clearError();
      await authService.signUpWithEmail(email, password, displayName);
    } catch (err: unknown) {
      setLoading(false);
      setError((err as { message?: string }).message ?? 'Sign-up failed');
    }
  };

  const sendSignInLinkToEmail = async (email: string) => {
    try {
      setLoading(true);
      clearError();
      const actionCodeSettings = {
        url: `${window.location.origin}/login`,
        handleCodeInApp: true,
      };
      await authService.sendSignInLinkToEmail(email, actionCodeSettings);
      setLoading(false);
    } catch (err: unknown) {
      setLoading(false);
      setError((err as { message?: string }).message ?? 'Failed to send sign-in link');
    }
  };

  const signInWithEmailLink = async (email: string, emailLink: string) => {
    try {
      setLoading(true);
      clearError();
      await authService.signInWithEmailLink(email, emailLink);
    } catch (err: unknown) {
      setLoading(false);
      setError((err as { message?: string }).message ?? 'Email link sign-in failed');
    }
  };

  const isSignInWithEmailLink = (emailLink: string): boolean => {
    return authService.isSignInWithEmailLink(emailLink);
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await authService.signOut();
      setUser(null);
      setLoading(false);
    } catch (err: unknown) {
      setLoading(false);
      setError((err as { message?: string }).message ?? 'Sign-out failed');
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    signInWithGoogle,
    signOut,
    signInWithEmail,
    signUpWithEmail,
    sendSignInLinkToEmail,
    signInWithEmailLink,
    isSignInWithEmailLink,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
