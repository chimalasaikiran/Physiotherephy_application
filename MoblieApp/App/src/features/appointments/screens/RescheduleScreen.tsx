import React, { useState, useMemo } from 'react';
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
  Modal,
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
import { rescheduleAppointmentViaBackend } from '@/api/appointmentApi';

import { Alert } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface DatePillItem {
  id: string;
  dayLabel: string; // e.g. "MON", "TUE"
  dateNum: string; // e.g. "16", "17"
  fullDateStr: string; // e.g. "Tue, 17 Sept"
  hasSlotAvailable: boolean;
}

export interface TimeSlotItem {
  id: string;
  time: string;
  isAvailable: boolean;
  isLocked?: boolean;
}

const DATE_PILLS: DatePillItem[] = [
  { id: 'd16', dayLabel: 'MON', dateNum: '16', fullDateStr: 'Mon, 16 Sept', hasSlotAvailable: true },
  { id: 'd17', dayLabel: 'TUE', dateNum: '17', fullDateStr: 'Tue, 17 Sept', hasSlotAvailable: true },
  { id: 'd18', dayLabel: 'WED', dateNum: '18', fullDateStr: 'Wed, 18 Sept', hasSlotAvailable: true },
  { id: 'd19', dayLabel: 'THU', dateNum: '19', fullDateStr: 'Thu, 19 Sept', hasSlotAvailable: true },
  { id: 'd20', dayLabel: 'FRI', dateNum: '20', fullDateStr: 'Fri, 20 Sept', hasSlotAvailable: true },
  { id: 'd21', dayLabel: 'SAT', dateNum: '21', fullDateStr: 'Sat, 21 Sept', hasSlotAvailable: true },
  { id: 'd22', dayLabel: 'SUN', dateNum: '22', fullDateStr: 'Sun, 22 Sept', hasSlotAvailable: true },
];

const TIME_SLOTS: TimeSlotItem[] = [
  { id: 't1', time: '08:30 AM', isAvailable: true },
  { id: 't2', time: '09:30 AM', isAvailable: true },
  { id: 't3', time: '10:00 AM', isAvailable: false, isLocked: true },
  { id: 't4', time: '11:00 AM', isAvailable: true },
  { id: 't5', time: '11:45 AM', isAvailable: true },
  { id: 't6', time: '02:00 PM', isAvailable: true },
  { id: 't7', time: '03:30 PM', isAvailable: true },
];

export const RescheduleScreen: React.FC = () => {
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
    avatarImageName?: 'doctor_ananya' | 'doctor_arjun' | 'care_team_doctor';
    feeStr?: string;
  }>();

  // Dynamic values
  const bookingId = params.bookingId || 'OPT-849204';
  const doctorName = params.doctorName || 'Dr. Ananya Iyer';
  const doctorSpecialty = params.doctorSpecialty || 'MSK Specialist';
  const clinicName = params.clinicName || 'One Medical Hub';
  const currentScheduledOriginal = params.fullDate && params.timeSlot
    ? `${params.fullDate}, ${params.timeSlot}`
    : 'OCT 24, 10:30 AM';
  const avatarKey = params.avatarImageName || 'doctor_ananya';
  const avatarSource = DoctorAvatarMap[avatarKey] || DoctorAvatarMap.doctor_ananya;

  // Selected date & slot states matching exact Figma reference
  const [selectedDateId, setSelectedDateId] = useState<string>('d17'); // TUE 17 selected by default
  const [selectedSlotTime, setSelectedSlotTime] = useState<string>('09:30 AM'); // 09:30 AM selected by default
  const [activeNavTab, setActiveNavTab] = useState<TabKey>('bookings');

  // Submit / Success states
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState<boolean>(false);

  const selectedDate = useMemo(() => {
    return DATE_PILLS.find((d) => d.id === selectedDateId) || DATE_PILLS[1];
  }, [selectedDateId]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/my-bookings' as any);
    }
  };

  const handleConfirmReschedule = async () => {
    setIsSubmitting(true);
    try {
      if (params.bookingId) {
        await rescheduleAppointmentViaBackend(
          params.bookingId,
          params.doctorId || 'doc_1',
          params.fullDate || 'Oct 24, 2026',
          params.timeSlot || '04:30 PM',
          selectedDate.fullDateStr,
          selectedSlotTime,
          selectedDate.id
        );
      }
      setIsSubmitting(false);
      setIsSuccessModalVisible(true);
    } catch (err: any) {
      setIsSubmitting(false);
      if (err?.message === 'SLOT_ALREADY_BOOKED') {
        Alert.alert(
          'Slot Unavailable',
          'This date/time slot was just booked by another user. Please select another slot.',
          [{ text: 'OK' }]
        );
      } else {
        console.error('Error rescheduling appointment via backend:', err);
        // Fallback success UI if demo
        setIsSuccessModalVisible(true);
      }
    }
  };


  const handleSuccessDone = () => {
    setIsSuccessModalVisible(false);
    router.replace({
      pathname: '/my-bookings' as any,
      params: { bookingId },
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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent />

      {/* HEADER BAR */}
      <View style={[styles.header, { paddingTop: insets.top + 4, height: 56 + insets.top }]}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleBack}
            style={styles.backBtn}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color="#003D9B" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Appointment Details</Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/my-bookings' as any)}
            style={styles.avatarBtn}
            accessibilityLabel="Profile"
          >
            <Image source={avatarSource} style={styles.headerAvatar} resizeMode="cover" />
          </TouchableOpacity>
        </View>

        {/* MAIN SCROLLABLE CONTENT */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 110 + Math.max(insets.bottom, 12) },
          ]}
        >
          {/* DOCTOR & ORIGINAL SCHEDULE SNAPSHOT CARD */}
          <View style={styles.doctorSnapshotCard}>
            <View style={styles.avatarWrapper}>
              <Image source={avatarSource} style={styles.docImg} resizeMode="cover" />
              <View style={styles.docBadgeIcon}>
                <Ionicons name="checkmark-circle" size={14} color="#0D9488" />
              </View>
            </View>

            <View style={styles.docDetailsCol}>
              <Text style={styles.docName}>{doctorName}</Text>
              <Text style={styles.docMetaStr}>{doctorSpecialty} • {clinicName}</Text>

              <View style={styles.originalPill}>
                <Ionicons name="calendar-outline" size={13} color="#003D9B" style={{ marginRight: 4 }} />
                <Text style={styles.originalPillText}>
                  ORIGINAL: {currentScheduledOriginal.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>

          {/* SELECT NEW DATE SECTION */}
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Select New Date</Text>
              <Text style={styles.monthLabel}>September 2024</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dateScrollContainer}
            >
              {DATE_PILLS.map((item) => {
                const isSelected = item.id === selectedDateId;
                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.85}
                    onPress={() => setSelectedDateId(item.id)}
                    style={[
                      styles.datePill,
                      isSelected ? styles.datePillSelected : styles.datePillUnselected,
                    ]}
                  >
                    {isSelected ? (
                      <View style={styles.selectedRingBorder}>
                        <Text style={styles.datePillDaySelected}>{item.dayLabel}</Text>
                        <Text style={styles.datePillNumSelected}>{item.dateNum}</Text>
                        <Text style={styles.datePillDotSelected}>•</Text>
                      </View>
                    ) : (
                      <>
                        <Text style={styles.datePillDay}>{item.dayLabel}</Text>
                        <Text style={styles.datePillNum}>{item.dateNum}</Text>
                        <Text style={styles.datePillDot}>•</Text>
                      </>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* AVAILABLE TIME SLOTS SECTION */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Time Slots</Text>

            <View style={styles.timeSlotsGrid}>
              {TIME_SLOTS.map((slot) => {
                const isSelected = slot.time === selectedSlotTime;
                const isLocked = slot.isLocked;

                if (isLocked) {
                  return (
                    <View key={slot.id} style={styles.slotChipLocked}>
                      <Ionicons name="lock-closed" size={13} color="#94A3B8" style={{ marginRight: 4 }} />
                      <Text style={styles.slotTextLocked}>{slot.time}</Text>
                    </View>
                  );
                }

                return (
                  <TouchableOpacity
                    key={slot.id}
                    activeOpacity={0.8}
                    onPress={() => setSelectedSlotTime(slot.time)}
                    style={[
                      styles.slotChip,
                      isSelected ? styles.slotChipSelected : styles.slotChipUnselected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.slotText,
                        isSelected ? styles.slotTextSelected : styles.slotTextUnselected,
                      ]}
                    >
                      {slot.time}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* SELECTED RESCHEDULE SUMMARY CARD */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryIconBox}>
              <Ionicons name="calendar" size={22} color="#003D9B" />
            </View>
            <View style={styles.summaryTextGroup}>
              <Text style={styles.summaryMainText}>
                {selectedDate.fullDateStr} • {selectedSlotTime}
              </Text>
              <Text style={styles.summarySubText}>45 mins consultation</Text>
            </View>
          </View>

          {/* CONFIRM RESCHEDULE PRIMARY BUTTON */}
          <TouchableOpacity
            activeOpacity={0.88}
            disabled={isSubmitting}
            style={[styles.confirmBtn, isSubmitting && styles.confirmBtnDisabled]}
            onPress={handleConfirmReschedule}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.confirmBtnText}>Confirm Reschedule</Text>
                <Ionicons name="arrow-forward-sharp" size={20} color="#FFFFFF" style={{ marginLeft: 6 }} />
              </>
            )}
          </TouchableOpacity>
        </ScrollView>

        {/* BOTTOM NAVIGATION MENU BAR */}
        <BottomNavBar activeTab={activeNavTab} onTabPress={handleNavTabPress} />

      {/* RESCHEDULE SUCCESS MODAL */}
      <Modal
        visible={isSuccessModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleSuccessDone}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentCard}>
            <View style={styles.modalIconOuterCircle}>
              <Ionicons name="checkmark-sharp" size={38} color="#FFFFFF" />
            </View>

            <Text style={styles.modalTitle}>Rescheduled Successfully! 🎉</Text>
            <Text style={styles.modalSubtitle}>
              Your appointment date & time slot have been updated. We have sent the revised confirmation details.
            </Text>

            <View style={styles.modalSummaryBox}>
              <View style={styles.modalRow}>
                <Text style={styles.modalRowLabel}>Therapist</Text>
                <Text style={styles.modalRowVal}>{doctorName}</Text>
              </View>
              <View style={styles.modalDivider} />
              <View style={styles.modalRow}>
                <Text style={styles.modalRowLabel}>New Date</Text>
                <Text style={styles.modalRowValHighlight}>{selectedDate.fullDateStr}</Text>
              </View>
              <View style={styles.modalDivider} />
              <View style={styles.modalRow}>
                <Text style={styles.modalRowLabel}>New Time Slot</Text>
                <Text style={styles.modalRowValHighlight}>{selectedSlotTime}</Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.modalDoneBtn}
              onPress={handleSuccessDone}
            >
              <Text style={styles.modalDoneBtnText}>Go to My Bookings</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },
  avatarBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  headerAvatar: {
    width: 38,
    height: 38,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    gap: Spacing.xl,
  },
  doctorSnapshotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: Spacing.md,
    gap: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarWrapper: {
    position: 'relative',
  },
  docImg: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  docBadgeIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  docDetailsCol: {
    flex: 1,
    gap: 2,
  },
  docName: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    color: '#0A192F',
  },
  docMetaStr: {
    fontSize: 12,
    color: '#64748B',
  },
  originalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    marginTop: 4,
  },
  originalPillText: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
    letterSpacing: 0.3,
  },
  section: {
    gap: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    color: '#0A192F',
  },
  monthLabel: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },
  dateScrollContainer: {
    gap: 10,
    paddingVertical: 4,
  },
  datePill: {
    width: 64,
    height: 84,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePillUnselected: {
    backgroundColor: '#EEF2FE',
  },
  datePillSelected: {
    backgroundColor: '#003D9B',
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  selectedRingBorder: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#003D9B',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#003D9B',
  },
  datePillDay: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    color: '#64748B',
    letterSpacing: 0.5,
  },
  datePillDaySelected: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: 0.5,
  },
  datePillNum: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.bold,
    color: '#0A192F',
    marginTop: 2,
  },
  datePillNumSelected: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
    marginTop: 2,
  },
  datePillDot: {
    fontSize: 14,
    color: '#003D9B',
    marginTop: 1,
  },
  datePillDotSelected: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 1,
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  slotChip: {
    width: (SCREEN_WIDTH - 40 - 20) / 3,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  slotChipUnselected: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  slotChipSelected: {
    backgroundColor: '#DCE7FF',
    borderWidth: 1.5,
    borderColor: '#003D9B',
  },
  slotChipLocked: {
    width: (SCREEN_WIDTH - 40 - 20) / 3,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  slotText: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.bold,
  },
  slotTextUnselected: {
    color: '#334155',
  },
  slotTextSelected: {
    color: '#003D9B',
  },
  slotTextLocked: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.medium,
    color: '#94A3B8',
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: Spacing.md,
    gap: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryTextGroup: {
    flex: 1,
    gap: 2,
  },
  summaryMainText: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.bold,
    color: '#0A192F',
  },
  summarySubText: {
    fontSize: 12,
    color: '#64748B',
  },
  confirmBtn: {
    height: 54,
    borderRadius: 9999,
    backgroundColor: '#003D9B',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    marginTop: 4,
  },
  confirmBtnDisabled: {
    opacity: 0.7,
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  modalContentCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: Spacing.xl,
    alignItems: 'center',
    elevation: 10,
  },
  modalIconOuterCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: Typography.fontWeight.bold,
    color: '#0A192F',
    textAlign: 'center',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Spacing.lg,
    paddingHorizontal: 8,
  },
  modalSummaryBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    gap: 8,
    marginBottom: Spacing.xl,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalRowLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  modalRowVal: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold,
    color: '#0A192F',
  },
  modalRowValHighlight: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  modalDoneBtn: {
    width: '100%',
    height: 48,
    borderRadius: 9999,
    backgroundColor: '#003D9B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  modalDoneBtnText: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
  },
});

export default RescheduleScreen;
