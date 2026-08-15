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
    value: '0',
    trendText: '0%',
    subtext: 'vs last year',
    isPositive: true,
  },
  {
    id: 'recovery-success',
    title: 'RECOVERY SUCCESS',
    value: '0%',
    badge: 'NEW APP',
    subtext: 'Average completion score',
  },
  {
    id: 'monthly-revenue',
    title: 'MONTHLY REVENUE',
    value: '₹0',
    trendText: '0%',
    subtext: 'vs target revenue',
    isPositive: true,
  },
  {
    id: 'therapist-utilization',
    title: 'THERAPIST UTIL...',
    value: '0%',
    subtext: 'Initial State',
  },
  {
    id: 'completion-rate',
    title: 'COMPLETION RATE',
    value: '0%',
    subtext: 'Initial State',
  },
];

export const mockRecoveryTrends: WeeklyTrendData[] = [];

export const mockAppointmentTrends: AppointmentTrendData[] = [];

export const mockTopTherapists: TherapistPerformance[] = [];

export const mockRecoveryPrograms: ProgramEfficiency[] = [];

export const mockClinicalInsights: ClinicalInsight[] = [];

export const mockRecommendations: Recommendation[] = [];
