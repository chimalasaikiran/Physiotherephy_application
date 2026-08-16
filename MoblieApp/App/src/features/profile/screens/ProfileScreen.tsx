import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Image,
  Share,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';
import { Strings } from '@/constants';
import { BottomNavBar, TabKey } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/config/firebase';
import { subscribeToPatientAssignments, MobileProgramAssignment } from '@/api/programService';
import { promptAndPickImage } from '../../../utils/imagePickerHelper';

interface ProfileScreenProps {
  hideBottomNavBar?: boolean;
  onTabPress?: (tab: TabKey) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ hideBottomNavBar = false, onTabPress }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userProfile, user, signOutUser, updateAvatar } = useAuth();
  const [assignedPrograms, setAssignedPrograms] = useState<MobileProgramAssignment[]>([]);

  useEffect(() => {
    let isMounted = true;
    const uid = auth.currentUser?.uid || user?.uid;
    if (!uid) return;

    const unsub = subscribeToPatientAssignments(uid, (assignments) => {
      if (isMounted) {
        setAssignedPrograms(assignments);
      }
    });

    return () => {
      isMounted = false;
      unsub();
    };
  }, [user?.uid]);

  const activeAssignment = assignedPrograms.length > 0 ? assignedPrograms[0] : null;

  const currentProgramTitle = activeAssignment?.programTitle || 'No Active Program';
  const currentWeekNum = activeAssignment?.currentWeek || 1;
  const totalWeeksNum = activeAssignment?.totalWeeks || 8;
  const progressPercent = activeAssignment ? activeAssignment.progressPercent : 0;
  const completedExercisesCount = activeAssignment?.completedExercises?.length || 0;
  const totalExercisesCount = activeAssignment
    ? (activeAssignment.programDetails?.weeks && activeAssignment.programDetails.weeks.length > 0
        ? activeAssignment.programDetails.weeks.reduce((acc, w) => acc + (w.exercises?.length || 0), 0)
        : Number(activeAssignment.programDetails?.exercisesCount || activeAssignment.programDetails?.totalExercises || 10))
    : 0;
  const recoveryStatusText = activeAssignment
    ? `${activeAssignment.status.toUpperCase()} • ${activeAssignment.assignmentStatus}`
    : 'No Program Assigned';

  const handleAvatarChange = async () => {
    const selectedUri = await promptAndPickImage();
    if (selectedUri) {
      await updateAvatar(selectedUri);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Check out my recovery progress on ONE MEDICAL!',
      });
    } catch (error) {
      console.log('Error sharing profile:', error);
    }
  };

  const handleTabPress = (tab: TabKey) => {
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

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await signOutUser();
            router.replace('/login' as any);
          },
        },
      ]
    );
  };

  const p = Strings.profileDetails;
  const displayName = userProfile?.fullName || 'User Profile';
  const displayPhone = userProfile?.phone || user?.phoneNumber || p.userMeta;
  const programName = userProfile?.primaryConcernId
    ? userProfile.primaryConcernId.replace('_', ' ').toUpperCase()
    : p.programName;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent />

      {/* HEADER BAR */}
      <View style={[styles.header, { paddingTop: insets.top + 4, height: 56 + insets.top }]}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.headerIconButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color="#003D9B" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>{p.headerTitle}</Text>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.headerIconButton}
            onPress={handleShare}
            accessibilityRole="button"
            accessibilityLabel="Share profile"
          >
            <Ionicons name="share-outline" size={22} color="#003D9B" />
          </TouchableOpacity>
        </View>

        {/* SCROLLABLE MAIN CONTENT */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 110 + Math.max(insets.bottom, 12) },
          ]}
        >
          {/* USER INFO TOP SECTION */}
          <View style={styles.userInfoSection}>
            {/* AVATAR WITH CAMERA BADGE & VERIFIED CHECK BADGE */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.avatarWrapper}
              onPress={handleAvatarChange}
              accessibilityRole="button"
              accessibilityLabel="Change profile photo"
            >
              <Image
                source={
                  userProfile?.avatarUri
                    ? { uri: userProfile.avatarUri }
                    : require('../../../assets/images/sanya_avatar.png')
                }
                style={styles.avatarImage}
                resizeMode="cover"
              />
              <View style={styles.cameraBadgeButton}>
                <Ionicons name="camera-outline" size={14} color="#FFFFFF" />
              </View>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-sharp" size={10} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            {/* NAME & SUBTITLE */}
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.userMeta}>{displayPhone}</Text>

            {/* PROGRAM TAG PILL */}
            <View style={styles.programBadge}>
              <Ionicons name="medical" size={14} color="#0D9488" style={{ marginRight: 6 }} />
              <Text style={styles.programBadgeText}>{programName}</Text>
            </View>

            {/* EDIT PROFILE BUTTON */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.editProfileButton}
              onPress={() => router.push('/edit-profile' as any)}
            >
              <Text style={styles.editProfileText}>{p.editProfileBtn}</Text>
            </TouchableOpacity>
          </View>

          {/* COMPLETED PROFILE DETAILS SUMMARY CARD */}
          {(userProfile?.height || userProfile?.weight || userProfile?.gender || userProfile?.dob) && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>MY HEALTH PROFILE DETAILS</Text>
              <View style={styles.detailsCard}>
                <View style={styles.detailsGrid}>
                  {userProfile?.gender && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>GENDER</Text>
                      <Text style={styles.detailValue}>
                        {userProfile.gender.charAt(0).toUpperCase() + userProfile.gender.slice(1)}
                      </Text>
                    </View>
                  )}

                  {userProfile?.dob && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>DOB / AGE</Text>
                      <Text style={styles.detailValue}>{userProfile.dob}</Text>
                    </View>
                  )}

                  {userProfile?.height && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>HEIGHT</Text>
                      <Text style={styles.detailValue}>{userProfile.height} cm</Text>
                    </View>
                  )}

                  {userProfile?.weight && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>WEIGHT</Text>
                      <Text style={styles.detailValue}>{userProfile.weight} kg</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* 1. RECOVERY SNAPSHOT SECTION */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{p.recoverySnapshot.sectionTitle}</Text>

            <View style={styles.snapshotCard}>
              {/* TOP ROW: SCORE & ACTIVE PILLS */}
              <View style={styles.snapshotTopRow}>
                <View>
                  <Text style={styles.scoreLabel}>OVERALL RECOVERY PROGRESS</Text>
                  <Text style={styles.scoreValue}>{progressPercent}%</Text>
                </View>

                <View style={styles.activePillsContainer}>
                  <View style={styles.iconCircleDumbbell}>
                    <Ionicons name="barbell-outline" size={14} color="#003D9B" />
                  </View>
                  <Text style={styles.activeStatusText}>{recoveryStatusText}</Text>
                </View>
              </View>

              {/* MIDDLE ROW: PROGRAM METRICS */}
              <View style={styles.snapshotMetricsRow}>
                <View style={[styles.metricColumn, { flex: 1.4 }]}>
                  <Text style={styles.metricLabel}>CURRENT PROGRAM</Text>
                  <Text style={styles.metricMainText} numberOfLines={1}>
                    {currentProgramTitle}
                  </Text>
                  <Text style={styles.metricSubText}>
                    Week {currentWeekNum} of {totalWeeksNum}
                  </Text>
                </View>

                <View style={styles.metricColumn}>
                  <Text style={styles.metricLabel}>EXERCISES COMPLETED</Text>
                  <Text style={styles.metricMainText}>
                    {completedExercisesCount} / {totalExercisesCount}
                  </Text>
                  <Text style={styles.metricSubText}>
                    {totalExercisesCount > 0 ? `${Math.round((completedExercisesCount / totalExercisesCount) * 100)}%` : '0%'}
                  </Text>
                </View>
              </View>

              {/* BOTTOM ACTION LINK */}
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.viewProgressRow}
                onPress={() => {
                  if (activeAssignment?.id) {
                    router.push({
                      pathname: '/recovery-program-details' as any,
                      params: { assignmentId: activeAssignment.id },
                    });
                  } else {
                    router.push('/recovery' as any);
                  }
                }}
              >
                <Text style={styles.viewProgressText}>View Full Recovery Program</Text>
                <Ionicons name="chevron-forward" size={16} color="#003D9B" />
              </TouchableOpacity>
            </View>
          </View>

          {/* 2. QUICK ACCESS SECTION */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{p.quickAccess.sectionTitle}</Text>

            <View style={styles.quickAccessGrid}>
              {p.quickAccess.items.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.8}
                  style={styles.quickAccessCard}
                  onPress={() => {
                    if (item.id === 'medical_info') {
                      router.push('/medical-info' as any);
                    } else if (item.id === 'medical_reports') {
                      router.push('/medical-reports' as any);
                    } else if (item.id === 'payments_invoices') {
                      router.push('/payments-invoices' as any);
                    } else if (item.id === 'saved_specialists') {
                      router.push('/saved-specialists' as any);
                    } else {
                      Alert.alert((item as any).title?.replace('\n', ' ') || 'Section', 'Opening section...');
                    }
                  }}
                >
                  <View style={styles.quickAccessIconCircle}>
                    <Ionicons name={item.icon as any} size={22} color="#003D9B" />
                  </View>
                  <Text style={styles.quickAccessTitle}>{item.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 3. ACCOUNT SETTINGS SECTION */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{p.accountSettings.sectionTitle}</Text>

            <View style={styles.settingsCard}>
              {p.accountSettings.items.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.7}
                  style={[
                    styles.settingItemRow,
                    index < p.accountSettings.items.length - 1 && styles.settingBorderBottom,
                  ]}
                  onPress={() => {
                    if (item.id === 'notification_prefs') {
                      router.push('/notification-preferences' as any);
                    } else if (item.id === 'privacy_security') {
                      router.push('/privacy-security' as any);
                    } else if (item.id === 'help_support') {
                      router.push('/help-support' as any);
                    } else if (item.id === 'about_one_medical') {
                      router.push('/about' as any);
                    } else {
                      Alert.alert((item as any).title, `Navigating to ${(item as any).title}`);
                    }
                  }}
                >
                  <View style={styles.settingLeft}>
                    <Ionicons name={item.icon as any} size={22} color="#003D9B" style={styles.settingIcon} />
                    <Text style={styles.settingTitle}>{item.title}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* LOG OUT BUTTON */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>{p.logoutBtn}</Text>
          </TouchableOpacity>

          {/* VERSION LABEL */}
          <Text style={styles.versionText}>{p.versionText}</Text>
        </ScrollView>

        {/* BOTTOM NAVIGATION TAB BAR */}
        {!hideBottomNavBar && <BottomNavBar activeTab="profile" onTabPress={handleTabPress} />}
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
    backgroundColor: '#FAFBFD',
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
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },

  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },

  /* USER INFO TOP */
  userInfoSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 14,
  },
  avatarImage: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 3,
    borderColor: '#E2E8F0',
  },
  cameraBadgeButton: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#003D9B',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  verifiedBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 22,
    fontWeight: Typography.fontWeight.bold,
    color: '#051A3E',
    marginBottom: 4,
  },
  userMeta: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: '#64748B',
    marginBottom: 12,
  },
  programBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
    marginBottom: 16,
  },
  programBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: '#0D9488',
  },
  editProfileButton: {
    backgroundColor: '#003D9B',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 9999,
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  editProfileText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
  },

  /* SECTION GENERIC */
  sectionContainer: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold,
    color: '#64748B',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginLeft: 4,
  },

  /* RECOVERY SNAPSHOT CARD */
  snapshotCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  snapshotTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  scoreLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: '#64748B',
    marginBottom: 2,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },
  activePillsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconCircleDumbbell: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleLightning: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  activeStatusText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semiBold,
    color: '#0F172A',
  },
  snapshotMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    marginBottom: 14,
  },
  metricColumn: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    color: '#94A3B8',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  metricMainText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
  },
  metricSubText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
    marginTop: 1,
  },
  viewProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  viewProgressText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },

  /* QUICK ACCESS GRID */
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAccessCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: Spacing.md,
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  quickAccessIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  quickAccessTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 16,
  },

  /* ACCOUNT SETTINGS */
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  settingItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  settingBorderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 14,
  },
  settingTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: '#0F172A',
  },

  /* LOGOUT & VERSION */
  logoutButton: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  logoutText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: '#DC2626',
  },
  versionText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 12,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 14,
  },
  detailItem: {
    width: '50%',
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
  },
});

export default ProfileScreen;
