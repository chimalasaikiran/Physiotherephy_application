import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  serverTimestamp,
  Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────

export interface MobileExercise {
  id: string;
  name: string;
  category?: string;
  sets?: number;
  reps?: number | string;
  duration?: string;
  restTime?: string;
  instructions?: string;
  image?: string;
  videoUrl?: string;
  notes?: string;
  completed?: boolean;
}

export interface MobileProgramWeek {
  id: string;
  weekNumber: number;
  title: string;
  description?: string;
  clinicalFocus?: string;
  sessionsPerWeek?: number | string;
  exercises: MobileExercise[];
}

export interface MobileProgram {
  id: string;
  title: string;
  description: string;
  status: 'published' | 'draft' | 'archived';
  bodyAreaTag: string;
  coverImage: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  activePatients: number | string;
  completionRate: string;
  updatedAt?: string;
  type: string;
  exercisesCount?: number;
  phasesCount?: number;
  totalExercises?: number;
  doctorName?: string;
  specialist?: string;
  sessionsCompleted?: string;
  progressPercent?: string;
  recoveryScoreVal?: string;
  weeks?: MobileProgramWeek[];
  targetCondition?: string;
}

export interface MobileProgramAssignment {
  id: string;
  programId: string;
  programTitle: string;
  patientId: string;
  patientName: string;
  patientAvatar: string;
  patientCondition: string;
  assignedAt: string;
  assignedBy: string;
  status: 'active' | 'paused' | 'completed';
  assignmentStatus: 'On Track' | 'Review Needed' | 'Ahead';
  currentWeek: number;
  totalWeeks: number;
  progressPercent: number;
  adherence: number;
  completedExercises: string[];
  pendingExercises: string[];
  completedSessions: number;
  totalSessions: number;
  lastActivityAt: string;
  startDate: string;
  isArchived?: boolean;
  lastCompletedExercise?: string;
  // Enriched program details (joined from programs collection)
  programDetails?: MobileProgram;
}

// ─────────────────────────────────────────
// COLLECTION CONSTANTS
// ─────────────────────────────────────────

const PROGRAMS_COLLECTION = 'programs';
const ASSIGNMENTS_COLLECTION = 'programAssignments';

// ─────────────────────────────────────────
// MAPPERS
// ─────────────────────────────────────────

export const mapDocToMobileProgram = (id: string, data: Record<string, any>): MobileProgram => {
  const title = data.title || 'Therapeutic Recovery Program';
  const duration = data.duration || '8 Weeks';
  const rawWeeks = Array.isArray(data.weeks) ? data.weeks : [];

  const totalExercisesCount = rawWeeks.reduce(
    (acc: number, w: any) => acc + (Array.isArray(w.exercises) ? w.exercises.length : 0),
    0
  );

  return {
    id,
    title,
    description: data.description || 'Comprehensive therapeutic rehabilitation program configured by clinical administration.',
    status: data.status || 'published',
    bodyAreaTag: data.bodyAreaTag || 'General Recovery',
    coverImage: data.coverImage || 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    duration,
    difficulty: data.difficulty || 'Beginner',
    activePatients: data.activePatients !== undefined ? data.activePatients : 0,
    completionRate: data.completionRate || '0%',
    updatedAt: data.updatedAt || 'Recently',
    type: data.type || 'Rehabilitation',
    exercisesCount: Number(data.exercisesCount) || totalExercisesCount || 10,
    phasesCount: Number(data.phasesCount) || rawWeeks.length || 3,
    totalExercises: Number(data.totalExercises) || totalExercisesCount || 10,
    doctorName: data.authorName || 'Dr. Ananya Sharma',
    specialist: data.bodyAreaTag || 'Physiotherapy Specialist',
    sessionsCompleted: data.sessionsCompleted || '0 / 16 Sessions Completed',
    progressPercent: data.progressPercent || '0%',
    recoveryScoreVal: data.recoveryScoreVal || '0 / 100',
    targetCondition: data.targetCondition || data.bodyAreaTag || 'General Rehabilitation',
    weeks: rawWeeks,
  };
};

export const mapDocToAssignment = (
  id: string,
  data: Record<string, any>
): MobileProgramAssignment => {
  const assignedAt =
    data.assignedAt instanceof Timestamp
      ? data.assignedAt.toDate().toISOString()
      : data.assignedAt || new Date().toISOString();

  const lastActivityAt =
    data.lastActivityAt instanceof Timestamp
      ? data.lastActivityAt.toDate().toISOString()
      : data.lastActivityAt || new Date().toISOString();

  return {
    id,
    programId: data.programId || '',
    programTitle: data.programTitle || 'Recovery Program',
    patientId: data.patientId || '',
    patientName: data.patientName || 'Patient',
    patientAvatar: data.patientAvatar || '',
    patientCondition: data.patientCondition || 'General Rehab',
    assignedAt,
    assignedBy: data.assignedBy || 'admin',
    status: data.status || 'active',
    assignmentStatus: data.assignmentStatus || 'On Track',
    currentWeek: Number(data.currentWeek) || 1,
    totalWeeks: Number(data.totalWeeks) || 8,
    progressPercent: Number(data.progressPercent) || 0,
    adherence: Number(data.adherence) || 100,
    completedExercises: Array.isArray(data.completedExercises) ? data.completedExercises : [],
    pendingExercises: Array.isArray(data.pendingExercises) ? data.pendingExercises : [],
    completedSessions: Number(data.completedSessions) || 0,
    totalSessions: Number(data.totalSessions) || 16,
    lastActivityAt,
    startDate:
      data.startDate ||
      new Date(assignedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      }),
    isArchived: Boolean(data.isArchived),
    lastCompletedExercise: data.lastCompletedExercise || '',
  };
};

// ─────────────────────────────────────────
// PROGRAMS
// ─────────────────────────────────────────

/**
 * Subscribe to real-time updates for a single program, including its weeks and exercises subcollections.
 */
export const subscribeToProgramDetailsRealtime = (
  programId: string,
  onData: (program: MobileProgram | null) => void,
  onError?: (err: Error) => void
): Unsubscribe => {
  let currentProgram: MobileProgram | null = null;
  let weeks: MobileProgramWeek[] = [];
  const exercisesByWeek: Record<string, MobileExercise[]> = {};

  let unsubProgram = () => {};
  let unsubWeeks = () => {};
  const unsubExercisesMap = new Map<string, Unsubscribe>();

  const triggerUpdate = () => {
    if (!currentProgram) return;
    const populatedWeeks = weeks.map(w => ({
      ...w,
      exercises: exercisesByWeek[w.id] || []
    }));
    populatedWeeks.sort((a, b) => a.weekNumber - b.weekNumber);
    
    // Calculate totals based on populated dynamic data
    const totalExercises = populatedWeeks.reduce((acc, w) => acc + w.exercises.length, 0);
    
    currentProgram.weeks = populatedWeeks;
    currentProgram.phasesCount = populatedWeeks.length;
    currentProgram.exercisesCount = totalExercises;
    currentProgram.totalExercises = totalExercises;

    onData({ ...currentProgram });
  };

  try {
    const programRef = doc(db, PROGRAMS_COLLECTION, programId);
    unsubProgram = onSnapshot(programRef, (snap) => {
      if (!snap.exists()) {
        onData(null);
        return;
      }
      currentProgram = mapDocToMobileProgram(snap.id, snap.data());
      triggerUpdate();
    }, onError);

    const weeksRef = collection(db, PROGRAMS_COLLECTION, programId, 'weeks');
    unsubWeeks = onSnapshot(weeksRef, (snap) => {
      weeks = snap.docs.map((docSnap, index) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          weekNumber: data.order || index + 1,
          title: data.title || '',
          description: data.description || '',
          clinicalFocus: data.clinicalFocus || '',
          sessionsPerWeek: data.sessionsPerWeek || 3,
          exercises: []
        };
      });

      const currentWeekIds = new Set(snap.docs.map(d => d.id));
      
      for (const [weekId, unsub] of unsubExercisesMap.entries()) {
        if (!currentWeekIds.has(weekId)) {
          unsub();
          unsubExercisesMap.delete(weekId);
        }
      }

      snap.docs.forEach((weekDoc, index) => {
        const weekId = weekDoc.id;
        const weekNumStr = (weekDoc.data().order || index + 1).toString();
        
        if (!unsubExercisesMap.has(weekId)) {
          const exercisesRef = collection(db, PROGRAMS_COLLECTION, programId, 'weeks', weekId, 'exercises');
          const unsubEx = onSnapshot(exercisesRef, (exSnap) => {
            const exercises = exSnap.docs.map(e => {
              const data = e.data();
              return {
                id: e.id,
                name: data.name || '',
                duration: data.duration || '',
                instructions: data.instructions || data.dosage || '',
                image: data.image || '',
                order: data.order || 0,
                sets: data.sets,
                reps: data.reps
              };
            });
            exercises.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
            exercisesByWeek[weekId] = exercises;
            triggerUpdate();
          }, onError);
          unsubExercisesMap.set(weekId, unsubEx);
        }
      });

      triggerUpdate();
    }, onError);
  } catch (error: any) {
    console.error('[programService] Failed to set up real-time listener:', error);
    if (onError) onError(error);
  }

  return () => {
    unsubProgram();
    unsubWeeks();
    for (const unsub of unsubExercisesMap.values()) {
      unsub();
    }
  };
};

/**
 * Subscribe to real-time updates for published programs.
 */
export const subscribeToPrograms = (
  onData: (programs: MobileProgram[]) => void,
  onError?: (err: Error) => void
): Unsubscribe => {
  try {
    const colRef = collection(db, PROGRAMS_COLLECTION);
    const unsub = onSnapshot(
      query(colRef),
      (snapshot) => {
        const programs = snapshot.docs
          .map((d) => mapDocToMobileProgram(d.id, d.data()))
          .filter((p) => p.status === 'published');
        onData(programs);
      },
      (err) => {
        console.warn('[programService] Firestore snapshot error:', err);
        if (onError) onError(err);
      }
    );
    return unsub;
  } catch (error: any) {
    console.error('[programService] Failed to set up snapshot listener:', error);
    if (onError) onError(error);
    return () => { };
  }
};

/**
 * Fetch all programs once from Firestore
 */
export const fetchPrograms = async (): Promise<MobileProgram[]> => {
  try {
    const colRef = collection(db, PROGRAMS_COLLECTION);
    const snap = await getDocs(colRef);
    return snap.docs
      .map((d) => mapDocToMobileProgram(d.id, d.data()))
      .filter((p) => p.status === 'published');
  } catch (err) {
    console.error('[programService] fetchPrograms error:', err);
    return [];
  }
};

/**
 * Fetch single program details by ID
 */
export const fetchProgramById = async (id: string): Promise<MobileProgram | null> => {
  if (!id) return null;
  try {
    const docRef = doc(db, PROGRAMS_COLLECTION, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;

    const programData = snap.data();

    // Fetch weeks subcollection
    const weeksRef = collection(db, PROGRAMS_COLLECTION, id, 'weeks');
    const weeksSnap = await getDocs(weeksRef);

    const weeks: MobileProgramWeek[] = [];

    for (const weekDoc of weeksSnap.docs) {
      const weekData = weekDoc.data();

      const exercisesRef = collection(db, PROGRAMS_COLLECTION, id, 'weeks', weekDoc.id, 'exercises');
      const exercisesSnap = await getDocs(exercisesRef);
      const exercises: MobileExercise[] = exercisesSnap.docs.map(e => {
        const data = e.data();
        return {
          id: e.id,
          name: data.name || '',
          duration: data.duration || '',
          instructions: data.instructions || data.dosage || '',
          image: data.image || '',
          order: data.order || 0
        };
      });

      exercises.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

      weeks.push({
        weekNumber: weekData.order || weeks.length + 1,
        title: weekData.title || '',
        description: weekData.description || '',
        clinicalFocus: weekData.clinicalFocus || '',
        sessionsPerWeek: weekData.sessionsPerWeek || 3,
        exercises
      });
    }

    weeks.sort((a, b) => a.weekNumber - b.weekNumber);

    if (weeks.length > 0) {
      programData.weeks = weeks;
    }

    return mapDocToMobileProgram(snap.id, programData);
  } catch (err) {
    console.error(`[programService] fetchProgramById error for id=${id}:`, err);
    return null;
  }
};

// ─────────────────────────────────────────
// PROGRAM ASSIGNMENTS (Patient-facing)
// ─────────────────────────────────────────

/**
 * Subscribe to real-time assigned programs for a specific patient.
 * This is the PRIMARY function used by the mobile app to show a patient's programs.
 * When admin assigns a program in the Admin Panel, it appears here immediately.
 */
export const subscribeToPatientAssignments = (
  patientId: string,
  onData: (assignments: MobileProgramAssignment[]) => void,
  onError?: (err: Error) => void
): Unsubscribe => {
  if (!patientId) {
    onData([]);
    return () => { };
  }

  try {
    const colRef = collection(db, ASSIGNMENTS_COLLECTION);
    const q = query(
      colRef,
      where('patientId', '==', patientId),
      where('isArchived', '==', false)
    );

    const unsub = onSnapshot(
      q,
      async (snapshot) => {
        const assignments: MobileProgramAssignment[] = snapshot.docs.map((d) =>
          mapDocToAssignment(d.id, d.data())
        );

        // Enrich each assignment with program details in parallel
        const enriched = await Promise.all(
          assignments.map(async (assignment) => {
            try {
              const program = await fetchProgramById(assignment.programId);
              return { ...assignment, programDetails: program || undefined };
            } catch {
              return assignment;
            }
          })
        );

        // Sort: active first, then by assignedAt descending
        enriched.sort((a, b) => {
          if (a.status === 'active' && b.status !== 'active') return -1;
          if (b.status === 'active' && a.status !== 'active') return 1;
          return new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime();
        });

        onData(enriched);
      },
      (err) => {
        console.warn('[programService] Patient assignments snapshot error:', err);
        if (onError) onError(err);
      }
    );

    return unsub;
  } catch (error: any) {
    console.error('[programService] Failed to setup patient assignments listener:', error);
    if (onError) onError(error);
    return () => { };
  }
};

/**
 * Subscribe to a single assignment document for real-time progress tracking.
 * Used by RecoveryProgramDetailsScreen to show live progress.
 */
export const subscribeToAssignment = (
  assignmentId: string,
  onData: (assignment: MobileProgramAssignment | null) => void,
  onError?: (err: Error) => void
): Unsubscribe => {
  if (!assignmentId) {
    onData(null);
    return () => { };
  }

  try {
    const docRef = doc(db, ASSIGNMENTS_COLLECTION, assignmentId);
    const unsub = onSnapshot(
      docRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          onData(null);
          return;
        }
        const assignment = mapDocToAssignment(snapshot.id, snapshot.data());
        // Return assignment immediately to unblock UI
        onData(assignment);
        
        // Fetch program details non-blockingly
        if (assignment.programId) {
          fetchProgramById(assignment.programId).then(programDetails => {
            if (programDetails) {
              assignment.programDetails = programDetails;
              onData({ ...assignment });
            }
          }).catch(err => console.warn('Failed to fetch program details in sub:', err));
        }
      },
      (err) => {
        console.warn('[programService] Assignment snapshot error:', err);
        if (onError) onError(err);
      }
    );
    return unsub;
  } catch (error: any) {
    console.error('[programService] Failed to set up assignment snapshot:', error);
    if (onError) onError(error);
    return () => { };
  }
};

/**
 * Fetch a single assignment document by ID (one-time fetch).
 */
export const fetchAssignmentById = async (
  assignmentId: string
): Promise<MobileProgramAssignment | null> => {
  try {
    const docRef = doc(db, ASSIGNMENTS_COLLECTION, assignmentId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    const assignment = mapDocToAssignment(snap.id, snap.data());
    if (assignment.programId) {
      const prog = await fetchProgramById(assignment.programId);
      assignment.programDetails = prog || undefined;
    }
    return assignment;
  } catch (err) {
    console.error(`[programService] fetchAssignmentById error for id=${assignmentId}:`, err);
    return null;
  }
};

/**
 * Update assignment progress fields in Firestore.
 * Called when a patient completes an exercise or makes progress.
 */
export const updateAssignmentProgress = async (
  assignmentId: string,
  updateData: Partial<{
    currentWeek: number;
    progressPercent: number;
    adherence: number;
    completedExercises: string[];
    pendingExercises: string[];
    completedSessions: number;
    status: MobileProgramAssignment['status'];
    assignmentStatus: MobileProgramAssignment['assignmentStatus'];
    lastCompletedExercise: string;
  }>
): Promise<void> => {
  try {
    const docRef = doc(db, ASSIGNMENTS_COLLECTION, assignmentId);
    await updateDoc(docRef, {
      ...updateData,
      lastActivityAt: serverTimestamp(),
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error(`[programService] updateAssignmentProgress error for id=${assignmentId}:`, err);
    throw err;
  }
};

/**
 * Helper to determine if all exercises for the active week are completed,
 * returning the next week number if complete.
 */
export const checkWeekProgression = (
  assignment: MobileProgramAssignment,
  completedExercisesList: string[]
): number => {
  const currentWeek = assignment.currentWeek || 1;
  const weeks = assignment.programDetails?.weeks || [];

  const totalWeeks = assignment.totalWeeks || weeks.length || 8;
  const currentWeekObj = weeks.find((w) => w.weekNumber === currentWeek);

  if (!currentWeekObj || !currentWeekObj.exercises || currentWeekObj.exercises.length === 0) {
    return currentWeek;
  }

  const isWeekFinished = currentWeekObj.exercises.every((ex) =>
    completedExercisesList.includes(ex.id) || completedExercisesList.includes(ex.name)
  );

  if (isWeekFinished && currentWeek < totalWeeks) {
    return currentWeek + 1;
  }

  return currentWeek;
};

/**
 * Mark a specific exercise as complete.
 * Calculates exact progress percent = Math.min(100, Math.round((completed.length / total) * 100)).
 * Synchronizes with Firestore so both Mobile App and Admin Panel update in real time.
 */
export const markExerciseComplete = async (
  assignmentId: string,
  exerciseId: string,
  currentAssignment: MobileProgramAssignment
): Promise<void> => {
  const completed = currentAssignment.completedExercises || [];
  if (completed.includes(exerciseId)) {
    return; // Already completed
  }

  const updatedCompleted = [...completed, exerciseId];

  // Derive total exercises dynamically from programDetails.weeks or totalExercises or count
  let totalExercises = 10;
  if (currentAssignment.programDetails?.weeks && currentAssignment.programDetails.weeks.length > 0) {
    const sum = currentAssignment.programDetails.weeks.reduce(
      (acc, w) => acc + (w.exercises?.length || 0),
      0
    );
    if (sum > 0) totalExercises = sum;
  } else if (currentAssignment.programDetails?.exercisesCount) {
    totalExercises = Number(currentAssignment.programDetails.exercisesCount) || 10;
  } else if (currentAssignment.programDetails?.totalExercises) {
    totalExercises = Number(currentAssignment.programDetails.totalExercises) || 10;
  }

  const progressPercent = Math.min(
    100,
    Math.round((updatedCompleted.length / totalExercises) * 100)
  );

  const updatedPending = (currentAssignment.pendingExercises || []).filter((id) => id !== exerciseId);

  // Determine status
  let assignmentStatus: MobileProgramAssignment['assignmentStatus'] = 'On Track';
  if (progressPercent >= 90) assignmentStatus = 'Ahead';
  else if (progressPercent < 40 && currentAssignment.completedSessions > 2)
    assignmentStatus = 'Review Needed';

  let status: MobileProgramAssignment['status'] = currentAssignment.status;
  if (progressPercent >= 100) {
    status = 'completed';
  }

  // Calculate week auto-advancement
  const newCurrentWeek = checkWeekProgression(currentAssignment, updatedCompleted);

  await updateAssignmentProgress(assignmentId, {
    completedExercises: updatedCompleted,
    pendingExercises: updatedPending,
    progressPercent,
    completedSessions: Math.max(currentAssignment.completedSessions, Math.ceil((updatedCompleted.length / totalExercises) * (currentAssignment.totalSessions || 16))),
    assignmentStatus,
    status,
    currentWeek: newCurrentWeek,
    lastCompletedExercise: exerciseId,
  });
};

/**
 * Toggle an exercise complete/incomplete for a patient's assignment in Firestore.
 */
export const toggleExerciseComplete = async (
  assignmentId: string,
  exerciseId: string,
  currentAssignment: MobileProgramAssignment
): Promise<void> => {
  const completed = currentAssignment.completedExercises || [];
  const isAlreadyCompleted = completed.includes(exerciseId);

  let updatedCompleted: string[];
  if (isAlreadyCompleted) {
    updatedCompleted = completed.filter((id) => id !== exerciseId);
  } else {
    updatedCompleted = [...completed, exerciseId];
  }

  let totalExercises = 10;
  if (currentAssignment.programDetails?.weeks && currentAssignment.programDetails.weeks.length > 0) {
    const sum = currentAssignment.programDetails.weeks.reduce(
      (acc, w) => acc + (w.exercises?.length || 0),
      0
    );
    if (sum > 0) totalExercises = sum;
  } else if (currentAssignment.programDetails?.exercisesCount) {
    totalExercises = Number(currentAssignment.programDetails.exercisesCount) || 10;
  } else if (currentAssignment.programDetails?.totalExercises) {
    totalExercises = Number(currentAssignment.programDetails.totalExercises) || 10;
  }

  const progressPercent = Math.min(
    100,
    Math.round((updatedCompleted.length / totalExercises) * 100)
  );

  let updatedPending = currentAssignment.pendingExercises || [];
  if (isAlreadyCompleted) {
    if (!updatedPending.includes(exerciseId)) {
      updatedPending = [...updatedPending, exerciseId];
    }
  } else {
    updatedPending = updatedPending.filter((id) => id !== exerciseId);
  }

  let assignmentStatus: MobileProgramAssignment['assignmentStatus'] = 'On Track';
  if (progressPercent >= 90) assignmentStatus = 'Ahead';
  else if (progressPercent < 40 && currentAssignment.completedSessions > 2)
    assignmentStatus = 'Review Needed';

  let status: MobileProgramAssignment['status'] = currentAssignment.status || 'active';
  if (progressPercent >= 100) {
    status = 'completed';
  } else if (status === 'completed' && progressPercent < 100) {
    status = 'active';
  }

  await updateAssignmentProgress(assignmentId, {
    completedExercises: updatedCompleted,
    pendingExercises: updatedPending,
    progressPercent,
    completedSessions: Math.max(0, Math.ceil((updatedCompleted.length / totalExercises) * (currentAssignment.totalSessions || 16))),
    assignmentStatus,
    status,
    lastCompletedExercise: isAlreadyCompleted ? '' : exerciseId,
  });
};

/**
 * Helper: Record exercise completion for a patient by patientId / auth uid.
 * Finds the patient's active program assignment in Firestore and calls markExerciseComplete.
 */
export const recordExerciseCompletionForUser = async (
  patientUid: string,
  exerciseName: string
): Promise<void> => {
  if (!patientUid) return;

  try {
    const colRef = collection(db, ASSIGNMENTS_COLLECTION);

    const q = query(colRef, where('patientId', '==', patientUid));
    const snap = await getDocs(q);

    let docSnap = snap.docs.find((d) => d.data().status === 'active' && !d.data().isArchived);

    if (!docSnap && !snap.empty) {
      docSnap = snap.docs[0];
    }

    if (docSnap) {
      const assignment = mapDocToAssignment(docSnap.id, docSnap.data());
      if (assignment.programId) {
        const prog = await fetchProgramById(assignment.programId);
        assignment.programDetails = prog || undefined;
      }
      await markExerciseComplete(docSnap.id, exerciseName, assignment);
      console.log(`[programService] Recorded completion of "${exerciseName}" for assignment ${docSnap.id}`);
    } else {
      console.warn('[programService] No active assignment document found to record exercise completion.');
    }
  } catch (err) {
    console.error('[programService] Error recording exercise completion:', err);
  }
};



