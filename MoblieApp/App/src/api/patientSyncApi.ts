/**
 * patientSyncApi.ts
 *
 * Handles syncing the mobile user's profile to the Firestore `patient details`
 * collection so they automatically appear in the Admin Panel's Patients module.
 *
 * Strategy:
 * 1. Primary: Call the backend patient service (POST /api/v1/patients) to create/upsert
 * 2. Fallback: Write directly to Firestore `patient details/{uid}` if backend is offline
 * 3. Also provides a real-time listener for the user's own patient record
 */

import { db } from '../config/firebase';
import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import type { UserProfileData } from '../config/firebase';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const PATIENT_DETAILS_COLLECTION = 'users';

const getBackendBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_USER_SERVICE_URL) {
    return process.env.EXPO_PUBLIC_USER_SERVICE_URL;
  }
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest?.debuggerHost;
  if (hostUri) {
    const hostIp = hostUri.split(':')[0];
    if (hostIp) return `http://${hostIp}:5001/api/v1`;
  }
  if (Platform.OS === 'android') return 'http://10.0.2.2:5001/api/v1';
  return 'http://localhost:5001/api/v1';
};

// ─────────────────────────────────────────────────────────────────────────────
// Type: Full Patient Record (matches Admin Panel Patient type)
// ─────────────────────────────────────────────────────────────────────────────

export interface PatientRecord {
  id: string;
  patientId: string;
  name: string;
  age: number;
  gender: string;
  avatarUrl: string;
  phone: string;
  email: string;
  condition: string;
  status: string;
  therapistName: string;
  therapistInitials: string;
  therapistAvatarBg: string;
  recoveryScore: number;
  nextAppointmentDate: string;
  nextAppointmentTime: string;
  joinedDate: string;
  address: string;
  bloodGroup: string;
  emergencyContact?: { name: string; relation: string; phone: string };
  medicalHistory?: {
    primaryDiagnosis?: string;
    severity?: string;
    allergies?: string[];
    surgeries?: string[];
    chronicConditions?: string[];
    vitals?: {
      bloodPressure?: string;
      heartRate?: string;
      height?: string;
      weight?: string;
      bmi?: string;
    };
  };
  notes: string;
  painLevel: string;
  sessionsCompleted: number;
  sessionsTotal: number;
  goals: any[];
  reports: any[];
  upcomingAppointments: any[];
  pastAppointments: any[];
  payments: any[];
  programs: any[];
  exercises: any[];
  clinicalNotes: any[];
  createdAt?: any;
  updatedAt?: any;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mapper: UserProfileData → PatientRecord
// ─────────────────────────────────────────────────────────────────────────────

const generatePatientId = (uid: string): string => {
  const clean = uid.replace(/[^a-zA-Z0-9]/g, '');
  const num = parseInt(clean.substring(0, 8), 36) % 10000;
  return `#OM-${String(Math.abs(num)).padStart(4, '0')}`;
};

const mapUserProfileToPatientRecord = (
  uid: string,
  profile: Partial<UserProfileData>
): PatientRecord => {
  const heightCm = profile.height ? `${profile.height} cm` : undefined;
  const weightKg = profile.weight ? `${profile.weight} kg` : undefined;
  const bmi =
    profile.height && profile.weight
      ? (profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1)
      : undefined;

  return {
    id: uid,
    patientId: generatePatientId(uid),
    name: profile.fullName || `Patient (${profile.phone || uid.slice(0, 6)})`,
    age: 0, // Unknown until user provides DOB — admin can update
    gender: profile.gender
      ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)
      : 'Not specified',
    avatarUrl:
      profile.avatarUri ||
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    phone: profile.phone || '',
    email: '',
    condition: 'Physiotherapy Evaluation',
    status: 'Active Treatment',
    therapistName: 'Unassigned',
    therapistInitials: '--',
    therapistAvatarBg: 'bg-slate-100 text-slate-600',
    recoveryScore: 70,
    nextAppointmentDate: 'Pending Schedule',
    nextAppointmentTime: '--',
    joinedDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    address: '',
    bloodGroup: '',
    notes: '',
    painLevel: 'Mild',
    sessionsCompleted: 0,
    sessionsTotal: 10,
    medicalHistory: {
      vitals: {
        height: heightCm,
        weight: weightKg,
        bmi: bmi,
      },
    },
    goals: [],
    reports: [],
    upcomingAppointments: [],
    pastAppointments: [],
    payments: [],
    programs: [],
    exercises: [],
    clinicalNotes: [],
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Core Sync Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Write / upsert the user's patient record to Firestore `patient details/{uid}`.
 * Uses uid as the document ID for consistent cross-collection lookups.
 *
 * This is the FALLBACK (direct Firestore write). The primary path is via backend API.
 */
const upsertPatientRecordInFirestore = async (
  uid: string,
  patientData: Partial<PatientRecord>
): Promise<void> => {
  const docRef = doc(db, PATIENT_DETAILS_COLLECTION, uid);
  const existing = await getDoc(docRef);

  const payload: any = {
    ...patientData,
    id: uid,
    updatedAt: serverTimestamp(),
  };

  if (!existing.exists()) {
    payload.createdAt = serverTimestamp();
  }

  await setDoc(docRef, payload, { merge: true });
};

/**
 * Sync user profile to the backend patient service.
 * If the backend is unavailable, falls back to direct Firestore write.
 *
 * Called from AuthContext.completeProfile() after a successful profile save.
 */
export const syncProfileToPatientDetails = async (
  uid: string,
  profile: Partial<UserProfileData>,
  idToken?: string
): Promise<boolean> => {
  const patientRecord = mapUserProfileToPatientRecord(uid, profile);

  // 1. Try backend API (POST /api/v1/patients)
  if (idToken) {
    try {
      const baseUrl = getBackendBaseUrl();
      const res = await fetch(`${baseUrl}/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(patientRecord),
        signal: AbortSignal.timeout(5000),
      });

      if (res.ok) {
        console.log('[patientSyncApi] Patient record synced via backend API.');
        return true;
      }

      console.warn('[patientSyncApi] Backend API returned non-OK, falling back to Firestore direct write.');
    } catch (apiErr) {
      console.warn('[patientSyncApi] Backend API unavailable, falling back to Firestore:', apiErr);
    }
  }

  // 2. Fallback: direct Firestore write
  try {
    await upsertPatientRecordInFirestore(uid, patientRecord);
    console.log('[patientSyncApi] Patient record synced directly to Firestore.');
    return true;
  } catch (fsErr) {
    console.error('[patientSyncApi] Firestore direct write failed:', fsErr);
    return false;
  }
};

/**
 * Update the medical history section of a patient's record.
 * Called from MedicalInfoScreen when the user saves their medical info.
 */
export const syncMedicalInfoToPatientDetails = async (
  uid: string,
  medicalData: PatientRecord['medicalHistory'],
  idToken?: string
): Promise<boolean> => {
  // 1. Try backend PUT /api/v1/patients/:id/medical
  if (idToken) {
    try {
      const baseUrl = getBackendBaseUrl();
      const res = await fetch(`${baseUrl}/patients/${uid}/medical`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(medicalData),
        signal: AbortSignal.timeout(5000),
      });

      if (res.ok) {
        console.log('[patientSyncApi] Medical info synced via backend API.');
        return true;
      }
    } catch {
      console.warn('[patientSyncApi] Backend unreachable for medical update, using Firestore.');
    }
  }

  // 2. Fallback: direct Firestore write
  try {
    const docRef = doc(db, PATIENT_DETAILS_COLLECTION, uid);
    await setDoc(docRef, { medicalHistory: medicalData, updatedAt: serverTimestamp() }, { merge: true });
    return true;
  } catch (err) {
    console.error('[patientSyncApi] Failed to sync medical info to Firestore:', err);
    return false;
  }
};

/**
 * Update avatar URL in the patient details record.
 * Called from AuthContext.updateAvatar().
 */
export const syncAvatarToPatientDetails = async (
  uid: string,
  avatarUri: string
): Promise<void> => {
  try {
    const docRef = doc(db, PATIENT_DETAILS_COLLECTION, uid);
    await setDoc(docRef, { avatarUrl: avatarUri, updatedAt: serverTimestamp() }, { merge: true });
  } catch (err) {
    console.warn('[patientSyncApi] Failed to sync avatar to patient details:', err);
  }
};

/**
 * Fetch the current user's patient record from Firestore `patient details`.
 */
export const fetchOwnPatientRecord = async (uid: string): Promise<PatientRecord | null> => {
  try {
    const docRef = doc(db, PATIENT_DETAILS_COLLECTION, uid);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as PatientRecord;
    }
    return null;
  } catch (err) {
    console.error('[patientSyncApi] Failed to fetch own patient record:', err);
    return null;
  }
};

/**
 * Subscribe to real-time updates of the user's own patient record.
 * Useful for showing live admin updates (therapist assignment, appointments, etc.) in the mobile app.
 */
export const subscribeToOwnPatientRecord = (
  uid: string,
  onData: (record: PatientRecord | null) => void,
  onError?: (err: Error) => void
): Unsubscribe => {
  const docRef = doc(db, PATIENT_DETAILS_COLLECTION, uid);

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onData({ id: snapshot.id, ...snapshot.data() } as PatientRecord);
      } else {
        onData(null);
      }
    },
    (err) => {
      console.warn('[patientSyncApi] Real-time listener error:', err);
      if (onError) onError(err);
    }
  );
};
