export type PatientStatus = 'Active Treatment' | 'Observation' | 'Recovered' | 'On Hold';

export type ConditionType =
  | 'Post-Op Rehab'
  | 'Neuropathy'
  | 'Hypertension'
  | 'Rehab'
  | 'ACL Recovery'
  | 'Orthopedic'
  | 'Chronic Pain';

export interface PatientGoal {
  id: string;
  text: string;
  category: 'SHORT TERM' | 'LONG TERM';
  completed: boolean;
}

export interface PatientReport {
  id: string;
  title: string;
  date: string;
  size: string;
  type?: 'pdf' | 'mri' | 'doc';
}

export interface PatientAppointment {
  id: string;
  date: string;
  time: string;
  doctorName: string;
  isNextSession?: boolean;
  type?: string;
}

export interface PatientClinicalNote {
  id: string;
  text: string;
  date: string;
  doctorName: string;
}

export interface PatientTreatmentPlan {
  title: string;
  subtitle: string;
  progress: number;
  frequency: string;
  duration: string;
}

export interface Patient {
  id: string;
  patientId: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  avatarUrl: string;
  condition: ConditionType | string;
  therapistName: string;
  therapistInitials: string;
  therapistAvatarBg: string;
  nextAppointmentDate: string;
  nextAppointmentTime: string;
  recoveryScore: number;
  status: PatientStatus;
  phone?: string;
  email?: string;
  joinedDate?: string;
  notes?: string;

  // Extended Figma Profile Fields
  painLevel?: 'Mild' | 'Moderate' | 'Severe';
  programsAssignedCount?: number;
  sessionsCompleted?: number;
  sessionsTotal?: number;
  treatmentPlan?: PatientTreatmentPlan;
  goals?: PatientGoal[];
  reports?: PatientReport[];
  upcomingAppointments?: PatientAppointment[];
  clinicalNotes?: PatientClinicalNote[];
}

export interface PatientFilters {
  searchQuery: string;
  condition: string;
  therapist: string;
  status: string;
  ageGroup: string;
  sortBy: 'recently_updated' | 'name_asc' | 'score_desc' | 'id';
  viewMode: 'table' | 'cards';
}

