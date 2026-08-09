import React from 'react';
import { StyleSheet, Text, Pressable, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';

interface PrimaryButtonProps {
  title: string;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  isLoading?: boolean;
  accessibilityLabel?: string;
  testID?: string;
  rightIcon?: keyof typeof Ionicons.glyphMap;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  disabled = false,
  isLoading = false,
  accessibilityLabel,
  testID,
  rightIcon,
}) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || isLoading}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      style={({ pressed }) => [
        styles.button,
        (disabled || isLoading) && styles.buttonDisabled,
        pressed && styles.buttonPressed,
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={Colors.white} size="small" />
      ) : (
        <React.Fragment>
          <Text style={[styles.buttonText, disabled && styles.textDisabled, textStyle]}>
            {title}
          </Text>
          {rightIcon && (
            <Ionicons
              name={rightIcon}
              size={20}
              color={Colors.white}
              style={styles.rightIcon}
            />
          )}
        </React.Fragment>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    height: Spacing.buttonHeight,
    backgroundColor: Colors.primary,
    borderRadius: Spacing.buttonRadius,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,

    // Shadow matching Figma shadow effect
    shadowColor: Colors.shadowTeal,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    backgroundColor: Colors.textMuted,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
    lineHeight: Typography.lineHeight.lg,
    textAlign: 'center',
  },
  textDisabled: {
    color: Colors.white,
  },
  rightIcon: {
    marginLeft: 8,
  },
});

export default PrimaryButton;
