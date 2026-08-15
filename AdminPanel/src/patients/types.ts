export type PatientStatus =
  | 'Active Treatment'
  | 'Observation'
  | 'Recovered'
  | 'On Hold'
  | 'active'
  | 'inactive'
  | 'completed'
  | 'pending';

export type ConditionType =
  | 'Post-Op Rehab'
  | 'Neuropathy'
  | 'Hypertension'
  | 'Rehab'
  | 'ACL Recovery'
  | 'Orthopedic'
  | 'Chronic Pain'
  | string;

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
  status?: 'upcoming' | 'completed' | 'cancelled';
}

export interface PatientPayment {
  id: string;
  date: string;
  amount: number;
  method: string;
  status: 'paid' | 'pending' | 'refunded' | 'overdue';
  invoiceNumber?: string;
  description?: string;
}

export interface PatientProgram {
  id: string;
  title: string;
  subtitle?: string;
  status: 'Active' | 'Completed' | 'Paused';
  progressPercent: number;
  completedSessions: number;
  totalSessions: number;
  frequency: string;
}

export interface PatientExercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  frequency: string;
  targetArea: string;
  status?: 'assigned' | 'completed' | 'skipped';
  notes?: string;
}

export interface PatientClinicalNote {
  id: string;
  text: string;
  date: string;
  doctorName: string;
  category?: 'clinical' | 'general' | 'billing';
}

export interface PatientTreatmentPlan {
  title: string;
  subtitle: string;
  progress: number;
  frequency: string;
  duration: string;
}

export interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
}

export interface PatientVitals {
  bloodPressure?: string;
  heartRate?: string;
  height?: string;
  weight?: string;
  bmi?: string;
}

export interface MedicalHistory {
  primaryDiagnosis?: string;
  severity?: 'Mild' | 'Moderate' | 'Severe';
  allergies?: string[];
  surgeries?: string[];
  chronicConditions?: string[];
  vitals?: PatientVitals;
}

export interface Patient {
  id: string;
  patientId: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  avatarUrl: string;
  condition: ConditionType;
  therapistName: string;
  therapistInitials: string;
  therapistAvatarBg: string;
  therapistSpecialization?: string;
  nextAppointmentDate: string;
  nextAppointmentTime: string;
  recoveryScore: number;
  status: PatientStatus;
  phone?: string;
  email?: string;
  joinedDate?: string;
  address?: string;
  bloodGroup?: string;
  emergencyContact?: EmergencyContact;
  notes?: string;

  // Extended Profile & Clinical Data
  painLevel?: 'Mild' | 'Moderate' | 'Severe';
  programsAssignedCount?: number;
  sessionsCompleted?: number;
  sessionsTotal?: number;
  treatmentPlan?: PatientTreatmentPlan;
  medicalHistory?: MedicalHistory;
  goals?: PatientGoal[];
  reports?: PatientReport[];
  upcomingAppointments?: PatientAppointment[];
  pastAppointments?: PatientAppointment[];
  payments?: PatientPayment[];
  programs?: PatientProgram[];
  exercises?: PatientExercise[];
  clinicalNotes?: PatientClinicalNote[];
  createdAt?: string;
  updatedAt?: string;
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

export interface PatientStatsSummary {
  totalPatients: number;
  activePatients: number;
  upcomingAppointments: number;
  completedAppointments: number;
  pendingPayments: number;
  monthlyRevenue: number;
}
