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
  addDoc,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/auth/config/firebase';
import type { AppointmentItem } from '@/schedule/components/AppointmentsTable';
import { resolveAppointmentStatus } from '@/utils/dateUtils';
import {
  normalizeAppointmentType,
  normalizeAppointmentStatus,
  normalizePaymentStatus,
  normalizePaymentMethod,
  calculateAppointmentPricing,
  validateStatusTransition,
  calculateRefundPolicy,
  generateOnlineSessionInfo,
  type AppointmentType,
  type AppointmentStatus,
  type PaymentMethod,
  type PaymentStatus,
  type PricingData,
  type LocationData,
} from '@/utils/appointmentUtils';

export const APPOINTMENTS_COLLECTION = 'appointments';
export const PAYMENTS_COLLECTION = 'payments';
export const BOOKED_SLOTS_COLLECTION = 'booked_slots';
export const AUDIT_TRAIL_COLLECTION = 'appointment_history';

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
  programId?: string;
  type: AppointmentType | 'Clinic Visit' | 'Online' | 'Home Visit';
  fullDate: string; // "YYYY-MM-DD" e.g., "2026-08-20"
  dateLabel?: string;
  timeSlot: string; // "01:45 PM"
  endTimeSlot?: string;
  sessionDuration: '30m' | '45m' | '60m';
  patientInstructions?: string;
  internalStaffNotes?: string;
  urgencyPriority?: 'Normal' | 'High Priority';
  attachedFiles?: { id: string; name: string; size: string }[];
  // Location
  clinicId?: string;
  clinicName?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  // Pricing
  baseAmount?: number;
  homeVisitFee?: number;
  travelFee?: number;
  discount?: number;
  taxRate?: number;
  // Payment
  paymentMethod?: PaymentMethod | 'ONLINE' | 'CASH';
}

export const getSlotLockKey = (doctorId: string, fullDate: string, timeSlot: string): string => {
  const sanitizedDate = fullDate.replace(/[^a-zA-Z0-9]/g, '_');
  const sanitizedTime = timeSlot.replace(/[^a-zA-Z0-9]/g, '_');
  return `${doctorId}_${sanitizedDate}_${sanitizedTime}`;
};

export const resolvePatientName = (data: Record<string, any>, patientsMap?: Record<string, string>): string => {
  const pid = data.patientId || data.userId || data.user_id || data.patient_id;
  if (patientsMap && pid && patientsMap[pid]) {
    const mapName = patientsMap[pid];
    if (mapName && mapName !== 'Unnamed Patient' && mapName.trim().length > 0) {
      return mapName;
    }
  }

  const candidates = [
    data.patientName,
    data.userName,
    data.name,
    data.fullName,
    data.displayName,
    data.user_name,
  ];

  for (const c of candidates) {
    if (
      c &&
      typeof c === 'string' &&
      c !== 'Unnamed Patient' &&
      !c.startsWith('user_') &&
      !c.startsWith('patient_') &&
      !c.includes('undefined') &&
      c.trim().length > 0
    ) {
      return c.trim();
    }
  }

  const phone = data.phone || data.userPhone || data.phoneNumber;
  if (phone && typeof phone === 'string' && phone.trim().length > 0) {
    return `Patient (${phone.trim()})`;
  }

  if (pid && typeof pid === 'string') {
    return `Patient (${pid.slice(0, 6)})`;
  }
  return 'Registered Patient';
};

/**
 * Log audit events for compliance & tracking
 */
export const recordAuditLog = async (
  action: string,
  appointmentId: string,
  performedBy: string = 'Admin',
  metadata: Record<string, any> = {}
): Promise<void> => {
  try {
    await addDoc(collection(db, AUDIT_TRAIL_COLLECTION), {
      action,
      appointmentId,
      performedBy,
      timestamp: new Date().toISOString(),
      metadata,
    });
  } catch (err) {
    console.warn('Non-critical audit logging note:', err);
  }
};

export const isGaneshUser = (data: any): boolean => {
  if (!data) return false;
  try {
    const str = typeof data === 'string' ? data : JSON.stringify(data);
    return str.toLowerCase().includes('ganesh');
  } catch {
    return false;
  }
};

/**
 * Helper to check appointments and recover any legacy Expired status records to Confirmed.
 */
export const checkAndUpdateExpiredAppointments = async (rawDocs: any[]): Promise<void> => {
  for (const docData of rawDocs) {
    // Sanitize any legacy Unnamed Patient string stored directly in document
    if (
      docData.patientName === 'Unnamed Patient' ||
      docData.userName === 'Unnamed Patient' ||
      docData.name === 'Unnamed Patient' ||
      docData.fullName === 'Unnamed Patient'
    ) {
      try {
        const pid = docData.patientId || docData.userId || docData.id;
        const sanitizedName = pid ? `Patient (${pid.slice(0, 6)})` : 'Registered Patient';
        const apptRef = doc(db, APPOINTMENTS_COLLECTION, docData.id);
        await updateDoc(apptRef, {
          patientName: sanitizedName,
          userName: sanitizedName,
          updatedAt: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('Error cleaning up Unnamed Patient record:', e);
      }
    }

    const status = normalizeAppointmentStatus(docData.appointmentStatus || docData.status);

    if (status === 'EXPIRED') {
      try {
        const apptRef = doc(db, APPOINTMENTS_COLLECTION, docData.id);
        await updateDoc(apptRef, {
          appointmentStatus: 'CONFIRMED',
          status: 'Confirmed',
          updatedAt: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('Error auto-recovering appointment from expired:', e);
      }
    }
  }
};

export const mapDocToAppointmentItem = (
  id: string,
  data: Record<string, any>,
  patientsMap?: Record<string, string>
): AppointmentItem => {
  const dateStr = data.dateLabel || data.date || data.fullDate || 'Scheduled Date';
  const timeStr = data.timeSlot || data.time || '10:00 AM';

  const rawApptStatus = data.appointmentStatus || data.status;
  const resolvedStatus = resolveAppointmentStatus({
    status: rawApptStatus,
    fullDate: data.fullDate || data.date,
    timeSlot: data.timeSlot || data.time,
    sessionDuration: data.sessionDuration,
    createdAt: data.createdAt,
  });

  let status: AppointmentItem['status'] = 'Confirmed';
  const normStatus = normalizeAppointmentStatus(rawApptStatus);

  if (normStatus === 'CANCELLED') status = 'Cancelled';
  else if (normStatus === 'COMPLETED') status = 'Completed';
  else if (normStatus === 'IN_PROGRESS' || resolvedStatus === 'Active / Today') status = 'In Progress';
  else if (normStatus === 'NO_SHOW') status = 'No Show';
  else if (normStatus === 'PENDING') status = 'Pending';
  else if (resolvedStatus === 'Upcoming') status = 'Confirmed';
  else status = 'Confirmed';

  const rawPaymentMethod = data.paymentMethod || (data.paymentMode === 'online' ? 'ONLINE' : 'CASH');
  const rawPaymentStatus = data.paymentStatus || (rawPaymentMethod === 'ONLINE' ? 'PAID' : 'PENDING');

  const normPaymentMethod = normalizePaymentMethod(rawPaymentMethod);
  const normPaymentStatus = normalizePaymentStatus(rawPaymentStatus);

  const resolvedPatientName = resolvePatientName(data, patientsMap);
  const apptType = normalizeAppointmentType(data.appointmentType || data.type || data.visitType);

  let uiType: AppointmentItem['type'] = 'Clinic Visit';
  if (apptType === 'HOME_VISIT') uiType = 'Home Visit';
  else if (apptType === 'ONLINE') uiType = 'Online';

  const pricing: PricingData = data.pricing || {
    baseAmount: data.sessionFee || 1500,
    visitFee: data.facilityCharges || 0,
    travelFee: 0,
    discount: data.insuranceCoverage || 0,
    tax: 0,
    totalAmount: data.totalPayable || data.amount || 1500,
  };

  return {
    id,
    patientName: resolvedPatientName,
    patientSubtitle: data.patientSubtitle || data.patientCondition || data.serviceTitle || uiType || 'General Rehab',
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
    type: uiType,
    date: dateStr,
    time: timeStr,
    status,
    appointmentStatus: normStatus,
    paymentMethod: normPaymentMethod,
    paymentStatus: normPaymentStatus,
    amount: pricing.totalAmount,
    pricing,
    location: data.location || {},
    paidAt: data.paidAt,
    collectedBy: data.collectedBy,
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
    // Check past appointments for auto-expiration recovery
    checkAndUpdateExpiredAppointments(currentApptDocs);

    const filteredDocs = currentApptDocs.filter((d) => !isGaneshUser(d));
    const mapped = filteredDocs.map((docSnap) =>
      mapDocToAppointmentItem(docSnap.id, docSnap, patientsMap)
    );
    onData(mapped, filteredDocs);
  };

  try {
    const usersColRef = collection(db, 'users');
    const unsubUsers = onSnapshot(
      usersColRef,
      (uSnap) => {
        uSnap.docs.forEach((d) => {
          const uData = d.data();
          if (!isGaneshUser(uData)) {
            const pName = uData.fullName || uData.name;
            if (pName) {
              patientsMap[d.id] = pName;
              if (uData.patientId) patientsMap[uData.patientId] = pName;
              if (uData.userId) patientsMap[uData.userId] = pName;
            }
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
        currentApptDocs = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((d) => !isGaneshUser(d));
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
      if (data.status !== 'Cancelled' && data.status !== 'CANCELLED' && data.timeSlot) {
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
 * Create a new schedule/appointment atomically in Firestore with double-booking prevention, pricing calculation, separate payment entity & audit trail.
 */
export const createScheduleRecord = async (input: ScheduleCreateInput): Promise<string> => {
  const slotKey = getSlotLockKey(input.therapistId, input.fullDate, input.timeSlot);
  const slotRef = doc(db, BOOKED_SLOTS_COLLECTION, slotKey);
  const apptRef = doc(collection(db, APPOINTMENTS_COLLECTION));
  const paymentRef = doc(collection(db, PAYMENTS_COLLECTION));

  const appointmentId = apptRef.id;
  const paymentId = paymentRef.id;

  const apptType = normalizeAppointmentType(input.type);
  const paymentMethod = normalizePaymentMethod(input.paymentMethod);

  // Calculate pricing breakdown
  const pricing = calculateAppointmentPricing({
    appointmentType: apptType,
    baseAmount: input.baseAmount ?? 1500,
    homeVisitFee: input.homeVisitFee ?? 300,
    travelFee: input.travelFee,
    discount: input.discount ?? 0,
    taxRate: input.taxRate ?? 0.05,
    patientLat: input.latitude,
    patientLng: input.longitude,
  });

  // Calculate location object
  let locationObj: LocationData = {
    type: apptType,
  };

  if (apptType === 'HOME_VISIT') {
    locationObj = {
      type: 'HOME_VISIT',
      address: input.address || 'Patient Primary Address',
      latitude: input.latitude || 12.9716,
      longitude: input.longitude || 77.5946,
    };
  } else if (apptType === 'CLINIC_VISIT') {
    locationObj = {
      type: 'CLINIC_VISIT',
      clinicId: input.clinicId || 'clinic_main_01',
      clinicName: input.clinicName || 'Spine & Wellness Center, MG Road',
    };
  } else if (apptType === 'ONLINE') {
    const tele = generateOnlineSessionInfo();
    locationObj = {
      type: 'ONLINE',
      meetingId: tele.meetingId,
      meetingUrl: tele.meetingUrl,
      provider: tele.provider,
    };
  }

  // Payment status rules: CASH -> PENDING; ONLINE -> PENDING (until gateway callback) or PAID if pre-verified
  const paymentStatus: PaymentStatus = paymentMethod === 'CASH' ? 'PENDING' : 'PENDING';
  const appointmentStatus: AppointmentStatus = 'CONFIRMED';

  const nowIso = new Date().toISOString();

  await runTransaction(db, async (transaction) => {
    // 1. Check double-booking slot lock
    const slotSnap = await transaction.get(slotRef);
    if (slotSnap.exists()) {
      const slotData = slotSnap.data();
      if (slotData && slotData.status !== 'Cancelled' && slotData.status !== 'CANCELLED') {
        throw new Error('SLOT_ALREADY_BOOKED');
      }
    }

    // 2. Prepare appointment payload
    const record = {
      appointmentId,
      id: appointmentId,
      patientId: input.patientId,
      userId: input.patientId,
      patientName: input.patientName,
      userName: input.patientName,
      userPhone: input.patientPhone || '',
      patientSubtitle: input.patientSubtitle || input.patientCondition || 'General Rehab',
      patientAvatar:
        input.patientAvatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      therapistId: input.therapistId,
      doctorId: input.therapistId,
      therapistName: input.therapistName,
      doctorName: input.therapistName,
      therapistSubtitle: input.therapistSubtitle || 'Physiotherapy Specialist',
      doctorSpecialty: input.therapistSubtitle || 'Physiotherapy Specialist',
      therapistAvatar: input.therapistAvatar || '',
      doctorAvatar: input.therapistAvatar || '',
      programId: input.programId || '',
      appointmentType: apptType,
      type: apptType === 'HOME_VISIT' ? 'Home Visit' : apptType === 'ONLINE' ? 'Online' : 'Clinic Visit',
      visitType: apptType === 'HOME_VISIT' ? 'Home Visit' : apptType === 'ONLINE' ? 'Online' : 'Clinic Visit',
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

      // Location & Pricing
      location: locationObj,
      pricing,
      amount: pricing.totalAmount,
      totalPayable: pricing.totalAmount,
      feeStr: `₹${pricing.totalAmount}`,

      // Separate Appointment & Payment Statuses
      appointmentStatus,
      status: 'Confirmed',
      paymentMethod,
      paymentStatus,
      paymentId,

      createdAt: nowIso,
      updatedAt: nowIso,
    };

    // 3. Prepare Payment record
    const paymentRecord = {
      paymentId,
      id: paymentId,
      appointmentId,
      patientId: input.patientId,
      patientName: input.patientName,
      therapistId: input.therapistId,
      therapistName: input.therapistName,
      amount: pricing.totalAmount,
      currency: 'INR',
      paymentMethod,
      paymentStatus,
      gateway: paymentMethod === 'ONLINE' ? 'RAZORPAY' : 'NONE',
      paidAt: null,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    // 4. Perform atomic operations
    transaction.set(apptRef, record);
    transaction.set(paymentRef, paymentRecord);
    transaction.set(slotRef, {
      slotKey,
      appointmentId,
      doctorId: input.therapistId,
      fullDate: input.fullDate,
      timeSlot: input.timeSlot,
      bookedByUserId: input.patientId,
      status: 'Booked',
      createdAt: nowIso,
    });
  });

  // Mirror to user subcollection
  try {
    const userApptRef = doc(db, 'users', input.patientId, 'appointments', appointmentId);
    await setDoc(userApptRef, {
      id: appointmentId,
      appointmentId,
      patientId: input.patientId,
      patientName: input.patientName,
      therapistId: input.therapistId,
      therapistName: input.therapistName,
      fullDate: input.fullDate,
      timeSlot: input.timeSlot,
      appointmentStatus,
      status: 'Confirmed',
      paymentStatus,
      paymentMethod,
      createdAt: nowIso,
      updatedAt: nowIso,
    });
  } catch (subErr) {
    console.warn('Non-critical subcollection mirror error:', subErr);
  }

  // Log Audit Event
  await recordAuditLog('APPOINTMENT_CREATED', appointmentId, 'Admin', {
    patientId: input.patientId,
    therapistId: input.therapistId,
    type: apptType,
    totalAmount: pricing.totalAmount,
    paymentMethod,
  });

  return appointmentId;
};

/**
 * Mark a Cash payment as PAID by Admin or Therapist.
 */
export const markCashAsPaidRecord = async (
  appointmentId: string,
  collectedBy: string = 'Admin / Therapist'
): Promise<void> => {
  const nowIso = new Date().toISOString();
  const apptRef = doc(db, APPOINTMENTS_COLLECTION, appointmentId);
  const apptSnap = await getDoc(apptRef);

  if (!apptSnap.exists()) {
    throw new Error('Appointment not found');
  }

  const apptData = apptSnap.data();
  const paymentId = apptData.paymentId || `pay-${appointmentId}`;
  const amount = Number(apptData.pricing?.totalAmount || apptData.amount || apptData.numericFee || 800);
  const patientId = apptData.patientId || apptData.userId || '';
  const patientName = apptData.patientName || apptData.userName || 'Patient';
  const therapistId = apptData.therapistId || apptData.doctorId || '';
  const therapistName = apptData.therapistName || apptData.doctorName || apptData.doctor || '';

  // 1. Update Appointment document
  await updateDoc(apptRef, {
    paymentStatus: 'PAID',
    paidAt: nowIso,
    collectedBy,
    updatedAt: nowIso,
  });

  // 2. Update or create Payment document in main payments collection
  try {
    const paymentRef = doc(db, PAYMENTS_COLLECTION, paymentId);
    const payPayload = {
      id: paymentId,
      paymentId,
      appointmentId,
      bookingId: appointmentId,
      patientId,
      userId: patientId,
      patientName,
      therapistId,
      therapistName,
      doctor: therapistName,
      doctorId: therapistId,
      amount,
      numericAmount: amount,
      currency: 'INR',
      paymentMethod: 'Cash',
      paymentMethodName: 'Cash',
      paymentStatus: 'Paid',
      status: 'PAID',
      paymentMode: 'clinic',
      title: apptData.serviceTitle || apptData.patientSubtitle || 'Physiotherapy Session',
      paidAt: nowIso,
      collectedBy,
      updatedAt: nowIso,
    };
    await setDoc(paymentRef, payPayload, { merge: true });

    // 3. Mirror to user subcollection if patientId exists
    if (patientId) {
      try {
        const userPayRef = doc(db, 'users', patientId, 'payments', paymentId);
        await setDoc(userPayRef, payPayload, { merge: true });
      } catch (subErr) {
        console.warn('Mirror cash payment to user subcollection warning:', subErr);
      }
    }
  } catch (e) {
    console.warn('Payment document update error:', e);
  }

  // 4. Create Transaction record in transactions collection
  try {
    const txnId = `TXN-CASH-${Date.now().toString(36).toUpperCase()}`;
    await addDoc(collection(db, 'transactions'), {
      transactionId: txnId,
      type: 'Payment',
      patientId,
      patientName,
      therapistId,
      therapistName,
      appointmentId,
      paymentId,
      amount,
      currency: 'INR',
      method: 'Cash',
      status: 'Completed',
      description: `Cash payment of ₹${amount.toLocaleString('en-IN')} collected by ${collectedBy}`,
      timestamp: nowIso,
      createdAt: nowIso,
    });
  } catch (txnErr) {
    console.warn('Transaction record logging warning:', txnErr);
  }

  // 5. Update linked invoice if invoice exists
  if (apptData.invoiceId) {
    try {
      await updateDoc(doc(db, 'invoices', apptData.invoiceId), {
        status: 'Paid',
        paymentMethod: 'Cash',
        paidDate: nowIso,
        updatedAt: nowIso,
      });
    } catch (invErr) {
      console.warn('Invoice status update warning:', invErr);
    }
  }

  // 6. Audit trail
  await recordAuditLog('CASH_MARKED_PAID', appointmentId, collectedBy, {
    amount,
    paidAt: nowIso,
  });
};

/**
 * Update appointment status with lifecycle state validation.
 */
export const updateScheduleStatusRecord = async (
  id: string,
  newStatus: AppointmentItem['status'] | 'In Progress' | 'No Show' | 'Expired',
  doctorId?: string,
  fullDate?: string,
  timeSlot?: string
): Promise<void> => {
  const apptRef = doc(db, APPOINTMENTS_COLLECTION, id);
  const snap = await getDoc(apptRef);

  if (!snap.exists()) {
    throw new Error('Appointment document not found.');
  }

  const currentData = snap.data();
  const currentApptStatus = normalizeAppointmentStatus(currentData.appointmentStatus || currentData.status);
  const targetApptStatus = normalizeAppointmentStatus(newStatus);

  // Validate state transition
  const val = validateStatusTransition(currentApptStatus, targetApptStatus);
  if (!val.valid) {
    throw new Error(val.error);
  }

  let statusLabel = 'Confirmed';
  if (targetApptStatus === 'IN_PROGRESS') statusLabel = 'In Progress';
  else if (targetApptStatus === 'COMPLETED') statusLabel = 'Completed';
  else if (targetApptStatus === 'CANCELLED') statusLabel = 'Cancelled';
  else if (targetApptStatus === 'NO_SHOW') statusLabel = 'No Show';
  else if (targetApptStatus === 'EXPIRED') statusLabel = 'Expired';

  await updateDoc(apptRef, {
    appointmentStatus: targetApptStatus,
    status: statusLabel,
    updatedAt: new Date().toISOString(),
  });

  // If status is set to Cancelled, release the slot lock
  if (targetApptStatus === 'CANCELLED' && doctorId && fullDate && timeSlot) {
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

  await recordAuditLog(`STATUS_CHANGED_TO_${targetApptStatus}`, id, 'Admin', {
    previousStatus: currentApptStatus,
    newStatus: targetApptStatus,
  });
};

/**
 * Cancel appointment with cancellation policy calculation.
 */
export const cancelAppointmentWithPolicyRecord = async (
  appointmentId: string,
  reason: string = 'User requested cancellation'
): Promise<{ refundEligible: boolean; refundAmount: number; policyReason: string }> => {
  const apptRef = doc(db, APPOINTMENTS_COLLECTION, appointmentId);
  const snap = await getDoc(apptRef);

  if (!snap.exists()) {
    throw new Error('Appointment not found.');
  }

  const data = snap.data();
  const policy = calculateRefundPolicy(
    data.fullDate || data.date,
    data.timeSlot || data.time,
    data.paymentMethod || 'ONLINE',
    data.paymentStatus || 'PENDING',
    data.pricing?.totalAmount || data.amount || 0
  );

  const docId = data.doctorId || data.therapistId;
  const dateVal = data.fullDate || data.date;
  const slotVal = data.timeSlot || data.time;

  await updateScheduleStatusRecord(appointmentId, 'Cancelled', docId, dateVal, slotVal);

  if (policy.refundEligible && policy.refundAmount > 0) {
    try {
      const paymentRef = doc(db, PAYMENTS_COLLECTION, data.paymentId || appointmentId);
      await updateDoc(paymentRef, {
        paymentStatus: 'REFUND_PENDING',
        refundAmount: policy.refundAmount,
        refundReason: reason,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Payment document refund pending note:', e);
    }
  }

  await recordAuditLog('APPOINTMENT_CANCELLED', appointmentId, 'Admin', {
    reason,
    policy,
  });

  return {
    refundEligible: policy.refundEligible,
    refundAmount: policy.refundAmount,
    policyReason: policy.reason,
  };
};

/**
 * Reschedule an appointment atomically in Firestore with double booking check & history log.
 */
export const rescheduleScheduleRecord = async (
  appointmentId: string,
  doctorId: string,
  oldDate: string,
  oldTimeSlot: string,
  newDate: string,
  newTimeSlot: string,
  newDateLabel?: string,
  reason?: string
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
      if (data && data.status !== 'Cancelled' && data.status !== 'CANCELLED' && data.appointmentId !== appointmentId) {
        throw new Error('SLOT_ALREADY_BOOKED');
      }
    }

    transaction.update(apptRef, {
      fullDate: newDate,
      dateLabel: newDateLabel || newDate,
      date: newDateLabel || newDate,
      timeSlot: newTimeSlot,
      time: newTimeSlot,
      appointmentStatus: 'CONFIRMED',
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

  await recordAuditLog('APPOINTMENT_RESCHEDULED', appointmentId, 'Admin', {
    oldDate,
    oldTimeSlot,
    newDate,
    newTimeSlot,
    reason: reason || 'Patient requested reschedule',
  });
};

/**
 * Permanently delete an appointment record from Firestore and release slot lock.
 */
export const deleteScheduleRecord = async (
  appointmentId: string,
  doctorId?: string,
  fullDate?: string,
  timeSlot?: string
): Promise<void> => {
  const apptRef = doc(db, APPOINTMENTS_COLLECTION, appointmentId);
  await deleteDoc(apptRef);

  if (doctorId && fullDate && timeSlot) {
    try {
      const slotKey = getSlotLockKey(doctorId, fullDate, timeSlot);
      const slotRef = doc(db, BOOKED_SLOTS_COLLECTION, slotKey);
      await deleteDoc(slotRef);
    } catch (e) {
      console.warn('Slot unlock error on deletion:', e);
    }
  }

  await recordAuditLog('APPOINTMENT_DELETED', appointmentId, 'Admin');
};

