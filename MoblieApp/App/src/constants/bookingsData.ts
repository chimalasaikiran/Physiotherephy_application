import { ImageSourcePropType } from 'react-native';

export type BookingStatus = 'Upcoming' | 'Completed' | 'Cancelled';
export type PlaceType = 'clinic' | 'home' | 'online';

export interface BookingItem {
  id: string; // e.g. "OPT-849204"
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  serviceTitle: string;
  dateStr: string; // e.g. "14 OCT 2026"
  fullDate: string; // e.g. "Today, Oct 14"
  timeSlot: string; // e.g. "10:30 AM"
  status: BookingStatus;
  location: string;
  placeTitle: string;
  placeType: PlaceType;
  avatarImageName: 'doctor_ananya' | 'doctor_arjun' | 'care_team_doctor';
  avatarBg: string;
  feeStr: string;
  numericFee: number;
  paymentMode: 'online' | 'clinic';
  paymentStatus: 'Paid Online' | 'Pending (Pay at Clinic)' | 'Refunded';
  paymentMethodName: string;
  transactionId: string;
  rating?: number;
  instructions?: string[];
}

export const DoctorAvatarMap: Record<string, ImageSourcePropType> = {
  doctor_ananya: require('../assets/images/doctor_ananya.png'),
  doctor_arjun: require('../assets/images/doctor_arjun.png'),
  care_team_doctor: require('../assets/images/care_team_doctor.png'),
};

export const InitialBookingsData: BookingItem[] = [
  {
    id: 'OPT-849204',
    doctorId: 'doc_sarah',
    doctorName: 'Dr. Sarah Johnson',
    doctorSpecialty: 'Orthopedic Physiotherapist',
    serviceTitle: 'Back Pain Rehabilitation',
    dateStr: '14 OCT 2026',
    fullDate: 'Today, Oct 14',
    timeSlot: '10:30 AM',
    status: 'Upcoming',
    location: 'Block B, Jubilee Hills, Hyderabad',
    placeTitle: 'ONE MEDICAL Clinic',
    placeType: 'clinic',
    avatarImageName: 'care_team_doctor',
    avatarBg: '#DCFCE7',
    feeStr: '₹1,500',
    numericFee: 1500,
    paymentMode: 'online',
    paymentStatus: 'Paid Online',
    paymentMethodName: 'UPI (GPay / PhonePe)',
    transactionId: 'TXN-9842019482',
    rating: 4.8,
    instructions: [
      'Please arrive 10 minutes prior to your scheduled time.',
      'Carry previous X-rays or medical reports if available.',
      'Wear comfortable, stretchable clothing for physical movement.',
    ],
  },
  {
    id: 'OPT-731059',
    doctorId: 'doc_ananya',
    doctorName: 'Dr. Ananya Iyer',
    doctorSpecialty: 'Senior MSK Specialist',
    dateStr: '18 OCT 2026',
    fullDate: 'Saturday, Oct 18',
    timeSlot: '04:30 PM',
    serviceTitle: 'Post-Surgery Rehab',
    status: 'Upcoming',
    location: '4th Floor, Health Tower, Indiranagar, Bengaluru',
    placeTitle: 'One Medical Hub',
    placeType: 'clinic',
    avatarImageName: 'doctor_ananya',
    avatarBg: '#F3E8FF',
    feeStr: '₹1,500',
    numericFee: 1500,
    paymentMode: 'clinic',
    paymentStatus: 'Pending (Pay at Clinic)',
    paymentMethodName: 'Pay at Reception',
    transactionId: 'TXN-7729103841',
    rating: 4.9,
    instructions: [
      'Bring your post-surgery discharge summary.',
      'Arrive 15 minutes early for registration.',
    ],
  },
  {
    id: 'OPT-620481',
    doctorId: 'doc_arjun',
    doctorName: 'Dr. Arjun Mehta',
    doctorSpecialty: 'Sports Rehabilitation Specialist',
    dateStr: '02 OCT 2026',
    fullDate: 'Friday, Oct 02',
    timeSlot: '02:00 PM',
    serviceTitle: 'Knee Injury Conditioning',
    status: 'Completed',
    location: '4th Floor, Health Tower, Indiranagar, Bengaluru',
    placeTitle: 'One Medical Hub',
    placeType: 'clinic',
    avatarImageName: 'doctor_arjun',
    avatarBg: '#E0E7FF',
    feeStr: '₹1,500',
    numericFee: 1500,
    paymentMode: 'online',
    paymentStatus: 'Paid Online',
    paymentMethodName: 'Credit Card (HDFC)',
    transactionId: 'TXN-5520194810',
    rating: 4.9,
  },
  {
    id: 'OPT-519302',
    doctorId: 'doc_rajesh',
    doctorName: 'Dr. Rajesh Kumar',
    doctorSpecialty: 'Neuro & Spine Specialist',
    dateStr: '25 SEP 2026',
    fullDate: 'Friday, Sep 25',
    timeSlot: '11:00 AM',
    serviceTitle: 'Home Care Spine Therapy',
    status: 'Cancelled',
    location: 'Home Visit (Registered Address)',
    placeTitle: 'Home Visit',
    placeType: 'home',
    avatarImageName: 'doctor_arjun',
    avatarBg: '#FEF3C7',
    feeStr: '₹2,200',
    numericFee: 2200,
    paymentMode: 'online',
    paymentStatus: 'Refunded',
    paymentMethodName: 'UPI (Paytm)',
    transactionId: 'TXN-3104928104',
    rating: 4.7,
  },
];

export const BookingStatusConfig = {
  Upcoming: {
    label: 'Upcoming',
    badgeBg: '#EFF6FF', // Soft Blue
    badgeText: '#003D9B', // Deep Blue
    borderColor: '#BFDBFE',
    iconName: 'time-outline' as const,
  },
  Completed: {
    label: 'Completed',
    badgeBg: '#ECFDF5', // Soft Emerald Green
    badgeText: '#059669', // Emerald Text
    borderColor: '#A7F3D0',
    iconName: 'checkmark-circle-outline' as const,
  },
  Cancelled: {
    label: 'Cancelled',
    badgeBg: '#FEF2F2', // Soft Red
    badgeText: '#DC2626', // Red Text
    borderColor: '#FECACA',
    iconName: 'close-circle-outline' as const,
  },
};
