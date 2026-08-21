import { db } from '../config/firebase.js';
import { FieldValue } from 'firebase-admin/firestore';

export interface UserProfileData {
  uid: string;
  phone: string;
  fullName?: string;
  dob?: string;
  gender?: string;
  height?: number;
  weight?: number;
  primaryConcernId?: string;
  avatarUri?: string | null;
  profileCompleted: boolean;
  createdAt?: any;
  updatedAt?: any;
}

const COLLECTION_NAME = 'users';

const formatPatientId = (uid: string, existingPatientId?: string): string => {
  if (existingPatientId && /^PAT-\d{4,}$/i.test(existingPatientId)) {
    return existingPatientId.toUpperCase();
  }
  if (existingPatientId && /^#?OM-(\d{4,})$/i.test(existingPatientId)) {
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

export class UserService {
  /**
   * Sync or initialize user profile record in Cloud Firestore upon login
   */
  static async syncUserOnLogin(uid: string, phone: string = ''): Promise<UserProfileData> {
    try {
      const userRef = db.collection(COLLECTION_NAME).doc(uid);
      const snapshot = await userRef.get();

      if (snapshot.exists) {
        const existingData = snapshot.data() as UserProfileData;
        // Update last login / sync timestamp
        await userRef.update({
          updatedAt: FieldValue.serverTimestamp(),
          ...(phone && !existingData.phone ? { phone } : {}),
        });
        return {
          ...existingData,
          phone: existingData.phone || phone,
        };
      }

      const newRecord: UserProfileData = {
        uid,
        phone,
        profileCompleted: false,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      await userRef.set(newRecord);
      return newRecord;
    } catch (error: any) {
      console.error(`Error in UserService.syncUserOnLogin for uid ${uid}:`, error);
      // Fallback response for local dev environment when Firestore is uninitialized
      return {
        uid,
        phone,
        profileCompleted: false,
      };
    }
  }

  /**
   * Fetch user profile from Cloud Firestore by UID
   */
  static async getUserProfile(uid: string): Promise<UserProfileData | null> {
    try {
      const userRef = db.collection(COLLECTION_NAME).doc(uid);
      const snapshot = await userRef.get();

      if (snapshot.exists) {
        return snapshot.data() as UserProfileData;
      }
      return null;
    } catch (error: any) {
      console.error(`Error in UserService.getUserProfile for uid ${uid}:`, error);
      return null;
    }
  }

  /**
   * Update user profile information in Cloud Firestore
   */
  static async updateUserProfile(
    uid: string,
    profileData: Partial<UserProfileData>
  ): Promise<UserProfileData> {
    try {
      const userRef = db.collection(COLLECTION_NAME).doc(uid);
      const snapshot = await userRef.get();

      const existingData = snapshot.exists ? snapshot.data() : {};

      const payload = {
        ...existingData,
        ...profileData,
        uid,
        profileCompleted:
          profileData.profileCompleted !== undefined
            ? profileData.profileCompleted
            : Boolean(profileData.fullName || existingData?.fullName),
        updatedAt: FieldValue.serverTimestamp(),
        ...(!snapshot.exists ? { createdAt: FieldValue.serverTimestamp() } : {}),
      };

      await userRef.set(payload, { merge: true });
      return payload as UserProfileData;
    } catch (error: any) {
      console.error(`Error in UserService.updateUserProfile for uid ${uid}:`, error);
      throw error;
    }
  }

  /**
   * Delete user profile from Firestore
   */
  static async deleteUserProfile(uid: string): Promise<boolean> {
    try {
      const userRef = db.collection(COLLECTION_NAME).doc(uid);
      await userRef.delete();
      return true;
    } catch (error: any) {
      console.error(`Error in UserService.deleteUserProfile for uid ${uid}:`, error);
      return false;
    }
  }

  /**
   * Fetch all users & patient records directly from Firestore ('patient details' and 'users' collections)
   */
  static async getAllUsersAndPatients(): Promise<any[]> {
    try {
      const results: any[] = [];
      const seenIds = new Set<string>();

      // 1. Fetch from 'patient details' collection
      try {
        const patientsSnap = await db.collection('patient details').get();
        patientsSnap.forEach((docSnap: any) => {
          const data = docSnap.data();
          const id = docSnap.id;
          seenIds.add(id);
          results.push({
            id,
            patientId: formatPatientId(id, data.patientId),
            name: (data.name && data.name !== 'Unnamed Patient') ? data.name : (data.fullName && data.fullName !== 'Unnamed Patient') ? data.fullName : `Patient (${id.slice(0, 6)})`,
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
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
          });
        });
      } catch (err) {
        console.warn('Error fetching patient details collection:', err);
      }

      // 2. Fetch from 'users' collection (registered via app)
      try {
        const usersSnap = await db.collection('users').get();
        usersSnap.forEach((docSnap: any) => {
          const id = docSnap.id;

          if (seenIds.has(id)) return;
          const data = docSnap.data();
          results.push({
            id,
            patientId: formatPatientId(id, data.patientId),
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
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
          });
        });
      } catch (err) {
        console.warn('Error fetching users collection:', err);
      }

      return results;
    } catch (error: any) {
      console.error('Error in UserService.getAllUsersAndPatients:', error);
      return [];
    }
  }
}

