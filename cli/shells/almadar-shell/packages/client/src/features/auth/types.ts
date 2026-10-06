export type { AuthContextValue as AuthContextType, SignedInUser as AuthViewer } from '@almadar/auth/react';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials extends LoginCredentials {
  displayName?: string;
}
