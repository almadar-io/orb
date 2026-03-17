'use client';
/**
 * UserContext
 *
 * React context for providing user data throughout the application.
 * Enables @user bindings in S-expressions for role-based UI and permissions.
 *
 * Usage:
 * ```tsx
 * // In App.tsx or layout
 * <UserProvider user={{ id: '123', role: 'admin', permissions: ['read', 'write'] }}>
 *   <App />
 * </UserProvider>
 *
 * // In components - access via hook
 * const { user, hasRole, hasPermission } = useUser();
 * if (hasRole('admin')) { ... }
 * if (hasPermission('delete')) { ... }
 * ```
 *
 * @packageDocumentation
 */

import React, { createContext, useContext, useMemo, useCallback } from 'react';

// ============================================================================
// Types
// ============================================================================

/**
 * User data for @user bindings.
 * Matches UserContext type from evaluator/context.ts
 */
export interface UserData {
  /** User's unique ID */
  id: string;
  /** User's email */
  email?: string;
  /** User's display name */
  name?: string;
  /** User's role (for RBAC) */
  role?: string;
  /** User's permissions */
  permissions?: string[];
  /** Additional custom profile fields */
  [key: string]: unknown;
}

/**
 * User context value.
 */
export interface UserContextValue {
  /** Current user data (null if not logged in) */
  user: UserData | null;
  /** Check if user is logged in */
  isLoggedIn: boolean;
  /** Check if user has a specific role */
  hasRole: (role: string) => boolean;
  /** Check if user has a specific permission */
  hasPermission: (permission: string) => boolean;
  /** Check if user has any of the specified roles */
  hasAnyRole: (roles: string[]) => boolean;
  /** Check if user has all of the specified permissions */
  hasAllPermissions: (permissions: string[]) => boolean;
  /** Get a user field by path (for @user.field bindings) */
  getUserField: (path: string) => unknown;
}

// ============================================================================
// Anonymous User
// ============================================================================

/**
 * Anonymous user for when no user is logged in.
 */
const ANONYMOUS_USER: UserData = {
  id: 'anonymous',
  role: 'anonymous',
  permissions: [],
};

// ============================================================================
// Context
// ============================================================================

const UserContext = createContext<UserContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

export interface UserProviderProps {
  /** User data (null if not logged in) */
  user?: UserData | null;
  /** Children to render */
  children: React.ReactNode;
}

/**
 * Provider component that provides user context to the application.
 *
 * Provides RBAC helpers and field access for @user bindings.
 */
export function UserProvider({
  user = null,
  children,
}: UserProviderProps): React.ReactElement {
  // Role check helper
  const hasRole = useCallback(
    (role: string): boolean => {
      if (!user) return role === 'anonymous';
      return user.role === role;
    },
    [user]
  );

  // Permission check helper
  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user) return false;
      return user.permissions?.includes(permission) ?? false;
    },
    [user]
  );

  // Multiple role check
  const hasAnyRole = useCallback(
    (roles: string[]): boolean => {
      if (!user) return roles.includes('anonymous');
      return user.role ? roles.includes(user.role) : false;
    },
    [user]
  );

  // Multiple permission check
  const hasAllPermissions = useCallback(
    (permissions: string[]): boolean => {
      if (!user || !user.permissions) return false;
      return permissions.every((p) => user.permissions?.includes(p));
    },
    [user]
  );

  // Field access for @user.field bindings
  const getUserField = useCallback(
    (path: string): unknown => {
      const userData = user ?? ANONYMOUS_USER;
      const parts = path.split('.');
      let value: unknown = userData;

      for (const segment of parts) {
        if (value === null || value === undefined) {
          return undefined;
        }
        if (typeof value === 'object') {
          value = (value as Record<string, unknown>)[segment];
        } else {
          return undefined;
        }
      }

      return value;
    },
    [user]
  );

  // Build context value
  const contextValue = useMemo<UserContextValue>(
    () => ({
      user,
      isLoggedIn: user !== null,
      hasRole,
      hasPermission,
      hasAnyRole,
      hasAllPermissions,
      getUserField,
    }),
    [user, hasRole, hasPermission, hasAnyRole, hasAllPermissions, getUserField]
  );

  return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to access the user context.
 *
 * Returns default values if used outside of UserProvider (for resilience).
 *
 * @example
 * ```tsx
 * function AdminPanel() {
 *   const { user, hasRole, hasPermission } = useUser();
 *
 *   if (!hasRole('admin') && !hasPermission('admin:access')) {
 *     return <AccessDenied />;
 *   }
 *
 *   return <div>Welcome, {user?.name}</div>;
 * }
 * ```
 */
export function useUser(): UserContextValue {
  const context = useContext(UserContext);

  // Return defaults if not in provider (for resilience)
  if (!context) {
    return {
      user: null,
      isLoggedIn: false,
      hasRole: (role) => role === 'anonymous',
      hasPermission: () => false,
      hasAnyRole: (roles) => roles.includes('anonymous'),
      hasAllPermissions: () => false,
      getUserField: () => undefined,
    };
  }

  return context;
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Hook to check if user has a specific role.
 * Convenience wrapper around useUser().hasRole().
 */
export function useHasRole(role: string): boolean {
  const { hasRole } = useUser();
  return hasRole(role);
}

/**
 * Hook to check if user has a specific permission.
 * Convenience wrapper around useUser().hasPermission().
 */
export function useHasPermission(permission: string): boolean {
  const { hasPermission } = useUser();
  return hasPermission(permission);
}

/**
 * Hook to get user data for @user bindings in S-expressions.
 * Returns the user data object compatible with EvaluationContext.user
 */
export function useUserForEvaluation(): UserData | undefined {
  const { user, isLoggedIn } = useUser();
  return isLoggedIn && user ? user : undefined;
}

// ============================================================================
// Exports
// ============================================================================

export { UserContext, ANONYMOUS_USER };
