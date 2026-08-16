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
  ActivityIndicator,
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
import { useAuth } from '@/context/AuthContext';
import { subscribeToPatientAssignments, MobileProgramAssignment } from '@/api/programService';

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
  const { user } = useAuth();

  const [activeFilter, setActiveFilter] = useState<FilterTab>('Active');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNavTab, setActiveNavTab] = useState<TabKey>('recovery');
  const [assignments, setAssignments] = useState<MobileProgramAssignment[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);

  React.useEffect(() => {
    const uid = user?.uid;
    if (!uid) {
      setAssignmentsLoading(false);
      return;
    }
    const unsub = subscribeToPatientAssignments(
      uid,
      (data) => {
        setAssignments(data);
        setAssignmentsLoading(false);
      },
      (err) => {
        console.warn('[MyRecoveryPrograms] assignment subscription error:', err);
        setAssignmentsLoading(false);
      }
    );
    return () => unsub();
  }, [user?.uid]);

  const data = Strings.myRecoveryPrograms;

  // Filter assignments by active filter tab
  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      const statusMatch =
        activeFilter === 'Active'
          ? a.status === 'active'
          : activeFilter === 'Completed'
          ? a.status === 'completed'
          : a.status === 'paused';

      if (!statusMatch) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          a.programTitle.toLowerCase().includes(q) ||
          (a.programDetails?.doctorName || '').toLowerCase().includes(q) ||
          a.patientCondition.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [assignments, activeFilter, searchQuery]);

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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent />

      {/* HEADER BAR */}
      <View style={[styles.header, { paddingTop: insets.top + 4, height: 56 + insets.top }]}>
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
            <Text style={styles.headerSubtitle}>
              {assignments.length} program{assignments.length !== 1 ? 's' : ''} assigned
            </Text>
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

          {/* LOADING STATE */}
          {assignmentsLoading ? (
            <View style={styles.noResultsBox}>
              <ActivityIndicator size="large" color="#003D9B" />
              <Text style={[styles.noResultsText, { marginTop: 12 }]}>Loading your programs...</Text>
            </View>
          ) : filteredAssignments.length === 0 ? (
            /* NO PROGRAMS EMPTY STATE */
            <View style={styles.emptyStateBox}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="medical-outline" size={32} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>
                {assignments.length === 0
                  ? 'No recovery programs assigned yet.'
                  : activeFilter === 'Active'
                  ? 'No Active Programs'
                  : activeFilter === 'Completed'
                  ? 'No Completed Programs'
                  : 'No Paused Programs'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {assignments.length === 0 || activeFilter === 'Active'
                  ? 'Your physiotherapist will assign a recovery program for you soon.'
                  : 'Programs will appear here once available.'}
              </Text>
            </View>
          ) : (
            /* ASSIGNED PROGRAM CARDS */
            <View style={styles.cardsContainer}>
              {filteredAssignments.map((assignment) => (
                <TouchableOpacity
                  key={assignment.id}
                  activeOpacity={0.95}
                  style={styles.activeCard}
                  onPress={() =>
                    router.push({
                      pathname: '/recovery-program-details' as any,
                      params: { assignmentId: assignment.id },
                    })
                  }
                >
                  {/* Status Badge */}
                  <View
                    style={[
                      styles.activeBadge,
                      assignment.status === 'completed'
                        ? { backgroundColor: '#DCFCE7' }
                        : assignment.status === 'paused'
                        ? { backgroundColor: '#FEF9C3' }
                        : { backgroundColor: '#CCFBF1' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.activeBadgeText,
                        assignment.status === 'completed'
                          ? { color: '#16A34A' }
                          : assignment.status === 'paused'
                          ? { color: '#CA8A04' }
                          : { color: '#0D9488' },
                      ]}
                    >
                      {assignment.status === 'active'
                        ? 'ACTIVE'
                        : assignment.status === 'completed'
                        ? 'COMPLETED'
                        : 'PAUSED'}
                    </Text>
                  </View>

                  {/* Title */}
                  <Text style={styles.activeTitle} numberOfLines={2}>
                    {assignment.programTitle}
                  </Text>

                  {/* Doctor / Assigned By */}
                  <View style={styles.doctorRow}>
                    <Ionicons name="briefcase-outline" size={16} color="#64748B" />
                    <Text style={styles.doctorText}>
                      {assignment.programDetails?.doctorName || 'Dr. Ananya Sharma'}
                    </Text>
                  </View>

                  {/* Progress Middle Row */}
                  <View style={styles.progressMiddleRow}>
                    <View style={styles.gaugeContainer}>
                      <View style={styles.gaugeOuterCircle}>
                        <Text style={styles.gaugePercentText}>
                          {assignment.progressPercent}%
                        </Text>
                      </View>
                    </View>

                    <View style={styles.sessionsInfoGroup}>
                      <Text style={styles.sessionsCountText}>
                        {assignment.completedSessions}/{assignment.totalSessions}
                      </Text>
                      <Text style={styles.sessionsLabelText}>Sessions Completed</Text>
                      <Text style={[styles.sessionsLabelText, { marginTop: 4 }]}>
                        Week {assignment.currentWeek} of {assignment.totalWeeks}
                      </Text>
                    </View>

                    <View style={styles.adherenceBadge}>
                      <Text style={styles.adherenceValue}>{assignment.adherence}%</Text>
                      <Text style={styles.adherenceLabel}>Adherence</Text>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View style={styles.scoreSection}>
                    <View style={styles.scoreHeaderRow}>
                      <Text style={styles.scoreLabel}>PROGRAM PROGRESS</Text>
                      <Text style={styles.scoreValue}>{assignment.progressPercent}%</Text>
                    </View>
                    <View style={styles.scoreTrack}>
                      <LinearGradient
                        colors={['#0284C7', '#06B6D4']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.scoreFill, { width: `${Math.max(assignment.progressPercent, 2)}%` as any }]}
                      />
                    </View>
                    <Text style={styles.improvementNote}>Started {assignment.startDate}</Text>
                  </View>

                  {/* Buttons (only for active programs) */}
                  {assignment.status === 'active' && (
                    <View style={styles.cardButtonsGroup}>
                      <TouchableOpacity
                        activeOpacity={0.85}
                        style={styles.continueBtn}
                        onPress={() => router.push('/today-session' as any)}
                      >
                        <View style={styles.playIconCircle}>
                          <Ionicons name="play" size={14} color="#003D9B" />
                        </View>
                        <Text style={styles.continueBtnText}>Continue Session</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.viewDetailsBtn}
                        onPress={() =>
                          router.push({
                            pathname: '/recovery-program-details' as any,
                            params: { assignmentId: assignment.id },
                          })
                        }
                      >
                        <Text style={styles.viewDetailsBtnText}>View Details</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
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
            <Text style={styles.bannerSubtitle}>{data.consultBanner.subtitle}</Text>

            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.bookConsultBtn}
              onPress={() => router.push('/service-selection' as any)}
            >
              <Text style={styles.bookConsultBtnText}>{data.consultBanner.buttonText}</Text>
            </TouchableOpacity>
          </LinearGradient>
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

  /* REAL DATA CARDS */
  cardsContainer: {
    gap: 16,
    marginBottom: Spacing.xl,
  },

  /* EMPTY STATE */
  emptyStateBox: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
    marginBottom: Spacing.xl,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.bold,
    color: '#051A3E',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: Typography.fontWeight.medium,
  },

  /* ADHERENCE BADGE */
  adherenceBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EBF5FF',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 64,
  },
  adherenceValue: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },
  adherenceLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: Typography.fontWeight.medium,
    marginTop: 2,
  },
});

export default MyRecoveryProgramsScreen;

