/**
 * The app's sign-in surface (`@almadar/auth/browser`) and the bearer headers every server call carries.
 *
 * Config comes from Firebase Hosting's `/__/firebase/init.json`, else the `VITE_APP_FIREBASE_*`
 * vars. `VITE_FIREBASE_AUTH_EMULATOR_HOST` points sign-in at the local Auth emulator (dev).
 * With no config at all the app runs signed-out: every request is anonymous.
 */
import { z } from 'zod';
import { connectAuth, type BrowserAuth } from '@almadar/auth/browser';

const FirebaseWebConfigSchema = z.object({
  apiKey: z.string().min(1),
  projectId: z.string().min(1),
  authDomain: z.string().optional(),
});

async function webConfig(): Promise<z.infer<typeof FirebaseWebConfigSchema> | null> {
  const hosted = await fetch('/__/firebase/init.json').then((res) => (res.ok ? res.json() : null), () => null);
  const parsedHosted = FirebaseWebConfigSchema.safeParse(hosted);
  if (parsedHosted.success) return parsedHosted.data;
  const fromEnv = FirebaseWebConfigSchema.safeParse({
    apiKey: import.meta.env.VITE_APP_FIREBASE_API_KEY,
    projectId: import.meta.env.VITE_APP_FIREBASE_PROJECT_ID,
    authDomain: import.meta.env.VITE_APP_FIREBASE_AUTH_DOMAIN,
  });
  return fromEnv.success ? fromEnv.data : null;
}

declare global {
  interface Window {
    /** Emulator dev only: lets a verifier sign this page in as a dev persona (a custom token from `/api/personas/sign-in`). */
    __almadarAuth?: { signInWithCustomToken(customToken: string): Promise<string> };
  }
}

let connected: Promise<BrowserAuth | null> | null = null;

/** The app's one sign-in surface, or null when no Firebase config is present. */
export function connectAppAuth(): Promise<BrowserAuth | null> {
  connected ??= webConfig().then((config) => {
    if (config === null) {
      console.warn('Firebase not configured — sign-in disabled (set VITE_APP_FIREBASE_* or serve /__/firebase/init.json)');
      return null;
    }
    const emulatorHost: string | undefined = import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST;
    return connectAuth({
      appName: 'app',
      ...config,
      ...(emulatorHost ? { emulatorHost } : {}),
    }).then((auth) => {
      if (emulatorHost) {
        window.__almadarAuth = { signInWithCustomToken: async (customToken) => (await auth.signInWithCustomToken(customToken)).uid };
      }
      return auth;
    });
  });
  return connected;
}

/** JSON headers plus `Authorization: Bearer <ID token>` while someone is signed in. */
export async function authHeaders(): Promise<Record<string, string>> {
  const auth = await connectAppAuth();
  const token = auth ? await auth.idToken() : undefined;
  return token ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } : { 'Content-Type': 'application/json' };
}
