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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';
import { Strings } from '@/constants';
import { BottomNavBar, TabKey } from '@/components';

import {
  subscribeToAssignment,
  subscribeToPatientAssignments,
  MobileProgram,
  MobileProgramAssignment,
  MobileProgramWeek,
  MobileExercise,
  getDefaultWeeksForProgram,
} from '@/api/programService';
import { useAuth } from '@/context/AuthContext';

export const RecoveryProgramDetailsScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ assignmentId?: string }>();
  const assignmentId = params.assignmentId;
  const { user } = useAuth();

  const [activeNavTab, setActiveNavTab] = useState<TabKey>('recovery');
  const [assignment, setAssignment] = useState<MobileProgramAssignment | null>(null);
  const [assignmentLoading, setAssignmentLoading] = useState(true);
  const [expandedWeekNum, setExpandedWeekNum] = useState<number>(1);

  React.useEffect(() => {
    let isMounted = true;
    let unsub = () => {};

    if (assignmentId) {
      unsub = subscribeToAssignment(
        assignmentId,
        (data) => {
          if (isMounted) {
            setAssignment(data);
            if (data?.currentWeek) setExpandedWeekNum(data.currentWeek);
            setAssignmentLoading(false);
          }
        },
        (err) => {
          console.warn('[RecoveryProgramDetails] assignment subscription error:', err);
          if (isMounted) setAssignmentLoading(false);
        }
      );
    } else if (user?.uid) {
      unsub = subscribeToPatientAssignments(user.uid, (assignments) => {
        if (isMounted) {
          if (assignments.length > 0) {
            setAssignment(assignments[0]);
            if (assignments[0]?.currentWeek) setExpandedWeekNum(assignments[0].currentWeek);
          }
          setAssignmentLoading(false);
        }
      });
    } else {
      setAssignmentLoading(false);
    }

    return () => {
      isMounted = false;
      unsub();
    };
  }, [assignmentId, user?.uid]);

  const programDetails = assignment?.programDetails;
  const programTitle = assignment?.programTitle || programDetails?.title || 'Assigned Recovery Program';
  const doctorName = programDetails?.doctorName || 'Dr. Ananya Sharma';
  const description = programDetails?.description || `Personalized rehabilitation protocol assigned for ${assignment?.patientCondition || 'recovery'}.`;
  const currentWeek = assignment?.currentWeek || 1;
  const totalWeeks = assignment?.totalWeeks || programDetails?.weeks?.length || 8;
  const progressPercent = assignment?.progressPercent || 0;
  const completedSessions = assignment?.completedSessions || 0;
  const totalSessions = assignment?.totalSessions || 16;
  const completedExercises = assignment?.completedExercises || [];

  const weeksList: MobileProgramWeek[] = programDetails?.weeks && programDetails.weeks.length > 0
    ? programDetails.weeks
    : getDefaultWeeksForProgram(programTitle, `${totalWeeks} Weeks`);

  const data = Strings.recoveryProgramDetails;

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
        message: `Check out my ${programTitle} on ONE MEDICAL!`,
      });
    } catch (error) {
      Alert.alert('Share', `Sharing ${programTitle} details`);
    }
  };

  const toggleWeekExpand = (weekNum: number) => {
    setExpandedWeekNum((prev) => (prev === weekNum ? 0 : weekNum));
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
            <Ionicons name="arrow-back" size={22} color="#051A3E" />
          </TouchableOpacity>

          <Text style={styles.headerTitle} numberOfLines={1}>
            {programTitle}
          </Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleShare}
            style={styles.headerIconBtn}
            accessibilityLabel="Share program"
          >
            <Ionicons name="share-social-outline" size={22} color="#051A3E" />
          </TouchableOpacity>
        </View>

        {/* MAIN SCROLL CONTENT */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 110 + Math.max(insets.bottom, 12) },
          ]}
        >
          {assignmentLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#003D9B" />
              <Text style={styles.loadingText}>Loading configured program details...</Text>
            </View>
          ) : (
            <>
              {/* CARD 1: ASSIGNED PROGRAM HERO CARD */}
              <View style={styles.cardContainer}>
                {/* Status Badge */}
                <View style={styles.heroStatusRow}>
                  <View style={styles.statusBadgePill}>
                    <Ionicons name="checkmark-circle" size={14} color="#003D9B" style={{ marginRight: 4 }} />
                    <Text style={styles.statusBadgeText}>
                      {(assignment?.status || 'active').toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.difficultyBadge}>
                    {programDetails?.difficulty || 'Beginner'} Protocol
                  </Text>
                </View>

                {/* Program Title & Doctor */}
                <Text style={styles.programTitle}>{programTitle}</Text>
                <Text style={styles.programDescriptionText}>{description}</Text>

                <View style={styles.doctorRow}>
                  <Image
                    source={require('../../../assets/images/doctor_ananya.png')}
                    style={styles.doctorAvatarImage}
                    resizeMode="cover"
                  />
                  <View>
                    <Text style={styles.doctorName}>{doctorName}</Text>
                    <Text style={styles.doctorSubtext}>Prescribing Physiotherapist</Text>
                  </View>
                </View>

                {/* Progress Header Row */}
                <View style={styles.sessionHeaderRow}>
                  <Text style={styles.weekProgressText}>
                    Week {currentWeek} of {totalWeeks}
                  </Text>
                  <Text style={styles.sessionsProgressText}>
                    {progressPercent}% Complete ({completedSessions}/{totalSessions} Sessions)
                  </Text>
                </View>

                {/* Progress Track */}
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${Math.max(progressPercent, 2)}%` },
                    ]}
                  />
                </View>
              </View>

              {/* CARD 2: PROGRAM OVERVIEW & GOALS */}
              <View style={styles.cardContainer}>
                <View style={styles.overviewHeaderRow}>
                  <View style={styles.infoIconCircle}>
                    <Ionicons name="information-outline" size={20} color="#003D9B" />
                  </View>
                  <Text style={styles.overviewTitle}>Program Overview</Text>
                </View>

                <Text style={styles.overviewGoal}>
                  {programDetails?.targetCondition ? `Target Condition: ${programDetails.targetCondition}. ` : ''}
                  Designed to restore range of motion, build core stability, and enable safe return to daily activities.
                </Text>

                {/* 2x2 Details Grid */}
                <View style={styles.gridContainer}>
                  <View style={styles.gridBox}>
                    <Text style={styles.gridLabel}>Duration</Text>
                    <Text style={styles.gridValue}>{programDetails?.duration || `${totalWeeks} Weeks`}</Text>
                  </View>
                  <View style={styles.gridBox}>
                    <Text style={styles.gridLabel}>Difficulty</Text>
                    <Text style={[styles.gridValue, { color: '#0D9488' }]}>
                      {programDetails?.difficulty || 'Beginner'}
                    </Text>
                  </View>
                  <View style={styles.gridBox}>
                    <Text style={styles.gridLabel}>Target Area</Text>
                    <Text style={styles.gridValue}>{programDetails?.bodyAreaTag || 'General Rehab'}</Text>
                  </View>
                  <View style={styles.gridBox}>
                    <Text style={styles.gridLabel}>Total Exercises</Text>
                    <Text style={styles.gridValue}>
                      {weeksList.reduce((acc, w) => acc + (w.exercises?.length || 0), 0)} Prescribed
                    </Text>
                  </View>
                </View>
              </View>

              {/* CARD 3: CONFIGURED WEEKS & EXERCISES */}
              <View style={styles.weeksSectionContainer}>
                <Text style={styles.sectionHeaderTitle}>Program Weeks & Prescribed Exercises</Text>
                <Text style={styles.sectionSubtext}>
                  Configured by {doctorName} in the Admin Panel
                </Text>

                <View style={styles.weeksList}>
                  {weeksList.map((week) => {
                    const isCurrentWeek = week.weekNumber === currentWeek;
                    const isExpanded = expandedWeekNum === week.weekNumber;

                    return (
                      <View
                        key={week.weekNumber}
                        style={[
                          styles.weekCard,
                          isCurrentWeek && styles.activeWeekCardBorder,
                        ]}
                      >
                        {/* Week Header Accordion */}
                        <TouchableOpacity
                          activeOpacity={0.88}
                          onPress={() => toggleWeekExpand(week.weekNumber)}
                          style={styles.weekCardHeader}
                        >
                          <View style={styles.weekBadgeAndTitle}>
                            <View
                              style={[
                                styles.weekNumberCircle,
                                isCurrentWeek && styles.activeWeekNumberCircle,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.weekNumberText,
                                  isCurrentWeek && styles.activeWeekNumberText,
                                ]}
                              >
                                {week.weekNumber}
                              </Text>
                            </View>

                            <View style={styles.weekTitleGroup}>
                              <View style={styles.weekTitleRow}>
                                <Text style={styles.weekTitle}>Week {week.weekNumber}: {week.title}</Text>
                                {isCurrentWeek && (
                                  <View style={styles.currentWeekTag}>
                                    <Text style={styles.currentWeekTagText}>CURRENT</Text>
                                  </View>
                                )}
                              </View>
                              <Text style={styles.weekFocusText}>Focus: {week.clinicalFocus || 'Rehabilitation'}</Text>
                            </View>
                          </View>

                          <Ionicons
                            name={isExpanded ? 'chevron-up' : 'chevron-down'}
                            size={20}
                            color="#64748B"
                          />
                        </TouchableOpacity>

                        {/* Week Exercises (Expanded) */}
                        {isExpanded && (
                          <View style={styles.weekExpandedBody}>
                            {week.description && (
                              <Text style={styles.weekDescriptionText}>{week.description}</Text>
                            )}

                            <Text style={styles.exercisesSubtitle}>
                              PRESCRIBED EXERCISES ({week.exercises?.length || 0})
                            </Text>

                            <View style={styles.exercisesStack}>
                              {week.exercises?.map((ex, exIdx) => {
                                const isDone = completedExercises.includes(ex.id) || completedExercises.includes(ex.name);

                                return (
                                  <View key={ex.id || exIdx} style={styles.exerciseItemCard}>
                                    {/* Thumbnail Image */}
                                    <Image
                                      source={
                                        ex.image
                                          ? { uri: ex.image }
                                          : require('../../../assets/images/exercise_pelvic_tilt.png')
                                      }
                                      style={styles.exerciseImage}
                                      resizeMode="cover"
                                    />

                                    {/* Info Content */}
                                    <View style={styles.exerciseInfoContent}>
                                      <View style={styles.exerciseHeaderLine}>
                                        <Text style={styles.exerciseNameText}>{ex.name}</Text>
                                        {isDone && (
                                          <View style={styles.completedBadge}>
                                            <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
                                            <Text style={styles.completedBadgeText}>DONE</Text>
                                          </View>
                                        )}
                                      </View>

                                      {/* Sets, Reps, Rest */}
                                      <View style={styles.dosageRow}>
                                        <Text style={styles.dosageTag}>
                                          {ex.sets ? `${ex.sets} Sets` : ''} {ex.reps ? `× ${ex.reps}` : ''} {ex.duration ? `• ${ex.duration}` : ''}
                                        </Text>
                                        {ex.restTime && (
                                          <Text style={styles.restTag}>Rest: {ex.restTime}</Text>
                                        )}
                                      </View>

                                      {/* Instructions */}
                                      {ex.instructions && (
                                        <Text style={styles.instructionsText} numberOfLines={2}>
                                          {ex.instructions}
                                        </Text>
                                      )}
                                    </View>
                                  </View>
                                );
                              })}
                            </View>

                            {/* Start Session CTA for Week */}
                            {isCurrentWeek && (
                              <TouchableOpacity
                                activeOpacity={0.88}
                                style={styles.startWeekSessionBtn}
                                onPress={() =>
                                  router.push({
                                    pathname: '/active-session' as any,
                                    params: {
                                      exerciseIndex: '0',
                                      assignmentId: assignment?.id,
                                    },
                                  })
                                }
                              >
                                <Ionicons name="play" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                                <Text style={styles.startWeekSessionBtnText}>Start Week {week.weekNumber} Session</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* CARD 4: CLINICAL NOTES FROM DOCTOR */}
              <View style={styles.doctorNoteCard}>
                <View style={styles.noteHeaderRow}>
                  <Image
                    source={require('../../../assets/images/doctor_ananya.png')}
                    style={styles.noteDoctorAvatar}
                    resizeMode="cover"
                  />
                  <Text style={styles.noteTitle}>Note from {doctorName}</Text>
                </View>

                <Text style={styles.noteQuote}>
                  &ldquo;Consistency and steady form are key to full recovery. If you experience discomfort sharp score &gt; 4/10 during any drill, pause and rest immediately.&rdquo;
                </Text>

                <Text style={styles.noteFooter}>Configured for Patient Care Plan</Text>
              </View>
            </>
          )}
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
    backgroundColor: '#F8FAFC',
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
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
    textAlign: 'center',
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },

  /* CARD GENERAL */
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 20,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 3,
  },

  /* HERO STATUS & CONTENT */
  heroStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: '#0284C7',
    letterSpacing: 0.6,
  },
  difficultyBadge: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold,
    color: '#0D9488',
  },
  programTitle: {
    fontSize: 24,
    fontWeight: Typography.fontWeight.bold,
    color: '#051A3E',
    lineHeight: 30,
    marginBottom: 8,
  },
  programDescriptionText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 16,
  },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
  },
  doctorAvatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  doctorName: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.bold,
    color: '#051A3E',
  },
  doctorSubtext: {
    fontSize: 12,
    color: '#64748B',
  },
  sessionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  weekProgressText: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.bold,
    color: '#051A3E',
  },
  sessionsProgressText: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },
  progressTrack: {
    height: 10,
    backgroundColor: '#E2E8F0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#003D9B',
    borderRadius: 5,
  },

  /* OVERVIEW CARD */
  overviewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  infoIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EBF5FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.bold,
    color: '#051A3E',
  },
  overviewGoal: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 18,
  },

  /* 2x2 GRID */
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridBox: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  gridLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: Typography.fontWeight.medium,
    marginBottom: 4,
  },
  gridValue: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.bold,
    color: '#051A3E',
  },

  /* WEEKS & EXERCISES SECTION */
  weeksSectionContainer: {
    marginBottom: Spacing.xl,
  },
  sectionHeaderTitle: {
    fontSize: 20,
    fontWeight: Typography.fontWeight.bold,
    color: '#051A3E',
    marginBottom: 4,
  },
  sectionSubtext: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
  },
  weeksList: {
    gap: 14,
  },
  weekCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  activeWeekCardBorder: {
    borderColor: '#003D9B',
    borderWidth: 1.5,
  },
  weekCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  weekBadgeAndTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  weekNumberCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeWeekNumberCircle: {
    backgroundColor: '#003D9B',
  },
  weekNumberText: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.bold,
    color: '#334155',
  },
  activeWeekNumberText: {
    color: '#FFFFFF',
  },
  weekTitleGroup: {
    flex: 1,
  },
  weekTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    color: '#051A3E',
  },
  currentWeekTag: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  currentWeekTagText: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    color: '#0D9488',
    letterSpacing: 0.5,
  },
  weekFocusText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  weekExpandedBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 14,
  },
  weekDescriptionText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 14,
  },
  exercisesSubtitle: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  exercisesStack: {
    gap: 12,
  },
  exerciseItemCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  exerciseImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
  exerciseInfoContent: {
    flex: 1,
    justifyContent: 'center',
  },
  exerciseHeaderLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  exerciseNameText: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.bold,
    color: '#051A3E',
    flex: 1,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  completedBadgeText: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    color: '#16A34A',
  },
  dosageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  dosageTag: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.bold,
    color: '#0284C7',
  },
  restTag: {
    fontSize: 12,
    color: '#64748B',
  },
  instructionsText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },
  startWeekSessionBtn: {
    height: 48,
    borderRadius: 9999,
    backgroundColor: '#003D9B',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  startWeekSessionBtnText: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
  },

  /* DOCTOR NOTE */
  doctorNoteCard: {
    backgroundColor: '#ECFEFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    marginBottom: Spacing.xl,
  },
  noteHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  noteDoctorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#99F6E4',
  },
  noteTitle: {
    fontSize: 17,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F766E',
  },
  noteQuote: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
    fontStyle: 'italic',
    marginBottom: 14,
  },
  noteFooter: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F766E',
  },

  /* LOADING */
  loadingBox: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.medium,
    color: '#64748B',
    marginTop: 12,
  },
});

export default RecoveryProgramDetailsScreen;
