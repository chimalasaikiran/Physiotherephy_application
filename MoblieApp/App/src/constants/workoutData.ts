export interface WorkoutExercise {
  id: string;
  name: string;
  category: string;
  targetReps: number;
  totalSets: number;
  duration: string;
  image: any;
}

export const WORKOUT_EXERCISES: WorkoutExercise[] = [
  {
    id: 'ex_1',
    name: 'Pelvic Tilt',
    category: 'LOWER BACK & CORE',
    targetReps: 12,
    totalSets: 3,
    duration: '2 Minutes',
    image: require('../assets/images/exercise_pelvic_tilt.png'),
  },
  {
    id: 'ex_2',
    name: 'Cat-Cow Stretch',
    category: 'SPINE MOBILITY',
    targetReps: 10,
    totalSets: 3,
    duration: '3 Minutes',
    image: require('../assets/images/exercise_cat_cow.png'),
  },
  {
    id: 'ex_3',
    name: 'Bird Dog',
    category: 'CORE STABILITY',
    targetReps: 10,
    totalSets: 3,
    duration: '3 Minutes',
    image: require('../assets/images/exercise_bird_dog.png'),
  },
  {
    id: 'ex_4',
    name: 'Bridge',
    category: 'POSTERIOR CHAIN',
    targetReps: 12,
    totalSets: 3,
    duration: '4 Minutes',
    image: require('../assets/images/exercise_bridge.png'),
  },
  {
    id: 'ex_5',
    name: "Child's Pose",
    category: 'RECOVERY & STRETCH',
    targetReps: 8,
    totalSets: 3,
    duration: '2 Minutes',
    image: require('../assets/images/exercise_child_pose.png'),
  },
];

export function getExerciseByIndex(index: number): WorkoutExercise {
  const safeIndex = Math.max(0, Math.min(index, WORKOUT_EXERCISES.length - 1));
  return WORKOUT_EXERCISES[safeIndex];
}

export function getTotalWorkoutSets(): number {
  return WORKOUT_EXERCISES.reduce((sum, ex) => sum + ex.totalSets, 0);
}

export function getCompletedSetsCount(exerciseIndex: number, currentSet: number): number {
  let count = 0;
  for (let i = 0; i < exerciseIndex; i++) {
    count += WORKOUT_EXERCISES[i].totalSets;
  }
  count += currentSet;
  return count;
}

export function calculateWorkoutProgress(exerciseIndex: number, currentSet: number): number {
  const completed = getCompletedSetsCount(exerciseIndex, currentSet);
  const total = getTotalWorkoutSets();
  return Math.min(100, Math.round((completed / total) * 100));
}
