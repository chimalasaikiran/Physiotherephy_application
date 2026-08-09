import React, { useState, useEffect } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';
import { Strings } from '@/constants';
import { BrandHeader } from '@/components';
import { PrimaryButton } from '@/components';
import { OtpInputGrid } from '@/components';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface OtpVerificationScreenProps {
  phoneNumber?: string;
  onBackPress?: () => void;
  onEditNumberPress?: () => void;
  onVerifySuccess?: (code: string) => void;
  onNeedHelpPress?: () => void;
}

export const OtpVerificationScreen: React.FC<OtpVerificationScreenProps> = ({
  phoneNumber: propPhoneNumber,
  onBackPress,
  onEditNumberPress,
  onVerifySuccess,
  onNeedHelpPress,
}) => {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone?: string }>();
  
  const displayPhone = propPhoneNumber || params.phone || '+91 98765 43210';

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState<string | undefined>();
  const [timer, setTimer] = useState<number>(25);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);


  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/login');
    }
  };

  const handleEditNumber = () => {
    if (onEditNumberPress) {
      onEditNumberPress();
    } else {
      router.back();
    }
  };

  const handleVerify = () => {
    const fullCode = otp.join('');
    if (fullCode.length < 6) {
      setError('Please enter the complete 6-digit verification code');
      return;
    }

    setError(undefined);
    if (onVerifySuccess) {
      onVerifySuccess(fullCode);
    } else {
      router.push('/complete-profile');
    }
  };

  const handleResendCode = () => {
    if (timer === 0) {
      setTimer(25);
      setOtp(['', '', '', '', '', '']);
      setError(undefined);
      Alert.alert('Code Sent', `A new verification code was sent to ${displayPhone}`);
    }
  };

  const handleNeedHelp = () => {
    if (onNeedHelpPress) {
      onNeedHelpPress();
    } else {
      router.push('/help-support' as any);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
          {/* Top Hero Photo Section */}
          <View style={styles.heroSection}>
            <Image
              source={require('../../../assets/images/welcome_hero-5ce232.png')}
              style={styles.heroImage}
              contentFit="cover"
              transition={300}
              accessibilityLabel={Strings.accessibility.heroImage}
            />
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

            {/* Back Button Shell */}
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

          {/* Bottom Content Section */}
          <SafeAreaView style={styles.contentSafeArea}>
            <View style={styles.contentSection}>
              {/* Brand Logo */}
              <BrandHeader />

              {/* Header & Subtext */}
              <View style={styles.headlineSection}>
                <Text style={styles.title}>{Strings.otp.title}</Text>
                <View style={styles.subtitleContainer}>
                  <Text style={styles.subtitle}>
                    {Strings.otp.subtitlePrefix}{' '}
                    <Text style={styles.phoneNumberHighlight}>{displayPhone}</Text>
                  </Text>
                  <TouchableOpacity
                    onPress={handleEditNumber}
                    activeOpacity={0.7}
                    style={styles.editNumberButton}
                    accessibilityRole="button"
                    accessibilityLabel={Strings.accessibility.editNumberButton}
                  >
                    <Text style={styles.editNumberText}>{Strings.otp.editNumber}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* OTP Grid & Submit */}
              <View style={styles.formSection}>
                <OtpInputGrid
                  otp={otp}
                  onChangeOtp={(newOtp) => {
                    setOtp(newOtp);
                    if (error) setError(undefined);
                  }}
                  error={!!error}
                />
                {error && <Text style={styles.errorText}>{error}</Text>}

                <PrimaryButton
                  title={Strings.otp.continue}
                  onPress={handleVerify}
                  accessibilityLabel={Strings.accessibility.continueButton}
                />
              </View>

              {/* Footer Actions */}
              <View style={styles.footerSection}>
                {/* Timer Display */}
                <View style={styles.timerRow}>
                  <Text style={styles.resendInText}>{Strings.otp.resendIn}</Text>
                  <Text style={styles.timerText}>{formatTimer(timer)}</Text>
                </View>

                {/* Resend & Help Links */}
                <View style={styles.footerLinksRow}>
                  <TouchableOpacity
                    onPress={handleResendCode}
                    disabled={timer > 0}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={Strings.accessibility.resendCodeButton}
                  >
                    <Text
                      style={[
                        styles.resendCodeText,
                        timer > 0 && styles.resendCodeDisabled,
                      ]}
                    >
                      {Strings.otp.resendCode}
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.verticalDivider} />

                  <TouchableOpacity
                    onPress={handleNeedHelp}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={Strings.accessibility.needHelpButton}
                  >
                    <Text style={styles.needHelpText}>{Strings.otp.needHelp}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Home Indicator Placeholder */}
              <View style={styles.homeIndicator} />
            </View>
          </SafeAreaView>
        </ScrollView>
      </KeyboardAvoidingView>
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
    height: SCREEN_HEIGHT * 0.44,
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
    marginTop: -28,
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
    fontSize: Typography.fontSize.title,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: Typography.lineHeight.title,
    color: Colors.darkBlue,
    letterSpacing: Typography.letterSpacing.tighter,
    textAlign: 'center',
  },
  subtitleContainer: {
    alignItems: 'center',
    gap: 4,
  },
  subtitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.regular,
    lineHeight: Typography.lineHeight.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  phoneNumberHighlight: {
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.darkBlue,
  },
  editNumberButton: {
    marginTop: 2,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  editNumberText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  formSection: {
    gap: Spacing.md,
  },
  errorText: {
    fontSize: Typography.fontSize.xs,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: -4,
  },
  footerSection: {
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resendInText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.textSecondary,
  },
  timerText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
  },
  footerLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  resendCodeText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textDisabled,
  },
  resendCodeDisabled: {
    opacity: 0.6,
  },
  verticalDivider: {
    width: 1,
    height: 16,
    backgroundColor: Colors.otpInputBorderDefault,
  },
  needHelpText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
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

export default OtpVerificationScreen;
