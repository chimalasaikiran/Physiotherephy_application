import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import * as SplashScreenExpo from 'expo-splash-screen';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Strings } from '@/constants/strings';

// Keep native splash screen visible while loading resources
SplashScreenExpo.preventAutoHideAsync().catch(() => {
  /* ignore error if already hidden or not supported */
});

interface SplashScreenProps {
  onFinish?: () => void;
  duration?: number;
  autoNavigate?: boolean;
  testID?: string;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  duration = 2400,
  autoNavigate = true,
  testID = 'splash-screen',
}) => {
  // Animation values
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(16)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Hide native splash screen once custom splash component mounts
    SplashScreenExpo.hideAsync().catch(() => {});

    // Run entrance sequence animation
    Animated.sequence([
      // Step 1: Scale & fade in logo
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      // Step 2: Fade in & translate app name & tagline
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      // Step 3: Fade in footer
      Animated.timing(footerOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto navigate after duration if enabled
    if (autoNavigate && onFinish) {
      const timer = setTimeout(() => {
        onFinish();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoNavigate, duration, footerOpacity, logoOpacity, logoScale, onFinish, textOpacity, textTranslateY]);

  const handleContainerPress = () => {
    if (onFinish) {
      onFinish();
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={handleContainerPress}
      style={styles.container}
      testID={testID}
      accessibilityRole="header"
      accessibilityLabel={Strings.accessibility?.brandLogo || 'One Medical Splash Screen'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent />

      {/* Main Centered Content */}
      <View style={styles.centerContent}>
        {/* Animated Brand Logo Badge */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Image
            source={require('../../assets/images/splash_logo.png')}
            style={styles.logoImage}
            contentFit="contain"
            transition={200}
          />
        </Animated.View>

        {/* Animated Brand Name & Tagline Below Logo */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
            },
          ]}
        >
          <Text style={styles.appName}>{Strings.brand.name}</Text>
          <Text style={styles.tagline}>{Strings.brand.tagline}</Text>
        </Animated.View>
      </View>

      {/* Bottom Footer & Loading Indicator */}
      <SafeAreaView style={styles.footerSafeArea}>
        <Animated.View style={[styles.footerContainer, { opacity: footerOpacity }]}>
          <ActivityIndicator size="small" color={Colors.primary} style={styles.loader} />
          <Text style={styles.footerText}>{Strings.brand.footer}</Text>
        </Animated.View>
      </SafeAreaView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  logoContainer: {
    width: 104,
    height: 104,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 8,
    overflow: 'hidden',
  },
  logoImage: {
    width: 104,
    height: 104,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  appName: {
    fontSize: Typography.fontSize.title || 26,
    fontWeight: Typography.fontWeight.bold || '800',
    color: Colors.textPrimary || '#0F172A',
    letterSpacing: 2.5,
    textAlign: 'center',
  },
  tagline: {
    fontSize: Typography.fontSize.xs || 12,
    fontWeight: Typography.fontWeight.semiBold || '600',
    color: Colors.textSecondary || '#64748B',
    letterSpacing: 2,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  footerSafeArea: {
    position: 'absolute',
    bottom: Spacing.xl,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  footerContainer: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  loader: {
    marginBottom: Spacing.xs,
  },
  footerText: {
    fontSize: Typography.fontSize.xs || 11,
    fontWeight: Typography.fontWeight.medium || '500',
    color: Colors.textMuted || '#94A3B8',
    letterSpacing: 0.5,
  },
});

export default SplashScreen;
