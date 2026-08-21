import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';
import { Strings } from '@/constants';
import { BottomNavBar, TabKey } from '@/components';

export const AppointmentCancelledScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    bookingId?: string;
    doctorName?: string;
    serviceTitle?: string;
    clinicName?: string;
    fullDate?: string;
    timeSlot?: string;
    mode?: string;
    refundAmount?: string;
    refundStatus?: string;
  }>();

  const [activeNavTab, setActiveNavTab] = useState<TabKey>('bookings');

  // Fallback values matching exact Figma design
  const appointmentId = params.bookingId || Strings.appointmentCancelled.defaultAppointmentId;
  const doctorName = params.doctorName || Strings.appointmentCancelled.defaultPhysiotherapist;
  const serviceTitle = params.serviceTitle || Strings.appointmentCancelled.defaultService;
  const clinicName = params.clinicName || Strings.appointmentCancelled.defaultClinic;
  const dateStr = params.fullDate || Strings.appointmentCancelled.defaultDate;
  const timeStr = params.timeSlot || Strings.appointmentCancelled.defaultTime;
  const modeStr = params.mode || Strings.appointmentCancelled.defaultMode;
  const refundAmount = params.refundAmount || '₹ 1500';
  const refundStatusStr = params.refundStatus || Strings.appointmentCancelled.defaultRefundStatus;

  const handleBookAppointments = () => {
    router.replace('/service-selection' as any);
  };

  const handleBackToHome = () => {
    router.replace('/explore');
  };

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

      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: Math.max(insets.top + 8, Spacing.md),
              paddingBottom: 110 + Math.max(insets.bottom, 12),
            },
          ]}
        >
          {/* Top Soft Green Circle with Checkmark */}
          <View style={styles.successIconWrapper}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark-sharp" size={30} color="#22C55E" />
            </View>
          </View>

          {/* Main Cancelled Headline */}
          <View style={styles.headlineContainer}>
            <Text style={styles.title}>Appointment{'\n'}Cancelled</Text>
            <Text style={styles.subtitle}>
              Your appointment has been Cancelled{'\n'}successfully. Your Refund Of {refundAmount} will be{'\n'}procceded within 5 - 7 Days
            </Text>
          </View>

          {/* Appointment Ticket Card */}
          <View style={styles.ticketCard}>
            {/* Header Row: ID */}
            <View style={styles.cardHeaderRow}>
              <Text style={styles.appointmentIdLabel}>
                {Strings.appointmentCancelled.appointmentIdLabel}
              </Text>
              <Text style={styles.appointmentIdValue}>{appointmentId}</Text>
            </View>

            <View style={styles.divider} />

            {/* Row 1: Physiotherapist */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                {Strings.appointmentCancelled.physiotherapistLabel}
              </Text>
              <Text style={styles.infoValueBold}>{doctorName}</Text>
            </View>

            {/* Row 2: Service */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                {Strings.appointmentCancelled.serviceLabel}
              </Text>
              <Text style={styles.infoValueBold}>{serviceTitle}</Text>
            </View>

            {/* Row 3: Clinic */}
            <View style={styles.infoRowAlignTop}>
              <Text style={styles.infoLabel}>
                {Strings.appointmentCancelled.clinicLabel}
              </Text>
              <Text style={[styles.infoValueBold, styles.textRight, { flex: 1 }]}>
                {clinicName}
              </Text>
            </View>

            {/* Row 4: Date & Time */}
            <View style={styles.infoRowAlignTop}>
              <Text style={styles.infoLabel}>
                {Strings.appointmentCancelled.dateTimeLabel}
              </Text>
              <View style={styles.dateTimeCol}>
                <Text style={styles.infoValueBold}>{dateStr}</Text>
                <Text style={styles.timeSubtext}>{timeStr}</Text>
              </View>
            </View>

            {/* Row 5: Mode */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                {Strings.appointmentCancelled.modeLabel}
              </Text>
              <Text style={styles.infoValueBold}>{modeStr}</Text>
            </View>

            {/* Row 6: Refund Status */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                {Strings.appointmentCancelled.refundStatusLabel}
              </Text>
              <View style={styles.statusPill}>
                <Text style={styles.statusPillText}>{refundStatusStr}</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.bookAppointmentsBtn}
              onPress={handleBookAppointments}
            >
              <Text style={styles.bookAppointmentsBtnText}>
                {Strings.appointmentCancelled.bookAppointmentsBtn}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.backHomeBtn}
              onPress={handleBackToHome}
            >
              <Text style={styles.backHomeBtnText}>
                {Strings.appointmentCancelled.backToHomeBtn}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Bottom Navigation Menu Bar */}
        <BottomNavBar activeTab={activeNavTab} onTabPress={handleNavTabPress} />
      </View>
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
    backgroundColor: '#FAFCFA',
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    alignItems: 'center',
  },

  /* Top Checkmark Circle */
  successIconWrapper: {
    marginBottom: 20,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Title & Subtitle */
  headlineContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0B1527',
    textAlign: 'center',
    lineHeight: 36,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 13,
    color: '#717D96',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '400',
  },

  /* Ticket Card */
  ticketCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
    marginBottom: 32,
    gap: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appointmentIdLabel: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold,
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  appointmentIdValue: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.bold,
    color: '#0052CC',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoRowAlignTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '400',
  },
  infoValueBold: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B1527',
  },
  textRight: {
    textAlign: 'right',
  },
  dateTimeCol: {
    alignItems: 'flex-end',
    gap: 2,
  },
  timeSubtext: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '400',
  },

  /* Refund Pill */
  statusPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16A34A',
  },

  /* Action Buttons */
  actionsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  bookAppointmentsBtn: {
    width: '100%',
    height: 52,
    borderRadius: 9999,
    backgroundColor: '#003D9B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  bookAppointmentsBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  backHomeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  backHomeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
});

export default AppointmentCancelledScreen;
