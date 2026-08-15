import {
  collection,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/auth/config/firebase';
import type { Patient, PatientClinicalNote, PatientGoal } from '@/patients/types';
import { toIsoStringSafe } from '@/utils/dateUtils';

export const PATIENTS_FIRESTORE_COLLECTION = 'users';
export const LEGACY_PATIENTS_COLLECTION = 'patient details';

export const mapDocToPatient = (id: string, data: any): Patient => ({
  id,
  patientId: data.patientId || `#OM-${id.slice(0, 4)}`,
  name: data.name || data.fullName || 'Unnamed Patient',
  age: Number(data.age) || 30,
  gender: data.gender || 'Male',
  avatarUrl:
    data.avatarUrl ||
    data.avatarUri ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  condition: data.condition || data.primaryConcern || 'General Rehab',
  therapistName: data.therapistName || 'Dr. Ananya Sharma',
  therapistInitials: data.therapistInitials || 'AS',
  therapistAvatarBg: data.therapistAvatarBg || 'bg-teal-50 text-teal-700',
  therapistSpecialization: data.therapistSpecialization || 'Physiotherapy Specialist',
  nextAppointmentDate: data.nextAppointmentDate || 'Today',
  nextAppointmentTime: data.nextAppointmentTime || '10:00 AM',
  recoveryScore: Number(data.recoveryScore) || 75,
  status: data.status || 'Active Treatment',
  phone: data.phone || '',
  email: data.email || '',
  joinedDate: data.joinedDate || 'Aug 2026',
  address: data.address || '',
  bloodGroup: data.bloodGroup || '',
  emergencyContact: data.emergencyContact || undefined,
  notes: data.notes || '',
  painLevel: data.painLevel || 'Mild',
  programsAssignedCount: Number(data.programsAssignedCount) || 1,
  sessionsCompleted: Number(data.sessionsCompleted) || 0,
  sessionsTotal: Number(data.sessionsTotal) || 12,
  treatmentPlan: data.treatmentPlan || undefined,
  medicalHistory: data.medicalHistory || undefined,
  goals: Array.isArray(data.goals) ? data.goals : [],
  reports: Array.isArray(data.reports) ? data.reports : [],
  upcomingAppointments: Array.isArray(data.upcomingAppointments) ? data.upcomingAppointments : [],
  pastAppointments: Array.isArray(data.pastAppointments) ? data.pastAppointments : [],
  payments: Array.isArray(data.payments) ? data.payments : [],
  programs: Array.isArray(data.programs) ? data.programs : [],
  exercises: Array.isArray(data.exercises) ? data.exercises : [],
  clinicalNotes: Array.isArray(data.clinicalNotes) ? data.clinicalNotes : [],
  createdAt: toIsoStringSafe(data.createdAt),
  updatedAt: toIsoStringSafe(data.updatedAt),
});

export const mapUserDocToPatient = (id: string, data: any): Patient => ({
  id,
  patientId: `#OM-${id.slice(0, 4)}`,
  name: data.fullName || data.name || `User (${data.phone || id.slice(0, 6)})`,
  age: Number(data.age) || 28,
  gender: data.gender || 'Not specified',
  avatarUrl:
    data.avatarUri ||
    data.avatarUrl ||
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  condition: data.primaryConcern || 'Physiotherapy Evaluation',
  therapistName: 'Dr. Ananya Sharma',
  therapistInitials: 'AS',
  therapistAvatarBg: 'bg-teal-50 text-teal-700',
  therapistSpecialization: 'Physiotherapy Specialist',
  nextAppointmentDate: 'Pending Schedule',
  nextAppointmentTime: '10:00 AM',
  recoveryScore: 70,
  status: 'Active Treatment',
  phone: data.phone || '',
  email: data.email || '',
  joinedDate: 'Aug 2026',
  address: '',
  bloodGroup: '',
  notes: '',
  painLevel: 'Mild',
  programsAssignedCount: 1,
  sessionsCompleted: 0,
  sessionsTotal: 10,
  goals: [],
  reports: [],
  upcomingAppointments: [],
  pastAppointments: [],
  payments: [],
  programs: [],
  exercises: [],
  clinicalNotes: [],
  createdAt: toIsoStringSafe(data.createdAt),
  updatedAt: toIsoStringSafe(data.updatedAt),
});

/**
 * Subscribe to real-time updates from Firestore 'users' collection (primary central record)
 * AND legacy 'patient details' collection.
 */
export const subscribeToPatients = (
  onData: (patients: Patient[]) => void,
  onError?: (err: Error) => void
): Unsubscribe => {
  let patientsFromUsers: Patient[] = [];
  let patientsFromDetails: Patient[] = [];

  const emitMerged = () => {
    const userIds = new Set(patientsFromUsers.map((p) => p.id));
    const uniqueDetails = patientsFromDetails.filter((d) => !userIds.has(d.id));
    const merged = [...patientsFromUsers, ...uniqueDetails];
    onData(merged);
  };

  try {
    const colRefUsers = collection(db, PATIENTS_FIRESTORE_COLLECTION);
    const colRefDetails = collection(db, LEGACY_PATIENTS_COLLECTION);

    const unsubUsers = onSnapshot(
      query(colRefUsers),
      (snapshot) => {
        patientsFromUsers = snapshot.docs.map((docSnap) =>
          mapDocToPatient(docSnap.id, docSnap.data())
        );
        emitMerged();
      },
      (err) => {
        console.warn('Firestore users snapshot error:', err);
        if (onError) onError(err);
      }
    );

    const unsubDetails = onSnapshot(
      query(colRefDetails),
      (snapshot) => {
        patientsFromDetails = snapshot.docs.map((docSnap) =>
          mapDocToPatient(docSnap.id, docSnap.data())
        );
        emitMerged();
      },
      (err) => {
        console.warn('Firestore legacy patient details snapshot warning:', err);
      }
    );

    return () => {
      unsubUsers();
      unsubDetails();
    };
  } catch (error: any) {
    console.error('Failed to setup Firestore snapshot listener:', error);
    if (onError) onError(error);
    return () => {};
  }
};


/**
 * Fetch all patients through backend API service.
 * Priority: /api/v1/patients → /api/v1/users → Firestore direct fallback
 */
export const fetchPatientsFromApi = async (): Promise<Patient[]> => {
  const backendBaseUrl = import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:5001/api/v1';

  // 1. Try the new dedicated /patients endpoint (merged patient details + users)
  try {
    const response = await fetch(`${backendBaseUrl}/patients`);
    if (response.ok) {
      const json = await response.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data as Patient[];
      }
    }
  } catch {
    console.warn('Backend /patients endpoint unreachable, trying /users...');
  }

  // 2. Secondary fallback: /users endpoint
  try {
    const response = await fetch(`${backendBaseUrl}/users`);
    if (response.ok) {
      const json = await response.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data as Patient[];
      }
    }
  } catch (apiErr) {
    console.warn('Backend API service unreachable, falling back to Firestore direct fetch:', apiErr);
  }

  // 3. Final fallback: Fetch directly from Firestore 'patient details' collection
  try {
    const colRef = collection(db, PATIENTS_FIRESTORE_COLLECTION);
    const snapshot = await getDocs(colRef);
    const patientsList: Patient[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        patientId: data.patientId || `#OM-${docSnap.id.slice(0, 4)}`,
        name: data.name || data.fullName || 'Unnamed Patient',
        age: Number(data.age) || 30,
        gender: data.gender || 'Male',
        avatarUrl:
          data.avatarUrl ||
          data.avatarUri ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        condition: data.condition || 'General Rehab',
        therapistName: data.therapistName || 'Dr. Ananya Sharma',
        therapistInitials: data.therapistInitials || 'AS',
        therapistAvatarBg: data.therapistAvatarBg || 'bg-teal-50 text-teal-700',
        therapistSpecialization: data.therapistSpecialization || 'Physiotherapy Specialist',
        nextAppointmentDate: data.nextAppointmentDate || 'Today',
        nextAppointmentTime: data.nextAppointmentTime || '10:00 AM',
        recoveryScore: Number(data.recoveryScore) || 75,
        status: data.status || 'Active Treatment',
        phone: data.phone || '',
        email: data.email || '',
        joinedDate: data.joinedDate || 'Aug 2026',
        address: data.address || '',
        bloodGroup: data.bloodGroup || '',
        notes: data.notes || '',
        painLevel: data.painLevel || 'Mild',
        programsAssignedCount: data.programsAssignedCount || 1,
        sessionsCompleted: data.sessionsCompleted || 0,
        sessionsTotal: data.sessionsTotal || 12,
        treatmentPlan: data.treatmentPlan || undefined,
        medicalHistory: data.medicalHistory || undefined,
        goals: Array.isArray(data.goals) ? data.goals : [],
        reports: Array.isArray(data.reports) ? data.reports : [],
        upcomingAppointments: Array.isArray(data.upcomingAppointments) ? data.upcomingAppointments : [],
        pastAppointments: Array.isArray(data.pastAppointments) ? data.pastAppointments : [],
        payments: Array.isArray(data.payments) ? data.payments : [],
        programs: Array.isArray(data.programs) ? data.programs : [],
        exercises: Array.isArray(data.exercises) ? data.exercises : [],
        clinicalNotes: Array.isArray(data.clinicalNotes) ? data.clinicalNotes : [],
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
      };
    });

    // Also attempt fetching from 'users' collection if empty or to complement
    try {
      const usersColRef = collection(db, 'users');
      const usersSnap = await getDocs(usersColRef);
      const existingIds = new Set(patientsList.map((p) => p.id));
      usersSnap.docs.forEach((uDoc) => {
        if (!existingIds.has(uDoc.id)) {
          const uData = uDoc.data();
          patientsList.push({
            id: uDoc.id,
            patientId: `#OM-${uDoc.id.slice(0, 4)}`,
            name: uData.fullName || uData.name || `User (${uData.phone || uDoc.id.slice(0, 6)})`,
            age: Number(uData.age) || 28,
            gender: uData.gender || 'Not specified',
            avatarUrl:
              uData.avatarUri ||
              uData.avatarUrl ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
            condition: uData.primaryConcern || 'Physiotherapy Evaluation',
            therapistName: 'Dr. Ananya Sharma',
            therapistInitials: 'AS',
            therapistAvatarBg: 'bg-teal-50 text-teal-700',
            therapistSpecialization: 'Physiotherapy Specialist',
            nextAppointmentDate: 'Pending Schedule',
            nextAppointmentTime: '10:00 AM',
            recoveryScore: 70,
            status: 'Active Treatment',
            phone: uData.phone || '',
            email: uData.email || '',
            joinedDate: 'Aug 2026',
            address: '',
            bloodGroup: '',
            notes: '',
            painLevel: 'Mild',
            programsAssignedCount: 1,
            sessionsCompleted: 0,
            sessionsTotal: 10,
            goals: [],
            reports: [],
            upcomingAppointments: [],
            pastAppointments: [],
            payments: [],
            programs: [],
            exercises: [],
            clinicalNotes: [],
            createdAt: uData.createdAt || new Date().toISOString(),
            updatedAt: uData.updatedAt || new Date().toISOString(),
          });
        }
      });
    } catch (usersErr) {
      console.warn('Direct Firestore users collection fetch warning:', usersErr);
    }

    return patientsList;
  } catch (err) {
    console.error('Error fetching patients directly from Firestore:', err);
    return [];
  }
};


/**
 * Seed demo patients directly into Firestore collection 'patient details'
 */
export const seedDemoPatients = async (): Promise<boolean> => {
  try {
    const { initialSeedPatients } = await import('@/patients/seedData');
    const colRef = collection(db, PATIENTS_FIRESTORE_COLLECTION);
    for (const pt of initialSeedPatients) {
      await addDoc(colRef, {
        ...pt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    return true;
  } catch (e) {
    console.error('Firestore seed error:', e);
    return false;
  }
};

/**
 * Create new patient directly in Firestore
 */
export const createPatientRecord = async (patientData: Partial<Patient>): Promise<string> => {
  const colRef = collection(db, PATIENTS_FIRESTORE_COLLECTION);
  const docRef = await addDoc(colRef, {
    ...patientData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return docRef.id;
};

/**
 * Update existing patient record in Firestore 'patient details'
 */
export const updatePatientRecord = async (id: string, updateData: Partial<Patient>): Promise<void> => {
  const docRef = doc(db, PATIENTS_FIRESTORE_COLLECTION, id);
  await updateDoc(docRef, {
    ...updateData,
    updatedAt: new Date().toISOString(),
  });
};

/**
 * Delete patient record from Firestore 'patient details'
 */
export const deletePatientRecord = async (id: string): Promise<void> => {
  const docRef = doc(db, PATIENTS_FIRESTORE_COLLECTION, id);
  await deleteDoc(docRef);
};

/**
 * Helper to append a clinical note to a patient's record in Firestore
 */
export const addClinicalNoteToPatient = async (
  patientId: string,
  existingNotes: PatientClinicalNote[],
  newNote: Omit<PatientClinicalNote, 'id'>
): Promise<void> => {
  const noteObj: PatientClinicalNote = {
    ...newNote,
    id: `cn-${Date.now()}`,
  };
  const updatedNotes = [noteObj, ...existingNotes];
  await updatePatientRecord(patientId, { clinicalNotes: updatedNotes });
};

/**
 * Helper to append a goal to a patient's record in Firestore
 */
export const addGoalToPatient = async (
  patientId: string,
  existingGoals: PatientGoal[],
  newGoal: Omit<PatientGoal, 'id'>
): Promise<void> => {
  const goalObj: PatientGoal = {
    ...newGoal,
    id: `g-${Date.now()}`,
  };
  const updatedGoals = [...existingGoals, goalObj];
  await updatePatientRecord(patientId, { goals: updatedGoals });
};

/**
 * Helper to toggle a goal completion status in Firestore
 */
export const toggleGoalStatus = async (
  patientId: string,
  existingGoals: PatientGoal[],
  goalId: string
): Promise<void> => {
  const updatedGoals = existingGoals.map((g) =>
    g.id === goalId ? { ...g, completed: !g.completed } : g
  );
  await updatePatientRecord(patientId, { goals: updatedGoals });
};

/**
 * Fetch a single patient record by Firestore document ID.
 * Primary: backend GET /api/v1/patients/:id
 * Fallback: direct Firestore document read from 'patient details' collection.
 */
export const fetchPatientById = async (id: string): Promise<Patient | null> => {
  const backendBaseUrl = import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:5001/api/v1';

  // 1. Try backend API
  try {
    const response = await fetch(`${backendBaseUrl}/patients/${id}`);
    if (response.ok) {
      const json = await response.json();
      if (json.success && json.data) {
        return json.data as Patient;
      }
    }
  } catch (apiErr) {
    console.warn(`fetchPatientById: Backend unavailable for id=${id}, falling back to Firestore.`);
  }

  // 2. Fallback: direct Firestore read
  try {
    const { getDoc, doc } = await import('firebase/firestore');
    const docRef = doc(db, PATIENTS_FIRESTORE_COLLECTION, id);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      const data = snapshot.data();
      return {
        id: snapshot.id,
        patientId: data.patientId || `#OM-${id.slice(0, 4)}`,
        name: data.name || data.fullName || 'Unnamed Patient',
        age: Number(data.age) || 0,
        gender: data.gender || 'Not specified',
        avatarUrl: data.avatarUrl || data.avatarUri || '',
        condition: data.condition || 'Physiotherapy Evaluation',
        therapistName: data.therapistName || 'Unassigned',
        therapistInitials: data.therapistInitials || '--',
        therapistAvatarBg: data.therapistAvatarBg || 'bg-slate-100 text-slate-600',
        therapistSpecialization: data.therapistSpecialization || '',
        nextAppointmentDate: data.nextAppointmentDate || 'Pending',
        nextAppointmentTime: data.nextAppointmentTime || '--',
        recoveryScore: Number(data.recoveryScore) || 70,
        status: data.status || 'Active Treatment',
        phone: data.phone || '',
        email: data.email || '',
        joinedDate: data.joinedDate || '',
        address: data.address || '',
        bloodGroup: data.bloodGroup || '',
        emergencyContact: data.emergencyContact || undefined,
        notes: data.notes || '',
        painLevel: data.painLevel || 'Mild',
        programsAssignedCount: Number(data.programsAssignedCount) || 0,
        sessionsCompleted: Number(data.sessionsCompleted) || 0,
        sessionsTotal: Number(data.sessionsTotal) || 10,
        treatmentPlan: data.treatmentPlan || undefined,
        medicalHistory: data.medicalHistory || undefined,
        goals: Array.isArray(data.goals) ? data.goals : [],
        reports: Array.isArray(data.reports) ? data.reports : [],
        upcomingAppointments: Array.isArray(data.upcomingAppointments) ? data.upcomingAppointments : [],
        pastAppointments: Array.isArray(data.pastAppointments) ? data.pastAppointments : [],
        payments: Array.isArray(data.payments) ? data.payments : [],
        programs: Array.isArray(data.programs) ? data.programs : [],
        exercises: Array.isArray(data.exercises) ? data.exercises : [],
        clinicalNotes: Array.isArray(data.clinicalNotes) ? data.clinicalNotes : [],
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
      } as Patient;
    }

    return null;
  } catch (err) {
    console.error(`fetchPatientById: Firestore fallback failed for id=${id}:`, err);
    return null;
  }
};
