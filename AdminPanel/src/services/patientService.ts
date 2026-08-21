import {
  collection,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/auth/config/firebase';
import type { Patient, PatientClinicalNote, PatientGoal } from '@/patients/types';
import { toIsoStringSafe } from '@/utils/dateUtils';

export const PATIENTS_FIRESTORE_COLLECTION = 'users';
export const LEGACY_PATIENTS_COLLECTION = 'patient details';

export const isGaneshUser = (data: any): boolean => {
  if (!data) return false;
  try {
    const str = typeof data === 'string' ? data : JSON.stringify(data);
    return str.toLowerCase().includes('ganesh');
  } catch {
    return false;
  }
};

export const formatPatientId = (uid: string, existingPatientId?: string): string => {
  if (existingPatientId && /^PAT-\d{4,}$/i.test(existingPatientId)) {
    return existingPatientId.toUpperCase();
  }
  if (existingPatientId && /^#?OM-(\d{4,})$/i.test(existingPatientId)) {
    const match = existingPatientId.match(/\d+/);
    if (match) return `PAT-${match[0]}`;
  }
  if (existingPatientId && /^PT-(\d{4,})$/i.test(existingPatientId)) {
    const match = existingPatientId.match(/\d+/);
    if (match) return `PAT-${match[0]}`;
  }

  const clean = (uid || '').replace(/[^a-zA-Z0-9]/g, '');
  if (!clean) return 'PAT-1001';

  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash * 31 + clean.charCodeAt(i)) & 0x7fffffff;
  }
  const num = 1001 + (hash % 8999);
  return `PAT-${num}`;
};

export const getTherapistInitials = (name?: string): string => {
  if (!name || name === 'No therapist assigned' || name === 'Unassigned') return '--';
  const clean = name.replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.)\s+/i, '').trim();
  const parts = clean.split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  if (parts.length === 1 && parts[0].length > 0) return parts[0].slice(0, 2).toUpperCase();
  return '--';
};

export const resolveCleanName = (rawName?: string, rawFullName?: string, fallbackId?: string, extraData?: any): string => {
  const candidates = [
    rawName,
    rawFullName,
    extraData?.name,
    extraData?.fullName,
    extraData?.displayName,
    extraData?.userName,
    extraData?.patientName,
    extraData?.user_name,
  ];

  for (const c of candidates) {
    if (
      c &&
      typeof c === 'string' &&
      c !== 'Unnamed Patient' &&
      !c.startsWith('user_') &&
      !c.startsWith('patient_') &&
      !c.includes('undefined') &&
      c.trim().length > 0
    ) {
      return c.trim();
    }
  }

  const phone = extraData?.phone || extraData?.phoneNumber || extraData?.userPhone;
  if (phone && typeof phone === 'string' && phone.trim().length > 0) {
    return `Patient (${phone.trim()})`;
  }

  return fallbackId ? `Patient (${fallbackId.slice(0, 6)})` : 'Registered Patient';
};

export const mapDocToPatient = (id: string, data: any): Patient => {
  const therapistName = data.therapistName || (data.doctorId ? 'Assigned Specialist' : 'No therapist assigned');
  return {
    id,
    patientId: formatPatientId(id, data.patientId),
    name: resolveCleanName(data.name, data.fullName, id, data),
    age: Number(data.age) || 30,
    gender: data.gender || 'Male',
    avatarUrl:
      data.avatarUrl ||
      data.avatarUri ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    condition: data.condition || data.primaryConcern || 'General Rehab',
    therapistName,
    therapistInitials: getTherapistInitials(therapistName),
    therapistAvatarBg: data.therapistAvatarBg || 'bg-teal-50 text-teal-700',
    therapistSpecialization: data.therapistSpecialization || 'Physiotherapy Specialist',
    nextAppointmentDate: data.nextAppointmentDate || 'Pending Schedule',
    nextAppointmentTime: data.nextAppointmentTime || '--',
    recoveryScore: Number(data.recoveryScore) || 0,
    status: data.status || 'Active Treatment',
    phone: data.phone || '',
    email: data.email || '',
    joinedDate: data.joinedDate || 'Aug 2026',
    address: data.address || '',
    bloodGroup: data.bloodGroup || '',
    emergencyContact: data.emergencyContact || undefined,
    notes: data.notes || '',
    painLevel: data.painLevel || 'Mild',
    programsAssignedCount: Number(data.programsAssignedCount) || 0,
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
  };
};

export const mapUserDocToPatient = (id: string, data: any): Patient => {
  const therapistName = data.therapistName || (data.doctorId ? 'Assigned Specialist' : 'No therapist assigned');
  return {
    id,
    patientId: formatPatientId(id, data.patientId),
    name: resolveCleanName(data.fullName, data.name, id, data),
    age: Number(data.age) || 28,
    gender: data.gender || 'Not specified',
    avatarUrl:
      data.avatarUri ||
      data.avatarUrl ||
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    condition: data.primaryConcern || 'Physiotherapy Evaluation',
    therapistName,
    therapistInitials: getTherapistInitials(therapistName),
    therapistAvatarBg: 'bg-teal-50 text-teal-700',
    therapistSpecialization: 'Physiotherapy Specialist',
    nextAppointmentDate: 'Pending Schedule',
    nextAppointmentTime: '--',
    recoveryScore: 0,
    status: 'Active Treatment',
    phone: data.phone || '',
    email: data.email || '',
    joinedDate: 'Aug 2026',
    address: '',
    bloodGroup: '',
    notes: '',
    painLevel: 'Mild',
    programsAssignedCount: 0,
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
  };
};

/**
 * Subscribe to real-time updates from Firestore 'users' collection (primary central record),
 * legacy 'patient details' collection, AND 'appointments' collection to dynamically resolve Assigned Therapist.
 */
export const subscribeToPatients = (
  onData: (patients: Patient[]) => void,
  onError?: (err: Error) => void
): Unsubscribe => {
  let patientsFromUsers: Patient[] = [];
  let patientsFromDetails: Patient[] = [];
  let appointmentsList: any[] = [];

  const emitMerged = () => {
    const userIds = new Set(patientsFromUsers.map((p) => p.id));
    const uniqueDetails = patientsFromDetails.filter((d) => !userIds.has(d.id));
    const merged = [...patientsFromUsers, ...uniqueDetails];

    // Dynamically resolve assigned therapist and next appointment from appointments collection for each patient
    const enriched = merged.map((patient) => {
      const patientAppts = appointmentsList.filter(
        (a) => a.userId === patient.id || a.patientId === patient.id
      );

      let therapistName = patient.therapistName;
      let nextDate = patient.nextAppointmentDate;
      let nextTime = patient.nextAppointmentTime;

      if (patientAppts.length > 0) {
        // Sort appointments by date / creation (latest first)
        const sorted = [...patientAppts].sort((a, b) => {
          const tA = new Date(a.fullDate || a.createdAt || 0).getTime();
          const tB = new Date(b.fullDate || b.createdAt || 0).getTime();
          return tB - tA;
        });

        const latestAppt = sorted[0];
        const apptTherapist = latestAppt.doctorName || latestAppt.therapistName;
        if (apptTherapist && (!therapistName || therapistName === 'No therapist assigned' || therapistName === 'Unassigned')) {
          therapistName = apptTherapist;
        }

        const upcoming = sorted.find((a) => a.status === 'Upcoming' || a.status === 'Scheduled');
        if (upcoming) {
          nextDate = upcoming.fullDate || upcoming.date || nextDate;
          nextTime = upcoming.timeSlot || upcoming.time || nextTime;
        }
      }

      if (!therapistName || therapistName === 'Unassigned') {
        therapistName = 'No therapist assigned';
      }

      return {
        ...patient,
        therapistName,
        therapistInitials: getTherapistInitials(therapistName),
        nextAppointmentDate: nextDate,
        nextAppointmentTime: nextTime,
      };
    });

    onData(enriched);
  };

  try {
    const colRefUsers = collection(db, PATIENTS_FIRESTORE_COLLECTION);
    const colRefDetails = collection(db, LEGACY_PATIENTS_COLLECTION);
    const colRefAppts = collection(db, 'appointments');

    const unsubUsers = onSnapshot(
      query(colRefUsers),
      (snapshot) => {
        patientsFromUsers = snapshot.docs
          .map((docSnap) => {
            const data = docSnap.data();
            if (isGaneshUser(data) || isGaneshUser(docSnap.id)) {
              deleteDoc(docSnap.ref).catch(() => {});
              return null;
            }
            return mapDocToPatient(docSnap.id, data);
          })
          .filter(Boolean) as Patient[];
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
        patientsFromDetails = snapshot.docs
          .map((docSnap) => {
            const data = docSnap.data();
            if (isGaneshUser(data) || isGaneshUser(docSnap.id)) {
              deleteDoc(docSnap.ref).catch(() => {});
              return null;
            }
            return mapDocToPatient(docSnap.id, data);
          })
          .filter(Boolean) as Patient[];
        emitMerged();
      },
      (err) => {
        console.warn('Firestore legacy patient details snapshot warning:', err);
      }
    );

    const unsubAppts = onSnapshot(
      query(colRefAppts),
      (snapshot) => {
        appointmentsList = snapshot.docs
          .map((d) => {
            const data = d.data();
            if (isGaneshUser(data)) {
              deleteDoc(d.ref).catch(() => {});
              return null;
            }
            return { id: d.id, ...data };
          })
          .filter(Boolean);
        emitMerged();
      },
      (err) => {
        console.warn('Firestore appointments snapshot for patients warning:', err);
      }
    );

    return () => {
      unsubUsers();
      unsubDetails();
      unsubAppts();
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
        patientId: formatPatientId(docSnap.id, data.patientId),
        name: resolveCleanName(data.name, data.fullName, docSnap.id),
        age: Number(data.age) || 30,
        gender: data.gender || 'Male',
        avatarUrl:
          data.avatarUrl ||
          data.avatarUri ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        condition: data.condition || 'General Rehab',
        therapistName: data.therapistName || 'No therapist assigned',
        therapistInitials: getTherapistInitials(data.therapistName),
        therapistAvatarBg: data.therapistAvatarBg || 'bg-teal-50 text-teal-700',
        therapistSpecialization: data.therapistSpecialization || 'Physiotherapy Specialist',
        nextAppointmentDate: data.nextAppointmentDate || 'Pending Schedule',
        nextAppointmentTime: data.nextAppointmentTime || '--',
        recoveryScore: Number(data.recoveryScore) || 0,
        status: data.status || 'Active Treatment',
        phone: data.phone || '',
        email: data.email || '',
        joinedDate: data.joinedDate || 'Aug 2026',
        address: data.address || '',
        bloodGroup: data.bloodGroup || '',
        notes: data.notes || '',
        painLevel: data.painLevel || 'Mild',
        programsAssignedCount: data.programsAssignedCount || 0,
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
          const therapistName = uData.therapistName || 'No therapist assigned';
          patientsList.push({
            id: uDoc.id,
            patientId: formatPatientId(uDoc.id, uData.patientId),
            name: uData.fullName || uData.name || `User (${uData.phone || uDoc.id.slice(0, 6)})`,
            age: Number(uData.age) || 28,
            gender: uData.gender || 'Not specified',
            avatarUrl:
              uData.avatarUri ||
              uData.avatarUrl ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
            condition: uData.primaryConcern || 'Physiotherapy Evaluation',
            therapistName,
            therapistInitials: getTherapistInitials(therapistName),
            therapistAvatarBg: 'bg-teal-50 text-teal-700',
            therapistSpecialization: 'Physiotherapy Specialist',
            nextAppointmentDate: 'Pending Schedule',
            nextAppointmentTime: '--',
            recoveryScore: 0,
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
  try {
    const userDocRef = doc(db, PATIENTS_FIRESTORE_COLLECTION, id);
    await deleteDoc(userDocRef);
  } catch (err) {
    console.warn('Deleting from users collection error:', err);
  }
  try {
    const detailsDocRef = doc(db, LEGACY_PATIENTS_COLLECTION, id);
    await deleteDoc(detailsDocRef);
  } catch (err) {
    console.warn('Deleting from patient details collection error:', err);
  }
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
        patientId: formatPatientId(snapshot.id, data.patientId),
        name: resolveCleanName(data.name, data.fullName, snapshot.id),
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

/**
 * Add an activity log event for a patient to Firestore 'patient_activity_logs'
 */
export const addPatientActivityLog = async (
  patientId: string,
  logData: {
    action: string;
    description: string;
    performedBy?: string;
    metadata?: any;
  }
): Promise<string> => {
  try {
    const colRef = collection(db, 'patient_activity_logs');
    const docRef = await addDoc(colRef, {
      patientId,
      userId: patientId,
      action: logData.action,
      description: logData.description,
      performedBy: logData.performedBy || 'Admin',
      metadata: logData.metadata || {},
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (err) {
    console.error('Error adding patient activity log:', err);
    throw err;
  }
};

/**
 * Subscribe to real-time activity logs for a specific patient
 */
export const subscribeToPatientActivityLogs = (
  patientId: string,
  onData: (logs: any[]) => void
): Unsubscribe => {
  if (!patientId) return () => {};
  try {
    const colRef = collection(db, 'patient_activity_logs');
    const q = query(colRef, where('patientId', '==', patientId));
    return onSnapshot(
      q,
      (snap) => {
        const logs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        logs.sort((a: any, b: any) => new Date(b.timestamp || b.createdAt || 0).getTime() - new Date(a.timestamp || a.createdAt || 0).getTime());
        onData(logs);
      },
      (err) => console.warn('Activity logs snapshot error:', err)
    );
  } catch (err) {
    console.error('Failed to subscribe to activity logs:', err);
    return () => {};
  }
};

/**
 * Add a progress record for a patient to Firestore 'patient_progress'
 */
export const addProgressRecord = async (
  patientId: string,
  progressData: {
    therapistId?: string;
    therapistName?: string;
    date?: string;
    painLevel?: number | string;
    mobility?: number | string;
    strength?: string;
    rangeOfMotion?: string;
    assessmentScore?: number | string;
    notes?: string;
    metrics?: any;
  }
): Promise<string> => {
  try {
    const now = new Date().toISOString();
    const colRef = collection(db, 'patient_progress');
    const docRef = await addDoc(colRef, {
      patientId,
      userId: patientId,
      therapistId: progressData.therapistId || '',
      therapistName: progressData.therapistName || 'Attending Therapist',
      date: progressData.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      painLevel: progressData.painLevel || 'Mild',
      mobility: progressData.mobility || 'Normal',
      strength: progressData.strength || 'Good',
      rangeOfMotion: progressData.rangeOfMotion || '80%',
      assessmentScore: progressData.assessmentScore || 80,
      notes: progressData.notes || '',
      metrics: progressData.metrics || {},
      createdAt: now,
      updatedAt: now,
    });

    // Also update patient's top-level painLevel/recoveryScore in patient document
    if (progressData.painLevel !== undefined || progressData.assessmentScore !== undefined) {
      await updatePatientRecord(patientId, {
        ...(progressData.painLevel !== undefined ? { painLevel: String(progressData.painLevel) as any } : {}),
        ...(progressData.assessmentScore !== undefined ? { recoveryScore: Number(progressData.assessmentScore) } : {}),
      });
    }

    // Log action
    await addPatientActivityLog(patientId, {
      action: 'Progress updated',
      description: `New progress record logged (${progressData.notes || 'Assessment updated'}).`,
      performedBy: progressData.therapistName || 'Admin/Therapist',
    });

    return docRef.id;
  } catch (err) {
    console.error('Error adding progress record:', err);
    throw err;
  }
};

/**
 * Subscribe to real-time progress records for a patient
 */
export const subscribeToPatientProgress = (
  patientId: string,
  onData: (records: any[]) => void
): Unsubscribe => {
  if (!patientId) return () => {};
  try {
    const colRef = collection(db, 'patient_progress');
    const q = query(colRef, where('patientId', '==', patientId));
    return onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        onData(list);
      },
      (err) => console.warn('Patient progress snapshot error:', err)
    );
  } catch (err) {
    console.error('Failed to subscribe to progress records:', err);
    return () => {};
  }
};

/**
 * Save Medical History document/records for a patient in Firestore 'patient_medical_history'
 */
export const saveMedicalHistoryRecord = async (
  patientId: string,
  medicalData: {
    primaryDiagnosis?: string;
    description?: string;
    diagnosedDate?: string;
    status?: 'CURRENT' | 'PAST';
    surgeries?: any[];
    allergies?: any[];
    medications?: any[];
    timeline?: any[];
    familyHistory?: any[];
    vitalMetrics?: any;
    notes?: string;
  }
): Promise<string> => {
  try {
    const now = new Date().toISOString();
    const colRef = collection(db, 'patient_medical_history');
    const docRef = await addDoc(colRef, {
      patientId,
      userId: patientId,
      ...medicalData,
      createdAt: now,
      updatedAt: now,
    });

    // Sync to user/patient doc's medicalHistory field as well for quick view
    await updatePatientRecord(patientId, {
      medicalHistory: medicalData as any,
    });

    await addPatientActivityLog(patientId, {
      action: 'Medical history added',
      description: `Medical history updated: ${medicalData.primaryDiagnosis || 'New record'}`,
      performedBy: 'Admin',
    });

    return docRef.id;
  } catch (err) {
    console.error('Error saving medical history record:', err);
    throw err;
  }
};

/**
 * Subscribe to real-time medical history for a patient
 */
export const subscribeToPatientMedicalHistory = (
  patientId: string,
  onData: (historyItems: any[]) => void
): Unsubscribe => {
  if (!patientId) return () => {};
  try {
    const colRef = collection(db, 'patient_medical_history');
    const q = query(colRef, where('patientId', '==', patientId));
    return onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        onData(list);
      },
      (err) => console.warn('Medical history snapshot error:', err)
    );
  } catch (err) {
    console.error('Failed to subscribe to medical history records:', err);
    return () => {};
  }
};

/**
 * Add a clinical note to Firestore 'patient_notes'
 */
export const saveClinicalNote = async (
  patientId: string,
  noteData: {
    title: string;
    category?: string;
    content: string;
    contentSecondary?: string;
    isInternal?: boolean;
    author?: string;
    attachments?: any[];
  }
): Promise<string> => {
  try {
    const now = new Date().toISOString();
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const colRef = collection(db, 'patient_notes');
    const docRef = await addDoc(colRef, {
      patientId,
      userId: patientId,
      title: noteData.title,
      category: noteData.category || (noteData.isInternal ? 'INTERNAL' : 'SESSION NOTE'),
      content: noteData.content,
      contentSecondary: noteData.contentSecondary || '',
      isInternal: !!noteData.isInternal,
      author: noteData.author || 'Dr. Ananya Iyer',
      date: dateStr,
      time: timeStr,
      attachments: noteData.attachments || [],
      createdAt: now,
      updatedAt: now,
    });

    await addPatientActivityLog(patientId, {
      action: 'Note added',
      description: `Clinical note "${noteData.title}" recorded by ${noteData.author || 'Admin'}.`,
      performedBy: noteData.author || 'Admin',
    });

    return docRef.id;
  } catch (err) {
    console.error('Error saving clinical note:', err);
    throw err;
  }
};

/**
 * Delete a clinical note from Firestore 'patient_notes'
 */
export const deleteClinicalNote = async (noteId: string, patientId?: string): Promise<void> => {
  try {
    const docRef = doc(db, 'patient_notes', noteId);
    await deleteDoc(docRef);

    if (patientId) {
      await addPatientActivityLog(patientId, {
        action: 'Note deleted',
        description: 'Clinical note was deleted.',
        performedBy: 'Admin',
      });
    }
  } catch (err) {
    console.error('Error deleting clinical note:', err);
    throw err;
  }
};

/**
 * Subscribe to real-time clinical notes for a patient
 */
export const subscribeToPatientNotes = (
  patientId: string,
  onData: (notes: any[]) => void
): Unsubscribe => {
  if (!patientId) return () => {};
  try {
    const colRef = collection(db, 'patient_notes');
    const q = query(colRef, where('patientId', '==', patientId));
    return onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        onData(list);
      },
      (err) => console.warn('Clinical notes snapshot error:', err)
    );
  } catch (err) {
    console.error('Failed to subscribe to clinical notes:', err);
    return () => {};
  }
};

