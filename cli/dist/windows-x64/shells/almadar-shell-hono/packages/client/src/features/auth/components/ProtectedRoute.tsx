import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../AuthContext';
import { isAuthEnabled } from '../../../config/firebase';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  // Auth-disabled mode (no Firebase config): nothing can sign in, so
  // gating would strand every route on /login — pass straight through.
  // Checked after `loading` so a configured-but-initializing Firebase
  // still shows the spinner instead of flashing protected content.
  if (!isAuthEnabled()) {
    return <>{children}</>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
