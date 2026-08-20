import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  runTransaction,
  arrayUnion,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/auth/config/firebase';
import type { AppointmentItem } from '@/schedule/components/AppointmentsTable';
import { resolveAppointmentStatus } from '@/utils/dateUtils';

export const APPOINTMENTS_COLLECTION = 'appointments';
export const BOOKED_SLOTS_COLLECTION = 'booked_slots';

export interface ScheduleCreateInput {
  patientId: string;
  patientName: string;
  patientSubtitle?: string;
  patientAvatar?: string;
  patientPhone?: string;
  patientCondition?: string;
  therapistId: string;
  therapistName: string;
  therapistSubtitle?: string;
  therapistAvatar?: string;
  type: 'Clinic Visit' | 'Online' | 'Home Visit';
  fullDate: string; // "YYYY-MM-DD" e.g., "2026-08-20"
  dateLabel?: string; // "Wed, Oct 23"
  timeSlot: string; // "01:45 PM"
  sessionDuration: '30m' | '45m' | '60m';
  patientInstructions?: string;
  internalStaffNotes?: string;
  urgencyPriority?: 'Normal' | 'High Priority';
  attachedFiles?: { id: string; name: string; size: string }[];
  sessionFee?: number;
  facilityCharges?: number;
  insuranceCoverage?: number;
}

export const getSlotLockKey = (doctorId: string, fullDate: string, timeSlot: string): string => {
  const sanitizedDate = fullDate.replace(/[^a-zA-Z0-9]/g, '_');
  const sanitizedTime = timeSlot.replace(/[^a-zA-Z0-9]/g, '_');
  return `${doctorId}_${sanitizedDate}_${sanitizedTime}`;
};

export const resolvePatientName = (data: Record<string, any>, patientsMap?: Record<string, string>): string => {
  const pid = data.patientId || data.userId || data.user_id || data.patient_id;
  if (patientsMap && pid && patientsMap[pid]) {
    return patientsMap[pid];
  }

  const rawName = data.patientName || data.userName || data.name || data.fullName;
  if (
    rawName &&
    rawName !== 'Unnamed Patient' &&
    !rawName.startsWith('user_') &&
    !rawName.startsWith('patient_') &&
    !rawName.includes('undefined') &&
    rawName.trim().length > 0
  ) {
    return rawName;
  }

  if (pid && typeof pid === 'string') {
    return `Patient (${pid.slice(0, 6)})`;
  }
  return 'Registered Patient';
};

export const mapDocToAppointmentItem = (
  id: string,
  data: Record<string, any>,
  patientsMap?: Record<string, string>
): AppointmentItem => {
  const dateStr = data.dateLabel || data.date || data.fullDate || 'Scheduled Date';
  const timeStr = data.timeSlot || data.time || '10:00 AM';

  const resolvedStatus = resolveAppointmentStatus({
    status: data.status,
    fullDate: data.fullDate || data.date,
    timeSlot: data.timeSlot || data.time,
    sessionDuration: data.sessionDuration,
    createdAt: data.createdAt,
  });

  let status: AppointmentItem['status'] = 'Confirmed';
  if (resolvedStatus === 'Cancelled') status = 'Cancelled';
  else if (resolvedStatus === 'Completed') status = 'Completed';
  else if (resolvedStatus === 'Expired') status = 'Expired';
  else if (resolvedStatus === 'Active / Today') status = 'Confirmed';
  else status = 'Confirmed';

  const paymentStatus = (data.paymentStatus || (data.paymentMode === 'online' ? 'Paid' : 'Pending')) as 'Paid' | 'Pending';
  const resolvedPatientName = resolvePatientName(data, patientsMap);

  return {
    id,
    patientName: resolvedPatientName,
    patientSubtitle: data.patientSubtitle || data.patientCondition || data.serviceTitle || data.type || 'General Rehab',
    patientAvatar:
      data.patientAvatar ||
      data.userAvatar ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    therapistName: data.therapistName || data.doctorName || 'Dr. Arjun Mehta',
    therapistSubtitle: data.therapistSubtitle || data.doctorSpecialty || 'Physiotherapy Specialist',
    therapistAvatar:
      data.therapistAvatar ||
      data.doctorAvatar ||
      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150',
    type: (data.type || data.visitType || data.sessionType || 'Clinic Visit') as AppointmentItem['type'],
    date: dateStr,
    time: timeStr,
    status,
    paymentStatus,
  };
};

/**
 * Subscribe to real-time updates for all appointments/schedules with resolved patient names.
 */
export const subscribeToSchedules = (
  onData: (appointments: AppointmentItem[], rawDocs: any[]) => void,
  onError?: (err: Error) => void
): Unsubscribe => {
  const patientsMap: Record<string, string> = {};
  let currentApptDocs: any[] = [];

  const emit = () => {
    const rawDocs = currentApptDocs;
    const mapped = currentApptDocs.map((docSnap) =>
      mapDocToAppointmentItem(docSnap.id, docSnap, patientsMap)
    );
    onData(mapped, rawDocs);
  };

  try {
    const usersColRef = collection(db, 'users');
    const unsubUsers = onSnapshot(
      usersColRef,
      (uSnap) => {
        uSnap.docs.forEach((d) => {
          const uData = d.data();
          const pName = uData.fullName || uData.name;
          if (pName) {
            patientsMap[d.id] = pName;
            if (uData.patientId) patientsMap[uData.patientId] = pName;
            if (uData.userId) patientsMap[uData.userId] = pName;
          }
        });
        emit();
      },
      (err) => console.warn('Users snapshot in schedule listener warning:', err)
    );

    const apptsColRef = collection(db, APPOINTMENTS_COLLECTION);
    const unsubAppts = onSnapshot(
      apptsColRef,
      (snapshot) => {
        currentApptDocs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        emit();
      },
      (err) => {
        console.warn('Firestore appointments snapshot error:', err);
        if (onError) onError(err);
      }
    );

    return () => {
      unsubUsers();
      unsubAppts();
    };
  } catch (err: any) {
    console.error('Failed to subscribe to schedules:', err);
    if (onError) onError(err);
    return () => { };
  }
};

/**
 * Fetch available & booked slots for a specific therapist on a given date.
 */
export const getTherapistSlotsForDate = async (
  therapistId: string,
  fullDate: string,
  allMasterSlots: string[]
): Promise<{ bookedSlots: Set<string>; availableSlots: string[] }> => {
  const bookedSlots = new Set<string>();

  try {
    const q = query(
      collection(db, BOOKED_SLOTS_COLLECTION),
      where('doctorId', '==', therapistId),
      where('fullDate', '==', fullDate)
    );
    const snap = await getDocs(q);
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.status !== 'Cancelled' && data.timeSlot) {
        bookedSlots.add(data.timeSlot);
      }
    });
  } catch (err) {
    console.warn('Error querying booked_slots collection:', err);
  }

  const availableSlots = allMasterSlots.filter((slot) => !bookedSlots.has(slot));
  return { bookedSlots, availableSlots };
};

/**
 * Create a new schedule/appointment atomically in Firestore with double-booking prevention.
 */
export const createScheduleRecord = async (input: ScheduleCreateInput): Promise<string> => {
  const slotKey = getSlotLockKey(input.therapistId, input.fullDate, input.timeSlot);
  const slotRef = doc(db, BOOKED_SLOTS_COLLECTION, slotKey);
  const apptRef = doc(collection(db, APPOINTMENTS_COLLECTION));
  const appointmentId = apptRef.id;

  const sessionFee = input.sessionFee ?? 1500;
  const facilityCharges = input.facilityCharges ?? 300;
  const insuranceCoverage = input.insuranceCoverage ?? 1200;
  const totalPayable = sessionFee + facilityCharges - insuranceCoverage;

  await runTransaction(db, async (transaction) => {
    // 1. Check double-booking slot lock
    const slotSnap = await transaction.get(slotRef);
    if (slotSnap.exists()) {
      const slotData = slotSnap.data();
      if (slotData && slotData.status !== 'Cancelled') {
        throw new Error('SLOT_ALREADY_BOOKED');
      }
    }

    // 2. Prepare appointment payload
    const record = {
      id: appointmentId,
      userId: input.patientId,
      patientId: input.patientId,
      patientName: input.patientName,
      userName: input.patientName,
      userPhone: input.patientPhone || '',
      patientSubtitle: input.patientSubtitle || input.patientCondition || 'General Rehab',
      patientAvatar:
        input.patientAvatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      doctorId: input.therapistId,
      therapistId: input.therapistId,
      doctorName: input.therapistName,
      therapistName: input.therapistName,
      doctorSpecialty: input.therapistSubtitle || 'Physiotherapy Specialist',
      therapistSubtitle: input.therapistSubtitle || 'Physiotherapy Specialist',
      doctorAvatar: input.therapistAvatar || '',
      therapistAvatar: input.therapistAvatar || '',
      type: input.type,
      visitType: input.type,
      fullDate: input.fullDate,
      dateLabel: input.dateLabel || input.fullDate,
      date: input.dateLabel || input.fullDate,
      timeSlot: input.timeSlot,
      time: input.timeSlot,
      sessionDuration: input.sessionDuration,
      patientInstructions: input.patientInstructions || '',
      internalStaffNotes: input.internalStaffNotes || '',
      urgencyPriority: input.urgencyPriority || 'Normal',
      attachedFiles: input.attachedFiles || [],
      sessionFee,
      facilityCharges,
      insuranceCoverage,
      totalPayable,
      amount: totalPayable,
      feeStr: `₹${totalPayable}`,
      numericFee: totalPayable,
      paymentMode: 'clinic',
      paymentStatus: 'Pending',
      status: 'Confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 3. Perform atomic set operations
    transaction.set(apptRef, record);
    transaction.set(slotRef, {
      slotKey,
      appointmentId,
      doctorId: input.therapistId,
      fullDate: input.fullDate,
      timeSlot: input.timeSlot,
      bookedByUserId: input.patientId,
      status: 'Booked',
      createdAt: new Date().toISOString(),
    });
  });

  // Mirror to subcollection users/{userId}/appointments/{appointmentId}
  try {
    const userApptRef = doc(db, 'users', input.patientId, 'appointments', appointmentId);
    await setDoc(userApptRef, {
      id: appointmentId,
      userId: input.patientId,
      patientId: input.patientId,
      patientName: input.patientName,
      therapistId: input.therapistId,
      therapistName: input.therapistName,
      fullDate: input.fullDate,
      timeSlot: input.timeSlot,
      status: 'Confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (subErr) {
    console.warn('Non-critical subcollection mirror error for appointment:', subErr);
  }

  // Update therapist document to associate patient
  try {
    if (input.therapistId) {
      const therapistDocRef = doc(db, 'therapists', input.therapistId);
      await setDoc(
        therapistDocRef,
        {
          assignedPatientIds: arrayUnion(input.patientId),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }
  } catch (tErr) {
    console.warn('Non-critical therapist association note:', tErr);
  }

  // Update central user record at users/{userId}
  try {
    const userDocRef = doc(db, 'users', input.patientId);
    await setDoc(
      userDocRef,
      {
        nextAppointmentDate: input.dateLabel || input.fullDate,
        nextAppointmentTime: input.timeSlot,
        therapistName: input.therapistName,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Non-critical user doc update note:', err);
  }

  return appointmentId;
};

/**
 * Update appointment status (Confirmed, Completed, Cancelled, Scheduled).
 */
export const updateScheduleStatusRecord = async (
  id: string,
  newStatus: AppointmentItem['status'] | 'In Progress',
  doctorId?: string,
  fullDate?: string,
  timeSlot?: string
): Promise<void> => {
  const apptRef = doc(db, APPOINTMENTS_COLLECTION, id);
  await updateDoc(apptRef, {
    status: newStatus,
    updatedAt: new Date().toISOString(),
  });

  // If status is set to Cancelled, release the slot lock
  if (newStatus === 'Cancelled' && doctorId && fullDate && timeSlot) {
    try {
      const slotKey = getSlotLockKey(doctorId, fullDate, timeSlot);
      const slotRef = doc(db, BOOKED_SLOTS_COLLECTION, slotKey);
      await updateDoc(slotRef, {
        status: 'Cancelled',
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Slot unlock error:', e);
    }
  }
};

/**
 * Reschedule an appointment atomically in Firestore.
 */
export const rescheduleScheduleRecord = async (
  appointmentId: string,
  doctorId: string,
  oldDate: string,
  oldTimeSlot: string,
  newDate: string,
  newTimeSlot: string,
  newDateLabel?: string
): Promise<void> => {
  const oldSlotKey = getSlotLockKey(doctorId, oldDate, oldTimeSlot);
  const newSlotKey = getSlotLockKey(doctorId, newDate, newTimeSlot);

  const apptRef = doc(db, APPOINTMENTS_COLLECTION, appointmentId);
  const oldSlotRef = doc(db, BOOKED_SLOTS_COLLECTION, oldSlotKey);
  const newSlotRef = doc(db, BOOKED_SLOTS_COLLECTION, newSlotKey);

  await runTransaction(db, async (transaction) => {
    const newSlotSnap = await transaction.get(newSlotRef);
    if (newSlotSnap.exists()) {
      const data = newSlotSnap.data();
      if (data && data.status !== 'Cancelled' && data.appointmentId !== appointmentId) {
        throw new Error('SLOT_ALREADY_BOOKED');
      }
    }

    transaction.update(apptRef, {
      fullDate: newDate,
      dateLabel: newDateLabel || newDate,
      date: newDateLabel || newDate,
      timeSlot: newTimeSlot,
      time: newTimeSlot,
      status: 'Confirmed',
      updatedAt: new Date().toISOString(),
    });

    const oldSlotSnap = await transaction.get(oldSlotRef);
    if (oldSlotSnap.exists()) {
      transaction.update(oldSlotRef, {
        status: 'Cancelled',
        updatedAt: new Date().toISOString(),
      });
    }

    transaction.set(newSlotRef, {
      slotKey: newSlotKey,
      appointmentId,
      doctorId,
      fullDate: newDate,
      timeSlot: newTimeSlot,
      status: 'Booked',
      createdAt: new Date().toISOString(),
    });
  });
};
