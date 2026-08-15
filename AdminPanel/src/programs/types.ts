export type ProgramStatus = 'published' | 'draft' | 'archived';
export type ProgramDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type AssignmentStatus = 'On Track' | 'Review Needed' | 'Ahead';
export type AssignmentProgramStatus = 'active' | 'paused' | 'completed';

export interface ProgramAssignment {
  id: string;
  programId: string;
  patientId: string;
  patientName: string;
  patientAvatar: string;
  patientCondition: string;
  assignedAt: string;
  assignedBy: string;
  status: AssignmentProgramStatus;
  assignmentStatus: AssignmentStatus;
  currentWeek: number;
  totalWeeks: number;
  progressPercent: number;
  adherence: number;
  completedExercises: string[];
  pendingExercises: string[];
  completedSessions: number;
  totalSessions: number;
  lastActivityAt: string;
  startDate: string;
  programTitle: string;
  isArchived?: boolean;
  email?: string;
  phone?: string;
  lastCompletedExercise?: string;
}

export interface Program {
  id: string;
  title: string;
  description: string;
  status: ProgramStatus;
  bodyAreaTag: string; // e.g. "Knee Recovery", "Lumbar Stability", "Neck/Spine"
  coverImage: string;
  duration: string; // e.g. "12 Weeks"
  difficulty: ProgramDifficulty;
  activePatients: number | string; // e.g. 428 or "--"
  completionRate: string; // e.g. "82%" or "N/A"
  updatedAt: string;
  type: string; // e.g. "Rehabilitation", "Core Stability", "Mobility"
  exercisesCount?: number;
  phasesCount?: number;
  totalExercises?: number;
  thumbnailUrl?: string;
  authorName?: string;
  authorAvatar?: string;
  lastUpdated?: string;
}

export interface MetricCardData {
  title: string;
  value: string | number;
  subtext: string;
  badgeType: 'trend' | 'active' | 'pending' | 'patients';
}

export interface RecentlyEditedItem {
  id: string;
  title: string;
  modifiedTime: string;
  iconType: 'shoulder' | 'hamstring' | 'knee' | 'back';
}

export interface PopularTemplateItem {
  id: string;
  title: string;
  usageCount: number;
}
