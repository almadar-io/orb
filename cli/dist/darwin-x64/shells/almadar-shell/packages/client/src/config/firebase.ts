import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

let app: FirebaseApp;
let auth: Auth;

export async function initializeFirebase(): Promise<void> {
  if (getApps().length > 0) {
    app = getApp();
    auth = getAuth(app);
    return;
  }

  let config;
  try {
    // On Firebase Hosting, fetch auto-config from reserved URL
    const res = await fetch('/__/firebase/init.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    config = await res.json();
  } catch {
    // Fall back to env vars for local development
    config = {
      apiKey: import.meta.env.VITE_APP_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_APP_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_APP_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_APP_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_APP_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_APP_FIREBASE_APP_ID,
      measurementId: import.meta.env.VITE_APP_FIREBASE_MEASUREMENT_ID,
    };
  }

  app = initializeApp(config);
  auth = getAuth(app);
}

export { auth, app };
