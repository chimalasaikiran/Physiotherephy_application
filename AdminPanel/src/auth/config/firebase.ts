import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAMDbSaN_I51YzAQUUDaIVzGDwlrn8Al5A',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'physicotherephy-c28dd.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'physicotherephy-c28dd',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'physicotherephy-c28dd.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '899196020938',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:899196020938:web:091aed7c4edd6766982c33',
};

// Initialize Firebase App singleton
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
