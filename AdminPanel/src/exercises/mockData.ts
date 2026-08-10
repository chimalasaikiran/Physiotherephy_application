import type {
  Exercise,
  ExerciseCategory,
  PopularExerciseItem,
  RecentlyAddedExerciseItem,
} from './types';

export const INITIAL_EXERCISES: Exercise[] = [
  {
    id: 'ex-hamstring',
    title: 'Hamstring Stretch',
    levelTag: 'INTERMEDIATE',
    status: 'Published',
    description: 'The supine hamstring stretch is a foundational mobility exercise designed to improve flexibility in the posterior chain, specifically targeting the biceps femoris, semitendinosus, and semimembranosus.',
    difficulty: 'Medium',
    bodyArea: 'Lower Body',
    equipment: 'Yoga Mat',
    durationMinutes: 1,
    usedInProgramsCount: 12,
    patientsAssignedCount: 148,
    clinicsCount: 6,
    completionRate: '92%',
    rating: 4.8,
    reviewsCount: 85,
    isFavorite: true,
    coverImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80',
    category: 'Mobility',
    assignedUsers: [
      { id: 'u1', name: 'Dr. Sarah Miller', initials: 'SM' },
    ],
    targetMuscles: ['Hamstrings', 'Glutes', 'Calves'],
    clinicalOverview: 'The supine hamstring stretch is a foundational mobility exercise designed to improve flexibility in the posterior chain, specifically targeting the biceps femoris, semitendinosus, and semimembranosus. This variation utilizes a strap or towel to provide controlled, progressive tension while maintaining spinal neutrality, making it ideal for patients recovering from lower back strain or those with acute hamstring tightness.',
    instructions: [
      'Starting Position: Lie flat on your back on a firm surface. Extend both legs fully. Loop a stretch strap or towel around the arch of the foot you intend to stretch.',
      'Elevation Phase: Slowly lift your leg toward the ceiling, keeping your knee as straight as possible until you feel a gentle pull in the back of your thigh.',
      'Static Hold: Hold the position for 30 seconds. Ensure your breathing remains steady and your shoulders remain relaxed against the floor.'
    ],
    safetyGuidelines: [
      'Do not lock the knee completely if you have hypermobility.',
      'Stop immediately if you feel sharp, radiating pain or numbness.',
      'Avoid arching the lower back off the floor.'
    ],
    requiredEquipment: [
      'Yoga Mat',
      'Resistance Strap',
      'Towel (Alternative)'
    ],
    activeProgramsList: [
      {
        title: 'Post-Op ACL Recovery',
        patientsCount: 8,
        thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=150&q=80'
      },
      {
        title: 'Daily Mobility Flow',
        patientsCount: 52,
        thumbnail: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=150&q=80'
      }
    ],
    recentUpdates: [
      {
        date: 'Today, 10:45 AM',
        title: 'Video demonstration updated',
        author: 'by Dr. Sarah Miller'
      },
      {
        date: 'Oct 12, 2023',
        title: 'Instructional text clarified',
        author: 'by Dr. Sarah Miller'
      }
    ],
    relatedExercises: [
      {
        title: 'Piriformis Stretch',
        subtitle: 'Glutes & Hips • Beginner',
        image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=500&q=80'
      },
      {
        title: 'Standing Quad Stretch',
        subtitle: 'Quadriceps • Beginner',
        image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=500&q=80'
      },
      {
        title: 'Glute Bridges',
        subtitle: 'Core & Glutes • Intermediate',
        image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=500&q=80'
      },
      {
        title: 'Calf Stretch',
        subtitle: 'Calves • Beginner',
        image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=500&q=80'
      }
    ],
    viewsCount: 1850,
    addedAt: 'Today, 10:45 AM',
    addedBy: 'Dr. Sarah Miller'
  },
  {
    id: 'ex-1',
    title: 'Lumbar Flexion Stretch',
    description: 'Decompresses the lower lumbar spine, reduces lower back tightness and improves flexion range.',
    difficulty: 'Easy',
    bodyArea: 'Lumbar',
    equipment: 'Yoga Mat',
    durationMinutes: 8,
    usedInProgramsCount: 12,
    isFavorite: false,
    coverImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
    category: 'Range of Motion',
    assignedUsers: [
      { id: 'u1', name: 'James Miller', initials: 'JM' },
      { id: 'u2', name: 'Anna Smith', initials: 'AS' },
    ],
    extraUsersCount: 5,
    targetMuscles: ['Erector Spinae', 'Gluteus Maximus', 'Hamstrings'],
    instructions: [
      'Lie comfortably on your back on a padded yoga mat.',
      'Pull both knees up towards your chest with arms wrapped around lower legs.',
      'Hold the stretch gently for 20-30 seconds without bouncing.',
      'Repeat for 3 to 4 sets as tolerated.'
    ],
    viewsCount: 940,
    addedAt: '3 days ago',
    addedBy: 'Dr. Sarah Chen'
  },
  {
    id: 'ex-2',
    title: 'Scapular Wall Slides',
    description: 'Improves scapular upward rotation, mid-back muscle activation, and thoracic postural control.',
    difficulty: 'Medium',
    bodyArea: 'Shoulder',
    equipment: 'Empty Wall',
    durationMinutes: 12,
    usedInProgramsCount: 45,
    isFavorite: true,
    coverImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
    category: 'Strengthening',
    assignedUsers: [
      { id: 'u3', name: 'Peter Taylor', initials: 'PT' }
    ],
    extraUsersCount: 12,
    targetMuscles: ['Serratus Anterior', 'Lower Trapezius', 'Rhomboids'],
    instructions: [
      'Stand with back, head, and elbows touching an empty flat wall.',
      'Slide arms upward in a "W" to "V" pattern while keeping contact.',
      'Pause at full elevation for 2 seconds.',
      'Slowly slide back down to starting position. Perform 3 sets of 10.'
    ],
    viewsCount: 1450,
    addedAt: '5 days ago',
    addedBy: 'Dr. Sarah Chen'
  },
  {
    id: 'ex-3',
    title: 'Resisted Ankle Inversion',
    description: 'Strengthens the tibialis posterior and restores ankle inversion stability post-sprain.',
    difficulty: 'Hard',
    bodyArea: 'Ankle',
    equipment: 'Resistance Band',
    durationMinutes: 15,
    usedInProgramsCount: 8,
    isFavorite: false,
    coverImage: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
    category: 'Stability',
    assignedUsers: [
      { id: 'u4', name: 'Kevin Scott', initials: 'KS' }
    ],
    extraUsersCount: 2,
    targetMuscles: ['Tibialis Posterior', 'Flexor Hallucis Longus'],
    instructions: [
      'Anchor resistance band to a stationary anchor on the lateral side.',
      'Wrap opposite loop around forefoot.',
      'Slowly pull foot inward against band resistance.',
      'Return with controlled eccentric release. Repeat 12 reps per set.'
    ],
    viewsCount: 620,
    addedAt: '1 week ago',
    addedBy: 'Dr. Michael Ross'
  },
  {
    id: 'ex-4',
    title: 'Wall Angels',
    description: 'Postural alignment and pectoral stretch targeting neck strain relief.',
    difficulty: 'Easy',
    bodyArea: 'Shoulder',
    equipment: 'Empty Wall',
    durationMinutes: 10,
    usedInProgramsCount: 28,
    isFavorite: true,
    coverImage: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=800&q=80',
    category: 'Range of Motion',
    assignedUsers: [
      { id: 'u5', name: 'Laura Davis', initials: 'LD' }
    ],
    extraUsersCount: 8,
    targetMuscles: ['Rhomboids', 'Middle Trapezius', 'Pectoralis Minor'],
    viewsCount: 1240,
    addedAt: '1 week ago',
    addedBy: 'Dr. Anna'
  },
  {
    id: 'ex-5',
    title: 'Single Leg Stance',
    description: 'Unilateral proprioception and ankle stability challenge on stable ground.',
    difficulty: 'Medium',
    bodyArea: 'Ankle',
    equipment: 'Balance Disc',
    durationMinutes: 6,
    usedInProgramsCount: 34,
    isFavorite: false,
    coverImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
    category: 'Stability',
    assignedUsers: [
      { id: 'u6', name: 'Robert King', initials: 'RK' }
    ],
    extraUsersCount: 6,
    targetMuscles: ['Gluteus Medius', 'Peroneals', 'Soleus'],
    viewsCount: 890,
    addedAt: '2 weeks ago',
    addedBy: 'Admin'
  },
  {
    id: 'ex-6',
    title: 'Hip Abduction Bridge',
    description: 'Activates glutes and outer hip stabilizers while sustaining pelvic bridge height.',
    difficulty: 'Medium',
    bodyArea: 'Hip',
    equipment: 'Resistance Band',
    durationMinutes: 10,
    usedInProgramsCount: 19,
    isFavorite: true,
    coverImage: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
    category: 'Strengthening',
    assignedUsers: [
      { id: 'u7', name: 'Emma Watson', initials: 'EW' }
    ],
    extraUsersCount: 4,
    targetMuscles: ['Gluteus Medius', 'Gluteus Maximus', 'Core'],
    viewsCount: 780,
    addedAt: '2 hours ago',
    addedBy: 'Dr. Anna'
  },
  {
    id: 'ex-7',
    title: 'Wrist Extension Stretch',
    description: 'Relieves forearm flexor tightness and lateral epicondylitis discomfort.',
    difficulty: 'Easy',
    bodyArea: 'Wrist',
    equipment: 'None',
    durationMinutes: 5,
    usedInProgramsCount: 15,
    isFavorite: false,
    coverImage: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=800&q=80',
    category: 'Range of Motion',
    assignedUsers: [
      { id: 'u8', name: 'Chris Evans', initials: 'CE' }
    ],
    extraUsersCount: 3,
    targetMuscles: ['Wrist Flexors', 'Brachioradialis'],
    viewsCount: 510,
    addedAt: 'Yesterday',
    addedBy: 'Mike Ross'
  },
  {
    id: 'ex-8',
    title: 'Modified Plank',
    description: 'Isometric core endurance exercise performed on knees for lumbar protection.',
    difficulty: 'Easy',
    bodyArea: 'Core',
    equipment: 'Yoga Mat',
    durationMinutes: 8,
    usedInProgramsCount: 22,
    isFavorite: false,
    coverImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    category: 'Strengthening',
    assignedUsers: [
      { id: 'u9', name: 'David Beckham', initials: 'DB' }
    ],
    extraUsersCount: 9,
    targetMuscles: ['Transverse Abdominis', 'Rectus Abdominis'],
    viewsCount: 960,
    addedAt: 'Nov 12',
    addedBy: 'Admin'
  }
];

export const CATEGORIES_LIST: ExerciseCategory[] = [
  { id: 'cat-1', name: 'Range of Motion', count: 124, iconName: 'Activity' },
  { id: 'cat-2', name: 'Strengthening', count: 215, iconName: 'Dumbbell' },
  { id: 'cat-3', name: 'Stability', count: 84, iconName: 'Scale' }
];

export const POPULAR_EXERCISES: PopularExerciseItem[] = [
  {
    id: 'pop-1',
    title: 'Wall Angels',
    views: 1240,
    image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'pop-2',
    title: 'Single Leg Stance',
    views: 890,
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=300&q=80'
  }
];

export const RECENTLY_ADDED: RecentlyAddedExerciseItem[] = [
  {
    id: 'rec-1',
    title: 'Hip Abduction Bridge',
    addedTime: '2 hours ago',
    addedBy: 'Dr. Anna'
  },
  {
    id: 'rec-2',
    title: 'Wrist Extension Stretch',
    addedTime: 'Yesterday',
    addedBy: 'Mike Ross'
  },
  {
    id: 'rec-3',
    title: 'Modified Plank',
    addedTime: 'Nov 12',
    addedBy: 'Admin'
  }
];
