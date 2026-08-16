import React, { useState, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';
import { Strings } from '@/constants';
import { Doctor } from '@/features/appointments';
import { PaymentSelectionModal, BookingDetails } from '@/features/appointments';
import { BookingSuccessModal } from '@/features/appointments';
import { EmptyStateView, TherapistAvatar } from '@/components';
import { fetchAvailableSlotsFromApi } from '@/api/appointmentApi';
import { subscribeToTherapists, Therapist } from '@/api/therapistService';
import { getDynamicBookingDates, isTimeSlotPast } from '@/utils/dateUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');


export const SelectDateTimeScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    doctorId?: string;
    serviceTitle?: string;
    doctorName?: string;
    doctorSpecialty?: string;
    doctorDegree?: string;
    doctorFee?: string;
    doctorNumericFee?: string;
    doctorClinic?: string;
    doctorAvatarUrl?: string;
    doctorImageName?: string;
    doctorRating?: string;
    doctorExperience?: string;
    doctorBio?: string;
  }>();

  const doctorId = params.doctorId || '';
  const serviceTitle = params.serviceTitle || '';

  const [firestoreTherapists, setFirestoreTherapists] = useState<Doctor[]>([]);

  useEffect(() => {
    const unsub = subscribeToTherapists(
      (list) => {
        const mapped: Doctor[] = list.map((t) => {
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
        setFirestoreTherapists(mapped);
      },
      (err) => console.warn('Therapists subscription error in SelectDateTimeScreen:', err)
    );
    return () => unsub();
  }, []);

  // 1. Resolve Doctor Data dynamically
  const doctor = useMemo<Doctor | null>(() => {
    // a) Search real-time Firestore therapists list
    if (doctorId && firestoreTherapists.length > 0) {
      const foundFs = firestoreTherapists.find((d) => d.id === doctorId);
      if (foundFs) return foundFs;
    }

    // b) Construct from route params if passed
    if (params.doctorName) {
      const numericFee = params.doctorNumericFee ? Number(params.doctorNumericFee) : 800;
      return {
        id: doctorId || 'custom_doc',
        name: params.doctorName,
        specialty: params.doctorSpecialty || 'Physiotherapist',
        degree: params.doctorDegree || '',
        experienceYears: parseInt(params.doctorExperience || '5') || 5,
        experienceStr: params.doctorExperience || '5+ Years Exp',
        rating: params.doctorRating ? Number(params.doctorRating) : 4.9,
        reviewsCount: 25,
        clinicName: params.doctorClinic || 'Spine & Wellness Center',
        clinicAddress: 'Indiranagar, Bengaluru',
        fee: params.doctorFee || `₹${numericFee}`,
        numericFee: numericFee,
        imageName: params.doctorImageName || 'doctor_ananya',
        avatarUrl: params.doctorAvatarUrl,
        isTopRated: true,
        isNearby: true,
        availableToday: true,
        supportsOnline: true,
        languages: ['English', 'Hindi'],
        bio: params.doctorBio || '',
      };
    }

    // c) Search static mock list
    if (doctorId) {
      const foundStatic = Strings.booking.doctors.find((d) => d.id === doctorId);
      if (foundStatic) return foundStatic as unknown as Doctor;
    }

    // d) Fallback if no specific doctorId requested
    if (firestoreTherapists.length > 0) {
      return firestoreTherapists[0];
    }
    return (Strings.booking.doctors[1] as unknown as Doctor) || (Strings.booking.doctors[0] as unknown as Doctor);
  }, [doctorId, firestoreTherapists, params]);

  // Data constants
  const places = Strings.booking.places;
  const dates = useMemo(() => getDynamicBookingDates(7), []);
  const timeSlots = Strings.booking.timeSlots;
  const strings = Strings.selectDateTime;

  // Screen interactive state
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>('clinic');
  const [selectedDateId, setSelectedDateId] = useState<string>(dates[0]?.id || 'd1');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('04:30 PM');
  const [selectedPeriodFilter, setSelectedPeriodFilter] = useState<string>('all');
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  const [bookedTimeSlots, setBookedTimeSlots] = useState<string[]>([]);

  // Filter time slots dynamically based on period selection
  const filteredTimeSlots = useMemo(() => {
    if (selectedPeriodFilter === 'all') return timeSlots;
    return timeSlots.filter((slot) => {
      if (slot.period && slot.period === selectedPeriodFilter) return true;
      const timeUpper = slot.time.toUpperCase();
      const hourStr = timeUpper.split(':')[0];
      const hour = parseInt(hourStr, 10);
      const isPM = timeUpper.includes('PM');
      let hour24 = hour;
      if (isPM && hour !== 12) hour24 += 12;
      if (!isPM && hour === 12) hour24 = 0;

      if (selectedPeriodFilter === 'morning') return hour24 < 12;
      if (selectedPeriodFilter === 'afternoon') return hour24 >= 12 && hour24 < 16;
      if (selectedPeriodFilter === 'evening') return hour24 >= 16;
      return true;
    });
  }, [timeSlots, selectedPeriodFilter]);

  // Modals for complete booking flow
  const [pendingBookingDetails, setPendingBookingDetails] = useState<BookingDetails | null>(null);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<{
    bookingDetails: BookingDetails;
    paymentMode: 'online' | 'clinic';
    paymentMethodId: string;
  } | null>(null);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

  const selectedPlace = useMemo(() => {
    return places.find((p) => p.id === selectedPlaceId) || places[0];
  }, [places, selectedPlaceId]);

  const selectedDate = useMemo(() => {
    return dates.find((d) => d.id === selectedDateId) || dates[0];
  }, [dates, selectedDateId]);

  // Fetch booked slots for selected doctor and date via API
  useEffect(() => {
    if (!doctor) return;
    let isMounted = true;
    fetchAvailableSlotsFromApi(doctor.id, selectedDate.fullDate).then((slotsRes) => {
      if (isMounted && slotsRes) {
        setBookedTimeSlots(slotsRes.bookedSlots || []);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [doctor, selectedDate.fullDate]);


  // Simulate loading state on date or place change
  const handleSelectDate = (dateId: string) => {
    if (dateId === selectedDateId) return;
    setSelectedDateId(dateId);
    setIsLoadingSlots(true);
    setTimeout(() => setIsLoadingSlots(false), 250);
  };

  const handleSelectPlace = (placeId: string) => {
    if (placeId === selectedPlaceId) return;
    setSelectedPlaceId(placeId);
    setIsLoadingSlots(true);
    setTimeout(() => setIsLoadingSlots(false), 200);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/explore');
    }
  };

  const handleProceedToPayment = () => {
    if (!doctor) return;
    const bookingDetails: BookingDetails = {
      doctor,
      placeId: selectedPlace.id,
      dateId: selectedDate.id,
      fullDate: selectedDate.fullDate,
      timeSlot: selectedTimeSlot,
      feeStr: selectedPlace.fee,
      numericFee: selectedPlace.numericFee,
    };
    setPendingBookingDetails(bookingDetails);
    setIsPaymentModalVisible(true);
  };

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
        serviceTitle: serviceTitle || 'Spinal Rehabilitation',
        placeTitle: selectedPlace.title,
        placeAddress: selectedPlace.subtitle,
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

  const handleBookingDone = () => {
    setIsSuccessModalVisible(false);
    setPendingBookingDetails(null);
    setCompletedBooking(null);
    router.replace('/explore');
  };

  // Helper for doctor profile images
  const getImageSource = (name?: string, avatarUrl?: string) => {
    if (avatarUrl && (avatarUrl.startsWith('http') || avatarUrl.startsWith('data:image'))) {
      return { uri: avatarUrl };
    }
    switch (name) {
      case 'doctor_ananya':
        return require('../../../assets/images/doctor_ananya.png');
      case 'care_team_doctor':
        return require('../../../assets/images/care_team_doctor.png');
      case 'doctor_arjun':
      default:
        return require('../../../assets/images/doctor_arjun.png');
    }
  };

  // ERROR STATE VIEW
  if (!doctor) {
    return (
      <View style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent />
        <View style={styles.errorContainer}>
          <EmptyStateView
            title={strings.errorState.title}
            subtitle={strings.errorState.subtitle}
            onReset={handleBack}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent />

      {/* HEADER BAR */}
      <View style={[styles.header, { paddingTop: insets.top + 4, height: 56 + insets.top }]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleBack}
          style={styles.backBtn}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={Colors.darkBlue} />
        </TouchableOpacity>

        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerTitle}>{strings.headerTitle}</Text>
          <Text style={styles.headerSubtitle}>
            {serviceTitle ? `${serviceTitle} • ` : ''}{doctor.name}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.replace('/explore')}
          style={styles.homeBtn}
          accessibilityLabel="Home"
        >
          <Ionicons name="home-outline" size={20} color={Colors.darkBlue} />
        </TouchableOpacity>
      </View>

      {/* MAIN SCROLL CONTENT */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollBody,
          { paddingBottom: 110 + Math.max(insets.bottom, 16) },
        ]}
      >
        {/* 1. DOCTOR SUMMARY SNAPSHOT CARD */}
        <View style={styles.doctorCard}>
          <TherapistAvatar
            name={doctor.name}
            avatarUrl={doctor.avatarUrl}
            imageName={doctor.imageName}
            size={60}
          />

          <View style={styles.docInfo}>
            <View style={styles.docNameRow}>
              <Text style={styles.docName}>{doctor.name}</Text>

              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text style={styles.ratingText}>{doctor.rating}</Text>
              </View>
            </View>

            <Text style={styles.docSpecialty}>{doctor.specialty}</Text>

            <View style={styles.docSubRow}>
              <Text style={styles.docMetaText}>{doctor.experienceStr}</Text>
              <Text style={styles.docDot}>•</Text>
              <Text style={styles.docMetaText}>{doctor.clinicName}</Text>
            </View>
          </View>
        </View>

        {/* 2. SELECT APPOINTMENT PLACE */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{strings.placesTitle}</Text>
            <Text style={styles.sectionSubtitle}>Where would you like to meet?</Text>
          </View>

          <View style={styles.placesList}>
            {places.map((place) => {
              const isSelected = place.id === selectedPlaceId;
              return (
                <TouchableOpacity
                  key={place.id}
                  activeOpacity={0.85}
                  onPress={() => handleSelectPlace(place.id)}
                  style={[
                    styles.placeCard,
                    isSelected && styles.placeCardSelected,
                  ]}
                >
                  <View style={styles.placeLeft}>
                    <View style={[styles.placeIconCircle, isSelected && styles.placeIconCircleSelected]}>
                      <Ionicons
                        name={place.icon as any}
                        size={20}
                        color={isSelected ? Colors.white : Colors.primary}
                      />
                    </View>

                    <View style={styles.placeTextGroup}>
                      <View style={styles.placeTitleRow}>
                        <Text style={[styles.placeTitle, isSelected && styles.placeTitleSelected]}>
                          {place.title}
                        </Text>
                        {place.badge && (
                          <View style={styles.badgePill}>
                            <Text style={styles.badgeText}>{place.badge}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.placeSubtitle}>{place.subtitle}</Text>
                    </View>
                  </View>

                  <View style={styles.placeRight}>
                    <Text style={[styles.placeFee, isSelected && styles.placeFeeSelected]}>
                      {place.fee}
                    </Text>
                    <Ionicons
                      name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                      size={22}
                      color={isSelected ? Colors.primary : '#CBD5E1'}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 3. SELECT DATE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{strings.datesTitle}</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateScrollContainer}
          >
            {dates.map((d) => {
              const isSelected = d.id === selectedDateId;
              return (
                <TouchableOpacity
                  key={d.id}
                  activeOpacity={0.8}
                  onPress={() => handleSelectDate(d.id)}
                  style={[
                    styles.dateCard,
                    isSelected && styles.dateCardSelected,
                  ]}
                >
                  <Text style={[styles.dateLabel, isSelected && styles.dateLabelSelected]}>
                    {d.label}
                  </Text>
                  <Text style={[styles.dateStr, isSelected && styles.dateStrSelected]}>
                    {d.dateStr}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 4. SELECT TIME SLOT */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.timeSlotTitleGroup}>
              <Text style={styles.sectionTitle}>
                {strings.timeSlotsTitle} ({selectedDate.fullDate})
              </Text>
              <Text style={styles.sectionSubtitle}>
                Select an available slot for your consultation
              </Text>
            </View>
          </View>

          {/* Period Filter Pills */}
          <View style={styles.periodTabsRow}>
            {[
              { id: 'all', label: 'All Slots', icon: 'time-outline' },
              { id: 'morning', label: 'Morning', icon: 'sunny-outline' },
              { id: 'afternoon', label: 'Afternoon', icon: 'partly-sunny-outline' },
              { id: 'evening', label: 'Evening', icon: 'moon-outline' },
            ].map((period) => {
              const isPeriodSelected = selectedPeriodFilter === period.id;
              return (
                <TouchableOpacity
                  key={period.id}
                  activeOpacity={0.8}
                  onPress={() => setSelectedPeriodFilter(period.id)}
                  style={[
                    styles.periodTabPill,
                    isPeriodSelected && styles.periodTabPillSelected,
                  ]}
                >
                  <Ionicons
                    name={period.icon as any}
                    size={13}
                    color={isPeriodSelected ? Colors.white : Colors.primary}
                  />
                  <Text
                    style={[
                      styles.periodTabText,
                      isPeriodSelected && styles.periodTabTextSelected,
                    ]}
                  >
                    {period.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {isLoadingSlots ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.loadingText}>Fetching available time slots...</Text>
            </View>
          ) : filteredTimeSlots.length === 0 ? (
            <EmptyStateView
              title={strings.emptyState.title}
              subtitle={strings.emptyState.subtitle}
              onReset={() => {
                setSelectedPeriodFilter('all');
                setSelectedDateId('d1');
              }}
            />
          ) : (
            <View style={styles.timeSlotsGrid}>
              {filteredTimeSlots.map((slot) => {
                const isSelected = slot.time === selectedTimeSlot;
                const isBooked = bookedTimeSlots.includes(slot.time);
                const isPast = isTimeSlotPast(slot.time, selectedDate.isoDate);
                const isDisabled = isBooked || isPast;
                return (
                  <TouchableOpacity
                    key={slot.id}
                    disabled={isDisabled}
                    activeOpacity={0.8}
                    onPress={() => setSelectedTimeSlot(slot.time)}
                    style={[
                      styles.timeSlotChip,
                      isSelected && !isDisabled && styles.timeSlotChipSelected,
                      isDisabled && styles.timeSlotChipBooked,
                    ]}
                  >
                    <Ionicons
                      name={
                        isBooked
                          ? 'lock-closed-outline'
                          : isPast
                          ? 'close-circle-outline'
                          : isSelected
                          ? 'checkmark-circle-outline'
                          : 'time-outline'
                      }
                      size={14}
                      color={
                        isDisabled
                          ? '#94A3B8'
                          : isSelected
                          ? Colors.white
                          : Colors.primary
                      }
                    />
                    <View style={styles.timeSlotTextGroup}>
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.timeSlotText,
                          isSelected && !isDisabled && styles.timeSlotTextSelected,
                          isDisabled && styles.timeSlotTextBooked,
                        ]}
                      >
                        {slot.time}
                      </Text>
                      {isDisabled && (
                        <Text style={styles.timeSlotStatusSub}>
                          {isBooked ? 'Booked' : 'Passed'}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* SUMMARY DISCLAIMER CARD */}
        <View style={styles.infoBox}>
          <Ionicons name="shield-checkmark-outline" size={20} color={Colors.primary} />
          <Text style={styles.infoText}>
            Free cancellation up to 2 hours before your scheduled appointment time.
          </Text>
        </View>
      </ScrollView>

      {/* STICKY BOTTOM FOOTER BAR */}
      <View style={[styles.footerContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.footerPriceCol}>
          <Text style={styles.footerPriceLabel}>{strings.totalFeeLabel}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.footerPriceValue}>{selectedPlace.fee}</Text>
            <Text style={styles.footerTaxTag}>{strings.taxesIncluded}</Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.88}
          style={styles.proceedButton}
          onPress={handleProceedToPayment}
        >
          <Text style={styles.proceedButtonText}>{strings.proceedToPaymentBtn}</Text>
          <Ionicons name="arrow-forward" size={18} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* PAYMENT SELECTION SHEET */}
      <PaymentSelectionModal
        visible={isPaymentModalVisible}
        bookingDetails={pendingBookingDetails}
        onClose={() => setIsPaymentModalVisible(false)}
        onConfirmBooking={handleConfirmPayment}
      />

      {/* BOOKING SUCCESS DIALOG */}
      <BookingSuccessModal
        visible={isSuccessModalVisible}
        booking={completedBooking}
        onDone={handleBookingDone}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFC',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
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
  },
  homeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleGroup: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
  },
  headerSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  scrollBody: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    gap: Spacing.xl,
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: Spacing.md,
    gap: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  docAvatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  docInfo: {
    flex: 1,
  },
  docNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  docName: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    gap: 4,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: '#92400E',
  },
  docSpecialty: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.primary,
    marginTop: 2,
  },
  docSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  docMetaText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  docDot: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionHeaderRow: {
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  placesList: {
    gap: 12,
  },
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: Colors.white,
  },
  placeCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#EFF6FF',
  },
  placeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  placeIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeIconCircleSelected: {
    backgroundColor: Colors.primary,
  },
  placeTextGroup: {
    flex: 1,
  },
  placeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  placeTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
  },
  placeTitleSelected: {
    color: Colors.primary,
  },
  badgePill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: Typography.fontWeight.bold,
    color: '#166534',
    letterSpacing: 0.5,
  },
  placeSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 3,
  },
  placeRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  placeFee: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
  },
  placeFeeSelected: {
    color: Colors.primary,
  },
  dateScrollContainer: {
    gap: 10,
    paddingVertical: 4,
  },
  dateCard: {
    width: 90,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  dateCardSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  dateLabel: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  dateLabelSelected: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  dateStr: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
    marginTop: 4,
  },
  dateStrSelected: {
    color: Colors.white,
  },
  timeSlotTitleGroup: {
    gap: 2,
  },
  periodTabsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 4,
  },
  periodTabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9999,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    gap: 5,
  },
  periodTabPillSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  periodTabText: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  periodTabTextSelected: {
    color: Colors.white,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 10,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  loadingText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeSlotChip: {
    width: (SCREEN_WIDTH - 40 - 20) / 3,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 6,
  },
  timeSlotChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  timeSlotChipBooked: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.7,
  },
  timeSlotTextGroup: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeSlotText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
  },
  timeSlotTextSelected: {
    color: Colors.white,
  },
  timeSlotTextBooked: {
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  timeSlotStatusSub: {
    fontSize: 9,
    fontWeight: Typography.fontWeight.semiBold,
    color: '#94A3B8',
    marginTop: -2,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: Spacing.md,
    gap: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.medium,
    lineHeight: 18,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 8,
  },
  footerPriceCol: {
    gap: 2,
  },
  footerPriceLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  footerPriceValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
  },
  footerTaxTag: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    color: '#16A34A',
  },
  proceedButton: {
    backgroundColor: Colors.primary,
    height: 50,
    paddingHorizontal: 22,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  proceedButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
});

export default SelectDateTimeScreen;
