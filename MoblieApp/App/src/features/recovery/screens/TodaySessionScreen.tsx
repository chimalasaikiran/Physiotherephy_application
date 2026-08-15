import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';
import { Strings } from '@/constants';
import { BottomNavBar, TabKey } from '@/components';

interface ExerciseItemData {
  id: string;
  name: string;
  reps: string;
  status: 'active' | 'locked';
  image: any;
}

export const TodaySessionScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeNavTab, setActiveNavTab] = useState<TabKey>('recovery');

  const data = Strings.todaySessionDetails;

  const exercises: ExerciseItemData[] = [
    {
      id: 'ex_1',
      name: 'Pelvic Tilt',
      reps: '8 reps • Active',
      status: 'active',
      image: require('../../../assets/images/exercise_pelvic_tilt.png'),
    },
    {
      id: 'ex_2',
      name: 'Cat-Cow Stretch',
      reps: '1 min • Locked',
      status: 'locked',
      image: require('../../../assets/images/exercise_cat_cow.png'),
    },
    {
      id: 'ex_3',
      name: 'Bird Dog',
      reps: '10 reps • Locked',
      status: 'locked',
      image: require('../../../assets/images/exercise_bird_dog.png'),
    },
    {
      id: 'ex_4',
      name: 'Bridge',
      reps: '12 reps • Locked',
      status: 'locked',
      image: require('../../../assets/images/exercise_bridge.png'),
    },
    {
      id: 'ex_5',
      name: "Child's Pose",
      reps: '2 mins • Locked',
      status: 'locked',
      image: require('../../../assets/images/exercise_child_pose.png'),
    },
  ];

  const handleNavTabPress = (tab: TabKey) => {
    setActiveNavTab(tab);
    if (tab === 'home') {
      router.push('/explore');
    } else if (tab === 'bookings') {
      router.push('/my-bookings');
    } else if (tab === 'recovery') {
      router.push('/recovery');
    } else if (tab === 'alerts') {
      router.push('/notifications');
    } else if (tab === 'profile') {
      router.push('/profile');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: "Check out today's Lower Back Recovery session on ONE MEDICAL!",
      });
    } catch (error) {
      Alert.alert('Share', "Sharing today's recovery session details");
    }
  };

  const handleExercisePress = (exercise: ExerciseItemData, index: number = 0) => {
    if (exercise.status === 'active') {
      router.push({
        pathname: '/exercise-details',
        params: { id: exercise.id, name: exercise.name, exerciseIndex: index.toString() },
      } as any);
    } else {
      Alert.alert('Exercise Locked 🔒', 'Complete previous active exercises to unlock this movement.');
    }
  };

  const handleStartSession = () => {
    router.push({
      pathname: '/active-session',
      params: {
        exerciseIndex: '0',
        currentSet: '1',
        totalSets: '3',
        totalExercises: '5',
        name: 'Pelvic Tilt',
      },
    } as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.container}>
        {/* HEADER BAR */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            style={styles.headerIconBtn}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={20} color="#003D9B" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>{data.headerTitle}</Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleShare}
            style={styles.headerIconBtn}
            accessibilityLabel="Share session"
          >
            <Ionicons name="share-social-outline" size={20} color="#003D9B" />
          </TouchableOpacity>
        </View>

        {/* MAIN SCROLLABLE CONTENT */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 110 + Math.max(insets.bottom, 12) },
          ]}
        >
          {/* 1. HERO IMAGE CARD */}
          <View style={styles.heroCard}>
            <Image
              source={require('../../../assets/images/today_session_hero.png')}
              style={styles.heroImage}
              resizeMode="cover"
            />

            {/* Gradient Overlay for Text legibility */}
            <LinearGradient
              colors={['transparent', 'rgba(15, 23, 42, 0.4)', 'rgba(15, 23, 42, 0.88)']}
              locations={[0, 0.45, 1]}
              style={styles.gradientOverlay}
            >
              <View style={styles.heroTextContent}>
                <Text style={styles.heroSubhead}>{data.sessionSubhead}</Text>
                <Text style={styles.heroTitle}>{data.sessionTitle}</Text>

                {/* Pills Meta Row */}
                <View style={styles.pillsRow}>
                  <View style={styles.pillBadge}>
                    <Text style={styles.pillText}>{data.metaTime}</Text>
                  </View>
                  <View style={styles.pillBadge}>
                    <Text style={styles.pillText}>{data.metaExercises}</Text>
                  </View>
                  <View style={styles.pillBadge}>
                    <Text style={styles.pillText}>{data.metaLevel}</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* 2. THE GOAL SECTION */}
          <View style={styles.sectionContainer}>
            <Text style={styles.goalTitle}>{data.goalTitle}</Text>
            <Text style={styles.goalDescription}>{data.goalDescription}</Text>

            {/* REQUIRED EQUIPMENT */}
            <Text style={styles.equipmentSubhead}>{data.requiredEquipmentTitle}</Text>

            <View style={styles.equipmentRow}>
              {/* Band */}
              <View style={styles.equipmentItem}>
                <View style={styles.equipmentIconCircle}>
                  <Ionicons name="barcode-outline" size={22} color="#003D9B" />
                </View>
                <Text style={styles.equipmentLabel}>Band</Text>
              </View>

              {/* Mat */}
              <View style={styles.equipmentItem}>
                <View style={styles.equipmentIconCircle}>
                  <Ionicons name="restaurant-outline" size={22} color="#003D9B" />
                </View>
                <Text style={styles.equipmentLabel}>Mat</Text>
              </View>

              {/* Water */}
              <View style={styles.equipmentItem}>
                <View style={styles.equipmentIconCircle}>
                  <Ionicons name="water-outline" size={22} color="#003D9B" />
                </View>
                <Text style={styles.equipmentLabel}>Water</Text>
              </View>
            </View>
          </View>

          {/* 3. EXERCISES SECTION */}
          <View style={styles.sectionContainer}>
            <View style={styles.exercisesHeaderRow}>
              <Text style={styles.exercisesTitle}>{data.exercisesTitle}</Text>
              <Text style={styles.progressText}>{data.completionProgress}</Text>
            </View>

            <View style={styles.exerciseList}>
              {exercises.map((item) => {
                const isActive = item.status === 'active';
                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.85}
                    onPress={() => handleExercisePress(item)}
                    style={[
                      styles.exerciseCard,
                      isActive ? styles.activeExerciseCard : styles.lockedExerciseCard,
                    ]}
                  >
                    {/* Left Thumbnail Image */}
                    <Image
                      source={item.image}
                      style={styles.exerciseThumbnail}
                      resizeMode="cover"
                    />

                    {/* Middle Text Info */}
                    <View style={styles.exerciseTextContainer}>
                      <Text
                        style={[
                          styles.exerciseName,
                          isActive ? styles.activeExerciseName : styles.lockedExerciseName,
                        ]}
                      >
                        {item.name}
                      </Text>
                      <Text style={styles.exerciseReps}>{item.reps}</Text>
                    </View>

                    {/* Right Icon Button */}
                    {isActive ? (
                      <View style={styles.playButtonCircle}>
                        <Ionicons name="play" size={16} color="#003D9B" style={{ marginLeft: 2 }} />
                      </View>
                    ) : (
                      <View style={styles.lockButtonCircle}>
                        <Ionicons name="lock-closed-outline" size={18} color="#94A3B8" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 4. DOCTOR TIP / QUOTE CARD */}
          <View style={styles.doctorQuoteCard}>
            <Image
              source={require('../../../assets/images/doctor_ananya.png')}
              style={styles.doctorAvatar}
              resizeMode="cover"
            />
            <View style={styles.quoteTextGroup}>
              <Text style={styles.quoteBody}>{data.doctorTip.quote}</Text>
              <Text style={styles.quoteAuthor}>{data.doctorTip.author}</Text>
            </View>
          </View>

          {/* 5. START SESSION CTA BUTTON */}
          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.startSessionBtn}
            onPress={handleStartSession}
          >
            <Text style={styles.startSessionBtnText}>{data.startSessionBtn}</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* BOTTOM NAV BAR */}
        <BottomNavBar activeTab={activeNavTab} onTabPress={handleNavTabPress} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FAFAFC',
  },

  /* HEADER */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
    textAlign: 'center',
  },

  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },

  /* HERO CARD */
  heroCard: {
    height: 350,
    width: '100%',
    borderRadius: 28,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: Spacing.xl,
    backgroundColor: '#0F172A',
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 24,
  },
  heroTextContent: {
    justifyContent: 'flex-end',
  },
  heroSubhead: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold,
    color: 'rgba(255, 255, 255, 0.75)',
    letterSpacing: 1.2,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
    lineHeight: 36,
    marginBottom: 16,
  },
  pillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pillBadge: {
    backgroundColor: 'rgba(226, 232, 240, 0.85)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    backdropFilter: 'blur(8px)',
  },
  pillText: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.semiBold,
    color: '#1E293B',
  },

  /* SECTION GENERAL */
  sectionContainer: {
    marginBottom: Spacing.xl,
  },

  /* THE GOAL */
  goalTitle: {
    fontSize: 22,
    fontWeight: Typography.fontWeight.bold,
    color: '#051A3E',
    marginBottom: 8,
  },
  goalDescription: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 23,
    marginBottom: 20,
  },
  equipmentSubhead: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold,
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  equipmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  equipmentItem: {
    alignItems: 'center',
    gap: 8,
  },
  equipmentIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  equipmentLabel: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.medium,
    color: '#475569',
  },

  /* EXERCISES */
  exercisesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  exercisesTitle: {
    fontSize: 22,
    fontWeight: Typography.fontWeight.bold,
    color: '#051A3E',
  },
  progressText: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },
  exerciseList: {
    gap: 12,
  },
  exerciseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  activeExerciseCard: {
    borderColor: '#003D9B',
    borderWidth: 1.5,
    backgroundColor: '#FFFFFF',
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  lockedExerciseCard: {
    borderColor: '#F1F5F9',
  },
  exerciseThumbnail: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
  },
  exerciseTextContainer: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: 4,
  },
  activeExerciseName: {
    color: '#051A3E',
  },
  lockedExerciseName: {
    color: '#475569',
  },
  exerciseReps: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: Typography.fontWeight.medium,
  },
  playButtonCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  lockButtonCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },

  /* DOCTOR QUOTE CARD */
  doctorQuoteCard: {
    backgroundColor: '#F3F4FF',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  doctorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
  },
  quoteTextGroup: {
    flex: 1,
  },
  quoteBody: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 21,
    fontWeight: Typography.fontWeight.medium,
  },
  quoteAuthor: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.bold,
    color: '#4338CA',
    marginTop: 6,
  },

  /* START SESSION BUTTON */
  startSessionBtn: {
    height: 54,
    backgroundColor: '#003D9B',
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 10,
  },
  startSessionBtnText: {
    fontSize: 17,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
  },
});

export default TodaySessionScreen;
