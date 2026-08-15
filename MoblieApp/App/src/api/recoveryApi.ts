export interface ProgressStats {
  recoveryPercentage: number;
  completedSessions: number;
  totalSessions: number;
  streakDays: number;
  painLevelCurrent: number;
  painLevelInitial: number;
  painReductionPercentage: number;
  weeklyAdherenceRate: number;
  totalMinutesSpent: number;
  completedExerciseIds?: string[];
  savedDoctorIds?: string[];
  completedSessionCount?: number;
  recoveryScore?: number;
}

export const DEFAULT_USER_PROGRESS: ProgressStats = {
  recoveryPercentage: 68,
  completedSessions: 14,
  totalSessions: 20,
  streakDays: 5,
  painLevelCurrent: 3,
  painLevelInitial: 8,
  painReductionPercentage: 62.5,
  weeklyAdherenceRate: 90,
  totalMinutesSpent: 210,
  completedExerciseIds: ['ex-1', 'ex-2'],
  savedDoctorIds: [],
  completedSessionCount: 14,
  recoveryScore: 68,
};

export const fetchUserProgressStats = async (userId?: string): Promise<ProgressStats> => {
  return DEFAULT_USER_PROGRESS;
};
