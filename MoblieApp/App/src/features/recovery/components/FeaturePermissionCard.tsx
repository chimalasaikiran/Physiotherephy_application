import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';
import { Strings } from '@/constants';

export interface FeatureItem {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  badgeBg: string;
  iconColor: string;
}

interface FeaturePermissionCardProps {
  feature: FeatureItem;
  isEnabled?: boolean;
  onToggle?: (id: string, enabled: boolean) => void;
  onPressCard?: (id: string) => void;
}

export const FeaturePermissionCard: React.FC<FeaturePermissionCardProps> = ({
  feature,
  isEnabled: initialIsEnabled = false,
  onToggle,
  onPressCard,
}) => {
  const [isEnabled, setIsEnabled] = useState(initialIsEnabled);
  const [isLoading, setIsLoading] = useState(false);

  const handlePressEnable = () => {
    if (isLoading) return;

    setIsLoading(true);
    // Simulate interactive toggle action with visual loading feedback
    setTimeout(() => {
      const newState = !isEnabled;
      setIsEnabled(newState);
      setIsLoading(false);
      if (onToggle) {
        onToggle(feature.id, newState);
      }
    }, 400);
  };

  const handleCardPress = () => {
    if (onPressCard) {
      onPressCard(feature.id);
    } else {
      handlePressEnable();
    }
  };

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={handleCardPress}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel={`${feature.title}, ${feature.subtitle}`}
    >
      {/* Top Header Row in Card: Icon Badge & Chevron */}
      <View style={styles.topRow}>
        <View style={[styles.iconBadge, { backgroundColor: feature.badgeBg }]}>
          <Ionicons name={feature.icon} size={22} color={feature.iconColor} />
        </View>

        <TouchableOpacity
          style={styles.chevronButton}
          onPress={handleCardPress}
          activeOpacity={0.6}
        >
          <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Content Area: Title & Subtitle */}
      <View style={styles.textSection}>
        <Text style={styles.titleText}>{feature.title}</Text>
        <Text style={styles.subtitleText}>{feature.subtitle}</Text>
      </View>

      {/* Bottom Action Area: Enable / Enabled Pill Button */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[
            styles.pillButton,
            isEnabled ? styles.pillButtonEnabled : styles.pillButtonDefault,
          ]}
          onPress={handlePressEnable}
          activeOpacity={0.8}
          disabled={isLoading}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isEnabled }}
        >
          {isLoading ? (
            <ActivityIndicator
              size="small"
              color={isEnabled ? Colors.enabledPillText : Colors.enablePillText}
            />
          ) : (
            <View style={styles.pillContent}>
              {isEnabled && (
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={Colors.enabledPillText}
                  style={styles.checkIcon}
                />
              )}
              <Text
                style={[
                  styles.pillText,
                  isEnabled ? styles.pillTextEnabled : styles.pillTextDefault,
                ]}
              >
                {isEnabled ? Strings.enableExperience.enabledButton : Strings.enableExperience.enableButton}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevronButton: {
    padding: 4,
  },
  textSection: {
    marginBottom: 16,
  },
  titleText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: '#051A3E',
    marginBottom: 4,
    letterSpacing: Typography.letterSpacing.tight,
  },
  subtitleText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillButton: {
    borderRadius: 9999,
    paddingVertical: 8,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillButtonDefault: {
    backgroundColor: '#EEF2FF',
  },
  pillButtonEnabled: {
    backgroundColor: '#DCFCE7',
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkIcon: {
    marginRight: 6,
  },
  pillText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
  },
  pillTextDefault: {
    color: '#2563EB',
  },
  pillTextEnabled: {
    color: '#166534',
  },
});
