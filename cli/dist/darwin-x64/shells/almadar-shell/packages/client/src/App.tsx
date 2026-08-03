/**
 * App Entry Point
 *
 * Main application component with compiler-generated content placeholders.
 * The Rust compiler replaces {{PLACEHOLDERS}} with generated code.
 *
 * Navigation works via schema-driven NavigationProvider:
 * - NavigationProvider holds active page state
 * - navigateTo() switches pages and fires INIT with payload
 * - No dependency on react-router for internal navigation
 * - react-router is optional for URL bookmarkability
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, UISlotProvider } from '@almadar/ui/context';
import { UISlotComponent, NotifyListener } from '@almadar/ui/components';
import {
  EventBusProvider,
  UserProvider,
  VerificationProvider,
} from '@almadar/ui/providers';
import { normalizeUserContext } from '@almadar/core';
import { AuthProvider, useAuthContext } from './features/auth';
import { PersonaSwitcher } from './features/auth/components/PersonaSwitcher';
import { NavigationProvider } from '@almadar/ui/renderer';
import { I18nProvider, createTranslate } from '@almadar/ui/hooks';
import defaultLocale from '@almadar/ui/locales/en.json';

// {{GENERATED_I18N_IMPORT}}
// {{GENERATED_IMPORTS}}

// Generated schema import (compiler fills this in)
// {{GENERATED_SCHEMA_IMPORT}}
const schema = { name: 'app', orbitals: [] }; // Placeholder - replaced by compiler

// {{GENERATED_I18N_VALUE}}
const { $meta: defaultMeta, ...defaultMessages } = defaultLocale;
const i18nValue = { locale: defaultMeta?.locale ?? 'en', direction: (defaultMeta?.direction ?? 'ltr') as 'ltr' | 'rtl', t: createTranslate(defaultMessages) };

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Bridges the signed-in viewer into `UserProvider`. Generated trait hooks read
 * `@user.x` through `useUser()`, so without this every role gate takes its
 * negative branch and every "only mine" list renders empty — with no error, since
 * `useUser()` falls back to anonymous. `normalizeUserContext` maps the provider's
 * `uid`/`displayName` onto the `id`/`name` the behaviors read.
 */
function ViewerProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthContext();
  return <UserProvider user={normalizeUserContext(user) ?? null}>{children}</UserProvider>;
}

function App() {
  return (
    <I18nProvider value={i18nValue}>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="minimalist">
       <AuthProvider>
        <ViewerProvider>
        <EventBusProvider>
          <VerificationProvider>
            <UISlotProvider>
              <NavigationProvider
                schema={schema}
                updateUrl={true}
                onNavigate={(pageName, path, payload) => {
                  console.log('[App] Navigation:', { pageName, path, payload });
                }}
              >
                <BrowserRouter>
                  <Routes>
                    {/* {{GENERATED_ROUTES}} */}
                    <Route path="/" element={<div>Welcome to Almadar</div>} />
                  </Routes>
                  {/* Portal slots rendered by compiled trait views via CompiledPortal */}
                  {/* Toast notifications (non-overlapping, always safe to render here) */}
                  <UISlotComponent slot="toast" portal />
                  <NotifyListener />
                  <PersonaSwitcher />
                </BrowserRouter>
              </NavigationProvider>
            </UISlotProvider>
          </VerificationProvider>
        </EventBusProvider>
        </ViewerProvider>
       </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
    </I18nProvider>
  );
}

export default App;
