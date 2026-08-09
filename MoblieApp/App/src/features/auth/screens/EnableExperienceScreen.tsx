import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';
import { Strings } from '@/constants';
import { BrandHeader } from '@/components';
import { PrimaryButton } from '@/components';
import { FeaturePermissionCard, FeatureItem } from '@/features/recovery';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_ASPECT_RATIO = 1.05; // Matches design ratio
const HERO_HEIGHT = Math.min(SCREEN_WIDTH * HERO_ASPECT_RATIO, 340);

export interface EnableExperienceScreenProps {
  onBackPress?: () => void;
  onContinueSuccess?: (enabledFeatures: Record<string, boolean>) => void;
  onSkip?: () => void;
}

export const EnableExperienceScreen: React.FC<EnableExperienceScreenProps> = ({
  onBackPress,
  onContinueSuccess,
  onSkip,
}) => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  // State to track enabled status of features
  const [enabledFeatures, setEnabledFeatures] = useState<Record<string, boolean>>({
    reminders: false,
    clinics: false,
    progress: false,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleToggleFeature = (id: string, enabled: boolean) => {
    setEnabledFeatures((prev) => ({
      ...prev,
      [id]: enabled,
    }));
  };

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/complete-profile');
    }
  };

  const handleContinue = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (onContinueSuccess) {
        onContinueSuccess(enabledFeatures);
      } else {
        router.push({
          pathname: '/completion',
          params: {
            ...params,
            reminders: enabledFeatures.reminders ? 'true' : 'false',
            clinics: enabledFeatures.clinics ? 'true' : 'false',
            progress: enabledFeatures.progress ? 'true' : 'false',
          },
        });
      }
    }, 600);
  };

  const handleSkipForNow = () => {
    if (onSkip) {
      onSkip();
    } else {
      router.replace('/explore');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* TOP HERO IMAGE SECTION WITH OVERLAY HEADER */}
        <View style={styles.heroContainer}>
          <Image
            source={require('../../../assets/images/enable_experience_hero.png')}
            style={styles.heroImage}
            resizeMode="cover"
          />

          {/* Top Bar with Back Button & Brand Header */}
          <SafeAreaView style={styles.headerSafeArea}>
            <View style={styles.headerRow}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBack}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={Strings.accessibility.backButton}
              >
                <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
              </TouchableOpacity>

              <View style={styles.brandContainer}>
                <BrandHeader />
              </View>

              <View style={styles.headerSpacer} />
            </View>
          </SafeAreaView>
        </View>

        {/* MAIN BODY CONTENT SECTION */}
        <View style={styles.bodyContent}>
          {/* Main Title & Subtitle */}
          <View style={styles.headlineSection}>
            <Text style={styles.title}>{Strings.enableExperience.title}</Text>
            <Text style={styles.subtitle}>{Strings.enableExperience.subtitle}</Text>
          </View>

          {/* Feature Permission Cards */}
          <View style={styles.featuresSection}>
            {Strings.enableExperience.features.map((feature: FeatureItem) => (
              <FeaturePermissionCard
                key={feature.id}
                feature={feature}
                isEnabled={enabledFeatures[feature.id]}
                onToggle={handleToggleFeature}
              />
            ))}
          </View>

          {/* Bottom Action Area: Primary Button & Skip Link */}
          <View style={styles.actionSection}>
            <PrimaryButton
              title={Strings.enableExperience.continue}
              onPress={handleContinue}
              isLoading={isLoading}
              rightIcon="arrow-forward"
              accessibilityLabel={Strings.accessibility.continueButton}
              style={styles.continueBtn}
            />

            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkipForNow}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={Strings.enableExperience.skipForNow}
            >
              <Text style={styles.skipText}>{Strings.enableExperience.skipForNow}</Text>
            </TouchableOpacity>
          </View>

          {/* Home Indicator Spacing */}
          <View style={styles.homeIndicator} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroContainer: {
    width: '100%',
    height: HERO_HEIGHT,
    position: 'relative',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  headerSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 8 : 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  brandContainer: {
    alignItems: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  bodyContent: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
  },
  headlineSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: Typography.fontWeight.bold,
    color: '#051A3E',
    textAlign: 'center',
    letterSpacing: Typography.letterSpacing.tighter,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.sm,
  },
  featuresSection: {
    marginBottom: Spacing.lg,
  },
  actionSection: {
    gap: 16,
    marginTop: Spacing.xs,
  },
  continueBtn: {
    backgroundColor: '#003D9B',
    borderRadius: 9999,
  },
  skipButton: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  skipText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textSecondary,
  },
  homeIndicator: {
    width: Spacing.homeIndicatorWidth,
    height: Spacing.homeIndicatorHeight,
    backgroundColor: Colors.homeIndicator,
    borderRadius: 9999,
    alignSelf: 'center',
    marginTop: Spacing.lg,
  },
});

export default EnableExperienceScreen;
