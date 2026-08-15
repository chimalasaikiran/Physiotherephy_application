import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';
import {
  WORKOUT_EXERCISES,
  getExerciseByIndex,
  calculateWorkoutProgress,
  getCompletedSetsCount,
  getTotalWorkoutSets,
} from '@/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const ExerciseProgressScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  // Parse exercise and set parameters passed from ActiveSessionScreen
  const parsedIndex = params.exerciseIndex ? parseInt(params.exerciseIndex as string, 10) : 0;
  const exerciseIndex = isNaN(parsedIndex) ? 0 : Math.max(0, Math.min(parsedIndex, WORKOUT_EXERCISES.length - 1));
  const currentExerciseObj = getExerciseByIndex(exerciseIndex);

  const parsedSet = params.currentSet ? parseInt(params.currentSet as string, 10) : 1;
  const currentSet = isNaN(parsedSet) ? 1 : Math.max(1, parsedSet);
  const totalSets = currentExerciseObj.totalSets || 3;
  const totalExercises = WORKOUT_EXERCISES.length;

  const isExerciseComplete = currentSet >= totalSets;
  const isWorkoutComplete = isExerciseComplete && exerciseIndex >= totalExercises - 1;

  // Set & workout statistics
  const completedSetsTotal = getCompletedSetsCount(exerciseIndex, currentSet);
  const totalWorkoutSets = getTotalWorkoutSets();
  const sessionPercent = calculateWorkoutProgress(exerciseIndex, currentSet);
  const remainingExercises = isExerciseComplete ? Math.max(0, totalExercises - (exerciseIndex + 1)) : totalExercises - exerciseIndex;

  // Determine next step target details
  let nextExerciseObj = currentExerciseObj;
  let nextUpTitle = '';
  let nextUpDuration = '';

  if (!isExerciseComplete) {
    nextExerciseObj = currentExerciseObj;
    nextUpTitle = `${currentExerciseObj.name} (Set ${currentSet + 1} of ${totalSets})`;
    nextUpDuration = currentExerciseObj.duration;
  } else if (!isWorkoutComplete) {
    nextExerciseObj = getExerciseByIndex(exerciseIndex + 1);
    nextUpTitle = `${nextExerciseObj.name} (Set 1 of ${nextExerciseObj.totalSets})`;
    nextUpDuration = nextExerciseObj.duration;
  } else {
    nextUpTitle = 'Session Completed! 🎉';
    nextUpDuration = 'Done';
  }

  // Break modal state
  const [isBreakActive, setIsBreakActive] = useState<boolean>(false);
  const [breakTimer, setBreakTimer] = useState<number>(30);

  // Handle countdown during break modal
  useEffect(() => {
    let interval: any = null;
    if (isBreakActive && breakTimer > 0) {
      interval = setInterval(() => {
        setBreakTimer((prev) => prev - 1);
      }, 1000);
    } else if (breakTimer === 0) {
      setIsBreakActive(false);
      setBreakTimer(30);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isBreakActive, breakTimer]);

  // Automatically navigate to Session Complete screen when final set of final exercise is completed
  useEffect(() => {
    if (isWorkoutComplete) {
      const timer = setTimeout(() => {
        router.replace('/session-complete');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isWorkoutComplete]);

  const handleStartBreak = () => {
    setBreakTimer(30);
    setIsBreakActive(true);
  };

  const handleSkipBreak = () => {
    setIsBreakActive(false);
    setBreakTimer(30);
  };

  const assignmentId = (params.assignmentId as string) || '';

  const handleContinueNext = () => {
    if (isWorkoutComplete) {
      router.replace({
        pathname: '/session-complete',
        params: { assignmentId },
      });
    } else if (isExerciseComplete) {
      // Move to next exercise, starting at set 1
      router.push({
        pathname: '/active-session',
        params: {
          exerciseIndex: (exerciseIndex + 1).toString(),
          currentSet: '1',
          totalSets: getExerciseByIndex(exerciseIndex + 1).totalSets.toString(),
          totalExercises: totalExercises.toString(),
          name: getExerciseByIndex(exerciseIndex + 1).name,
          assignmentId,
        },
      });
    } else {
      // Continue to next set of the current exercise
      router.push({
        pathname: '/active-session',
        params: {
          exerciseIndex: exerciseIndex.toString(),
          currentSet: (currentSet + 1).toString(),
          totalSets: totalSets.toString(),
          totalExercises: totalExercises.toString(),
          name: currentExerciseObj.name,
          assignmentId,
        },
      });
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else if (assignmentId) {
      router.replace({
        pathname: '/recovery-program-details',
        params: { assignmentId },
      });
    } else {
      router.replace('/today-session');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* TOP HEADER BAR */}
      <View
        style={[
          styles.headerBar,
          {
            paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 6 : 8,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleBack}
          style={styles.backBtn}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitleText}>Exercise Progress</Text>
          <Text style={styles.headerSubtitleText}>
            {`Exercise ${exerciseIndex + 1} of ${totalExercises} • Set ${currentSet} of ${totalSets}`}
          </Text>
        </View>

        {/* Empty view for header visual balance */}
        <View style={styles.headerRightSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 20) + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. GREAT JOB CELEBRATION ICON & TITLE */}
        <View style={styles.heroSection}>
          <View style={styles.checkCircleBadge}>
            <Ionicons name="checkmark" size={36} color="#0D9488" />
          </View>

          <Text style={styles.celebrationTitle}>Great Job! 🎉</Text>
          <Text style={styles.celebrationSubtitle}>
            {`Set ${currentSet} of ${totalSets} completed for ${currentExerciseObj.name}!`}
          </Text>
        </View>

        {/* 2. DYNAMIC SET COUNTER CARD */}
        <View style={styles.setCounterCard}>
          <View style={styles.setCounterHeaderRow}>
            <Ionicons name="layers" size={18} color="#003D9B" />
            <Text style={styles.setCounterHeaderTitle}>SET PROGRESS COUNTER</Text>
          </View>

          <Text style={styles.setCounterBadgeText}>
            {`Set ${currentSet} of ${totalSets} Completed`}
          </Text>

          {/* VISUAL SET BADGES */}
          <View style={styles.setBadgesRow}>
            {Array.from({ length: totalSets }).map((_, idx) => {
              const setNum = idx + 1;
              const isCompleted = setNum <= currentSet;
              const isNext = setNum === currentSet + 1;
              return (
                <View
                  key={idx}
                  style={[
                    styles.setIndicatorPill,
                    isCompleted
                      ? styles.setIndicatorCompleted
                      : isNext
                      ? styles.setIndicatorNext
                      : styles.setIndicatorUpcoming,
                  ]}
                >
                  <Ionicons
                    name={isCompleted ? 'checkmark-circle' : isNext ? 'time-outline' : 'ellipse-outline'}
                    size={15}
                    color={isCompleted ? '#FFFFFF' : isNext ? '#003D9B' : '#94A3B8'}
                  />
                  <Text
                    style={[
                      styles.setIndicatorText,
                      isCompleted
                        ? styles.setIndicatorTextCompleted
                        : isNext
                        ? styles.setIndicatorTextNext
                        : styles.setIndicatorTextUpcoming,
                    ]}
                  >
                    {`Set ${setNum}`}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* 3. PROGRESS CARD WITH CIRCULAR RING & METRICS */}
        <View style={styles.progressCard}>
          {/* CIRCULAR PROGRESS RING */}
          <View style={styles.ringWrapper}>
            <View style={styles.outerRing}>
              <Text style={styles.percentText}>{`${sessionPercent}%`}</Text>
              <Text style={styles.sessionCompleteLabel}>
                Session{'\n'}Complete
              </Text>
            </View>
          </View>

          {/* STATS METRICS ROW */}
          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Text style={styles.statValue}>{remainingExercises}</Text>
              <Text style={styles.statLabel}>Exercises Remaining</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statCol}>
              <Text style={styles.statValue}>{`${completedSetsTotal}/${totalWorkoutSets}`}</Text>
              <Text style={styles.statLabel}>Total Sets Completed</Text>
            </View>
          </View>
        </View>

        {/* 4. MOTIVATIONAL QUOTE */}
        <View style={styles.quoteContainer}>
          <Text style={styles.quoteText}>
            "You're getting stronger with every set."
          </Text>
        </View>

        {/* 5. NEXT UP SECTION */}
        <View style={styles.nextUpContainer}>
          <Text style={styles.nextUpLabel}>NEXT UP</Text>

          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleContinueNext}
            style={styles.nextExerciseCard}
          >
            <Image
              source={nextExerciseObj.image}
              style={styles.nextExerciseImage}
              resizeMode="cover"
            />

            <View style={styles.nextExerciseInfo}>
              <Text style={styles.nextExerciseTitle}>{nextUpTitle}</Text>
              <View style={styles.durationRow}>
                <Ionicons name="time-outline" size={15} color="#64748B" />
                <Text style={styles.nextExerciseDuration}>{nextUpDuration}</Text>
              </View>
            </View>

            <View style={styles.chevronWrapper}>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </View>
          </TouchableOpacity>
        </View>

        {/* 6. ACTION BUTTONS */}
        <View style={styles.actionButtonsContainer}>
          {/* DYNAMIC PRIMARY SET ACTION BUTTON */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleContinueNext}
            style={[styles.primaryBtn, isWorkoutComplete ? styles.completePrimaryBtn : null]}
            accessibilityLabel="Dynamic Set Progression Button"
          >
            <Text style={styles.primaryBtnText}>
              {isWorkoutComplete
                ? 'Workout Completed! View Summary 🎉'
                : isExerciseComplete
                ? `Continue to Next Exercise (${nextExerciseObj.name})`
                : `Continue to Set ${currentSet + 1} of ${totalSets}`}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
          </TouchableOpacity>

          {/* SECONDARY BUTTON */}
          {!isWorkoutComplete && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleStartBreak}
              style={styles.secondaryBtn}
              accessibilityLabel="Take a short break 30 seconds"
            >
              <Text style={styles.secondaryBtnText}>Take a Short Break (30s)</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* 30-SECOND BREAK COUNTDOWN MODAL */}
      <Modal visible={isBreakActive} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.breakIconCircle}>
              <Ionicons name="cafe-outline" size={32} color="#003D9B" />
            </View>

            <Text style={styles.modalTitle}>Take a Short Rest</Text>
            <Text style={styles.modalSubhead}>Rest & catch your breath before your next set.</Text>

            {/* COUNTDOWN NUMBER CIRCLE */}
            <View style={styles.timerCircle}>
              <Text style={styles.timerNumber}>{breakTimer}s</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSkipBreak}
              style={styles.skipBreakBtn}
            >
              <Text style={styles.skipBreakBtnText}>
                {breakTimer === 0 ? 'Resume Exercise' : 'Skip Rest & Continue'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFCFF',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: 12,
    backgroundColor: '#FAFCFF',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },
  headerSubtitleText: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.medium,
    color: '#64748B',
    marginTop: 2,
  },
  headerRightSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: 12,
    flexGrow: 1,
  },

  /* 1. HERO CELEBRATION */
  heroSection: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  checkCircleBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  celebrationTitle: {
    fontSize: 22,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
    marginBottom: 4,
  },
  celebrationSubtitle: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.medium,
    color: '#475569',
    textAlign: 'center',
  },

  /* 2. DYNAMIC SET COUNTER CARD */
  setCounterCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    marginBottom: 18,
    alignItems: 'center',
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  setCounterHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  setCounterHeaderTitle: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  setCounterBadgeText: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
    marginBottom: 12,
  },
  setBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  setIndicatorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 9999,
  },
  setIndicatorCompleted: {
    backgroundColor: '#003D9B',
  },
  setIndicatorNext: {
    backgroundColor: '#DBEAFE',
    borderWidth: 1,
    borderColor: '#003D9B',
  },
  setIndicatorUpcoming: {
    backgroundColor: '#F1F5F9',
  },
  setIndicatorText: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.bold,
  },
  setIndicatorTextCompleted: {
    color: '#FFFFFF',
  },
  setIndicatorTextNext: {
    color: '#003D9B',
  },
  setIndicatorTextUpcoming: {
    color: '#94A3B8',
  },

  /* 3. PROGRESS CARD */
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  ringWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  outerRing: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 12,
    borderColor: '#003D9B',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  percentText: {
    fontSize: 32,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },
  sessionCompleteLabel: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.semiBold,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.medium,
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E2E8F0',
  },

  /* 4. QUOTE */
  quoteContainer: {
    marginTop: 14,
    marginBottom: 6,
    paddingHorizontal: 16,
  },
  quoteText: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.semiBold,
    color: '#003D9B',
    textAlign: 'center',
  },

  /* 5. NEXT UP */
  nextUpContainer: {
    marginTop: 16,
  },
  nextUpLabel: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: '#64748B',
    letterSpacing: 1,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  nextExerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  nextExerciseImage: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
  },
  nextExerciseInfo: {
    flex: 1,
    marginLeft: 14,
  },
  nextExerciseTitle: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
    marginBottom: 4,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextExerciseDuration: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.medium,
    color: '#64748B',
    marginLeft: 4,
  },
  chevronWrapper: {
    paddingHorizontal: 6,
  },

  /* 6. ACTION BUTTONS */
  actionButtonsContainer: {
    marginTop: 24,
    marginBottom: 12,
    gap: 12,
  },
  primaryBtn: {
    minHeight: 56,
    paddingHorizontal: 20,
    borderRadius: 9999,
    backgroundColor: '#003D9B',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  completePrimaryBtn: {
    backgroundColor: '#16A34A',
    shadowColor: '#16A34A',
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  secondaryBtn: {
    height: 50,
    borderRadius: 9999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },

  /* MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  breakIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EEF2F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
    marginBottom: 4,
  },
  modalSubhead: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
  },
  timerCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: '#003D9B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  timerNumber: {
    fontSize: 28,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },
  skipBreakBtn: {
    width: '100%',
    height: 50,
    borderRadius: 9999,
    backgroundColor: '#003D9B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipBreakBtnText: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
  },
});

export default ExerciseProgressScreen;
