import { db } from '../config/firebase.js';
import { FieldValue } from 'firebase-admin/firestore';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type AvailabilityStatus = 'Available Today' | 'Busy' | 'On Leave';
export type TherapistStatus = 'ACTIVE' | 'INACTIVE';

export interface TherapistData {
  id?: string;
  name: string;
  degree: string;
  experience: string;
  email: string;
  phone: string;
  specializations: string[];
  availability: AvailabilityStatus;
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
  createdAt?: any;
  updatedAt?: any;
}

const THERAPISTS_COLLECTION = 'therapists';

// ─────────────────────────────────────────────────────────────────────────────
// Mapper
// ─────────────────────────────────────────────────────────────────────────────

const mapTherapistDoc = (id: string, data: any): TherapistData => ({
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
  initials: data.initials || (data.name ? data.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'DR'),
  assignedPatientIds: Array.isArray(data.assignedPatientIds) ? data.assignedPatientIds : [],
  createdAt: data.createdAt || null,
  updatedAt: data.updatedAt || null,
});

// ─────────────────────────────────────────────────────────────────────────────
// Service Class
// ─────────────────────────────────────────────────────────────────────────────

export class TherapistService {
  /**
   * Get all therapists ordered by name ascending.
   */
  static async getAllTherapists(): Promise<TherapistData[]> {
    try {
      const snap = await db.collection(THERAPISTS_COLLECTION).orderBy('name', 'asc').get();
      return snap.docs.map((d: any) => mapTherapistDoc(d.id, d.data()));
    } catch (err: any) {
      // Fallback without orderBy if index not ready
      try {
        const snap = await db.collection(THERAPISTS_COLLECTION).get();
        return snap.docs.map((d: any) => mapTherapistDoc(d.id, d.data()));
      } catch (e2) {
        console.error('TherapistService.getAllTherapists error:', e2);
        return [];
      }
    }
  }

  /**
   * Get a single therapist by Firestore document ID.
   */
  static async getTherapistById(id: string): Promise<TherapistData | null> {
    try {
      const snap = await db.collection(THERAPISTS_COLLECTION).doc(id).get();
      if (!snap.exists) return null;
      return mapTherapistDoc(snap.id, snap.data());
    } catch (err: any) {
      console.error(`TherapistService.getTherapistById error for id=${id}:`, err);
      return null;
    }
  }

  /**
   * Create a new therapist document. Auto-generates doc ID.
   */
  static async createTherapist(data: Omit<TherapistData, 'id'>): Promise<string> {
    try {
      const docRef = db.collection(THERAPISTS_COLLECTION).doc();
      const initials = data.initials || data.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

      const payload = {
        ...data,
        id: docRef.id,
        initials,
        patientsCount: data.patientsCount ?? 0,
        rating: data.rating ?? 5.0,
        assignedPatientIds: data.assignedPatientIds ?? [],
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      await docRef.set(payload);
      return docRef.id;
    } catch (err: any) {
      console.error('TherapistService.createTherapist error:', err);
      throw err;
    }
  }

  /**
   * Update an existing therapist record (partial update).
   */
  static async updateTherapist(id: string, data: Partial<TherapistData>): Promise<TherapistData | null> {
    try {
      const docRef = db.collection(THERAPISTS_COLLECTION).doc(id);
      const snap = await docRef.get();
      if (!snap.exists) return null;

      // Strip undefined values
      const payload: Record<string, any> = { updatedAt: FieldValue.serverTimestamp() };
      for (const [key, val] of Object.entries(data)) {
        if (val !== undefined && key !== 'id') {
          payload[key] = val;
        }
      }

      await docRef.update(payload);
      const updated = await docRef.get();
      return mapTherapistDoc(id, updated.data());
    } catch (err: any) {
      console.error(`TherapistService.updateTherapist error for id=${id}:`, err);
      throw err;
    }
  }

  /**
   * Hard-delete a therapist document.
   */
  static async deleteTherapist(id: string): Promise<boolean> {
    try {
      await db.collection(THERAPISTS_COLLECTION).doc(id).delete();
      return true;
    } catch (err: any) {
      console.error(`TherapistService.deleteTherapist error for id=${id}:`, err);
      return false;
    }
  }

  /**
   * Assign a patient to a therapist.
   * Appends patientId to assignedPatientIds and increments patientsCount.
   */
  static async assignPatient(therapistId: string, patientId: string): Promise<boolean> {
    try {
      const docRef = db.collection(THERAPISTS_COLLECTION).doc(therapistId);
      await docRef.update({
        assignedPatientIds: FieldValue.arrayUnion(patientId),
        patientsCount: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return true;
    } catch (err: any) {
      console.error(`TherapistService.assignPatient error:`, err);
      throw err;
    }
  }

  /**
   * Unassign a patient from a therapist.
   * Removes patientId from assignedPatientIds and decrements patientsCount.
   */
  static async unassignPatient(therapistId: string, patientId: string): Promise<boolean> {
    try {
      const docRef = db.collection(THERAPISTS_COLLECTION).doc(therapistId);
      const snap = await docRef.get();
      if (!snap.exists) return false;

      const currentCount = (snap.data()?.patientsCount || 1);
      await docRef.update({
        assignedPatientIds: FieldValue.arrayRemove(patientId),
        patientsCount: Math.max(0, currentCount - 1),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return true;
    } catch (err: any) {
      console.error(`TherapistService.unassignPatient error:`, err);
      throw err;
    }
  }

  /**
   * Seed initial demo therapist data into Firestore.
   * Only seeds if collection is empty.
   */
  static async seedDemoTherapists(): Promise<{ seeded: number; skipped: boolean }> {
    try {
      const existing = await db.collection(THERAPISTS_COLLECTION).limit(1).get();
      if (!existing.empty) {
        return { seeded: 0, skipped: true };
      }

      const demoTherapists: Omit<TherapistData, 'id'>[] = [
        {
          name: 'Dr. Ananya Sharma',
          degree: 'MPT (Ortho), BPT',
          experience: '8+ Years Exp',
          specializations: ['Sports Rehab', 'Orthopedic', 'Spine Care'],
          patientsCount: 14,
          consultationFee: 800,
          completedSessionsCount: 42,
          cancelledSessionsCount: 2,
          totalRevenue: 33600,
          activeAppointmentsCount: 5,
          availability: 'Available Today',
          rating: 4.9,
          status: 'ACTIVE',
          email: 'ananya.sharma@physio.com',
          phone: '+91 98765 43210',
          avatarUrl: 'https://images.unsplash.com/photo-1594824813566-88855ce78c00?w=150&auto=format&fit=crop&q=80',
          initials: 'AS',
          location: 'Main Clinic - Room 102',
          bio: 'Senior Sports Physiotherapist specializing in knee joint replacement and rotator cuff rehabilitation.',
          workingHours: '09:00 AM - 05:00 PM',
          assignedPatientIds: [],
        },
        {
          name: 'Dr. Rohan Kapoor',
          degree: 'MPT (Neuro), BPT',
          experience: '10+ Years Exp',
          specializations: ['Neurological', 'MSK', 'Post-Op Rehab'],
          patientsCount: 18,
          consultationFee: 1000,
          completedSessionsCount: 55,
          cancelledSessionsCount: 3,
          totalRevenue: 55000,
          activeAppointmentsCount: 6,
          availability: 'Available Today',
          rating: 4.8,
          status: 'ACTIVE',
          email: 'rohan.kapoor@physio.com',
          phone: '+91 98765 43211',
          avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
          initials: 'RK',
          location: 'Main Clinic - Room 104',
          bio: 'Lead Neuro Physiotherapist focusing on stroke recovery, spinal injury, and gait correction.',
          workingHours: '10:00 AM - 06:00 PM',
          assignedPatientIds: [],
        },
        {
          name: 'Dr. Dev Mukherjee',
          degree: 'MPT (Sports), BPT',
          experience: '6+ Years Exp',
          specializations: ['Sports Rehab', 'Manual Therapy', 'ACL Recovery'],
          patientsCount: 10,
          consultationFee: 900,
          completedSessionsCount: 28,
          cancelledSessionsCount: 1,
          totalRevenue: 25200,
          activeAppointmentsCount: 3,
          availability: 'Busy',
          rating: 4.9,
          status: 'ACTIVE',
          email: 'dev.mukherjee@physio.com',
          phone: '+91 98765 43212',
          avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
          initials: 'DM',
          location: 'Sports Rehab Wing',
          bio: 'Specialist in athletic conditioning, dry needling, and sports performance optimization.',
          workingHours: '08:00 AM - 04:00 PM',
          assignedPatientIds: [],
        },
        {
          name: 'Dr. Priya Patel',
          degree: 'MPT (Pelvic Health), BPT',
          experience: '7+ Years Exp',
          specializations: ['Pelvic Health', 'Pediatrics', 'Chronic Pain'],
          patientsCount: 12,
          consultationFee: 750,
          completedSessionsCount: 34,
          cancelledSessionsCount: 2,
          totalRevenue: 25500,
          activeAppointmentsCount: 4,
          availability: 'Available Today',
          rating: 4.7,
          status: 'ACTIVE',
          email: 'priya.patel@physio.com',
          phone: '+91 98765 43213',
          avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
          initials: 'PP',
          location: 'Pediatric Care Unit',
          bio: "Dedicated therapist with expertise in women's wellness, pelvic rehabilitation, and pediatric motor skills.",
          workingHours: '09:00 AM - 05:00 PM',
          assignedPatientIds: [],
        },
        {
          name: 'Dr. Vikram Malhotra',
          degree: 'DPT, MPT (Geriatrics)',
          experience: '12+ Years Exp',
          specializations: ['Geriatrics', 'Orthopedic', 'Post-Op Rehab'],
          patientsCount: 8,
          consultationFee: 1100,
          completedSessionsCount: 20,
          cancelledSessionsCount: 4,
          totalRevenue: 22000,
          activeAppointmentsCount: 0,
          availability: 'On Leave',
          rating: 4.9,
          status: 'INACTIVE',
          email: 'vikram.malhotra@physio.com',
          phone: '+91 98765 43214',
          avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=80',
          initials: 'VM',
          location: 'Senior Care Section',
          bio: 'Expert in geriatric mobility, arthritis management, and post-hip surgery physical therapy.',
          workingHours: '11:00 AM - 07:00 PM',
          assignedPatientIds: [],
        },
        {
          name: 'Dr. Meera Reddy',
          degree: 'MPT (Cardiopulmonary), BPT',
          experience: '5+ Years Exp',
          specializations: ['MSK', 'Manual Therapy', 'Rehab'],
          patientsCount: 9,
          consultationFee: 850,
          completedSessionsCount: 25,
          cancelledSessionsCount: 1,
          totalRevenue: 21250,
          activeAppointmentsCount: 2,
          availability: 'Available Today',
          rating: 4.8,
          status: 'ACTIVE',
          email: 'meera.reddy@physio.com',
          phone: '+91 98765 43215',
          avatarUrl: 'https://images.unsplash.com/photo-1594824813566-88855ce78c00?w=150&auto=format&fit=crop&q=80',
          initials: 'MR',
          location: 'Cardio Rehab Wing',
          bio: 'Focuses on pulmonary rehabilitation, posture correction, and myofascial release therapy.',
          workingHours: '09:30 AM - 05:30 PM',
          assignedPatientIds: [],
        },
      ];

      const batch = db.batch();
      for (const t of demoTherapists) {
        const ref = db.collection(THERAPISTS_COLLECTION).doc();
        batch.set(ref, {
          ...t,
          id: ref.id,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
      await batch.commit();
      return { seeded: demoTherapists.length, skipped: false };
    } catch (err: any) {
      console.error('TherapistService.seedDemoTherapists error:', err);
      throw err;
    }
  }
}
