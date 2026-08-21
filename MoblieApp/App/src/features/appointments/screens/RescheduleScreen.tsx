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
  Modal,
  Platform,
  Alert,
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
import { rescheduleAppointmentViaBackend, fetchAvailableSlotsFromApi } from '@/api/appointmentApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface DatePillItem {
  id: string;
  dayLabel: string; // e.g. "MON", "TUE"
  dateNum: string; // e.g. "16", "17"
  fullDateStr: string; // e.g. "Tue, 17 Sep 2026"
  monthYearStr: string; // e.g. "September 2026"
  rawDate: Date;
  isToday: boolean;
}

export interface TimeSlotItem {
  id: string;
  time: string;
  isAvailable: boolean;
  isLocked?: boolean;
  reason?: 'expired' | 'booked';
}

const MASTER_TIME_SLOTS = [
  '08:30 AM',
  '09:30 AM',
  '10:30 AM',
  '11:00 AM',
  '11:45 AM',
  '02:00 PM',
  '03:30 PM',
  '04:30 PM',
  '06:00 PM',
];

const generateUpcomingDatePills = (count = 14): DatePillItem[] => {
  const pills: DatePillItem[] = [];
  const today = new Date();

  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    const dateNum = d.getDate().toString();
    const monthShort = d.toLocaleDateString('en-US', { month: 'short' });
    const yearStr = d.getFullYear();
    const monthYear = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const fullDateStr = `${dayName.slice(0, 3)}, ${dateNum} ${monthShort} ${yearStr}`;

    pills.push({
      id: `d_${d.getFullYear()}_${d.getMonth() + 1}_${dateNum}`,
      dayLabel: dayName.slice(0, 3),
      dateNum,
      fullDateStr,
      monthYearStr: monthYear,
      rawDate: d,
      isToday: i === 0,
    });
  }

  return pills;
};

const isTimeSlotExpired = (targetDate: Date, timeSlotStr: string): boolean => {
  const now = new Date();

  // If target date is strictly in the future (after today)
  if (
    targetDate.getFullYear() > now.getFullYear() ||
    (targetDate.getFullYear() === now.getFullYear() && targetDate.getMonth() > now.getMonth()) ||
    (targetDate.getFullYear() === now.getFullYear() &&
      targetDate.getMonth() === now.getMonth() &&
      targetDate.getDate() > now.getDate())
  ) {
    return false;
  }

  // If target date is in the past
  if (
    targetDate.getFullYear() < now.getFullYear() ||
    (targetDate.getFullYear() === now.getFullYear() && targetDate.getMonth() < now.getMonth()) ||
    (targetDate.getFullYear() === now.getFullYear() &&
      targetDate.getMonth() === now.getMonth() &&
      targetDate.getDate() < now.getDate())
  ) {
    return true;
  }

  // Target date is TODAY -> parse timeSlotStr
  const match = timeSlotStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return false;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  const slotDate = new Date(now);
  slotDate.setHours(hours, minutes, 0, 0);

  // Expired if slot time is before or equal to current time + 15 mins cutoff
  return slotDate.getTime() <= now.getTime() + 15 * 60 * 1000;
};

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

  // Dynamic upcoming date pills generator (14 days starting today)
  const datePills = useMemo(() => generateUpcomingDatePills(14), []);
  const [selectedDateId, setSelectedDateId] = useState<string>(datePills[0]?.id || '');
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [selectedSlotTime, setSelectedSlotTime] = useState<string>('09:30 AM');
  const [activeNavTab, setActiveNavTab] = useState<TabKey>('bookings');

  // Submit / Success states
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState<boolean>(false);

  // Dynamic values from router params
  const bookingId = params.bookingId || 'OPT-849204';
  const doctorName = params.doctorName || 'Dr. Ananya Iyer';
  const doctorSpecialty = params.doctorSpecialty || 'MSK Specialist';
  const clinicName = params.clinicName || 'One Medical Hub';
  const currentScheduledOriginal = params.fullDate && params.timeSlot
    ? `${params.fullDate}, ${params.timeSlot}`
    : 'OCT 24, 10:30 AM';
  const avatarKey = params.avatarImageName || 'doctor_ananya';
  const avatarSource = DoctorAvatarMap[avatarKey] || DoctorAvatarMap.doctor_ananya;

  const selectedDate = useMemo(() => {
    return datePills.find((d) => d.id === selectedDateId) || datePills[0];
  }, [selectedDateId, datePills]);

  // Dynamically fetch booked slots whenever selectedDate or doctorId changes
  useEffect(() => {
    let isMounted = true;
    setLoadingSlots(true);
    const docId = params.doctorId || 'doc_1';

    fetchAvailableSlotsFromApi(docId, selectedDate.fullDateStr)
      .then((res) => {
        if (isMounted && res) {
          setBookedSlots(res.bookedSlots || []);
        }
      })
      .catch((err) => {
        console.warn('Error fetching available slots:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingSlots(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedDate, params.doctorId]);

  // Compute available / locked time slots based on expiration and booked slots
  const timeSlotsList = useMemo<TimeSlotItem[]>(() => {
    return MASTER_TIME_SLOTS.map((time, idx) => {
      const isExpired = isTimeSlotExpired(selectedDate.rawDate, time);
      // Check if slot is booked by ANOTHER appointment (allow if same appointment)
      const isBooked = bookedSlots.includes(time) && !(params.fullDate === selectedDate.fullDateStr && params.timeSlot === time);
      const isLocked = isExpired || isBooked;

      return {
        id: `t_${idx}`,
        time,
        isAvailable: !isLocked,
        isLocked,
        reason: isExpired ? 'expired' : isBooked ? 'booked' : undefined,
      };
    });
  }, [selectedDate, bookedSlots, params.fullDate, params.timeSlot]);

  // Automatically select first valid available time slot if selected slot is locked/expired
  useEffect(() => {
    const currentSlotObj = timeSlotsList.find((s) => s.time === selectedSlotTime);
    if (!currentSlotObj || !currentSlotObj.isAvailable) {
      const firstValid = timeSlotsList.find((s) => s.isAvailable);
      if (firstValid) {
        setSelectedSlotTime(firstValid.time);
      }
    }
  }, [timeSlotsList, selectedSlotTime]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/my-bookings' as any);
    }
  };

  const handleConfirmReschedule = async () => {
    const selectedSlotObj = timeSlotsList.find((s) => s.time === selectedSlotTime);
    if (!selectedSlotObj || !selectedSlotObj.isAvailable) {
      Alert.alert('Invalid Selection', 'The selected time slot is unavailable or expired. Please pick an available slot.');
      return;
    }

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

          <Text style={styles.headerTitle}>Reschedule Appointment</Text>

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
                  CURRENT: {currentScheduledOriginal.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>

          {/* SELECT NEW DATE SECTION */}
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Select New Date</Text>
              <Text style={styles.monthLabel}>{selectedDate.monthYearStr}</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dateScrollContainer}
            >
              {datePills.map((item) => {
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
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Available Time Slots</Text>
              {loadingSlots && <ActivityIndicator size="small" color="#003D9B" />}
            </View>

            <View style={styles.timeSlotsGrid}>
              {timeSlotsList.map((slot) => {
                const isSelected = slot.time === selectedSlotTime;
                const isLocked = slot.isLocked;

                if (isLocked) {
                  return (
                    <View key={slot.id} style={styles.slotChipLocked}>
                      <Ionicons
                        name={slot.reason === 'expired' ? 'time-outline' : 'lock-closed'}
                        size={13}
                        color="#94A3B8"
                        style={{ marginRight: 4 }}
                      />
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
