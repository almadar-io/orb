// Context
export { AuthProvider, useAuthContext } from './AuthContext';

// Components
export { default as Login } from './components/Login';
export { default as UserProfile } from './components/UserProfile';
export { default as ProtectedRoute } from './components/ProtectedRoute';
export { PersonaSwitcher } from './components/PersonaSwitcher';

// Types
export type { AuthContextType, AuthViewer, LoginCredentials, SignUpCredentials } from './types';
