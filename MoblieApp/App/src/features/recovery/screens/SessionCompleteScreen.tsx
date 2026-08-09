import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';
import { Strings } from '@/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface SessionCompleteScreenProps {
  completedCount?: number;
  totalCount?: number;
  durationText?: string;
  streakText?: string;
  recoveryText?: string;
  recoveryBadgeText?: string;
  therapistNoteText?: string;
  onBackToDashboard?: () => void;
  onViewProgress?: () => void;
}

export const SessionCompleteScreen: React.FC<SessionCompleteScreenProps> = ({
  completedCount,
  totalCount,
  durationText,
  streakText,
  recoveryText,
  recoveryBadgeText,
  therapistNoteText,
  onBackToDashboard,
  onViewProgress,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  // Dynamic parameters with Figma default values
  const sStrings = Strings.sessionComplete || {};
  const exercisesDisplay =
    completedCount && totalCount
      ? `${completedCount} of ${totalCount}`
      : (params.exercises as string) || sStrings.exercisesValue || '5 of 5';

  const durationDisplay =
    durationText || (params.duration as string) || sStrings.durationValue || '22 Minutes';

  const streakDisplay =
    streakText || (params.streak as string) || sStrings.streakValue || '8 Days';

  const recoveryDisplay =
    recoveryText || (params.recovery as string) || sStrings.recoveryValue || '72%';

  const badgeDisplay =
    recoveryBadgeText || (params.badge as string) || sStrings.recoveryBadge || '+2% Today';

  const noteDisplay =
    therapistNoteText ||
    (params.note as string) ||
    sStrings.therapistNoteText ||
    "Excellent work today! Remember to stay hydrated and continue with tomorrow's session.";

  const achievements = sStrings.achievements || [
    { id: 'streak', icon: '🔥', title: '7-Day Streak' },
    { id: 'master', icon: '🏆', title: 'Session Master' },
    { id: 'milestone', icon: '💪', title: 'Recovery Milestone' },
  ];

  const handleBackToDashboard = () => {
    if (onBackToDashboard) {
      onBackToDashboard();
    } else {
      router.replace('/recovery');
    }
  };

  const handleViewProgress = () => {
    if (onViewProgress) {
      onViewProgress();
    } else {
      router.push('/recovery-progress' as any);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 12 : 16,
            paddingBottom: Math.max(insets.bottom, 20) + 16,
          },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* 1. TOP HERO CELEBRATION ICON & HEADINGS */}
        <View style={styles.heroSection}>
          <View style={styles.checkBadgeOuter}>
            <View style={styles.checkBadgeInner}>
              <Ionicons name="checkmark" size={38} color="#FFFFFF" style={{ fontWeight: 'bold' }} />
            </View>
          </View>

          <Text style={styles.titleText}>{sStrings.title || 'Session Complete! 🎉'}</Text>
          <Text style={styles.subtitleText}>
            {sStrings.subtitle || "Amazing work! You've completed today's recovery session."}
          </Text>
        </View>

        {/* 2. STATS & METRICS SUMMARY CARD (2x2 GRID) */}
        <View style={styles.statsCard}>
          {/* TOP ROW: EXERCISES & DURATION */}
          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>
                {sStrings.exercisesLabel || 'EXERCISES'}
              </Text>
              <Text style={styles.statValue}>{exercisesDisplay}</Text>
            </View>

            <View style={styles.statCol}>
              <Text style={styles.statLabel}>
                {sStrings.durationLabel || 'DURATION'}
              </Text>
              <Text style={styles.statValue}>{durationDisplay}</Text>
            </View>
          </View>

          <View style={styles.gridDivider} />

          {/* BOTTOM ROW: STREAK & RECOVERY */}
          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>
                {sStrings.streakLabel || 'STREAK'}
              </Text>
              <Text style={styles.statValue}>{streakDisplay}</Text>
            </View>

            <View style={styles.statCol}>
              <Text style={styles.statLabel}>
                {sStrings.recoveryLabel || 'RECOVERY'}
              </Text>
              <View style={styles.recoveryValueRow}>
                <Text style={styles.statValue}>{recoveryDisplay}</Text>
                <View style={styles.recoveryBadgePill}>
                  <Text style={styles.recoveryBadgeText}>{badgeDisplay}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 3. NEW ACHIEVEMENTS SECTION */}
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionTitle}>
            {sStrings.newAchievementsTitle || 'NEW ACHIEVEMENTS'}
          </Text>
        </View>

        {/* ACHIEVEMENTS CARDS ROW */}
        <View style={styles.achievementsRow}>
          {achievements.map((item: any) => (
            <View key={item.id} style={styles.achievementCard}>
              <Text style={styles.achievementEmoji}>{item.icon}</Text>
              <Text style={styles.achievementTitle} numberOfLines={2}>
                {item.title}
              </Text>
            </View>
          ))}
        </View>

        {/* 4. THERAPIST NOTE CARD */}
        <View style={styles.therapistNoteCard}>
          <View style={styles.therapistIconCircle}>
            <Ionicons name="chatbubble-ellipses" size={20} color="#FFFFFF" />
          </View>

          <View style={styles.therapistNoteContent}>
            <Text style={styles.therapistNoteTitle}>
              {sStrings.therapistNoteTitle || 'Note from Therapist'}
            </Text>
            <Text style={styles.therapistNoteBody}>{noteDisplay}</Text>
          </View>
        </View>

        {/* 5. ACTION BUTTONS */}
        <View style={styles.actionButtonsContainer}>
          {/* PRIMARY BUTTON */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleBackToDashboard}
            style={styles.primaryBtn}
            accessibilityLabel="Back to Recovery Dashboard"
            accessibilityRole="button"
          >
            <Text style={styles.primaryBtnText}>
              {sStrings.backToDashboardBtn || 'Back to Recovery Dashboard'}
            </Text>
          </TouchableOpacity>

          {/* SECONDARY OUTLINE BUTTON */}
          <TouchableOpacity
            activeOpacity={0.82}
            onPress={handleViewProgress}
            style={styles.secondaryBtn}
            accessibilityLabel="View Recovery Progress"
            accessibilityRole="button"
          >
            <Text style={styles.secondaryBtnText}>
              {sStrings.viewProgressBtn || 'View Recovery Progress'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFCFF',
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    flexGrow: 1,
  },

  /* 1. HERO CELEBRATION */
  heroSection: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  checkBadgeOuter: {
    marginBottom: 20,
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  checkBadgeInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#003D9B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 26,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  subtitleText: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.medium,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.md,
  },

  /* 2. STATS CARD (2x2 GRID) */
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 22,
    paddingHorizontal: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  statCol: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold,
    color: '#94A3B8',
    letterSpacing: 0.9,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 21,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
  },
  gridDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 18,
  },
  recoveryValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  recoveryBadgePill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  recoveryBadgeText: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: '#15803D',
  },

  /* 3. NEW ACHIEVEMENTS */
  sectionHeaderContainer: {
    marginBottom: 12,
    paddingLeft: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold,
    color: '#94A3B8',
    letterSpacing: 1.0,
    textTransform: 'uppercase',
  },
  achievementsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 24,
  },
  achievementCard: {
    flex: 1,
    height: 105,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  achievementEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold,
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 15,
  },

  /* 4. THERAPIST NOTE CARD */
  therapistNoteCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    marginBottom: 28,
  },
  therapistIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#003D9B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  therapistNoteContent: {
    flex: 1,
    marginLeft: 14,
  },
  therapistNoteTitle: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
    marginBottom: 4,
  },
  therapistNoteBody: {
    fontSize: 13.5,
    fontWeight: Typography.fontWeight.medium,
    color: '#334155',
    lineHeight: 20,
  },

  /* 5. ACTION BUTTONS */
  actionButtonsContainer: {
    gap: 12,
    marginBottom: 8,
  },
  primaryBtn: {
    height: 56,
    borderRadius: 9999,
    backgroundColor: '#003D9B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  secondaryBtn: {
    height: 54,
    borderRadius: 9999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },
});

export default SessionCompleteScreen;
