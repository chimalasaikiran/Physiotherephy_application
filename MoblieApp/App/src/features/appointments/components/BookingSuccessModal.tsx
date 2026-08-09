import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';
import { Strings } from '@/constants';
import { BookingDetails } from './PaymentSelectionModal';

export interface BookingSuccessModalProps {
  visible: boolean;
  booking: {
    bookingDetails: BookingDetails;
    paymentMode: 'online' | 'clinic';
    paymentMethodId: string;
  } | null;
  onDone: () => void;
}

export const BookingSuccessModal: React.FC<BookingSuccessModalProps> = ({
  visible,
  booking,
  onDone,
}) => {
  if (!booking) return null;

  const { bookingDetails, paymentMode } = booking;
  const confStrings = Strings.booking.confirmation;

  const handleAddToCalendar = () => {
    Alert.alert(
      'Calendar Synced 📅',
      `Appointment with ${bookingDetails.doctor.name} on ${bookingDetails.fullDate} at ${bookingDetails.timeSlot} added to your calendar.`
    );
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={false} onRequestClose={onDone}>
      <SafeAreaView style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Top Checkmark Circle */}
          <View style={styles.heroBadgeWrapper}>
            <View style={styles.outerBadge}>
              <View style={styles.innerBadge}>
                <Ionicons name="checkmark" size={38} color={Colors.white} />
              </View>
            </View>
          </View>

          {/* Headline */}
          <View style={styles.headlineContainer}>
            <Text style={styles.title}>{confStrings.title}</Text>
            <Text style={styles.subtitle}>{confStrings.subtitle}</Text>
          </View>

          {/* Appointment Ticket Details */}
          <View style={styles.ticketCard}>
            <View style={styles.ticketHeader}>
              <Text style={styles.refLabel}>{confStrings.refLabel}</Text>
              <Text style={styles.refValue}>OPT-849204</Text>
            </View>

            <View style={styles.ticketDivider} />

            {/* Doctor info */}
            <View style={styles.detailRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="person" size={16} color={Colors.primary} />
              </View>
              <View style={styles.detailTextGroup}>
                <Text style={styles.detailTitle}>{bookingDetails.doctor.name}</Text>
                <Text style={styles.detailSub}>{bookingDetails.doctor.specialty}</Text>
              </View>
            </View>

            {/* Date & Time */}
            <View style={styles.detailRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="calendar" size={16} color="#0284C7" />
              </View>
              <View style={styles.detailTextGroup}>
                <Text style={styles.detailTitle}>{bookingDetails.fullDate}</Text>
                <Text style={styles.detailSub}>{bookingDetails.timeSlot}</Text>
              </View>
            </View>

            {/* Clinic location */}
            <View style={styles.detailRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="location" size={16} color="#9333EA" />
              </View>
              <View style={styles.detailTextGroup}>
                <Text style={styles.detailTitle}>{bookingDetails.doctor.clinicName}</Text>
                <Text style={styles.detailSub}>{bookingDetails.doctor.clinicAddress}</Text>
              </View>
            </View>

            <View style={styles.ticketDivider} />

            {/* Status row */}
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>{confStrings.statusLabel}</Text>
              <View style={paymentMode === 'online' ? styles.paidBadge : styles.pendingBadge}>
                <Ionicons
                  name={paymentMode === 'online' ? 'checkmark-circle' : 'time-outline'}
                  size={14}
                  color={paymentMode === 'online' ? '#16A34A' : '#D97706'}
                />
                <Text style={paymentMode === 'online' ? styles.paidText : styles.pendingText}>
                  {paymentMode === 'online' ? confStrings.statusPaid : confStrings.statusPayAtClinic}
                </Text>
              </View>
            </View>
          </View>

          {/* Important Instructions Card */}
          <View style={styles.instructionsCard}>
            <View style={styles.instrHeader}>
              <Ionicons name="information-circle" size={18} color={Colors.primary} />
              <Text style={styles.instrTitle}>{confStrings.importantInstructionsTitle}</Text>
            </View>
            {confStrings.instructions.map((item, idx) => (
              <View key={idx} style={styles.instrRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.instrText}>{item}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.footerShell}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.calendarBtn}
            onPress={handleAddToCalendar}
          >
            <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
            <Text style={styles.calendarBtnText}>{confStrings.addToCalendar}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.doneBtn}
            onPress={onDone}
          >
            <Text style={styles.doneBtnText}>{confStrings.backToHome}</Text>
            <Ionicons name="arrow-forward" size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xxl,
    paddingTop: 36,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.xl,
  },
  heroBadgeWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerBadge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  headlineContainer: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.md,
  },
  ticketCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    gap: Spacing.md,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  refLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  refValue: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  ticketDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailTextGroup: {
    flex: 1,
  },
  detailTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
  },
  detailSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    gap: 4,
  },
  paidText: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: '#166534',
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    gap: 4,
  },
  pendingText: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: '#B45309',
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
  instrHeader: {
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
  instrRow: {
    flexDirection: 'row',
    gap: 6,
  },
  bullet: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  instrText: {
    fontSize: 11,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
  footerShell: {
    width: '100%',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    gap: 10,
  },
  calendarBtn: {
    height: 48,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: '#EFF6FF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  calendarBtnText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  doneBtn: {
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
  doneBtnText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
});
