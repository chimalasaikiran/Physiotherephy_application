import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  Firestore,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDemoKeyForPhysiotherapyApp12345',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'physiotherapy-app-demo.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'physiotherapy-app-demo',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'physiotherapy-app-demo.appspot.com',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:123456789012:web:demo1234567890',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth: Auth = getAuth(app);

let db: Firestore;
try {
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  });
} catch {
  db = getFirestore(app);
}

export { app, auth, db };

export interface UserProfileData {
  uid: string;
  phone: string;
  fullName: string;
  dob?: string;
  gender?: string;
  height?: number;
  weight?: number;
  primaryConcernId?: string;
  avatarUri?: string | null;
  profileCompleted: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export const fetchUserProfile = async (uid: string): Promise<UserProfileData | null> => {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userSnapshot = await getDoc(userDocRef);

    if (userSnapshot.exists()) {
      return userSnapshot.data() as UserProfileData;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const saveUserProfileInFirestore = async (
  uid: string,
  profileData: Partial<UserProfileData>
): Promise<boolean> => {
  try {
    const userDocRef = doc(db, 'users', uid);
    const existingDoc = await getDoc(userDocRef);

    const payload = {
      ...profileData,
      uid,
      profileCompleted: true,
      updatedAt: serverTimestamp(),
      ...(!existingDoc.exists() ? { createdAt: serverTimestamp() } : {}),
    };

    await setDoc(userDocRef, payload, { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving profile:', error);
    throw error;
  }
};

export const initializeUserRecord = async (user: User): Promise<UserProfileData | null> => {
  try {
    const userDocRef = doc(db, 'users', user.uid);
    const snapshot = await getDoc(userDocRef);

    if (snapshot.exists()) {
      return snapshot.data() as UserProfileData;
    } else {
      const initialRecord: Partial<UserProfileData> = {
        uid: user.uid,
        phone: user.phoneNumber || '',
        profileCompleted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(userDocRef, initialRecord);
      return initialRecord as UserProfileData;
    }
  } catch (error) {
    console.error('Error initializing user record:', error);
    return null;
  }
};
