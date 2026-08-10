export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export type BodyArea = 'Lumbar' | 'Shoulder' | 'Ankle' | 'Knee' | 'Neck' | 'Hip' | 'Wrist' | 'Core' | 'All';

export interface AssignedUser {
  id: string;
  name: string;
  avatar?: string;
  initials: string;
}

export interface Exercise {
  id: string;
  title: string;
  description?: string;
  difficulty: DifficultyLevel;
  bodyArea: string;
  equipment: string;
  durationMinutes: number;
  usedInProgramsCount: number;
  isFavorite: boolean;
  coverImage: string;
  assignedUsers: AssignedUser[];
  extraUsersCount?: number;
  category: string;
  targetMuscles?: string[];
  instructions?: string[];
  viewsCount?: number;
  addedAt?: string;
  addedBy?: string;
  status?: 'Published' | 'Draft' | 'Archived';
  levelTag?: string;
  patientsAssignedCount?: number;
  clinicsCount?: number;
  completionRate?: string;
  rating?: number;
  reviewsCount?: number;
  videoUrl?: string;
  safetyGuidelines?: string[];
  requiredEquipment?: string[];
  clinicalOverview?: string;
  activeProgramsList?: { title: string; patientsCount: number; thumbnail?: string }[];
  recentUpdates?: { date: string; title: string; author: string }[];
  relatedExercises?: { title: string; subtitle: string; image: string }[];
}

export interface ExerciseCategory {
  id: string;
  name: string;
  count: number;
  iconName: string;
}

export interface PopularExerciseItem {
  id: string;
  title: string;
  views: number;
  image: string;
}

export interface RecentlyAddedExerciseItem {
  id: string;
  title: string;
  addedTime: string;
  addedBy: string;
}

export interface ExerciseFilterState {
  searchQuery: string;
  bodyArea: string;
  difficulty: string;
  equipment: string;
  type: string;
  viewMode: 'grid' | 'list';
}
