/**
 * The signed-in viewer, as the auth UI reads it. Firebase's `User` and the mocked
 * `MockUser` are both structurally assignable to this, so the provider carries
 * either without a cast and without the UI knowing which one is live.
 *
 * A type alias, not an interface: only aliases get TS's implicit index signature,
 * which is what lets this be passed to `normalizeUserContext(claims: RawUserClaims)`
 * without a cast.
 */
export type AuthViewer = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  /** Present only for mocked personas; real Firebase claims carry no role. */
  role?: string;
};

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials extends LoginCredentials {
  displayName?: string;
}

export interface AuthContextType {
  user: AuthViewer | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<void>;
  sendSignInLinkToEmail: (email: string) => Promise<void>;
  signInWithEmailLink: (email: string, emailLink: string) => Promise<void>;
  isSignInWithEmailLink: (emailLink: string) => boolean;
  clearError: () => void;
}
