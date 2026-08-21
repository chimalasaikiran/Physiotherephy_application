import {
  collection,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  increment,
  query,
  orderBy,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/auth/config/firebase';
import type { Therapist } from '@/therapists/types';

export const THERAPISTS_COLLECTION = 'therapists';

// ─────────────────────────────────────────────────────────────────────────────
// Mapper — normalize Firestore document → Therapist
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
      ? data.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
      : 'DR'),
  assignedPatientIds: Array.isArray(data.assignedPatientIds) ? data.assignedPatientIds : [],
  weeklySchedule: Array.isArray(data.weeklySchedule) ? data.weeklySchedule : undefined,
  createdAt: data.createdAt || null,
  updatedAt: data.updatedAt || null,
});

// ─────────────────────────────────────────────────────────────────────────────
// Real-time subscription
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Subscribe to real-time updates from the 'therapists' Firestore collection.
 * Calls onData on every change. Returns an unsubscribe function.
 */
export const subscribeToTherapists = (
  onData: (therapists: Therapist[]) => void,
  onError?: (err: Error) => void
): Unsubscribe => {
  try {
    const colRef = collection(db, THERAPISTS_COLLECTION);
    const q = query(colRef, orderBy('name', 'asc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const therapists: Therapist[] = snapshot.docs.map((docSnap) =>
          mapDocToTherapist(docSnap.id, docSnap.data())
        );
        onData(therapists);
      },
      (err) => {
        console.warn('Firestore therapists snapshot error:', err);
        // Fallback: try without orderBy (before index is built)
        const unsubFallback = onSnapshot(
          collection(db, THERAPISTS_COLLECTION),
          (snapshot) => {
            const therapists: Therapist[] = snapshot.docs.map((docSnap) =>
              mapDocToTherapist(docSnap.id, docSnap.data())
            );
            onData(therapists);
          },
          (err2) => {
            console.error('Therapist fallback snapshot error:', err2);
            if (onError) onError(err2);
          }
        );
        return unsubFallback;
      }
    );
  } catch (error: any) {
    console.error('Failed to setup therapists snapshot listener:', error);
    if (onError) onError(error);
    return () => { };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// CRUD Operations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a new therapist record in Firestore.
 * Returns the new document ID.
 */
export const createTherapistRecord = async (
  therapistData: Omit<Therapist, 'id' | 'patientsCount' | 'rating'>
): Promise<string> => {
  const colRef = collection(db, THERAPISTS_COLLECTION);
  const initials =
    therapistData.initials ||
    therapistData.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

  const docRef = await addDoc(colRef, {
    ...therapistData,
    initials,
    patientsCount: 0,
    rating: 5.0,
    assignedPatientIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return docRef.id;
};

/**
 * Update an existing therapist record in Firestore.
 */
export const updateTherapistRecord = async (
  id: string,
  updateData: Partial<Therapist>
): Promise<void> => {
  const docRef = doc(db, THERAPISTS_COLLECTION, id);
  // Remove undefined fields
  const payload: Record<string, any> = { updatedAt: new Date().toISOString() };
  for (const [key, val] of Object.entries(updateData)) {
    if (val !== undefined && key !== 'id') {
      payload[key] = val;
    }
  }
  await updateDoc(docRef, payload);
};

/**
 * Delete a therapist record from Firestore.
 */
export const deleteTherapistRecord = async (id: string): Promise<void> => {
  const docRef = doc(db, THERAPISTS_COLLECTION, id);
  await deleteDoc(docRef);
};

/**
 * Toggle therapist status between ACTIVE and INACTIVE.
 */
export const toggleTherapistStatus = async (
  id: string,
  currentStatus: 'ACTIVE' | 'INACTIVE'
): Promise<void> => {
  const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  await updateTherapistRecord(id, { status: newStatus });
};

/**
 * Assign a patient to a therapist.
 * Appends patientId to assignedPatientIds and increments patientsCount.
 */
export const assignPatientToTherapist = async (
  therapistId: string,
  patientId: string
): Promise<void> => {
  const docRef = doc(db, THERAPISTS_COLLECTION, therapistId);
  await updateDoc(docRef, {
    assignedPatientIds: arrayUnion(patientId),
    patientsCount: increment(1),
    updatedAt: new Date().toISOString(),
  });
};

/**
 * Unassign a patient from a therapist.
 * Removes patientId from assignedPatientIds and decrements patientsCount.
 */
export const unassignPatientFromTherapist = async (
  therapistId: string,
  patientId: string,
  currentCount: number
): Promise<void> => {
  const docRef = doc(db, THERAPISTS_COLLECTION, therapistId);
  await updateDoc(docRef, {
    assignedPatientIds: arrayRemove(patientId),
    patientsCount: Math.max(0, currentCount - 1),
    updatedAt: new Date().toISOString(),
  });
};

/**
 * Seed demo therapist data into Firestore if the collection is empty.
 * Called automatically on first load when no therapists exist.
 */
export const seedDemoTherapistsIfEmpty = async (
  currentTherapists: Therapist[]
): Promise<void> => {
  if (currentTherapists.length > 0) return;

  const { INITIAL_THERAPISTS } = await import('@/therapists/mockTherapists');
  const colRef = collection(db, THERAPISTS_COLLECTION);

  for (const t of INITIAL_THERAPISTS) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, ...rest } = t;
    await addDoc(colRef, {
      ...rest,
      patientsCount: 0,
      assignedPatientIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
};
