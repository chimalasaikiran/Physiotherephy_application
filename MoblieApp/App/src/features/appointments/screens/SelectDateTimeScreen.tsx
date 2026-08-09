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
import { EmptyStateView } from '@/components';
import { SkeletonLoader } from '@/components';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const SelectDateTimeScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ doctorId?: string; serviceTitle?: string }>();

  const doctorId = params.doctorId || '';
  const serviceTitle = params.serviceTitle || '';

  // 1. Resolve Doctor Data dynamically
  const doctor = useMemo<Doctor | null>(() => {
    if (!doctorId) {
      return Strings.booking.doctors[1] as unknown as Doctor; // Dr. Ananya Iyer as default
    }
    const found = Strings.booking.doctors.find((d) => d.id === doctorId);
    return (found as unknown as Doctor) || (Strings.booking.doctors[1] as unknown as Doctor);
  }, [doctorId]);

  // Data constants
  const places = Strings.booking.places;
  const dates = Strings.booking.dates;
  const timeSlots = Strings.booking.timeSlots;
  const strings = Strings.selectDateTime;

  // Screen interactive state
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>('clinic');
  const [selectedDateId, setSelectedDateId] = useState<string>('d1');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('04:30 PM');
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);

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
  const getImageSource = (name: string) => {
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
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.errorContainer}>
          <EmptyStateView
            title={strings.errorState.title}
            subtitle={strings.errorState.subtitle}
            onReset={handleBack}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER BAR */}
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
          <Image
            source={getImageSource(doctor.imageName)}
            style={styles.docAvatarImage}
            resizeMode="cover"
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
            <Text style={styles.sectionTitle}>
              {strings.timeSlotsTitle} ({selectedDate.fullDate})
            </Text>
          </View>

          {isLoadingSlots ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.loadingText}>Fetching available time slots...</Text>
            </View>
          ) : (timeSlots as readonly any[]).length === 0 ? (
            <EmptyStateView
              title={strings.emptyState.title}
              subtitle={strings.emptyState.subtitle}
              onReset={() => setSelectedDateId('d1')}
            />
          ) : (
            <View style={styles.timeSlotsGrid}>
              {timeSlots.map((slot) => {
                const isSelected = slot.time === selectedTimeSlot;
                return (
                  <TouchableOpacity
                    key={slot.id}
                    activeOpacity={0.8}
                    onPress={() => setSelectedTimeSlot(slot.time)}
                    style={[
                      styles.timeSlotChip,
                      isSelected && styles.timeSlotChipSelected,
                    ]}
                  >
                    <Ionicons
                      name="time-outline"
                      size={15}
                      color={isSelected ? Colors.white : Colors.primary}
                    />
                    <Text style={[styles.timeSlotText, isSelected && styles.timeSlotTextSelected]}>
                      {slot.time}
                    </Text>
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
    </SafeAreaView>
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
    gap: 12,
  },
  timeSlotChip: {
    width: (SCREEN_WIDTH - 48 - 24) / 3,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  timeSlotChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timeSlotText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
  },
  timeSlotTextSelected: {
    color: Colors.white,
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
