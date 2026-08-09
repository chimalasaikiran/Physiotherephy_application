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
  location?: string;
  bio?: string;
  workingHours?: string;
}

export interface TherapistFilters {
  searchQuery: string;
  specialization: string;
  status: string;
  sortBy: 'name_asc' | 'patients_desc' | 'rating_desc';
  viewMode: 'table' | 'cards';
}
