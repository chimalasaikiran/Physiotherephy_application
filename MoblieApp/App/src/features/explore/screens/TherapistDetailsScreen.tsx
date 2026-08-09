import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Image,
  ImageBackground,
  Share,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';
import { Strings } from '@/constants';
import { Doctor } from '@/features/appointments';
import { DateTimeSelectorModal } from '@/features/appointments';
import { PaymentSelectionModal, BookingDetails } from '@/features/appointments';
import { BookingSuccessModal } from '@/features/appointments';
import { EmptyStateView } from '@/components';

export const TherapistDetailsScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ doctorId?: string; serviceTitle?: string }>();

  const doctorId = params.doctorId || '';
  const serviceTitle = params.serviceTitle || '';

  // Doctor lookup
  const doctor = useMemo<Doctor | null>(() => {
    if (!doctorId) {
      return Strings.booking.doctors[1] as unknown as Doctor; // Dr. Ananya Iyer
    }
    const found = Strings.booking.doctors.find((d) => d.id === doctorId);
    return (found as unknown as Doctor) || (Strings.booking.doctors[1] as unknown as Doctor);
  }, [doctorId]);

  // Selected time slot state
  const [selectedSlot, setSelectedSlot] = useState<string>('04:30 PM');
  const [selectedDay, setSelectedDay] = useState<string>('TODAY, 14 OCT');

  // Booking Modals State
  const [isDateTimeModalVisible, setIsDateTimeModalVisible] = useState(false);
  const [pendingBookingDetails, setPendingBookingDetails] = useState<BookingDetails | null>(null);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<{
    bookingDetails: BookingDetails;
    paymentMode: 'online' | 'clinic';
    paymentMethodId: string;
  } | null>(null);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

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

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/book-appointment' as any);
    }
  };

  const handleShare = async () => {
    if (!doctor) return;
    try {
      await Share.share({
        message: `Check out ${doctor.name} (${doctor.specialty}) on ONE MEDICAL!`,
      });
    } catch (err) {
      console.log('Error sharing:', err);
    }
  };

  const handleContinuePress = () => {
    if (!doctor) return;
    router.push({
      pathname: '/select-date-time' as any,
      params: { doctorId: doctor.id, serviceTitle },
    });
  };

  const handleProceedToPayment = (details: BookingDetails) => {
    setIsDateTimeModalVisible(false);
    setPendingBookingDetails(details);
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
        serviceTitle: serviceTitle || 'Physiotherapy Session',
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

  if (!doctor) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.errorContainer}>
          <EmptyStateView
            title={Strings.therapistDetails.emptyState.title}
            subtitle={Strings.therapistDetails.emptyState.subtitle}
            onReset={handleBack}
          />
        </View>
      </SafeAreaView>
    );
  }

  const details = Strings.therapistDetails;

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 100 + Math.max(insets.bottom, 14) },
        ]}
      >
        {/* 1. HERO HEADER WITH DOCTOR IMAGE & OVERLAYS */}
        <View style={styles.heroContainer}>
          <ImageBackground
            source={getImageSource(doctor.imageName)}
            style={styles.heroImage}
            resizeMode="cover"
          >
            {/* Top Navigation Overlay */}
            <View style={[styles.topNavOverlay, { paddingTop: Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 16) + 8 }]}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleBack}
                style={styles.circleIconBtn}
              >
                <Ionicons name="arrow-back" size={20} color="#0F172A" />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleShare}
                style={styles.circleIconBtn}
              >
                <Ionicons name="share-social-outline" size={18} color="#0F172A" />
              </TouchableOpacity>
            </View>

            {/* Gradient Shadow Overlay at Bottom of Hero Image */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.85)']}
              style={styles.heroGradientOverlay}
            >
              {/* Badges Row */}
              <View style={styles.badgesRow}>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={13} color="#FFFFFF" />
                  <Text style={styles.verifiedBadgeText}>{details.verifiedBadge}</Text>
                </View>

                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={13} color="#F59E0B" />
                  <Text style={styles.ratingBadgeText}>{details.ratingBadgeText}</Text>
                </View>
              </View>

              {/* Doctor Name */}
              <Text style={styles.doctorName}>{doctor.name}</Text>

              {/* Specialty & Exp */}
              <Text style={styles.doctorSubtext}>
                {doctor.specialty} • {doctor.experienceStr}
              </Text>

              {/* Info Badges Row (Clinic & Fee) */}
              <View style={styles.heroInfoRow}>
                <View style={styles.heroInfoItem}>
                  <Ionicons name="business-outline" size={15} color="#FFFFFF" />
                  <Text style={styles.heroInfoText}>{doctor.clinicName}</Text>
                </View>

                <View style={styles.heroInfoItem}>
                  <Ionicons name="cash-outline" size={15} color="#FFFFFF" />
                  <Text style={styles.heroInfoText}>{doctor.fee} Fee</Text>
                </View>
              </View>
            </LinearGradient>
          </ImageBackground>
        </View>

        {/* CONTENT CONTAINER */}
        <View style={styles.bodyContent}>
          {/* 2. 2x2 QUICK STATS GRID */}
          <View style={styles.statsGrid}>
            {details.statsGrid.map((stat) => (
              <View key={stat.id} style={styles.statCard}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* 3. ABOUT SECTION */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{details.aboutDoctorTitle}</Text>
            <Text style={styles.quoteText}>{details.quote}</Text>
          </View>

          {/* 4. SPECIALIZATIONS SECTION */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{details.specializationsTitle}</Text>
            <View style={styles.specializationsContainer}>
              {details.specializations.map((item, index) => (
                <View key={index} style={styles.specChip}>
                  <Text style={styles.specChipText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 5. EDUCATION SECTION */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{details.educationTitle}</Text>
            <View style={styles.iconRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="school-outline" size={20} color="#003D9B" />
              </View>
              <View style={styles.iconRowTextGroup}>
                <Text style={styles.iconRowTitle}>{details.education.degree}</Text>
                <Text style={styles.iconRowSubtitle}>{details.education.institution}</Text>
              </View>
            </View>
          </View>

          {/* 6. LANGUAGES SECTION */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{details.languagesTitle}</Text>
            <View style={styles.iconRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="language-outline" size={20} color="#003D9B" />
              </View>
              <Text style={styles.languagesText}>{details.languages}</Text>
            </View>
          </View>

          {/* 7. CLINIC LOCATION SECTION */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>{details.locationTitle}</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => Alert.alert('Directions', `Navigating to ${details.clinic.name}`)}
              >
                <Text style={styles.getDirectionsLink}>{details.clinic.getDirections}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.clinicNameText}>{details.clinic.name}</Text>
            <Text style={styles.clinicAddressText}>{details.clinic.address}</Text>

            {/* Clinic Gallery Photos Row */}
            <View style={styles.photosRow}>
              <Image
                source={require('../../../assets/images/service_knee_pain.png')}
                style={styles.clinicPhotoMain}
                resizeMode="cover"
              />
              <Image
                source={require('../../../assets/images/service_post_surgery.png')}
                style={styles.clinicPhotoSecondary}
                resizeMode="cover"
              />
            </View>

            {/* Map Preview Illustration */}
            <View style={styles.mapCard}>
              <View style={styles.mapBgMockup}>
                <View style={styles.mapRoadHorizontal1} />
                <View style={styles.mapRoadHorizontal2} />
                <View style={styles.mapRoadVertical} />

                {/* Location Marker Badge */}
                <View style={styles.mapMarkerPin}>
                  <Ionicons name="location" size={24} color="#FFFFFF" />
                </View>
              </View>
            </View>
          </View>

          {/* 8. NEXT AVAILABILITY SECTION */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{details.nextAvailabilityTitle}</Text>

            {details.nextAvailability.map((group, groupIdx) => (
              <View key={groupIdx} style={styles.availabilityGroup}>
                <Text style={styles.dayLabel}>{group.dayLabel}</Text>
                <View style={styles.slotsRow}>
                  {group.slots.map((slot, slotIdx) => {
                    const isSelected = selectedDay === group.dayLabel && selectedSlot === slot;
                    return (
                      <TouchableOpacity
                        key={slotIdx}
                        activeOpacity={0.8}
                        onPress={() => {
                          setSelectedDay(group.dayLabel);
                          setSelectedSlot(slot);
                        }}
                        style={[
                          styles.slotPill,
                          isSelected && styles.slotPillSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.slotPillText,
                            isSelected && styles.slotPillTextSelected,
                          ]}
                        >
                          {slot}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>

          {/* 9. PATIENT REVIEWS SECTION */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>{details.reviewsTitle}</Text>
              <Text style={styles.reviewRatingHeader}>{details.patientReview.ratingStr}</Text>
            </View>

            <View style={styles.patientReviewItem}>
              <View
                style={[
                  styles.patientAvatar,
                  { backgroundColor: details.patientReview.avatarBg },
                ]}
              >
                <Text style={styles.patientAvatarText}>
                  {details.patientReview.initials}
                </Text>
              </View>

              <View style={styles.patientInfo}>
                <Text style={styles.patientName}>{details.patientReview.name}</Text>
                <Ionicons name="star" size={12} color="#F59E0B" />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 10. BOTTOM STICKY CTA BUTTON */}
      <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          activeOpacity={0.88}
          style={styles.continueButton}
          onPress={handleContinuePress}
        >
          <Text style={styles.continueButtonText}>{details.bookAppointmentBtn}</Text>
        </TouchableOpacity>
      </View>

      {/* DATE & TIME SELECTOR SHEET */}
      <DateTimeSelectorModal
        visible={isDateTimeModalVisible}
        doctor={doctor}
        onClose={() => setIsDateTimeModalVisible(false)}
        onProceedToPayment={handleProceedToPayment}
      />

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
  scrollContent: {
    paddingBottom: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  heroContainer: {
    height: 380,
    width: '100%',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  topNavOverlay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  circleIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  heroGradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 60,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00D2D3',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    gap: 5,
  },
  verifiedBadgeText: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A2540',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    gap: 5,
  },
  ratingBadgeText: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  doctorName: {
    fontSize: 26,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  doctorSubtext: {
    fontSize: 14,
    color: '#E2E8F0',
    fontWeight: Typography.fontWeight.medium,
    marginBottom: 10,
  },
  heroInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  heroInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroInfoText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: Typography.fontWeight.medium,
  },
  bodyContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: Typography.fontWeight.bold,
    color: '#0A2540',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    fontWeight: Typography.fontWeight.medium,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.bold,
    color: '#0A2540',
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  quoteText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  specializationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specChip: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 9999,
  },
  specChipText: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.semiBold,
    color: '#003D9B',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconRowTextGroup: {
    flex: 1,
  },
  iconRowTitle: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.bold,
    color: '#0A2540',
  },
  iconRowSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  languagesText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: Typography.fontWeight.medium,
  },
  getDirectionsLink: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },
  clinicNameText: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.bold,
    color: '#0A2540',
  },
  clinicAddressText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 14,
  },
  photosRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  clinicPhotoMain: {
    flex: 2,
    height: 110,
    borderRadius: 16,
  },
  clinicPhotoSecondary: {
    flex: 1,
    height: 110,
    borderRadius: 16,
  },
  mapCard: {
    height: 110,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  mapBgMockup: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mapRoadHorizontal1: {
    position: 'absolute',
    width: '100%',
    height: 12,
    backgroundColor: '#FFFFFF',
    top: '30%',
  },
  mapRoadHorizontal2: {
    position: 'absolute',
    width: '100%',
    height: 8,
    backgroundColor: '#FFFFFF',
    top: '70%',
  },
  mapRoadVertical: {
    position: 'absolute',
    height: '100%',
    width: 14,
    backgroundColor: '#FFFFFF',
    left: '50%',
  },
  mapMarkerPin: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#003D9B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  availabilityGroup: {
    marginBottom: 14,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  slotsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  slotPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  slotPillSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#003D9B',
  },
  slotPillText: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },
  slotPillTextSelected: {
    color: '#003D9B',
  },
  reviewRatingHeader: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },
  patientReviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  patientAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  patientAvatarText: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  patientName: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.bold,
    color: '#0A2540',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 10,
  },
  continueButton: {
    height: 52,
    backgroundColor: '#003D9B',
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
  },
});

export default TherapistDetailsScreen;
