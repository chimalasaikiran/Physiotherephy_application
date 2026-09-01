import React, { useState, useEffect, useRef } from 'react';
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
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';
import { Strings } from '@/constants';
import { WORKOUT_EXERCISES, getExerciseByIndex } from '@/constants/workoutData';
import {
  recordExerciseCompletionForUser,
  subscribeToAssignment,
  markExerciseComplete,
  MobileProgramAssignment,
  MobileProgramWeek,
  getDefaultWeeksForProgram,
} from '@/api/programService';
import { auth } from '@/config/firebase';
import { safeStorage } from '@/utils/storage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HERO_IMAGE_HEIGHT = Math.min(SCREEN_HEIGHT * 0.38, 320);

const RING_SIZE = 230;
const STROKE_WIDTH = 14;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const ActiveSessionScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  // Dynamic route parameters
  const assignmentId = (params.assignmentId as string) || '';
  const parsedIndex = params.exerciseIndex ? parseInt(params.exerciseIndex as string, 10) : 0;
  const initialIndex = isNaN(parsedIndex) ? 0 : Math.max(0, parsedIndex);

  // Firestore Live Assignment State
  const [assignment, setAssignment] = useState<MobileProgramAssignment | null>(null);
  const [isRestored, setIsRestored] = useState<boolean>(false);

  // Derive Week & Exercise List
  const currentWeekNum = assignment?.currentWeek || 1;
  const totalWeeks = assignment?.totalWeeks || 8;
  const programTitle = assignment?.programTitle || 'Therapeutic Recovery';

  const weeksList: MobileProgramWeek[] = assignment?.programDetails?.weeks && assignment.programDetails.weeks.length > 0
    ? assignment.programDetails.weeks
    : getDefaultWeeksForProgram(programTitle, `${totalWeeks} Weeks`);

  const currentWeekObj = weeksList.find((w) => w.weekNumber === currentWeekNum) || weeksList[0];
  const weekTitle = currentWeekObj?.title || `Week ${currentWeekNum}`;

  // Prescribed Exercises for Current Week
  const activeExercises = currentWeekObj?.exercises && currentWeekObj.exercises.length > 0
    ? currentWeekObj.exercises
    : WORKOUT_EXERCISES.map((ex) => ({
        id: ex.id,
        name: ex.name,
        category: ex.category,
        sets: ex.totalSets,
        reps: ex.targetReps,
        duration: ex.duration,
        image: ex.image,
      }));

  const totalExercises = activeExercises.length;
  const [exerciseIndex, setExerciseIndex] = useState<number>(
    Math.min(initialIndex, totalExercises - 1)
  );

  const rawExercise = activeExercises[exerciseIndex] || activeExercises[0] || WORKOUT_EXERCISES[0];

  // Parse numeric target reps & total sets
  const targetReps = typeof rawExercise.reps === 'number'
    ? rawExercise.reps
    : parseInt(String(rawExercise.reps || '12'), 10) || 12;

  const totalSets = Number(rawExercise.sets) || 3;
  const exerciseName = rawExercise.name || (params.name as string) || 'Pelvic Tilt';
  const exerciseCategory = rawExercise.category || (params.category as string) || 'LOWER BACK & CORE';

  // Interactive Workout Session State
  const [currentSet, setCurrentSet] = useState<number>(1);
  const [currentRep, setCurrentRep] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [quoteIndex, setQuoteIndex] = useState<number>(0);

  const STORAGE_KEY = `@active_session_state_${assignmentId || 'default'}`;

  // 1. Subscribe to Real-Time Assignment Document in Firestore
  useEffect(() => {
    if (!assignmentId) return;
    const unsub = subscribeToAssignment(
      assignmentId,
      (data) => {
        if (data) {
          setAssignment(data);
        }
      },
      (err) => console.warn('[ActiveSessionScreen] Assignment sub error:', err)
    );
    return () => unsub();
  }, [assignmentId]);

  // 2. Persistent State Restoration (Resume from exact point stopped)
  useEffect(() => {
    let isMounted = true;
    const restoreSessionState = async () => {
      try {
        const savedRaw = await safeStorage.getItem(STORAGE_KEY);
        if (savedRaw && isMounted) {
          const savedState = JSON.parse(savedRaw);
          if (savedState && typeof savedState.exerciseIndex === 'number') {
            setExerciseIndex(savedState.exerciseIndex);
            setCurrentSet(savedState.currentSet || 1);
            setCurrentRep(savedState.currentRep || 0);
            setSeconds(savedState.seconds || 0);
            setIsPaused(savedState.isPaused ?? true); // Resume paused so user can inspect state
            setIsRestored(true);
          }
        }
      } catch (e) {
        console.warn('[ActiveSession] Error restoring state:', e);
      }
    };
    restoreSessionState();
    return () => {
      isMounted = false;
    };
  }, [STORAGE_KEY]);

  // 3. Save State to Local Storage on Change
  useEffect(() => {
    const persistState = async () => {
      try {
        const payload = {
          assignmentId,
          exerciseIndex,
          currentSet,
          currentRep,
          seconds,
          isPaused,
          timestamp: Date.now(),
        };
        await safeStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch (e) {
        console.warn('[ActiveSession] Save state error:', e);
      }
    };
    persistState();
  }, [assignmentId, exerciseIndex, currentSet, currentRep, seconds, isPaused, STORAGE_KEY]);

  // 4. Timer & Real-Time Rep Counter Increment
  useEffect(() => {
    let timerInterval: any = null;
    let repInterval: any = null;

    if (!isPaused) {
      // 1-second clock timer
      timerInterval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);

      // Rep ticker: Increment 1 rep every 3 seconds while active
      repInterval = setInterval(() => {
        setCurrentRep((prevRep) => {
          if (prevRep < targetReps) {
            return prevRep + 1;
          }
          return prevRep;
        });
      }, 3000);
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval);
      if (repInterval) clearInterval(repInterval);
    };
  }, [isPaused, targetReps]);

  // 5. Automatic Set Progression when target Reps reached
  useEffect(() => {
    if (!isPaused && currentRep >= targetReps && targetReps > 0) {
      if (currentSet < totalSets) {
        const timeout = setTimeout(() => {
          setCurrentSet((prev) => prev + 1);
          setCurrentRep(0);
        }, 1200);
        return () => clearTimeout(timeout);
      }
    }
  }, [currentRep, targetReps, currentSet, totalSets, isPaused]);

  const instructions = [
    '"Breathe normally and maintain steady core engagement."',
    '"Focus on slow, controlled extension without sudden straining."',
    '"Keep shoulders relaxed and flat against the mat."',
    '"Exhale on exertion, inhale returning to starting position."',
    '"Listen to your body; stop if pain exceeds 3/10."',
  ];

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const padMins = mins < 10 ? `0${mins}` : `${mins}`;
    const padSecs = secs < 10 ? `0${secs}` : `${secs}`;
    return `${padMins}:${padSecs}`;
  };

  const handleTogglePause = () => {
    setIsPaused((prev) => !prev);
  };

  // Complete current exercise & advance dynamically
  const handleMarkRepComplete = async () => {
    const uid = auth.currentUser?.uid;
    const currentExId = rawExercise.id || exerciseName;

    if (assignmentId && assignment) {
      try {
        await markExerciseComplete(assignmentId, currentExId, assignment);
      } catch (e) {
        console.warn('[ActiveSession] Mark complete error:', e);
      }
    } else if (uid) {
      try {
        await recordExerciseCompletionForUser(uid, exerciseName);
      } catch (e) {
        console.warn('Record exercise completion warning:', e);
      }
    }

    // Check if more exercises remain in the current week
    if (exerciseIndex < totalExercises - 1) {
      // Clear saved rep state for new exercise
      setCurrentSet(1);
      setCurrentRep(0);
      setExerciseIndex((prev) => prev + 1);
    } else {
      // Completed all exercises for this module/week!
      await safeStorage.removeItem(STORAGE_KEY);
      router.push({
        pathname: '/exercise-progress',
        params: {
          exerciseIndex: exerciseIndex.toString(),
          currentSet: totalSets.toString(),
          totalSets: totalSets.toString(),
          totalExercises: totalExercises.toString(),
          name: exerciseName,
          assignmentId,
        },
      });
    }
  };

  const handlePreviousExercise = () => {
    if (exerciseIndex > 0) {
      setCurrentSet(1);
      setCurrentRep(0);
      setExerciseIndex((prev) => prev - 1);
    }
  };

  const handleNextExercise = () => {
    if (exerciseIndex < totalExercises - 1) {
      setCurrentSet(1);
      setCurrentRep(0);
      setExerciseIndex((prev) => prev + 1);
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
          onPress: async () => {
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

  // SVG ring stroke calculation
  const progressFraction = Math.min(1, Math.max(0, currentRep / (targetReps || 1)));
  const strokeDashoffset = CIRCUMFERENCE - progressFraction * CIRCUMFERENCE;

  // Resolve Exercise Image
  const getExerciseImage = () => {
    if (rawExercise.image) {
      if (typeof rawExercise.image === 'string') {
        return { uri: rawExercise.image };
      }
      return rawExercise.image;
    }
    const defaultEx = getExerciseByIndex(exerciseIndex);
    return defaultEx.image;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* 1. TOP HERO VIDEO / MEDIA PREVIEW */}
      <View style={[styles.heroCard, { height: HERO_IMAGE_HEIGHT }]}>
        <Image
          source={getExerciseImage()}
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
              {`Week ${currentWeekNum} • Ex ${exerciseIndex + 1} of ${totalExercises}`}
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
          <View style={[styles.pauseCircleBtn, isPaused && styles.pausedPlayBtnStyle]}>
            <Ionicons
              name={isPaused ? 'play' : 'pause'}
              size={28}
              color={isPaused ? '#003D9B' : '#003D9B'}
              style={{ marginLeft: isPaused ? 4 : 0 }}
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

        {/* REAL-TIME SVG CIRCULAR PROGRESS COUNTER */}
        <View style={styles.ringContainer}>
          <View style={styles.ringGraphicWrapper}>
            <Svg width={RING_SIZE} height={RING_SIZE}>
              {/* Background Circle Track */}
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RADIUS}
                stroke="#E2E8F0"
                strokeWidth={STROKE_WIDTH}
                fill="transparent"
              />
              {/* Real-Time Animated Progress Arc */}
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RADIUS}
                stroke={isPaused ? '#F59E0B' : '#003D9B'}
                strokeWidth={STROKE_WIDTH}
                strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
              />
            </Svg>

            {/* Inner Ring Text Content */}
            <View style={styles.innerRingContent}>
              <Text style={styles.setLabelText}>
                SET {currentSet} OF {totalSets}
              </Text>

              {/* REAL-TIME 12/12 REP COUNT DISPLAY */}
              <View style={styles.repCountRow}>
                <Text style={styles.currentRepText}>{currentRep}</Text>
                <Text style={styles.targetRepText}> / {targetReps}</Text>
              </View>

              {/* TIMER DISPLAY */}
              <Text style={[styles.timerText, isPaused && styles.pausedTimerText]}>
                {formatTimer(seconds)}
              </Text>
            </View>
          </View>
        </View>

        {/* PAUSED PROGRESS SUMMARY CARD (WHILE PAUSED) */}
        {isPaused ? (
          <View style={styles.pausedDetailsBanner}>
            <View style={styles.pausedBannerHeader}>
              <Ionicons name="pause-circle" size={20} color="#D97706" />
              <Text style={styles.pausedBannerTitle}>EXERCISE PAUSED</Text>
              <View style={styles.pausedBadge}>
                <Text style={styles.pausedBadgeText}>
                  {Math.round((currentRep / targetReps) * 100)}% DONE
                </Text>
              </View>
            </View>
            <Text style={styles.pausedModuleText}>
              {`Module: Week ${currentWeekNum} - ${weekTitle}`}
            </Text>
            <Text style={styles.pausedProgressSubtext}>
              {`Exercise: ${exerciseName} • Set ${currentSet} of ${totalSets} (${currentRep}/${targetReps} Reps)`}
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleTogglePause}
              style={styles.resumeBannerBtn}
            >
              <Ionicons name="play" size={16} color="#FFFFFF" />
              <Text style={styles.resumeBannerBtnText}>Resume Exercise</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* CLINICAL TIP / QUOTE */
          <View style={styles.quoteContainer}>
            <Text style={styles.quoteText}>{instructions[quoteIndex]}</Text>
          </View>
        )}

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
          style={[styles.stepIconBtn, exerciseIndex === 0 && styles.disabledStepBtn]}
          disabled={exerciseIndex === 0}
          accessibilityLabel="Previous exercise"
        >
          <Ionicons name="play-skip-back-outline" size={20} color={exerciseIndex === 0 ? '#94A3B8' : '#003D9B'} />
        </TouchableOpacity>

        {/* MAIN CTA BUTTON */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleMarkRepComplete}
          style={styles.markCompleteBtn}
          accessibilityLabel="Mark exercise complete"
        >
          <View style={styles.checkCircleIcon}>
            <Ionicons name="checkmark" size={15} color="#003D9B" />
          </View>
          <Text
            style={styles.markCompleteBtnText}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
          >
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  progressBadgeText: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.bold,
    color: '#334155',
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
  pausedPlayBtnStyle: {
    backgroundColor: '#FEF3C7',
    borderWidth: 2,
    borderColor: '#F59E0B',
  },

  /* 2. MAIN CONTENT CARD */
  contentCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    paddingTop: 20,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 10,
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

  /* CIRCULAR SVG PROGRESS RING */
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  ringGraphicWrapper: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  innerRingContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
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
  pausedTimerText: {
    color: '#D97706',
  },

  /* PAUSED BANNER OVERLAY */
  pausedDetailsBanner: {
    width: '100%',
    backgroundColor: '#FFFBEB',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    marginVertical: 6,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  pausedBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  pausedBannerTitle: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.bold,
    color: '#B45309',
    letterSpacing: 0.8,
    flex: 1,
  },
  pausedBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pausedBadgeText: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: '#D97706',
  },
  pausedModuleText: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
    marginBottom: 2,
  },
  pausedProgressSubtext: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 10,
  },
  resumeBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D97706',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  resumeBannerBtnText: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
  },

  /* QUOTE */
  quoteContainer: {
    marginTop: 6,
    paddingHorizontal: 20,
  },
  quoteText: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.medium,
    color: '#475569',
    textAlign: 'center',
  },

  middleExitBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
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

  /* 3. BOTTOM BAR */
  bottomBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  stepIconBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledStepBtn: {
    backgroundColor: '#F1F5F9',
    opacity: 0.5,
  },
  markCompleteBtn: {
    flex: 1,
    height: 52,
    borderRadius: 9999,
    backgroundColor: '#003D9B',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  checkCircleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markCompleteBtnText: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
    letterSpacing: 0.2,
    flexShrink: 1,
  },
});

export default ActiveSessionScreen;
