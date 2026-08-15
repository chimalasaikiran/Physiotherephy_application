import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';
import { AppointmentConfirmedData, PaymentTransactionData } from '@/constants';

import { TherapistAvatar } from '@/components';

interface ConfirmedTicketCardProps {
  transactionData: PaymentTransactionData;
}

export const ConfirmedTicketCard: React.FC<ConfirmedTicketCardProps> = ({
  transactionData,
}) => {
  const { doctor, serviceTitle, fullDate, timeSlot, placeTitle, placeAddress, paymentMode, feeStr, bookingId } =
    transactionData;

  return (
    <View style={styles.card}>
      {/* Top Header: Booking Reference & Status Tag */}
      <View style={styles.topRow}>
        <View>
          <Text style={styles.refLabel}>BOOKING REFERENCE</Text>
          <Text style={styles.refValue}>#{bookingId}</Text>
        </View>

        <View style={paymentMode === 'online' ? styles.paidBadge : styles.pendingBadge}>
          <Ionicons
            name={paymentMode === 'online' ? 'checkmark-circle' : 'time-outline'}
            size={14}
            color={paymentMode === 'online' ? '#16A34A' : '#D97706'}
          />
          <Text style={paymentMode === 'online' ? styles.paidText : styles.pendingText}>
            {paymentMode === 'online'
              ? AppointmentConfirmedData.statusPaid
              : AppointmentConfirmedData.statusPayAtClinic}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Doctor & Service Overview */}
      <View style={styles.doctorRow}>
        <TherapistAvatar
          name={doctor.name}
          avatarUrl={(doctor as any).avatarUrl}
          imageName={doctor.imageName}
          size={54}
        />

        <View style={styles.doctorTextGroup}>
          <Text style={styles.doctorName}>{doctor.name}</Text>
          <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>

          {Boolean(serviceTitle) && (
            <View style={styles.serviceTagPill}>
              <Ionicons name="medical" size={10} color={Colors.primary} />
              <Text style={styles.serviceTagText}>{serviceTitle}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.divider} />

      {/* Date & Time Slot Grid */}
      <View style={styles.infoGrid}>
        <View style={styles.infoCell}>
          <View style={styles.iconCircleBlue}>
            <Ionicons name="calendar-outline" size={18} color="#0284C7" />
          </View>
          <View>
            <Text style={styles.cellLabel}>Date</Text>
            <Text style={styles.cellValue}>{fullDate}</Text>
          </View>
        </View>

        <View style={styles.infoCell}>
          <View style={styles.iconCirclePurple}>
            <Ionicons name="time-outline" size={18} color="#9333EA" />
          </View>
          <View>
            <Text style={styles.cellLabel}>Time Slot</Text>
            <Text style={styles.cellValue}>{timeSlot}</Text>
          </View>
        </View>
      </View>

      {/* Location Row */}
      <View style={styles.locationRow}>
        <View style={styles.iconCircleTeal}>
          <Ionicons name="location-outline" size={18} color="#0D9488" />
        </View>
        <View style={styles.locationTextGroup}>
          <Text style={styles.cellLabel}>Location & Clinic</Text>
          <Text style={styles.locationTitle}>{placeTitle || doctor.clinicName}</Text>
          <Text style={styles.locationSub}>{placeAddress || doctor.clinicAddress}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Payment Total Amount Row */}
      <View style={styles.paymentSummaryRow}>
        <Text style={styles.totalLabel}>Total Fee Paid</Text>
        <Text style={styles.totalValue}>{feeStr}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 22,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    gap: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  refLabel: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  refValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    marginTop: 2,
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
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  doctorAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  doctorTextGroup: {
    flex: 1,
  },
  doctorName: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
  },
  doctorSpecialty: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  serviceTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
    marginTop: 4,
  },
  serviceTagText: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  infoCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 14,
    gap: 10,
  },
  iconCircleBlue: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCirclePurple: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleTeal: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#CCFBF1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellLabel: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  cellValue: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 14,
    gap: 10,
  },
  locationTextGroup: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
    marginTop: 2,
  },
  locationSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  paymentSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
  },
  totalValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
});
