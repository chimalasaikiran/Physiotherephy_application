import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';
import { Strings } from '@/constants';

export interface ServiceSelectionHeaderProps {
  title?: string;
  onBack: () => void;
  onAvatarPress?: () => void;
}

export const ServiceSelectionHeader: React.FC<ServiceSelectionHeaderProps> = ({
  title = Strings.serviceSelection.headerTitle,
  onBack,
  onAvatarPress,
}) => {
  return (
    <View style={styles.headerContainer}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Ionicons name="chevron-back" size={20} color="#003D9B" />
      </TouchableOpacity>

      {/* Centered Title */}
      <View style={styles.titleWrapper}>
        <Text style={styles.titleText} numberOfLines={1}>
          {title}
        </Text>
      </View>

      {/* Right User Avatar */}
      <TouchableOpacity
        style={styles.avatarButton}
        onPress={onAvatarPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="User profile"
      >
        <Image
          source={require('../../../assets/images/user_sagar_avatar.png')}
          style={styles.avatarImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.white,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
    letterSpacing: -0.2,
  },
  avatarButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
});
