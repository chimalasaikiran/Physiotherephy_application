import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
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

interface ReportItem {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  category: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  fileSize?: string;
}

export const MedicalReportsScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const r = Strings.medicalReportsDetails;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeReportModal, setActiveReportModal] = useState<ReportItem | null>(null);

  const categories = r.categories;

  const latestReportItem: ReportItem = {
    id: r.latestReport.id,
    title: r.latestReport.title.replace('\n', ' '),
    subtitle: r.latestReport.doctor,
    date: r.latestReport.date,
    category: r.latestReport.category,
    iconName: 'document-text',
    iconBg: '#003D9B',
    iconColor: '#FFFFFF',
    fileSize: r.latestReport.fileSize,
  };

  const previousReportsList: ReportItem[] = r.previousReports.map((item) => ({
    id: item.id,
    title: item.title.replace('\n', ' '),
    subtitle: item.subtitle,
    date: item.date,
    category: item.category,
    iconName: item.iconName as any,
    iconBg: item.iconBg,
    iconColor: item.iconColor,
  }));

  // Filter latest report based on search & category
  const matchesFilter = (item: ReportItem) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat =
      selectedCategory === 'All' ||
      item.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCat;
  };

  const showLatestReport = matchesFilter(latestReportItem);
  const filteredPreviousReports = useMemo(() => {
    return previousReportsList.filter(matchesFilter);
  }, [searchQuery, selectedCategory]);

  const handleShareScreen = async () => {
    try {
      await Share.share({
        message: 'My Medical Reports Summary from ONE MEDICAL App',
      });
    } catch (error) {
      console.log('Error sharing reports:', error);
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

  const handleViewReport = (report: ReportItem) => {
    setActiveReportModal(report);
  };

  const handleDownloadReport = (reportTitle: string) => {
    Alert.alert(
      'Downloading Report',
      `"${reportTitle}" is being downloaded to your device files.`,
      [{ text: 'OK' }]
    );
  };

  const handleKebabMenu = (report: ReportItem) => {
    Alert.alert(report.title, 'Choose an action for this report:', [
      { text: 'View Report', onPress: () => handleViewReport(report) },
      { text: 'Download PDF', onPress: () => handleDownloadReport(report.title) },
      {
        text: 'Share Report',
        onPress: () =>
          Share.share({
            message: `Medical Report: ${report.title} (${report.subtitle}, ${report.date})`,
          }),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
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
              paddingTop: Math.max(
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

          <Text style={styles.headerTitle}>{r.headerTitle}</Text>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.headerIconButton}
            onPress={handleShareScreen}
            accessibilityRole="button"
            accessibilityLabel="Share reports"
          >
            <Ionicons name="share-outline" size={22} color="#003D9B" />
          </TouchableOpacity>
        </View>

        {/* SCROLLABLE CONTENT AREA */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 110 + Math.max(insets.bottom, 12) },
          ]}
        >
          {/* SEARCH BAR */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={r.searchPlaceholder}
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity activeOpacity={0.7} onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* CATEGORY TABS HORIZONTAL SCROLL */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScrollContainer}
          >
            {categories.map((category) => {
              const isSelected = selectedCategory === category;
              return (
                <TouchableOpacity
                  key={category}
                  activeOpacity={0.8}
                  style={[
                    styles.categoryChip,
                    isSelected ? styles.categoryChipActive : styles.categoryChipInactive,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      isSelected ? styles.categoryTextActive : styles.categoryTextInactive,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* LATEST REPORT SECTION */}
          {showLatestReport && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>{r.latestReportSectionTitle}</Text>

              <View style={styles.latestCard}>
                {/* TOP ICON & BADGE ROW */}
                <View style={styles.latestTopRow}>
                  <View style={styles.latestIconBox}>
                    <Ionicons name="document-text" size={26} color="#FFFFFF" />
                  </View>

                  <View style={styles.latestBadgePill}>
                    <Text style={styles.latestBadgeText}>{r.latestReport.badge}</Text>
                  </View>
                </View>

                {/* REPORT TITLE */}
                <Text style={styles.latestTitle}>{r.latestReport.title}</Text>

                {/* DOCTOR NAME METADATA */}
                <View style={styles.metaRowDoctor}>
                  <Ionicons name="medical-outline" size={16} color="#64748B" style={{ marginRight: 6 }} />
                  <Text style={styles.metaTextDoctor}>{r.latestReport.doctor}</Text>
                </View>

                {/* DATE & FILE SIZE METADATA */}
                <View style={styles.metaRowDetails}>
                  <View style={styles.metaSubGroup}>
                    <Ionicons name="calendar-outline" size={15} color="#64748B" style={{ marginRight: 6 }} />
                    <Text style={styles.metaTextDetails}>{r.latestReport.date}</Text>
                  </View>

                  <View style={styles.metaSubGroup}>
                    <Ionicons name="cube-outline" size={15} color="#64748B" style={{ marginRight: 6 }} />
                    <Text style={styles.metaTextDetails}>{r.latestReport.fileSize}</Text>
                  </View>
                </View>

                {/* ACTION BUTTONS ROW */}
                <View style={styles.latestActionsRow}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.viewReportButton}
                    onPress={() => handleViewReport(latestReportItem)}
                  >
                    <Ionicons name="eye" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.viewReportText}>{r.latestReport.viewBtnText}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.downloadIconButton}
                    onPress={() => handleDownloadReport(latestReportItem.title)}
                    accessibilityRole="button"
                    accessibilityLabel="Download report"
                  >
                    <Ionicons name="download-outline" size={20} color="#003D9B" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* PREVIOUS REPORTS SECTION */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{r.previousReportsSectionTitle}</Text>

            {filteredPreviousReports.length === 0 && !showLatestReport ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="document-text-outline" size={48} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>No Medical Reports Found</Text>
                <Text style={styles.emptySubtitle}>
                  No reports match your current search query or selected filter category.
                </Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.resetFilterButton}
                  onPress={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                >
                  <Text style={styles.resetFilterText}>Clear Filters</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.previousListContainer}>
                {filteredPreviousReports.map((report) => (
                  <View key={report.id} style={styles.previousReportCard}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={styles.previousReportMainContent}
                      onPress={() => handleViewReport(report)}
                    >
                      {/* ICON CIRCLE */}
                      <View style={[styles.previousIconCircle, { backgroundColor: report.iconBg }]}>
                        <Ionicons name={report.iconName} size={22} color={report.iconColor} />
                      </View>

                      {/* TEXT INFO */}
                      <View style={styles.previousTextColumn}>
                        <Text style={styles.previousTitle}>{report.title}</Text>
                        <Text style={styles.previousSubtitle}>{report.subtitle}</Text>
                        <Text style={styles.previousDate}>{report.date}</Text>
                      </View>
                    </TouchableOpacity>

                    {/* KEBAB MENU THREE-DOTS */}
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={styles.kebabMenuButton}
                      onPress={() => handleKebabMenu(report)}
                      accessibilityRole="button"
                      accessibilityLabel="More options"
                    >
                      <Ionicons name="ellipsis-vertical" size={20} color="#64748B" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* FOOTER ENCRYPTED SECURITY BANNER */}
          <View style={styles.securityFooterContainer}>
            <View style={styles.securityIconBox}>
              <Ionicons name="cube-outline" size={32} color="#94A3B8" />
            </View>
            <Text style={styles.securityFooterText}>{r.footerSecurityText}</Text>
          </View>
        </ScrollView>

        {/* BOTTOM NAVIGATION BAR */}
        <BottomNavBar activeTab="profile" onTabPress={handleTabPress} />
      </View>

      {/* REPORT DETAILS MODAL */}
      {activeReportModal && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={!!activeReportModal}
          onRequestClose={() => setActiveReportModal(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <View style={styles.modalIconBox}>
                  <Ionicons name="document-text" size={24} color="#003D9B" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>{activeReportModal.title}</Text>
                  <Text style={styles.modalSubtitle}>{activeReportModal.subtitle}</Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setActiveReportModal(null)}
                  style={styles.modalCloseButton}
                >
                  <Ionicons name="close" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <View style={styles.modalMetaRow}>
                  <Text style={styles.modalMetaLabel}>Date Issued:</Text>
                  <Text style={styles.modalMetaValue}>{activeReportModal.date}</Text>
                </View>

                <View style={styles.modalMetaRow}>
                  <Text style={styles.modalMetaLabel}>Category:</Text>
                  <Text style={styles.modalMetaValue}>{activeReportModal.category}</Text>
                </View>

                {activeReportModal.fileSize && (
                  <View style={styles.modalMetaRow}>
                    <Text style={styles.modalMetaLabel}>File Size:</Text>
                    <Text style={styles.modalMetaValue}>{activeReportModal.fileSize}</Text>
                  </View>
                )}

                <View style={styles.modalStatusBox}>
                  <Ionicons name="checkmark-circle" size={18} color="#16A34A" style={{ marginRight: 6 }} />
                  <Text style={styles.modalStatusText}>Verified Clinical Record • Encrypted PDF</Text>
                </View>

                <View style={styles.modalPreviewPlaceholder}>
                  <Ionicons name="document-outline" size={40} color="#003D9B" />
                  <Text style={styles.previewText}>Report Preview Loaded Successfully</Text>
                  <Text style={styles.previewSubtext}>
                    Full clinical details and lab findings ready for export.
                  </Text>
                </View>
              </View>

              <View style={styles.modalFooterActions}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.modalPrimaryButton}
                  onPress={() => {
                    handleDownloadReport(activeReportModal.title);
                    setActiveReportModal(null);
                  }}
                >
                  <Ionicons name="download-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.modalPrimaryText}>Download PDF</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.modalSecondaryButton}
                  onPress={() => {
                    Share.share({
                      message: `Medical Report: ${activeReportModal.title} (${activeReportModal.date})`,
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

  /* SEARCH BAR */
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: Spacing.lg,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: '#0F172A',
  },

  /* CATEGORIES TABS */
  categoriesScrollContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: Spacing.xl,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 9999,
  },
  categoryChipActive: {
    backgroundColor: '#003D9B',
  },
  categoryChipInactive: {
    backgroundColor: '#EEF2FE',
  },
  categoryText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  categoryTextInactive: {
    color: '#475569',
  },

  /* SECTION TITLE */
  sectionContainer: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: '#64748B',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginLeft: 4,
  },

  /* LATEST REPORT CARD */
  latestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  latestTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  latestIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#003D9B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  latestBadgePill: {
    backgroundColor: '#22D3EE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  latestBadgeText: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
    letterSpacing: 0.6,
  },
  latestTitle: {
    fontSize: 20,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
    lineHeight: 26,
    marginBottom: 10,
  },
  metaRowDoctor: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  metaTextDoctor: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: '#475569',
  },
  metaRowDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    marginBottom: 20,
  },
  metaSubGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaTextDetails: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: '#64748B',
  },

  /* LATEST ACTIONS */
  latestActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  viewReportButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#003D9B',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  viewReportText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  downloadIconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* PREVIOUS REPORTS LIST */
  previousListContainer: {
    gap: 12,
  },
  previousReportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  previousReportMainContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  previousIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  previousTextColumn: {
    flex: 1,
  },
  previousTitle: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
    marginBottom: 2,
  },
  previousSubtitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: '#64748B',
    marginBottom: 2,
  },
  previousDate: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.medium,
    color: '#94A3B8',
  },
  kebabMenuButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
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

  /* SECURITY FOOTER BANNER */
  securityFooterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
    marginTop: Spacing.md,
  },
  securityIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  securityFooterText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },

  /* MODAL */
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
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: '#64748B',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    marginBottom: 20,
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
  modalStatusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 12,
    marginBottom: 16,
  },
  modalStatusText: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: '#15803D',
  },
  modalPreviewPlaceholder: {
    backgroundColor: '#FAFBFD',
    borderRadius: 16,
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  previewText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
    marginTop: 8,
  },
  previewSubtext: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
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
    flex: 1,
    height: 44,
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

export default MedicalReportsScreen;
