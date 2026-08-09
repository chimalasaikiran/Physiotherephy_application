import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Share,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';
import { Strings } from '@/constants';
import { BottomNavBar, TabKey } from '@/components';

export interface InvoiceDetailsProps {
  invoiceNo?: string;
  issuedDate?: string;
  paidDate?: string;
  status?: string;
  clinicName?: string;
  clinicSubtitle?: string;
  clinicAddress?: string;
  gstNo?: string;
  patientName?: string;
  appointmentNo?: string;
  therapistName?: string;
  serviceName?: string;
  consultationFee?: string;
  additionalCharges?: string;
  discount?: string;
  gstAmount?: string;
  totalAmount?: string;
  paymentMethod?: string;
}

export const InvoiceDetailsScreen: React.FC<InvoiceDetailsProps> = (props) => {
  const router = useRouter();
  const params = useLocalSearchParams<{
    invoiceNo?: string;
    issuedDate?: string;
    paidDate?: string;
    status?: string;
    clinicName?: string;
    clinicSubtitle?: string;
    clinicAddress?: string;
    gstNo?: string;
    patientName?: string;
    appointmentNo?: string;
    therapistName?: string;
    serviceName?: string;
    consultationFee?: string;
    additionalCharges?: string;
    discount?: string;
    gstAmount?: string;
    totalAmount?: string;
    paymentMethod?: string;
  }>();

  const insets = useSafeAreaInsets();
  const d = Strings.invoiceDetailsScreen;

  // Merge route params or direct props with default Figma data
  const invoiceNo = props.invoiceNo || params.invoiceNo || d.defaultInvoiceNo;
  const issuedDate = props.issuedDate || params.issuedDate || d.defaultIssuedDate;
  const paidDate = props.paidDate || params.paidDate || d.defaultPaidDate;
  const status = (props.status || params.status || d.paidBadge).toUpperCase();
  const clinicName = props.clinicName || params.clinicName || d.clinicName;
  const clinicSubtitle = props.clinicSubtitle || params.clinicSubtitle || d.clinicSubtitle;
  const clinicAddress = props.clinicAddress || params.clinicAddress || d.defaultClinicAddress;
  const gstNo = props.gstNo || params.gstNo || d.defaultGstNo;
  const patientName = props.patientName || params.patientName || d.defaultPatientName;
  const appointmentNo = props.appointmentNo || params.appointmentNo || d.defaultAppointmentNo;
  const therapistName = props.therapistName || params.therapistName || d.defaultTherapistName;
  const serviceName = props.serviceName || params.serviceName || d.defaultServiceName;
  const consultationFee = props.consultationFee || params.consultationFee || d.defaultConsultationFee;
  const additionalCharges = props.additionalCharges || params.additionalCharges || d.defaultAdditionalCharges;
  const discount = props.discount || params.discount || d.defaultDiscount;
  const gstAmount = props.gstAmount || params.gstAmount || d.defaultGst;
  const totalAmount = props.totalAmount || params.totalAmount || d.defaultTotalAmountPaid;
  const paymentMethod = props.paymentMethod || params.paymentMethod || d.defaultPaymentMethod;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Invoice ${invoiceNo} Details\nAmount Paid: ${totalAmount}\nService: ${serviceName}\nTherapist: ${therapistName}\nPaid On: ${paidDate}`,
      });
    } catch (error) {
      console.log('Error sharing invoice:', error);
    }
  };

  const handleEmail = () => {
    Alert.alert(
      'Email Statement',
      `Sending PDF invoice statement for ${invoiceNo} to your registered email address...`,
      [{ text: 'OK' }]
    );
  };

  const handleDownloadPdf = () => {
    Alert.alert(
      'Download PDF',
      `Statement for ${invoiceNo} has been saved to your downloads.`,
      [{ text: 'OK' }]
    );
  };

  const handleTabPress = (tab: TabKey) => {
    if (tab === 'home') {
      router.push('/explore' as any);
    } else if (tab === 'bookings') {
      router.push('/my-bookings' as any);
    } else if (tab === 'recovery') {
      router.push('/recovery' as any);
    } else if (tab === 'alerts') {
      router.push('/notifications' as any);
    } else if (tab === 'profile') {
      router.push('/profile' as any);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.container}>
        {/* TOP HEADER BAR */}
        <View
          style={[
            styles.header,
            {
              paddingTop:
                Math.max(
                  insets.top,
                  Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 16
                ) + 8,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.headerIconButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color="#003D9B" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>{d.headerTitle}</Text>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.headerIconButton}
            onPress={handleShare}
            accessibilityRole="button"
            accessibilityLabel="Share invoice"
          >
            <Ionicons name="share-outline" size={22} color="#003D9B" />
          </TouchableOpacity>
        </View>

        {/* SCROLLABLE CONTENT */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 110 + Math.max(insets.bottom, 12) },
          ]}
        >
          {/* CARD 1: INVOICE STATUS CARD */}
          <View style={styles.statusCard}>
            <View style={styles.outerCircleIcon}>
              <View style={styles.innerCircleIcon}>
                <Ionicons name="checkmark" size={20} color="#FFFFFF" />
              </View>
            </View>

            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>{status}</Text>
            </View>

            <Text style={styles.invoiceNoText}>{invoiceNo}</Text>
            <Text style={styles.dateMetaText}>
              {d.issuedDatePrefix}
              {issuedDate}
            </Text>
            <Text style={styles.dateMetaText}>
              {d.paidDatePrefix}
              {paidDate}
            </Text>
          </View>

          {/* CARD 2: CLINIC DETAILS CARD */}
          <View style={styles.card}>
            <View style={styles.clinicHeaderRow}>
              <View style={styles.clinicIconBox}>
                <Ionicons name="add" size={26} color="#FFFFFF" />
              </View>
              <View style={styles.clinicTitleGroup}>
                <Text style={styles.clinicNameText}>{clinicName}</Text>
                <Text style={styles.clinicSubtitleText}>{clinicSubtitle}</Text>
              </View>
            </View>

            <View style={styles.clinicInfoRow}>
              <Ionicons
                name="location-outline"
                size={16}
                color="#64748B"
                style={styles.infoIcon}
              />
              <Text style={styles.clinicInfoText}>{clinicAddress}</Text>
            </View>

            <View style={[styles.clinicInfoRow, { marginTop: 8 }]}>
              <Ionicons
                name="card-outline"
                size={16}
                color="#64748B"
                style={styles.infoIcon}
              />
              <Text style={styles.clinicInfoText}>GST: {gstNo}</Text>
            </View>
          </View>

          {/* CARD 3: SERVICE DETAILS CARD */}
          <View style={styles.card}>
            <Text style={styles.sectionHeaderTitle}>{d.serviceDetailsTitle}</Text>

            <View style={styles.gridRow}>
              {/* Patient */}
              <View style={styles.gridColumn}>
                <Text style={styles.fieldLabel}>{d.patientLabel}</Text>
                <Text style={styles.fieldValue}>{patientName}</Text>
              </View>

              {/* Appointment */}
              <View style={styles.gridColumn}>
                <Text style={styles.fieldLabel}>{d.appointmentLabel}</Text>
                <Text style={styles.fieldValue}>{appointmentNo}</Text>
              </View>
            </View>

            <View style={[styles.gridRow, { marginTop: 18 }]}>
              {/* Therapist */}
              <View style={styles.gridColumn}>
                <Text style={styles.fieldLabel}>{d.therapistLabel}</Text>
                <Text style={styles.fieldValue}>{therapistName}</Text>
              </View>

              {/* Service */}
              <View style={styles.gridColumn}>
                <Text style={styles.fieldLabel}>{d.serviceLabel}</Text>
                <Text style={styles.fieldValue}>{serviceName}</Text>
              </View>
            </View>
          </View>

          {/* CARD 4: FINANCIAL BREAKDOWN CARD */}
          <View style={styles.card}>
            <Text style={styles.sectionHeaderTitle}>{d.financialBreakdownTitle}</Text>

            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>{d.consultationFeeLabel}</Text>
              <Text style={styles.breakdownValue}>{consultationFee}</Text>
            </View>

            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>{d.additionalChargesLabel}</Text>
              <Text style={styles.breakdownValue}>{additionalCharges}</Text>
            </View>

            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>{d.discountLabel}</Text>
              <Text style={[styles.breakdownValue, styles.discountValue]}>
                {discount}
              </Text>
            </View>

            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>{d.gstLabel}</Text>
              <Text style={styles.breakdownValue}>{gstAmount}</Text>
            </View>

            {/* DIVIDER LINE */}
            <View style={styles.cardDivider} />

            {/* TOTAL PAID & PAYMENT METHOD */}
            <View style={styles.totalRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.totalLabel}>{d.totalAmountPaidLabel}</Text>
                <Text style={styles.totalValue}>{totalAmount}</Text>
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.paymentMethodLabel}>{d.paymentMethodLabel}</Text>
                <View style={styles.paymentMethodValueGroup}>
                  <Ionicons
                    name="card-outline"
                    size={15}
                    color="#0F172A"
                    style={{ marginRight: 5 }}
                  />
                  <Text style={styles.paymentMethodText}>{paymentMethod}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* CARD 5: ACTION BUTTONS */}
          <View style={styles.actionsContainer}>
            {/* DOWNLOAD PDF BUTTON */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.downloadButton}
              onPress={handleDownloadPdf}
            >
              <Ionicons
                name="download-outline"
                size={19}
                color="#FFFFFF"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.downloadButtonText}>{d.downloadPdfBtn}</Text>
            </TouchableOpacity>

            {/* SHARE & EMAIL SECONDARY BUTTONS */}
            <View style={styles.secondaryButtonsRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.secondaryPillButton}
                onPress={handleShare}
              >
                <Ionicons
                  name="share-outline"
                  size={18}
                  color="#003D9B"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.secondaryPillText}>{d.shareBtn}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.secondaryPillButton}
                onPress={handleEmail}
              >
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color="#003D9B"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.secondaryPillText}>{d.emailBtn}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* BOTTOM NAVIGATION BAR */}
        <BottomNavBar activeTab="profile" onTabPress={handleTabPress} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FAFBFD',
  },

  /* HEADER */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },

  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },

  /* CARD COMMON */
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: Spacing.md + 4,
    marginBottom: Spacing.md + 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },

  /* CARD 1: STATUS CARD */
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.md + 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  outerCircleIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  innerCircleIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0284C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 9999,
    marginBottom: 10,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: '#0D9488',
    letterSpacing: 0.8,
  },
  invoiceNoText: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
    marginBottom: 6,
  },
  dateMetaText: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.medium,
    color: '#64748B',
    marginBottom: 2,
  },

  /* CARD 2: CLINIC DETAILS */
  clinicHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  clinicIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#003D9B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  clinicTitleGroup: {
    justifyContent: 'center',
  },
  clinicNameText: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },
  clinicSubtitleText: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    color: '#64748B',
    letterSpacing: 0.6,
    marginTop: 1,
  },
  clinicInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  clinicInfoText: {
    fontSize: 13,
    color: '#475569',
    flex: 1,
    lineHeight: 19,
  },

  /* CARD 3: SERVICE DETAILS */
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: '#64748B',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridColumn: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: Typography.fontWeight.medium,
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
  },

  /* CARD 4: FINANCIAL BREAKDOWN */
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#475569',
    fontWeight: Typography.fontWeight.medium,
  },
  breakdownValue: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: Typography.fontWeight.bold,
  },
  discountValue: {
    color: '#EF4444',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: Typography.fontWeight.medium,
    marginBottom: 2,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },
  paymentMethodLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: Typography.fontWeight.medium,
    marginBottom: 4,
  },
  paymentMethodValueGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodText: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
  },

  /* ACTIONS */
  actionsContainer: {
    gap: 12,
    marginTop: 4,
  },
  downloadButton: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#003D9B',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  downloadButtonText: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  secondaryButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryPillButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  secondaryPillText: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },
});
