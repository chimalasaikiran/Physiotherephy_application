import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';
import { Strings } from '@/constants';
import { BrandHeader } from '@/components';
import { PrimaryButton } from '@/components';

interface WelcomeScreenProps {
  onGetStarted?: () => void;
  onSignIn?: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onGetStarted,
  onSignIn,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Top Section: Hero Image with Gradient Fade Overlay */}
      <View style={styles.heroSection}>
        <Image
          source={require('../../../assets/images/welcome_hero.png')}
          style={styles.heroImage}
          contentFit="cover"
          transition={300}
          accessibilityLabel={Strings.accessibility.heroImage}
        />
        {/* Subtle Top & Bottom Gradient Overlay for Visual Polish */}
        <LinearGradient
          colors={['rgba(0,0,0,0.15)', 'transparent', 'rgba(255,255,255,0.85)', '#FFFFFF']}
          locations={[0, 0.4, 0.85, 1]}
          style={styles.gradientOverlay}
        />
      </View>

      {/* Bottom Section: Content & Actions */}
      <View
        style={[
          styles.contentSection,
          { paddingBottom: Math.max(insets.bottom, 20) },
        ]}
      >
        <View style={styles.mainContentGroup}>
          {/* Brand Logo & Name */}
          <BrandHeader />

          {/* Headline Text */}
          <View style={styles.textContainer}>
            <Text style={styles.headline}>{Strings.welcome.title}</Text>
            <Text style={styles.subtext}>{Strings.welcome.subtitle}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionGroup}>
          <PrimaryButton
            title={Strings.welcome.getStarted}
            onPress={onGetStarted}
            accessibilityLabel={Strings.accessibility.getStartedButton}
          />

          <View style={styles.secondaryContainer}>
            <Text style={styles.secondaryText}>
              {Strings.welcome.alreadyHaveAccount}
            </Text>
            <TouchableOpacity
              onPress={onSignIn}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={Strings.accessibility.signInButton}
            >
              <Text style={styles.signInText}>{Strings.welcome.signIn}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  heroSection: {
    height: SCREEN_HEIGHT * Spacing.heroHeightRatio,
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
  contentSafeArea: {
    flex: 1,
    backgroundColor: Colors.background,
    marginTop: -20, // Subtle overlap for seamless visual integration
  },
  contentSection: {
    flex: 1,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    justifyContent: 'space-between',
  },
  mainContentGroup: {
    gap: Spacing.lg,
  },
  textContainer: {
    marginTop: Spacing.xs,
    gap: Spacing.sm,
  },
  headline: {
    fontSize: Typography.fontSize.title,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: Typography.lineHeight.title,
    color: Colors.textPrimary,
    letterSpacing: Typography.letterSpacing.tighter,
  },
  subtext: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.regular,
    lineHeight: Typography.lineHeight.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  actionGroup: {
    gap: Spacing.xl,
    marginTop: Spacing.md,
  },
  secondaryContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    lineHeight: Typography.lineHeight.secondaryLink,
    color: Colors.primary,
  },
  signInText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: Typography.lineHeight.secondaryLink,
    color: Colors.primary,
    textDecorationLine: 'underline',
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

export default WelcomeScreen;
