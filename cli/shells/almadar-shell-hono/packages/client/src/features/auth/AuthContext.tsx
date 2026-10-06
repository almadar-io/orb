import React from 'react';
import { AuthProvider as BaseAuthProvider, useAuth } from '@almadar/auth/react';
import { connectAppAuth } from '../../config/auth';

/** The app's auth context over `@almadar/auth/react`, connected to this app's Firebase config. */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BaseAuthProvider connect={connectAppAuth}>{children}</BaseAuthProvider>
);

export const useAuthContext = useAuth;
