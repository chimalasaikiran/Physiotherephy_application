import React, { useMemo, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
  Animated,
  Easing,
  Share,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';
import { AppointmentConfirmedData, DefaultBookingFallback, PaymentTransactionData } from '@/constants';
import { ConfirmedTicketCard } from '@/features/appointments';

export const AppointmentConfirmedScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    bookingId?: string;
    doctorId?: string;
    doctorName?: string;
    doctorSpecialty?: string;
    clinicName?: string;
    clinicAddress?: string;
    serviceTitle?: string;
    placeTitle?: string;
    placeAddress?: string;
    fullDate?: string;
    timeSlot?: string;
    feeStr?: string;
    paymentMode?: 'online' | 'clinic';
    paymentMethodName?: string;
    transactionId?: string;
  }>();

  // Scale & Ripple Animations for Success Icon
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const rippleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Spring scale entrance for checkmark badge
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 50,
      useNativeDriver: true,
    }).start();

    // 2. Continuous subtle pulse loop for success badge glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(rippleAnim, {
          toValue: 1.15,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(rippleAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const transactionData = useMemo<PaymentTransactionData>(() => {
    if (params.doctorName) {
      return {
        bookingId: params.bookingId || 'OPT-849204',
        doctor: {
          ...DefaultBookingFallback.doctor,
          id: params.doctorId || DefaultBookingFallback.doctor.id,
          name: params.doctorName,
          specialty: params.doctorSpecialty || DefaultBookingFallback.doctor.specialty,
          clinicName: params.clinicName || DefaultBookingFallback.doctor.clinicName,
          clinicAddress: params.clinicAddress || DefaultBookingFallback.doctor.clinicAddress,
        },
        serviceTitle: params.serviceTitle || DefaultBookingFallback.serviceTitle,
        placeTitle: params.placeTitle || DefaultBookingFallback.placeTitle,
        placeAddress: params.placeAddress || DefaultBookingFallback.placeAddress,
        placeId: 'clinic',
        dateStr: '14 OCT',
        fullDate: params.fullDate || DefaultBookingFallback.fullDate,
        timeSlot: params.timeSlot || DefaultBookingFallback.timeSlot,
        feeStr: params.feeStr || DefaultBookingFallback.feeStr,
        numericFee: 1500,
        paymentMode: params.paymentMode || 'online',
        paymentMethodId: 'upi',
        paymentMethodName: params.paymentMethodName || 'UPI (GPay / PhonePe)',
        transactionId: params.transactionId || 'TXN-9842019482',
        timestamp: new Date().toLocaleDateString(),
      };
    }
    return DefaultBookingFallback;
  }, [params]);

  const handleShareBooking = async () => {
    try {
      await Share.share({
        message: `My physiotherapist appointment with ${transactionData.doctor.name} is confirmed for ${transactionData.fullDate} at ${transactionData.timeSlot}. Ref: ${transactionData.bookingId}`,
      });
    } catch (e) {
      console.log('Error sharing booking:', e);
    }
  };

  const handleAddToCalendar = () => {
    Alert.alert(
      'Calendar Synced 📅',
      `Appointment with ${transactionData.doctor.name} on ${transactionData.fullDate} at ${transactionData.timeSlot} has been added to your calendar.`
    );
  };

  const handleViewAppointment = () => {
    router.push({
      pathname: '/my-bookings' as any,
      params: {
        bookingId: transactionData.bookingId,
      },
    });
  };

  const handleBackToHome = () => {
    router.replace('/explore');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

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
          onPress={handleBackToHome}
          style={styles.closeBtn}
          accessibilityLabel="Back to home"
        >
          <Ionicons name="close" size={22} color={Colors.darkBlue} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{AppointmentConfirmedData.headerTitle}</Text>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleShareBooking}
          style={styles.shareBtn}
          accessibilityLabel="Share appointment"
        >
          <Ionicons name="share-outline" size={20} color={Colors.darkBlue} />
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Animated Success Badge */}
        <View style={styles.heroBadgeWrapper}>
          <Animated.View
            style={[
              styles.outerBadgeCircle,
              { transform: [{ scale: rippleAnim }] },
            ]}
          />
          <Animated.View
            style={[
              styles.innerBadgeCircle,
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            <Ionicons name="checkmark-sharp" size={42} color={Colors.white} />
          </Animated.View>
        </View>

        {/* Title & Subtitle */}
        <View style={styles.headlineContainer}>
          <Text style={styles.title}>{AppointmentConfirmedData.title}</Text>
          <Text style={styles.subtitle}>{AppointmentConfirmedData.subtitle}</Text>
        </View>

        {/* Booking Details Card Component */}
        <ConfirmedTicketCard transactionData={transactionData} />

        {/* Important Instructions Section */}
        <View style={styles.instructionsCard}>
          <View style={styles.instrHeaderRow}>
            <Ionicons name="information-circle-outline" size={18} color={Colors.primary} />
            <Text style={styles.instrTitle}>
              {AppointmentConfirmedData.sections.importantInstructionsTitle}
            </Text>
          </View>

          {AppointmentConfirmedData.instructions.map((item, idx) => (
            <View key={idx} style={styles.instrBulletRow}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.instrText}>{item}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Footer Action Buttons */}
      <View style={styles.footerShell}>
        {/* Row with View Appointment & Add to Calendar */}
        <View style={styles.secondaryButtonsRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.outlineBtn}
            onPress={handleViewAppointment}
          >
            <Ionicons name="eye-outline" size={18} color={Colors.primary} />
            <Text style={styles.outlineBtnText}>
              {AppointmentConfirmedData.buttons.viewAppointment}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.outlineBtn}
            onPress={handleAddToCalendar}
          >
            <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
            <Text style={styles.outlineBtnText}>
              {AppointmentConfirmedData.buttons.addToCalendar}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Main Primary Button: Back to Home */}
        <TouchableOpacity
          activeOpacity={0.88}
          style={styles.primaryHomeBtn}
          onPress={handleBackToHome}
        >
          <Text style={styles.primaryHomeBtnText}>
            {AppointmentConfirmedData.buttons.backToHome}
          </Text>
          <Ionicons name="arrow-forward" size={18} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
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
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.xl,
  },
  heroBadgeWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 100,
    marginTop: 4,
  },
  outerBadgeCircle: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#DCFCE7',
  },
  innerBadgeCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  headlineContainer: {
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  instructionsCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    gap: 6,
  },
  instrHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  instrTitle: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  instrBulletRow: {
    flexDirection: 'row',
    gap: 6,
  },
  bulletDot: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  instrText: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  footerShell: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 10,
  },
  secondaryButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  outlineBtn: {
    flex: 1,
    height: 46,
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: '#EFF6FF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  outlineBtnText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  primaryHomeBtn: {
    height: 52,
    borderRadius: 9999,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryHomeBtnText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
});

export default AppointmentConfirmedScreen;
