import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';
import { Strings } from '@/constants';
import {
  BookingItem,
  BookingStatusConfig,
  DoctorAvatarMap,
} from '@/constants';

interface BookingDetailsModalProps {
  visible: boolean;
  booking: BookingItem | null;
  onClose: () => void;
  onReschedule?: (booking: BookingItem) => void;
  onCancel?: (booking: BookingItem) => void;
  onBookAgain?: (booking: BookingItem) => void;
}

export const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  visible,
  booking,
  onClose,
  onReschedule,
  onCancel,
  onBookAgain,
}) => {
  const router = useRouter();

  if (!booking) return null;

  const statusCfg = BookingStatusConfig[booking.status];
  const avatarSource = DoctorAvatarMap[booking.avatarImageName] || DoctorAvatarMap.doctor_ananya;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `My booking ref #${booking.id} with ${booking.doctorName} for ${booking.serviceTitle} on ${booking.fullDate} at ${booking.timeSlot}.`,
      });
    } catch (e) {
      console.log('Error sharing:', e);
    }
  };

  const handleGetDirections = () => {
    Alert.alert('Directions 🗺️', `Navigating to ${booking.placeTitle} (${booking.location}).`);
  };

  const handleDownloadInvoice = () => {
    onClose();
    router.push({
      pathname: '/invoice-details',
      params: {
        invoiceNo: `#INV-${booking.id.replace(/\D/g, '') || '9902'}`,
        issuedDate: booking.fullDate,
        paidDate: booking.fullDate,
        status: booking.paymentStatus.includes('Paid') ? 'PAID' : 'PENDING',
        patientName: 'Sanya Malhotra',
        appointmentNo: `#APT-${booking.id}`,
        therapistName: booking.doctorName,
        serviceName: booking.serviceTitle,
        consultationFee: booking.feeStr,
        totalAmount: booking.feeStr,
        paymentMethod: booking.paymentMethodName,
      },
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
        <View style={styles.sheetContainer}>
          {/* Top Grab Bar & Header */}
          <View style={styles.headerBar}>
            <View style={styles.grabHandle} />
            <View style={styles.headerTitleRow}>
              <Text style={styles.headerTitle}>
                {Strings.myBookings.detailsModal.title}
              </Text>

              <View style={styles.headerIcons}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleShare}
                  style={styles.iconCircle}
                  accessibilityLabel="Share appointment"
                >
                  <Ionicons name="share-outline" size={18} color={Colors.darkBlue} />
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onClose}
                  style={styles.iconCircle}
                  accessibilityLabel="Close details"
                >
                  <Ionicons name="close" size={20} color={Colors.darkBlue} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Scrollable Booking Details Body */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
          >
            {/* Ref & Status Banner Card */}
            <View style={styles.refCard}>
              <View style={styles.refLeftGroup}>
                <Text style={styles.refLabel}>{Strings.myBookings.detailsModal.refLabel}</Text>
                <Text style={styles.refValue}>#{booking.id}</Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: statusCfg.badgeBg,
                    borderColor: statusCfg.borderColor,
                  },
                ]}
              >
                <Ionicons
                  name={statusCfg.iconName}
                  size={14}
                  color={statusCfg.badgeText}
                />
                <Text style={[styles.statusText, { color: statusCfg.badgeText }]}>
                  {statusCfg.label}
                </Text>
              </View>
            </View>

            {/* Doctor Profile Card */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionHeading}>
                {Strings.myBookings.detailsModal.therapistSectionTitle}
              </Text>
              <View style={styles.doctorCard}>
                <View style={[styles.doctorAvatarBox, { backgroundColor: booking.avatarBg }]}>
                  <Image
                    source={avatarSource}
                    style={styles.doctorImg}
                    resizeMode="cover"
                  />
                </View>
                <View style={styles.doctorInfo}>
                  <Text style={styles.doctorName}>{booking.doctorName}</Text>
                  <Text style={styles.doctorSpecialty}>{booking.doctorSpecialty}</Text>
                  {booking.rating && (
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={13} color="#F59E0B" />
                      <Text style={styles.ratingVal}>{booking.rating.toFixed(1)} Rating</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Date & Time Grid */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionHeading}>DATE & TIME</Text>
              <View style={styles.dateTimeGrid}>
                <View style={styles.gridCell}>
                  <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
                  <View>
                    <Text style={styles.gridCellSub}>Scheduled Date</Text>
                    <Text style={styles.gridCellMain}>{booking.fullDate}</Text>
                  </View>
                </View>

                <View style={styles.gridCell}>
                  <Ionicons name="time-outline" size={18} color={Colors.primary} />
                  <View>
                    <Text style={styles.gridCellSub}>Time Slot</Text>
                    <Text style={styles.gridCellMain}>{booking.timeSlot}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Service & Location */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionHeading}>
                {Strings.myBookings.detailsModal.serviceSectionTitle}
              </Text>
              <View style={styles.detailsCard}>
                <View style={styles.detailItemRow}>
                  <Ionicons name="fitness-outline" size={18} color="#0284C7" />
                  <View style={styles.detailTextGroup}>
                    <Text style={styles.detailLabel}>Service</Text>
                    <Text style={styles.detailValue}>{booking.serviceTitle}</Text>
                  </View>
                </View>

                <View style={styles.detailItemDivider} />

                <View style={styles.detailItemRow}>
                  <Ionicons
                    name={booking.placeType === 'home' ? 'home-outline' : 'business-outline'}
                    size={18}
                    color="#0284C7"
                  />
                  <View style={styles.detailTextGroup}>
                    <Text style={styles.detailLabel}>{booking.placeTitle}</Text>
                    <Text style={styles.detailValue}>{booking.location}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Payment Summary */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionHeading}>
                {Strings.myBookings.detailsModal.paymentSectionTitle}
              </Text>
              <View style={styles.paymentCard}>
                <View style={styles.payRow}>
                  <Text style={styles.payLabel}>Consultation Fee</Text>
                  <Text style={styles.payVal}>{booking.feeStr}</Text>
                </View>
                <View style={styles.payRow}>
                  <Text style={styles.payLabel}>Payment Method</Text>
                  <Text style={styles.payVal}>{booking.paymentMethodName}</Text>
                </View>
                <View style={styles.payRow}>
                  <Text style={styles.payLabel}>Payment Status</Text>
                  <Text
                    style={[
                      styles.payVal,
                      {
                        color:
                          booking.paymentStatus === 'Paid Online'
                            ? '#10B981'
                            : booking.paymentStatus === 'Refunded'
                            ? '#64748B'
                            : '#F59E0B',
                        fontWeight: 'bold',
                      },
                    ]}
                  >
                    {booking.paymentStatus}
                  </Text>
                </View>
                <View style={styles.payRow}>
                  <Text style={styles.payLabel}>Transaction Ref</Text>
                  <Text style={styles.payValCode}>{booking.transactionId}</Text>
                </View>
              </View>
            </View>

            {/* Important Instructions (if present) */}
            {booking.instructions && booking.instructions.length > 0 && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionHeading}>
                  {Strings.myBookings.detailsModal.instructionsSectionTitle}
                </Text>
                <View style={styles.instructionsBox}>
                  {booking.instructions.map((instr, idx) => (
                    <View key={idx} style={styles.instrRow}>
                      <Text style={styles.instrBullet}>•</Text>
                      <Text style={styles.instrText}>{instr}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={{ height: 10 }} />
          </ScrollView>

          {/* Dynamic Footer Actions based on Booking Status */}
          <View style={styles.footerShell}>
            {booking.status === 'Upcoming' && (
              <View style={styles.actionColumn}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.primaryBtn}
                  onPress={handleGetDirections}
                >
                  <Ionicons name="navigate-outline" size={18} color={Colors.white} />
                  <Text style={styles.primaryBtnText}>
                    {Strings.myBookings.detailsModal.getDirectionsBtn}
                  </Text>
                </TouchableOpacity>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.outlineBtn}
                    onPress={() => onReschedule && onReschedule(booking)}
                  >
                    <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
                    <Text style={styles.outlineBtnText}>
                      {Strings.myBookings.detailsModal.rescheduleBtn}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.dangerOutlineBtn}
                    onPress={() => onCancel && onCancel(booking)}
                  >
                    <Ionicons name="close-circle-outline" size={16} color="#DC2626" />
                    <Text style={styles.dangerOutlineBtnText}>
                      {Strings.myBookings.detailsModal.cancelBtn}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {booking.status === 'Completed' && (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.outlineBtn}
                  onPress={handleDownloadInvoice}
                >
                  <Ionicons name="download-outline" size={16} color={Colors.primary} />
                  <Text style={styles.outlineBtnText}>
                    {Strings.myBookings.detailsModal.downloadInvoiceBtn}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[styles.primaryBtn, { flex: 1 }]}
                  onPress={() => onBookAgain && onBookAgain(booking)}
                >
                  <Ionicons name="refresh-outline" size={18} color={Colors.white} />
                  <Text style={styles.primaryBtnText}>
                    {Strings.myBookings.detailsModal.bookAgainBtn}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {booking.status === 'Cancelled' && (
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.primaryBtn}
                onPress={() => onBookAgain && onBookAgain(booking)}
              >
                <Ionicons name="refresh-outline" size={18} color={Colors.white} />
                <Text style={styles.primaryBtnText}>Rebook Appointment</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
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
  sheetContainer: {
    backgroundColor: '#FAFAFC',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    minHeight: '60%',
  },
  headerBar: {
    paddingTop: 10,
    paddingHorizontal: Spacing.xl,
    paddingBottom: 14,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    alignItems: 'center',
  },
  grabHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    marginBottom: 12,
  },
  headerTitleRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  scrollBody: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    gap: Spacing.lg,
  },
  refCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  refLeftGroup: {
    gap: 2,
  },
  refLabel: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  refValue: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    borderWidth: 1,
    gap: 5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold,
  },
  sectionContainer: {
    gap: 8,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textSecondary,
    letterSpacing: 0.8,
  },
  doctorCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  doctorAvatarBox: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  doctorImg: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  doctorInfo: {
    flex: 1,
    gap: 2,
  },
  doctorName: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
  },
  doctorSpecialty: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ratingVal: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
  },
  dateTimeGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  gridCell: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  gridCellSub: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  gridCellMain: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
    marginTop: 1,
  },
  detailsCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    gap: 10,
  },
  detailItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  detailItemDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  detailTextGroup: {
    flex: 1,
    gap: 2,
  },
  detailLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
  },
  paymentCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    gap: 8,
  },
  payRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  payLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  payVal: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
  },
  payValCode: {
    fontSize: 11,
    fontFamily: undefined,
    color: Colors.textMuted,
  },
  instructionsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    gap: 6,
  },
  instrRow: {
    flexDirection: 'row',
    gap: 6,
  },
  instrBullet: {
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
    paddingTop: 12,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionColumn: {
    gap: 10,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryBtn: {
    height: 48,
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
  primaryBtnText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
  outlineBtn: {
    flex: 1,
    height: 44,
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
  dangerOutlineBtn: {
    flex: 1,
    height: 44,
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dangerOutlineBtnText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold,
    color: '#DC2626',
  },
});

export default BookingDetailsModal;
