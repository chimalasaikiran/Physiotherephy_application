import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { Colors } from '@/constants';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';
import { Strings } from '@/constants';
import { BottomNavBar, TabKey } from '@/components';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface RecoveryProgressScreenProps {
  onBack?: () => void;
  onContinueProgram?: () => void;
}

export const RecoveryProgressScreen: React.FC<RecoveryProgressScreenProps> = ({
  onBack,
  onContinueProgram,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeNavTab, setActiveNavTab] = useState<TabKey>('recovery');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<'week' | 'month' | 'three_months'>('week');

  const pData = Strings.recoveryProgress;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/recovery');
    }
  };

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

  const handleShare = () => {
    Alert.alert(
      'Share Progress',
      'Share your recovery progress summary with your therapist or family.',
      [
        { text: 'Copy Summary', onPress: () => {} },
        { text: 'Share Report', onPress: () => {} },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleContinueProgram = () => {
    if (onContinueProgram) {
      onContinueProgram();
    } else {
      router.push('/today-session');
    }
  };

  // SVG Chart dimensions
  const chartWidth = SCREEN_WIDTH - 80;
  const chartHeight = 110;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />

      {/* 1. TOP NAVBAR HEADER */}
      <View
        style={[
            styles.headerBar,
            {
              paddingTop: insets.top + 8,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.headerIconButton}
            onPress={handleBack}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={24} color="#003D9B" />
          </TouchableOpacity>

          <Text style={styles.headerTitleText}>{pData.headerTitle}</Text>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.headerIconButton}
            onPress={handleShare}
            accessibilityLabel="Share progress"
            accessibilityRole="button"
          >
            <Ionicons name="share-social-outline" size={22} color="#003D9B" />
          </TouchableOpacity>
        </View>

        {/* MAIN SCROLLABLE CONTENT */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom: 100 + Math.max(insets.bottom, 16),
            },
          ]}
          bounces={true}
        >
          {/* 2. CURRENT STATUS CARD (RECOVERY SCORE) */}
          <View style={styles.statusCard}>
            <View style={styles.statusLeftCol}>
              <Text style={styles.statusTagText}>{pData.currentStatusTag}</Text>

              <Text style={styles.scoreTitleText}>{pData.scoreTitle}</Text>

              {/* Cyan Trend Badge */}
              <View style={styles.trendBadgePill}>
                <Ionicons name="trending-up" size={14} color="#0284C7" style={{ marginRight: 4 }} />
                <Text style={styles.trendBadgeText}>{pData.trendPill}</Text>
              </View>

              <Text style={styles.weekSubtitleText}>{pData.weekSubtitle}</Text>
            </View>

            {/* Right Side Circular Gauge */}
            <View style={styles.scoreRingOuter}>
              <View style={styles.scoreRingInner}>
                <Text style={styles.scoreNumberText}>{pData.scoreValue}</Text>
                <Text style={styles.scorePercentText}>{pData.scorePercent}</Text>
              </View>
            </View>
          </View>

          {/* 3. MOBILITY TREND CARD (INTERACTIVE GRAPH) */}
          <View style={styles.trendCard}>
            <Text style={styles.cardTitleText}>{pData.mobilityTrendTitle}</Text>

            {/* Time Filter Pills Header */}
            <View style={styles.filterPillContainer}>
              {pData.timeFilters.map((filter) => {
                const isActive = selectedTimeFilter === filter.id;
                return (
                  <TouchableOpacity
                    key={filter.id}
                    activeOpacity={0.8}
                    style={[styles.filterPill, isActive && styles.filterPillActive]}
                    onPress={() => setSelectedTimeFilter(filter.id as any)}
                  >
                    <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Smooth SVG Wave Line Chart */}
            <View style={styles.chartWrapper}>
              <Svg width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
                <Defs>
                  <SvgGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor="#003D9B" stopOpacity="0.25" />
                    <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
                  </SvgGradient>
                </Defs>

                {/* Gradient Fill under Path */}
                <Path
                  d={`M 0,${chartHeight * 0.75}
                     C ${chartWidth * 0.18},${chartHeight * 0.65} ${chartWidth * 0.28},${chartHeight * 0.72} ${chartWidth * 0.42},${chartHeight * 0.28}
                     C ${chartWidth * 0.55},${chartHeight * 0.05} ${chartWidth * 0.68},${chartHeight * 0.82} ${chartWidth * 0.82},${chartHeight * 0.25}
                     L ${chartWidth * 0.82},${chartHeight} L 0,${chartHeight} Z`}
                  fill="url(#chartGradient)"
                />

                {/* Main Blue Curved Line */}
                <Path
                  d={`M 0,${chartHeight * 0.75}
                     C ${chartWidth * 0.18},${chartHeight * 0.65} ${chartWidth * 0.28},${chartHeight * 0.72} ${chartWidth * 0.42},${chartHeight * 0.28}
                     C ${chartWidth * 0.55},${chartHeight * 0.05} ${chartWidth * 0.68},${chartHeight * 0.82} ${chartWidth * 0.82},${chartHeight * 0.25}`}
                  fill="none"
                  stroke="#003D9B"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Active Glowing Point Dot on Curve */}
                <Circle
                  cx={chartWidth * 0.82}
                  cy={chartHeight * 0.25}
                  r="5.5"
                  fill="#003D9B"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                />
              </Svg>

              {/* X-Axis Day Labels */}
              <View style={styles.daysRow}>
                {pData.chartDays.map((item, index) => (
                  <Text
                    key={index}
                    style={[styles.dayLabelText, item.active && styles.dayLabelTextActive]}
                  >
                    {item.day}
                  </Text>
                ))}
              </View>
            </View>
          </View>

          {/* 4. KEY METRICS GRID (2x2 STAT CARDS) */}
          <View style={styles.metricsGrid}>
            {/* Stat 1: Sessions */}
            <View style={styles.metricCard}>
              <View style={[styles.metricIconBox, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="barbell" size={20} color="#003D9B" />
              </View>
              <Text style={styles.metricValueText}>{pData.stats.sessionsCount}</Text>
              <Text style={styles.metricLabelText}>{pData.stats.sessionsLabel}</Text>
            </View>

            {/* Stat 2: Streak */}
            <View style={styles.metricCard}>
              <View style={[styles.metricIconBox, { backgroundColor: '#FFF7ED' }]}>
                <Ionicons name="flame" size={20} color="#EF4444" />
              </View>
              <Text style={styles.metricValueText}>{pData.stats.streakCount}</Text>
              <Text style={styles.metricLabelText}>{pData.stats.streakLabel}</Text>
            </View>

            {/* Stat 3: Total Time */}
            <View style={styles.metricCard}>
              <View style={[styles.metricIconBox, { backgroundColor: '#F0FDF4' }]}>
                <Ionicons name="time" size={20} color="#0D9488" />
              </View>
              <Text style={styles.metricValueText}>{pData.stats.totalTimeCount}</Text>
              <Text style={styles.metricLabelText}>{pData.stats.totalTimeLabel}</Text>
            </View>

            {/* Stat 4: Exercises */}
            <View style={styles.metricCard}>
              <View style={[styles.metricIconBox, { backgroundColor: '#FAF5FF' }]}>
                <Ionicons name="reload" size={20} color="#9333EA" />
              </View>
              <Text style={styles.metricValueText}>{pData.stats.exercisesCount}</Text>
              <Text style={styles.metricLabelText}>{pData.stats.exercisesLabel}</Text>
            </View>
          </View>

          {/* 5. MILESTONES SECTION */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeaderTitle}>{pData.milestonesTitle}</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.milestonesScrollContent}
            >
              {pData.milestonesList.map((item) => (
                <View key={item.id} style={styles.milestoneBadgeCard}>
                  <View style={[styles.milestoneIconCircle, { backgroundColor: item.bg }]}>
                    <Ionicons
                      name={item.icon as any}
                      size={26}
                      color={item.color}
                    />
                  </View>
                  <Text style={styles.milestoneTitleText}>{item.title}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* 6. THERAPIST FEEDBACK CARD */}
          <View style={styles.therapistCard}>
            <View style={styles.therapistHeaderRow}>
              <Image
                source={require('../../../assets/images/doctor_ananya.png')}
                style={styles.therapistAvatar}
                resizeMode="cover"
              />
              <View style={styles.therapistInfoCol}>
                <Text style={styles.therapistNameText}>{pData.therapistFeedback.doctorName}</Text>
                <Text style={styles.therapistQuoteText}>{pData.therapistFeedback.quote}</Text>
              </View>
            </View>
          </View>

          {/* 7. NEXT MILESTONE BANNER (BLUE CONTAINER) */}
          <View style={styles.nextMilestoneCard}>
            {/* Top Flag Icon Circle */}
            <View style={styles.flagIconCircle}>
              <Ionicons name="flag" size={22} color="#003D9B" />
            </View>

            <Text style={styles.nextMilestoneTitle}>{pData.nextMilestone.title}</Text>
            <Text style={styles.nextMilestoneSubtitle}>{pData.nextMilestone.subtitle}</Text>

            {/* Progress Bar Track */}
            <View style={styles.milestoneProgressTrack}>
              <View style={[styles.milestoneProgressFill, { width: '70%' }]} />
            </View>

            {/* Action Button: Continue Program */}
            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.continueProgramButton}
              onPress={handleContinueProgram}
              accessibilityLabel="Continue Program"
              accessibilityRole="button"
            >
              <Text style={styles.continueButtonText}>{pData.nextMilestone.continueBtn}</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>

          {/* Extra Spacing at Bottom */}
          <View style={{ height: 16 }} />
        </ScrollView>

        {/* 8. BOTTOM NAVIGATION BAR */}
        <BottomNavBar activeTab={activeNavTab} onTabPress={handleNavTabPress} />
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

  /* HEADER */
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  headerTitleText: {
    fontSize: 19,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
    textAlign: 'center',
  },

  /* SCROLL CONTENT */
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },

  /* 2. CURRENT STATUS CARD */
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  statusLeftCol: {
    flex: 1,
    paddingRight: 12,
  },
  statusTagText: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  scoreTitleText: {
    fontSize: 26,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
    lineHeight: 30,
    marginBottom: 10,
  },
  trendBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1F5FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  trendBadgeText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold,
    color: '#0284C7',
  },
  weekSubtitleText: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.medium,
    color: '#64748B',
  },

  /* CIRCULAR GAUGE */
  scoreRingOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 7,
    borderColor: '#003D9B',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  scoreRingInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumberText: {
    fontSize: 32,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
    lineHeight: 36,
  },
  scorePercentText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold,
    color: '#64748B',
    marginTop: -2,
  },

  /* 3. MOBILITY TREND CARD */
  trendCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTitleText: {
    fontSize: 19,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
    marginBottom: 14,
  },
  filterPillContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 9999,
    padding: 4,
    marginBottom: 20,
  },
  filterPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPillActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.medium,
    color: '#64748B',
  },
  filterPillTextActive: {
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },

  /* SVG CHART */
  chartWrapper: {
    alignItems: 'center',
    marginTop: 4,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 4,
    marginTop: 14,
  },
  dayLabelText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.medium,
    color: '#64748B',
  },
  dayLabelTextActive: {
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },

  /* 4. METRICS GRID */
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: Spacing.xl,
  },
  metricCard: {
    width: (SCREEN_WIDTH - Spacing.xl * 2 - 12) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  metricIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  metricValueText: {
    fontSize: 20,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
    marginBottom: 2,
  },
  metricLabelText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.medium,
    color: '#64748B',
  },

  /* 5. MILESTONES SECTION */
  sectionContainer: {
    marginBottom: Spacing.xl,
  },
  sectionHeaderTitle: {
    fontSize: 19,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
    marginBottom: 14,
  },
  milestonesScrollContent: {
    gap: 14,
    paddingRight: Spacing.md,
  },
  milestoneBadgeCard: {
    width: 110,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  milestoneIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  milestoneTitleText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 15,
  },

  /* 6. THERAPIST CARD */
  therapistCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  therapistHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  therapistAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  therapistInfoCol: {
    flex: 1,
  },
  therapistNameText: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  therapistQuoteText: {
    fontSize: 13.5,
    fontWeight: Typography.fontWeight.medium,
    color: '#334155',
    lineHeight: 19,
  },

  /* 7. NEXT MILESTONE BANNER (BLUE CONTAINER) */
  nextMilestoneCard: {
    backgroundColor: '#003D9B',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    marginBottom: Spacing.xl,
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  flagIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  nextMilestoneTitle: {
    fontSize: 22,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  nextMilestoneSubtitle: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.medium,
    color: '#E0F2FE',
    textAlign: 'center',
    marginBottom: 18,
  },
  milestoneProgressTrack: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 20,
  },
  milestoneProgressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  continueProgramButton: {
    height: 48,
    paddingHorizontal: 28,
    borderRadius: 9999,
    backgroundColor: '#0052CC',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  continueButtonText: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
  },
});

export default RecoveryProgressScreen;
