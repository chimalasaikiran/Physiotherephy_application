import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';
import { Strings } from '@/constants';
import { WORKOUT_EXERCISES, getExerciseByIndex } from '@/constants/workoutData';
import { recordExerciseCompletionForUser } from '@/api/programService';
import { auth } from '@/config/firebase';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HERO_IMAGE_HEIGHT = Math.min(SCREEN_HEIGHT * 0.38, 320);

export const ActiveSessionScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  // Dynamic route parameters
  const assignmentId = (params.assignmentId as string) || '';
  const parsedIndex = params.exerciseIndex ? parseInt(params.exerciseIndex as string, 10) : 0;
  const exerciseIndex = isNaN(parsedIndex) ? 0 : Math.max(0, Math.min(parsedIndex, WORKOUT_EXERCISES.length - 1));
  const currentExerciseObj = getExerciseByIndex(exerciseIndex);

  const parsedSet = params.currentSet ? parseInt(params.currentSet as string, 10) : 1;
  const currentSet = isNaN(parsedSet) ? 1 : Math.max(1, parsedSet);
  const totalSets = currentExerciseObj.totalSets || 3;
  const totalExercises = WORKOUT_EXERCISES.length;

  const exerciseName = (params.name as string) || currentExerciseObj.name;
  const exerciseCategory = (params.category as string) || currentExerciseObj.category;
  const targetReps = currentExerciseObj.targetReps;

  // Interactive state
  const [currentRep, setCurrentRep] = useState<number>(targetReps);
  const [seconds, setSeconds] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [quoteIndex, setQuoteIndex] = useState<number>(0);

  const instructions = [
    '"Breathe normally and maintain steady core engagement."',
    '"Focus on slow, controlled extension without sudden straining."',
    '"Keep shoulders relaxed and flat against the mat."',
    '"Exhale on exertion, inhale returning to starting position."',
    '"Listen to your body; stop if pain exceeds 3/10."',
  ];

  // Timer effect
  useEffect(() => {
    let interval: any = null;
    if (!isPaused) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPaused]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const padMins = mins < 10 ? `0${mins}` : `${mins}`;
    const padSecs = secs < 10 ? `0${secs}` : `${secs}`;
    return `${padMins}:${padSecs}`;
  };

  const handleTogglePause = () => {
    setIsPaused(!isPaused);
  };

  const handleMarkRepComplete = async () => {
    const uid = auth.currentUser?.uid;
    if (uid) {
      try {
        await recordExerciseCompletionForUser(uid, exerciseName);
      } catch (e) {
        console.warn('Record exercise completion warning:', e);
      }
    }

    router.push({
      pathname: '/exercise-progress',
      params: {
        exerciseIndex: exerciseIndex.toString(),
        currentSet: currentSet.toString(),
        totalSets: totalSets.toString(),
        totalExercises: totalExercises.toString(),
        name: exerciseName,
        assignmentId,
      },
    });
  };

  const handlePreviousExercise = () => {
    if (exerciseIndex > 0) {
      router.push({
        pathname: '/active-session',
        params: {
          exerciseIndex: (exerciseIndex - 1).toString(),
          assignmentId,
        },
      } as any);
    }
  };

  const handleNextExercise = () => {
    if (exerciseIndex < totalExercises - 1) {
      router.push({
        pathname: '/active-session',
        params: {
          exerciseIndex: (exerciseIndex + 1).toString(),
          assignmentId,
        },
      } as any);
    } else {
      handleMarkRepComplete();
    }
  };

  const handleExitSession = () => {
    setIsPaused(true);
    Alert.alert(
      'Exit Exercise Session?',
      'All completed exercises and progress are safely saved to your program in Firestore.',
      [
        { text: 'Resume Session', onPress: () => setIsPaused(false), style: 'cancel' },
        {
          text: 'Exit Session',
          style: 'destructive',
          onPress: () => {
            if (assignmentId) {
              router.push({
                pathname: '/recovery-program-details' as any,
                params: { assignmentId },
              });
            } else {
              router.push('/recovery' as any);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* 1. TOP HERO VIDEO / MEDIA PREVIEW */}
        <View style={[styles.heroCard, { height: HERO_IMAGE_HEIGHT }]}>
          <Image
            source={currentExerciseObj.image}
            style={styles.heroImage}
            resizeMode="cover"
          />

          {/* OVERLAY TOP HEADER ROW */}
          <View style={[styles.topOverlayHeader, { paddingTop: insets.top + 8 }]}>
            {/* Back Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleExitSession}
              style={styles.backCircleBtn}
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={20} color="#0F172A" />
            </TouchableOpacity>

            {/* Top Pill Badge */}
            <View style={styles.progressBadgePill}>
              <Text style={styles.progressBadgeText}>
                {`Exercise ${exerciseIndex + 1} of ${totalExercises}`}
              </Text>
            </View>

            {/* TOP RIGHT EXIT BUTTON */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleExitSession}
              style={styles.headerExitBtn}
              accessibilityLabel="Exit session"
            >
              <Ionicons name="close" size={20} color="#EF4444" />
              <Text style={styles.headerExitText}>Exit</Text>
            </TouchableOpacity>
          </View>

          {/* CENTER PAUSE / PLAY OVERLAY BUTTON */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleTogglePause}
            style={styles.centerPlayPauseContainer}
            accessibilityLabel={isPaused ? 'Play exercise' : 'Pause exercise'}
          >
            <View style={styles.pauseCircleBtn}>
              <Ionicons
                name={isPaused ? 'play' : 'pause'}
                size={26}
                color="#003D9B"
                style={{ marginLeft: isPaused ? 3 : 0 }}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* 2. MAIN WORKOUT METRICS & INSTRUCTIONS CONTAINER */}
        <View style={styles.contentCard}>
          {/* EXERCISE TITLE & CATEGORY */}
          <View style={styles.titleContainer}>
            <Text style={styles.exerciseTitle}>{exerciseName}</Text>
            <Text style={styles.exerciseCategory}>{exerciseCategory}</Text>
          </View>

          {/* CIRCULAR PROGRESS COUNTER */}
          <View style={styles.ringContainer}>
            <View style={styles.outerProgressRing}>
              <Text style={styles.setLabelText}>
                SET {currentSet} OF {totalSets}
              </Text>

              {/* REP COUNT DISPLAY */}
              <View style={styles.repCountRow}>
                <Text style={styles.currentRepText}>{currentRep}</Text>
                <Text style={styles.targetRepText}> / {targetReps}</Text>
              </View>

              {/* TIMER DISPLAY */}
              <Text style={styles.timerText}>{formatTimer(seconds)}</Text>
            </View>
          </View>

          {/* CLINICAL TIP / QUOTE */}
          <View style={styles.quoteContainer}>
            <Text style={styles.quoteText}>{instructions[quoteIndex]}</Text>
          </View>

          {/* MIDDLE EXIT ACTION BAR */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleExitSession}
            style={styles.middleExitBanner}
          >
            <Ionicons name="log-out-outline" size={18} color="#DC2626" />
            <Text style={styles.middleExitBannerText}>Exit Session Safely</Text>
          </TouchableOpacity>
        </View>

        {/* 3. BOTTOM FLOATING ACTION CONTROLS */}
        <View style={[styles.bottomBarContainer, { paddingBottom: Math.max(insets.bottom, 16) + 12 }]}>
          {/* STEP BACK BUTTON */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handlePreviousExercise}
            style={styles.stepIconBtn}
            accessibilityLabel="Previous exercise"
          >
            <Ionicons name="play-skip-back-outline" size={20} color="#003D9B" />
          </TouchableOpacity>

          {/* MAIN CTA BUTTON */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleMarkRepComplete}
            style={styles.markCompleteBtn}
            accessibilityLabel="Mark exercise complete"
          >
            <View style={styles.checkCircleIcon}>
              <Ionicons name="checkmark" size={16} color="#003D9B" />
            </View>
            <Text style={styles.markCompleteBtnText}>
              Mark Exercise Complete
            </Text>
          </TouchableOpacity>

          {/* STEP FORWARD BUTTON */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleNextExercise}
            style={styles.stepIconBtn}
            accessibilityLabel="Next exercise"
          >
            <Ionicons name="play-skip-forward-outline" size={20} color="#003D9B" />
          </TouchableOpacity>
        </View>
      </View>
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

  /* 1. HERO VIDEO / PREVIEW */
  heroCard: {
    width: SCREEN_WIDTH,
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  topOverlayHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    zIndex: 10,
  },
  backCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  progressBadgePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  progressBadgeText: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.bold,
    color: '#334155',
  },
  headerSpacer: {
    width: 44,
  },
  headerExitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    gap: 4,
  },
  headerExitText: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.bold,
    color: '#EF4444',
  },
  middleExitBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  middleExitBannerText: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.bold,
    color: '#DC2626',
  },
  centerPlayPauseContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -32 }, { translateY: -16 }],
    zIndex: 10,
  },
  pauseCircleBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 5,
  },


  /* 2. MAIN CONTENT CARD */
  contentCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    paddingTop: 24,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  exerciseTitle: {
    fontSize: 22,
    fontWeight: Typography.fontWeight.bold,
    color: '#051A3E',
    textAlign: 'center',
    marginBottom: 4,
  },
  exerciseCategory: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.bold,
    color: '#0284C7',
    letterSpacing: 1.2,
    textAlign: 'center',
    textTransform: 'uppercase',
  },

  /* CIRCULAR PROGRESS RING */
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 18,
  },
  outerProgressRing: {
    width: 230,
    height: 230,
    borderRadius: 115,
    borderWidth: 14,
    borderColor: '#003D9B',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
  setLabelText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold,
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  repCountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 2,
  },
  currentRepText: {
    fontSize: 44,
    fontWeight: Typography.fontWeight.bold,
    color: '#051A3E',
  },
  targetRepText: {
    fontSize: 26,
    fontWeight: Typography.fontWeight.semiBold,
    color: '#64748B',
  },
  timerText: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
    letterSpacing: 1,
    marginTop: 4,
  },

  /* QUOTE */
  quoteContainer: {
    marginTop: 8,
    paddingHorizontal: 20,
  },
  quoteText: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.medium,
    color: '#475569',
    textAlign: 'center',
  },

  /* 3. BOTTOM BAR */
  bottomBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    gap: 14,
  },
  stepIconBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EEF2F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markCompleteBtn: {
    flex: 1,
    height: 56,
    borderRadius: 9999,
    backgroundColor: '#003D9B',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  checkCircleIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markCompleteBtnText: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
});

export default ActiveSessionScreen;
