import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Switch,
  Share,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';
import { Strings } from '@/constants';
import { BottomNavBar, TabKey } from '@/components';

export const PrivacySecurityScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const psData = Strings.privacySecurityDetails;

  // Toggle state for Face ID / Touch ID Login
  const [faceIdEnabled, setFaceIdEnabled] = useState<boolean>(true);

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'ONE MEDICAL - Privacy & Security Settings',
      });
    } catch (error) {
      console.log('Error sharing privacy settings:', error);
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

  const handleTwoStepVerification = () => {
    Alert.alert(
      'Two-Step Verification',
      'Two-step verification is currently enabled for your account via SMS code sent to your registered mobile number.',
      [
        { text: 'Keep Enabled', style: 'cancel' },
        {
          text: 'Configure Settings',
          onPress: () => Alert.alert('Configuration', 'Verification code will be sent to +91 98765 43210.'),
        },
      ]
    );
  };

  const handleChangeMobileNumber = () => {
    router.push('/change-mobile-number' as any);
  };


  const handleManageTrustedDevices = () => {
    Alert.alert(
      'Trusted Devices',
      'Currently 1 trusted device (iPhone 16 Pro) is registered to your account.',
      [{ text: 'OK' }]
    );
  };

  const handleManageDataSharing = () => {
    Alert.alert(
      'Data Sharing Preferences',
      'Choose whether anonymous diagnostic and health telemetry data is shared to improve treatment plans.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Manage Preferences', onPress: () => Alert.alert('Saved', 'Data sharing settings updated.') },
      ]
    );
  };

  const handleDownloadData = () => {
    Alert.alert(
      'Download My Data',
      'We will prepare an encrypted ZIP archive containing all your medical records, session logs, and personal details.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request Archive',
          onPress: () => Alert.alert('Request Submitted', 'Download link will be emailed to sanya.m@example.com within 24 hours.'),
        },
      ]
    );
  };

  const handlePrivacyPolicy = () => {
    Alert.alert(
      'Privacy Policy',
      'ONE MEDICAL complies with HIPAA and global medical data privacy regulations. Your data is encrypted end-to-end at rest and in transit.',
      [{ text: 'Close' }]
    );
  };

  const handleTermsConditions = () => {
    Alert.alert(
      'Terms & Conditions',
      'By using ONE MEDICAL, you agree to our standard Healthcare Service Level Agreement and platform terms of use.',
      [{ text: 'Close' }]
    );
  };

  const handleViewActiveDevices = () => {
    Alert.alert(
      'Active Sessions',
      '1 Active Session:\n• iPhone 16 Pro (Current Device) - Bengaluru, India',
      [{ text: 'Close' }]
    );
  };

  const handleSignOutOtherDevices = () => {
    Alert.alert(
      'Sign Out Other Devices',
      'Are you sure you want to log out from all other active sessions and browsers?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out All',
          style: 'destructive',
          onPress: () => Alert.alert('Sessions Terminated', 'All other active sessions have been signed out.'),
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    router.push('/delete-account' as any);
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

          <Text style={styles.headerTitle}>{psData.headerTitle}</Text>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.headerIconButton}
            onPress={handleShare}
            accessibilityRole="button"
            accessibilityLabel="Share privacy settings"
          >
            <Ionicons name="share-outline" size={22} color="#003D9B" />
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
          {/* 1. ACCOUNT SECURITY SECTION */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{psData.sections.accountSecurity.title}</Text>

            <View style={styles.cardContainer}>
              {/* Face ID / Touch ID Login */}
              <View style={[styles.itemRow, styles.itemBorderBottom]}>
                <View style={styles.itemLeft}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="finger-print-outline" size={20} color="#003D9B" />
                  </View>
                  <Text style={styles.itemTitle}>{psData.sections.accountSecurity.items.faceId}</Text>
                </View>
                <Switch
                  value={faceIdEnabled}
                  onValueChange={setFaceIdEnabled}
                  trackColor={{ false: '#E2E8F0', true: '#22C55E' }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor="#E2E8F0"
                />
              </View>

              {/* Two-Step Verification */}
              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.itemRow, styles.itemBorderBottom]}
                onPress={handleTwoStepVerification}
              >
                <View style={styles.itemLeft}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="shield-checkmark-outline" size={20} color="#003D9B" />
                  </View>
                  <Text style={styles.itemTitle}>{psData.sections.accountSecurity.items.twoStep}</Text>
                </View>
                <View style={styles.itemRightValueRow}>
                  <Text style={styles.statusOnText}>{psData.sections.accountSecurity.items.twoStepStatus}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
                </View>
              </TouchableOpacity>

              {/* Change Mobile Number */}
              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.itemRow, styles.itemBorderBottom]}
                onPress={handleChangeMobileNumber}
              >
                <View style={styles.itemLeft}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="phone-portrait-outline" size={20} color="#003D9B" />
                  </View>
                  <Text style={styles.itemTitle}>{psData.sections.accountSecurity.items.changeMobile}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              </TouchableOpacity>

              {/* Manage Trusted Devices */}
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.itemRow}
                onPress={handleManageTrustedDevices}
              >
                <View style={styles.itemLeft}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="hardware-chip-outline" size={20} color="#003D9B" />
                  </View>
                  <Text style={styles.itemTitle}>{psData.sections.accountSecurity.items.trustedDevices}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          </View>

          {/* 2. PRIVACY SECTION */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{psData.sections.privacy.title}</Text>

            <View style={styles.cardContainer}>
              {/* Manage Data Sharing */}
              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.itemRow, styles.itemBorderBottom]}
                onPress={handleManageDataSharing}
              >
                <View style={styles.itemLeft}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="chatbubble-ellipses-outline" size={20} color="#003D9B" />
                  </View>
                  <Text style={styles.itemTitle}>{psData.sections.privacy.items.dataSharing}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              </TouchableOpacity>

              {/* Download My Data */}
              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.itemRow, styles.itemBorderBottom]}
                onPress={handleDownloadData}
              >
                <View style={styles.itemLeft}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="download-outline" size={20} color="#003D9B" />
                  </View>
                  <Text style={styles.itemTitle}>{psData.sections.privacy.items.downloadData}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              </TouchableOpacity>

              {/* Privacy Policy */}
              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.itemRow, styles.itemBorderBottom]}
                onPress={handlePrivacyPolicy}
              >
                <View style={styles.itemLeft}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="shield-outline" size={20} color="#003D9B" />
                  </View>
                  <Text style={styles.itemTitle}>{psData.sections.privacy.items.privacyPolicy}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              </TouchableOpacity>

              {/* Terms & Conditions */}
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.itemRow}
                onPress={handleTermsConditions}
              >
                <View style={styles.itemLeft}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="document-text-outline" size={20} color="#003D9B" />
                  </View>
                  <Text style={styles.itemTitle}>{psData.sections.privacy.items.termsConditions}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          </View>

          {/* 3. SESSION MANAGEMENT SECTION */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{psData.sections.sessionManagement.title}</Text>

            <View style={styles.cardContainer}>
              {/* Current Device Item */}
              <View style={[styles.itemRow, styles.itemBorderBottom]}>
                <View style={styles.itemLeft}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="laptop-outline" size={20} color="#003D9B" />
                  </View>
                  <View style={styles.deviceTextCol}>
                    <Text style={styles.deviceNameText}>{psData.sections.sessionManagement.currentDeviceName}</Text>
                    <Text style={styles.deviceDetailsText}>
                      {psData.sections.sessionManagement.currentDeviceDetails}
                    </Text>
                  </View>
                </View>
              </View>

              {/* View Active Devices */}
              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.itemRow, styles.itemBorderBottom]}
                onPress={handleViewActiveDevices}
              >
                <Text style={styles.itemTitleAction}>{psData.sections.sessionManagement.viewActiveDevices}</Text>
                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              </TouchableOpacity>

              {/* Sign Out From Other Devices */}
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.itemRow}
                onPress={handleSignOutOtherDevices}
              >
                <Text style={styles.signOutBlueText}>{psData.sections.sessionManagement.signOutOthers}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 4. DELETE ACCOUNT SECTION */}
          <View style={styles.deleteSectionContainer}>
            <View style={styles.deleteCardContainer}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.deleteRow}
                onPress={handleDeleteAccount}
              >
                <View style={styles.itemLeft}>
                  <View style={styles.deleteIconCircle}>
                    <Ionicons name="ban-outline" size={20} color="#DC2626" />
                  </View>
                  <Text style={styles.deleteTitleText}>{psData.sections.deleteAccount.title}</Text>
                </View>
              </TouchableOpacity>
            </View>

            <Text style={styles.deleteDescriptionText}>
              {psData.sections.deleteAccount.description}
            </Text>
          </View>
        </ScrollView>

        {/* BOTTOM NAVIGATION TAB BAR */}
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

  /* SCROLL CONTENT */
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },

  /* SECTIONS */
  sectionContainer: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: '#64748B',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginLeft: 4,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    minHeight: 58,
  },
  itemBorderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  itemTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: '#0F172A',
    flex: 1,
  },
  itemTitleAction: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: '#0F172A',
  },
  itemRightValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusOnText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: '#0284C7',
    marginRight: 2,
  },

  /* SESSION MANAGEMENT SPECIFICS */
  deviceTextCol: {
    justifyContent: 'center',
  },
  deviceNameText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
  },
  deviceDetailsText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.regular,
    color: '#64748B',
    marginTop: 2,
  },
  signOutBlueText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },

  /* DELETE ACCOUNT SECTION */
  deleteSectionContainer: {
    marginBottom: Spacing.xl,
  },
  deleteCardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  deleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    minHeight: 58,
  },
  deleteIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  deleteTitleText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: '#DC2626',
  },
  deleteDescriptionText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.regular,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
    marginTop: 14,
    lineHeight: 18,
  },
});

export default PrivacySecurityScreen;
