import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';
import { Strings } from '@/constants';
import { BottomNavBar, TabKey } from '@/components';

type FilterTab = 'Active' | 'Completed' | 'Paused';

interface PastProgramItem {
  id: string;
  title: string;
  dateText: string;
  status: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  actionText: string;
}

export const MyRecoveryProgramsScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [activeFilter, setActiveFilter] = useState<FilterTab>('Active');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNavTab, setActiveNavTab] = useState<TabKey>('recovery');

  const data = Strings.myRecoveryPrograms;

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

  const pastPrograms: PastProgramItem[] = useMemo(() => {
    const list: PastProgramItem[] = [
      {
        id: 'past_1',
        title: 'Shoulder Mobility',
        dateText: 'Completed Jan 2024',
        status: 'Completed',
        iconName: 'barbell-outline',
        iconBg: '#F3E8FF',
        iconColor: '#9333EA',
        actionText: 'View Summary',
      },
      {
        id: 'past_2',
        title: 'Ankle Stability',
        dateText: 'Completed Nov 2023',
        status: 'Completed',
        iconName: 'walk-outline',
        iconBg: '#E0F2FE',
        iconColor: '#0284C7',
        actionText: 'View Summary',
      },
    ];

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.dateText.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const showActiveCard = useMemo(() => {
    if (activeFilter === 'Completed' || activeFilter === 'Paused') return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      data.activeProgram.title.toLowerCase().includes(q) ||
      data.activeProgram.doctorName.toLowerCase().includes(q)
    );
  }, [activeFilter, searchQuery, data.activeProgram]);

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
            style={styles.backBtn}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color="#051A3E" />
          </TouchableOpacity>

          <View style={styles.headerTitleGroup}>
            <Text style={styles.headerTitle}>{data.headerTitle}</Text>
            <Text style={styles.headerSubtitle}>{data.headerSubtitle}</Text>
          </View>
        </View>

        {/* MAIN SCROLL CONTENT */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 110 + Math.max(insets.bottom, 12) },
          ]}
        >
          {/* SEARCH BAR */}
          <View style={styles.searchContainer}>
            <Ionicons
              name="search-outline"
              size={20}
              color="#94A3B8"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder={data.searchPlaceholder}
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* FILTER TABS */}
          <View style={styles.filterRow}>
            {(['Active', 'Completed', 'Paused'] as FilterTab[]).map((tab) => {
              const isActive = activeFilter === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  activeOpacity={0.8}
                  onPress={() => setActiveFilter(tab)}
                  style={[
                    styles.filterPill,
                    isActive ? styles.activeFilterPill : styles.inactiveFilterPill,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      isActive
                        ? styles.activeFilterPillText
                        : styles.inactiveFilterPillText,
                    ]}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ACTIVE PROGRAM CARD */}
          {showActiveCard ? (
            <TouchableOpacity
              activeOpacity={0.95}
              style={styles.activeCard}
              onPress={() => router.push('/recovery-program-details' as any)}
            >
              {/* Active Badge Tag */}
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>
                  {data.activeProgram.statusBadge}
                </Text>
              </View>

              {/* Title & Doctor */}
              <Text style={styles.activeTitle}>{data.activeProgram.title}</Text>
              <View style={styles.doctorRow}>
                <Ionicons name="briefcase-outline" size={16} color="#64748B" />
                <Text style={styles.doctorText}>
                  {data.activeProgram.doctorName}
                </Text>
              </View>

              {/* Middle Progress Section */}
              <View style={styles.progressMiddleRow}>
                {/* Circular Gauge */}
                <View style={styles.gaugeContainer}>
                  <View style={styles.gaugeOuterCircle}>
                    <Text style={styles.gaugePercentText}>
                      {data.activeProgram.progressPercent}
                    </Text>
                  </View>
                </View>

                {/* Sessions Info */}
                <View style={styles.sessionsInfoGroup}>
                  <Text style={styles.sessionsCountText}>
                    {data.activeProgram.sessionsCompletedText}
                  </Text>
                  <Text style={styles.sessionsLabelText}>
                    {data.activeProgram.sessionsLabel}
                  </Text>
                </View>

                {/* Spine Graphic Graphic Container */}
                <View style={styles.spineGraphicWrapper}>
                  <Image
                    source={require('../../../assets/images/service_back_pain.png')}
                    style={styles.spineImage}
                    resizeMode="contain"
                  />
                </View>
              </View>

              {/* Recovery Score Bar */}
              <View style={styles.scoreSection}>
                <View style={styles.scoreHeaderRow}>
                  <Text style={styles.scoreLabel}>
                    {data.activeProgram.recoveryScoreLabel}
                  </Text>
                  <Text style={styles.scoreValue}>
                    {data.activeProgram.recoveryScoreVal}
                  </Text>
                </View>

                <View style={styles.scoreTrack}>
                  <LinearGradient
                    colors={['#0284C7', '#06B6D4']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.scoreFill, { width: '72%' }]}
                  />
                </View>

                <Text style={styles.improvementNote}>
                  {data.activeProgram.improvementNote}
                </Text>
              </View>

              {/* Buttons */}
              <View style={styles.cardButtonsGroup}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.continueBtn}
                  onPress={() => router.push('/today-session' as any)}
                >
                  <View style={styles.playIconCircle}>
                    <Ionicons name="play" size={14} color="#003D9B" />
                  </View>
                  <Text style={styles.continueBtnText}>
                    {data.activeProgram.continueBtn}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.viewDetailsBtn}
                  onPress={() => router.push('/recovery-program-details' as any)}
                >
                  <Text style={styles.viewDetailsBtnText}>
                    {data.activeProgram.viewDetailsBtn}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ) : activeFilter === 'Active' && searchQuery.trim() !== '' ? (
            <View style={styles.noResultsBox}>
              <Text style={styles.noResultsText}>No active programs match your search.</Text>
            </View>
          ) : null}

          {/* PAST PROGRAMS SECTION */}
          {activeFilter !== 'Paused' && (
            <View style={styles.pastSection}>
              <Text style={styles.pastSectionTitle}>{data.pastProgramsTitle}</Text>

              {pastPrograms.length > 0 ? (
                <View style={styles.pastListContainer}>
                  {pastPrograms.map((item) => (
                    <View key={item.id} style={styles.pastCard}>
                      <View
                        style={[
                          styles.pastIconCircle,
                          { backgroundColor: item.iconBg },
                        ]}
                      >
                        <Ionicons
                          name={item.iconName}
                          size={22}
                          color={item.iconColor}
                        />
                      </View>

                      <View style={styles.pastTextGroup}>
                        <Text style={styles.pastTitle}>{item.title}</Text>
                        <Text style={styles.pastDate}>{item.dateText}</Text>
                      </View>

                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() =>
                          Alert.alert(
                            item.title,
                            `${item.title} completed successfully in ${item.dateText.replace('Completed ', '')}.`
                          )
                        }
                      >
                        <Text style={styles.viewSummaryText}>
                          {item.actionText}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.noResultsBox}>
                  <Text style={styles.noResultsText}>No past programs found.</Text>
                </View>
              )}
            </View>
          )}

          {/* NEED A NEW PLAN BANNER */}
          <LinearGradient
            colors={['#003D9B', '#0052C4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.consultBanner}
          >
            <View style={styles.bannerIconCircle}>
              <Ionicons name="checkbox-outline" size={28} color="#FFFFFF" />
            </View>

            <Text style={styles.bannerTitle}>{data.consultBanner.title}</Text>
            <Text style={styles.bannerSubtitle}>
              {data.consultBanner.subtitle}
            </Text>

            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.bookConsultBtn}
              onPress={() => router.push('/service-selection' as any)}
            >
              <Text style={styles.bookConsultBtnText}>
                {data.consultBanner.buttonText}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
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
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 14,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  headerTitleGroup: {
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: '#051A3E',
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.regular,
    color: '#64748B',
    marginTop: 1,
  },

  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },

  /* SEARCH BAR */
  searchContainer: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 9999,
    paddingHorizontal: 16,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: '#051A3E',
  },

  /* FILTER ROW */
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: Spacing.xl,
  },
  filterPill: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 9999,
  },
  activeFilterPill: {
    backgroundColor: '#003D9B',
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  inactiveFilterPill: {
    backgroundColor: '#E8EEFF',
  },
  filterPillText: {
    fontSize: 14,
  },
  activeFilterPillText: {
    color: '#FFFFFF',
    fontWeight: Typography.fontWeight.bold,
  },
  inactiveFilterPillText: {
    color: '#475569',
    fontWeight: Typography.fontWeight.semiBold,
  },

  /* ACTIVE PROGRAM CARD */
  activeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 4,
  },
  activeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 9999,
    marginBottom: 12,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: '#0D9488',
    letterSpacing: 0.8,
  },
  activeTitle: {
    fontSize: 24,
    fontWeight: Typography.fontWeight.bold,
    color: '#051A3E',
    marginBottom: 6,
    lineHeight: 30,
  },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  doctorText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: Typography.fontWeight.medium,
  },

  /* PROGRESS MIDDLE ROW */
  progressMiddleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  gaugeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeOuterCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 6,
    borderColor: '#0047AB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#0047AB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  gaugePercentText: {
    fontSize: 19,
    fontWeight: Typography.fontWeight.bold,
    color: '#0047AB',
  },
  sessionsInfoGroup: {
    flex: 1,
    paddingLeft: 16,
    justifyContent: 'center',
  },
  sessionsCountText: {
    fontSize: 20,
    fontWeight: Typography.fontWeight.bold,
    color: '#051A3E',
    marginBottom: 2,
  },
  sessionsLabelText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: Typography.fontWeight.medium,
  },
  spineGraphicWrapper: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.85,
  },
  spineImage: {
    width: 48,
    height: 48,
  },

  /* RECOVERY SCORE SECTION */
  scoreSection: {
    marginBottom: 22,
  },
  scoreHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: '#64748B',
    letterSpacing: 0.8,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    color: '#0284C7',
  },
  scoreTrack: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  scoreFill: {
    height: '100%',
    borderRadius: 4,
  },
  improvementNote: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#64748B',
  },

  /* CARD BUTTONS */
  cardButtonsGroup: {
    gap: 12,
  },
  continueBtn: {
    height: 50,
    borderRadius: 9999,
    backgroundColor: '#003D9B',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  playIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueBtnText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  viewDetailsBtn: {
    height: 50,
    borderRadius: 9999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewDetailsBtnText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },

  /* PAST PROGRAMS */
  pastSection: {
    marginBottom: Spacing.xl,
  },
  pastSectionTitle: {
    fontSize: 20,
    fontWeight: Typography.fontWeight.bold,
    color: '#051A3E',
    marginBottom: Spacing.md,
  },
  pastListContainer: {
    gap: 12,
  },
  pastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F7FF',
    borderRadius: 20,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  pastIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pastTextGroup: {
    flex: 1,
  },
  pastTitle: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    color: '#051A3E',
    marginBottom: 4,
  },
  pastDate: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: Typography.fontWeight.medium,
  },
  viewSummaryText: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },

  /* CONSULT BANNER */
  consultBanner: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: Spacing.xl,
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  bannerIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  bookConsultBtn: {
    height: 48,
    paddingHorizontal: 32,
    borderRadius: 9999,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bookConsultBtnText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },

  noResultsBox: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResultsText: {
    fontSize: 14,
    color: '#64748B',
  },
});

export default MyRecoveryProgramsScreen;
