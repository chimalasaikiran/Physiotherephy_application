export type AvailabilityStatus = 'Available Today' | 'Busy' | 'On Leave';

export type TherapistStatus = 'ACTIVE' | 'INACTIVE';

export interface Therapist {
  id: string;
  name: string;
  degree: string;
  experience: string;
  avatarUrl?: string;
  initials?: string;
  specializations: string[];
  patientsCount: number;
  availability: AvailabilityStatus;
  rating: number;
  status: TherapistStatus;
  email: string;
  phone: string;
  consultationFee?: number;
  completedSessionsCount?: number;
  cancelledSessionsCount?: number;
  totalRevenue?: number;
  activeAppointmentsCount?: number;
  location?: string;
  bio?: string;
  workingHours?: string;
  /** Firestore doc IDs of patients assigned to this therapist */
  assignedPatientIds?: string[];
  /** ISO timestamp — set by Firestore on create */
  createdAt?: string | null;
  /** ISO timestamp — updated on every write */
  updatedAt?: string | null;
}

export interface TherapistFilters {
  searchQuery: string;
  specialization: string;
  status: string;
  sortBy: 'name_asc' | 'patients_desc' | 'rating_desc';
  viewMode: 'table' | 'cards';
}
