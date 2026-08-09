import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';
import { Strings } from '@/constants';

interface ProfileAvatarPickerProps {
  imageUri?: string | null;
  onSelectImage?: () => void;
  title?: string;
  subtitle?: string;
}

export const ProfileAvatarPicker: React.FC<ProfileAvatarPickerProps> = ({
  imageUri,
  onSelectImage,
  title = Strings.profile.avatarTitle,
  subtitle = Strings.profile.avatarSubtitle,
}) => {
  return (
    <View style={styles.container}>
      {/* Avatar Container with Floating Badges */}
      <View style={styles.avatarWrapper}>
        {/* Floating Top-Left Heart Badge */}
        <View style={[styles.floatingBadge, styles.badgeLeft]}>
          <Ionicons name="heart-outline" size={16} color={Colors.primary} />
        </View>

        {/* Floating Top-Right Pulse Badge */}
        <View style={[styles.floatingBadge, styles.badgeRight]}>
          <Ionicons name="pulse-outline" size={16} color="#0D9488" />
        </View>

        {/* Main Avatar Circle */}
        <TouchableOpacity
          style={styles.avatarCircle}
          onPress={onSelectImage}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={Strings.accessibility.avatarPicker}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.avatarImage} contentFit="cover" />
          ) : (
            <Ionicons name="person" size={54} color="#93C5FD" />
          )}

          {/* Plus Add Button Badge */}
          <View style={styles.plusBadge}>
            <Ionicons name="add" size={18} color={Colors.white} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Subtitles */}
      <Text style={styles.avatarTitle}>{title}</Text>
      <Text style={styles.avatarSubtitle}>{subtitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: Spacing.xs,
  },
  avatarWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  avatarCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarImage: {
    width: 104,
    height: 104,
    borderRadius: 52,
  },
  plusBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    borderWidth: 2.5,
    borderColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  floatingBadge: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    zIndex: 5,
  },
  badgeLeft: {
    top: -2,
    left: -20,
  },
  badgeRight: {
    top: 14,
    right: -20,
  },
  avatarTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: 4,
  },
  avatarSubtitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.regular,
    lineHeight: Typography.lineHeight.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
});
