import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * FEATURE 1: Strict Environment Validation Boundary
 * Prevents silent authentication failures (invalid-api-key) by verifying 
 * all required Vite environment variables exist before SDK initialization.
 */
const requiredEnvs = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

requiredEnvs.forEach(envKey => {
  if (!import.meta.env[envKey]) {
    console.error(`[Parbet Security Gateway] CRITICAL: Missing environment variable -> ${envKey}. Authentication handshake will fail.`);
  }
});

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

/**
 * FEATURE 2: Singleton Initialization Pattern
 * Prevents "Firebase: App already exists" crashes caused by React StrictMode 
 * double-invocations and Vite hot-module replacement (HMR).
 */
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);