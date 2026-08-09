import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';
import { Strings } from '@/constants';
import { Doctor } from './DoctorBookingCard';

export interface BookingDetails {
  doctor: Doctor;
  placeId: string;
  dateId: string;
  fullDate: string;
  timeSlot: string;
  feeStr: string;
  numericFee: number;
}

export interface PaymentSelectionModalProps {
  visible: boolean;
  bookingDetails: BookingDetails | null;
  onClose: () => void;
  onConfirmBooking: (finalBooking: {
    bookingDetails: BookingDetails;
    paymentMode: 'online' | 'clinic';
    paymentMethodId: string;
  }) => void;
}

export const PaymentSelectionModal: React.FC<PaymentSelectionModalProps> = ({
  visible,
  bookingDetails,
  onClose,
  onConfirmBooking,
}) => {
  if (!bookingDetails) return null;

  const paymentStrings = Strings.booking.payment;
  const [paymentMode, setPaymentMode] = useState<'online' | 'clinic'>('online');
  const [selectedMethodId, setSelectedMethodId] = useState<string>('upi');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = () => {
    onConfirmBooking({
      bookingDetails,
      paymentMode,
      paymentMethodId: selectedMethodId,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdropTouch} activeOpacity={1} onPress={onClose} />

        <SafeAreaView style={styles.modalContentShell}>
          <View style={styles.header}>
            <View style={styles.dragPill} />
            <View style={styles.headerTopRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerTitle}>{paymentStrings.title}</Text>
                <Text style={styles.headerSubtitle} numberOfLines={1}>
                  {bookingDetails.doctor.name} • {bookingDetails.fullDate} at {bookingDetails.timeSlot}
                </Text>
              </View>

              <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                <Ionicons name="close" size={20} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* 1. PAYMENT MODE TOGGLE (Pay Online vs Pay at Clinic) */}
            <View style={styles.modeContainer}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setPaymentMode('online')}
                style={[styles.modeCard, paymentMode === 'online' && styles.modeCardSelected]}
              >
                <View style={styles.modeTopRow}>
                  <View style={styles.modeTitleGroup}>
                    <Ionicons
                      name="card-outline"
                      size={20}
                      color={paymentMode === 'online' ? Colors.primary : Colors.textPrimary}
                    />
                    <Text style={[styles.modeTitle, paymentMode === 'online' && styles.modeTitleSelected]}>
                      {paymentStrings.payOnlineTitle}
                    </Text>
                  </View>

                  <View style={styles.recTagPill}>
                    <Text style={styles.recTagText}>{paymentStrings.recommendedTag}</Text>
                  </View>
                </View>
                <Text style={styles.modeSub}>{paymentStrings.payOnlineSubtitle}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setPaymentMode('clinic')}
                style={[styles.modeCard, paymentMode === 'clinic' && styles.modeCardSelected]}
              >
                <View style={styles.modeTopRow}>
                  <View style={styles.modeTitleGroup}>
                    <Ionicons
                      name="business-outline"
                      size={20}
                      color={paymentMode === 'clinic' ? Colors.primary : Colors.textPrimary}
                    />
                    <Text style={[styles.modeTitle, paymentMode === 'clinic' && styles.modeTitleSelected]}>
                      {paymentStrings.payAtClinicTitle}
                    </Text>
                  </View>

                  <Ionicons
                    name={paymentMode === 'clinic' ? 'radio-button-on' : 'radio-button-off'}
                    size={18}
                    color={paymentMode === 'clinic' ? Colors.primary : Colors.textMuted}
                  />
                </View>
                <Text style={styles.modeSub}>{paymentStrings.payAtClinicSubtitle}</Text>
              </TouchableOpacity>
            </View>

            {/* 2. ONLINE PAYMENT METHODS (If Online Mode) */}
            {paymentMode === 'online' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Select Payment Method</Text>

                <View style={styles.methodsList}>
                  {paymentStrings.methods.map((method) => {
                    const isSelected = method.id === selectedMethodId;
                    return (
                      <TouchableOpacity
                        key={method.id}
                        activeOpacity={0.8}
                        onPress={() => setSelectedMethodId(method.id)}
                        style={[styles.methodItem, isSelected && styles.methodItemSelected]}
                      >
                        <View style={styles.methodLeft}>
                          <View style={[styles.methodIconBox, isSelected && styles.methodIconBoxSelected]}>
                            <Ionicons
                              name={method.icon as any}
                              size={18}
                              color={isSelected ? Colors.white : Colors.primary}
                            />
                          </View>

                          <View>
                            <Text style={[styles.methodName, isSelected && styles.methodNameSelected]}>
                              {method.name}
                            </Text>
                            <Text style={styles.methodSub}>{method.subtitle}</Text>
                          </View>
                        </View>

                        <Ionicons
                          name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                          size={20}
                          color={isSelected ? Colors.primary : Colors.inputBorder}
                        />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* 3. PAYMENT SUMMARY */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>{paymentStrings.summaryTitle}</Text>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{paymentStrings.consultationFee}</Text>
                <Text style={styles.summaryValue}>{bookingDetails.feeStr}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{paymentStrings.serviceTax}</Text>
                <Text style={styles.taxIncludedText}>{paymentStrings.taxIncluded}</Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryRowTotal}>
                <Text style={styles.totalLabel}>{paymentStrings.totalAmount}</Text>
                <Text style={styles.totalValue}>{bookingDetails.feeStr}</Text>
              </View>
            </View>

            {/* SECURITY DISCLAIMER & TERMS */}
            <View style={styles.disclaimerContainer}>
              <View style={styles.shieldRow}>
                <Ionicons name="shield-checkmark" size={16} color="#10B981" />
                <Text style={styles.disclaimerText}>{paymentStrings.disclaimer}</Text>
              </View>
              <Text style={styles.termsText}>{paymentStrings.termsText}</Text>
            </View>
          </ScrollView>

          {/* CONFIRM BUTTON */}
          <View style={styles.footerShell}>
            <TouchableOpacity
              activeOpacity={0.85}
              disabled={isProcessing}
              style={[styles.confirmBtn, isProcessing && styles.confirmBtnDisabled]}
              onPress={handleConfirm}
            >
              {isProcessing ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color={Colors.white} />
                  <Text style={styles.confirmBtnText}>{paymentStrings.confirmingTitle}</Text>
                </View>
              ) : (
                <>
                  <Ionicons name="lock-closed" size={16} color={Colors.white} />
                  <Text style={styles.confirmBtnText}>
                    {paymentMode === 'online'
                      ? `${paymentStrings.payOnlineBtn} (${bookingDetails.feeStr})`
                      : paymentStrings.payClinicBtn}
                  </Text>
                </>
              )}
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
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  backdropTouch: {
    flex: 1,
  },
  modalContentShell: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
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
    fontWeight: Typography.fontWeight.medium,
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
    gap: Spacing.lg,
  },
  modeContainer: {
    gap: 10,
  },
  modeCard: {
    padding: Spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.white,
  },
  modeCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#EFF6FF',
  },
  modeTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modeTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modeTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
  },
  modeTitleSelected: {
    color: Colors.primary,
  },
  recTagPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  recTagText: {
    fontSize: 9,
    fontWeight: Typography.fontWeight.bold,
    color: '#166534',
  },
  modeSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
    marginLeft: 28,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
  },
  methodsList: {
    gap: 8,
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    backgroundColor: Colors.white,
  },
  methodItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F8FAFC',
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  methodIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodIconBoxSelected: {
    backgroundColor: Colors.primary,
  },
  methodName: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
  },
  methodNameSelected: {
    color: Colors.primary,
  },
  methodSub: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  summaryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    gap: 8,
  },
  summaryTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.darkBlue,
  },
  taxIncludedText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: '#16A34A',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.inputBorder,
    marginVertical: 4,
  },
  summaryRowTotal: {
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
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  disclaimerContainer: {
    gap: 6,
    alignItems: 'center',
  },
  shieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  disclaimerText: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  termsText: {
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  footerShell: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    backgroundColor: Colors.white,
  },
  confirmBtn: {
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
  confirmBtnDisabled: {
    opacity: 0.8,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  confirmBtnText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
});
