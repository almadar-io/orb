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

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, UISlotProvider } from '@almadar/ui/context';
import { UISlotComponent, NotifyListener } from '@almadar/ui/components';
import {
  EventBusProvider,
  VerificationProvider,
} from '@almadar/ui/providers';
import { NavigationProvider } from '@almadar/ui/renderer';
import { I18nProvider, createTranslate } from '@almadar/ui/hooks';
import defaultLocale from '@almadar/ui/locales/en.json';

// {{GENERATED_I18N_IMPORT}}
// {{GENERATED_IMPORTS}}

// Generated schema import (compiler fills this in)
// {{GENERATED_SCHEMA_IMPORT}}
const schema = { name: 'app', orbitals: [] }; // Placeholder - replaced by compiler

// {{GENERATED_I18N_VALUE}}
const i18nValue = { locale: 'en', direction: 'ltr' as const, t: createTranslate(defaultLocale) };

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <I18nProvider value={i18nValue}>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
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
                </BrowserRouter>
              </NavigationProvider>
            </UISlotProvider>
          </VerificationProvider>
        </EventBusProvider>
      </ThemeProvider>
    </QueryClientProvider>
    </I18nProvider>
  );
}

export default App;
