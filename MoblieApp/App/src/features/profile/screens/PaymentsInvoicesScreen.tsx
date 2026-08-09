import React, { useState, useMemo } from 'react';
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
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';
import { Strings } from '@/constants';
import { BottomNavBar, TabKey } from '@/components';

export interface InvoiceItem {
  id: string;
  invoiceNo: string;
  title: string;
  doctor: string;
  amount: string;
  numericAmount: number;
  status: 'PAID' | 'PENDING' | 'REFUNDED';
  date: string;
  paymentMethod: string;
  paymentIcon: keyof typeof Ionicons.glyphMap;
  payNowBtnText?: string;
  statusNote?: string;
}

export const PaymentsInvoicesScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const pData = Strings.paymentsInvoicesDetails;

  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [invoicesList, setInvoicesList] = useState<InvoiceItem[]>(() =>
    pData.invoices.map((inv) => ({
      id: inv.id,
      invoiceNo: inv.invoiceNo,
      title: inv.title,
      doctor: inv.doctor,
      amount: inv.amount,
      numericAmount: inv.numericAmount,
      status: inv.status as 'PAID' | 'PENDING' | 'REFUNDED',
      date: inv.date,
      paymentMethod: inv.paymentMethod,
      paymentIcon: inv.paymentIcon as keyof typeof Ionicons.glyphMap,
      payNowBtnText: (inv as any).payNowBtnText,
      statusNote: (inv as any).statusNote,
    }))
  );
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);

  // Dynamic calculations for Total Paid & Outstanding
  const { totalPaidStr, outstandingStr, lastPaymentText } = useMemo(() => {
    let paidTotal = 0;
    let pendingTotal = 0;

    invoicesList.forEach((inv) => {
      if (inv.status === 'PAID') {
        paidTotal += inv.numericAmount;
      } else if (inv.status === 'PENDING') {
        pendingTotal += inv.numericAmount;
      }
    });

    const latestPaid = invoicesList.find((inv) => inv.status === 'PAID');

    const formattedPaid = `₹${paidTotal.toLocaleString('en-IN')}`;
    const formattedPending = `₹${pendingTotal.toLocaleString('en-IN')}`;
    const lastPayStr = latestPaid
      ? `${latestPaid.amount} on ${latestPaid.date.replace(', 2023', '')}`
      : pData.lastPaymentValue;

    return {
      totalPaidStr: formattedPaid,
      outstandingStr: formattedPending,
      lastPaymentText: lastPayStr,
    };
  }, [invoicesList]);

  // Filtered Invoices List
  const filteredInvoices = useMemo(() => {
    if (selectedFilter === 'All') return invoicesList;
    return invoicesList.filter(
      (inv) => inv.status.toUpperCase() === selectedFilter.toUpperCase()
    );
  }, [selectedFilter, invoicesList]);

  const handleShareScreen = async () => {
    try {
      await Share.share({
        message: `Payments & Invoices Summary\nTotal Paid: ${totalPaidStr}\nOutstanding: ${outstandingStr}`,
      });
    } catch (error) {
      console.log('Error sharing payments summary:', error);
    }
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

  const handleDownloadTaxSummary = () => {
    Alert.alert(
      'Download Tax Summary',
      'Generating and downloading your Annual Tax Summary PDF (FY 2023-24)...',
      [
        {
          text: 'OK',
          onPress: () => {
            Alert.alert('Download Complete', 'Tax Summary saved to your device.');
          },
        },
      ]
    );
  };

  const handleDownloadInvoice = (invoiceNo: string) => {
    router.push({
      pathname: '/invoice-details',
      params: {
        invoiceNo,
      },
    });
  };

  const handleOpenInvoiceDetails = (invoice: InvoiceItem) => {
    router.push({
      pathname: '/invoice-details',
      params: {
        invoiceNo: invoice.invoiceNo,
        issuedDate: invoice.date,
        paidDate: invoice.date,
        status: invoice.status,
        patientName: 'Sanya Malhotra',
        appointmentNo: '#APT-1024',
        therapistName: invoice.doctor,
        serviceName: invoice.title,
        consultationFee: invoice.amount,
        additionalCharges: '₹0.00',
        discount: '-₹150.00',
        gstAmount: '₹243.00',
        totalAmount: invoice.amount,
        paymentMethod: `UPI (${invoice.paymentMethod})`,
      },
    });
  };

  const handlePayNow = (invoice: InvoiceItem) => {
    Alert.alert(
      'Complete Payment',
      `Proceed to pay ${invoice.amount} for "${invoice.title}" with ${invoice.doctor}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pay Now',
          onPress: () => {
            // Update invoice state to PAID
            setInvoicesList((prev) =>
              prev.map((item) =>
                item.id === invoice.id
                  ? { ...item, status: 'PAID', payNowBtnText: undefined }
                  : item
              )
            );
            Alert.alert(
              'Payment Successful 🎉',
              `Payment of ${invoice.amount} for ${invoice.invoiceNo} has been processed successfully.`
            );
          },
        },
      ]
    );
  };

  const getStatusBadgeStyle = (status: 'PAID' | 'PENDING' | 'REFUNDED') => {
    switch (status) {
      case 'PAID':
        return {
          bg: '#DCFCE7',
          text: '#16A34A',
        };
      case 'PENDING':
        return {
          bg: '#FEF3C7',
          text: '#D97706',
        };
      case 'REFUNDED':
        return {
          bg: '#F1F5F9',
          text: '#64748B',
        };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.container}>
        {/* HEADER BAR */}
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

          <Text style={styles.headerTitle}>{pData.headerTitle}</Text>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.headerIconButton}
            onPress={handleShareScreen}
            accessibilityRole="button"
            accessibilityLabel="Share summary"
          >
            <Ionicons name="share-outline" size={22} color="#003D9B" />
          </TouchableOpacity>
        </View>

        {/* SCROLLABLE MAIN CONTENT */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 110 + Math.max(insets.bottom, 12) },
          ]}
        >
          {/* TOP SUMMARY CARD */}
          <View style={styles.summaryCard}>
            {/* ROW 1: TOTAL PAID & OUTSTANDING */}
            <View style={styles.summaryTopRow}>
              <View>
                <Text style={styles.summaryLabel}>{pData.totalPaidLabel}</Text>
                <Text style={styles.totalPaidValue}>{totalPaidStr}</Text>
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.summaryLabel}>{pData.outstandingLabel}</Text>
                <Text style={styles.outstandingValue}>{outstandingStr}</Text>
              </View>
            </View>

            {/* DIVIDER */}
            <View style={styles.cardDivider} />

            {/* ROW 2: LAST PAYMENT & DOWNLOAD TAX SUMMARY */}
            <View style={styles.summaryBottomRow}>
              <View style={styles.lastPaymentCol}>
                <Text style={styles.lastPaymentLabel}>{pData.lastPaymentLabel}</Text>
                <Text style={styles.lastPaymentText}>{lastPaymentText}</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.taxSummaryButton}
                onPress={handleDownloadTaxSummary}
              >
                <Ionicons
                  name="document-text-outline"
                  size={16}
                  color="#003D9B"
                  style={{ marginRight: 5 }}
                />
                <Text style={styles.taxSummaryText}>{pData.downloadTaxSummaryBtn}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* FILTER PILLS HORIZONTAL SCROLL */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollContainer}
          >
            {pData.filterCategories.map((category) => {
              const isSelected = selectedFilter === category;
              return (
                <TouchableOpacity
                  key={category}
                  activeOpacity={0.8}
                  style={[
                    styles.filterChip,
                    isSelected ? styles.filterChipActive : styles.filterChipInactive,
                  ]}
                  onPress={() => setSelectedFilter(category)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      isSelected ? styles.filterTextActive : styles.filterTextInactive,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* INVOICES LIST */}
          <View style={styles.invoicesListContainer}>
            {filteredInvoices.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="receipt-outline" size={48} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>No Invoices Found</Text>
                <Text style={styles.emptySubtitle}>
                  No invoices match your selected filter ({selectedFilter}).
                </Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.resetFilterButton}
                  onPress={() => setSelectedFilter('All')}
                >
                  <Text style={styles.resetFilterText}>Show All Invoices</Text>
                </TouchableOpacity>
              </View>
            ) : (
              filteredInvoices.map((invoice) => {
                const statusStyle = getStatusBadgeStyle(invoice.status);
                const isRefunded = invoice.status === 'REFUNDED';
                const isPending = invoice.status === 'PENDING';

                return (
                  <TouchableOpacity
                    key={invoice.id}
                    activeOpacity={0.85}
                    style={styles.invoiceCard}
                    onPress={() => handleOpenInvoiceDetails(invoice)}
                  >
                    {/* TOP ROW: INVOICE NO & STATUS BADGE */}
                    <View style={styles.invoiceTopRow}>
                      <Text style={styles.invoiceNoText}>{invoice.invoiceNo}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                        <Text style={[styles.statusBadgeText, { color: statusStyle.text }]}>
                          {invoice.status}
                        </Text>
                      </View>
                    </View>

                    {/* MIDDLE ROW: TITLE, AMOUNT & DOCTOR */}
                    <View style={styles.invoiceMiddleRow}>
                      <View style={{ flex: 1, paddingRight: 10 }}>
                        <Text
                          style={[
                            styles.invoiceTitle,
                            isRefunded && styles.refundedTitleText,
                          ]}
                        >
                          {invoice.title}
                        </Text>
                        <Text
                          style={[
                            styles.doctorName,
                            isRefunded && styles.refundedSubtext,
                          ]}
                        >
                          {invoice.doctor}
                        </Text>
                      </View>

                      <Text
                        style={[
                          styles.invoiceAmount,
                          isRefunded && styles.refundedAmountText,
                        ]}
                      >
                        {invoice.amount}
                      </Text>
                    </View>

                    {/* FOOTER ROW: DATE, PAYMENT METHOD & ACTIONS */}
                    <View style={styles.invoiceFooterRow}>
                      <View style={styles.footerLeftGroup}>
                        <View style={styles.metaSubItem}>
                          <Ionicons
                            name="calendar-outline"
                            size={14}
                            color="#64748B"
                            style={{ marginRight: 4 }}
                          />
                          <Text style={styles.metaDateText}>{invoice.date}</Text>
                        </View>

                        {!isRefunded && (
                          <View style={styles.metaSubItem}>
                            <Ionicons
                              name={invoice.paymentIcon}
                              size={14}
                              color="#64748B"
                              style={{ marginRight: 4 }}
                            />
                            <Text style={styles.metaPaymentText}>
                              {invoice.paymentMethod}
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* RIGHT ACTION BUTTONS */}
                      <View style={styles.footerRightGroup}>
                        {isPending ? (
                          <TouchableOpacity
                            activeOpacity={0.85}
                            style={styles.payNowButton}
                            onPress={() => handlePayNow(invoice)}
                          >
                            <Text style={styles.payNowText}>
                              {invoice.payNowBtnText || 'Pay Now'}
                            </Text>
                          </TouchableOpacity>
                        ) : isRefunded ? (
                          <Text style={styles.statusNoteText}>
                            {invoice.statusNote || 'Refund processed'}
                          </Text>
                        ) : (
                          <View style={styles.iconActionsGroup}>
                            <TouchableOpacity
                              activeOpacity={0.7}
                              style={styles.actionIconButton}
                              onPress={() => handleOpenInvoiceDetails(invoice)}
                              accessibilityRole="button"
                              accessibilityLabel="View receipt details"
                            >
                              <Ionicons name="newspaper-outline" size={18} color="#003D9B" />
                            </TouchableOpacity>

                            <TouchableOpacity
                              activeOpacity={0.7}
                              style={styles.actionIconButton}
                              onPress={() => handleOpenInvoiceDetails(invoice)}
                              accessibilityRole="button"
                              accessibilityLabel="Download invoice PDF"
                            >
                              <Ionicons name="download-outline" size={18} color="#003D9B" />
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })

            )}
          </View>
        </ScrollView>

        {/* BOTTOM NAVIGATION BAR */}
        <BottomNavBar activeTab="profile" onTabPress={handleTabPress} />
      </View>

      {/* INVOICE DETAILS MODAL */}
      {selectedInvoice && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={!!selectedInvoice}
          onRequestClose={() => setSelectedInvoice(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              {/* MODAL HEADER */}
              <View style={styles.modalHeader}>
                <View style={styles.modalIconCircle}>
                  <Ionicons name="receipt-outline" size={24} color="#003D9B" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalInvoiceNo}>{selectedInvoice.invoiceNo}</Text>
                  <Text style={styles.modalTitle}>{selectedInvoice.title}</Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.modalCloseButton}
                  onPress={() => setSelectedInvoice(null)}
                >
                  <Ionicons name="close" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* MODAL BODY */}
              <View style={styles.modalBody}>
                <View style={styles.modalMetaRow}>
                  <Text style={styles.modalMetaLabel}>Attending Specialist:</Text>
                  <Text style={styles.modalMetaValue}>{selectedInvoice.doctor}</Text>
                </View>

                <View style={styles.modalMetaRow}>
                  <Text style={styles.modalMetaLabel}>Transaction Date:</Text>
                  <Text style={styles.modalMetaValue}>{selectedInvoice.date}</Text>
                </View>

                <View style={styles.modalMetaRow}>
                  <Text style={styles.modalMetaLabel}>Payment Method:</Text>
                  <Text style={styles.modalMetaValue}>{selectedInvoice.paymentMethod}</Text>
                </View>

                <View style={styles.modalMetaRow}>
                  <Text style={styles.modalMetaLabel}>Payment Status:</Text>
                  <Text style={[styles.modalMetaValue, { color: '#16A34A', fontWeight: 'bold' }]}>
                    {selectedInvoice.status}
                  </Text>
                </View>

                {/* BREAKDOWN */}
                <View style={styles.modalBreakdownCard}>
                  <Text style={styles.breakdownTitle}>COST BREAKDOWN</Text>
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Consultation & Session Fee</Text>
                    <Text style={styles.breakdownValue}>{selectedInvoice.amount}</Text>
                  </View>
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Platform GST & Service Tax</Text>
                    <Text style={styles.breakdownValue}>Included</Text>
                  </View>
                  <View style={styles.breakdownTotalRow}>
                    <Text style={styles.breakdownTotalLabel}>Total Paid</Text>
                    <Text style={styles.breakdownTotalValue}>{selectedInvoice.amount}</Text>
                  </View>
                </View>
              </View>

              {/* MODAL FOOTER */}
              <View style={styles.modalFooterActions}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.modalPrimaryButton}
                  onPress={() => {
                    handleDownloadInvoice(selectedInvoice.invoiceNo);
                    setSelectedInvoice(null);
                  }}
                >
                  <Ionicons name="download-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.modalPrimaryText}>Download Statement</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.modalSecondaryButton}
                  onPress={() => {
                    Share.share({
                      message: `Invoice ${selectedInvoice.invoiceNo}: ${selectedInvoice.title} (${selectedInvoice.amount}) paid on ${selectedInvoice.date}`,
                    });
                  }}
                >
                  <Ionicons name="share-outline" size={18} color="#003D9B" style={{ marginRight: 6 }} />
                  <Text style={styles.modalSecondaryText}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
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

  /* SUMMARY CARD */
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    color: '#64748B',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  totalPaidValue: {
    fontSize: 30,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },
  outstandingValue: {
    fontSize: 22,
    fontWeight: Typography.fontWeight.bold,
    color: '#EF4444',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  summaryBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastPaymentCol: {
    flex: 1,
  },
  lastPaymentLabel: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.medium,
    color: '#64748B',
    marginBottom: 2,
  },
  lastPaymentText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
  },
  taxSummaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  taxSummaryText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },

  /* FILTER PILLS */
  filterScrollContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: Spacing.xl,
  },
  filterChip: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 9999,
  },
  filterChipActive: {
    backgroundColor: '#003D9B',
  },
  filterChipInactive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  filterTextInactive: {
    color: '#475569',
  },

  /* INVOICES LIST */
  invoicesListContainer: {
    gap: 14,
  },
  invoiceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: Spacing.md + 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  invoiceTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  invoiceNoText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold,
    color: '#64748B',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.6,
  },
  invoiceMiddleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  invoiceTitle: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
    marginBottom: 2,
  },
  refundedTitleText: {
    color: '#64748B',
  },
  doctorName: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: '#64748B',
  },
  refundedSubtext: {
    color: '#94A3B8',
  },
  invoiceAmount: {
    fontSize: 17,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },
  refundedAmountText: {
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  invoiceFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  footerLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaSubItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaDateText: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.medium,
    color: '#64748B',
  },
  metaPaymentText: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: '#64748B',
  },
  footerRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  payNowButton: {
    backgroundColor: '#003D9B',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 9999,
  },
  payNowText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  statusNoteText: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.medium,
    color: '#64748B',
    fontStyle: 'italic',
  },
  iconActionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionIconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* EMPTY STATE */
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.xs,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  resetFilterButton: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 9999,
  },
  resetFilterText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },

  /* MODAL STYLES */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalInvoiceNo: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: '#64748B',
    textTransform: 'uppercase',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    marginBottom: Spacing.lg,
  },
  modalMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  modalMetaLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: '#64748B',
  },
  modalMetaValue: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
  },
  modalBreakdownCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: Spacing.md,
    marginTop: 14,
  },
  breakdownTitle: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  breakdownValue: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.semiBold,
    color: '#0F172A',
  },
  breakdownTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  breakdownTotalLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
  },
  breakdownTotalValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },
  modalFooterActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalPrimaryButton: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#003D9B',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalPrimaryText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  modalSecondaryButton: {
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 22,
    backgroundColor: '#EEF2FF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSecondaryText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },
});

export default PaymentsInvoicesScreen;
