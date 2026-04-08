import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

const EMAIL_FOR_SIGN_IN_KEY = 'emailForSignIn';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [completingEmailLink, setCompletingEmailLink] = useState(false);
  const [emailForLinkCompletion, setEmailForLinkCompletion] = useState('');

  const {
    loading,
    error,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signInWithEmailLink,
    isSignInWithEmailLink,
    clearError,
  } = useAuthContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Redirect on successful auth
  const { user } = useAuthContext();
  useEffect(() => {
    if (user) {
      const returnUrl = searchParams.get('returnUrl') || '/';
      navigate(returnUrl, { replace: true });
    }
  }, [user, navigate, searchParams]);

  // Check if user is returning from email link
  useEffect(() => {
    if (isSignInWithEmailLink(window.location.href)) {
      const emailForSignIn = window.localStorage.getItem(EMAIL_FOR_SIGN_IN_KEY);

      if (emailForSignIn) {
        setCompletingEmailLink(true);
        signInWithEmailLink(emailForSignIn, window.location.href)
          .then(() => {
            window.localStorage.removeItem(EMAIL_FOR_SIGN_IN_KEY);
            window.history.replaceState({}, document.title, '/login');
            setCompletingEmailLink(false);
          })
          .catch(() => {
            setCompletingEmailLink(false);
            setEmailForLinkCompletion(emailForSignIn);
          });
      } else {
        setCompletingEmailLink(true);
        setEmailForLinkCompletion('');
      }
    }
  }, [signInWithEmailLink, isSignInWithEmailLink]);

  const handleGoogleSignIn = async () => {
    clearError();
    await signInWithGoogle();
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (isSignUp) {
      await signUpWithEmail(email, password, displayName);
    } else {
      await signInWithEmail(email, password);
    }
  };

  const handleCompleteEmailLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailForLinkCompletion.trim()) return;

    await signInWithEmailLink(emailForLinkCompletion, window.location.href);
    window.localStorage.removeItem(EMAIL_FOR_SIGN_IN_KEY);
    window.history.replaceState({}, document.title, '/login');
    setCompletingEmailLink(false);
    setEmailForLinkCompletion('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-8 shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            {completingEmailLink
              ? 'Complete sign-in'
              : isSignUp
                ? 'Create your account'
                : 'Sign in to your account'}
          </h2>
        </div>

        <div className="mt-8 space-y-6">
          {completingEmailLink && (
            <form onSubmit={handleCompleteEmailLink} className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Please enter your email address to complete sign-in.
                </p>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={emailForLinkCompletion}
                  onChange={(e) => setEmailForLinkCompletion(e.target.value)}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter your email"
                />
              </div>

              {error && (
                <div className="text-red-600 dark:text-red-300 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-800">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !emailForLinkCompletion.trim()}
                className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Complete sign-in'}
              </button>
            </form>
          )}

          {!completingEmailLink && (
            <>
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in with Google'}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    Or sign in with email
                  </span>
                </div>
              </div>

              <form className="space-y-4" onSubmit={handleEmailAuth}>
                {isSignUp && (
                  <input
                    type="text"
                    required
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Display Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                )}

                <input
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <input
                  type="password"
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                {error && (
                  <div className="text-red-600 dark:text-red-300 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-800">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
                </button>
              </form>

              <div className="text-center">
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-medium text-sm"
                >
                  {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
