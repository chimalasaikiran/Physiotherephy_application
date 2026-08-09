import { Doctor } from '@/features/appointments';

export interface PaymentTransactionData {
  bookingId: string;
  doctor: Doctor;
  serviceTitle: string;
  placeTitle: string;
  placeAddress: string;
  placeId: string;
  dateStr: string;
  fullDate: string;
  timeSlot: string;
  feeStr: string;
  numericFee: number;
  paymentMode: 'online' | 'clinic';
  paymentMethodId: string;
  paymentMethodName: string;
  transactionId: string;
  timestamp: string;
}

export const PaymentProcessingData = {
  headerTitle: 'Processing Payment',
  subTitle: 'Please do not close the app or tap the back button.',
  mainMessage: 'Processing your payment... Please wait.',
  securityNote: '256-Bit SSL Encryption • Instant Authorization',
  loadingSteps: [
    { threshold: 0, text: 'Connecting to secure payment gateway...' },
    { threshold: 30, text: 'Verifying card & authorization...' },
    { threshold: 65, text: 'Confirming schedule with clinic...' },
    { threshold: 90, text: 'Finalizing appointment reservation...' },
    { threshold: 100, text: 'Payment Successful! Redirecting...' },
  ],
};

export const AppointmentConfirmedData = {
  headerTitle: 'Booking Complete',
  title: 'Appointment Confirmed! 🎉',
  subtitle:
    "Your appointment has been successfully booked. We've sent a confirmation message & calendar invite to your phone.",
  referencePrefix: 'REF-',
  defaultReference: 'OPT-849204',
  statusPaid: 'Paid Online',
  statusPayAtClinic: 'Pending (Pay at Clinic)',
  sections: {
    bookingDetailsTitle: 'APPOINTMENT DETAILS',
    paymentSummaryTitle: 'PAYMENT SUMMARY',
    importantInstructionsTitle: 'IMPORTANT INSTRUCTIONS',
  },
  instructions: [
    'Please arrive 10 minutes prior to your scheduled time slot.',
    'Carry previous medical reports or X-rays if available.',
    'Wear comfortable, stretchable clothing suitable for physical movement.',
  ],
  buttons: {
    viewAppointment: 'View Appointment',
    addToCalendar: 'Add to Calendar',
    backToHome: 'Back to Home',
  },
};

export const DefaultBookingFallback: PaymentTransactionData = {
  bookingId: 'OPT-849204',
  doctor: {
    id: 'doc_ananya',
    name: 'Dr. Ananya Iyer',
    specialty: 'Senior MSK Specialist',
    degree: 'BPT, MPT (Musculoskeletal Rehabilitation)',
    institution: 'Manipal University',
    rating: 4.9,
    reviewsCount: 154,
    experienceYears: 12,
    experienceStr: '12+ Years Exp.',
    clinicName: 'One Medical Hub',
    clinicAddress: '4th Floor, Health Tower, Indiranagar, Bengaluru',
    distance: '1.8 km',
    fee: '₹1,500',
    numericFee: 1500,
    availableToday: true,
    isTopRated: true,
    isNearby: true,
    supportsOnline: true,
    languages: ['English', 'Hindi', 'Kannada', 'Tamil'],
    imageName: 'doctor_ananya',
    avatarBg: '#F3E8FF',
    bio: 'Expert in spinal alignment, chronic lower back management, and post-operative joint replacement therapy.',
  },
  serviceTitle: 'Spinal Rehabilitation',
  placeTitle: 'One Medical Hub',
  placeAddress: '4th Floor, Health Tower, Indiranagar, Bengaluru',
  placeId: 'clinic',
  dateStr: '14 OCT',
  fullDate: 'Today, Oct 14',
  timeSlot: '04:30 PM',
  feeStr: '₹1,500',
  numericFee: 1500,
  paymentMode: 'online',
  paymentMethodId: 'upi',
  paymentMethodName: 'UPI (GPay / PhonePe)',
  transactionId: 'TXN-9842019482',
  timestamp: new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }),
};
