import {
  collection,
  onSnapshot,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/auth/config/firebase';
import type {
  Program,
  ProgramStatus,
  ProgramDifficulty,
  ProgramAssignment,
  AssignmentStatus,
  AssignmentProgramStatus,
} from '@/programs/types';
import { INITIAL_PROGRAMS } from '@/programs/mockData';

export const PROGRAMS_FIRESTORE_COLLECTION = 'programs';
export const ASSIGNMENTS_COLLECTION = 'programAssignments';

// ─────────────────────────────────────────
// MAPPERS
// ─────────────────────────────────────────

/**
 * Maps raw Firestore document data to typed Program object
 */
export const mapDocToProgram = (id: string, data: any): Program => ({
  id,
  title: data.title || 'Untitled Program',
  description: data.description || '',
  status: (data.status as ProgramStatus) || 'draft',
  bodyAreaTag: data.bodyAreaTag || 'General Recovery',
  coverImage:
    data.coverImage ||
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
  duration: data.duration || '8 Weeks',
  difficulty: (data.difficulty as ProgramDifficulty) || 'Beginner',
  activePatients: data.activePatients !== undefined ? data.activePatients : 0,
  completionRate: data.completionRate || '0%',
  updatedAt: data.updatedAt || 'Just now',
  type: data.type || 'Rehabilitation',
  exercisesCount: Number(data.exercisesCount) || 10,
  phasesCount: Number(data.phasesCount) || 4,
  totalExercises: Number(data.totalExercises) || Number(data.exercisesCount) || 10,
  thumbnailUrl: data.thumbnailUrl || data.coverImage,
  authorName: data.authorName || 'Clinical Admin',
  authorAvatar: data.authorAvatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
  lastUpdated: data.lastUpdated || data.updatedAt || new Date().toISOString(),
});

/**
 * Maps raw Firestore assignment document to typed ProgramAssignment object
 */
export const mapDocToAssignment = (id: string, data: any): ProgramAssignment => {
  const assignedAt =
    data.assignedAt instanceof Timestamp
      ? data.assignedAt.toDate().toISOString()
      : data.assignedAt || new Date().toISOString();

  const lastActivityAt =
    data.lastActivityAt instanceof Timestamp
      ? data.lastActivityAt.toDate().toISOString()
      : data.lastActivityAt || new Date().toISOString();

  const startDate =
    data.startDate ||
    new Date(assignedAt).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });

  return {
    id,
    programId: data.programId || '',
    patientId: data.patientId || '',
    patientName: data.patientName || 'Unknown Patient',
    patientAvatar:
      data.patientAvatar ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    patientCondition: data.patientCondition || 'General Rehab',
    assignedAt,
    assignedBy: data.assignedBy || 'admin',
    status: (data.status as AssignmentProgramStatus) || 'active',
    assignmentStatus: (data.assignmentStatus as AssignmentStatus) || 'On Track',
    currentWeek: Number(data.currentWeek) || 1,
    totalWeeks: Number(data.totalWeeks) || 8,
    progressPercent: Number(data.progressPercent) || 0,
    adherence: Number(data.adherence) || 100,
    completedExercises: Array.isArray(data.completedExercises) ? data.completedExercises : [],
    pendingExercises: Array.isArray(data.pendingExercises) ? data.pendingExercises : [],
    completedSessions: Number(data.completedSessions) || 0,
    totalSessions: Number(data.totalSessions) || 16,
    lastActivityAt,
    startDate,
    programTitle: data.programTitle || 'Recovery Program',
    isArchived: Boolean(data.isArchived),
    email: data.email || '',
    phone: data.phone || '',
    lastCompletedExercise: data.lastCompletedExercise || '',
  };
};

// ─────────────────────────────────────────
// PROGRAMS CRUD
// ─────────────────────────────────────────

/**
 * Seed initial programs to Firestore if the collection is empty.
 */
export const seedInitialProgramsIfEmpty = async (): Promise<boolean> => {
  try {
    const colRef = collection(db, PROGRAMS_FIRESTORE_COLLECTION);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      console.log('Programs collection is empty. Seeding initial programs to Firestore...');
      for (const prog of INITIAL_PROGRAMS) {
        const docRef = doc(db, PROGRAMS_FIRESTORE_COLLECTION, prog.id);
        await setDoc(docRef, {
          ...prog,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error seeding initial programs to Firestore:', error);
    return false;
  }
};

/**
 * Subscribe to real-time updates from Firestore 'programs' collection.
 */
export const subscribeToPrograms = (
  onData: (programs: Program[]) => void,
  onError?: (err: Error) => void
): Unsubscribe => {
  try {
    const colRef = collection(db, PROGRAMS_FIRESTORE_COLLECTION);

    // Auto seed check
    getDocs(colRef).then((snap) => {
      if (snap.empty) {
        seedInitialProgramsIfEmpty();
      }
    }).catch((e) => console.warn('Check programs empty error:', e));

    const unsubscribe = onSnapshot(
      query(colRef),
      (snapshot) => {
        const programsList: Program[] = snapshot.docs.map((docSnap) =>
          mapDocToProgram(docSnap.id, docSnap.data())
        );
        onData(programsList);
      },
      (err) => {
        console.warn('Firestore programs snapshot error:', err);
        if (onError) onError(err);
      }
    );

    return unsubscribe;
  } catch (error: any) {
    console.error('Failed to setup Firestore snapshot listener for programs:', error);
    if (onError) onError(error);
    return () => {};
  }
};

/**
 * Fetch all programs from Firestore once
 */
export const fetchProgramsFromFirestore = async (): Promise<Program[]> => {
  try {
    const colRef = collection(db, PROGRAMS_FIRESTORE_COLLECTION);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      await seedInitialProgramsIfEmpty();
      const newSnap = await getDocs(colRef);
      return newSnap.docs.map((docSnap) => mapDocToProgram(docSnap.id, docSnap.data()));
    }
    return snapshot.docs.map((docSnap) => mapDocToProgram(docSnap.id, docSnap.data()));
  } catch (error) {
    console.error('Error fetching programs from Firestore:', error);
    return INITIAL_PROGRAMS;
  }
};

/**
 * Create a new program document in Firestore
 */
export const createProgram = async (
  programData: Omit<Program, 'id'>
): Promise<string> => {
  const colRef = collection(db, PROGRAMS_FIRESTORE_COLLECTION);
  const docRef = await addDoc(colRef, {
    ...programData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return docRef.id;
};

/**
 * Update an existing program document in Firestore
 */
export const updateProgram = async (
  id: string,
  updateData: Partial<Program>
): Promise<void> => {
  const docRef = doc(db, PROGRAMS_FIRESTORE_COLLECTION, id);
  await updateDoc(docRef, {
    ...updateData,
    updatedAt: new Date().toISOString(),
  });
};

/**
 * Delete a program document from Firestore
 */
export const deleteProgram = async (id: string): Promise<void> => {
  const docRef = doc(db, PROGRAMS_FIRESTORE_COLLECTION, id);
  await deleteDoc(docRef);
};

/**
 * Toggle status of a program (e.g. published <-> draft <-> archived)
 */
export const toggleProgramStatus = async (
  id: string,
  currentStatus: ProgramStatus
): Promise<void> => {
  const nextStatus: ProgramStatus = currentStatus === 'published' ? 'draft' : 'published';
  await updateProgram(id, { status: nextStatus });
};

/**
 * Duplicate an existing program as a new draft in Firestore
 */
export const duplicateProgram = async (program: Program): Promise<string> => {
  const duplicated: Omit<Program, 'id'> = {
    ...program,
    title: `${program.title} (Copy)`,
    status: 'draft',
    activePatients: 0,
    completionRate: 'N/A',
    updatedAt: 'Just now',
  };
  return await createProgram(duplicated);
};

/**
 * Archive a program in Firestore
 */
export const archiveProgram = async (id: string): Promise<void> => {
  await updateProgram(id, { status: 'archived' });
};

/**
 * Dynamically calculate dashboard statistics from live Firestore program objects
 */
export const calculateProgramDashboardStats = (programs: Program[]) => {
  const totalTemplates = programs.length;
  const publishedCount = programs.filter((p) => p.status === 'published').length;
  const draftCount = programs.filter((p) => p.status === 'draft').length;

  // Sum up active patients count dynamically across programs
  const totalPatientsAssignedCount = programs.reduce((acc, p) => {
    if (typeof p.activePatients === 'number') {
      return acc + p.activePatients;
    }
    const parsed = parseInt(String(p.activePatients).replace(/,/g, ''), 10);
    return acc + (isNaN(parsed) ? 0 : parsed);
  }, 0);

  return {
    totalTemplates,
    publishedCount,
    draftCount,
    totalPatientsAssigned: totalPatientsAssignedCount > 0 ? totalPatientsAssignedCount.toLocaleString() : '0',
  };
};

// ─────────────────────────────────────────
// PROGRAM ASSIGNMENTS CRUD
// ─────────────────────────────────────────

/**
 * Check if a patient is already assigned to a specific program.
 * Returns the existing assignment doc ID if found, null otherwise.
 */
export const isAlreadyAssigned = async (
  programId: string,
  patientId: string
): Promise<string | null> => {
  try {
    const colRef = collection(db, ASSIGNMENTS_COLLECTION);
    const q = query(
      colRef,
      where('programId', '==', programId),
      where('patientId', '==', patientId)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].id;
    }
    return null;
  } catch (err) {
    console.error('isAlreadyAssigned error:', err);
    return null;
  }
};

/**
 * Assign a single patient to a program.
 * Prevents duplicate assignments.
 * Returns the new assignment doc ID, or the existing one if already assigned.
 */
export const assignPatientToProgram = async (
  programId: string,
  programTitle: string,
  patient: {
    id: string;
    name: string;
    avatar?: string;
    condition?: string;
    email?: string;
    phone?: string;
  },
  totalWeeks: number = 8,
  adminId: string = 'admin'
): Promise<{ assignmentId: string; isNew: boolean }> => {
  // 1. Duplicate check
  const existingId = await isAlreadyAssigned(programId, patient.id);
  if (existingId) {
    console.warn(`Patient ${patient.id} is already assigned to program ${programId}`);
    return { assignmentId: existingId, isNew: false };
  }

  // 2. Create assignment document
  const now = new Date().toISOString();
  const startDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });

  const assignmentData = {
    userId: patient.id,
    patientId: patient.id,
    programId,
    programTitle,
    patientName: patient.name,
    patientAvatar:
      patient.avatar ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    patientCondition: patient.condition || 'General Rehab',
    email: patient.email || '',
    phone: patient.phone || '',
    assignedAt: serverTimestamp(),
    assignedBy: adminId,
    status: 'active' as AssignmentProgramStatus,
    assignmentStatus: 'On Track' as AssignmentStatus,
    currentWeek: 1,
    totalWeeks,
    progressPercent: 0,
    adherence: 100,
    completedExercises: [],
    pendingExercises: [],
    completedSessions: 0,
    totalSessions: totalWeeks * 2,
    lastActivityAt: serverTimestamp(),
    startDate,
    isArchived: false,
    createdAt: now,
    updatedAt: now,
  };

  const colRef = collection(db, ASSIGNMENTS_COLLECTION);
  const docRef = await addDoc(colRef, assignmentData);

  // Mirror to subcollection users/{userId}/programAssignments/{assignmentId}
  try {
    const userSubRef = doc(db, 'users', patient.id, 'programAssignments', docRef.id);
    await setDoc(userSubRef, { ...assignmentData, id: docRef.id });
  } catch (subErr) {
    console.warn('Non-critical subcollection mirror error for programAssignment:', subErr);
  }

  // 3. Update program's activePatients count
  try {
    const programDocRef = doc(db, PROGRAMS_FIRESTORE_COLLECTION, programId);
    const programSnap = await getDoc(programDocRef);
    if (programSnap.exists()) {
      const currentCount = Number(programSnap.data().activePatients) || 0;
      await updateDoc(programDocRef, {
        activePatients: currentCount + 1,
        updatedAt: now,
      });
    }
  } catch (err) {
    console.warn('Failed to update activePatients count on program:', err);
  }

  return { assignmentId: docRef.id, isNew: true };
};

/**
 * Assign multiple patients to a program (batch).
 * Returns results for each patient: { patientId, assignmentId, isNew }
 */
export const assignPatientsToProgram = async (
  programId: string,
  programTitle: string,
  patients: Array<{
    id: string;
    name: string;
    avatar?: string;
    condition?: string;
    email?: string;
    phone?: string;
  }>,
  totalWeeks: number = 8,
  adminId: string = 'admin'
): Promise<Array<{ patientId: string; assignmentId: string; isNew: boolean }>> => {
  const results: Array<{ patientId: string; assignmentId: string; isNew: boolean }> = [];

  for (const patient of patients) {
    try {
      const { assignmentId, isNew } = await assignPatientToProgram(
        programId,
        programTitle,
        patient,
        totalWeeks,
        adminId
      );
      results.push({ patientId: patient.id, assignmentId, isNew });
    } catch (err) {
      console.error(`Error assigning patient ${patient.id}:`, err);
    }
  }

  return results;
};

/**
 * Remove a patient assignment (unassign from program).
 */
export const removePatientAssignment = async (
  assignmentId: string,
  programId: string
): Promise<void> => {
  const docRef = doc(db, ASSIGNMENTS_COLLECTION, assignmentId);
  await deleteDoc(docRef);

  // Decrement program's activePatients count
  try {
    const programDocRef = doc(db, PROGRAMS_FIRESTORE_COLLECTION, programId);
    const programSnap = await getDoc(programDocRef);
    if (programSnap.exists()) {
      const currentCount = Number(programSnap.data().activePatients) || 0;
      await updateDoc(programDocRef, {
        activePatients: Math.max(0, currentCount - 1),
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.warn('Failed to decrement activePatients count on program:', err);
  }
};

/**
 * Update fields on an existing assignment (e.g. progress, week, archived status).
 */
export const updatePatientAssignment = async (
  assignmentId: string,
  updateData: Partial<Omit<ProgramAssignment, 'id'>>
): Promise<void> => {
  const docRef = doc(db, ASSIGNMENTS_COLLECTION, assignmentId);
  await updateDoc(docRef, {
    ...updateData,
    lastActivityAt: serverTimestamp(),
    updatedAt: new Date().toISOString(),
  });
};

/**
 * Subscribe to real-time updates of all assignments for a specific program.
 * Used by the Admin Panel's Assigned Patients tab.
 */
export const subscribeToAssignedPatients = (
  programId: string,
  onData: (assignments: ProgramAssignment[]) => void,
  onError?: (err: Error) => void
): Unsubscribe => {
  try {
    const colRef = collection(db, ASSIGNMENTS_COLLECTION);
    const q = query(colRef, where('programId', '==', programId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const assignments: ProgramAssignment[] = snapshot.docs.map((docSnap) =>
          mapDocToAssignment(docSnap.id, docSnap.data())
        );
        onData(assignments);
      },
      (err) => {
        console.warn('Firestore programAssignments snapshot error:', err);
        if (onError) onError(err);
      }
    );

    return unsubscribe;
  } catch (error: any) {
    console.error('Failed to setup assignments snapshot listener:', error);
    if (onError) onError(error);
    return () => {};
  }
};

/**
 * Subscribe to real-time updates of all assignments for a specific patient.
 * Used by the Mobile App to show a patient's assigned programs.
 */
export const subscribeToPatientAssignments = (
  patientId: string,
  onData: (assignments: ProgramAssignment[]) => void,
  onError?: (err: Error) => void
): Unsubscribe => {
  try {
    const colRef = collection(db, ASSIGNMENTS_COLLECTION);
    const q = query(colRef, where('patientId', '==', patientId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const assignments: ProgramAssignment[] = snapshot.docs.map((docSnap) =>
          mapDocToAssignment(docSnap.id, docSnap.data())
        );
        onData(assignments);
      },
      (err) => {
        console.warn('Firestore patient assignments snapshot error:', err);
        if (onError) onError(err);
      }
    );

    return unsubscribe;
  } catch (error: any) {
    console.error('Failed to setup patient assignments snapshot listener:', error);
    if (onError) onError(error);
    return () => {};
  }
};

/**
 * Fetch a single assignment document by ID.
 */
export const fetchAssignmentById = async (
  assignmentId: string
): Promise<ProgramAssignment | null> => {
  try {
    const docRef = doc(db, ASSIGNMENTS_COLLECTION, assignmentId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return mapDocToAssignment(snap.id, snap.data());
  } catch (err) {
    console.error('fetchAssignmentById error:', err);
    return null;
  }
};

/**
 * Mark an exercise as complete for a patient's assignment.
 * Updates completedExercises, pendingExercises, completedSessions, progressPercent, adherence.
 */
export const markExerciseComplete = async (
  assignmentId: string,
  exerciseId: string,
  currentAssignment: ProgramAssignment
): Promise<void> => {
  const completed = currentAssignment.completedExercises || [];
  if (completed.includes(exerciseId)) return;

  const updatedCompleted = [...completed, exerciseId];
  const updatedPending = (currentAssignment.pendingExercises || []).filter((id) => id !== exerciseId);
  const calculatedTotal = updatedCompleted.length + updatedPending.length;
  const totalExercises = calculatedTotal > 0 ? calculatedTotal : 10;
  const progressPercent = Math.min(
    100,
    Math.round((updatedCompleted.length / totalExercises) * 100)
  );

  let assignmentStatus: AssignmentStatus = currentAssignment.assignmentStatus || 'On Track';
  if (progressPercent >= 90) assignmentStatus = 'Ahead';
  else if (progressPercent < 40 && currentAssignment.completedSessions > 2) assignmentStatus = 'Review Needed';
  else assignmentStatus = 'On Track';

  let status: AssignmentProgramStatus = currentAssignment.status || 'active';
  if (progressPercent >= 100) {
    status = 'completed';
  }

  await updatePatientAssignment(assignmentId, {
    completedExercises: updatedCompleted,
    pendingExercises: updatedPending,
    progressPercent,
    completedSessions: currentAssignment.completedSessions + 1,
    assignmentStatus,
    status,
    lastCompletedExercise: exerciseId,
  });
};
