import React, { useState, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';
import { Strings } from '@/constants';
import { BookAppointmentHeader } from '@/features/appointments';
import { DoctorFilterChips } from '@/features/explore';
import { DoctorBookingCard, Doctor } from '@/features/appointments';
import { DateTimeSelectorModal } from '@/features/appointments';
import { PaymentSelectionModal, BookingDetails } from '@/features/appointments';
import { BookingSuccessModal } from '@/features/appointments';
import { BottomNavBar, TabKey } from '@/components';
import { EmptyStateView } from '@/components';
import { SkeletonLoader } from '@/components';
import { fetchTherapistsFromApi } from '@/api/appointmentApi';
import { subscribeToTherapists, Therapist } from '@/api/therapistService';


export const BookAppointmentScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ doctorId?: string; serviceId?: string; serviceTitle?: string }>();

  const selectedServiceTitle = params.serviceTitle || '';
  const selectedServiceId = params.serviceId || '';

  const [doctorsList, setDoctorsList] = useState<Doctor[]>([...Strings.booking.doctors as unknown as Doctor[]]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterId, setActiveFilterId] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<TabKey>('schedule');
  const [isLoading, setIsLoading] = useState(true);

  // Booking Flow Modals state
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<Doctor | null>(null);
  const [isDateTimeModalVisible, setIsDateTimeModalVisible] = useState(false);
  const [pendingBookingDetails, setPendingBookingDetails] = useState<BookingDetails | null>(null);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<{
    bookingDetails: BookingDetails;
    paymentMode: 'online' | 'clinic';
    paymentMethodId: string;
  } | null>(null);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const unsub = subscribeToTherapists(
      (firestoreTherapists: Therapist[]) => {
        if (firestoreTherapists && firestoreTherapists.length > 0) {
          const mapped: Doctor[] = firestoreTherapists.map((t) => {
            const numericFee = t.consultationFee || 800;
            return {
              id: t.id,
              name: t.name,
              specialty: t.specializations && t.specializations.length > 0 ? t.specializations.join(', ') : 'Physiotherapist',
              degree: t.degree,
              experienceYears: parseInt(t.experience) || 5,
              experienceStr: t.experience || '5+ Years Exp',
              rating: t.rating || 4.9,
              reviewsCount: 18 + (t.patientsCount || 0),
              clinicName: t.location || 'Spine & Wellness Center',
              clinicAddress: 'Indiranagar, Bengaluru',
              fee: `₹${numericFee}`,
              numericFee: numericFee,
              imageName: undefined,
              avatarUrl: t.avatarUrl || undefined,
              isTopRated: (t.rating || 0) >= 4.8,
              isNearby: true,
              availableToday: t.availability === 'Available Today',
              supportsOnline: true,
              languages: ['English', 'Hindi'],
              bio: t.bio,
            };
          });
          setDoctorsList(mapped);
        }
        setIsLoading(false);
      },
      (err) => {
        console.warn('Realtime therapists subscription error, falling back to API:', err);
        fetchTherapistsFromApi(selectedServiceId).then((apiDoctors) => {
          if (apiDoctors && apiDoctors.length > 0) {
            const mapped: Doctor[] = apiDoctors.map((d) => ({
              id: d.id,
              name: d.name,
              specialty: d.specialty,
              experienceYears: d.experienceYears,
              experienceStr: d.experienceStr,
              rating: d.rating,
              reviewsCount: d.reviewsCount,
              clinicName: d.clinicName,
              clinicAddress: d.clinicAddress,
              fee: d.fee,
              numericFee: d.numericFee,
              imageName: d.imageName as any,
              isTopRated: d.isTopRated,
              isNearby: d.isNearby,
              availableToday: d.availableToday,
              supportsOnline: d.supportsOnline,
              languages: d.languages || [],
            }));
            setDoctorsList(mapped);
          }
          setIsLoading(false);
        });
      }
    );

    return () => unsub();
  }, [selectedServiceId]);

  // Filter & Search Logic
  const filteredDoctors = useMemo(() => {
    return doctorsList.filter((doc) => {
      let matchesFilter = true;
      if (activeFilterId === 'nearby') {
        matchesFilter = doc.isNearby;
      } else if (activeFilterId === 'top_rated') {
        matchesFilter = doc.isTopRated;
      } else if (activeFilterId === 'available_today') {
        matchesFilter = doc.availableToday;
      } else if (activeFilterId === 'online') {
        matchesFilter = doc.supportsOnline;
      } else if (activeFilterId === 'exp_10') {
        matchesFilter = doc.experienceYears >= 10;
      }

      const q = searchQuery.toLowerCase().trim();
      let matchesSearch = true;
      if (q) {
        matchesSearch =
          (doc.name || '').toLowerCase().includes(q) ||
          (doc.specialty || '').toLowerCase().includes(q) ||
          (doc.clinicName || '').toLowerCase().includes(q) ||
          (doc.languages || []).some((l) => l.toLowerCase().includes(q));
      }

      return matchesFilter && matchesSearch;
    });
  }, [doctorsList, activeFilterId, searchQuery]);

  const handleFilterSelect = (id: string) => {
    setActiveFilterId(id);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 200);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/explore');
    }
  };

  // Select Physiotherapist -> Navigate to Select Date & Time Screen
  const handleSelectDoctor = (doctor: Doctor) => {
    router.push({
      pathname: '/select-date-time' as any,
      params: {
        doctorId: doctor.id,
        serviceTitle: selectedServiceTitle,
        doctorName: doctor.name,
        doctorSpecialty: doctor.specialty,
        doctorDegree: doctor.degree || '',
        doctorFee: doctor.fee,
        doctorNumericFee: doctor.numericFee ? String(doctor.numericFee) : '',
        doctorClinic: doctor.clinicName,
        doctorAvatarUrl: doctor.avatarUrl || '',
        doctorImageName: doctor.imageName || '',
        doctorRating: doctor.rating ? String(doctor.rating) : '',
        doctorExperience: doctor.experienceStr || '',
        doctorBio: doctor.bio || '',
      },
    });
  };

  // Step 2: Date & Time Selected -> Open Payment Selection Modal
  const handleProceedToPayment = (details: BookingDetails) => {
    setIsDateTimeModalVisible(false);
    setPendingBookingDetails(details);
    setIsPaymentModalVisible(true);
  };

  // Step 3: Payment Confirmed -> Open Success Modal
  const handleConfirmPayment = (finalBooking: {
    bookingDetails: BookingDetails;
    paymentMode: 'online' | 'clinic';
    paymentMethodId: string;
  }) => {
    setIsPaymentModalVisible(false);
    const methodNames: Record<string, string> = {
      upi: 'UPI (GPay / PhonePe / Paytm)',
      card: 'Credit / Debit Card',
      netbanking: 'Net Banking',
      wallet: 'Digital Wallet',
    };
    router.push({
      pathname: '/payment-processing' as any,
      params: {
        doctorId: finalBooking.bookingDetails.doctor.id,
        doctorName: finalBooking.bookingDetails.doctor.name,
        doctorSpecialty: finalBooking.bookingDetails.doctor.specialty,
        clinicName: finalBooking.bookingDetails.doctor.clinicName,
        clinicAddress: finalBooking.bookingDetails.doctor.clinicAddress,
        serviceTitle: selectedServiceTitle || 'Physiotherapy Consultation',
        fullDate: finalBooking.bookingDetails.fullDate,
        timeSlot: finalBooking.bookingDetails.timeSlot,
        feeStr: finalBooking.bookingDetails.feeStr,
        numericFee: String(finalBooking.bookingDetails.numericFee),
        paymentMode: finalBooking.paymentMode,
        paymentMethodId: finalBooking.paymentMethodId,
        paymentMethodName: methodNames[finalBooking.paymentMethodId] || 'Online Payment',
      },
    });
  };

  // Step 4: Done with Success Modal -> Return to Explore or Schedule
  const handleBookingDone = () => {
    setIsSuccessModalVisible(false);
    setSelectedDoctorForBooking(null);
    setPendingBookingDetails(null);
    setCompletedBooking(null);
    router.replace('/explore');
  };

  const handleNavTabPress = (tab: TabKey) => {
    setActiveTab(tab);
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
        {/* Header */}
        <BookAppointmentHeader onBack={handleBack} />

        {/* Selected Service Banner */}
        {Boolean(selectedServiceTitle) && (
          <View style={styles.selectedServiceBanner}>
            <View style={styles.serviceBannerLeft}>
              <View style={styles.serviceIconCircle}>
                <Ionicons name="medical" size={14} color="#003D9B" />
              </View>
              <View>
                <Text style={styles.serviceBannerLabel}>Selected Service</Text>
                <Text style={styles.serviceBannerTitle}>{selectedServiceTitle}</Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/service-selection' as any)}
              style={styles.changeServiceBtn}
            >
              <Text style={styles.changeServiceText}>Change</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={Strings.booking.searchPlaceholder}
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              setIsLoading(true);
              setTimeout(() => setIsLoading(false), 200);
            }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Horizontal Filter Chips */}
        <DoctorFilterChips
          activeFilterId={activeFilterId}
          onSelectFilter={handleFilterSelect}
        />

        {/* Main List Area */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 100 + Math.max(insets.bottom, 12) },
          ]}
        >
          <View style={styles.listHeaderRow}>
            <Text style={styles.listHeaderTitle}>
              {Strings.booking.allSpecialistsTitle} ({filteredDoctors.length})
            </Text>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <SkeletonLoader />
            </View>
          ) : filteredDoctors.length === 0 ? (
            <EmptyStateView
              title={Strings.booking.emptyState.title}
              subtitle={Strings.booking.emptyState.subtitle}
              onReset={() => {
                setActiveFilterId('all');
                setSearchQuery('');
              }}
            />
          ) : (
            filteredDoctors.map((doc) => (
              <DoctorBookingCard
                key={doc.id}
                doctor={doc}
                buttonLabel="Continue"
                onBookPress={handleSelectDoctor}
                onCardPress={handleSelectDoctor}
              />
            ))
          )}
        </ScrollView>

        {/* Bottom Tab Bar */}
        <BottomNavBar activeTab={activeTab} onTabPress={handleNavTabPress} />
      </View>

      {/* Date & Time Selector Sheet */}
      <DateTimeSelectorModal
        visible={isDateTimeModalVisible}
        doctor={selectedDoctorForBooking}
        onClose={() => setIsDateTimeModalVisible(false)}
        onProceedToPayment={handleProceedToPayment}
      />

      {/* Payment Selection Sheet */}
      <PaymentSelectionModal
        visible={isPaymentModalVisible}
        bookingDetails={pendingBookingDetails}
        onClose={() => setIsPaymentModalVisible(false)}
        onConfirmBooking={handleConfirmPayment}
      />

      {/* Booking Success Dialog */}
      <BookingSuccessModal
        visible={isSuccessModalVisible}
        booking={completedBooking}
        onDone={handleBookingDone}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 9999,
    paddingHorizontal: 16,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: '#0F172A',
  },
  clearBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  listHeaderTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
    letterSpacing: 0.5,
  },
  loadingContainer: {
    gap: 14,
  },
  selectedServiceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6FF',
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.md,
    marginBottom: -4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  serviceBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  serviceIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceBannerLabel: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    color: '#64748B',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  serviceBannerTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },
  changeServiceBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  changeServiceText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },
});

export default BookAppointmentScreen;
