import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';
import { Strings } from '@/constants';
import { Doctor } from './DoctorBookingCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface DateTimeSelectorModalProps {
  visible: boolean;
  doctor: Doctor | null;
  onClose: () => void;
  onProceedToPayment: (bookingDetails: {
    doctor: Doctor;
    placeId: string;
    dateId: string;
    fullDate: string;
    timeSlot: string;
    feeStr: string;
    numericFee: number;
  }) => void;
}

export const DateTimeSelectorModal: React.FC<DateTimeSelectorModalProps> = ({
  visible,
  doctor,
  onClose,
  onProceedToPayment,
}) => {
  if (!doctor) return null;

  const places = Strings.booking.places;
  const dates = Strings.booking.dates;
  const timeSlots = Strings.booking.timeSlots;

  const [selectedPlaceId, setSelectedPlaceId] = useState<string>('clinic');
  const [selectedDateId, setSelectedDateId] = useState<string>('d1');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('04:30 PM');

  const selectedPlace = places.find((p) => p.id === selectedPlaceId) || places[0];
  const selectedDate = dates.find((d) => d.id === selectedDateId) || dates[0];

  const handleProceed = () => {
    onProceedToPayment({
      doctor,
      placeId: selectedPlace.id,
      dateId: selectedDate.id,
      fullDate: selectedDate.fullDate,
      timeSlot: selectedTimeSlot,
      feeStr: selectedPlace.fee,
      numericFee: selectedPlace.numericFee,
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdropTouch} activeOpacity={1} onPress={onClose} />

        <SafeAreaView style={styles.modalContentShell}>
          <View style={styles.header}>
            <View style={styles.dragPill} />
            <View style={styles.headerTopRow}>
              <View>
                <Text style={styles.headerTitle}>Select Date & Time</Text>
                <Text style={styles.headerSubtitle}>
                  Booking session with {doctor.name}
                </Text>
              </View>

              <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                <Ionicons name="close" size={20} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
          >
            {/* 1. DOCTOR SUMMARY SNAPSHOT */}
            <View style={styles.doctorSnapshot}>
              <View style={[styles.docAvatarCircle, { backgroundColor: doctor.avatarBg }]}>
                <Text style={styles.docAvatarText}>
                  {doctor.name.split(' ').map((n) => n[0]).join('')}
                </Text>
              </View>

              <View style={styles.docSnapshotInfo}>
                <Text style={styles.docName}>{doctor.name}</Text>
                <Text style={styles.docSpec}>{doctor.specialty}</Text>
                <Text style={styles.docExp}>
                  {doctor.experienceStr} • {doctor.rating} ★ ({doctor.reviewsCount})
                </Text>
              </View>
            </View>

            {/* 2. SELECT APPOINTMENT PLACE */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{Strings.booking.placesTitle}</Text>

              <View style={styles.placesList}>
                {places.map((place) => {
                  const isSelected = place.id === selectedPlaceId;
                  return (
                    <TouchableOpacity
                      key={place.id}
                      activeOpacity={0.8}
                      onPress={() => setSelectedPlaceId(place.id)}
                      style={[
                        styles.placeCard,
                        isSelected && styles.placeCardSelected,
                      ]}
                    >
                      <View style={styles.placeLeft}>
                        <View style={[styles.placeIconBox, isSelected && styles.placeIconBoxSelected]}>
                          <Ionicons
                            name={place.icon as any}
                            size={20}
                            color={isSelected ? Colors.white : Colors.primary}
                          />
                        </View>

                        <View style={styles.placeInfo}>
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
                          name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                          size={18}
                          color={isSelected ? Colors.primary : Colors.textMuted}
                        />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 3. SELECT DATE */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Date</Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateScroll}>
                {dates.map((d) => {
                  const isSelected = d.id === selectedDateId;
                  return (
                    <TouchableOpacity
                      key={d.id}
                      activeOpacity={0.8}
                      onPress={() => setSelectedDateId(d.id)}
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
              <Text style={styles.sectionTitle}>Select Time Slot ({selectedDate.fullDate})</Text>

              <View style={styles.timeGrid}>
                {timeSlots.map((slot) => {
                  const isSelected = slot.time === selectedTimeSlot;
                  return (
                    <TouchableOpacity
                      key={slot.id}
                      activeOpacity={0.8}
                      onPress={() => setSelectedTimeSlot(slot.time)}
                      style={[
                        styles.timeChip,
                        isSelected && styles.timeChipSelected,
                      ]}
                    >
                      <Ionicons
                        name="time-outline"
                        size={14}
                        color={isSelected ? Colors.white : Colors.textSecondary}
                      />
                      <Text style={[styles.timeText, isSelected && styles.timeTextSelected]}>
                        {slot.time}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* BOTTOM FOOTER BUTTON */}
          <View style={styles.footerShell}>
            <View style={styles.footerPriceRow}>
              <View>
                <Text style={styles.footerFeeLabel}>Total Consultation Fee</Text>
                <Text style={styles.footerFeeValue}>{selectedPlace.fee}</Text>
              </View>
              <Text style={styles.footerTaxIncluded}>Taxes Included</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.proceedButton}
              onPress={handleProceed}
            >
              <Text style={styles.proceedText}>Proceed to Payment</Text>
              <Ionicons name="arrow-forward" size={18} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdropTouch: {
    flex: 1,
  },
  modalContentShell: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: 12,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  dragPill: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.inputBorder,
    alignSelf: 'center',
    marginBottom: 12,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollBody: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    gap: Spacing.xl,
  },
  doctorSnapshot: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: Spacing.md,
    borderRadius: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  docAvatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  docAvatarText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  docSnapshotInfo: {
    flex: 1,
  },
  docName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
  },
  docSpec: {
    fontSize: Typography.fontSize.xs,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.medium,
  },
  docExp: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
  },
  placesList: {
    gap: 10,
  },
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
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
  placeIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeIconBoxSelected: {
    backgroundColor: Colors.primary,
  },
  placeInfo: {
    flex: 1,
  },
  placeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: Typography.fontWeight.bold,
    color: '#166534',
  },
  placeSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  placeRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  placeFee: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
  },
  placeFeeSelected: {
    color: Colors.primary,
  },
  dateScroll: {
    gap: 10,
  },
  dateCard: {
    width: 84,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dateCardSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dateLabel: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textSecondary,
  },
  dateLabelSelected: {
    color: Colors.white,
  },
  dateStr: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
    marginTop: 2,
  },
  dateStrSelected: {
    color: Colors.white,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeChip: {
    width: (SCREEN_WIDTH - 40 - 20) / 3,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EEF2F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  timeChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.textPrimary,
  },
  timeTextSelected: {
    color: Colors.white,
  },
  footerShell: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    backgroundColor: Colors.white,
    gap: Spacing.md,
  },
  footerPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerFeeLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  footerFeeValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
  },
  footerTaxIncluded: {
    fontSize: 11,
    color: '#16A34A',
    fontWeight: Typography.fontWeight.semiBold,
  },
  proceedButton: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 9999,
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
  proceedText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
});
