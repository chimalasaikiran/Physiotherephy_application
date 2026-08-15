import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';
import { Strings } from '@/constants';
import { Country, getDefaultCountry } from '@/constants';
import { BrandHeader } from '@/components';
import { PrimaryButton } from '@/components';
import { PhoneInputField } from '@/components';
import { CountryPickerModal } from '@/components';

import { useAuth } from '@/context/AuthContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface PhoneLoginScreenProps {
  onBackPress?: () => void;
  onContinuePress?: (phoneNumber: string, country: Country) => void;
  onNeedHelpPress?: () => void;
  onTermsPress?: () => void;
  onPrivacyPress?: () => void;
}

export const PhoneLoginScreen: React.FC<PhoneLoginScreenProps> = ({
  onBackPress,
  onContinuePress,
  onNeedHelpPress,
  onTermsPress,
  onPrivacyPress,
}) => {
  const router = useRouter();
  const { sendOtp } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(getDefaultCountry);
  const [isCountryPickerVisible, setIsCountryPickerVisible] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const handleContinue = async () => {
    const rawDigits = phoneNumber.replace(/\D/g, '');
    if (!phoneNumber.trim() || rawDigits.length < 6) {
      setError('Please enter a valid mobile number');
      return;
    }
    setError(undefined);
    setIsSendingOtp(true);
    const fullNumber = `${selectedCountry.dialCode}${rawDigits}`;

    const result = await sendOtp(fullNumber);
    setIsSendingOtp(false);

    if (result.success) {
      if (onContinuePress) {
        onContinuePress(phoneNumber, selectedCountry);
      } else {
        router.push({
          pathname: '/otp',
          params: { phone: `${selectedCountry.dialCode} ${rawDigits}` },
        });
      }
    } else {
      setError(result.error || 'Failed to send OTP. Please try again.');
    }
  };



  const handleNeedHelp = () => {
    if (onNeedHelpPress) {
      onNeedHelpPress();
    } else {
      router.push('/help-support' as any);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          bounces={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Section: Hero Image with Overlay & Back Button */}
          <View style={styles.heroSection}>
            <Image
              source={require('../../../assets/images/welcome_hero-5ce232.png')}
              style={styles.heroImage}
              contentFit="cover"
              transition={300}
              accessibilityLabel={Strings.accessibility.heroImage}
            />
            {/* Dark to White Gradient Overlay */}
            <LinearGradient
              colors={[
                'rgba(0,0,0,0.35)',
                'rgba(0,0,0,0.1)',
                'rgba(255,255,255,0.85)',
                '#FFFFFF',
              ]}
              locations={[0, 0.3, 0.8, 1]}
              style={styles.gradientOverlay}
            />

            {/* Floating Top Navigation Shell / Back Button */}
            <SafeAreaView style={styles.topNavSafeArea}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBack}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={Strings.accessibility.backButton}
              >
                <View style={styles.backButtonInner}>
                  <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
                </View>
              </TouchableOpacity>
            </SafeAreaView>
          </View>

          {/* Bottom Section: Content & Phone Input Form */}
          <SafeAreaView style={styles.contentSafeArea}>
            <View style={styles.contentSection}>
              {/* Brand Logo Header */}
              <BrandHeader />

              {/* Headline & Subtitle Section */}
              <View style={styles.headlineSection}>
                <Text style={styles.title}>{Strings.login.title}</Text>
                <Text style={styles.subtitle}>{Strings.login.subtitle}</Text>
              </View>

              {/* Phone Input Form & Action */}
              <View style={styles.formSection}>
                <PhoneInputField
                  value={phoneNumber}
                  onChangeText={(text) => {
                    setPhoneNumber(text);
                    if (error) setError(undefined);
                  }}
                  selectedCountry={selectedCountry}
                  onOpenCountryPicker={() => setIsCountryPickerVisible(true)}
                  error={error}
                />

                <PrimaryButton
                  title={Strings.login.continue}
                  onPress={handleContinue}
                  isLoading={isSendingOtp}
                  accessibilityLabel={Strings.accessibility.continueButton}
                />
              </View>

              {/* Footer Section: Terms & Need Help */}
              <View style={styles.footerSection}>
                <Text style={styles.termsText}>
                  {Strings.login.termsPrefix}
                  <Text
                    style={styles.termsLink}
                    onPress={onTermsPress}
                    accessibilityRole="link"
                    accessibilityLabel={Strings.accessibility.termsLink}
                  >
                    {Strings.login.termsOfService}
                  </Text>
                  {Strings.login.and}
                  <Text
                    style={styles.termsLink}
                    onPress={onPrivacyPress}
                    accessibilityRole="link"
                    accessibilityLabel={Strings.accessibility.privacyLink}
                  >
                    {Strings.login.privacyPolicy}
                  </Text>
                  .
                </Text>

                <TouchableOpacity
                  style={styles.needHelpButton}
                  onPress={handleNeedHelp}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={Strings.accessibility.needHelpButton}
                >
                  <Ionicons
                    name="help-circle-outline"
                    size={18}
                    color={Colors.primary}
                  />
                  <Text style={styles.needHelpText}>{Strings.login.needHelp}</Text>
                </TouchableOpacity>
              </View>

              {/* Home Indicator Placeholder Bar */}
              <View style={styles.homeIndicator} />
            </View>
          </SafeAreaView>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Country Code Picker Modal */}
      <CountryPickerModal
        visible={isCountryPickerVisible}
        selectedCountry={selectedCountry}
        onSelectCountry={(country) => setSelectedCountry(country)}
        onClose={() => setIsCountryPickerVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroSection: {
    height: SCREEN_HEIGHT * 0.48, // Responsive top hero ratio
    width: '100%',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  topNavSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    marginLeft: Spacing.lg,
    marginTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 8 : 12,
  },
  backButtonInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contentSafeArea: {
    flex: 1,
    backgroundColor: Colors.background,
    marginTop: -28, // Visual overlap with hero photo
  },
  contentSection: {
    flex: 1,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    justifyContent: 'space-between',
    gap: Spacing.lg,
  },
  headlineSection: {
    gap: Spacing.xs,
  },
  title: {
    fontSize: Typography.fontSize.title, // 30px
    fontWeight: Typography.fontWeight.bold,
    lineHeight: Typography.lineHeight.title,
    color: Colors.textPrimary,
    letterSpacing: Typography.letterSpacing.tighter,
  },
  subtitle: {
    fontSize: Typography.fontSize.md, // 15-16px
    fontWeight: Typography.fontWeight.regular,
    lineHeight: Typography.lineHeight.md,
    color: Colors.textSecondary,
    maxWidth: 300,
  },
  formSection: {
    gap: Spacing.lg,
  },
  footerSection: {
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  termsText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    lineHeight: Typography.lineHeight.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.sm,
  },
  termsLink: {
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.primary,
  },
  needHelpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  needHelpText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.primary,
  },
  homeIndicator: {
    width: Spacing.homeIndicatorWidth,
    height: Spacing.homeIndicatorHeight,
    backgroundColor: Colors.homeIndicator,
    borderRadius: 9999,
    alignSelf: 'center',
    marginTop: Spacing.xs,
  },
});

export default PhoneLoginScreen;
