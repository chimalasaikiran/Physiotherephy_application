import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Image,
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
import { DoctorAvatarMap } from '@/constants';
import { BottomNavBar, TabKey } from '@/components';
import { cancelAppointmentViaBackend } from '@/api/appointmentApi';


export const CancelAppointmentScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    bookingId?: string;
    doctorId?: string;
    doctorName?: string;
    doctorSpecialty?: string;
    serviceTitle?: string;
    fullDate?: string;
    timeSlot?: string;
    clinicName?: string;
    clinicAddress?: string;
    avatarImageName?: string;
    feeStr?: string;
  }>();

  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [activeNavTab, setActiveNavTab] = useState<TabKey>('bookings');

  // Doctor details with defaults matching Figma design screenshot
  const doctorName = params.doctorName || Strings.cancelAppointment.defaultDoctorName;
  const doctorSpecialty = params.doctorSpecialty || Strings.cancelAppointment.defaultDoctorSpecialty;
  const avatarKey = params.avatarImageName || 'doctor_ananya';
  const doctorImageSource = DoctorAvatarMap[avatarKey] || DoctorAvatarMap.doctor_ananya;

  const originalDateStr = params.fullDate && params.timeSlot
    ? `${params.fullDate}, ${params.timeSlot}`.toUpperCase()
    : Strings.cancelAppointment.defaultOriginalSlot;

  const refundFeeStr = params.feeStr || '₹1,200';

  const handleReasonPress = (reason: string) => {
    if (selectedReason === reason) {
      setSelectedReason(null);
    } else {
      setSelectedReason(reason);
    }
  };

  const handleKeepAppointment = () => {
    router.back();
  };

  const handleReschedule = () => {
    router.push({
      pathname: '/reschedule' as any,
      params: {
        bookingId: params.bookingId || 'OPT-849204',
        doctorId: params.doctorId || 'doc_ananya',
        doctorName: doctorName,
        doctorSpecialty: doctorSpecialty,
        serviceTitle: params.serviceTitle || 'Post-Surgery Rehab',
        fullDate: params.fullDate || 'Saturday, Oct 18',
        timeSlot: params.timeSlot || '04:30 PM',
        clinicName: params.clinicName || 'One Medical Hub',
        clinicAddress: params.clinicAddress || '4th Floor, Health Tower, Indiranagar, Bengaluru',
        avatarImageName: avatarKey,
        feeStr: params.feeStr || '₹1,500',
      },
    });
  };

  const handleConfirmCancel = async () => {
    try {
      if (params.bookingId) {
        await cancelAppointmentViaBackend(
          params.bookingId,
          params.doctorId || 'doc_1',
          params.fullDate || 'Oct 24, 2026',
          params.timeSlot || '04:30 PM'
        );
      }
    } catch (err) {
      console.error('Error cancelling appointment via backend:', err);
    }


    router.replace({
      pathname: '/appointment-cancelled' as any,
      params: {
        bookingId: params.bookingId || '#APT-2024-8842',
        doctorName: doctorName,
        serviceTitle: params.serviceTitle || 'Post-Surgery Rehab',
        clinicName: params.clinicName || 'One Medical Hub, MG Road',
        fullDate: params.fullDate || 'Tue, 17 Sept 2024',
        timeSlot: params.timeSlot || '09:30 AM (45 mins)',
        mode: 'Clinic Visit',
        refundAmount: refundFeeStr,
        refundStatus: 'Processing',
      },
    });
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
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent />

      <View style={styles.container}>
        {/* Header Bar */}
        <View style={[styles.header, { paddingTop: insets.top + 4, height: 56 + insets.top }]}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            style={styles.backBtn}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color={Colors.darkBlue} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>{Strings.cancelAppointment.headerTitle}</Text>

          <View style={styles.userAvatarWrapper}>
            <Image
              source={require('../../../assets/images/user_sagar_avatar.png')}
              style={styles.userAvatarImg}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Main Content Body */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 110 + Math.max(insets.bottom, 12) },
          ]}
        >
          {/* Doctor Info Row */}
          <View style={styles.doctorHeaderCard}>
            <View style={styles.doctorAvatarContainer}>
              <Image
                source={doctorImageSource}
                style={styles.doctorAvatar}
                resizeMode="cover"
              />
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-sharp" size={10} color="#FFFFFF" />
              </View>
            </View>

            <View style={styles.doctorTextGroup}>
              <Text style={styles.doctorNameText}>{doctorName}</Text>
              <Text style={styles.doctorSpecialtyText}>{doctorSpecialty}</Text>

              <View style={styles.originalDatePill}>
                <Ionicons name="calendar-outline" size={13} color="#0052CC" />
                <Text style={styles.originalDatePillText}>
                  ORIGINAL: {originalDateStr}
                </Text>
              </View>
            </View>
          </View>

          {/* Free Cancellation Info Banner */}
          <View style={styles.policyCard}>
            <View style={styles.policyIconBox}>
              <Ionicons name="calendar-outline" size={22} color="#0052CC" />
            </View>
            <View style={styles.policyTextGroup}>
              <Text style={styles.policyTitle}>
                {Strings.cancelAppointment.policyCardTitle}
              </Text>
              <Text style={styles.policySubtitle}>
                A full refund of {refundFeeStr} will be credited to your original payment method within 3-5 business days.
              </Text>
            </View>
          </View>

          {/* Why are you cancelling? Reason Pills Section */}
          <View style={styles.reasonsSection}>
            <Text style={styles.reasonsSectionTitle}>
              {Strings.cancelAppointment.reasonsTitle}
            </Text>

            <View style={styles.reasonsWrap}>
              {Strings.cancelAppointment.reasons.map((reason) => {
                const isSelected = selectedReason === reason;
                return (
                  <TouchableOpacity
                    key={reason}
                    activeOpacity={0.8}
                    onPress={() => handleReasonPress(reason)}
                    style={[
                      styles.reasonChip,
                      isSelected && styles.reasonChipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.reasonChipText,
                        isSelected && styles.reasonChipTextSelected,
                      ]}
                    >
                      {reason}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Need a different time instead? Reschedule Callout Card */}
          <View style={styles.rescheduleCard}>
            <Text style={styles.rescheduleCardTitle}>
              {Strings.cancelAppointment.rescheduleBoxTitle}
            </Text>
            <Text style={styles.rescheduleCardSubtitle}>
              {Strings.cancelAppointment.rescheduleBoxSubtitle}
            </Text>

            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.rescheduleBtn}
              onPress={handleReschedule}
            >
              <Ionicons name="calendar-outline" size={18} color="#FFFFFF" />
              <Text style={styles.rescheduleBtnText}>
                {Strings.cancelAppointment.rescheduleBtnText}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Actions: Cancel & Keep Appointment */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.cancelActionBtn}
              onPress={handleConfirmCancel}
            >
              <Ionicons name="close-circle-outline" size={20} color="#DC2626" />
              <Text style={styles.cancelActionBtnText}>
                {Strings.cancelAppointment.cancelBtnText}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.keepActionBtn}
              onPress={handleKeepAppointment}
            >
              <Text style={styles.keepActionBtnText}>
                {Strings.cancelAppointment.keepBtnText}
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
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
  },
  userAvatarWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  userAvatarImg: {
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    gap: 20,
  },

  /* Doctor Profile Row */
  doctorHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'transparent',
  },
  doctorAvatarContainer: {
    position: 'relative',
    width: 64,
    height: 64,
  },
  doctorAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#0D9488',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  doctorTextGroup: {
    flex: 1,
    gap: 3,
  },
  doctorNameText: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
  },
  doctorSpecialtyText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  originalDatePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  originalDatePillText: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: '#0052CC',
    letterSpacing: 0.3,
  },

  /* Free Cancellation Banner */
  policyCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  policyIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  policyTextGroup: {
    flex: 1,
    gap: 4,
  },
  policyTitle: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
  },
  policySubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },

  /* Reasons Section */
  reasonsSection: {
    gap: 12,
  },
  reasonsSectionTitle: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
  },
  reasonsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  reasonChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 9999,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  reasonChipSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  reasonChipText: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.medium,
    color: '#334155',
  },
  reasonChipTextSelected: {
    color: Colors.primary,
    fontWeight: Typography.fontWeight.bold,
  },

  /* Reschedule Card */
  rescheduleCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: 4,
  },
  rescheduleCardTitle: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
    textAlign: 'center',
  },
  rescheduleCardSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  rescheduleBtn: {
    width: '100%',
    height: 48,
    borderRadius: 9999,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  rescheduleBtnText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },

  /* Bottom Actions */
  actionButtonsContainer: {
    gap: 12,
    marginTop: 4,
  },
  cancelActionBtn: {
    height: 50,
    borderRadius: 9999,
    backgroundColor: '#FEE2E2',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  cancelActionBtnText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: '#DC2626',
  },
  keepActionBtn: {
    height: 52,
    borderRadius: 9999,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  keepActionBtnText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
});

export default CancelAppointmentScreen;
