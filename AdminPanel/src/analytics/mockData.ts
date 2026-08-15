import type {
  MetricCardData,
  TherapistPerformance,
  ProgramEfficiency,
  ClinicalInsight,
  Recommendation,
  WeeklyTrendData,
  AppointmentTrendData,
} from './types';

export const mockMetricCards: MetricCardData[] = [
  {
    id: 'total-patients',
    title: 'TOTAL PATIENTS',
    value: '1,248',
    trendText: '+4.2%',
    subtext: 'vs last year',
    isPositive: true,
  },
  {
    id: 'recovery-success',
    title: 'RECOVERY SUCCESS',
    value: '94.2%',
    badge: 'TOP 5%',
    subtext: 'Average completion score',
  },
  {
    id: 'monthly-revenue',
    title: 'MONTHLY REVENUE',
    value: '₹2,45,000',
    trendText: '+14%',
    subtext: 'vs target revenue',
    isPositive: true,
  },
  {
    id: 'therapist-utilization',
    title: 'THERAPIST UTIL...',
    value: '88%',
    subtext: 'Optimal capacity range',
  },
  {
    id: 'completion-rate',
    title: 'COMPLETION RATE',
    value: '96%',
    subtext: 'High patient retention',
  },
];

export const mockRecoveryTrends: WeeklyTrendData[] = [
  { week: 'W1', progress: 45, target: 50 },
  { week: 'W2', progress: 55, target: 60 },
  { week: 'W3', progress: 68, target: 70 },
  { week: 'W4', progress: 78, target: 75 },
  { week: 'W5', progress: 85, target: 80 },
  { week: 'W6', progress: 92, target: 85 },
];

export const mockAppointmentTrends: AppointmentTrendData[] = [
  { day: 'Mon', returning: 70, newPatients: 30 },
  { day: 'Tue', returning: 75, newPatients: 25 },
  { day: 'Wed', returning: 80, newPatients: 20 },
  { day: 'Thu', returning: 68, newPatients: 32 },
  { day: 'Fri', returning: 74, newPatients: 26 },
  { day: 'Sat', returning: 60, newPatients: 40 },
];

export const mockTopTherapists: TherapistPerformance[] = [
  {
    id: 'th-1',
    name: 'Dr. Sarah Miller',
    specialty: 'Sports Physiotherapy',
    rating: 4.9,
    outcomePercentage: 96,
    patientsPerMonth: 48,
    avatarUrl: 'https://images.unsplash.com/photo-1594824813566-7885a3964478?auto=format&fit=crop&q=80&w=150',
  },
  {
    id: 'th-2',
    name: 'James Wilson',
    specialty: 'Orthopedic Rehabilitation',
    rating: 4.8,
    outcomePercentage: 92,
    patientsPerMonth: 42,
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150',
  },
  {
    id: 'th-3',
    name: 'Elena Rodriguez',
    specialty: 'Neurological & Spinal Rehab',
    rating: 4.9,
    outcomePercentage: 95,
    patientsPerMonth: 45,
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150',
  },
];

export const mockRecoveryPrograms: ProgramEfficiency[] = [
  {
    id: 'prog-1',
    name: 'Lower Back Rehab',
    efficiencyPercentage: 94,
    totalPatients: 320,
    avgDurationWeeks: 6,
  },
  {
    id: 'prog-2',
    name: 'Post-Op ACL Stage 2',
    efficiencyPercentage: 88,
    totalPatients: 215,
    avgDurationWeeks: 8,
  },
  {
    id: 'prog-3',
    name: 'Shoulder Rotator Cuff',
    efficiencyPercentage: 82,
    totalPatients: 158,
    avgDurationWeeks: 5,
  },
  {
    id: 'prog-4',
    name: 'Cervical Spine Care',
    efficiencyPercentage: 90,
    totalPatients: 94,
    avgDurationWeeks: 4,
  },
];

export const mockClinicalInsights: ClinicalInsight[] = [
  {
    id: 'ci-1',
    type: 'correlation',
    title: 'High Recovery Velocity',
    description: 'Patients under ACL Stage 2 protocol achieve 15% faster mobility recovery when combined with hydrotherapy.',
  },
  {
    id: 'ci-2',
    type: 'warning',
    title: 'Retention Risk Identified',
    description: 'Post-operative patients over age 60 drop session compliance by 20% after week 8. Proactive check-in suggested.',
  },
];

export const mockRecommendations: Recommendation[] = [
  {
    id: 'rec-1',
    iconType: 'zap',
    title: 'Expand Home Physio Slots',
    description: 'High demand in Westside region. Reallocate 2 hybrid slots to gain +₹35k estimated monthly revenue.',
  },
  {
    id: 'rec-2',
    iconType: 'plus',
    title: 'Automate AR Reminders',
    description: '9 overdue invoices (₹42,000). Enabling automated SMS follow-ups resolves 80% within 7 days.',
  },
];

