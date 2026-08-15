import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  getDoc,
  getDocs,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type TherapistAvailability = 'Available Today' | 'Busy' | 'On Leave';
export type TherapistStatus = 'ACTIVE' | 'INACTIVE';

export interface Therapist {
  id: string;
  name: string;
  degree: string;
  experience: string;
  email: string;
  phone: string;
  specializations: string[];
  availability: TherapistAvailability;
  status: TherapistStatus;
  patientsCount: number;
  rating: number;
  consultationFee?: number;
  completedSessionsCount?: number;
  cancelledSessionsCount?: number;
  totalRevenue?: number;
  activeAppointmentsCount?: number;
  location?: string;
  bio?: string;
  workingHours?: string;
  avatarUrl?: string;
  initials?: string;
  assignedPatientIds?: string[];
  createdAt?: string | null;
  updatedAt?: string | null;
}

const THERAPISTS_COLLECTION = 'therapists';

// ─────────────────────────────────────────────────────────────────────────────
// Mapper
// ─────────────────────────────────────────────────────────────────────────────

export const mapDocToTherapist = (id: string, data: Record<string, any>): Therapist => ({
  id,
  name: data.name || 'Unnamed Therapist',
  degree: data.degree || '',
  experience: data.experience || '',
  email: data.email || '',
  phone: data.phone || '',
  specializations: Array.isArray(data.specializations) ? data.specializations : [],
  availability: data.availability || 'Available Today',
  status: data.status || 'ACTIVE',
  patientsCount: Number(data.patientsCount) || 0,
  rating: Number(data.rating) || 5.0,
  consultationFee: Number(data.consultationFee ?? data.numericFee) || 800,
  completedSessionsCount: Number(data.completedSessionsCount) || 0,
  cancelledSessionsCount: Number(data.cancelledSessionsCount) || 0,
  totalRevenue: Number(data.totalRevenue) || 0,
  activeAppointmentsCount: Number(data.activeAppointmentsCount) || 0,
  location: data.location || '',
  bio: data.bio || '',
  workingHours: data.workingHours || '',
  avatarUrl: data.avatarUrl || '',
  initials:
    data.initials ||
    (data.name
      ? String(data.name)
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase()
      : 'DR'),
  assignedPatientIds: Array.isArray(data.assignedPatientIds) ? data.assignedPatientIds : [],
  createdAt: data.createdAt || null,
  updatedAt: data.updatedAt || null,
});

// ─────────────────────────────────────────────────────────────────────────────
// Real-time subscription — use this in screens for live updates
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Subscribe to the 'therapists' Firestore collection in real time.
 * Any change made by the admin (add/edit/delete/toggle status) will
 * be pushed to the callback immediately.
 *
 * Usage in a screen:
 *   useEffect(() => {
 *     const unsub = subscribeToTherapists(setTherapists);
 *     return () => unsub();
 *   }, []);
 */
export const subscribeToTherapists = (
  onData: (therapists: Therapist[]) => void,
  onError?: (err: Error) => void
): Unsubscribe => {
  try {
    const colRef = collection(db, THERAPISTS_COLLECTION);
    const q = query(colRef, orderBy('name', 'asc'));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const therapists = snapshot.docs.map((d) => mapDocToTherapist(d.id, d.data()));
        onData(therapists);
      },
      (err) => {
        console.warn('[therapistService] onSnapshot error, falling back without orderBy:', err.message);
        // Fallback without orderBy (index may not be ready yet)
        const fallback = onSnapshot(
          collection(db, THERAPISTS_COLLECTION),
          (snap) => {
            const therapists = snap.docs.map((d) => mapDocToTherapist(d.id, d.data()));
            onData(therapists);
          },
          (err2) => {
            console.error('[therapistService] Fallback snapshot error:', err2);
            if (onError) onError(err2);
          }
        );
        return fallback;
      }
    );
    return unsub;
  } catch (error: any) {
    console.error('[therapistService] Failed to create snapshot listener:', error);
    if (onError) onError(error);
    return () => {};
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// One-shot fetch (for cases where real-time is not needed)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch all active therapists once (no real-time updates).
 */
export const fetchTherapists = async (): Promise<Therapist[]> => {
  try {
    const colRef = collection(db, THERAPISTS_COLLECTION);
    const snap = await getDocs(colRef);
    return snap.docs.map((d) => mapDocToTherapist(d.id, d.data()));
  } catch (err) {
    console.error('[therapistService] fetchTherapists error:', err);
    return [];
  }
};

/**
 * Fetch a single therapist by Firestore document ID.
 */
export const fetchTherapistById = async (id: string): Promise<Therapist | null> => {
  try {
    const docRef = doc(db, THERAPISTS_COLLECTION, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return mapDocToTherapist(snap.id, snap.data());
  } catch (err) {
    console.error(`[therapistService] fetchTherapistById error for id=${id}:`, err);
    return null;
  }
};
