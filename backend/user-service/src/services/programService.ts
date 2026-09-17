import { db } from '../config/firebase.js';
import { FieldValue } from 'firebase-admin/firestore';

export interface ExerciseData {
  id?: string;
  name: string;
  mediaUrl: string;
  sets: number;
  reps: number;
  holdDurationSeconds: number;
  restDurationSeconds: number;
  estimatedDurationMinutes: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  instructions: string;
  order: number;
}

export interface WeekData {
  id?: string;
  weekNumber: number;
  name: string;
  exercises?: ExerciseData[];
}

export interface ProgramData {
  id?: string;
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
  assignedPatientIds?: string[];
  createdAt?: any;
  weeks?: WeekData[]; // included when fetching full program
}

const PROGRAMS_COLLECTION = 'programs';

const mapProgramDoc = (id: string, data: any): ProgramData => ({
  id,
  title: data.title || 'Untitled Program',
  description: data.description || '',
  status: data.status || 'draft',
  bodyAreaTag: data.bodyAreaTag || 'General Recovery',
  coverImage: data.coverImage || '',
  duration: data.duration || '8 Weeks',
  difficulty: data.difficulty || 'Beginner',
  activePatients: data.activePatients !== undefined ? data.activePatients : 0,
  completionRate: data.completionRate || '0%',
  updatedAt: data.updatedAt || new Date().toISOString(),
  type: data.type || 'Rehabilitation',
  exercisesCount: Number(data.exercisesCount) || 10,
  phasesCount: Number(data.phasesCount) || 4,
  totalExercises: Number(data.totalExercises) || Number(data.exercisesCount) || 10,
  assignedPatientIds: Array.isArray(data.assignedPatientIds) ? data.assignedPatientIds : [],
  createdAt: data.createdAt || null,
});

export class ProgramService {
  static async getAllPrograms(): Promise<ProgramData[]> {
    try {
      const snap = await db.collection(PROGRAMS_COLLECTION).get();
      return snap.docs.map((d: any) => mapProgramDoc(d.id, d.data()));
    } catch (err) {
      console.error('ProgramService.getAllPrograms error:', err);
      return [];
    }
  }

  static async getProgramById(id: string, includeDetails: boolean = false): Promise<ProgramData | null> {
    try {
      const snap = await db.collection(PROGRAMS_COLLECTION).doc(id).get();
      if (!snap.exists) return null;
      
      const program = mapProgramDoc(snap.id, snap.data());
      
      if (includeDetails) {
        // Fetch weeks and exercises
        const weeksSnap = await db.collection(PROGRAMS_COLLECTION).doc(id).collection('weeks').orderBy('weekNumber').get();
        const weeks: WeekData[] = [];
        
        for (const weekDoc of weeksSnap.docs) {
          const weekData = weekDoc.data() as WeekData;
          weekData.id = weekDoc.id;
          
          const exercisesSnap = await db.collection(PROGRAMS_COLLECTION).doc(id).collection('weeks').doc(weekDoc.id).collection('exercises').orderBy('order').get();
          const exercises = exercisesSnap.docs.map((exDoc: any) => ({ id: exDoc.id, ...exDoc.data() } as ExerciseData));
          
          weekData.exercises = exercises;
          weeks.push(weekData);
        }
        program.weeks = weeks;
      }
      
      return program;
    } catch (err) {
      console.error(`ProgramService.getProgramById error for id=${id}:`, err);
      return null;
    }
  }

  static async createProgram(data: Omit<ProgramData, 'id' | 'weeks'>): Promise<string> {
    const docRef = db.collection(PROGRAMS_COLLECTION).doc();
    const payload = {
      ...data,
      id: docRef.id,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    await docRef.set(payload);
    return docRef.id;
  }

  static async createProgramWithDetails(data: ProgramData): Promise<string> {
    const { weeks, ...programData } = data;
    const programId = await this.createProgram(programData as any);
    
    if (weeks && weeks.length > 0) {
      for (const week of weeks) {
        const { exercises, ...weekData } = week;
        const weekRef = db.collection(PROGRAMS_COLLECTION).doc(programId).collection('weeks').doc();
        await weekRef.set({ ...weekData, id: weekRef.id });
        
        if (exercises && exercises.length > 0) {
          for (const exercise of exercises) {
            const exRef = weekRef.collection('exercises').doc();
            await exRef.set({ ...exercise, id: exRef.id });
          }
        }
      }
    }
    return programId;
  }

  static async updateProgram(id: string, data: Partial<ProgramData>): Promise<ProgramData | null> {
    const docRef = db.collection(PROGRAMS_COLLECTION).doc(id);
    const snap = await docRef.get();
    if (!snap.exists) return null;

    const { weeks, ...programData } = data;

    const payload: Record<string, any> = { updatedAt: FieldValue.serverTimestamp() };
    for (const [key, val] of Object.entries(programData)) {
      if (val !== undefined && key !== 'id') {
        payload[key] = val;
      }
    }
    
    if (Object.keys(payload).length > 1) {
      await docRef.update(payload);
    }
    
    // Simplistic handling of weeks update: delete all and recreate for now
    // In a real production app, we would calculate diffs.
    if (weeks) {
       const weeksSnap = await docRef.collection('weeks').get();
       for (const w of weeksSnap.docs) {
          const exSnap = await w.ref.collection('exercises').get();
          for (const ex of exSnap.docs) {
             await ex.ref.delete();
          }
          await w.ref.delete();
       }
       
       for (const week of weeks) {
        const { exercises, ...weekData } = week;
        const weekRef = docRef.collection('weeks').doc();
        await weekRef.set({ ...weekData, id: weekRef.id });
        
        if (exercises && exercises.length > 0) {
          for (const exercise of exercises) {
            const exRef = weekRef.collection('exercises').doc();
            await exRef.set({ ...exercise, id: exRef.id });
          }
        }
      }
    }

    return this.getProgramById(id, !!weeks);
  }

  static async deleteProgram(id: string): Promise<boolean> {
    const docRef = db.collection(PROGRAMS_COLLECTION).doc(id);
    
    const weeksSnap = await docRef.collection('weeks').get();
    for (const w of weeksSnap.docs) {
      const exSnap = await w.ref.collection('exercises').get();
      for (const ex of exSnap.docs) {
          await ex.ref.delete();
      }
      await w.ref.delete();
    }

    await docRef.delete();
    return true;
  }
}
