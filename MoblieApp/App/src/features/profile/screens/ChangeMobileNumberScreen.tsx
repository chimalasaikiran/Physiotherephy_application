import React, { useState } from 'react';
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
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';
import { Strings } from '@/constants';
import { Country, getDefaultCountry } from '@/constants';
import { CountryPickerModal } from '@/components';
import { BottomNavBar, TabKey } from '@/components';

export const ChangeMobileNumberScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const data = Strings.changeMobileNumberDetails;

  const [newMobileNumber, setNewMobileNumber] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(getDefaultCountry());
  const [isCountryPickerVisible, setIsCountryPickerVisible] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'ONE MEDICAL - Change Registered Mobile Number',
      });
    } catch (error) {
      console.log('Error sharing change mobile screen:', error);
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

  const handleTextChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setNewMobileNumber(cleaned);
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const handleContinue = () => {
    if (!newMobileNumber.trim() || newMobileNumber.length < 6) {
      setErrorMessage('Please enter a valid mobile number');
      return;
    }

    const fullPhoneNumber = `${selectedCountry.dialCode} ${newMobileNumber.trim()}`;
    
    Alert.alert(
      'Send Verification Code',
      `We will send a 6-digit OTP verification code to ${fullPhoneNumber}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Code',
          onPress: () => {
            router.push({
              pathname: '/otp',
              params: { phone: fullPhoneNumber },
            } as any);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.container}>
        {/* HEADER BAR */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.headerIconButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color="#003D9B" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>{data.headerTitle}</Text>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.headerIconButton}
            onPress={handleShare}
            accessibilityRole="button"
            accessibilityLabel="Share screen"
          >
            <Ionicons name="share-outline" size={22} color="#003D9B" />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: 110 + Math.max(insets.bottom, 12) },
            ]}
          >
            {/* 1. TOP TITLE & DESCRIPTION */}
            <View style={styles.topInfoSection}>
              <Text style={styles.securityTag}>{data.securityUpdateTag}</Text>
              <Text style={styles.securityDescription}>
                {data.securityUpdateDescription}
              </Text>
            </View>

            {/* 2. CURRENT NUMBER SECTION */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionLabel}>{data.currentNumberLabel}</Text>
              <View style={styles.currentNumberCard}>
                <View style={styles.currentNumberLeft}>
                  <View style={styles.phoneIconCircle}>
                    <Ionicons name="phone-portrait-outline" size={22} color="#003D9B" />
                  </View>
                  <View style={styles.phoneTextContainer}>
                    <Text style={styles.registeredLabel}>
                      {data.registeredMobileLabel}
                    </Text>
                    <Text style={styles.currentPhoneNumber}>
                      {data.currentPhoneNumber}
                    </Text>
                  </View>
                </View>

                {/* VERIFIED BADGE */}
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
                  <Text style={styles.verifiedText}>{data.verifiedBadgeText}</Text>
                </View>
              </View>
            </View>

            {/* 3. NEW MOBILE NUMBER SECTION */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionLabel}>{data.newNumberLabel}</Text>
              <View
                style={[
                  styles.inputContainer,
                  isFocused && styles.inputContainerFocused,
                  !!errorMessage && styles.inputContainerError,
                ]}
              >
                {/* Country Code Selector Pill */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.countryPickerPill}
                  onPress={() => setIsCountryPickerVisible(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Select country code"
                >
                  <Text style={styles.flagEmoji}>{selectedCountry.flag}</Text>
                  <Text style={styles.dialCode}>{selectedCountry.dialCode}</Text>
                  <Ionicons name="chevron-down" size={12} color="#64748B" />
                </TouchableOpacity>

                {/* Mobile Input Field */}
                <TextInput
                  style={styles.textInput}
                  value={newMobileNumber}
                  onChangeText={handleTextChange}
                  placeholder={data.newNumberPlaceholder}
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  maxLength={15}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                />
              </View>
              {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
              ) : null}
            </View>

            {/* 4. SECURITY NOTICE INFO BOX */}
            <View style={styles.noticeBoxContainer}>
              <View style={styles.noticeIconCircle}>
                <Ionicons name="shield-checkmark" size={13} color="#FFFFFF" />
              </View>
              <Text style={styles.noticeText}>
                {data.verificationNoticePrefix}
                <Text style={styles.noticeBoldText}>{data.verificationNoticeBold}</Text>
                {data.verificationNoticeSuffix}
              </Text>
            </View>

            {/* 5. SHIELD ILLUSTRATION CARD */}
            <View style={styles.illustrationCard}>
              <View style={styles.shieldOuterCircle}>
                <View style={styles.shieldInnerCircle}>
                  <Ionicons name="shield" size={44} color="#BFDBFE" />
                </View>
              </View>
            </View>

            {/* 6. CONTINUE BUTTON */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.continueButton}
              onPress={handleContinue}
              accessibilityRole="button"
              accessibilityLabel="Continue to verify mobile number"
            >
              <Text style={styles.continueButtonText}>{data.continueButtonText}</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* COUNTRY PICKER MODAL */}
        <CountryPickerModal
          visible={isCountryPickerVisible}
          selectedCountry={selectedCountry}
          onSelectCountry={(country) => {
            setSelectedCountry(country);
            setIsCountryPickerVisible(false);
          }}
          onClose={() => setIsCountryPickerVisible(false)}
        />

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
  keyboardAvoidingView: {
    flex: 1,
  },

  /* HEADER BAR */
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

  /* TOP TITLE & DESCRIPTION */
  topInfoSection: {
    marginBottom: Spacing.xl,
  },
  securityTag: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  securityDescription: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.regular,
    color: '#64748B',
    lineHeight: 20,
  },

  /* SECTION GENERIC */
  sectionContainer: {
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: '#64748B',
    marginBottom: 8,
  },

  /* CURRENT NUMBER CARD */
  currentNumberCard: {
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
  currentNumberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  phoneIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  phoneTextContainer: {
    justifyContent: 'center',
  },
  registeredLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: '#64748B',
  },
  currentPhoneNumber: {
    fontSize: 17,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
    marginTop: 2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    color: '#16A34A',
    marginLeft: 4,
    letterSpacing: 0.5,
  },

  /* NEW MOBILE INPUT */
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    height: 56,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  inputContainerFocused: {
    borderColor: '#003D9B',
  },
  inputContainerError: {
    borderColor: '#EF4444',
  },
  countryPickerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 8,
  },
  flagEmoji: {
    fontSize: 18,
    marginRight: 4,
  },
  dialCode: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
    marginRight: 4,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: '#0F172A',
    paddingRight: Spacing.sm,
  },
  errorText: {
    fontSize: Typography.fontSize.xs,
    color: '#EF4444',
    marginTop: 6,
    marginLeft: 8,
  },

  /* NOTICE BOX */
  noticeBoxContainer: {
    backgroundColor: '#F0F7FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 20,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
  },
  noticeIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#003D9B',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    marginRight: 12,
  },
  noticeText: {
    flex: 1,
    fontSize: Typography.fontSize.xs + 1,
    fontWeight: Typography.fontWeight.regular,
    color: '#334155',
    lineHeight: 19,
  },
  noticeBoldText: {
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
  },

  /* SHIELD ILLUSTRATION CARD */
  illustrationCard: {
    backgroundColor: '#F4F8FC',
    borderRadius: 24,
    height: 170,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: '#EBF2FA',
  },
  shieldOuterCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(219, 234, 254, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shieldInnerCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },

  /* CONTINUE BUTTON */
  continueButton: {
    height: 54,
    borderRadius: 27,
    backgroundColor: '#003D9B',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 8,
    marginBottom: Spacing.lg,
  },
  continueButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
  },
});

export default ChangeMobileNumberScreen;
