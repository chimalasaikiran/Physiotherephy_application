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

export const InitialBookingsData: BookingItem[] = [];

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
