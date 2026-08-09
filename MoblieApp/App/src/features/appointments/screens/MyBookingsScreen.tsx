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
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';
import { Strings } from '@/constants';
import {
  BookingItem,
  BookingStatus,
  InitialBookingsData,
} from '@/constants';
import { BookingCard } from '@/features/appointments';
import { BookingDetailsModal } from '@/features/appointments';
import { BottomNavBar, TabKey } from '@/components';

type FilterTab = 'All' | 'Upcoming' | 'Completed' | 'Cancelled';

interface MyBookingsScreenProps {
  hideBottomNavBar?: boolean;
  onTabPress?: (tab: TabKey) => void;
}

export const MyBookingsScreen: React.FC<MyBookingsScreenProps> = ({ hideBottomNavBar = false, onTabPress }) => {
  const router = useRouter();
  const params = useLocalSearchParams<{ bookingId?: string }>();
  const insets = useSafeAreaInsets();

  const [bookings, setBookings] = useState<BookingItem[]>(InitialBookingsData);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeNavTab, setActiveNavTab] = useState<TabKey>('bookings');

  // Filtered List based on active tab and search query
  const filteredBookings = useMemo(() => {
    return bookings.filter((item) => {
      // 1. Status Filter
      if (activeFilter !== 'All' && item.status !== activeFilter) {
        return false;
      }
      // 2. Search Query Filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const docName = item.doctorName.toLowerCase();
        const specialty = item.doctorSpecialty.toLowerCase();
        const service = item.serviceTitle.toLowerCase();
        const idStr = item.id.toLowerCase();
        return (
          docName.includes(query) ||
          specialty.includes(query) ||
          service.includes(query) ||
          idStr.includes(query)
        );
      }
      return true;
    });
  }, [bookings, activeFilter, searchQuery]);

  // Counts for tab badges
  const counts = useMemo(() => {
    return {
      All: bookings.length,
      Upcoming: bookings.filter((b) => b.status === 'Upcoming').length,
      Completed: bookings.filter((b) => b.status === 'Completed').length,
      Cancelled: bookings.filter((b) => b.status === 'Cancelled').length,
    };
  }, [bookings]);

  const handleCardPress = (booking: BookingItem) => {
    setSelectedBooking(booking);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedBooking(null);
  };

  const handleBookNewAppointment = () => {
    handleCloseModal();
    router.push('/service-selection' as any);
  };

  const handleCancelBooking = (booking: BookingItem) => {
    handleCloseModal();
    router.push({
      pathname: '/cancel-appointment' as any,
      params: {
        bookingId: booking.id,
        doctorId: booking.doctorId,
        doctorName: booking.doctorName,
        doctorSpecialty: booking.doctorSpecialty,
        serviceTitle: booking.serviceTitle,
        fullDate: booking.fullDate,
        timeSlot: booking.timeSlot,
        clinicName: booking.placeTitle,
        clinicAddress: booking.location,
        avatarImageName: booking.avatarImageName,
        feeStr: booking.feeStr,
      },
    });
  };

  const handleRescheduleBooking = (booking: BookingItem) => {
    handleCloseModal();
    router.push({
      pathname: '/reschedule' as any,
      params: {
        bookingId: booking.id,
        doctorId: booking.doctorId,
        doctorName: booking.doctorName,
        doctorSpecialty: booking.doctorSpecialty,
        serviceTitle: booking.serviceTitle,
        fullDate: booking.fullDate,
        timeSlot: booking.timeSlot,
        clinicName: booking.placeTitle,
        clinicAddress: booking.location,
        avatarImageName: booking.avatarImageName,
        feeStr: booking.feeStr,
      },
    });
  };

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.container}>
        {/* Header Bar */}
        <View
          style={[
            styles.header,
            {
              paddingTop: Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 16) + 4,
              height: 56 + Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 16) + 4,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            style={styles.backBtn}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color={Colors.darkBlue} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>{Strings.myBookings.headerTitle}</Text>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={handleBookNewAppointment}
            style={styles.addBookingBtn}
            accessibilityLabel="Book new appointment"
          >
            <Ionicons name="add-sharp" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={18} color="#94A3B8" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={Strings.myBookings.searchPlaceholder}
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
        </View>

        {/* Segmented Status Filter Tabs */}
        <View style={styles.filterTabSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterTabScroll}
          >
            {(['All', 'Upcoming', 'Completed', 'Cancelled'] as FilterTab[]).map((tab) => {
              const isActive = activeFilter === tab;
              const count = counts[tab];
              return (
                <TouchableOpacity
                  key={tab}
                  activeOpacity={0.8}
                  onPress={() => setActiveFilter(tab)}
                  style={[styles.filterChip, isActive && styles.activeFilterChip]}
                >
                  <Text style={[styles.filterChipText, isActive && styles.activeFilterChipText]}>
                    {tab}
                  </Text>
                  <View style={[styles.countBadge, isActive && styles.activeCountBadge]}>
                    <Text style={[styles.countBadgeText, isActive && styles.activeCountBadgeText]}>
                      {count}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Main List & Empty State Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 100 + Math.max(insets.bottom, 12) },
          ]}
        >
          {filteredBookings.length > 0 ? (
            <View style={styles.listContainer}>
              {filteredBookings.map((item) => (
                <BookingCard
                  key={item.id}
                  booking={item}
                  onPress={handleCardPress}
                />
              ))}
            </View>
          ) : (
            /* Professional Empty State View */
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyIllustrationCircle}>
                <View style={styles.emptyInnerCircle}>
                  <Ionicons name="calendar-clear-outline" size={48} color={Colors.primary} />
                </View>
              </View>

              <Text style={styles.emptyTitle}>{Strings.myBookings.emptyState.title}</Text>
              <Text style={styles.emptySubtitle}>{Strings.myBookings.emptyState.subtitle}</Text>

              <TouchableOpacity
                activeOpacity={0.88}
                style={styles.bookCtaBtn}
                onPress={handleBookNewAppointment}
              >
                <Ionicons name="add-circle-outline" size={20} color={Colors.white} />
                <Text style={styles.bookCtaBtnText}>
                  {Strings.myBookings.emptyState.bookButton}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Booking Details Modal */}
        <BookingDetailsModal
          visible={isModalVisible}
          booking={selectedBooking}
          onClose={handleCloseModal}
          onCancel={handleCancelBooking}
          onReschedule={handleRescheduleBooking}
          onBookAgain={handleBookNewAppointment}
        />

        {/* Bottom Navigation Menu Bar */}
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
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
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
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
  },
  addBookingBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  searchSection: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    backgroundColor: Colors.white,
  },
  searchContainer: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 9999,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: Colors.darkBlue,
  },
  filterTabSection: {
    backgroundColor: Colors.white,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  filterTabScroll: {
    paddingHorizontal: Spacing.xl,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: '#F1F5F9',
    gap: 6,
  },
  activeFilterChip: {
    backgroundColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.medium,
    color: '#475569',
  },
  activeFilterChipText: {
    color: Colors.white,
    fontWeight: Typography.fontWeight.bold,
  },
  countBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 9999,
  },
  activeCountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: '#475569',
  },
  activeCountBadgeText: {
    color: Colors.white,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  listContainer: {
    gap: 2,
  },

  /* EMPTY STATE STYLING */
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
    marginTop: 20,
  },
  emptyIllustrationCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  emptyInnerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
    paddingHorizontal: 12,
  },
  bookCtaBtn: {
    height: 50,
    paddingHorizontal: 24,
    borderRadius: 9999,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  bookCtaBtnText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
});

export default MyBookingsScreen;
