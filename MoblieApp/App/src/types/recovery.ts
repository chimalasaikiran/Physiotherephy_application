export interface Exercise {
  id: string;
  title: string;
  duration?: string;
  reps?: string;
  sets?: number;
  completedSets?: number;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
}

export interface RecoveryProgram {
  id: string;
  title: string;
  description: string;
  progressPercentage: number;
  totalSessions: number;
  completedSessions: number;
  durationWeeks: number;
  category: string;
  instructorName?: string;
}
