export interface FilterState {
  dateRange: string;
  therapist: string;
  program: string;
  location: string;
}

export interface MetricCardData {
  id: string;
  title: string;
  value: string;
  badge?: string;
  subtext: string;
  trendText?: string;
  isPositive?: boolean;
}

export interface TherapistPerformance {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  outcomePercentage: number;
  patientsPerMonth: number;
  avatarUrl: string;
}

export interface ProgramEfficiency {
  id: string;
  name: string;
  efficiencyPercentage: number;
  totalPatients: number;
  avgDurationWeeks: number;
}

export interface ClinicalInsight {
  id: string;
  type: 'correlation' | 'warning' | 'opportunity';
  title: string;
  description: string;
}

export interface Recommendation {
  id: string;
  iconType: 'zap' | 'plus' | 'bar-chart';
  title: string;
  description: string;
}

export interface WeeklyTrendData {
  week: string;
  progress: number;
  target: number;
}

export interface AppointmentTrendData {
  day: string;
  returning: number;
  newPatients: number;
}
