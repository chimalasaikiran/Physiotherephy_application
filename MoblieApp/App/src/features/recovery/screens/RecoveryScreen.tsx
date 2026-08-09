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
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';
import { Strings } from '@/constants';
import { BottomNavBar, TabKey } from '@/components';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AchievementItem {
  id: string;
  title: string;
  iconName: keyof typeof Ionicons.glyphMap;
  badgeBg: string;
  iconColor: string;
}

interface DayActivity {
  day: string;
  completedHeight: number; // percentage 0 - 100
  pendingHeight: number;   // percentage 0 - 100
  status: 'completed' | 'partial' | 'pending';
}

interface RecoveryScreenProps {
  hideBottomNavBar?: boolean;
  onTabPress?: (tab: TabKey) => void;
}

export const RecoveryScreen: React.FC<RecoveryScreenProps> = ({ hideBottomNavBar = false, onTabPress }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeNavTab, setActiveNavTab] = useState<TabKey>('recovery');

  const recoveryData = Strings.recoveryDashboard;

  const handleNavTabPress = (tab: TabKey) => {
    setActiveNavTab(tab);
    if (onTabPress) {
      onTabPress(tab);
      return;
    }
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

  const achievements: AchievementItem[] = [
    {
      id: 'streak',
      title: '7 Day Streak',
      iconName: 'flame',
      badgeBg: '#FFEDD5',
      iconColor: '#F97316',
    },
    {
      id: 'sessions',
      title: '25 Sessions',
      iconName: 'ribbon',
      badgeBg: '#E0F2FE',
      iconColor: '#0284C7',
    },
    {
      id: 'milestone',
      title: 'Milestone',
      iconName: 'star',
      badgeBg: '#FEF3C7',
      iconColor: '#F59E0B',
    },
    {
      id: 'top_performer',
      title: 'Top 10%',
      iconName: 'trophy',
      badgeBg: '#F3E8FF',
      iconColor: '#9333EA',
    },
  ];

  const weeklyDays: DayActivity[] = [
    { day: 'Mon', completedHeight: 85, pendingHeight: 0, status: 'completed' },
    { day: 'Tue', completedHeight: 95, pendingHeight: 0, status: 'completed' },
    { day: 'Wed', completedHeight: 75, pendingHeight: 0, status: 'completed' },
    { day: 'Thu', completedHeight: 90, pendingHeight: 0, status: 'completed' },
    { day: 'Fri', completedHeight: 65, pendingHeight: 25, status: 'partial' },
    { day: 'Sat', completedHeight: 45, pendingHeight: 40, status: 'partial' },
    { day: 'Sun', completedHeight: 0, pendingHeight: 80, status: 'pending' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.container}>
        {/* MAIN SCROLLABLE CONTENT */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 16) + 12,
              paddingBottom: 110 + Math.max(insets.bottom, 12),
            },
          ]}
          bounces={true}
        >
          {/* 1. HEADER SECTION */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Image
                source={require('../../../assets/images/user_sagar_avatar.png')}
                style={styles.avatarImage}
                resizeMode="cover"
              />
              <View style={styles.headerTextGroup}>
                <Text style={styles.greetingText}>{recoveryData.greeting}</Text>
                <Text style={styles.subGreetingText}>{recoveryData.subtitle}</Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.bellButton}
              onPress={() => router.push('/notifications')}
            >
              <Ionicons name="notifications-outline" size={22} color="#1E293B" />
              <View style={styles.notificationBadgeDot} />
            </TouchableOpacity>
          </View>

          {/* 2. GRADIENT CARD: WEEK 4 OF RECOVERY */}
          <TouchableOpacity
            activeOpacity={0.92}
            onPress={() => router.push('/recovery-progress' as any)}
          >
            <LinearGradient
              colors={['#003D9B', '#005F9E', '#007A8C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.recoveryBannerCard}
            >
              {/* Top Improvement Badge */}
              <View style={styles.improvementBadge}>
                <Ionicons name="trending-up" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.improvementBadgeText}>
                  {recoveryData.banner.improvementBadge}
                </Text>
              </View>

              <Text style={styles.bannerTitle}>{recoveryData.banner.title}</Text>
              <Text style={styles.bannerDescription}>{recoveryData.banner.description}</Text>

              {/* CIRCULAR RECOVERY METER */}
              <View style={styles.ringGaugeWrapper}>
                <View style={styles.outerRing}>
                  <View style={styles.innerRingContent}>
                    <Text style={styles.ringScoreText}>{recoveryData.banner.overallScore}</Text>
                    <Text style={styles.ringLabelText}>{recoveryData.banner.overallLabel}</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* 3. TODAY'S SESSION */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{recoveryData.todaysSession.title}</Text>
            
            <TouchableOpacity
              activeOpacity={0.92}
              style={styles.todaySessionCard}
              onPress={() => router.push('/today-session' as any)}
            >
              <View style={styles.dumbbellIconCircle}>
                <Ionicons name="barbell-outline" size={26} color={Colors.primary} />
              </View>

              <Text style={styles.sessionTitle}>{recoveryData.todaysSession.sessionTitle}</Text>

              <View style={styles.sessionMetaRow}>
                <View style={styles.metaBadge}>
                  <Ionicons name="barbell" size={14} color="#64748B" />
                  <Text style={styles.metaText}>{recoveryData.todaysSession.exercisesCount}</Text>
                </View>
                <View style={styles.metaDot} />
                <View style={styles.metaBadge}>
                  <Ionicons name="time-outline" size={14} color="#64748B" />
                  <Text style={styles.metaText}>{recoveryData.todaysSession.duration}</Text>
                </View>
                <View style={styles.metaDot} />
                <View style={styles.metaBadge}>
                  <Ionicons name="stats-chart-outline" size={14} color="#64748B" />
                  <Text style={styles.metaText}>{recoveryData.todaysSession.level}</Text>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.88}
                style={styles.startSessionButton}
                onPress={() => router.push('/today-session' as any)}
              >
                <Ionicons name="play" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.startSessionButtonText}>
                  {recoveryData.todaysSession.startButton}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>

          {/* 4. CURRENT PROGRAM */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>{recoveryData.currentProgram.title}</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push('/my-recovery-programs' as any)}
              >
                <Text style={styles.viewProgramLink}>{recoveryData.currentProgram.viewProgram}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.programCard}
              onPress={() => router.push('/recovery-program-details' as any)}
            >
              <View style={styles.programTopRow}>
                <Image
                  source={require('../../../assets/images/doctor_ananya.png')}
                  style={styles.doctorAvatar}
                  resizeMode="cover"
                />
                <View style={styles.programTextGroup}>
                  <Text style={styles.programTitleText}>{recoveryData.currentProgram.programTitle}</Text>
                  <Text style={styles.specialistText}>{recoveryData.currentProgram.specialist}</Text>
                </View>
              </View>

              <View style={styles.progressInfoRow}>
                <Text style={styles.progressSessionsText}>
                  {recoveryData.currentProgram.sessionsCompleted}
                </Text>
                <Text style={styles.progressPercentText}>
                  {recoveryData.currentProgram.progressPercent}
                </Text>
              </View>

              <View style={styles.progressBarTrack}>
                <View style={[styles.progressBarFill, { width: '75%' }]} />
              </View>
            </TouchableOpacity>
          </View>

          {/* 5. ACHIEVEMENTS */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{recoveryData.achievements.title}</Text>
            
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.achievementsScrollList}
            >
              {achievements.map((item) => (
                <View key={item.id} style={styles.achievementCard}>
                  <View style={[styles.achievementIconCircle, { backgroundColor: item.badgeBg }]}>
                    <Ionicons name={item.iconName} size={24} color={item.iconColor} />
                  </View>
                  <Text style={styles.achievementTitle}>{item.title}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* 6. WEEKLY ACTIVITY */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{recoveryData.weeklyActivity.title}</Text>
            
            <View style={styles.weeklyActivityCard}>
              {/* Legend Row */}
              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
                  <Text style={styles.legendText}>{recoveryData.weeklyActivity.completedLabel}</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#DBEAFE' }]} />
                  <Text style={styles.legendText}>{recoveryData.weeklyActivity.pendingLabel}</Text>
                </View>
              </View>

              {/* Bar Chart Container */}
              <View style={styles.chartContainer}>
                {weeklyDays.map((item) => (
                  <View key={item.day} style={styles.chartColumn}>
                    <View style={styles.barStackWrapper}>
                      {/* Pending Top Portion */}
                      {item.pendingHeight > 0 && (
                        <View
                          style={[
                            styles.pendingBar,
                            { height: `${item.pendingHeight}%` },
                            item.completedHeight === 0 && styles.fullRoundedBar,
                          ]}
                        />
                      )}
                      {/* Completed Bottom Portion */}
                      {item.completedHeight > 0 && (
                        <View
                          style={[
                            styles.completedBar,
                            { height: `${item.completedHeight}%` },
                            item.pendingHeight === 0 && styles.fullRoundedBar,
                          ]}
                        />
                      )}
                    </View>
                    <Text style={styles.dayLabelText}>{item.day}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* BOTTOM SPACING */}
          <View style={{ height: 20 }} />
        </ScrollView>

        {/* 7. BOTTOM NAVIGATION MENU BAR */}
        {!hideBottomNavBar && <BottomNavBar activeTab={activeNavTab} onTabPress={handleNavTabPress} />}
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
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },

  /* HEADER */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  headerTextGroup: {
    justifyContent: 'center',
  },
  greetingText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: '#051A3E',
  },
  subGreetingText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.regular,
    color: '#64748B',
    marginTop: 2,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEF2F6',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  notificationBadgeDot: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },

  /* RECOVERY BANNER CARD */
  recoveryBannerCard: {
    borderRadius: 28,
    padding: 24,
    marginBottom: Spacing.xl,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  improvementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  improvementBadgeText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  bannerTitle: {
    fontSize: 28,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  bannerDescription: {
    fontSize: Typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.88)',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
    marginBottom: 24,
  },

  /* RING GAUGE */
  ringGaugeWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 10,
    borderColor: '#38BDF8', // Cyan glowing ring
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  innerRingContent: {
    alignItems: 'center',
  },
  ringScoreText: {
    fontSize: 34,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  ringLabelText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.semiBold,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: -2,
    letterSpacing: 0.5,
  },

  /* SECTION */
  sectionContainer: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: '#051A3E',
    marginBottom: Spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  viewProgramLink: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },

  /* TODAY'S SESSION CARD */
  todaySessionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  dumbbellIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  sessionTitle: {
    fontSize: 22,
    fontWeight: Typography.fontWeight.bold,
    color: '#051A3E',
    marginBottom: 10,
  },
  sessionMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.medium,
    color: '#64748B',
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
  },
  startSessionButton: {
    height: 48,
    borderRadius: 9999,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  startSessionButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
  },

  /* CURRENT PROGRAM CARD */
  programCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  programTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  doctorAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  programTextGroup: {
    flex: 1,
  },
  programTitleText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: '#051A3E',
    marginBottom: 4,
  },
  specialistText: {
    fontSize: Typography.fontSize.xs,
    color: '#64748B',
  },
  progressInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressSessionsText: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.bold,
    color: '#475569',
  },
  progressPercentText: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },

  /* ACHIEVEMENTS CAROUSEL */
  achievementsScrollList: {
    gap: 12,
    paddingRight: Spacing.xl,
  },
  achievementCard: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  achievementIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  achievementTitle: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.bold,
    color: '#051A3E',
    textAlign: 'center',
  },

  /* WEEKLY ACTIVITY */
  weeklyActivityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.medium,
    color: '#475569',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
    paddingTop: 10,
  },
  chartColumn: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  barStackWrapper: {
    width: 16,
    height: 110,
    justifyContent: 'flex-end',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  completedBar: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  pendingBar: {
    width: '100%',
    backgroundColor: '#DBEAFE',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  fullRoundedBar: {
    borderRadius: 8,
  },
  dayLabelText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.medium,
    color: '#64748B',
  },
});

export default RecoveryScreen;
