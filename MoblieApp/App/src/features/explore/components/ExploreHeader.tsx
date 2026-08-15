import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';
import { Strings } from '@/constants';

interface ExploreHeaderProps {
  userName?: string;
  avatarUri?: string | null;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
  unreadCount?: number;
}

export const ExploreHeader: React.FC<ExploreHeaderProps> = ({
  userName = Strings.explore.userNameDefault,
  avatarUri,
  onNotificationPress,
  onProfilePress,
  unreadCount = 2,
}) => {
  const router = useRouter();

  const handleNotificationClick = () => {
    if (onNotificationPress) {
      onNotificationPress();
    } else {
      router.push('/notifications' as any);
    }
  };

  const handleProfileClick = () => {
    if (onProfilePress) {
      onProfilePress();
    } else {
      router.push('/profile' as any);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <TouchableOpacity
          onPress={handleProfileClick}
          activeOpacity={0.8}
          style={styles.avatarContainer}
          accessibilityRole="button"
          accessibilityLabel={Strings.accessibility.avatarPicker}
        >
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarInnerImage} />
          ) : (
            <View style={styles.avatarInner}>
              <Text style={styles.avatarInitial}>
                {userName ? userName.charAt(0).toUpperCase() : 'A'}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.greetingTextGroup}>
          <Text style={styles.greetingTitle}>
            GOOD MORNING
          </Text>
          <Text style={styles.userNameText}>{userName}</Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        <TouchableOpacity
          onPress={handleNotificationClick}
          activeOpacity={0.7}
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
        >
          <Ionicons name="notifications-outline" size={24} color={Colors.textPrimary} />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.avatarBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  avatarInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInnerImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
  greetingTextGroup: {
    justifyContent: 'center',
  },
  greetingTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  userNameText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
    marginTop: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: Colors.notificationBadge,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
});

export default ExploreHeader;
