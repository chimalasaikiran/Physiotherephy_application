import { db } from '../config/firebase.js';
import { FieldValue } from 'firebase-admin/firestore';

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  category: string;
  iconName: string;
  startingFee: string;
  numericFee: number;
}

export interface DoctorItem {
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

export interface CreateAppointmentInput {
  id?: string;
  userId: string;
  userName?: string;
  userPhone?: string;
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
}

// Master catalogue of medical services
const SERVICES_CATALOG: ServiceItem[] = [
  {
    id: 'back_pain',
    title: 'Back & Spine Care',
    description: 'Targeted relief & therapy for chronic lower back pain, sciatica & disc issues',
    category: 'Spine & Ortho',
    iconName: 'fitness',
    startingFee: '₹800',
    numericFee: 800,
  },
  {
    id: 'knee_rehab',
    title: 'Knee & Joint Rehab',
    description: 'Comprehensive recovery for ACL tears, arthritis & knee joint pain',
    category: 'Joint Health',
    iconName: 'body',
    startingFee: '₹850',
    numericFee: 850,
  },
  {
    id: 'post_surgery',
    title: 'Post-Surgery Recovery',
    description: 'Guided rehabilitation program after orthopaedic or cardiac surgery',
    category: 'Rehabilitation',
    iconName: 'pulse',
    startingFee: '₹1,000',
    numericFee: 1000,
  },
  {
    id: 'sports_injury',
    title: 'Sports Injury Therapy',
    description: 'Specialized therapy for athletes recovering from sprains, strains & tears',
    category: 'Sports & Performance',
    iconName: 'trophy',
    startingFee: '₹950',
    numericFee: 950,
  },
  {
    id: 'neck_shoulder',
    title: 'Neck & Shoulder Relief',
    description: 'Therapy for cervical spondylosis, stiffness & postural strain',
    category: 'Spine & Ortho',
    iconName: 'shield',
    startingFee: '₹750',
    numericFee: 750,
  },
  {
    id: 'stroke_neuro',
    title: 'Neurological Rehab',
    description: 'Specialized care for stroke recovery, Parkinson’s & nerve conditions',
    category: 'Neurology',
    iconName: 'medical',
    startingFee: '₹1,200',
    numericFee: 1200,
  },
];

// Master catalog of physiotherapists
const DOCTORS_CATALOG: DoctorItem[] = [
  {
    id: 'doc_1',
    name: 'Dr. Arjun Mehta',
    specialty: 'Orthopedic Physiotherapist',
    experienceYears: 12,
    experienceStr: '12 yrs exp',
    rating: 4.9,
    reviewsCount: 128,
    clinicName: 'Spine & Wellness Center',
    clinicAddress: 'Indiranagar, Bengaluru',
    fee: '₹800',
    numericFee: 800,
    imageName: 'doctor_arjun',
    isTopRated: true,
    isNearby: true,
    availableToday: true,
    supportsOnline: true,
    languages: ['English', 'Hindi', 'Kannada'],
  },
  {
    id: 'doc_2',
    name: 'Dr. Ananya Iyer',
    specialty: 'Senior Sports & Spine Specialist',
    experienceYears: 9,
    experienceStr: '9 yrs exp',
    rating: 4.8,
    reviewsCount: 96,
    clinicName: 'Apex Physio Care Clinic',
    clinicAddress: 'Koramangala, Bengaluru',
    fee: '₹950',
    numericFee: 950,
    imageName: 'doctor_ananya',
    isTopRated: true,
    isNearby: false,
    availableToday: true,
    supportsOnline: true,
    languages: ['English', 'Tamil', 'Hindi'],
  },
  {
    id: 'doc_3',
    name: 'Dr. Rajesh Sharma',
    specialty: 'Post-Surgical Rehab Specialist',
    experienceYears: 15,
    experienceStr: '15 yrs exp',
    rating: 4.9,
    reviewsCount: 154,
    clinicName: 'CareTeam Ortho Hub',
    clinicAddress: 'Jayanagar, Bengaluru',
    fee: '₹1,000',
    numericFee: 1000,
    imageName: 'care_team_doctor',
    isTopRated: true,
    isNearby: true,
    availableToday: false,
    supportsOnline: false,
    languages: ['English', 'Hindi', 'Telugu'],
  },
];

const MASTER_TIME_SLOTS = [
  '09:00 AM',
  '10:30 AM',
  '11:45 AM',
  '02:00 PM',
  '03:30 PM',
  '04:30 PM',
  '06:00 PM',
  '07:15 PM',
];

export const getSlotLockKey = (doctorId: string, fullDate: string, timeSlot: string): string => {
  const sanitizedDate = fullDate.replace(/[^a-zA-Z0-9]/g, '_');
  const sanitizedTime = timeSlot.replace(/[^a-zA-Z0-9]/g, '_');
  return `${doctorId}_${sanitizedDate}_${sanitizedTime}`;
};

export class AppointmentService {
  /**
   * Get all available medical services
   */
  static async getServices(): Promise<ServiceItem[]> {
    try {
      const snapshot = await db.collection('services').get();
      if (!snapshot.empty) {
        const items: ServiceItem[] = [];
        snapshot.forEach((doc: any) => {
          items.push({ id: doc.id, ...doc.data() } as ServiceItem);
        });
        return items;
      }
    } catch (e) {
      console.warn('Using fallback services catalog:', e);
    }
    return SERVICES_CATALOG;
  }

  /**
   * Get all physiotherapists (optionally filtered by service)
   */
  static async getTherapists(serviceId?: string): Promise<DoctorItem[]> {
    try {
      const snapshot = await db.collection('therapists').get();
      if (!snapshot.empty) {
        const items: DoctorItem[] = [];
        snapshot.forEach((doc: any) => {
          items.push({ id: doc.id, ...doc.data() } as DoctorItem);
        });
        return items;
      }
    } catch (e) {
      console.warn('Using fallback therapists catalog:', e);
    }
    return DOCTORS_CATALOG;
  }

  /**
   * Get therapist by ID
   */
  static async getTherapistById(id: string): Promise<DoctorItem | null> {
    const therapists = await this.getTherapists();
    return therapists.find((t) => t.id === id) || null;
  }

  /**
   * Get available and booked slots for a given doctor & date
   */
  static async getAvailableSlots(doctorId: string, fullDate: string): Promise<{
    masterSlots: string[];
    bookedSlots: string[];
    availableSlots: string[];
  }> {
    try {
      const snapshot = await db
        .collection('booked_slots')
        .where('doctorId', '==', doctorId)
        .where('fullDate', '==', fullDate)
        .get();

      const bookedSlots: string[] = [];
      snapshot.forEach((docSnap: any) => {
        const data = docSnap.data();
        if (data.status !== 'Cancelled' && data.timeSlot) {
          bookedSlots.push(data.timeSlot);
        }
      });

      const availableSlots = MASTER_TIME_SLOTS.filter((slot) => !bookedSlots.includes(slot));

      return {
        masterSlots: MASTER_TIME_SLOTS,
        bookedSlots,
        availableSlots,
      };
    } catch (e) {
      console.error('Error fetching available slots:', e);
      return {
        masterSlots: MASTER_TIME_SLOTS,
        bookedSlots: [],
        availableSlots: MASTER_TIME_SLOTS,
      };
    }
  }

  /**
   * Book an appointment with atomic transaction validation to prevent double-booking
   */
  static async createAppointmentWithValidation(params: CreateAppointmentInput): Promise<any> {
    const slotKey = getSlotLockKey(params.doctorId, params.fullDate, params.timeSlot);
    const slotRef = db.collection('booked_slots').doc(slotKey);
    const appointmentRef = params.id
      ? db.collection('appointments').doc(params.id)
      : db.collection('appointments').doc();

    const appointmentId = appointmentRef.id;

    await db.runTransaction(async (transaction: any) => {
      // 1. Double-booking verification
      const slotSnap = await transaction.get(slotRef);
      if (slotSnap.exists) {
        const slotData = slotSnap.data();
        if (slotData && slotData.status !== 'Cancelled') {
          const err: any = new Error('SLOT_ALREADY_BOOKED');
          err.code = 'SLOT_ALREADY_BOOKED';
          throw err;
        }
      }

      // 2. Prepare full appointment record payload
      const paymentStatus =
        params.paymentMode === 'online' ? 'Paid' : 'Pending';
      const appointmentStatus = 'Upcoming';

      const appointmentRecord = {
        id: appointmentId,
        userId: params.userId,
        userName: params.userName || 'Patient',
        userPhone: params.userPhone || '',
        patientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
        doctorId: params.doctorId,
        doctorName: params.doctorName,
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
        status: appointmentStatus,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      // 3. Save appointment & lock slot atomically
      transaction.set(appointmentRef, appointmentRecord);
      transaction.set(slotRef, {
        slotKey,
        appointmentId,
        doctorId: params.doctorId,
        fullDate: params.fullDate,
        timeSlot: params.timeSlot,
        bookedByUserId: params.userId,
        status: 'Booked',
        createdAt: FieldValue.serverTimestamp(),
      });
    });

    return {
      appointmentId,
      status: 'Upcoming',
      message: 'Appointment booked successfully.',
    };
  }

  /**
   * Cancel appointment & release slot lock
   */
  static async cancelAppointment(
    appointmentId: string,
    doctorId: string,
    fullDate: string,
    timeSlot: string
  ): Promise<boolean> {
    const slotKey = getSlotLockKey(doctorId, fullDate, timeSlot);
    const appointmentRef = db.collection('appointments').doc(appointmentId);
    const slotRef = db.collection('booked_slots').doc(slotKey);

    await db.runTransaction(async (transaction: any) => {
      // 1. ALL READS FIRST
      const apptSnap = await transaction.get(appointmentRef);
      const slotSnap = await transaction.get(slotRef);

      // 2. ALL WRITES AFTER
      if (apptSnap.exists) {
        transaction.update(appointmentRef, {
          status: 'Cancelled',
          updatedAt: FieldValue.serverTimestamp(),
        });
      } else {
        transaction.set(
          appointmentRef,
          {
            id: appointmentId,
            status: 'Cancelled',
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      }

      if (slotSnap.exists) {
        transaction.update(slotRef, {
          status: 'Cancelled',
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    });

    return true;
  }

  /**
   * Reschedule appointment & update slot lock atomically
   */
  static async rescheduleAppointment(
    appointmentId: string,
    doctorId: string,
    oldDate: string,
    oldTimeSlot: string,
    newDate: string,
    newTimeSlot: string,
    newDateId?: string
  ): Promise<boolean> {
    const oldSlotKey = getSlotLockKey(doctorId, oldDate, oldTimeSlot);
    const newSlotKey = getSlotLockKey(doctorId, newDate, newTimeSlot);

    const appointmentRef = db.collection('appointments').doc(appointmentId);
    const oldSlotRef = db.collection('booked_slots').doc(oldSlotKey);
    const newSlotRef = db.collection('booked_slots').doc(newSlotKey);

    await db.runTransaction(async (transaction: any) => {
      // 1. ALL READS FIRST
      const newSlotSnap = await transaction.get(newSlotRef);
      const oldSlotSnap = await transaction.get(oldSlotRef);
      const apptSnap = await transaction.get(appointmentRef);

      if (newSlotSnap.exists) {
        const newSlotData = newSlotSnap.data();
        if (newSlotData && newSlotData.status !== 'Cancelled' && newSlotData.appointmentId !== appointmentId) {
          const err: any = new Error('SLOT_ALREADY_BOOKED');
          err.code = 'SLOT_ALREADY_BOOKED';
          throw err;
        }
      }

      // 2. ALL WRITES AFTER
      if (apptSnap.exists) {
        transaction.update(appointmentRef, {
          fullDate: newDate,
          timeSlot: newTimeSlot,
          dateId: newDateId || 'd1',
          status: 'Upcoming',
          updatedAt: FieldValue.serverTimestamp(),
        });
      } else {
        transaction.set(
          appointmentRef,
          {
            id: appointmentId,
            fullDate: newDate,
            timeSlot: newTimeSlot,
            dateId: newDateId || 'd1',
            status: 'Upcoming',
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      }

      if (oldSlotSnap.exists) {
        transaction.update(oldSlotRef, {
          status: 'Cancelled',
          updatedAt: FieldValue.serverTimestamp(),
        });
      }

      transaction.set(newSlotRef, {
        slotKey: newSlotKey,
        appointmentId,
        doctorId,
        fullDate: newDate,
        timeSlot: newTimeSlot,
        status: 'Booked',
        createdAt: FieldValue.serverTimestamp(),
      });
    });

    return true;
  }

  /**
   * Fetch appointments for a user
   */
  static async getUserAppointments(userId: string): Promise<any[]> {
    try {
      const snapshot = await db
        .collection('appointments')
        .where('userId', '==', userId)
        .get();

      const items: any[] = [];
      snapshot.forEach((doc: any) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      return items;
    } catch (e) {
      console.error('Error fetching user appointments:', e);
      return [];
    }
  }
}

