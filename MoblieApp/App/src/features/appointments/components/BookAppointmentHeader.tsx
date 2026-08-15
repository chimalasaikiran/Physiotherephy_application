import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';
import { Strings } from '@/constants';

export interface BookAppointmentHeaderProps {
  title?: string;
  subtitle?: string;
  onBack: () => void;
  onRightIconPress?: () => void;
  rightIconName?: keyof typeof Ionicons.glyphMap;
}

export const BookAppointmentHeader: React.FC<BookAppointmentHeaderProps> = ({
  title = Strings.booking.headerTitle,
  subtitle,
  onBack,
  onRightIconPress,
  rightIconName = 'options-outline',
}) => {
  return (
    <View style={styles.headerShell}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={onBack}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <View style={styles.backBtnInner}>
          <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
        </View>
      </TouchableOpacity>

      <View style={styles.titleContainer}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {onRightIconPress ? (
        <TouchableOpacity
          style={styles.rightBtn}
          onPress={onRightIconPress}
          activeOpacity={0.7}
          accessibilityRole="button"
        >
          <View style={styles.rightBtnInner}>
            <Ionicons name={rightIconName} size={18} color={Colors.primary} />
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholderRight} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerShell: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  backBtn: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EEF2F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  headerTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
    letterSpacing: Typography.letterSpacing.tight,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  rightBtn: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightBtnInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderRight: {
    width: 36,
  },
});
