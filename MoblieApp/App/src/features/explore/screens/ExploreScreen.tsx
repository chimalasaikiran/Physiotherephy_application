import React, { useState, useEffect, useCallback } from 'react';
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
  Dimensions,
  Alert,
  Platform,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors } from '@/constants';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';
import { Strings } from '@/constants';
import { BottomNavBar, TabKey } from '@/components';
import { fetchUserAppointmentsViaBackend } from '@/api/appointmentApi';
import { mobileRealtimeSync } from '@/api/syncApi';
import { auth } from '@/config/firebase';
import { fetchUserProgressStats } from '@/api/recoveryApi';
import { subscribeToTherapists } from '@/api/therapistService';
import type { Therapist } from '@/api/therapistService';
import { subscribeToPatientAssignments, toggleExerciseComplete, MobileProgramAssignment } from '@/api/programService';
const toggleExerciseInFirestore = (_id: string, _state: boolean) => {};


import { useAuth } from '@/context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface ExerciseItem {
  id: string;
  name: string;
  duration: string;
  completed: boolean;
}

interface ExploreScreenProps {
  hideBottomNavBar?: boolean;
  onTabPress?: (tab: TabKey) => void;
}

const DEFAULT_THERAPISTS = [
  {
    id: 'doc-1',
    name: 'Dr. Ananya Sharma',
    degree: 'MPT (Ortho), BPT',
    experience: '8+ Years Exp • Sports Rehab',
    rating: 4.9,
    availability: 'Available Today',
    avatarUrl: 'https://images.unsplash.com/photo-1594824813566-88855ce78c00?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'doc-2',
    name: 'Dr. Rohan Kapoor',
    degree: 'MPT (Neuro), BPT',
    experience: '10+ Years Exp • Spine Care',
    rating: 4.8,
    availability: 'Available Today',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'doc-3',
    name: 'Dr. Dev Mukherjee',
    degree: 'MPT (Sports), BPT',
    experience: '6+ Years Exp • ACL Rehab',
    rating: 4.9,
    availability: 'Busy',
    avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
  },
];

export const ExploreScreen: React.FC<ExploreScreenProps> = ({ hideBottomNavBar = false, onTabPress }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [refreshing, setRefreshing] = useState(false);
  const [therapistsList, setTherapistsList] = useState<Therapist[]>([]);

  const [assignedPrograms, setAssignedPrograms] = useState<MobileProgramAssignment[]>([]);
  const [upcomingAppointment, setUpcomingAppointment] = useState<any>(null);
  const [userProgress, setUserProgress] = useState<{
    completedExerciseIds: string[];
    recoveryScore: number;
  }>({
    completedExerciseIds: [],
    recoveryScore: 0,
  });

  const activeAssignment = assignedPrograms.length > 0 ? assignedPrograms[0] : null;

  // Derive active program exercises
  const currentWeekObj = activeAssignment?.programDetails?.weeks?.find(
    (w) => w.weekNumber === (activeAssignment.currentWeek || 1)
  ) || activeAssignment?.programDetails?.weeks?.[0];

  const rawWeekExercises = currentWeekObj?.exercises || [];

  const baseExercises = rawWeekExercises.length > 0
    ? rawWeekExercises.map((ex) => ({
        id: ex.id || ex.name,
        name: ex.name,
        duration: ex.duration || (ex.sets && ex.reps ? `${ex.sets} sets × ${ex.reps}` : '5 mins'),
        completed: Boolean(
          activeAssignment?.completedExercises?.includes(ex.id) ||
          activeAssignment?.completedExercises?.includes(ex.name)
        ),
      }))
    : Strings.explore.exercises.items.map((ex: any) => ({
        ...ex,
        completed: Boolean(
          activeAssignment?.completedExercises?.includes(ex.id) ||
          activeAssignment?.completedExercises?.includes(ex.name) ||
          userProgress.completedExerciseIds.includes(ex.id)
        ),
      }));

  const totalProgramExercises = activeAssignment
    ? (activeAssignment.programDetails?.weeks && activeAssignment.programDetails.weeks.length > 0
        ? activeAssignment.programDetails.weeks.reduce((acc, w) => acc + (w.exercises?.length || 0), 0)
        : Number(activeAssignment.programDetails?.exercisesCount || activeAssignment.programDetails?.totalExercises || 10))
    : baseExercises.length;

  const completedCount = activeAssignment
    ? (activeAssignment.completedExercises?.length || 0)
    : baseExercises.filter((e) => e.completed).length;

  const remainingCount = Math.max(0, totalProgramExercises - completedCount);
  const progressRatio = totalProgramExercises > 0 ? Math.min(1, completedCount / totalProgramExercises) : 0;
  const computedScore = activeAssignment ? activeAssignment.progressPercent : Math.round(progressRatio * 100);

  // Real-Time Appointments & Progress listener on Screen Focus
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      const currentUser = auth.currentUser;
      const userId = currentUser?.uid || 'user_demo_123';

      // Fetch initial upcoming appointment
      fetchUserAppointmentsViaBackend(userId)
        .then((firestoreBookings) => {
          if (isMounted) {
            if (firestoreBookings && firestoreBookings.length > 0) {
              const upcoming = firestoreBookings.find(
                (b: any) => !b.status || b.status === 'Upcoming' || b.status === 'Pending' || b.status === 'Confirmed'
              );
              setUpcomingAppointment(upcoming || null);
            } else {
              setUpcomingAppointment(null);
            }
          }
        })
        .catch((err) => {
          console.warn('Error fetching appointments in ExploreScreen:', err);
        });

      // Real-Time Appointments listener
      const unsubAppts = mobileRealtimeSync.subscribeUserCollection<any[]>(
        'appointments',
        userId,
        (fsAppointments) => {
          if (isMounted && Array.isArray(fsAppointments)) {
            const upcoming = fsAppointments.find(
              (b: any) => !b.status || b.status === 'Upcoming' || b.status === 'Pending' || b.status === 'Confirmed'
            );
            setUpcomingAppointment(upcoming || null);
          }
        }
      );

      // Real-Time Patient Program Assignments listener
      const unsubAssignments = subscribeToPatientAssignments(
        userId,
        (assignments) => {
          if (isMounted) {
            setAssignedPrograms(assignments);
          }
        },
        (err) => console.warn('Assignments subscription error in ExploreScreen:', err)
      );

      fetchUserProgressStats(userId)
        .then((progressData) => {
          if (isMounted && progressData) {
            setUserProgress({
              completedExerciseIds: progressData.completedExerciseIds || [],
              recoveryScore: progressData.recoveryScore ?? progressData.recoveryPercentage ?? 68,
            });
          }
        })
        .catch((err) => {
          console.warn('Error fetching user progress in ExploreScreen:', err);
        });

      // Real-time Firestore listener for Therapists using typed service
      const unsubscribeTherapists = subscribeToTherapists(
        (therapists) => {
          if (isMounted) {
            setTherapistsList(therapists.filter((t) => t.status === 'ACTIVE'));
          }
        },
        (err) => console.warn('Therapists listener error:', err)
      );

      return () => {
        isMounted = false;
        unsubAppts();
        unsubAssignments();
        unsubscribeTherapists();
      };
    }, [])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    const currentUser = auth.currentUser;
    const userId = currentUser?.uid || 'user_demo_123';

    try {
      const [apiBookings, progressData] = await Promise.all([
        fetchUserAppointmentsViaBackend(userId).catch(() => null),
        fetchUserProgressStats(userId).catch(() => null),
      ]);

      if (apiBookings && apiBookings.length > 0) {
        const upcoming = apiBookings.find(
          (b: any) => !b.status || b.status === 'Upcoming' || b.status === 'Pending' || b.status === 'Confirmed'
        );
        setUpcomingAppointment(upcoming || null);
      }
      if (progressData) {
        setUserProgress({
          completedExerciseIds: progressData.completedExerciseIds || [],
          recoveryScore: progressData.recoveryScore ?? progressData.recoveryPercentage ?? 68,
        });
      }
    } catch (err) {
      console.warn('Refresh error in ExploreScreen:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const toggleExercise = async (id: string) => {
    if (activeAssignment) {
      try {
        await toggleExerciseComplete(activeAssignment.id, id, activeAssignment);
      } catch (err) {
        console.warn('Error toggling exercise in ExploreScreen:', err);
      }
    } else {
      const isCurrentlyCompleted = userProgress.completedExerciseIds.includes(id);
      toggleExerciseInFirestore(id, isCurrentlyCompleted);
    }
  };

  const handleTabPress = (tab: TabKey) => {
    setActiveTab(tab);
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

  const { userProfile } = useAuth();
  const userName = userProfile?.fullName?.trim() || Strings.explore.userNameDefault || 'User';

  const getGreetingHeading = () => {
    const hour = new Date().getHours();
    let timeGreeting = 'Good Morning';
    if (hour >= 12 && hour < 17) {
      timeGreeting = 'Good Afternoon';
    } else if (hour >= 17 || hour < 4) {
      timeGreeting = 'Good Evening';
    }
    return `${timeGreeting}, ${userName} 👋`;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent />

      {/* MAIN SCROLLABLE CONTENT */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#003D9B']}
            tintColor="#003D9B"
          />
        }
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + Spacing.xs,
            paddingBottom: 110 + Math.max(insets.bottom, 12),
          },
        ]}
        bounces={true}
      >
          {/* 1. HEADER SECTION */}
          <View style={styles.header}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.headerLeft}
              onPress={() => router.push('/profile' as any)}
            >
              <Image
                source={
                  userProfile?.avatarUri
                    ? { uri: userProfile.avatarUri }
                    : require('../../../assets/images/user_sagar_avatar.png')
                }
                style={styles.avatarImage}
                resizeMode="cover"
              />
              <View style={styles.headerTextGroup}>
                <Text style={styles.greetingText}>{getGreetingHeading()}</Text>
                <Text style={styles.subGreetingText}>{Strings.explore.subtitle}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.bellButton}
              onPress={() => router.push('/notifications' as any)}
            >
              <Ionicons name="notifications-outline" size={22} color="#1E293B" />
            </TouchableOpacity>
          </View>

          {/* 2. SEARCH BAR */}
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={18} color="#94A3B8" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={Strings.explore.searchPlaceholder}
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* 3. TODAY'S APPOINTMENT GRADIENT CARD */}
          <LinearGradient
            colors={['#003D9B', '#002970', '#001D54']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.appointmentCard}
          >
            {upcomingAppointment ? (
              <>
                <View style={styles.appointmentHeaderRow}>
                  <Text style={styles.appointmentTag}>UPCOMING APPOINTMENT</Text>
                  <View style={styles.dateBadge}>
                    <Ionicons name="calendar-outline" size={13} color="#FFFFFF" />
                    <Text style={styles.dateBadgeText}>{upcomingAppointment.fullDate || upcomingAppointment.dateStr || 'Scheduled'}</Text>
                  </View>
                </View>

                <Text style={styles.appointmentTime}>{upcomingAppointment.timeSlot || '10:00 AM'}</Text>

                <View style={styles.doctorInfoRow}>
                  <Ionicons name="person-outline" size={16} color="#93C5FD" style={styles.docIcon} />
                  <Text style={styles.doctorName}>{upcomingAppointment.doctorName || upcomingAppointment.therapistName}</Text>
                </View>
                <Text style={styles.doctorSpecialty}>{upcomingAppointment.doctorSpecialty || upcomingAppointment.serviceTitle}</Text>

                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={15} color="#60A5FA" style={styles.locIcon} />
                  <Text style={styles.locationText}>{upcomingAppointment.placeTitle || upcomingAppointment.location || 'ONE MEDICAL Clinic'}</Text>
                </View>

                <View style={styles.appointmentActionsRow}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.viewDetailsButton}
                    onPress={() => router.push('/my-bookings' as any)}
                  >
                    <Text style={styles.viewDetailsText}>View Bookings</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.directionsButton}
                    onPress={() => Alert.alert('Directions', 'Opening Maps navigation to Clinic')}
                  >
                    <Text style={styles.directionsText}>Get Directions</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <View style={styles.appointmentHeaderRow}>
                  <Text style={styles.appointmentTag}>TODAY'S APPOINTMENT</Text>
                  <View style={styles.dateBadge}>
                    <Ionicons name="calendar-outline" size={13} color="#FFFFFF" />
                    <Text style={styles.dateBadgeText}>NO BOOKINGS</Text>
                  </View>
                </View>

                <Text style={styles.doctorName}>No Appointments Scheduled</Text>
                <Text style={[styles.doctorSpecialty, { marginLeft: 0 }]}>
                  You have no upcoming physiotherapy or doctor consultations yet.
                </Text>

                <View style={styles.appointmentActionsRow}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.viewDetailsButton}
                    onPress={() => router.push('/service-selection' as any)}
                  >
                    <Text style={styles.viewDetailsText}>Book Appointment</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </LinearGradient>

          {/* 4. YOUR RECOVERY SECTION */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{Strings.explore.recovery.title}</Text>
            <Text style={styles.sectionSubtitle}>{Strings.explore.recovery.subtitle}</Text>

            {/* CIRCULAR RECOVERY METER */}
            <View style={styles.recoveryMeterCard}>
              <View style={styles.circularMeterWrapper}>
                <View style={styles.circularMeterOuter}>
                  <View style={styles.circularMeterInner}>
                    <Text style={styles.meterPercentText}>
                      {computedScore}%
                    </Text>
                    <Text style={styles.meterSubText}>OVERALL</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.recoveryScoreTitle}>
                {Strings.explore.recovery.scoreLabel}
              </Text>

              <View style={styles.trendRow}>
                <Text style={styles.trendLabel}>{Strings.explore.recovery.trendLabel}</Text>
                <View style={styles.trendBadge}>
                  <Ionicons name="trending-up-outline" size={13} color="#0284C7" />
                  <Text style={styles.trendBadgeText}>{Strings.explore.recovery.trendTag}</Text>
                </View>
              </View>

              <View style={styles.weekTagPill}>
                <Ionicons name="shield-checkmark-outline" size={14} color="#003D9B" />
                <Text style={styles.weekTagText}>{Strings.explore.recovery.weekTag}</Text>
              </View>

              <Text style={styles.recoveryQuote}>{Strings.explore.recovery.quote}</Text>
            </View>
          </View>

          {/* 5. TODAY'S EXERCISES */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{Strings.explore.exercises.title}</Text>
            <View style={styles.exerciseMetricsRow}>
              <View style={styles.timeMetric}>
                <Ionicons name="time-outline" size={15} color="#64748B" />
                <Text style={styles.timeMetricText}>{Strings.explore.exercises.duration}</Text>
              </View>
              <View style={styles.remainingMetric}>
                <Text style={styles.remainingNumber}>{remainingCount}</Text>
                <Text style={styles.remainingText}> {Strings.explore.exercises.remainingLabel}</Text>
              </View>
            </View>

            {/* PROGRESS BAR */}
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progressRatio * 100}%` },
                ]}
              />
            </View>

            {/* EXERCISE LIST */}
            <View style={styles.exerciseList}>
              {baseExercises.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.8}
                  onPress={() => toggleExercise(item.id)}
                  style={[
                    styles.exerciseItemCard,
                    item.completed && styles.exerciseCompletedCard,
                  ]}
                >
                  <View style={styles.exerciseLeft}>
                    <View
                      style={[
                        styles.exerciseIconBox,
                        item.completed && styles.completedIconBox,
                      ]}
                    >
                      <Ionicons
                        name={item.completed ? 'checkmark-circle' : 'barbell-outline'}
                        size={20}
                        color={item.completed ? '#0284C7' : '#003D9B'}
                      />
                    </View>
                    <View>
                      <Text
                        style={[
                          styles.exerciseName,
                          item.completed && styles.completedText,
                        ]}
                      >
                        {item.name}
                      </Text>
                      <Text style={styles.exerciseDuration}>{item.duration}</Text>
                    </View>
                  </View>

                  {item.completed ? (
                    <View style={styles.completedBadgeRow}>
                      <View style={styles.completedTag}>
                        <Text style={styles.completedTagText}>COMPLETED</Text>
                      </View>
                      <Ionicons name="checkmark-circle-outline" size={20} color="#0284C7" />
                    </View>
                  ) : (
                    <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* START TODAY'S SESSION CTA */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.startSessionBtn}
              onPress={() => router.push('/today-session' as any)}
            >
              <Ionicons name="play" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.startSessionText}>{Strings.explore.exercises.startSession}</Text>
            </TouchableOpacity>
          </View>

          {/* 6. QUICK ACTIONS GRID (2x2) */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              {Strings.explore.quickActions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  activeOpacity={0.8}
                  style={[styles.quickCard, { backgroundColor: action.bgColor }]}
                  onPress={() => {
                    if (action.id === 'book' || action.id === 'find') {
                      router.push('/service-selection' as any);
                    } else if (action.id === 'reports') {
                      router.push('/medical-reports' as any);
                    } else if (action.id === 'payments') {
                      router.push('/payments-invoices' as any);
                    } else {
                      Alert.alert((action as any).title || 'Action', (action as any).description || '');
                    }
                  }}
                >
                  <View style={styles.quickCardHeader}>
                    <View style={styles.quickIconBox}>
                      <Ionicons name={action.icon as any} size={22} color={action.iconColor} />
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
                  </View>
                  <Text style={styles.quickCardTitle}>{action.title}</Text>
                  <Text style={styles.quickCardSub}>{action.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 7. RECOMMENDED PHYSIOTHERAPISTS (HORIZONTAL SCROLL) */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>{Strings.explore.recommendedPhysio.title}</Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/service-selection' as any)}>
                <Text style={styles.viewAllText}>{Strings.explore.recommendedPhysio.viewAll}</Text>
              </TouchableOpacity>
            </View>

            {therapistsList.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.physioHorizontalList}
              >
                {therapistsList.map((doc: any) => (
                  <View key={doc.id} style={styles.physioCard}>
                    <View style={styles.physioImageContainer}>
                      <Image
                        source={
                          doc.avatarUrl
                            ? { uri: doc.avatarUrl }
                            : require('../../../assets/images/doctor_ananya.png')
                        }
                        style={styles.physioImage}
                        resizeMode="cover"
                      />

                      {/* Rating Badge Top Left */}
                      <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={12} color="#F59E0B" />
                        <Text style={styles.ratingText}>{(doc.rating || 5.0).toFixed(1)}</Text>
                      </View>

                      {/* Available Today Pill */}
                      {doc.availability === 'Available Today' && (
                        <View style={styles.availableBadge}>
                          <Text style={styles.availableText}>AVAILABLE TODAY</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.physioCardBody}>
                      <Text style={styles.physioName}>{doc.name}</Text>
                      <Text style={styles.physioTitle}>{doc.degree || doc.title || 'Physiotherapist'}</Text>
                      <Text style={styles.physioInfo}>{doc.experience || doc.info || 'Specialist'}</Text>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.bookPhysioBtn}
                        onPress={() => router.push('/service-selection' as any)}
                      >
                        <Text style={styles.bookPhysioBtnText}>Book Appointment</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyTherapistCard}>
                <Ionicons name="medical-outline" size={24} color="#94A3B8" />
                <Text style={styles.emptyTherapistText}>
                  No active therapists listed at the moment.
                </Text>
              </View>
            )}
          </View>

          {/* 8. TODAY'S RECOVERY TIP */}
          <View style={styles.sectionContainer}>
            <View style={styles.recoveryTipCard}>
              <Text style={styles.recoveryTipTitle}>{Strings.explore.recoveryTip.title}</Text>
              <Text style={styles.recoveryTipText}>{Strings.explore.recoveryTip.tip}</Text>
              <View style={styles.recoveryTipTagPill}>
                <Text style={styles.recoveryTipTagText}>{Strings.explore.recoveryTip.tag}</Text>
              </View>
            </View>
          </View>

          {/* 9. UPCOMING ACTIVITY */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>{Strings.explore.upcomingActivity.title}</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.viewAllText}>{Strings.explore.upcomingActivity.viewSchedule}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.upcomingCard}>
              {Strings.explore.upcomingActivity.items.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.8}
                  style={[
                    styles.upcomingItemRow,
                    index < Strings.explore.upcomingActivity.items.length - 1 && styles.upcomingBorderBottom,
                  ]}
                  onPress={() => Alert.alert(item.title, `${item.subtitle}\nTime: ${item.time} ${item.day}`)}
                >
                  <View style={styles.upcomingLeftTime}>
                    <Text style={styles.upcomingTime}>{item.time}</Text>
                    <Text style={styles.upcomingDay}>{item.day}</Text>
                  </View>

                  <View style={styles.upcomingIconBox}>
                    <Ionicons name={item.icon as any} size={18} color="#003D9B" />
                  </View>

                  <View style={styles.upcomingTextGroup}>
                    <Text style={styles.upcomingItemTitle}>{item.title}</Text>
                    <Text style={styles.upcomingItemSub}>{item.subtitle}</Text>
                  </View>

                  <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 10. NEED ASSISTANCE? */}
          <View style={styles.sectionContainer}>
            <View style={styles.assistanceCard}>
              <View style={styles.doctorAvatarCircle}>
                <Image
                  source={require('../../../assets/images/care_team_doctor.png')}
                  style={styles.careDoctorImg}
                  resizeMode="cover"
                />
              </View>
              <Text style={styles.assistanceTitle}>{Strings.explore.assistance.title}</Text>
              <Text style={styles.assistanceSubtitle}>{Strings.explore.assistance.subtitle}</Text>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.contactSupportBtn}
                onPress={() => Alert.alert('Support', 'Connecting you to ONE MEDICAL Care Team...')}
              >
                <Text style={styles.contactSupportText}>{Strings.explore.assistance.contactSupport}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.faqLink}
                onPress={() => Alert.alert('FAQ', 'Opening Frequently Asked Questions')}
              >
                <Text style={styles.faqText}>{Strings.explore.assistance.faq}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* SPACING FOR BOTTOM TAB BAR */}
          <View style={{ height: 24 }} />
        </ScrollView>

        {/* 11. BOTTOM NAVIGATION TAB BAR */}
        {!hideBottomNavBar && <BottomNavBar activeTab={activeTab} onTabPress={handleTabPress} />}
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
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: 20,
  },

  /* HEADER */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarImage: {
    width: 46,
    height: 46,
    borderRadius: 23,
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
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EEF2F6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* SEARCH BAR */
  searchContainer: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 9999,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: Spacing.lg,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: '#0F172A',
  },

  /* TODAY'S APPOINTMENT CARD */
  appointmentCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: Spacing.xl,
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  appointmentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  appointmentTag: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: '#93C5FD',
    letterSpacing: 0.8,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    gap: 4,
  },
  dateBadgeText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.semiBold,
    color: '#FFFFFF',
  },
  appointmentTime: {
    fontSize: 30,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  doctorInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  docIcon: {
    marginRight: 6,
  },
  doctorName: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  doctorSpecialty: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.regular,
    color: '#CBD5E1',
    marginBottom: 10,
    marginLeft: 22,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  locIcon: {
    marginRight: 6,
  },
  locationText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: '#E2E8F0',
  },
  appointmentActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  viewDetailsButton: {
    flex: 1,
    height: 42,
    backgroundColor: '#FFFFFF',
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },
  directionsButton: {
    flex: 1,
    height: 42,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  directionsText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
  },

  /* SECTION GENERIC */
  sectionContainer: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: '#051A3E',
  },
  sectionSubtitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.regular,
    color: '#64748B',
    marginTop: 2,
    marginBottom: Spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  viewAllText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },

  /* YOUR RECOVERY METER */
  recoveryMeterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  circularMeterWrapper: {
    marginBottom: Spacing.md,
  },
  circularMeterOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 10,
    borderColor: '#003D9B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularMeterInner: {
    alignItems: 'center',
  },
  meterPercentText: {
    fontSize: 32,
    fontWeight: Typography.fontWeight.bold,
    color: '#051A3E',
  },
  meterSubText: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginTop: -2,
  },
  recoveryScoreTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: '#051A3E',
    marginBottom: 6,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  trendLabel: {
    fontSize: Typography.fontSize.xs,
    color: '#64748B',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  trendBadgeText: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: '#0284C7',
  },
  weekTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    gap: 6,
    marginBottom: 12,
  },
  weekTagText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },
  recoveryQuote: {
    fontSize: Typography.fontSize.xs,
    fontStyle: 'italic',
    color: '#64748B',
    textAlign: 'center',
  },

  /* EXERCISES SECTION */
  exerciseMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 4,
  },
  timeMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeMetricText: {
    fontSize: Typography.fontSize.xs,
    color: '#64748B',
    fontWeight: Typography.fontWeight.medium,
  },
  remainingMetric: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  remainingNumber: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },
  remainingText: {
    fontSize: Typography.fontSize.xs,
    color: '#64748B',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#003D9B',
    borderRadius: 3,
  },
  exerciseList: {
    gap: 10,
    marginBottom: Spacing.lg,
  },
  exerciseItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  exerciseCompletedCard: {
    backgroundColor: '#F0FDFA',
    borderColor: '#CCFBF1',
  },
  exerciseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  exerciseIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedIconBox: {
    backgroundColor: '#E0F2FE',
  },
  exerciseName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: '#051A3E',
  },
  completedText: {
    color: '#64748B',
  },
  exerciseDuration: {
    fontSize: Typography.fontSize.xs,
    color: '#64748B',
    marginTop: 2,
  },
  completedBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  completedTag: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  completedTagText: {
    fontSize: 9,
    fontWeight: Typography.fontWeight.bold,
    color: '#0284C7',
    letterSpacing: 0.5,
  },
  startSessionBtn: {
    height: 50,
    backgroundColor: '#003D9B',
    borderRadius: 9999,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  startSessionText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
  },

  /* QUICK ACTIONS GRID */
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: Spacing.sm,
  },
  quickCard: {
    width: (SCREEN_WIDTH - Spacing.xl * 2 - 12) / 2,
    borderRadius: 20,
    padding: 16,
    justifyContent: 'space-between',
    height: 120,
  },
  quickCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quickIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickCardTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: '#051A3E',
    marginTop: 8,
  },
  quickCardSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },

  /* RECOMMENDED PHYSIO */
  physioHorizontalList: {
    gap: 14,
    paddingVertical: 4,
  },
  physioCard: {
    width: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  physioImageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  physioImage: {
    width: '100%',
    height: '100%',
  },
  ratingBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
    gap: 4,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: '#051A3E',
  },
  availableBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: '#38BDF8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  availableText: {
    fontSize: 9,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  physioCardBody: {
    padding: 14,
  },
  physioName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: '#051A3E',
  },
  physioTitle: {
    fontSize: Typography.fontSize.xs,
    color: '#64748B',
    marginTop: 2,
  },
  physioInfo: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
    marginBottom: 12,
  },
  bookPhysioBtn: {
    height: 38,
    backgroundColor: '#003D9B',
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookPhysioBtnText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
  },

  /* RECOVERY TIP */
  recoveryTipCard: {
    backgroundColor: '#F0FDFA',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  recoveryTipTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: '#051A3E',
    marginBottom: 6,
  },
  recoveryTipText: {
    fontSize: Typography.fontSize.xs,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 12,
  },
  recoveryTipTagPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  recoveryTipTagText: {
    fontSize: 9,
    fontWeight: Typography.fontWeight.bold,
    color: '#0284C7',
    letterSpacing: 0.6,
  },

  /* UPCOMING ACTIVITY */
  upcomingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  upcomingItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  upcomingBorderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  upcomingLeftTime: {
    width: 70,
  },
  upcomingTime: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: '#051A3E',
  },
  upcomingDay: {
    fontSize: 9,
    fontWeight: Typography.fontWeight.bold,
    color: '#94A3B8',
    marginTop: 2,
  },
  upcomingIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  upcomingTextGroup: {
    flex: 1,
  },
  upcomingItemTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: '#051A3E',
  },
  upcomingItemSub: {
    fontSize: Typography.fontSize.xs,
    color: '#64748B',
    marginTop: 2,
  },

  /* NEED ASSISTANCE */
  assistanceCard: {
    backgroundColor: '#EBF5FF',
    borderRadius: 24,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  doctorAvatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  careDoctorImg: {
    width: '100%',
    height: '100%',
  },
  assistanceTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: '#051A3E',
    marginBottom: 6,
  },
  assistanceSubtitle: {
    fontSize: Typography.fontSize.xs,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: Spacing.md,
  },
  contactSupportBtn: {
    width: '100%',
    height: 48,
    backgroundColor: '#003D9B',
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactSupportText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  faqLink: {
    paddingVertical: 4,
  },
  faqText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },

  /* BOTTOM NAVIGATION BAR */
  bottomNavContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
    paddingBottom: 8,
  },
  bottomNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabButton: {
    alignItems: 'center',
    flex: 1,
  },
  tabIconBadge: {
    width: 36,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTabBadge: {
    backgroundColor: '#EFF6FF',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.medium,
    color: '#64748B',
    marginTop: 2,
  },
  activeTabLabel: {
    color: '#003D9B',
    fontWeight: Typography.fontWeight.bold,
  },
  bottomHomeIndicator: {
    width: 134,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
  },
  emptyTherapistCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  emptyTherapistText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: '#64748B',
    textAlign: 'center',
  },
});

export default ExploreScreen;
