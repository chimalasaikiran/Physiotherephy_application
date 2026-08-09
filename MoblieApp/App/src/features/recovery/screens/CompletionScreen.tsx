import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';
import { Strings } from '@/constants';
import { PrimaryButton } from '@/components';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_HEIGHT = Math.min(SCREEN_WIDTH * 0.92, 380);

export interface CompletionScreenProps {
  onExplore?: () => void;
  onMaybeLater?: () => void;
}

export const CompletionScreen: React.FC<CompletionScreenProps> = ({
  onExplore,
  onMaybeLater,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleExplore = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (onExplore) {
        onExplore();
      } else {
        router.replace('/explore');
      }
    }, 400);
  };

  const handleMaybeLater = () => {
    if (onMaybeLater) {
      onMaybeLater();
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
        {/* SINGLE HERO IMAGE WITH OVERLAPPING CHECK ICON */}
        <View style={styles.heroContainer}>
          <Image
            source={require('../../../assets/images/completion_hero.png')}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.badgeWrapper}>
            <View style={styles.badgeInner}>
              <Ionicons name="checkmark" size={28} color={Colors.white} />
            </View>
          </View>
        </View>

        {/* MAIN CONTENT SECTION: FLEX 1 & JUSTIFY-CONTENT BETWEEN */}
        <View style={styles.bodyContent}>
          <View style={styles.headlineSection}>
            <Text style={styles.title}>{Strings.completion.title}</Text>
            <Text style={styles.subtitle}>{Strings.completion.subtitle}</Text>
          </View>

          <View style={styles.bottomSection}>
            <View style={styles.actionSection}>
              <PrimaryButton
                title={Strings.completion.explore}
                onPress={handleExplore}
                isLoading={isLoading}
                style={styles.exploreBtn}
                textStyle={styles.exploreBtnText}
              />

              <TouchableOpacity
                onPress={handleMaybeLater}
                activeOpacity={0.7}
                style={styles.maybeLaterButton}
                accessibilityRole="button"
                accessibilityLabel={Strings.completion.maybeLater}
              >
                <Text style={styles.maybeLaterText}>{Strings.completion.maybeLater}</Text>
              </TouchableOpacity>
            </View>

          </View>
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
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  badgeWrapper: {
    position: 'absolute',
    bottom: -30,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  badgeInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  bodyContent: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.xxl,
    paddingTop: 48,
    paddingBottom: Spacing.lg,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headlineSection: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: Typography.fontWeight.bold,
    color: '#051A3E',
    textAlign: 'center',
    letterSpacing: Typography.letterSpacing.tighter,
    marginBottom: 14,
  },
  subtitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing.xs,
  },
  bottomSection: {
    width: '100%',
    marginTop: 'auto',
    alignItems: 'center',
    paddingTop: 4,
  },
  actionSection: {
    width: '100%',
  },
  exploreBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 9999,
    height: 54,
  },
  exploreBtnText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
  },
  maybeLaterButton: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
    marginBottom: 30,
  },
  maybeLaterText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.primary,
  },
  homeIndicator: {
    width: Spacing.homeIndicatorWidth,
    height: Spacing.homeIndicatorHeight,
    backgroundColor: Colors.homeIndicator,
    borderRadius: 9999,
    alignSelf: 'center',
  },
});

export default CompletionScreen;


