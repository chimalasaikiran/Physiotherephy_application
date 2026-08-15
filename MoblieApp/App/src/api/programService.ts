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
// DEFAULT WEEKS GENERATOR
// ─────────────────────────────────────────

export const getDefaultWeeksForProgram = (title: string, durationStr: string): MobileProgramWeek[] => {
  const isKnee = title.toLowerCase().includes('acl') || title.toLowerCase().includes('knee');
  const isShoulder = title.toLowerCase().includes('shoulder') || title.toLowerCase().includes('cuff');

  if (isKnee) {
    return [
      {
        weekNumber: 1,
        title: 'Phase I: Pain Management & ROM Restoration',
        description: 'Focus on swelling reduction, passive knee extension, and patellar mobilization.',
        clinicalFocus: 'Passive Extension & Quadriceps Activation',
        sessionsPerWeek: 3,
        exercises: [
          {
            id: 'ex-k1-1',
            name: 'Quadriceps Isometric Sets',
            sets: 3,
            reps: '10 reps (5s hold)',
            duration: '5 mins',
            restTime: '30s',
            instructions: 'Tighten thigh muscles pushing the back of your knee down flat into the towel roll.',
            notes: 'Avoid sudden force; maintain smooth tension.',
            image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80',
          },
          {
            id: 'ex-k1-2',
            name: 'Heel Slides (Assisted)',
            sets: 3,
            reps: '12 reps',
            duration: '6 mins',
            restTime: '30s',
            instructions: 'Slowly slide your heel back toward your buttocks to bend your knee within comfort limits.',
            notes: 'Use a towel strap under foot if assistance is required.',
            image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80',
          },
          {
            id: 'ex-k1-3',
            name: 'Straight Leg Raises',
            sets: 3,
            reps: '10 reps',
            duration: '5 mins',
            restTime: '45s',
            instructions: 'Lock your knee straight, flex foot upward, and lift leg 8-12 inches off table.',
            notes: 'Ensure quad remains fully engaged throughout lift.',
            image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
      {
        weekNumber: 2,
        title: 'Phase II: Weight Bearing & Functional Mobility',
        description: 'Progressive closed kinetic chain strengthening and gait control.',
        clinicalFocus: 'Gait Normalization & Glute/Quad Control',
        sessionsPerWeek: 4,
        exercises: [
          {
            id: 'ex-k2-1',
            name: 'Mini Wall Squats',
            sets: 3,
            reps: '12 reps',
            duration: '6 mins',
            restTime: '45s',
            instructions: 'Lean back against a wall, lower your body to 45 degrees knee flexion, hold 3 seconds.',
            notes: 'Keep knees aligned with second toes; avoid inward collapse.',
            image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80',
          },
          {
            id: 'ex-k2-2',
            name: 'Step-Ups (Low Step)',
            sets: 3,
            reps: '10 reps each leg',
            duration: '7 mins',
            restTime: '45s',
            instructions: 'Step onto a 4-inch platform keeping trunk upright and weight through heel.',
            notes: 'Control descent slowly on return phase.',
            image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
    ];
  }

  if (isShoulder) {
    return [
      {
        weekNumber: 1,
        title: 'Phase I: Rotator Cuff Activation',
        description: 'Gentle scapular setting and pendulum exercises to restore shoulder alignment.',
        clinicalFocus: 'Scapular Control & Glenohumeral Glide',
        sessionsPerWeek: 3,
        exercises: [
          {
            id: 'ex-s1-1',
            name: 'Codman Pendulum Swings',
            sets: 3,
            reps: '60 seconds',
            duration: '3 mins',
            restTime: '30s',
            instructions: 'Lean forward resting non-affected arm on a table. Let affected arm dangle freely and swing in small circular arcs.',
            notes: 'Let momentum move the arm; do not actively lift using shoulder muscles.',
            image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
          },
          {
            id: 'ex-s1-2',
            name: 'Scapular Retraction Setting',
            sets: 3,
            reps: '12 reps (5s hold)',
            duration: '5 mins',
            restTime: '30s',
            instructions: 'Squeeze shoulder blades together down and back toward opposite back pockets.',
            notes: 'Keep shoulders relaxed away from ears.',
            image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80',
          },
        ],
      },
    ];
  }

  // Default Lumbar / General Recovery protocol
  return [
    {
      weekNumber: 1,
      title: 'Phase 1: Pain Management & Mobilization',
      description: 'Focus on reducing acute inflammation and restoring basic range of motion.',
      clinicalFocus: 'Neural desensitization & Pelvic Tilts',
      sessionsPerWeek: 3,
      exercises: [
        {
          id: 'ex-1',
          name: 'Pelvic Tilts',
          sets: 3,
          reps: '12 reps',
          duration: '5 mins',
          restTime: '30s',
          instructions: 'Lie on back with knees bent. Gently flatten lower back against floor by tightening abdominal muscles.',
          notes: 'Maintain steady nasal breathing; avoid holding breath.',
          image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80',
        },
        {
          id: 'ex-2',
          name: 'Cat-Cow Stretch',
          sets: 3,
          reps: '10 reps',
          duration: '5 mins',
          restTime: '30s',
          instructions: 'On hands and knees, arch your back upward toward ceiling, then slowly drop belly toward floor.',
          notes: 'Move smoothly through painless range of motion.',
          image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80',
        },
        {
          id: 'ex-3',
          name: 'Knee-to-Chest Hold',
          sets: 2,
          reps: '30s hold per leg',
          duration: '4 mins',
          restTime: '15s',
          instructions: 'Gently pull one knee toward your chest while keeping opposite leg extended flat or bent.',
          notes: 'Feel mild stretch in lower back and glutes.',
          image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80',
        },
      ],
    },
    {
      weekNumber: 2,
      title: 'Phase 2: Foundational Core Stability',
      description: 'Core stabilizer engagement and lumbar spine protection during movement.',
      clinicalFocus: 'Core Stabilizer Activation & Deep Bracing',
      sessionsPerWeek: 4,
      exercises: [
        {
          id: 'ex-4',
          name: 'Bird-Dog Quadruped',
          sets: 3,
          reps: '10 reps each side',
          duration: '6 mins',
          restTime: '30s',
          instructions: 'From quadruped position, extend opposite arm and leg parallel to floor without tilting pelvis.',
          notes: 'Keep hips square and core engaged throughout movement.',
          image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80',
        },
        {
          id: 'ex-5',
          name: 'Dead Bug Bracing',
          sets: 3,
          reps: '12 reps',
          duration: '6 mins',
          restTime: '30s',
          instructions: 'Lie on back with arms up and knees at 90 degrees. Lower opposite arm and leg toward floor while bracing lower back.',
          notes: 'Do not allow lower back to arch off the surface.',
          image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80',
        },
        {
          id: 'ex-6',
          name: 'Glute Bridge Hold',
          sets: 3,
          reps: '12 reps (3s hold)',
          duration: '5 mins',
          restTime: '30s',
          instructions: 'Press through heels to lift hips until knees, hips, and shoulders form a straight line.',
          notes: 'Squeeze glutes at peak extension without hyperextending lower back.',
          image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80',
        },
      ],
    },
    {
      weekNumber: 3,
      title: 'Phase 3: Strength & Dynamic Trunk Control',
      description: 'Progressive loading of posterior chain and spinal stabilizing musculature.',
      clinicalFocus: 'Posterior Chain Hypertrophy',
      sessionsPerWeek: 4,
      exercises: [
        {
          id: 'ex-7',
          name: 'Supported Goblet Squat',
          sets: 3,
          reps: '10 reps',
          duration: '7 mins',
          restTime: '45s',
          instructions: 'Perform controlled squat keeping weight close to chest and knees tracking over toes.',
          notes: 'Maintain neutral spine position at bottom of movement.',
          image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80',
        },
        {
          id: 'ex-8',
          name: 'Side Plank Iso-Hold',
          sets: 3,
          reps: '20s hold each side',
          duration: '5 mins',
          restTime: '30s',
          instructions: 'Support body on forearm and side of feet/knees, raising hips off floor.',
          notes: 'Keep shoulders, hips, and ankles aligned.',
          image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80',
        },
      ],
    },
  ];
};

// ─────────────────────────────────────────
// MAPPERS
// ─────────────────────────────────────────

export const mapDocToMobileProgram = (id: string, data: Record<string, any>): MobileProgram => {
  const title = data.title || 'Therapeutic Recovery Program';
  const duration = data.duration || '8 Weeks';
  const rawWeeks = Array.isArray(data.weeks) && data.weeks.length > 0 ? data.weeks : getDefaultWeeksForProgram(title, duration);

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
    return () => {};
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
    return mapDocToMobileProgram(snap.id, snap.data());
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
    return () => {};
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
    return () => {};
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
    return () => {};
  }

  try {
    const docRef = doc(db, ASSIGNMENTS_COLLECTION, assignmentId);
    const unsub = onSnapshot(
      docRef,
      async (snapshot) => {
        if (!snapshot.exists()) {
          onData(null);
          return;
        }
        const assignment = mapDocToAssignment(snapshot.id, snapshot.data());
        if (assignment.programId) {
          const programDetails = await fetchProgramById(assignment.programId);
          assignment.programDetails = programDetails || undefined;
        }
        onData(assignment);
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
    return () => {};
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

  await updateAssignmentProgress(assignmentId, {
    completedExercises: updatedCompleted,
    pendingExercises: updatedPending,
    progressPercent,
    completedSessions: Math.max(currentAssignment.completedSessions, Math.ceil((updatedCompleted.length / totalExercises) * (currentAssignment.totalSessions || 16))),
    assignmentStatus,
    status,
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



