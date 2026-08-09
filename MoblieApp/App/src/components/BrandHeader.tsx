import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Colors } from '@/constants';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';
import { Strings } from '@/constants';

interface BrandHeaderProps {
  testID?: string;
}

export const BrandHeader: React.FC<BrandHeaderProps> = ({ testID }) => {
  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.iconContainer} accessibilityRole="image" accessibilityLabel={Strings.accessibility.brandLogo}>
        <Image
          source={require('../assets/images/brand_logo_icon.svg')}
          style={styles.icon}
          contentFit="contain"
        />
      </View>
      <Text style={styles.brandTitle}>{Strings.brand.name}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconContainer: {
    width: Spacing.logoBadgeSize,
    height: Spacing.logoBadgeSize,
    backgroundColor: Colors.primary,
    borderRadius: Spacing.logoBadgeRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: Spacing.iconSize,
    height: Spacing.iconSize,
  },
  brandTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: Typography.lineHeight.lg,
    color: Colors.textPrimary,
    letterSpacing: Typography.letterSpacing.tighter,
  },
});

export default BrandHeader;
