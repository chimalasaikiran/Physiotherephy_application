import { db } from '../config/firebase.js';
import { FieldValue } from 'firebase-admin/firestore';

// ─────────────────────────────────────────────────────────────────────────────
// Types mirroring the Admin Panel Patient schema
// ─────────────────────────────────────────────────────────────────────────────
export interface PatientVitals {
  bloodPressure?: string;
  heartRate?: string;
  height?: string;
  weight?: string;
  bmi?: string;
}

export interface MedicalHistory {
  primaryDiagnosis?: string;
  severity?: 'Mild' | 'Moderate' | 'Severe';
  allergies?: string[];
  surgeries?: string[];
  chronicConditions?: string[];
  vitals?: PatientVitals;
}

export interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
}

export interface PatientData {
  id?: string;
  patientId?: string;
  name?: string;
  age?: number;
  gender?: string;
  avatarUrl?: string;
  phone?: string;
  email?: string;
  condition?: string;
  status?: string;
  therapistName?: string;
  therapistInitials?: string;
  therapistAvatarBg?: string;
  therapistSpecialization?: string;
  recoveryScore?: number;
  nextAppointmentDate?: string;
  nextAppointmentTime?: string;
  joinedDate?: string;
  address?: string;
  bloodGroup?: string;
  emergencyContact?: EmergencyContact;
  notes?: string;
  painLevel?: string;
  programsAssignedCount?: number;
  sessionsCompleted?: number;
  sessionsTotal?: number;
  medicalHistory?: MedicalHistory;
  treatmentPlan?: object;
  goals?: any[];
  reports?: any[];
  upcomingAppointments?: any[];
  pastAppointments?: any[];
  payments?: any[];
  programs?: any[];
  exercises?: any[];
  clinicalNotes?: any[];
  createdAt?: any;
  updatedAt?: any;
}

const PATIENTS_COLLECTION = 'users';
const LEGACY_PATIENTS_COLLECTION = 'patient details';
const USERS_COLLECTION = 'users';

/**
 * Generates a patient ID from a Firestore doc ID or uid
 */
const generatePatientId = (uid: string): string => {
  const hex = uid.replace(/[^a-f0-9]/gi, '').substring(0, 4).toUpperCase();
  const num = parseInt(hex || 'ABCD', 16) % 10000;
  return `#OM-${String(num).padStart(4, '0')}`;
};

/**
 * Maps a Firestore `patient details` document to the canonical PatientData shape
 */
const mapPatientDoc = (id: string, data: any): PatientData => ({
  id,
  patientId: data.patientId || generatePatientId(id),
  name: data.name || data.fullName || 'Unnamed Patient',
  age: Number(data.age) || 0,
  gender: data.gender || 'Not specified',
  avatarUrl:
    data.avatarUrl ||
    data.avatarUri ||
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  phone: data.phone || '',
  email: data.email || '',
  condition: data.condition || data.primaryConcern || 'Physiotherapy Evaluation',
  status: data.status || 'Active Treatment',
  therapistName: data.therapistName || 'Unassigned',
  therapistInitials: data.therapistInitials || '--',
  therapistAvatarBg: data.therapistAvatarBg || 'bg-slate-100 text-slate-600',
  therapistSpecialization: data.therapistSpecialization || 'Physiotherapy Specialist',
  recoveryScore: Number(data.recoveryScore) || 70,
  nextAppointmentDate: data.nextAppointmentDate || 'Pending Schedule',
  nextAppointmentTime: data.nextAppointmentTime || '--',
  joinedDate: data.joinedDate || new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
  address: data.address || '',
  bloodGroup: data.bloodGroup || '',
  emergencyContact: data.emergencyContact || undefined,
  notes: data.notes || '',
  painLevel: data.painLevel || 'Mild',
  programsAssignedCount: Number(data.programsAssignedCount) || 0,
  sessionsCompleted: Number(data.sessionsCompleted) || 0,
  sessionsTotal: Number(data.sessionsTotal) || 10,
  medicalHistory: data.medicalHistory || undefined,
  treatmentPlan: data.treatmentPlan || undefined,
  goals: Array.isArray(data.goals) ? data.goals : [],
  reports: Array.isArray(data.reports) ? data.reports : [],
  upcomingAppointments: Array.isArray(data.upcomingAppointments) ? data.upcomingAppointments : [],
  pastAppointments: Array.isArray(data.pastAppointments) ? data.pastAppointments : [],
  payments: Array.isArray(data.payments) ? data.payments : [],
  programs: Array.isArray(data.programs) ? data.programs : [],
  exercises: Array.isArray(data.exercises) ? data.exercises : [],
  clinicalNotes: Array.isArray(data.clinicalNotes) ? data.clinicalNotes : [],
  createdAt: data.createdAt || null,
  updatedAt: data.updatedAt || null,
});

/**
 * Maps a Firestore `users` document to the PatientData shape
 */
const mapUserDoc = (id: string, data: any): PatientData => ({
  id,
  patientId: generatePatientId(id),
  name: data.fullName || data.name || `User (${data.phone || id.slice(0, 6)})`,
  age: Number(data.age) || 0,
  gender: data.gender || 'Not specified',
  avatarUrl:
    data.avatarUri ||
    data.avatarUrl ||
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  phone: data.phone || '',
  email: data.email || '',
  condition: data.primaryConcern || 'Physiotherapy Evaluation',
  status: 'Active Treatment',
  therapistName: 'Unassigned',
  therapistInitials: '--',
  therapistAvatarBg: 'bg-slate-100 text-slate-600',
  therapistSpecialization: 'Physiotherapy Specialist',
  recoveryScore: 70,
  nextAppointmentDate: 'Pending Schedule',
  nextAppointmentTime: '--',
  joinedDate: new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
  address: '',
  bloodGroup: '',
  emergencyContact: undefined,
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
  createdAt: data.createdAt || null,
  updatedAt: data.updatedAt || null,
});

export class PatientService {
  /**
   * Get all patients — merges `patient details` + `users` collections.
   * `patient details` records take precedence; `users` are appended if not already present.
   */
  static async getAllPatients(): Promise<PatientData[]> {
    const results: PatientData[] = [];
    const seenIds = new Set<string>();

    // 1. Primary: fetch from 'patient details' collection
    try {
      const patientSnap = await db.collection(PATIENTS_COLLECTION).orderBy('updatedAt', 'desc').get();
      patientSnap.forEach((docSnap: any) => {
        const id = docSnap.id;
        seenIds.add(id);
        results.push(mapPatientDoc(id, docSnap.data()));
      });
    } catch (err: any) {
      // Collection may not have documents yet or index not ready — try without orderBy
      try {
        const fallback = await db.collection(PATIENTS_COLLECTION).get();
        fallback.forEach((docSnap: any) => {
          const id = docSnap.id;
          seenIds.add(id);
          results.push(mapPatientDoc(id, docSnap.data()));
        });
      } catch (e2) {
        console.warn('PatientService.getAllPatients — patient details collection error:', e2);
      }
    }

    // 2. Secondary: append registered users not already in patient details
    try {
      const usersSnap = await db.collection(USERS_COLLECTION).get();
      usersSnap.forEach((docSnap: any) => {
        const id = docSnap.id;
        if (!seenIds.has(id)) {
          const data = docSnap.data();
          // Only include users with at least a name or phone (skip ghost records)
          if (data.fullName || data.name || data.phone) {
            results.push(mapUserDoc(id, data));
          }
        }
      });
    } catch (err) {
      console.warn('PatientService.getAllPatients — users collection error:', err);
    }

    return results;
  }

  /**
   * Get a single patient by Firestore document ID.
   * Tries `patient details` first, then falls back to `users`.
   */
  static async getPatientById(id: string): Promise<PatientData | null> {
    try {
      const docRef = db.collection(PATIENTS_COLLECTION).doc(id);
      const snapshot = await docRef.get();

      if (snapshot.exists) {
        return mapPatientDoc(id, snapshot.data());
      }

      // Fallback: check users collection
      const userRef = db.collection(USERS_COLLECTION).doc(id);
      const userSnap = await userRef.get();
      if (userSnap.exists) {
        return mapUserDoc(id, userSnap.data());
      }

      return null;
    } catch (error: any) {
      console.error(`PatientService.getPatientById error for id ${id}:`, error);
      return null;
    }
  }

  /**
   * Create or upsert a patient record in `patient details`.
   * Uses the provided id (uid) as the Firestore document ID so that
   * mobile users map 1:1 to their patient record.
   */
  static async createOrUpsertPatient(data: PatientData): Promise<string> {
    try {
      const docId = data.id || db.collection(PATIENTS_COLLECTION).doc().id;

      const payload = {
        ...data,
        id: docId,
        patientId: data.patientId || generatePatientId(docId),
        status: data.status || 'Active Treatment',
        recoveryScore: data.recoveryScore || 70,
        sessionsCompleted: data.sessionsCompleted || 0,
        sessionsTotal: data.sessionsTotal || 10,
        goals: data.goals || [],
        reports: data.reports || [],
        upcomingAppointments: data.upcomingAppointments || [],
        pastAppointments: data.pastAppointments || [],
        payments: data.payments || [],
        programs: data.programs || [],
        exercises: data.exercises || [],
        clinicalNotes: data.clinicalNotes || [],
        updatedAt: FieldValue.serverTimestamp(),
        createdAt: FieldValue.serverTimestamp(),
      };

      await db.collection(PATIENTS_COLLECTION).doc(docId).set(payload, { merge: true });
      return docId;
    } catch (error: any) {
      console.error('PatientService.createOrUpsertPatient error:', error);
      throw error;
    }
  }

  /**
   * Update an existing patient record in `patient details`.
   */
  static async updatePatient(id: string, data: Partial<PatientData>): Promise<PatientData | null> {
    try {
      const docRef = db.collection(PATIENTS_COLLECTION).doc(id);
      const snapshot = await docRef.get();

      if (!snapshot.exists) {
        return null;
      }

      const payload = {
        ...data,
        updatedAt: FieldValue.serverTimestamp(),
      };

      // Remove undefined fields to avoid Firestore errors
      Object.keys(payload).forEach((key) => {
        if ((payload as any)[key] === undefined) {
          delete (payload as any)[key];
        }
      });

      await docRef.update(payload);
      const updated = await docRef.get();
      return mapPatientDoc(id, updated.data());
    } catch (error: any) {
      console.error(`PatientService.updatePatient error for id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a patient record from `patient details`.
   */
  static async deletePatient(id: string): Promise<boolean> {
    try {
      await db.collection(PATIENTS_COLLECTION).doc(id).delete();
      return true;
    } catch (error: any) {
      console.error(`PatientService.deletePatient error for id ${id}:`, error);
      return false;
    }
  }

  /**
   * Update only the medical history fields of a patient record.
   */
  static async updateMedicalInfo(id: string, medicalData: MedicalHistory): Promise<boolean> {
    try {
      const docRef = db.collection(PATIENTS_COLLECTION).doc(id);
      const snapshot = await docRef.get();

      if (!snapshot.exists) {
        // Create a skeleton patient record if it doesn't exist
        await docRef.set(
          {
            id,
            patientId: generatePatientId(id),
            medicalHistory: medicalData,
            status: 'Active Treatment',
            updatedAt: FieldValue.serverTimestamp(),
            createdAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      } else {
        await docRef.update({
          medicalHistory: medicalData,
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
      return true;
    } catch (error: any) {
      console.error(`PatientService.updateMedicalInfo error for id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Append a clinical note to a patient's clinicalNotes array.
   */
  static async addClinicalNote(
    id: string,
    note: { text: string; doctorName: string; category?: string }
  ): Promise<boolean> {
    try {
      const docRef = db.collection(PATIENTS_COLLECTION).doc(id);
      const snapshot = await docRef.get();

      const noteObj = {
        id: `cn-${Date.now()}`,
        text: note.text,
        doctorName: note.doctorName,
        category: note.category || 'clinical',
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        createdAt: new Date().toISOString(),
      };

      if (snapshot.exists) {
        const existing = snapshot.data()?.clinicalNotes || [];
        await docRef.update({
          clinicalNotes: [noteObj, ...existing],
          updatedAt: FieldValue.serverTimestamp(),
        });
      } else {
        await docRef.set(
          {
            id,
            clinicalNotes: [noteObj],
            updatedAt: FieldValue.serverTimestamp(),
            createdAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      }
      return true;
    } catch (error: any) {
      console.error(`PatientService.addClinicalNote error for id ${id}:`, error);
      throw error;
    }
  }
}
