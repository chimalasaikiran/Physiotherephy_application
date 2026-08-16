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
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';
import { Strings } from '@/constants';
import { BottomNavBar, TabKey } from '@/components';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const ExerciseDetailsScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const [activeNavTab, setActiveNavTab] = useState<TabKey>('recovery');
  const [expandedMistakeId, setExpandedMistakeId] = useState<string | null>(null);
  const [isPlayingVideo, setIsPlayingVideo] = useState<boolean>(false);

  const data = Strings.exerciseDetails;

  const exerciseTitle = (params.title as string) || (params.name as string) || data.exerciseTitle;

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
        message: `Check out ${exerciseTitle} exercise on ONE MEDICAL app for lower back recovery!`,
      });
    } catch (error) {
      Alert.alert('Share', `Sharing ${exerciseTitle} exercise details`);
    }
  };

  const toggleMistake = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedMistakeId(expandedMistakeId === id ? null : id);
  };

  const parsedIndex = params.exerciseIndex ? parseInt(params.exerciseIndex as string, 10) : 0;
  const exerciseIndex = isNaN(parsedIndex) ? 0 : parsedIndex;

  const handleStartExercise = () => {
    router.push({
      pathname: '/active-session',
      params: {
        exerciseIndex: exerciseIndex.toString(),
        currentSet: '1',
        totalSets: '3',
        totalExercises: '5',
        name: exerciseTitle,
      },
    } as any);
  };

  const handlePlayVideo = () => {
    setIsPlayingVideo(!isPlayingVideo);
    Alert.alert(
      isPlayingVideo ? 'Video Paused' : 'Playing Exercise Video 🎬',
      isPlayingVideo
        ? 'Exercise instruction video paused.'
        : `Demonstration video for ${exerciseTitle} is playing in HD quality.`
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent />

      {/* HEADER BAR */}
      <View style={[styles.header, { paddingTop: insets.top + 4, height: 56 + insets.top }]}>
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
            onPress={() => router.push('/recovery' as any)}
            style={styles.headerExitBtn}
            accessibilityLabel="Exit to recovery dashboard"
          >
            <Ionicons name="close" size={18} color="#EF4444" />
            <Text style={styles.headerExitText}>Exit</Text>
          </TouchableOpacity>
        </View>

        {/* MAIN SCROLLABLE CONTENT */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 120 + Math.max(insets.bottom, 12) },
          ]}
        >
          {/* 1. HERO VIDEO MEDIA CARD */}
          <View style={styles.heroCard}>
            <Image
              source={require('../../../assets/images/exercise_pelvic_tilt.png')}
              style={styles.heroImage}
              resizeMode="cover"
            />

            {/* Gradient overlay for contrast */}
            <LinearGradient
              colors={['rgba(15, 23, 42, 0.25)', 'transparent', 'rgba(15, 23, 42, 0.82)']}
              locations={[0, 0.5, 1]}
              style={styles.heroGradient}
            />

            {/* Top Left Badge Tag */}
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>{data.levelBadge}</Text>
            </View>

            {/* Center Play Button Circle */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handlePlayVideo}
              style={styles.playBtnContainer}
              accessibilityLabel="Play exercise video"
            >
              <View style={styles.playBtnCircle}>
                <Ionicons
                  name={isPlayingVideo ? 'pause' : 'play'}
                  size={24}
                  color="#FFFFFF"
                  style={{ marginLeft: isPlayingVideo ? 0 : 3 }}
                />
              </View>
            </TouchableOpacity>

            {/* Bottom Overlay Title */}
            <View style={styles.heroTitleContainer}>
              <Text style={styles.heroExerciseTitle}>{exerciseTitle}</Text>
            </View>
          </View>

          {/* 2. METRICS GRID (2x2) */}
          <View style={styles.metricsGridContainer}>
            {/* Row 1 */}
            <View style={styles.metricsRow}>
              {/* Target Area */}
              <View style={styles.metricCard}>
                <View style={styles.metricIconBox}>
                  <Ionicons name="body-outline" size={22} color="#003D9B" />
                </View>
                <Text style={styles.metricLabel}>{data.metrics.targetAreaLabel}</Text>
                <Text style={styles.metricValue}>{data.metrics.targetAreaValue}</Text>
              </View>

              {/* Equipment */}
              <View style={styles.metricCard}>
                <View style={styles.metricIconBox}>
                  <Ionicons name="fitness-outline" size={22} color="#003D9B" />
                </View>
                <Text style={styles.metricLabel}>{data.metrics.equipmentLabel}</Text>
                <Text style={styles.metricValue}>{data.metrics.equipmentValue}</Text>
              </View>
            </View>

            {/* Row 2 */}
            <View style={styles.metricsRow}>
              {/* Duration */}
              <View style={styles.metricCard}>
                <View style={styles.metricIconBox}>
                  <Ionicons name="time-outline" size={22} color="#003D9B" />
                </View>
                <Text style={styles.metricLabel}>{data.metrics.durationLabel}</Text>
                <Text style={styles.metricValue}>{data.metrics.durationValue}</Text>
              </View>

              {/* Repetitions */}
              <View style={styles.metricCard}>
                <View style={styles.metricIconBox}>
                  <Ionicons name="sync-outline" size={22} color="#003D9B" />
                </View>
                <Text style={styles.metricLabel}>{data.metrics.repetitionsLabel}</Text>
                <Text style={styles.metricValue}>{data.metrics.repetitionsValue}</Text>
              </View>
            </View>
          </View>

          {/* 3. INSTRUCTIONS SECTION */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{data.instructionsTitle}</Text>

            <View style={styles.instructionsList}>
              {data.instructionsList.map((stepText, index) => (
                <View key={index} style={styles.instructionStepRow}>
                  <View style={styles.stepNumberBadge}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepContentText}>{stepText}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 4. CLINICAL TIPS CARD */}
          <View style={styles.clinicalTipsCard}>
            <View style={styles.clinicalHeaderRow}>
              <Ionicons name="medical" size={22} color="#047857" />
              <Text style={styles.clinicalTitle}>{data.clinicalTipsTitle}</Text>
            </View>

            <View style={styles.clinicalList}>
              {data.clinicalTipsList.map((tip, index) => (
                <View key={index} style={styles.clinicalTipRow}>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#047857" />
                  <Text style={styles.clinicalTipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 5. MISTAKES TO AVOID SECTION */}
          <View style={styles.sectionContainer}>
            <Text style={styles.mistakesSectionTitle}>{data.mistakesTitle}</Text>

            <View style={styles.mistakesList}>
              {data.mistakesList.map((mistake) => {
                const isExpanded = expandedMistakeId === mistake.id;
                return (
                  <View key={mistake.id} style={styles.mistakeCardContainer}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => toggleMistake(mistake.id)}
                      style={styles.mistakeHeaderRow}
                    >
                      <Text style={styles.mistakeTitleText}>{mistake.title}</Text>
                      <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color="#64748B"
                      />
                    </TouchableOpacity>

                    {isExpanded && (
                      <View style={styles.mistakeExpandedContent}>
                        <Text style={styles.mistakeDescriptionText}>
                          {mistake.description}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>

          {/* 6. START EXERCISE CTA BUTTON */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleStartExercise}
            style={styles.startExerciseBtn}
          >
            <View style={styles.btnIconCircle}>
              <Ionicons name="play" size={16} color="#003D9B" style={{ marginLeft: 2 }} />
            </View>
            <Text style={styles.startExerciseBtnText}>{data.startExerciseBtn}</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* BOTTOM NAV BAR */}
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
  headerExitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    gap: 4,
  },
  headerExitText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold,
    color: '#EF4444',
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
    height: 240,
    width: '100%',
    borderRadius: 28,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: Spacing.xl,
    backgroundColor: '#0F172A',
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  levelBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#003D9B',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 9999,
  },
  levelBadgeText: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  playBtnContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -28 }, { translateY: -28 }],
  },
  playBtnCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitleContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  heroExerciseTitle: {
    fontSize: 24,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  /* METRICS GRID */
  metricsGridContainer: {
    marginBottom: Spacing.xl,
    gap: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  metricIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: Typography.fontWeight.medium,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    color: '#051A3E',
    textAlign: 'center',
  },

  /* INSTRUCTIONS SECTION */
  sectionContainer: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: Typography.fontWeight.bold,
    color: '#051A3E',
    marginBottom: 16,
  },
  instructionsList: {
    gap: 16,
  },
  instructionStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  stepNumberBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#003D9B',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  stepContentText: {
    flex: 1,
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
    fontWeight: Typography.fontWeight.regular,
  },

  /* CLINICAL TIPS CARD */
  clinicalTipsCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 24,
    padding: 20,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  clinicalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  clinicalTitle: {
    fontSize: 20,
    fontWeight: Typography.fontWeight.bold,
    color: '#047857',
  },
  clinicalList: {
    gap: 12,
  },
  clinicalTipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  clinicalTipText: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.medium,
    color: '#065F46',
  },

  /* MISTAKES TO AVOID */
  mistakesSectionTitle: {
    fontSize: 22,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
    marginBottom: 16,
  },
  mistakesList: {
    gap: 12,
  },
  mistakeCardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  mistakeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  mistakeTitleText: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.medium,
    color: '#1E293B',
    flex: 1,
    paddingRight: 10,
  },
  mistakeExpandedContent: {
    paddingHorizontal: 20,
    paddingBottom: 18,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  mistakeDescriptionText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
    marginTop: 8,
  },

  /* START EXERCISE CTA */
  startExerciseBtn: {
    height: 56,
    backgroundColor: '#003D9B',
    borderRadius: 9999,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 6,
    marginTop: 8,
    marginBottom: 12,
  },
  btnIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  startExerciseBtnText: {
    fontSize: 17,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
  },
});

export default ExerciseDetailsScreen;
