import { db } from '../config/firebase.js';
import { FieldValue } from 'firebase-admin/firestore';

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

  static async getProgramById(id: string): Promise<ProgramData | null> {
    try {
      const snap = await db.collection(PROGRAMS_COLLECTION).doc(id).get();
      if (!snap.exists) return null;
      return mapProgramDoc(snap.id, snap.data());
    } catch (err) {
      console.error(`ProgramService.getProgramById error for id=${id}:`, err);
      return null;
    }
  }

  static async createProgram(data: Omit<ProgramData, 'id'>): Promise<string> {
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

  static async updateProgram(id: string, data: Partial<ProgramData>): Promise<ProgramData | null> {
    const docRef = db.collection(PROGRAMS_COLLECTION).doc(id);
    const snap = await docRef.get();
    if (!snap.exists) return null;

    const payload: Record<string, any> = { updatedAt: FieldValue.serverTimestamp() };
    for (const [key, val] of Object.entries(data)) {
      if (val !== undefined && key !== 'id') {
        payload[key] = val;
      }
    }
    await docRef.update(payload);
    const updated = await docRef.get();
    return mapProgramDoc(id, updated.data());
  }

  static async deleteProgram(id: string): Promise<boolean> {
    await db.collection(PROGRAMS_COLLECTION).doc(id).delete();
    return true;
  }
}
