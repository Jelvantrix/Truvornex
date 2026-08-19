import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const {
    VITE_FIREBASE_API_KEY: apiKey,
    VITE_FIREBASE_AUTH_DOMAIN: authDomain,
    VITE_FIREBASE_PROJECT_ID: projectId,
    VITE_FIREBASE_STORAGE_BUCKET: storageBucket,
    VITE_FIREBASE_MESSAGING_SENDER_ID: messagingSenderId,
    VITE_FIREBASE_APP_ID: appId,
} = import.meta.env;

export const firebaseReady = !!(apiKey && projectId && appId);

let auth = null;

if (firebaseReady) {
    const app = getApps().length === 0
        ? initializeApp({ apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId })
        : getApps()[0];
    auth = getAuth(app);
} else {
    console.warn('[Firebase] Missing VITE_FIREBASE_* env vars — running in session-only auth mode.');
}

export { auth };
