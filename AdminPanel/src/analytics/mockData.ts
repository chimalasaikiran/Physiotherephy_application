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
    trendText: '+8.4%',
    subtext: 'vs last year',
    isPositive: true,
  },
  {
    id: 'recovery-success',
    title: 'RECOVERY SUCCESS',
    value: '95%',
    badge: 'TOP TIER',
    subtext: 'Average completion score',
  },
  {
    id: 'monthly-revenue',
    title: 'MONTHLY REVENUE',
    value: '₹8.4L',
    trendText: '+12%',
    subtext: 'vs target revenue',
    isPositive: true,
  },
  {
    id: 'therapist-utilization',
    title: 'THERAPIST UTIL...',
    value: '92%',
    subtext: 'High Efficiency',
  },
  {
    id: 'completion-rate',
    title: 'COMPLETION RATE',
    value: '98%',
    subtext: 'Optimal performance',
  },
];

export const mockRecoveryTrends: WeeklyTrendData[] = [
  { week: 'WEEK 1', progress: 65, target: 60 },
  { week: 'WEEK 2', progress: 75, target: 70 },
  { week: 'WEEK 3', progress: 85, target: 78 },
  { week: 'WEEK 4', progress: 95, target: 82 },
];

export const mockAppointmentTrends: AppointmentTrendData[] = [
  { day: 'Mon', returning: 74, newPatients: 26 },
  { day: 'Tue', returning: 68, newPatients: 32 },
  { day: 'Wed', returning: 79, newPatients: 21 },
  { day: 'Thu', returning: 74, newPatients: 26 },
];

export const mockTopTherapists: TherapistPerformance[] = [
  {
    id: 'th-1',
    name: 'Dr. Sarah Miller',
    specialty: 'Orthopedics',
    rating: 4.9,
    outcomePercentage: 98,
    patientsPerMonth: 42,
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150',
  },
  {
    id: 'th-2',
    name: 'James Wilson',
    specialty: 'Physical Rehab',
    rating: 4.8,
    outcomePercentage: 96,
    patientsPerMonth: 38,
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150',
  },
  {
    id: 'th-3',
    name: 'Elena Rodriguez',
    specialty: 'Geriatric Care',
    rating: 4.9,
    outcomePercentage: 99,
    patientsPerMonth: 31,
    avatarUrl: 'https://images.unsplash.com/photo-1594824813566-7885a3964478?auto=format&fit=crop&q=80&w=150',
  },
  {
    id: 'th-4',
    name: 'Dr. Rahul Verma',
    specialty: 'Sports Medicine',
    rating: 4.9,
    outcomePercentage: 95,
    patientsPerMonth: 45,
    avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=150',
  },
];

export const mockRecoveryPrograms: ProgramEfficiency[] = [
  {
    id: 'pr-1',
    name: 'Lower Back Pain',
    efficiencyPercentage: 88,
    totalPatients: 210,
    avgDurationWeeks: 6,
  },
  {
    id: 'pr-2',
    name: 'Post-Op ACL',
    efficiencyPercentage: 94,
    totalPatients: 145,
    avgDurationWeeks: 12,
  },
  {
    id: 'pr-3',
    name: 'Shoulder Rehab',
    efficiencyPercentage: 82,
    totalPatients: 98,
    avgDurationWeeks: 8,
  },
];

export const mockClinicalInsights: ClinicalInsight[] = [
  {
    id: 'ci-1',
    type: 'correlation',
    title: 'Correlation Identified',
    description: 'Early intervention (within 48hrs) correlates to 30% faster recovery in Ortho patients.',
  },
  {
    id: 'ci-2',
    type: 'warning',
    title: 'Efficiency Warning',
    description: 'Potential therapist burnout detected in Ortho; workload exceeds 120% of optimal.',
  },
];

export const mockRecommendations: Recommendation[] = [
  {
    id: 'rec-1',
    iconType: 'zap',
    title: 'Optimize Ortho scheduling',
    description: 'Optimize Ortho scheduling to reduce therapist wait times.',
  },
  {
    id: 'rec-2',
    iconType: 'plus',
    title: 'Increase ACL Program capacity',
    description: 'Increase ACL Program capacity; waitlist currently 3 weeks.',
  },
  {
    id: 'rec-3',
    iconType: 'bar-chart',
    title: 'Review Post-Op metrics',
    description: 'Review Post-Op success metrics for new therapist onboarding.',
  },
];
