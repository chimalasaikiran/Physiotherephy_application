import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getAppointmentBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_APPOINTMENT_SERVICE_URL) {
    return process.env.EXPO_PUBLIC_APPOINTMENT_SERVICE_URL;
  }

  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest?.debuggerHost;
  if (hostUri) {
    const hostIp = hostUri.split(':')[0];
    if (hostIp) {
      return `http://${hostIp}:5002/api/v1`;
    }
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5002/api/v1';
  }

  return 'http://localhost:5002/api/v1';
};

const BASE_URL = `${getAppointmentBaseUrl()}/appointments`;

export interface ApiMedicalService {
  id: string;
  title: string;
  description: string;
  category: string;
  iconName: string;
  startingFee: string;
  numericFee: number;
}

export interface ApiDoctor {
  id: string;
  name: string;
  specialty: string;
  experienceYears: number;
  experienceStr: string;
  rating: number;
  reviewsCount: number;
  clinicName: string;
  clinicAddress: string;
  fee: string;
  numericFee: number;
  imageName: string;
  isTopRated: boolean;
  isNearby: boolean;
  availableToday: boolean;
  supportsOnline: boolean;
  languages: string[];
}

export interface ApiSlotsResponse {
  masterSlots: string[];
  bookedSlots: string[];
  availableSlots: string[];
}

export interface CreateBookingParams {
  id?: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorAvatar?: string;
  avatarImageName?: string;
  clinicName?: string;
  clinicAddress?: string;
  serviceTitle: string;
  placeId?: string;
  placeTitle?: string;
  fullDate: string;
  dateId?: string;
  timeSlot: string;
  feeStr: string;
  numericFee: number;
  paymentMode: 'online' | 'clinic';
  paymentMethodName: string;
  userId?: string;
  userName?: string;
  userPhone?: string;
}

export const fetchServicesFromApi = async (): Promise<ApiMedicalService[] | null> => {
  try {
    const res = await fetch(`${BASE_URL}/services`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as ApiMedicalService[];
  } catch (error) {
    console.warn('Backend services API unreachable:', error);
    return null;
  }
};

export const fetchTherapistsFromApi = async (serviceId?: string): Promise<ApiDoctor[] | null> => {
  try {
    const url = serviceId ? `${BASE_URL}/therapists?serviceId=${encodeURIComponent(serviceId)}` : `${BASE_URL}/therapists`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as ApiDoctor[];
  } catch (error) {
    console.warn('Backend therapists API unreachable:', error);
    return null;
  }
};

export const fetchAvailableSlotsFromApi = async (
  doctorId: string,
  fullDate: string
): Promise<ApiSlotsResponse | null> => {
  try {
    const res = await fetch(
      `${BASE_URL}/slots?doctorId=${encodeURIComponent(doctorId)}&fullDate=${encodeURIComponent(fullDate)}`
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as ApiSlotsResponse;
  } catch (error) {
    console.warn('Backend slots API unreachable:', error);
    return null;
  }
};

import { auth, db } from '@/config/firebase';
import { collection, getDocs, doc, setDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';

export const createAppointmentViaBackend = async (
  params: CreateBookingParams
): Promise<string> => {
  const currentUid = params.userId || auth.currentUser?.uid || 'user_demo_123';
  const currentUserName = params.userName || auth.currentUser?.displayName || 'Patient';
  const paymentStatus = params.paymentMode === 'online' ? 'Paid' : 'Pending';

  const fullPayload: CreateBookingParams = {
    ...params,
    userId: currentUid,
    userName: currentUserName,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${BASE_URL}/book`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fullPayload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.status === 409) {
      throw new Error('SLOT_ALREADY_BOOKED');
    }

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      if (errJson.error === 'SLOT_ALREADY_BOOKED' || errJson.message === 'SLOT_ALREADY_BOOKED') {
        throw new Error('SLOT_ALREADY_BOOKED');
      }
      throw new Error(errJson.error || errJson.message || 'FAILED_TO_CREATE_APPOINTMENT');
    }

    const json = await res.json();
    return json.data?.appointmentId || params.id || 'appt_success';
  } catch (error: any) {
    if (error?.message === 'SLOT_ALREADY_BOOKED') {
      throw error;
    }
    console.warn('Backend book appointment endpoint unreachable/failed, falling back to direct Firestore:', error.message || error);

    // Direct Firestore persistence fallback
    try {
      if (db) {
        const apptId = params.id || `appt_${Date.now()}`;
        const apptRef = doc(db, 'appointments', apptId);
        const apptPayload = {
          id: apptId,
          userId: currentUid,
          patientId: currentUid,
          userName: currentUserName,
          patientName: currentUserName,
          userPhone: params.userPhone || '',
          patientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
          doctorId: params.doctorId,
          therapistId: params.doctorId,
          doctorName: params.doctorName,
          therapistName: params.doctorName,
          doctorSpecialty: params.doctorSpecialty,
          doctorAvatar: params.doctorAvatar || '',
          avatarImageName: params.avatarImageName || 'doctor_ananya',
          clinicName: params.clinicName || 'Spine & Wellness Center',
          clinicAddress: params.clinicAddress || 'Indiranagar, Bengaluru',
          serviceTitle: params.serviceTitle || 'Physiotherapy Session',
          placeId: params.placeId || 'clinic',
          placeTitle: params.placeTitle || params.clinicName || 'Clinic Visit',
          fullDate: params.fullDate,
          dateId: params.dateId || 'd1',
          timeSlot: params.timeSlot,
          feeStr: params.feeStr || '₹800',
          numericFee: params.numericFee || 800,
          amount: params.numericFee || 800,
          paymentMode: params.paymentMode,
          paymentOption: params.paymentMode === 'online' ? 'Online Payment' : 'Pay at Clinic',
          paymentMethod: params.paymentMethodName || (params.paymentMode === 'online' ? 'UPI' : 'Pay at Clinic'),
          paymentMethodName: params.paymentMethodName || (params.paymentMode === 'online' ? 'UPI (GPay / PhonePe / Paytm)' : 'Pay at Clinic'),
          paymentStatus,
          status: 'Upcoming',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        await setDoc(apptRef, apptPayload, { merge: true });

        // Mirror to subcollection users/{userId}/appointments/{apptId}
        try {
          const userSubApptRef = doc(db, 'users', currentUid, 'appointments', apptId);
          await setDoc(userSubApptRef, apptPayload, { merge: true });
        } catch (subErr) {
          console.warn('Non-critical user subcollection appointment mirror error:', subErr);
        }

        // Update patient record in Firestore users & patient details collections to automatically set Assigned Therapist
        try {
          const userDocRef = doc(db, 'users', currentUid);
          await setDoc(
            userDocRef,
            {
              therapistId: params.doctorId,
              therapistName: params.doctorName,
              nextAppointmentDate: params.fullDate,
              nextAppointmentTime: params.timeSlot,
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );

          const detailDocRef = doc(db, 'patient details', currentUid);
          await setDoc(
            detailDocRef,
            {
              therapistId: params.doctorId,
              therapistName: params.doctorName,
              nextAppointmentDate: params.fullDate,
              nextAppointmentTime: params.timeSlot,
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        } catch (uErr) {
          console.warn('Non-critical patient therapist update error:', uErr);
        }

        if (params.doctorId) {
          try {
            const therapistRef = doc(db, 'therapists', params.doctorId);
            await setDoc(
              therapistRef,
              {
                assignedPatientIds: arrayUnion(currentUid),
                updatedAt: serverTimestamp(),
              },
              { merge: true }
            );
          } catch (tErr) {
            console.warn('Non-critical therapist patient association error:', tErr);
          }
        }

        return apptId;
      }
    } catch (fsErr) {
      console.error('Direct Firestore fallback booking error:', fsErr);
    }
    return params.id || 'appt_success';
  }
};

export const cancelAppointmentViaBackend = async (
  appointmentId: string,
  doctorId: string,
  fullDate: string,
  timeSlot: string
): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${BASE_URL}/${encodeURIComponent(appointmentId)}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ doctorId, fullDate, timeSlot }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || 'FAILED_TO_CANCEL');
    }

    return true;
  } catch (error: any) {
    console.warn('Backend cancel appointment endpoint unreachable/failed, falling back to direct Firestore:', error.message || error);
    try {
      if (db) {
        const apptRef = doc(db, 'appointments', appointmentId);
        await setDoc(
          apptRef,
          {
            status: 'Cancelled',
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        return true;
      }
    } catch (fsErr) {
      console.error('Direct Firestore fallback cancel error:', fsErr);
    }
    throw error;
  }
};

export const rescheduleAppointmentViaBackend = async (
  appointmentId: string,
  doctorId: string,
  oldDate: string,
  oldTimeSlot: string,
  newDate: string,
  newTimeSlot: string,
  newDateId?: string
): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${BASE_URL}/${encodeURIComponent(appointmentId)}/reschedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ doctorId, oldDate, oldTimeSlot, newDate, newTimeSlot, newDateId }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.status === 409) {
      throw new Error('SLOT_ALREADY_BOOKED');
    }

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      if (errJson.error === 'SLOT_ALREADY_BOOKED' || errJson.message === 'SLOT_ALREADY_BOOKED') {
        throw new Error('SLOT_ALREADY_BOOKED');
      }
      throw new Error(errJson.error || errJson.message || 'FAILED_TO_RESCHEDULE');
    }

    return true;
  } catch (error: any) {
    if (error?.message === 'SLOT_ALREADY_BOOKED') {
      throw error;
    }
    console.warn('Backend reschedule appointment endpoint unreachable/failed, falling back to direct Firestore:', error.message || error);
    try {
      if (db) {
        const apptRef = doc(db, 'appointments', appointmentId);
        await setDoc(
          apptRef,
          {
            fullDate: newDate,
            timeSlot: newTimeSlot,
            dateId: newDateId || 'd1',
            status: 'Upcoming',
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        return true;
      }
    } catch (fsErr) {
      console.error('Direct Firestore fallback reschedule error:', fsErr);
    }
    throw error;
  }
};



export const fetchUserAppointmentsViaBackend = async (userId: string): Promise<any[] | null> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    const res = await fetch(`${BASE_URL}/user/${encodeURIComponent(userId)}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data) && json.data.length > 0) {
        return json.data;
      }
    }
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.warn('Backend user appointments API unreachable/timed out:', error.message || error);
  }

  // Fallback to Firestore 'appointments' collection
  try {
    if (db) {
      const snapshot = await getDocs(collection(db, 'appointments'));
      if (!snapshot.empty) {
        const items: any[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (!data.userId || data.userId === userId || userId === 'user_demo_123') {
            items.push({ id: docSnap.id, ...data });
          }
        });
        if (items.length > 0) {
          return items;
        }
      }
    }
  } catch (fsErr) {
    console.warn('Firestore fallback appointments fetch warning:', fsErr);
  }

  return null;
};

