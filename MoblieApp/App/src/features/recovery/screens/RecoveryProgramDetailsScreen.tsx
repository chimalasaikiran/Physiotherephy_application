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
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';
import { Strings } from '@/constants';
import { BottomNavBar, TabKey } from '@/components';

export const RecoveryProgramDetailsScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeNavTab, setActiveNavTab] = useState<TabKey>('recovery');

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
        message: 'Check out my Lower Back Rehabilitation program on ONE MEDICAL!',
      });
    } catch (error) {
      Alert.alert('Share', 'Sharing Lower Back Rehabilitation Program details');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.container}>
        {/* HEADER BAR */}
        <View
          style={[
            styles.header,
            {
              paddingTop:
                Math.max(
                  insets.top,
                  Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 16
                ) + 4,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            style={styles.headerIconBtn}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color="#051A3E" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>{data.headerTitle}</Text>

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
          {/* CARD 1: CURRENT PROGRAM HERO CARD */}
          <View style={styles.cardContainer}>
            {/* Anatomical Graphic Box */}
            <View style={styles.anatomicalBox}>
              <Text style={styles.anatomicalTopHeader}>
                {data.anatomical.header}
              </Text>
              
              {/* Image Graphic */}
              <View style={styles.imageWrapper}>
                <Image
                  source={require('../../../assets/images/spine_anatomy_focus.png')}
                  style={styles.spineAnatomyImage}
                  resizeMode="contain"
                />

                {/* Annotation Badges overlay */}
                <View style={[styles.annotationBadge, { top: 35, left: 8 }]}>
                  <Text style={styles.annotationText}>Lumbar Vertebrae (L3)</Text>
                </View>
                <View style={[styles.annotationBadge, { top: 35, right: 8 }]}>
                  <Text style={styles.annotationText}>Erector Spinae Muscles</Text>
                </View>
                <View style={[styles.annotationBadge, { top: 80, left: 12 }]}>
                  <Text style={styles.annotationText}>Intervertebral Disc</Text>
                </View>
                <View style={[styles.annotationBadge, { top: 85, right: 16 }]}>
                  <Text style={styles.annotationText}>Sacrum</Text>
                </View>
                <View style={[styles.annotationBadge, { top: 125, right: 12 }]}>
                  <Text style={styles.annotationText}>Quadratus Lumborum</Text>
                </View>
              </View>

              {/* Anatomical Text Box */}
              <View style={styles.anatomicalContent}>
                <Text style={styles.anatomicalTitle}>
                  {data.anatomical.title}
                </Text>
                <Text style={styles.anatomicalFocus}>
                  {data.anatomical.anatomicalFocus}
                </Text>
                <Text style={styles.anatomicalDescription}>
                  {data.anatomical.focusDescription}
                </Text>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    Alert.alert(
                      'Spine & Lower Back Exercises',
                      '1. Cat-Cow Stretch\n2. Pelvic Tilts\n3. Bird-Dog Movement\n4. Glute Bridges\n5. Lumbar Rotation'
                    )
                  }
                  style={styles.viewExercisesBtn}
                >
                  <Text style={styles.viewExercisesText}>
                    {data.anatomical.viewExercises}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Current Program Tag */}
            <Text style={styles.currentProgramBadge}>
              {data.currentProgramBadge}
            </Text>

            {/* Program Title */}
            <Text style={styles.programTitle}>
              Lower Back{'\n'}Rehabilitation
            </Text>

            {/* Doctor Info */}
            <View style={styles.doctorRow}>
              <View style={styles.doctorAvatarCircle}>
                <Ionicons name="person" size={16} color="#0284C7" />
              </View>
              <Text style={styles.doctorName}>{data.doctorName}</Text>
            </View>

            {/* Session Header Row */}
            <View style={styles.sessionHeaderRow}>
              <Text style={styles.weekProgressText}>{data.weekProgress}</Text>
              <Text style={styles.sessionsProgressText}>
                {data.sessionsProgress}
              </Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: '75%' }]} />
            </View>
          </View>

          {/* CARD 2: PROGRAM OVERVIEW CARD */}
          <View style={styles.cardContainer}>
            {/* Header with info icon */}
            <View style={styles.overviewHeaderRow}>
              <View style={styles.infoIconCircle}>
                <Ionicons name="information-outline" size={20} color="#003D9B" />
              </View>
              <Text style={styles.overviewTitle}>{data.overview.title}</Text>
            </View>

            <Text style={styles.overviewGoal}>{data.overview.goal}</Text>

            {/* 2x2 Details Grid */}
            <View style={styles.gridContainer}>
              {/* Box 1 */}
              <View style={styles.gridBox}>
                <Text style={styles.gridLabel}>
                  {data.overview.completionLabel}
                </Text>
                <Text style={styles.gridValue}>
                  {data.overview.completionValue}
                </Text>
              </View>

              {/* Box 2 */}
              <View style={styles.gridBox}>
                <Text style={styles.gridLabel}>
                  {data.overview.difficultyLabel}
                </Text>
                <Text style={[styles.gridValue, { color: '#0D9488' }]}>
                  {data.overview.difficultyValue}
                </Text>
              </View>

              {/* Box 3 */}
              <View style={styles.gridBox}>
                <Text style={styles.gridLabel}>
                  {data.overview.frequencyLabel}
                </Text>
                <Text style={styles.gridValue}>
                  {data.overview.frequencyValue}
                </Text>
              </View>

              {/* Box 4 */}
              <View style={styles.gridBox}>
                <Text style={styles.gridLabel}>
                  {data.overview.intensityLabel}
                </Text>
                <Text style={styles.gridValue}>
                  {data.overview.intensityValue}
                </Text>
              </View>
            </View>
          </View>

          {/* CARD 3: TODAY'S SESSION CARD */}
          <View style={styles.todaySessionCard}>
            <View style={styles.todaySessionHeader}>
              <Text style={styles.todaySessionTitle}>
                {data.todaysSession.title}
              </Text>
              <View style={styles.activeBadgeTag}>
                <Text style={styles.activeBadgeText}>
                  {data.todaysSession.activeBadge}
                </Text>
              </View>
            </View>

            {/* Details with icons */}
            <View style={styles.todayMetaRow}>
              <View style={styles.todayMetaItem}>
                <Ionicons name="barbell-outline" size={16} color="#FFFFFF" />
                <Text style={styles.todayMetaText}>
                  {data.todaysSession.exercisesCount}
                </Text>
              </View>

              <View style={styles.todayMetaItem}>
                <Ionicons name="time-outline" size={16} color="#FFFFFF" />
                <Text style={styles.todayMetaText}>
                  {data.todaysSession.duration}
                </Text>
              </View>
            </View>

            <View style={styles.todayMetaRow}>
              <View style={styles.todayMetaItem}>
                <Ionicons name="flash-outline" size={16} color="#FFFFFF" />
                <Text style={styles.todayMetaText}>
                  {data.todaysSession.intensity}
                </Text>
              </View>
            </View>

            {/* Button */}
            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.startTodayBtn}
              onPress={() => router.push('/today-session' as any)}
            >
              <Text style={styles.startTodayBtnText}>
                {data.todaysSession.startButton}
              </Text>
              <Ionicons
                name="play"
                size={14}
                color="#003D9B"
                style={{ marginLeft: 6 }}
              />
            </TouchableOpacity>
          </View>

          {/* SECTION: RECOVERY ROADMAP */}
          <View style={styles.roadmapSection}>
            <Text style={styles.sectionHeaderTitle}>{data.roadmap.title}</Text>

            <View style={styles.roadmapTimeline}>
              {/* Item 1: Week 1: Fundamentals (Completed) */}
              <View style={styles.roadmapRow}>
                <View style={styles.timelineLeftColumn}>
                  <View style={styles.completedCircle}>
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  </View>
                  <View style={styles.verticalLine} />
                </View>
                <View style={styles.timelineRightContent}>
                  <Text style={styles.roadmapItemTitle}>
                    Week 1: Fundamentals
                  </Text>
                  <Text style={styles.roadmapItemDesc}>
                    Core activation and basic flexibility work.
                  </Text>
                </View>
              </View>

              {/* Item 2: Week 2: Mobility Focus (Active In Progress) */}
              <View style={styles.roadmapRow}>
                <View style={styles.timelineLeftColumn}>
                  <View style={styles.activeCircle}>
                    <Ionicons name="hourglass-outline" size={16} color="#FFFFFF" />
                  </View>
                  <View style={styles.verticalLine} />
                </View>

                {/* Highlighted container for active week */}
                <View style={[styles.timelineRightContent, styles.activeWeekCard]}>
                  <Text style={styles.activeWeekTitle}>
                    Week 2: Mobility Focus
                  </Text>
                  <Text style={styles.activeWeekDesc}>
                    Improving range of motion in the lumbar spine.
                  </Text>
                  <View style={styles.inProgressBadge}>
                    <Text style={styles.inProgressBadgeText}>IN PROGRESS</Text>
                  </View>
                </View>
              </View>

              {/* Item 3: Weeks 3-5: Strengthening (Locked) */}
              <View style={styles.roadmapRow}>
                <View style={styles.timelineLeftColumn}>
                  <View style={styles.lockedCircle}>
                    <Ionicons name="lock-closed-outline" size={16} color="#64748B" />
                  </View>
                  <View style={styles.verticalLine} />
                </View>
                <View style={styles.timelineRightContent}>
                  <Text style={styles.roadmapItemTitle}>
                    Weeks 3-5: Strengthening
                  </Text>
                  <Text style={styles.roadmapItemDesc}>
                    Advanced core stability and functional loading.
                  </Text>
                </View>
              </View>

              {/* Item 4: Week 6: Graduation (Trophy) */}
              <View style={styles.roadmapRow}>
                <View style={styles.timelineLeftColumn}>
                  <View style={styles.trophyCircle}>
                    <Ionicons name="trophy-outline" size={16} color="#FFFFFF" />
                  </View>
                </View>
                <View style={styles.timelineRightContent}>
                  <Text style={[styles.roadmapItemTitle, { color: '#6D28D9' }]}>
                    Week 6: Graduation
                  </Text>
                  <Text style={styles.roadmapItemDesc}>
                    Final assessment and maintenance planning.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* SECTION: NOTE FROM DR. IYER */}
          <View style={styles.doctorNoteCard}>
            <View style={styles.noteHeaderRow}>
              <Image
                source={require('../../../assets/images/doctor_ananya.png')}
                style={styles.noteDoctorAvatar}
                resizeMode="cover"
              />
              <Text style={styles.noteTitle}>{data.doctorNote.title}</Text>
            </View>

            <Text style={styles.noteQuote}>{data.doctorNote.quote}</Text>

            <Text style={styles.noteFooter}>{data.doctorNote.postedTime}</Text>
          </View>
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
    fontSize: 20,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
    textAlign: 'center',
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

  /* ANATOMICAL BOX */
  anatomicalBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  anatomicalTopHeader: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  imageWrapper: {
    height: 230,
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  spineAnatomyImage: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },
  annotationBadge: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#CBD5E1',
  },
  annotationText: {
    fontSize: 9,
    color: '#475569',
    fontWeight: Typography.fontWeight.medium,
  },
  anatomicalContent: {
    alignItems: 'center',
  },
  anatomicalTitle: {
    fontSize: 20,
    fontWeight: Typography.fontWeight.bold,
    color: '#051A3E',
    textAlign: 'center',
    marginBottom: 4,
  },
  anatomicalFocus: {
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 6,
  },
  anatomicalDescription: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  viewExercisesBtn: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  viewExercisesText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
    textDecorationLine: 'underline',
  },

  /* CURRENT PROGRAM CARD DETAILS */
  currentProgramBadge: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
    letterSpacing: 1,
    marginBottom: 8,
  },
  programTitle: {
    fontSize: 28,
    fontWeight: Typography.fontWeight.bold,
    color: '#051A3E',
    lineHeight: 34,
    marginBottom: 14,
  },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  doctorAvatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorName: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.medium,
    color: '#475569',
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
    fontSize: 14,
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
    fontSize: 22,
    fontWeight: Typography.fontWeight.bold,
    color: '#051A3E',
  },
  overviewGoal: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 20,
  },
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
    marginBottom: 4,
    fontWeight: Typography.fontWeight.medium,
  },
  gridValue: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.bold,
    color: '#051A3E',
  },

  /* TODAY'S SESSION CARD */
  todaySessionCard: {
    backgroundColor: '#003D9B',
    borderRadius: 28,
    padding: 24,
    marginBottom: Spacing.xl,
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  todaySessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  todaySessionTitle: {
    fontSize: 22,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  activeBadgeTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  todayMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 10,
  },
  todayMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  todayMetaText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: Typography.fontWeight.medium,
  },
  startTodayBtn: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 9999,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  startTodayBtnText: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },

  /* RECOVERY ROADMAP */
  roadmapSection: {
    marginBottom: Spacing.xl,
  },
  sectionHeaderTitle: {
    fontSize: 22,
    fontWeight: Typography.fontWeight.bold,
    color: '#051A3E',
    marginBottom: 18,
  },
  roadmapTimeline: {
    paddingLeft: 4,
  },
  roadmapRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineLeftColumn: {
    width: 44,
    alignItems: 'center',
  },
  completedCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0D9488',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  activeCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#003D9B',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  lockedCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  trophyCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6D28D9',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  verticalLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#CBD5E1',
    marginTop: -4,
    marginBottom: -4,
  },
  timelineRightContent: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: 'center',
  },
  roadmapItemTitle: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    color: '#051A3E',
    marginBottom: 4,
  },
  roadmapItemDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  activeWeekCard: {
    backgroundColor: '#DBEAFE',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  activeWeekTitle: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
    marginBottom: 4,
  },
  activeWeekDesc: {
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
    marginBottom: 10,
  },
  inProgressBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#C7D2FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  inProgressBadgeText: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    color: '#1E40AF',
    letterSpacing: 0.6,
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
});

export default RecoveryProgramDetailsScreen;
